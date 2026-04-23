import os
import re
import sys
import pandas as pd
from fastapi import APIRouter, Depends
from typing import List, Dict
from pydantic import BaseModel
from routers.auth_utils import get_current_shop

class ReviewRequest(BaseModel):
    text: str

# Setup paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

router = APIRouter()


def _safe_shop_name(shop: str) -> str:
    return re.sub(r'[^\w\s-]', '', shop).strip().replace(' ', '_').lower()


def _get_shop_csv(shop: str) -> str:
    """Returns path to the shop-specific classified_reviews.csv."""
    safe = _safe_shop_name(shop)
    return os.path.join(ROOT_DIR, "sentiment_model", "shops", safe, "classified_reviews.csv")


def load_reviews(shop: str):
    csv_path = _get_shop_csv(shop)
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path)
            # Only override to Neutral when model is truly uncertain (very tight threshold)
            if not df.empty and all(c in df.columns for c in ['pos_score', 'neg_score', 'predicted_sentiment']):
                mask = (df['pos_score'] - df['neg_score']).abs() < 0.05
                df.loc[mask, 'predicted_sentiment'] = 'Neutral'
            return df
        except Exception as e:
            print(f"Error loading reviews for {shop}: {e}")
    return pd.DataFrame()


def _log_sentiment_stats(df: pd.DataFrame, shop: str, endpoint: str):
    if df.empty:
        return
    total = len(df)
    pos = (df["predicted_sentiment"] == "Positive").sum()
    neu = (df["predicted_sentiment"] == "Neutral").sum()
    neg = (df["predicted_sentiment"] == "Negative").sum()
    avg_conf = round(df["confidence"].mean() * 100, 1) if "confidence" in df.columns else "N/A"
    print(f"\n{'='*60}")
    print(f"📊  [Sentiment/{endpoint}] Shop: {shop}")
    print(f"    Total reviews : {total}")
    print(f"    Positive      : {pos} ({round(pos/max(1,total)*100,1)}%)")
    print(f"    Neutral       : {neu} ({round(neu/max(1,total)*100,1)}%)")
    print(f"    Negative      : {neg} ({round(neg/max(1,total)*100,1)}%)")
    print(f"    Avg confidence: {avg_conf}%")
    print(f"{'='*60}\n")


@router.get("/reviews")
def get_reviews(
    query: str = None,
    sentiment: str = None,
    limit: int = 50,
    shop: str = Depends(get_current_shop)
):
    df = load_reviews(shop)
    if df.empty:
        return []

    if query:
        df = df[df["Review"].str.contains(query, case=False, na=False)]

    if sentiment:
        df = df[df["predicted_sentiment"].str.lower() == sentiment.lower()]

    if not df.empty and "Timestamp" in df.columns:
        df["Timestamp"] = pd.to_datetime(df["Timestamp"], errors="coerce")
        df = df.sort_values(by="Timestamp", ascending=False)

    if not df.empty and "Review" in df.columns:
        df = df.drop_duplicates(subset=["Review"], keep="first")

    df = df.head(limit).fillna("")

    reviews = []
    for i, row in df.iterrows():
        reviews.append({
            "id":        str(i),
            "customer":  row.get("Name", f"Customer {i}"),
            "rating":    int(row.get("Rating", 3)),
            "sentiment": row.get("predicted_sentiment", "Neutral"),
            "text":      row.get("Review", ""),
            "date":      row["Timestamp"].strftime("%Y-%m-%d") if isinstance(row.get("Timestamp"), pd.Timestamp) else "Recently"
        })
    return reviews


@router.get("/summary")
def get_sentiment_summary(
    word: str = None,
    shop: str = Depends(get_current_shop)
):
    df = load_reviews(shop)
    if df.empty:
        return {"error": f"No review data found for {shop}. Please upload a review CSV first."}

    _log_sentiment_stats(df, shop, "summary")

    if word:
        df = df[df["Review"].str.contains(word, case=False, na=False)]
        if df.empty:
            return {
                "overview": {"positive": 0, "neutral": 0, "negative": 0, "positive_change": 0, "neutral_change": 0, "negative_change": 0},
                "trendData": [],
                "recentReviews": [],
                "wordCloud": []
            }

    total = len(df)
    pos = len(df[df["predicted_sentiment"] == "Positive"])
    neu = len(df[df["predicted_sentiment"] == "Neutral"])
    neg = len(df[df["predicted_sentiment"] == "Negative"])

    # Trend data
    trendData = []
    if "Timestamp" in df.columns:
        df_trend = df.copy()
        df_trend["Timestamp"] = pd.to_datetime(df_trend["Timestamp"], errors="coerce")
        df_trend["month"] = df_trend["Timestamp"].dt.strftime("%b")
        trend_groups = df_trend.groupby(["month", "predicted_sentiment"]).size().unstack(fill_value=0)
        from calendar import month_abbr
        month_dict = {m: i for i, m in enumerate(month_abbr) if m}
        valid_months = sorted([m for m in trend_groups.index if m in month_dict], key=lambda x: month_dict[x])
        for m in valid_months:
            row = trend_groups.loc[m]
            trendData.append({
                "date":     m,
                "positive": int(row.get("Positive", 0)),
                "neutral":  int(row.get("Neutral", 0)),
                "negative": int(row.get("Negative", 0))
            })

    # Recent reviews
    limit = 50 if word else 10
    recent = []
    if not df.empty and "Timestamp" in df.columns:
        df_recent = df.copy()
        df_recent["Timestamp"] = pd.to_datetime(df_recent["Timestamp"], errors="coerce")
        recent_df = df_recent.sort_values("Timestamp", ascending=False).head(limit).fillna("")
        for i, row in recent_df.iterrows():
            recent.append({
                "id":        str(i),
                "customer":  row.get("Name", f"Customer {i}"),
                "rating":    int(row.get("Rating", 3)),
                "sentiment": row.get("predicted_sentiment", "Neutral"),
                "text":      row.get("Review", ""),
                "date":      row["Timestamp"].strftime("%Y-%m-%d") if isinstance(row.get("Timestamp"), pd.Timestamp) else "Recently"
            })

    # Word cloud
    import re as _re
    from collections import Counter
    stopwords = {"overall", "place", "here", "also", "just", "because", "this", "that", "there", "i", "a", "an", "the", "and", "but", "if", "or", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "don", "should", "now", "is", "was", "are", "it", "ngl", "think", "really", "very"}
    words = []
    if "Review" in df.columns:
        all_text = " ".join(df["Review"].dropna().astype(str).tolist()).lower()
        all_words = _re.findall(r'\b[a-z]{4,}\b', all_text)
        filtered_words = [w for w in all_words if w not in stopwords]
        word_counts = Counter(filtered_words).most_common(20)
        if word_counts:
            max_c = word_counts[0][1]
            min_c = word_counts[-1][1]
            for w, c in word_counts:
                size = 20 + ((c - min_c) / max(1, max_c - min_c)) * 30
                words.append({"text": w.capitalize(), "size": int(size)})

    pos_pct = round(pos / total * 100, 1) if total else 0
    neu_pct = round(neu / total * 100, 1) if total else 0
    neg_pct = round(neg / total * 100, 1) if total else 0

    return {
        "overview": {
            "positive":        pos_pct,
            "neutral":         neu_pct,
            "negative":        neg_pct,
            "positive_change": 2,
            "neutral_change":  -1,
            "negative_change": -1,
        },
        "trendData":     trendData,
        "recentReviews": recent,
        "wordCloud":     words,
    }


@router.get("/aspects")
def get_aspect_analysis(shop: str = Depends(get_current_shop)):
    df = load_reviews(shop)
    if df.empty:
        return {"error": f"No review data found for {shop}. Please upload a review CSV first."}

    _log_sentiment_stats(df, shop, "aspects")

    from services.nlp_service import extract_aspects
    aspect_counts = {
        "Food":     {"positive": 0, "neutral": 0, "negative": 0},
        "Service":  {"positive": 0, "neutral": 0, "negative": 0},
        "Pricing":  {"positive": 0, "neutral": 0, "negative": 0},
        "Ambience": {"positive": 0, "neutral": 0, "negative": 0},
    }

    for _, row in df.iterrows():
        review = str(row.get("Review", ""))
        sent = row.get("predicted_sentiment", "Neutral").lower()
        if sent not in ["positive", "neutral", "negative"]:
            sent = "neutral"
        for a in extract_aspects(review):
            if a in aspect_counts:
                aspect_counts[a][sent] += 1

    aspectData = [
        {"aspect": aspect, **counts}
        for aspect, counts in aspect_counts.items()
    ]

    # Top phrases — match keywords that actually appear in real reviews
    top_pos_phrases = []
    top_neg_phrases = []
    POS_KW = ["like", "love", "great", "good", "excellent", "amazing", "best", "nice",
              "tasty", "delicious", "fresh", "clean", "recommend", "pocket", "value",
              "hygienic", "perfect", "outstanding", "comfort", "goated", "fast",
              "friendly", "quick", "well", "consistent", "flavour", "flavourful"]
    NEG_KW = ["overpriced", "expensive", "hygiene", "unhygienic", "dirty", "not clean",
              "slow", "rude", "bad", "sick", "flies", "not good", "not impressed",
              "not available", "not fresh", "bland", "stale", "never", "na",
              "cold food", "wrong", "delay", "average", "okayish", "limited"]
    for _, row in df.iterrows():
        review = str(row.get("Review", "")).lower()
        sent = row.get("predicted_sentiment", "")
        if sent == "Positive":
            for kw in POS_KW:
                if kw in review:
                    top_pos_phrases.append(f"good {kw}")
        elif sent == "Negative":
            for kw in NEG_KW:
                if kw in review:
                    top_neg_phrases.append(f"{kw} issue")

    from collections import Counter
    pos_counter = Counter(top_pos_phrases).most_common(5)
    neg_counter = Counter(top_neg_phrases).most_common(5)

    total_aspects = sum(sum(c.values()) for c in aspect_counts.values())
    total_pos = sum(c["positive"] for c in aspect_counts.values())

    return {
        "aspectData":          aspectData,
        "overallSatisfaction": int((total_pos / max(1, total_aspects)) * 100),
        "totalAspects":        4,
        "topPhrases": {
            "positive": [{"phrase": p, "count": c} for p, c in pos_counter],
            "negative": [{"phrase": p, "count": c} for p, c in neg_counter],
        },
    }


@router.post("/predict")
def predict_sentiment_live(req: ReviewRequest):
    from services.nlp_service import get_predictor, extract_aspects
    predictor = get_predictor()
    if not predictor:
        return {"error": "Model not available"}

    result = predictor.predict(req.text)

    if abs(result["scores"]["Positive"] - result["scores"]["Negative"]) < 0.2:
        result["sentiment"] = "Neutral"

    aspects = extract_aspects(req.text)
    print(f"🔍  Live predict: '{req.text[:60]}...' → {result['sentiment']} ({round(result['confidence']*100,1)}%)")

    return {
        "text":       req.text,
        "sentiment":  result["sentiment"],
        "confidence": result["confidence"],
        "scores":     result["scores"],
        "aspects":    aspects,
    }
