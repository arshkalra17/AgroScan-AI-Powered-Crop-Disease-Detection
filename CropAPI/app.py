from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import tensorflow as tf
import numpy as np
import pandas as pd
import logging

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["POST", "GET"],  
    allow_headers=["*"],
)

import os
import json

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Try loading different models
try:
    model = tf.keras.models.load_model(
        os.path.join(BASE_DIR, 'plant_disease_model.h5'),
        compile=False
    )
    print("Loaded plant_disease_model.h5")
    MODEL_INPUT_SIZE = (224, 224)
except Exception as e:
    print(f"Error loading plant_disease_model: {e}")
    try:
        model = tf.keras.models.load_model(
            os.path.join(BASE_DIR, 'crop_disease_model_1epoch_high_accuracy.h5'),
            compile=False
        )
        print("Loaded crop_disease_model_1epoch_high_accuracy.h5")
        MODEL_INPUT_SIZE = (128, 128)
    except Exception as e2:
        print(f"Error loading crop model: {e2}")
        raise

# Load class labels from JSON
with open(os.path.join(BASE_DIR, 'class_names.json'), 'r') as f:
    class_labels = json.load(f)

# Debugging: Print class labels to verify correctness
print(f"Loaded {len(class_labels)} disease classes")
print(f"Model input size: {MODEL_INPUT_SIZE}")
print(f"Sample classes: {class_labels[:5]}")

def preprocess_image(image: UploadFile):
    """Preprocesses an image for model input using standard ImageNet preprocessing."""
    img = Image.open(image.file)
    img = img.convert("RGB")
    resized = img.resize(MODEL_INPUT_SIZE, Image.LANCZOS)
    
    # Convert to array and normalize to [0, 1]
    img_array = np.array(resized, dtype=np.float32)
    img_array = img_array / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.post("/predict_tea_disease")
async def predict_disease(image: UploadFile = File(...)):
    """Predicts plant disease from an uploaded image."""
    preprocessed_image = preprocess_image(image)

    predictions = model.predict(preprocessed_image)
    
    # Get top 3 predictions
    top_3_indices = np.argsort(predictions[0])[-3:][::-1]
    
    results = []
    for idx in top_3_indices:
        results.append({
            "class": class_labels[idx],
            "confidence": float(predictions[0][idx])
        })
    
    # Debugging: Print predictions to verify
    print(f"Top 3 Predictions:")
    for i, result in enumerate(results, 1):
        print(f"{i}. {result['class']}: {result['confidence']:.4f}")

    predicted_class = class_labels[top_3_indices[0]]
    confidence_score = predictions[0][top_3_indices[0]]

    return {
        "predicted_class": predicted_class,
        "confidence_score": float(confidence_score),
        "top_3_predictions": results
    }

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/test")
async def test():
    return {"message": "API is working"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
