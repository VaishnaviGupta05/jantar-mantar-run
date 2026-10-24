import type { LaneIndex, SpawnPattern } from '../types';

export function validatePattern(pattern: SpawnPattern): boolean {
  const laneSet = new Set<number>();

  for (const obstacle of pattern.obstacles) {
    if (obstacle.lane < 0 || obstacle.lane > 2) return false;
    laneSet.add(obstacle.lane);
    if (obstacle.z < 10 || obstacle.z > 200) return false;
  }

  if (pattern.safeZones.length > 0) {
    const zValues = pattern.safeZones.map((zone) => zone.z);
    if (zValues.some((z) => z < 20 || z > 200)) return false;
  }

  if (pattern.collectibles.length > 0) {
    if (pattern.collectibles.some((item) => item.z < 8 || item.z > 220)) return false;
  }

  return laneSet.size > 0 || pattern.safeZones.length > 0 || pattern.collectibles.length > 0;
}

export function createPattern(seed: number, difficulty: number): SpawnPattern {
  const random = (value: number) => {
    const x = Math.sin(value * 12.9898 + seed * 2.1) * 43758.5453;
    return x - Math.floor(x);
  };

  const pattern: SpawnPattern = { obstacles: [], safeZones: [], collectibles: [] };
  const lanes: LaneIndex[] = [0, 1, 2];

  for (let i = 0; i < 8; i += 1) {
    const lane = lanes[Math.floor(random(i + seed) * 3)] as LaneIndex;
    if (pattern.obstacles.some((obstacle) => obstacle.lane === lane && Math.abs(obstacle.z - (i * 18 + 22 + difficulty * 2)) < 6)) {
      continue;
    }

    const types = ['barricade', 'barrier', 'cone', 'debris'] as const;
    const type = types[Math.floor(random(i + 2) * types.length)];
    pattern.obstacles.push({
      type,
      lane,
      z: i * 18 + 22 + difficulty * 2,
      height: type === 'barrier' ? 2.1 : 1.5,
    });
  }

  pattern.safeZones.push({ lane: 1 as LaneIndex, z: 70 + difficulty * 3, active: false });

  for (let i = 0; i < 12; i += 1) {
    const lane = lanes[Math.floor(random(i + 11) * 3)] as LaneIndex;
    const kind = i % 3 === 0 ? 'magnet' : i % 2 === 0 ? 'shield' : 'marigold';
    pattern.collectibles.push({ lane, z: 16 + i * 11 + difficulty * 2, kind });
  }

  return pattern;
}
