# SECURITY AUDIT REPORT

**Document Identifier:** `SECURITY_AUDIT_REPORT.md`  
**Timestamp:** 2026-05-20T18:50:00+07:00  
**Classification:** CONFIDENTIAL

---

## 1. Authentication Security

### 1.1 JWT Token Lifecycle
| Check | Status | Evidence |
|:---|:---|:---|
| Token expiration enforced | ✅ | `ignoreExpiration: false` in JwtStrategy |
| Refresh token rotation | ✅ | Old token hashed, new token issued on refresh |
| Refresh token hashed in DB | ✅ | `HashUtil.hash(refreshToken)` before storage |
| Session revocation | ✅ | `isRevoked` flag with `logoutAll()` support |
| Failed login auditing | ✅ | `logAuditFailedLogin()` logs email + IP |

### 1.2 CRITICAL: JWT Secret Configuration Mismatch
**AUTH-01 (CRITICAL)**: The HTTP authentication chain uses `JWT_SECRET` via `JwtStrategy`, but the WebSocket authentication chain uses `JWT_ACCESS_SECRET` via `SocketAuthGuard`. If these contain different values, WebSocket authentication will systematically reject all valid HTTP tokens.

**Impact**: All WebSocket real-time features (market quotes, signals, notifications) will fail for authenticated users.

**Evidence**:
```typescript
// jwt.strategy.ts:15
const secret = configService.get<string>('JWT_SECRET');

// socket-auth.guard.ts:22
const payload = await this.jwtService.verifyAsync(token, {
  secret: process.env.JWT_ACCESS_SECRET,
});
```

**Remediation**: Unify to a single secret variable, or ensure `JwtModule.register()` in `AuthModule` uses `JWT_ACCESS_SECRET` consistently.

### 1.3 Password Security
| Check | Status | Evidence |
|:---|:---|:---|
| bcrypt hashing | ✅ | `HashUtil` wraps bcrypt |
| Password not logged | ✅ | Only `email` logged on failed attempts |
| Password not returned in API | ✅ | `JwtStrategy.validate()` returns only `{id, email, tierLevel, roles, permissions}` |

---

## 2. Authorization Security

### 2.1 Guard Matrix

| Endpoint | JwtAuth | Permissions | Tier | Risk |
|:---|:---|:---|:---|:---|
| `POST /auth/login` | ❌ | ❌ | ❌ | ✅ Expected |
| `GET /auth/me` | ✅ | ❌ | ❌ | ✅ OK |
| `GET /signals` | ✅ | ❌ | ✅ GOLD | ✅ OK |
| `POST /signals` | ✅ | ✅ CREATE_SIGNAL | ✅ | ✅ OK |
| `POST /blogs` | ✅ | ✅ CREATE_BLOG | ❌ | ✅ OK |
| `GET /admin/users` | ✅ | ✅ MANAGE_USERS | ❌ | ✅ OK |
| `POST /billing/webhook` | ❌ | ❌ | ❌ | ⚠️ **No signature verification** |
| `GET /market/sectors` | ❌ | ❌ | ❌ | ✅ Public data |
| `WS /ws/market` | ❌ | ❌ | ❌ | ⚠️ **No auth guard** |
| `WS /ws/signals` | ✅ | ❌ | ✅ (manual) | ✅ OK |

### 2.2 SUPER_ADMIN Bypass
Both `PermissionsGuard` and `SubscriptionTierGuard` contain explicit `SUPER_ADMIN` bypass logic. This is architecturally correct but must be monitored via audit logs. The audit service **does** log all admin actions.

---

## 3. Financial Security

### 3.1 Webhook Replay Protection
| Layer | Mechanism | Status |
|:---|:---|:---|
| Redis NX Lock | 300s TTL idempotency lock | ✅ |
| Database Unique Constraint | `idempotencyKey` unique index | ✅ |
| Invoice Status Check | Rejects if already `PAID` | ✅ |

### 3.2 CRITICAL: Missing Signature Verification (FIN-03)
The `BillingController.handleWebhook()` extracts `x-webhook-signature` from headers but **never passes it to the service** for cryptographic verification. An attacker could:
1. Discover the `/billing/webhook` endpoint via Swagger (or guess it)
2. POST arbitrary `{ invoiceId, amount }` payloads
3. Trigger subscription activations without actual payment

**Remediation**: Implement HMAC-SHA256 signature verification in `PaymentService` before processing.

---

## 4. Infrastructure Security

| Check | Status | Evidence |
|:---|:---|:---|
| Helmet headers | ✅ | `app.use(helmet())` in main.ts |
| CORS governance | ✅ | Configurable `CORS_ORIGIN` |
| Payload size limits | ✅ | 1MB JSON limit |
| Swagger disabled in prod | ✅ | `process.env.NODE_ENV !== 'production'` gate |
| Rate limiting | ✅ | Global ThrottlerGuard |
| Non-root Docker | ✅ | `USER fintop` in Dockerfile |
| Env secret validation | ✅ | Dangerous defaults blacklisted |
| `process.env` leakage | ⚠️ | `socket-auth.guard.ts` uses `process.env` directly |

---

## 5. Vulnerability Summary

| ID | Severity | Finding | Status |
|:---|:---|:---|:---|
| AUTH-01 | **CRITICAL** | JWT Secret mismatch (HTTP vs WebSocket) | 🔴 Open |
| FIN-01 | **CRITICAL** | BillingController calls non-existent `createInvoice()` method | 🔴 Open |
| FIN-02 | **CRITICAL** | BillingController calls non-existent `processPaymentEvent()` method | 🔴 Open |
| FIN-03 | **HIGH** | Webhook signature never verified cryptographically | 🔴 Open |
| RT-01 | **HIGH** | NotificationQueue bypasses BullMQ entirely | 🔴 Open |
| DTO-01 | **HIGH** | Controllers accept `any` bodies — validation pipe ineffective | 🔴 Open |
| PQ-01 | **HIGH** | N+1 nested include in JWT validation on every request | 🟡 Open |
| AUTH-04 | **MEDIUM** | MarketGateway has no auth guard | 🟡 Open |
| FIN-05 | **MEDIUM** | Redis lock fails open if Redis is down | 🟡 Open |
| INFRA-01 | **MEDIUM** | Health/metrics endpoints throttled by global guard | 🟡 Open |
