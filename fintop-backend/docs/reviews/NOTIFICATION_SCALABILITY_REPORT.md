# NOTIFICATION SCALABILITY REPORT

**Document Identifier:** `NOTIFICATION_SCALABILITY_REPORT.md`  
**Timestamp:** 2026-05-18T15:34:00+07:00  

---

## 1. Schema Optimization

The notification paradigm relies on aggressive writes and frequent reads.
- **`NotificationDeliveryLog`**: Completely separates the act of delivering (via SMS, System, Email) from the actual payload tracking. Allows asynchronous auditing without locking up the core `Notification` entity during slow 3rd-party network calls.
- **Indexing Constraints**: `@@index([userId, status, createdAt])` is optimized exactly for the primary UI retrieval query: "Get unread notifications ordered by time".

## 2. Queue Foundation

While the current foundation utilizes standard event loops (`setImmediate` logic via `NotificationQueue`), the architecture is natively 100% compliant with standard enterprise queuing like BullMQ or Apache Kafka:
- Enqueuing is decoupled from business logic.
- Delivery failures log uniquely against a payload.
- Retries can be orchestrated externally.

## 3. Unresolved Risks

- **Memory Ballooning**: As price alerts evaluate dynamically against every incoming tick for highly volatile stocks, the `AlertService` currently hits PostgreSQL. To achieve real hyper-scale (10k+ alerts evaluating per second), the `alerts:active` Redis mapping must contain the precise `targetValue` and `condition` in memory so SQL can be skipped entirely during evaluation phases.
- **Websocket readiness**: The `NotificationService` requires a future integration hooking into Socket.io/Centrifugo to instantly beam `UNREAD` badges to live sessions.
