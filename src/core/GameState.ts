import type { GameMode } from '../types';

export class GameStateManager {
  private mode: GameMode = 'menu';
  private stats = {
    score: 0,
    distance: 0,
    collectibles: 0,
    stamina: 100,
    chasePressure: 0,
    speed: 20,
  };

  getMode(): GameMode {
    return this.mode;
  }

  setMode(mode: GameMode): void {
    this.mode = mode;
  }

  updateFromRun(partial: Partial<typeof this.stats>): void {
    this.stats = { ...this.stats, ...partial };
  }

  getSnapshot(): typeof this.stats {
    return { ...this.stats };
  }

  resetRun(): void {
    this.stats = {
      score: 0,
      distance: 0,
      collectibles: 0,
      stamina: 100,
      chasePressure: 0,
      speed: 20,
    };
  }
}
