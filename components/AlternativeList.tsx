
import React from 'react';
import { Alternative } from '../types';

interface Props {
  alternatives: Alternative[];
}

const AlternativeList: React.FC<Props> = ({ alternatives }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-800 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Smart Alternatives
      </h4>
      <div className="grid gap-3">
        {alternatives.map((alt, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-emerald-100 transition-colors">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-gray-900">{alt.name}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {alt.carbsSaved} saved
              </span>
            </div>
            <p className="text-sm text-gray-600">{alt.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlternativeList;
