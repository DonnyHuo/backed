import { Injectable, Inject } from '@nestjs/common';
import type { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private memoryStore = new Map<string, { value: string; expiry: number }>();

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis | null) {}

  private isRedisAvailable(): boolean {
    return this.redis !== null;
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisAvailable()) {
      return this.redis!.get(key);
    }

    // In-memory fallback
    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isRedisAvailable()) {
      if (ttlSeconds) {
        await this.redis!.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.redis!.set(key, value);
      }
      return;
    }

    // In-memory fallback
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : Date.now() + 86400000; // Default 24h
    this.memoryStore.set(key, { value, expiry });
  }

  async incr(key: string): Promise<number> {
    if (this.isRedisAvailable()) {
      return this.redis!.incr(key);
    }

    // In-memory fallback
    const item = this.memoryStore.get(key);
    const currentValue = item ? parseInt(item.value, 10) : 0;
    const newValue = currentValue + 1;
    const expiry = item?.expiry ?? Date.now() + 86400000;
    this.memoryStore.set(key, { value: newValue.toString(), expiry });
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (this.isRedisAvailable()) {
      await this.redis!.expire(key, seconds);
      return;
    }

    // In-memory fallback
    const item = this.memoryStore.get(key);
    if (item) {
      item.expiry = Date.now() + seconds * 1000;
    }
  }

  async ttl(key: string): Promise<number> {
    if (this.isRedisAvailable()) {
      return this.redis!.ttl(key);
    }

    // In-memory fallback
    const item = this.memoryStore.get(key);
    if (!item) return -2; // Key doesn't exist
    const remaining = Math.ceil((item.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async del(key: string): Promise<void> {
    if (this.isRedisAvailable()) {
      await this.redis!.del(key);
      return;
    }

    // In-memory fallback
    this.memoryStore.delete(key);
  }
}
