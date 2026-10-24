export type EventName =
  | 'game:start'
  | 'game:pause'
  | 'game:resume'
  | 'game:restart'
  | 'game:results'
  | 'game:over'
  | 'hud:update'
  | 'state:change'
  | 'collectible:pickup'
  | 'safezone:trigger'
  | 'audio:toggle';

export class EventBus {
  private emitter = new EventTarget();

  emit<T>(eventName: EventName, detail?: T): void {
    this.emitter.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  on<T>(eventName: EventName, callback: (detail: T) => void): () => void {
    const handler = (event: Event) => {
      callback((event as CustomEvent<T>).detail as T);
    };

    this.emitter.addEventListener(eventName, handler);
    return () => this.emitter.removeEventListener(eventName, handler);
  }
}
