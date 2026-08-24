import gdown
import os

# TODO: Update this URL after uploading the new DistilBERT fine-tuned model to Google Drive.
# The current URL points to the old BERT model and is no longer compatible with the updated inference code.
url = "https://drive.google.com/drive/folders/1F6-Gc29poQhZv9YCZ4wDlPpMBrupz2K0"

# Ensure folder exists
os.makedirs("sentiment_model/saved_model", exist_ok=True)

gdown.download_folder(url, output="sentiment_model/saved_model", quiet=False)