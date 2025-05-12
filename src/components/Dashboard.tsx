import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Users, Clock, AlertTriangle, Activity } from 'lucide-react';
import PatientSelectionPanel from './PatientSelectionPanel';
import PatientDetailCard from './PatientDetailCard';
import ModelComparisonChart from './charts/ModelComparisonChart';
import VitalsChart from './charts/VitalsChart';
import FeatureImportanceChart from './charts/FeatureImportanceChart';
import ModelMetricsCard from './ModelMetricsCard';
import DataUpload from './DataUpload';
import { usePatient } from '../context/PatientContext';

const Dashboard: React.FC = () => {
  const { selectedPatient } = usePatient();
  const [activeTab, setActiveTab] = useState('mortality');

  return (
    <div className="container mx-auto">
      <h2 className="my-6 text-2xl font-semibold text-gray-700">
        EICU Benchmarking Dashboard
      </h2>

      {/* Stats overview */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
          <div className="p-3 mr-4 bg-blue-100 rounded-full">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">
              Total Patients
            </p>
            <p className="text-lg font-semibold text-gray-700">
              14,352
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
          <div className="p-3 mr-4 bg-red-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">
              Mortality Rate
            </p>
            <p className="text-lg font-semibold text-gray-700">
              8.7%
              <span className="text-sm font-normal text-red-500 ml-2 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                0.8%
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
          <div className="p-3 mr-4 bg-amber-100 rounded-full">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">
              Avg. Length of Stay
            </p>
            <p className="text-lg font-semibold text-gray-700">
              7.2 days
              <span className="text-sm font-normal text-green-500 ml-2 flex items-center">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                0.3
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
          <div className="p-3 mr-4 bg-teal-100 rounded-full">
            <Activity className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">
              Decompensation Rate
            </p>
            <p className="text-lg font-semibold text-gray-700">
              12.5%
              <span className="text-sm font-normal text-red-500 ml-2 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                1.2%
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Data Upload Section */}
      <div className="mb-8">
        <DataUpload />
      </div>

      {/* Main content */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <PatientSelectionPanel />
        </div>
        
        <div className="md:col-span-2">
          {selectedPatient ? (
            <PatientDetailCard patient={selectedPatient} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex items-center justify-center min-h-[200px]">
              <p className="text-gray-500">Please select a patient to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Model tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('mortality')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'mortality'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mortality Prediction
            </button>
            <button
              onClick={() => setActiveTab('decompensation')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'decompensation'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Decompensation (48h)
            </button>
            <button
              onClick={() => setActiveTab('los')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'los'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Length of Stay
            </button>
          </nav>
        </div>
      </div>

      {/* Model performance and charts */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Model Performance</h3>
          <ModelComparisonChart activeModel={activeTab} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Feature Importance</h3>
          <FeatureImportanceChart activeModel={activeTab} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Patient Vitals Timeline</h3>
          <VitalsChart />
        </div>
      </div>

      {/* Model metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Model Metrics</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <ModelMetricsCard 
            title="BiLSTM Model" 
            accuracy={0.89}
            precision={0.82}
            recall={0.78}
            f1={0.80}
            auc={0.91}
            isActive={true}
          />
          <ModelMetricsCard 
            title="Transformer Model" 
            accuracy={0.92}
            precision={0.85}
            recall={0.83}
            f1={0.84}
            auc={0.94}
          />
          <ModelMetricsCard 
            title="Baseline (LogReg)" 
            accuracy={0.78}
            precision={0.72}
            recall={0.69}
            f1={0.70}
            auc={0.79}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;