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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
const SLOW_QUERY_THRESHOLD_MS = 1000;
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    configService;
    logger = new common_1.Logger(PrismaService_1.name);
    pool;
    constructor(configService) {
        const connectionString = configService.get('DATABASE_URL');
        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined');
        }
        const poolMax = configService.get('DB_POOL_MAX') || 10;
        const timeoutMs = configService.get('DB_TIMEOUT_MS') || 15000;
        const pool = new pg_1.Pool({
            connectionString,
            max: poolMax,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: timeoutMs,
            statement_timeout: timeoutMs,
        });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        super({
            adapter,
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'info' },
                { emit: 'event', level: 'warn' },
                { emit: 'event', level: 'error' },
            ],
        });
        this.configService = configService;
        this.pool = pool;
        this.$on('query', (e) => {
            if (e.duration > SLOW_QUERY_THRESHOLD_MS) {
                this.logger.warn(`🐌 SLOW QUERY (${e.duration}ms): ${e.query}`);
            }
            else {
                this.logger.debug(`Query: ${e.query} -- Duration: ${e.duration}ms`);
            }
        });
        this.$on('error', (e) => {
            this.logger.error(`Prisma Error: ${e.message}`, e.target);
        });
        this.$on('warn', (e) => {
            this.logger.warn(`Prisma Warning: ${e.message}`);
        });
        pool.on('error', (err) => {
            this.logger.error(`⚠️ Pool error (possible exhaustion): ${err.message}`);
        });
    }
    async onModuleInit() {
        this.logger.log('Initializing Prisma database connection...');
        await this.$connect();
        this.logger.log('Prisma database connected successfully.');
    }
    async onModuleDestroy() {
        this.logger.log('Closing Prisma database connection...');
        await this.$disconnect();
        await this.pool.end();
        this.logger.log('Prisma database connection closed cleanly.');
    }
    async checkHealth() {
        try {
            await this.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed', error);
            return false;
        }
    }
    async executeTransaction(fn, timeoutMs = 10000) {
        return this.$transaction(fn, {
            maxWait: 5000,
            timeout: timeoutMs,
        });
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map