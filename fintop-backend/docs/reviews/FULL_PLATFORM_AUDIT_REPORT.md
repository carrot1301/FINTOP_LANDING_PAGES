# FULL PLATFORM AUDIT REPORT

**Document Identifier:** `FULL_PLATFORM_AUDIT_REPORT.md`  
**Timestamp:** 2026-05-20T18:48:00+07:00  
**Auditor:** Enterprise Architecture AI Audit Engine  
**Scope:** Wave-1 → Wave-7 — All Layers

---

## STEP-01 — DATABASE ARCHITECTURE AUDIT

### 1.1 Normalization Quality: ✅ GOOD
- All models follow 3NF. No denormalized columns were found.
- Join tables (`UserRole`, `RolePermission`, `BlogTag`) use composite PKs correctly.
- Financial fields consistently use `Decimal(19,4)` — no floating point.

### 1.2 Foreign Key Consistency: ✅ GOOD
- All relations declare explicit `onDelete` and `onUpdate` strategies.
- Nullable FKs (`brokerId`, `authorId`, `managerId`, `industryId`) correctly use `onDelete: SetNull`.
- Non-nullable FKs on core entities use `onDelete: Restrict` (safe default for financial data).
- `onDelete: Cascade` is appropriately applied only to child-lifecycle-bound records (sessions, targets, holdings, watchlist items).

### 1.3 Cascade Safety: ⚠️ MINOR CONCERN
- **Finding:** `UserSession.onDelete: Cascade` from `User` means deleting a user wipes all session audit trail.
- **Severity:** LOW — Sessions should be orphaned not deleted for post-incident investigation.
- **Recommendation:** Change to `onDelete: Restrict` and implement soft-delete for users only.

### 1.4 Indexing Strategy: ✅ GOOD
- Composite indexes align with query patterns (`[status, deletedAt]`, `[userId, status, createdAt]`).
- `StockPriceDaily` has `@@unique([stockId, date])` — correct for OHLCV upsert operations.
- `PaymentWebhookLog` has `@@unique(idempotencyKey)` — critical for webhook replay protection.

### 1.5 Anti-Patterns Detected

| ID | Finding | Severity | Location |
|:---|:---|:---|:---|
| DB-01 | `StockPriceDaily` lacks partitioning annotation. With 2000+ stocks × 250 trading days/year, this table will reach millions of rows rapidly. | **MEDIUM** | `schema.prisma:651` |
| DB-02 | `AuditLog` has no retention/archival strategy defined. BigInt PK will grow unbounded. | **MEDIUM** | `schema.prisma:428` |
| DB-03 | `Notification` model lacks `channel` field — delivery channel is only tracked in `NotificationDeliveryLog`, making channel-based queries require a JOIN. | **LOW** | `schema.prisma:892` |

### 1.6 PgBouncer Compatibility: ✅ COMPATIBLE
- `PrismaService` uses `@prisma/adapter-pg` with a `Pool` instance — PgBouncer transaction-mode compatible.
- No `SET` or `LISTEN/NOTIFY` statements detected that would break PgBouncer.

---

## STEP-02 — PRISMA & QUERY AUDIT

### 2.1 Transaction Boundaries: ✅ GOOD
- `SignalService.publishSignal()`: Creates signal + target + execution log atomically.
- `PaymentService.processWebhookPayment()`: Invoice update + transaction record + subscription activation + outbox event — all atomic.
- `SubscriptionService.activateSubscription()`: Accepts `Prisma.TransactionClient` parameter — composable within parent transactions.
- `BlogService.createArticle()`: Blog + revision atomically.

### 2.2 Critical Findings

| ID | Finding | Severity | Location |
|:---|:---|:---|:---|
| PQ-01 | **N+1 Query in JWT Validation**: `JwtStrategy.validate()` issues a 3-level nested `include` (userRoles → role → permissions → permission) on **EVERY request**. With 10 roles per user, this generates ~30+ SQL queries per HTTP request. | **HIGH** | `jwt.strategy.ts:27-43` |
| PQ-02 | **N+1 in Subscription Expiration**: `expireSubscriptions()` fetches all expired subs then loops with individual `$transaction` per subscription. For 1000 expired users, this creates 1000 transactions. | **MEDIUM** | `subscription.service.ts:95-124` |
| PQ-03 | **N+1 in Alert Evaluation**: `evaluatePriceQuote()` fetches all alerts for a stock, then issues individual `update` + `auditService.log` for each triggered alert. | **MEDIUM** | `alert.service.ts:42-71` |
| PQ-04 | **Missing `select` for large queries**: `MarketSyncService.syncDailyQuotes()` fetches entire `stock` rows when only `id` is needed — correctly uses `select: { id: true }`. | ✅ GOOD | `market-sync.service.ts:31-33` |

### 2.3 Pool Exhaustion Vectors
- **Pool Size**: Default 10. The nested JWT query (PQ-01) holds a connection for the entire duration of multi-level includes.
- **Risk**: Under 100 concurrent authenticated requests, 10 connections could exhaust during peak market hours.
- **Recommendation**: Cache JWT-validated user permissions in Redis with 60s TTL.

---

## STEP-03 — RBAC & AUTH AUDIT

### 3.1 Guard Architecture: ✅ WELL-STRUCTURED
- `JwtAuthGuard` → passport-jwt → `JwtStrategy.validate()` flow is standard.
- `PermissionsGuard` checks `PERMISSIONS_KEY` metadata against `user.permissions` array.
- `SubscriptionTierGuard` enforces tier hierarchy (`STANDARD < SILVER < GOLD < DIAMOND`).
- `SUPER_ADMIN` bypasses both permission and tier checks — correct for admin override.

### 3.2 Critical Findings

| ID | Finding | Severity | Location |
|:---|:---|:---|:---|
| AUTH-01 | **JWT Secret Mismatch**: `JwtStrategy` uses `JWT_SECRET` while `SocketAuthGuard` uses `JWT_ACCESS_SECRET`. These are two different env variables. If JWT tokens are signed with `JWT_SECRET` but socket auth verifies with `JWT_ACCESS_SECRET`, WebSocket auth will **always fail**. | **CRITICAL** | `jwt.strategy.ts:15` vs `socket-auth.guard.ts:22` |
| AUTH-02 | **Refresh Token Brute-Force Vector**: `AuthService.refresh()` loads **ALL active sessions** for a user then iterates `bcrypt.compare()` for each. With 50 active sessions, this creates 50× bcrypt operations (~5 seconds). | **MEDIUM** | `auth.service.ts:99-113` |
| AUTH-03 | **`/auth/me` Leaks Full User Object**: `getMe()` destructures `passwordHash` but the `user` object from `JwtStrategy.validate()` only returns `{id, email, tierLevel, roles, permissions}` — so no actual hash leak. However, the code implies the full user is present. | **LOW** | `auth.controller.ts:65` |
| AUTH-04 | **WebSocket Room Join Without Validation**: `MarketGateway.handleSubscribeSymbol()` has no `SocketAuthGuard` — any unauthenticated client can subscribe to market quotes. | **MEDIUM** | `market.gateway.ts:15-24` |
| AUTH-05 | **`process.env` Direct Access in SocketAuthGuard**: Uses `process.env.JWT_ACCESS_SECRET` instead of `ConfigService`. This bypasses env validation. | **LOW** | `socket-auth.guard.ts:22` |

### 3.3 Privilege Escalation Analysis
- **Risk**: AdminController uses `@Permissions('MANAGE_ROLES')` but the controller doesn't actually call any service to perform role assignment. It returns a mock JSON object. Until wired to a real service, no escalation is possible — but the **lack of authorization validation on the actual service method** is a gap to address before production.

---

## STEP-04 — BILLING & FINANCIAL AUDIT

### 4.1 Webhook Idempotency: ✅ WELL-IMPLEMENTED
- **Layer 1**: Redis NX lock with 300s TTL on `idempotencyKey`.
- **Layer 2**: Database unique constraint check on `PaymentWebhookLog.idempotencyKey`.
- **Layer 3**: Invoice status check (`PAID` → reject).

### 4.2 Transaction Atomicity: ✅ GOOD
- `processWebhookPayment()` wraps webhook log + transaction record + invoice update + subscription activation + outbox event in a single `$transaction`.

### 4.3 Critical Findings

| ID | Finding | Severity | Location |
|:---|:---|:---|:---|
| FIN-01 | **BillingController calls non-existent methods**: `createInvoice(user.id, dto.tierLevel, dto.billingCycle, dto.amount)` — `InvoiceService` has `createSubscriptionInvoice(userId, planId)` not `createInvoice(…, tierLevel, billingCycle, amount)`. This will crash at runtime. | **CRITICAL** | `billing.controller.ts:30` |
| FIN-02 | **BillingController webhook calls non-existent method**: `paymentService.processPaymentEvent(payload, signature)` — `PaymentService` has `processWebhookPayment(…)` with completely different parameters. This will crash at runtime. | **CRITICAL** | `billing.controller.ts:39` |
| FIN-03 | **No signature verification**: The webhook handler extracts `x-webhook-signature` but never verifies it against a known secret. Any POST to `/billing/webhook` with arbitrary data will be processed. | **HIGH** | `billing.controller.ts:37-39` |
| FIN-04 | **`getInvoices()` returns hardcoded empty array**: No database query implemented. | **MEDIUM** | `billing.controller.ts:22` |
| FIN-05 | **Redis lock not wrapped in try/finally at correct level**: If `processWebhookPayment` throws before the `$transaction`, the lock is released in `finally` — correct. But if Redis itself is down, the `NX` set fails silently and processing continues without lock protection. | **MEDIUM** | `payment.service.ts:29` |

---

## STEP-05 — REALTIME & QUEUE AUDIT

### 5.1 WebSocket Architecture: ✅ GOOD
- Three isolated namespaces: `/ws/market`, `/ws/signals`, `/ws/notifications`.
- Redis `@socket.io/redis-adapter` enables multi-node broadcasting.

### 5.2 Queue Architecture: ⚠️ PARTIALLY STUBBED

| ID | Finding | Severity | Location |
|:---|:---|:---|:---|
| RT-01 | **NotificationQueue is NOT using BullMQ**: Despite `@nestjs/bullmq` being installed and `QueueModule` configured, `NotificationQueue` uses `setImmediate()` instead of actual queue submission. No retries, no DLQ, no persistence. If the process crashes mid-notification, the job is lost. | **HIGH** | `notification.queue.ts:22-26` |
| RT-02 | **No WebSocket connection cleanup**: Neither `MarketGateway` nor `SignalGateway` implement `handleDisconnect()`. Stale socket references may accumulate. | **MEDIUM** | All gateways |
| RT-03 | **Market quote broadcast has no throttle**: `broadcastQuoteUpdate()` can be called at whatever frequency the ingestion pipeline runs. During market hours with 2000 stocks updating every second, this generates 2000 WebSocket events/second. | **MEDIUM** | `market.gateway.ts:33-34` |

### 5.3 Redis Pub/Sub Consistency: ✅ GOOD
- `RedisIoAdapter` correctly initializes both pub and sub clients for multi-node compatibility.

---

## STEP-06 — API & DTO AUDIT

### 6.1 DTO Validation: ⚠️ SIGNIFICANT GAPS

| ID | Finding | Severity | Location |
|:---|:---|:---|:---|
| DTO-01 | **Most controllers accept `@Body() dto: any`**: `SignalController`, `BlogController`, `WatchlistController`, `AlertController`, `BillingController` all use `any` type for request bodies. The global `ValidationPipe` with `whitelist: true` is useless against `any` — it only validates class-validator-decorated DTOs. | **HIGH** | All Wave-6 controllers |
| DTO-02 | **`/auth/refresh` accepts raw `@Body('refreshToken') string`**: No DTO class, so no validation pipe protection. The `RefreshDto` file exists but is unused. | **MEDIUM** | `auth.controller.ts:29` |
| DTO-03 | **`AdminController` mock responses**: Returns `{ message, page, limit }` objects that don't match the API response interceptor contract. | **LOW** | `admin.controller.ts` |

### 6.2 API Response Contract: ✅ GOOD
- `ApiResponseInterceptor` wraps all responses in `{ success, data, meta, timestamp }`.
- `GlobalExceptionFilter` returns structured error objects with correlation IDs.

### 6.3 Swagger Coverage: ⚠️ PARTIAL
- All controllers have `@ApiTags`, `@ApiOperation`, and `@ApiBearerAuth`.
- **Missing**: `@ApiBody` decorators for signal creation, blog creation, watchlist mutations.
- **Missing**: Response type decorators (`@ApiResponse` with DTO types) on most endpoints.

---

## STEP-07 — CACHE & PERFORMANCE AUDIT

### 7.1 Cache Strategy: ✅ WELL-STRUCTURED
- Blog articles cached with 1-hour TTL.
- Market quotes cached via `MarketCacheService` with configurable TTL.
- Redis namespace convention: `fintop:{domain}:{key}`.

### 7.2 Cache Invalidation: ⚠️ PARTIAL

| ID | Finding | Severity | Location |
|:---|:---|:---|:---|
| CACHE-01 | **Blog cache invalidation clears list but not paginated pages**: `del('blogs:list')` would miss `blogs:list:page:2` if pagination-based keys are used later. | **LOW** | `blog.service.ts:87` |
| CACHE-02 | **Signal publish caches to `signal:latest` (singular key)**: Each new signal overwrites the previous. No per-signal caching strategy. | **LOW** | `signal.service.ts:70-75` |
| CACHE-03 | **Watchlist cache invalidated on add but not on delete**: `addStockToWatchlist` deletes cache, but there is no `removeStock` method that also invalidates. | **LOW** | `watchlist.service.ts:56` |

### 7.3 Stale Data Risk: ⚠️ MEDIUM
- JWT validation (PQ-01) fetches user permissions from DB on every request. If a user's role is revoked, revocation is immediate — but if a Redis cache is added (as recommended), a 60s stale window exists. Trade-off is acceptable for performance.

---

## STEP-08 — INFRASTRUCTURE & DEVOPS AUDIT

### 8.1 Docker: ✅ GOOD
- Multi-stage build, non-root user, Alpine base, HEALTHCHECK directive.
- `.dockerignore` properly excludes `.env`, `node_modules`, `.git`.

### 8.2 CI/CD: ✅ GOOD
- Four stages: Lint → Prisma Validate → Build → Docker Build.
- Uses `npm ci` for deterministic builds.
- Parallelizes independent stages.

### 8.3 Health Probes: ✅ EXCELLENT
- `/health` — overall with latency tracking.
- `/health/readiness` — dependency readiness check.
- `/health/liveness` — process alive + memory stats.

### 8.4 Metrics: ✅ GOOD
- Prometheus metrics at `/metrics` with custom + default Node.js metrics.
- `MetricsInterceptor` normalizes routes to prevent cardinality explosion.

### 8.5 Findings

| ID | Finding | Severity | Location |
|:---|:---|:---|:---|
| INFRA-01 | **Metrics endpoint is not excluded from throttle**: Prometheus scraping at 15s intervals will hit rate limits and receive 429s. | **MEDIUM** | `app.module.ts` ThrottlerGuard is global |
| INFRA-02 | **Health endpoints are throttled**: Kubernetes probes hitting `/health/liveness` every 10s will trigger ThrottlerGuard rejection. | **MEDIUM** | Same as INFRA-01 |
| INFRA-03 | **No `.env.example` file**: New developers have no reference for required environment variables. | **LOW** | Root directory |
