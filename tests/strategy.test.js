import test from 'node:test';
import assert from 'node:assert/strict';
import { STRATEGY_DEFINITIONS, FLOOD_STRATEGY, HEAT_STRATEGY, WILDFIRE_STRATEGY } from '../src/scenarios/strategyDefinitions.js';
import { evaluateStrategy, findBestStrategy, isValidPlan } from '../src/scenarios/StrategyModel.js';
import { StrategyScenario } from '../src/scenarios/StrategyScenario.js';
import { CityWorld } from '../src/world/CityWorld.js';

const ids = (...values) => new Set(values);

function combinations(actions, min, max, budget) {
  const plans = [];
  const visit = (index, selected, cost) => {
    if (cost > budget || selected.length > max) return;
    if (index === actions.length) {
      if (selected.length >= min) plans.push(ids(...selected));
      return;
    }
    visit(index + 1, selected, cost);
    visit(index + 1, [...selected, actions[index].id], cost + actions[index].cost);
  };
  visit(0, [], 0);
  return plans;
}

for (const definition of STRATEGY_DEFINITIONS) {
  test(`${definition.id}: answer key is globally optimal and respects both budgets`, () => {
    const best = findBestStrategy(definition);
    assert.ok(isValidPlan(definition.initial, best.initial.ids, 80, 3, 4));
    assert.ok(isValidPlan(definition.emergency, best.emergency.ids, 45, 2, 3));
    for (const initial of combinations(definition.initial, 3, 4, 80)) {
      for (const emergency of combinations(definition.emergency, 2, 3, 45)) {
        const candidate = evaluateStrategy(definition, initial, emergency);
        assert.ok(candidate.score <= best.score + 1e-10);
        if (Math.abs(candidate.score - best.score) < 1e-10) {
          assert.ok(best.cost <= candidate.initialCost + candidate.emergencyCost);
        }
      }
    }
  });

  test(`${definition.id}: actual deployment reproduces the recommended score and can restart`, async () => {
    const best = findBestStrategy(definition);
    const calls = [];
    let selected = [];
    let report;
    const statuses = new Map();
    const ui = new Proxy({
      on() {}, getSelectedChoices: () => selected,
      setStepStatus: (id, status) => statuses.set(id, status),
      showReport: (value) => { report = value; }
    }, { get: (target, property) => target[property] ?? (() => {}) });
    const city = new Proxy({}, { get: (_, method) => (...args) => {
      assert.equal(typeof CityWorld.prototype[method], 'function', `Unknown city action ${String(method)}`);
      calls.push([method, ...args]);
    } });
    const scenario = new StrategyScenario({ city, ui, hazard() {}, clear() {}, delay: async () => {} }, definition);
    await scenario.generate();
    selected = [...best.initial.ids];
    await scenario.execute();
    assert.equal(scenario.stage, 'disrupted');
    await scenario.prepareAdaptation();
    selected = [...best.emergency.ids];
    await scenario.execute();
    assert.equal(scenario.stage, 'complete');
    assert.equal(report.stats[0][1], `${Math.round(best.score * 100)}%`);
    for (const [id, expected] of best.results) assert.equal(statuses.get(id), expected);
    scenario.restart();
    assert.equal(scenario.stage, 'observe');
    assert.equal(scenario.initialChoices.size, 0);
    assert.ok(calls.some(([method]) => method === 'reset'));
  });
}

test('flood: generators cannot restore pumping without an installed pump network', () => {
  const result = evaluateStrategy(FLOOD_STRATEGY, ids('barrier', 'sandbags', 'metro'), ids('power', 'expand'));
  assert.equal(result.results.get('power'), 'failed');
  assert.equal(result.results.get('expand'), 'partial');
});

test('heat: staged restart needs prepared hubs and spare power capacity', () => {
  assert.equal(evaluateStrategy(HEAT_STRATEGY, ids('hubs', 'water', 'shelter'), ids('restore', 'outreach')).results.get('restore'), 'failed');
  assert.equal(evaluateStrategy(HEAT_STRATEGY, ids('hubs', 'water', 'shelter'), ids('shed', 'restore')).results.get('restore'), 'completed');
});

test('wildfire: suppression needs fully successful mobile flow and secondary firebreak', () => {
  const initial = ids('water', 'firebreak', 'shelter');
  assert.ok(isValidPlan(WILDFIRE_STRATEGY.emergency, ids('mobile', 'extend', 'suppress'), 45, 2, 3));
  assert.equal(evaluateStrategy(WILDFIRE_STRATEGY, initial, ids('mobile', 'suppress')).results.get('suppress'), 'failed');
  assert.equal(evaluateStrategy(WILDFIRE_STRATEGY, initial, ids('mobile', 'extend', 'suppress')).results.get('suppress'), 'completed');
});

test('recovery advice preserves committed preparation and cannot exceed the global optimum', () => {
  for (const definition of STRATEGY_DEFINITIONS) {
    const initial = combinations(definition.initial, 3, 4, 80)[0];
    const before = [...initial];
    const recovery = findBestStrategy(definition, initial);
    assert.deepEqual([...initial], before);
    assert.deepEqual([...recovery.initial.ids], before);
    assert.ok(recovery.score <= findBestStrategy(definition).score + 1e-10);
  }
});

test('restart cancels an in-flight analysis without publishing stale choices', async () => {
  let resume;
  let choicesPublished = false;
  const ui = new Proxy({ on() {}, setChoices() { choicesPublished = true; } }, { get: (target, key) => target[key] ?? (() => {}) });
  const city = new Proxy({}, { get: () => () => {} });
  const scenario = new StrategyScenario({ city, ui, hazard() {}, clear() {}, delay: () => new Promise((resolve) => { resume = resolve; }) }, FLOOD_STRATEGY);
  const analysis = scenario.generate();
  scenario.restart();
  resume();
  await analysis;
  assert.equal(choicesPublished, false);
  assert.equal(scenario.stage, 'observe');
});
