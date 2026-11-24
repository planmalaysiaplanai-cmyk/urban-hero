export const POWER_DAMAGE = { ice: 45, thunder: 65, meteor: 160, beam: 95, snare: 35, glacier: 85 };

/** Flat footprints follow the cast front for lances, and the landing zone for area casts. */
export function hitsTarget(ability, target) {
  const dx = target.x - ability.origin.x;
  const dz = target.z - ability.origin.z;
  const padding = target.radius;
  if (['meteor', 'snare', 'glacier'].includes(ability.element)) {
    if (ability.phase !== 'impact' && ability.phase !== 'fade') return false;
    const x = ability.origin.x + ability.direction.x * ability.length;
    const z = ability.origin.z + ability.direction.z * ability.length;
    const radius = ability.element === 'meteor'
      ? Math.max(1.8, ability.config.scorchRadius ?? 2.5)
      : ability.radius;
    return Math.hypot(target.x - x, target.z - z) <= radius + padding;
  }
  if (ability.front <= 0 || !['travel', 'impact', 'fade'].includes(ability.phase)) return false;
  const along = dx * ability.direction.x + dz * ability.direction.z;
  const across = Math.abs(dx * ability.direction.z - dz * ability.direction.x);
  const reach = Math.min(ability.length, ability.front);
  const width = ability.element === 'ice'
    ? (ability.config.widthNear ?? 0.5) + ((ability.config.width ?? 2.5) - (ability.config.widthNear ?? 0.5)) * Math.min(1, Math.max(0, along / ability.length))
    : Math.max(0.45, ability.config.radius ?? 0.6);
  return along >= -padding && along <= reach + padding && across <= width + padding;
}

export function resolveDamage(target, element) {
  if (target.hp <= 0) return { damage: 0, destroyed: false };
  const base = POWER_DAMAGE[element] ?? 0;
  const damage = Math.min(target.hp, base * (target.frozen && !['ice', 'glacier'].includes(element) ? 1.5 : 1));
  target.hp = Math.max(0, target.hp - damage);
  if (element === 'ice' || element === 'glacier') target.frozen = true;
  return { damage, destroyed: target.hp <= 0 };
}
