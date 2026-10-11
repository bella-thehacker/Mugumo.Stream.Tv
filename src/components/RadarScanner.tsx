import React from 'react';

interface RadarScannerProps {
  detectedCount: number;
  isSearching: boolean;
}

export const RadarScanner: React.FC<RadarScannerProps> = ({ detectedCount, isSearching }) => {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-full bg-[#020B08] border-2 border-[#14352B] p-2 flex items-center justify-center shadow-[inset_0_0_30px_rgba(6,29,22,0.8)]">
      
      {/* Concentric distance rings */}
      <div className="absolute inset-4 rounded-full border border-[#14352B]/80" />
      <div className="absolute inset-10 rounded-full border border-[#14352B]/60" />
      <div className="absolute inset-16 rounded-full border border-[#14352B]/40" />

      {/* Crosshairs */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#14352B]/70" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-[#14352B]/70" />

      {/* Sweeping Phosphor Beam */}
      <div 
        className="absolute inset-0 rounded-full origin-center pointer-events-none animate-radar-sweep"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, rgba(167, 243, 208, 0.4) 0deg, rgba(167, 243, 208, 0.05) 45deg, transparent 90deg, transparent 360deg)',
        }}
      />

      {/* Center Receiver Node */}
      <div className="relative z-10 w-3 h-3 rounded-full bg-[#A7F3D0] shadow-[0_0_10px_#A7F3D0]" />

      {/* Detected Signal Blips */}
      {detectedCount > 0 && (
        <>
          <div className="absolute top-12 left-16 w-2 h-2 rounded-full bg-[#EC4899] shadow-[0_0_8px_#EC4899] animate-ping" />
          <div className="absolute bottom-14 right-14 w-2 h-2 rounded-full bg-[#A7F3D0] shadow-[0_0_8px_#A7F3D0] animate-pulse" />
          {detectedCount > 3 && (
            <div className="absolute top-20 right-12 w-1.5 h-1.5 rounded-full bg-[#EC4899] shadow-[0_0_6px_#EC4899]" />
          )}
        </>
      )}

      {/* Status Overlay */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <span className="text-[11px] font-mono tracking-wider text-[#A7F3D0] crt-glow">
          {isSearching ? 'SCANNING THE CANOPY...' : detectedCount > 0 ? `SIGNAL DETECTED [${detectedCount}]` : 'CANOPY SILENT'}
        </span>
      </div>
    </div>
  );
};
