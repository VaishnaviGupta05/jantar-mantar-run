export type InputAction = 'left' | 'right' | 'jump' | 'slide' | 'pause';

export class InputManager {
  private handlers = new Map<InputAction, Set<() => void>>();

  constructor() {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (event.key === 'ArrowLeft' || key === 'a') this.dispatch('left');
      if (event.key === 'ArrowRight' || key === 'd') this.dispatch('right');
      if (event.key === 'ArrowUp' || key === 'w' || event.key === ' ') this.dispatch('jump');
      if (event.key === 'ArrowDown' || key === 's') this.dispatch('slide');
      if (event.key === 'Escape' || key === 'p') this.dispatch('pause');
    });

    let swipeStart: { x: number; y: number } | null = null;
    window.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      swipeStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    window.addEventListener('touchend', (event) => {
      if (!swipeStart) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - swipeStart.x;
      const dy = touch.clientY - swipeStart.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
        this.dispatch(dx > 0 ? 'right' : 'left');
      } else if (Math.abs(dy) > 30) {
        this.dispatch(dy < 0 ? 'jump' : 'slide');
      }
      swipeStart = null;
    }, { passive: true });
  }

  on(action: InputAction, callback: () => void): void {
    const set = this.handlers.get(action) ?? new Set<() => void>();
    set.add(callback);
    this.handlers.set(action, set);
  }

  private dispatch(action: InputAction): void {
    const callbacks = this.handlers.get(action);
    if (!callbacks) return;
    callbacks.forEach((callback) => callback());
  }
}
