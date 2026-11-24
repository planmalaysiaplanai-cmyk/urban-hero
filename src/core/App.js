import { Vector3, MathUtils } from 'three';

import { Renderer } from './Renderer.js';
import { Time } from './Time.js';
import { CameraRig } from './CameraRig.js';
import { frame } from './FrameUniforms.js';

import { Environment } from '../world/Environment.js';
import { Ground } from '../world/Ground.js';
import { DustMotes } from '../world/DustMotes.js';
import { ContactShadows } from '../world/ContactShadows.js';
import { CityWorld } from '../world/CityWorld.js';
import { DestructiblePlayground } from '../world/DestructiblePlayground.js';

import { AssetLoader } from '../loaders/AssetLoader.js';
import { CharacterController } from '../animation/CharacterController.js';

import { InputManager } from '../input/InputManager.js';
import { AimController } from '../input/AimController.js';

import { ParticleEngine } from '../particles/ParticleEngine.js';
import { LightPool } from '../effects/LightPool.js';
import { DecalSystem } from '../effects/GroundDecals.js';
import { FissureSystem } from '../effects/GroundFissures.js';
import { BurstSystem } from '../effects/BurstSphere.js';
import { CameraShake } from '../effects/CameraShake.js';
import { ScreenFlash } from '../effects/ScreenFlash.js';

import { AbilityManager } from '../abilities/AbilityManager.js';
import { PostProcessing } from '../postprocessing/PostProcessing.js';

import { HUD, LoadingScreen } from '../ui/HUD.js';
import { Editor } from '../ui/Editor.js';
import { MissionControl } from '../ui/MissionControl.js';
import { FrozenStormScenario } from '../scenarios/FrozenStormScenario.js';
import { RisingTideScenario } from '../scenarios/RisingTideScenario.js';
import { HeatlockScenario } from '../scenarios/HeatlockScenario.js';
import { EmberProtocolScenario } from '../scenarios/EmberProtocolScenario.js';
import { getScenarioConfig } from '../scenarios/catalog.js';
import { AudioDirector } from '../audio/AudioDirector.js';

import { settings, ELEMENTS } from '../config/settings.js';

const HDR_URL = './hdri/spruit_sunrise.hdr';

/**
 * Application root: owns every subsystem and the frame loop.
 *
 * The wiring is deliberately one-directional — App builds the systems, hands the
 * ability manager a context object of the shared services, and then does nothing
 * but order the per-frame updates. No subsystem reaches back into App.
 *
 * The interaction is a single loop: select and arm an ability (Q / E), swing the
 * ground arrow with the mouse, click to fire. `AimController` owns the targeting
 * and emits one `cast` event; App turns that into an ability, a heading for the
 * character and a cooldown.
 */
export class App {
  constructor(canvas) {
    this.canvas = canvas;
    const query = new URLSearchParams(window.location.search);
    this.isLabMode = query.has('lab');
    const requestedScenario = query.get('scenario');
    this.scenarioId = ['frozen', 'flood', 'heat', 'wildfire'].includes(requestedScenario)
      ? requestedScenario
      : 'frozen';
    this.scenarioConfig = getScenarioConfig(this.scenarioId);
    document.body.classList.toggle('is-showcase', !this.isLabMode);
    document.title = this.isLabMode ? 'Urban Hero | PLAN AI VFX Lab' : 'PLAN AI - Urban Resilience Lab';

    if (!this.isLabMode) {
      settings.camera.distance = Math.max(20, Math.min(36, 20 * window.innerHeight / window.innerWidth));
      settings.camera.maxDistance = 44;
      settings.camera.targetHeight = 0.9;
      settings.camera.autoFrame = 0.5;
      settings.post.bloomStrength = 0.1;
      settings.post.bloomThreshold = 0.82;
      settings.environment.floorPool = 0.94;
    } else {
      settings.camera.distance = Math.max(22, Math.min(48, 20 * window.innerHeight / window.innerWidth));
      settings.camera.maxDistance = 55;
      settings.camera.targetHeight = 1;
      settings.camera.autoFrame = 0.2;
    }

    this.time = new Time();
    this.elapsed = 0;
    this.paused = false;
    this._raf = 0;

    /**
     * Seconds left before each ability can be armed again. Per element, so
     * spending one slot never locks the other out.
     */
    this.cooldowns = new Map(ELEMENTS.map((element) => [element, 0]));

    /* ---- core ---- */
    this.renderer = new Renderer(canvas);
    this.rig = new CameraRig(canvas);
    this.camera = this.rig.camera;

    this.environment = new Environment(this.renderer, this.camera);
    this.scene = this.environment.scene;

    /* ---- world ---- */
    this.ground = new Ground(this.environment);
    this.dust = new DustMotes();
    this.contactShadows = new ContactShadows(this.renderer, { size: 2.6, height: 2.4, blur: 2.0 });

    this.scene.add(this.ground.mesh, this.dust.points, this.contactShadows.group);
    this.dust.setPixelRatio(this.renderer.gl.getPixelRatio());

    this.city = this.isLabMode ? null : new CityWorld({ scenario: this.scenarioId });
    if (this.city) this.scene.add(this.city.group);

    /* ---- shared VFX services ---- */
    this.particles = new ParticleEngine(this.scene);
    this.lights = new LightPool(this.scene);
    this.decals = new DecalSystem(this.scene);
    this.fissures = new FissureSystem(this.scene);
    this.bursts = new BurstSystem(this.scene);
    this.shake = new CameraShake(this.rig);
    this.flash = new ScreenFlash();

    this.abilities = new AbilityManager({
      scene: this.scene,
      camera: this.camera,
      environment: this.environment,
      particles: this.particles,
      lights: this.lights,
      decals: this.decals,
      fissures: this.fissures,
      bursts: this.bursts,
      shake: this.shake,
      flash: this.flash
    });

    /* ---- character ---- */
    this.character = new CharacterController(this.environment);
    if (!this.isLabMode) this.character.root.visible = false;
    this.scene.add(this.character.root);

    /* ---- input & targeting ---- */
    this.input = new InputManager(canvas);
    this.aim = new AimController(this.camera);
    this.scene.add(this.aim.object3D);

    /* ---- post ---- */
    this.post = new PostProcessing(this.renderer, this.scene, this.camera);

    /* ---- UI ---- */
    this.loading = new LoadingScreen();
    this.hud = new HUD(document.getElementById('hud'));
    this.editor = new Editor({
      onClear: () => this.clearEffects(),
      onToast: (message) => this.hud.showToast(message)
    });

    if (this.isLabMode) {
      this.editor.toggle();
      this.audio = new AudioDirector();
      this.playground = new DestructiblePlayground({
        onChange: (state) => this.hud.updatePlayground(state),
        onHit: (hit) => {
          this.hud.showPlaygroundHit(hit);
          this.audio.impact(hit);
        }
      });
      this.scene.add(this.playground.group);
      this.hud.onPlaygroundPreset = (preset) => this.resetLabTargets(preset);
      this.hud.onPlaygroundReset = () => this.resetLabTargets();
      this.hud.onEditorToggle = () => this.editor.toggle();
      this.hud.onAudioToggle = () => this.hud.setAudioEnabled(this.audio.setEnabled(!this.audio.enabled));
    }

    if (!this.isLabMode) {
      this.editor.toggle();
      document.getElementById('hud')?.classList.add('hud--showcase-hidden');
      this.missionUI = new MissionControl(
        document.getElementById('mission-control'),
        this.scenarioConfig
      );
      const scenarios = {
        frozen: FrozenStormScenario,
        flood: RisingTideScenario,
        heat: HeatlockScenario,
        wildfire: EmberProtocolScenario
      };
      const Scenario = scenarios[this.scenarioId];
      this.scenario = new Scenario({
        city: this.city,
        ui: this.missionUI,
        hazard: (element, from, to) => this.castHazard(element, from, to),
        clear: () => this.clearEffects()
      });
    }

    this._bindEvents();
    this.selectAbility(ELEMENTS[0], { silent: true });

    this._focusPoint = new Vector3();
  }

  /** The ability currently in the slot. */
  get element() {
    return this.abilities.selected;
  }

  /* ------------------------------------------------------------------ */

  _bindEvents() {
    this.renderer.onResize((width, height, pixelRatio) => {
      this.rig.resize(width, height);
      this.post.setSize(width, height, pixelRatio);
      this.dust.setPixelRatio(pixelRatio);
      if (this.isLabMode && this.playground && this.playground.preset !== 'empty') {
        settings.camera.distance = Math.max(22, Math.min(48, 20 * height / width));
      } else if (!this.isLabMode) {
        settings.camera.distance = Math.max(20, Math.min(36, 20 * height / width));
      }
    });

    this.input.on('pointer:move', (pointer) => this.aim.point(pointer));
    this.input.on('pointer:confirm', (pointer) => {
      this.aim.point(pointer);
      this.aim.confirm();
    });
    this.input.on('action', (action, slot) => this._handleAction(action, slot));

    this.aim.on('cast', (origin, direction, distance) => this._cast(origin, direction, distance));
    this.aim.on('reject', () => this.hud.showToast('Too close — aim further out'));

    this.hud.onAbility = (element) => this.armAbility(element);
  }

  _handleAction(action, slot) {
    if (!this.isLabMode && ['ability', 'cancel', 'toggleHelp', 'clear'].includes(action)) return;
    switch (action) {
      case 'ability': {
        const element = ELEMENTS[slot] ?? this.element;
        // Pressing the *same* key again puts an armed cast away, as it does in a
        // MOBA; pressing a different one swaps the slot without disarming.
        if (this.aim.isArmed && element === this.element) this.aim.cancel();
        else this.armAbility(element);
        break;
      }
      case 'cancel':
        this.aim.cancel();
        break;
      case 'toggleHelp':
        this.hud.toggleHelp();
        break;
      case 'toggleEditor':
        this.editor.toggle();
        break;
      case 'clear':
        this.clearEffects();
        this.hud.showToast('Effects cleared');
        break;
      case 'togglePause':
        this.paused = !this.paused;
        this.hud.setPaused(this.paused);
        this.hud.showToast(this.paused ? 'Paused — the editor still applies' : 'Resumed');
        break;
      default:
        break;
    }
  }

  /**
   * Put an ability in the slot. The aim indicator and the HUD both follow,
   * because `range` and `minRange` are the ability's, not the app's.
   */
  selectAbility(element, options = {}) {
    if (!ELEMENTS.includes(element)) return;
    this.abilities.select(element);
    this.aim.setElement(element);
    this.hud.setElement(element, options);
  }

  /** Select an ability and arm it, unless it is still cooling down. */
  armAbility(element = this.element) {
    if ((this.cooldowns.get(element) ?? 0) > 0) {
      this.hud.showToast('Not ready');
      return;
    }
    // Selecting before arming means the arrow is already drawn to the new
    // ability's range on the frame it appears.
    if (element !== this.element) this.selectAbility(element);
    this.aim.arm();
  }

  _cast(origin, direction, distance) {
    const element = this.element;
    const ability = this.abilities.cast(origin, direction, distance, element);
    if (ability) this.audio?.cast(element);
    this.playground?.trackCast(ability);
    this.cooldowns.set(element, Math.max(0, settings[element].cooldown));

    // Snap onto the shot and throw the body into it. Which clip that is belongs
    // to the ability, so each spell can be cast with its own gesture.
    this.character.setFacing(this.aim.facing);
    this.character.playCast(settings[element].castAnim);
    this.character.castLunge();
    return ability;
  }

  resetLabTargets(preset = this.playground?.preset) {
    if (!this.playground) return;
    this.clearEffects();
    for (const element of ELEMENTS) this.cooldowns.set(element, 0);
    this.playground.setPreset(preset);
    settings.camera.distance = preset === 'empty' ? 11.5 : Math.max(22, Math.min(48, 20 * window.innerHeight / window.innerWidth));
    this.hud.showToast(preset === 'empty' ? 'Open VFX stage ready' : 'Urban Hero training arena reset');
  }

  /** Execute an operation supplied by a scenario rather than pointer input. */
  castOperation(element, from, to) {
    if (!ELEMENTS.includes(element)) return null;
    const origin = new Vector3(from[0], 0, from[1]);
    const target = new Vector3(to[0], 0, to[1]);
    const direction = target.clone().sub(origin);
    const distance = Math.max(0.1, direction.length());
    direction.multiplyScalar(1 / distance);

    const ability = this.abilities.cast(origin, direction, distance, element);
    this.character.setFacing(Math.atan2(direction.x, direction.z));
    this.character.playCast(settings[element].castAnim);
    this.character.castLunge();
    return ability;
  }

  /** Spawn an environmental event without presenting it as a character ability. */
  castHazard(element, from, to) {
    if (!ELEMENTS.includes(element)) return null;
    const origin = new Vector3(from[0], 0, from[1]);
    const target = new Vector3(to[0], 0, to[1]);
    const direction = target.clone().sub(origin);
    const distance = Math.max(0.1, direction.length());
    direction.multiplyScalar(1 / distance);
    return this.abilities.cast(origin, direction, distance, element);
  }

  clearEffects() {
    this.aim.cancel();
    this.abilities.clear();
    this.particles.reset();
    this.decals.clear();
    this.fissures.clear();
    this.bursts.clear();
    this.lights.reset();
    this.shake.reset();
    this.flash.reset();
    this.playground?.clearCasts();
  }

  /* ------------------------------------------------------------------ */

  /** Load assets, warm the shader cache, then start the loop. */
  async load() {
    const assets = new AssetLoader();

    this.loading.setProgress(0.05, 'Loading environment...');
    const hdr = await assets.loadHDR(HDR_URL);
    await this.environment.loadEnvironment(hdr);
    frame.uEnvMap.value = this.environment.equirect;

    this.loading.setProgress(0.35, 'Mapping city surface...');
    await this.ground.loadTextures(assets);

    this.loading.setProgress(0.5, 'Connecting response operator...');
    await this.character.load(assets);

    this.loading.setProgress(0.85, 'Compiling simulation shaders...');
    // Compile everything up front so the first cast never stutters.
    await this.renderer.gl.compileAsync(this.scene, this.camera);

    this.loading.setProgress(1, 'Ready');
    this.loading.hide();

    this.start();
  }

  start() {
    this.time.reset();
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      this.frame();
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this._raf);
  }

  /* ------------------------------------------------------------------ */

  frame() {
    const gl = this.renderer.gl;
    gl.info.reset();

    const raw = this.time.tick();
    const dt = this.paused ? 0 : raw * settings.global.timeScale;
    this.elapsed += dt;
    this.missionUI?.update(raw);

    /* ---- shared uniforms ---- */
    frame.uTime.value = this.elapsed;
    frame.uDelta.value = dt;
    frame.uShaderIntensity.value = settings.global.shaderIntensity;
    frame.uGlobalGlow.value = settings.global.glow;
    frame.uCameraNear.value = this.camera.near;
    frame.uCameraFar.value = this.camera.far;

    /* ---- simulation ---- */
    this.renderer.syncSettings();

    this.environment.setFocus(
      this.isLabMode ? this.character.position.x : 0,
      this.isLabMode ? this.character.position.z : 0
    );
    this.environment.update();

    // Targeting runs on *real* time so the arrow keeps sweeping and animating
    // while the sandbox is paused — pausing freezes the effects, not the UI.
    this.aim.setOrigin(this.character.position);
    this.aim.update(raw);

    if (settings.character.turnToAim && this.aim.isArmed) {
      this.character.turnToward(this.aim.facing, settings.character.turnRate, raw);
    }
    this.character.update(dt);

    for (const [element, remaining] of this.cooldowns) {
      if (remaining > 0) this.cooldowns.set(element, Math.max(0, remaining - raw));
    }

    this.ground.update(this.elapsed);
    this.dust.update(this.elapsed, this.character.position);
    this.city?.update(this.elapsed);

    this.abilities.update(dt);
    this.playground?.update(dt, this.abilities.active);
    this.particles.flush();
    this.decals.update(dt);
    this.fissures.update(dt);
    this.bursts.update(dt);
    this.lights.update(dt);

    /* ---- camera ---- */
    const focus = this.abilities.focus;
    if (focus) this.rig.lookAt(focus.position, MathUtils.clamp(1 - focus.u * 0.4, 0, 1));
    this.rig.setAnchor(
      this.isLabMode ? this.character.position.x : 0,
      0,
      this.isLabMode ? this.character.position.z + (this.playground?.preset === 'empty' ? 0 : -4) : 0
    );
    this.shake.update(raw);
    this.flash.update(raw);
    this.rig.update(raw);

    this.contactShadows.setPosition(this.character.position.x, this.character.position.z);
    this.contactShadows.render(this.scene);

    /* ---- render ---- */
    // Exactly one cascade shadow update per frame (see Renderer).
    gl.shadowMap.needsUpdate = true;
    this.post.sync(this.elapsed, this.flash);
    this.post.render();

    /* ---- readouts ---- */
    for (const element of ELEMENTS) {
      this.hud.setCooldown(element, this.cooldowns.get(element) ?? 0, settings[element].cooldown);
    }
    this.hud.setArmed(this.aim.isArmed);
    this.hud.update(raw, () => ({
      particles: this.particles.countLive(this.elapsed),
      calls: gl.info.render.calls,
      spikes: this.abilities.active.reduce((total, ability) => total + ability.instanceCount, 0),
      abilities: this.abilities.active.length
    }));
  }

  /* ------------------------------------------------------------------ */

  dispose() {
    this.stop();
    this.scenario?.dispose();
    this.missionUI?.dispose();
    this.input.dispose();
    this.aim.dispose();
    this.abilities.dispose();
    this.particles.dispose();
    this.decals.dispose();
    this.fissures.dispose();
    this.bursts.dispose();
    this.lights.dispose();
    this.character.dispose();
    this.ground.dispose();
    this.city?.dispose();
    this.playground?.dispose();
    this.audio?.dispose();
    this.dust.dispose();
    this.contactShadows.dispose();
    this.post.dispose();
    this.environment.dispose();
    this.editor.dispose();
    this.rig.dispose();
    this.renderer.dispose();
  }
}
