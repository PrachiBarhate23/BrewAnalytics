# 🎯 BREWANALYTICS — INTERVIEW STUDY GUIDE

> **Target Role**: Business Analyst (Data Science & Risk Analytics) — InCred Finance  
> **Project**: BrewAnalytics — AI-Powered Restaurant Intelligence Platform  
> **Generated from**: Actual codebase analysis (`backend/`, `sentiment_model/`, `sales_model/`, `src/`)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Datasets Used — The Full Data Journey](#2-datasets-used--the-full-data-journey)
3. [Module-by-Module Deep Dive](#3-module-by-module-deep-dive)
   - 3a. [Sentiment Classification (BERT)](#3a-sentiment-classification)
   - 3b. [Aspect Extraction](#3b-aspect-extraction)
   - 3c. [Sales Forecasting Engine (STL + ARIMA)](#3c-sales-forecasting-engine)
   - 3d. [Multi-Tenant Backend & Auth](#3d-multi-tenant-backend--auth)
   - 3e. [Frontend Dashboard](#3e-frontend-dashboard-react--typescript)
4. [Likely Interview Questions](#4-likely-interview-questions)
5. [Concept Glossary](#5-concept-glossary)
6. [Honesty Cheat Sheet](#6-honesty-cheat-sheet)

---

# 1. PROJECT OVERVIEW

## Elevator Pitch (30 seconds, business-framed)

BrewAnalytics is an AI-powered analytics platform that helps small food-outlet owners understand what their customers really think and forecast what their revenue will look like next month. We built it for 9 campus restaurants near our college — each owner logs in, sees real-time sentiment breakdowns of student reviews (powered by a fine-tuned DistilBERT model), gets aspect-level insights like "your food scores high but pricing perception is negative," and can view 90-day revenue forecasts with confidence intervals. The business problem it solves is simple: small outlets don't have data teams — BrewAnalytics gives them one in a dashboard.

## Technical Pitch (for when they dig deeper)

The system is a full-stack analytics platform with four distinct ML/analytics modules served through a FastAPI backend to a React + TypeScript frontend. The NLP pipeline uses a fine-tuned `distilbert-base-uncased` model for 3-class sentiment classification (Positive / Neutral / Negative) trained on ~2,300 student reviews, with a keyword-based aspect extraction layer that maps sentiments to business dimensions (Food, Service, Pricing, Ambience). The forecasting engine uses Facebook Prophet Additive Model to isolate trend and yearly/weekly seasonality from daily revenue time series to project 90 days ahead with 95% confidence intervals. There's also a market basket analysis module using FP-Growth association rule mining. The entire system is multi-tenant via JWT authentication — each shop owner sees only their own data.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend — React + TypeScript + Vite"
        UI[Dashboard UI]
        Pages["Pages: Sentiment · Aspect · Sales<br/>Forecasting · Basket · Competitors"]
        Auth_FE[Auth Context / JWT Storage]
    end

    subgraph "Backend — FastAPI (Python)"
        API[FastAPI Server<br/>CORS · Routers]
        Auth_Router["/api/auth<br/>Login · Signup"]
        Sent_Router["/api/sentiment<br/>Reviews · Summary · Aspects · Predict"]
        Sales_Router["/api/sales<br/>Analytics · Forecast · Competitors"]
        Basket_Router["/api/basket<br/>Rules · Analysis"]
        Upload_Router["/api/upload<br/>Reviews · Sales CSV"]
        Auth_Utils["JWT + bcrypt<br/>auth_utils.py"]
    end

    subgraph "ML & Analytics Engines"
        BERT["Fine-Tuned DistilBERT<br/>distilbert-base-uncased<br/>3-class sentiment"]
        NLP["Aspect Extraction<br/>Keyword/Rule-Based<br/>nlp_service.py"]
        Prophet["Facebook Prophet<br/>sales_model.py<br/>90-day forecast"]
        MBA["Market Basket Engine<br/>FP-Growth Mining<br/>basket_model.py"]
    end

    subgraph "Data Layer — File-Based Storage"
        Users["users.json<br/>Hashed credentials"]
        Reviews["classified_reviews.csv<br/>Per-shop sentiment data"]
        Sales["sales_data.csv<br/>2-year daily revenue"]
        Basket["basket_data.csv<br/>Transaction-level items"]
    end

    UI -->|HTTP + JWT| API
    API --> Auth_Router --> Auth_Utils --> Users
    API --> Sent_Router --> BERT
    Sent_Router --> NLP
    Sent_Router --> Reviews
    API --> Sales_Router --> Prophet --> Sales
    API --> Basket_Router --> MBA --> Basket
    API --> Upload_Router --> BERT
    Upload_Router --> Reviews
    Upload_Router --> Sales
```

---

# 2. DATASETS USED — THE FULL DATA JOURNEY

## Data Pipeline Overview

```mermaid
graph LR
    A["1. Scoping &<br/>Sampling Design"] --> B["2. Primary Data<br/>Collection<br/>(Google Form)"]
    B --> C["3. Cleaning &<br/>Preprocessing"]
    C --> D["4. Label<br/>Derivation"]
    D --> E["5. Synthetic<br/>Augmentation"]
    E --> F["6. Final<br/>Training Dataset"]
    
    style A fill:#2d3748,stroke:#6366f1,color:#e2e8f0
    style B fill:#2d3748,stroke:#10b981,color:#e2e8f0
    style C fill:#2d3748,stroke:#f59e0b,color:#e2e8f0
    style D fill:#2d3748,stroke:#ef4444,color:#e2e8f0
    style E fill:#2d3748,stroke:#8b5cf6,color:#e2e8f0
    style F fill:#2d3748,stroke:#06b6d4,color:#e2e8f0
```

---

### 2a. Scoping & Sampling Design

We deliberately scoped our data collection to a **defined, bounded population**: 9 food outlets near/inside our college campus (SPJIMR area). These are:

| # | Outlet | Type |
|---|--------|------|
| 1 | Vrindavan | Veg Restaurant |
| 2 | Cluckins | Chicken QSR |
| 3 | Amar Frankie | Street Food Stall |
| 4 | Manchurian Shop | Street Food Stall |
| 5 | Shawarma Shop | Street Food Stall |
| 6 | Juice Center | Beverage Stall |
| 7 | SPJIMR Mess | Institutional Mess |
| 8 | College Canteen Ground Floor | Campus Canteen |
| 9 | College Canteen 3rd Floor | Campus Canteen |

**Why this was a deliberate choice**: Instead of trying to scrape or cover hundreds of restaurants (which would be shallow and uncontrolled), we focused on a small, well-defined population where:
- We could reach the **actual customer base** (students at our college)
- We understood the **context** behind reviews (campus life, student budgets, peer opinions)
- We could validate whether the model's outputs made real-world sense

This is analogous to a **pilot study** or **proof-of-concept deployment** — you prove the methodology works on a controlled population before scaling.

---

### 2b. Primary Data Collection

We designed and floated a **Google Form survey** to students across our college to collect real, first-person reviews and star ratings for these 9 outlets. This is **primary research data** — not scraped from Google/Zomato/Swiggy, not assumed, and not fabricated.

**Survey fields collected**:
- `Timestamp` — automatic submission time
- `Name` — respondent's name
- `Year` — academic year (SE / TE / BE)
- `Shop` — which outlet they're reviewing (one response per outlet per student)
- `Rating` — star rating on a 1–5 scale
- `Review` — free-text review in their own words

**Result**: **306 real survey responses** across 9 shops (≈ 34 responses per shop on average).

---

### 2c. Cleaning & Preprocessing of Raw Survey Responses

Before any model training or label derivation, the raw survey CSV went through a structured preprocessing pipeline:

```mermaid
graph TD
    RAW["306 Raw Survey<br/>Responses"] --> S1["Step 1: Remove blank /<br/>incomplete submissions"]
    S1 --> S2["Step 2: Remove duplicate /<br/>spam entries"]
    S2 --> S3["Step 3: Normalize free text<br/>— lowercase, whitespace,<br/>emojis, special chars"]
    S3 --> S4["Step 4: Standardize rating<br/>scale (ensure 1-5 integer)"]
    S4 --> S5["Step 5: Filter non-informative<br/>responses (single-word,<br/>empty reviews)"]
    S5 --> CLEAN["~306 Clean<br/>Responses"]
    
    style RAW fill:#374151,stroke:#f59e0b,color:#fcd34d
    style CLEAN fill:#374151,stroke:#10b981,color:#6ee7b7
```

| Step | What It Does | Why It Matters |
|------|-------------|----------------|
| **Blank removal** | Drop rows where Review is empty/NaN | Can't train a text model on empty strings |
| **Deduplication** | Remove exact-duplicate submissions (same student, same shop, same text) | Students may have accidentally submitted twice |
| **Text normalization** | Lowercase, strip excess whitespace, handle emojis and Hinglish slang typical of student writing | Reduces vocabulary noise for the tokenizer; `"AMAZING!!!"` and `"amazing"` should be treated the same way |
| **Rating standardization** | Ensure all ratings are integers 1–5 | The label-derivation step depends on clean numeric ratings |
| **Non-informative filtering** | Flag or remove reviews like `"."`, `"ok"`, `"na"`, `"Good"` (single word with no real signal) | These provide no meaningful training signal and add noise to the sentiment model |

---

### 2d. Label Derivation — Proxy Labeling from Ratings

We did **not** have manually annotated sentiment labels (Positive / Neutral / Negative) from human annotators. Instead, we derived 3-class labels from the star ratings:

| Star Rating | Derived Sentiment Label |
|-------------|------------------------|
| 4–5 ★ | **Positive** |
| 3 ★ | **Neutral** |
| 1–2 ★ | **Negative** |

**Why this is defensible**:
- This is a well-established technique called **proxy labeling** or **distant supervision**. It's used widely in industry when manual annotation is too expensive or impractical.
- Star ratings are a strong **ordinal signal** of user sentiment — a 1-star review is almost certainly negative; a 5-star review is almost certainly positive.
- The main risk is with borderline cases (e.g., a 3-star review that's actually mildly positive). Our model learns from the *text* content, not the rating — so at inference time it can disagree with the proxy label, which is exactly what a well-trained model should do.
- Papers like Pang & Lee (2005) and many Amazon/Yelp sentiment studies use exactly this approach.

**Code reference** — `train_bert_sentiment.py`, lines 41–48:
```python
def rating_to_sentiment(rating: int) -> str:
    if rating >= 4:
        return "Positive"
    elif rating == 3:
        return "Neutral"
    else:
        return "Negative"
```

---

### 2e. Synthetic Data Augmentation — The Honest, Technical Framing

#### The problem

Our real sample was **~306 responses across 9 shops** (~34 per shop). This creates two critical problems for fine-tuning a transformer model:

1. **Data scarcity**: BERT has ~110 million parameters. Fine-tuning it on 306 examples risks severe **overfitting** — the model memorizes training examples instead of learning general sentiment patterns.
2. **Class imbalance**: Real student reviews skew positive (most students rate places they like more often than places they dislike). With only ~34 reviews per shop, some sentiment classes had as few as 5–8 examples — not enough for the model to learn meaningful decision boundaries.

#### Our solution: AI-assisted augmentation grounded in real data

We built a **controlled synthetic data generator** (`generate_synthetic_dataset.py`) that:

1. **Starts from real student vocabulary and concerns** — the templates for each shop were directly inspired by the actual language, slang, and specific complaints from our real survey (e.g., "flies hovering around" for Manchurian Shop, "sizzling brownie" for Vrindavan)
2. **Preserves shop-specific characteristics** — each shop has its own template bank organized by sentiment tier (high/mid/low rating), so synthetic reviews for "Shawarma Shop" talk about shawarma and hygiene, not about juice or canteen food
3. **Adds realistic text variations** — suffix mutations ("tbh", "honestly", "ngl"), casing changes, punctuation variation — to mimic informal student writing style
4. **Controls the class distribution** — 50% high-rating, 30% mid-rating, 20% low-rating per shop — to ensure balanced representation across sentiment classes
5. **Assigns ratings** consistent with the review category (high_rating → randomly picks 4 or 5; low_rating → randomly picks 1 or 2)

**This is standard practice.** Synthetic data augmentation is used routinely in industry to address class imbalance and data scarcity:
- **Healthcare NLP**: Rare disease mention detection often has <100 positive examples; synthetic augmentation is standard
- **Fraud detection** at companies like InCred: fraud cases are <1% of transactions — oversampling (SMOTE) and synthetic generation are common
- **Back-translation augmentation** (translate English → French → English) is a standard NLP technique for small datasets
- Research like **EDA (Easy Data Augmentation, Wei & Zou 2019)** validates that even simple text perturbations improve classifier robustness

#### What we did NOT do
- We did NOT use a pretrained LLM to hallucinate ungrounded reviews
- We did NOT copy reviews from Zomato/Google (that would be data leakage and IP issues)
- Each synthetic review is traceable to a real theme from our survey data

---

### 2f. Sales Dataset — Seeding a Synthetic Generator with Real Baseline Metrics

We did **not** have access to the restaurants' actual POS/transaction systems, billing software, or financial records. What we did have:
- **Approximate real baseline figures** collected through informal conversations and observation: daily customer counts (e.g., Vrindavan ≈ 400/day, Manchurian Shop ≈ 125/day), approximate average order values (₹300, ₹50 respectively), and relative demand levels
- These baselines are encoded as configuration in `generate_sales_data.py` (lines 21–148)

From these real seeds, our generator (`generate_sales_data.py`) produces a **realistic 2+ year daily time series** by layering:

| Layer | What It Adds | Code Location |
|-------|-------------|---------------|
| **Base revenue** | daily_customers × avg_order_value per outlet | Line 217 |
| **Day-of-week seasonality** | Mon=0.85×, Fri=1.15×, Sat=1.25×, Sun=0.80× | Lines 180–182 |
| **Seasonal events** | Diwali=0.2×, College Fest=2.0×, Holi=0.3× | Lines 152–164 |
| **Exam period dip** | 0.7× during exam weeks (April, Nov, Dec) | Lines 167–177 |
| **Organic growth** | +0.5% per month compounding | Lines 185–187 |
| **Random noise** | ±8% daily variation | Lines 223–224 |
| **Item-level breakdown** | Revenue split across 13–15 menu items per outlet | Lines 230–253 |

This is framed as: **"We seeded a synthetic time-series generator with real baseline metrics and applied realistic business seasonality patterns."** The generator code is transparent and reproducible.

---

### 2g. Final Dataset Composition — Know These Numbers

#### Review Data

| Stage | Count |
|-------|-------|
| Raw survey responses collected | **306** |
| After cleaning & preprocessing | **~306** (minimal removals; most responses were usable) |
| Synthetic reviews generated | **~1,998** |
| **Total training dataset** | **2,304 reviews** |
| Source breakdown | 306 real (13.3%) + 1,998 synthetic (86.7%) |
| Shops covered | **9** |
| Reviews per shop | **~256** (balanced across shops) |
| Sentiment distribution (by design) | ~50% Positive, ~30% Neutral, ~20% Negative |

#### Sales Data

| Metric | Value |
|--------|-------|
| Time range | Jan 1, 2024 → Mar 31, 2026 (27 months) |
| Outlets | 9 |
| Rows in sales_data.csv | ~100,000+ (one row per outlet × item × day) |
| Unique items per outlet | 13–15 |
| Basket transactions generated | ~50,000+ for market basket analysis |

---

### 2h. How to Defend This Approach

#### ✅ Default Answer — "Why this approach was reasonable"

> "We took a structured, staged approach to data. We started with primary research — a Google Form survey of actual students reviewing actual restaurants they eat at daily. That gave us 306 real responses with ratings and free-text reviews. For model training, 306 examples isn't enough to fine-tune a 110M-parameter transformer without overfitting, and the class distribution was naturally skewed positive. So we used controlled synthetic augmentation — generating additional reviews that were grounded in the real vocabulary, concerns, and writing style from our survey — to balance the classes and reach a viable training volume of about 2,300 reviews. This is the same principle behind SMOTE in tabular data or back-translation in NLP — you're expanding coverage while staying grounded in real data patterns. The same logic applied to sales data: we collected real baseline metrics from the outlets and fed them into a time-series generator with realistic seasonality."

#### 🛡️ Fallback Answer — "If they push back hard"

> "You're right that synthetic data is a limitation, and I want to be transparent about that. About 87% of our training set is synthetic, and I can't claim the model generalizes to unseen real-world data with the same confidence as if I'd had 2,000+ real annotated reviews. In an ideal scenario with more time and access, I'd collect a larger real dataset, use active learning to prioritize annotation of ambiguous cases, and validate with a held-out set of purely real reviews. That said, the synthetic data was built carefully — it wasn't random noise or GPT-generated hallucinations. Each review template maps directly to real themes from our survey. And the proxy-labeling approach (deriving sentiment from ratings) is standard in the literature. I see this project as a proof-of-concept that demonstrates the full pipeline from data collection to deployment — and in a production setting at a company like InCred, you'd have access to real transaction data, real customer feedback, and proper labeling infrastructure."

---

# 3. MODULE-BY-MODULE DEEP DIVE

---

## 3a. Sentiment Classification (DistilBERT)

**Files**: `sentiment_model/train_bert_sentiment.py`, `sentiment_model/predict_sentiment.py`

### What It Does

Takes raw review text as input and classifies it into one of three sentiment categories: **Positive**, **Neutral**, or **Negative**, along with a confidence score and per-class probability distribution.

### DistilBERT — Explained from Scratch

**DistilBERT** is a smaller, faster, cheaper and lighter Transformer model trained by distilling BERT base.

#### What is a Transformer?

A transformer is a neural network architecture based entirely on **attention mechanisms** — it doesn't use recurrence (like LSTMs) or convolutions (like CNNs). The key innovation is **self-attention**: every word in a sentence can directly attend to every other word, regardless of distance.

```mermaid
graph TB
    subgraph "Transformer Architecture (Simplified)"
        Input["Input Tokens:<br/>'The food was terrible'"] --> Embed["Token + Position<br/>Embeddings"]
        Embed --> SA1["Self-Attention Layer 1<br/>'terrible' attends to 'food'"]
        SA1 --> FF1["Feed-Forward Layer 1"]
        FF1 --> SA2["Self-Attention Layer 2"]
        SA2 --> FF2["Feed-Forward Layer 2"]
        FF2 --> SAn["... × 6 layers"]
        SAn --> Output["Contextual Representations<br/>for each token"]
    end
```

**Why self-attention matters**: In the sentence *"The food was not good but the service was excellent"*, a traditional model might struggle because "not" is far from "excellent." Self-attention lets the model directly connect "not" with "good" and separately understand that "excellent" modifies "service."

#### What is DistilBERT specifically?

- DistilBERT is a distilled version of BERT (Bidirectional Encoder Representations from Transformers).
- **Bidirectional**: It reads text in both directions simultaneously — unlike GPT, which only reads left-to-right
- **distilbert-base-uncased**: The specific variant we used — 6 transformer layers, 768 hidden dimensions, 66 million parameters (40% smaller than BERT). "Uncased" means it lowercases all text before processing (so "FOOD" = "food")
- **Pre-trained** using knowledge distillation from the BERT model.

#### What is "Fine-Tuning" vs. Using Pretrained?

| Approach | What happens | When to use |
|----------|-------------|-------------|
| **Pretrained only** (zero-shot) | Use DistilBERT as-is, no additional training | When you have no labeled data at all |
| **Fine-tuning** (what we did) | Start from pretrained weights, then continue training on YOUR specific dataset with YOUR labels | When you have domain-specific labeled data (even a few hundred examples) |
| **Training from scratch** | Initialize random weights, train everything | Only when you have millions of examples and very different domain (e.g., biomedical) |

We fine-tuned because:
- Our domain (informal student restaurant reviews in Indian English/Hinglish) is different from DistilBERT's pretraining data (Wikipedia + BookCorpus)
- Fine-tuning adapts the model to our vocabulary ("goated", "ngl", "bhaji pav") and our task (3-class sentiment) while keeping the general language understanding it learned during pretraining

### Why DistilBERT Over Classical ML?

| Criterion | BERT (Our Choice) | Logistic Regression | Naive Bayes | SVM |
|-----------|-------------------|-------------------|-------------|-----|
| **Accuracy on short text** | ★★★★★ | ★★★ | ★★★ | ★★★★ |
| **Handles context/negation** | ✅ "not good" → Negative | ❌ "good" → Positive | ❌ "good" → Positive | ❌ Depends on n-grams |
| **Handles informal/slang** | ✅ Pretrained on diverse text | ❌ Needs manual feature engineering | ❌ Bag-of-words only | ⚠️ Better with TF-IDF |
| **Training data requirement** | ~1000+ (we have 2304) | ~200+ (would be fine) | ~100+ (would be fine) | ~500+ (would be fine) |
| **Inference latency** | ~50–100ms per review | <1ms | <1ms | <1ms |
| **Interpretability** | Low (black box) | High (feature weights) | Medium (word priors) | Medium (support vectors) |
| **GPU needed?** | Preferred but not required | No | No | No |

**Why BERT won**: Our reviews are short (10–30 words), informal, often contain negation ("not clean"), sarcasm ("sometimes maybe good sometimes maybe not good"), and code-mixed language. Classical models with bag-of-words features would miss these nuances. The accuracy-latency tradeoff is acceptable because sentiment analysis is a batch/on-demand task, not a real-time stream.

**What I'd say if asked "isn't BERT overkill for 2,300 reviews?"**: "Fair point. A well-tuned SVM with TF-IDF features could potentially reach 80–85% accuracy on this task with less compute. I chose BERT because (1) it handles the nuanced, informal text better, (2) it demonstrates transformer competency for my portfolio, and (3) fine-tuning a pretrained model is standard industry practice for NLP tasks. If deployment latency were a constraint, I'd consider DistilBERT (40% smaller, 97% of BERT's accuracy)."

### Code Walkthrough — Training Pipeline

```mermaid
graph TD
    A["Load extended_reviews.csv<br/>(2,304 reviews)"] --> B["Derive sentiment labels<br/>from ratings<br/>(4-5→Pos, 3→Neu, 1-2→Neg)"]
    B --> C["Stratified Split<br/>80% Train / 10% Val / 10% Test"]
    C --> D["Tokenize with<br/>BertTokenizer<br/>(max_length=128)"]
    D --> E["Load bert-base-uncased<br/>+ 3-class classification head"]
    E --> F["Train 1 epoch<br/>AdamW, lr=2e-5<br/>Linear warmup scheduler"]
    F --> G["Evaluate on val set<br/>Save best model"]
    G --> H["Final test evaluation<br/>classification_report()"]
```

**Key implementation details from `train_bert_sentiment.py`**:

| Setting | Value | Why |
|---------|-------|-----|
| `MAX_LENGTH = 128` | Truncate/pad reviews to 128 tokens | Most reviews are <50 tokens; 128 gives headroom without wasting memory |
| `BATCH_SIZE = 16` | Process 16 reviews at a time | Balances GPU memory usage and gradient stability |
| `EPOCHS = 1` | Only 1 training epoch | Prevents overfitting on a small/partially-synthetic dataset; pretrained weights already encode strong language understanding |
| `LEARNING_RATE = 2e-5` | Very small learning rate | Standard for fine-tuning; large LR would destroy pretrained weights |
| `weight_decay = 0.01` | L2 regularization | Prevents overfitting by penalizing large weight values |
| `clip_grad_norm = 1.0` | Gradient clipping | Prevents exploding gradients during backpropagation |
| `warmup_steps = 10%` | Linear warmup | Gradually ramps LR from 0 to 2e-5 to stabilize early training |

**Stratified splitting** (lines 162–167):
```python
X_train, X_temp, y_train, y_temp = train_test_split(
    texts, labels, test_size=0.2, random_state=42, stratify=labels
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
)
```

The `stratify=labels` argument ensures each split has the **same proportion** of Positive/Neutral/Negative as the full dataset. Without it, the small Negative class (~20%) might be underrepresented in the test set, giving misleading accuracy numbers.

### Evaluation Metrics — Complete Reference

#### Confusion Matrix (3×3)

For a 3-class problem, the confusion matrix looks like:

|  | **Predicted Positive** | **Predicted Neutral** | **Predicted Negative** |
|--|---|---|---|
| **Actual Positive** | TP_pos | FN_pos→neu | FN_pos→neg |
| **Actual Neutral** | FN_neu→pos | TP_neu | FN_neu→neg |
| **Actual Negative** | FN_neg→pos | FN_neg→neu | TP_neg |

#### Worked Example

Suppose on a 100-review test set:

|  | **Pred Positive** | **Pred Neutral** | **Pred Negative** |
|--|---|---|---|
| **Actual Positive** | 40 | 5 | 0 |
| **Actual Neutral** | 3 | 25 | 2 |
| **Actual Negative** | 1 | 4 | 20 |

**Per-class metrics**:

**Positive class**:
- **Precision** = TP / (TP + FP) = 40 / (40 + 3 + 1) = 40/44 = **0.909**
  - "Of everything the model *called* Positive, 90.9% actually were"
- **Recall** = TP / (TP + FN) = 40 / (40 + 5 + 0) = 40/45 = **0.889**
  - "Of all *actually* Positive reviews, the model caught 88.9%"
- **F1** = 2 × (P × R) / (P + R) = 2 × (0.909 × 0.889) / (0.909 + 0.889) = **0.899**

**Neutral class**:
- Precision = 25 / (5 + 25 + 4) = 25/34 = **0.735**
- Recall = 25 / (3 + 25 + 2) = 25/30 = **0.833**
- F1 = **0.781**

**Negative class**:
- Precision = 20 / (0 + 2 + 20) = 20/22 = **0.909**
- Recall = 20 / (1 + 4 + 20) = 20/25 = **0.800**
- F1 = **0.851**

**Aggregate metrics**:

| Metric | Formula | Value |
|--------|---------|-------|
| **Accuracy** | (40+25+20) / 100 | **0.850** |
| **Macro F1** | Average of all class F1s equally | (0.899 + 0.781 + 0.851) / 3 = **0.844** |
| **Weighted F1** | Weighted by class frequency | (0.899×45 + 0.781×30 + 0.851×25) / 100 = **0.855** |
| **Micro F1** | Global TP / (TP + FP + FN) — same as accuracy for multiclass | **0.850** |

**Which to report?**: Use **Macro F1** when all classes matter equally (which they do here — missing a Negative review is as bad as misclassifying a Positive one). Macro F1 penalizes the model if it performs poorly on the minority class.

### ⚠️ CRITICAL: Regenerate a Real Classification Report Before the Interview

You do **NOT** have a verified F1/accuracy number saved from an actual training run. **Run these commands before the interview** to generate one:

```bash
# 1. Navigate to sentiment_model directory
cd d:\Desktop\brewAnalytics\BrewAnalytics\sentiment_model

# 2. Activate your virtual environment (if you have one)
# Or ensure transformers, torch, sklearn, pandas are installed

# 3. Generate the extended dataset (if not already present)
python generate_synthetic_dataset.py

# 4. Train the model and get a classification report printed to terminal
python train_bert_sentiment.py

# 5. The training script prints the classification report at the end.
#    SCREENSHOT IT or copy-paste it. This is your real, defensible number.

# 6. Run the analysis script to classify all reviews and get per-shop stats
python analyze_reviews.py
```

The training script (`train_bert_sentiment.py`, line 212) prints:
```python
print(f"\n{classification_report(labels_true, preds, target_names=['Positive','Neutral','Negative'])}")
```

This gives you precision, recall, F1-score, and support for each class. **Memorize the macro F1 and overall accuracy** — those are the two numbers you'll need.

---

## 3b. Aspect Extraction

**File**: `backend/services/nlp_service.py`

### What It Does

Takes a review text string and identifies which business **aspects** (Food, Service, Pricing, Ambience) the review is talking about. This is then combined with the sentiment prediction to produce insights like "70% of Food-related reviews are Positive, but 55% of Pricing-related reviews are Negative."

### How It Works — Keyword/Rule-Based, Not ML

The implementation is a **simple keyword matching system**:

```python
ASPECT_KEYWORDS = {
    "Food":     ["taste", "tasty", "bland", "flavor", "fresh", "stale", ...],
    "Service":  ["slow", "fast", "quick", "wait", "service", "staff", "rude", ...],
    "Pricing":  ["expensive", "overpriced", "costly", "price", "affordable", ...],
    "Ambience": ["ambience", "atmosphere", "cozy", "noisy", "music", "crowded", ...],
}

def extract_aspects(text: str):
    found_aspects = []
    text_lower = str(text).lower()
    for aspect, keywords in ASPECT_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            found_aspects.append(aspect)
    if not found_aspects:
        found_aspects.append("Food")  # Default fallback
    return found_aspects
```

**How it works**: For each review, scan the lowercased text for any keyword from each aspect's list. If a match is found, that aspect is tagged. If no aspect is matched, default to "Food" (since most reviews are about food).

### Why This Is NOT ML-Based Aspect-Based Sentiment Analysis (ABSA)

**Proper ABSA** would:
1. Identify aspect terms **in context** ("the *chicken* was great but the *fries* were soggy" → two aspects, two sentiments)
2. Assign **separate sentiments per aspect** within the same review
3. Handle implicit aspects (no keyword mention, but the aspect is implied)

**Our approach** is simpler:
- It assigns aspects to the **entire review**, not to specific spans
- The sentiment comes from the BERT model (applied to the whole review), not per-aspect
- It can't handle "food was great but service was terrible" — it would tag both Food and Service, but assign the same (whole-review) sentiment to both

### Why Keyword-Based Was Reasonable

- **Time/data constraints**: Training an ABSA model requires aspect-level annotations (e.g., SemEval datasets), which we didn't have
- **Domain specificity**: Our 4 aspects are well-defined for restaurant reviews, and the keyword lists are comprehensive for this domain
- **It works well enough**: For aggregate dashboards (% of reviews mentioning each aspect), keyword matching gives a reliable signal — we don't need per-word precision

### How I'd Extend This to True ML-Based ABSA If Asked

1. **Span extraction with a sequence-labeling model**: Fine-tune BERT as a token classifier (BIO tagging) to identify aspect term spans in text. This would require annotating ~500 reviews with aspect spans, which is feasible.

2. **Aspect-sentiment pair classification**: Use a multi-task model that jointly predicts (aspect, sentiment) pairs. Architectures like BERT-ATE (Aspect Term Extraction) + BERT-ASC (Aspect Sentiment Classification) are state-of-the-art.

3. **Instruction-tuned LLM approach**: Use a model like Llama or Flan-T5 with a prompt like "Extract aspects and their sentiments from this review: ..." — no fine-tuning needed, works zero-shot for well-defined aspects.

---

## 3c. Sales Forecasting Engine

**File**: `sales_model/sales_model.py` (604 lines)

### What It Does

Takes daily revenue time-series data for a shop, decomposes it into interpretable components (trend + seasonality + noise), forecasts revenue for the next 90 days with confidence intervals, and provides outlet-level performance analytics.

### Facebook Prophet — Explained

Prophet is a procedure for forecasting time series data based on an additive model where non-linear trends are fit with yearly, weekly, and daily seasonality, plus holiday effects.

It takes a time series and models it as:

```
Revenue(t) = Trend(t) + Seasonal(t) + Holidays(t) + Residual(t)
```

| Component | What It Captures | Business Meaning |
|-----------|-----------------|------------------|
| **Trend** | Smooth, long-run movement | "Revenue is growing 0.5%/month overall" |
| **Seasonal** | Repeating weekly and yearly patterns | "Fridays generate 15% more revenue than Mondays" |
| **Holidays** | Irregular events | College fest spike, random bad-weather day |

**Why Prophet?** Prophet is designed for business time series. It is robust to missing data and shifts in the trend, and typically handles outliers well without requiring expert tuning of parameters like ARIMA does.

**Code reference** — `sales_model.py`:
```python
model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,
    changepoint_prior_scale=0.05,
    interval_width=0.95
)
model.fit(prophet_df)
```

Prophet automatically detects changepoints in the trend and builds a piecewise linear trend model.

#### What is Stationarity and Why Does It Matter (and Why Prophet Ignores It)?

A **stationary** time series has:
- **Constant mean** over time (no trend up or down)
- **Constant variance** over time (volatility doesn't change)
- **Constant autocorrelation structure**

Traditional models like ARIMA require the data to be stationary. If your series has an upward trend, the model can't properly estimate the parameters, requiring differencing.
**Prophet does not require stationarity.** It fits an additive model directly to the raw data, decomposing the trend and seasonality automatically. This makes it much easier to deploy in production.

#### Why We Use Prophet
- We can skip the `STL Decomposition -> Differencing -> ARIMA` pipeline and use a single robust model.
- Prophet generates 95% Bayesian uncertainty intervals automatically out-of-the-box (`interval_width=0.95`).

---

### MAPE — Mean Absolute Percentage Error

**Formula**:
```
MAPE = (1/n) × Σ |Actual(t) - Forecast(t)| / |Actual(t)| × 100%
```

**Worked example**:

| Day | Actual | Forecast | |Error| / Actual |
|-----|--------|----------|-----------------|
| Mon | ₹10,000 | ₹10,500 | 500/10,000 = 5.0% |
| Tue | ₹12,000 | ₹11,400 | 600/12,000 = 5.0% |
| Wed | ₹11,000 | ₹10,450 | 550/11,000 = 5.0% |
| Thu | ₹9,000 | ₹9,900 | 900/9,000 = 10.0% |
| Fri | ₹15,000 | ₹14,250 | 750/15,000 = 5.0% |

**MAPE** = (5 + 5 + 5 + 10 + 5) / 5 = **6.0%**

**Why MAPE over RMSE/MAE**:
| Metric | Advantage | Disadvantage |
|--------|-----------|--------------|
| **MAPE** | Scale-independent (works across ₹5,000 and ₹50,000 outlets), intuitive ("we're off by 6% on average") | Undefined when actual = 0; asymmetric (underprediction penalized more) |
| **RMSE** | Penalizes large errors more heavily | Scale-dependent (₹500 error means different things for different outlets) |
| **MAE** | Simple, interpretable in original units | Scale-dependent |

For our use case, MAPE is ideal because we're comparing forecasting accuracy across 9 outlets with very different revenue scales (Vrindavan ≈ ₹120,000/day vs Manchurian Shop ≈ ₹6,250/day).

**In the code**, MAPE is approximated as:
```python
model_mape = round((resid_std / max(1, avg_daily)) * 100, 1)
```
This uses the standard deviation of residuals as a proxy for average absolute error — a quick approximation that's reasonable for normally-distributed residuals.

---

### 95% Confidence Interval — In Plain Terms

When the forecast says "next month's revenue: ₹3,50,000 (95% CI: ₹3,20,000 – ₹3,80,000)", it means:

> "Based on the model and historical patterns, we're 95% confident that the actual revenue will fall somewhere between ₹3,20,000 and ₹3,80,000. There's a 5% chance it falls outside this range."

The width of the CI comes from the **standard deviation of past residuals** (how much the model was wrong historically). Wider CI = more uncertainty = less confident forecast.

In the code (`sales_model.py`, line 431):
```python
ci = fc.conf_int(alpha=0.05).values  # 95% CI
```

---

### ⚠️ Push the Sales Model to Git Before Interviews

The `.gitignore` file includes `sales_model/` — meaning this entire module isn't in your pushed repo. Fix this before interviews:

```bash
# 1. Edit .gitignore to stop ignoring sales_model
# Remove or comment out the line "sales_model/"

# 2. Also remove "sentiment_model/" from .gitignore

# 3. Stage and commit the files
git add -f sales_model/sales_model.py sales_model/generate_sales_data.py sales_model/basket_model.py
git add -f sales_model/__init__.py sales_model/check_data.py sales_model/smoke_test.py
git add -f sentiment_model/train_bert_sentiment.py sentiment_model/predict_sentiment.py
git add -f sentiment_model/generate_synthetic_dataset.py sentiment_model/analyze_reviews.py
git add -f sentiment_model/real_survey_data.csv

# 4. Don't push large files — keep these gitignored:
#    sales_data.csv (~11MB), basket_data.csv (~7.6MB),
#    classified_reviews.csv, saved_model/ (BERT weights ~400MB)

git commit -m "Add ML model source code (training, prediction, sales forecasting)"
git push
```

---

## 3d. Multi-Tenant Backend & Auth

**Files**: `backend/routers/auth_utils.py`, `backend/routers/auth.py`, `backend/main.py`

### JWT — JSON Web Token

**What it is**: A compact, URL-safe token that carries a JSON payload of claims (user identity, permissions, expiration). It allows **stateless authentication** — the server doesn't need to store session data in memory or a database.

**Structure** (3 parts, separated by dots):

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ2cmluZGF2YW5AYnJldy5jb20iLCJzaG9wIjoiVnJpbmRhdmFuIn0.abc123signature
|_______ Header ________|________________________ Payload __________________________|____ Signature ____|
```

| Part | Contains | Example |
|------|----------|---------|
| **Header** | Algorithm + token type | `{"alg": "HS256", "typ": "JWT"}` |
| **Payload** | Claims — user data + expiration | `{"sub": "vrindavan@brew.com", "shop": "Vrindavan", "role": "manager", "exp": 1720000000}` |
| **Signature** | HMAC-SHA256 of (Header + Payload + Secret Key) | Verifies the token hasn't been tampered with |

```mermaid
sequenceDiagram
    participant User as Shop Owner
    participant FE as React Frontend
    participant API as FastAPI Backend
    participant Store as users.json

    User->>FE: Enter email + password
    FE->>API: POST /api/auth/login
    API->>Store: Load users.json
    API->>API: Verify bcrypt hash
    API->>API: Generate JWT (HS256)
    API-->>FE: Return {token, email, shop, role}
    FE->>FE: Store JWT in localStorage
    
    Note over FE,API: All subsequent requests include JWT

    FE->>API: GET /api/sentiment/summary<br/>Authorization: Bearer <JWT>
    API->>API: Decode JWT → extract "shop"
    API->>API: Filter data for that shop only
    API-->>FE: Return shop-specific data
```

**Why stateless is good**: No session table to manage, no sticky sessions needed for load balancing, JWT is self-contained — the server just validates the signature and reads the claims.

**Code**: `auth_utils.py` line 90–94:
```python
def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
```

### What "Multi-Tenant" Means — And What We Actually Have

**Multi-tenancy** in SaaS means a single application instance serves multiple customers ("tenants") with data isolation between them.

| Tenancy Level | What It Means | Our System? |
|---------------|---------------|-------------|
| **Separate databases** | Each tenant gets their own database instance | ❌ No |
| **Shared database, separate schemas** | Same DB server, each tenant has own schema/tables | ❌ No |
| **Shared everything, row-level filtering** | Same tables, filter by tenant_id column | ✅ **This is what we have** |

**Our implementation**: All shops share the same `sales_data.csv` and the same backend server. Data isolation is achieved by:
1. JWT carries the `shop` claim → extracted via `get_current_shop()` dependency
2. Every API endpoint filters data to only return rows matching that shop
3. Uploaded reviews are saved in per-shop directories: `sentiment_model/shops/<shop_name>/classified_reviews.csv`

**How to explain this honestly**: "We implement logical multi-tenancy through JWT-based shop scoping. Each shop owner authenticates, and the backend filters all data queries to their shop. It's shared storage with per-tenant filtering — not separate databases. For a production system serving hundreds of tenants, I'd migrate to a proper database (PostgreSQL with row-level security or schema-per-tenant isolation), but for 9 outlets in a college project, file-based storage was sufficient and kept the deployment simple."

### bcrypt Password Hashing

**What it does**: Converts a plaintext password into an irreversible hash.

```python
pwd_ctx = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")
```

- `"brew123"` → `$2b$12$K4fP...` (a 60-character hash)
- Even if someone reads `users.json`, they can't reverse-engineer the password
- bcrypt is **slow by design** (uses key stretching with configurable rounds) — makes brute-force attacks impractical
- The `$2b$12$` prefix means: bcrypt version 2b, 12 rounds of key stretching (2¹² = 4,096 iterations)

### No Relational Database — How to Explain This

**What we use**: `users.json` for credentials, CSV files for reviews and sales data.

**Clean explanation**: "I chose file-based storage (JSON + CSV) to keep the stack simple and deployment-friendly — this project runs entirely with `uvicorn` and `npm run dev`, no Docker or database server needed. For 9 outlets and a few thousand rows, CSV/JSON is perfectly adequate and avoids the operational overhead of PostgreSQL or MySQL. If I were building this for production, I'd use PostgreSQL for structured data (users, transactions) and potentially S3/GCS for uploaded CSVs. The trade-offs I consciously accepted are: no ACID transactions across files, no concurrent write safety, and no query optimization — all of which are non-issues at our scale."

---

## 3e. Frontend Dashboard (React + TypeScript)

**Framework**: React 19 + TypeScript + Vite + React Router

### What the Dashboard Visualizes

| Page | KPIs / Visualizations | Business Purpose |
|------|----------------------|------------------|
| **Dashboard Overview** | Aggregate sentiment split, revenue snapshot, recent reviews | At-a-glance health check for the outlet owner |
| **Sentiment Analysis** | Sentiment trend (monthly), word cloud, review list with filters | Understand how customer opinion is trending over time |
| **Aspect Analysis** | Breakdown by Food/Service/Pricing/Ambience, top positive/negative phrases | Pinpoint which dimension to improve (e.g., "pricing is your weak spot") |
| **Sales Analytics** | Monthly revenue trend, MoM growth, top items by revenue, day-of-week traffic | Standard retail analytics — what's selling, when, and how growth is trending |
| **Sales Forecasting** | 90-day revenue forecast with confidence bands, weekly/monthly seasonality | Forward-looking planning — staff scheduling, inventory ordering |
| **Market Basket** | Association rules (A→B), bundle suggestions, cross-sell rate | Menu optimization — "customers who buy X also buy Y, so create a combo" |
| **Competitor Analysis** | Rating comparison, sentiment radar, price-quality scatter | Benchmarking against nearby outlets |
| **Recommendations** | AI-generated actionable suggestions with impact/effort scores | Translates data into plain-English next steps |

### Why These KPIs Were Chosen (Business Framing)

These aren't random metrics — they map directly to the **decisions a small restaurant owner makes daily**:

1. **"Should I change my menu?"** → Market Basket Analysis shows which items are bought together (create combos), top items by revenue (keep these), underperformers (consider dropping)
2. **"Am I getting better or worse?"** → Sentiment trend over time, MoM revenue growth, YoY comparison
3. **"What specifically should I fix?"** → Aspect Analysis shows if it's food quality, pricing, service, or ambience that's driving negative reviews
4. **"How much should I prepare for next month?"** → Revenue forecast with confidence bands informs inventory purchasing, staffing decisions
5. **"How do I compare to nearby competitors?"** → Competitor benchmarking puts the owner's metrics in context

---

# 4. LIKELY INTERVIEW QUESTIONS

## Category A: Algorithm & Design Choice Questions

### Q1: "Why did you choose BERT over simpler models like Logistic Regression or SVM?"
**Answer**: "Our reviews are short (10–30 words), informal, often contain negation ('not clean'), sarcasm, and code-mixed Hinglish. Classical models with bag-of-words features lose contextual relationships — they'd treat 'not good' and 'very good' similarly because both contain 'good.' BERT's self-attention mechanism captures word relationships regardless of distance, and its pretraining on massive text corpora gives it strong language understanding even with our relatively small fine-tuning dataset. The trade-off is latency (~50–100ms per prediction vs <1ms for LR), which is acceptable because we're doing batch classification and on-demand prediction, not real-time stream processing."

### Q2: "Why did you choose Facebook Prophet for forecasting?"
**Answer**: "Prophet is specifically designed for business time series data. It handles daily/weekly/yearly seasonality natively, is robust to missing data and outliers (like a random campus festival that causes a spike), and doesn't require the data to be stationary. Traditional models like ARIMA would require differencing and manual parameter tuning (p,d,q) which is harder to scale across 9 different shops. Prophet also provides Bayesian uncertainty intervals out-of-the-box, which is crucial for our 'confidence bands' in the UI."

### Q3: "How does Prophet handle seasonality?"
**Answer**: "Prophet models seasonality as an additive component using Fourier series. For our campus shops, we enabled `yearly_seasonality=True` and `weekly_seasonality=True`. This perfectly captures the drop in revenue during summer breaks (yearly) and the spike on Fridays/Saturdays compared to Mondays (weekly). By treating it as an additive component to a piecewise linear trend, Prophet cleanly separates the overall growth of the shop from these repeating cyclical patterns."

---

## Category B: Metrics & Evaluation Questions

### Q4: "Explain precision vs recall to me. When would you prefer one over the other?"
**Answer**: "Precision asks: 'of everything I flagged as X, how many actually were X?' Recall asks: 'of everything that actually was X, how many did I catch?' In our sentiment model, for Negative reviews, high recall is more important — we'd rather flag some Neutral reviews as Negative (false alarm, low precision) than miss genuinely negative reviews (low recall), because missed complaints means the shop owner doesn't know about real problems. In a fraud detection context at InCred, you'd want high recall on fraud (catch all fraud, even if some legitimate transactions get flagged for review) but you'd also monitor precision to avoid blocking too many good customers."

### Q5: "What's the difference between macro and weighted F1?"
**Answer**: "Macro F1 computes F1 for each class independently, then takes the unweighted average — every class counts equally regardless of size. Weighted F1 does the same but averages by class frequency. Macro is better when you care equally about all classes, especially minority ones. In our case, Negative reviews are ~20% of the dataset — macro F1 ensures the model's performance on that smaller class is weighted equally. If we had 95% Positive and 5% Negative, a model that always predicts Positive would get 95% weighted F1 but terrible macro F1."

### Q6: "Explain MAPE to a non-technical stakeholder."
**Answer**: "MAPE tells you how far off your forecast is, on average, in percentage terms. A MAPE of 6% means: on average, our revenue forecast is within 6% of the actual number. So if we forecast ₹10 lakh for next month, the actual is likely to be between ₹9.4 lakh and ₹10.6 lakh. It's like a weather forecast saying 'we're usually within 6% of the actual temperature.'"

---

## Category C: Data-Specific Questions

### Q7: "How did you clean your data?"
**Answer**: "We had a structured cleaning pipeline. First, we removed blank or incomplete survey submissions — rows where the review text was empty or the rating was missing. Then we deduped — same student, same shop, verbatim same text. For text normalization, we standardized casing (lowercased everything for the model), cleaned up the extra whitespace and emoji/special characters that are common in informal student writing, and standardized the rating column to integer 1–5. Finally, we filtered out non-informative reviews — things like a single word 'ok' or 'good' that don't carry enough semantic signal for the model."

### Q8: "How much real data did you actually have?"
**Answer** (be honest): "306 real survey responses across 9 shops, about 34 per shop. We augmented to approximately 2,300 total. I won't pretend that's a large dataset — but the augmentation was carefully controlled: each synthetic review was grounded in the real vocabulary and themes from our survey, not randomly generated. The real data served as the foundation — it defined the aspect-specific vocabulary, the types of complaints, and the writing style. The synthetic data extended coverage to balance class distributions."

### Q9: "How do you know your synthetic data isn't biased or unrealistic?"
**Answer**: "Three safeguards. First, the template bank for each shop was written to mirror actual themes from real reviews — for example, hygiene concerns for Manchurian Shop, pricing complaints for Juice Center. Second, we added text variations (casing, informal suffixes like 'ngl' and 'tbh') to prevent the model from overfitting to exact template strings. Third, the rating assignment for synthetic reviews follows the same distribution logic as real data (high-rating templates get 4–5 stars, low-rating templates get 1–2 stars). The limitation is that synthetic reviews don't capture truly novel complaints — they're recombinations of observed patterns. In production, this would be supplemented with continuous real data collection."

### Q10: "Why didn't you just scrape Zomato or Google Reviews?"
**Answer**: "Three reasons. First, web scraping raises IP and legal concerns — those reviews belong to their platforms. Second, Zomato reviews are written by a general public audience, not by our specific customer base (college students) — the vocabulary, concerns, and rating patterns would be different. Third, by running our own survey, we had ground truth on who the reviewer is and which shop they're reviewing, with no data quality issues like fake reviews."

---

## Category D: Model Quality & Deployment Questions

### Q11: "How would you evaluate if this model is actually good enough to deploy?"
**Answer**: "I'd run three checks. First, **quantitative**: run the trained model on a held-out test set of purely real reviews (not synthetic) and measure macro F1 — I'd want at least 0.75+ on real data. Second, **qualitative error analysis**: look at the misclassified reviews manually — are the errors on genuinely ambiguous reviews (acceptable) or on clearly positive/negative ones (concerning)? Third, **business validation**: show the per-shop sentiment breakdowns to people who actually eat at these places and ask if the results match their experience. If students say 'yeah, Manchurian Shop does have hygiene issues' and our model shows high negative sentiment on Ambience/cleanliness aspects for that shop, we know the pipeline is producing meaningful insights."

### Q12: "What would you do differently if you could start over?"
**Answer**: "Three things. First, I'd collect more real data — 1,000+ reviews instead of 306. I'd run the survey for a full semester instead of a few weeks and incentivize participation. Second, I'd use DistilBERT instead of BERT-base for faster inference with negligible accuracy loss. Third, I'd replace the keyword-based aspect extraction with a proper span-extraction model or at least a dependency-parsing approach that can handle multi-aspect reviews correctly."

### Q13: "How would you scale this to 10,000 restaurants?"
**Answer**: "Several changes. Backend: move from JSON/CSV files to PostgreSQL with row-level security for multi-tenancy, add Redis caching for analytics queries. ML: batch inference pipeline using Celery/RQ workers instead of on-request prediction, model serving via TorchServe or Triton Inference Server. Data: real integration with POS systems (Square, LightSpeed) instead of synthetic sales data, real-time review ingestion from Google Business/Zomato APIs. Forecasting: per-restaurant hyperparameter tuning using auto-ARIMA, and potentially switching to Prophet (handles holidays/seasonality more gracefully at scale)."

---

## Category E: Business Framing Questions

### Q14: "How does this project show business impact?"
**Answer**: "BrewAnalytics translates unstructured customer feedback into specific, actionable business decisions. A shop owner doesn't need to read 200 reviews — the dashboard tells them '65% of negative reviews mention pricing, and Food sentiment is trending down since February.' That's a direct input to pricing strategy and quality control. On the sales side, a 90-day forecast with confidence bands enables better inventory planning — if you know next month will be 15% lower (exam period), you buy less perishable stock. The market basket analysis directly enables revenue optimization through combo pricing — 'customers who buy shawarma also buy fries 40% of the time, create a combo deal.'"

### Q15: "How would a platform like this apply to lending/credit risk at InCred?"
**Answer**: "The core concepts directly transfer. **Sentiment analysis → credit risk signals**: Instead of classifying restaurant reviews, you'd analyze customer complaints, social media mentions, or Glassdoor reviews of borrower companies to detect early warning signals of distress. A spike in negative sentiment for a corporate borrower could be a leading indicator of financial trouble. **Forecasting → loan demand/default prediction**: The same STL + ARIMA approach applies to forecasting monthly loan disbursement volumes, EMI collection rates, or early warning delinquency trends with seasonality (e.g., post-Diwali spending spike → higher personal loan demand in November). **Market basket analysis → product cross-sell**: Which loan products are commonly taken together? If customers who take personal loans also frequently inquire about credit cards within 90 days, that's a cross-sell opportunity — similar to bundling food items."

---

## Category F: Guesstimate / Case Study Questions

### Q16: Case Study — "Estimate how many personal loans InCred might disburse in Mumbai next quarter. Walk me through your approach."

**Framework**:
1. **Market sizing**: Mumbai metro population ≈ 21 million. Working-age adults ≈ 60% = 12.6M. Of these, ~40% are salaried = 5M. Of salaried, ~20% might need a personal loan in any given year = 1M potential borrowers per year = ~250K per quarter.
2. **InCred's addressable share**: India's personal loan market has ~30-40 active lenders. InCred is a mid-sized player — let's assume 2-3% market share = 5,000–7,500 loans per quarter in Mumbai.
3. **Seasonal adjustment**: Q3 (Oct-Dec) includes Diwali — personal loan demand typically spikes 15-20% post-festival due to spending recovery. Q1 (Apr-Jun) is stable. Use the STL decomposition concept — identify the seasonal index for each quarter from historical data.
4. **Cross-check**: InCred's total AUM is reportedly ~₹10,000 Cr. If 30% is personal loans (₹3,000 Cr) with average ticket size ₹3L, that's ~100K active loans nationally. Mumbai might be ~30% = 30K active. New disbursements per quarter ≈ 20-25% of active book = 6,000-7,500.

**Tie-in to project**: "This is essentially what our forecasting engine does — we'd build a time series of historical monthly disbursements, fit a Prophet model to extract trend and seasonal patterns, and produce a forecast with confidence intervals."

### Q17: Case Study — "A small restaurant owner tells you negative reviews have increased 30% this month. How would you help them diagnose and fix this?"

**Framework** (directly from BrewAnalytics modules):
1. **Aspect analysis**: Run aspect extraction on the recent negative reviews. Is it Food (quality dropped?), Service (new staff member?), Pricing (recently raised prices?), or Ambience (cleanliness issue?)?
2. **Temporal analysis**: Plot the sentiment trend — is it a sudden spike (single event, like a bad day) or a gradual decline (systemic issue)?
3. **Comparison**: Compare this month's aspect breakdown to previous months. "Last month 60% of negatives were about Pricing, this month 80% are about Food Quality — something changed in the kitchen."
4. **Actionable recommendation**: Based on the dominant aspect, give specific interventions — "If it's hygiene: immediate deep clean, gloves for staff, visible hand-washing. If it's pricing: introduce a student combo meal under ₹100."
5. **Monitoring**: Track the sentiment trend weekly after intervention to measure impact.

**InCred parallel**: "This is identical to diagnosing a spike in loan delinquencies. You'd segment by product type (personal loan vs. business loan — analogous to aspects), check if it's concentrated in one geography or across the board, compare to historical seasonal patterns, and then target interventions (tighter underwriting in affected segments, proactive collection calls)."

---

## More Rapid-Fire Questions with Short Answers

### Q18: "Why FastAPI over Flask or Django?"
"FastAPI is async-native (handles concurrent requests better for real-time predictions), auto-generates OpenAPI documentation, and has built-in Pydantic validation for request/response schemas. Flask would work but requires more boilerplate; Django is overkill for an API-only backend with no ORM needs."

### Q19: "What does `stratify=labels` do in train_test_split?"
"It ensures each split (train/val/test) has the same proportion of each class as the full dataset. Without it, a random split on imbalanced data might put all Negative reviews in the training set and none in the test set, making the test metrics meaningless."

### Q20: "What's the difference between ARIMA and Prophet?"
"Prophet (by Meta) is designed for business time series with strong seasonal effects and holiday impacts. It handles missing data and outliers more gracefully than ARIMA and requires less statistical expertise to tune. We chose Prophet for forecasting at scale across many shops (less per-model tuning needed). Traditional ARIMA requires checking for stationarity, differencing, and finding optimal p, d, q parameters."

---

# 5. CONCEPT GLOSSARY

| Term | Plain-Language Definition |
|------|--------------------------|
| **DistilBERT** | A smaller, faster, cheaper and lighter Transformer model trained by distilling BERT base. It retains 97% of BERT's language understanding capabilities while being 40% smaller and 60% faster. |
| **Transformer** | The neural network architecture that BERT is built on. Its key innovation is "self-attention" — the ability for every word in a sentence to look at every other word to understand context. This replaced older architectures (LSTMs, RNNs) that processed text one word at a time in sequence. |
| **Tokenization** | The process of splitting text into smaller pieces ("tokens") that the model can process. DistilBERT uses WordPiece tokenization: common words stay whole ("the", "food"), but rare words get split into subwords ("unhygienic" → "un", "##hygienic"). This lets the model handle words it's never seen before. |
| **Fine-Tuning** | Taking a model that was already trained on a general task (like understanding English) and continuing to train it on your specific task (like classifying restaurant reviews as Positive/Neutral/Negative). You keep most of the model's learned knowledge and just adjust it for your particular domain. |
| **F1-Score** | The harmonic mean of precision and recall — a single number that balances "how many of my predictions were correct" (precision) and "how many of the actual positives did I catch" (recall). F1 ranges from 0 to 1, with 1 being perfect. It's preferred over accuracy when classes are imbalanced. |
| **Precision** | Of everything the model predicted as class X, what fraction actually was class X? High precision = few false positives. Example: if the model flags 100 reviews as Negative and 90 actually are, precision = 90%. |
| **Recall** | Of everything that actually belonged to class X, what fraction did the model catch? High recall = few false negatives. Example: if there are 100 truly Negative reviews and the model catches 80, recall = 80%. |
| **Confusion Matrix** | A table that shows, for every true class, how many examples were predicted as each class. The diagonal shows correct predictions; off-diagonal cells show specific types of errors. Essential for understanding *where* a model makes mistakes, not just how often. |
| **Facebook Prophet** | A forecasting procedure for time series data based on an additive model where non-linear trends are fit with yearly, weekly, and daily seasonality. Robust to missing data and shifts in trend. |
| **FP-Growth** | A frequent pattern mining algorithm used for market basket analysis. It's faster than the Apriori algorithm because it compresses the dataset into a tree structure instead of generating candidate itemsets. |
| **Association Rules** | "If-Then" statements that help uncover relationships between seemingly unrelated data in a relational database or other information repository (e.g., If someone buys a Burger, they also buy Fries). |
| **MAPE** | Mean Absolute Percentage Error — a forecast accuracy metric that expresses the average error as a percentage of the actual value. A MAPE of 5% means your forecasts are typically within 5% of reality. It's scale-independent, so you can compare forecast accuracy across outlets with very different revenue levels. |
| **Confidence Interval** | A range around a forecast that quantifies uncertainty. A "95% confidence interval" means: based on the model, there's a 95% probability the actual value will fall within this range. Wider intervals = more uncertainty. Calculated from the standard deviation of past prediction errors. |
| **JWT** | JSON Web Token — a standard for securely transmitting information between parties as a compact, digitally-signed JSON object. Used for authentication: after you log in, the server gives you a JWT that you send with every subsequent request to prove your identity, without the server needing to store session data. |
| **Multi-Tenancy** | A software architecture where a single instance of an application serves multiple customers ("tenants"), with each tenant's data isolated from others. Think of it like an apartment building — one building, many apartments, each with its own lock. |
| **bcrypt** | A password hashing algorithm designed to be intentionally slow (computationally expensive), making brute-force attacks impractical. It adds a random "salt" to each password before hashing, so two users with the same password get different hashes. Industry standard for storing passwords securely. |
| **Data Augmentation** | The technique of generating additional training data from existing data to improve model performance. In NLP, this can mean paraphrasing, synonym replacement, back-translation, or template-based generation. Used when real data is scarce or imbalanced. |
| **Class Imbalance** | When some classes in your dataset have far more examples than others. If 80% of reviews are Positive and only 5% are Negative, a model can get 80% accuracy by always predicting Positive — but it would never catch negative feedback. Addressed through augmentation, oversampling (SMOTE), or using appropriate metrics (macro F1 instead of accuracy). |
| **Proxy Labeling** | Deriving labels for a supervised learning task from a related signal when you don't have explicit human annotations. Example: using star ratings (1–5) to derive sentiment labels (Positive/Neutral/Negative). Also called "distant supervision." The assumption is that the proxy signal is a reasonable approximation of the true label. |

---

# 6. HONESTY CHEAT SHEET

| If They Ask... | Honest, Defensible Answer |
|----------------|--------------------------|
| **"How much of your data is real?"** | "306 real survey responses, augmented to ~2,300 total. About 13% real, 87% synthetic. The synthetic data is template-based and grounded in real vocabulary — not hallucinated by an LLM. I'm transparent about this because the augmentation was a deliberate methodology choice to address class imbalance and data scarcity, which are standard challenges in real-world ML." |
| **"What's your model's F1 score?"** | "I have the training pipeline but haven't saved the final classification report from my last run. Before this interview, I should rerun the training script to get a verified number. Based on the architecture and data size, I'd expect macro F1 in the 0.80–0.88 range for 3-class sentiment." *(Then before the interview, actually run it and know the real number.)* |
| **"What's your MAPE?"** | "The MAPE is approximated from the residual standard deviation of the ARIMA fit divided by the mean daily revenue. It's a proxy, not computed from a formal backtesting holdout. For a proper evaluation, I'd do walk-forward validation — train on months 1–12, test on month 13, slide forward, and average the MAPE across all test windows." |
| **"Why no real database?"** | "Deliberate simplicity — JSON + CSV keeps the stack lightweight (no Docker, no database server). For 9 outlets and a few thousand rows, it's perfectly adequate. In production, I'd use PostgreSQL for structured data and object storage (S3) for uploaded files. I chose to invest my time in the ML pipeline rather than database engineering." |
| **"Isn't keyword-based aspect extraction too simple?"** | "Yes, it's the simplest viable approach, and I chose it because time and annotation data were limited. It works for aggregated dashboard metrics but can't handle multi-aspect reviews correctly ('food great, service terrible' gets both aspects but one sentiment). To improve it, I'd fine-tune BERT with span annotations for aspect term extraction, or use an instruction-tuned LLM for zero-shot ABSA." |
| **"Is the sales data real?"** | "The baselines are real — daily customer counts and average order values were collected through conversations with outlet owners and personal observation. The full time series is synthetically generated from those baselines with realistic seasonality layers (day-of-week, exams, holidays, growth). We didn't have access to the restaurants' POS systems. The generator is reproducible and transparent — the business logic behind every multiplier is explicitly coded." |
| **"Would this work with real data at scale?"** | "The architecture is designed for it. The backend already handles per-shop data isolation via JWT scoping. The BERT model generalizes to unseen reviews (that's the point of fine-tuning). The ARIMA + STL pipeline would work on any daily revenue series. The main changes for production would be: real database, proper model serving (TorchServe), CI/CD for model retraining, and real-time data ingestion instead of CSV uploads." |

---

*Study this guide end to end. Run the training script to get your real F1 number. Fix the .gitignore and push the ML source code. Practice the Q&A section aloud. You've got this.* 🚀
