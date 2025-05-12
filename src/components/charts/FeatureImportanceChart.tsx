import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useModel } from '../../context/ModelContext';
import { ModelType } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FeatureImportanceChartProps {
  activeModel: string;
}

const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ activeModel }) => {
  const { featureImportance } = useModel();
  
  // Convert activeModel to ModelType
  const modelType = activeModel as ModelType;
  
  // Get feature importance for the active model type
  const features = featureImportance[modelType];
  
  // Sort features by importance (descending)
  const sortedFeatures = [...features].sort((a, b) => b.importance - a.importance);
  
  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const feature = sortedFeatures[context.dataIndex];
            const direction = feature.direction === 'positive' ? 'increases' : 'decreases';
            return `Importance: ${feature.importance.toFixed(2)} (${direction} risk)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value: any) {
            return value.toFixed(1);
          }
        }
      }
    }
  };
  
  const data = {
    labels: sortedFeatures.map(feature => feature.feature),
    datasets: [
      {
        label: 'Feature Importance',
        data: sortedFeatures.map(feature => feature.importance),
        backgroundColor: sortedFeatures.map(feature => 
          feature.direction === 'positive' 
            ? 'rgba(239, 68, 68, 0.7)' 
            : 'rgba(16, 185, 129, 0.7)'
        ),
        borderWidth: 1,
      }
    ],
  };
  
  return (
    <div>
      <div className="flex justify-end mb-2">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            <span className="text-gray-600">Increases risk</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span className="text-gray-600">Decreases risk</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <Bar options={options} data={data} />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        SHAP values showing the most important features for {modelType === 'los' ? 'length of stay' : modelType} prediction
      </p>
    </div>
  );
};

export default FeatureImportanceChart;