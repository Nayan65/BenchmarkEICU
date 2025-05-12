import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PatientData, Patient, TimeSeriesPoint } from '../types';
import mockPatients from '../data/mockPatients';
import * as tf from '@tensorflow/tfjs';

interface PatientContextType {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  selectedPatient: PatientData | null;
  setSelectedPatient: (patient: PatientData | null) => void;
  filteredPatients: Patient[];
  filterPatients: (query: string) => void;
  loadPatientData: (patientId: string) => Promise<void>;
  processPrediction: (patientId: string, modelType: string) => Promise<number>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(mockPatients);
  
  // Filter patients based on search query
  const filterPatients = (query: string) => {
    if (!query) {
      setFilteredPatients(patients);
      return;
    }
    
    const filtered = patients.filter(patient => {
      return (
        patient.id.toLowerCase().includes(query.toLowerCase()) ||
        patient.admissionDiagnosis.toLowerCase().includes(query.toLowerCase())
      );
    });
    
    setFilteredPatients(filtered);
  };
  
  // Load detailed patient data when a patient is selected
  const loadPatientData = async (patientId: string) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate with a timeout and mock data
      const patientIndex = patients.findIndex(p => p.id === patientId);
      
      if (patientIndex === -1) {
        console.error(`Patient with ID ${patientId} not found`);
        return;
      }
      
      // Generate mock time series data
      const generateTimeSeries = (baseline: number, variance: number, length: number): TimeSeriesPoint[] => {
        const series: TimeSeriesPoint[] = [];
        const now = new Date();
        
        for (let i = 0; i < length; i++) {
          const timestamp = new Date(now.getTime() - (length - i) * 3600000).toISOString();
          const value = baseline + (Math.random() * 2 - 1) * variance;
          series.push({ timestamp, value });
        }
        
        return series;
      };
      
      const patientData: PatientData = {
        ...patients[patientIndex],
        vitals: {
          heartRate: generateTimeSeries(85, 15, 48),
          map: generateTimeSeries(90, 10, 48),
          fio2: generateTimeSeries(0.21, 0.1, 48),
          ph: generateTimeSeries(7.4, 0.1, 48),
          o2Saturation: generateTimeSeries(96, 3, 48),
          temperature: generateTimeSeries(37, 0.8, 48),
          respiratoryRate: generateTimeSeries(18, 4, 48),
          gcsTotal: generateTimeSeries(15, 0, 48)
        },
        labs: {
          wbc: generateTimeSeries(8, 2, 12),
          hgb: generateTimeSeries(14, 1, 12),
          platelet: generateTimeSeries(250, 50, 12),
          sodium: generateTimeSeries(140, 3, 12),
          potassium: generateTimeSeries(4, 0.5, 12),
          bun: generateTimeSeries(15, 5, 12),
          creatinine: generateTimeSeries(0.9, 0.2, 12),
          glucose: generateTimeSeries(110, 20, 12),
          lactate: generateTimeSeries(1.5, 0.5, 12)
        }
      };
      
      setSelectedPatient(patientData);
    } catch (error) {
      console.error('Error loading patient data', error);
    }
  };
  
  // Process prediction using TensorFlow.js
  const processPrediction = async (patientId: string, modelType: string): Promise<number> => {
    // In a real implementation, this would load a trained TF.js model
    // and make predictions with actual patient data
    
    try {
      // Simulate model prediction
      await tf.ready();
      
      // TODO: In a real implementation, this would:
      // 1. Load the appropriate model based on modelType
      // 2. Preprocess patient data into the correct format
      // 3. Run inference
      // 4. Return prediction result
      
      // For now, we'll return a simulated prediction
      const patient = patients.find(p => p.id === patientId);
      if (!patient) return 0;
      
      let baseValue = 0;
      switch (modelType) {
        case 'mortality':
          baseValue = patient.mortalityRisk;
          break;
        case 'decompensation':
          baseValue = patient.decompensationRisk;
          break;
        case 'los':
          baseValue = patient.losEstimate / 30; // Normalize to 0-1 range
          break;
      }
      
      // Add some randomness to simulate prediction variation
      return Math.min(1, Math.max(0, baseValue + (Math.random() * 0.2 - 0.1)));
    } catch (error) {
      console.error('Error processing prediction', error);
      return 0;
    }
  };
  
  return (
    <PatientContext.Provider
      value={{
        patients,
        setPatients,
        selectedPatient,
        setSelectedPatient,
        filteredPatients,
        filterPatients,
        loadPatientData,
        processPrediction
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = (): PatientContextType => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};