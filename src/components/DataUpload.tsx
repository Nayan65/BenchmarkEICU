import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload, CheckCircle } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { normalizeTimeSeries, imputeTimeSeries } from '../utils/dataPreprocessing';

const DataUpload: React.FC = () => {
  const { setPatients } = usePatient();

  const processCSV = async (file: File) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const processedData = results.data.map((row: any) => {
            // Extract and normalize numerical values
            const numericalFields = ['admissionweight', 'admissionheight'];
            numericalFields.forEach(field => {
              if (row[field]) {
                row[field] = parseFloat(row[field]);
              }
            });

            // Process vital signs and lab values
            const vitals = {
              heartRate: row['Heart Rate'] ? parseFloat(row['Heart Rate']) : null,
              map: row['MAP (mmHg)'] ? parseFloat(row['MAP (mmHg)']) : null,
              respiratoryRate: row['Respiratory Rate'] ? parseFloat(row['Respiratory Rate']) : null,
              o2Saturation: row['O2 Saturation'] ? parseFloat(row['O2 Saturation']) : null,
              fio2: row['FiO2'] ? parseFloat(row['FiO2']) : null,
              temperature: row['Temperature (C)'] ? parseFloat(row['Temperature (C)']) : null,
            };

            const labs = {
              glucose: row['glucose'] ? parseFloat(row['glucose']) : null,
              ph: row['pH'] ? parseFloat(row['pH']) : null,
            };

            return {
              id: row.patientunitstayid,
              hospitalId: row.hospitalid || row.hospitalname,
              admissionDiagnosis: row.apacheadmissiondx,
              admissionWeight: row.admissionweight,
              admissionHeight: row.admissionheight,
              timestamp: row.itemoffset,
              admissionTime: row.admissiontime,
              vitals: {
                ...vitals,
                heartRate: normalizeTimeSeries(imputeTimeSeries([{ timestamp: row.itemoffset, value: vitals.heartRate }])),
                map: normalizeTimeSeries(imputeTimeSeries([{ timestamp: row.itemoffset, value: vitals.map }])),
                respiratoryRate: normalizeTimeSeries(imputeTimeSeries([{ timestamp: row.itemoffset, value: vitals.respiratoryRate }])),
                o2Saturation: normalizeTimeSeries(imputeTimeSeries([{ timestamp: row.itemoffset, value: vitals.o2Saturation }])),
                fio2: normalizeTimeSeries(imputeTimeSeries([{ timestamp: row.itemoffset, value: vitals.fio2 }])),
                temperature: normalizeTimeSeries(imputeTimeSeries([{ timestamp: row.itemoffset, value: vitals.temperature }]))
              },
              labs: {
                glucose: normalizeTimeSeries(imputeTimeSeries([{ timestamp: row.itemoffset, value: labs.glucose }])),
                ph: normalizeTimeSeries(imputeTimeSeries([{ timestamp: row.itemoffset, value: labs.ph }]))
              }
            };
          });

          resolve(processedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const processedData = await processCSV(acceptedFiles[0]);
      setPatients(processedData);
    } catch (error) {
      console.error('Error processing CSV:', error);
    }
  }, [setPatients]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
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
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-500">Drop the CSV file here</p>
          ) : (
            <>
              <p className="text-gray-600">Drag and drop a CSV file here, or click to select</p>
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
              {acceptedFiles[0].name} uploaded successfully
            </span>
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