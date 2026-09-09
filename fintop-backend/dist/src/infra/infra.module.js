"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfraModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../common/config/config.module");
const prisma_module_1 = require("../common/database/prisma.module");
const redis_module_1 = require("../common/redis/redis.module");
const queue_module_1 = require("../common/queue/queue.module");
const logger_module_1 = require("../common/logger/logger.module");
const health_module_1 = require("../common/health/health.module");
const audit_module_1 = require("../common/audit/audit.module");
const metrics_module_1 = require("../common/metrics/metrics.module");
let InfraModule = class InfraModule {
};
exports.InfraModule = InfraModule;
exports.InfraModule = InfraModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            queue_module_1.QueueModule,
            logger_module_1.LoggerModule,
            health_module_1.HealthModule,
            audit_module_1.AuditModule,
            metrics_module_1.MetricsModule,
        ],
        exports: [
            config_module_1.ConfigModule,
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            queue_module_1.QueueModule,
            logger_module_1.LoggerModule,
            health_module_1.HealthModule,
            audit_module_1.AuditModule,
            metrics_module_1.MetricsModule,
        ],
    })
], InfraModule);
//# sourceMappingURL=infra.module.js.map