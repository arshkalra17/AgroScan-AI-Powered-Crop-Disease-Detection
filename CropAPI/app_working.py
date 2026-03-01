from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import tensorflow as tf
import numpy as np
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["POST", "GET"],  
    allow_headers=["*"],
)

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the tea disease model (works with 224x224 input)
model = tf.keras.models.load_model(
    os.path.join(BASE_DIR, 'tea_VGG16_model.h5'),
    compile=False
)

# Load tea disease class labels
class_labels = pd.read_csv(
    os.path.join(BASE_DIR, 'tea diseases.csv')
)["folder_name"].str.strip().tolist()

print(f"Loaded tea disease model")
print(f"Classes: {class_labels}")
print(f"Model input shape: {model.input_shape}")

def preprocess_image(image: UploadFile):
    """Preprocesses an image for the tea disease model."""
    img = Image.open(image.file)
    img = img.convert("RGB")
    img = img.resize((224, 224), Image.LANCZOS)
    
    # Convert to array
    img_array = np.array(img, dtype=np.float32)
    
    # Normalize using ImageNet preprocessing (VGG16 standard)
    # Subtract ImageNet mean
    img_array[:, :, 0] -= 103.939
    img_array[:, :, 1] -= 116.779
    img_array[:, :, 2] -= 123.68
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.post("/predict_tea_disease")
async def predict_disease(image: UploadFile = File(...)):
    """Predicts tea plant disease from an uploaded image."""
    try:
        preprocessed_image = preprocess_image(image)
        
        # Get predictions
        predictions = model.predict(preprocessed_image, verbose=0)
        
        # Apply softmax to get probabilities
        predictions = tf.nn.softmax(predictions[0]).numpy()
        
        # Get top 3 predictions
        top_3_indices = np.argsort(predictions)[-3:][::-1]
        
        results = []
        for idx in top_3_indices:
            results.append({
                "class": class_labels[idx],
                "confidence": float(predictions[idx])
            })
        
        print(f"Top 3 Predictions:")
        for i, result in enumerate(results, 1):
            print(f"{i}. {result['class']}: {result['confidence']:.4f}")
        
        predicted_class = class_labels[top_3_indices[0]]
        confidence_score = predictions[top_3_indices[0]]
        
        return {
            "predicted_class": predicted_class,
            "confidence_score": float(confidence_score),
            "top_3_predictions": results
        }
        
    except Exception as e:
        print(f"Error processing image: {e}")
        import traceback
        traceback.print_exc()
        return {
            "predicted_class": "Error processing image",
            "confidence_score": 0.0,
            "top_3_predictions": [],
            "error": str(e)
        }

@app.get("/test")
async def test():
    return {"message": "Tea disease detection API is working"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
