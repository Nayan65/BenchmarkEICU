import React from 'react';
import { Check } from 'lucide-react';

interface ModelMetricsCardProps {
  title: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc: number;
  isActive?: boolean;
}

const ModelMetricsCard: React.FC<ModelMetricsCardProps> = ({
  title,
  accuracy,
  precision,
  recall,
  f1,
  auc,
  isActive = false
}) => {
  // Function to determine color based on metric value
  const getMetricColor = (value: number) => {
    if (value >= 0.9) return 'text-green-600';
    if (value >= 0.8) return 'text-blue-600';
    if (value >= 0.7) return 'text-amber-600';
    return 'text-red-600';
  };
  
  // Function to create metric display
  const MetricDisplay = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`font-semibold ${getMetricColor(value)}`}>{value.toFixed(2)}</span>
    </div>
  );
  
  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${
      isActive 
        ? 'bg-blue-50 border-blue-500 shadow-sm' 
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-gray-800">{title}</h3>
        {isActive && (
          <div className="bg-blue-100 text-blue-800 p-1 rounded-full">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <MetricDisplay label="Accuracy" value={accuracy} />
        <MetricDisplay label="Precision" value={precision} />
        <MetricDisplay label="Recall" value={recall} />
        <MetricDisplay label="F1 Score" value={f1} />
        <MetricDisplay label="AUC" value={auc} />
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${getMetricColor(auc)}`} 
            style={{ width: `${auc * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0.5</span>
          <span>0.75</span>
          <span>1.0</span>
        </div>
      </div>
    </div>
  );
};

export default ModelMetricsCard;