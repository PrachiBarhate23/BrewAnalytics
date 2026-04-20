"""
BrewAnalytics - BERT Sentiment Analysis Training
=================================================
Fine-tunes bert-base-uncased for 3-class sentiment classification.

KEY: The model learns sentiment from RATINGS, not pre-labeled sentiments.
- Rating 4-5 → Positive
- Rating 3   → Neutral
- Rating 1-2 → Negative

After training, the model can classify ANY new review text into
Positive/Neutral/Negative WITHOUT needing a rating.
"""

import os
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import BertTokenizer, BertForSequenceClassification, get_linear_schedule_with_warmup
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import warnings
warnings.filterwarnings("ignore")

# ─── Configuration ───────────────────────────────────────────────────────────
MODEL_NAME = "bert-base-uncased"
MAX_LENGTH = 128
BATCH_SIZE = 16
EPOCHS = 1
LEARNING_RATE = 2e-5
RANDOM_SEED = 42
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SAVE_DIR = os.path.join(SCRIPT_DIR, "saved_model")

# Sentiment mapping from ratings
LABEL2ID = {"Positive": 0, "Neutral": 1, "Negative": 2}
ID2LABEL = {v: k for k, v in LABEL2ID.items()}


def rating_to_sentiment(rating: int) -> str:
    """Convert star rating to sentiment label for training."""
    if rating >= 4:
        return "Positive"
    elif rating == 3:
        return "Neutral"
    else:
        return "Negative"


class ReviewDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer.encode_plus(
            str(self.texts[idx]),
            add_special_tokens=True,
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_attention_mask=True,
            return_tensors="pt",
        )
        return {
            "input_ids": encoding["input_ids"].flatten(),
            "attention_mask": encoding["attention_mask"].flatten(),
            "labels": torch.tensor(self.labels[idx], dtype=torch.long),
        }


def train_epoch(model, loader, optimizer, scheduler, device):
    model.train()
    total_loss, correct, total = 0, 0, 0
    for batch_idx, batch in enumerate(loader):
        ids = batch["input_ids"].to(device)
        mask = batch["attention_mask"].to(device)
        labels = batch["labels"].to(device)

        optimizer.zero_grad()
        out = model(input_ids=ids, attention_mask=mask, labels=labels)
        loss = out.loss

        _, preds = torch.max(out.logits, dim=1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)
        total_loss += loss.item()

        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        scheduler.step()

        if (batch_idx + 1) % 20 == 0:
            print(f"    Batch {batch_idx + 1}/{len(loader)} | Loss: {loss.item():.4f}")

    return total_loss / len(loader), correct / total


def eval_model(model, loader, device):
    model.eval()
    total_loss, correct, total = 0, 0, 0
    all_preds, all_labels = [], []

    with torch.no_grad():
        for batch in loader:
            ids = batch["input_ids"].to(device)
            mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            out = model(input_ids=ids, attention_mask=mask, labels=labels)
            _, preds = torch.max(out.logits, dim=1)

            correct += (preds == labels).sum().item()
            total += labels.size(0)
            total_loss += out.loss.item()
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    return total_loss / len(loader), correct / total, all_preds, all_labels


def main():
    print("=" * 60)
    print("  BrewAnalytics - BERT Training Pipeline")
    print("  (Learning sentiment from ratings)")
    print("=" * 60)

    torch.manual_seed(RANDOM_SEED)
    np.random.seed(RANDOM_SEED)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n  Device: {device}")

    # ─── Load extended dataset ───────────────────────────────────────────
    csv_path = os.path.join(SCRIPT_DIR, "extended_reviews.csv")
    if not os.path.exists(csv_path):
        print("  ERROR: Run 'python generate_synthetic_dataset.py' first!")
        return

    df = pd.read_csv(csv_path)
    print(f"  Loaded {len(df)} reviews")

    # Derive sentiment labels from ratings
    df["sentiment"] = df["Rating"].apply(rating_to_sentiment)
    df["label_id"] = df["sentiment"].map(LABEL2ID)

    print(f"\n  Sentiment derived from ratings:")
    print(f"    Rating 4-5 → Positive: {len(df[df['sentiment']=='Positive'])}")
    print(f"    Rating 3   → Neutral:  {len(df[df['sentiment']=='Neutral'])}")
    print(f"    Rating 1-2 → Negative: {len(df[df['sentiment']=='Negative'])}")

    # ─── Split ───────────────────────────────────────────────────────────
    texts = df["Review"].values
    labels = df["label_id"].values

    X_train, X_temp, y_train, y_temp = train_test_split(
        texts, labels, test_size=0.2, random_state=RANDOM_SEED, stratify=labels
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=RANDOM_SEED, stratify=y_temp
    )
    print(f"\n  Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

    # ─── Tokenizer and model ────────────────────────────────────────────
    print(f"\n  Loading {MODEL_NAME}...")
    tokenizer = BertTokenizer.from_pretrained(MODEL_NAME)

    train_loader = DataLoader(ReviewDataset(X_train, y_train, tokenizer, MAX_LENGTH), batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(ReviewDataset(X_val, y_val, tokenizer, MAX_LENGTH), batch_size=BATCH_SIZE)
    test_loader = DataLoader(ReviewDataset(X_test, y_test, tokenizer, MAX_LENGTH), batch_size=BATCH_SIZE)

    model = BertForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=3, id2label=ID2LABEL, label2id=LABEL2ID)
    model = model.to(device)

    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=0.01)
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=int(0.1 * total_steps), num_training_steps=total_steps)

    # ─── Training ────────────────────────────────────────────────────────
    print(f"\n  Training for {EPOCHS} epochs...")
    best_val_acc = 0
    history = []

    for epoch in range(EPOCHS):
        print(f"\n  Epoch {epoch + 1}/{EPOCHS}")
        train_loss, train_acc = train_epoch(model, train_loader, optimizer, scheduler, device)
        val_loss, val_acc, _, _ = eval_model(model, val_loader, device)
        print(f"  Train Loss: {train_loss:.4f} | Acc: {train_acc:.4f}")
        print(f"  Val   Loss: {val_loss:.4f} | Acc: {val_acc:.4f}")
        history.append({"epoch": epoch+1, "train_loss": train_loss, "train_acc": train_acc, "val_loss": val_loss, "val_acc": val_acc})

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            os.makedirs(SAVE_DIR, exist_ok=True)
            model.save_pretrained(SAVE_DIR)
            tokenizer.save_pretrained(SAVE_DIR)
            print(f"  -> Best model saved! (val_acc: {val_acc:.4f})")

    # ─── Test ────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  Test Results")
    print("=" * 60)
    model = BertForSequenceClassification.from_pretrained(SAVE_DIR).to(device)
    test_loss, test_acc, preds, labels_true = eval_model(model, test_loader, device)
    print(f"\n  Test Accuracy: {test_acc:.4f}")
    print(f"\n{classification_report(labels_true, preds, target_names=['Positive','Neutral','Negative'])}")
    print(f"  Model saved to: {SAVE_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
