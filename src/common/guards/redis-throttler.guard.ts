import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RedisThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: any,
    storageService: any,
    reflector: Reflector,
    private readonly redisService: RedisService,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Get client IP address
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.ip ||
      'unknown';

    return ip;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tracker = await this.getTracker(request);
    const path = request.route?.path || request.url;

    // Create rate limit key
    const key = `rate-limit:${tracker}:${path}`;

    try {
      // Get current count
      const currentCount = await this.redisService.get(key);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      // Default limits: 100 requests per minute
      const limit = 100;
      const ttl = 60; // 60 seconds

      if (count >= limit) {
        const remainingTtl = await this.redisService.ttl(key);
        throw new ThrottlerException(
          `Too many requests. Please try again in ${remainingTtl} seconds.`,
        );
      }

      // Increment counter
      const newCount = await this.redisService.incr(key);

      // Set expiry only on first request
      if (newCount === 1) {
        await this.redisService.expire(key, ttl);
      }

      // Set rate limit headers
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-RateLimit-Limit', limit);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - newCount));
      const ttlRemaining = await this.redisService.ttl(key);
      response.setHeader(
        'X-RateLimit-Reset',
        Math.ceil(Date.now() / 1000) + (ttlRemaining > 0 ? ttlRemaining : ttl),
      );

      return true;
    } catch (error) {
      if (error instanceof ThrottlerException) {
        throw error;
      }
      // If Redis fails, allow the request (fail open)
      console.warn('Rate limiting check failed:', error);
      return true;
    }
  }
}

