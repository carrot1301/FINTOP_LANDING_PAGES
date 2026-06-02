# TECHNICAL DEBT REPORT

**Document Identifier:** `TECHNICAL_DEBT_REPORT.md`  
**Timestamp:** 2026-05-20T18:52:00+07:00

---

## 1. Debt Classification

| Priority | Count | Description |
|:---|:---|:---|
| 🔴 P0 — Must Fix Before Production | 3 | Runtime crashes, security holes |
| 🟠 P1 — Must Fix Before Scaling | 5 | Performance, reliability |
| 🟡 P2 — Should Fix Soon | 6 | Code quality, maintainability |
| 🟢 P3 — Nice to Have | 4 | Polish, documentation |

---

## 2. P0 — CRITICAL (Must Fix Before Production)

### DEBT-001: BillingController Method Signatures Are Broken
- **File**: `billing.controller.ts:30,39`
- **Issue**: `createInvoice()` calls `invoiceService.createInvoice()` which doesn't exist. The real method is `createSubscriptionInvoice(userId, planId)`. Similarly, `processPaymentEvent()` doesn't exist on `PaymentService`.
- **Impact**: Runtime crash on any billing API call.
- **Fix**: Wire controller to actual service methods with correct parameter mapping.

### DEBT-002: JWT Secret Mismatch Between HTTP and WebSocket Auth
- **File**: `jwt.strategy.ts:15` vs `socket-auth.guard.ts:22`
- **Issue**: HTTP uses `JWT_SECRET`, WebSocket uses `JWT_ACCESS_SECRET`.
- **Impact**: WebSocket authentication fails for all users if secrets differ.
- **Fix**: Unify JWT secret usage. Either update `JwtModule` to use `JWT_ACCESS_SECRET`, or update `SocketAuthGuard` to use `JWT_SECRET`.

### DEBT-003: Webhook Endpoint Has No Cryptographic Signature Verification
- **File**: `billing.controller.ts:37-39`
- **Issue**: `x-webhook-signature` header is extracted but never verified.
- **Impact**: Arbitrary payment confirmation possible. Financial integrity at risk.
- **Fix**: Implement HMAC-SHA256 verification in `PaymentService.processWebhookPayment()`.

---

## 3. P1 — HIGH (Must Fix Before Scaling)

### DEBT-004: NotificationQueue Bypasses BullMQ
- **File**: `notification.queue.ts:22-26`
- **Issue**: Uses `setImmediate()` instead of BullMQ. No retries, no persistence, no DLQ.
- **Impact**: Lost notifications on crash. No retry capability. No operational visibility.
- **Fix**: Replace with actual `@InjectQueue()` and `@Processor()` BullMQ pattern.

### DEBT-005: N+1 Query in JWT Validation (Every Request)
- **File**: `jwt.strategy.ts:27-43`
- **Issue**: 3-level nested include on every authenticated HTTP request.
- **Impact**: ~30 SQL queries per request. Pool exhaustion under load.
- **Fix**: Cache user permissions in Redis with 60s TTL. Invalidate on role change.

### DEBT-006: Controllers Accept `any` Request Bodies
- **Files**: `signal.controller.ts`, `blog.controller.ts`, `watchlist.controller.ts`, `alert.controller.ts`, `billing.controller.ts`
- **Issue**: `@Body() dto: any` — ValidationPipe cannot validate untyped bodies.
- **Impact**: Arbitrary data reaches service layer. No input sanitization.
- **Fix**: Create proper DTO classes with class-validator decorators for every mutation endpoint.

### DEBT-007: Health/Metrics Endpoints Are Rate-Limited
- **File**: `app.module.ts` (global ThrottlerGuard)
- **Issue**: Kubernetes probes and Prometheus scraper will receive 429 Too Many Requests.
- **Impact**: Health monitoring failure in production orchestration.
- **Fix**: Apply `@SkipThrottle()` decorator to HealthController and MetricsController.

### DEBT-008: Sequential Subscription Expiration
- **File**: `subscription.service.ts:95-124`
- **Issue**: Individual `$transaction` per expired subscription. O(n) transactions.
- **Impact**: Cron job timeout at scale.
- **Fix**: Batch `updateMany` for status changes, single outbox event batch.

---

## 4. P2 — MEDIUM (Should Fix Soon)

### DEBT-009: `process.env` Direct Access in SocketAuthGuard
- **File**: `socket-auth.guard.ts:22`
- **Fix**: Inject `ConfigService` and use `configService.get('JWT_ACCESS_SECRET')`.

### DEBT-010: MarketGateway Has No Auth Guard
- **File**: `market.gateway.ts:15`
- **Fix**: Add `@UseGuards(SocketAuthGuard)` or implement optional auth.

### DEBT-011: No `handleDisconnect()` in Gateways
- **Files**: All 3 gateways
- **Fix**: Implement `handleDisconnect()` for connection tracking and cleanup.

### DEBT-012: No WebSocket Event Rate Limiting
- **File**: `market.gateway.ts:33-34`
- **Fix**: Add quote update batching (100ms window) to prevent event flooding.

### DEBT-013: Redis Alert Sets Have No TTL
- **File**: `alert.service.ts:37`
- **Fix**: Add TTL or periodic cleanup for `alerts:active:stock:{stockId}` sets.

### DEBT-014: No `.env.example` File
- **Fix**: Create `.env.example` with all required variables and safe placeholder values.

---

## 5. P3 — LOW (Nice to Have)

### DEBT-015: Missing Swagger `@ApiBody` and `@ApiResponse` DTOs
### DEBT-016: Blog Cache Invalidation Doesn't Account for Paginated Keys
### DEBT-017: AuditLog Table Has No Archival Strategy
### DEBT-018: UserSession Table Has No Cleanup Cron Job

---

## 6. Debt Heatmap

```
┌──────────────────┬─────────┬──────────┬──────────┐
│ Domain           │ P0      │ P1       │ P2+      │
├──────────────────┼─────────┼──────────┼──────────┤
│ Billing          │ ██ 2    │          │          │
│ Auth/Security    │ █  1    │ █  1     │ █  1     │
│ Queue/Realtime   │         │ █  1     │ ██ 2     │
│ API/DTO          │         │ ██ 2     │ █  1     │
│ Infrastructure   │         │ █  1     │ █  1     │
│ Database         │         │          │ ██ 2     │
└──────────────────┴─────────┴──────────┴──────────┘
```
