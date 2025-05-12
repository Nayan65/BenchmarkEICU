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

def main():
    data_dir = r"C:\Users\nayan\eICU_Benchmark_updated\extracted_data_dir"
    
    # Process the data
    processed_data = load_and_process_data(data_dir)
    
    if not processed_data.empty:
        # Save processed data
        output_path = os.path.join(os.path.dirname(data_dir), 'processed_patient_data.csv')
        processed_data.to_csv(output_path, index=False)
        print(f"Processed data saved to: {output_path}")
        
        # Print summary statistics
        print("\nData Summary:")
        print(f"Total patients: {processed_data['patientunitstayid'].nunique()}")
        print(f"Total records: {len(processed_data)}")
        print("\nMissing values after processing:")
        print(processed_data.isnull().sum())
    else:
        print("Failed to process data. Please check the error messages above.")

if __name__ == "__main__":
    main()