import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import { PatientProvider } from './context/PatientContext';
import { ModelProvider } from './context/ModelContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ModelProvider>
      <PatientProvider>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          <div className="flex flex-col flex-1 w-full">
            <Header setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 overflow-auto p-4 md:p-6">
              <Dashboard />
            </main>
            <Footer />
          </div>
        </div>
      </PatientProvider>
    </ModelProvider>
  );
}

export default App;