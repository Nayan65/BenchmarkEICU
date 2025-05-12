import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { usePatient } from '../context/PatientContext';

const PatientSelectionPanel: React.FC = () => {
  const { 
    filteredPatients, 
    filterPatients, 
    loadPatientData 
  } = usePatient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  
  useEffect(() => {
    filterPatients(searchQuery);
  }, [searchQuery, filterPatients]);
  
  const handlePatientSelect = async (patientId: string) => {
    await loadPatientData(patientId);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Patient Selection</h3>
      
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 
          bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 
          focus:border-blue-500 sm:text-sm"
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Filter className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Risk Level</span>
        </div>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              riskFilter === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setRiskFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              riskFilter === 'high'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setRiskFilter('high')}
          >
            High Risk
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              riskFilter === 'medium'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setRiskFilter('medium')}
          >
            Medium
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              riskFilter === 'low'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setRiskFilter('low')}
          >
            Low Risk
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[500px]">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Patient List ({filteredPatients.length})
        </h4>
        
        <ul className="divide-y divide-gray-200">
          {filteredPatients.map((patient) => {
            // Determine risk class
            let riskClass = '';
            if (patient.mortalityRisk > 0.5) {
              riskClass = 'border-l-4 border-red-500';
            } else if (patient.mortalityRisk > 0.2) {
              riskClass = 'border-l-4 border-amber-500';
            } else {
              riskClass = 'border-l-4 border-green-500';
            }
            
            return (
              <li 
                key={patient.id} 
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${riskClass}`}
                onClick={() => handlePatientSelect(patient.id)}
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900">{patient.id}</p>
                  <span className="text-xs font-medium text-gray-500">
                    {new Date(patient.admissionTime).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{patient.admissionDiagnosis}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs">
                    {patient.age} y/o {patient.gender}
                  </span>
                  <div className="flex space-x-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      patient.mortalityRisk > 0.5
                        ? 'bg-red-100 text-red-800'
                        : patient.mortalityRisk > 0.2
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {Math.round(patient.mortalityRisk * 100)}% mort
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PatientSelectionPanel;