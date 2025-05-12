import { PatientData, TimeSeriesPoint } from '../types';
import * as tf from '@tensorflow/tfjs';

// Normalize time series data to z-scores
export const normalizeTimeSeries = (data: TimeSeriesPoint[]): TimeSeriesPoint[] => {
  const values = data.map(point => point.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  );
  
  return data.map(point => ({
    timestamp: point.timestamp,
    value: (point.value - mean) / (stdDev || 1) // Avoid division by zero
  }));
};

// Impute missing values in time series using linear interpolation
export const imputeTimeSeries = (data: TimeSeriesPoint[]): TimeSeriesPoint[] => {
  if (data.length < 2) return data;
  
  const result: TimeSeriesPoint[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (data[i].value !== null && !isNaN(data[i].value)) {
      result.push(data[i]);
    } else if (i > 0 && i < data.length - 1) {
      // Find next valid point
      let nextValidIndex = i + 1;
      while (
        nextValidIndex < data.length && 
        (data[nextValidIndex].value === null || isNaN(data[nextValidIndex].value))
      ) {
        nextValidIndex++;
      }
      
      if (nextValidIndex < data.length) {
        // Interpolate
        const prevVal = data[i - 1].value;
        const nextVal = data[nextValidIndex].value;
        const ratio = 1 / (nextValidIndex - i + 1);
        const interpolatedValue = prevVal + (nextVal - prevVal) * ratio;
        
        result.push({
          timestamp: data[i].timestamp,
          value: interpolatedValue
        });
      } else {
        // If no next valid point, use previous value
        result.push({
          timestamp: data[i].timestamp,
          value: data[i - 1].value
        });
      }
    } else if (i === 0) {
      // If first point is missing, find first valid point
      let firstValidIndex = 1;
      while (
        firstValidIndex < data.length && 
        (data[firstValidIndex].value === null || isNaN(data[firstValidIndex].value))
      ) {
        firstValidIndex++;
      }
      
      if (firstValidIndex < data.length) {
        result.push({
          timestamp: data[i].timestamp,
          value: data[firstValidIndex].value
        });
      } else {
        // If no valid points, use a default value (zero)
        result.push({
          timestamp: data[i].timestamp,
          value: 0
        });
      }
    } else {
      // If last point is missing, use previous value
      result.push({
        timestamp: data[i].timestamp,
        value: data[i - 1].value
      });
    }
  }
  
  return result;
};

// Load and process data from Python script output
export const loadProcessedData = async (filePath: string): Promise<PatientData[]> => {
  try {
    const response = await fetch(filePath);
    const csvData = await response.text();
    
    // Parse CSV data
    const rows = csvData.split('\n').slice(1); // Skip header
    const patients: { [key: string]: PatientData } = {};
    
    rows.forEach(row => {
      const [
        patientId, hospitalId, diagnosis, weight, height,
        timestamp, heartRate, map, respRate, o2Sat,
        fio2, temp, glucose, ph, admissionTime
      ] = row.split(',');
      
      if (!patients[patientId]) {
        patients[patientId] = {
          id: patientId,
          hospitalId,
          admissionDiagnosis: diagnosis,
          admissionWeight: parseFloat(weight),
          admissionHeight: parseFloat(height),
          admissionTime,
          vitals: {
            heartRate: [],
            map: [],
            respiratoryRate: [],
            o2Saturation: [],
            fio2: [],
            temperature: [],
            gcsTotal: [] // Added for compatibility
          },
          labs: {
            glucose: [],
            ph: [],
            wbc: [], // Added for compatibility
            hgb: [],
            platelet: [],
            sodium: [],
            potassium: [],
            bun: [],
            creatinine: [],
            lactate: []
          }
        } as PatientData;
      }
      
      // Add time series data points
      const timePoint = {
        timestamp,
        value: parseFloat(heartRate)
      };
      
      patients[patientId].vitals.heartRate.push(timePoint);
      patients[patientId].vitals.map.push({ timestamp, value: parseFloat(map) });
      patients[patientId].vitals.respiratoryRate.push({ timestamp, value: parseFloat(respRate) });
      patients[patientId].vitals.o2Saturation.push({ timestamp, value: parseFloat(o2Sat) });
      patients[patientId].vitals.fio2.push({ timestamp, value: parseFloat(fio2) });
      patients[patientId].vitals.temperature.push({ timestamp, value: parseFloat(temp) });
      
      patients[patientId].labs.glucose.push({ timestamp, value: parseFloat(glucose) });
      patients[patientId].labs.ph.push({ timestamp, value: parseFloat(ph) });
    });
    
    return Object.values(patients);
  } catch (error) {
    console.error('Error loading processed data:', error);
    return [];
  }
};

// Prepare patient data for model input
export const preparePatientDataForModel = (patient: PatientData): tf.Tensor => {
  // Extract vital signs as time series
  const heartRate = patient.vitals.heartRate.map(p => p.value);
  const map = patient.vitals.map.map(p => p.value);
  const o2Sat = patient.vitals.o2Saturation.map(p => p.value);
  const temp = patient.vitals.temperature.map(p => p.value);
  const respRate = patient.vitals.respiratoryRate.map(p => p.value);
  
  // Extract static features
  const staticFeatures = [
    patient.admissionWeight / 200, // Normalize weight
    patient.admissionHeight / 250, // Normalize height
  ];
  
  // Combine features
  const getLastNValues = (arr: number[], n: number) => {
    return arr.length > n ? arr.slice(-n) : [...Array(n - arr.length).fill(0), ...arr];
  };
  
  const timeSeriesLength = 24;
  const features = [
    ...getLastNValues(heartRate, timeSeriesLength),
    ...getLastNValues(map, timeSeriesLength),
    ...getLastNValues(o2Sat, timeSeriesLength),
    ...getLastNValues(temp, timeSeriesLength),
    ...getLastNValues(respRate, timeSeriesLength),
    ...staticFeatures
  ];
  
  return tf.tensor(features).expandDims(0);
};