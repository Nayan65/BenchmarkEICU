import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { usePatient } from '../../context/PatientContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const VitalsChart: React.FC = () => {
  const { selectedPatient } = usePatient();
  const [timeRange, setTimeRange] = useState<'12h' | '24h' | '48h'>('24h');
  const [selectedVitals, setSelectedVitals] = useState<string[]>(['heartRate', 'map', 'o2Saturation', 'temperature']);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  useEffect(() => {
    if (selectedPatient) {
      const latestO2 = selectedPatient.vitals.o2Saturation[selectedPatient.vitals.o2Saturation.length - 1]?.value;
      if (latestO2 <= 50) {
        const message = `Critical Alert: Patient ${selectedPatient.id} O2 saturation has dropped to ${latestO2.toFixed(1)}%`;
        setAlertMessage(message);
        setShowAlert(true);
        
        // Request notification permission and show notification
        if (Notification.permission === "granted") {
          new Notification("Critical Patient Alert", {
            body: message,
            icon: "/alert-icon.png",
            tag: `patient-${selectedPatient.id}`,
            vibrate: [200, 100, 200],
            requireInteraction: true
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("Critical Patient Alert", {
                body: message,
                icon: "/alert-icon.png",
                tag: `patient-${selectedPatient.id}`,
                vibrate: [200, 100, 200],
                requireInteraction: true
              });
            }
          });
        }
      } else {
        setShowAlert(false);
      }
    }
  }, [selectedPatient]);
  
  // Early return if no patient selected
  if (!selectedPatient) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Select a patient to view vitals</p>
      </div>
    );
  }
  
  // Format dates for x-axis
  const formatTimeLabel = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Calculate time range bounds
  const getTimeRangeData = (data: any[], hours: number) => {
    if (!data || data.length === 0) return [];
    return data.slice(-hours);
  };
  
  // Get hour count based on selected range
  const getHourCount = () => {
    switch (timeRange) {
      case '12h': return 12;
      case '24h': return 24;
      case '48h': return 48;
      default: return 24;
    }
  };
  
  // Get vitals data
  const hourCount = getHourCount();
  const heartRateData = getTimeRangeData(selectedPatient.vitals.heartRate, hourCount);
  const mapData = getTimeRangeData(selectedPatient.vitals.map, hourCount);
  const o2SatData = getTimeRangeData(selectedPatient.vitals.o2Saturation, hourCount);
  const temperatureData = getTimeRangeData(selectedPatient.vitals.temperature, hourCount);
  const respiratoryRateData = getTimeRangeData(selectedPatient.vitals.respiratoryRate, hourCount);
  const fio2Data = getTimeRangeData(selectedPatient.vitals.fio2, hourCount);
  
  // Define normal ranges for vitals
  const vitalRanges = {
    heartRate: { min: 60, max: 100, label: 'Heart Rate' },
    map: { min: 65, max: 110, label: 'MAP' },
    o2Saturation: { min: 92, max: 100, label: 'O2 Saturation' },
    temperature: { min: 36, max: 38, label: 'Temperature' },
    respiratoryRate: { min: 12, max: 20, label: 'Respiratory Rate' },
    fio2: { min: 0.21, max: 0.6, label: 'FiO2' }
  };
  
  // Check if value is outside normal range
  const isAbnormal = (value: number, vitalType: keyof typeof vitalRanges) => {
    const range = vitalRanges[vitalType];
    return value < range.min || value > range.max;
  };
  
  // Generate point colors based on abnormality
  const getPointColors = (data: any[], vitalType: keyof typeof vitalRanges) => {
    return data.map(point => 
      isAbnormal(point.value, vitalType) 
        ? 'rgba(239, 68, 68, 0.8)' 
        : `rgba(var(--vital-color-${vitalType}), 0.8)`
    );
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems: any[]) {
            if (tooltipItems.length > 0) {
              const index = tooltipItems[0].dataIndex;
              const dataset = tooltipItems[0].dataset;
              if (dataset.timestamps && dataset.timestamps[index]) {
                return new Date(dataset.timestamps[index]).toLocaleString();
              }
            }
            return '';
          },
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const vitalType = context.dataset.vitalType;
            const range = vitalRanges[vitalType as keyof typeof vitalRanges];
            const isOutOfRange = isAbnormal(value, vitalType as keyof typeof vitalRanges);
            return `${label}: ${value.toFixed(1)}${isOutOfRange ? ' (Abnormal)' : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };
  
  // Prepare datasets
  const datasets = [
    {
      label: 'Heart Rate',
      data: heartRateData.map(point => point.value),
      borderColor: 'rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      pointBackgroundColor: getPointColors(heartRateData, 'heartRate'),
      tension: 0.3,
      hidden: !selectedVitals.includes('heartRate'),
      vitalType: 'heartRate',
      timestamps: heartRateData.map(point => point.timestamp)
    },
    {
      label: 'MAP',
      data: mapData.map(point => point.value),
      borderColor: 'rgba(16, 185, 129, 0.8)',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      pointBackgroundColor: getPointColors(mapData, 'map'),
      tension: 0.3,
      hidden: !selectedVitals.includes('map'),
      vitalType: 'map',
      timestamps: mapData.map(point => point.timestamp)
    },
    {
      label: 'O2 Saturation',
      data: o2SatData.map(point => point.value),
      borderColor: 'rgba(245, 158, 11, 0.8)',
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      pointBackgroundColor: getPointColors(o2SatData, 'o2Saturation'),
      tension: 0.3,
      hidden: !selectedVitals.includes('o2Saturation'),
      vitalType: 'o2Saturation',
      timestamps: o2SatData.map(point => point.timestamp)
    },
    {
      label: 'Temperature',
      data: temperatureData.map(point => point.value),
      borderColor: 'rgba(139, 92, 246, 0.8)',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      pointBackgroundColor: getPointColors(temperatureData, 'temperature'),
      tension: 0.3,
      hidden: !selectedVitals.includes('temperature'),
      vitalType: 'temperature',
      timestamps: temperatureData.map(point => point.timestamp)
    },
    {
      label: 'Respiratory Rate',
      data: respiratoryRateData.map(point => point.value),
      borderColor: 'rgba(236, 72, 153, 0.8)',
      backgroundColor: 'rgba(236, 72, 153, 0.2)',
      pointBackgroundColor: getPointColors(respiratoryRateData, 'respiratoryRate'),
      tension: 0.3,
      hidden: !selectedVitals.includes('respiratoryRate'),
      vitalType: 'respiratoryRate',
      timestamps: respiratoryRateData.map(point => point.timestamp)
    },
    {
      label: 'FiO2',
      data: fio2Data.map(point => point.value),
      borderColor: 'rgba(124, 58, 237, 0.8)',
      backgroundColor: 'rgba(124, 58, 237, 0.2)',
      pointBackgroundColor: getPointColors(fio2Data, 'fio2'),
      tension: 0.3,
      hidden: !selectedVitals.includes('fio2'),
      vitalType: 'fio2',
      timestamps: fio2Data.map(point => point.timestamp)
    }
  ];
  
  const data = {
    labels: heartRateData.map(point => formatTimeLabel(point.timestamp)),
    datasets
  };
  
  const toggleVital = (vital: string) => {
    setSelectedVitals(prev => 
      prev.includes(vital)
        ? prev.filter(v => v !== vital)
        : [...prev, vital]
    );
  };
  
  return (
    <div>
      {showAlert && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Critical Alert!</strong>
          <span className="block sm:inline"> {alertMessage}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Time Range:</span>
          <div className="flex space-x-1">
            <button
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                timeRange === '12h'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setTimeRange('12h')}
            >
              12h
            </button>
            <button
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                timeRange === '24h'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setTimeRange('24h')}
            >
              24h
            </button>
            <button
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                timeRange === '48h'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setTimeRange('48h')}
            >
              48h
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
          <span className="text-xs text-gray-500">Abnormal values</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(vitalRanges).map(([key, value]) => (
          <button
            key={key}
            onClick={() => toggleVital(key)}
            className={`px-3 py-1 text-xs font-medium rounded-md ${
              selectedVitals.includes(key)
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {value.label}
          </button>
        ))}
      </div>
      
      <div className="h-80">
        <Line options={options} data={data} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(vitalRanges).map(([key, range]) => (
          <div key={key} className="text-xs text-gray-600">
            <span className="font-medium">{range.label}:</span> Normal range {range.min}-{range.max}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VitalsChart;