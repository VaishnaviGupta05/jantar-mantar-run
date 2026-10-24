export class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  init(): void {
    if (!this.ctx) {
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;
      this.ctx = new AudioCtor();
    }
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  playTone(frequency = 220, duration = 0.08, type: OscillatorType = 'square', gainValue = 0.03): void {
    if (!this.enabled || !this.ctx) return;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = gainValue;
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + duration);
  }

  playPickup(): void {
    this.playTone(660, 0.09, 'triangle', 0.06);
  }

  playJump(): void {
    this.playTone(420, 0.12, 'sawtooth', 0.05);
  }

  playImpact(): void {
    this.playTone(90, 0.18, 'square', 0.05);
  }

  playSafeZone(): void {
    this.playTone(880, 0.12, 'triangle', 0.07);
  }
}
