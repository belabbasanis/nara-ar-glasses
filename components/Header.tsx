
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
            GS
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
            GlycoSnap
          </h1>
        </div>
        <div className="hidden sm:block text-sm text-gray-500 font-medium">
          Pre-Diabetes Food Assistant
        </div>
      </div>
    </header>
  );
};

export default Header;
