"""
Sync latest stock prices from DNT Quant Lab into Supabase.

Required environment variables:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Optional:
  DNT_DATA_ENGINE_PATH
    Defaults to F:\\DNT_Workspace\\quant-engine\\dnt_quant_lab\\backend\\core\\data_engine.py
  FINTOP_SYNC_TICKERS
    Comma-separated tickers. Defaults to the current static FinTop coverage list.

The DNT engine returns prices in Entrade units. This script follows DNT's
fetch_current_prices convention and multiplies stock OHLC by 1000 to store VND.
"""

from __future__ import annotations

import datetime as dt
import importlib.util
import json
import os
import sys
from pathlib import Path
from typing import Any
from urllib import request


DEFAULT_DNT_ENGINE = (
    r"F:\DNT_Workspace\quant-engine\dnt_quant_lab\backend\core\data_engine.py"
)

DEFAULT_TICKERS = [
    "VEA",
    "DST",
    "DGW",
    "MWG",
    "PNJ",
    "FPT",
    "VNM",
    "FRT",
    "MSN",
    "PLX",
    "PET",
    "BVH",
    "BIC",
    "HPG",
    "SSI",
    "VCB",
    "TCB",
    "VHM",
]


def load_data_engine(path: str):
    engine_path = Path(path).expanduser().resolve()
    if not engine_path.exists():
        raise FileNotFoundError(f"DNT data_engine.py not found: {engine_path}")

    spec = importlib.util.spec_from_file_location("dnt_data_engine", engine_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load module from {engine_path}")

    module = importlib.util.module_from_spec(spec)
    sys.modules["dnt_data_engine"] = module
    spec.loader.exec_module(module)
    return module


def get_tickers() -> list[str]:
    raw = os.getenv("FINTOP_SYNC_TICKERS", "")
    if not raw.strip():
        return DEFAULT_TICKERS
    return [item.strip().upper() for item in raw.split(",") if item.strip()]


def latest_price_row(engine: Any, ticker: str) -> dict[str, Any] | None:
    df = engine.fetch_stock_data(ticker, days_back=10)
    if df.empty:
        return None

    latest = df.iloc[-1]
    previous = df.iloc[-2] if len(df) >= 2 else latest
    close = float(latest["close"]) * 1000
    prev_close = float(previous["close"]) * 1000
    change_pct = 0 if prev_close == 0 else ((close - prev_close) / prev_close) * 100

    return {
        "ticker": ticker,
        "price": close,
        "open": float(latest["open"]) * 1000 if "open" in latest else None,
        "high": float(latest["high"]) * 1000 if "high" in latest else None,
        "low": float(latest["low"]) * 1000 if "low" in latest else None,
        "close": close,
        "volume": float(latest["volume"]) if "volume" in latest else None,
        "change_pct": round(change_pct, 2),
        "source": "DNT Quant Lab / Entrade",
        "synced_at": dt.datetime.now(dt.timezone.utc).isoformat(),
    }


def supabase_upsert(table: str, rows: list[dict[str, Any]]) -> None:
    if not rows:
        print("No rows to sync.")
        return

    url = os.environ["SUPABASE_URL"].rstrip("/")
    service_role_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    endpoint = f"{url}/rest/v1/{table}?on_conflict=ticker"
    body = json.dumps(rows).encode("utf-8")

    req = request.Request(
        endpoint,
        data=body,
        method="POST",
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )

    with request.urlopen(req, timeout=30) as res:
        if res.status not in (200, 201, 204):
            raise RuntimeError(f"Supabase upsert failed: HTTP {res.status}")


def main() -> int:
    missing = [key for key in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY") if not os.getenv(key)]
    if missing:
        raise RuntimeError(f"Missing env vars: {', '.join(missing)}")

    engine_path = os.getenv("DNT_DATA_ENGINE_PATH", DEFAULT_DNT_ENGINE)
    engine = load_data_engine(engine_path)
    tickers = get_tickers()

    rows = []
    for ticker in tickers:
        row = latest_price_row(engine, ticker)
        if row:
            rows.append(row)
            print(f"{ticker}: {row['price']:,.0f} VND ({row['change_pct']}%)")
        else:
            print(f"{ticker}: no data")

    supabase_upsert("stock_prices", rows)
    print(f"Synced {len(rows)} stock_prices rows.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
