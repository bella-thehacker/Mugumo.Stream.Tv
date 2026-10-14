import { UserProfile } from '../types';
import { SanctuaryStorage } from './storage';

const PROFILES_STORAGE_KEY = 'mugumo_profiles_v1';
const IDB_NAME = 'MugumoProfilesMediaDB_v1';
const IDB_STORE_NAME = 'profile_photos';

// Open IndexedDB database for persistent binary profile image files
function openProfileDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// In-memory cache for Object URLs to prevent memory leaks and recreate cleanly
const objectUrlCache = new Map<string, string>();

// Seed profiles for demo account 'acc-mugumo-traveler'
const SEED_PROFILES: UserProfile[] = [
  {
    id: 'prof-traveler-main',
    accountId: 'acc-mugumo-traveler',
    name: 'Canopy Walker',
    avatarSeed: 'orchid',
    hasCustomImage: false,
    createdAt: '2026-10-01T12:00:00Z',
    isDefault: true,
  },
  {
    id: 'prof-traveler-midnight',
    accountId: 'acc-mugumo-traveler',
    name: 'Midnight Reel',
    avatarSeed: 'roots',
    hasCustomImage: false,
    createdAt: '2026-10-02T16:30:00Z',
    isDefault: false,
  }
];

export const ProfileService = {
  getAllProfiles(): UserProfile[] {
    try {
      const data = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(SEED_PROFILES));
        return SEED_PROFILES;
      }
      return JSON.parse(data);
    } catch {
      return SEED_PROFILES;
    }
  },

  async getProfilesForAccount(accountId: string): Promise<UserProfile[]> {
    const all = this.getAllProfiles();
    const accountProfiles = all.filter(p => p.accountId === accountId);

    // If an account doesn't have any profile yet, seed a default clearing
    if (accountProfiles.length === 0) {
      const defaultProfile: UserProfile = {
        id: `prof-${Date.now()}-1`,
        accountId,
        name: 'Primary Clearing',
        avatarSeed: 'orchid',
        hasCustomImage: false,
        createdAt: new Date().toISOString(),
        isDefault: true,
      };
      const updated = [...all, defaultProfile];
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
      return [defaultProfile];
    }

    // Attach loaded image blob URLs for profiles that have custom photos
    const enriched = await Promise.all(
      accountProfiles.map(async (profile) => {
        if (profile.hasCustomImage) {
          const blobUrl = await this.getProfileImage(profile.id);
          return { ...profile, imageBlobUrl: blobUrl || undefined };
        }
        return profile;
      })
    );

    return enriched;
  },

  async saveProfileImage(profileId: string, imageBlob: Blob): Promise<string> {
    try {
      const db = await openProfileDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
        const store = tx.objectStore(IDB_STORE_NAME);
        const req = store.put(imageBlob, profileId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      // Revoke previous url if any
      const oldUrl = objectUrlCache.get(profileId);
      if (oldUrl) URL.revokeObjectURL(oldUrl);

      const newUrl = URL.createObjectURL(imageBlob);
      objectUrlCache.set(profileId, newUrl);
      return newUrl;
    } catch (err) {
      console.warn('IndexedDB profile photo storage error', err);
      return URL.createObjectURL(imageBlob);
    }
  },

  async getProfileImage(profileId: string): Promise<string | null> {
    if (objectUrlCache.has(profileId)) {
      return objectUrlCache.get(profileId)!;
    }
    try {
      const db = await openProfileDB();
      const blob = await new Promise<Blob | null>((resolve) => {
        const tx = db.transaction(IDB_STORE_NAME, 'readonly');
        const store = tx.objectStore(IDB_STORE_NAME);
        const req = store.get(profileId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
      if (blob) {
        const url = URL.createObjectURL(blob);
        objectUrlCache.set(profileId, url);
        return url;
      }
      return null;
    } catch {
      return null;
    }
  },

  async createProfile(
    accountId: string,
    name: string,
    avatarSeed: string = 'orchid',
    imageFile?: File | Blob,
    bio?: string,
    forestTitle?: string
  ): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
    const cleanName = name.trim();
    if (!cleanName) return { success: false, error: 'Please enter a name for this clearing.' };
    if (cleanName.length > 25) return { success: false, error: 'Clearing name must be 25 characters or fewer.' };

    const all = this.getAllProfiles();
    const existing = all.filter(p => p.accountId === accountId);
    if (existing.length >= 5) {
      return { success: false, error: 'Maximum of 5 clearings reached for this sanctuary account.' };
    }

    const newProfileId = `prof-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let hasCustomImage = false;
    let imageBlobUrl: string | undefined = undefined;

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Image exceeds 5MB limit. Please choose a smaller photo.' };
      }
      imageBlobUrl = await this.saveProfileImage(newProfileId, imageFile);
      hasCustomImage = true;
    }

    const newProfile: UserProfile = {
      id: newProfileId,
      accountId,
      name: cleanName,
      avatarSeed,
      bio: bio?.trim() || undefined,
      forestTitle: forestTitle?.trim() || undefined,
      hasCustomImage,
      imageBlobUrl,
      createdAt: new Date().toISOString(),
      isDefault: existing.length === 0,
    };

    const updated = [...all, newProfile];
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
    SanctuaryStorage.addLog('INFO', 'SYSTEM', `New viewing clearing sprouted: ${cleanName}`);

    return { success: true, profile: newProfile };
  },

  async updateProfile(
    profileId: string,
    updates: { 
      name?: string; 
      avatarSeed?: string; 
      bio?: string;
      forestTitle?: string;
      imageFile?: File | Blob; 
      removeImage?: boolean 
    }
  ): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
    const all = this.getAllProfiles();
    const idx = all.findIndex(p => p.id === profileId);
    if (idx === -1) return { success: false, error: 'Clearing not found.' };

    const current = all[idx];
    let hasCustomImage = current.hasCustomImage;
    let imageBlobUrl = current.imageBlobUrl;

    if (updates.removeImage) {
      hasCustomImage = false;
      imageBlobUrl = undefined;
      const cached = objectUrlCache.get(profileId);
      if (cached) URL.revokeObjectURL(cached);
      objectUrlCache.delete(profileId);
    } else if (updates.imageFile) {
      if (updates.imageFile.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Image file is too large (max 5MB).' };
      }
      imageBlobUrl = await this.saveProfileImage(profileId, updates.imageFile);
      hasCustomImage = true;
    }

    const updatedProfile: UserProfile = {
      ...current,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      avatarSeed: updates.avatarSeed !== undefined ? updates.avatarSeed : current.avatarSeed,
      bio: updates.bio !== undefined ? updates.bio.trim() : current.bio,
      forestTitle: updates.forestTitle !== undefined ? updates.forestTitle.trim() : current.forestTitle,
      hasCustomImage,
      imageBlobUrl,
    };

    all[idx] = updatedProfile;
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(all));

    // Sync active session if this is the currently active profile
    try {
      const sessionStr = localStorage.getItem('mugumo_auth_session_v1');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.activeProfile?.id === profileId) {
          session.activeProfile = updatedProfile;
          localStorage.setItem('mugumo_auth_session_v1', JSON.stringify(session));
        }
      }
    } catch {
      // safe fallback
    }

    return { success: true, profile: updatedProfile };
  },

  async getProfileById(profileId: string): Promise<UserProfile | null> {
    const all = this.getAllProfiles();
    const p = all.find(item => item.id === profileId);
    if (!p) return null;
    if (p.hasCustomImage) {
      const img = await this.getProfileImage(p.id);
      return { ...p, imageBlobUrl: img || undefined };
    }
    return p;
  },

  async deleteProfile(profileId: string, accountId: string): Promise<{ success: boolean; error?: string }> {
    const all = this.getAllProfiles();
    const accountProfiles = all.filter(p => p.accountId === accountId);
    if (accountProfiles.length <= 1) {
      return { success: false, error: 'A sanctuary account must have at least one clearing.' };
    }

    const filtered = all.filter(p => p.id !== profileId);
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(filtered));

    // Cleanup cached url
    const cached = objectUrlCache.get(profileId);
    if (cached) URL.revokeObjectURL(cached);
    objectUrlCache.delete(profileId);

    // Delete vault data for this profile
    SanctuaryStorage.deleteProfileVault(profileId);

    SanctuaryStorage.addLog('ARCHIVE', 'SYSTEM', `Viewing clearing removed: ${profileId}`);
    return { success: true };
  },

  async deleteAccountProfiles(accountId: string): Promise<void> {
    const all = this.getAllProfiles();
    const toDelete = all.filter(p => p.accountId === accountId);
    const remaining = all.filter(p => p.accountId !== accountId);
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(remaining));

    // Cleanup images and vaults
    for (const p of toDelete) {
      const cached = objectUrlCache.get(p.id);
      if (cached) URL.revokeObjectURL(cached);
      objectUrlCache.delete(p.id);
      SanctuaryStorage.deleteProfileVault(p.id);
    }
  }
};
