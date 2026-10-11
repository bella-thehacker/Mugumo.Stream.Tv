import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { FilmCard } from '../components/FilmCard';
import { FILMS, COLLECTIONS } from '../data/films';
import { FilmItem, VaultRecord } from '../types';
import { Play, Bookmark, Check, Sparkles, Clock } from 'lucide-react';
import { SanctuaryStorage } from '../services/storage';
import { soundscape } from '../services/soundscape';

export const Grove: React.FC = () => {
  const navigate = useNavigate();
  const [vault, setVault] = useState<VaultRecord[]>(() => SanctuaryStorage.getVault());
  const [activeCollectionFilter, setActiveCollectionFilter] = useState<string>('all');

  const featuredFilm = FILMS.find(f => f.isFeatured) || FILMS[0];
  const isFeaturedSaved = vault.some(v => v.filmId === featuredFilm.id);

  // Continue Watching items (where progress > 0 and status is watching or saved)
  const continueWatchingItems = vault
    .filter(v => v.progressSeconds > 0 && v.status === 'watching')
    .map(v => {
      const film = FILMS.find(f => f.id === v.filmId);
      return film ? { film, record: v } : null;
    })
    .filter(Boolean) as { film: FilmItem; record: VaultRecord }[];

  const handleToggleVault = (filmId: string) => {
    setVault(SanctuaryStorage.getVault());
  };

  const handleWatchFeatured = () => {
    soundscape.playTuningClick();
    navigate(`/cinema/${featuredFilm.id}`);
  };

  const handleSaveFeatured = () => {
    soundscape.playTuningClick();
    if (isFeaturedSaved) {
      SanctuaryStorage.removeVaultRecord(featuredFilm.id);
    } else {
      SanctuaryStorage.saveVaultRecord({
        filmId: featuredFilm.id,
        status: 'saved',
        progressSeconds: 0,
        totalSeconds: 10140,
        addedAt: new Date().toISOString(),
      });
    }
    setVault(SanctuaryStorage.getVault());
  };

  const displayedFilms = activeCollectionFilter === 'all'
    ? FILMS
    : FILMS.filter(f => f.collectionId === activeCollectionFilter);

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden">
      {/* 1. Atmospheric Forest Canvas & SVG Backdrop */}
      <ForestEnvironment intensity="full" showCRTAnchor={true} />

      {/* 2. Top Bar Navigation */}
      <Navigation />

      {/* 3. Main Content Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-14">
        
        {/* HERO SECTION: FEATURED TRANSMISSION SPOTLIGHT */}
        <section aria-label="Featured Transmission" className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-2xl bg-[#04110D]/85 border border-[#14352B] p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            
            {/* Left: Atmospheric Metadata & Editorial Copy */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6 text-left">
              <div>
                {/* Quiet Header / Kicker */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#A7F3D0]">
                  <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                  <span>TRANSMISSION OF THE NIGHT // FREQ: {featuredFilm.signalFrequency}</span>
                </div>

                {/* Primary Title */}
                <h1 className="mt-3 font-editorial text-4xl sm:text-5xl font-light text-[#A7F3D0] tracking-tight crt-glow">
                  {featuredFilm.title}
                </h1>

                {/* Clean Metadata Line (Zero Pills) */}
                <div className="mt-2.5 flex items-center gap-2 text-xs font-mono text-[#D8C9A5]/70">
                  <span>{featuredFilm.year}</span>
                  <span aria-hidden="true">·</span>
                  <span>DIR. {featuredFilm.director}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredFilm.duration}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#EC4899]">{featuredFilm.genres.join(', ')}</span>
                </div>

                {/* Tagline & Synopsis */}
                <p className="mt-4 font-editorial italic text-sm text-[#EC4899]/90">
                  "{featuredFilm.tagline}"
                </p>
                <p className="mt-3 text-sm sm:text-base font-editorial text-[#D8C9A5]/90 leading-relaxed max-w-xl">
                  {featuredFilm.synopsis}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#14352B]/60">
                <button
                  onClick={handleWatchFeatured}
                  className="px-5 py-2.5 rounded-lg bg-[#061D16] border border-[#A7F3D0] text-sm font-mono text-[#A7F3D0] hover:bg-[#0A2E22] hover:box-phosphor-glow transition-all flex items-center gap-2.5 group"
                >
                  <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                  <span>WATCH TRANSMISSION</span>
                </button>

                <button
                  onClick={handleSaveFeatured}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-mono flex items-center gap-2 transition-all ${
                    isFeaturedSaved
                      ? 'border-[#EC4899] text-[#EC4899] bg-[#061D16]'
                      : 'border-[#14352B] text-[#D8C9A5]/70 hover:text-[#A7F3D0] hover:border-[#A7F3D0]'
                  }`}
                >
                  {isFeaturedSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>IN PERSONAL VAULT</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>SAVE TO VAULT</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: The Worn Archival Television Screen Frame */}
            <div 
              onClick={handleWatchFeatured}
              className="lg:col-span-6 relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer group border-2 border-[#1B3629] shadow-inner bg-[#020705]"
            >
              <img
                src={featuredFilm.backdropUrl}
                alt={featuredFilm.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter grayscale-[0.3] brightness-90 group-hover:grayscale-0 group-hover:brightness-105 group-hover:scale-102 transition-all duration-700"
              />

              {/* CRT Scanlines Overlay */}
              <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-50 group-hover:opacity-30 transition-opacity" />
              
              {/* Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020705] via-transparent to-transparent pointer-events-none" />

              {/* Center Play Beacon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-[#030E0B]/80 border border-[#A7F3D0] text-[#A7F3D0] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:border-[#EC4899] group-hover:text-[#EC4899] transition-all">
                  <Play className="w-6 h-6 ml-1 fill-current" />
                </div>
              </div>

              {/* Status pill bottom left */}
              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-[#A7F3D0] bg-black/60 px-2.5 py-1 rounded border border-[#14352B]">
                [LIVE TRANSMISSION READY]
              </div>
            </div>
          </div>
        </section>

        {/* CONTINUE WATCHING SECTION (If progress exists) */}
        {continueWatchingItems.length > 0 && (
          <section aria-label="Continue Watching" className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-2xl font-light text-[#D8C9A5]">
                Continue Watching
              </h2>
              <span className="text-xs font-mono text-[#D8C9A5]/50">
                {continueWatchingItems.length} TAPES IN TAPEHEAD
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {continueWatchingItems.map(({ film, record }) => {
                const percent = Math.min(100, Math.round((record.progressSeconds / (record.totalSeconds || 7200)) * 100));
                return (
                  <div
                    key={film.id}
                    onClick={() => {
                      soundscape.playTuningClick();
                      navigate(`/cinema/${film.id}`);
                    }}
                    className="group relative rounded-lg bg-[#04110D] border border-[#14352B] p-3 cursor-pointer hover:border-[#A7F3D0]/60 transition-colors"
                  >
                    <div className="relative aspect-[16/9] rounded overflow-hidden mb-2.5">
                      <img
                        src={film.posterUrl}
                        alt={film.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter grayscale-[0.4] group-hover:grayscale-0 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                        <Play className="w-8 h-8 text-[#A7F3D0] fill-current" />
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-[#020806] h-1.5 rounded-full overflow-hidden mb-2">
                      <div className="bg-[#EC4899] h-full" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex items-baseline justify-between text-xs font-mono">
                      <span className="text-[#D8C9A5] group-hover:text-[#A7F3D0] truncate">{film.title}</span>
                      <span className="text-[#D8C9A5]/50 shrink-0">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CURATED FOREST COLLECTIONS & FILTER BUTTONS */}
        <section aria-label="Sanctuary Collections" className="space-y-6 text-left">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-light text-[#A7F3D0]">
                Featured in the Grove
              </h2>
              <p className="text-xs font-mono text-[#D8C9A5]/60 mt-1">
                Discovered archival transmissions resting between ancient roots.
              </p>
            </div>

            {/* Filter Tabs (Functional segmented controls) */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#04110D] rounded-lg border border-[#14352B]">
              <button
                onClick={() => {
                  soundscape.playTuningClick();
                  setActiveCollectionFilter('all');
                }}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                  activeCollectionFilter === 'all'
                    ? 'bg-[#0E2F23] text-[#A7F3D0] shadow-sm'
                    : 'text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
                }`}
              >
                All Transmissions
              </button>
              {COLLECTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    soundscape.playTuningClick();
                    setActiveCollectionFilter(c.id);
                  }}
                  className={`px-3 py-1.5 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                    activeCollectionFilter === c.id
                      ? 'bg-[#0E2F23] text-[#A7F3D0] shadow-sm'
                      : 'text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          {/* Film Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {displayedFilms.map((film) => (
              <FilmCard
                key={film.id}
                film={film}
                onVaultToggle={handleToggleVault}
              />
            ))}
          </div>
        </section>

        {/* POETIC SANCTUARY FOOTER / INSCRIPTION */}
        <footer className="pt-12 pb-6 border-t border-[#14352B]/40 text-center space-y-3 font-editorial">
          <p className="italic text-base text-[#D8C9A5]/70 max-w-lg mx-auto">
            "Somewhere between the trees and the signal, you'll find what you're looking for."
          </p>
          <div className="text-xs font-mono text-[#D8C9A5]/40 tracking-wider">
            MŨGUMO.STREAM.TV · FAIRED UNDER MT. KENYA CANOPY · ANALOG ARCHIVE
          </div>
        </footer>
      </main>
    </div>
  );
};
