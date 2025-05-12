import { Patient } from '../types';

const mockPatients: Patient[] = [
  {
    id: 'EICU-25872',
    age: 68,
    gender: 'Male',
    admissionDiagnosis: 'Septic Shock',
    admissionTime: '2025-01-15T08:23:00',
    admissionWeight: 78.5,
    admissionHeight: 172,
    bmi: 26.5,
    apache: 24,
    ethnicity: 'Caucasian',
    insuranceType: 'Medicare',
    mortalityRisk: 0.32,
    decompensationRisk: 0.45,
    losEstimate: 12.3,
    actualOutcome: {
      mortality: false,
      decompensation: true,
      lengthOfStay: 14
    }
  },
  {
    id: 'EICU-31459',
    age: 54,
    gender: 'Female',
    admissionDiagnosis: 'Pneumonia',
    admissionTime: '2025-01-17T15:42:00',
    admissionWeight: 64.2,
    admissionHeight: 165,
    bmi: 23.6,
    apache: 18,
    ethnicity: 'Hispanic',
    insuranceType: 'Private',
    mortalityRisk: 0.12,
    decompensationRisk: 0.27,
    losEstimate: 6.5,
    actualOutcome: {
      mortality: false,
      decompensation: false,
      lengthOfStay: 5
    }
  },
  {
    id: 'EICU-42581',
    age: 75,
    gender: 'Male',
    admissionDiagnosis: 'Acute Respiratory Failure',
    admissionTime: '2025-01-12T22:10:00',
    admissionWeight: 82.1,
    admissionHeight: 178,
    bmi: 25.9,
    apache: 29,
    ethnicity: 'African American',
    insuranceType: 'Medicare',
    mortalityRisk: 0.58,
    decompensationRisk: 0.72,
    losEstimate: 18.2,
    actualOutcome: {
      mortality: true,
      decompensation: true,
      lengthOfStay: 7
    }
  },
  {
    id: 'EICU-18753',
    age: 42,
    gender: 'Female',
    admissionDiagnosis: 'Diabetic Ketoacidosis',
    admissionTime: '2025-01-18T11:35:00',
    admissionWeight: 70.3,
    admissionHeight: 168,
    bmi: 24.9,
    apache: 14,
    ethnicity: 'Caucasian',
    insuranceType: 'Private',
    mortalityRisk: 0.08,
    decompensationRisk: 0.18,
    losEstimate: 4.2,
    actualOutcome: {
      mortality: false,
      decompensation: false,
      lengthOfStay: 3
    }
  },
  {
    id: 'EICU-57291',
    age: 63,
    gender: 'Male',
    admissionDiagnosis: 'Post-Cardiac Arrest',
    admissionTime: '2025-01-14T03:45:00',
    admissionWeight: 76.8,
    admissionHeight: 175,
    bmi: 25.1,
    apache: 32,
    ethnicity: 'Asian',
    insuranceType: 'Medicare',
    mortalityRisk: 0.67,
    decompensationRisk: 0.59,
    losEstimate: 15.7,
    actualOutcome: {
      mortality: true,
      decompensation: true,
      lengthOfStay: 9
    }
  },
  {
    id: 'EICU-63421',
    age: 35,
    gender: 'Male',
    admissionDiagnosis: 'Traumatic Brain Injury',
    admissionTime: '2025-01-16T19:22:00',
    admissionWeight: 85.4,
    admissionHeight: 182,
    bmi: 25.8,
    apache: 22,
    ethnicity: 'Caucasian',
    insuranceType: 'Private',
    mortalityRisk: 0.23,
    decompensationRisk: 0.31,
    losEstimate: 11.3,
    actualOutcome: {
      mortality: false,
      decompensation: true,
      lengthOfStay: 13
    }
  },
  {
    id: 'EICU-49823',
    age: 71,
    gender: 'Female',
    admissionDiagnosis: 'COPD Exacerbation',
    admissionTime: '2025-01-13T14:15:00',
    admissionWeight: 62.5,
    admissionHeight: 160,
    bmi: 24.4,
    apache: 20,
    ethnicity: 'Caucasian',
    insuranceType: 'Medicare',
    mortalityRisk: 0.15,
    decompensationRisk: 0.38,
    losEstimate: 8.4,
    actualOutcome: {
      mortality: false,
      decompensation: false,
      lengthOfStay: 7
    }
  },
  {
    id: 'EICU-72148',
    age: 58,
    gender: 'Male',
    admissionDiagnosis: 'Pancreatitis',
    admissionTime: '2025-01-17T08:50:00',
    admissionWeight: 91.3,
    admissionHeight: 176,
    bmi: 29.5,
    apache: 19,
    ethnicity: 'Hispanic',
    insuranceType: 'Private',
    mortalityRisk: 0.19,
    decompensationRisk: 0.29,
    losEstimate: 10.2,
    actualOutcome: {
      mortality: false,
      decompensation: false,
      lengthOfStay: 9
    }
  }
];

export default mockPatients;