/** Small synthesized soundtrack: no downloads, autoplay requests, or licensed files. */
export class AudioDirector {
  constructor() {
    this.enabled = true;
    this.context = null;
    this.musicTimer = null;
    this.chord = 0;
    this.lastTargetSound = 0;
    this._unlock = () => this.unlock();
    this._visibility = () => {
      if (document.hidden) this.context?.suspend();
      else if (this.enabled) this.context?.resume();
    };
    document.addEventListener('pointerdown', this._unlock, { once: true });
    document.addEventListener('keydown', this._unlock, { once: true });
    document.addEventListener('visibilitychange', this._visibility);
  }

  unlock() {
    if (!this.enabled || this.context) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.45;
    this.master.connect(this.context.destination);
    this.music = this.context.createGain();
    this.music.gain.value = 0.24;
    this.music.connect(this.master);
    this.context.resume();
    this._musicPhrase();
    this.musicTimer = window.setInterval(() => this._musicPhrase(), 4800);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) {
      if (!this.context) this.unlock();
      else this.context.resume();
    } else {
      this.context?.suspend();
    }
    return this.enabled;
  }

  _tone({ wave = 'sine', from, to = from, duration, volume, destination = this.master, delay = 0 }) {
    if (!this.context || !this.enabled) return;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(Math.max(20, from), now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), now + Math.min(0.05, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  _noise(duration, volume, cutoff = 1200, endCutoff = cutoff, delay = 0) {
    if (!this.context || !this.enabled) return;
    const context = this.context;
    const samples = Math.ceil(context.sampleRate * duration);
    const buffer = context.createBuffer(1, samples, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = 'lowpass';
    const now = context.currentTime + delay;
    filter.frequency.setValueAtTime(cutoff, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, endCutoff), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), now + Math.min(0.025, duration * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(now);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  cast(element) {
    if (!this.context || !this.enabled) return;
    switch (element) {
      case 'ice':
        this._tone({ wave: 'sine', from: 520, to: 1120, duration: 0.18, volume: 0.1 });
        this._tone({ wave: 'triangle', from: 1040, to: 740, duration: 0.28, volume: 0.055, delay: 0.07 });
        break;
      case 'thunder':
        this._noise(0.12, 0.19, 5000, 900);
        this._tone({ wave: 'sawtooth', from: 180, to: 72, duration: 0.2, volume: 0.11 });
        break;
      case 'meteor':
        this._tone({ wave: 'sawtooth', from: 92, to: 55, duration: 0.38, volume: 0.13 });
        this._noise(0.3, 0.12, 180, 700);
        break;
      case 'beam':
        this._tone({ wave: 'sine', from: 180, to: 790, duration: 0.4, volume: 0.12 });
        this._tone({ wave: 'triangle', from: 370, to: 1050, duration: 0.48, volume: 0.06 });
        break;
      case 'snare':
        this._tone({ wave: 'square', from: 280, to: 630, duration: 0.16, volume: 0.075 });
        this._tone({ wave: 'square', from: 420, to: 190, duration: 0.2, volume: 0.06, delay: 0.13 });
        break;
      case 'glacier':
        this._tone({ wave: 'sine', from: 300, to: 660, duration: 0.36, volume: 0.09 });
        this._noise(0.32, 0.08, 2200, 4200);
        break;
    }
  }

  travel(element) {
    if (!this.context || !this.enabled) return;
    switch (element) {
      case 'ice':
        this._noise(0.5, 0.065, 3300, 6200);
        break;
      case 'thunder':
        this._noise(0.34, 0.1, 6500, 1600);
        this._tone({ wave: 'sawtooth', from: 260, to: 540, duration: 0.3, volume: 0.04 });
        break;
      case 'meteor':
        this._noise(0.72, 0.18, 300, 1450);
        this._tone({ wave: 'sawtooth', from: 125, to: 52, duration: 0.68, volume: 0.12 });
        break;
      case 'beam':
        this._tone({ wave: 'sine', from: 700, to: 890, duration: 0.75, volume: 0.085 });
        this._noise(0.62, 0.045, 2500, 4500);
        break;
      case 'snare':
        this._noise(0.38, 0.09, 4200, 850);
        this._tone({ wave: 'square', from: 450, to: 220, duration: 0.32, volume: 0.04 });
        break;
      case 'glacier':
        this._noise(0.85, 0.1, 2100, 5000);
        this._tone({ wave: 'sine', from: 580, to: 360, duration: 0.8, volume: 0.055 });
        break;
    }
  }

  powerImpact(element) {
    if (!this.context || !this.enabled) return;
    switch (element) {
      case 'ice':
        this._noise(0.42, 0.16, 6600, 1800);
        this._tone({ wave: 'triangle', from: 1400, to: 270, duration: 0.35, volume: 0.11 });
        break;
      case 'thunder':
        this._noise(0.58, 0.28, 6500, 450);
        this._tone({ wave: 'sawtooth', from: 210, to: 45, duration: 0.52, volume: 0.19 });
        break;
      case 'meteor':
        this._noise(0.9, 0.3, 900, 130);
        this._tone({ wave: 'sawtooth', from: 110, to: 32, duration: 0.8, volume: 0.25 });
        break;
      case 'beam':
        this._tone({ wave: 'sine', from: 1060, to: 210, duration: 0.78, volume: 0.17 });
        this._noise(0.7, 0.13, 4000, 800);
        break;
      case 'snare':
        this._noise(0.46, 0.21, 5600, 750);
        this._tone({ wave: 'square', from: 680, to: 90, duration: 0.43, volume: 0.1 });
        break;
      case 'glacier':
        this._noise(0.85, 0.18, 6500, 1100);
        this._tone({ wave: 'triangle', from: 760, to: 110, duration: 0.77, volume: 0.14 });
        this._tone({ wave: 'sine', from: 1120, to: 450, duration: 0.64, volume: 0.06, delay: 0.08 });
        break;
    }
  }

  targetHit({ destroyed, frozen, kind }) {
    if (!this.context || !this.enabled) return;
    const now = performance.now();
    if (now - this.lastTargetSound < (destroyed ? 120 : 180)) return;
    this.lastTargetSound = now;
    if (destroyed) {
      const tree = kind === 'tree';
      this._noise(tree ? 0.62 : 0.9, tree ? 0.16 : 0.23, tree ? 1700 : 1100, tree ? 180 : 110);
      this._tone({ wave: 'triangle', from: tree ? 145 : 100, to: 34, duration: tree ? 0.55 : 0.82, volume: tree ? 0.17 : 0.25 });
      this._noise(0.25, 0.085, frozen ? 5400 : 1900, 450, 0.16);
    } else {
      this._noise(0.19, frozen ? 0.1 : 0.075, frozen ? 4600 : 1000, 350);
      this._tone({ wave: 'triangle', from: frozen ? 620 : 180, to: frozen ? 170 : 75, duration: 0.2, volume: 0.07 });
    }
  }

  _musicPhrase() {
    if (!this.context || !this.enabled) return;
    const roots = [55, 65.41, 49, 73.42];
    const root = roots[this.chord++ % roots.length];
    for (const [interval, volume] of [[1, 0.11], [1.5, 0.055], [2, 0.07], [3, 0.035]]) {
      this._tone({ wave: 'sine', from: root * interval, duration: 6.2, volume, destination: this.music });
    }
    this._tone({ wave: 'triangle', from: root * 4, to: root * 3, duration: 2.2, volume: 0.025, destination: this.music, delay: 1.2 });
  }

  dispose() {
    document.removeEventListener('pointerdown', this._unlock);
    document.removeEventListener('keydown', this._unlock);
    document.removeEventListener('visibilitychange', this._visibility);
    window.clearInterval(this.musicTimer);
    this.context?.close();
  }
}
