from flask import Flask, render_template, jsonify, request
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import json
from scripts.model import ICUModel
from scripts.predict import make_prediction, calculate_risk_scores
from scripts.process_patient_data import load_and_process_data

app = Flask(__name__, static_folder='static', template_folder='templates')

# Initialize model
model = ICUModel()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/process-data', methods=['POST'])
def process_data():
    try:
        file = request.files['file']
        if file:
            # Save uploaded file temporarily
            temp_path = 'temp_data.csv'
            file.save(temp_path)
            
            # Process the data
            processed_data = load_and_process_data(temp_path)
            
            # Convert to JSON-serializable format
            data_dict = processed_data.to_dict(orient='records')
            
            return jsonify({
                'status': 'success',
                'data': data_dict
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/predict/<patient_id>', methods=['GET'])
def predict(patient_id):
    try:
        # Load patient data
        patient_data = load_and_process_data(f"data/{patient_id}.csv")
        
        # Make predictions
        predictions = make_prediction(patient_data, model)
        risk_scores = calculate_risk_scores(predictions, {
            'hr_high': 120,
            'hr_low': 50,
            'map_low': 65,
            'rr_high': 30
        })
        
        return jsonify({
            'status': 'success',
            'predictions': predictions,
            'risk_scores': risk_scores
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/model-metrics', methods=['GET'])
def model_metrics():
    try:
        with open('model_metrics.json', 'r') as f:
            metrics = json.load(f)
        return jsonify(metrics)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True)