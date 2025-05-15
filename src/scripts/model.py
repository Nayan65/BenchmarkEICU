import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
import joblib
import json

class ICUModel:
    def __init__(self):
        self.scaler = StandardScaler()
        # Improved hyperparameters for better accuracy
        self.mortality_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            random_state=42,
            class_weight='balanced'
        )
        self.decompensation_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            random_state=42,
            class_weight='balanced'
        )
        self.los_model = RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            random_state=42
        )
        self.feature_importance = None
        
    def preprocess_data(self, df):
        # Convert timestamps to datetime
        df['admissiontime'] = pd.to_datetime(df['admissiontime'])
        df['itemoffset'] = pd.to_numeric(df['itemoffset'])
        
        # Handle missing values with more sophisticated imputation
        numeric_cols = ['Heart Rate', 'MAP (mmHg)', 'Respiratory Rate', 
                       'O2 Saturation', 'FiO2', 'Temperature (C)',
                       'glucose', 'pH', 'admissionweight', 'admissionheight']
        
        df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors='coerce')
        
        # Use forward fill then backward fill for time series data
        df[numeric_cols] = df[numeric_cols].fillna(method='ffill').fillna(method='bfill')
        
        # If still any missing values, use median
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
        
        return df
        
    def create_features(self, df):
        features = []
        labels_mortality = []
        labels_decompensation = []
        labels_los = []
        
        for patient_id in df['patientunitstayid'].unique():
            patient_data = df[df['patientunitstayid'] == patient_id]
            
            # Enhanced statistical features
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
                    np.median(values),
                    np.percentile(values, 25),
                    np.percentile(values, 75),
                    np.var(values)
                ])
            
            # Add trend features
            for col in ['Heart Rate', 'MAP (mmHg)', 'O2 Saturation']:
                values = patient_data[col].values
                if len(values) > 1:
                    trend = np.polyfit(range(len(values)), values, 1)[0]
                else:
                    trend = 0
                stats_features.append(trend)
            
            # Add interaction features
            hr_mean = np.mean(patient_data['Heart Rate'].values)
            map_mean = np.mean(patient_data['MAP (mmHg)'].values)
            o2_mean = np.mean(patient_data['O2 Saturation'].values)
            
            stats_features.extend([
                hr_mean * map_mean,
                hr_mean * o2_mean,
                map_mean * o2_mean
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
    
    def optimize_hyperparameters(self, X, y, model_type='mortality'):
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 15, 20],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        if model_type in ['mortality', 'decompensation']:
            base_model = RandomForestClassifier(random_state=42)
        else:
            base_model = RandomForestRegressor(random_state=42)
        
        grid_search = GridSearchCV(
            base_model,
            param_grid,
            cv=5,
            scoring='roc_auc' if model_type in ['mortality', 'decompensation'] else 'neg_mean_squared_error',
            n_jobs=-1
        )
        
        grid_search.fit(X, y)
        return grid_search.best_estimator_
    
    def train(self, X, y_mortality, y_decompensation, y_los):
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Optimize and train models
        self.mortality_model = self.optimize_hyperparameters(X_scaled, y_mortality, 'mortality')
        self.decompensation_model = self.optimize_hyperparameters(X_scaled, y_decompensation, 'decompensation')
        self.los_model = self.optimize_hyperparameters(X_scaled, y_los, 'los')
        
        # Train with optimized models
        self.mortality_model.fit(X_scaled, y_mortality)
        self.decompensation_model.fit(X_scaled, y_decompensation)
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
            'HR_mean', 'HR_std', 'HR_min', 'HR_max', 'HR_median', 'HR_25th', 'HR_75th', 'HR_var', 'HR_trend',
            'MAP_mean', 'MAP_std', 'MAP_min', 'MAP_max', 'MAP_median', 'MAP_25th', 'MAP_75th', 'MAP_var', 'MAP_trend',
            'RR_mean', 'RR_std', 'RR_min', 'RR_max', 'RR_median', 'RR_25th', 'RR_75th', 'RR_var',
            'O2_mean', 'O2_std', 'O2_min', 'O2_max', 'O2_median', 'O2_25th', 'O2_75th', 'O2_var', 'O2_trend',
            'FiO2_mean', 'FiO2_std', 'FiO2_min', 'FiO2_max', 'FiO2_median', 'FiO2_25th', 'FiO2_75th', 'FiO2_var',
            'Temp_mean', 'Temp_std', 'Temp_min', 'Temp_max', 'Temp_median', 'Temp_25th', 'Temp_75th', 'Temp_var',
            'Glucose_mean', 'Glucose_std', 'Glucose_min', 'Glucose_max', 'Glucose_median', 'Glucose_25th', 'Glucose_75th', 'Glucose_var',
            'pH_mean', 'pH_std', 'pH_min', 'pH_max', 'pH_median', 'pH_25th', 'pH_75th', 'pH_var',
            'HR_MAP_interaction', 'HR_O2_interaction', 'MAP_O2_interaction',
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