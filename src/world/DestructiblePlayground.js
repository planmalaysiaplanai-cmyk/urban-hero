import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, RingGeometry, Vector3 } from 'three';
import { hitsTarget, resolveDamage } from './PlaygroundCombat.js';

export const PLAYGROUND_PRESETS = {
  city: { label: 'Demolition District', goal: 'Clear derelict training blocks for a city renewal project.' },
  forest: { label: 'Forest Training', goal: 'Clear simulated damaged trees to create a fire-response corridor.' },
  corridor: { label: 'Clear the Rescue Route', goal: 'Remove fallen trees, damaged structures and roadblocks for emergency access.' },
  empty: { label: 'Empty VFX Stage', goal: 'Original open stage. Experiment with effects without targets.' }
};

const COLORS = { ice: '#75dfff', thunder: '#a6caff', meteor: '#ff773e', beam: '#ffe69c', snare: '#c6a4ff', glacier: '#8bfff0' };

export class DestructiblePlayground {
  constructor({ onChange = () => {}, onHit = () => {} } = {}) {
    this.group = new Group();
    this.group.name = 'Urban Hero Playground';
    this.onChange = onChange;
    this.onHit = onHit;
    this.casts = new Map();
    this.resources = new Set();
    this.targets = [];
    this.setPreset('city');
  }

  _resource(value) { this.resources.add(value); return value; }

  setPreset(preset) {
    if (!PLAYGROUND_PRESETS[preset]) return;
    for (const resource of this.resources) resource.dispose();
    this.resources.clear();
    this.group.clear();
    this.casts.clear();
    this.targets = [];
    this.preset = preset;
    this.stats = { destroyed: 0, hits: 0, damage: 0, casts: 0 };
    this.box = this._resource(new BoxGeometry(1, 1, 1));
    this.cone = this._resource(new CylinderGeometry(0, 0.7, 1.6, 7));
    this.ring = this._resource(new RingGeometry(0.94, 1, 40));
    this.lineMaterial = this._resource(new MeshBasicMaterial({ color: '#54d5e5', transparent: true, opacity: 0.35 }));

    if (preset !== 'empty') {
      const pad = new Mesh(this.box, this._resource(new MeshStandardMaterial({ color: '#17272e', roughness: 0.9 })));
      pad.scale.set(16, 0.08, 12);
      pad.position.set(0, -0.055, -6.8);
      pad.receiveShadow = true;
      this.group.add(pad);
      for (const x of [-6.5, -3.2, 0, 3.2, 6.5]) {
        const stripe = new Mesh(this.box, this.lineMaterial);
        stripe.scale.set(0.025, 0.01, 11.8);
        stripe.position.set(x, 0.003, -6.8);
        this.group.add(stripe);
      }
    }
    if (preset === 'city') {
      for (let row = 0; row < 3; row++) {
        for (let column = 0; column < 4; column++) {
          this._target('building', -5.4 + column * 3.6, -3.5 - row * 3.5, 1.65, 1.6 + ((row + column) % 3) * 0.75, 120);
        }
      }
    } else if (preset === 'forest') {
      for (let row = 0; row < 3; row++) {
        for (let column = 0; column < 6; column++) {
          this._target('tree', -6.1 + column * 2.45, -3.4 - row * 3.4, 1.1, 1.8 + (column % 3) * 0.3, 65);
        }
      }
    } else if (preset === 'corridor') {
      for (let row = 0; row < 4; row++) {
        this._target('barricade', -1.5, -3.4 - row * 2.5, 1.7, 0.8, 80);
        this._target(row % 2 ? 'building' : 'tree', 2, -3.4 - row * 2.5, 1.4, 1.8, 100);
      }
    }
    this._notify();
  }

  _target(kind, x, z, width, height, maxHp) {
    const root = new Group();
    root.position.set(x, 0.04, z);
    root.name = `Target:${kind}:${this.targets.length + 1}`;
    const color = kind === 'tree' ? '#4f8e6b' : kind === 'barricade' ? '#db9b3d' : '#477386';
    const material = this._resource(new MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.25, emissive: '#122c38', emissiveIntensity: 0.25 }));
    const add = (geometry, y, sx, sy, sz, mat = material) => {
      const mesh = new Mesh(geometry, mat);
      mesh.position.y = y;
      mesh.scale.set(sx, sy, sz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);
      return mesh;
    };
    if (kind === 'tree') {
      add(this.box, height * 0.28, 0.24, height * 0.56, 0.24);
      add(this.cone, height * 0.68, width, height * 0.72, width);
      add(this.cone, height * 1.03, width * 0.7, height * 0.48, width * 0.7);
    } else {
      add(this.box, height / 2, width, height, width * 0.85);
      for (let level = 0.4; level < height; level += 0.55) {
        add(this.box, level, width * 1.015, 0.075, width * 0.86, this.lineMaterial);
      }
      add(this.box, height + 0.12, width * 0.65, 0.24, width * 0.55);
    }
    const ringMaterial = this._resource(new MeshBasicMaterial({ color: '#7cf4ca', transparent: true, opacity: 0.7, depthWrite: false }));
    const cracks = new Group();
    cracks.visible = false;
    if (kind !== 'tree') {
      for (let segment = 0; segment < 3; segment++) {
        const crack = new Mesh(this.box, ringMaterial);
        crack.position.set((segment % 2 ? -0.12 : 0.12) * width, height * (0.25 + segment * 0.23), width * 0.43);
        crack.scale.set(0.035, height * 0.32, 0.022);
        crack.rotation.z = segment % 2 ? -0.55 : 0.55;
        cracks.add(crack);
      }
    }
    root.add(cracks);
    const ring = new Mesh(this.ring, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.025, z);
    ring.scale.setScalar(width * 0.8);
    this.group.add(root, ring);
    const debris = [];
    for (let i = 0; i < 8; i++) {
      const piece = new Mesh(this.box, material);
      piece.visible = false;
      piece.castShadow = true;
      this.group.add(piece);
      debris.push({ mesh: piece, velocity: new Vector3(), spin: new Vector3() });
    }
    this.targets.push({ kind, x, z, radius: width * 0.5, width, height, hp: maxHp, maxHp, frozen: false, root, material, baseColor: material.color.clone(), ring, ringMaterial, cracks, debris, flash: 0, rubbleAge: 0 });
  }

  trackCast(ability) {
    if (!ability) return;
    this.casts.set(ability, new Set());
    this.stats.casts++;
    this._notify();
  }

  clearCasts() { this.casts.clear(); }

  update(dt, activeAbilities) {
    if (dt <= 0) return;
    const active = new Set(activeAbilities);
    for (const [ability, hit] of this.casts) {
      if (!active.has(ability)) { this.casts.delete(ability); continue; }
      for (const target of this.targets) {
        if (target.hp <= 0 || hit.has(target) || !hitsTarget(ability, target)) continue;
        hit.add(target);
        this._hit(target, ability.element, ability.direction);
      }
    }
    for (const target of this.targets) {
      target.flash = Math.max(0, target.flash - dt * 3.5);
      target.material.emissiveIntensity = 0.25 + target.flash * 2;
      if (target.hp > 0) {
        target.root.rotation.z = Math.sin(target.flash * 17) * target.flash * 0.035;
      } else {
        target.rubbleAge += dt;
        for (const piece of target.debris) {
          if (target.rubbleAge > 3) continue;
          piece.velocity.y -= dt * 10;
          piece.mesh.position.addScaledVector(piece.velocity, dt);
          if (piece.mesh.position.y < 0.12) {
            piece.mesh.position.y = 0.12;
            piece.velocity.multiplyScalar(0.35);
            piece.velocity.y = Math.abs(piece.velocity.y) * 0.2;
          }
          piece.mesh.rotation.x += piece.spin.x * dt;
          piece.mesh.rotation.z += piece.spin.z * dt;
        }
      }
    }
  }

  _hit(target, element, direction) {
    const result = resolveDamage(target, element);
    this.stats.hits++;
    this.stats.damage += result.damage;
    target.flash = 1;
    target.material.emissive.set(COLORS[element]);
    target.material.color.copy(target.frozen ? target.baseColor.clone().lerp({ r: 0.55, g: 0.85, b: 1 }, 0.65) : target.baseColor);
    target.root.scale.y = 0.86 + 0.14 * target.hp / target.maxHp;
    target.cracks.visible = true;
    target.ringMaterial.color.set(target.hp / target.maxHp < 0.5 ? '#ff8b5d' : '#f5d786');
    target.ring.scale.setScalar(target.width * 0.8 * Math.max(0.3, target.hp / target.maxHp));
    if (result.destroyed) {
      this.stats.destroyed++;
      target.root.visible = false;
      target.ring.visible = false;
      target.rubbleAge = 0;
      target.debris.forEach((piece, index) => {
        const angle = index / target.debris.length * Math.PI * 2;
        piece.mesh.visible = true;
        piece.mesh.position.set(target.x + Math.cos(angle) * 0.3, 0.4 + (index % 3) * target.height * 0.24, target.z + Math.sin(angle) * 0.3);
        piece.mesh.scale.set(target.width * 0.32, target.height * 0.23, target.width * 0.27);
        piece.velocity.set(Math.cos(angle) * 2 + direction.x, 2 + index % 3, Math.sin(angle) * 2 + direction.z);
        piece.spin.set(index % 2 ? 2 : -2, 0, Math.cos(angle) * 2);
      });
    }
    this._notify();
    this.onHit({ element, damage: Math.round(result.damage), destroyed: result.destroyed, frozen: target.frozen });
  }

  _notify() { this.onChange({ ...this.stats, total: this.targets.length, preset: this.preset, ...PLAYGROUND_PRESETS[this.preset] }); }

  reset() { this.setPreset(this.preset); }

  dispose() {
    this.casts.clear();
    this.group.parent?.remove(this.group);
    for (const resource of this.resources) resource.dispose();
    this.resources.clear();
  }
}
