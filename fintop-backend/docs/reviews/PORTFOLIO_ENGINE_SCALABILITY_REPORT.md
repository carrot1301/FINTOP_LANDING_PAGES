# PORTFOLIO ENGINE SCALABILITY REPORT

**Document Identifier:** `PORTFOLIO_ENGINE_SCALABILITY_REPORT.md`  
**Timestamp:** 2026-05-18T15:21:00+07:00  

---

## 1. Schema Optimization

The `PortfolioNavSnapshot` model inherently represents time-series data:
- **Compound Keys**: Indexed rigorously via `@@unique([portfolioId, date])`. This allows fast retrieval of historical portfolio charts (e.g. 1 Year NAV growth curves).
- **Precision Preservation**: Decimals mapped as `Decimal(19, 4)` for all prices, entries, capital, and snapshot calculations preventing precision bleed.
- **Volume Handling**: `BigInt` usage natively supports vast institutional share quantities over integer limits.

## 2. High-Frequency Realtime Adjustments

- **Redis Caching Strategy**: Fetching current NAV avoids joining holding arrays dynamically by reading exclusively from `portfolio:nav:{id}` which is synchronized during mutations.
- **Batching Limitations**: When recalculating NAV across the entire market (e.g., at market close), iterating over every single holding matrix sequentially using Prisma could bottleneck Node.js memory.

## 3. Unresolved Risks

- **NAV Recalculation Scalability**: A background job (Cron/BullMQ) must be implemented to recalculate NAVs for hundreds of portfolios concurrently. This requires chunked processing or delegating the SUM multiplication directly to raw PostgreSQL `SUM(quantity * currentPrice) GROUP BY portfolioId` for 100x efficiency over application-level loops.
- **Websocket readiness**: Real-time signal publishing is actively pushed to Redis, but a Pub/Sub mechanism must be formally connected to emit Socket.io broadcasts to connected UI clients.
