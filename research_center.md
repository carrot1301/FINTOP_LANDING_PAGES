# Automated Research Center - Technical Documentation

The **Automated Research Center** is a modular quant intelligence report compilation engine designed for the FINTop Quant Platform. It aggregates data across multiple existing platform domains (Market Intelligence, Portfolios, Financial Data) and generates structured, grounded reports with professional, non-advisory formatting.

---

## 1. Architecture Overview

The module consists of:
1. **Research Data Aggregator Service**: Standardizes inputs from stock parameters, financials, portfolios, and market regime histories.
2. **Grounded AI Writing Service**: Connects to the Gemini Flash API to generate text based strictly on provided facts, with a high-fidelity local template fallback engine when the API key is missing or offline.
3. **Research Export Service**: Formats reports into clean Markdown, raw JSON, and styled DOCX (Office Word) payloads.
4. **Research Controller**: Exposes the REST API endpoints.
5. **Frontend Research Center UI**: Provides an interactive, bento-style configuration form and scrollable markdown preview with warnings log panels.

---

## 2. API Endpoints

All endpoints are registered under the `/research` path:

- `POST /research/generate`
  - Generates a new research report based on a type and subject.
  - Body:
    ```json
    {
      "report_type": "company",
      "subject": "FPT",
      "language": "vi",
      "format": "markdown",
      "include_charts": true
    }
    ```
- `GET /research/templates`
  - Returns metadata lists of supported templates and sections.
- `GET /research/history`
  - Returns a list of metadata for previously generated research reports.
- `GET /research/export/:id?format=[json|markdown|docx|pdf]`
  - Exports a specific report. JSON/Markdown/DOCX are downloadable blobs. PDF returns a warning instructing the user to print from the browser preview.

---

## 3. Supported Report Types & Data Sources

| Report Type | Target / Subject | Primary Data Source | Fallback / Warnings |
|---|---|---|---|
| **Nghiên cứu & Phân tích Doanh nghiệp** | Ticker (e.g. FPT) | `StockPriceDaily`, `FinancialIndicator` | Warnings if stock/price is not in DB. |
| **Nghiên cứu & Phân tích Ngành** | Sector Name (e.g. Công nghệ thông tin) | Sector Rotation History | Warning if sector is not found. |
| **Nghiên cứu & Phân tích Thị trường Tuần** | Index (e.g. VNINDEX) | `MarketRegimeHistory`, `MarketBreadthHistory` | Warning if Market Intelligence summary fails. |
| **Nghiên cứu & Phân tích Danh mục** | Portfolio ID | `RecommendedPortfolio`, Holdings Allocation | Warnings if Backtest or Optimizer data is missing. |
| **Tóm tắt Thông tin Thị trường** | Index (e.g. VNINDEX) | Unified Market intelligence summary | Warning if data is missing. |

---

## 4. Grounding & Governance Constraints

- **No Financial Recommendations**: The engine uses an academic, objective finance tone and explicitly prohibits promotional advice.
- **Mandatory Disclaimer**: Every report automatically appends the Vietnamese disclaimer:
  > *"Ấn phẩm này được tạo từ dữ liệu định lượng và diễn giải hỗ trợ bởi AI, chỉ phục vụ mục đích nghiên cứu và giáo dục, không phải là khuyến nghị đầu tư hoặc tư vấn đầu tư."*
- **Warnings & Zero-Fabrication**: Any missing metric or system (e.g. Backtest/Optimizer engines) is marked as `"Data unavailable"` and added to the `warnings` list instead of fabricating mock numbers.

---

## 5. Deployment & Fallbacks

- **Gemini Flash Integration**: If `GEMINI_API_KEY` is present in the environment variables, reports are written by calling the Google generative language API with temperature `0.1` for maximum grounding.
- **Local Fallback**: If the API key is absent, the system resolves template fallbacks deterministically using local database indicators and facts, ensuring the service never crashes.
