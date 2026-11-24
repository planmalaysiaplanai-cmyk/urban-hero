import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { hitsTarget, resolveDamage } from '../src/world/PlaygroundCombat.js';
import { DestructiblePlayground } from '../src/world/DestructiblePlayground.js';

function castAt(target, element = 'meteor') {
  const direction = new Vector3(target.x, 0, target.z);
  const length = direction.length();
  direction.normalize();
  return { element, origin: new Vector3(), direction, length, front: length, radius: 2,
    config: { widthNear: 0.5, width: 2, radius: 0.6, scorchRadius: 2 }, phase: 'impact' };
}

test('line powers hit along their advancing corridor, not beyond the front', () => {
  const target = { x: 0, z: 8, radius: 0.5 };
  const ability = { ...castAt(target, 'ice'), front: 3, phase: 'travel' };
  assert.equal(hitsTarget(ability, target), false);
  ability.front = 8;
  assert.equal(hitsTarget(ability, target), true);
  assert.equal(hitsTarget(ability, { ...target, x: 7 }), false);
});

for (const element of ['meteor', 'snare', 'glacier']) {
  test(`${element} only damages its landing zone after arrival`, () => {
    const target = { x: 2, z: -7, radius: 0.4 };
    const ability = castAt(target, element);
    ability.phase = 'travel';
    assert.equal(hitsTarget(ability, target), false);
    ability.phase = 'impact';
    assert.equal(hitsTarget(ability, target), true);
    assert.equal(hitsTarget(ability, { ...target, z: 5 }), false);
  });
}

test('freeze then non-frost attack applies the shatter bonus without negative HP', () => {
  const target = { hp: 120, frozen: false };
  assert.equal(resolveDamage(target, 'ice').damage, 45);
  assert.equal(target.frozen, true);
  assert.equal(resolveDamage(target, 'snare').damage, 52.5);
  assert.equal(resolveDamage(target, 'meteor').damage, 22.5);
  assert.equal(target.hp, 0);
  assert.equal(resolveDamage(target, 'beam').damage, 0);
});

test('each cast hits a target once; reused casts and reset create a fresh round', () => {
  const playground = new DestructiblePlayground();
  const target = playground.targets[0];
  const ability = castAt(target, 'thunder');
  playground.trackCast(ability);
  playground.update(0, [ability]);
  assert.equal(target.hp, 120);
  playground.update(0.016, [ability]);
  const hp = target.hp;
  playground.update(0.016, [ability]);
  assert.equal(target.hp, hp);
  playground.trackCast(ability);
  playground.update(0.016, [ability]);
  assert.equal(target.hp, 0);
  assert.ok(target.debris.every((piece) => piece.mesh.visible));
  assert.equal(target.root.visible, false);
  playground.reset();
  assert.equal(playground.stats.damage, 0);
  assert.equal(playground.targets[0].hp, 120);
  assert.equal(playground.casts.size, 0);
  playground.dispose();
});

test('all six powers can damage training targets, and arenas reset their resource count', () => {
  const playground = new DestructiblePlayground();
  const resources = playground.resources.size;
  for (const element of ['ice', 'thunder', 'meteor', 'beam', 'snare', 'glacier']) {
    playground.reset();
    const target = playground.targets[0];
    const ability = castAt(target, element);
    playground.trackCast(ability);
    playground.update(0.016, [ability]);
    assert.ok(target.hp < target.maxHp, element);
    assert.equal(playground.resources.size, resources);
  }
  playground.setPreset('forest');
  assert.equal(playground.targets.length, 18);
  playground.setPreset('corridor');
  assert.equal(playground.targets.length, 8);
  playground.setPreset('empty');
  assert.equal(playground.targets.length, 0);
  assert.equal(playground.group.children.length, 0);
  playground.dispose();
});
