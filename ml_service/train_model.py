import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score
import joblib
import json

def generate_data(n_samples=1000):
    np.random.seed(42)
    
    food_types = np.random.choice([0, 1, 2, 3], n_samples)
    
    quantity = np.random.randint(1, 100, n_samples)
    
    hours_prepared = np.random.randint(0, 72, n_samples)
    
    storage = np.random.choice([0, 1, 2], n_samples)
    
    expiry_hours = np.random.randint(-10, 120, n_samples)
   
    risk_score = np.zeros(n_samples)
    
    risk_score += (expiry_hours < 0) * 0.8
    risk_score += (expiry_hours < 24) * 0.3
    
    risk_score += ((food_types >= 2) & (storage == 0)) * 0.6
    
    risk_score += (hours_prepared > 48) * 0.4
    risk_score += (hours_prepared > 24) * 0.2
    
    risk_score += np.random.normal(0, 0.1, n_samples)
    
    spoiled = (risk_score > 0.5).astype(int)
    
    df = pd.DataFrame({
        'food_type': food_types,
        'quantity_lbs': quantity,
        'hours_since_prepared': hours_prepared,
        'storage_condition': storage,
        'expiry_hours_remaining': expiry_hours,
        'spoiled': spoiled
    })
    
    return df

def train():
    print("Generating synthetic data...")
    df = generate_data()
    
    X = df.drop('spoiled', axis=1)
    y = df['spoiled']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Logistic Regression model...")
    model = LogisticRegression()
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    
    print(f"Model Training Complete.")
    print(f"Accuracy: {accuracy:.2f}")
    print(f"Precision: {precision:.2f}")
    print(f"Recall: {recall:.2f}")
    
    metrics = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall
    }
    
    joblib.dump(model, "spoilage_model.pkl")
    with open("model_metrics.json", "w") as f:
        json.dump(metrics, f)
        
    print("Model saved to 'spoilage_model.pkl'")

if __name__ == "__main__":
    train()
