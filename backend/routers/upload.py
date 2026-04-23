import os
import pandas as pd
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from services.nlp_service import get_predictor

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

CLASSIFIED_CSV = os.path.join(ROOT_DIR, "sentiment_model", "classified_reviews.csv")
EXTENDED_CSV = os.path.join(ROOT_DIR, "sentiment_model", "extended_reviews.csv")

router = APIRouter()

def process_and_append_reviews(df_new: pd.DataFrame):
    predictor = get_predictor()
    if predictor is None:
        raise Exception("Model predictor not loaded")

    # Ensure required columns
    if "Review" not in df_new.columns:
        raise Exception("Uploaded data must contain a 'Review' column")

    sentiments = []
    confidences = []
    for _, row in df_new.iterrows():
        text = str(row["Review"])
        result = predictor.predict(text)
        sentiments.append(result["sentiment"])
        confidences.append(result["confidence"])

    df_new["predicted_sentiment"] = sentiments
    df_new["confidence"] = confidences
    df_new["source"] = "uploaded"

    # Append to CLASSIFIED_CSV
    if os.path.exists(CLASSIFIED_CSV):
        df_existing = pd.read_csv(CLASSIFIED_CSV)
        df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    else:
        df_combined = df_new
    df_combined.to_csv(CLASSIFIED_CSV, index=False)

    # Append to EXTENDED_CSV (excluding predictions maybe, although keeping them is fine for consistency)
    if os.path.exists(EXTENDED_CSV):
        df_ext_existing = pd.read_csv(EXTENDED_CSV)
        df_ext_combined = pd.concat([df_ext_existing, df_new.drop(["predicted_sentiment", "confidence"], axis=1, errors='ignore')], ignore_index=True)
        df_ext_combined.to_csv(EXTENDED_CSV, index=False)

@router.post("/")
async def upload_dataset(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are allowed.")
    
    # Read file
    try:
        if file.filename.endswith(".csv"):
            df_new = pd.read_csv(file.file)
        else:
            df_new = pd.read_excel(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # Basic Validation
    if "Review" not in df_new.columns:
        raise HTTPException(status_code=400, detail="Missing required column: 'Review'")

    # Run processing synchronously or in background. For instantaneous UI update response we can do background, 
    # but since the user expects the UI to refresh immediately, processing a few rows synchronously might be better.
    # To keep it robust, we'll do it synchronously if size is small, or background if large. Let's just do it directly so UI can fetch the result.
    
    try:
        process_and_append_reviews(df_new)
        return {"message": "File processed and data updated successfully", "processed_records": len(df_new)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
