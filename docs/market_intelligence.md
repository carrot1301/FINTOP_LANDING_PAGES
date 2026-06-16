# Market Intelligence Center Documentation

The **Market Intelligence Center** extends the FINTop Quant Platform into a comprehensive market intelligence system for the Vietnam stock market. It contains persistent historical storage, indicator calculation engines, REST APIs, and a dynamic frontend dashboard.

---

## 1. Database Architecture & Schema

The module uses database-backed persistent storage in PostgreSQL via Prisma.

### Models & Tables

1. **`SectorRotationHistory` (`sector_rotation_history`)**
   - Tracks 1D, 1W, 1M, 3M, 6M, and YTD performance returns per sector.
   - Primary key: auto-incrementing ID.
   - Unique constraint: `[trade_date, sector_code]`.
   - Indexing: `trade_date`, `sector_code`.

2. **`MoneyFlowHistory` (`money_flow_history`)**
   - Stores ticker-level net and total capital inflows/outflows.
   - Unique constraint: `[trade_date, ticker]`.
   - Indexing: `trade_date`, `ticker`, `sector_code`.

3. **`ForeignFlowHistory` (`foreign_flow_history`)**
   - Monitors transactions by foreign investors, tracking volume and value.
   - Unique constraint: `[trade_date, ticker]`.
   - Indexing: `trade_date`, `ticker`, `sector_code`.

4. **`MarketBreadthHistory` (`market_breadth_history`)**
   - Records market-wide internal statistics (advancing, declining, unchanged counters, and moving average cross statistics).
   - Unique constraint: `[trade_date, exchange]`.
   - Indexing: `trade_date`, `exchange`.

5. **`MarketRegimeHistory` (`market_regime_history`)**
   - Captures index-level (VNINDEX, VN30) trend signals.
   - Stores close price, EMA20, EMA50, EMA200, ATR, ADX, regime state (Risk-On / Risk-Off / Neutral), and Risk Score (0-100).
   - Unique constraint: `[trade_date, index_code]`.
   - Indexing: `trade_date`, `index_code`.

---

## 2. API Endpoints

All endpoints are prefix-mounted at `/market`:

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/market/sector-rotation` | `period`, `limit`, `trade_date` | Retrieve sector performances ranking. |
| `GET` | `/market/sector-rotation/history` | `sector_code`, `start_date`, `end_date` | Fetch historical sector returns trend. |
| `GET` | `/market/money-flow` | `trade_date`, `group_by` | Retrieve money flow values. |
| `GET` | `/market/money-flow/history` | `start_date`, `end_date`, `group_by` | Fetch historical money flow trends. |
| `GET` | `/market/foreign-flow` | `trade_date`, `group_by` | Monitor foreign investor flows. |
| `GET` | `/market/foreign-flow/history` | `start_date`, `end_date`, `group_by` | Fetch foreign flow trends. |
| `GET` | `/market/breadth` | `trade_date`, `exchange` | Get advancing/declining count ratios. |
| `GET` | `/market/breadth/history` | `start_date`, `end_date`, `exchange` | Fetch historical breadth statistics. |
| `GET` | `/market/regime` | `index_code`, `trade_date` | Query market regime classification. |
| `GET` | `/market/regime/history` | `index_code`, `start_date`, `end_date` | Fetch historical regime trend. |
| `GET` | `/market/intelligence/summary` | `trade_date` | All-in-one dashboard summary payload. |
| `GET` | `/market/health` | - | Operational health check status. |
| `POST` | `/market/intelligence/refresh` | `trade_date` | Force manual calculation refresh. |
| `GET` | `/market/intelligence/export` | `format`, `trade_date` | Export data to JSON or CSV (Excel BOM). |

---

## 3. Calculation Methodology

### Sector Rotation
Returns are computed as the weighted average of member stock performance returns over the selected windows (1D, 1W, 1M, 3M, 6M, YTD) pulled from the `StockPriceDaily` historical records.

### Market Breadth
- **Advance/Decline Ratio**: `Advancing Count / Declining Count`
- **Moving Average Crosses**: Percentages of stocks currently trading above their calculated SMA20, SMA50, and SMA200 metrics.

### Market Regime Detection
- **Calculation**: Exposes an indicator engine evaluating a 250-period index close series. Computes EMA20, EMA50, EMA200, and 14-period True Range (ATR).
- **Rules**:
  - **`Risk-On`**: Close > EMA20 AND EMA20 > EMA50 AND EMA50 > EMA200 (Risk Score: 80 - 100).
  - **`Risk-Off`**: Close < EMA50 AND EMA20 < EMA50 (Risk Score: 0 - 30).
  - **`Neutral`**: Any other configuration (Risk Score: 30 - 70).

---

## 4. Ingestion & Refresh Utilities

1. **API Trigger**: `POST /market/intelligence/refresh?trade_date=YYYY-MM-DD`
2. **CLI Cron Utility**: `python scripts/refresh_market_intelligence.py`

Updates are written to the database using an idempotent upsert pattern (keyed on `tradeDate` and unique indexes), preventing row duplication.
