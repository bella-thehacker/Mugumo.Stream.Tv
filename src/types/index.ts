export type MediaKind = 'film' | 'series';

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  duration: string;
  description: string;
  videoUrl?: string;
}

export interface FilmItem {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  kind: MediaKind;
  duration: string;
  director: string;
  genres: string[];
  moods: string[];
  collectionId: 'archive' | '2am' | 'hurt' | 'another-life' | 'uncanny';
  tagline: string;
  synopsis: string;
  signalFrequency: string; // e.g., "142.05 MHz"
  rating: number; // 0-5
  backdropUrl: string;
  posterUrl: string;
  videoUrl: string; // HTML5 video or authorized stream
  episodes?: Episode[];
  isFeatured?: boolean;
}

export type VaultStatus = 'saved' | 'watching' | 'completed' | 'abandoned' | 'favorite';

export interface VaultRecord {
  filmId: string;
  status: VaultStatus;
  userRating?: number;
  notes?: string;
  progressSeconds: number;
  totalSeconds: number;
  addedAt: string;
  lastWatchedAt?: string;
}

export interface SystemLogEvent {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SIGNAL' | 'ARCHIVE' | 'AUDIO' | 'ANOMALY';
  category: 'NAVIGATION' | 'PLAYBACK' | 'VAULT' | 'SEARCH' | 'SYSTEM';
  message: string;
  details?: Record<string, unknown>;
}

export interface SanctuarySettings {
  crtScanlines: boolean;
  crtCurvature: boolean;
  crtBrightness: number; // 50 - 150
  ambientAudioEnabled: boolean;
  ambientVolume: number; // 0 - 1
  crtHumVolume: number; // 0 - 1
  reducedMotion: boolean;
}
