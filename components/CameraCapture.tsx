
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface Props {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<Props> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied or not available.');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [startCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
        stream?.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white p-8 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* AR-style corners */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
        
        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8">
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button 
            onClick={capture}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl active:scale-90 transition-transform"
          >
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500" />
          </button>
          
          <div className="w-12 h-12" /> {/* Spacer */}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <p className="mt-6 text-white/60 text-sm font-medium">Position food inside the markers</p>
    </div>
  );
};

export default CameraCapture;
