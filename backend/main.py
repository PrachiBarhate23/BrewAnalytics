from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import sentiment, basket, upload, sales, auth

app = FastAPI(title="BrewAnalytics API")

# Setup CORS to allow Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",            tags=["Auth"])
app.include_router(sentiment.router, prefix="/api/sentiment",       tags=["Sentiment"])
app.include_router(basket.router,    prefix="/api/basket",          tags=["Basket"])
app.include_router(upload.router,    prefix="/api/upload",          tags=["Upload"])
app.include_router(basket.router_recs, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(sales.router,     prefix="/api/sales",           tags=["Sales"])

@app.get("/")
def read_root():
    return {"message": "BrewAnalytics API is running"}
