import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Menu, X, Radio } from 'lucide-react';
import { soundscape } from '../services/soundscape';

interface NavigationProps {
  onAudioChange?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onAudioChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioActive, setAudioActive] = useState(() => !soundscape.getAudioStatus().isMuted && soundscape.getAudioStatus().isEnabled);
  const navigate = useNavigate();

  const toggleSound = () => {
    const isNowActive = soundscape.toggleMute();
    setAudioActive(isNowActive);
    if (onAudioChange) onAudioChange();
  };

  const navLinks = [
    { name: 'The Grove', path: '/grove' },
    { name: 'The Cinema', path: '/cinema/interstellar' },
    { name: 'The Signal', path: '/signal' },
    { name: 'The Vault', path: '/vault' },
    { name: 'System Logs', path: '/logs' },
  ];

  return (
    <header className="relative z-40 w-full border-b border-[#14352B]/40 bg-[#030E0B]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => navigate('/grove')}
          className="text-left group flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A7F3D0]"
        >
          <span className="font-editorial text-xl sm:text-2xl font-light tracking-wider text-[#A7F3D0] group-hover:text-[#EC4899] transition-colors crt-glow">
            MŨGUMO.STREAM
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#D8C9A5]/50 border-l border-[#14352B] pl-2.5">
            NODE 001
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-[#A7F3D0] border-b-2 border-[#A7F3D0]'
                    : 'text-[#D8C9A5]/70 hover:text-[#D8C9A5]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Ambient Forest Audio Quick Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Forest Audio"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all border ${
              audioActive
                ? 'bg-[#061D16] border-[#A7F3D0]/60 text-[#A7F3D0] box-phosphor-glow'
                : 'bg-[#04110D] border-[#14352B] text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
            }`}
            title="Forest Night Wind & CRT Soundscape"
          >
            {audioActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#EC4899]" />
                <span className="hidden sm:inline">FOREST AUDIO</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">MUTED</span>
              </>
            )}
          </button>

          {/* Quick Signal Tuning Button */}
          <button
            onClick={() => {
              soundscape.playTuningClick();
              navigate('/signal');
            }}
            className="p-1.5 text-[#D8C9A5]/60 hover:text-[#A7F3D0] hover:bg-[#061D16] rounded transition-colors hidden sm:flex items-center justify-center"
            title="Locate Signal"
          >
            <Radio className="w-4 h-4" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#D8C9A5]/80 hover:text-[#A7F3D0] focus-visible:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#14352B] bg-[#030E0B]/95 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-[#061D16] text-[#A7F3D0] border-l-2 border-[#A7F3D0]'
                    : 'text-[#D8C9A5]/70 hover:bg-[#061D16]/50 hover:text-[#D8C9A5]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
