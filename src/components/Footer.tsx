import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-4 border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500">
            © 2025 EICU Benchmarking Model. All rights reserved.
          </div>
          <div className="mt-2 md:mt-0 text-sm text-gray-500">
            Version 0.1.0 • Data last updated: January 20, 2025
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;