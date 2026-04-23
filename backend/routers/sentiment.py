import os
import sys
import pandas as pd
from fastapi import APIRouter
from typing import List, Dict
from pydantic import BaseModel

class ReviewRequest(BaseModel):
    text: str

# Setup paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

CLASSIFIED_CSV = os.path.join(ROOT_DIR, "sentiment_model", "classified_reviews.csv")

router = APIRouter()

def load_reviews():
    if os.path.exists(CLASSIFIED_CSV):
        try:
            df = pd.read_csv(CLASSIFIED_CSV)
            # Both side analysis: If the difference between Positive and Negative scores is small, 
            # it's likely a mixed/neutral review. This is more accurate than a simple confidence threshold.
            if not df.empty and all(col in df.columns for col in ['pos_score', 'neg_score', 'predicted_sentiment']):
                # If difference between Positive and Negative is less than 0.2, consider it Neutral/Mixed
                mask = (df['pos_score'] - df['neg_score']).abs() < 0.2
                df.loc[mask, 'predicted_sentiment'] = 'Neutral'
            elif not df.empty and 'confidence' in df.columns and 'predicted_sentiment' in df.columns:
                # Fallback for old CSVs: use a slightly more conservative threshold than before
                df.loc[df['confidence'] < 0.35, 'predicted_sentiment'] = 'Neutral'
            return df
        except Exception as e:
            print(f"Error loading classified reviews: {e}")
    return pd.DataFrame()

@router.get("/reviews")
def get_reviews(query: str = None, sentiment: str = None, limit: int = 50):
    df = load_reviews()
    if df.empty: return []
    
    # Filter by phrase or word
    if query:
        df = df[df["Review"].str.contains(query, case=False, na=False)]
    
    if sentiment:
        df = df[df["predicted_sentiment"].str.lower() == sentiment.lower()]
        
    # Sort and take head
    if not df.empty and "Timestamp" in df.columns:
        df["Timestamp"] = pd.to_datetime(df["Timestamp"], errors="coerce")
        df = df.sort_values(by="Timestamp", ascending=False)
    
    df = df.head(limit).fillna("")
    
    reviews = []
    for i, row in df.iterrows():
        reviews.append({
            "id": str(i),
            "customer": row.get("Name", f"Customer {i}"),
            "rating": int(row.get("Rating", 3)),
            "sentiment": row.get("predicted_sentiment", "Neutral"),
            "text": row.get("Review", ""),
            "date": row["Timestamp"].strftime("%Y-%m-%d") if isinstance(row["Timestamp"], pd.Timestamp) else "Recently"
        })
    return reviews

@router.get("/summary")
def get_sentiment_summary(word: str = None):
    df = load_reviews()
    if df.empty:
        return {"error": "No data available"}
    
    # Filter by word if provided
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

    # Real Trend Data from Timestamps
    trendData = []
    if "Timestamp" in df.columns:
        # Create a copy to avoid SettingWithCopyWarning if filtered
        df_trend = df.copy()
        df_trend["Timestamp"] = pd.to_datetime(df_trend["Timestamp"], errors="coerce")
        df_trend["month"] = df_trend["Timestamp"].dt.strftime("%b")
        trend_groups = df_trend.groupby(["month", "predicted_sentiment"]).size().unstack(fill_value=0)
        
        from calendar import month_abbr
        month_dict = {m: i for i, m in enumerate(month_abbr) if m}
        valid_months = [m for m in trend_groups.index if m in month_dict]
        valid_months.sort(key=lambda x: month_dict[x])
        
        for m in valid_months:
            row = trend_groups.loc[m]
            trendData.append({
                "date": m,
                "positive": int(row.get("Positive", 0)),
                "neutral": int(row.get("Neutral", 0)),
                "negative": int(row.get("Negative", 0))
            })

    # Real Recent Reviews
    limit = 50 if word else 10
    recent = []
    if not df.empty and "Timestamp" in df.columns:
        # Create a copy for recent reviews
        df_recent = df.copy()
        df_recent["Timestamp"] = pd.to_datetime(df_recent["Timestamp"], errors="coerce")
        recent_df = df_recent.sort_values(by="Timestamp", ascending=False).head(limit).fillna("")
        for i, row in recent_df.iterrows():
            recent.append({
                "id": str(i),
                "customer": row.get("Name", f"Customer {i}"),
                "rating": int(row.get("Rating", 3)),
                "sentiment": row.get("predicted_sentiment", "Neutral"),
                "text": row.get("Review", ""),
                "date": row["Timestamp"].strftime("%Y-%m-%d") if isinstance(row["Timestamp"], pd.Timestamp) else str(row.get("Timestamp", "Recently"))
            })

    # Word Cloud Generation
    import re
    from collections import Counter
    stopwords = {"overall", "place", "here", "also", "just", "because", "this", "that", "there", "i", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "is", "was", "are"}
    
    words = []
    if "Review" in df.columns:
        all_text = " ".join(df["Review"].dropna().astype(str).tolist()).lower()
        all_words = re.findall(r'\b[a-z]{4,}\b', all_text)
        filtered_words = [w for w in all_words if w not in stopwords]
        word_counts = Counter(filtered_words).most_common(20)
        
        if word_counts:
            max_c = word_counts[0][1]
            min_c = word_counts[-1][1]
            for w, c in word_counts:
                # Scale between 20 and 50 font size
                size = 20 + ((c - min_c) / max(1, max_c - min_c)) * 30
                words.append({"text": w.capitalize(), "size": int(size)})

    # Use rounded floats instead of int() to avoid 0% for small non-zero values
    pos_pct = round(pos / total * 100, 1) if total else 0
    neu_pct = round(neu / total * 100, 1) if total else 0
    neg_pct = round(neg / total * 100, 1) if total else 0

    return {
        "overview": {
            "positive": pos_pct,
            "neutral": neu_pct,
            "negative": neg_pct,
            "positive_change": 2, # Simulated
            "neutral_change": -1,
            "negative_change": -1
        },
        "trendData": trendData,
        "recentReviews": recent,
        "wordCloud": words
    }

@router.get("/aspects")
def get_aspect_analysis():
    df = load_reviews()
    if df.empty:
        return {"error": "No data available"}
    
    # We will compute aspect sentiments on the fly from the classified dataset
    from services.nlp_service import extract_aspects
    
    aspect_counts = {
        "Food": {"positive": 0, "neutral": 0, "negative": 0},
        "Service": {"positive": 0, "neutral": 0, "negative": 0},
        "Pricing": {"positive": 0, "neutral": 0, "negative": 0},
        "Ambience": {"positive": 0, "neutral": 0, "negative": 0}
    }

    for _, row in df.iterrows():
        review = str(row.get("Review", ""))
        sent = row.get("predicted_sentiment", "Neutral").lower()
        if sent not in ["positive", "neutral", "negative"]:
            sent = "neutral"
            
        aspects = extract_aspects(review)
        for a in aspects:
            if a in aspect_counts:
                aspect_counts[a][sent] += 1
                
    aspectData = []
    for aspect, counts in aspect_counts.items():
        aspectData.append({
            "aspect": aspect,
            "positive": counts["positive"],
            "neutral": counts["neutral"],
            "negative": counts["negative"]
        })

    # Extract top phrases (simulation based on aspect keywords presence)
    from services.nlp_service import ASPECT_KEYWORDS
    # For a real implementation, we would extract n-grams. Here we just count keyword hits.
    top_pos_phrases = []
    top_neg_phrases = []
    
    for _, row in df.iterrows():
        review = str(row.get("Review", "")).lower()
        sent = row.get("predicted_sentiment", "")
        if sent == "Positive":
            for kw in ["taste", "delicious", "friendly", "fast", "cozy", "clean"]:
                if kw in review: top_pos_phrases.append(f"good {kw}")
        elif sent == "Negative":
            for kw in ["slow", "expensive", "rude", "dirty", "cold", "bland"]:
                if kw in review: top_neg_phrases.append(f"{kw} issue")

    from collections import Counter
    pos_counter = Counter(top_pos_phrases).most_common(5)
    neg_counter = Counter(top_neg_phrases).most_common(5)

    return {
        "aspectData": aspectData,
        "overallSatisfaction": int((sum(c["positive"] for c in aspect_counts.values()) / max(1, sum(sum(c.values()) for c in aspect_counts.values()))) * 100),
        "totalAspects": 4, # The 4 primary aspects
        "topPhrases": {
            "positive": [{"phrase": p, "count": c} for p, c in pos_counter],
            "negative": [{"phrase": p, "count": c} for p, c in neg_counter]
        }
    }

@router.post("/predict")
def predict_sentiment_live(req: ReviewRequest):
    from services.nlp_service import get_predictor, extract_aspects
    predictor = get_predictor()
    if not predictor:
        return {"error": "Model not available"}
    
    result = predictor.predict(req.text)
    
    # Both side analysis: if diff between pos and neg is small, treat as Neutral
    if abs(result["scores"]["Positive"] - result["scores"]["Negative"]) < 0.2:
        result["sentiment"] = "Neutral"
        
    aspects = extract_aspects(req.text)
    
    return {
        "text": req.text,
        "sentiment": result["sentiment"],
        "confidence": result["confidence"],
        "scores": result["scores"],
        "aspects": aspects
    }
