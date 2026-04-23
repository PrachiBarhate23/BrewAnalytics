import gdown
import os

url = "https://drive.google.com/drive/folders/1F6-Gc29poQhZv9YCZ4wDlPpMBrupz2K0"

# Ensure folder exists
os.makedirs("sentiment_model/saved_model", exist_ok=True)

gdown.download_folder(url, output="sentiment_model/saved_model", quiet=False)