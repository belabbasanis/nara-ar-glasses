import React from 'react';
import { MetabolicData, Trend } from '../types';

interface Props {
  metabolic: MetabolicData;
  onScanTrigger: () => void;
  onAssistantTrigger: () => void;
  isAnalyzing: boolean;
}

const getTrendArrow = (trend: Trend) => {
  switch (trend) {
    case 'UP': return '↑';
    case 'DOWN': return '↓';
    case 'RAPID_UP': return '↑↑';
    case 'RAPID_DOWN': return '↓↓';
    default: return '→';
  }
};

const AROverlay: React.FC<Props> = ({ metabolic, onScanTrigger, onAssistantTrigger, isAnalyzing }) => {
  const { glucose, calories, system_state, scan, assistant } = metabolic;

  return (
    <div className="ar-workspace">
      <div className="corridor-overlay" />

      <div className="absolute inset-0 p-[5.625%_10%] flex justify-between pointer-events-none">
        
        {/* LEFT HUD SIDE */}
        <div className="w-[31.25%] h-full flex flex-col justify-between py-4">
          <div className="hud-text font-bold">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${system_state === 'OK' ? 'bg-[#39FF14]' : 'bg-red-500'} animate-pulse`} />
              <span className="text-[12px] tracking-[0.2em]">SYS:{system_state}</span>
            </div>
            <div className="text-[28px] leading-tight mb-1">
              {glucose.value}<span className="text-[18px]">{getTrendArrow(glucose.trend)}</span>
            </div>
            <div className="text-[14px] opacity-80 mb-2">
              {glucose.status} <span className="text-[10px] opacity-60 ml-2">{glucose.age_minutes}M_AGO</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {assistant.is_active && (
              <div className="hud-text bg-black/60 border-l-2 border-[#39FF14] p-3 animate-in slide-in-from-left duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[9px] font-black opacity-50 tracking-widest uppercase">Live_Comms</div>
                  <div className="flex gap-0.5 items-end h-2">
                    <div className="w-0.5 bg-[#39FF14] animate-[h-pulse_0.5s_infinite]" style={{height: '100%'}} />
                    <div className="w-0.5 bg-[#39FF14] animate-[h-pulse_0.7s_infinite]" style={{height: '60%'}} />
                    <div className="w-0.5 bg-[#39FF14] animate-[h-pulse_0.6s_infinite]" style={{height: '80%'}} />
                  </div>
                </div>
                <div className="text-[11px] leading-tight uppercase font-bold text-[#39FF14] max-w-[200px]">
                  {assistant.response || "..."}
                </div>
              </div>
            )}
          </div>

          <div className="hud-text">
            <div className="text-[11px] opacity-60 font-bold mb-1 tracking-widest uppercase">Metabolic Load</div>
            <div className="text-[16px] font-bold">CAL {calories.consumed_today}/{calories.daily_target}</div>
            <div className="text-[12px] font-bold opacity-80 uppercase">Net_Carbs {calories.net_carbs_grams}g</div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="w-[30%] h-full flex flex-col items-center justify-center">
          <div className="w-12 h-12 relative opacity-30">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#39FF14]" />
            <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#39FF14]" />
          </div>
          {scan.state === 'SCANNING' && (
            <div className="mt-4 hud-text text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">
              Analyzing_Context
            </div>
          )}
        </div>

        {/* RIGHT HUD SIDE */}
        <div className="w-[31.25%] h-full flex flex-col justify-between py-4 items-end text-right">
          <div className="hud-text font-bold">
            <div className="text-[10px] opacity-50 mb-1 tracking-tighter">GLYCO_OS_V0.3_LIVE</div>
            {scan.state === 'COMPLETE' && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="text-[16px] uppercase truncate max-w-[180px]">{scan.food_name}</div>
                <div className={`text-[10px] inline-block px-2 py-0.5 mt-1 rounded font-black ${scan.impact_level === 'HIGH' ? 'bg-amber-500 text-black' : 'bg-[#39FF14] text-black'}`}>
                  IMPACT: {scan.impact_level}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-6">
            {scan.state === 'COMPLETE' && (
              <div className="hud-text grid grid-cols-1 gap-1 text-[11px] font-bold w-full max-w-[160px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between border-b border-[#39FF14]/10 pb-1 mb-1">
                  <span className="opacity-50 uppercase text-[9px]">ΔGlucose</span>
                  <span className="text-amber-400">+{scan.delta_glucose_min}-{scan.delta_glucose_max}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-50 uppercase text-[9px]">Carbs</span>
                  <span>{scan.carbs_grams}G</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-50 uppercase text-[9px]">Sugars</span>
                  <span className={scan.sugars_grams > 15 ? 'text-amber-400' : ''}>{scan.sugars_grams}G</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={(e) => { e.stopPropagation(); onAssistantTrigger(); }}
                className={`group relative flex flex-col items-center transition-all active:scale-90 ${assistant.is_active ? 'animate-pulse' : ''}`}
              >
                <div className={`w-12 h-12 border border-[#39FF14] rounded-full flex items-center justify-center transition-colors ${assistant.is_active ? 'bg-[#39FF14] text-black shadow-[0_0_15px_#39FF14]' : 'bg-black/40 text-[#39FF14]'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <span className="text-[8px] font-black tracking-widest mt-1 opacity-50 uppercase">{assistant.is_active ? 'Active' : 'Ask_AI'}</span>
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); onScanTrigger(); }}
                disabled={isAnalyzing}
                className="group relative flex items-center gap-3 transition-all active:scale-95"
              >
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black tracking-widest uppercase ${isAnalyzing ? 'opacity-30' : 'opacity-60'}`}>
                    {isAnalyzing ? 'Scanning' : 'Trigger_Scan'}
                  </span>
                </div>
                <div className={`w-12 h-12 border-2 ${isAnalyzing ? 'border-[#39FF14]/20' : 'border-[#39FF14]/40 group-hover:border-[#39FF14]'} rounded-full flex items-center justify-center bg-black/20`}>
                  <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <div className="absolute left-0 right-0 h-px bg-[#39FF14]/40 shadow-[0_0_20px_#39FF14] animate-scanline z-50 pointer-events-none" />
      )}
      
      <style>{`
        @keyframes h-pulse {
          0%, 100% { height: 40%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AROverlay;
