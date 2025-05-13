import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional
import tensorflow as tf
import joblib
import json

class ICUModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = None
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
        
    def create_sequences(self, df, window_size=24):
        sequences = []
        labels = []
        
        for patient_id in df['patientunitstayid'].unique():
            patient_data = df[df['patientunitstayid'] == patient_id]
            
            if len(patient_data) >= window_size:
                # Create sequences for each patient
                for i in range(len(patient_data) - window_size + 1):
                    sequence = patient_data.iloc[i:i+window_size][
                        ['Heart Rate', 'MAP (mmHg)', 'Respiratory Rate',
                         'O2 Saturation', 'FiO2', 'Temperature (C)',
                         'glucose', 'pH']
                    ].values
                    
                    # Use the last value as label (example: predicting next hour's vitals)
                    label = patient_data.iloc[i+window_size-1][
                        ['Heart Rate', 'MAP (mmHg)', 'Respiratory Rate']
                    ].values
                    
                    sequences.append(sequence)
                    labels.append(label)
        
        return np.array(sequences), np.array(labels)
    
    def build_model(self, input_shape):
        model = Sequential([
            Bidirectional(LSTM(64, return_sequences=True), 
                         input_shape=input_shape),
            Dropout(0.2),
            Bidirectional(LSTM(32)),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dense(3, activation='linear')  # Predicting 3 vital signs
        ])
        
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        self.model = model
        
    def train(self, X_train, y_train, epochs=50, batch_size=32, validation_split=0.2):
        if self.model is None:
            self.build_model((X_train.shape[1], X_train.shape[2]))
            
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1
        )
        
        return history
    
    def predict(self, X):
        return self.model.predict(X)
    
    def calculate_feature_importance(self, X, y):
        # Simple feature importance calculation using permutation
        feature_importance = []
        baseline_score = self.model.evaluate(X, y, verbose=0)[0]
        
        for i in range(X.shape[2]):  # For each feature
            X_permuted = X.copy()
            X_permuted[:, :, i] = np.random.permutation(X_permuted[:, :, i])
            permuted_score = self.model.evaluate(X_permuted, y, verbose=0)[0]
            importance = (permuted_score - baseline_score) / baseline_score
            feature_importance.append(importance)
        
        self.feature_importance = feature_importance
        return feature_importance
    
    def save_model(self, model_path, scaler_path):
        self.model.save(model_path)
        joblib.dump(self.scaler, scaler_path)
        
    def load_model(self, model_path, scaler_path):
        self.model = tf.keras.models.load_model(model_path)
        self.scaler = joblib.load(scaler_path)

def main():
    # Load and preprocess data
    data_path = "processed_patient_data.csv"
    df = pd.read_csv(data_path)
    
    model = ICUModel()
    df_processed = model.preprocess_data(df)
    
    # Create sequences
    X, y = model.create_sequences(df_processed)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train model
    model.build_model((X_train.shape[1], X_train.shape[2]))
    history = model.train(X_train, y_train)
    
    # Calculate feature importance
    feature_importance = model.calculate_feature_importance(X_test, y_test)
    
    # Save results
    feature_names = ['Heart Rate', 'MAP', 'Respiratory Rate', 'O2 Saturation',
                    'FiO2', 'Temperature', 'Glucose', 'pH']
    
    importance_results = {
        name: float(importance) 
        for name, importance in zip(feature_names, feature_importance)
    }
    
    with open('feature_importance.json', 'w') as f:
        json.dump(importance_results, f)
    
    # Save model
    model.save_model('icu_model.h5', 'scaler.pkl')
    
    print("Model training completed and saved")
    print("\nFeature Importance:")
    for name, importance in importance_results.items():
        print(f"{name}: {importance:.4f}")

if __name__ == "__main__":
    main()