import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { AuthService } from '../services/authService';
import { ProfileService } from '../services/profileService';
import { SanctuaryStorage } from '../services/storage';
import { soundscape } from '../services/soundscape';
import { FILMS } from '../data/films';
import { UserProfile, VaultRecord, AuthSession } from '../types';
import { 
  Sparkles, Edit3, Plus, Trash2, ArrowRight, Upload, X, Check, 
  Film, Clock, Heart, Radio, Shield, TreeDeciduous, RefreshCw, AlertTriangle
} from 'lucide-react';

const BOTANICAL_MOTIFS = [
  { id: 'orchid', name: 'Biolume Orchid', desc: 'Rare pink blossoms thriving in humid bark' },
  { id: 'roots', name: 'Ancient Roots', desc: 'Deep subterranean Kikuyu fig tree mycelium' },
  { id: 'canopy', name: 'Canopy Walker', desc: 'High tangled branches touching night clouds' },
  { id: 'phosphor', name: 'Phosphor Glow', desc: 'Sage-green CRT emitter static & particles' },
  { id: 'radio', name: 'Radio Wave', desc: 'Analog frequency pulses across the forest' },
  { id: 'moss', name: 'Velvet Moss', desc: 'Damp green cushions covering old timber' },
  { id: 'fern', name: 'Forest Fern', desc: 'Curling fronds catching pale moonlight' },
  { id: 'ember', name: 'Night Ember', desc: 'Bioluminescent fireflies drifting in mist' },
];

const FOREST_TITLES = [
  'Canopy Wanderer',
  'Keeper of the Roots',
  'Midnight Archivist',
  'Signal Seeker',
  'Phosphor Dreamer',
  'Old Timber Hermit',
  'Sanctuary Voyager',
];

export const MyClearing: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession>(() => AuthService.getSession());
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [vaultRecords, setVaultRecords] = useState<VaultRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Clearing Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSeed, setEditSeed] = useState('orchid');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Create Clearing Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState(FOREST_TITLES[0]);
  const [newBio, setNewBio] = useState('');
  const [newSeed, setNewSeed] = useState('orchid');
  const [createError, setCreateError] = useState('');
  const [createSaving, setCreateSaving] = useState(false);

  // Dissolve Confirm State
  const [dissolveTarget, setDissolveTarget] = useState<UserProfile | null>(null);
  const [dissolveError, setDissolveError] = useState('');

  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const activeProfile = session.activeProfile;
  const isGuest = session.isGuest;

  // Load account profiles & clearing vault
  const loadClearingData = async () => {
    const curSession = AuthService.getSession();
    setSession(curSession);
    const accountId = curSession.account ? curSession.account.id : 'guest-account';

    const loadedProfiles = await ProfileService.getProfilesForAccount(accountId);
    setProfiles(loadedProfiles);

    const activeId = curSession.activeProfile?.id || loadedProfiles[0]?.id || 'default_clearing';
    const vault = SanctuaryStorage.getVault(activeId);
    setVaultRecords(vault);
    setLoading(false);
  };

  useEffect(() => {
    loadClearingData();
  }, []);

  // Compute Clearing Statistics
  const stats = useMemo(() => {
    const totalTapes = vaultRecords.length;
    const watchingCount = vaultRecords.filter(r => r.status === 'watching').length;
    const completedCount = vaultRecords.filter(r => r.status === 'completed').length;
    const favoritesCount = vaultRecords.filter(r => r.status === 'favorite').length;
    const totalSecondsWatched = vaultRecords.reduce((acc, r) => acc + (r.progressSeconds || 0), 0);

    const hours = Math.floor(totalSecondsWatched / 3600);
    const minutes = Math.floor((totalSecondsWatched % 3600) / 60);
    const immersionString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return {
      totalTapes,
      watchingCount,
      completedCount,
      favoritesCount,
      immersionString,
    };
  }, [vaultRecords]);

  // Handle Switching Active Profile
  const handleSwitchProfile = (targetProfile: UserProfile) => {
    soundscape.playTuningClick();
    AuthService.setActiveProfile(targetProfile);
    setSession(AuthService.getSession());
    const vault = SanctuaryStorage.getVault(targetProfile.id);
    setVaultRecords(vault);
  };

  // Open Edit Modal
  const openEditModal = () => {
    if (!activeProfile) return;
    soundscape.playTuningClick();
    setEditName(activeProfile.name);
    setEditBio(activeProfile.bio || '');
    setEditTitle(activeProfile.forestTitle || FOREST_TITLES[0]);
    setEditSeed(activeProfile.avatarSeed || 'orchid');
    setEditImageFile(null);
    setEditImagePreview(activeProfile.imageBlobUrl || null);
    setShouldRemoveImage(false);
    setEditError('');
    setIsEditModalOpen(true);
  };

  // Handle Edit File Selection
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEditError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEditError('Image file is too large (max 5MB).');
      return;
    }

    setEditError('');
    setEditImageFile(file);
    setShouldRemoveImage(false);
    const previewUrl = URL.createObjectURL(file);
    setEditImagePreview(previewUrl);
  };

  const handleRemovePhoto = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    setShouldRemoveImage(true);
  };

  // Save Profile Edits
  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;
    if (!editName.trim()) {
      setEditError('Clearing name cannot be empty.');
      return;
    }

    setEditSaving(true);
    setEditError('');

    const res = await ProfileService.updateProfile(activeProfile.id, {
      name: editName.trim(),
      avatarSeed: editSeed,
      bio: editBio.trim() || undefined,
      forestTitle: editTitle.trim() || undefined,
      imageFile: editImageFile || undefined,
      removeImage: shouldRemoveImage,
    });

    setEditSaving(false);

    if (!res.success || !res.profile) {
      setEditError(res.error || 'Failed to update clearing.');
      return;
    }

    soundscape.playTuningClick();
    AuthService.setActiveProfile(res.profile);
    await loadClearingData();
    setIsEditModalOpen(false);
  };

  // Handle Sprout New Clearing Submit
  const handleCreateClearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setCreateError('Please give this clearing a name.');
      return;
    }

    setCreateSaving(true);
    setCreateError('');

    const accountId = session.account ? session.account.id : 'guest-account';
    const res = await ProfileService.createProfile(
      accountId,
      newName.trim(),
      newSeed,
      undefined,
      newBio.trim() || undefined,
      newTitle.trim() || undefined
    );

    setCreateSaving(false);

    if (!res.success || !res.profile) {
      setCreateError(res.error || 'Could not sprout clearing.');
      return;
    }

    soundscape.playTuningClick();
    AuthService.setActiveProfile(res.profile);
    await loadClearingData();
    setNewName('');
    setNewBio('');
    setIsCreateModalOpen(false);
  };

  // Handle Dissolve Clearing
  const handleDissolveClearing = async () => {
    if (!dissolveTarget) return;
    const accountId = session.account ? session.account.id : 'guest-account';

    const res = await ProfileService.deleteProfile(dissolveTarget.id, accountId);
    if (!res.success) {
      setDissolveError(res.error || 'Failed to dissolve clearing.');
      return;
    }

    soundscape.playStaticBurst(220);
    const remaining = profiles.filter(p => p.id !== dissolveTarget.id);
    if (activeProfile?.id === dissolveTarget.id && remaining.length > 0) {
      AuthService.setActiveProfile(remaining[0]);
    }

    setDissolveTarget(null);
    await loadClearingData();
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col overflow-x-hidden">
      {/* 1. Atmospheric Forest Backdrop */}
      <ForestEnvironment intensity="full" showCRTAnchor={true} />

      {/* 2. Main Content Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#14352B]/60 pb-6 text-left">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#A7F3D0]">
              <Sparkles className="w-4 h-4 text-[#EC4899] animate-pulse" />
              <span>SANCTUARY PROFILE MANAGEMENT // NODE CLEARING</span>
            </div>
            <h1 className="mt-2 font-editorial text-3xl sm:text-5xl font-light text-[#A7F3D0] crt-glow">
              My Clearing
            </h1>
            <p className="mt-1 font-editorial italic text-sm sm:text-base text-[#D8C9A5]/70 max-w-2xl">
              Your secluded nook beneath the ancient Mũgumo fig tree. Cultivate your botanical identity, review your viewing resonance, and manage your sanctuary clearings.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#061D16] border border-[#A7F3D0]/60 text-xs font-mono text-[#A7F3D0] hover:bg-[#082B21] transition-all shadow-[0_0_15px_rgba(167,243,208,0.2)]"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#EC4899]" />
              <span>Tune Clearing</span>
            </button>

            <button
              onClick={() => {
                soundscape.playTuningClick();
                navigate('/choose-your-clearing');
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#04110D] border border-[#14352B] text-xs font-mono text-[#D8C9A5]/80 hover:text-[#D8C9A5] hover:border-[#A7F3D0]/50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch Clearing</span>
            </button>
          </div>
        </div>

        {/* Active Clearing Hero Card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#061D16]/95 via-[#04140F]/90 to-[#020907]/95 border border-[#14352B] p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden text-left">
          {/* Subtle phosphor glow corner */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#A7F3D0]/10 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8">
            {/* Big Profile Avatar */}
            <div className="relative group cursor-pointer" onClick={openEditModal} title="Click to tune photo or botanical motif">
              <ProfileAvatar
                name={activeProfile?.name || 'Clearing'}
                avatarSeed={activeProfile?.avatarSeed || 'orchid'}
                imageBlobUrl={activeProfile?.imageBlobUrl}
                size="xl"
                className="ring-4 ring-[#14352B] group-hover:ring-[#A7F3D0] transition-all"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-mono text-[#A7F3D0] gap-1">
                <Edit3 className="w-4 h-4 text-[#EC4899]" />
              </div>
            </div>

            {/* Profile Identity Details */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#030E0B] border border-[#A7F3D0]/40 text-[11px] font-mono text-[#A7F3D0] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A7F3D0] animate-pulse" />
                  {activeProfile?.forestTitle || 'Canopy Wanderer'}
                </span>

                {isGuest ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2A1608] border border-amber-600/40 text-[11px] font-mono text-amber-300">
                    GUEST RECEPTOR
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#061D16] border border-[#14352B] text-[11px] font-mono text-[#D8C9A5]/70">
                    ACCOUNT: @{session.account?.username}
                  </span>
                )}

                <span className="text-[11px] font-mono text-[#D8C9A5]/40">
                  EST. {activeProfile?.createdAt ? new Date(activeProfile.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'OCT 2026'}
                </span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl text-[#A7F3D0] font-normal tracking-wide">
                {activeProfile?.name || 'Primary Clearing'}
              </h2>

              <p className="font-editorial italic text-sm sm:text-base text-[#D8C9A5]/80 max-w-2xl leading-relaxed">
                "{activeProfile?.bio || 'Wandering the quiet hollows beneath the ancient leaves, listening for faint analog transmissions.'}"
              </p>

              {/* Botanical Archetype Desc */}
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#D8C9A5]/60">
                <TreeDeciduous className="w-3.5 h-3.5 text-[#A7F3D0]" />
                <span>
                  Botanical Seed Motif: <strong className="text-[#A7F3D0]">{BOTANICAL_MOTIFS.find(m => m.id === (activeProfile?.avatarSeed || 'orchid'))?.name}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Viewing Resonance & Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="rounded-xl bg-[#04110D]/90 border border-[#14352B] p-4.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-[#D8C9A5]/60">
              <span>VAULT TAPES</span>
              <Film className="w-4 h-4 text-[#A7F3D0]" />
            </div>
            <div className="font-editorial text-2xl sm:text-3xl text-[#A7F3D0]">
              {stats.totalTapes} <span className="text-xs font-mono text-[#D8C9A5]/50">reels</span>
            </div>
            <p className="text-[11px] font-mono text-[#D8C9A5]/50">Saved in clearing archive</p>
          </div>

          <div className="rounded-xl bg-[#04110D]/90 border border-[#14352B] p-4.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-[#D8C9A5]/60">
              <span>IN TRANSMISSION</span>
              <Radio className="w-4 h-4 text-[#EC4899]" />
            </div>
            <div className="font-editorial text-2xl sm:text-3xl text-[#EC4899]">
              {stats.watchingCount} <span className="text-xs font-mono text-[#D8C9A5]/50">in-progress</span>
            </div>
            <p className="text-[11px] font-mono text-[#D8C9A5]/50">Current playback reels</p>
          </div>

          <div className="rounded-xl bg-[#04110D]/90 border border-[#14352B] p-4.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-[#D8C9A5]/60">
              <span>COMPLETED</span>
              <Check className="w-4 h-4 text-[#A7F3D0]" />
            </div>
            <div className="font-editorial text-2xl sm:text-3xl text-[#A7F3D0]">
              {stats.completedCount} <span className="text-xs font-mono text-[#D8C9A5]/50">finished</span>
            </div>
            <p className="text-[11px] font-mono text-[#D8C9A5]/50">Archived to completion</p>
          </div>

          <div className="rounded-xl bg-[#04110D]/90 border border-[#14352B] p-4.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-[#D8C9A5]/60">
              <span>FOREST IMMERSION</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-editorial text-2xl sm:text-3xl text-amber-200">
              {stats.immersionString}
            </div>
            <p className="text-[11px] font-mono text-[#D8C9A5]/50">Time in cinematic sanctuary</p>
          </div>
        </div>

        {/* Clearing Fleet / Multi-Profile Manager */}
        <section className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-[#14352B]/60 pb-3">
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl text-[#A7F3D0]">
                All Clearings in this Sanctuary
              </h2>
              <p className="font-editorial italic text-xs sm:text-sm text-[#D8C9A5]/60">
                You can cultivate up to 5 individual clearings with distinct tape vaults and watch histories.
              </p>
            </div>

            {profiles.length < 5 && (
              <button
                onClick={() => {
                  soundscape.playTuningClick();
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#061D16] border border-[#14352B] hover:border-[#A7F3D0] text-xs font-mono text-[#A7F3D0] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Sprout Clearing</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => {
              const isCurrent = p.id === activeProfile?.id;
              const motif = BOTANICAL_MOTIFS.find(m => m.id === (p.avatarSeed || 'orchid'));
              const profileVault = SanctuaryStorage.getVault(p.id);

              return (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 transition-all relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#061D16]/90 border-[#A7F3D0] shadow-[0_0_20px_rgba(167,243,208,0.15)]'
                      : 'bg-[#04110D]/80 border-[#14352B] hover:border-[#14352B]/90'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <ProfileAvatar
                      name={p.name}
                      avatarSeed={p.avatarSeed || 'orchid'}
                      imageBlobUrl={p.imageBlobUrl}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-editorial text-lg text-[#A7F3D0] truncate">
                          {p.name}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#A7F3D0]/20 text-[#A7F3D0] shrink-0">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-mono text-[#D8C9A5]/60 truncate">
                        {p.forestTitle || motif?.name || 'Canopy Wanderer'}
                      </p>

                      <p className="text-[11px] font-mono text-[#D8C9A5]/40 mt-1">
                        {profileVault.length} tapes saved
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#14352B]/60 flex items-center justify-between">
                    {isCurrent ? (
                      <span className="text-xs font-mono text-[#A7F3D0]/70 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-[#A7F3D0]" />
                        <span>Currently tuned</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSwitchProfile(p)}
                        className="text-xs font-mono text-[#D8C9A5] hover:text-[#A7F3D0] flex items-center gap-1 transition-colors"
                      >
                        <span>Tune to this clearing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {profiles.length > 1 && (
                      <button
                        onClick={() => setDissolveTarget(p)}
                        className="p-1 text-[#D8C9A5]/40 hover:text-red-400 transition-colors"
                        title="Dissolve this clearing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Profile-Specific Vault Spotlight */}
        <section className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-[#14352B]/60 pb-3">
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl text-[#A7F3D0]">
                Active Clearing Vault Reels
              </h2>
              <p className="font-editorial italic text-xs sm:text-sm text-[#D8C9A5]/60">
                Saved analog reels currently anchored to <strong>{activeProfile?.name || 'your clearing'}</strong>.
              </p>
            </div>

            <button
              onClick={() => {
                soundscape.playTuningClick();
                navigate('/vault');
              }}
              className="text-xs font-mono text-[#A7F3D0] hover:text-[#EC4899] flex items-center gap-1.5 transition-colors"
            >
              <span>Open Full Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {vaultRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#14352B] p-8 text-center space-y-3 bg-[#030E0B]/60">
              <Film className="w-8 h-8 text-[#14352B] mx-auto" />
              <p className="font-editorial text-lg text-[#D8C9A5]/70">
                No tapes currently indexed for this clearing.
              </p>
              <p className="text-xs font-mono text-[#D8C9A5]/40 max-w-md mx-auto">
                Explore The Grove or tune frequencies in The Signal to discover and archive broadcast transmissions.
              </p>
              <button
                onClick={() => navigate('/grove')}
                className="px-4 py-2 rounded-lg bg-[#061D16] border border-[#A7F3D0]/40 text-xs font-mono text-[#A7F3D0] hover:bg-[#082B21]"
              >
                Visit The Grove
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vaultRecords.slice(0, 6).map((record) => {
                const film = FILMS.find(f => f.id === record.filmId);
                if (!film) return null;
                const progressPercent = record.totalSeconds > 0 
                  ? Math.min(100, Math.round((record.progressSeconds / record.totalSeconds) * 100))
                  : 0;

                return (
                  <div
                    key={record.filmId}
                    className="group rounded-xl bg-[#04110D]/90 border border-[#14352B] hover:border-[#A7F3D0]/60 p-4 transition-all space-y-3 text-left relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="flex gap-3">
                      <img
                        src={film.posterUrl}
                        alt={film.title}
                        className="w-16 h-22 object-cover rounded border border-[#14352B] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono text-[#A7F3D0]/70 uppercase block">
                          {record.status} // {film.year}
                        </span>
                        <h4 className="font-editorial text-base text-[#A7F3D0] group-hover:text-[#EC4899] transition-colors truncate">
                          {film.title}
                        </h4>
                        <p className="text-xs font-editorial italic text-[#D8C9A5]/60 truncate">
                          {film.director}
                        </p>
                        <p className="text-[11px] font-mono text-[#D8C9A5]/40 mt-1">
                          {film.signalFrequency}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {record.progressSeconds > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-[#D8C9A5]/50">
                          <span>PROGRESS</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#030E0B] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#A7F3D0] to-[#EC4899]"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#14352B]/60 flex items-center justify-between text-xs font-mono">
                      <button
                        onClick={() => {
                          soundscape.playTuningClick();
                          navigate(`/cinema/${film.id}`);
                        }}
                        className="text-[#A7F3D0] hover:text-[#EC4899] flex items-center gap-1 transition-colors"
                      >
                        <span>Resume Transmission</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          soundscape.playTuningClick();
                          SanctuaryStorage.removeVaultRecord(record.filmId, activeProfile?.id);
                          setVaultRecords(SanctuaryStorage.getVault(activeProfile?.id));
                        }}
                        className="text-[#D8C9A5]/40 hover:text-red-400 transition-colors"
                        title="Remove from vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* 3. Tune Clearing (Edit Profile) Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-[#030E0B] border border-[#14352B] p-6 sm:p-8 space-y-6 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#14352B]/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EC4899]" />
                <h3 className="font-editorial text-2xl text-[#A7F3D0]">
                  Tune Your Clearing
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#D8C9A5]/50 hover:text-[#D8C9A5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdits} className="space-y-5">
              {/* Photo & Botanical Avatar Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-mono text-[#A7F3D0]">
                  CLEARING PHOTO OR BOTANICAL MOTIF
                </label>
                
                <div className="flex items-center gap-5">
                  <ProfileAvatar
                    name={editName || 'Clearing'}
                    avatarSeed={editSeed}
                    imageBlobUrl={editImagePreview || undefined}
                    size="lg"
                  />

                  <div className="space-y-2">
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#061D16] border border-[#14352B] hover:border-[#A7F3D0] text-xs font-mono text-[#D8C9A5] hover:text-[#A7F3D0] flex items-center gap-2 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#EC4899]" />
                      <span>Upload Custom Photo</span>
                    </button>

                    {editImagePreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-[11px] font-mono text-red-400 hover:underline block"
                      >
                        Remove photo & use botanical motif
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Botanical Motif Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-[#D8C9A5]/70">
                  Select Botanical Seed
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BOTANICAL_MOTIFS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setEditSeed(m.id);
                        if (editImagePreview) handleRemovePhoto();
                      }}
                      className={`p-2 rounded-lg border text-left text-xs font-mono transition-all flex flex-col gap-1 ${
                        editSeed === m.id && !editImagePreview
                          ? 'bg-[#061D16] border-[#A7F3D0] text-[#A7F3D0]'
                          : 'bg-[#04110D] border-[#14352B] text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
                      }`}
                    >
                      <span className="font-medium truncate">{m.name}</span>
                      <span className="text-[10px] text-[#D8C9A5]/40 leading-tight line-clamp-2">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clearing Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-[#A7F3D0]">
                  CLEARING NAME
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#04110D] border border-[#14352B] rounded-lg px-3.5 py-2 text-sm text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                  placeholder="e.g. Primary Clearing"
                />
              </div>

              {/* Forest Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-[#A7F3D0]">
                  FOREST ARCHETYPE / TITLE
                </label>
                <select
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#04110D] border border-[#14352B] rounded-lg px-3.5 py-2 text-sm text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                >
                  {FOREST_TITLES.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              {/* Field Note / Bio */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-[#A7F3D0]">
                  FIELD NOTE / BIOGRAPHY
                </label>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#04110D] border border-[#14352B] rounded-lg p-3 text-sm text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                  placeholder="A quiet note on your sanctuary wandering..."
                />
              </div>

              {editError && (
                <p className="text-xs font-mono text-red-400 bg-red-950/40 p-2.5 rounded border border-red-800/40">
                  {editError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#14352B]/60">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-[#D8C9A5]/60 hover:text-[#D8C9A5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-lg bg-[#061D16] border border-[#A7F3D0]/60 text-xs font-mono text-[#A7F3D0] hover:bg-[#082B21] transition-all"
                >
                  {editSaving ? 'Preserving...' : 'Save Clearing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Sprout New Clearing Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[#030E0B] border border-[#14352B] p-6 sm:p-8 space-y-6 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#14352B]/60 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#EC4899]" />
                <h3 className="font-editorial text-2xl text-[#A7F3D0]">
                  Sprout New Clearing
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#D8C9A5]/50 hover:text-[#D8C9A5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClearing} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-[#A7F3D0]">
                  CLEARING NAME
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#04110D] border border-[#14352B] rounded-lg px-3.5 py-2 text-sm text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                  placeholder="e.g. Midnight Clearing"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-[#A7F3D0]">
                  FOREST ARCHETYPE
                </label>
                <select
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#04110D] border border-[#14352B] rounded-lg px-3.5 py-2 text-sm text-[#D8C9A5] focus:outline-none focus:border-[#A7F3D0]"
                >
                  {FOREST_TITLES.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-[#A7F3D0]">
                  BOTANICAL MOTIF
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BOTANICAL_MOTIFS.slice(0, 4).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNewSeed(m.id)}
                      className={`p-2 rounded-lg border text-left text-xs font-mono transition-all ${
                        newSeed === m.id
                          ? 'bg-[#061D16] border-[#A7F3D0] text-[#A7F3D0]'
                          : 'bg-[#04110D] border-[#14352B] text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {createError && (
                <p className="text-xs font-mono text-red-400 bg-red-950/40 p-2.5 rounded border border-red-800/40">
                  {createError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#14352B]/60">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-[#D8C9A5]/60 hover:text-[#D8C9A5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSaving}
                  className="px-5 py-2 rounded-lg bg-[#061D16] border border-[#A7F3D0]/60 text-xs font-mono text-[#A7F3D0] hover:bg-[#082B21] transition-all"
                >
                  {createSaving ? 'Sprouting...' : 'Sprout Clearing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Dissolve Confirmation Modal */}
      {dissolveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#030E0B] border border-red-500/40 p-6 space-y-4 text-left shadow-2xl relative">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-editorial text-xl text-red-300">
                Dissolve Clearing?
              </h3>
            </div>

            <p className="text-xs font-mono text-[#D8C9A5]/80 leading-relaxed">
              Are you sure you want to dissolve <strong>{dissolveTarget.name}</strong>? Its vault tapes and watch history will be released back into the forest soil.
            </p>

            {dissolveError && (
              <p className="text-xs font-mono text-red-400">
                {dissolveError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDissolveTarget(null)}
                className="px-3 py-1.5 text-xs font-mono text-[#D8C9A5]/60 hover:text-[#D8C9A5]"
              >
                Cancel
              </button>
              <button
                onClick={handleDissolveClearing}
                className="px-4 py-1.5 rounded-lg bg-red-600/80 border border-red-400 text-xs font-mono text-white hover:bg-red-700 transition-colors"
              >
                Dissolve Clearing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
