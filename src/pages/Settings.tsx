import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { SanctuaryStorage } from '../services/storage';
import { AuthService } from '../services/authService';
import { soundscape } from '../services/soundscape';
import { SanctuarySettings, AuthSession } from '../types';
import { 
  Settings as SettingsIcon, Volume2, VolumeX, Tv, Eye, Sparkles, 
  RotateCcw, Download, Trash2, Key, User, Check, AlertTriangle, 
  Play, Radio, Sliders, ShieldCheck
} from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession>(() => AuthService.getSession());
  const [settings, setSettings] = useState<SanctuarySettings>(() => SanctuaryStorage.getSettings());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Account Edit Form State
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [displayName, setDisplayName] = useState(session.account?.displayName || '');
  const [email, setEmail] = useState(session.account?.email || '');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  // Password Change Form State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Confirmations
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showResetSettingsConfirm, setShowResetSettingsConfirm] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const cur = AuthService.getSession();
    setSession(cur);
    if (cur.account) {
      setDisplayName(cur.account.displayName);
      setEmail(cur.account.email);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Update a single setting
  const updateSetting = <K extends keyof SanctuarySettings>(key: K, value: SanctuarySettings[K]) => {
    const updated = SanctuaryStorage.saveSettings({ [key]: value });
    setSettings(updated);

    // Apply real-time soundscape adjustments
    if (key === 'ambientVolume') {
      soundscape.setAmbientVolume(value as number);
    } else if (key === 'crtHumVolume') {
      soundscape.setCrtHumVolume(value as number);
    } else if (key === 'ambientAudioEnabled') {
      if (value) soundscape.enableAudio();
      else soundscape.toggleMute();
    }

    if (settings.uiSoundEffects) {
      soundscape.playTuningClick();
    }

    triggerToast('Sanctuary settings updated');
  };

  // Test sound frequency
  const handleTestAudio = () => {
    soundscape.playStaticBurst(220);
    setTimeout(() => soundscape.playTuningClick(), 150);
  };

  // Handle Account Info Update
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session.account) return;
    setAccountError('');
    setAccountSuccess('');

    const res = await AuthService.updateAccount(session.account.id, {
      displayName,
      email,
    });

    if (!res.success || !res.account) {
      setAccountError(res.error || 'Failed to update account.');
      return;
    }

    soundscape.playTuningClick();
    setSession(AuthService.getSession());
    setAccountSuccess('Account information successfully rooted.');
    setIsEditingAccount(false);
    triggerToast('Account details saved');
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session.account) return;
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const res = await AuthService.changePassword(
      session.account.id,
      currentPassword,
      newPassword
    );

    if (!res.success) {
      setPasswordError(res.error || 'Failed to update password.');
      return;
    }

    soundscape.playTuningClick();
    setPasswordSuccess('Credentials securely updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
    triggerToast('Password updated');
  };

  // Handle Clear Watch History
  const handleClearHistory = () => {
    soundscape.playStaticBurst(250);
    SanctuaryStorage.clearWatchHistory();
    setShowClearHistoryConfirm(false);
    triggerToast('Watch history cleared for this clearing');
  };

  // Handle Reset Experience Settings
  const handleResetSettings = () => {
    soundscape.playTuningClick();
    const defaults = SanctuaryStorage.resetExperienceSettings();
    setSettings(defaults);
    soundscape.setAmbientVolume(defaults.ambientVolume);
    soundscape.setCrtHumVolume(defaults.crtHumVolume);
    setShowResetSettingsConfirm(false);
    triggerToast('Experience settings restored to forest defaults');
  };

  // Handle Export Archive Data
  const handleExportData = () => {
    soundscape.playTuningClick();
    SanctuaryStorage.exportSanctuaryData(session.account, session.activeProfile);
    triggerToast('Sanctuary archive exported to JSON');
  };

  // Handle Delete Account
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session.account) return;
    setDeleteError('');

    const res = await AuthService.deleteAccount(session.account.id, deletePassword);
    if (!res.success) {
      setDeleteError(res.error || 'Failed to dissolve account.');
      return;
    }

    soundscape.playStaticBurst(400);
    setShowDeleteAccountModal(false);
    navigate('/');
  };

  const isGuest = session.isGuest;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col overflow-x-hidden">
      {/* 1. Forest Atmosphere */}
      <ForestEnvironment intensity="subtle" showCRTAnchor={true} />

      {/* 2. Main Content */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-left">
        
        {/* Header */}
        <div className="border-b border-[#14352B]/60 pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A7F3D0]">
            <SettingsIcon className="w-4 h-4 text-[#EC4899]" />
            <span>SANCTUARY CALIBRATION & EXPERIENCE CONTROL</span>
          </div>
          <h1 className="mt-2 font-editorial text-3xl sm:text-5xl font-light text-[#A7F3D0] crt-glow">
            Settings & Tuning
          </h1>
          <p className="mt-1 font-editorial italic text-sm sm:text-base text-[#D8C9A5]/70 max-w-2xl">
            Calibrate the procedural forest soundscape, adjust CRT analog scanlines, manage playback quality, and configure your sanctuary credentials.
          </p>
        </div>

        {/* Section 1: Audio Soundscape Engineering */}
        <section className="rounded-2xl bg-[#04110D]/90 border border-[#14352B] p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between border-b border-[#14352B]/60 pb-4">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-[#EC4899]" />
              <h2 className="font-editorial text-xl sm:text-2xl text-[#A7F3D0]">
                Audio & Soundscape Engine
              </h2>
            </div>
            <button
              onClick={handleTestAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#061D16] border border-[#14352B] hover:border-[#A7F3D0] text-xs font-mono text-[#A7F3D0] transition-colors"
              title="Audition current audio settings"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Audio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ambient Wind Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#D8C9A5]">FOREST NIGHT WIND & CRICKETS</span>
                <span className="text-[#A7F3D0]">{Math.round(settings.ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.ambientVolume}
                onChange={(e) => updateSetting('ambientVolume', parseFloat(e.target.value))}
                className="w-full accent-[#A7F3D0] bg-[#030E0B] cursor-pointer"
              />
              <p className="text-[11px] font-mono text-[#D8C9A5]/50">
                Procedural Brownian noise simulating nocturnal canopy breezes and distant forest cicadas.
              </p>
            </div>

            {/* CRT TV Hum Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#D8C9A5]">CRT TUBE FLYBACK HUM</span>
                <span className="text-[#A7F3D0]">{Math.round(settings.crtHumVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.crtHumVolume}
                onChange={(e) => updateSetting('crtHumVolume', parseFloat(e.target.value))}
                className="w-full accent-[#EC4899] bg-[#030E0B] cursor-pointer"
              />
              <p className="text-[11px] font-mono text-[#D8C9A5]/50">
                Subtle 15.7 kHz transformer hum and thermal coil vibration from 1980s television sets.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#14352B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[#D8C9A5]">MECHANICAL SWITCH CLICKS</span>
              <p className="text-[11px] font-mono text-[#D8C9A5]/50">
                Tactile audio feedback when toggling channels, filters, and dials.
              </p>
            </div>
            <button
              onClick={() => updateSetting('uiSoundEffects', !settings.uiSoundEffects)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                settings.uiSoundEffects
                  ? 'bg-[#061D16] border-[#A7F3D0] text-[#A7F3D0] box-phosphor-glow'
                  : 'bg-[#030E0B] border-[#14352B] text-[#D8C9A5]/50'
              }`}
            >
              {settings.uiSoundEffects ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </section>

        {/* Section 2: CRT Display & Analog Transmission */}
        <section className="rounded-2xl bg-[#04110D]/90 border border-[#14352B] p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#14352B]/60 pb-4">
            <Tv className="w-5 h-5 text-[#A7F3D0]" />
            <h2 className="font-editorial text-xl sm:text-2xl text-[#A7F3D0]">
              CRT Display & Analog Video
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-[#D8C9A5]">CRT SCANLINES OVERLAY</span>
                  <p className="text-[11px] font-mono text-[#D8C9A5]/50">
                    Horizontal raster lines mimicking authentic cathode-ray phosphor grids.
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('crtScanlines', !settings.crtScanlines)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    settings.crtScanlines
                      ? 'bg-[#061D16] border-[#A7F3D0] text-[#A7F3D0]'
                      : 'bg-[#030E0B] border-[#14352B] text-[#D8C9A5]/50'
                  }`}
                >
                  {settings.crtScanlines ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-[#D8C9A5]">GLASS CURVATURE & VIGNETTE</span>
                  <p className="text-[11px] font-mono text-[#D8C9A5]/50">
                    Curved corner shadows mimicking a heavy convex glass tube.
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('crtCurvature', !settings.crtCurvature)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    settings.crtCurvature
                      ? 'bg-[#061D16] border-[#A7F3D0] text-[#A7F3D0]'
                      : 'bg-[#030E0B] border-[#14352B] text-[#D8C9A5]/50'
                  }`}
                >
                  {settings.crtCurvature ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Screen Brightness */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#D8C9A5]">SCREEN BRIGHTNESS CALIBRATION</span>
                  <span className="text-[#A7F3D0]">{settings.crtBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  step="5"
                  value={settings.crtBrightness}
                  onChange={(e) => updateSetting('crtBrightness', parseInt(e.target.value))}
                  className="w-full accent-[#A7F3D0] bg-[#030E0B] cursor-pointer"
                />
              </div>
            </div>

            {/* Live CRT Preview Card */}
            <div className="rounded-xl border border-[#14352B] bg-[#020907] p-4 text-center space-y-2 relative overflow-hidden">
              <div className="text-[10px] font-mono text-[#A7F3D0]/70 uppercase tracking-widest">
                LIVE PHOSPHOR PREVIEW
              </div>
              <div 
                className={`relative w-full h-32 rounded-lg bg-[#061D16] flex items-center justify-center border border-[#14352B] overflow-hidden ${
                  settings.crtCurvature ? 'crt-curvature' : ''
                } ${settings.crtScanlines ? 'crt-scanlines' : ''}`}
                style={{ filter: `brightness(${settings.crtBrightness / 100})` }}
              >
                <div className="text-center space-y-1 z-20">
                  <span className="font-editorial text-lg text-[#A7F3D0] crt-glow block">
                    MŨGUMO 142.05 MHz
                  </span>
                  <span className="text-[10px] font-mono text-[#EC4899] block animate-pulse">
                    RECEIVER LOCKED
                  </span>
                </div>
              </div>
              <p className="text-[10px] font-mono text-[#D8C9A5]/40">
                Adjustments take effect across all viewing cinema screens.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Performance, Motion & Streaming */}
        <section className="rounded-2xl bg-[#04110D]/90 border border-[#14352B] p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#14352B]/60 pb-4">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="font-editorial text-xl sm:text-2xl text-[#A7F3D0]">
              Sanctuary Motion & Reel Playback
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#D8C9A5]">REDUCED MOTION</span>
                <p className="text-[11px] font-mono text-[#D8C9A5]/50">
                  Minimizes background canvas particle bursts and fog drifts.
                </p>
              </div>
              <button
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  settings.reducedMotion
                    ? 'bg-[#061D16] border-[#A7F3D0] text-[#A7F3D0]'
                    : 'bg-[#030E0B] border-[#14352B] text-[#D8C9A5]/50'
                }`}
              >
                {settings.reducedMotion ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Autoplay Next */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#D8C9A5]">AUTOPLAY NEXT REEL</span>
                <p className="text-[11px] font-mono text-[#D8C9A5]/50">
                  Seamlessly advance to next reel or series episode.
                </p>
              </div>
              <button
                onClick={() => updateSetting('autoplayNext', !settings.autoplayNext)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  settings.autoplayNext
                    ? 'bg-[#061D16] border-[#A7F3D0] text-[#A7F3D0]'
                    : 'bg-[#030E0B] border-[#14352B] text-[#D8C9A5]/50'
                }`}
              >
                {settings.autoplayNext ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Playback Quality */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#D8C9A5]">
                TRANSMISSION STREAM RESOLUTION
              </label>
              <select
                value={settings.playbackQuality}
                onChange={(e) => updateSetting('playbackQuality', e.target.value as SanctuarySettings['playbackQuality'])}
                className="w-full bg-[#030E0B] border border-[#14352B] rounded-lg px-3.5 py-2 text-xs font-mono text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
              >
                <option value="1080p">1080p High Definition (Standard)</option>
                <option value="720p">720p Energy Saver</option>
                <option value="analog">Analog VHS Broadcast (Soft Grain)</option>
              </select>
            </div>

            {/* Subtitles */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#D8C9A5]">SUBTITLES / CC BY DEFAULT</span>
                <p className="text-[11px] font-mono text-[#D8C9A5]/50">
                  Always enable closed captions when starting transmissions.
                </p>
              </div>
              <button
                onClick={() => updateSetting('subtitlesEnabled', !settings.subtitlesEnabled)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  settings.subtitlesEnabled
                    ? 'bg-[#061D16] border-[#A7F3D0] text-[#A7F3D0]'
                    : 'bg-[#030E0B] border-[#14352B] text-[#D8C9A5]/50'
                }`}
              >
                {settings.subtitlesEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Account & Sanctuary Credentials */}
        <section className="rounded-2xl bg-[#04110D]/90 border border-[#14352B] p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between border-b border-[#14352B]/60 pb-4">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-[#A7F3D0]" />
              <h2 className="font-editorial text-xl sm:text-2xl text-[#A7F3D0]">
                Sanctuary Account Credentials
              </h2>
            </div>

            {!isGuest && (
              <button
                onClick={() => {
                  soundscape.playTuningClick();
                  setIsEditingAccount(!isEditingAccount);
                }}
                className="text-xs font-mono text-[#A7F3D0] hover:underline"
              >
                {isEditingAccount ? 'Cancel Edit' : 'Edit Info'}
              </button>
            )}
          </div>

          {isGuest ? (
            <div className="rounded-xl border border-dashed border-amber-600/40 p-5 bg-[#261508]/40 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>EPHEMERAL GUEST SESSION</span>
              </div>
              <p className="text-xs font-editorial italic text-[#D8C9A5]/80">
                You are currently wandering as a Guest Traveler. Your clearings and vault tapes exist locally in your browser memory.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => {
                    soundscape.playTuningClick();
                    navigate('/register');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#061D16] border border-[#A7F3D0] text-xs font-mono text-[#A7F3D0] hover:bg-[#082B21]"
                >
                  Root Your Account (Register)
                </button>
                <button
                  onClick={() => {
                    soundscape.playTuningClick();
                    navigate('/login');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#030E0B] border border-[#14352B] text-xs font-mono text-[#D8C9A5] hover:text-[#A7F3D0]"
                >
                  Enter with Existing Account
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account Card */}
              {!isEditingAccount ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-[#030E0B] border border-[#14352B]">
                    <span className="text-[#A7F3D0]/60 block text-[10px]">DISPLAY NAME</span>
                    <span className="text-[#D8C9A5] text-sm mt-0.5 block">{session.account?.displayName}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#030E0B] border border-[#14352B]">
                    <span className="text-[#A7F3D0]/60 block text-[10px]">USERNAME</span>
                    <span className="text-[#D8C9A5] text-sm mt-0.5 block">@{session.account?.username}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#030E0B] border border-[#14352B]">
                    <span className="text-[#A7F3D0]/60 block text-[10px]">EMAIL ADDRESS</span>
                    <span className="text-[#D8C9A5] text-sm mt-0.5 block truncate">{session.account?.email}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateAccount} className="space-y-4 max-w-md">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#A7F3D0]">DISPLAY NAME</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#030E0B] border border-[#14352B] rounded-lg px-3 py-2 text-xs text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[#A7F3D0]">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#030E0B] border border-[#14352B] rounded-lg px-3 py-2 text-xs text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                    />
                  </div>

                  {accountError && (
                    <p className="text-xs font-mono text-red-400">{accountError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[#061D16] border border-[#A7F3D0] text-xs font-mono text-[#A7F3D0]"
                    >
                      Save Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAccount(false)}
                      className="px-3 py-1.5 text-xs font-mono text-[#D8C9A5]/60 hover:text-[#D8C9A5]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {accountSuccess && (
                <p className="text-xs font-mono text-[#A7F3D0] bg-[#061D16] p-2 rounded border border-[#14352B]">
                  {accountSuccess}
                </p>
              )}

              {/* Password Change Trigger / Form */}
              <div className="pt-2 border-t border-[#14352B]/40">
                {!isChangingPassword ? (
                  <button
                    onClick={() => {
                      soundscape.playTuningClick();
                      setIsChangingPassword(true);
                    }}
                    className="flex items-center gap-2 text-xs font-mono text-[#A7F3D0] hover:underline"
                  >
                    <Key className="w-3.5 h-3.5 text-[#EC4899]" />
                    <span>Change Password</span>
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-3 max-w-md pt-2">
                    <h3 className="text-xs font-mono text-[#A7F3D0]">UPDATE SECURITY KEY</h3>
                    
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#030E0B] border border-[#14352B] rounded-lg px-3 py-2 text-xs text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                    />

                    <input
                      type="password"
                      placeholder="New password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#030E0B] border border-[#14352B] rounded-lg px-3 py-2 text-xs text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                    />

                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#030E0B] border border-[#14352B] rounded-lg px-3 py-2 text-xs text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                    />

                    {passwordError && (
                      <p className="text-xs font-mono text-red-400">{passwordError}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded bg-[#061D16] border border-[#A7F3D0] text-xs font-mono text-[#A7F3D0]"
                      >
                        Update Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="px-3 py-1.5 text-xs font-mono text-[#D8C9A5]/60 hover:text-[#D8C9A5]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {passwordSuccess && (
                  <p className="text-xs font-mono text-[#A7F3D0] bg-[#061D16] p-2 rounded border border-[#14352B] mt-2">
                    {passwordSuccess}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Section 5: Data Management & Offline Sanctuary Archive */}
        <section className="rounded-2xl bg-[#04110D]/90 border border-[#14352B] p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#14352B]/60 pb-4">
            <Download className="w-5 h-5 text-[#A7F3D0]" />
            <h2 className="font-editorial text-xl sm:text-2xl text-[#A7F3D0]">
              Archive Records & Memory Management
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Export Archive */}
            <div className="p-4 rounded-xl bg-[#030E0B] border border-[#14352B] space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#A7F3D0] block">EXPORT SANCTUARY ARCHIVE</span>
                <p className="text-[11px] font-mono text-[#D8C9A5]/60 mt-1">
                  Download offline JSON parchment of your vault tapes, ratings, clearing notes, and preferences.
                </p>
              </div>
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#061D16] border border-[#14352B] hover:border-[#A7F3D0] text-xs font-mono text-[#A7F3D0] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Download Archive</span>
              </button>
            </div>

            {/* Clear History */}
            <div className="p-4 rounded-xl bg-[#030E0B] border border-[#14352B] space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-amber-300 block">CLEAR WATCH PROGRESS</span>
                <p className="text-[11px] font-mono text-[#D8C9A5]/60 mt-1">
                  Resets timestamps and playback positions for the active clearing while preserving bookmarks.
                </p>
              </div>
              {showClearHistoryConfirm ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleClearHistory}
                    className="flex-1 py-1.5 rounded bg-amber-700/80 text-white text-[11px] font-mono"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setShowClearHistoryConfirm(false)}
                    className="px-2 py-1.5 text-[11px] font-mono text-[#D8C9A5]/60"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearHistoryConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#1B1204] border border-amber-800/40 text-xs font-mono text-amber-300 hover:border-amber-400 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Progress</span>
                </button>
              )}
            </div>

            {/* Restore Forest Defaults */}
            <div className="p-4 rounded-xl bg-[#030E0B] border border-[#14352B] space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#D8C9A5] block">RESTORE DEFAULTS</span>
                <p className="text-[11px] font-mono text-[#D8C9A5]/60 mt-1">
                  Revert CRT scans, particle effects, and audio volumes to factory forest specifications.
                </p>
              </div>
              {showResetSettingsConfirm ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleResetSettings}
                    className="flex-1 py-1.5 rounded bg-[#061D16] border border-[#A7F3D0] text-[#A7F3D0] text-[11px] font-mono"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowResetSettingsConfirm(false)}
                    className="px-2 py-1.5 text-[11px] font-mono text-[#D8C9A5]/60"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetSettingsConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#04110D] border border-[#14352B] hover:border-[#D8C9A5]/50 text-xs font-mono text-[#D8C9A5] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>
              )}
            </div>
          </div>

          {/* Danger Zone: Dissolve Account */}
          {!isGuest && session.account && (
            <div className="pt-4 border-t border-red-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-red-400">DISSOLVE SANCTUARY ACCOUNT</span>
                <p className="text-[11px] font-mono text-[#D8C9A5]/50">
                  Permanently deletes your account credentials, all associated clearings, and vault records.
                </p>
              </div>
              <button
                onClick={() => {
                  soundscape.playTuningClick();
                  setShowDeleteAccountModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-red-950/40 border border-red-800/60 hover:border-red-500 text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
              >
                Dissolve Account
              </button>
            </div>
          )}
        </section>

      </main>

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[#030E0B] border border-red-600/50 p-6 space-y-4 text-left shadow-2xl relative">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-editorial text-2xl text-red-300">
                Permanently Dissolve Account?
              </h3>
            </div>

            <p className="text-xs font-mono text-[#D8C9A5]/80 leading-relaxed">
              This action cannot be undone. All clearings, tape bookmarks, and personal journal notes will be unrooted and dissolved forever.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <input
                type="password"
                placeholder="Enter password to confirm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full bg-[#04110D] border border-red-900/50 rounded-lg p-2.5 text-xs text-[#D8C9A5] focus:outline-none focus:border-red-500"
                autoFocus
              />

              {deleteError && (
                <p className="text-xs font-mono text-red-400">{deleteError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="px-3 py-1.5 text-xs font-mono text-[#D8C9A5]/60 hover:text-[#D8C9A5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-xs font-mono text-white transition-colors"
                >
                  Permanently Dissolve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#061D16] border border-[#A7F3D0]/70 text-xs font-mono text-[#A7F3D0] shadow-2xl animate-fade-in">
          <Check className="w-4 h-4 text-[#EC4899]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
