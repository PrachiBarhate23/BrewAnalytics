import gdown
import os

url = "https://drive.google.com/drive/folders/1Dby0ONXly5y1K4vJOAvDHGK_Lh9eg_Rr"

# Ensure folder exists
os.makedirs("sentiment_model/saved_model", exist_ok=True)

gdown.download_folder(url, output="sentiment_model/saved_model", quiet=False)