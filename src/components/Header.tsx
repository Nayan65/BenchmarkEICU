import React from 'react';
import { Menu, Activity, Bell } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  return (
    <header className="z-10 py-4 bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between h-full px-6">
        <div className="flex items-center">
          <button
            className="p-1 mr-5 -ml-1 rounded-md md:hidden focus:outline-none focus:shadow-outline-blue"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-blue-500 mr-2" />
            <h1 className="text-xl font-bold text-gray-800">EICU Benchmarking</h1>
          </div>
        </div>

        <div className="flex items-center">
          <button
            className="p-1 mr-4 rounded-md focus:outline-none focus:shadow-outline-blue"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-500" />
          </button>
          <div className="relative w-8 h-8 overflow-hidden bg-gray-200 rounded-full">
            <svg
              className="absolute w-10 h-10 text-gray-400 -left-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;