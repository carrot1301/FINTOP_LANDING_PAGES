import { OnModuleInit } from '@nestjs/common';
import * as promClient from 'prom-client';
export declare class MetricsService implements OnModuleInit {
    private readonly registry;
    readonly httpRequestDuration: promClient.Histogram;
    readonly httpRequestsTotal: promClient.Counter;
    readonly wsConnectionsGauge: promClient.Gauge;
    readonly wsEventsTotal: promClient.Counter;
    readonly redisCacheHits: promClient.Counter;
    readonly redisCacheMisses: promClient.Counter;
    readonly queueJobsProcessed: promClient.Counter;
    readonly queueJobsFailed: promClient.Counter;
    readonly dbQueryDuration: promClient.Histogram;
    constructor();
    onModuleInit(): void;
    getMetrics(): Promise<string>;
    getContentType(): string;
}
