import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { RadarScanner } from '../components/RadarScanner';
import { FilmCard } from '../components/FilmCard';
import { FILMS, COLLECTIONS } from '../data/films';
import { Search, X, Radio, Filter } from 'lucide-react';
import { soundscape } from '../services/soundscape';
import { SanctuaryStorage } from '../services/storage';

export const Signal: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedKind, setSelectedKind] = useState<'all' | 'film' | 'series'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [selectedYearRange, setSelectedYearRange] = useState<string>('all');

  // All genres and moods extracted dynamically
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    FILMS.forEach(f => f.genres.forEach(g => set.add(g)));
    return Array.from(set);
  }, []);

  const allMoods = useMemo(() => {
    const set = new Set<string>();
    FILMS.forEach(f => f.moods.forEach(m => set.add(m)));
    return Array.from(set);
  }, []);

  // Filtered results
  const filteredFilms = useMemo(() => {
    const q = query.toLowerCase().trim();
    return FILMS.filter(film => {
      // Query match (title, director, synopsis, moods, genres)
      if (q) {
        const matchesTitle = film.title.toLowerCase().includes(q);
        const matchesDirector = film.director.toLowerCase().includes(q);
        const matchesSynopsis = film.synopsis.toLowerCase().includes(q);
        const matchesGenre = film.genres.some(g => g.toLowerCase().includes(q));
        const matchesMood = film.moods.some(m => m.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDirector && !matchesSynopsis && !matchesGenre && !matchesMood) {
          return false;
        }
      }

      // Kind match
      if (selectedKind !== 'all' && film.kind !== selectedKind) {
        return false;
      }

      // Genre match
      if (selectedGenre !== 'all' && !film.genres.includes(selectedGenre)) {
        return false;
      }

      // Mood match
      if (selectedMood !== 'all' && !film.moods.includes(selectedMood)) {
        return false;
      }

      // Year range match
      if (selectedYearRange === 'pre-2000' && film.year >= 2000) return false;
      if (selectedYearRange === '2000-2015' && (film.year < 2000 || film.year > 2015)) return false;
      if (selectedYearRange === 'post-2015' && film.year <= 2015) return false;

      return true;
    });
  }, [query, selectedKind, selectedGenre, selectedMood, selectedYearRange]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length > 2) {
      soundscape.playTuningClick();
      SanctuaryStorage.addLog('SIGNAL', 'SEARCH', `Frequency scan tuned to query: "${e.target.value}"`);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedKind('all');
    setSelectedGenre('all');
    setSelectedMood('all');
    setSelectedYearRange('all');
    soundscape.playTuningClick();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden">
      {/* 1. Forest Backdrop */}
      <ForestEnvironment intensity="subtle" showCRTAnchor={true} />

      {/* 2. Top Bar Navigation */}
      <Navigation />

      {/* 3. Signal Tuning Interface */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* Terminal Header & Radar Receiver Unit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl bg-[#04110D]/90 border border-[#14352B] p-6 sm:p-8 backdrop-blur-md">
          
          {/* Left: Search input & receiver tuning dials */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#A7F3D0]">
                <Radio className="w-4 h-4 text-[#EC4899] animate-pulse" />
                <span>SIGNAL RECEIVER // LOCATING BROADCASTS IN CANOPY</span>
              </div>
              <h1 className="mt-2 font-editorial text-3xl sm:text-4xl font-light text-[#A7F3D0] crt-glow">
                The Signal
              </h1>
              <p className="mt-1 font-editorial italic text-sm text-[#D8C9A5]/70">
                Wander through the frequencies. Follow the faint echoes to find your film.
              </p>
            </div>

            {/* Signal Input Field (Analog Radio receiver aesthetic) */}
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-5 h-5 text-[#A7F3D0]" />
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search films, moods, frequencies, or lost memories..."
                className="w-full rounded-xl bg-[#020705] border-2 border-[#14352B] py-3.5 pl-11 pr-10 text-sm font-mono text-[#A7F3D0] placeholder-[#D8C9A5]/35 focus:outline-none focus:border-[#A7F3D0] crt-glow"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 p-1 text-[#D8C9A5]/50 hover:text-[#EC4899]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dials (Kind, Genre, Mood, Year) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#D8C9A5]/60">
                <Filter className="w-3.5 h-3.5" />
                <span>FILTER TRANSMISSION TRAIL:</span>
                {(query || selectedKind !== 'all' || selectedGenre !== 'all' || selectedMood !== 'all' || selectedYearRange !== 'all') && (
                  <button
                    onClick={handleClear}
                    className="ml-auto text-[#EC4899] hover:underline"
                  >
                    RESET FILTERS
                  </button>
                )}
              </div>

              {/* Format Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => setSelectedKind('all')}
                  className={`px-3 py-1 rounded border transition-colors ${
                    selectedKind === 'all' ? 'bg-[#0E2F23] border-[#A7F3D0] text-[#A7F3D0]' : 'border-[#14352B] text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setSelectedKind('film')}
                  className={`px-3 py-1 rounded border transition-colors ${
                    selectedKind === 'film' ? 'bg-[#0E2F23] border-[#A7F3D0] text-[#A7F3D0]' : 'border-[#14352B] text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
                  }`}
                >
                  Feature Films
                </button>
                <button
                  onClick={() => setSelectedKind('series')}
                  className={`px-3 py-1 rounded border transition-colors ${
                    selectedKind === 'series' ? 'bg-[#0E2F23] border-[#A7F3D0] text-[#A7F3D0]' : 'border-[#14352B] text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
                  }`}
                >
                  Episodic Series
                </button>
              </div>

              {/* Genre and Era Dropdown / Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="rounded bg-[#020705] border border-[#14352B] px-2.5 py-1.5 text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                >
                  <option value="all">All Genres</option>
                  {allGenres.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="rounded bg-[#020705] border border-[#14352B] px-2.5 py-1.5 text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                >
                  <option value="all">All Moods</option>
                  {allMoods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <select
                  value={selectedYearRange}
                  onChange={(e) => setSelectedYearRange(e.target.value)}
                  className="rounded bg-[#020705] border border-[#14352B] px-2.5 py-1.5 text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                >
                  <option value="all">Any Era</option>
                  <option value="post-2015">Modern (2016+)</option>
                  <option value="2000-2015">Millennium (2000-2015)</option>
                  <option value="pre-2000">Archival (Pre-2000)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right: Sweeping Radar Display Unit */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center pt-4 lg:pt-0">
            <RadarScanner
              detectedCount={filteredFilms.length}
              isSearching={query.length > 0}
            />
          </div>
        </div>

        {/* Search Results Grid */}
        <section aria-label="Detected Signals" className="space-y-4 text-left">
          <div className="flex items-center justify-between text-xs font-mono text-[#D8C9A5]/60 pb-2 border-b border-[#14352B]/60">
            <span>
              {filteredFilms.length > 0
                ? `LOCATED ${filteredFilms.length} TRANSMISSION${filteredFilms.length === 1 ? '' : 'S'}`
                : 'NO TRANSMISSIONS LOCATED'}
            </span>
            <span className="text-[#A7F3D0]">
              STATUS: {filteredFilms.length > 0 ? 'SIGNAL DETECTED' : 'TRY ANOTHER TRAIL'}
            </span>
          </div>

          {filteredFilms.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredFilms.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 rounded-xl bg-[#04110D]/60 border border-[#14352B] p-8">
              <p className="font-editorial text-xl text-[#D8C9A5]/80 italic">
                No signal found in this part of the forest.
              </p>
              <p className="text-xs font-mono text-[#EC4899]">
                Try adjusting your frequency, clearing filters, or tuning to another mood.
              </p>
              <button
                onClick={handleClear}
                className="mt-4 px-4 py-2 rounded-md bg-[#061D16] border border-[#A7F3D0] text-xs font-mono text-[#A7F3D0] hover:bg-[#0A2E22]"
              >
                CLEAR FREQUENCY FILTERS
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
