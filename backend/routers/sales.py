"""
BrewAnalytics Sales API Router
================================
Exposes two primary endpoints consumed by the frontend:

  GET /api/sales/analytics  → Full analytics summary (KPIs, trends, outlets, items)
  GET /api/sales/forecast   → STL+ARIMA forecast with seasonality data

The engine is instantiated once at module load and cached for performance.
"""

import sys
import os
from fastapi import APIRouter, HTTPException

# ─── Add project root to path so we can import from sales_model/ ─────────────
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
ROOT_DIR    = os.path.dirname(BACKEND_DIR)
sys.path.insert(0, ROOT_DIR)

from sales_model.sales_model import SalesAnalyticsEngine

router = APIRouter()

# ─── Singleton engine (loaded once, cached in memory) ─────────────────────────
_engine: SalesAnalyticsEngine | None = None

def get_engine() -> SalesAnalyticsEngine:
    """Lazy-load the engine singleton so startup is fast."""
    global _engine
    if _engine is None:
        print("🔄  Initialising Sales Analytics Engine …")
        _engine = SalesAnalyticsEngine()
        print("✅  Sales Analytics Engine ready.")
    return _engine


@router.get("/analytics")
def sales_analytics():
    """
    Returns comprehensive sales analytics for the Sales Analytics page:
      - KPIs: total revenue, MoM growth, transactions, AOV
      - Monthly trend (last 13 months)
      - Per-outlet performance table
      - Top items by revenue
      - Day-of-week traffic pattern
      - Item revenue mix (pie/bar chart data)
    """
    try:
        return get_engine().get_analytics_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecast")
def sales_forecast(horizon: int = 90):
    """
    Returns AI-powered sales forecast for the Sales Forecasting page:
      - STL decomposition + ARIMA(1,1,1) forecast chart data
      - 95% confidence intervals
      - Weekly seasonality index
      - Monthly seasonality (peak/low months identified)
      - Outlet-level 30-day revenue projections
      - Item-level demand forecast
      - Model metadata (method, confidence score)
    
    Query params:
      horizon (int, default=90): forecast horizon in days
    """
    if horizon < 7 or horizon > 365:
        raise HTTPException(status_code=400, detail="horizon must be between 7 and 365 days")
    try:
        return get_engine().get_forecast(horizon_days=horizon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh")
def refresh_engine():
    """Force-reload the engine (useful after uploading new data)."""
    global _engine
    _engine = None
    return {"message": "Engine refreshed. Next request will re-initialise."}
