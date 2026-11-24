const KEYS = ['safety', 'grid', 'energy'];
const FACTORS = { completed: 1, partial: 0.45, failed: 0 };
const clamp = (value) => Math.min(1, Math.max(0, value));

export function validPlans(actions, budget, min, max) {
  const plans = [];
  for (let mask = 0; mask < 2 ** actions.length; mask++) {
    const selected = actions.filter((_, index) => mask & (1 << index));
    const cost = selected.reduce((total, action) => total + action.cost, 0);
    if (selected.length >= min && selected.length <= max && cost <= budget) {
      plans.push({ actions: selected, ids: new Set(selected.map((action) => action.id)), cost });
    }
  }
  return plans;
}

export function isValidPlan(actions, ids, budget, min, max) {
  if (ids.size < min || ids.size > max) return false;
  const selected = actions.filter((action) => ids.has(action.id));
  return selected.length === ids.size && selected.reduce((total, action) => total + action.cost, 0) <= budget;
}

export function evaluateStrategy(definition, initialIds, emergencyIds = new Set()) {
  const outcomes = new Map();
  const initialOutcomes = new Map();
  const initial = [...definition.base];
  const context = {
    initial: initialIds,
    emergency: emergencyIds,
    effective: (id) => outcomes.get(id)?.status === 'completed'
  };
  const resolve = (action, values, map) => {
    const resolution = action.resolve?.(context) ?? { status: 'completed', reason: action.rationale };
    const outcome = { ...resolution, reason: resolution.reason ?? action.rationale };
    map.set(action.id, outcome);
    const factor = FACTORS[outcome.status];
    if (factor === undefined) throw new Error(`Unknown action outcome: ${outcome.status}`);
    action.effects.forEach((effect, index) => { values[index] += effect * factor; });
  };
  let initialCost = 0;
  for (const action of definition.initial) {
    if (!initialIds.has(action.id)) continue;
    initialCost += action.cost;
    resolve(action, initial, initialOutcomes);
  }
  initial[2] -= initialCost * definition.resourceCost;
  const final = initial.map(clamp);
  let emergencyCost = 0;
  // Catalog order is also deployment order, so later actions depend on actual earlier outcomes.
  for (const action of definition.emergency) {
    if (!emergencyIds.has(action.id)) continue;
    emergencyCost += action.cost;
    resolve(action, final, outcomes);
  }
  final[2] -= emergencyCost * definition.resourceCost;
  const metrics = Object.fromEntries(KEYS.map((key, index) => [key, clamp(final[index])]));
  const initialMetrics = Object.fromEntries(KEYS.map((key, index) => [key, clamp(initial[index])]));
  const score = KEYS.reduce((total, key, index) => total + metrics[key] * definition.weights[index], 0);
  return {
    metrics, initialMetrics, outcomes, initialOutcomes, initialCost, emergencyCost, score,
    results: new Map([...outcomes].map(([id, outcome]) => [id, outcome.status])),
    initialResults: new Map([...initialOutcomes].map(([id, outcome]) => [id, outcome.status]))
  };
}

export function findBestStrategy(definition, fixedInitial = null) {
  if (fixedInitial && !isValidPlan(definition.initial, fixedInitial, 80, 3, 4)) {
    throw new Error('Cannot recommend recovery for an invalid initial plan');
  }
  const initialPlans = fixedInitial
    ? [{ ids: new Set(fixedInitial), actions: definition.initial.filter((action) => fixedInitial.has(action.id)) }]
    : validPlans(definition.initial, 80, 3, 4);
  const emergencyPlans = validPlans(definition.emergency, 45, 2, 3);
  let best = null;
  for (const initialPlan of initialPlans) {
    const initial = { ...initialPlan, cost: initialPlan.actions.reduce((cost, action) => cost + action.cost, 0) };
    for (const emergency of emergencyPlans) {
      const evaluated = evaluateStrategy(definition, initial.ids, emergency.ids);
      const cost = initial.cost + emergency.cost;
      if (!best || evaluated.score > best.score + 1e-10
        || (Math.abs(evaluated.score - best.score) < 1e-10 && cost < best.cost)) {
        best = { ...evaluated, initial, emergency, cost };
      }
    }
  }
  return best;
}

export function resilienceGrade(score) {
  const rounded = Math.round(score * 100);
  return rounded >= 80 ? 'A' : rounded >= 70 ? 'B' : rounded >= 58 ? 'C' : 'D';
}
