# INFRASTRUCTURE HARDENING REPORT — PRE-BUSINESS PLATFORM

**Document Identifier:** `INFRASTRUCTURE_HARDENING_REPORT.md`  
**Timestamp:** 2026-05-18T14:28:00+07:00  
**Phase:** Core Infrastructure Foundation (Pre-Wave 2)  

---

## 1. Executive Summary

To prevent architectural drift, logging fragmentation, and runtime instability before initiating Wave-2 business domain development, a rigorous infrastructure hardening phase was executed. This phase established a production-ready modular platform foundation within NestJS 11, integrating fail-fast configuration governance, resilient connection pooling, centralized queue management, and comprehensive observability.

---

## 2. Materialized Architecture & Module Hierarchy

The codebase was restructured into strict modular boundaries adhering to clean architecture principles:

```
src/
 ├── common/
 │    ├── config/         # Typed Environment Loading & Validation
 │    ├── database/       # High-Performance Prisma Singleton (Adapter-PG)
 │    ├── redis/          # Resilient IoRedis Connection Singleton
 │    ├── queue/          # Centralized BullMQ Registration
 │    ├── filters/        # Production-Secure Global Exception Filter
 │    ├── interceptors/   # Request Logging & Traceability
 │    ├── guards/         # JWT Security Scaffolding
 │    ├── decorators/     # Parameter Injection Helpers (CurrentUser)
 │    ├── logger/         # Global Logger Wrapper
 │    ├── health/         # Platform Readiness (/health)
 │    └── utils/          # Encryption & Hashing (HashUtil)
 ├── infra/
 │    └── infra.module.ts # Global Infrastructure Aggregator
```

---

## 3. Installed Dependencies & Versions

The following production infrastructure libraries were successfully integrated:
- **`@nestjs/config` (v11.0.0)** & **`class-validator`/`class-transformer`**: For schema-driven environment verification.
- **`ioredis` (v5.4.0)**: High-performance Redis driver supporting cluster failover and reconnect strategies.
- **`bullmq` (v5.34.0)** & **`@nestjs/bullmq` (v11.0.0)**: Distributed Redis-backed job queue with exponential backoff.
- **`@prisma/adapter-pg` & `pg`**: Bypassing Rust query engine TCP overhead via Node native connection pooling.

---

## 4. Architectural Reasoning & Design Decisions

### 4.1 Bypassing Node Cluster Deadlocks via IoRedis & BullMQ
Standard Redis drivers often suffer from socket timeouts under heavy queue workloads. By dedicating a separate `maxRetriesPerRequest: null` connection specifically for BullMQ workers while maintaining a retry-backed IoRedis instance for caching, we eliminate cross-worker thread contention.

### 4.2 Safe Production Error Formatting
Raw database exceptions (e.g., Prisma unique constraint failures or SQL syntax issues) expose internal table structures if unhandled. The `GlobalExceptionFilter` intercepts all `PrismaClientKnownRequestError` and `PrismaClientValidationError` instances, transforming them into secure HTTP 409/400 JSON payloads while attaching unique correlation IDs.

---

## 5. PgBouncer Compatibility & Scalability Readiness

### 5.1 Connection Pooling via Adapter-PG
When deployed in cloud environments behind PgBouncer operating in Transaction Pooling mode, standard Prisma clients frequently encounter prepared statement de-allocation failures. By wrapping native `pg.Pool` with `@prisma/adapter-pg`, all database interactions remain stateless across transaction boundaries, ensuring 100% PgBouncer compatibility.

### 5.2 Redis Resiliency & Cluster Failover
The `RedisService` is hardened with exponential backoff retry algorithms (`Math.min(times * 200, 3000)`). If the master Redis node fails over, the service automatically buffers pending cache operations and re-establishes socket connections without crashing the Node process.

---

## 6. Unresolved Infrastructure Risks
- **Redis Memory Eviction Policy**: For production deployment, Redis must be configured with an `allkeys-lru` or `volatile-lru` eviction policy to prevent out-of-memory (OOM) halts when cache namespaces scale.
- **Queue Dead-Letter Storage**: Currently, failed BullMQ jobs are preserved in Redis (`removeOnFail: 500`). For long-term auditability, a background cron job must be scheduled in Wave-2 to archive dead-letter jobs into PostgreSQL audit tables.
