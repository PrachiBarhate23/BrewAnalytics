from fastapi import APIRouter
from services.forecasting import run_polynomial_forecast, format_forecast_for_ui

router = APIRouter()

@router.get("/sales")
def get_sales_forecast():
    df, future_dates, future_preds = run_polynomial_forecast()
    chart_data = format_forecast_for_ui(df, future_dates, future_preds)
    
    # Also calculate some dynamic KPI data
    total_next_month = int(sum(future_preds))
    current_month_total = df.tail(30)["revenue"].sum()
    growth = ((total_next_month - current_month_total) / max(1, current_month_total)) * 100
    
    return {
        "forecastData": chart_data,
        "kpis": {
            "nextMonthForecast": total_next_month,
            "growthRate": round(growth, 1)
        }
    }
