# BACKUP & DISASTER RECOVERY STRATEGY

**Document Identifier:** `BACKUP_RECOVERY_STRATEGY.md`  
**Timestamp:** 2026-05-20T18:40:00+07:00

---

## 1. Database Backup Strategy

### PostgreSQL

| Strategy | Frequency | Retention | Tool |
|:---|:---|:---|:---|
| **Full Backup** | Daily at 02:00 UTC | 30 days | `pg_dump --format=custom` |
| **WAL Archiving** | Continuous | 7 days | `pg_basebackup` + WAL shipping |
| **Point-in-Time Recovery** | N/A (always available) | 7-day window | WAL replay |

### Redis

| Strategy | Frequency | Retention | Tool |
|:---|:---|:---|:---|
| **RDB Snapshot** | Every 6 hours | 3 days | Redis `BGSAVE` |
| **AOF Persistence** | Continuous (appendfsync=everysec) | Current state | Built-in AOF |

> Redis is treated as a **cache layer**, not a primary data store. Full data reconstruction from PostgreSQL is always possible.

## 2. Migration Rollback Governance

All Prisma migrations follow this strict protocol:
1. **Before Deployment**: Run `prisma migrate diff` against production to validate expected SQL output.
2. **Rollback Script**: Every forward migration must have a corresponding down-migration SQL script stored in `prisma/rollbacks/`.
3. **Blue-Green Window**: Database migrations are applied during scheduled maintenance windows with blue-green deployment active.
4. **Validation Gate**: Post-migration, the `/health/readiness` probe must return `ready: true` before traffic is routed.

## 3. Disaster Recovery Procedures

### Scenario A: Database Corruption
1. Halt application traffic (set readiness probe to `false`)
2. Restore from latest `pg_dump` backup
3. Replay WAL logs to most recent consistent state
4. Validate with `prisma migrate status`
5. Resume traffic

### Scenario B: Redis Total Failure
1. Application continues operating in degraded mode (DB-direct reads)
2. Restart Redis instance from latest RDB snapshot
3. Market cache will self-heal within 60 seconds via ingestion pipeline

### Scenario C: Full Infrastructure Loss
1. Provision new infrastructure from Terraform state (future Wave-8)
2. Restore PostgreSQL from off-site backup
3. Run `prisma migrate deploy`
4. Deploy latest Docker image from container registry
5. Validate all health probes
