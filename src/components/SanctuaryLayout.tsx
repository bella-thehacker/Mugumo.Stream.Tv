import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from './Navigation';
import { AuthService } from '../services/authService';
import { SanctuaryStorage } from '../services/storage';
import { soundscape } from '../services/soundscape';
import { SanctuarySettings, AuthSession } from '../types';
import { Radio, Sparkles, ShieldAlert } from 'lucide-react';

export const SanctuaryLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<AuthSession>(() => AuthService.getSession());
  const [settings, setSettings] = useState<SanctuarySettings>(() => SanctuaryStorage.getSettings());
  const [sanctuaryTime, setSanctuaryTime] = useState<string>('');

  const syncState = () => {
    setSession(AuthService.getSession());
    setSettings(SanctuaryStorage.getSettings());
  };

  useEffect(() => {
    syncState();
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, [location.pathname]);

  // Live sanctuary clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSanctuaryTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Route check
  useEffect(() => {
    const cur = AuthService.getSession();
    if (!cur.account && !cur.isGuest) {
      // If neither authenticated account nor guest, enter as guest or redirect
      AuthService.enterAsGuest();
      setSession(AuthService.getSession());
    }
  }, []);

  const brightnessPercent = settings.crtBrightness || 100;
  const isScanlinesActive = settings.crtScanlines ?? true;
  const isReducedMotion = settings.reducedMotion ?? false;

  return (
    <div 
      className={`min-h-screen w-full flex flex-col bg-[#030E0B] text-[#D8C9A5] relative selection:bg-[#EC4899]/30 selection:text-[#A7F3D0] ${
        isReducedMotion ? 'motion-reduce' : ''
      }`}
      style={{
        filter: brightnessPercent !== 100 ? `brightness(${brightnessPercent / 100})` : undefined,
      }}
    >
      {/* Global CRT Scanlines Overlay if enabled */}
      {isScanlinesActive && (
        <div 
          className="fixed inset-0 pointer-events-none z-50 opacity-20 mix-blend-overlay"
          style={{
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%)',
            backgroundSize: '100% 3px',
          }}
          aria-hidden="true"
        />
      )}

      {/* Global Vignette Frame */}
      <div 
        className="fixed inset-0 pointer-events-none z-40 shadow-[inset_0_0_120px_rgba(2,9,7,0.7)]"
        aria-hidden="true"
      />

      {/* Global Application Navigation Bar */}
      <Navigation />

      {/* Guest Mode Atmospheric Banner (dismissible or informative) */}
      {session.isGuest && location.pathname !== '/choose-your-clearing' && (
        <div className="relative z-30 bg-[#061D16]/90 border-b border-[#14352B] py-1.5 px-4 text-xs font-mono text-[#D8C9A5]/80 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#EC4899] animate-pulse" />
            <span>
              Wandering as <strong>Guest Traveler</strong>. Clearings are saved locally on this machine.
            </span>
          </div>
          <button
            onClick={() => {
              soundscape.playTuningClick();
              navigate('/register');
            }}
            className="text-[#A7F3D0] hover:text-[#EC4899] underline transition-colors whitespace-nowrap ml-4 text-[11px]"
          >
            Root Your Account &rarr;
          </button>
        </div>
      )}

      {/* Routed Page Content */}
      <div className="flex-1 flex flex-col w-full relative">
        <Outlet />
      </div>

      {/* Unified Atmospheric Sanctuary Status Bar Footer */}
      <footer className="relative z-30 border-t border-[#14352B]/40 bg-[#020907]/90 backdrop-blur-sm py-4 px-4 sm:px-8 text-xs font-mono text-[#D8C9A5]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#A7F3D0] animate-pulse shadow-[0_0_8px_#A7F3D0]" />
          <span className="text-[#A7F3D0]/80">MŨGUMO TRANSMISSION ACTIVE</span>
          <span className="hidden md:inline text-[#14352B]">|</span>
          <span className="hidden md:inline text-[#D8C9A5]/40">FREQ: 142.05 MHz</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>CLEARING: <strong className="text-[#A7F3D0]">{session.activeProfile?.name || 'GUEST'}</strong></span>
          <span className="text-[#14352B]">|</span>
          <span>TIME: <span className="text-[#D8C9A5]/70">{sanctuaryTime}</span></span>
          <span className="text-[#14352B]">|</span>
          <span className="hidden sm:inline text-[#D8C9A5]/40">ANALOG TAPE HAVEN</span>
        </div>
      </footer>
    </div>
  );
};
