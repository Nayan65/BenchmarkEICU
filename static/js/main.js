// Handle file upload and data processing
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/process-data', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            displayPatientList(result.data);
        } else {
            alert('Error processing data: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error uploading file');
    }
});

// Display patient list
function displayPatientList(patients) {
    const patientList = document.getElementById('patientList');
    patientList.innerHTML = '';
    
    patients.forEach(patient => {
        const div = document.createElement('div');
        div.className = 'p-3 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50';
        div.innerHTML = `
            <div class="font-medium text-gray-900">Patient ${patient.patientunitstayid}</div>
            <div class="text-sm text-gray-500">${patient.apacheadmissiondx}</div>
        `;
        
        div.addEventListener('click', () => loadPatientData(patient.patientunitstayid));
        patientList.appendChild(div);
    });
}

// Load patient data and display charts
async function loadPatientData(patientId) {
    try {
        const response = await fetch(`/api/predict/${patientId}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            displayVitalsChart(result.predictions);
            displayPredictions(result.predictions, result.risk_scores);
        } else {
            alert('Error loading patient data: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading patient data');
    }
}

// Display vitals chart using Plotly
function displayVitalsChart(predictions) {
    const trace1 = {
        y: predictions.vitals.map(v => v.heart_rate),
        type: 'scatter',
        name: 'Heart Rate'
    };
    
    const trace2 = {
        y: predictions.vitals.map(v => v.map),
        type: 'scatter',
        name: 'MAP'
    };
    
    const data = [trace1, trace2];
    const layout = {
        title: 'Patient Vitals',
        height: 400,
        margin: { t: 30 }
    };
    
    Plotly.newPlot('vitalsChart', data, layout);
}

// Display predictions
function displayPredictions(predictions, riskScores) {
    const predictionsDiv = document.getElementById('predictions');
    predictionsDiv.innerHTML = `
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-lg font-medium text-gray-900">Mortality Risk</div>
            <div class="text-3xl font-bold ${riskScores.mortality > 0.5 ? 'text-red-600' : 'text-green-600'}">
                ${(riskScores.mortality * 100).toFixed(1)}%
            </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-lg font-medium text-gray-900">Decompensation Risk</div>
            <div class="text-3xl font-bold ${riskScores.decompensation > 0.5 ? 'text-red-600' : 'text-green-600'}">
                ${(riskScores.decompensation * 100).toFixed(1)}%
            </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-lg font-medium text-gray-900">Latest Vitals</div>
            <div class="space-y-2 mt-2">
                <div class="text-sm">
                    <span class="font-medium">Heart Rate:</span> ${predictions.heart_rate.toFixed(1)} bpm
                </div>
                <div class="text-sm">
                    <span class="font-medium">MAP:</span> ${predictions.map.toFixed(1)} mmHg
                </div>
                <div class="text-sm">
                    <span class="font-medium">Respiratory Rate:</span> ${predictions.respiratory_rate.toFixed(1)} /min
                </div>
            </div>
        </div>
    `;
}