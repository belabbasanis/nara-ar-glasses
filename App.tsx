import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeFoodImage } from './services/geminiService';
import { connectAssistant, encodePCM, decodeBase64, decodeAudioData } from './services/liveService';
import { MetabolicData } from './types';
import AROverlay from './components/AROverlay';

const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  
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
    },
    assistant: {
      is_active: false,
      is_thinking: false,
      response: ""
    }
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      setError('CAMERA_LINK_FAILED');
      setMetabolic(m => ({ ...m, system_state: 'NO_SIGNAL' }));
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
      liveSessionRef.current?.close();
    };
  }, [startCamera]);

  const triggerAnalysis = async () => {
    if (!videoRef.current || !canvasRef.current || metabolic.scan.state === 'SCANNING') return;
    setMetabolic(prev => ({ ...prev, scan: { ...prev.scan, state: 'SCANNING' } }));
    
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
      try {
        const scanResult = await analyzeFoodImage(base64, metabolic);
        setMetabolic(prev => ({ ...prev, scan: scanResult }));
      } catch (err) {
        setMetabolic(prev => ({ ...prev, scan: { ...prev.scan, state: 'IDLE' } }));
      }
    }
  };

  const handleAssistant = async () => {
    if (isLiveActive) {
      liveSessionRef.current?.close();
      setIsLiveActive(false);
      return;
    }

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = outputCtx;

      const sessionPromise = connectAssistant(metabolic, {
        onOpen: () => {
          setIsLiveActive(true);
          setMetabolic(m => ({ ...m, assistant: { ...m.assistant, is_active: true, response: "LISTENING..." } }));
          
          const source = inputCtx.createMediaStreamSource(micStream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            const pcmBlob = { data: encodePCM(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onTranscription: (text) => {
          setMetabolic(m => ({ ...m, assistant: { ...m.assistant, response: text } }));
        },
        onAudioChunk: async (base64) => {
          const buffer = await decodeAudioData(decodeBase64(base64), outputCtx, 24000, 1);
          const source = outputCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(outputCtx.destination);
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += buffer.duration;
        },
        onClose: () => {
          setIsLiveActive(false);
          setMetabolic(m => ({ ...m, assistant: { ...m.assistant, is_active: false, response: "" } }));
          micStream.getTracks().forEach(t => t.stop());
        }
      });

      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      setError("VOICE_LINK_FAILED");
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale brightness-110 contrast-125 opacity-70" />
      <div className="absolute inset-0 bg-emerald-900/5 pointer-events-none" />
      <AROverlay 
        metabolic={metabolic} 
        onScanTrigger={triggerAnalysis} 
        onAssistantTrigger={handleAssistant}
        isAnalyzing={metabolic.scan.state === 'SCANNING'} 
      />
      {error && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-500/90 text-black px-4 py-1 text-[10px] font-black tracking-widest">{error}</div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default App;
