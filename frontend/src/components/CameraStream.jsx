import React from 'react';
import { Camera, Mic, Wifi, AlertTriangle } from 'lucide-react';

const CameraStream = ({ videoRef, canvasRef, wsConnected, isProctoring, streamError }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl aspect-[4/3] w-full">
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1]"
      />

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Connection and Proctor status indicator overlays */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border text-xs font-semibold text-white">
          <span className={`h-2.5 w-2.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-signal' : 'bg-rose-500'} transition-all`} />
          <span>{wsConnected ? 'AI Live Connection' : 'Offline'}</span>
        </div>

        {isProctoring && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/90 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
            <span>Live Monitoring</span>
          </div>
        )}
      </div>

      {/* Camera feed placeholder in case of permissions error or stream loading */}
      {streamError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-dark-900/90 text-center text-rose-500 border border-rose-500/20">
          <AlertTriangle className="h-10 w-10 mb-3 animate-bounce" />
          <h4 className="font-semibold text-base">Media Stream Fault</h4>
          <p className="text-xs text-slate-400 max-w-[220px] mt-1.5">{streamError}</p>
        </div>
      )}

      {/* Hardware Status Panel in bottom corner */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between glass border px-3 py-2 rounded-xl text-slate-200">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <Camera className="h-4 w-4 text-brand-500" />
            <span>Webcam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mic className="h-4 w-4 text-brand-500" />
            <span>Microphone</span>
          </div>
        </div>
        <Wifi className={`h-4.5 w-4.5 ${wsConnected ? 'text-emerald-500' : 'text-rose-500'}`} />
      </div>
    </div>
  );
};

export default CameraStream;
