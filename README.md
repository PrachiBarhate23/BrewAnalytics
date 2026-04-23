# BrewAnalytics 🍵

> **A full-stack, AI-powered restaurant analytics platform** built for the 9 campus food outlets at SPJIMR. Each shop gets its own isolated login, private data space, sales forecasting, and BERT-based sentiment analysis — all in one unified dashboard.

---

## ✨ Features at a Glance

| Module | What it does |
|---|---|
| 🔐 **Auth** | JWT login/signup per shop — managers only see their own data |
| 📊 **Sales Analytics** | Revenue KPIs, monthly trends, outlet comparisons, day-of-week patterns |
| 🔮 **Sales Forecasting** | STL decomposition + ARIMA(1,1,1) with 95% confidence intervals |
| 😊 **Sentiment Analysis** | Fine-tuned BERT for Positive / Neutral / Negative classification |
| 🔍 **Aspect Analysis** | Keyword-driven Food / Service / Pricing / Ambience breakdown |
| 📤 **Data Upload** | Separate upload buttons for reviews CSV and sales CSV |
| 🖥️ **Terminal Logging** | ARIMA MAPE, STL confidence, sentiment accuracy printed on every call |

---

## 🏗️ Tech Stack

**Backend**
- Python 3.9+ · FastAPI · Uvicorn
- `python-jose[cryptography]` — JWT auth
- `passlib[bcrypt]` — password hashing
- `statsmodels` — STL + ARIMA forecasting
- `transformers` + `torch` — BERT sentiment model
- `pandas` · `scikit-learn` · `openpyxl`

**Frontend**
- Vite + React + TypeScript
- Tailwind CSS · Recharts
- React Router · Lucide Icons

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+** and a virtual environment (`venv`)
- **Node.js v18+**
- **8 GB+ RAM** (BERT model needs ~500 MB for inference)

---

### Step 1 — Backend

```bash
# From the project root
cd backend

# Activate your virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

> The API will be live at **http://localhost:8000**  
> On first run `users.json` is auto-seeded with all 9 shop accounts.  
> The BERT model loads on the first `/api/sentiment/*` request (may take ~10 s).

---

### Step 2 — Frontend

```bash
# From the project root (new terminal)
npm install
npm run dev
```

> Dashboard is at **http://localhost:5173**

---

### Step 3 — Generate Test Data (one-time)

```bash
# From the project root
python generate_test_data.py
```

This creates:
- `sentiment_model/shops/<shop>/test_reviews_<shop>.csv` — 20 real reviews per shop
- `sales_model/test_data/<shop>_sales_test.csv` — 60-day realistic sales data per shop

---

## 🔑 Pre-seeded Login Credentials

Log in at **http://localhost:5173** with any of these accounts:

| Shop | Email | Password |
|------|-------|----------|
| Vrindavan | vrindavan@brew.com | brew123 |
| Cluckins | cluckins@brew.com | brew123 |
| Amar Frankie | amarfrankie@brew.com | brew123 |
| Manchurian Shop | manchurian@brew.com | brew123 |
| Shawarma Shop | shawarma@brew.com | brew123 |
| Juice Center | juicecenter@brew.com | brew123 |
| SPJIMR Mess | spjimr@brew.com | brew123 |
| College Canteen GF | canteengf@brew.com | brew123 |
| College Canteen 3F | canteen3f@brew.com | brew123 |
| **Admin** (all shops) | admin@brew.com | **admin123** |

> New shops can register via the **"Create Account"** tab on the login page.

---

## 📋 End-to-End Testing Walkthrough

### 1. Login & Dashboard
1. Open http://localhost:5173
2. Click **"Vrindavan"** in the Quick Demo Login section
3. You land on the Dashboard → KPIs and charts load for **Vrindavan only**

### 2. Upload Review Data (Sentiment)
1. Go to **Sentiment Analysis**
2. Click **"Upload Review Data (CSV)"**
3. Select `sentiment_model/shops/vrindavan/test_reviews_vrindavan.csv`
4. Watch the BERT model classify each review — terminal shows accuracy stats
5. Sentiment cards, trend chart, and word cloud all update

### 3. Upload Sales Data
1. Go to **Sales Analytics**
2. Click **"Upload Sales Data (CSV)"**
3. Select `sales_model/test_data/vrindavan_sales_test.csv`
4. KPIs, monthly trend, and outlet performance table update automatically

### 4. Sales Forecasting
1. Go to **Sales Forecasting**
2. Terminal shows: `ARIMA(1,1,1) · MAPE · Confidence %`
3. Change the **horizon** (30d / 60d / 90d / 180d) to see projections update
4. Shaded area = 95% confidence interval

### 5. Data Isolation Check
1. Log out → log in as `cluckins@brew.com`
2. Vrindavan's uploaded reviews are **not visible** — Cluckins sees only its own data

---

## 📁 Project Structure

```
BrewAnalytics/
├── backend/
│   ├── main.py                   # FastAPI app — registers all routers
│   ├── requirements.txt
│   ├── data/
│   │   └── users.json            # Auto-seeded shop accounts (gitignored)
│   ├── routers/
│   │   ├── auth.py               # POST /api/auth/login, /signup, /shops
│   │   ├── auth_utils.py         # JWT encode/decode · bcrypt · user seed
│   │   ├── upload.py             # POST /api/upload/reviews, /sales
│   │   ├── sentiment.py          # GET /api/sentiment/summary, /reviews, /aspects
│   │   ├── sales.py              # GET /api/sales/analytics, /forecast
│   │   ├── forecast.py
│   │   └── basket.py
│   └── services/
│       └── nlp_service.py        # BERT model loader + aspect extractor
│
├── sentiment_model/
│   ├── shops/
│   │   └── <shop>/
│   │       ├── classified_reviews.csv   # Per-shop uploaded + classified reviews
│   │       └── test_reviews_<shop>.csv  # Pre-built test file (20 rows)
│   └── extended_reviews.csv             # Source of truth (2304 rows)
│
├── sales_model/
│   ├── sales_model.py            # SalesAnalyticsEngine (STL + ARIMA)
│   ├── sales_data.csv            # 2-year synthetic campus sales dataset
│   ├── data/
│   │   └── <shop>_sales.csv      # Per-shop uploaded sales data
│   └── test_data/
│       └── <shop>_sales_test.csv # Pre-built 60-day test files
│
├── src/
│   └── app/
│       ├── context/
│       │   └── AuthContext.tsx   # JWT storage · login/signup/logout hooks
│       ├── pages/
│       │   ├── Login.tsx         # Sign In + Create Account tabs + quick demo
│       │   ├── DashboardLayout.tsx  # Protected route wrapper
│       │   ├── DashboardOverview.tsx # Live KPIs from API
│       │   ├── SentimentAnalysis.tsx # Upload + BERT results + word cloud
│       │   ├── AspectAnalysis.tsx    # Aspect breakdown + phrase drill-down
│       │   ├── SalesAnalytics.tsx    # Upload + KPIs + charts + outlet table
│       │   └── SalesForecasting.tsx  # ARIMA chart + seasonality + CI bands
│       └── components/
│           ├── Header.tsx        # Shop badge + logout button
│           └── Sidebar.tsx
│
├── generate_test_data.py         # Generates all 18 per-shop test CSVs
└── README.md
```

---

## 🧠 Model Architecture

### Sentiment — Fine-tuned BERT
- Base: `bert-base-uncased`
- Task: 3-class classification (Positive / Neutral / Negative)
- Both-Side Analysis: if |pos_score − neg_score| < 0.20 → classified as **Neutral**
- Confidence printed to terminal on every upload and live prediction

### Sales Forecasting — STL + ARIMA
```
2-year daily revenue
        ↓
STL (period=7, robust=True)
        ↓
  Trend | Seasonal | Residual
        ↓           ↓
 ARIMA(1,1,1)   Tile last 7-day cycle
        ↓           ↓
   Trend forecast + Seasonal = Final forecast
        ↓
 95% CI from 1.96 × residual σ
```
- **Terminal output on every call**: outlet name, horizon, MAPE %, confidence %, residual std

---

## 🖥️ Terminal Log Sample

When any forecast or sentiment request is made, the backend prints:

```
============================================================
🤖  [ARIMA] Outlet: Vrindavan | Horizon: 90d
    Method         : ARIMA(1,1,1) + STL Decomposition
    Data points    : 730
    Residual Std   : 1842.33
    MAPE (approx)  : 8.4%
    Model confidence: 91.6%
============================================================

============================================================
📊  [Sentiment/summary] Shop: Vrindavan
    Total reviews : 20
    Positive      : 14 (70.0%)
    Neutral       : 4  (20.0%)
    Negative      : 2  (10.0%)
    Avg confidence: 87.3%
============================================================
```

---

## 🔒 Security Notes

- JWTs expire after **24 hours** (configurable in `auth_utils.py`)
- All shop-scoped endpoints reject requests without a valid Bearer token
- Passwords are hashed with **bcrypt** (never stored in plain text)
- `SECRET_KEY` in `auth_utils.py` should be rotated for production deployments
- `backend/data/users.json` is listed in `.gitignore`

---

## 🤝 Attribution

See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for third-party libraries and data sources.