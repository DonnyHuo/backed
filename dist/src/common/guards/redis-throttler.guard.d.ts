import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../redis/redis.service';
export declare class RedisThrottlerGuard extends ThrottlerGuard {
    private readonly redisService;
    constructor(options: any, storageService: any, reflector: Reflector, redisService: RedisService);
    protected getTracker(req: Record<string, any>): Promise<string>;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
