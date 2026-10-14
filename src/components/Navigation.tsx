import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Menu, X, Radio, User, ChevronDown, LogOut, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { soundscape } from '../services/soundscape';
import { AuthService } from '../services/authService';
import { ProfileAvatar } from './ProfileAvatar';
import { AuthSession } from '../types';

interface NavigationProps {
  onAudioChange?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onAudioChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [session, setSession] = useState<AuthSession>(() => AuthService.getSession());
  const [audioActive, setAudioActive] = useState(() => !soundscape.getAudioStatus().isMuted && soundscape.getAudioStatus().isEnabled);
  const navigate = useNavigate();
  const location = useLocation();

  const syncSession = () => {
    setSession(AuthService.getSession());
  };

  useEffect(() => {
    syncSession();
    window.addEventListener('storage', syncSession);
    window.addEventListener('focus', syncSession);
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('focus', syncSession);
    };
  }, [location.pathname]);

  const toggleSound = () => {
    const isNowActive = soundscape.toggleMute();
    setAudioActive(isNowActive);
    if (onAudioChange) onAudioChange();
  };

  const handleNavigate = (path: string) => {
    soundscape.playTuningClick();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleSignOut = () => {
    soundscape.playStaticBurst(200);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    AuthService.logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'The Grove', path: '/grove' },
    { name: 'The Cinema', path: '/cinema/interstellar' },
    { name: 'The Signal', path: '/signal' },
    { name: 'The Vault', path: '/vault' },
    { name: 'My Clearing', path: '/my-clearing' },
    { name: 'System Logs', path: '/logs' },
  ];

  const activeProfile = session.activeProfile;
  const isGuest = session.isGuest;

  return (
    <header className="relative z-40 w-full border-b border-[#14352B]/40 bg-[#030E0B]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => handleNavigate('/grove')}
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
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium tracking-wide">
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

        {/* Zone 3: Audio Toggle, Settings, Profile Avatar & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
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

          {/* Quick Signal Radar Shortcut */}
          <button
            onClick={() => handleNavigate('/signal')}
            className="p-2 text-[#D8C9A5]/60 hover:text-[#A7F3D0] hover:bg-[#061D16] rounded-lg border border-transparent hover:border-[#14352B] transition-colors hidden sm:flex items-center justify-center"
            title="Locate Signal Transmission"
          >
            <Radio className="w-4 h-4" />
          </button>

          {/* Settings Shortcut Button */}
          <button
            onClick={() => handleNavigate('/settings')}
            className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${
              location.pathname === '/settings'
                ? 'bg-[#061D16] border-[#A7F3D0]/50 text-[#A7F3D0]'
                : 'text-[#D8C9A5]/60 hover:text-[#A7F3D0] hover:bg-[#061D16] border-transparent hover:border-[#14352B]'
            }`}
            title="Sanctuary Settings & Experience Tuning"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Active Profile Pill / Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 py-1 px-2 rounded-lg border border-[#14352B] hover:border-[#A7F3D0] bg-[#04110D] text-left transition-colors"
              title="Viewing Clearing & Profile Menu"
            >
              <ProfileAvatar
                name={activeProfile?.name || 'Guest'}
                avatarSeed={activeProfile?.avatarSeed || 'roots'}
                imageBlobUrl={activeProfile?.imageBlobUrl}
                size="sm"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-mono text-[#D8C9A5] max-w-[100px] truncate leading-tight">
                  {activeProfile?.name || 'Guest'}
                </span>
                <span className="text-[9px] font-mono text-[#A7F3D0]/60 leading-none">
                  {isGuest ? 'GUEST NODE' : (activeProfile?.forestTitle || 'CLEARING ACTIVE')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#D8C9A5]/50 ml-0.5" />
            </button>

            {/* Profile Menu Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#030E0B] border border-[#14352B] p-2 shadow-2xl space-y-1 text-left text-xs font-mono z-50">
                <div className="px-3 py-2 border-b border-[#14352B]/60 mb-1 flex items-center gap-2.5">
                  <ProfileAvatar
                    name={activeProfile?.name || 'Guest'}
                    avatarSeed={activeProfile?.avatarSeed || 'roots'}
                    imageBlobUrl={activeProfile?.imageBlobUrl}
                    size="sm"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-[#A7F3D0]/70 uppercase block">
                      {isGuest ? 'GUEST RECEPTOR' : (session.account?.username || 'SANCTUARY KEEPER')}
                    </span>
                    <span className="font-editorial text-sm text-[#A7F3D0] truncate block">
                      {activeProfile?.name || 'Guest Traveler'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigate('/my-clearing')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#061D16] hover:text-[#A7F3D0] text-[#D8C9A5]/90 flex items-center gap-2.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                  <span>My Clearing & Profile</span>
                </button>

                <button
                  onClick={() => handleNavigate('/choose-your-clearing')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#061D16] hover:text-[#A7F3D0] text-[#D8C9A5]/90 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#A7F3D0]" />
                  <span>Switch Clearing</span>
                </button>

                <button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#061D16] hover:text-[#A7F3D0] text-[#D8C9A5]/90 flex items-center gap-2.5 transition-colors"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#D8C9A5]/70" />
                  <span>Sanctuary Settings</span>
                </button>

                <div className="border-t border-[#14352B]/60 my-1" />

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#260C0A] hover:text-red-300 text-[#D8C9A5]/60 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Exit to Sanctuary</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#D8C9A5]/80 hover:text-[#A7F3D0] focus-visible:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#14352B] bg-[#030E0B]/95 px-4 pt-3 pb-5 space-y-2">
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
          <NavLink
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-base font-medium transition-colors ${
                isActive
                  ? 'bg-[#061D16] text-[#A7F3D0] border-l-2 border-[#A7F3D0]'
                  : 'text-[#D8C9A5]/70 hover:bg-[#061D16]/50 hover:text-[#D8C9A5]'
              }`
            }
          >
            Settings
          </NavLink>
          <div className="pt-2 border-t border-[#14352B]/60 flex justify-between items-center px-3">
            <button
              onClick={() => handleNavigate('/choose-your-clearing')}
              className="text-xs font-mono text-[#A7F3D0] hover:underline"
            >
              Switch Clearing ({activeProfile?.name || 'Guest'})
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs font-mono text-red-400 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
