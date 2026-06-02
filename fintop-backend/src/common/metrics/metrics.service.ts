import { Injectable, OnModuleInit } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: promClient.Registry;

  // HTTP Metrics
  public readonly httpRequestDuration: promClient.Histogram;
  public readonly httpRequestsTotal: promClient.Counter;

  // WebSocket Metrics
  public readonly wsConnectionsGauge: promClient.Gauge;
  public readonly wsEventsTotal: promClient.Counter;

  // Redis Metrics
  public readonly redisCacheHits: promClient.Counter;
  public readonly redisCacheMisses: promClient.Counter;

  // Queue Metrics
  public readonly queueJobsProcessed: promClient.Counter;
  public readonly queueJobsFailed: promClient.Counter;

  // Database Metrics
  public readonly dbQueryDuration: promClient.Histogram;

  constructor() {
    this.registry = new promClient.Registry();
    this.registry.setDefaultLabels({ app: 'fintop_data' });

    // Enable default Node.js metrics (CPU, memory, event loop, etc.)
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
    // Metrics service ready
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
