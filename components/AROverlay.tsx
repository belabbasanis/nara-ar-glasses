import React from 'react';
import { MetabolicData, Trend } from '../types';

interface Props {
  metabolic: MetabolicData;
  onScanTrigger: () => void;
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

const AROverlay: React.FC<Props> = ({ metabolic, onScanTrigger, isAnalyzing }) => {
  const { glucose, calories, system_state, scan } = metabolic;

  return (
    <div className="ar-workspace">
      {/* Visual Debug: Center Corridor (Subtle) */}
      <div className="corridor-overlay" />

      {/* 10% Inner Padding Safe Zone */}
      <div className="absolute inset-0 p-[5.625%_10%] flex justify-between pointer-events-none">
        
        {/* LEFT HUD SIDE (35% width area) */}
        <div className="w-[31.25%] h-full flex flex-col justify-between py-4">
          {/* Top Left: Body State */}
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

          {/* Bottom Left: Calorie & Metabolic Context */}
          <div className="hud-text">
            <div className="text-[11px] opacity-60 font-bold mb-1 tracking-widest uppercase">Metabolic Load</div>
            <div className="text-[16px] font-bold">CAL {calories.consumed_today}/{calories.daily_target}</div>
            <div className="text-[12px] font-bold opacity-80">NET_CARBS {calories.net_carbs_grams}G</div>
          </div>
        </div>

        {/* CENTER COLUMN (30% width reserved for real world) */}
        <div className="w-[30%] h-full flex flex-col items-center justify-center">
          {/* Subtle Reticle */}
          <div className="w-12 h-12 relative opacity-30">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#39FF14]" />
            <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#39FF14]" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#39FF14]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#39FF14]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#39FF14]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#39FF14]" />
          </div>
          
          {scan.state === 'SCANNING' && (
            <div className="mt-4 hud-text text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">
              ANALYZING_CONTEXT
            </div>
          )}
        </div>

        {/* RIGHT HUD SIDE (35% width area) */}
        <div className="w-[31.25%] h-full flex flex-col justify-between py-4 items-end text-right">
          {/* Top Right: Current Context Label */}
          <div className="hud-text font-bold">
            <div className="text-[10px] opacity-50 mb-1 tracking-tighter">GLYCO_OS_V0.2_LANDSCAPE</div>
            {scan.state === 'COMPLETE' && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="text-[16px] uppercase truncate max-w-[180px]">{scan.food_name}</div>
                <div className={`text-[10px] inline-block px-2 py-0.5 mt-1 rounded font-black ${scan.impact_level === 'HIGH' ? 'bg-amber-500 text-black' : 'bg-[#39FF14] text-black'}`}>
                  IMPACT: {scan.impact_level}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Right: Scan Results & Action */}
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
                <div className="flex justify-between">
                  <span className="opacity-50 uppercase text-[9px]">Fiber</span>
                  <span>{scan.fiber_grams}G</span>
                </div>
              </div>
            )}

            {/* Always Visible Trigger Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); onScanTrigger(); }}
              disabled={isAnalyzing}
              className="pointer-events-auto group relative flex items-center gap-3 transition-all active:scale-95"
            >
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black tracking-widest uppercase transition-opacity ${isAnalyzing ? 'opacity-30' : 'opacity-60'}`}>
                  {isAnalyzing ? 'SCANNING' : 'TRIGGER_SCAN'}
                </span>
                <span className="text-[8px] opacity-30 font-bold uppercase">Manual_Override</span>
              </div>
              <div className={`w-12 h-12 border-2 ${isAnalyzing ? 'border-[#39FF14]/20' : 'border-[#39FF14]/40 group-hover:border-[#39FF14]'} rounded-full flex items-center justify-center transition-colors bg-black/20 backdrop-blur-md`}>
                <div className={`w-8 h-8 rounded-full border border-[#39FF14]/20 flex items-center justify-center`}>
                  <div className={`w-1.5 h-1.5 bg-[#39FF14] rounded-full ${isAnalyzing ? 'animate-ping' : 'opacity-40'}`} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Scanline Effect (Over Entire Width when Scanning) */}
      {isAnalyzing && (
        <div className="absolute left-0 right-0 h-px bg-[#39FF14]/40 shadow-[0_0_20px_rgba(57,255,20,0.4)] animate-scanline z-50 pointer-events-none" />
      )}
    </div>
  );
};

export default AROverlay;