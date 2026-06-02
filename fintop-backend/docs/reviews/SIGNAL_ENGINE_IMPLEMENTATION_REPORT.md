# SIGNAL ENGINE IMPLEMENTATION REPORT

**Document Identifier:** `SIGNAL_ENGINE_IMPLEMENTATION_REPORT.md`  
**Timestamp:** 2026-05-18T15:19:00+07:00  

---

## 1. VIP Signal Domain Expansion

The schema has integrated specialized domains for Realtime trading recommendations:
- **`VipSignal`**: Primary entity storing strict `minTierAccess`, mapping signals directly to specific roles (e.g. users holding a `DIAMOND` subscription).
- **`SignalTarget`**: Flexible 1-to-N relationships allowing multiple scale-out take-profit targets for a single signal.
- **`SignalExecutionLog`**: Implements append-only temporal ledger tracking precisely when a signal transitions (`PUBLISHED` -> `REACHED_TARGET` -> `CLOSED`), preventing historical rewriting of bad trades.

## 2. Core Service Architectures

- **`SignalService`**: Encapsulates the transactional boundaries of signal lifecycle. Changing a signal state automatically writes to `SignalExecutionLog` and simultaneously pushes to `AuditLog`.
- **`PortfolioService`**: Operates on a true double-entry like financial ledger. Purchasing `PortfolioHolding` deducts explicitly from `RecommendedPortfolio.cashBalance` in the same Prisma Transaction.
- **Cache Invalidation**: Instantly propagates Signal transitions (`signal:latest`) and NAV recalculations (`portfolio:nav:{id}`) to Redis.

## 3. Subscription Access Control

The database schema actively binds `minTierAccess` to `VipSignal` and `RecommendedPortfolio`. This ensures API layers can directly filter out Premium content from `STANDARD` users using raw SQL `WHERE` clauses, entirely preventing payload leakage over HTTP networks.
