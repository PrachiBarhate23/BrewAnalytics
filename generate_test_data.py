"""
generate_test_data.py
=====================
Generates per-shop test datasets:
  - 9x sentiment test CSVs  → sentiment_model/shops/<shop>/test_reviews_<shop>.csv
  - 9x sales test CSVs      → sales_model/test_data/<shop>_sales_test.csv

Run from the project root:
    python generate_test_data.py
"""

import os
import re
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

SHOPS = [
    "Vrindavan",
    "Cluckins",
    "Amar Frankie",
    "Manchurian Shop",
    "Shawarma Shop",
    "Juice Center",
    "SPJIMR Mess",
    "College Canteen Ground Floor",
    "College Canteen 3rd Floor",
]

def safe_name(shop: str) -> str:
    return re.sub(r'[^\w\s-]', '', shop).strip().replace(' ', '_').lower()


# ─── Sentiment Test Data ───────────────────────────────────────────────────────

def generate_sentiment_test_data():
    source_csv = os.path.join(ROOT_DIR, "sentiment_model", "extended_reviews.csv")
    if not os.path.exists(source_csv):
        print(f"[ERROR] Source CSV not found: {source_csv}")
        return

    df = pd.read_csv(source_csv)
    print(f"[INFO] Loaded {len(df)} reviews from extended_reviews.csv")

    for shop in SHOPS:
        safe = safe_name(shop)
        shop_dir = os.path.join(ROOT_DIR, "sentiment_model", "shops", safe)
        os.makedirs(shop_dir, exist_ok=True)

        shop_df = df[df["Shop"] == shop].copy()

        # Take up to 20 reviews; if fewer, supplement with all available
        n = min(20, len(shop_df))
        if n < 5:
            print(f"  [WARN] Only {n} real reviews found for {shop}, using all")
        sample = shop_df.sample(n=n, random_state=42) if n > 0 else shop_df

        # Keep only needed columns
        cols = [c for c in ["Timestamp", "Name", "Year", "Shop", "Rating", "Review"] if c in sample.columns]
        sample = sample[cols]

        # Save as test CSV
        out_path = os.path.join(shop_dir, f"test_reviews_{safe}.csv")
        sample.to_csv(out_path, index=False)
        print(f"  [OK] {shop}: {n} reviews saved")


# ─── Sales Test Data ───────────────────────────────────────────────────────────

ITEMS_BY_SHOP = {
    "Vrindavan":                    ["Dosa", "Pav Bhaji", "Aloo Paratha", "Sizzling Brownie", "Thali"],
    "Cluckins":                     ["Chicken Burger", "Crispy Wings", "Chicken Roll", "Fries", "Combo Meal"],
    "Amar Frankie":                 ["Veg Frankie", "Egg Frankie", "Paneer Frankie", "Aloo Frankie", "Special Frankie"],
    "Manchurian Shop":              ["Manchurian", "Bhaji Pav", "Manchow Soup", "Noodles", "Fried Rice"],
    "Shawarma Shop":                ["Chicken Shawarma", "Falafel Wrap", "Double Shawarma", "Shawarma Plate", "Combo"],
    "Juice Center":                 ["Cold Coffee", "Fresh Juice", "Oreo Shake", "Mango Shake", "Ganga Jamuna Saraswati"],
    "SPJIMR Mess":                  ["Full Thali", "Mini Pizza", "Brownie", "Pasta", "Rajma Rice"],
    "College Canteen Ground Floor": ["Tea", "Coffee", "Poha", "Misal Pav", "Chaat"],
    "College Canteen 3rd Floor":    ["Sandwich", "Cold Coffee", "Ice Cream", "Misal Pav", "Slice Pizza"],
}

def generate_sales_test_data():
    test_dir = os.path.join(ROOT_DIR, "sales_model", "test_data")
    os.makedirs(test_dir, exist_ok=True)

    # Try to load actual data to derive realistic revenue ranges per shop
    main_csv = os.path.join(ROOT_DIR, "sales_model", "sales_data.csv")
    real_stats = {}
    if os.path.exists(main_csv):
        df_main = pd.read_csv(main_csv)
        if "outlet" in df_main.columns and "revenue" in df_main.columns:
            grouped = df_main.groupby("outlet")["revenue"]
            for shop in SHOPS:
                if shop in grouped.groups:
                    stats = grouped.get_group(shop).describe()
                    real_stats[shop] = {
                        "mean": float(stats["mean"]),
                        "std":  float(stats["std"]),
                    }

    for shop in SHOPS:
        safe   = safe_name(shop)
        items  = ITEMS_BY_SHOP.get(shop, ["Item A", "Item B", "Item C"])
        stats  = real_stats.get(shop, {"mean": 3000, "std": 500})
        mean_r = stats["mean"]
        std_r  = stats["std"]

        rows = []
        base_date = datetime.now() - timedelta(days=60)

        for i in range(60):
            date = base_date + timedelta(days=i)
            dow  = date.weekday()
            is_weekend = 1 if dow >= 5 else 0

            # Realistic revenue with weekly pattern
            rev = max(500, int(np.random.normal(mean_r, std_r) * (1.2 if is_weekend else 1.0)))
            txn = max(10, int(rev / random.uniform(55, 75)))
            aov = round(rev / max(1, txn), 1)

            for item in items:
                item_qty = max(1, int(txn * random.uniform(0.05, 0.25)))
                item_price = aov * random.uniform(0.7, 1.4)
                rows.append({
                    "date":             date.strftime("%Y-%m-%d"),
                    "outlet":           shop,
                    "revenue":          rev,
                    "transactions":     txn,
                    "avg_order_value":  aov,
                    "item":             item,
                    "item_quantity":    item_qty,
                    "item_revenue":     round(item_qty * item_price, 2),
                    "demand_index":     random.randint(50, 100),
                    "day_name":         date.strftime("%A"),
                    "is_weekend":       is_weekend,
                })

        out_path = os.path.join(test_dir, f"{safe}_sales_test.csv")
        pd.DataFrame(rows).to_csv(out_path, index=False)
        print(f"  [OK] {shop}: 60 days x {len(items)} items saved")


# ─── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "="*60)
    print(">> Generating Sentiment Test Data (per-shop review CSVs)")
    print("="*60)
    generate_sentiment_test_data()

    print("\n" + "="*60)
    print(">> Generating Sales Test Data (per-shop 60-day CSVs)")
    print("="*60)
    generate_sales_test_data()

    print("\n[DONE] All test datasets generated successfully!")
    print("     Sentiment: sentiment_model/shops/<shop>/test_reviews_<shop>.csv")
    print("     Sales:     sales_model/test_data/<shop>_sales_test.csv\n")
