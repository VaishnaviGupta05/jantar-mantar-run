export type LaneIndex = 0 | 1 | 2;

export type GameMode = 'menu' | 'character' | 'running' | 'paused' | 'results';

export interface CharacterDef {
  id: string;
  name: string;
  description: string;
  color: string;
  unlocked: boolean;
  unlockCost: number;
}

export interface SaveData {
  version: number;
  bestScore: number;
  totalDistance: number;
  totalCollectibles: number;
  currency: number;
  unlockedCharacters: string[];
  selectedCharacter: string;
  settings: {
    music: number;
    sfx: number;
    quality: 'low' | 'balanced' | 'high';
    reducedMotion: boolean;
  };
  missions: Record<string, number>;
}

export interface ObstacleDef {
  type: 'barricade' | 'barrier' | 'overhead' | 'cone' | 'debris' | 'van';
  lane: LaneIndex;
  z: number;
  height?: number;
  width?: number;
  depth?: number;
}

export interface SpawnPattern {
  obstacles: ObstacleDef[];
  safeZones: Array<{ lane: LaneIndex; z: number; active: boolean }>;
  collectibles: Array<{ lane: LaneIndex; z: number; kind: 'marigold' | 'magnet' | 'shield' | 'multiplier' | 'stamina' }>;
}
