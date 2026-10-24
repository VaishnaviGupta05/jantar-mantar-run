import type { CharacterDef, LaneIndex } from '../types';

export const GAME_CONFIG = {
  laneCount: 3,
  laneWidth: 6,
  gravity: 26,
  jumpVelocity: 10,
  slideDuration: 0.8,
  baseSpeed: 20,
  maxSpeed: 42,
  chasePressureDecay: 0.18,
  chasePressureGain: 0.12,
  staminaMax: 100,
  safeZoneRestore: 35,
  safeZoneCooldown: 8,
  worldSegmentLength: 22,
  spawnInterval: 22,
};

export const LANE_POSITIONS: readonly number[] = [-6, 0, 6];

export const CHARACTER_DEFS: CharacterDef[] = [
  { id: 'vanya', name: 'Vanya', description: 'Agile courier with quick lane adjustments and sharp reaction timing.', color: '#f6c76f', unlocked: true, unlockCost: 0 },
  { id: 'rayan', name: 'Rayan', description: 'Metro sprinter built for high-speed recovery and relentless pace.', color: '#75dce8', unlocked: false, unlockCost: 180 },
  { id: 'meher', name: 'Meher', description: 'Balanced athlete who thrives in safe-zone recovery and endurance runs.', color: '#78d9b1', unlocked: false, unlockCost: 260 },
];

export function clampLane(value: number): LaneIndex {
  return Math.max(0, Math.min(2, value)) as LaneIndex;
}
