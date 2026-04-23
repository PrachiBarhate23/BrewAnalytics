import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
DATA_DIR = os.path.join(BACKEND_DIR, "data")
SALES_CSV = os.path.join(DATA_DIR, "extended_sales.csv")

def generate_baseline_sales():
    """Generate extended sales dataset with temporal and category fields."""
    categories = ["Coffee", "Pastry", "Tea", "Cold Beverage", "Food"]
    regions = ["North Campus", "South Campus", "Library", "Student Union"]
    segments = ["Student", "Faculty", "Staff", "Visitor"]
    
    start_date = datetime.now() - timedelta(days=180)
    data = []
    
    base_revenue = 1500
    for i in range(180):
        date = start_date + timedelta(days=i)
        day_of_week = date.weekday() # 0-6
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Temporal features
        revenue = base_revenue + (day_of_week * 100)
        if is_weekend: revenue += 500 # Weekends are busier
        
        # Add random noise
        revenue += np.random.randint(-200, 300)
        
        # Generate some item level proxy data
        transactions = int(revenue / 12)
        
        discount = np.random.choice([0, 10, 20], p=[0.7, 0.2, 0.1])
        
        row = {
            "date": date.strftime("%Y-%m-%d"),
            "revenue": revenue,
            "transactions": transactions,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "product_category_majority": np.random.choice(categories),
            "region": np.random.choice(regions),
            "discount_pct": discount,
            "customer_segment_majority": np.random.choice(segments)
        }
        data.append(row)
        
    df = pd.DataFrame(data)
    df.to_csv(SALES_CSV, index=False)
    return df

def load_sales_data():
    if not os.path.exists(SALES_CSV):
        return generate_baseline_sales()
    return pd.read_csv(SALES_CSV)

def run_polynomial_forecast():
    """Run Polynomial Regression on Sales Data to produce forecast"""
    df = load_sales_data()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")
    
    # Feature Engineering (Temporal)
    df["day_index"] = np.arange(len(df))
    # We will use 'day_index' and 'day_of_week' for polynomial features
    X = df[["day_index", "day_of_week", "is_weekend"]].values
    y = df["revenue"].values
    
    # Polynomial features
    poly = PolynomialFeatures(degree=2, include_bias=False)
    X_poly = poly.fit_transform(X)
    
    # Train
    model = LinearRegression()
    model.fit(X_poly, y)
    
    # Predict future 30 days
    last_date = df["date"].max()
    future_dates = [last_date + timedelta(days=i) for i in range(1, 31)]
    future_day_indices = np.arange(len(df), len(df) + 30)
    future_day_of_week = [d.weekday() for d in future_dates]
    future_is_weekend = [1 if d >= 5 else 0 for d in future_day_of_week]
    
    X_future = np.array(list(zip(future_day_indices, future_day_of_week, future_is_weekend)))
    X_future_poly = poly.transform(X_future)
    future_preds = model.predict(X_future_poly)
    
    return df, future_dates, future_preds

def format_forecast_for_ui(df, future_dates, future_preds):
    # Group by month for UI chart
    df["month"] = df["date"].dt.strftime("%b")
    monthly_actual = df.groupby("month")["revenue"].sum().reset_index()
    # Sort monthly actual conceptually (Jan -> Dec)
    # Since we only have recent 180 days, it spans across ~6 months.
    
    # We'll construct a mock chart list mimicking the UI requirement
    history = []
    # Collect last few dates/months for line chart
    # Actually, the UI expects monthly actuals and forecasts
    
    # Let's aggregate actuals
    df["year_month"] = df["date"].dt.to_period("M")
    actual_grouped = df.groupby("year_month")["revenue"].sum()
    
    forecast_df = pd.DataFrame({"date": future_dates, "revenue": future_preds})
    forecast_df["year_month"] = forecast_df["date"].dt.to_period("M")
    forecast_grouped = forecast_df.groupby("year_month")["revenue"].sum()
    
    merged_data = []
    for ym in sorted(set(actual_grouped.index).union(forecast_grouped.index)):
        actual_val = actual_grouped.get(ym, None)
        forecast_val = forecast_grouped.get(ym, None)
        merged_data.append({
            "month": str(ym),
            "actual": int(actual_val) if actual_val is not None else None,
            "forecast": int(forecast_val) if forecast_val is not None else None,
            "lower": int(forecast_val * 0.9) if forecast_val else None,
            "upper": int(forecast_val * 1.1) if forecast_val else None,
        })
        
    return merged_data
