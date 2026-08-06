"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const promClient = __importStar(require("prom-client"));
let MetricsService = class MetricsService {
    registry;
    httpRequestDuration;
    httpRequestsTotal;
    wsConnectionsGauge;
    wsEventsTotal;
    redisCacheHits;
    redisCacheMisses;
    queueJobsProcessed;
    queueJobsFailed;
    dbQueryDuration;
    constructor() {
        this.registry = new promClient.Registry();
        this.registry.setDefaultLabels({ app: 'fintop_data' });
        promClient.collectDefaultMetrics({ register: this.registry });
        this.httpRequestDuration = new promClient.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
            registers: [this.registry],
        });
        this.httpRequestsTotal = new promClient.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.registry],
        });
        this.wsConnectionsGauge = new promClient.Gauge({
            name: 'ws_active_connections',
            help: 'Number of active WebSocket connections',
            labelNames: ['namespace'],
            registers: [this.registry],
        });
        this.wsEventsTotal = new promClient.Counter({
            name: 'ws_events_total',
            help: 'Total WebSocket events emitted',
            labelNames: ['namespace', 'event'],
            registers: [this.registry],
        });
        this.redisCacheHits = new promClient.Counter({
            name: 'redis_cache_hits_total',
            help: 'Total Redis cache hits',
            registers: [this.registry],
        });
        this.redisCacheMisses = new promClient.Counter({
            name: 'redis_cache_misses_total',
            help: 'Total Redis cache misses',
            registers: [this.registry],
        });
        this.queueJobsProcessed = new promClient.Counter({
            name: 'queue_jobs_processed_total',
            help: 'Total queue jobs processed successfully',
            labelNames: ['queue'],
            registers: [this.registry],
        });
        this.queueJobsFailed = new promClient.Counter({
            name: 'queue_jobs_failed_total',
            help: 'Total queue jobs failed',
            labelNames: ['queue'],
            registers: [this.registry],
        });
        this.dbQueryDuration = new promClient.Histogram({
            name: 'db_query_duration_seconds',
            help: 'Duration of database queries in seconds',
            labelNames: ['operation'],
            buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
            registers: [this.registry],
        });
    }
    onModuleInit() {
    }
    async getMetrics() {
        return this.registry.metrics();
    }
    getContentType() {
        return this.registry.contentType;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map