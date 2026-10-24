import { createPattern, validatePattern } from './game/SpawnDirector';

describe('SpawnDirector validation', () => {
  it('rejects impossible obstacle overlap patterns', () => {
    const pattern = {
      obstacles: [
        { type: 'barricade', lane: 0, z: 30 },
        { type: 'overhead', lane: 0, z: 34 },
      ],
      safeZones: [{ lane: 1, z: 80, active: false }],
      collectibles: [{ lane: 2, z: 40, kind: 'marigold' }],
    };
    expect(validatePattern(pattern)).toBe(false);
  });

  it('accepts a valid pattern with at least one safe route', () => {
    const pattern = createPattern(42, 2);
    expect(validatePattern(pattern)).toBe(true);
  });
});
