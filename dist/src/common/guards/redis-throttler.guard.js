"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const redis_service_1 = require("../../redis/redis.service");
let RedisThrottlerGuard = class RedisThrottlerGuard extends throttler_1.ThrottlerGuard {
    constructor(options, storageService, reflector, redisService) {
        super(options, storageService, reflector);
        this.redisService = redisService;
    }
    async getTracker(req) {
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.headers['x-real-ip'] ||
            req.connection?.remoteAddress ||
            req.ip ||
            'unknown';
        return ip;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const tracker = await this.getTracker(request);
        const path = request.route?.path || request.url;
        const key = `rate-limit:${tracker}:${path}`;
        try {
            const currentCount = await this.redisService.get(key);
            const count = currentCount ? parseInt(currentCount, 10) : 0;
            const limit = 100;
            const ttl = 60;
            if (count >= limit) {
                const remainingTtl = await this.redisService.ttl(key);
                throw new throttler_1.ThrottlerException(`Too many requests. Please try again in ${remainingTtl} seconds.`);
            }
            const newCount = await this.redisService.incr(key);
            if (newCount === 1) {
                await this.redisService.expire(key, ttl);
            }
            const response = context.switchToHttp().getResponse();
            response.setHeader('X-RateLimit-Limit', limit);
            response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - newCount));
            const ttlRemaining = await this.redisService.ttl(key);
            response.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + (ttlRemaining > 0 ? ttlRemaining : ttl));
            return true;
        }
        catch (error) {
            if (error instanceof throttler_1.ThrottlerException) {
                throw error;
            }
            console.warn('Rate limiting check failed:', error);
            return true;
        }
    }
};
exports.RedisThrottlerGuard = RedisThrottlerGuard;
exports.RedisThrottlerGuard = RedisThrottlerGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, core_1.Reflector,
        redis_service_1.RedisService])
], RedisThrottlerGuard);
//# sourceMappingURL=redis-throttler.guard.js.map