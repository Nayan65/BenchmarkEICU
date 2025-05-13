import numpy as np
import pandas as pd
from model import ICUModel
import json

def load_patient_data(patient_id, data_path):
    """Load and prepare data for a single patient"""
    df = pd.read_csv(data_path)
    patient_data = df[df['patientunitstayid'] == patient_id].copy()
    
    if len(patient_data) == 0:
        raise ValueError(f"Patient {patient_id} not found in dataset")
    
    return patient_data

def make_prediction(patient_data, model, window_size=24):
    """Make predictions for a patient"""
    # Prepare sequence
    sequence = patient_data[
        ['Heart Rate', 'MAP (mmHg)', 'Respiratory Rate',
         'O2 Saturation', 'FiO2', 'Temperature (C)',
         'glucose', 'pH']
    ].values[-window_size:]
    
    # Reshape for model input
    sequence = np.expand_dims(sequence, axis=0)
    
    # Make prediction
    prediction = model.predict(sequence)
    
    return {
        'Heart Rate': float(prediction[0][0]),
        'MAP': float(prediction[0][1]),
        'Respiratory Rate': float(prediction[0][2])
    }

def calculate_risk_scores(predictions, thresholds):
    """Calculate risk scores based on predictions"""
    risk_scores = {
        'mortality': 0.0,
        'decompensation': 0.0
    }
    
    # Simple risk calculation based on vital signs
    if (predictions['Heart Rate'] > thresholds['hr_high'] or 
        predictions['Heart Rate'] < thresholds['hr_low'] or
        predictions['MAP'] < thresholds['map_low'] or
        predictions['Respiratory Rate'] > thresholds['rr_high']):
        risk_scores['decompensation'] = 0.7
        risk_scores['mortality'] = 0.4
    
    return risk_scores

def main():
    # Load model
    model = ICUModel()
    model.load_model('icu_model.h5', 'scaler.pkl')
    
    # Define vital sign thresholds
    thresholds = {
        'hr_high': 120,
        'hr_low': 50,
        'map_low': 65,
        'rr_high': 30
    }
    
    # Example prediction for a patient
    patient_id = "EICU-25872"  # Example patient ID
    try:
        patient_data = load_patient_data(patient_id, "processed_patient_data.csv")
        predictions = make_prediction(patient_data, model)
        risk_scores = calculate_risk_scores(predictions, thresholds)
        
        results = {
            'predictions': predictions,
            'risk_scores': risk_scores
        }
        
        # Save results
        with open(f'predictions_{patient_id}.json', 'w') as f:
            json.dump(results, f)
            
        print(f"Predictions for patient {patient_id}:")
        print(f"Vital Signs: {predictions}")
        print(f"Risk Scores: {risk_scores}")
        
    except Exception as e:
        print(f"Error making prediction: {str(e)}")

if __name__ == "__main__":
    main()