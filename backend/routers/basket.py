"""
BrewAnalytics – Market Basket Analysis Router
=============================================
All endpoints are shop-isolated via JWT. Each shop sees only its own basket data.
"""
import sys
import os

# Make sure project root is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from fastapi import APIRouter, Depends
from sales_model.basket_model import BasketAnalysisEngine
from routers.auth_utils import get_current_shop

router      = APIRouter()
router_recs = APIRouter()


# ── Primary endpoint ──────────────────────────────────────────────────────────
@router.get("/analysis")
def get_basket_analysis(shop: str = Depends(get_current_shop)):
    """Full MBA analysis for the authenticated shop."""
    return BasketAnalysisEngine(outlet=shop).get_analysis()


# ── Legacy compat: /api/basket/rules ─────────────────────────────────────────
@router.get("/rules")
def get_basket_rules(shop: str = Depends(get_current_shop)):
    """Backward-compatible endpoint — returns rules in 0-1 decimal format."""
    result = BasketAnalysisEngine(outlet=shop).get_analysis()
    if "error" in result:
        return {"rules": []}
    rules = [
        {
            "antecedent": r["antecedent"],
            "consequent": r["consequent"],
            "support":    r["support"]    / 100,
            "confidence": r["confidence"] / 100,
            "lift":       r["lift"],
        }
        for r in result.get("rules", [])
    ]
    return {"rules": rules}


# ── Recommendations ───────────────────────────────────────────────────────────
@router_recs.get("/")
def get_recommendations(shop: str = Depends(get_current_shop)):
    """Generate shop-specific recommendations from basket analysis."""
    result = BasketAnalysisEngine(outlet=shop).get_analysis()
    recs   = []

    if "error" not in result:
        rules   = result.get("rules", [])
        bundles = result.get("bundles", [])

        # Rec 1 — top bundle opportunity
        if bundles:
            b = bundles[0]
            recs.append({
                "id": 1,
                "category": "Menu Optimisation",
                "severity": "high",
                "icon": "TrendingUp",
                "iconBg": "bg-blue-100",
                "iconColor": "text-blue-600",
                "title": f"Create '{b['name']}'",
                "description": (
                    f"Market basket analysis shows {b['confidence']:.0f}% of customers "
                    f"who buy {b['items'][0]} also buy {b['items'][1]} "
                    f"(lift: {b['lift']:.1f}x). Bundling them boosts average order value."
                ),
                "recommendation": (
                    f"Launch a combo deal for '{b['items'][0]} + {b['items'][1]}'. "
                    "Offer a 5-10% discount vs. buying separately to drive uptake."
                ),
                "impact": "High",
                "effort": "Low",
                "roi": "+15-25% on combo items",
                "actions": ["Add combo to menu", "Highlight on board", "Train staff to suggest"],
            })

        # Rec 2 — top item upsell
        top_items = result.get("top_items", [])
        if top_items:
            ti = top_items[0]
            # Find a complementary item from rules
            companion = next(
                (r["consequent"] for r in rules if r["antecedent"] == ti["item"]),
                top_items[1]["item"] if len(top_items) > 1 else "a side dish"
            )
            recs.append({
                "id": 2,
                "category": "Revenue Optimisation",
                "severity": "medium",
                "icon": "DollarSign",
                "iconBg": "bg-green-100",
                "iconColor": "text-green-600",
                "title": f"Upsell {companion} with {ti['item']} orders",
                "description": (
                    f"{ti['item']} appears in {ti['pct']:.0f}% of transactions. "
                    f"Pairing it with {companion} is a natural upsell opportunity."
                ),
                "recommendation": (
                    f"Train staff to suggest '{companion}' whenever '{ti['item']}' is ordered."
                ),
                "impact": "Medium",
                "effort": "Low",
                "roi": "+8-12% per order",
                "actions": ["Staff briefing", "POS prompt", "Weekly review"],
            })

        # Rec 3 — cross-sell rate
        csr = result.get("cross_sell_rate", 0)
        recs.append({
            "id": 3,
            "category": "Customer Experience",
            "severity": "medium",
            "icon": "Users",
            "iconBg": "bg-purple-100",
            "iconColor": "text-purple-600",
            "title": "Improve Multi-Item Purchase Rate",
            "description": (
                f"Currently {csr:.0f}% of customers buy 2+ items in one visit. "
                "Increasing this by just 5% significantly lifts daily revenue."
            ),
            "recommendation": (
                "Display 'Goes well with…' signage next to your top 3 items. "
                "Offer a small loyalty incentive for orders with 3+ items."
            ),
            "impact": "Medium",
            "effort": "Low",
            "roi": "+5-10% daily revenue",
            "actions": ["Create pairing signage", "Update menu layout", "Introduce loyalty card"],
        })

    return {"recommendations": recs}
