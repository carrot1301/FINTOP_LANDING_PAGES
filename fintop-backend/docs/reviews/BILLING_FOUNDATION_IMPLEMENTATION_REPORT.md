# BILLING FOUNDATION IMPLEMENTATION REPORT

**Document Identifier:** `BILLING_FOUNDATION_IMPLEMENTATION_REPORT.md`  
**Timestamp:** 2026-05-18T14:58:00+07:00  

---

## 1. Domain Expansions

The schema was expanded with immutable transactional models for the Monetization Foundation:
- **`SubscriptionPlan`**: Declarative tier level configurations and fiat pricing.
- **`UserSubscription`**: Temporal mapping of user access.
- **`Invoice`**: Point-in-time financial obligation records.
- **`Transaction`**: Immutable payment settlement ledger.
- **`PaymentWebhookLog`**: Idempotent persistence of external banking callbacks.
- **`OutboxEvent`**: Guaranteeing eventually consistent architecture for side-effects (e.g. Emailing upon payment).

## 2. Core Service Architectures

- **`InvoiceService`**: Handles the creation of strict `DRAFT` invoices referencing immutable pricing structures.
- **`SubscriptionService`**: Encapsulates `tierLevel` transitions. Handles the chronological activation of subscriptions and exposes an `expireSubscriptions()` cron-ready endpoint to automatically revert access back to `STANDARD`.
- **`PaymentService`**: Exposes the Webhook entrypoint. Features 100% ACID compliance using Prisma Transactions. Ensures `Invoice` payment, `Transaction` ledgering, `UserSubscription` activation, and `OutboxEvent` dispatching all commit simultaneously or rollback flawlessly.

## 3. Unresolved Risks

- **Webhook Signature Verification**: Currently acting as a placeholder. When real VietQR/ZaloPay SDKs are ingested, RSA signature decoding MUST be enforced prior to locking idempotency keys.
- **BullMQ Cron Implementation**: Expiration is currently exposed as a service method. A global scheduler must invoke this periodically across the cluster.
