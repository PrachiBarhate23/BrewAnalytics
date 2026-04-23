"""
BrewAnalytics - BERT Sentiment Prediction (Inference)
=====================================================
Loads the fine-tuned BERT model and runs sentiment predictions
on actual generated survey reviews from extended_reviews.csv.
"""

import os
import torch
import pandas as pd
import random
from transformers import BertTokenizer, BertForSequenceClassification
import warnings
warnings.filterwarnings("ignore")

# ─── Configuration ───────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, "saved_model")
DATA_FILE = os.path.join(SCRIPT_DIR, "extended_reviews.csv")
MAX_LENGTH = 128

ID2LABEL = {0: "Positive", 1: "Neutral", 2: "Negative"}
SENTIMENT_EMOJI = {"Positive": "😊", "Neutral": "😐", "Negative": "😞"}


# ─── Predictor class ────────────────────────────────────────────────────────
class SentimentPredictor:
    """Loads a fine-tuned BERT model and predicts sentiment."""

    def __init__(self, model_dir: str):
        print(f"  Loading model from: {model_dir}")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = BertTokenizer.from_pretrained(model_dir)
        self.model = BertForSequenceClassification.from_pretrained(model_dir)
        self.model = self.model.to(self.device)
        self.model.eval()
        print(f"  Model loaded on: {self.device}")

    def predict(self, text: str) -> dict:
        # Ensure text is string and handle NaN values
        clean_text = str(text) if pd.notna(text) else ""
        if not clean_text.strip():
            clean_text = "Neutral"

        encoding = self.tokenizer.encode_plus(
            clean_text,
            add_special_tokens=True,
            max_length=MAX_LENGTH,
            padding="max_length",
            truncation=True,
            return_attention_mask=True,
            return_tensors="pt",
        )

        input_ids = encoding["input_ids"].to(self.device)
        attention_mask = encoding["attention_mask"].to(self.device)

        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)

        pred_id = torch.argmax(probs, dim=1).item()
        confidence = probs[0][pred_id].item()

        return {
            "text": text,
            "sentiment": ID2LABEL[pred_id],
            "confidence": confidence,
            "scores": {
                "Positive": probs[0][0].item(),
                "Neutral": probs[0][1].item(),
                "Negative": probs[0][2].item(),
            },
        }


def main():
    print("=" * 70)
    print("  BrewAnalytics - BERT Sentiment Prediction Demo")
    print("  (Using Data from extended_reviews.csv)")
    print("=" * 70)

    # Check if model exists
    if not os.path.exists(MODEL_DIR):
        print(f"\n  ERROR: Model not found at {MODEL_DIR}")
        print("  Run 'python train_bert_sentiment.py' first.")
        return

    # Check if dataset exists
    if not os.path.exists(DATA_FILE):
        print(f"\n  ERROR: Dataset not found at {DATA_FILE}")
        print("  Run 'python generate_synthetic_dataset.py' first.")
        return

    # Load predictor
    predictor = SentimentPredictor(MODEL_DIR)

    # Load dataset
    print(f"  Loading dataset: {DATA_FILE}")
    df = pd.read_csv(DATA_FILE)
    
    # ─── 1. General predictions on Random Sample ─────────────────────────────
    print("\n" + "=" * 70)
    print("  1. General Review Predictions (Random Sample)")
    print("=" * 70)

    # Pick 10 random reviews
    sample_df = df.sample(n=10, random_state=random.randint(1, 10000))
    
    for _, row in sample_df.iterrows():
        review = row["Review"]
        shop = row["Shop"]
        source = row["source"]
        
        result = predictor.predict(review)
        emoji = SENTIMENT_EMOJI[result["sentiment"]]
        text_display = review[:75] + "..." if len(str(review)) > 75 else str(review)
        
        print(f"\n  Shop:   {shop} [{source}]")
        print(f"  Review: \"{text_display}\"")
        print(f"  Result: {emoji} {result['sentiment']} (confidence: {result['confidence']:.2%})")
        print(f"  Scores: Pos={result['scores']['Positive']:.3f} | "
              f"Neu={result['scores']['Neutral']:.3f} | "
              f"Neg={result['scores']['Negative']:.3f}")

    # ─── 2. Shop-Based Sentiment Analysis Demo ──────────────────────────────
    print("\n" + "=" * 70)
    print("  2. Shop-Based Sentiment Analysis Demo (3 reviews per shop)")
    print("=" * 70)

    shops = df["Shop"].unique()[:5] # Take first 5 shops for demo
    
    for shop in shops:
        print(f"\n  ┌─ Shop: {shop}")
        print(f"  │")
        shop_reviews = df[df["Shop"] == shop]["Review"].dropna().sample(n=3, random_state=random.randint(1,10000)).tolist()
        for review in shop_reviews:
            result = predictor.predict(review)
            emoji = SENTIMENT_EMOJI[result["sentiment"]]
            text_disp = str(review)[:55] + "..." if len(str(review)) > 55 else str(review)
            print(f"  │  {emoji} [{result['sentiment']:>8}] ({result['confidence']:.0%}) \"{text_disp}\"")
        print(f"  └{'─' * 65}")

    print("\n  Model: bert-base-uncased (fine-tuned on BrewAnalytics Survey Data)")
    print(f"  Device: {predictor.device}")
    print("=" * 70)


if __name__ == "__main__":
    main()
