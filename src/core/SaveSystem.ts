import type { SaveData } from '../types';

const STORAGE_KEY = 'jantar-mantar-save-v1';

const defaultData: SaveData = {
  version: 1,
  bestScore: 0,
  totalDistance: 0,
  totalCollectibles: 0,
  currency: 0,
  unlockedCharacters: ['vanya'],
  selectedCharacter: 'vanya',
  settings: {
    music: 0.7,
    sfx: 0.8,
    quality: 'balanced',
    reducedMotion: false,
  },
  missions: {
    distance: 0,
    collectibles: 0,
    jumps: 0,
    safeZones: 0,
    score: 0,
  },
};

export class SaveSystem {
  static load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData;
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        ...defaultData,
        ...parsed,
        settings: { ...defaultData.settings, ...(parsed.settings ?? {}) },
        missions: { ...defaultData.missions, ...(parsed.missions ?? {}) },
        unlockedCharacters: Array.isArray(parsed.unlockedCharacters) && parsed.unlockedCharacters.length > 0 ? parsed.unlockedCharacters : defaultData.unlockedCharacters,
        selectedCharacter: typeof parsed.selectedCharacter === 'string' ? parsed.selectedCharacter : defaultData.selectedCharacter,
      };
    } catch {
      return defaultData;
    }
  }

  static save(data: SaveData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: 1 }));
  }

  static reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
