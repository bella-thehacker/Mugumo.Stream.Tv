import { VaultRecord, SystemLogEvent, SanctuarySettings } from '../types';

const VAULT_STORAGE_KEY = 'mugumo_sanctuary_vault_v1';
const LOGS_STORAGE_KEY = 'mugumo_sanctuary_logs_v1';
const SETTINGS_STORAGE_KEY = 'mugumo_sanctuary_settings_v1';
const GATE_UNLOCKED_KEY = 'mugumo_gate_unlocked';

const DEFAULT_SETTINGS: SanctuarySettings = {
  crtScanlines: true,
  crtCurvature: true,
  crtBrightness: 100,
  ambientAudioEnabled: false,
  ambientVolume: 0.5,
  crtHumVolume: 0.25,
  reducedMotion: false,
};

const INITIAL_VAULT: VaultRecord[] = [
  {
    filmId: 'interstellar',
    status: 'favorite',
    userRating: 5,
    notes: 'A love story about time, space, and the ghosts we leave behind. The dust in the farmhouse feels like our childhood.',
    progressSeconds: 6240,
    totalSeconds: 10140,
    addedAt: '2026-10-01T21:40:00Z',
    lastWatchedAt: '2026-10-08T02:15:00Z',
  },
  {
    filmId: 'dune',
    status: 'watching',
    userRating: 4.5,
    notes: 'The spice reverie scenes remind me of the red volcanic soil under the mũgumo roots.',
    progressSeconds: 3120,
    totalSeconds: 9300,
    addedAt: '2026-10-03T18:20:00Z',
    lastWatchedAt: '2026-10-10T23:50:00Z',
  },
  {
    filmId: 'the-batman',
    status: 'saved',
    userRating: 4.5,
    notes: 'Rain pouring down neon glass in the middle of nowhere.',
    progressSeconds: 0,
    totalSeconds: 10560,
    addedAt: '2026-10-05T12:00:00Z',
  },
  {
    filmId: 'inception',
    status: 'completed',
    userRating: 5,
    notes: 'Totem spinning on the weathered wooden table next to the roots.',
    progressSeconds: 8880,
    totalSeconds: 8880,
    addedAt: '2026-09-28T03:30:00Z',
    lastWatchedAt: '2026-10-02T04:10:00Z',
  },
  {
    filmId: 'moonlight',
    status: 'saved',
    userRating: 5,
    notes: 'Tenderness under the night sky.',
    progressSeconds: 0,
    totalSeconds: 6660,
    addedAt: '2026-10-07T22:15:00Z',
  }
];

const INITIAL_LOGS: SystemLogEvent[] = [
  {
    id: 'log-001',
    timestamp: '2026-10-11T19:40:02Z',
    level: 'INFO',
    category: 'SYSTEM',
    message: 'MUGUMO_OS kernel v1.06 initialized across root nodes.',
  },
  {
    id: 'log-002',
    timestamp: '2026-10-11T19:40:05Z',
    level: 'SIGNAL',
    category: 'PLAYBACK',
    message: 'CRT glass tube preheated: 15.734 kHz horizontal oscillator stable.',
  },
  {
    id: 'log-003',
    timestamp: '2026-10-11T19:42:10Z',
    level: 'ARCHIVE',
    category: 'VAULT',
    message: 'Persistent memory recovered: 5 cassette tapes indexed from damp moss soil.',
  },
  {
    id: 'log-004',
    timestamp: '2026-10-11T20:15:00Z',
    level: 'SIGNAL',
    category: 'SEARCH',
    message: 'Receiver swept frequencies 63.20 - 142.05 MHz. Canopy transmission locks confirmed.',
  }
];

export const SanctuaryStorage = {
  getVault(): VaultRecord[] {
    try {
      const data = localStorage.getItem(VAULT_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(INITIAL_VAULT));
        return INITIAL_VAULT;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_VAULT;
    }
  },

  saveVaultRecord(record: VaultRecord): VaultRecord[] {
    try {
      const current = this.getVault();
      const existingIndex = current.findIndex(r => r.filmId === record.filmId);
      let updated: VaultRecord[];
      if (existingIndex >= 0) {
        updated = [...current];
        updated[existingIndex] = { ...updated[existingIndex], ...record };
      } else {
        updated = [record, ...current];
      }
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
      this.addLog('ARCHIVE', 'VAULT', `Tape archived: ${record.filmId} [status: ${record.status}]`);
      return updated;
    } catch {
      return INITIAL_VAULT;
    }
  },

  removeVaultRecord(filmId: string): VaultRecord[] {
    try {
      const current = this.getVault();
      const filtered = current.filter(r => r.filmId !== filmId);
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(filtered));
      this.addLog('ARCHIVE', 'VAULT', `Tape unspooled / removed from vault: ${filmId}`);
      return filtered;
    } catch {
      return [];
    }
  },

  updateProgress(filmId: string, progressSeconds: number, totalSeconds: number): void {
    try {
      const current = this.getVault();
      const existing = current.find(r => r.filmId === filmId);
      const now = new Date().toISOString();
      if (existing) {
        const isFinished = progressSeconds >= totalSeconds * 0.95;
        this.saveVaultRecord({
          ...existing,
          progressSeconds,
          totalSeconds,
          status: isFinished ? 'completed' : 'watching',
          lastWatchedAt: now,
        });
      } else {
        this.saveVaultRecord({
          filmId,
          status: 'watching',
          progressSeconds,
          totalSeconds,
          addedAt: now,
          lastWatchedAt: now,
        });
      }
    } catch {
      // Safe fallback
    }
  },

  getLogs(): SystemLogEvent[] {
    try {
      const data = localStorage.getItem(LOGS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
        return INITIAL_LOGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_LOGS;
    }
  },

  addLog(level: SystemLogEvent['level'], category: SystemLogEvent['category'], message: string, details?: Record<string, unknown>): SystemLogEvent[] {
    try {
      const logs = this.getLogs();
      const newEvent: SystemLogEvent = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        details,
      };
      // Keep last 100 events
      const updated = [newEvent, ...logs].slice(0, 100);
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  getSettings(): SanctuarySettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<SanctuarySettings>): SanctuarySettings {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  isGateUnlocked(): boolean {
    return localStorage.getItem(GATE_UNLOCKED_KEY) === 'true';
  },

  setGateUnlocked(unlocked: boolean): void {
    localStorage.setItem(GATE_UNLOCKED_KEY, unlocked ? 'true' : 'false');
  },

  clearAllData(): void {
    localStorage.removeItem(VAULT_STORAGE_KEY);
    localStorage.removeItem(LOGS_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(GATE_UNLOCKED_KEY);
  }
};
