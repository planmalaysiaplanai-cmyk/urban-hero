const INITIAL_MITIGATIONS = [
  {
    id: 'northBarrier', category: 'Infrastructure', label: 'North-vector modular barrier',
    detail: 'Build against the highest-probability ice trajectory.',
    risk: 'High protection, but exposed if the wind rotates east.', cost: 28
  },
  {
    id: 'westBarrier', category: 'Infrastructure', label: 'Low-cost western windbreak',
    detail: 'Protect dense housing using fewer barrier modules.',
    risk: 'Cheaper option assumes the current wind direction holds.', cost: 20
  },
  {
    id: 'heatBravo', category: 'Mobility', label: 'Preheat Route Bravo',
    detail: 'Install one continuous heated evacuation corridor.',
    risk: 'Leaves Route Alpha unavailable after ice accumulation.', cost: 18
  },
  {
    id: 'heatBoth', category: 'Mobility', label: 'Preheat both evacuation routes',
    detail: 'Maximize route redundancy before storm impact.',
    risk: 'Large energy draw may reduce emergency grid headroom.', cost: 34
  },
  {
    id: 'earlyEvac', category: 'Population', label: 'Begin early Sector C evacuation',
    detail: 'Move mobility-risk residents before the warning escalates.',
    risk: 'Uses transport capacity before trajectory certainty improves.', cost: 16
  },
  {
    id: 'localShelter', category: 'Population', label: 'Open local heated shelters',
    detail: 'Reduce travel demand through neighborhood refuge sites.',
    risk: 'Shelter capacity protects only part of Sector C.', cost: 12
  },
  {
    id: 'microgrid', category: 'Energy', label: 'Stage hospital microgrid',
    detail: 'Reserve battery power for critical clinical systems.',
    risk: 'Protects the hospital, not the surrounding district grid.', cost: 24
  },
  {
    id: 'reinforceGrid', category: 'Energy', label: 'Reinforce eastern transformer',
    detail: 'Add surge protection and thermal reserve at East Grid.',
    risk: 'Strong grid defense leaves fewer credits for evacuation.', cost: 22
  }
];

const ADAPTIVE_MITIGATIONS = [
  {
    id: 'extend', category: 'Containment', label: 'Extend the modular barrier',
    detail: 'Close the new ice path toward Sector B.',
    risk: 'Most effective when connected to the north-vector barrier.', cost: 18
  },
  {
    id: 'reroute', category: 'Energy', label: 'Reroute the western feeder',
    detail: 'Bypass East Grid and restore critical district power.',
    risk: 'Consumes emergency energy and limits road-heating output.', cost: 24
  },
  {
    id: 'boost', category: 'Mobility', label: 'Boost Route Bravo heating',
    detail: 'Increase thermal output through the wind peak.',
    risk: 'Fails if no heating circuit was installed before impact.', cost: 16
  },
  {
    id: 'rapid', category: 'Population', label: 'Launch rapid evacuation wave',
    detail: 'Prioritize exposed residents and medical transport.',
    risk: 'Unheated routes create congestion and cold exposure.', cost: 14
  },
  {
    id: 'isolate', category: 'Energy', label: 'Isolate the damaged transformer',
    detail: 'Prevent a district-wide electrical cascade.',
    risk: 'Protects stability but does not restore lost power.', cost: 12
  },
  {
    id: 'shelterBackup', category: 'Population', label: 'Expand shelter-in-place capacity',
    detail: 'Convert civic buildings into temporary heated refuges.',
    risk: 'Slower without the neighborhood shelter network prepared.', cost: 10
  }
];

const POINTS = {
  iceFront: [1.2, 9.4],
  sector: [-5.25, 3.15],
  stormCell: [8.4, 8.2],
  power: [5.35, -3.2]
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));

/** Playable digital-twin vertical slice with two constrained decision windows. */
export class FrozenStormScenario {
  constructor({ city, ui, hazard, clear }) {
    this.city = city;
    this.ui = ui;
    this.hazard = hazard;
    this.clearEffects = clear;
    this.running = false;
    this.stage = 'observe';
    this._runId = 0;
    this.initialChoices = new Set();
    this.adaptiveChoices = new Set();
    this.initialSpend = 0;
    this.adaptiveSpend = 0;
    this.initialMetrics = { safety: 0.58, grid: 0.42, energy: 0.7 };
    this.choiceResults = new Map();

    this.ui.on('generate', () => this.generate());
    this.ui.on('execute', () => this.execute());
    this.ui.on('replan', () => this.prepareAdaptation());
    this.ui.on('restart', () => this.restart());
    this.ui.on('best-strategy', () => this.showBestStrategy());
    this.ui.on('apply-best-strategy', () => this.applyBestStrategy());
    this.ui.enableStrategyGuide();
  }

  async generate() {
    if (this.running) return;
    this.running = true;
    const runId = ++this._runId;
    this.ui.setAnalyzing();
    this.ui.showWorldCallout('analysis', 'CITY DIGITAL TWIN', 'Mapping storm uncertainty, population exposure and infrastructure dependencies');
    this.city.setAnalysis(true);
    await wait(1600);
    if (runId !== this._runId) return;

    this.city.setAnalysis(false);
    this.ui.setChoices(INITIAL_MITIGATIONS, {
      budget: 80,
      minSelected: 3,
      maxSelected: 4,
      strategy: 'Build your response strategy',
      confidence: '3-4',
      rationale: 'Choose at least three measures. Cost, timing and dependencies determine which systems survive the storm.',
      actionLabel: 'Deploy selected measures'
    });
    this.ui.showToast('Decision window open / 80 resilience credits available');
    this.stage = 'initial-choice';
    this.running = false;
  }

  execute() {
    if (this.stage === 'initial-choice') return this.executeInitialPlan();
    if (this.stage === 'adaptive-choice') return this.executeAdaptivePlan();
    return undefined;
  }

  async executeInitialPlan() {
    if (this.running) return;
    this.running = true;
    const runId = ++this._runId;
    this.initialChoices = new Set(this.ui.getSelectedChoices());
    this.initialSpend = this.ui.getChoiceSpend();
    this.ui.lockChoices();
    this.ui.setExecuting();
    this.stage = 'initial-running';

    const actions = {
      northBarrier: () => {
        this.city.deployBarrier();
        this.ui.showWorldCallout('action', 'NORTH BARRIER DEPLOYED', 'Modular panels aligned to the current high-probability ice vector');
      },
      westBarrier: () => {
        this.city.deployBarrier();
        this.ui.showWorldCallout('action', 'WESTERN WINDBREAK DEPLOYED', 'Lower-cost barrier protecting the dense residential edge');
      },
      heatBravo: () => {
        this.city.setRoadHeating(true);
        this.city.activateRoute(true);
        this.ui.showWorldCallout('action', 'ROUTE BRAVO PREHEATED', 'One continuous evacuation corridor is holding above freezing');
      },
      heatBoth: () => {
        this.city.setRoadHeating(true);
        this.city.activateRoute(true);
        this.ui.showWorldCallout('action', 'DUAL ROUTE HEATING ACTIVE', 'Redundant mobility secured at high emergency energy cost');
      },
      earlyEvac: () => {
        this.city.startEvacuation(true);
        this.city.activateRoute(true);
        this.ui.showWorldCallout('action', 'EARLY EVACUATION ACTIVE', 'Mobility-risk residents moving before storm impact');
      },
      localShelter: () => {
        this.ui.showWorldCallout('action', 'LOCAL SHELTERS OPEN', 'Neighborhood refuge capacity reducing transport demand');
      },
      microgrid: () => {
        this.city.stageHospitalMicrogrid();
        this.ui.showWorldCallout('action', 'HOSPITAL MICROGRID STAGED', 'Critical clinical loads reserved on battery storage');
      },
      reinforceGrid: () => {
        this.city.restorePower();
        this.ui.showWorldCallout('action', 'EAST GRID REINFORCED', 'Surge protection and thermal reserve installed before impact');
      }
    };

    for (const option of INITIAL_MITIGATIONS) {
      if (!this.initialChoices.has(option.id)) continue;
      if (runId !== this._runId) return;
      this.ui.setStepStatus(option.id, 'active');
      actions[option.id]();
      await wait(900);
      this.ui.setStepStatus(option.id, 'completed');
      this.choiceResults.set(option.id, 'completed');
    }

    if (runId !== this._runId) return;
    this.city.triggerWindShift();
    this.ui.showWorldCallout('hazard', 'UNFORECAST WIND ROTATION', 'The ice front has shifted east of the original probability cone', 3200);
    this.hazard('ice', POINTS.iceFront, POINTS.sector);
    await wait(1100);

    const northBarrier = this.initialChoices.has('northBarrier');
    const westBarrier = this.initialChoices.has('westBarrier');
    if (westBarrier && !northBarrier) {
      this.ui.setStepStatus('westBarrier', 'failed');
      this.choiceResults.set('westBarrier', 'failed');
      this.ui.showWorldCallout('hazard', 'MITIGATION FAILURE', 'The western windbreak was bypassed by the rotated ice vector', 2800);
    } else if (northBarrier) {
      this.ui.showWorldCallout('action', 'BARRIER PARTIALLY HOLDS', 'North panels absorb the primary front but leave a secondary Sector B exposure');
      this.ui.setStepStatus('northBarrier', 'partial');
      this.choiceResults.set('northBarrier', 'partial');
    }
    await wait(850);

    if (runId !== this._runId) return;
    const reinforced = this.initialChoices.has('reinforceGrid');
    const microgrid = this.initialChoices.has('microgrid');
    this.ui.showWorldCallout('hazard', 'EAST GRID SURGE', 'Ice loading has pushed the eastern transformer beyond normal limits', 3000);
    this.hazard('thunder', POINTS.stormCell, POINTS.power);
    await wait(520);

    if (reinforced) {
      this.ui.showWorldCallout('action', 'TRANSFORMER HOLDS', 'Pre-impact reinforcement prevents a full district outage');
      this.choiceResults.set('reinforceGrid', 'completed');
    } else {
      this.city.failPower();
      if (microgrid) {
        this.city.protectHospital();
        this.ui.showWorldCallout('action', 'MICROGRID ISLAND FORMED', 'The district grid fails, but hospital critical loads remain online');
      } else {
        this.ui.showWorldCallout('hazard', 'CRITICAL POWER LOSS', 'East Grid and hospital supply are both offline', 3000);
      }
    }
    await wait(900);

    if (this.initialChoices.has('heatBoth')) {
      this.ui.setStepStatus('heatBoth', 'partial');
      this.choiceResults.set('heatBoth', 'partial');
    }
    if (this.initialChoices.has('earlyEvac') && !this._hasHeating()) {
      this.ui.setStepStatus('earlyEvac', 'partial');
      this.choiceResults.set('earlyEvac', 'partial');
    }

    this.initialMetrics = this._calculateInitialMetrics();
    this._setMetrics(this.initialMetrics);
    const viability = Math.round(this._score(this.initialMetrics) * 100);
    const gaps = [];
    if (!northBarrier) gaps.push('the rotated ice path is uncontained');
    if (!reinforced) gaps.push('East Grid has failed');
    if (!microgrid && !reinforced) gaps.push('hospital power is exposed');
    if (!this._hasHeating()) gaps.push('no heated evacuation route is available');

    const title = viability >= 70 ? 'Secondary exposure detected' : 'Cascading system disruption';
    const body = gaps.length
      ? `Digital twin update: ${gaps.join('; ')}. Select emergency measures using the remaining response window.`
      : 'The initial strategy absorbed the primary impact, but the new ice path still threatens Sector B. Use emergency credits to close the remaining gap.';
    this.ui.showDisruption({ title, body, viability: `${viability}%` });
    this.stage = 'disrupted';
    this.running = false;
  }

  async prepareAdaptation() {
    if (this.running || this.stage !== 'disrupted') return;
    this.running = true;
    const runId = ++this._runId;
    this.ui.setReplanning();
    this.city.setAnalysis(true);
    this.ui.showWorldCallout('analysis', 'PLAN AI RE-CALCULATION', 'Testing emergency actions against the live ice, power and mobility state');
    await wait(1500);
    if (runId !== this._runId) return;

    this.city.setAnalysis(false);
    this.ui.setChoices(ADAPTIVE_MITIGATIONS, {
      adapted: true,
      budget: 45,
      minSelected: 2,
      maxSelected: 3,
      strategy: 'Emergency decision window',
      confidence: '2-3',
      rationale: 'Dependencies now matter. A heating boost needs a preinstalled circuit; isolation protects stability but cannot restore power.',
      actionLabel: 'Execute emergency measures'
    });
    this.ui.setPhase('adapt');
    this.ui.showToast('Emergency window open / choose 2-3 actions');
    this.stage = 'adaptive-choice';
    this.running = false;
  }

  async executeAdaptivePlan() {
    if (this.running) return;
    this.running = true;
    const runId = ++this._runId;
    this.adaptiveChoices = new Set(this.ui.getSelectedChoices());
    this.adaptiveSpend = this.ui.getChoiceSpend();
    this.ui.lockChoices();
    this.ui.setExecuting();
    this.ui.setPhase('adapt');
    this.stage = 'adaptive-running';

    const results = new Map();
    const predictedResults = this._adaptiveResults(this.initialChoices);
    const runAction = async (id, action) => {
      if (!this.adaptiveChoices.has(id) || runId !== this._runId) return;
      this.ui.setStepStatus(id, 'active');
      action();
      const result = predictedResults.get(id);
      results.set(id, result);
      await wait(1050);
      this.ui.setStepStatus(id, result);
    };

    await runAction('extend', () => {
      this.city.deployBarrier(true);
      const connected = this.initialChoices.has('northBarrier');
      this.ui.showWorldCallout(
        connected ? 'action' : 'hazard',
        connected ? 'SECONDARY ICE PATH CLOSED' : 'BARRIER CONNECTION DELAYED',
        connected ? 'Extension connects to the prepared north barrier' : 'Standalone modules slow the ice but leave a seam exposed'
      );
      return connected ? 'completed' : 'partial';
    });

    await runAction('reroute', () => {
      this.city.reroutePower();
      const needed = !this.initialChoices.has('reinforceGrid');
      this.ui.showWorldCallout('action', needed ? 'WESTERN FEEDER ONLINE' : 'POWER RESERVE REDISTRIBUTED', needed ? 'Hospital and district loads bypass East Grid' : 'Additional feeder capacity improves redundancy');
      return needed ? 'completed' : 'partial';
    });

    await runAction('boost', () => {
      if (!this._hasHeating()) {
        this.ui.showWorldCallout('hazard', 'DEPENDENCY FAILURE', 'No road-heating circuit was installed before impact');
        return 'failed';
      }
      this.city.setRoadHeating(true);
      this.city.activateRoute(true);
      this.ui.showWorldCallout('action', 'ROUTE BRAVO OUTPUT BOOSTED', 'The prepared circuit is holding a continuous warm corridor');
      return 'completed';
    });

    await runAction('rapid', () => {
      this.city.activateRoute(true);
      this.city.startEvacuation(true);
      const heated = this._hasHeating() || results.get('boost') === 'completed';
      this.ui.showWorldCallout(heated ? 'action' : 'hazard', heated ? 'RAPID EVACUATION ACTIVE' : 'EVACUATION CONGESTION', heated ? 'Priority residents moving through Route Bravo' : 'Unheated surfaces are slowing transport units');
      return heated ? 'completed' : 'partial';
    });

    await runAction('isolate', () => {
      this.city.isolateGrid();
      const needed = !this.initialChoices.has('reinforceGrid');
      this.ui.showWorldCallout('action', needed ? 'DAMAGED TRANSFORMER ISOLATED' : 'PREVENTIVE GRID SEGMENTATION', needed ? 'Electrical cascade stopped at East Grid' : 'Healthy reinforced equipment isolated as a precaution');
      return needed ? 'completed' : 'partial';
    });

    await runAction('shelterBackup', () => {
      const prepared = this.initialChoices.has('localShelter');
      this.ui.showWorldCallout(prepared ? 'action' : 'hazard', prepared ? 'SHELTER CAPACITY EXPANDED' : 'SHELTER ACTIVATION DELAYED', prepared ? 'Prepared neighborhood sites absorb remaining demand' : 'Unprepared civic buildings provide only partial capacity');
      return prepared ? 'completed' : 'partial';
    });

    if (runId !== this._runId) return;
    const finalMetrics = this._calculateFinalMetrics(results);
    this._setMetrics(finalMetrics);
    const score = Math.round(this._score(finalMetrics) * 100);
    const grade = score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 58 ? 'C' : 'D';
    const effective = [...results.values()].filter((status) => status === 'completed').length;
    const partial = [...results.values()].filter((status) => status === 'partial').length;
    const protectedResidents = Math.round(3240 * finalMetrics.safety).toLocaleString('en-US');
    const recoveryHours = Math.max(1.4, 8.8 - score * 0.075).toFixed(1);
    const withoutAdaptation = Math.max(0, Math.round(3240 * (1 - this.initialMetrics.safety))).toLocaleString('en-US');
    const outcome = grade === 'A'
      ? 'Layered preparation and emergency adaptation contained the causal chain with minimal exposure.'
      : grade === 'B'
        ? 'The city stabilized, though one operational trade-off extended recovery time.'
        : grade === 'C'
          ? 'Critical systems survived, but gaps in the initial plan left significant population exposure.'
          : 'The selected measures could not fully contain the storm, grid and mobility cascade.';

    this.ui.showToast(`Simulation scored ${score}% / resilience grade ${grade}`);
    await wait(800);
    this.ui.showReport({
      title: `Resilience grade ${grade}`,
      lead: outcome,
      stats: [
        ['Resilience score', `${score}%`],
        ['Residents protected', protectedResidents],
        ['Effective measures', `${effective} full / ${partial} partial`],
        ['Budget deployed', `${this.initialSpend + this.adaptiveSpend} / 125 CR`]
      ],
      counterfactual: `${withoutAdaptation} residents remain exposed; estimated recovery ${recoveryHours} hours`
    });
    this.stage = 'complete';
    this.running = false;
  }

  _hasHeating(choices = this.initialChoices) {
    return choices.has('heatBravo') || choices.has('heatBoth');
  }

  _calculateInitialMetrics(choices = this.initialChoices, spend = this.initialSpend) {
    let safety = 0.52;
    let grid = 0.34;
    let energy = 1 - spend / 150;
    if (choices.has('northBarrier')) safety += 0.12;
    if (choices.has('westBarrier')) safety += 0.03;
    if (choices.has('earlyEvac')) safety += this._hasHeating(choices) ? 0.18 : 0.09;
    if (choices.has('localShelter')) safety += 0.1;
    if (this._hasHeating(choices)) safety += 0.06;
    if (choices.has('reinforceGrid')) grid += 0.4;
    if (choices.has('microgrid')) grid += 0.18;
    if (choices.has('heatBoth')) energy -= 0.1;
    return { safety: clamp(safety), grid: clamp(grid), energy: clamp(energy, 0.18, 1) };
  }

  _calculateFinalMetrics(results, initial = this.initialMetrics, choices = this.initialChoices, spend = this.adaptiveSpend) {
    let { safety, grid, energy } = initial;
    const effect = (id, complete, partial = complete * 0.45) => {
      const status = results.get(id);
      return status === 'completed' ? complete : status === 'partial' ? partial : 0;
    };
    safety += effect('extend', 0.09);
    safety += effect('boost', 0.06);
    safety += effect('rapid', 0.14, 0.07);
    safety += effect('shelterBackup', 0.08, 0.04);
    grid += effect('reroute', 0.36, 0.1);
    grid += effect('isolate', 0.16, 0.06);
    grid += choices.has('microgrid') ? 0.05 : 0;
    energy -= spend / 180;
    return { safety: clamp(safety), grid: clamp(grid), energy: clamp(energy, 0.12, 1) };
  }

  _score(metrics) {
    return clamp(metrics.safety * 0.5 + metrics.grid * 0.4 + metrics.energy * 0.1);
  }

  _adaptiveResults(choices) {
    return new Map([
      ['extend', choices.has('northBarrier') ? 'completed' : 'partial'],
      ['reroute', choices.has('reinforceGrid') ? 'partial' : 'completed'],
      ['boost', this._hasHeating(choices) ? 'completed' : 'failed'],
      ['rapid', this._hasHeating(choices) ? 'completed' : 'partial'],
      ['isolate', choices.has('reinforceGrid') ? 'partial' : 'completed'],
      ['shelterBackup', choices.has('localShelter') ? 'completed' : 'partial']
    ]);
  }

  _validPlans(options, budget, min, max) {
    const plans = [];
    for (let mask = 0; mask < 2 ** options.length; mask++) {
      const actions = options.filter((_, index) => mask & (1 << index));
      const cost = actions.reduce((total, action) => total + action.cost, 0);
      if (actions.length >= min && actions.length <= max && cost <= budget) {
        plans.push({ actions, cost, ids: new Set(actions.map((action) => action.id)) });
      }
    }
    return plans;
  }

  findBestStrategy(fixedInitial = null) {
    const initialPlans = fixedInitial
      ? [{ actions: INITIAL_MITIGATIONS.filter((action) => fixedInitial.has(action.id)), ids: fixedInitial, cost: this.initialSpend }]
      : this._validPlans(INITIAL_MITIGATIONS, 80, 3, 4);
    const emergencyPlans = this._validPlans(ADAPTIVE_MITIGATIONS, 45, 2, 3);
    let best = null;
    // Exhaustive search shares the live simulation's dependency and scoring functions.
    for (const initial of initialPlans) {
      const initialMetrics = this._calculateInitialMetrics(initial.ids, initial.cost);
      const outcomes = this._adaptiveResults(initial.ids);
      for (const emergency of emergencyPlans) {
        const results = new Map(emergency.actions.map((action) => [action.id, outcomes.get(action.id)]));
        const metrics = this._calculateFinalMetrics(results, initialMetrics, initial.ids, emergency.cost);
        const score = this._score(metrics);
        const cost = initial.cost + emergency.cost;
        if (!best || score > best.score + 1e-10 || (Math.abs(score - best.score) < 1e-10 && cost < best.cost)) {
          best = { initial, emergency, metrics, results, score, cost };
        }
      }
    }
    return best;
  }

  showBestStrategy() {
    const best = this.findBestStrategy();
    const adapting = this.stage === 'adaptive-choice';
    const recovery = adapting ? this.findBestStrategy(this.initialChoices) : null;
    const displayed = recovery ?? best;
    const canApply = adapting || this.stage === 'initial-choice' || this.stage === 'observe' || this.stage === 'complete';
    this.ui.showStrategyGuide({
      best,
      recovery,
      projectedScore: Math.round(displayed.score * 100),
      applyLabel: adapting ? 'Use best recovery choices' : this.stage === 'complete' ? 'Retry with best strategy' : 'Use best initial choices',
      canApply
    });
  }

  async applyBestStrategy() {
    if (this.running) return;
    if (this.stage === 'adaptive-choice') {
      this.ui.applyChoices([...this.findBestStrategy(this.initialChoices).emergency.ids]);
    } else if (this.stage === 'initial-choice') {
      this.ui.applyChoices([...this.findBestStrategy().initial.ids]);
    } else if (this.stage === 'complete' || this.stage === 'observe') {
      if (this.stage === 'complete') this.restart();
      await this.generate();
      if (this.stage === 'initial-choice') this.ui.applyChoices([...this.findBestStrategy().initial.ids]);
    }
  }

  _setMetrics(metrics) {
    this.ui.setMetric('safety', metrics.safety);
    this.ui.setMetric('grid', metrics.grid);
    this.ui.setMetric('energy', metrics.energy);
  }

  restart() {
    this._runId++;
    this.running = false;
    this.stage = 'observe';
    this.initialChoices.clear();
    this.adaptiveChoices.clear();
    this.choiceResults.clear();
    this.clearEffects();
    this.city.reset();
    this.ui.reset();
  }

  dispose() {
    this._runId++;
  }
}
