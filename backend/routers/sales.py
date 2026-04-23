"""
BrewAnalytics Sales API Router — Shop-Scoped
=============================================
All endpoints read the logged-in user's shop from JWT and filter data accordingly.
Accuracy metrics and model logs are printed to the terminal on every request.
"""

import sys
import os
import re
from fastapi import APIRouter, HTTPException, Depends
from routers.auth_utils import get_current_shop

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
ROOT_DIR    = os.path.dirname(BACKEND_DIR)
sys.path.insert(0, ROOT_DIR)

from sales_model.sales_model import SalesAnalyticsEngine

router = APIRouter()

# ─── Per-shop engine cache ─────────────────────────────────────────────────────
_engines: dict = {}


def _safe_shop_name(shop: str) -> str:
    return re.sub(r'[^\w\s-]', '', shop).strip().replace(' ', '_').lower()


def _get_shop_sales_csv(shop: str) -> str | None:
    """Return the path to shop-specific uploaded sales CSV if it exists."""
    safe = _safe_shop_name(shop)
    path = os.path.join(ROOT_DIR, "sales_model", "data", f"{safe}_sales.csv")
    return path if os.path.exists(path) else None


def get_engine(shop: str) -> SalesAnalyticsEngine:
    """Lazy-load a per-shop engine. Uses uploaded CSV if available, else filters main dataset."""
    global _engines
    if shop not in _engines:
        print(f"[*] Initialising Sales Analytics Engine for: {shop} ...")
        uploaded_csv = _get_shop_sales_csv(shop)
        _engines[shop] = SalesAnalyticsEngine(outlet=shop, custom_csv=uploaded_csv)
        print(f"[*] Sales Analytics Engine ready for: {shop}")
    return _engines[shop]


@router.get("/analytics")
def sales_analytics(shop: str = Depends(get_current_shop)):
    """Returns analytics filtered to the logged-in user's shop."""
    try:
        result = get_engine(shop).get_analytics_summary()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecast")
def sales_forecast(horizon: int = 90, shop: str = Depends(get_current_shop)):
    """Returns STL+ARIMA forecast for the logged-in user's shop."""
    if horizon < 7 or horizon > 365:
        raise HTTPException(status_code=400, detail="horizon must be between 7 and 365 days")
    try:
        result = get_engine(shop).get_forecast(horizon_days=horizon)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh")
def refresh_engine(shop: str = Depends(get_current_shop)):
    """Force-reload the engine for the current shop."""
    global _engines
    if shop in _engines:
        del _engines[shop]
    return {"message": f"Engine refreshed for {shop}. Next request will re-initialise."}


@router.get("/competitors")
def get_competitors(shop: str = Depends(get_current_shop)):
    """Returns dynamic competitor benchmarking data from BrewAnalytics_Sales_Analysis_v2.xlsx"""
    import pandas as pd
    import numpy as np

    file_path = os.path.join(ROOT_DIR, "sales_model", "BrewAnalytics_Sales_Analysis_v2.xlsx")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Competitor dataset not found")

    try:
        # Read the exact sheet, skipping the first 2 title rows
        df = pd.read_excel(file_path, sheet_name="Sales Analysis", skiprows=2)
        df = df.dropna(subset=["Outlet"]).fillna(0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read competitor data: {e}")

    rating_comparison = []
    sentiment_radar = []
    price_positioning = []
    metrics = []

    # Safe float conversion
    def sf(val):
        try:
            return float(val)
        except:
            return 0.0

    # Process all rows
    found_user = False
    for _, row in df.iterrows():
        name = str(row["Outlet"]).strip()
        # Fuzzy match: handle "Vrindavan" vs "Vrindavan Restaurant", etc.
        name_l = name.lower()
        shop_l = shop.lower()
        is_user = (
            name_l == shop_l or
            shop_l in name_l or
            name_l in shop_l
        )
        if is_user:
            found_user = True
            color = "#6F4E37"
        else:
            color = "#94A3B8"

        # Mocking rating from Demand Index (e.g. Demand 100 -> Rating 4.0, 200 -> 4.8)
        demand = sf(row.get("Demand\nIndex", 100))
        rating = min(5.0, round(3.5 + (demand / 200), 1))
        
        avg_order = sf(row.get("Avg Order\nValue (₹)", 100))
        
        # Extract sentiment percentage if possible
        sent_str = str(row.get("Sentiment\nSignal", "0.75"))
        sent_match = re.search(r"0\.\d+", sent_str)
        sentiment_pct = int(float(sent_match.group(0)) * 100) if sent_match else 75

        rating_comparison.append({
            "name": name,
            "rating": rating,
            "color": color
        })

        price_positioning.append({
            "name": name,
            "price": avg_order,
            "quality": rating,
            "size": demand * 5
        })

        metrics.append({
            "name": name,
            "rating": rating,
            "sentiment": sentiment_pct,
            "avgPrice": f"₹{int(avg_order)}",
            "marketShare": round((demand / 1000) * 100, 1), # mock share
            "trend": "up" if demand > 120 else ("down" if demand < 80 else "stable")
        })

    # If the user's shop isn't in the dataset, inject it using baseline or actual engine stats
    if not found_user:
        engine = get_engine(shop)
        stats = engine.get_analytics_summary()
        avg_order = stats.get("avg_order_value", 150.0)
        
        rating_comparison.insert(0, {
            "name": shop,
            "rating": 4.5, # baseline optimistic rating
            "color": "#6F4E37"
        })
        price_positioning.insert(0, {
            "name": shop,
            "price": avg_order,
            "quality": 4.5,
            "size": 600
        })
        metrics.insert(0, {
            "name": shop,
            "rating": 4.5,
            "sentiment": 80,
            "avgPrice": f"₹{int(avg_order)}",
            "marketShare": 15,
            "trend": "up"
        })

    # Generate synthetic radar data comparing User vs Avg Competitor
    sentiment_radar = [
        { "category": "Food Quality", "yourCafe": 85, "avgCompetitor": 72 },
        { "category": "Service", "yourCafe": 78, "avgCompetitor": 75 },
        { "category": "Ambiance", "yourCafe": 82, "avgCompetitor": 68 },
        { "category": "Price Value", "yourCafe": 65, "avgCompetitor": 70 },
        { "category": "Cleanliness", "yourCafe": 88, "avgCompetitor": 74 },
        { "category": "Speed", "yourCafe": 72, "avgCompetitor": 76 },
    ]

    strengths = [
        { "label": "Food Quality", "score": 85, "advantage": "+13 vs avg" },
        { "label": "Cleanliness", "score": 88, "advantage": "+14 vs avg" }
    ]
    weaknesses = [
        { "label": "Pricing", "score": 65, "disadvantage": "-5 vs avg" }
    ]

    # Sort metrics by Market Share or Demand
    metrics = sorted(metrics, key=lambda x: x["marketShare"], reverse=True)

    return {
        "ratingComparisonData": rating_comparison[:6], # Top 6
        "sentimentRadarData": sentiment_radar,
        "pricePositioningData": price_positioning,
        "competitorMetrics": metrics,
        "strengthsWeaknesses": {
            "strengths": strengths,
            "weaknesses": weaknesses
        }
    }

