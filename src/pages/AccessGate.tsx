import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { RitualIntro } from '../components/RitualIntro';
import { SanctuaryStorage } from '../services/storage';
import { soundscape } from '../services/soundscape';
import { Terminal, Key, ArrowRight, Sparkles } from 'lucide-react';

export const AccessGate: React.FC = () => {
  const [showRitual, setShowRitual] = useState(() => !SanctuaryStorage.isGateUnlocked());
  const [accessKey, setAccessKey] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleUnlock = (keyUsed: string) => {
    soundscape.playStaticBurst(350);
    setIsGlitching(true);
    SanctuaryStorage.setGateUnlocked(true);
    SanctuaryStorage.addLog('SIGNAL', 'SYSTEM', `Gate access granted for clearance: ${keyUsed || 'GUEST'}`);

    setTimeout(() => {
      navigate('/grove');
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) {
      setErrorMsg('ENTER ANY KEY OR SELECT GUEST ENTRY');
      return;
    }
    handleUnlock(accessKey.trim());
  };

  const handleGuestEntry = () => {
    handleUnlock('GUEST_CLEARING');
  };

  if (showRitual) {
    return <RitualIntro onComplete={() => setShowRitual(false)} />;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Background forest environment */}
      <ForestEnvironment intensity="full" showCRTAnchor={true} />

      {/* Glitch Overlay on Submit */}
      {isGlitching && (
        <div className="fixed inset-0 z-50 bg-[#A7F3D0]/20 backdrop-invert pointer-events-none animate-pulse" />
      )}

      {/* Access Gate Terminal Box */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-[#030E0B]/90 border border-[#14352B] p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#14352B]/70 text-xs font-mono text-[#D8C9A5]/60">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#A7F3D0]" />
            <span className="text-[#A7F3D0]">MUGUMO_OS // NODE 001</span>
          </div>
          <span>V1.06</span>
        </div>

        {/* Atmosphere Quote */}
        <div className="my-6 space-y-2 text-left">
          <p className="font-editorial text-lg text-[#D8C9A5] leading-relaxed">
            The world is loud. Stay here a while.
          </p>
          <p className="text-xs font-mono text-[#EC4899] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transmissions broadcasting under the sacred fig tree.</span>
          </p>
        </div>

        {/* Terminal Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-[11px] font-mono text-[#A7F3D0] uppercase tracking-wider mb-2">
              MŪGUMO_SYS_V1.06: ENTER_ACCESS_KEY
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-mono text-[#A7F3D0] pointer-events-none">
                &gt;
              </span>
              <input
                type="text"
                value={accessKey}
                onChange={(e) => {
                  setAccessKey(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="CTRL-1984 or any word..."
                autoFocus
                className="w-full rounded-md bg-[#020705] border border-[#14352B] py-2.5 pl-8 pr-4 text-sm font-mono text-[#A7F3D0] placeholder-[#D8C9A5]/30 focus:outline-none focus:border-[#A7F3D0] focus:ring-1 focus:ring-[#A7F3D0] crt-glow"
              />
              <span className="absolute right-3 w-2 h-4 bg-[#A7F3D0] animate-pulse pointer-events-none" />
            </div>
            {errorMsg && (
              <p className="text-[11px] font-mono text-[#EC4899] mt-1.5">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-md bg-[#061D16] border border-[#A7F3D0]/60 text-sm font-mono text-[#A7F3D0] hover:bg-[#0A2E22] hover:border-[#A7F3D0] hover:box-phosphor-glow transition-all flex items-center justify-center gap-2 group"
          >
            <span>ACCESS SANCTUARY</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Guest Entry & Ritual Replay Options */}
        <div className="mt-6 pt-4 border-t border-[#14352B]/60 flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={handleGuestEntry}
            className="text-[#D8C9A5]/70 hover:text-[#EC4899] transition-colors flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Enter as Guest Traveler</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRitual(true)}
            className="text-[#D8C9A5]/50 hover:text-[#A7F3D0] transition-colors"
          >
            Replay Ritual
          </button>
        </div>
      </div>
    </div>
  );
};
