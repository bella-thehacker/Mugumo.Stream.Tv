import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { SanctuaryStorage } from '../services/storage';
import { FILMS } from '../data/films';
import { VaultRecord, VaultStatus, FilmItem } from '../types';
import { 
  Play, Trash2, Edit3, Bookmark, CheckCircle2, 
  Sparkles, Star, Disc, RotateCcw, AlertTriangle
} from 'lucide-react';
import { soundscape } from '../services/soundscape';

export const Vault: React.FC = () => {
  const navigate = useNavigate();
  const [vaultRecords, setVaultRecords] = useState<VaultRecord[]>(() => SanctuaryStorage.getVault());
  const [activeTab, setActiveTab] = useState<VaultStatus | 'all'>('all');
  const [selectedFilmId, setSelectedFilmId] = useState<string | null>(() => {
    return vaultRecords[0]?.filmId || 'interstellar';
  });
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const selectedRecord = vaultRecords.find(r => r.filmId === selectedFilmId);
  const selectedFilm = FILMS.find(f => f.id === selectedFilmId);

  const filteredRecords = activeTab === 'all'
    ? vaultRecords
    : vaultRecords.filter(r => r.status === activeTab);

  const handleSelectTape = (filmId: string) => {
    soundscape.playTuningClick();
    setSelectedFilmId(filmId);
    const rec = vaultRecords.find(r => r.filmId === filmId);
    setEditingNotes(rec?.notes || '');
    setIsEditingNotes(false);
  };

  const handleRemoveTape = (filmId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundscape.playTuningClick();
    const updated = SanctuaryStorage.removeVaultRecord(filmId);
    setVaultRecords(updated);
    if (selectedFilmId === filmId) {
      setSelectedFilmId(updated[0]?.filmId || null);
    }
  };

  const handleUpdateStatus = (filmId: string, status: VaultStatus) => {
    soundscape.playTuningClick();
    const rec = vaultRecords.find(r => r.filmId === filmId);
    if (!rec) return;
    const updated = SanctuaryStorage.saveVaultRecord({
      ...rec,
      status,
    });
    setVaultRecords(updated);
  };

  const handleSaveNotes = () => {
    if (!selectedRecord) return;
    soundscape.playTuningClick();
    const updated = SanctuaryStorage.saveVaultRecord({
      ...selectedRecord,
      notes: editingNotes,
    });
    setVaultRecords(updated);
    setIsEditingNotes(false);
  };

  const handleClearAllData = () => {
    SanctuaryStorage.clearAllData();
    setVaultRecords([]);
    setSelectedFilmId(null);
    setShowClearConfirm(false);
    soundscape.playStaticBurst(300);
  };

  const statusLabels: Record<VaultStatus, string> = {
    favorite: 'Favorites',
    watching: 'Currently Watching',
    saved: 'Saved for Later',
    completed: 'Completed',
    abandoned: 'Abandoned',
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden">
      {/* 1. Forest Atmosphere */}
      <ForestEnvironment intensity="full" showCRTAnchor={true} />

      {/* 2. Top Bar Navigation */}
      <Navigation />

      {/* 3. Main Archive Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* Header & Memory Disclaimer */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#14352B]/60 pb-6 text-left">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#A7F3D0]">
              <Disc className="w-4 h-4 text-[#EC4899]" />
              <span>PERSONAL REEL ARCHIVE // STORED IN LOCAL BROWSER BUFFER</span>
            </div>
            <h1 className="mt-2 font-editorial text-3xl sm:text-4xl font-light text-[#A7F3D0] crt-glow">
              The Vault
            </h1>
            <p className="mt-1 font-editorial italic text-sm text-[#D8C9A5]/70">
              Analog tapes, handwritten logs, and memories preserved in damp moss.
            </p>
          </div>

          {/* Reset / Clear Data trigger */}
          <div className="flex items-center gap-3">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-[#1B0A06] border border-red-500/50 p-2 rounded-lg text-xs font-mono">
                <span className="text-red-400">Erase all saved tapes?</span>
                <button
                  onClick={handleClearAllData}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, Erase
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 text-[#D8C9A5]/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-xs font-mono text-[#D8C9A5]/50 hover:text-red-400 transition-colors"
                title="Wipe local browser tape collection"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Wipe Local Archive</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#04110D] rounded-lg border border-[#14352B] w-fit">
          <button
            onClick={() => {
              soundscape.playTuningClick();
              setActiveTab('all');
            }}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              activeTab === 'all'
                ? 'bg-[#0E2F23] text-[#A7F3D0]'
                : 'text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
            }`}
          >
            All Tapes ({vaultRecords.length})
          </button>
          {(['favorite', 'watching', 'saved', 'completed', 'abandoned'] as VaultStatus[]).map((st) => {
            const count = vaultRecords.filter(r => r.status === st).length;
            return (
              <button
                key={st}
                onClick={() => {
                  soundscape.playTuningClick();
                  setActiveTab(st);
                }}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  activeTab === st
                    ? 'bg-[#0E2F23] text-[#A7F3D0]'
                    : 'text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
                }`}
              >
                {statusLabels[st]} ({count})
              </button>
            );
          })}
        </div>

        {/* The Tactile Vault Stack View: VHS Spines (Left) & Tape Details (Right) */}
        {filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: PHYSICAL STACKED VHS TAPES */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-mono text-[#A7F3D0]/70 flex items-center justify-between px-1">
                <span>CASSETTE RACK</span>
                <span>SELECT TAPE TO INSPECT</span>
              </div>

              <div className="space-y-2.5">
                {filteredRecords.map((record) => {
                  const film = FILMS.find(f => f.id === record.filmId);
                  if (!film) return null;
                  const isSelected = film.id === selectedFilmId;

                  return (
                    <div
                      key={film.id}
                      onClick={() => handleSelectTape(film.id)}
                      className={`group relative rounded-md p-3.5 cursor-pointer transition-all border text-left flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#122E22] border-[#A7F3D0] shadow-[0_0_15px_rgba(167,243,208,0.2)] translate-x-1.5'
                          : 'bg-[#061610] border-[#14352B] hover:border-[#A7F3D0]/60 hover:bg-[#0A2218]'
                      }`}
                    >
                      {/* VHS Spine Label Styling */}
                      <div className="flex items-center gap-3 truncate">
                        {/* Status Icon Marker */}
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EC4899] shadow-[0_0_6px_#EC4899] shrink-0" />
                        
                        <div className="truncate">
                          <h3 className="font-editorial text-base text-[#D8C9A5] group-hover:text-[#A7F3D0] truncate">
                            {film.title}
                          </h3>
                          <div className="text-[11px] font-mono text-[#D8C9A5]/50 flex items-center gap-2">
                            <span>{film.year}</span>
                            <span>·</span>
                            <span>{film.duration}</span>
                            <span>·</span>
                            <span className="text-[#EC4899] uppercase">{record.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Tape Actions */}
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {record.userRating && (
                          <div className="flex text-[#F59E0B] text-xs">
                            {'★'.repeat(record.userRating)}
                          </div>
                        )}
                        <button
                          onClick={(e) => handleRemoveTape(film.id, e)}
                          className="p-1 text-[#D8C9A5]/40 hover:text-red-400 transition-colors"
                          title="Remove from vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: SELECTED TAPE INSPECTION PANEL */}
            {selectedFilm && selectedRecord && (
              <div className="lg:col-span-7 rounded-2xl bg-[#04110D]/95 border-2 border-[#14352B] p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6 text-left">
                
                {/* Header with Title and Quick Launch */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#14352B]/60 pb-5">
                  <div>
                    <span className="text-[11px] font-mono text-[#EC4899]">
                      TAPE CASSETTE #{selectedFilm.id.toUpperCase()}
                    </span>
                    <h2 className="font-editorial text-2xl sm:text-3xl font-light text-[#A7F3D0] mt-1 crt-glow">
                      {selectedFilm.title}
                    </h2>
                    <div className="mt-1 flex items-center gap-2 text-xs font-mono text-[#D8C9A5]/70">
                      <span>{selectedFilm.year}</span>
                      <span>·</span>
                      <span>{selectedFilm.director}</span>
                      <span>·</span>
                      <span>{selectedFilm.duration}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundscape.playTuningClick();
                      navigate(`/cinema/${selectedFilm.id}`);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#061D16] border border-[#A7F3D0] text-xs font-mono text-[#A7F3D0] hover:bg-[#0A2E22] hover:box-phosphor-glow transition-all flex items-center gap-2 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>LOAD INTO TV</span>
                  </button>
                </div>

                {/* Status Switcher (Buttons) */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-[#D8C9A5]/70 block">
                    ARCHIVE CLASSIFICATION:
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {(['favorite', 'watching', 'saved', 'completed', 'abandoned'] as VaultStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedFilm.id, st)}
                        className={`px-2.5 py-1 rounded border transition-colors ${
                          selectedRecord.status === st
                            ? 'bg-[#0E2F23] border-[#EC4899] text-[#EC4899]'
                            : 'border-[#14352B] text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
                        }`}
                      >
                        {statusLabels[st]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Playback Progress */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-mono text-[#D8C9A5]/70">
                    <span>PROGRESS LOGGED</span>
                    <span>
                      {Math.floor(selectedRecord.progressSeconds / 60)}m / {Math.floor(selectedRecord.totalSeconds / 60)}m ({Math.min(100, Math.round((selectedRecord.progressSeconds / (selectedRecord.totalSeconds || 1)) * 100))}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#020806] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#A7F3D0] h-full"
                      style={{
                        width: `${Math.min(100, Math.round((selectedRecord.progressSeconds / (selectedRecord.totalSeconds || 1)) * 100))}%`
                      }}
                    />
                  </div>
                </div>

                {/* Journal Notes Area */}
                <div className="pt-3 border-t border-[#14352B]/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#A7F3D0] flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-[#EC4899]" />
                      <span>SANCTUARY JOURNAL ENTRY</span>
                    </span>
                    {!isEditingNotes && (
                      <button
                        onClick={() => {
                          setEditingNotes(selectedRecord.notes || '');
                          setIsEditingNotes(true);
                        }}
                        className="text-xs font-mono text-[#D8C9A5]/60 hover:text-[#A7F3D0]"
                      >
                        {selectedRecord.notes ? 'EDIT ENTRY' : '+ ADD ENTRY'}
                      </button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Write your impressions, emotional echoes, or thoughts while watching this film..."
                        rows={4}
                        className="w-full rounded-md bg-[#020907] border border-[#14352B] p-3 text-sm text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0] font-sans"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="px-3 py-1 text-xs font-mono text-[#D8C9A5]/60 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNotes}
                          className="px-3 py-1 rounded bg-[#061D16] border border-[#A7F3D0] text-xs font-mono text-[#A7F3D0] hover:bg-[#0A2E22]"
                        >
                          SAVE ENTRY
                        </button>
                      </div>
                    </div>
                  ) : selectedRecord.notes ? (
                    <div className="p-3.5 rounded-lg bg-[#020705] border border-[#14352B] font-editorial text-sm text-[#D8C9A5]/90 italic leading-relaxed">
                      "{selectedRecord.notes}"
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-[#020705]/50 border border-dashed border-[#14352B] text-xs font-mono text-[#D8C9A5]/40 text-center">
                      No journal notes written for this tape yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3 rounded-2xl bg-[#04110D]/60 border border-[#14352B] p-8">
            <p className="font-editorial text-xl text-[#D8C9A5]/80 italic">
              No tapes found under this category.
            </p>
            <p className="text-xs font-mono text-[#EC4899]">
              Explore The Grove or The Signal to archive new broadcasts.
            </p>
            <button
              onClick={() => navigate('/grove')}
              className="mt-4 px-4 py-2 rounded-md bg-[#061D16] border border-[#A7F3D0] text-xs font-mono text-[#A7F3D0] hover:bg-[#0A2E22]"
            >
              EXPLORE THE GROVE
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
