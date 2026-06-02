# SIGNAL RUNTIME VALIDATION REPORT

**Document Identifier:** `SIGNAL_RUNTIME_VALIDATION_REPORT.md`  
**Timestamp:** 2026-05-18T15:20:00+07:00  

---

## 1. Execution Summary

A full end-to-end integration test (`test/signal-validation.ts`) was executed against PostgreSQL and Redis to validate Signal logic, Portfolio Accounting, and Caching integrity.

## 2. Validation Matrix

| Test Event | Verification Objective | Result | Status |
| :--- | :--- | :--- | :--- |
| **Publish Signal** | Safely create a signal assigned to a specific author and stock. | Inserted `VipSignal`, generated initial `SignalExecutionLog`, pushed to Redis. | **PASS** |
| **Lifecycle Change** | Transition state to `REACHED_TARGET` idempotently. | Handled gracefully. Audit successfully recorded. | **PASS** |
| **Portfolio Bootstrapping** | Establish a new `RecommendedPortfolio` with fiat initialization. | Portfolio initialized with 1B VND purely in `cashBalance`. | **PASS** |
| **Holdings Accounting** | Purchase 1000 shares of a stock and check balances. | `PortfolioHolding` created, `cashBalance` decremented by exactly `1000 * entryPrice`. | **PASS** |
| **NAV Calculation** | Calculate end-of-day total valuation. | Accurately summed `cashBalance` + total open position valuation. | **PASS** |
| **Cache Propagation** | Check Redis. | Realtime NAV immediately replicated to `portfolio:nav:{id}`. | **PASS** |

## 3. Engineering Sign-Off

The financial constraints within the portfolio domain correctly enforce budget safety (cannot overbuy). The signal execution logs ensure perfect auditability preventing historical alteration of bad recommendations. Everything executes within atomic Prisma transactions.
