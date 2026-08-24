# BrewAnalytics — Complete Codebase Documentation

> **Generated:** April 2026  
> **Stack:** FastAPI (Python) + React 18 + Vite + TypeScript + TailwindCSS  
> **Purpose:** Multi-tenant analytics dashboard for campus food-outlet managers.  
> Provides sales analytics, forecasting, sentiment analysis, market basket analysis, competitor benchmarking, and smart recommendations — all scoped per logged-in shop.

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Directory Structure](#2-directory-structure)
3. [Backend — `backend/`](#3-backend)
   - [Entry Point: `main.py`](#31-entry-point-mainpy)
   - [Router: `auth.py`](#32-router-authpy)
   - [Utilities: `auth_utils.py`](#33-utilities-auth_utilspy)
   - [Router: `upload.py`](#34-router-uploadpy)
   - [Router: `sentiment.py`](#35-router-sentimentpy)
   - [Router: `basket.py`](#36-router-basketpy)
   - [Router: `sales.py`](#37-router-salespy)
   - [Service: `nlp_service.py`](#38-service-nlp_servicepy)
4. [ML Models — `sales_model/`](#4-ml-models--sales_model)
   - [`sales_model.py` — Sales Analytics & Forecasting Engine](#41-sales_modelpy--sales-analytics--forecasting-engine)
   - [`basket_model.py` — Market Basket Analysis Engine](#42-basket_modelpy--market-basket-analysis-engine)
5. [NLP/Sentiment — `sentiment_model/`](#5-nlpsentiment--sentiment_model)
   - [`train_bert_sentiment.py`](#51-train_bert_sentimentpy)
   - [`predict_sentiment.py`](#52-predict_sentimentpy)
   - [`analyze_reviews.py`](#53-analyze_reviewspy)
6. [Frontend — `src/`](#6-frontend--src)
   - [Entry Point: `main.tsx` + `App.tsx`](#61-entry-point-maintsx--apptsx)
   - [Routing: `routes.ts`](#62-routing-routests)
   - [Auth Context: `AuthContext.tsx`](#63-auth-context-authcontexttsx)
   - [Pages](#64-pages)
   - [Components](#65-components)
   - [Synthetic Data: `syntheticData.ts`](#66-synthetic-data-syntheticdatats)
7. [Data Flow Diagrams](#7-data-flow-diagrams)
8. [Algorithms & Logic Summary](#8-algorithms--logic-summary)
9. [Authentication & Multi-Tenancy Model](#9-authentication--multi-tenancy-model)
10. [Dependencies](#10-dependencies)

---

## 1. Project Architecture Overview

```
Browser (React SPA)
       │
       │  REST API  (JSON over HTTP)
       ▼
FastAPI Backend  (Python, port 8000)
  ├── Auth Router          → JWT-based login/signup
  ├── Upload Router        → CSV/XLSX ingestion + BERT classification
  ├── Sentiment Router     → Sentiment summaries, aspect analysis, live prediction
  ├── Basket Router        → Market basket analysis (co-occurrence)
  ├── Sales Router         → Sales KPIs + STL-ARIMA forecasting + competitor data
  └── Recommendations      → Derived recommendations from basket analysis
       │
       ├── SentimentPredictor (fine-tuned DistilBERT, `sentiment_model/saved_model/`)
       ├── SalesAnalyticsEngine (Facebook Prophet, `sales_model/sales_data.csv`)
       └── BasketAnalysisEngine (FP-Growth, `sales_model/basket_data.csv`)
```

All API endpoints are **shop-scoped** — the JWT token encodes the shop name, and every endpoint filters data to only that shop. The admin account (shop = `"All"`) sees aggregate data across all outlets.

---

## 2. Directory Structure

```
BrewAnalytics/
│
├── backend/                        # FastAPI application
│   ├── main.py                     # FastAPI app factory + router registration
│   ├── requirements.txt            # Python dependencies
│   ├── data/
│   │   └── users.json              # Persisted user accounts (auto-seeded)
│   ├── routers/
│   │   ├── auth.py                 # Login / Signup endpoints
│   │   ├── auth_utils.py           # JWT creation, password hashing, seed users
│   │   ├── basket.py               # Market basket + recommendations endpoints
│   │   ├── sales.py                # Sales analytics + forecasting + competitors
│   │   ├── sentiment.py            # Review data + sentiment summary + aspect analysis
│   │   └── upload.py               # File upload → CSV processing + BERT classification
│   └── services/
│       └── nlp_service.py          # BERT predictor singleton + aspect keyword map
│
├── sales_model/                    # Sales & basket ML models
│   ├── sales_model.py              # SalesAnalyticsEngine (Prophet)
│   ├── basket_model.py             # BasketAnalysisEngine (FP-Growth MBA)
│   ├── generate_sales_data.py      # Synthetic sales data generator
│   ├── sales_data.csv              # Main sales dataset (~11 MB)
│   ├── basket_data.csv             # Transaction basket dataset (~7 MB)
│   └── BrewAnalytics_Sales_Analysis_v2.xlsx  # Competitor benchmarking data
│
├── sentiment_model/                # NLP / BERT sentiment pipeline
│   ├── train_bert_sentiment.py     # BERT fine-tuning script
│   ├── predict_sentiment.py        # SentimentPredictor class + demo script
│   ├── analyze_reviews.py          # Batch review classification + seller report
│   ├── generate_synthetic_dataset.py  # Synthetic review generator
│   ├── extended_reviews.csv        # Training dataset (real + synthetic)
│   ├── classified_reviews.csv      # Output of analyze_reviews.py
│   ├── saved_model/                # Fine-tuned BERT weights (from Hugging Face)
│   └── shops/
│       └── <shop_name>/
│           └── classified_reviews.csv  # Per-shop review data after upload
│
├── src/                            # React 18 + TypeScript frontend
│   ├── main.tsx                    # ReactDOM entry point
│   ├── app/
│   │   ├── App.tsx                 # RouterProvider root
│   │   ├── routes.ts               # React Router v7 route definitions
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Global auth state + JWT helpers
│   │   ├── data/
│   │   │   └── syntheticData.ts    # Static fallback/demo data
│   │   ├── components/
│   │   │   ├── Header.tsx          # Top navigation bar
│   │   │   ├── Sidebar.tsx         # Left nav sidebar
│   │   │   ├── KPICard.tsx         # Reusable KPI card widget
│   │   │   ├── DataUploadModal.tsx # CSV/XLSX upload modal dialog
│   │   │   └── ui/                 # shadcn/ui primitives (48 files)
│   │   └── pages/
│   │       ├── Login.tsx           # Auth page (login + signup tabs)
│   │       ├── DashboardLayout.tsx # Shell layout (sidebar + header)
│   │       ├── DashboardOverview.tsx  # Overview landing page
│   │       ├── SentimentAnalysis.tsx  # Review & sentiment dashboard
│   │       ├── AspectAnalysis.tsx     # Aspect-based sentiment breakdown
│   │       ├── SalesAnalytics.tsx     # Revenue & transaction KPIs
│   │       ├── SalesForecasting.tsx   # Prophet forecast visualizations
│   │       ├── MarketBasket.tsx       # FP-Growth rules / top pairs / bundles
│   │       ├── CompetitorAnalysis.tsx # Benchmarking vs. other outlets
│   │       ├── Recommendations.tsx    # Actionable recommendations panel
│   │       ├── Reports.tsx            # Report generation page
│   │       └── Settings.tsx           # User & app settings page
│   └── styles/
│       ├── index.css               # Tailwind base import
│       ├── theme.css               # CSS custom properties (brand tokens)
│       ├── fonts.css               # Google Fonts @import
│       └── tailwind.css            # Tailwind utilities entry
│
├── index.html                      # Vite HTML shell
├── vite.config.ts                  # Vite build config
├── package.json                    # npm/pnpm dependencies
├── generate_test_data.py           # Root-level test data helper
└── download_model.py               # Script to download BERT checkpoint
```

---

## 3. Backend

### 3.1 Entry Point: `main.py`

**Purpose:** FastAPI application factory. Registers all routers and configures CORS.

**Key Logic:**
- Creates a `FastAPI` instance titled `"BrewAnalytics API"`.
- Adds `CORSMiddleware` with `allow_origins=["*"]` to allow the Vite dev server (port 5173) to call the API on port 8000.
- Registers 6 routers at the following prefixes:

| Prefix | Router | Tag |
|---|---|---|
| `/api/auth` | `auth.router` | Auth |
| `/api/sentiment` | `sentiment.router` | Sentiment |
| `/api/basket` | `basket.router` | Basket |
| `/api/upload` | `upload.router` | Upload |
| `/api/recommendations` | `basket.router_recs` | Recommendations |
| `/api/sales` | `sales.router` | Sales |

- Root `GET /` returns a health-check JSON.

---

### 3.2 Router: `auth.py`

**Purpose:** Handles user registration and login.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Validates credentials, returns JWT |
| `POST` | `/api/auth/signup` | Creates new user account, returns JWT |
| `GET` | `/api/auth/shops` | Returns list of valid shop names for signup dropdown |

**Logic — Login (`/login`):**
1. Calls `get_user_by_email(req.email)` to find user in `users.json`.
2. Calls `verify_password(plain, hashed)` (bcrypt comparison).
3. If valid, calls `create_access_token(payload)` and returns `AuthResponse` (token + email + shop + role).

**Logic — Signup (`/signup`):**
1. Validates that `req.shop` is one of the 9 `VALID_SHOPS` (or `"All"` for admin).
2. Checks no existing user has the same email.
3. Enforces minimum password length (6 chars).
4. Hashes the password, appends the user dict to `users.json`, and returns a fresh JWT.
5. Role assignment: `"admin"` if `shop == "All"`, else `"manager"`.

**Data Structure — Valid Shops:**
```
Vrindavan, Cluckins, Amar Frankie, Manchurian Shop, Shawarma Shop,
Juice Center, SPJIMR Mess, College Canteen Ground Floor, College Canteen 3rd Floor, All (admin)
```

---

### 3.3 Utilities: `auth_utils.py`

**Purpose:** All JWT and password helper functions, plus seed user initialization.

**Key Components:**

| Function | Algorithm/Library | Description |
|---|---|---|
| `hash_password(plain)` | `passlib` + `bcrypt` | Returns bcrypt hash of password |
| `verify_password(plain, hashed)` | `passlib` | Constant-time comparison |
| `create_access_token(data)` | `python-jose` + HS256 | Creates 24-hour JWT with `sub`, `shop`, `role`, `email` claims |
| `decode_token(token)` | `python-jose` | Decodes and validates JWT; raises 401 on failure |
| `get_current_user(token)` | FastAPI `Depends` | Dependency-injects decoded JWT payload |
| `get_current_shop(token)` | FastAPI `Depends` | Extracts `shop` claim from JWT |
| `_ensure_users_file()` | — | Auto-seeds `users.json` with 10 accounts on first run if file doesn't exist |

**Seed Accounts (created automatically):**
- 9 shop managers: default password `brew123`
- 1 admin (`admin@brew.com`): default password `admin123`

**JWT Configuration:**
```
SECRET_KEY = "brewanalytics-super-secret-key-change-in-prod-2026"
ALGORITHM  = "HS256"
TOKEN_EXPIRY = 24 hours
```

---

### 3.4 Router: `upload.py`

**Purpose:** Accepts uploaded CSV/XLSX files and processes them — either running BERT sentiment classification on reviews, or appending new records to per-shop sales CSVs.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload/reviews` | Upload review CSV → BERT classify → save per-shop |
| `POST` | `/api/upload/sales` | Upload sales CSV → validate → append per-shop |
| `POST` | `/api/upload/` | Legacy alias for `/reviews` |

**Review Upload Logic — `process_and_classify_reviews()`:**
1. Ensures uploaded DataFrame has a `"Review"` column.
2. For each row, calls `predictor.predict(text)` (the BERT model via `nlp_service.get_predictor()`).
3. **Confidence gate:** If BERT confidence > 0.4, uses the model prediction.
4. **Fallback:** If confidence ≤ 0.4 or model fails, falls back to the numeric `Rating` column:
   - Rating ≥ 4 → Positive (confidence 0.82)
   - Rating ≤ 2 → Negative (confidence 0.78)
   - Rating = 3 → Neutral (confidence 0.65)
5. Adds `predicted_sentiment`, `confidence`, `pos_score`, `neg_score`, `source="uploaded"` columns.
6. Merges with any existing shop CSV (deduplicating on `Review` text, keeping the latest).
7. Saves to `sentiment_model/shops/<safe_shop_name>/classified_reviews.csv`.

**Sales Upload Logic:**
1. Validates required columns: `date`, `revenue`, `transactions`.
2. Stamps `outlet = shop` (from JWT).
3. Parses `date` column, appends to existing shop sales CSV at `sales_model/data/<shop>_sales.csv`.

**Helper — `_safe_shop_name(shop)`:** Converts shop names to filesystem-safe strings (lowercase, spaces → underscores, strips special chars).

---

### 3.5 Router: `sentiment.py`

**Purpose:** Serves sentiment data to the frontend. Reads the per-shop `classified_reviews.csv` and computes summaries.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/sentiment/reviews` | Returns paginated list of reviews (filterable by query/sentiment) |
| `GET` | `/api/sentiment/summary` | Returns KPIs, trend chart data, word cloud, recent reviews |
| `GET` | `/api/sentiment/aspects` | Returns aspect-level sentiment breakdown (Food/Service/Pricing/Ambience) |
| `POST` | `/api/sentiment/predict` | Live prediction on a single text input (via BERT) |

**`load_reviews(shop)` — Data Loading Logic:**
1. Locates `sentiment_model/shops/<safe_shop>/classified_reviews.csv`.
2. Applies a neutralization threshold: if `|pos_score - neg_score| < 0.05`, overrides sentiment to `"Neutral"` (the model was too uncertain to classify firmly).

**Summary Endpoint Logic (`/summary`):**
1. Counts Positive / Neutral / Negative reviews and computes percentages.
2. **Trend Data:** Groups by `Timestamp` → `month` using `pd.Grouper`. Returns monthly sentiment counts sorted by calendar month.
3. **Word Cloud:** Tokenizes all review text, filters stopwords, uses `Counter.most_common(20)`. Maps count to font size in range [20, 50] using min-max normalization: `size = 20 + ((count - min) / (max - min)) * 30`.
4. **Recent Reviews:** Returns the 10 most recent reviews (sorted by Timestamp descending).

**Aspect Analysis Logic (`/aspects`):**
1. Calls `nlp_service.extract_aspects(review)` for every review.
2. Accumulates counts per aspect per sentiment into a `{positive, neutral, negative}` counter.
3. Computes `overallSatisfaction = total_positive_aspect_mentions / total_aspect_mentions * 100`.
4. Keyword matching for top positive / negative phrases using curated `POS_KW` / `NEG_KW` word lists.
5. Returns top 5 positive phrases and top 5 negative phrases using `Counter.most_common(5)`.

---

### 3.6 Router: `basket.py`

**Purpose:** Exposes Market Basket Analysis results and generates recommendations from them.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/basket/analysis` | Full MBA analysis for the shop |
| `GET` | `/api/basket/rules` | Legacy endpoint — rules in 0-1 decimal format |
| `GET` | `/api/recommendations/` | Recommendation cards derived from basket analysis |

**Recommendation Generation Logic:**
1. **Rec 1 (Menu Optimisation):** Takes the highest-lift bundle from `BasketAnalysisEngine.bundles` and suggests a combo deal with confidence% and lift score.
2. **Rec 2 (Revenue Optimisation):** Takes the top item by frequency, finds its complementary item from association rules (antecedent match), and suggests an upsell.
3. **Rec 3 (Customer Experience):** Uses the `cross_sell_rate` KPI (% of customers buying 2+ items) to suggest signage or loyalty incentives.

---

### 3.7 Router: `sales.py`

**Purpose:** Sales analytics KPIs, STL+ARIMA forecasting, and competitor benchmarking.

**Engine Caching:** A module-level `_engines: dict` caches one `SalesAnalyticsEngine` instance per shop. The `get_engine(shop)` function lazy-loads and caches engines so the CSV is only read once per shop per server session. The `/refresh` endpoint forces re-initialization.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/sales/analytics` | Revenue KPIs, monthly trend, top items, day-of-week pattern |
| `GET` | `/api/sales/forecast?horizon=90` | STL+ARIMA forecast (7–365 days) |
| `POST` | `/api/sales/refresh` | Clears engine cache for the shop |
| `GET` | `/api/sales/competitors` | Competitor benchmarking from Excel file |

**Competitor Endpoint Logic:**
1. Reads `sales_model/BrewAnalytics_Sales_Analysis_v2.xlsx` sheet `"Sales Analysis"` (skips 2 header rows).
2. For each row, extracts outlet name, demand index, avg order value, sentiment signal.
3. **Fuzzy shop matching:** Uses substring containment (`shop_l in name_l or name_l in shop_l`) to find the current user's own shop and highlight it in a different color.
4. **Derived metrics:**
   - `Rating = min(5.0, 3.5 + demand / 200)` (mocked from demand index).
   - `Market Share = (demand / 1000) * 100` (mocked).
   - `Trend = "up"` if demand > 120, `"down"` if < 80, else `"stable"`.
5. If user's shop is not in the dataset, injects a synthetic entry using analytics engine stats.
6. Returns a hardcoded `sentimentRadarData` comparing "Your Cafe" vs "Avg Competitor" across 6 dimensions.

---

### 3.8 Service: `nlp_service.py`

**Purpose:** Singleton wrapper that loads the BERT model once and exposes `get_predictor()` and `extract_aspects()`.

**Singleton Pattern:** The module-level `_predictor = None` variable is initialized on first call to `get_predictor()`. This avoids reloading the ~300 MB model on every request.

**`extract_aspects(text)` Logic:**
Maps review text against 4 aspect categories using keyword lookup:

| Aspect | Example Keywords |
|---|---|
| Food | taste, flavor, fresh, stale, delicious, menu, coffee, burger, sandwich... |
| Service | slow, fast, wait, staff, rude, friendly, delivery, wrong order... |
| Pricing | expensive, overpriced, affordable, value, worth, cost... |
| Ambience | atmosphere, cozy, noisy, hygiene, clean, dirty, seating, lighting... |

If no keywords match, defaults to `["Food"]`.

---

## 4. ML Models — `sales_model/`

### 4.1 `sales_model.py` — Sales Analytics & Forecasting Engine

**Class:** `SalesAnalyticsEngine`

**Initialization:**
1. Loads `sales_data.csv` (or runs the data generator if CSV doesn't exist).
2. Filters rows to the given `outlet` using exact match first, falling back to partial/substring match.
3. If no rows match the outlet, falls back to the full dataset (failsafe).
4. Builds `self.daily_total` — a daily revenue `pd.Series` deduplicated by `(date, outlet)`.

---

#### Analytics Summary (`get_analytics_summary()`)

Returns all data needed for the Sales Analytics dashboard:

| Output Key | Computation |
|---|---|
| `kpis.total_revenue` | `df.drop_duplicates(['date','outlet'])['revenue'].sum()` |
| `kpis.revenue_growth` | `(cur_month_rev - prev_month_rev) / prev_month_rev * 100` |
| `kpis.txn_growth` | Same MoM formula on `transactions` column |
| `kpis.avg_order_value` | `df['avg_order_value'].mean()` |
| `kpis.active_outlets` | `df['outlet'].nunique()` |
| `monthly_trend` | Last 13 months grouped by year-month period |
| `outlet_performance` | Revenue + transactions + MoM growth per outlet, sorted by revenue |
| `top_items` | `groupby(['outlet','item'])['item_revenue'].sum()` — top 10 |
| `dow_pattern` | Mean revenue per day-of-week (Mon–Sun) |
| `item_mix` | Top 8 items by revenue share (pie chart data) |

---

#### Forecasting (`get_forecast(horizon_days=90)`)

**Algorithm: Facebook Prophet Additive Model**

**Step 1 — Model Fitting:**
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
- Fits an additive time-series model handling weekly and yearly seasonality natively.
- Handles missing data and holidays gracefully.
- `interval_width=0.95` computes 95% Bayesian uncertainty intervals.

**Step 2 — Generate Forecast:**
```python
future = model.make_future_dataframe(periods=horizon_days)
forecast = model.predict(future)
```
Forecast values are clipped to ≥ 0 (revenue cannot be negative).

**Step 3 — MAPE Approximation:**
Calculated using standard deviation of historical residuals vs average daily revenue.

**Additional Outputs:**
- `weekly_seasonality`: Normalized index by day-of-week (100 = average weekday).
- `monthly_seasonality`: Monthly index identifying peak months (≥ 115) and low months (≤ 85).
- `outlet_forecasts`: Per-outlet 30-day Prophet projections using last 90 days of data.
- `item_demand_forecast`: Momentum-based item demand: `forecast = current * (1 + (current - prev) / prev)`.

---

### 4.2 `basket_model.py` — Market Basket Analysis Engine

**Class:** `BasketAnalysisEngine`

**Algorithm: FP-Growth (via mlxtend)**

**Step 1 — Load & Filter:**
Loads `basket_data.csv` and filters to the shop using the same 3-way match.

**Step 2 — Encode Transactions:**
```python
from mlxtend.preprocessing import TransactionEncoder
te = TransactionEncoder()
te_array = te.fit(txn_lists).transform(txn_lists)
txn_df = pd.DataFrame(te_array, columns=te.columns_)
```

**Step 3 — FP-Growth Frequent Itemsets:**
```python
frequent_itemsets = fpgrowth(txn_df, min_support=0.01, use_colnames=True)
```
Extracts all frequent item combinations occurring in at least 1% of transactions.

**Step 4 — Association Rules Extraction:**
```python
rules_df = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
```
Filtered to 1-to-1 rules (e.g. A → B).

| Metric | Description |
|---|---|
| Support | % of total transactions containing both items |
| Confidence | Probability of buying B given A is bought |
| Lift | How much more likely B is bought given A compared to random chance |
| Conviction | Measure of dependence between A and B |

**Step 5 — Rule Filtering & Ranking:**
Rules sorted by `lift` descending. Top 20 rules returned.

**Step 5 — Bundle Suggestions:**
Deduplicates rules into item-pair bundles (up to 3), formatted as `"Item A + Item B Bundle"`.

**KPI Outputs:**

| KPI | Computation |
|---|---|
| `avg_items_per_txn` | Mean of basket sizes across all transactions |
| `cross_sell_rate` | % of baskets containing ≥ 2 unique items |
| `unique_items` | Distinct item count |
| `top_items` | Top 12 items by purchase frequency with % of transactions |

---

## 5. NLP/Sentiment — `sentiment_model/`

### 5.1 `train_bert_sentiment.py`

**Purpose:** Fine-tunes `bert-base-uncased` for 3-class sentiment classification.

**Key Design Decision:** Labels are derived from **star ratings**, not from manual text annotation:
```
Rating 4–5 → Positive (label 0)
Rating 3   → Neutral  (label 1)
Rating 1–2 → Negative (label 2)
```
This allows the model to learn sentiment from real human rating behavior, eliminating the need for expensive manual labeling.

**Pipeline:**
1. Loads `extended_reviews.csv` (real + synthetic reviews).
2. Derives labels using `rating_to_sentiment()`.
3. Splits 80/10/10 train/val/test with stratified sampling.
4. Tokenizes with `BertTokenizer` — max length 128 tokens, padded, truncated.
5. Feeds through `BertForSequenceClassification` (3 output labels).

**Training Configuration:**
```
Optimizer:    AdamW (lr=2e-5, weight_decay=0.01)
Batch size:   16
Epochs:       1
Scheduler:    Linear warmup (10% of steps)
Gradient clip: 1.0 (prevents exploding gradients)
```

**Training Loop (`train_epoch`):**
- Forward pass → cross-entropy loss.
- Backpropagates, clips gradients, steps optimizer & scheduler.
- Best model (by validation accuracy) is saved to `saved_model/`.

---

### 5.2 `predict_sentiment.py`

**Purpose:** Inference wrapper. Loads the saved BERT and provides the `SentimentPredictor` class.

**`predict(text)` Method:**
1. Cleans input: converts NaN to empty string, replaces empty with `"Neutral"`.
2. Tokenizes with `encode_plus()`: adds `[CLS]`/`[SEP]` tokens, pads to 128, returns PyTorch tensors.
3. Runs forward pass under `torch.no_grad()`.
4. Applies `softmax` to logits to get class probabilities.
5. Returns `{ text, sentiment, confidence, scores: {Positive, Neutral, Negative} }`.

**Label Mapping:** `0 → Positive, 1 → Neutral, 2 → Negative`

---

### 5.3 `analyze_reviews.py`

**Purpose:** Standalone batch script — classifies ALL reviews in `extended_reviews.csv` using BERT and generates a per-shop seller report.

**Workflow:**
1. Instantiates `SentimentClassifier` (same BERT inference as `predict_sentiment.py`).
2. Iterates all rows, calls `classify(review)`, collects sentiment + confidence scores.
3. Saves labeled data to `classified_reviews.csv`.
4. For each shop: computes sentiment percentages, calls `generate_suggestions()`, calls `extract_issues()`.
5. Saves full text report to `seller_analysis_report.txt`.

**`generate_suggestions()` Logic:**
- If `neg_pct > 30`: urgent warning.
- If `neg_pct > 20`: moderate warning.
- For each detected issue category (keyword-matched), appends a specific suggestion.

**`extract_issues()` Algorithm:**
- For each review text, checks for presence of any keyword in each of 6 issue categories (case-insensitive substring match).
- Categories: Hygiene & Cleanliness, Food Quality, Pricing, Service & Speed, Menu & Variety, Portion Size.

---

## 6. Frontend — `src/`

### 6.1 Entry Point: `main.tsx` + `App.tsx`

**`main.tsx`:** Standard React 18 entry point, renders `<App />` into `#root`.

**`App.tsx`:** Wraps the app in `<AuthProvider>` (global auth context) and `<RouterProvider router={router}>` (React Router v7).

---

### 6.2 Routing: `routes.ts`

Uses React Router v7 `createBrowserRouter`. Nested route structure:

```
"/"                  → Login page
"/dashboard"         → DashboardLayout (shell with sidebar + header)
  index              → DashboardOverview
  "sentiment"        → SentimentAnalysis
  "aspect"           → AspectAnalysis
  "sales"            → SalesAnalytics
  "forecasting"      → SalesForecasting
  "market-basket"    → MarketBasket
  "competitor"       → CompetitorAnalysis
  "recommendations"  → Recommendations
  "reports"          → Reports
  "settings"         → Settings
```

---

### 6.3 Auth Context: `AuthContext.tsx`

**Purpose:** Central React Context for authentication state. Persists JWT across page reloads using `localStorage`.

**State:** `user: { email, shop, role, token } | null`

**Key Functions:**

| Function | What It Does |
|---|---|
| `login(email, password)` | `POST /api/auth/login` → stores user in state + `localStorage` |
| `signup(email, password, shop)` | `POST /api/auth/signup` → stores user in state + `localStorage` |
| `logout()` | Clears state and removes `localStorage["brew_user"]` |
| `authHeader()` | Returns `{ Authorization: "Bearer <token>" }` for API calls |
| `isAuthenticated` | Derived boolean (`!!user`) |

**Persistence Key:** `"brew_user"` in `localStorage` (re-hydrated on mount via `useState` initializer).

---

### 6.4 Pages

#### `Login.tsx`
Two tabs (Login / Signup). Calls `useAuth().login()` or `useAuth().signup()`. Fetches `/api/auth/shops` to populate shop dropdown. Navigates to `/dashboard` on success.

#### `DashboardLayout.tsx`
Shell rendering `<Sidebar />` + `<Header />` + `<Outlet />` (React Router nested outlet). No business logic.

#### `DashboardOverview.tsx`
- Fetches `/api/sales/analytics` and `/api/sentiment/summary` in parallel on mount.
- 5 KPI cards: Total Revenue, Monthly Growth, Avg Order Value, Positive Sentiment %, Top Selling Item.
- Charts: Revenue trend line (Recharts), Sentiment pie, Top Items bar.
- **Live Insights panel:** 4 dynamic cards generated from live API data:
  - Static peak hour advisory.
  - Sentiment alert (green if positive > 60%, red otherwise).
  - Top item opportunity (from `topItems[0]`).
  - Revenue trend badge (from `kpis.revenue_growth`).

#### `SentimentAnalysis.tsx`
Fetches `/api/sentiment/summary` and `/api/sentiment/reviews`. Supports keyword search + sentiment filter. Upload modal posts to `/api/upload/reviews`. Shows: KPI cards, trend chart, recent reviews table, word cloud.

#### `AspectAnalysis.tsx`
Fetches `/api/sentiment/aspects`. Shows: Stacked bar chart per aspect (Food/Service/Pricing/Ambience), top positive/negative phrases, overall satisfaction score.

#### `SalesAnalytics.tsx`
Fetches `/api/sales/analytics`. Shows: Revenue/transaction KPIs, monthly dual-axis chart, outlet performance table, top items chart, day-of-week heatmap, item mix pie chart. Has CSV upload modal for sales data.

#### `SalesForecasting.tsx`
Fetches `/api/sales/forecast?horizon=<N>`. Configurable horizon selector (30/60/90/180/365 days). Shows: Forecast vs. actual chart, model confidence KPI, weekly/monthly seasonality charts, outlet-level forecast bar, item demand forecast table.

#### `MarketBasket.tsx`
Fetches `/api/basket/analysis`. Shows: Transaction KPIs, top items table, top pairs table, association rules table (antecedent → consequent, support, confidence, lift), bundle suggestions.

#### `CompetitorAnalysis.tsx`
Fetches `/api/sales/competitors`. Shows: Rating comparison bar chart, sentiment radar chart, price-quality scatter/bubble chart, competitor metrics table.

#### `Recommendations.tsx`
Fetches `/api/recommendations/`. Shows recommendation cards with title, category, severity, description, impact/effort/ROI, and action checklist.

#### `Reports.tsx` + `Settings.tsx`
Primarily UI scaffolding — no active API calls. Show static configuration and account settings UI.

---

### 6.5 Components

#### `Header.tsx`
Search bar, shop badge, date range picker, notifications bell, user avatar (initials from shop name), logout button.
- Logout: `useAuth().logout()` + navigate to `"/"`.
- Avatar initials: first letter of each word in shop name (up to 2 chars, uppercase).

#### `Sidebar.tsx`
Navigation list linking to all dashboard routes. Active link highlighting via `useLocation().pathname`.

#### `KPICard.tsx`
Reusable card: title, value, change indicator (positive/negative colored), icon, optional subtitle.

#### `DataUploadModal.tsx`
Modal dialog (shadcn `Dialog`). Accepts CSV/XLSX via file input. Sends `FormData` with `Authorization` header to configured endpoint. Shows success/error feedback.

#### `ui/` (48 files)
shadcn/ui component primitives wrapping Radix UI headless components. Notable: `chart.tsx` (Recharts wrapper), `dialog.tsx`, `tabs.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `table.tsx`.

---

### 6.6 Synthetic Data: `syntheticData.ts`

Static TypeScript arrays used as demo/fallback data:

| Export | Contents |
|---|---|
| `generatedSalesData` | 30 days of revenue + transaction data (Nov 2023) |
| `generatedSentimentReviews` | 30 sample customer reviews with pre-labeled sentiment |
| `generatedMarketBasketRules` | 20 sample association rules (e.g., Cappuccino → Croissant) |
| `generatedInsights` | 20 AI insight cards covering various operational scenarios |

---

## 7. Data Flow Diagrams

### Review Upload & Sentiment Query

```
User uploads CSV (frontend DataUploadModal)
    │
    ▼ POST /api/upload/reviews (multipart/form-data + JWT)
upload.py
    ├── Reads DataFrame
    ├── For each row → nlp_service.get_predictor().predict(text)
    │       └── BERT tokenize → forward pass → softmax → confidence check
    ├── Fallback: use Rating column if confidence ≤ 0.4
    └── Saves to sentiment_model/shops/<shop>/classified_reviews.csv
    │
User opens Sentiment Analysis page
    │
    ▼ GET /api/sentiment/summary (with shop JWT)
sentiment.py
    ├── load_reviews(shop) → reads shop CSV
    ├── Applies uncertainty neutralization (|pos - neg| < 0.05)
    ├── Computes positive/neutral/negative %
    ├── Builds monthly trend, word cloud, recent reviews
    └── Returns JSON to frontend
```

### Sales Forecast Flow

```
User opens Sales Forecasting page
    │
    ▼ GET /api/sales/forecast?horizon=90 (with shop JWT)
sales.py → get_engine(shop) [cached per session]
    │         └── SalesAnalyticsEngine(outlet=shop)
    │                 └── loads + filters sales_data.csv
    │
    └── get_engine(shop).get_forecast(horizon_days=90)
            │
            ├── 1. Build daily_total Series (deduplicated revenue)
            ├── 2. STL(series, period=7, robust=True).fit()
            │       → trend, seasonal, residuals
            ├── 3. ARIMA(trend, order=(1,1,1)).fit()
            │       → trend_forecast + 95% CI
            ├── 4. Add last 7-day seasonal cycle (tiled)
            │       → final_forecast = trend_forecast + seasonal_ext
            ├── 5. Clip negatives, aggregate to monthly
            ├── 6. Compute model_confidence = 100 - MAPE
            └── Returns chart_data + kpis + seasonality + outlet_forecasts
```

---

## 8. Algorithms & Logic Summary

| Feature | Algorithm / Technique | Location |
|---|---|---|
| Password hashing | bcrypt via `passlib` | `auth_utils.py` |
| JWT authentication | HS256 via `python-jose` | `auth_utils.py` |
| Sentiment classification | Fine-tuned `distilbert-base-uncased` (3-class) | `sentiment_model/` |
| DistilBERT inference | Tokenize → forward → softmax → argmax | `predict_sentiment.py` |
| Aspect detection | Dictionary keyword matching (4 categories) | `nlp_service.py` |
| Word cloud sizing | Min-max normalization [20, 50] font range | `sentiment.py` |
| Sales forecasting | Facebook Prophet Additive Model | `sales_model.py` |
| Prophet fallback | Linear extrapolation (for small outlet data) | `sales_model.py` |
| Model accuracy proxy | MAPE via `resid_std / avg_revenue` | `sales_model.py` |
| Item demand forecast | Momentum-based linear extrapolation | `sales_model.py` |
| Market basket analysis | FP-Growth (`mlxtend`) | `basket_model.py` |
| Association rule metrics | Support, Confidence, Lift, Conviction | `basket_model.py` |
| Rule ranking | Sort by `lift` descending | `basket_model.py` |
| Competitor rating | `min(5.0, 3.5 + demand/200)` synthetic calc | `sales.py` |
| Shop fuzzy matching | 3-way: exact → substring → reverse substring | `sales_model.py`, `basket_model.py` |
| Sentiment neutralization | Override if `|pos_score - neg_score| < 0.05` | `sentiment.py` |
| Upload deduplication | `drop_duplicates(subset=["Review"], keep="last")` | `upload.py` |

---

## 9. Authentication & Multi-Tenancy Model

The system implements **JWT-based multi-tenancy** where the shop name in the token acts as the tenant key:

```
Login                     →  JWT contains: {sub, email, shop, role, exp}

Every protected endpoint  →  FastAPI Depends(get_current_shop)
                              → decodes JWT → returns shop string

Data filtering            →  All CSV reads filter on the shop name
```

**Roles:**
- `"manager"`: Sees only their own shop's data.
- `"admin"` (shop = `"All"`): Engines load the full unfiltered dataset.

**Token Storage (Frontend):** JWT stored as JSON in `localStorage["brew_user"]`. Re-hydrated on page load via `useState` initializer in `AuthContext`.

---

## 10. Dependencies

### Python (Backend)
| Package | Purpose |
|---|---|
| `fastapi` | Web framework + API routing |
| `uvicorn` | ASGI server |
| `pandas` | Data manipulation (CSV reading, groupby, aggregation) |
| `scikit-learn` | Polynomial regression fallback for forecasting |
| `statsmodels` | STL decomposition + ARIMA model |
| `transformers` | HuggingFace BERT tokenizer + model |
| `torch` | PyTorch for BERT inference |
| `python-multipart` | File upload support in FastAPI |
| `openpyxl` | Reading `.xlsx` files (competitor data + sales upload) |
| `pydantic` | Request/response validation schemas |
| `python-jose[cryptography]` | JWT encoding/decoding |
| `passlib[bcrypt]` | Password hashing |

### JavaScript (Frontend)
| Package | Purpose |
|---|---|
| `react` + `react-dom` 18 | UI framework |
| `react-router` 7 | Client-side routing |
| `recharts` | All charts (line, bar, pie, radar) |
| `lucide-react` | Icon library |
| `@radix-ui/*` (28 packages) | Headless accessible UI primitives |
| `tailwindcss` 4 | Utility-first CSS framework |
| `class-variance-authority` + `clsx` | Conditional className helpers |
| `sonner` | Toast notification system |
| `motion` | Animation library |
| `react-hook-form` | Form state management |
| `vite` | Build tool + dev server |

---

*Documentation generated from full source code analysis of the BrewAnalytics repository.*
