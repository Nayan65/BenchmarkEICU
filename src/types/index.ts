export interface Patient {
  id: string;
  age: number;
  gender: string;
  admissionDiagnosis: string;
  admissionTime: string;
  dischargeTime?: string;
  admissionWeight: number;
  admissionHeight: number;
  bmi?: number;
  apache: number;
  ethnicity: string;
  insuranceType: string;
  mortalityRisk: number;
  decompensationRisk: number;
  losEstimate: number;
  actualOutcome?: {
    mortality: boolean;
    decompensation: boolean;
    lengthOfStay: number;
  };
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface VitalSigns {
  heartRate: TimeSeriesPoint[];
  map: TimeSeriesPoint[]; // Mean Arterial Pressure
  fio2: TimeSeriesPoint[]; // Fraction of Inspired Oxygen
  ph: TimeSeriesPoint[];
  o2Saturation: TimeSeriesPoint[];
  temperature: TimeSeriesPoint[];
  respiratoryRate: TimeSeriesPoint[];
  gcsTotal: TimeSeriesPoint[]; // Glasgow Coma Scale
}

export interface LabResults {
  wbc: TimeSeriesPoint[]; // White Blood Cell Count
  hgb: TimeSeriesPoint[]; // Hemoglobin
  platelet: TimeSeriesPoint[];
  sodium: TimeSeriesPoint[];
  potassium: TimeSeriesPoint[];
  bun: TimeSeriesPoint[]; // Blood Urea Nitrogen
  creatinine: TimeSeriesPoint[];
  glucose: TimeSeriesPoint[];
  lactate: TimeSeriesPoint[];
}

export interface PatientData extends Patient {
  vitals: VitalSigns;
  labs: LabResults;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'positive' | 'negative';
}

export type ModelType = 'mortality' | 'decompensation' | 'los';

export interface ModelPerformance {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc: number;
  isBaseline?: boolean;
}

export interface ModelPerformanceByType {
  mortality: ModelPerformance[];
  decompensation: ModelPerformance[];
  los: ModelPerformance[];
}

export interface ModelState {
  selectedModelType: ModelType;
  modelComparison: ModelPerformanceByType;
  featureImportance: {
    mortality: FeatureImportance[];
    decompensation: FeatureImportance[];
    los: FeatureImportance[];
  };
  setSelectedModelType: (type: ModelType) => void;
}