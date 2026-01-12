import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const Redis = (await import('ioredis')).default;
        const redisUrl = configService.get<string>('REDIS_URL');
        
        if (!redisUrl) {
          console.warn('⚠️ REDIS_URL not configured, using in-memory fallback');
          return null;
        }

        try {
          const client = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
          });

          await client.connect();
          console.log('✅ Redis connected successfully');
          return client;
        } catch (error) {
          console.warn('⚠️ Redis connection failed, using in-memory fallback:', error);
          return null;
        }
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}

