import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisClientType, createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.redisClient = createClient({
      url: this.configService.getOrThrow('REDIS_URL'),
    });

    this.redisClient.on('error', (err) => console.error('Redis Client Error', err));

    await this.redisClient.connect();
    console.log('🔺 Redis connected successfully via node-redis!');
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redisClient.set(key, value, {
      EX: ttlSeconds,
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }
}
