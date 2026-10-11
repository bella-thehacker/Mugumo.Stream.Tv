import React, { useState, useRef, useEffect } from 'react';
import { FilmItem, Episode } from '../types';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, 
  Tv, Sparkles, ChevronRight, ChevronLeft, Bookmark, Check, Sliders, Edit3
} from 'lucide-react';
import { SanctuaryStorage } from '../services/storage';
import { soundscape } from '../services/soundscape';

interface CRTTelevisionProps {
  film: FilmItem;
  onNextFilm?: () => void;
  onPrevFilm?: () => void;
}

export const CRTTelevision: React.FC<CRTTelevisionProps> = ({ film, onNextFilm, onPrevFilm }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Television State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [brightness, setBrightness] = useState(100); // 50 - 150
  const [scanlinesActive, setScanlinesActive] = useState(true);
  const [curvatureActive, setCurvatureActive] = useState(true);
  const [ambientAudioLevel, setAmbientAudioLevel] = useState(0.5);
  const [tuningArtifact, setTuningArtifact] = useState(false);

  // Playback & Episodes
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState(false);

  // Vault & Notes
  const [inVault, setInVault] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [userRating, setUserRating] = useState<number>(film.rating);

  // Load existing vault record for this film
  useEffect(() => {
    const vault = SanctuaryStorage.getVault();
    const record = vault.find(r => r.filmId === film.id);
    if (record) {
      setInVault(true);
      if (record.notes) setNotes(record.notes);
      if (record.userRating) setUserRating(record.userRating);
    } else {
      setInVault(false);
      setNotes('');
      setUserRating(film.rating);
    }
    // Reset video state on film change
    setCurrentEpisodeIndex(0);
    setVideoError(false);
    triggerTuningFlash();
  }, [film.id]);

  const triggerTuningFlash = () => {
    setTuningArtifact(true);
    soundscape.playStaticBurst(320);
    setTimeout(() => {
      setTuningArtifact(false);
    }, 350);
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    soundscape.playTuningClick();
    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        soundscape.enableAudio();
        SanctuaryStorage.addLog('INFO', 'PLAYBACK', `Transmission resumed: ${film.title}`);
      }).catch(() => {
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
      SanctuaryStorage.addLog('INFO', 'PLAYBACK', `Transmission paused: ${film.title}`);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
  };

  const handleAmbientSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmbientAudioLevel(val);
    soundscape.setAmbientVolume(val);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(cur);
    setDuration(dur);
    // Persist progress periodically
    if (Math.floor(cur) % 15 === 0) {
      SanctuaryStorage.updateProgress(film.id, Math.floor(cur), Math.floor(dur));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleEpisodeChange = (index: number) => {
    if (!film.episodes || index < 0 || index >= film.episodes.length) return;
    triggerTuningFlash();
    setCurrentEpisodeIndex(index);
    SanctuaryStorage.addLog('INFO', 'PLAYBACK', `Channel tuned to S${film.episodes[index].seasonNumber}E${film.episodes[index].episodeNumber}: ${film.episodes[index].title}`);
  };

  const handleToggleFullscreen = () => {
    soundscape.playTuningClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSaveVault = () => {
    soundscape.playTuningClick();
    const updated = SanctuaryStorage.saveVaultRecord({
      filmId: film.id,
      status: 'saved',
      userRating,
      notes,
      progressSeconds: Math.floor(currentTime),
      totalSeconds: Math.floor(duration || 7200),
      addedAt: new Date().toISOString(),
      lastWatchedAt: new Date().toISOString(),
    });
    setInVault(true);
  };

  const handleRemoveVault = () => {
    soundscape.playTuningClick();
    SanctuaryStorage.removeVaultRecord(film.id);
    setInVault(false);
  };

  const currentEp: Episode | undefined = film.episodes?.[currentEpisodeIndex];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto flex flex-col items-center select-none font-sans">
      
      {/* 1. PHYSICAL 1980s WOODEN CRT CABINET */}
      <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#4A2E1F] via-[#351F14] to-[#25150D] p-4 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-4 border-[#24130A] ring-1 ring-[#5A3927]/40">
        
        {/* Real Wood Grain Texture Overlay & Natural Patina */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(216, 201, 165, 0.25) 0%, transparent 80%), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 2px, transparent 6px)',
          }}
        />

        {/* Creeping Moss & Ferns on TV Top Left & Right Edges */}
        <div className="absolute -top-3.5 left-8 w-28 h-6 bg-[#0E3524] rounded-full blur-[2px] opacity-80 pointer-events-none" />
        <div className="absolute -top-2 left-10 text-[10px] font-mono text-[#A7F3D0]/80 pointer-events-none">
          🌿 lichen 86
        </div>
        <div className="absolute -bottom-2 right-12 w-36 h-5 bg-[#0C2D1F] rounded-full blur-[2px] opacity-70 pointer-events-none" />

        {/* Brand Stamp on Wood Bezel */}
        <div className="flex items-center justify-between pb-3 px-2 border-b border-[#28160D]/80 text-[#D8C9A5]/50 text-[11px] font-mono">
          <span className="tracking-widest flex items-center gap-1.5 text-[#D8C9A5]/70">
            <Tv className="w-3.5 h-3.5 text-[#EC4899]" />
            MŨGUMO SOLID STATE // MODEL CRT-1984
          </span>
          <span className="tracking-widest">
            TUNED: {film.signalFrequency}
          </span>
        </div>

        {/* Main Console Split: CRT Screen (Left/Center) + Physical Rotary Control Strip (Right) */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* THE CURVED GLASS CRT SCREEN (Col 1 to 9) */}
          <div className="lg:col-span-9 relative flex flex-col justify-center">
            
            {/* Deep Bezel Housing */}
            <div className={`relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl bg-[#030907] p-2.5 sm:p-3.5 shadow-inner border-4 border-[#180E08] ring-1 ring-[#081F17] overflow-hidden ${
              curvatureActive ? 'crt-curvature' : ''
            }`}>
              
              {/* CRT Glass Reflection Arc */}
              <div 
                className="absolute inset-0 pointer-events-none z-20 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 40%, transparent 60%)',
                }}
              />

              {/* Scanlines Effect */}
              {scanlinesActive && (
                <div className="absolute inset-0 pointer-events-none z-20 crt-scanlines" />
              )}

              {/* Tuning Glitch Flash Artifact */}
              {tuningArtifact && (
                <div className="absolute inset-0 bg-[#A7F3D0] z-30 opacity-80 mix-blend-screen flex items-center justify-center">
                  <div className="w-full h-1 bg-white animate-pulse" />
                </div>
              )}

              {/* SCREEN CONTENT: HTML5 Video Player or Graceful Signal Visualizer */}
              <div 
                className="relative w-full h-full rounded-lg overflow-hidden bg-[#020504] flex items-center justify-center"
                style={{ filter: `brightness(${brightness}%)` }}
              >
                {!videoError ? (
                  <video
                    ref={videoRef}
                    src={currentEp?.videoUrl || film.videoUrl}
                    poster={film.backdropUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    onError={() => setVideoError(true)}
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Graceful Atmospheric Signal Visualizer Fallback */
                  <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#04110D] p-6 text-center">
                    <div className="w-16 h-16 rounded-full border border-[#EC4899] flex items-center justify-center text-[#EC4899] animate-pulse mb-3">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <span className="font-editorial text-lg text-[#A7F3D0] crt-glow">
                      CANOPY TRANSMISSION RELAY
                    </span>
                    <p className="text-xs text-[#D8C9A5]/70 max-w-md mt-1 font-mono">
                      Broadcast signal refracted through dense fog. Video stream operating on synthetic atmospheric carrier frequency.
                    </p>
                  </div>
                )}

                {/* Big Center Play Overlay Button when paused */}
                {!isPlaying && (
                  <div 
                    onClick={handlePlayPause}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-pointer group/play z-10"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#061D16]/90 border-2 border-[#A7F3D0] text-[#A7F3D0] flex items-center justify-center shadow-2xl group-hover/play:scale-105 group-hover/play:border-[#EC4899] group-hover/play:text-[#EC4899] transition-all">
                      <Play className="w-7 h-7 sm:w-9 sm:h-9 ml-1 fill-current" />
                    </div>
                    <span className="mt-3 text-xs font-mono tracking-widest text-[#A7F3D0] crt-glow">
                      RECEIVE TRANSMISSION
                    </span>
                  </div>
                )}

                {/* Subtitle / Title Watermark on CRT Bottom */}
                <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded bg-black/60 border border-[#14352B]/60 text-[11px] font-mono text-[#A7F3D0] pointer-events-none">
                  CH {currentEp ? `S${currentEp.seasonNumber}E${currentEp.episodeNumber}` : '01'} // {film.title.toUpperCase()}
                </div>
              </div>

              {/* On-Screen Scrub Bar (Analog phosphor style) */}
              <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center gap-3 bg-[#030C08]/90 px-3 py-1.5 rounded-md border border-[#14352B]/80 backdrop-blur-sm">
                <button
                  onClick={handlePlayPause}
                  className="text-[#A7F3D0] hover:text-[#EC4899] transition-colors p-1"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <span className="text-[11px] font-mono text-[#D8C9A5]/70 tabular-nums">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-[#14352B] accent-[#A7F3D0] rounded cursor-pointer"
                />

                <span className="text-[11px] font-mono text-[#D8C9A5]/50 tabular-nums">
                  {formatTime(duration)}
                </span>

                <button
                  onClick={handleToggleFullscreen}
                  className="text-[#D8C9A5]/60 hover:text-[#A7F3D0] transition-colors p-1"
                  title="Fullscreen"
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* PHYSICAL CONTROL PANEL STRIP (Col 10 to 12) */}
          <div className="lg:col-span-3 rounded-xl bg-[#28160D] border-2 border-[#1B0F09] p-4 flex flex-col justify-between space-y-4 shadow-inner">
            
            {/* Top: Amber Pilot LED & Power Indicator */}
            <div className="flex items-center justify-between pb-2 border-b border-[#3D2316] text-xs font-mono">
              <span className="text-[#D8C9A5]/70">POWER</span>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B] animate-pulse" />
                <span className="text-[10px] text-[#F59E0B]">SIGNAL ON</span>
              </div>
            </div>

            {/* Rotary Knob 1: CHANNEL TUNING (Cycles episodes or next film) */}
            <div className="flex flex-col items-center text-center">
              <span className="text-[11px] font-mono text-[#D8C9A5]/80 mb-1.5 uppercase">
                Channel / Ep
              </span>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#1E110A] to-[#3A2214] border-2 border-[#543422] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-pointer group">
                {/* Physical Notch */}
                <div 
                  className="w-1.5 h-5 bg-[#A7F3D0] rounded-full transition-transform duration-300"
                  style={{ transform: `rotate(${currentEpisodeIndex * 60}deg)` }}
                />
              </div>

              {/* Previous / Next Episode buttons */}
              {film.episodes && film.episodes.length > 1 ? (
                <div className="flex items-center gap-2 mt-2 w-full justify-between">
                  <button
                    onClick={() => handleEpisodeChange(currentEpisodeIndex - 1)}
                    disabled={currentEpisodeIndex === 0}
                    className="p-1 rounded bg-[#1B0F09] border border-[#3D2316] disabled:opacity-30 text-[#D8C9A5]/70 hover:text-[#A7F3D0]"
                    title="Previous Episode"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-[#A7F3D0]">
                    EP 0{currentEpisodeIndex + 1}
                  </span>
                  <button
                    onClick={() => handleEpisodeChange(currentEpisodeIndex + 1)}
                    disabled={currentEpisodeIndex === film.episodes.length - 1}
                    className="p-1 rounded bg-[#1B0F09] border border-[#3D2316] disabled:opacity-30 text-[#D8C9A5]/70 hover:text-[#A7F3D0]"
                    title="Next Episode"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2 w-full justify-between">
                  <button
                    onClick={onPrevFilm}
                    className="p-1 rounded bg-[#1B0F09] border border-[#3D2316] text-[#D8C9A5]/70 hover:text-[#A7F3D0]"
                    title="Previous Transmission"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono text-[#D8C9A5]/60">FILM</span>
                  <button
                    onClick={onNextFilm}
                    className="p-1 rounded bg-[#1B0F09] border border-[#3D2316] text-[#D8C9A5]/70 hover:text-[#A7F3D0]"
                    title="Next Transmission"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Rotary Dials / Sliders */}
            <div className="space-y-3 pt-2 border-t border-[#3D2316] text-xs font-mono">
              {/* Volume */}
              <div>
                <div className="flex justify-between text-[10px] text-[#D8C9A5]/70 mb-1">
                  <span>AUDIO VOL</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-[#1A0E08] accent-[#A7F3D0] rounded cursor-pointer"
                />
              </div>

              {/* CRT Brightness */}
              <div>
                <div className="flex justify-between text-[10px] text-[#D8C9A5]/70 mb-1">
                  <span>CRT BRIGHT</span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#1A0E08] accent-[#A7F3D0] rounded cursor-pointer"
                />
              </div>

              {/* Ambient Soundscape */}
              <div>
                <div className="flex justify-between text-[10px] text-[#D8C9A5]/70 mb-1">
                  <span>FOREST AMBIENCE</span>
                  <span>{Math.round(ambientAudioLevel * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientAudioLevel}
                  onChange={handleAmbientSlider}
                  className="w-full h-1 bg-[#1A0E08] accent-[#EC4899] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* CRT Toggles */}
            <div className="pt-2 border-t border-[#3D2316] flex items-center justify-between text-[11px] font-mono">
              <button
                onClick={() => setScanlinesActive(!scanlinesActive)}
                className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                  scanlinesActive ? 'bg-[#0E281C] border-[#A7F3D0] text-[#A7F3D0]' : 'border-[#3D2316] text-[#D8C9A5]/50'
                }`}
              >
                SCANLINES
              </button>
              <button
                onClick={() => setCurvatureActive(!curvatureActive)}
                className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                  curvatureActive ? 'bg-[#0E281C] border-[#A7F3D0] text-[#A7F3D0]' : 'border-[#3D2316] text-[#D8C9A5]/50'
                }`}
              >
                CURVATURE
              </button>
            </div>

            {/* Action: Vault Tape */}
            <button
              onClick={inVault ? handleRemoveVault : handleSaveVault}
              className={`w-full py-2 px-3 rounded-md font-mono text-xs flex items-center justify-center gap-2 border transition-all ${
                inVault
                  ? 'bg-[#0E281C] border-[#EC4899] text-[#EC4899]'
                  : 'bg-[#1E110A] border-[#543422] text-[#D8C9A5] hover:border-[#A7F3D0] hover:text-[#A7F3D0]'
              }`}
            >
              {inVault ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>SAVED IN VAULT</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>SAVE TO VAULT</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Speaker Grill of TV Console */}
        <div className="mt-4 pt-3 border-t border-[#28160D] flex items-center justify-between px-2 text-[#D8C9A5]/40 text-[10px] font-mono">
          <div className="flex gap-1.5">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="w-1.5 h-2.5 rounded-full bg-[#180C07]" />
            ))}
          </div>
          <span>SOLID STATE DUAL-BEAM CHASSIS</span>
        </div>
      </div>

      {/* 2. FILM DETAILS & PRIVATE NOTES DRAWER */}
      <div className="mt-8 w-full rounded-xl bg-[#04120D]/90 border border-[#14352B] p-6 text-left">
        
        {/* Title, Year, Director */}
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 pb-4 border-b border-[#14352B]/60">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-editorial text-2xl md:text-3xl font-light text-[#A7F3D0] crt-glow">
                {film.title}
              </h1>
              <span className="text-sm font-mono text-[#D8C9A5]/60">
                ({film.year})
              </span>
            </div>
            <p className="text-xs font-mono text-[#EC4899] mt-1 italic">
              "{film.tagline}"
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#D8C9A5]/60">
            <span>DIR. {film.director.toUpperCase()}</span>
            <span aria-hidden="true">·</span>
            <span>{film.duration}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#A7F3D0]">{film.genres.join(', ')}</span>
          </div>
        </div>

        {/* Synopsis */}
        <p className="mt-4 text-sm md:text-base font-editorial text-[#D8C9A5]/90 leading-relaxed max-w-3xl">
          {film.synopsis}
        </p>

        {/* Episode details if series */}
        {currentEp && (
          <div className="mt-4 p-3 rounded-lg bg-[#061D16]/60 border border-[#14352B] text-xs font-mono">
            <span className="text-[#A7F3D0] font-bold">
              Season {currentEp.seasonNumber}, Episode {currentEp.episodeNumber}: {currentEp.title}
            </span>
            <p className="text-[#D8C9A5]/70 mt-1">{currentEp.description}</p>
          </div>
        )}

        {/* Private Sanctuary Notes Panel Toggle */}
        <div className="mt-6 pt-4 border-t border-[#14352B]/60">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setNotesExpanded(!notesExpanded)}
              className="flex items-center gap-2 text-xs font-mono text-[#A7F3D0] hover:text-[#EC4899] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{notesExpanded ? 'CLOSE JOURNAL NOTES' : 'PRIVATE SANCTUARY NOTES'}</span>
              <span className="text-[#D8C9A5]/40">({notes ? '1 ENTRY SAVED' : 'NO NOTES YET'})</span>
            </button>

            {/* Rating stars */}
            <div className="flex items-center gap-1 text-xs font-mono text-[#D8C9A5]/70">
              <span>RATING:</span>
              <div className="flex gap-0.5 text-[#F59E0B]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setUserRating(star);
                      SanctuaryStorage.saveVaultRecord({
                        filmId: film.id,
                        status: inVault ? 'saved' : 'watching',
                        userRating: star,
                        notes,
                        progressSeconds: Math.floor(currentTime),
                        totalSeconds: Math.floor(duration || 7200),
                        addedAt: new Date().toISOString(),
                      });
                    }}
                    className="hover:scale-125 transition-transform"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes input area */}
          {notesExpanded && (
            <div className="mt-3 space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record your thoughts, memories, or impressions while sitting beside the mũgumo tree..."
                rows={3}
                className="w-full rounded-md bg-[#020907] border border-[#14352B] p-3 text-sm text-[#D8C9A5] placeholder-[#D8C9A5]/30 focus:outline-none focus:border-[#A7F3D0] font-sans"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveVault}
                  className="px-3 py-1.5 rounded bg-[#061D16] border border-[#A7F3D0]/60 text-xs font-mono text-[#A7F3D0] hover:border-[#EC4899] hover:text-[#EC4899] transition-colors"
                >
                  SAVE ENTRY TO VAULT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
