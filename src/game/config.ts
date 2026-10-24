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

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playPickup(): void {
    this.playTone(660, 0.08, 'triangle', 0.05);
  }

  playJump(): void {
    this.playTone(420, 0.12, 'sawtooth', 0.04);
  }

  playImpact(): void {
    this.playTone(90, 0.16, 'square', 0.05);
  }

  playSafeZone(): void {
    this.playTone(880, 0.14, 'triangle', 0.06);
  }
}
