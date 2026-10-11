import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilmItem } from '../types';
import { Play, Bookmark, Check } from 'lucide-react';
import { SanctuaryStorage } from '../services/storage';
import { soundscape } from '../services/soundscape';

interface FilmCardProps {
  film: FilmItem;
  isSaved?: boolean;
  onVaultToggle?: (filmId: string) => void;
}

export const FilmCard: React.FC<FilmCardProps> = ({ film, isSaved: initialIsSaved, onVaultToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [saved, setSaved] = useState(() => {
    if (initialIsSaved !== undefined) return initialIsSaved;
    const vault = SanctuaryStorage.getVault();
    return vault.some(v => v.filmId === film.id);
  });
  const navigate = useNavigate();

  const handleOpenCinema = () => {
    soundscape.playTuningClick();
    navigate(`/cinema/${film.id}`);
  };

  const handleToggleVault = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundscape.playTuningClick();
    if (saved) {
      SanctuaryStorage.removeVaultRecord(film.id);
      setSaved(false);
    } else {
      SanctuaryStorage.saveVaultRecord({
        filmId: film.id,
        status: 'saved',
        progressSeconds: 0,
        totalSeconds: 7200,
        addedAt: new Date().toISOString(),
      });
      setSaved(true);
    }
    if (onVaultToggle) onVaultToggle(film.id);
  };

  return (
    <div
      onClick={handleOpenCinema}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`Open transmission for ${film.title}`}
      className="group relative flex flex-col cursor-pointer text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A7F3D0]"
    >
      {/* Outer Archival Film Sleeve Framing */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#05140E] border border-[#14352B]/80 group-hover:border-[#A7F3D0]/60 transition-colors">
        
        {/* Poster Image with Atmospheric Desaturation / Restore on Hover */}
        <img
          src={film.posterUrl}
          alt={film.title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-700 ${
            isHovered ? 'filter grayscale-0 brightness-105 scale-105' : 'filter grayscale-[0.6] brightness-80'
          }`}
          onError={(e) => {
            // Elegant CSS fallback container
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Vintage Scanlines Overlay */}
        <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-40 group-hover:opacity-60 transition-opacity" />

        {/* Subtle Moss Vine SVG overlay appearing on hover */}
        <svg
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ${
            isHovered ? 'opacity-85' : 'opacity-0'
          }`}
          viewBox="0 0 200 150"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,150 Q 20,110 15,70 Q 10,30 30,0"
            stroke="#194835"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="18" cy="65" r="2" fill="#EC4899" className="animate-bio-pulse" />
          <circle cx="12" cy="110" r="1.5" fill="#A7F3D0" />
        </svg>

        {/* Scrim Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020907] via-transparent to-[#020907]/40 pointer-events-none" />

        {/* Top Signal Status Indicator */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono tracking-wider">
          <span className={`transition-colors duration-300 ${
            isHovered ? 'text-[#A7F3D0] crt-glow font-bold' : 'text-[#D8C9A5]/60'
          }`}>
            {isHovered ? 'SIGNAL FOUND' : 'STANDBY'}
          </span>
          <span className="text-[#D8C9A5]/50">{film.signalFrequency}</span>
        </div>

        {/* Quick Play Trigger Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-12 h-12 rounded-full bg-[#061D16]/90 border border-[#A7F3D0] flex items-center justify-center text-[#A7F3D0] shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-[#A7F3D0]" />
          </div>
        </div>

        {/* Quick Save to Vault Button */}
        <button
          onClick={handleToggleVault}
          aria-label={saved ? 'Remove from vault' : 'Save to vault'}
          className={`absolute bottom-2.5 right-2.5 p-1.5 rounded bg-[#030E0B]/80 border transition-all ${
            saved
              ? 'border-[#EC4899] text-[#EC4899]'
              : 'border-[#14352B] text-[#D8C9A5]/60 hover:text-[#A7F3D0] hover:border-[#A7F3D0]'
          }`}
          title={saved ? 'In Personal Vault' : 'Save tape to Vault'}
        >
          {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Card Metadata (Clean unboxed text, no pills) */}
      <div className="mt-2.5 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-editorial text-base font-normal tracking-wide text-[#D8C9A5] group-hover:text-[#A7F3D0] transition-colors truncate">
            {film.title}
          </h3>
          <span className="text-xs font-mono text-[#D8C9A5]/50 shrink-0">
            {film.year}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#D8C9A5]/60 font-mono truncate">
          <span>{film.genres[0]}</span>
          <span aria-hidden="true">·</span>
          <span>{film.duration}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#EC4899]/80">{film.moods[0]}</span>
        </div>
      </div>
    </div>
  );
};
