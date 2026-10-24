import type { GameMode, SaveData } from '../types';

export class GameStateManager {
  private mode: GameMode = 'menu';

  private state = {
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

  updateFromRun({ score, distance, collectibles, stamina, chasePressure, speed }: Partial<typeof this.state>): void {
    this.state = { ...this.state, ...{ score: score ?? this.state.score, distance: distance ?? this.state.distance, collectibles: collectibles ?? this.state.collectibles, stamina: stamina ?? this.state.stamina, chasePressure: chasePressure ?? this.state.chasePressure, speed: speed ?? this.state.speed } };
  }

  getSnapshot(): typeof this.state {
    return { ...this.state };
  }

  resetRun(): void {
    this.state = {
      score: 0,
      distance: 0,
      collectibles: 0,
      stamina: 100,
      chasePressure: 0,
      speed: 20,
    };
  }

  hydrateSave(save: SaveData): void {
    this.state.score = 0;
    this.state.collectibles = 0;
    this.state.distance = 0;
    this.state.stamina = 100;
    this.state.chasePressure = 0;
  }
}
