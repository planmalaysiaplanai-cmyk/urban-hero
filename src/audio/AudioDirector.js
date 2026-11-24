const POWER_VOICES = {
  ice: { wave: 'triangle', from: 920, to: 240, duration: 0.38, noise: 0.08 },
  thunder: { wave: 'sawtooth', from: 125, to: 58, duration: 0.58, noise: 0.2 },
  meteor: { wave: 'sawtooth', from: 340, to: 42, duration: 0.75, noise: 0.26 },
  beam: { wave: 'sine', from: 180, to: 850, duration: 0.62, noise: 0.07 },
  snare: { wave: 'square', from: 600, to: 95, duration: 0.48, noise: 0.12 },
  glacier: { wave: 'triangle', from: 460, to: 115, duration: 0.9, noise: 0.16 }
};

/** Small synthesized soundtrack: no downloads, autoplay requests, or licensed files. */
export class AudioDirector {
  constructor() {
    this.enabled = true;
    this.context = null;
    this.musicTimer = null;
    this.chord = 0;
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

  _noise(duration, volume, cutoff = 1200) {
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
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  cast(element) {
    const voice = POWER_VOICES[element];
    if (!voice || !this.enabled) return;
    this._tone({ ...voice, volume: 0.18 });
    this._tone({ ...voice, from: voice.from * 1.51, to: voice.to * 1.2, volume: 0.055, delay: 0.06 });
    this._noise(voice.duration * 0.7, voice.noise, element === 'ice' || element === 'glacier' ? 3200 : 900);
  }

  impact({ destroyed, frozen }) {
    if (!this.enabled) return;
    this._tone({ wave: 'triangle', from: destroyed ? 115 : 210, to: destroyed ? 38 : 75, duration: destroyed ? 0.8 : 0.27, volume: destroyed ? 0.3 : 0.12 });
    this._noise(destroyed ? 0.85 : 0.22, destroyed ? 0.22 : 0.08, frozen ? 3500 : 650);
    if (destroyed) this._tone({ wave: 'sine', from: 560, to: 160, duration: 0.38, volume: 0.07, delay: 0.13 });
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
