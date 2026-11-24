import { ELEMENTS, ELEMENT_META } from '../config/settings.js';
import { ELEMENT_SIGILS } from './glyphs.js';

/**
 * Heads-up display: the ability bar, controls, live stats and toasts.
 *
 * Plain DOM — no framework. The bar is built from `ELEMENTS`, so a new ability
 * appears in it on its own; the slots are the only interactive part, and they
 * mirror the keyboard shortcuts through `onAbility`.
 *
 * The cooldown sweep is a `conic-gradient` driven by a CSS custom property, so
 * updating it every frame is one `setProperty` call and never touches layout.
 */
export class HUD {
  constructor(root) {
    this.root = root;
    this.onAbility = null;
    this.onPlaygroundPreset = null;
    this.onPlaygroundReset = null;
    this.onEditorToggle = null;
    this.onAudioToggle = null;
    this._toastTimer = 0;
    this._statsAccumulator = 0;
    this._frames = 0;
    this._fps = 0;
    /** Last sweep ratio pushed to the DOM, per element. */
    this._cooldownShown = new Map();
    this._armedShown = null;

    root.innerHTML = `
      <div class="hud__panel hud__title">
        Urban Hero
        <span data-blurb>Press Q, E, R, F, V or X, aim, click to cast.</span>
      </div>

      <nav class="hud__scenario-nav" aria-label="PLAN AI demos">
        <span>PLAN AI demos</span>
        <a href="?scenario=frozen" data-short="01">01 Frost</a>
        <a href="?scenario=flood" data-short="02">02 Flood</a>
        <a href="?scenario=heat" data-short="03">03 Heat</a>
        <a href="?scenario=wildfire" data-short="04">04 Fire</a>
      </nav>

      <section class="hud__playground" aria-label="Urban Hero training arena">
        <div class="hud__playground-header">
          <strong>Urban Hero / Training grounds</strong>
          <div class="hud__playground-tools">
            <button type="button" data-audio-toggle aria-label="Enable sound" aria-pressed="false">Enable sound</button>
            <button type="button" data-playground-collapse aria-label="Minimize arena menu" aria-expanded="true">−</button>
          </div>
        </div>
        <div class="hud__playground-body">
        <label for="playground-preset">Choose your arena</label>
        <select id="playground-preset" data-playground-preset>
          <option value="city">Demolition District</option>
          <option value="forest">Forest Training</option>
          <option value="corridor">Clear the Rescue Route</option>
          <option value="empty">Empty VFX Stage</option>
        </select>
        <p data-playground-goal>Clear derelict training blocks for a city renewal project.</p>
        <div class="hud__playground-score"><span><small>Targets cleared</small><strong data-playground-cleared>0 / 12</strong></span><span><small>Total damage</small><strong data-playground-damage>0</strong></span></div>
        <p class="hud__playground-tip">Pick a power, aim at a target and click. Freeze first, then shatter for 1.5x damage.</p>
        <div class="hud__playground-actions"><button type="button" data-playground-reset>Reset targets</button><button type="button" data-playground-editor>VFX editor / G</button></div>
        <output data-playground-feedback aria-live="polite">Training props only / no civilians</output>
        </div>
      </section>

      <div class="hud__panel hud__stats">
        <div>FPS <b data-stat="fps">—</b></div>
        <div>Particles <b data-stat="particles">0</b></div>
        <div>Instances <b data-stat="spikes">0</b></div>
        <div>Draw calls <b data-stat="calls">0</b></div>
      </div>

      <div class="hud__panel hud__help">
        <div><strong>Q</strong> — Frost Lance &nbsp; <strong>E</strong> — Storm Lance</div>
        <div><strong>R</strong> — Cinder Fall &nbsp; <strong>F</strong> — Nova Beam</div>
        <div><strong>V</strong> — Voltaic Snare &nbsp; <strong>X</strong> — Glacial Crown</div>
        <div class="hud__help-note">V and X are far casts — aimed with a circle, not an arrow.</div>
        <div><strong>Move</strong> — aim &nbsp; <strong>Left click</strong> — cast</div>
        <div><strong>Esc / right click</strong> — cancel the cast</div>
        <div><strong>Right drag</strong> — orbit &nbsp; <strong>Scroll</strong> — zoom</div>
        <div style="margin-top:6px">
          <kbd>G</kbd> editor &nbsp; <kbd>P</kbd> pause &nbsp; <kbd>C</kbd> clear
        </div>
        <div><kbd>H</kbd> hide this</div>
        <div class="hud__help-note">Paused still applies every editor change.</div>
      </div>

      <div class="hud__abilities">
        ${ELEMENTS.map((element) => {
          const meta = ELEMENT_META[element];
          return `
            <div class="ability-card" data-element="${element}" style="--accent:${meta.accent}">
              <div class="ability-card__sweep" data-sweep></div>
              <div class="ability-card__key">${meta.key}</div>
              <div class="ability-card__glyph">${ELEMENT_SIGILS[element] ?? ''}</div>
              <div class="ability-card__label">${meta.label}</div>
            </div>`;
        }).join('')}
      </div>

      <div class="hud__toast" data-toast></div>
      <div class="hud__paused" data-paused>Paused</div>
    `;

    this.cards = new Map();
    root.querySelector('.hud__scenario-nav')?.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });
    root.querySelector('.hud__playground').addEventListener('pointerdown', (event) => event.stopPropagation());
    root.querySelector('[data-playground-collapse]').addEventListener('click', (event) => {
      const collapsed = root.querySelector('.hud__playground').classList.toggle('is-collapsed');
      event.currentTarget.textContent = collapsed ? '+' : '−';
      event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
      event.currentTarget.setAttribute('aria-label', collapsed ? 'Expand arena menu' : 'Minimize arena menu');
    });
    root.querySelector('[data-audio-toggle]').addEventListener('click', () => this.onAudioToggle?.());
    root.querySelector('[data-playground-preset]').addEventListener('change', (event) => this.onPlaygroundPreset?.(event.target.value));
    root.querySelector('[data-playground-reset]').addEventListener('click', () => this.onPlaygroundReset?.());
    root.querySelector('[data-playground-editor]').addEventListener('click', () => this.onEditorToggle?.());
    for (const card of root.querySelectorAll('.ability-card')) {
      this.cards.set(card.dataset.element, card);
      card.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        this.onAbility?.(card.dataset.element);
      });
    }

    this.stats = {
      fps: root.querySelector('[data-stat="fps"]'),
      particles: root.querySelector('[data-stat="particles"]'),
      spikes: root.querySelector('[data-stat="spikes"]'),
      calls: root.querySelector('[data-stat="calls"]')
    };
    this.help = root.querySelector('.hud__help');
    this.toast = root.querySelector('[data-toast]');
    this.pausedBadge = root.querySelector('[data-paused]');
    this.abilityBar = root.querySelector('.hud__abilities');
  }

  updatePlayground(state) {
    this.root.querySelector('[data-playground-goal]').textContent = state.goal;
    this.root.querySelector('[data-playground-cleared]').textContent = `${state.destroyed} / ${state.total}`;
    this.root.querySelector('[data-playground-damage]').textContent = Math.round(state.damage).toLocaleString('en-US');
    this.root.querySelector('[data-playground-preset]').value = state.preset;
    if (state.hits === 0) this.root.querySelector('[data-playground-feedback]').textContent = 'Pick a power and aim at the target rings';
    if (state.total > 0 && state.destroyed === state.total) {
      this.root.querySelector('[data-playground-feedback]').textContent = 'Arena cleared! Reset targets or try another arena.';
    }
  }

  showPlaygroundHit(hit) {
    const cleared = this.root.querySelector('[data-playground-cleared]').textContent.split(' / ');
    if (cleared[0] === cleared[1]) return;
    this.root.querySelector('[data-playground-feedback]').textContent = `${ELEMENT_META[hit.element].label} / ${hit.damage} damage / ${hit.destroyed ? 'Target cleared' : hit.frozen ? 'Frozen: follow up to shatter' : 'Target damaged'}`;
  }

  setAudioEnabled(enabled) {
    const button = this.root.querySelector('[data-audio-toggle]');
    button.textContent = enabled ? 'Sound on' : 'Sound off';
    button.setAttribute('aria-label', enabled ? 'Mute audio' : 'Enable audio');
    button.setAttribute('aria-pressed', String(enabled));
  }

  /** @param {{silent?: boolean}} [options] */
  setElement(element, options = {}) {
    for (const [key, card] of this.cards) {
      card.classList.toggle('is-active', key === element);
    }
    const meta = ELEMENT_META[element];
    if (meta && !options.silent) this.showToast(`${meta.hint} selected`);
  }

  /** Highlight the slot while a cast is armed. */
  setArmed(armed) {
    if (armed === this._armedShown) return;
    this._armedShown = armed;
    this.abilityBar.classList.toggle('is-armed', armed);
  }

  /**
   * Drive one slot's cooldown sweep. Cooldowns are per ability, so this is
   * called once per element each frame.
   *
   * @param {string} element
   * @param {number} remaining seconds left
   * @param {number} total     the full cooldown, for the sweep angle
   */
  setCooldown(element, remaining, total) {
    const card = this.cards.get(element);
    if (!card) return;

    const ratio = Math.max(0, Math.min(1, remaining / Math.max(total, 0.001)));
    // Only touch the DOM when the sweep visibly moves.
    if (Math.abs(ratio - (this._cooldownShown.get(element) ?? -1)) < 0.01) return;
    this._cooldownShown.set(element, ratio);
    card.style.setProperty('--cooldown', ratio);
    card.classList.toggle('is-cooling', ratio > 0.001);
  }

  setPaused(paused) {
    this.pausedBadge.classList.toggle('is-visible', paused);
  }

  toggleHelp() {
    this.help.classList.toggle('is-hidden');
  }

  showToast(message, duration = 1600) {
    this.toast.textContent = message;
    this.toast.classList.add('is-visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toast.classList.remove('is-visible'), duration);
  }

  /**
   * @param {number} dt
   * @param {() => {particles:number, spikes:number, calls:number}} collect
   *   Called only when the readout actually refreshes, so gathering the numbers
   *   (which means walking the particle pools) stays off the hot path.
   */
  update(dt, collect) {
    this._frames++;
    this._statsAccumulator += dt;
    if (this._statsAccumulator < 0.4) return;

    this._fps = Math.round(this._frames / this._statsAccumulator);
    this._frames = 0;
    this._statsAccumulator = 0;

    const info = collect();
    this.stats.fps.textContent = this._fps;
    this.stats.particles.textContent = info.particles;
    this.stats.spikes.textContent = info.spikes;
    this.stats.calls.textContent = info.calls;
  }
}

/** Boot screen helper. */
export class LoadingScreen {
  constructor() {
    this.element = document.getElementById('loader');
    this.fill = document.getElementById('loader-fill');
    this.status = document.getElementById('loader-status');
  }

  setProgress(ratio, message) {
    this.fill.style.width = `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`;
    if (message) this.status.textContent = message;
  }

  hide() {
    this.setProgress(1);
    setTimeout(() => this.element.classList.add('is-hidden'), 220);
  }

  fail(message) {
    this.status.textContent = message;
    this.status.style.color = '#ff7a6a';
  }
}
