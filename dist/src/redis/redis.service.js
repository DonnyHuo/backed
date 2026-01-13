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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
let RedisService = class RedisService {
    constructor(redis) {
        this.redis = redis;
        this.memoryStore = new Map();
    }
    isRedisAvailable() {
        return this.redis !== null;
    }
    async get(key) {
        if (this.isRedisAvailable()) {
            return this.redis.get(key);
        }
        const item = this.memoryStore.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiry) {
            this.memoryStore.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttlSeconds) {
        if (this.isRedisAvailable()) {
            if (ttlSeconds) {
                await this.redis.set(key, value, 'EX', ttlSeconds);
            }
            else {
                await this.redis.set(key, value);
            }
            return;
        }
        const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : Date.now() + 86400000;
        this.memoryStore.set(key, { value, expiry });
    }
    async incr(key) {
        if (this.isRedisAvailable()) {
            return this.redis.incr(key);
        }
        const item = this.memoryStore.get(key);
        const currentValue = item ? parseInt(item.value, 10) : 0;
        const newValue = currentValue + 1;
        const expiry = item?.expiry ?? Date.now() + 86400000;
        this.memoryStore.set(key, { value: newValue.toString(), expiry });
        return newValue;
    }
    async expire(key, seconds) {
        if (this.isRedisAvailable()) {
            await this.redis.expire(key, seconds);
            return;
        }
        const item = this.memoryStore.get(key);
        if (item) {
            item.expiry = Date.now() + seconds * 1000;
        }
    }
    async ttl(key) {
        if (this.isRedisAvailable()) {
            return this.redis.ttl(key);
        }
        const item = this.memoryStore.get(key);
        if (!item)
            return -2;
        const remaining = Math.ceil((item.expiry - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
    }
    async del(key) {
        if (this.isRedisAvailable()) {
            await this.redis.del(key);
            return;
        }
        this.memoryStore.delete(key);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [Object])
], RedisService);
//# sourceMappingURL=redis.service.js.map