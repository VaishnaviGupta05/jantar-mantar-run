export type InputAction = 'left' | 'right' | 'jump' | 'slide' | 'pause';

export class InputManager {
  private actions = new Set<InputAction>();
  private handlers = new Map<InputAction, Array<() => void>>();

  constructor() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') this.dispatch('left');
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') this.dispatch('right');
      if (event.key === 'ArrowUp' || event.key === ' ' || event.key.toLowerCase() === 'w') this.dispatch('jump');
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') this.dispatch('slide');
      if (event.key === 'Escape' || event.key.toLowerCase() === 'p') this.dispatch('pause');
    });

    window.addEventListener('pointerdown', (event) => {
      const target = event.target as HTMLElement;
      if (target.closest('button')) return;
      const dx = event.clientX;
      const dy = event.clientY;
      const lock = { dx, dy };
      (window as Window & { __swipeLock?: { dx: number; dy: number } }).__swipeLock = lock;
    });

    window.addEventListener('pointerup', (event) => {
      const start = (window as Window & { __swipeLock?: { dx: number; dy: number } }).__swipeLock;
      if (!start) return;

      const deltaX = event.clientX - start.dx;
      const deltaY = event.clientY - start.dy;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        this.dispatch(deltaX > 0 ? 'right' : 'left');
      } else if (Math.abs(deltaY) > 30) {
        this.dispatch(deltaY < 0 ? 'jump' : 'slide');
      }
    });
  }

  on(action: InputAction, callback: () => void): void {
    const list = this.handlers.get(action) ?? [];
    list.push(callback);
    this.handlers.set(action, list);
  }

  private dispatch(action: InputAction): void {
    this.actions.add(action);
    const listeners = this.handlers.get(action) ?? [];
    listeners.forEach((handler) => handler());
  }
}
