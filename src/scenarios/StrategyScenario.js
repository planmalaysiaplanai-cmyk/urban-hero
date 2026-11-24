import { evaluateStrategy, findBestStrategy, isValidPlan, resilienceGrade } from './StrategyModel.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Deployment and recommendations both consume the same evaluated dependency outcomes. */
export class StrategyScenario {
  constructor({ city, ui, hazard, clear, delay = wait }, definition) {
    Object.assign(this, { city, ui, hazard, clearEffects: clear, definition, delay });
    this.stage = 'observe';
    this.running = false;
    this._runId = 0;
    this.initialChoices = new Set();
    this.emergencyChoices = new Set();
    this.ui.on('generate', () => this.generate());
    this.ui.on('execute', () => this.execute());
    this.ui.on('replan', () => this.prepareAdaptation());
    this.ui.on('restart', () => this.restart());
    this.ui.on('best-strategy', () => this.showBestStrategy());
    this.ui.on('apply-best-strategy', () => this.applyBestStrategy());
    this.ui.enableStrategyGuide();
  }

  _commands(commands = []) {
    for (const [method, ...args] of commands) this.city[method](...args);
  }

  _setMetrics(metrics) {
    for (const [id, value] of Object.entries(metrics)) this.ui.setMetric(id, value);
  }

  async generate() {
    if (this.running || this.stage !== 'observe') return;
    this.running = true;
    const runId = ++this._runId;
    this.ui.setAnalyzing();
    this.city.setAnalysis(true);
    this.ui.showWorldCallout('analysis', 'CITY DIGITAL TWIN', this.definition.analysis);
    await this.delay(1300);
    if (runId !== this._runId) return;
    this.city.setAnalysis(false);
    this.ui.setChoices(this.definition.initial, {
      budget: 80, minSelected: 3, maxSelected: 4,
      strategy: 'Choose your preparation', confidence: '3-4',
      rationale: 'Choose 3-4 measures within 80 credits. Read each dependency: actions can succeed, partly work or fail when the disruption arrives.'
    });
    this.stage = 'initial-choice';
    this.running = false;
    this.ui.showToast('Preparation window / 80 credits / select 3-4 measures');
  }

  execute() {
    if (this.stage === 'initial-choice') return this.executeInitialPlan();
    if (this.stage === 'adaptive-choice') return this.executeAdaptivePlan();
  }

  async executeInitialPlan() {
    if (this.running || this.stage !== 'initial-choice') return;
    const choices = new Set(this.ui.getSelectedChoices());
    if (!isValidPlan(this.definition.initial, choices, 80, 3, 4)) return;
    this.initialChoices = choices;
    this.running = true;
    this.stage = 'initial-running';
    const runId = ++this._runId;
    this.ui.lockChoices();
    this.ui.setExecuting();
    this._commands(this.definition.start);
    for (const action of this.definition.initial) {
      if (!choices.has(action.id)) continue;
      if (runId !== this._runId) return;
      this.ui.setStepStatus(action.id, 'active');
      this._commands(action.commands);
      this.ui.showWorldCallout('action', action.label, action.detail);
      await this.delay(850);
      if (runId !== this._runId) return;
      this.ui.setStepStatus(action.id, 'completed');
    }
    if (runId !== this._runId) return;
    this.ui.showWorldCallout('hazard', this.definition.disruptionTitle, this.definition.analysis, 3300);
    if (!this.definition.hazardWhen || this.definition.hazardWhen(choices)) this.hazard(...this.definition.hazard);
    await this.delay(700);
    if (runId !== this._runId) return;
    this.definition.shock(this.city, choices);
    const evaluated = evaluateStrategy(this.definition, choices);
    for (const [id, outcome] of evaluated.initialOutcomes) this.ui.setStepStatus(id, outcome.status);
    this._setMetrics(evaluated.initialMetrics);
    await this.delay(900);
    if (runId !== this._runId) return;
    this.stage = 'disrupted';
    this.running = false;
    this.ui.showDisruption({
      title: this.definition.disruptionTitle,
      body: this.definition.disruption(evaluated, choices),
      viability: `${Math.round(evaluated.score * 100)}%`
    });
  }

  async prepareAdaptation() {
    if (this.running || this.stage !== 'disrupted') return;
    this.running = true;
    const runId = ++this._runId;
    this.ui.setReplanning();
    this.city.setAnalysis(true);
    await this.delay(1100);
    if (runId !== this._runId) return;
    this.city.setAnalysis(false);
    this.ui.setChoices(this.definition.emergency, {
      adapted: true, budget: 45, minSelected: 2, maxSelected: 3,
      strategy: 'Emergency decision window', confidence: '2-3',
      rationale: 'Choose 2-3 actions within 45 credits. Actions deploy in the displayed order; later actions may require earlier actions to succeed.',
      actionLabel: 'Execute emergency measures'
    });
    this.ui.setPhase('adapt');
    this.stage = 'adaptive-choice';
    this.running = false;
  }

  async executeAdaptivePlan() {
    if (this.running || this.stage !== 'adaptive-choice') return;
    const choices = new Set(this.ui.getSelectedChoices());
    if (!isValidPlan(this.definition.emergency, choices, 45, 2, 3)) return;
    this.emergencyChoices = choices;
    const evaluated = evaluateStrategy(this.definition, this.initialChoices, choices);
    this.running = true;
    this.stage = 'adaptive-running';
    const runId = ++this._runId;
    this.ui.lockChoices();
    this.ui.setExecuting();
    this.ui.setPhase('adapt');
    const deployed = new Set();
    for (const action of this.definition.emergency) {
      if (!choices.has(action.id)) continue;
      if (runId !== this._runId) return;
      const outcome = evaluated.outcomes.get(action.id);
      this.ui.setStepStatus(action.id, 'active');
      if (outcome.status !== 'failed') this._commands(action.commands);
      this.ui.showWorldCallout(outcome.status === 'completed' ? 'action' : 'hazard', action.label, outcome.reason, 3000);
      await this.delay(1000);
      if (runId !== this._runId) return;
      this.ui.setStepStatus(action.id, outcome.status);
      deployed.add(action.id);
      this._setMetrics(evaluateStrategy(this.definition, this.initialChoices, deployed).metrics);
    }
    if (runId !== this._runId) return;
    this.definition.finish(this.city, evaluated);
    this._setMetrics(evaluated.metrics);
    await this.delay(800);
    if (runId !== this._runId) return;
    const score = Math.round(evaluated.score * 100);
    const grade = resilienceGrade(evaluated.score);
    const outcomes = [...evaluated.outcomes.values()];
    const full = outcomes.filter((outcome) => outcome.status === 'completed').length;
    const failed = outcomes.filter((outcome) => outcome.status === 'failed').length;
    const partial = outcomes.length - full - failed;
    const exposed = Math.round(this.definition.residents * (1 - evaluated.initialMetrics.safety)).toLocaleString('en-US');
    this.ui.showReport({
      title: `Resilience grade ${grade}`,
      lead: `${grade === 'A' ? 'Prepared systems and emergency adaptation protect the city.' : grade === 'B' ? 'Most systems recover, with remaining exposure.' : grade === 'C' ? 'Partial recovery leaves important resilience gaps.' : 'The response leaves a substantial system and population risk.'} Emergency measures: ${full} effective, ${partial} partial, ${failed} failed. Use the answer key to compare choices and understand dependencies.`,
      stats: [
        ['Resilience score', `${score}%`],
        ['Residents protected', Math.round(this.definition.residents * evaluated.metrics.safety).toLocaleString('en-US')],
        ['Emergency measures', `${full} full / ${partial} partial / ${failed} failed`],
        ['Budget deployed', `${evaluated.initialCost + evaluated.emergencyCost} / 125 CR`]
      ],
      counterfactual: `${exposed} residents remain exposed without emergency adaptation`
    });
    this.stage = 'complete';
    this.running = false;
  }

  findBestStrategy(fixedInitial = null) { return findBestStrategy(this.definition, fixedInitial); }

  showBestStrategy() {
    const best = this.findBestStrategy();
    const recovery = this.stage === 'adaptive-choice' ? this.findBestStrategy(this.initialChoices) : null;
    this.ui.showStrategyGuide({
      best, recovery, projectedScore: Math.round((recovery ?? best).score * 100),
      weights: this.definition.weights,
      canApply: !this.running && ['observe', 'initial-choice', 'adaptive-choice', 'complete'].includes(this.stage),
      applyLabel: recovery ? 'Use best recovery choices' : this.stage === 'complete' ? 'Retry with best strategy' : 'Use best initial choices'
    });
  }

  async applyBestStrategy() {
    if (this.running) return;
    if (this.stage === 'adaptive-choice') {
      this.ui.applyChoices([...this.findBestStrategy(this.initialChoices).emergency.ids]);
    } else if (this.stage === 'initial-choice') {
      this.ui.applyChoices([...this.findBestStrategy().initial.ids]);
    } else if (this.stage === 'observe' || this.stage === 'complete') {
      if (this.stage === 'complete') this.restart();
      await this.generate();
      if (this.stage === 'initial-choice') this.ui.applyChoices([...this.findBestStrategy().initial.ids]);
    }
  }

  restart() {
    this._runId++;
    this.running = false;
    this.stage = 'observe';
    this.initialChoices.clear();
    this.emergencyChoices.clear();
    this.clearEffects();
    this.city.reset();
    this.ui.reset();
  }

  dispose() { this._runId++; }
}
