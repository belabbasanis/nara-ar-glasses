import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeFoodImage } from './services/geminiService';
import { MetabolicData } from './types';
import AROverlay from './components/AROverlay';

const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Data Contract State v0.2
  const [metabolic, setMetabolic] = useState<MetabolicData>({
    system_state: "OK",
    glucose: {
      value: 118,
      unit: "mg/dL",
      trend: "DOWN",
      status: "IN_RANGE",
      age_minutes: 2
    },
    calories: {
      consumed_today: 420,
      daily_target: 1800,
      net_carbs_grams: 32
    },
    scan: {
      state: "IDLE",
      impact_level: "LOW",
      delta_glucose_min: 0,
      delta_glucose_max: 0,
      carbs_grams: 0,
      sugars_grams: 0,
      fiber_grams: 0
    }
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      setError('CAMERA_LINK_FAILED: ACCESS_DENIED');
      setMetabolic(m => ({ ...m, system_state: 'NO_SIGNAL' }));
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [startCamera]);

  const triggerAnalysis = async () => {
    if (!videoRef.current || !canvasRef.current || metabolic.scan.state === 'SCANNING') return;
    
    setMetabolic(prev => ({ ...prev, scan: { ...prev.scan, state: 'SCANNING' } }));
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
      
      try {
        const scanResult = await analyzeFoodImage(base64, metabolic);
        setMetabolic(prev => ({ ...prev, scan: scanResult }));
      } catch (err) {
        setError('DATA_LINK_ERROR');
        setMetabolic(prev => ({ ...prev, scan: { ...prev.scan, state: 'IDLE' } }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Background Camera Feed */}
      <video 
        ref={videoRef} 
        autoPlay playsInline 
        className="w-full h-full object-cover grayscale brightness-110 contrast-125 opacity-70"
      />
      
      {/* Global Tint */}
      <div className="absolute inset-0 bg-emerald-900/5 pointer-events-none" />

      {/* AR HUD Component with Landscape Constraints */}
      <AROverlay 
        metabolic={metabolic} 
        onScanTrigger={triggerAnalysis} 
        isAnalyzing={metabolic.scan.state === 'SCANNING'} 
      />

      {/* Error Message Tooltip (Inside safe zone) */}
      {error && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-500/90 text-black px-4 py-1 text-[10px] font-black tracking-widest animate-bounce">
            {error}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default App;