# BrewAnalytics - Implementation & Running Guide

This guide explains how to run the BrewAnalytics platform, covering the AI Sentiment module and the new Sales Analytics & Forecasting engine.

---

## 1. System Architecture

### A. Sentiment Analysis (`sentiment_model/`)
- **DistilBERT Model**: A fine-tuned `distilbert-base-uncased` model for Positive/Neutral/Negative classification.
- **Aspect Analysis**: Identifies focus points (Food, Service, Ambience, etc.) using keyword mapping and model insights.
- **Both-Side Analysis**: Uses a confidence delta heuristic to accurately classify mixed-sentiment reviews as "Neutral".

### B. Sales Analytics & Forecasting (`sales_model/`)
- **Engine**: Uses **Facebook Prophet Additive Model** for high-precision time-series forecasting.
- **Features**: Capture growth trends, weekly seasonality (e.g., weekend rushes), and monthly peak/low detection.
- **Outlet Projections**: Individual Prophet models for each of the 9 campus outlets.

---

## 2. Prerequisites
- **Python 3.9+**
- **Node.js v18+**
- **Hardware**: At least 8GB RAM (DistilBERT model requires ~300MB+ for inference).

---

## 3. Step-by-Step Running Guide

### Step 1: Backend Setup (FastAPI)
The backend hosts the AI models and data processing logic.
```bash
# 1. Open a terminal in the backend directory
cd d:\Desktop\brewAnalytics\BrewAnalytics\backend

# 2. Activate the virtual environment
venv\Scripts\activate

# 3. Start the FastAPI server
uvicorn main:app --reload
```
*The server will run at `http://127.0.0.1:8000`. It may take a few seconds to load the DistilBERT model on the first request.*

### Step 2: Frontend Setup (Vite + React)
The frontend provides the visual dashboard and interactive tools.
```bash
# 1. Open a new terminal in the root directory
cd d:\Desktop\brewAnalytics\BrewAnalytics

# 2. Start the development server
npm run dev
```
*Access the dashboard at `http://localhost:5173`.*

---

## 4. Working with the Models

### A. Refreshing Sales Data
If you want to re-generate the realistic 2-year campus sales dataset:
```bash
# Activate backend venv first
python sales_model/generate_sales_data.py
```

### B. Running Model Smoke Tests
To verify that the forecasting engine and sentiment engine are working correctly without starting the full UI:
```bash
# Test Sales Engine
python sales_model/smoke_test.py

# Test Sentiment Engine
python sentiment_model/analyze_reviews.py
```

---

## 5. Key Features to Test
1. **Sales Forecasting**: Navigate to the "Sales Forecasting" page. Change the **Horizon** (30d/60d/90d) to see the Prophet model adjust its projections and confidence bands.
2. **Aspect Drill-down**: In "Aspect-Based Analysis", click on any **Top Phrase** (e.g., "Quality Coffee") to instantly see all customer reviews associated with that specific feedback.
3. **Live AI Sentiment**: Type a complex review in the "Sentiment Analysis" page to see the DistilBERT model handle mixed sentiments in real-time.

