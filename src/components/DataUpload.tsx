import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, Folder } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { normalizeTimeSeries, imputeTimeSeries } from '../utils/dataPreprocessing';
import toast from 'react-hot-toast';

const DataUpload: React.FC = () => {
  const { setPatients } = usePatient();

  const processFiles = async (files: File[]) => {
    try {
      const processedData = [];
      
      for (const file of files) {
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const text = e.target?.result as string;
              const rows = text.split('\n');
              const headers = rows[0].split(',');
              const data = rows.slice(1).map(row => {
                const values = row.split(',');
                return headers.reduce((obj: any, header, i) => {
                  obj[header.trim()] = values[i]?.trim();
                  return obj;
                }, {});
              });
              resolve(data);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsText(file);
        });
        
        processedData.push(...fileData);
      }
      
      // Process the combined data
      const patients = processedData.reduce((acc: any[], row: any) => {
        if (!row.patientunitstayid) return acc;
        
        const existingPatient = acc.find(p => p.id === row.patientunitstayid);
        
        if (existingPatient) {
          // Update existing patient's time series data
          existingPatient.vitals.heartRate.push({
            timestamp: row.itemoffset,
            value: parseFloat(row['Heart Rate']) || null
          });
          existingPatient.vitals.map.push({
            timestamp: row.itemoffset,
            value: parseFloat(row['MAP (mmHg)']) || null
          });
          // Add other vital signs...
        } else {
          // Create new patient record
          acc.push({
            id: row.patientunitstayid,
            hospitalId: row.hospitalid,
            admissionDiagnosis: row.apacheadmissiondx,
            admissionWeight: parseFloat(row.admissionweight),
            admissionHeight: parseFloat(row.admissionheight),
            admissionTime: row.admissiontime,
            vitals: {
              heartRate: [{
                timestamp: row.itemoffset,
                value: parseFloat(row['Heart Rate']) || null
              }],
              map: [{
                timestamp: row.itemoffset,
                value: parseFloat(row['MAP (mmHg)']) || null
              }],
              // Initialize other vital signs...
            }
          });
        }
        
        return acc;
      }, []);
      
      // Process predictions for each patient
      const processedPatients = patients.map(patient => {
        // Calculate predictions using the Python backend
        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ patient }),
        });
        
        const predictions = await response.json();
        
        return {
          ...patient,
          mortalityRisk: predictions.mortality_risk,
          decompensationRisk: predictions.decompensation_risk,
          losEstimate: predictions.length_of_stay
        };
      });
      
      setPatients(processedPatients);
      toast.success(`Successfully processed ${files.length} files`);
      
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files');
    }
  };

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop: processFiles,
    accept: {
      'text/csv': ['.csv']
    }
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Data Upload</h3>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          <Folder className="w-12 h-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-500">Drop the files here</p>
          ) : (
            <>
              <p className="text-gray-600">Drag and drop patient data files here, or click to select</p>
              <p className="text-sm text-gray-500 mt-2">Supported format: .csv</p>
            </>
          )}
        </div>
      </div>

      {acceptedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">
              {acceptedFiles.length} file(s) uploaded successfully
            </span>
          </div>
          <div className="mt-2 max-h-32 overflow-y-auto">
            {acceptedFiles.map((file, index) => (
              <div key={index} className="text-sm text-gray-500 py-1">
                {file.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Required CSV Format:</h4>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-xs text-gray-600 font-mono">
            patientunitstayid,hospitalid,apacheadmissiondx,admissionweight,admissionheight,itemoffset,Heart Rate,MAP (mmHg),Respiratory Rate,O2 Saturation,FiO2,Temperature (C),glucose,pH,admissiontime
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;