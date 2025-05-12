import React from 'react';
import { 
  Activity, User, BarChart2, ChevronsRight, 
  FileText, Settings, X, Database, Eye,
  BrainCircuit, HeartPulse, Clock
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-20 transition-opacity bg-black bg-opacity-50 lg:hidden ${
          open ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      ></div>

      <aside
        className={`fixed inset-y-0 z-30 flex-shrink-0 w-64 mt-16 overflow-y-auto bg-white lg:static lg:mt-0 
          transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="py-4 text-gray-500">
          <div className="flex items-center justify-between px-6 py-2 mb-4 lg:hidden">
            <h2 className="text-lg font-bold text-gray-800">Menu</h2>
            <button 
              onClick={() => setOpen(false)}
              className="p-1 rounded-md focus:outline-none focus:shadow-outline-blue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-2">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Main
            </h2>
            <ul className="mt-3">
              <li className="relative px-2 py-1">
                <a
                  className="inline-flex items-center w-full py-2 px-3 text-sm font-medium transition-colors 
                  duration-150 rounded-md bg-blue-100 text-blue-800"
                  href="#"
                >
                  <Activity className="w-5 h-5 mr-3" />
                  <span>Dashboard</span>
                </a>
              </li>
              <li className="relative px-2 py-1">
                <a
                  className="inline-flex items-center w-full py-2 px-3 text-sm font-medium transition-colors 
                  duration-150 rounded-md hover:bg-gray-100"
                  href="#"
                >
                  <User className="w-5 h-5 mr-3" />
                  <span>Patients</span>
                </a>
              </li>
              <li className="relative px-2 py-1">
                <a
                  className="inline-flex items-center w-full py-2 px-3 text-sm font-medium transition-colors 
                  duration-150 rounded-md hover:bg-gray-100"
                  href="#"
                >
                  <BarChart2 className="w-5 h-5 mr-3" />
                  <span>Statistics</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="px-6 py-2 mt-4">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Models
            </h2>
            <ul className="mt-3">
              <li className="relative px-2 py-1">
                <a
                  className="inline-flex items-center w-full py-2 px-3 text-sm font-medium transition-colors 
                  duration-150 rounded-md hover:bg-gray-100"
                  href="#"
                >
                  <HeartPulse className="w-5 h-5 mr-3" />
                  <span>Mortality</span>
                </a>
              </li>
              <li className="relative px-2 py-1">
                <a
                  className="inline-flex items-center w-full py-2 px-3 text-sm font-medium transition-colors 
                  duration-150 rounded-md hover:bg-gray-100"
                  href="#"
                >
                  <BrainCircuit className="w-5 h-5 mr-3" />
                  <span>Decompensation</span>
                </a>
              </li>
              <li className="relative px-2 py-1">
                <a
                  className="inline-flex items-center w-full py-2 px-3 text-sm font-medium transition-colors 
                  duration-150 rounded-md hover:bg-gray-100"
                  href="#"
                >
                  <Clock className="w-5 h-5 mr-3" />
                  <span>Length of Stay</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="px-6 py-2 mt-4">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              System
            </h2>
            <ul className="mt-3">
              <li className="relative px-2 py-1">
                <a
                  className="inline-flex items-center w-full py-2 px-3 text-sm font-medium transition-colors 
                  duration-150 rounded-md hover:bg-gray-100"
                  href="#"
                >
                  <Database className="w-5 h-5 mr-3" />
                  <span>Data Import</span>
                </a>
              </li>
              <li className="relative px-2 py-1">
                <a
                  className="inline-flex items-center w-full py-2 px-3 text-sm font-medium transition-colors 
                  duration-150 rounded-md hover:bg-gray-100"
                  href="#"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  <span>Reports</span>
                </a>
              </li>
              <li className="relative px-2 py-1">
                <a
                  className="inline-flex items-center w-full py-2 px-3 text-sm font-medium transition-colors 
                  duration-150 rounded-md hover:bg-gray-100"
                  href="#"
                >
                  <Eye className="w-5 h-5 mr-3" />
                  <span>Model Inspector</span>
                </a>
              </li>
              <li className="relative px-2 py-1">
                <a
                  className="inline-flex items-center w-full py-2 px-3 text-sm font-medium transition-colors 
                  duration-150 rounded-md hover:bg-gray-100"
                  href="#"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;