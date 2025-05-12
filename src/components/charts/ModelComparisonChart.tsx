import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
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

interface ModelComparisonChartProps {
  activeModel: string;
}

const ModelComparisonChart: React.FC<ModelComparisonChartProps> = ({ activeModel }) => {
  const { modelComparison } = useModel();
  
  // Convert activeModel to ModelType
  const modelType = activeModel as ModelType;
  
  // Get models for the active type
  const models = modelComparison[modelType];
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
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
  
  const modelNames = models.map(model => model.modelName);
  
  const data = {
    labels: modelNames,
    datasets: [
      {
        label: 'Accuracy',
        data: models.map(model => model.accuracy),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: 'Precision',
        data: models.map(model => model.precision),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      },
      {
        label: 'Recall',
        data: models.map(model => model.recall),
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
      },
      {
        label: 'F1 Score',
        data: models.map(model => model.f1),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
      }
    ],
  };
  
  return (
    <div className="h-64">
      <Bar options={options} data={data} />
    </div>
  );
};

export default ModelComparisonChart;