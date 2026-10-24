import type { LaneIndex, ObstacleDef, SpawnPattern } from '../types';

export function validatePattern(pattern: SpawnPattern): boolean {
  if (pattern.obstacles.length === 0 && pattern.collectibles.length === 0 && pattern.safeZones.length === 0) {
    return false;
  }

  const laneUsed = new Map<number, number[]>();

  for (const obstacle of pattern.obstacles) {
    if (obstacle.lane < 0 || obstacle.lane > 2) return false;
    if (obstacle.z <= 0 || obstacle.z > 220) return false;
    const laneEntries = laneUsed.get(obstacle.lane) ?? [];
    if (laneEntries.some((entry) => Math.abs(entry - obstacle.z) < 6)) {
      return false;
    }
    laneEntries.push(obstacle.z);
    laneUsed.set(obstacle.lane, laneEntries);
  }

  for (const item of pattern.collectibles) {
    if (item.lane < 0 || item.lane > 2) return false;
    if (item.z <= 0 || item.z > 220) return false;
  }

  for (const zone of pattern.safeZones) {
    if (zone.lane < 0 || zone.lane > 2) return false;
    if (zone.z <= 20 || zone.z > 220) return false;
  }

  return true;
}

export function createPattern(seed: number, difficulty: number): SpawnPattern {
  const randomFromSeed = (value: number): number => {
    const x = Math.sin(value * 12.9898 + seed * 2.1) * 43758.5453;
    return x - Math.floor(x);
  };

  const pattern: SpawnPattern = {
    obstacles: [],
    safeZones: [],
    collectibles: [],
  };

  const lanes: LaneIndex[] = [0, 1, 2];

  for (let i = 0; i < 5 + difficulty; i += 1) {
    const lane = lanes[Math.floor(randomFromSeed(i + 5) * 3)] as LaneIndex;
    const z = 20 + i * 18 + difficulty * 2;
    const typeRoll = Math.floor(randomFromSeed(i + 7) * 5);
    const obstacleType: ObstacleDef['type'] =
      typeRoll === 0 ? 'barricade' : typeRoll === 1 ? 'barrier' : typeRoll === 2 ? 'overhead' : typeRoll === 3 ? 'cone' : 'debris';

    pattern.obstacles.push({ type: obstacleType, lane, z, height: obstacleType === 'overhead' ? 3.5 : 1.5 });
  }

  const safeZone: SpawnPattern['safeZones'][number] = {
    lane: 1,
    z: 76 + difficulty * 3,
    active: false,
  };
  pattern.safeZones.push(safeZone);

  for (let i = 0; i < 10; i += 1) {
    const lane = lanes[Math.floor(randomFromSeed(i + 11) * 3)] as LaneIndex;
    const kindRoll = Math.floor(randomFromSeed(i + 13) * 5);
    const kind = kindRoll === 0 ? 'marigold' : kindRoll === 1 ? 'magnet' : kindRoll === 2 ? 'shield' : kindRoll === 3 ? 'multiplier' : 'stamina';
    pattern.collectibles.push({ lane, z: 18 + i * 12 + difficulty * 3, kind });
  }

  return pattern;
}
