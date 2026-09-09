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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../database/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const mail_service_1 = require("../mail/mail.service");
const throttler_1 = require("@nestjs/throttler");
let HealthController = class HealthController {
    prismaService;
    redisService;
    mailService;
    startTime = Date.now();
    constructor(prismaService, redisService, mailService) {
        this.prismaService = prismaService;
        this.redisService = redisService;
        this.mailService = mailService;
    }
    async check() {
        const [db, cache] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
        ]);
        const isHealthy = db.status === 'up' && cache.status === 'up';
        return {
            status: isHealthy ? 'ok' : 'degraded',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            timestamp: new Date().toISOString(),
            services: { database: db, cache },
            smtp: this.mailService.getStatus(),
        };
    }
    async readiness() {
        const [db, cache] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
        ]);
        const ready = db.status === 'up' && cache.status === 'up';
        return {
            ready,
            timestamp: new Date().toISOString(),
            checks: { database: db, cache },
        };
    }
    async liveness() {
        return {
            alive: true,
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            memoryUsage: {
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            },
            timestamp: new Date().toISOString(),
        };
    }
    async checkDatabase() {
        const start = Date.now();
        try {
            const ok = await this.prismaService.checkHealth();
            return { status: ok ? 'up' : 'down', latencyMs: Date.now() - start, provider: 'postgresql' };
        }
        catch {
            return { status: 'down', latencyMs: Date.now() - start, provider: 'postgresql' };
        }
    }
    async checkRedis() {
        const start = Date.now();
        try {
            const ok = await this.redisService.checkHealth();
            return { status: ok ? 'up' : 'down', latencyMs: Date.now() - start, provider: 'redis' };
        }
        catch {
            return { status: 'down', latencyMs: Date.now() - start, provider: 'redis' };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Basic health check — returns overall system status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('readiness'),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness probe — confirms all dependencies are operational' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "readiness", null);
__decorate([
    (0, common_1.Get)('liveness'),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness probe — confirms process is alive' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "liveness", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    (0, throttler_1.SkipThrottle)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        mail_service_1.MailService])
], HealthController);
//# sourceMappingURL=health.controller.js.map