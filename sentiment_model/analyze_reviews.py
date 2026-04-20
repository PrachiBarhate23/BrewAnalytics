"""
BrewAnalytics - Analyze Reviews & Generate Seller Suggestions
=============================================================
This is the MAIN OUTPUT script. It:
1. Loads ALL reviews (real + synthetic) — NO pre-labeled sentiments
2. Uses the trained BERT model to CLASSIFY each review as Positive/Neutral/Negative
3. Shows per-shop sentiment counts and percentages
4. Generates actionable SUGGESTIONS for each seller/shop
5. Saves a full analysis report
"""

import os
import torch
import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification
from collections import Counter
import warnings
warnings.filterwarnings("ignore")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, "saved_model")
MAX_LENGTH = 128
ID2LABEL = {0: "Positive", 1: "Neutral", 2: "Negative"}

# ─── Keywords for identifying common issues in reviews ───────────────────────
ISSUE_KEYWORDS = {
    "Hygiene & Cleanliness": [
        "unhygienic", "hygiene", "dirty", "clean", "cleanliness", "filthy",
        "cockroach", "flies", "gloves", "smells", "smell", "stale", "gross",
        "unhealthy", "sanitary", "wash", "bacteria", "contaminated",
    ],
    "Food Quality": [
        "taste", "tasty", "bland", "flavor", "flavour", "fresh", "stale",
        "uncooked", "undercooked", "overcooked", "quality", "delicious",
        "yummy", "bad food", "good food", "cold food", "oily",
    ],
    "Pricing": [
        "expensive", "overpriced", "costly", "price", "pricing", "affordable",
        "cheap", "budget", "pocket", "value", "worth", "pricy", "pricey",
    ],
    "Service & Speed": [
        "slow", "fast", "quick", "wait", "waiting", "service", "staff",
        "rude", "friendly", "crowded", "packed", "rush",
    ],
    "Menu & Variety": [
        "variety", "options", "menu", "limited", "diverse", "diversity",
        "monotonous", "boring", "same", "items", "available", "stock",
    ],
    "Portion Size": [
        "portion", "small", "tiny", "huge", "filling", "quantity",
        "bharta", "enough", "generous",
    ],
}


class SentimentClassifier:
    """Loads trained BERT and classifies review text."""

    def __init__(self):
        print("  Loading trained BERT model...")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = BertTokenizer.from_pretrained(MODEL_DIR)
        self.model = BertForSequenceClassification.from_pretrained(MODEL_DIR).to(self.device)
        self.model.eval()
        print(f"  Model loaded on {self.device}")

    def classify(self, text: str) -> dict:
        enc = self.tokenizer.encode_plus(
            str(text), add_special_tokens=True, max_length=MAX_LENGTH,
            padding="max_length", truncation=True,
            return_attention_mask=True, return_tensors="pt",
        )
        with torch.no_grad():
            out = self.model(
                input_ids=enc["input_ids"].to(self.device),
                attention_mask=enc["attention_mask"].to(self.device),
            )
            probs = torch.softmax(out.logits, dim=1)
        pred_id = torch.argmax(probs, dim=1).item()
        return {
            "sentiment": ID2LABEL[pred_id],
            "confidence": probs[0][pred_id].item(),
            "pos_score": probs[0][0].item(),
            "neu_score": probs[0][1].item(),
            "neg_score": probs[0][2].item(),
        }


def extract_issues(reviews: list[str]) -> dict[str, int]:
    """Count how many reviews mention each issue category."""
    issue_counts = {}
    for category, keywords in ISSUE_KEYWORDS.items():
        count = 0
        for review in reviews:
            review_lower = str(review).lower()
            if any(kw in review_lower for kw in keywords):
                count += 1
        if count > 0:
            issue_counts[category] = count
    return dict(sorted(issue_counts.items(), key=lambda x: x[1], reverse=True))


def generate_suggestions(shop: str, pos_pct: float, neg_pct: float,
                          neg_reviews: list[str], all_reviews: list[str]) -> list[str]:
    """Generate actionable suggestions for a shop based on sentiment analysis."""
    suggestions = []
    issues = extract_issues(neg_reviews + [r for r in all_reviews if "but" in str(r).lower()])

    # General sentiment-based suggestions
    if neg_pct > 30:
        suggestions.append("URGENT: More than 30% reviews are negative. Immediate quality improvements needed.")
    elif neg_pct > 20:
        suggestions.append("WARNING: Negative reviews are above 20%. Focus on the top complaints below.")

    if pos_pct > 60:
        suggestions.append("STRENGTH: Strong positive sentiment! Maintain current quality standards.")

    # Issue-specific suggestions
    if "Hygiene & Cleanliness" in issues:
        count = issues["Hygiene & Cleanliness"]
        suggestions.append(f"HYGIENE ({count} mentions): Ensure staff wears gloves, clean utensils properly, maintain clean counters and cooking area.")

    if "Food Quality" in issues:
        count = issues["Food Quality"]
        suggestions.append(f"FOOD QUALITY ({count} mentions): Focus on freshness of ingredients, consistent cooking quality, and proper food storage.")

    if "Pricing" in issues:
        count = issues["Pricing"]
        suggestions.append(f"PRICING ({count} mentions): Consider student-friendly pricing or combo offers to improve value perception.")

    if "Service & Speed" in issues:
        count = issues["Service & Speed"]
        suggestions.append(f"SERVICE ({count} mentions): Improve service speed, train staff for better customer interaction, manage peak hour rush.")

    if "Menu & Variety" in issues:
        count = issues["Menu & Variety"]
        suggestions.append(f"MENU ({count} mentions): Expand menu options, ensure all listed items are available, add seasonal specials.")

    if "Portion Size" in issues:
        count = issues["Portion Size"]
        suggestions.append(f"PORTIONS ({count} mentions): Review portion sizes relative to pricing, ensure filling meals for students.")

    if not suggestions:
        suggestions.append("No major issues detected. Continue maintaining current standards.")

    return suggestions


def main():
    print("=" * 70)
    print("  BrewAnalytics - Review Analysis & Seller Suggestions")
    print("  (BERT classifies reviews -> generates insights for sellers)")
    print("=" * 70)

    # Check prerequisites
    if not os.path.exists(MODEL_DIR):
        print("\n  ERROR: Trained model not found! Run these first:")
        print("    python generate_synthetic_dataset.py")
        print("    python train_bert_sentiment.py")
        return

    csv_path = os.path.join(SCRIPT_DIR, "extended_reviews.csv")
    if not os.path.exists(csv_path):
        print("\n  ERROR: Dataset not found! Run: python generate_synthetic_dataset.py")
        return

    # Load data
    df = pd.read_csv(csv_path)
    print(f"\n  Loaded {len(df)} reviews ({len(df[df['source']=='real'])} real + {len(df[df['source']=='synthetic'])} synthetic)")

    # Initialize classifier
    classifier = SentimentClassifier()

    # ─── Classify ALL reviews ────────────────────────────────────────────
    print("\n  Classifying all reviews with BERT...")
    sentiments = []
    confidences = []

    for i, row in df.iterrows():
        result = classifier.classify(row["Review"])
        sentiments.append(result["sentiment"])
        confidences.append(result["confidence"])
        if (i + 1) % 200 == 0:
            print(f"    Processed {i + 1}/{len(df)} reviews...")

    df["predicted_sentiment"] = sentiments
    df["confidence"] = confidences

    print(f"  Done! All {len(df)} reviews classified.\n")

    # ─── Save classified dataset ─────────────────────────────────────────
    classified_path = os.path.join(SCRIPT_DIR, "classified_reviews.csv")
    df.to_csv(classified_path, index=False)
    print(f"  Classified reviews saved to: {classified_path}")

    # ─── Overall Sentiment Summary ───────────────────────────────────────
    print("\n" + "=" * 70)
    print("  OVERALL SENTIMENT SUMMARY")
    print("=" * 70)
    total = len(df)
    for sent in ["Positive", "Neutral", "Negative"]:
        count = len(df[df["predicted_sentiment"] == sent])
        pct = count / total * 100
        bar = "#" * int(pct / 2)
        print(f"  {sent:<10}: {count:>5} ({pct:5.1f}%) {bar}")

    # ─── Per-Shop Analysis ───────────────────────────────────────────────
    shops = df["Shop"].unique()
    report_lines = []
    report_lines.append("=" * 70)
    report_lines.append("  BREWANALYTICS - SENTIMENT ANALYSIS REPORT")
    report_lines.append("  Generated by BERT Model")
    report_lines.append("=" * 70)

    for shop in sorted(shops):
        shop_df = df[df["Shop"] == shop]
        total_shop = len(shop_df)

        pos_count = len(shop_df[shop_df["predicted_sentiment"] == "Positive"])
        neu_count = len(shop_df[shop_df["predicted_sentiment"] == "Neutral"])
        neg_count = len(shop_df[shop_df["predicted_sentiment"] == "Negative"])

        pos_pct = pos_count / total_shop * 100
        neu_pct = neu_count / total_shop * 100
        neg_pct = neg_count / total_shop * 100

        avg_rating = shop_df["Rating"].mean()
        avg_confidence = shop_df["confidence"].mean()

        print(f"\n{'='*70}")
        print(f"  SHOP: {shop}")
        print(f"  Total Reviews: {total_shop} | Avg Rating: {avg_rating:.1f}/5 | Model Confidence: {avg_confidence:.0%}")
        print(f"  {'-'*64}")
        print(f"  Positive: {pos_count:>4} ({pos_pct:5.1f}%)  {'#' * int(pos_pct / 2)}")
        print(f"  Neutral:  {neu_count:>4} ({neu_pct:5.1f}%)  {'#' * int(neu_pct / 2)}")
        print(f"  Negative: {neg_count:>4} ({neg_pct:5.1f}%)  {'#' * int(neg_pct / 2)}")

        # Get negative reviews for suggestion generation
        neg_reviews = shop_df[shop_df["predicted_sentiment"] == "Negative"]["Review"].tolist()
        all_reviews = shop_df["Review"].tolist()

        suggestions = generate_suggestions(shop, pos_pct, neg_pct, neg_reviews, all_reviews)

        print(f"\n  SUGGESTIONS FOR SELLER:")
        for j, suggestion in enumerate(suggestions, 1):
            print(f"    {j}. {suggestion}")

        # Collect for report
        report_lines.append(f"\n{'='*70}")
        report_lines.append(f"SHOP: {shop}")
        report_lines.append(f"Total Reviews: {total_shop} | Avg Rating: {avg_rating:.1f}/5")
        report_lines.append(f"Positive: {pos_count} ({pos_pct:.1f}%) | Neutral: {neu_count} ({neu_pct:.1f}%) | Negative: {neg_count} ({neg_pct:.1f}%)")
        report_lines.append(f"\nSuggestions:")
        for j, s in enumerate(suggestions, 1):
            report_lines.append(f"  {j}. {s}")

        # Show sample negative reviews
        if neg_reviews:
            n_show = min(3, len(neg_reviews))
            print(f"\n  SAMPLE NEGATIVE REVIEWS:")
            for review in neg_reviews[:n_show]:
                text = str(review)[:80] + "..." if len(str(review)) > 80 else str(review)
                print(f"    - \"{text}\"")
            report_lines.append(f"\nSample Negative Reviews:")
            for review in neg_reviews[:n_show]:
                report_lines.append(f"  - \"{review}\"")

    # ─── Save report ─────────────────────────────────────────────────────
    report_path = os.path.join(SCRIPT_DIR, "seller_analysis_report.txt")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    print(f"\n{'='*70}")
    print(f"  Full report saved to: {report_path}")
    print(f"  Classified data saved to: {classified_path}")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()
