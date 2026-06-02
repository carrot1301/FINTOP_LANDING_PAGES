# QUEUE RELIABILITY FIX REPORT
- **Issue:** Notification queue utilized the synchronous event loop (`setImmediate`), discarding jobs on crashes.
- **Resolution:** Re-architected `NotificationQueue` and `NotificationModule` to integrate natively with `@nestjs/bullmq` and Redis. Implemented a decoupled `NotificationProcessor`.
- **Validation:** Exponential backoff policies were configured. 
