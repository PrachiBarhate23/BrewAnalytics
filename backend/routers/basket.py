from fastapi import APIRouter
import pandas as pd
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(BACKEND_DIR, "data")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

RULES_CSV = os.path.join(DATA_DIR, "basket_rules.csv")

router = APIRouter()
router_recs = APIRouter()

DEFAULT_RULES = [
  {"antecedent": "Cappuccino", "consequent": "Croissant", "support": 0.35, "confidence": 0.68, "lift": 1.8},
  {"antecedent": "Latte", "consequent": "Muffin", "support": 0.28, "confidence": 0.62, "lift": 1.6},
  {"antecedent": "Espresso", "consequent": "Biscotti", "support": 0.22, "confidence": 0.58, "lift": 1.5},
  {"antecedent": "Croissant", "consequent": "Orange Juice", "support": 0.31, "confidence": 0.55, "lift": 1.4},
  {"antecedent": "Bagel", "consequent": "Cream Cheese", "support": 0.25, "confidence": 0.85, "lift": 2.1},
]

def load_or_create_rules():
    if not os.path.exists(RULES_CSV):
        df = pd.DataFrame(DEFAULT_RULES)
        df.to_csv(RULES_CSV, index=False)
        return DEFAULT_RULES
    else:
        df = pd.read_csv(RULES_CSV)
        return df.to_dict('records')

@router.get("/rules")
def get_basket_rules():
    rules = load_or_create_rules()
    return {"rules": rules}

@router_recs.get("/")
def get_recommendations():
    recommendations = [
      {
        "id": 1,
        "category": "Revenue Optimization",
        "severity": "high",
        "icon": "AlertTriangle",
        "iconBg": "bg-red-100",
        "iconColor": "text-red-600",
        "title": "Weekday Evening Revenue Drop Alert",
        "description": "Sales data shows a 12% decline in weekday evening revenue (5-8 PM) compared to last month. Customer traffic decreased by 18% during this period.",
        "recommendation": "Implement a 'Happy Hour' promotion offering 10% discount on beverages during 5-7 PM weekdays. Expected revenue increase: +$2,400/month.",
        "impact": "High",
        "effort": "Low",
        "roi": "+$2.4K/month",
        "actions": ["Create promotion campaign", "Update menu boards", "Train staff on new offers"]
      },
      {
        "id": 2,
        "category": "Inventory Management",
        "severity": "high",
        "icon": "Package",
        "iconBg": "bg-orange-100",
        "iconColor": "text-orange-600",
        "title": "Croissant Inventory Running Low",
        "description": "Current inventory levels are critically low. Based on demand forecast, stockout risk is 85% within 48 hours. High demand expected this weekend.",
        "recommendation": "Immediate restock of 200 units recommended. Consider increasing safety stock levels by 25% to prevent future stockouts.",
        "impact": "High",
        "effort": "Low",
        "roi": "Prevent $800 lost revenue",
        "actions": ["Contact supplier immediately", "Place emergency order", "Adjust reorder points"]
      },
      {
        "id": 3,
        "category": "Menu Optimization",
        "severity": "medium",
        "icon": "TrendingUp",
        "iconBg": "bg-blue-100",
        "iconColor": "text-blue-600",
        "title": "Create Coffee + Croissant Combo",
        "description": "Market basket analysis reveals 68% of customers who buy Cappuccino also purchase Croissants. This is the strongest product association in your menu.",
        "recommendation": "Launch a 'Morning Starter' combo bundling Cappuccino + Croissant at $10.99 (vs $12.50 separate). Projected to increase combo sales by 24%.",
        "impact": "Medium",
        "effort": "Low",
        "roi": "+$1.8K/month",
        "actions": ["Design combo offer", "Update POS system", "Create marketing materials"]
      },
      {
        "id": 4,
        "category": "Pricing Strategy",
        "severity": "medium",
        "icon": "DollarSign",
        "iconBg": "bg-green-100",
        "iconColor": "text-green-600",
        "title": "Espresso Underpriced vs Market",
        "description": "Competitor analysis shows your Espresso is priced 15% below market average despite receiving the highest quality ratings (4.8/5).",
        "recommendation": "Increase Espresso price from $3.50 to $3.99 (14% increase). Quality perception supports premium pricing. Minimal impact on demand expected.",
        "impact": "Medium",
        "effort": "Low",
        "roi": "+$980/month",
        "actions": ["Update pricing", "Emphasize quality in marketing", "Monitor customer response"]
      },
      {
        "id": 5,
        "category": "Customer Experience",
        "severity": "medium",
        "icon": "Users",
        "iconBg": "bg-purple-100",
        "iconColor": "text-purple-600",
        "title": "Service Speed Improvement Needed",
        "description": "Sentiment analysis shows 18% of recent reviews mention slow service during lunch rush (12-2 PM). Average wait time: 8.5 minutes vs target 5 minutes.",
        "recommendation": "Add 1 additional staff member during peak lunch hours. Implement mobile order-ahead system to reduce in-store wait times.",
        "impact": "High",
        "effort": "Medium",
        "roi": "Improve satisfaction +12%",
        "actions": ["Hire part-time staff", "Implement mobile ordering", "Optimize workflow"]
      },
      {
        "id": 8,
        "category": "Risk Alert",
        "severity": "high",
        "icon": "AlertTriangle",
        "iconBg": "bg-red-100",
        "iconColor": "text-red-600",
        "title": "Negative Review Spike Detected",
        "description": "Negative sentiment increased by 45% in the past week. Primary complaints: coffee temperature (12 mentions) and slow service (8 mentions).",
        "recommendation": "Immediate action required: Check espresso machine calibration, retrain baristas on temperature standards, and increase lunch staff.",
        "impact": "High",
        "effort": "Low",
        "roi": "Prevent reputation damage",
        "actions": ["Equipment check", "Staff retraining", "Respond to reviews"]
      }
    ]
    return {"recommendations": recommendations}
