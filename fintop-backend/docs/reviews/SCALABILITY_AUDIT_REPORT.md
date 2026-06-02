# SCALABILITY AUDIT REPORT

**Document Identifier:** `SCALABILITY_AUDIT_REPORT.md`  
**Timestamp:** 2026-05-20T18:51:00+07:00

---

## 1. Horizontal Scaling Readiness

| Component | Horizontally Scalable? | Reasoning |
|:---|:---|:---|
| NestJS Application | ✅ Yes | Stateless design, no in-memory state |
| PostgreSQL | ⚠️ Partial | Single writer; read replicas not configured |
| Redis | ✅ Yes | Single instance but Redis Cluster-ready |
| WebSocket | ✅ Yes | Redis Pub/Sub adapter enables multi-node |
| Queue (BullMQ) | ✅ Yes | Redis-backed, multiple workers possible |

## 2. Database Scalability Analysis

### 2.1 Table Growth Projections

| Table | Growth Rate | 1-Year Estimate | Partition-Ready? |
|:---|:---|:---|:---|
| `stock_prices_daily` | 2000 stocks × 250 days | 500K rows/yr | ❌ No partition by date |
| `audit_logs` | ~50K actions/day | 18M rows/yr | ❌ No partition |
| `notifications` | ~10K/day | 3.6M rows/yr | ❌ No partition |
| `user_sessions` | ~5K/day | 1.8M rows/yr | ❌ No cleanup job |
| `outbox_events` | ~1K/day | 365K rows/yr | ❌ No archival |

### 2.2 Critical Bottlenecks

| ID | Bottleneck | Impact | Severity |
|:---|:---|:---|:---|
| SCALE-01 | **JWT validation hits DB on every request** with 3-level nested include. At 1000 RPS, this generates ~30K SQL queries/second. | Application-wide latency spike | **HIGH** |
| SCALE-02 | **`expireSubscriptions()` processes sequentially**: 1000 expired subscriptions = 1000 individual transactions. Should use batch `updateMany` + single outbox batch. | Cron job timeout during growth | **MEDIUM** |
| SCALE-03 | **Alert evaluation is O(n)**: `evaluatePriceQuote()` fetches all active alerts for a stock from DB each time. With 10K alerts per stock, this becomes a bottleneck during market hours. | Alert latency during market hours | **MEDIUM** |
| SCALE-04 | **No database connection pooler metadata**: Prisma pool defaults to max 10. Under 100 concurrent users with nested includes, pool exhaustion is likely. | 503 errors under load | **MEDIUM** |
| SCALE-05 | **StockPriceDaily has no partitioning**: After 2 years, queries filtering by date on 1M+ rows will degrade without `RANGE` partitioning by `date`. | Historical query slowdown | **MEDIUM** |

## 3. Redis Scalability

### 3.1 Key Space Analysis
| Namespace | Key Pattern | TTL | Growth Risk |
|:---|:---|:---|:---|
| `fintop:*` | Namespaced helpers | Varies | ✅ Low |
| `quotes:latest:{symbol}` | Per-stock quotes | Configurable | ✅ Low (~2K keys) |
| `signal:latest` | Single key | 86400s | ✅ Low |
| `watchlist:user:{userId}` | Per-user | None explicit | ⚠️ Memory leak if not evicted |
| `alerts:active:stock:{stockId}` | SET per stock | None | ⚠️ Unbounded growth |
| `webhook:lock:{key}` | NX locks | 300s | ✅ Self-cleaning |

### 3.2 Memory Projections
- ~2K stock quote keys × ~500 bytes = ~1MB
- ~100K alert set entries × ~50 bytes = ~5MB
- Total Redis baseline: **<50MB** — well within single-instance limits

## 4. WebSocket Scalability

### 4.1 Current Architecture
```
Client ←→ NestJS (Socket.IO) ←→ Redis Pub/Sub ←→ Other NestJS instances
```

### 4.2 Projected Limits
| Metric | Current Limit | Bottleneck |
|:---|:---|:---|
| Concurrent connections | ~10K per node | OS file descriptor limit |
| Market events/second | ~2K (all stocks) | No batching/throttle |
| Signal broadcasts | Low frequency | ✅ Not a concern |

### 4.3 Recommendations
1. Implement quote update batching (aggregate 100ms window before broadcast)
2. Add `handleDisconnect()` to all gateways for cleanup
3. Monitor `ws_active_connections` gauge for capacity planning

## 5. Queue Scalability: ⚠️ NOT PRODUCTION-READY

**Current State**: `NotificationQueue` uses `setImmediate()` — this is in-process, synchronous, non-persistent, and non-retryable. Under load, notification delivery will:
- Block the event loop
- Lose jobs on process restart
- Have zero visibility into failures

**Recommendation**: Wire `NotificationQueue` to actual BullMQ queue (infrastructure is already installed and configured).
