import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private client;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getClient(): Redis;
    formatKey(namespace: string, key: string): string;
    setWithTTL(namespace: string, key: string, value: unknown, ttlSeconds: number): Promise<'OK'>;
    get<T>(namespace: string, key: string): Promise<T | null>;
    del(namespace: string, key: string): Promise<number>;
    checkHealth(): Promise<boolean>;
}
