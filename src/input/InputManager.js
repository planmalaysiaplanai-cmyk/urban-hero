import { Vector2 } from 'three';
import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Normalises pointer + keyboard input into a small event vocabulary.
 *
 * Events:
 *   `pointer:move` (ndc)          — every move, armed or not
 *   `pointer:confirm` (ndc)       — left click on the viewport
 *   `action` (name, slot)         — everything else, already named by intent.
 *                                   `ability` carries the 0-based slot index,
 *                                   which App maps through `ELEMENTS`.
 *
 * Pointer events that begin on top of DOM UI (the editor, the HUD) are ignored
 * so dragging a slider never fires the ability.
 */
export class InputManager extends EventEmitter {
  constructor(domElement) {
    super();
    this.dom = domElement;
    this.pointer = new Vector2(); // NDC
    this.keys = new Set();
    this.enabled = true;
    this._gesture = null;

    this._bind();
  }

  _bind() {
    this.dom.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerCancel);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.dom.addEventListener('contextmenu', this._onContextMenu);
  }

  _onContextMenu = (event) => event.preventDefault();

  _updatePointer(event) {
    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
  }

  _onPointerDown = (event) => {
    if (!this.enabled) return;
    if (event.target !== this.dom) return; // started on UI

    this._updatePointer(event);

    if (event.button === 0) {
      this._gesture = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        moved: false
      };
    } else if (event.button === 2) {
      // Right button also orbits (OrbitControls owns the drag); putting an armed
      // cast away on the same press is the convention players expect.
      this.emit('action', 'cancel');
    }
  };

  _onPointerUp = (event) => {
    const gesture = this._gesture;
    if (!gesture || gesture.id !== event.pointerId) return;

    this._updatePointer(event);
    this._gesture = null;

    // A tap confirms an armed cast. A drag belongs to OrbitControls, which
    // handles one-finger touch orbiting without spending the ability.
    if (!gesture.moved && event.button === 0) {
      this.emit('pointer:confirm', this.pointer);
    }
  };

  _onPointerCancel = (event) => {
    if (this._gesture?.id === event.pointerId) this._gesture = null;
  };

  _onPointerMove = (event) => {
    this._updatePointer(event);
    if (this._gesture?.id === event.pointerId) {
      const dx = event.clientX - this._gesture.x;
      const dy = event.clientY - this._gesture.y;
      this._gesture.moved = this._gesture.moved || dx * dx + dy * dy > 64;
    }
    this.emit('pointer:move', this.pointer);
  };

  _onKeyDown = (event) => {
    if (event.repeat) return;
    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;

    this.keys.add(event.code);

    switch (event.code) {
      // Ability slots. Keep these in step with `ELEMENT_META[...].key`.
      case 'KeyQ':
      case 'Digit1':
        this.emit('action', 'ability', 0);
        break;
      case 'KeyE':
      case 'Digit2':
        this.emit('action', 'ability', 1);
        break;
      case 'KeyR':
      case 'Digit3':
        this.emit('action', 'ability', 2);
        break;
      case 'KeyF':
      case 'Digit4':
        this.emit('action', 'ability', 3);
        break;
      case 'KeyV':
      case 'Digit5':
        this.emit('action', 'ability', 4);
        break;
      case 'KeyX':
      case 'Digit6':
        this.emit('action', 'ability', 5);
        break;
      case 'Escape':
        this.emit('action', 'cancel');
        break;
      case 'KeyH':
        this.emit('action', 'toggleHelp');
        break;
      case 'KeyG':
        this.emit('action', 'toggleEditor');
        break;
      case 'KeyC':
        this.emit('action', 'clear');
        break;
      case 'KeyP':
        this.emit('action', 'togglePause');
        break;
      default:
        break;
    }
  };

  _onKeyUp = (event) => {
    this.keys.delete(event.code);
  };

  dispose() {
    this.dom.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointercancel', this._onPointerCancel);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.dom.removeEventListener('contextmenu', this._onContextMenu);
    this.clear();
  }
}
