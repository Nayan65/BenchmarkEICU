import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import json

class ICUModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.mortality_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.decompensation_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.los_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.feature_importance = None
        
    def preprocess_data(self, df):
        # Convert timestamps to datetime
        df['admissiontime'] = pd.to_datetime(df['admissiontime'])
        df['itemoffset'] = pd.to_numeric(df['itemoffset'])
        
        # Handle missing values
        numeric_cols = ['Heart Rate', 'MAP (mmHg)', 'Respiratory Rate', 
                       'O2 Saturation', 'FiO2', 'Temperature (C)',
                       'glucose', 'pH', 'admissionweight', 'admissionheight']
        
        df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors='coerce')
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
        
        return df
        
    def create_features(self, df):
        features = []
        labels_mortality = []
        labels_decompensation = []
        labels_los = []
        
        for patient_id in df['patientunitstayid'].unique():
            patient_data = df[df['patientunitstayid'] == patient_id]
            
            # Calculate statistical features
            stats_features = []
            for col in ['Heart Rate', 'MAP (mmHg)', 'Respiratory Rate',
                       'O2 Saturation', 'FiO2', 'Temperature (C)',
                       'glucose', 'pH']:
                values = patient_data[col].values
                stats_features.extend([
                    np.mean(values),
                    np.std(values),
                    np.min(values),
                    np.max(values),
                    np.median(values)
                ])
            
            # Add static features
            static_features = [
                patient_data['admissionweight'].iloc[0],
                patient_data['admissionheight'].iloc[0],
                len(patient_data)  # Length of stay
            ]
            
            features.append(stats_features + static_features)
            
            # Labels (you'll need to modify these based on your actual data)
            labels_mortality.append(0)  # Example mortality label
            labels_decompensation.append(0)  # Example decompensation label
            labels_los.append(len(patient_data))  # Length of stay in hours
        
        return (np.array(features), 
                np.array(labels_mortality),
                np.array(labels_decompensation),
                np.array(labels_los))
    
    def train(self, X, y_mortality, y_decompensation, y_los):
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train mortality model
        self.mortality_model.fit(X_scaled, y_mortality)
        
        # Train decompensation model
        self.decompensation_model.fit(X_scaled, y_decompensation)
        
        # Train length of stay model
        self.los_model.fit(X_scaled, y_los)
        
        # Calculate feature importance
        self.calculate_feature_importance()
        
        return {
            'mortality_score': self.mortality_model.score(X_scaled, y_mortality),
            'decompensation_score': self.decompensation_model.score(X_scaled, y_decompensation),
            'los_mse': np.mean((self.los_model.predict(X_scaled) - y_los) ** 2)
        }
    
    def predict(self, X):
        X_scaled = self.scaler.transform(X)
        return {
            'mortality': self.mortality_model.predict_proba(X_scaled)[:, 1],
            'decompensation': self.decompensation_model.predict_proba(X_scaled)[:, 1],
            'los': self.los_model.predict(X_scaled)
        }
    
    def calculate_feature_importance(self):
        feature_names = [
            'HR_mean', 'HR_std', 'HR_min', 'HR_max', 'HR_median',
            'MAP_mean', 'MAP_std', 'MAP_min', 'MAP_max', 'MAP_median',
            'RR_mean', 'RR_std', 'RR_min', 'RR_max', 'RR_median',
            'O2_mean', 'O2_std', 'O2_min', 'O2_max', 'O2_median',
            'FiO2_mean', 'FiO2_std', 'FiO2_min', 'FiO2_max', 'FiO2_median',
            'Temp_mean', 'Temp_std', 'Temp_min', 'Temp_max', 'Temp_median',
            'Glucose_mean', 'Glucose_std', 'Glucose_min', 'Glucose_max', 'Glucose_median',
            'pH_mean', 'pH_std', 'pH_min', 'pH_max', 'pH_median',
            'Weight', 'Height', 'LOS'
        ]
        
        importance_dict = {
            'mortality': list(zip(feature_names, self.mortality_model.feature_importances_)),
            'decompensation': list(zip(feature_names, self.decompensation_model.feature_importances_)),
            'los': list(zip(feature_names, self.los_model.feature_importances_))
        }
        
        self.feature_importance = importance_dict
        return importance_dict
    
    def save_model(self, path_prefix):
        joblib.dump(self.mortality_model, f'{path_prefix}_mortality.joblib')
        joblib.dump(self.decompensation_model, f'{path_prefix}_decompensation.joblib')
        joblib.dump(self.los_model, f'{path_prefix}_los.joblib')
        joblib.dump(self.scaler, f'{path_prefix}_scaler.joblib')
        
        with open(f'{path_prefix}_feature_importance.json', 'w') as f:
            json.dump(self.feature_importance, f)
    
    def load_model(self, path_prefix):
        self.mortality_model = joblib.load(f'{path_prefix}_mortality.joblib')
        self.decompensation_model = joblib.load(f'{path_prefix}_decompensation.joblib')
        self.los_model = joblib.load(f'{path_prefix}_los.joblib')
        self.scaler = joblib.load(f'{path_prefix}_scaler.joblib')
        
        with open(f'{path_prefix}_feature_importance.json', 'r') as f:
            self.feature_importance = json.load(f)

def main():
    # Load and preprocess data
    data_path = "processed_patient_data.csv"
    df = pd.read_csv(data_path)
    
    model = ICUModel()
    df_processed = model.preprocess_data(df)
    
    # Create features and labels
    X, y_mortality, y_decompensation, y_los = model.create_features(df_processed)
    
    # Train model
    scores = model.train(X, y_mortality, y_decompensation, y_los)
    
    print("Model Performance:")
    print(f"Mortality AUC: {scores['mortality_score']:.3f}")
    print(f"Decompensation AUC: {scores['decompensation_score']:.3f}")
    print(f"Length of Stay MSE: {scores['los_mse']:.3f}")
    
    # Save model
    model.save_model('icu_model')
    
    print("\nFeature Importance:")
    for model_type, importances in model.feature_importance.items():
        print(f"\n{model_type.upper()} Model:")
        sorted_imp = sorted(importances, key=lambda x: x[1], reverse=True)
        for feature, importance in sorted_imp[:10]:
            print(f"{feature}: {importance:.4f}")

if __name__ == "__main__":
    main()