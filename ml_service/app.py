from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI(title="GreenChain AI Spoilage Predictor")

# Load Model
MODEL_PATH = "spoilage_model.pkl"
model = None

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully.")
    else:
        print("Model not found. Please run train_model.py first.")

class PredictionRequest(BaseModel):
    food_type: int # 0=Packaged, 1=Produce, 2=Cooked, 3=Dairy/Meat
    quantity_lbs: float
    hours_since_prepared: float
    storage_condition: int # 0=Ambient, 1=Refrigerated, 2=Frozen
    expiry_hours_remaining: float

class PredictionResponse(BaseModel):
    risk_score: float
    priority: str
    priority_score: int # For legacy sorting compatibility (0-100)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "GreenChain AI"}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Prepare Input DataFrame
    input_data = pd.DataFrame([{
        'food_type': request.food_type,
        'quantity_lbs': request.quantity_lbs,
        'hours_since_prepared': request.hours_since_prepared,
        'storage_condition': request.storage_condition,
        'expiry_hours_remaining': request.expiry_hours_remaining
    }])
    
    # Predict Probability of Spoilage (Class 1)
    raw_prob = model.predict_proba(input_data)[0][1]
    risk_prob = max(0.0, min(1.0, float(raw_prob)))
    
    # Determine Priority based on Risk
    # High Risk = HIGH Priority (Urgent redistribution needed before it spoils)
    # Wait, logic check: 
    # If it is VERY likely to be spoiled (Risk > 0.9), is it prioritized or discarded?
    # Requirement: "Use ML priority for highlighting urgent food"
    # Assumption: High Spoilage Risk (but not yet expired) means VERY URGENT.
    # If Risk > 0.95 (Almost spoiled) -> Maybe flag for inspection?
    # For this implementation, we map Risk to Urgency directly.
    
    if risk_prob > 0.8:
        priority = "CRITICAL"
        priority_score = 95
    elif risk_prob > 0.5:
        priority = "HIGH"
        priority_score = 75
    elif risk_prob > 0.2:
        priority = "MEDIUM"
        priority_score = 50
    else:
        priority = "LOW"
        priority_score = 25
        
    return {
        "risk_score": float(risk_prob),
        "priority": priority,
        "priority_score": priority_score
    }
