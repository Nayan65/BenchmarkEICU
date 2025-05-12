import React from 'react';
import { Clock, Heart, Activity, AlertCircle, Thermometer, Eye } from 'lucide-react';
import { PatientData } from '../types';
import { useModel } from '../context/ModelContext';

interface PatientDetailCardProps {
  patient: PatientData;
}

const PatientDetailCard: React.FC<PatientDetailCardProps> = ({ patient }) => {
  const { selectedModelType } = useModel();
  
  // Format the admission time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get the appropriate risk value based on selected model
  const getRiskValue = () => {
    switch (selectedModelType) {
      case 'mortality':
        return {
          value: patient.mortalityRisk,
          actual: patient.actualOutcome?.mortality,
          label: 'Mortality Risk'
        };
      case 'decompensation':
        return {
          value: patient.decompensationRisk,
          actual: patient.actualOutcome?.decompensation,
          label: 'Decompensation Risk (48h)'
        };
      case 'los':
        return {
          value: patient.losEstimate,
          actual: patient.actualOutcome?.lengthOfStay,
          label: 'Est. Length of Stay (days)'
        };
      default:
        return {
          value: patient.mortalityRisk,
          actual: patient.actualOutcome?.mortality,
          label: 'Mortality Risk'
        };
    }
  };
  
  const risk = getRiskValue();
  
  // Determine color based on risk value
  const getRiskColor = () => {
    if (selectedModelType === 'los') {
      return 'bg-blue-500';
    }
    
    const riskValue = risk.value as number;
    if (riskValue > 0.5) return 'bg-red-500';
    if (riskValue > 0.3) return 'bg-amber-500';
    return 'bg-green-500';
  };

  // Function to handle CSV export
  const handleExportCSV = () => {
    const data = {
      patientId: patient.id,
      age: patient.age,
      gender: patient.gender,
      diagnosis: patient.admissionDiagnosis,
      admissionTime: patient.admissionTime,
      mortalityRisk: patient.mortalityRisk,
      decompensationRisk: patient.decompensationRisk,
      losEstimate: patient.losEstimate,
      apache: patient.apache,
      vitals: {
        heartRate: patient.vitals.heartRate.map(v => v.value).join(';'),
        map: patient.vitals.map.map(v => v.value).join(';'),
        o2Saturation: patient.vitals.o2Saturation.map(v => v.value).join(';'),
        temperature: patient.vitals.temperature.map(v => v.value).join(';')
      }
    };

    const csvContent = Object.entries(data)
      .map(([key, value]) => `${key},${value}`)
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-${patient.id}-data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Patient {patient.id}
          </h3>
          <p className="text-sm text-gray-500">
            {patient.age} y/o {patient.gender} • {patient.ethnicity}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            APACHE: {patient.apache}
          </span>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <AlertCircle className="h-4 w-4 mr-1 text-gray-500" />
            <span>Diagnosis</span>
          </div>
          <p className="text-base font-medium text-gray-800">{patient.admissionDiagnosis}</p>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            <span>Admission Time</span>
          </div>
          <p className="text-base font-medium text-gray-800">{formatDate(patient.admissionTime)}</p>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Activity className="h-4 w-4 mr-1 text-gray-500" />
            <span>Insurance</span>
          </div>
          <p className="text-base font-medium text-gray-800">{patient.insuranceType}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
          <Heart className="h-5 w-5 text-red-500 mb-1" />
          <span className="text-xs text-gray-500">Heart Rate</span>
          <p className="text-lg font-semibold">
            {patient.vitals.heartRate[patient.vitals.heartRate.length - 1]?.value.toFixed(0)} bpm
          </p>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
          <Activity className="h-5 w-5 text-blue-500 mb-1" />
          <span className="text-xs text-gray-500">MAP</span>
          <p className="text-lg font-semibold">
            {patient.vitals.map[patient.vitals.map.length - 1]?.value.toFixed(0)} mmHg
          </p>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
          <Thermometer className="h-5 w-5 text-amber-500 mb-1" />
          <span className="text-xs text-gray-500">Temperature</span>
          <p className="text-lg font-semibold">
            {patient.vitals.temperature[patient.vitals.temperature.length - 1]?.value.toFixed(1)}°C
          </p>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
          <Eye className="h-5 w-5 text-gray-500 mb-1" />
          <span className="text-xs text-gray-500">GCS</span>
          <p className="text-lg font-semibold">
            {patient.vitals.gcsTotal[patient.vitals.gcsTotal.length - 1]?.value.toFixed(0)}/15
          </p>
        </div>
      </div>
      
      <div className="relative pt-4">
        <div className="flex justify-between mb-2">
          <h4 className="text-md font-semibold text-gray-700">{risk.label}</h4>
          <div className="flex items-center">
            {selectedModelType !== 'los' && (
              <span className="text-sm font-medium">
                {(risk.value as number * 100).toFixed(1)}%
              </span>
            )}
            {selectedModelType === 'los' && (
              <span className="text-sm font-medium">
                {risk.value.toFixed(1)} days
              </span>
            )}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className={`h-2.5 rounded-full ${getRiskColor()}`} 
            style={{ 
              width: selectedModelType === 'los' 
                ? `${Math.min(100, (risk.value as number / 30) * 100)}%` 
                : `${(risk.value as number * 100)}%` 
            }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Actual outcome: {
            selectedModelType === 'los' 
              ? `${risk.actual} days` 
              : risk.actual ? 'Yes' : 'No'
          }</span>
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: getRiskColor() }}></span>
            {selectedModelType === 'los' ? 'Predicted length of stay' : 'Model prediction'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailCard;