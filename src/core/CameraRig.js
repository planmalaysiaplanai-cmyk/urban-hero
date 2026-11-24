import { PerspectiveCamera, Vector3, MathUtils, MOUSE, TOUCH } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { settings } from '../config/settings.js';
import { clamp, damp } from '../utils/math.js';
import { LAYER } from './Layers.js';

const _dir = new Vector3();
const _desiredTarget = new Vector3();

/**
 * Third-person orbit rig.
 *
 * - Left mouse is reserved for drawing, so orbiting is bound to right-drag.
 * - The distance always resolves back to `settings.camera.distance`, so framing
 *   stays consistent no matter where the orbit target drifts. The wheel zooms by
 *   writing that same setting, which means zoom keeps working while the rig is
 *   following an ability, and the editor slider stays the single source of truth.
 * - The rig gently drifts its look-at point toward whatever ability is casting.
 */
export class CameraRig {
  constructor(domElement) {
    this.camera = new PerspectiveCamera(
      settings.camera.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    this.camera.position.set(-6.5, 6.0, 9.5);
    this.camera.layers.enable(LAYER.VFX);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.enablePan = false;
    this.controls.enableZoom = false; // the wheel drives `settings.camera.distance` instead
    this.controls.minPolarAngle = settings.camera.minPolar;
    this.controls.maxPolarAngle = settings.camera.maxPolar;
    this.controls.rotateSpeed = 0.65;

    // Free the left button for path drawing.
    this.controls.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: MOUSE.ROTATE };
    // Touch is the mobile equivalent of right-drag: one finger orbits, while
    // two fingers orbit and dolly without competing with tap-to-cast input.
    this.controls.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE };

    this.anchor = new Vector3(0, 0, 0); // the character
    this.focus = new Vector3(0, 0, 0); // point of interest (ability head)
    this.focusWeight = 0;
    this.shakeOffset = new Vector3();
    this.shakeRoll = 0;

    this.controls.target.set(0, settings.camera.targetHeight, 0);
    this.controls.update();

    // Actual distance, eased toward `settings.camera.distance` so a wheel flick
    // glides instead of snapping.
    this.distance = settings.camera.distance;

    this.domElement = domElement;
    this._onWheel = this._onWheel.bind(this);
    this._touchPoints = new Map();
    this._pinchStart = null;
    this._onTouchPointerDown = this._onTouchPointerDown.bind(this);
    this._onTouchPointerMove = this._onTouchPointerMove.bind(this);
    this._onTouchPointerUp = this._onTouchPointerUp.bind(this);
    domElement.addEventListener('wheel', this._onWheel, { passive: false });
    domElement.addEventListener('pointerdown', this._onTouchPointerDown);
    window.addEventListener('pointermove', this._onTouchPointerMove);
    window.addEventListener('pointerup', this._onTouchPointerUp);
    window.addEventListener('pointercancel', this._onTouchPointerUp);
  }

  /** Wheel zoom. Multiplicative, so each notch feels the same at any distance. */
  _onWheel(event) {
    event.preventDefault();

    const cam = settings.camera;
    // Firefox reports lines (deltaMode 1) and pages (2) rather than pixels.
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
    const delta = (event.deltaY * scale) / 100;

    cam.distance = clamp(
      cam.distance * Math.exp(delta * 0.12 * cam.zoomSpeed),
      cam.minDistance,
      cam.maxDistance
    );
  }

  _onTouchPointerDown(event) {
    if (event.pointerType !== 'touch') return;
    this._touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this._touchPoints.size === 2) {
      this._pinchStart = {
        distance: this._touchDistance(),
        cameraDistance: settings.camera.distance
      };
    }
  }

  _onTouchPointerMove(event) {
    const point = this._touchPoints.get(event.pointerId);
    if (!point) return;
    point.x = event.clientX;
    point.y = event.clientY;
    if (!this._pinchStart || this._touchPoints.size < 2) return;

    const distance = Math.max(1, this._touchDistance());
    const cam = settings.camera;
    // Fingers moving apart zoom in; moving together zooms out.
    cam.distance = clamp(
      this._pinchStart.cameraDistance * this._pinchStart.distance / distance,
      cam.minDistance,
      cam.maxDistance
    );
  }

  _onTouchPointerUp(event) {
    if (event.pointerType !== 'touch') return;
    this._touchPoints.delete(event.pointerId);
    this._pinchStart = this._touchPoints.size === 2
      ? { distance: this._touchDistance(), cameraDistance: settings.camera.distance }
      : null;
  }

  _touchDistance() {
    const points = [...this._touchPoints.values()];
    if (points.length < 2) return 0;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  /** Point the rig should orbit around (character position). */
  setAnchor(x, y, z) {
    this.anchor.set(x, y, z);
  }

  /** Nudge the look-at point toward an ability. `weight` 0..1, decays on its own. */
  lookAt(point, weight = 1) {
    this.focus.copy(point);
    this.focusWeight = Math.max(this.focusWeight, weight);
  }

  update(dt) {
    const cam = settings.camera;

    if (this.camera.fov !== cam.fov) {
      this.camera.fov = cam.fov;
      this.camera.updateProjectionMatrix();
    }
    this.controls.minPolarAngle = cam.minPolar;
    this.controls.maxPolarAngle = cam.maxPolar;

    // Blend the orbit target between the character and any active ability.
    const blend = MathUtils.clamp(this.focusWeight * cam.autoFrame, 0, 0.85);
    _desiredTarget.copy(this.anchor);
    _desiredTarget.y += cam.targetHeight;
    _desiredTarget.lerp(this.focus, blend);

    this.controls.target.set(
      damp(this.controls.target.x, _desiredTarget.x, cam.damping, dt),
      damp(this.controls.target.y, _desiredTarget.y, cam.damping, dt),
      damp(this.controls.target.z, _desiredTarget.z, cam.damping, dt)
    );

    this.focusWeight = damp(this.focusWeight, 0, 0.08, dt);

    this.controls.update();

    // Enforce the orbit distance (zoom and the editor slider both land here).
    this.distance = damp(this.distance, cam.distance, cam.zoomDamping, dt);
    _dir.copy(this.camera.position).sub(this.controls.target);
    const len = _dir.length() || 1;
    _dir.multiplyScalar(1 / len);
    this.camera.position.copy(this.controls.target).addScaledVector(_dir, this.distance);

    // Camera shake is additive and applied after the controls have settled.
    if (this.shakeOffset.lengthSq() > 0) {
      this.camera.position.add(this.shakeOffset);
      this.camera.rotateZ(this.shakeRoll);
    }
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.domElement.removeEventListener('wheel', this._onWheel);
    this.domElement.removeEventListener('pointerdown', this._onTouchPointerDown);
    window.removeEventListener('pointermove', this._onTouchPointerMove);
    window.removeEventListener('pointerup', this._onTouchPointerUp);
    window.removeEventListener('pointercancel', this._onTouchPointerUp);
    this.controls.dispose();
  }
}
