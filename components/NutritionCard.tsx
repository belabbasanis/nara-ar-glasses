
import React from 'react';
import { NutritionData, HealthStatus } from '../types';
import Tooltip from './Tooltip';

interface Props {
  data: NutritionData;
}

const NutritionCard: React.FC<Props> = ({ data }) => {
  const getHealthStatus = (sugar: number): HealthStatus => {
    if (sugar < 10) return HealthStatus.SAFE;
    if (sugar < 20) return HealthStatus.MODERATE;
    return HealthStatus.CAUTION;
  };

  const status = getHealthStatus(data.sugars);

  const statusStyles = {
    [HealthStatus.SAFE]: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800',
      label: 'Optimal Choice'
    },
    [HealthStatus.MODERATE]: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
      label: 'Moderate Impact'
    },
    [HealthStatus.CAUTION]: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800',
      label: 'High Glycemic'
    }
  };

  const config = statusStyles[status];

  return (
    <div className={`rounded-3xl border ${config.border} ${config.bg} p-6 mb-6 shadow-sm overflow-hidden relative`}>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className={`text-2xl font-black ${config.text} mb-1 capitalize tracking-tight`}>{data.foodName}</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.badge}`}>
            {config.label}
          </span>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 mb-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Net Carbs</p>
            <Tooltip text="Net carbs (Total Carbs - Fiber) are the carbohydrates that actually impact your blood sugar levels.">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </Tooltip>
          </div>
          <p className="text-3xl font-black text-gray-900 leading-none">{data.netCarbs.toFixed(1)}g</p>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/50 relative z-10">
        <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
          "{data.summary}"
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Total</p>
          <p className="text-lg font-black text-gray-800">{data.totalCarbs}g</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Sugars</p>
          <p className="text-lg font-black text-gray-800">{data.sugars}g</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Fiber</p>
          <p className="text-lg font-black text-gray-800">{data.fiber}g</p>
        </div>
      </div>
    </div>
  );
};

export default NutritionCard;
