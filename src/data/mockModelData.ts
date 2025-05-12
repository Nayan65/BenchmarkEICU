import { 
  FeatureImportance, 
  ModelPerformanceByType 
} from '../types';

export const mockModelComparison: ModelPerformanceByType = {
  mortality: [
    {
      modelName: 'BiLSTM',
      accuracy: 0.89,
      precision: 0.82,
      recall: 0.78,
      f1: 0.80,
      auc: 0.91
    },
    {
      modelName: 'Transformer',
      accuracy: 0.92,
      precision: 0.85,
      recall: 0.83,
      f1: 0.84,
      auc: 0.94
    },
    {
      modelName: 'Logistic Regression',
      accuracy: 0.78,
      precision: 0.72,
      recall: 0.69,
      f1: 0.70,
      auc: 0.79,
      isBaseline: true
    }
  ],
  decompensation: [
    {
      modelName: 'BiLSTM',
      accuracy: 0.84,
      precision: 0.76,
      recall: 0.73,
      f1: 0.74,
      auc: 0.88
    },
    {
      modelName: 'Transformer',
      accuracy: 0.87,
      precision: 0.80,
      recall: 0.79,
      f1: 0.79,
      auc: 0.90
    },
    {
      modelName: 'Logistic Regression',
      accuracy: 0.73,
      precision: 0.67,
      recall: 0.65,
      f1: 0.66,
      auc: 0.75,
      isBaseline: true
    }
  ],
  los: [
    {
      modelName: 'BiLSTM',
      accuracy: 0.81,
      precision: 0.74,
      recall: 0.72,
      f1: 0.73,
      auc: 0.85
    },
    {
      modelName: 'Transformer',
      accuracy: 0.84,
      precision: 0.77,
      recall: 0.75,
      f1: 0.76,
      auc: 0.87
    },
    {
      modelName: 'Linear Regression',
      accuracy: 0.71,
      precision: 0.65,
      recall: 0.63,
      f1: 0.64,
      auc: 0.72,
      isBaseline: true
    }
  ]
};

export const mockFeatureImportance: { 
  mortality: FeatureImportance[], 
  decompensation: FeatureImportance[],
  los: FeatureImportance[]
} = {
  mortality: [
    { feature: 'Age', importance: 0.85, direction: 'positive' },
    { feature: 'APACHE Score', importance: 0.78, direction: 'positive' },
    { feature: 'Mean Arterial Pressure', importance: 0.65, direction: 'negative' },
    { feature: 'Lactate', importance: 0.62, direction: 'positive' },
    { feature: 'GCS Total', importance: 0.58, direction: 'negative' },
    { feature: 'Respiratory Rate', importance: 0.55, direction: 'positive' },
    { feature: 'Heart Rate', importance: 0.52, direction: 'positive' },
    { feature: 'O2 Saturation', importance: 0.48, direction: 'negative' },
    { feature: 'Creatinine', importance: 0.45, direction: 'positive' },
    { feature: 'Temperature', importance: 0.35, direction: 'negative' }
  ],
  decompensation: [
    { feature: 'Mean Arterial Pressure', importance: 0.83, direction: 'negative' },
    { feature: 'Heart Rate', importance: 0.76, direction: 'positive' },
    { feature: 'Respiratory Rate', importance: 0.72, direction: 'positive' },
    { feature: 'O2 Saturation', importance: 0.68, direction: 'negative' },
    { feature: 'Lactate', importance: 0.65, direction: 'positive' },
    { feature: 'GCS Total', importance: 0.59, direction: 'negative' },
    { feature: 'Temperature', importance: 0.53, direction: 'positive' },
    { feature: 'APACHE Score', importance: 0.51, direction: 'positive' },
    { feature: 'pH', importance: 0.49, direction: 'negative' },
    { feature: 'Glucose', importance: 0.42, direction: 'positive' }
  ],
  los: [
    { feature: 'APACHE Score', importance: 0.81, direction: 'positive' },
    { feature: 'Age', importance: 0.73, direction: 'positive' },
    { feature: 'Admission Diagnosis', importance: 0.69, direction: 'positive' },
    { feature: 'GCS Total', importance: 0.62, direction: 'negative' },
    { feature: 'Creatinine', importance: 0.58, direction: 'positive' },
    { feature: 'Lactate', importance: 0.55, direction: 'positive' },
    { feature: 'BMI', importance: 0.49, direction: 'positive' },
    { feature: 'Respiratory Rate', importance: 0.47, direction: 'positive' },
    { feature: 'Mean Arterial Pressure', importance: 0.45, direction: 'negative' },
    { feature: 'WBC Count', importance: 0.41, direction: 'positive' }
  ]
};