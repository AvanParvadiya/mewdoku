class AudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private init() {
    if (!this.ctx) {
      // Use standard or webkit AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted() {
    return this.muted;
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (cozy arpeggio)
    
    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);

      gain.gain.setValueAtTime(0.08, now + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.15);
    });
  }

  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Sad, lower-pitched double chime
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.linearRampToValueAtTime(150, now + 0.2); // slide down

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Synthesizes a cute "meow" sound using a frequency-sweeping oscillator and bandpass filters.
   */
  playMeow() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.35;

    // Create oscillator and modulator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    
    // Meow frequency sweep: start low, sweep up quickly, then slide down gently
    // Represents: "M - E - O - W"
    osc.frequency.setValueAtTime(320, now); // start around E4
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.08); // curve up to C5
    osc.frequency.exponentialRampToValueAtTime(380, now + duration); // slide down to G4

    // Bandpass filter gives it that vowel "yowl" / vocal tract quality
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2, now);
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
    filter.frequency.linearRampToValueAtTime(600, now + duration);

    // Cute envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.05); // quick fade in
    gain.gain.linearRampToValueAtTime(0.1, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // gentle fade out

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const rootNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    
    // Play a happy arpeggio followed by a meow!
    rootNotes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.07);

      gain.gain.setValueAtTime(0.08, now + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.25);
    });

    // Play a happy meow at the end of the arpeggio
    setTimeout(() => {
      if (!this.muted) this.playMeow();
    }, 550);
  }
}

export const audio = new AudioEngine();
