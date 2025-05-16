import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any

def load_and_process_data(data_dir: str) -> pd.DataFrame:
    """
    Load and process patient data from the specified directory.
    
    Args:
        data_dir (str): Path to directory containing patient data files
        
    Returns:
        pd.DataFrame: Processed patient data
    """
    required_features = [
        'patientunitstayid', 'hospitalid', 'apacheadmissiondx',
        'admissionweight', 'admissionheight', 'itemoffset',
        'Heart Rate', 'MAP (mmHg)', 'Respiratory Rate', 'O2 Saturation',
        'FiO2', 'Temperature (C)', 'glucose', 'pH', 'admissiontime'
    ]
    
    # Initialize empty list to store data from all files
    all_data = []
    
    try:
        # Iterate through files in directory
        for filename in os.listdir(data_dir):
            if filename.endswith('.csv'):
                file_path = os.path.join(data_dir, filename)
                
                # Read CSV file
                df = pd.read_csv(file_path, low_memory=False)
                
                # Select only required features
                available_features = [col for col in required_features if col in df.columns]
                df = df[available_features]
                
                # Add missing columns if necessary
                for feature in required_features:
                    if feature not in df.columns:
                        df[feature] = np.nan
                
                all_data.append(df)
    
        # Combine all data
        if not all_data:
            raise ValueError("No CSV files found in the specified directory")
            
        combined_data = pd.concat(all_data, ignore_index=True)
        
        # Handle missing values
        numeric_features = [
            'admissionweight', 'admissionheight', 'Heart Rate',
            'MAP (mmHg)', 'Respiratory Rate', 'O2 Saturation',
            'FiO2', 'Temperature (C)', 'glucose', 'pH'
        ]
        
        # Convert numeric features to float
        for feature in numeric_features:
            combined_data[feature] = pd.to_numeric(combined_data[feature], errors='coerce')
        
        # Fill missing values with median for numeric features
        combined_data[numeric_features] = combined_data[numeric_features].fillna(
            combined_data[numeric_features].median()
        )
        
        # Convert timestamps
        combined_data['admissiontime'] = pd.to_datetime(
            combined_data['admissiontime'], 
            errors='coerce'
        )
        
        # Sort by patient ID and timestamp
        combined_data = combined_data.sort_values(
            ['patientunitstayid', 'itemoffset']
        ).reset_index(drop=True)
        
        return combined_data
        
    except Exception as e:
        print(f"Error processing data: {str(e)}")
        return pd.DataFrame()

def calculate_patient_predictions(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate predictions for each patient"""
    predictions = {}
    
    for patient_id in df['patientunitstayid'].unique():
        patient_data = df[df['patientunitstayid'] == patient_id]
        
        # Calculate mortality risk based on vital signs
        latest_vitals = patient_data.iloc[-1]
        apache_score = calculate_apache_score(latest_vitals)
        
        mortality_risk = calculate_mortality_risk(apache_score, latest_vitals)
        decomp_risk = calculate_decompensation_risk(patient_data)
        los_estimate = estimate_length_of_stay(patient_data)
        
        predictions[patient_id] = {
            'mortality_risk': mortality_risk,
            'decompensation_risk': decomp_risk,
            'length_of_stay': los_estimate
        }
    
    return predictions

def calculate_apache_score(vitals: pd.Series) -> float:
    """Calculate APACHE score from vital signs"""
    score = 0
    
    # Heart Rate scoring
    hr = vitals['Heart Rate']
    if hr < 40 or hr > 180: score += 4
    elif hr < 55 or hr > 140: score += 3
    elif hr < 70 or hr > 110: score += 2
    
    # MAP scoring
    map_val = vitals['MAP (mmHg)']
    if map_val < 50 or map_val > 130: score += 4
    elif map_val < 70 or map_val > 110: score += 2
    
    # Respiratory Rate scoring
    rr = vitals['Respiratory Rate']
    if rr < 6 or rr > 50: score += 4
    elif rr < 12 or rr > 25: score += 2
    
    # O2 Saturation scoring
    o2_sat = vitals['O2 Saturation']
    if o2_sat < 90: score += 4
    elif o2_sat < 95: score += 2
    
    return score

def calculate_mortality_risk(apache_score: float, vitals: pd.Series) -> float:
    """Calculate mortality risk based on APACHE score and vital signs"""
    base_risk = min(apache_score / 40, 0.8)  # Max base risk of 80%
    
    # Adjust risk based on vital signs
    risk_multiplier = 1.0
    
    if vitals['O2 Saturation'] < 90: risk_multiplier *= 1.2
    if vitals['MAP (mmHg)'] < 65: risk_multiplier *= 1.15
    if vitals['Heart Rate'] > 120: risk_multiplier *= 1.1
    
    return min(base_risk * risk_multiplier, 1.0)

def calculate_decompensation_risk(patient_data: pd.DataFrame) -> float:
    """Calculate 48-hour decompensation risk"""
    latest_vitals = patient_data.iloc[-1]
    risk = 0.0
    
    # Check vital sign trends
    if len(patient_data) >= 3:
        o2_trend = patient_data['O2 Saturation'].diff().mean()
        map_trend = patient_data['MAP (mmHg)'].diff().mean()
        
        if o2_trend < -1: risk += 0.2
        if map_trend < -2: risk += 0.2
    
    # Add risk based on current values
    if latest_vitals['O2 Saturation'] < 92: risk += 0.3
    if latest_vitals['MAP (mmHg)'] < 65: risk += 0.2
    if latest_vitals['Heart Rate'] > 120: risk += 0.1
    
    return min(risk, 1.0)

def estimate_length_of_stay(patient_data: pd.DataFrame) -> float:
    """Estimate length of stay in days"""
    # Base estimate on severity indicators
    apache_score = calculate_apache_score(patient_data.iloc[-1])
    base_los = apache_score / 4  # Rough conversion to days
    
    # Adjust based on vital sign stability
    if len(patient_data) >= 6:
        vital_stability = assess_vital_stability(patient_data)
        base_los *= (2 - vital_stability)  # Reduce LOS if vitals are stable
    
    return max(base_los, 1.0)  # Minimum 1 day

def assess_vital_stability(patient_data: pd.DataFrame) -> float:
    """Assess stability of vital signs (0-1 scale, 1 being most stable)"""
    stability_score = 0.0
    vital_signs = ['Heart Rate', 'MAP (mmHg)', 'O2 Saturation']
    
    for vital in vital_signs:
        std = patient_data[vital].std()
        mean = patient_data[vital].mean()
        cv = std / mean if mean != 0 else float('inf')
        
        # Convert coefficient of variation to stability score (0-0.33)
        stability_score += max(0, 0.33 * (1 - min(cv, 1)))
    
    return stability_score

def main():
    data_dir = "patient_data"
    
    # Process the data
    processed_data = load_and_process_data(data_dir)
    
    if not processed_data.empty:
        # Calculate predictions
        predictions = calculate_patient_predictions(processed_data)
        
        # Save predictions
        output_path = os.path.join(os.path.dirname(data_dir), 'patient_predictions.json')
        with open(output_path, 'w') as f:
            json.dump(predictions, f, indent=2)
        
        print(f"Processed data and predictions saved to: {output_path}")
        
        # Print summary statistics
        print("\nData Summary:")
        print(f"Total patients: {processed_data['patientunitstayid'].nunique()}")
        print(f"Total records: {len(processed_data)}")
        print("\nPrediction Summary:")
        
        mort_risks = [p['mortality_risk'] for p in predictions.values()]
        decomp_risks = [p['decompensation_risk'] for p in predictions.values()]
        los_estimates = [p['length_of_stay'] for p in predictions.values()]
        
        print(f"Average Mortality Risk: {np.mean(mort_risks):.1%}")
        print(f"Average Decompensation Risk: {np.mean(decomp_risks):.1%}")
        print(f"Average Length of Stay: {np.mean(los_estimates):.1f} days")
    else:
        print("Failed to process data. Please check the error messages above.")

if __name__ == "__main__":
    main()