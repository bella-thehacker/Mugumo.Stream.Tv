import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForestEnvironment } from '../components/ForestEnvironment';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { AuthService } from '../services/authService';
import { ProfileService } from '../services/profileService';
import { soundscape } from '../services/soundscape';
import { UserProfile } from '../types';
import { Plus, Edit2, Trash2, Check, ArrowRight, Upload, X, LogOut, Sparkles, Image as ImageIcon } from 'lucide-react';

export const ChooseClearing: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => AuthService.getSession());
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedSeed, setSelectedSeed] = useState('orchid');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [creationError, setCreationError] = useState('');

  // Editing state
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // If no session exists or guest, ensure we have an account or redirect
  useEffect(() => {
    const cur = AuthService.getSession();
    if (!cur.account && !cur.isGuest) {
      navigate('/login');
      return;
    }

    const accountId = cur.account ? cur.account.id : 'guest-account';
    ProfileService.getProfilesForAccount(accountId).then((loaded) => {
      setProfiles(loaded);
      setLoading(false);
    });
  }, [navigate]);

  const handleSelectProfile = (profile: UserProfile) => {
    soundscape.playTuningClick();
    AuthService.setActiveProfile(profile);
    navigate('/grove');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCreationError('Please choose a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCreationError('Image file is too large (max 5MB).');
      return;
    }

    setCreationError('');
    setNewImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setNewImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setNewImageFile(null);
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
      setNewImagePreview(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreationError('');

    if (!newProfileName.trim()) {
      setCreationError('Please name your new clearing.');
      return;
    }

    const accountId = session.account ? session.account.id : 'guest-account';
    soundscape.playTuningClick();

    const res = await ProfileService.createProfile(
      accountId,
      newProfileName.trim(),
      selectedSeed,
      newImageFile || undefined
    );

    if (!res.success || !res.profile) {
      setCreationError(res.error || 'Failed to create clearing.');
      soundscape.playStaticBurst(200);
      return;
    }

    soundscape.playStaticBurst(250);
    // Reload profiles
    const updated = await ProfileService.getProfilesForAccount(accountId);
    setProfiles(updated);

    // Reset creation form
    setIsCreating(false);
    setNewProfileName('');
    setNewImageFile(null);
    setNewImagePreview(null);
  };

  const handleSaveEdit = async (profileId: string) => {
    if (!editName.trim()) return;
    soundscape.playTuningClick();
    await ProfileService.updateProfile(profileId, { name: editName.trim() });
    const accountId = session.account ? session.account.id : 'guest-account';
    const updated = await ProfileService.getProfilesForAccount(accountId);
    setProfiles(updated);
    setEditingProfileId(null);
  };

  const handleDeleteProfile = async (profileId: string) => {
    const accountId = session.account ? session.account.id : 'guest-account';
    soundscape.playTuningClick();
    const res = await ProfileService.deleteProfile(profileId, accountId);
    if (res.success) {
      const updated = await ProfileService.getProfilesForAccount(accountId);
      setProfiles(updated);
      setConfirmDeleteId(null);
    }
  };

  const handleSignOut = () => {
    soundscape.playStaticBurst(200);
    AuthService.logout();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* 1. Forest Atmosphere */}
      <ForestEnvironment intensity="cinema" showCRTAnchor={true} />

      {/* 2. Main Profile Selection Container */}
      <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-[#030E0B]/92 border border-[#14352B] p-6 sm:p-10 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-center">
        
        {/* Top Account & Station Bar */}
        <div className="flex items-center justify-between pb-5 border-b border-[#14352B]/70 text-xs font-mono text-[#D8C9A5]/60">
          <div className="flex items-center gap-2 text-[#A7F3D0]">
            <Sparkles className="w-4 h-4 text-[#EC4899]" />
            <span>
              {session.account ? `ACCOUNT: ${session.account.displayName}` : 'GUEST TRAVELER SESSION'}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[#D8C9A5]/60 hover:text-red-400 transition-colors"
            title="Leave this sanctuary session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Section Heading & Subtitle */}
        <div className="my-7 space-y-2">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-light text-[#A7F3D0] tracking-wide crt-glow">
            Choose Your Clearing
          </h1>
          <p className="font-editorial italic text-sm sm:text-base text-[#D8C9A5]/80 max-w-2xl mx-auto leading-relaxed">
            Every viewer has their own little corner of the forest. Choose a profile to continue watching, revisit saved films, and pick up where you left off.
          </p>
        </div>

        {/* Profiles Grid */}
        {!isCreating ? (
          <div className="mt-8 space-y-8">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              {profiles.map((profile) => {
                const isEditing = editingProfileId === profile.id;
                const isConfirmingDelete = confirmDeleteId === profile.id;

                return (
                  <div
                    key={profile.id}
                    className="group relative flex flex-col items-center w-36 sm:w-44 text-center cursor-pointer"
                  >
                    {/* Profile Avatar Card */}
                    <div
                      onClick={() => !isEditing && !isConfirmingDelete && handleSelectProfile(profile)}
                      className="relative p-2 rounded-2xl bg-[#04110D] border-2 border-[#14352B] group-hover:border-[#A7F3D0] group-hover:shadow-[0_0_25px_rgba(167,243,208,0.25)] transition-all duration-300 transform group-hover:-translate-y-1"
                    >
                      <ProfileAvatar
                        name={profile.name}
                        avatarSeed={profile.avatarSeed}
                        imageBlobUrl={profile.imageBlobUrl}
                        size="lg"
                        isInteractive={true}
                      />
                    </div>

                    {/* Profile Name & Editor */}
                    {isEditing ? (
                      <div className="mt-3 flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-xs font-mono bg-[#020705] border border-[#A7F3D0] text-[#A7F3D0] py-1 px-2 rounded focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(profile.id)}
                          className="p-1 bg-[#061D16] border border-[#A7F3D0] text-[#A7F3D0] rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleSelectProfile(profile)}
                        className="mt-3 space-y-0.5"
                      >
                        <h2 className="font-editorial text-base sm:text-lg text-[#D8C9A5] group-hover:text-[#A7F3D0] transition-colors truncate max-w-[140px]">
                          {profile.name}
                        </h2>
                        <span className="text-[11px] font-mono text-[#D8C9A5]/50 group-hover:text-[#EC4899] transition-colors block">
                          Enter Clearing &rarr;
                        </span>
                      </div>
                    )}

                    {/* Edit and Delete Actions */}
                    <div className="mt-2 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity text-xs font-mono">
                      {!isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProfileId(profile.id);
                            setEditName(profile.name);
                          }}
                          className="p-1 text-[#D8C9A5]/50 hover:text-[#A7F3D0] transition-colors"
                          title="Rename clearing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {profiles.length > 1 && !isConfirmingDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(profile.id);
                          }}
                          className="p-1 text-[#D8C9A5]/50 hover:text-red-400 transition-colors"
                          title="Delete this clearing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isConfirmingDelete && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 bg-[#260C0A] border border-red-500/50 p-1 rounded text-[10px]"
                        >
                          <span className="text-red-300">Delete?</span>
                          <button
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="px-1.5 py-0.5 bg-red-600 text-white rounded font-bold"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1 text-[#D8C9A5]/60 hover:text-white"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Clearing Card */}
              {profiles.length < 5 && (
                <div
                  onClick={() => {
                    soundscape.playTuningClick();
                    setIsCreating(true);
                  }}
                  className="group flex flex-col items-center w-36 sm:w-44 text-center cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-2xl bg-[#04110D]/60 border-2 border-dashed border-[#14352B] group-hover:border-[#EC4899] group-hover:bg-[#071912] flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1">
                    <Plus className="w-8 h-8 text-[#D8C9A5]/50 group-hover:text-[#EC4899] transition-colors" />
                  </div>
                  <span className="mt-3 font-editorial text-sm sm:text-base text-[#D8C9A5]/70 group-hover:text-[#EC4899] transition-colors">
                    + Create a New Clearing
                  </span>
                  <span className="text-[10px] font-mono text-[#D8C9A5]/40 mt-0.5">
                    ({profiles.length}/5 Clearings)
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CREATE NEW CLEARING FORM */
          <div className="mt-6 max-w-lg mx-auto rounded-xl bg-[#04110D] border border-[#14352B] p-6 text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#14352B]/70">
              <span className="text-xs font-mono text-[#A7F3D0] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Shape a New Viewing Clearing</span>
              </span>
              <button
                onClick={() => setIsCreating(false)}
                className="text-[#D8C9A5]/50 hover:text-[#EC4899]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-editorial text-xs sm:text-sm text-[#D8C9A5]/80">
              Give this clearing a name and a face. Your watchlist and viewing history will belong to this profile.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Profile Name */}
              <div>
                <label className="block text-xs font-mono text-[#D8C9A5]/80 uppercase tracking-wider mb-1.5">
                  Clearing Name *
                </label>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => {
                    setNewProfileName(e.target.value);
                    if (creationError) setCreationError('');
                  }}
                  placeholder="e.g. Midnight Watcher or Maya"
                  autoFocus
                  className="w-full rounded-lg bg-[#020705] border border-[#14352B] py-2 px-3 text-sm font-mono text-[#A7F3D0] placeholder-[#D8C9A5]/30 focus:outline-none focus:border-[#A7F3D0]"
                />
              </div>

              {/* Profile Image Upload (Real file picker + IndexedDB) */}
              <div className="p-3.5 rounded-lg bg-[#020705] border border-[#14352B] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#D8C9A5]/80 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#A7F3D0]" />
                    <span>PROFILE IMAGE (OPTIONAL)</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#D8C9A5]/40">JPEG, PNG, WebP up to 5MB</span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Image Preview */}
                  <div className="w-16 h-16 rounded-full border-2 border-[#14352B] overflow-hidden bg-[#04110D] flex items-center justify-center shrink-0">
                    {newImagePreview ? (
                      <img
                        src={newImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProfileAvatar name={newProfileName || 'Preview'} avatarSeed={selectedSeed} size="md" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded bg-[#061D16] border border-[#14352B] hover:border-[#A7F3D0] text-xs font-mono text-[#A7F3D0] flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{newImageFile ? 'Change Image' : 'Upload Image'}</span>
                      </button>

                      {newImageFile && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-2 py-1.5 rounded text-xs font-mono text-[#D8C9A5]/50 hover:text-red-400"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-[#D8C9A5]/50">
                      {newImageFile ? newImageFile.name : 'Choose a photo from your device, or use a botanical motif below.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botanical Motif Selector if no image */}
              {!newImageFile && (
                <div>
                  <label className="block text-xs font-mono text-[#D8C9A5]/80 uppercase tracking-wider mb-2">
                    Or select a Sanctuary Motif:
                  </label>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    {[
                      { id: 'orchid', label: 'Orchid' },
                      { id: 'roots', label: 'Roots' },
                      { id: 'canopy', label: 'Canopy' },
                      { id: 'phosphor', label: 'Phosphor' },
                      { id: 'radio', label: 'Radio' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedSeed(m.id)}
                        className={`px-3 py-1 rounded border transition-colors ${
                          selectedSeed === m.id
                            ? 'bg-[#0E2F23] border-[#A7F3D0] text-[#A7F3D0]'
                            : 'border-[#14352B] text-[#D8C9A5]/60 hover:text-[#D8C9A5]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {creationError && (
                <div className="p-2.5 rounded bg-[#260C0A] border border-red-500/50 text-xs font-mono text-red-300">
                  {creationError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-mono text-[#D8C9A5]/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#061D16] border border-[#A7F3D0] text-xs font-mono text-[#A7F3D0] hover:bg-[#0A2E22] hover:box-phosphor-glow transition-all"
                >
                  CREATE CLEARING
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
