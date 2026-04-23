import os
import sys

# Add the root directory to path to import from sentiment_model
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)
sys.path.append(ROOT_DIR)

from sentiment_model.predict_sentiment import SentimentPredictor

MODEL_DIR = os.path.join(ROOT_DIR, "sentiment_model", "saved_model")
_predictor = None

def get_predictor():
    global _predictor
    if _predictor is None:
        try:
            _predictor = SentimentPredictor(MODEL_DIR)
        except Exception as e:
            print(f"Failed to load predictor: {e}")
    return _predictor

ASPECT_KEYWORDS = {
    "Food": ["taste", "tasty", "bland", "flavor", "fresh", "stale", "uncooked", "delicious", "yummy", "food", "cold food", "oily", "pastry", "coffee", "latte", "croissant"],
    "Service": ["slow", "fast", "quick", "wait", "service", "staff", "rude", "friendly", "rush", "barista"],
    "Pricing": ["expensive", "overpriced", "costly", "price", "pricing", "affordable", "cheap", "value", "worth", "pricy"],
    "Ambience": ["ambience", "atmosphere", "cozy", "noisy", "music", "crowded", "vibe", "seating", "environment", "clean", "dirty", "hygiene"]
}

def extract_aspects(text: str):
    found_aspects = []
    text_lower = str(text).lower()
    for aspect, keywords in ASPECT_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            found_aspects.append(aspect)
    # Default to Food if nothing specific is found, or return empty
    if not found_aspects:
        found_aspects.append("Food")
    return found_aspects
