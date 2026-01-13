import type { Redis } from 'ioredis';
export declare class RedisService {
    private readonly redis;
    private memoryStore;
    constructor(redis: Redis | null);
    private isRedisAvailable;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<void>;
    ttl(key: string): Promise<number>;
    del(key: string): Promise<void>;
}
