import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  ModelType, 
  ModelPerformanceByType, 
  FeatureImportance,
  ModelState
} from '../types';
import { mockModelComparison, mockFeatureImportance } from '../data/mockModelData';

const initialModelState: ModelState = {
  selectedModelType: 'mortality',
  modelComparison: mockModelComparison,
  featureImportance: mockFeatureImportance,
  setSelectedModelType: () => {}
};

const ModelContext = createContext<ModelState>(initialModelState);

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedModelType, setSelectedModelType] = useState<ModelType>('mortality');
  
  return (
    <ModelContext.Provider
      value={{
        selectedModelType,
        modelComparison: mockModelComparison,
        featureImportance: mockFeatureImportance,
        setSelectedModelType
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = (): ModelState => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};