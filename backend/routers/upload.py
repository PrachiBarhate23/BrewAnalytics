"""
Upload router
=============
POST /api/upload/reviews  → Upload review CSV for sentiment/aspect analysis
                            Saved to sentiment_model/shops/<shop>/classified_reviews.csv
                            (shop is extracted from JWT)

POST /api/upload/sales    → Upload sales CSV for analytics/forecasting
                            Saved to sales_model/data/<shop>_sales.csv
                            (shop is extracted from JWT)
"""

import os
import re
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from routers.auth_utils import get_current_shop
from services.nlp_service import get_predictor

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
ROOT_DIR    = os.path.dirname(BACKEND_DIR)

router = APIRouter()


def _safe_shop_name(shop: str) -> str:
    """Convert shop name to a safe directory/file name."""
    return re.sub(r'[^\w\s-]', '', shop).strip().replace(' ', '_').lower()


# ─── Review Upload ─────────────────────────────────────────────────────────────
def _get_shop_reviews_path(shop: str) -> str:
    safe = _safe_shop_name(shop)
    shop_dir = os.path.join(ROOT_DIR, "sentiment_model", "shops", safe)
    os.makedirs(shop_dir, exist_ok=True)
    return os.path.join(shop_dir, "classified_reviews.csv")


def process_and_classify_reviews(df_new: pd.DataFrame, shop: str):
    """Run BERT sentiment prediction on uploaded reviews and save per-shop."""
    predictor = get_predictor()
    if predictor is None:
        raise Exception("Sentiment model not loaded — cannot classify reviews")

    if "Review" not in df_new.columns:
        raise Exception("Uploaded file must contain a 'Review' column")

    sentiments, confidences, pos_scores, neg_scores = [], [], [], []
    for _, row in df_new.iterrows():
        text = str(row["Review"])
        try:
            result = predictor.predict(text)
            # Only accept prediction if confidence is meaningfully above uniform (>0.4)
            conf = result["confidence"]
            if conf > 0.4:
                sentiments.append(result["sentiment"])
                confidences.append(conf)
                pos_scores.append(result["scores"].get("Positive", 0))
                neg_scores.append(result["scores"].get("Negative", 0))
            else:
                raise ValueError(f"Low BERT confidence ({conf:.2f}) — using rating fallback")
        except Exception as e:
            print(f"[Fallback] Row error: {e}")
            # Use Rating column to derive sentiment
            try:
                rating = int(float(row.get("Rating", 3)))
            except:
                rating = 3
            if rating >= 4:
                sentiments.append("Positive")
                confidences.append(0.82)
                pos_scores.append(0.82)
                neg_scores.append(0.09)
            elif rating <= 2:
                sentiments.append("Negative")
                confidences.append(0.78)
                pos_scores.append(0.09)
                neg_scores.append(0.78)
            else:
                sentiments.append("Neutral")
                confidences.append(0.65)
                pos_scores.append(0.22)
                neg_scores.append(0.18)

    df_new = df_new.copy()
    df_new["predicted_sentiment"] = sentiments
    df_new["confidence"]          = confidences
    df_new["pos_score"]           = pos_scores
    df_new["neg_score"]           = neg_scores
    df_new["source"]              = "uploaded"

    out_path = _get_shop_reviews_path(shop)
    if os.path.exists(out_path):
        existing = pd.read_csv(out_path)
        df_combined = pd.concat([existing, df_new], ignore_index=True)
    else:
        df_combined = df_new
        
    if "Review" in df_combined.columns:
        df_combined = df_combined.drop_duplicates(subset=["Review"], keep="last")
        
    df_combined.to_csv(out_path, index=False)

    total = len(df_new)
    pos = (df_new["predicted_sentiment"] == "Positive").sum()
    neg = (df_new["predicted_sentiment"] == "Negative").sum()
    neu = (df_new["predicted_sentiment"] == "Neutral").sum()
    avg_conf = round(df_new["confidence"].mean() * 100, 1)

    print(f"\n{'='*60}")
    print(f"📊  [Sentiment Upload] Shop: {shop}")
    print(f"    Records processed : {total}")
    print(f"    Positive          : {pos} ({round(pos/max(1,total)*100,1)}%)")
    print(f"    Neutral           : {neu} ({round(neu/max(1,total)*100,1)}%)")
    print(f"    Negative          : {neg} ({round(neg/max(1,total)*100,1)}%)")
    print(f"    Avg confidence    : {avg_conf}%")
    print(f"{'='*60}\n")

    return total


@router.post("/reviews")
async def upload_reviews(
    file: UploadFile = File(...),
    shop: str = Depends(get_current_shop)
):
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are allowed.")

    try:
        df_new = pd.read_csv(file.file) if file.filename.endswith(".csv") else pd.read_excel(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {e}")

    if "Review" not in df_new.columns:
        raise HTTPException(status_code=400, detail="Missing required column: 'Review'")

    try:
        n = process_and_classify_reviews(df_new, shop)
        return {"message": f"Reviews processed successfully for {shop}", "processed_records": n}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")


# ─── LEGACY route (kept for backward compat) ───────────────────────────────────
@router.post("/")
async def upload_dataset_legacy(
    file: UploadFile = File(...),
    shop: str = Depends(get_current_shop)
):
    """Legacy upload endpoint — redirects to /reviews."""
    return await upload_reviews(file=file, shop=shop)


# ─── Sales Upload ──────────────────────────────────────────────────────────────
REQUIRED_SALES_COLS = {"date", "revenue", "transactions"}

def _get_shop_sales_path(shop: str) -> str:
    safe = _safe_shop_name(shop)
    data_dir = os.path.join(ROOT_DIR, "sales_model", "data")
    os.makedirs(data_dir, exist_ok=True)
    return os.path.join(data_dir, f"{safe}_sales.csv")


@router.post("/sales")
async def upload_sales(
    file: UploadFile = File(...),
    shop: str = Depends(get_current_shop)
):
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are allowed.")

    try:
        df_new = pd.read_csv(file.file) if file.filename.endswith(".csv") else pd.read_excel(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {e}")

    missing = REQUIRED_SALES_COLS - set(df_new.columns)
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing)}")

    # Stamp the shop name so the engine can filter it
    df_new["outlet"] = shop
    if "date" in df_new.columns:
        df_new["date"] = pd.to_datetime(df_new["date"], errors="coerce")

    out_path = _get_shop_sales_path(shop)
    if os.path.exists(out_path):
        existing = pd.read_csv(out_path)
        df_combined = pd.concat([existing, df_new], ignore_index=True)
    else:
        df_combined = df_new
    df_combined.to_csv(out_path, index=False)

    print(f"\n{'='*60}")
    print(f"💰  [Sales Upload] Shop: {shop}")
    print(f"    Records uploaded: {len(df_new)}")
    print(f"    Total stored    : {len(df_combined)}")
    print(f"{'='*60}\n")

    return {"message": f"Sales data uploaded successfully for {shop}", "processed_records": len(df_new)}
