# MARKET DATA SCALABILITY REPORT

**Document Identifier:** `MARKET_DATA_SCALABILITY_REPORT.md`  
**Timestamp:** 2026-05-18T15:13:00+07:00  

---

## 1. Schema Optimization

The `StockPriceDaily` model represents the largest potential table in the system (expecting billions of rows long term). 
- **Compound Keys**: Indexed rigorously via `@@unique([stockId, date])` and isolated index `@@index([date])`. This layout ensures fast lookup by symbol while allowing aggregate time-based queries across the entire market to remain fast.
- **Precision Preservation**: Decimals mapped as `Decimal(19, 4)` ensures that floating point math errors do not corrupt financial calculations.
- **BigInt Volume**: Stock volume globally exceeds standard integer size. Configured strictly as `BigInt`.

## 2. Partition Readiness Architecture

Because historical data never changes post-market-close, `StockPriceDaily` inherently acts as a time-series ledger.
- While native Postgres Partitions are not explicitly configured inside Prisma yet, the application-level usage entirely avoids updating past historical OHLCV data. 
- A seamless migration to `RANGE (date)` partitions via raw SQL is guaranteed safe, as the application never queries rows across infinite horizons without strict date limitations.

## 3. High-Frequency Realtime Read Operations

To eliminate DB strain during market hours:
- All latest quotes are pushed directly to Redis on ingestion under standard `EX` keys.
- Market reads (`getStock`) bypass the DB almost entirely for changing numbers. The SQL request merely retrieves the static metadata, fetching the dynamic data from RAM.

## 4. Unresolved Risks

- **Realtime Tick History (Intraday)**: Intraday 1M/5M/15M charts would explode row count exponentially. Before launching Intraday data, TimeScaleDB or ClickHouse MUST be integrated. PostgreSQL should solely govern `Daily` and static master entities.
- **Pagination Strategy**: Currently, the repository uses `skip` and `take` (`offset` pagination). If the stock list grows, `cursor` pagination must be implemented.
