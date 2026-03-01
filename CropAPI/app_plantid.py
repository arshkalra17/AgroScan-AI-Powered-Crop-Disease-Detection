from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import requests
import base64
import io
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["POST", "GET"],  
    allow_headers=["*"],
)

# Plant.id API configuration
PLANT_ID_API_KEY = "Cz0lpHbELxCjvs6MiliBiHJllJqjGOkBUk38Se3jZjjT3WJ0Hq"
PLANT_ID_API_URL = "https://plant.id/api/v3/health_assessment"

print("Plant.id API ready - Accurate plant disease detection")

def encode_image_to_base64(image_bytes):
    """Convert image bytes to base64 string"""
    return base64.b64encode(image_bytes).decode('utf-8')

def query_plantid(image_base64):
    """Query Plant.id API for plant disease detection"""
    headers = {
        "Api-Key": PLANT_ID_API_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "images": [image_base64],
        "latitude": 49.207,
        "longitude": 16.608,
        "similar_images": True,
    }
    
    try:
        response = requests.post(PLANT_ID_API_URL, headers=headers, json=data, timeout=30)
        print(f"Plant.id Response status: {response.status_code}")
        
        if response.status_code in [200, 201]:  # Accept both 200 and 201
            return response.json()
        else:
            print(f"Error response: {response.text}")
            return {"error": f"API returned status {response.status_code}"}
            
    except Exception as e:
        print(f"Error querying Plant.id: {e}")
        return {"error": str(e)}

@app.post("/predict_tea_disease")
async def predict_disease(image: UploadFile = File(...)):
    """Predicts plant disease from an uploaded image using Plant.id API."""
    try:
        # Read and encode image
        image_bytes = await image.read()
        
        # Resize if image is too large (Plant.id has size limits)
        img = Image.open(io.BytesIO(image_bytes))
        
        # Resize to max 1500px on longest side
        max_size = 1500
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = tuple(int(dim * ratio) for dim in img.size)
            img = img.resize(new_size, Image.LANCZOS)
            
            # Convert back to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=85)
            image_bytes = img_byte_arr.getvalue()
        
        # Encode to base64
        image_base64 = encode_image_to_base64(image_bytes)
        
        # Query Plant.id API
        result = query_plantid(image_base64)
        
        if "error" in result:
            return {
                "predicted_class": "API Error",
                "confidence_score": 0.0,
                "top_3_predictions": [],
                "error": result["error"]
            }
        
        # Parse Plant.id response
        if "result" in result and "disease" in result["result"]:
            disease_info = result["result"]["disease"]
            is_healthy = result["result"]["is_healthy"]["binary"]
            health_probability = result["result"]["is_healthy"]["probability"]
            
            if is_healthy:
                return {
                    "predicted_class": "Healthy Plant",
                    "confidence_score": float(health_probability),
                    "top_3_predictions": [
                        {
                            "class": "Healthy Plant",
                            "confidence": float(health_probability)
                        }
                    ],
                    "details": "No diseases detected"
                }
            
            # Get disease suggestions
            suggestions = disease_info.get("suggestions", [])
            
            if suggestions:
                results = []
                for i, suggestion in enumerate(suggestions[:3]):
                    disease_name = suggestion.get("name", "Unknown")
                    probability = suggestion.get("probability", 0.0)
                    
                    results.append({
                        "class": disease_name,
                        "confidence": float(probability),
                        "description": suggestion.get("description", ""),
                        "treatment": suggestion.get("treatment", {})
                    })
                
                print(f"Top 3 Disease Predictions:")
                for i, res in enumerate(results, 1):
                    print(f"{i}. {res['class']}: {res['confidence']:.4f}")
                
                top_disease = results[0]
                
                return {
                    "predicted_class": top_disease["class"],
                    "confidence_score": top_disease["confidence"],
                    "top_3_predictions": results,
                    "description": top_disease.get("description", ""),
                    "treatment": top_disease.get("treatment", {})
                }
            else:
                return {
                    "predicted_class": "Unable to identify disease",
                    "confidence_score": 0.0,
                    "top_3_predictions": [],
                    "error": "No disease suggestions found"
                }
        else:
            return {
                "predicted_class": "Unable to analyze",
                "confidence_score": 0.0,
                "top_3_predictions": [],
                "error": "Unexpected API response format"
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
    return {"message": "Plant.id API is working"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
