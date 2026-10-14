import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { RitualIntro } from '../components/RitualIntro';
import { SanctuaryStorage } from '../services/storage';
import { AuthService } from '../services/authService';
import { soundscape } from '../services/soundscape';
import { Sparkles, ArrowRight, UserPlus, Compass, RotateCcw } from 'lucide-react';

export const Sanctuary: React.FC = () => {
 const [showRitual, setShowRitual] = useState(true);
  const [isGlitching, setIsGlitching] = useState(false);
  const navigate = useNavigate();

 const handleGuestEntry = () => {
  soundscape.playStaticBurst(350);
  setIsGlitching(true);

  SanctuaryStorage.setGateUnlocked(true);
  SanctuaryStorage.addLog(
    'SIGNAL',
    'SYSTEM',
    'Gate access granted for clearance: GUEST'
  );

  AuthService.enterAsGuest();

  setTimeout(() => {
    navigate('/grove');
  }, 450);
};

  const handleEnterTheGrove = () => {
    soundscape.playTuningClick();
    navigate('/login');
  };

  const handleFindYourRoots = () => {
    soundscape.playTuningClick();
    navigate('/register');
  };

  if (showRitual) {
    return (
      <RitualIntro
        onComplete={() => {
          SanctuaryStorage.setGateUnlocked(true);
          setShowRitual(false);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* 1. Atmospheric Forest Canvas & SVG Backdrop */}
      <ForestEnvironment intensity="full" showCRTAnchor={true} />

      {/* 2. Glitch Flash Transition */}
      {isGlitching && (
        <div className="fixed inset-0 z-50 bg-[#A7F3D0]/20 backdrop-invert pointer-events-none animate-pulse" />
      )}

      {/* 3. The Sanctuary Gateway Card */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-[#030E0B]/90 border border-[#14352B] p-6 sm:p-10 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-left">
        
        {/* Subtle Header Node Stamp */}
        <div className="flex items-center justify-between pb-5 border-b border-[#14352B]/70 text-xs font-mono text-[#D8C9A5]/60">
          <div className="flex items-center gap-2 text-[#A7F3D0]">
            <Sparkles className="w-4 h-4 text-[#EC4899] animate-pulse" />
            <span className="tracking-wider">MŨGUMO.STREAM // GATEWAY</span>
          </div>
          <span className="text-[#A7F3D0]/60">NODE 001 · 142.05 MHz</span>
        </div>

        {/* Central Atmospheric Welcome Message */}
        <div className="my-7 space-y-3">
          <span className="text-[11px] font-mono tracking-widest text-[#EC4899] uppercase block">
            The Sanctuary
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-light text-[#A7F3D0] tracking-wide crt-glow leading-tight">
            Some stories find you when the world grows quiet.
          </h1>
          <p className="font-editorial text-sm sm:text-base text-[#D8C9A5]/85 leading-relaxed pt-1">
            Enter your personal corner of MŨGUMO to discover films, save the stories you love, and continue where you left off beside the ancient tree.
          </p>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="space-y-3 pt-2">
          {/* Enter the Grove (Sign In) */}
          <button
            onClick={handleEnterTheGrove}
            className="w-full py-3 px-5 rounded-xl bg-[#061D16] border border-[#A7F3D0]/80 text-sm font-mono text-[#A7F3D0] hover:bg-[#0A2E22] hover:border-[#A7F3D0] hover:box-phosphor-glow transition-all flex items-center justify-between group shadow-lg"
          >
            <span className="tracking-wider font-semibold">ENTER THE GROVE</span>
            <div className="flex items-center gap-2 text-xs text-[#A7F3D0]/80">
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Find Your Roots (Sign Up) */}
          <button
            onClick={handleFindYourRoots}
            className="w-full py-3 px-5 rounded-xl bg-[#04110D] border border-[#14352B] text-sm font-mono text-[#D8C9A5] hover:border-[#EC4899]/70 hover:text-[#EC4899] hover:bg-[#071913] transition-all flex items-center justify-between group"
          >
            <span className="tracking-wider">FIND YOUR ROOTS</span>
            <div className="flex items-center gap-2 text-xs text-[#D8C9A5]/60 group-hover:text-[#EC4899]">
              <span>Create Account</span>
              <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
            </div>
          </button>
        </div>

        {/* Guest Mode & Replay Ritual Footer */}
        <div className="mt-8 pt-5 border-t border-[#14352B]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <button
            onClick={handleGuestEntry}
            className="text-[#D8C9A5]/70 hover:text-[#A7F3D0] transition-colors flex items-center gap-1.5"
            title="Wander into the sanctuary without signing in"
          >
            <Compass className="w-3.5 h-3.5 text-[#A7F3D0]" />
            <span>Preview as Guest Traveler</span>
          </button>

          <button
            onClick={() => {
              soundscape.playTuningClick();
              setShowRitual(true);
            }}
            className="text-[#D8C9A5]/50 hover:text-[#EC4899] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Ritual</span>
          </button>
        </div>
      </div>
    </div>
  );
};
