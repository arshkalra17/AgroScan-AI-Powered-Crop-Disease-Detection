from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import requests
import io
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["POST", "GET"],  
    allow_headers=["*"],
)

# Hugging Face API configuration
# Using a well-established plant disease classification model
HF_API_URL = "https://api-inference.huggingface.co/models/nateraw/vit-base-beans"
# Alternative models to try:
# "https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
# "https://api-inference.huggingface.co/models/Kaludi/Plant-Disease-Detector"
HF_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", "")  # Optional: add your token for better rate limits

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load class labels from JSON as fallback
with open(os.path.join(BASE_DIR, 'class_names.json'), 'r') as f:
    class_labels = json.load(f)

print(f"API ready - Using Hugging Face model for plant disease detection")

def query_huggingface(image_bytes):
    """Query Hugging Face API for plant disease classification"""
    headers = {"Content-Type": "application/octet-stream"}
    if HF_API_TOKEN:
        headers["Authorization"] = f"Bearer {HF_API_TOKEN}"
    
    try:
        response = requests.post(HF_API_URL, headers=headers, data=image_bytes, timeout=30)
        print(f"Response status: {response.status_code}")
        print(f"Response text: {response.text[:200]}")  # Print first 200 chars
        
        if response.status_code == 503:
            return {"error": "model_loading", "message": "Model is loading, please wait 20 seconds and try again"}
        
        if response.status_code != 200:
            return {"error": "api_error", "message": f"API returned status {response.status_code}"}
        
        return response.json()
    except Exception as e:
        print(f"Error querying Hugging Face: {e}")
        return {"error": "exception", "message": str(e)}

@app.post("/predict_tea_disease")
async def predict_disease(image: UploadFile = File(...)):
    """Predicts plant disease from an uploaded image using Hugging Face API."""
    try:
        # Read image
        image_bytes = await image.read()
        
        # Query Hugging Face API
        result = query_huggingface(image_bytes)
        
        # Check for errors
        if isinstance(result, dict) and "error" in result:
            error_msg = result.get("message", "Unknown error")
            if result["error"] == "model_loading":
                error_msg = "Model is loading on Hugging Face servers. Please wait 20-30 seconds and try again."
            
            return {
                "predicted_class": "Model Loading",
                "confidence_score": 0.0,
                "top_3_predictions": [],
                "error": error_msg
            }
        
        if result and isinstance(result, list) and len(result) > 0:
            # Format the response
            top_prediction = result[0]
            
            # Get top 3 predictions
            top_3 = result[:3] if len(result) >= 3 else result
            
            results = []
            for pred in top_3:
                results.append({
                    "class": pred.get("label", "Unknown"),
                    "confidence": float(pred.get("score", 0.0))
                })
            
            print(f"Top 3 Predictions:")
            for i, res in enumerate(results, 1):
                print(f"{i}. {res['class']}: {res['confidence']:.4f}")
            
            return {
                "predicted_class": top_prediction.get("label", "Unknown"),
                "confidence_score": float(top_prediction.get("score", 0.0)),
                "top_3_predictions": results
            }
        else:
            # Fallback response if API fails
            print(f"API returned unexpected result: {result}")
            return {
                "predicted_class": "Unable to classify",
                "confidence_score": 0.0,
                "top_3_predictions": [],
                "error": "Unexpected API response. The model may still be loading."
            }
            
    except Exception as e:
        print(f"Error processing image: {e}")
        return {
            "predicted_class": "Error processing image",
            "confidence_score": 0.0,
            "top_3_predictions": [],
            "error": str(e)
        }

@app.get("/test")
async def test():
    return {"message": "API is working - Using Hugging Face model"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
