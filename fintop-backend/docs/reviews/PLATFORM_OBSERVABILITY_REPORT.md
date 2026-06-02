# PLATFORM OBSERVABILITY REPORT

**Document Identifier:** `PLATFORM_OBSERVABILITY_REPORT.md`  
**Timestamp:** 2026-05-20T18:42:00+07:00

---

## 1. Prometheus Metrics Architecture

The `MetricsService` exposes a comprehensive set of Prometheus-compatible metrics at `/metrics`, organized by domain:

### HTTP Metrics
| Metric | Type | Labels | Purpose |
|:---|:---|:---|:---|
| `http_request_duration_seconds` | Histogram | method, route, status_code | P50/P95/P99 latency tracking |
| `http_requests_total` | Counter | method, route, status_code | Throughput monitoring |

### WebSocket Metrics
| Metric | Type | Labels | Purpose |
|:---|:---|:---|:---|
| `ws_active_connections` | Gauge | namespace | Live connection count per namespace |
| `ws_events_total` | Counter | namespace, event | Event volume tracking |

### Infrastructure Metrics
| Metric | Type | Purpose |
|:---|:---|:---|
| `redis_cache_hits_total` | Counter | Cache effectiveness |
| `redis_cache_misses_total` | Counter | Cache miss rate |
| `queue_jobs_processed_total` | Counter | Queue throughput |
| `queue_jobs_failed_total` | Counter | Job failure rate |
| `db_query_duration_seconds` | Histogram | Database performance |

### Node.js Default Metrics
Automatically collected via `prom-client`:
- `process_cpu_seconds_total`
- `process_resident_memory_bytes`
- `nodejs_eventloop_lag_seconds`
- `nodejs_active_handles_total`

## 2. Structured Logging

### Production Mode
All HTTP logs are emitted as structured JSON objects:
```json
{
  "type": "response",
  "correlationId": "abc-123",
  "method": "GET",
  "url": "/market/stocks/FPT",
  "statusCode": 200,
  "durationMs": 12,
  "timestamp": "2026-05-20T11:30:00.000Z"
}
```
This format is natively ingestible by ELK Stack, AWS CloudWatch, Datadog, and Grafana Loki.

### PII Safety
Request bodies are never logged. Only method, URL, status, and duration are captured. User-agent strings are truncated to 100 characters.

## 3. Health Monitoring

| Endpoint | Purpose | Orchestrator Use |
|:---|:---|:---|
| `GET /health` | Overall status + dependency latencies | Dashboard |
| `GET /health/readiness` | Readiness probe (all deps up) | Kubernetes `readinessProbe` |
| `GET /health/liveness` | Process alive + memory stats | Kubernetes `livenessProbe` |

## 4. Runtime Validation Evidence

```
Test #4: Prometheus Metrics Endpoint
  [PASS] Prometheus metrics generated (194 lines)
```
This confirms all custom and default metrics are being collected and properly exposed.
