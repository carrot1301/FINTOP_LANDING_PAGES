# SUBSCRIPTION RUNTIME VALIDATION REPORT

**Document Identifier:** `SUBSCRIPTION_RUNTIME_VALIDATION_REPORT.md`  
**Timestamp:** 2026-05-18T14:59:00+07:00  

---

## 1. Execution Summary

A full end-to-end integration test (`test/billing-validation.ts`) was executed against a live PostgreSQL and Redis runtime container. The test validated the chronological interactions of the Subscription and Billing domains.

## 2. Validation Matrix

| Test Event | Verification Objective | Result | Status |
| :--- | :--- | :--- | :--- |
| **Plan Instantiation** | Ensure `SubscriptionPlan` can be created with a mapping to `GOLD` tier. | Handled flawlessly with correct defaults. | **PASS** |
| **Drafting Invoice** | Test `createSubscriptionInvoice()` execution mapping to the plan logic. | Invoice instantiated as `DRAFT` matching exact decimal pricing. | **PASS** |
| **Webhook Processing** | Emit a successful Webhook trigger simulating VietQR transaction. | Transaction marked `SUCCESS`, Invoice marked `PAID`. | **PASS** |
| **User Tier Modification** | Verify side-effects of Webhook Processing against `User` table. | Sub created. User `tierLevel` successfully upgraded from `STANDARD` to `GOLD`. | **PASS** |
| **Outbox Dispatch** | Ensure events emit natively to DB instead of in-memory buses. | 2 records `INVOICE_PAID`, `SUBSCRIPTION_ACTIVATED` materialized successfully. | **PASS** |
| **Cron Expiration** | Simulate time-travel by manipulating DB end date and invoking chron job. | Subscription transitioned to `EXPIRED`. User gracefully downgraded to `STANDARD`. | **PASS** |

## 3. Engineering Sign-Off

The entire lifecycle workflow across isolated modules has successfully proven transactional cohesion. No drift was observed.

