export const GAME_CONFIG = {
  laneCount: 3,
  laneWidth: 6,
  playerZ: 0,
  spawnDistance: 12,
  baseSpeed: 18,
  maxSpeed: 36,
  gravity: 38,
  jumpVelocity: 15,
  slideDuration: 0.8,
  chasePressureDecay: 0.08,
  chasePressureGain: 0.15,
  staminaMax: 100,
  safeZoneRestore: 32,
  safeZoneCooldown: 8,
  worldSegmentLength: 24,
};

export const CHARACTER_DEFS = [
  { id: 'vanya', name: 'Vanya', description: 'Street-runner courier with agile footing and quick lane reads.', color: '#f8b55b', unlocked: true, unlockCost: 0 },
  { id: 'rayan', name: 'Rayan', description: 'Metro sprinter who thrives in packed city lanes and power surges.', color: '#74c7d8', unlocked: false, unlockCost: 150 },
  { id: 'meher', name: 'Meher', description: 'Reporter-turned-athlete blending balance, stamina, and crowd control.', color: '#7ad9b2', unlocked: false, unlockCost: 220 },
];
