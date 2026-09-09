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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    configService;
    logger = new common_1.Logger(RedisService_1.name);
    client;
    constructor(configService) {
        this.configService = configService;
        const redisUrl = this.configService.get('REDIS_URL');
        if (!redisUrl) {
            throw new Error('REDIS_URL is not defined');
        }
        let isLoggedOffline = false;
        const options = {
            retryStrategy: (times) => {
                if (!isLoggedOffline) {
                    this.logger.warn('Redis connection offline. Service running in fallback mode.');
                    isLoggedOffline = true;
                }
                return Math.min(times * 1000, 10000);
            },
            reconnectOnError: () => true,
            maxRetriesPerRequest: 10,
        };
        this.client = new ioredis_1.default(redisUrl, options);
        this.client.on('connect', () => {
            isLoggedOffline = false;
            this.logger.log('Redis connected successfully.');
        });
        this.client.on('error', (err) => {
            if (!isLoggedOffline) {
                this.logger.warn(`Redis client notice: ${err.message}`);
            }
        });
    }
    async onModuleInit() {
        this.logger.log('Initializing Redis client...');
        await this.checkHealth().catch(() => false);
    }
    async onModuleDestroy() {
        this.logger.log('Shutting down Redis client...');
        await this.client.quit();
        this.logger.log('Redis client disconnected cleanly.');
    }
    getClient() {
        return this.client;
    }
    formatKey(namespace, key) {
        return `fintop:${namespace}:${key}`;
    }
    async setWithTTL(namespace, key, value, ttlSeconds) {
        const fullKey = this.formatKey(namespace, key);
        const dataString = typeof value === 'string' ? value : JSON.stringify(value);
        return this.client.set(fullKey, dataString, 'EX', ttlSeconds);
    }
    async get(namespace, key) {
        const fullKey = this.formatKey(namespace, key);
        const data = await this.client.get(fullKey);
        if (!data)
            return null;
        try {
            return JSON.parse(data);
        }
        catch {
            return data;
        }
    }
    async del(namespace, key) {
        const fullKey = this.formatKey(namespace, key);
        return this.client.del(fullKey);
    }
    async checkHealth() {
        try {
            const ping = await this.client.ping();
            return ping === 'PONG';
        }
        catch (error) {
            this.logger.error('Redis health check failed', error);
            return false;
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map