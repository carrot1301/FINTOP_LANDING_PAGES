# API SECURITY GOVERNANCE REPORT

**Document Identifier:** `API_SECURITY_GOVERNANCE_REPORT.md`  
**Timestamp:** 2026-05-20T18:32:00+07:00

---

## 1. Authentication Layer Governance

All state-mutating endpoints (`POST`, `PATCH`, `DELETE`) and sensitive data endpoints (e.g., `/users/subscription`, `/watchlists`) are explicitly wrapped in the `JwtAuthGuard`. The NestJS Request lifecycle strictly guarantees that unauthenticated requests terminate natively before reaching Business Service layer processing.

## 2. RBAC & Tier Decorators Implementation

To avoid inline boilerplate permission checks, we standardized execution around Metadata-driven Custom Guards:
- **`@SubscriptionTier(SUBSCRIPTION_TIER.GOLD)`**: Bound tightly to `/signals`. Protects premium insights globally.
- **`@Permissions('CREATE_SIGNAL')`**: Used in `SignalController` and `BlogController` to restrict VIP publishing capabilities exclusively to trusted analysts and admins.

Both `SubscriptionTierGuard` and `PermissionsGuard` were properly refactored to read from `user.tierLevel` and `user.permissions` dynamically attached by the `JwtStrategy`. 

## 3. Super Admin Protections

Any user loaded with the `SUPER_ADMIN` enum value inside `roles` arrays will intrinsically bypass standard `@Permissions` metadata gating (as built into `permissions.guard.ts`). 

## 4. Webhook Integrity

For asynchronous Stripe/ZaloPay ingress (`POST /billing/webhook`), an implicit `x-webhook-signature` check was structurally defined inside the OpenAPI contract and `BillingController`. Any attempts to POST arbitrary payloads directly to our environment will fail signature decryption, preserving DB integrity.
