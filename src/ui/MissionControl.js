import { EventEmitter } from '../utils/EventEmitter.js';

const STATUS_LABELS = {
  queued: 'Queued',
  selected: 'Selected',
  active: 'Active',
  completed: 'Complete',
  partial: 'Partial',
  failed: 'Failed',
  blocked: 'Superseded'
};

/** DOM-only mission shell. The Three.js viewport remains the visual focus. */
export class MissionControl extends EventEmitter {
  constructor(root, config) {
    super();
    this.root = root;
    this.config = config;
    this.steps = new Map();

    root.innerHTML = `
      <header class="command-bar">
        <div class="command-brand">
          <span class="command-brand__mark">P</span>
          <div><strong>PLAN AI</strong><small>Urban Resilience Lab</small></div>
        </div>
        <div class="phase-rail" aria-label="Mission phase">
          ${['Observe', 'Plan', 'Execute', 'Adapt', 'Recover']
            .map((phase) => `<span data-phase="${phase.toLowerCase()}">${phase}</span>`)
            .join('')}
        </div>
        <nav class="scenario-switch" aria-label="Scenario selection">
          <a href="?scenario=frozen" data-short="01" class="${config.id === 'frozen' ? 'is-active' : ''}">01 Frost</a>
          <a href="?scenario=flood" data-short="02" class="${config.id === 'flood' ? 'is-active' : ''}">02 Flood</a>
          <a href="?scenario=heat" data-short="03" class="${config.id === 'heat' ? 'is-active' : ''}">03 Heat</a>
          <a href="?scenario=wildfire" data-short="04" class="${config.id === 'wildfire' ? 'is-active' : ''}">04 Fire</a>
          <a href="?lab=1">VFX Lab</a>
        </nav>
      </header>

      <aside class="mission-panel mission-panel--brief">
        <p class="eyebrow">Mission ${config.number} / ${config.category}</p>
        <h1>${config.title}<br><em>${config.accentTitle}</em></h1>
        <p class="mission-copy">${config.summary}</p>
        <div class="threat-readout">
          <span><small>Impact estimate</small><strong data-countdown>00:00</strong></span>
          <span><small>Threat level</small><strong class="status-severe">${config.threat}</strong></span>
        </div>
        <div class="constraint-list">
          ${config.constraints.map((constraint) => `<span>${constraint}</span>`).join('')}
        </div>
        <button class="primary-action" data-action="primary">
          <span data-primary-label>Generate response plan</span>
          <i aria-hidden="true">&#8594;</i>
        </button>
        <button class="strategy-help" data-action="best-strategy" hidden>Show Best Strategy</button>
      </aside>

      <aside class="mission-panel mission-panel--plan" data-plan-panel>
        <div class="panel-heading">
          <div><p class="eyebrow">PLAN AI / Strategy</p><h2 data-strategy>Awaiting analysis</h2></div>
          <span class="confidence" data-confidence>--</span>
        </div>
        <div class="plan-rationale" data-rationale>Generate a plan to compare response strategies and expose operational dependencies.</div>
        <div class="choice-budget" data-choice-summary hidden>
          <span><small>Decision budget</small><strong data-choice-budget>0 / 0</strong></span>
          <span><small>Actions selected</small><strong data-choice-count>0 / 0</strong></span>
        </div>
        <div class="plan-steps" data-plan-steps></div>
      </aside>

      <section class="city-metrics" aria-label="City resilience telemetry">
        ${config.metrics
          .map(
            (metric) =>
              `<article><small>${metric.label}</small><strong data-metric="${metric.id}">${Math.round(metric.value * 100)}%</strong><i style="--value:${metric.value}"></i></article>`
          )
          .join('')}
      </section>

      <div class="world-callout" data-world-callout>
        <small data-world-kicker>City action</small>
        <strong data-world-title>System update</strong>
        <span data-world-detail></span>
      </div>

      <div class="event-overlay" data-event-overlay role="dialog" aria-modal="true" aria-labelledby="event-title">
        <div class="event-card">
          <p class="eyebrow">${config.disruption.kicker}</p>
          <span class="event-icon">!</span>
          <h2 id="event-title" data-event-title>${config.disruption.title}</h2>
          <p data-event-body>${config.disruption.body}</p>
          <div class="viability"><span>Current plan viability</span><strong data-event-viability>${config.disruption.viability}</strong></div>
          <button class="primary-action primary-action--alert" data-action="replan"><span>Authorize re-plan</span><i>&#8594;</i></button>
        </div>
      </div>

      <div class="mission-report" data-report role="dialog" aria-modal="true" aria-labelledby="report-title">
        <div class="report-card">
          <p class="eyebrow">Simulation complete / Adaptive response</p>
          <h2 id="report-title" data-report-title>City stabilized</h2>
          <p class="report-lead" data-report-lead>${config.report.lead}</p>
          <div class="report-grid" data-report-grid>
            ${config.report.stats
              .map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`)
              .join('')}
          </div>
          <div class="counterfactual"><small>Without re-planning</small><strong data-report-counterfactual>${config.report.counterfactual}</strong></div>
          <button class="primary-action" data-action="restart"><span>Run simulation again</span><i>&#8635;</i></button>
          <button class="strategy-help" data-action="best-strategy" hidden>Show Best Strategy / Answer Key</button>
        </div>
      </div>

      <div class="strategy-guide" data-strategy-guide hidden role="dialog" aria-modal="true" aria-labelledby="strategy-guide-title">
        <section class="strategy-guide__card">
          <p class="eyebrow" data-guide-kicker>Scenario / Answer key</p>
          <h2 id="strategy-guide-title">Best mitigation strategy</h2>
          <p data-guide-intro></p>
          <div data-guide-content></div>
          <button class="primary-action" data-action="apply-best"><span data-guide-apply-label>Use best choices</span><i aria-hidden="true">&#8594;</i></button>
          <button class="strategy-help" data-action="close-guide">Close answer key</button>
        </section>
      </div>

      <div class="system-toast" data-system-toast></div>
    `;

    this.primary = root.querySelector('[data-action="primary"]');
    this.primaryLabel = root.querySelector('[data-primary-label]');
    this.planPanel = root.querySelector('[data-plan-panel]');
    this.planSteps = root.querySelector('[data-plan-steps]');
    this.choiceSummary = root.querySelector('[data-choice-summary]');
    this.choiceBudget = root.querySelector('[data-choice-budget]');
    this.choiceCount = root.querySelector('[data-choice-count]');
    this.strategy = root.querySelector('[data-strategy]');
    this.confidence = root.querySelector('[data-confidence]');
    this.rationale = root.querySelector('[data-rationale]');
    this.eventOverlay = root.querySelector('[data-event-overlay]');
    this.eventTitle = root.querySelector('[data-event-title]');
    this.eventBody = root.querySelector('[data-event-body]');
    this.eventViability = root.querySelector('[data-event-viability]');
    this.report = root.querySelector('[data-report]');
    this.reportTitle = root.querySelector('[data-report-title]');
    this.reportLead = root.querySelector('[data-report-lead]');
    this.reportGrid = root.querySelector('[data-report-grid]');
    this.reportCounterfactual = root.querySelector('[data-report-counterfactual]');
    this.toast = root.querySelector('[data-system-toast]');
    this.worldCallout = root.querySelector('[data-world-callout]');
    this.worldKicker = root.querySelector('[data-world-kicker]');
    this.worldTitle = root.querySelector('[data-world-title]');
    this.worldDetail = root.querySelector('[data-world-detail]');
    this.countdown = root.querySelector('[data-countdown]');
    this._primaryMode = 'generate';
    this.selectedChoices = new Set();
    this.choiceOptions = new Map();
    this.choiceRules = null;
    this.choiceLocked = false;
    this.strategyGuide = root.querySelector('[data-strategy-guide]');
    this.guideApply = root.querySelector('[data-action="apply-best"]');
    this._toastTimer = 0;
    this._worldCalloutTimer = 0;
    this.remainingSeconds = config.countdownSeconds;
    this.countdownRunning = true;

    this.primary.addEventListener('click', () => this.emit(this._primaryMode));
    root.querySelector('[data-action="replan"]').addEventListener('click', () => this.emit('replan'));
    root.querySelector('[data-action="restart"]').addEventListener('click', () => this.emit('restart'));
    for (const button of root.querySelectorAll('[data-action="best-strategy"]')) {
      button.addEventListener('click', () => this.emit('best-strategy'));
    }
    root.querySelector('[data-action="close-guide"]').addEventListener('click', () => this.hideStrategyGuide());
    this.guideApply.addEventListener('click', () => {
      this.hideStrategyGuide();
      this.emit('apply-best-strategy');
    });
    this.strategyGuide.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.hideStrategyGuide();
      if (event.key !== 'Tab') return;
      const buttons = [...this.strategyGuide.querySelectorAll('button:not(:disabled)')];
      const next = buttons.indexOf(document.activeElement) + (event.shiftKey ? -1 : 1);
      event.preventDefault();
      buttons[(next + buttons.length) % buttons.length]?.focus();
    });
    root.addEventListener('pointerdown', (event) => event.stopPropagation());

    this.setPhase('observe');
    this._renderCountdown();
  }

  setPhase(phase) {
    for (const node of this.root.querySelectorAll('[data-phase]')) {
      node.classList.toggle('is-active', node.dataset.phase === phase);
    }
    this.root.dataset.phase = phase;
  }

  setAnalyzing() {
    this.setPhase('plan');
    this.primary.disabled = true;
    this.primaryLabel.textContent = 'Evaluating 3 strategies...';
    this.strategy.textContent = 'Mapping dependencies';
    this.confidence.textContent = '...';
    this.rationale.textContent = this.config.plan.initial.rationale;
    this.planPanel.classList.add('is-visible', 'is-scanning');
  }

  setPlan(steps, options = {}) {
    const { adapted = false } = options;
    const planConfig = adapted ? this.config.plan.adapted : this.config.plan.initial;
    this.steps.clear();
    this.selectedChoices.clear();
    this.choiceOptions.clear();
    this.choiceRules = null;
    this.choiceLocked = false;
    this.choiceSummary.hidden = true;
    this.planPanel.classList.remove('is-choice-mode');
    this.planSteps.innerHTML = '';
    for (const [index, step] of steps.entries()) {
      const node = document.createElement('div');
      node.className = `plan-step is-${step.status ?? 'queued'}`;
      node.dataset.step = step.id;
      node.innerHTML = `
        <span class="plan-step__index">${String(index + 1).padStart(2, '0')}</span>
        <span class="plan-step__copy"><strong>${step.label}</strong><small>${step.detail}</small></span>
        <span class="plan-step__status">${STATUS_LABELS[step.status ?? 'queued']}</span>
      `;
      this.planSteps.appendChild(node);
      this.steps.set(step.id, node);
    }
    this.planPanel.classList.remove('is-scanning');
    this.planPanel.classList.add('is-visible');
    this.strategy.textContent = options.strategy ?? planConfig.strategy;
    this.confidence.textContent = options.confidence ?? planConfig.confidence;
    this.rationale.textContent = options.rationale ?? planConfig.rationale;
  }

  setChoices(options, rules = {}) {
    const {
      budget = 100,
      minSelected = 2,
      maxSelected = 4,
      adapted = false,
      strategy,
      confidence,
      rationale,
      actionLabel = adapted ? 'Deploy emergency response' : 'Deploy selected measures'
    } = rules;
    const planConfig = adapted ? this.config.plan.adapted : this.config.plan.initial;

    this.steps.clear();
    this.selectedChoices.clear();
    this.choiceOptions = new Map(options.map((option) => [option.id, option]));
    this.choiceRules = { budget, minSelected, maxSelected, actionLabel };
    this.choiceLocked = false;
    this.planSteps.innerHTML = '';
    this.choiceSummary.hidden = false;
    this.planPanel.classList.remove('is-scanning');
    this.planPanel.classList.add('is-visible', 'is-choice-mode');
    this.strategy.textContent = strategy ?? planConfig.strategy;
    this.confidence.textContent = confidence ?? planConfig.confidence;
    this.rationale.textContent = rationale ?? planConfig.rationale;

    for (const option of options) {
      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'mitigation-card';
      node.dataset.choice = option.id;
      node.setAttribute('aria-pressed', 'false');
      node.innerHTML = `
        <span class="mitigation-card__meta"><i>${option.category ?? 'Mitigation'}</i><b>${option.cost} CR</b></span>
        <span class="mitigation-card__copy"><strong>${option.label}</strong><small>${option.detail}</small></span>
        <span class="mitigation-card__risk">${option.risk ?? 'Operational trade-off modeled'}</span>
        <span class="mitigation-card__status">Available</span>
      `;
      node.addEventListener('click', () => this._toggleChoice(option.id));
      this.planSteps.appendChild(node);
      this.steps.set(option.id, node);
    }

    this._primaryMode = 'execute';
    this.primaryLabel.textContent = actionLabel;
    this._updateChoiceSummary();
  }

  _toggleChoice(id) {
    if (this.choiceLocked || !this.choiceRules) return;
    const option = this.choiceOptions.get(id);
    const node = this.steps.get(id);
    if (!option || !node) return;

    if (this.selectedChoices.has(id)) {
      this.selectedChoices.delete(id);
      node.classList.remove('is-selected');
      node.setAttribute('aria-pressed', 'false');
      node.querySelector('.mitigation-card__status').textContent = 'Available';
      this._updateChoiceSummary();
      return;
    }

    const spent = this.getChoiceSpend();
    if (this.selectedChoices.size >= this.choiceRules.maxSelected) {
      this.showToast(`Action limit reached / maximum ${this.choiceRules.maxSelected}`);
      return;
    }
    if (spent + option.cost > this.choiceRules.budget) {
      this.showToast(`Insufficient decision budget / ${option.cost} credits required`);
      return;
    }

    this.selectedChoices.add(id);
    node.classList.add('is-selected');
    node.setAttribute('aria-pressed', 'true');
    node.querySelector('.mitigation-card__status').textContent = STATUS_LABELS.selected;
    this._updateChoiceSummary();
  }

  _updateChoiceSummary() {
    if (!this.choiceRules) return;
    const spent = this.getChoiceSpend();
    this.choiceBudget.textContent = `${spent} / ${this.choiceRules.budget} CR`;
    this.choiceCount.textContent = `${this.selectedChoices.size} / ${this.choiceRules.maxSelected}`;
    this.primary.disabled = this.selectedChoices.size < this.choiceRules.minSelected;
  }

  getChoiceSpend() {
    let total = 0;
    for (const id of this.selectedChoices) total += this.choiceOptions.get(id)?.cost ?? 0;
    return total;
  }

  getSelectedChoices() {
    return [...this.selectedChoices];
  }

  enableStrategyGuide() {
    for (const button of this.root.querySelectorAll('[data-action="best-strategy"]')) button.hidden = false;
  }

  applyChoices(ids) {
    if (this.choiceLocked || !this.choiceRules) return;
    const options = [...new Set(ids)].map((id) => this.choiceOptions.get(id));
    if (options.some((option) => !option)
      || options.length < this.choiceRules.minSelected
      || options.length > this.choiceRules.maxSelected
      || options.reduce((cost, option) => cost + option.cost, 0) > this.choiceRules.budget) return;
    for (const id of [...this.selectedChoices]) this._toggleChoice(id);
    for (const option of options) this._toggleChoice(option.id);
    this.showToast('Best choices selected / review, then deploy');
  }

  showStrategyGuide({ best, recovery, projectedScore, applyLabel, canApply, weights = [0.5, 0.4, 0.1] }) {
    this._guideReturnFocus = document.activeElement;
    this.root.querySelector('[data-guide-kicker]').textContent = `${this.config.title} ${this.config.accentTitle} / Answer key`;
    const intro = this.root.querySelector('[data-guide-intro]');
    intro.textContent = `Highest score in this scenario: ${Math.round(best.score * 100)}%. Every legal combination is compared within the 80 + 45 credit budgets. Follow both stages to reproduce this score in the current game model.`;
    const content = this.root.querySelector('[data-guide-content]');
    content.replaceChildren();
    const reasons = {
      northBarrier: 'Absorbs the primary ice front and supports a connected barrier extension.',
      westBarrier: 'Low cost, but the wind shift bypasses it; the overall combination balances this loss elsewhere.',
      heatBravo: 'Provides the heated circuit needed for safe evacuation and later heating boosts.',
      heatBoth: 'Provides route redundancy, with higher credit and energy costs.',
      earlyEvac: 'Reduces population exposure before impact; benefits most from a heated route.',
      localShelter: 'Protects residents locally and makes emergency shelter expansion fully effective.',
      microgrid: 'Protects hospital loads if the district fails and adds hospital redundancy even when the reinforced transformer holds.',
      reinforceGrid: 'Prevents the full East Grid outage, reducing the need for emergency power restoration.',
      extend: 'Closes the secondary ice path; only partly effective without a prepared north barrier.',
      reroute: 'Restores district power after East Grid failure; smaller benefit if the transformer already held.',
      boost: 'Improves safe mobility only when a heating circuit was installed in stage 1.',
      rapid: 'Protects more residents; heated routes avoid congestion and exposure.',
      isolate: 'Stops an electrical cascade; isolation alone does not restore lost power.',
      shelterBackup: 'Expands refuge capacity; fully effective with the stage 1 shelter network.'
    };
    const addPlan = (title, plan, budget, results, explanations) => {
      const section = document.createElement('section');
      const heading = document.createElement('h3');
      heading.textContent = `${title} / ${plan.cost} of ${budget} CR`;
      section.appendChild(heading);
      const list = document.createElement('ol');
      for (const action of plan.actions) {
        const item = document.createElement('li');
        const label = document.createElement('strong');
        label.textContent = `${action.label} (${action.cost} CR)${results ? ` / ${STATUS_LABELS[results.get(action.id)]}` : ''}`;
        const reason = document.createElement('small');
        reason.textContent = explanations?.get(action.id)?.reason ?? action.rationale ?? reasons[action.id] ?? action.detail;
        item.append(label, reason);
        list.appendChild(item);
      }
      section.appendChild(list);
      content.appendChild(section);
    };
    addPlan('1. Best preparation', best.initial, 80, best.initialResults, best.initialOutcomes);
    addPlan('2. Best emergency response', best.emergency, 45, best.results, best.outcomes);
    const explanation = document.createElement('p');
    const metricKeys = ['safety', 'grid', 'energy'];
    const metricNames = metricKeys.map((id) => this.config.metrics.find((metric) => metric.id === id)?.label ?? id);
    const weightText = metricNames.map((label, index) => `${label} ${Math.round(weights[index] * 100)}%`).join(', ');
    const outcomeText = metricNames.map((label, index) => `${Math.round(best.metrics[metricKeys[index]] * 100)}% ${label}`).join(', ');
    explanation.textContent = `Why this combination wins: score weights are ${weightText}. Together these choices finish at ${outcomeText}. The highest combined score wins; equal scores favor the lower total cost. It is not necessary for every individual action to be fully effective.`;
    content.appendChild(explanation);
    if (recovery) {
      const note = document.createElement('p');
      note.textContent = `Your preparation is already committed. Best recovery from your current choices: ${projectedScore}%. This may differ from the full-run maximum above.`;
      content.appendChild(note);
      addPlan('Best recovery for this run', recovery.emergency, 45, recovery.results, recovery.outcomes);
    }
    const note = document.createElement('p');
    note.textContent = canApply ? 'Using these choices replaces your current selection. You still choose when to deploy.' : 'The current phase is already committed. Review the answer now, then apply it at the next decision window or retry after the report.';
    content.appendChild(note);
    this.guideApply.disabled = !canApply;
    this.root.querySelector('[data-guide-apply-label]').textContent = applyLabel;
    this.strategyGuide.hidden = false;
    this.root.querySelector('[data-action="close-guide"]').focus({ preventScroll: true });
    this.strategyGuide.querySelector('.strategy-guide__card').scrollTop = 0;
  }

  hideStrategyGuide() {
    this.strategyGuide.hidden = true;
    this._guideReturnFocus?.focus();
  }

  lockChoices() {
    this.choiceLocked = true;
    for (const [id, node] of this.steps) {
      node.disabled = true;
      const selected = this.selectedChoices.has(id);
      node.classList.toggle('is-unselected', !selected);
      const status = node.querySelector('.mitigation-card__status');
      if (status) status.textContent = selected ? STATUS_LABELS.queued : 'Not deployed';
    }
  }

  setReady(label = 'Execute simulation') {
    this.primary.disabled = false;
    this._primaryMode = 'execute';
    this.primaryLabel.textContent = label;
    this.showToast('Response plan ready / 3 strategies evaluated');
  }

  setExecuting() {
    this.setPhase('execute');
    this.primary.disabled = true;
    this.primaryLabel.textContent = 'Simulation in progress';
  }

  setStepStatus(id, status) {
    const node = this.steps.get(id);
    if (!node) return;
    const isChoice = node.classList.contains('mitigation-card');
    node.className = `${isChoice ? 'mitigation-card' : 'plan-step'} is-${status}`;
    const label = node.querySelector(isChoice ? '.mitigation-card__status' : '.plan-step__status');
    if (label) label.textContent = STATUS_LABELS[status] ?? status;
    if (status === 'active') node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  showDisruption(details = {}) {
    this.eventTitle.textContent = details.title ?? this.config.disruption.title;
    this.eventBody.textContent = details.body ?? this.config.disruption.body;
    this.eventViability.textContent = details.viability ?? this.config.disruption.viability;
    this.setPhase('adapt');
    this.eventOverlay.classList.add('is-visible');
  }

  hideDisruption() {
    this.eventOverlay.classList.remove('is-visible');
  }

  setReplanning() {
    this.hideDisruption();
    this.strategy.textContent = 'Re-calculating response';
    this.confidence.textContent = '...';
    this.rationale.textContent = this.config.plan.adapted.rationale;
    this.planPanel.classList.add('is-scanning');
  }

  setMetric(metric, value, display = `${Math.round(value * 100)}%`) {
    const node = this.root.querySelector(`[data-metric="${metric}"]`);
    if (!node) return;
    node.textContent = display;
    node.parentElement.querySelector('i')?.style.setProperty('--value', value);
  }

  showReport(report = this.config.report) {
    this.reportTitle.textContent = report.title ?? 'City stabilized';
    this.reportLead.textContent = report.lead ?? this.config.report.lead;
    const stats = report.stats ?? this.config.report.stats;
    this.reportGrid.innerHTML = stats
      .map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`)
      .join('');
    this.reportCounterfactual.textContent = report.counterfactual ?? this.config.report.counterfactual;
    this.setPhase('recover');
    this.countdownRunning = false;
    this.report.classList.add('is-visible');
  }

  showWorldCallout(kind, title, detail, duration = 2400) {
    this.worldCallout.dataset.kind = kind;
    this.worldKicker.textContent = kind === 'hazard' ? 'VFX = live threat' : kind === 'action' ? 'PLAN AI = city response' : 'PLAN AI = analysis';
    this.worldTitle.textContent = title;
    this.worldDetail.textContent = detail;
    this.worldCallout.classList.add('is-visible');
    clearTimeout(this._worldCalloutTimer);
    this._worldCalloutTimer = setTimeout(
      () => this.worldCallout.classList.remove('is-visible'),
      duration
    );
  }

  reset() {
    this.hideStrategyGuide();
    this.report.classList.remove('is-visible');
    this.eventOverlay.classList.remove('is-visible');
    this.planPanel.classList.remove('is-visible', 'is-scanning');
    this.worldCallout.classList.remove('is-visible');
    this.planSteps.innerHTML = '';
    this.steps.clear();
    this.selectedChoices.clear();
    this.choiceOptions.clear();
    this.choiceRules = null;
    this.choiceLocked = false;
    this.choiceSummary.hidden = true;
    this.planPanel.classList.remove('is-choice-mode');
    this._primaryMode = 'generate';
    this.primary.disabled = false;
    this.primaryLabel.textContent = 'Generate response plan';
    this.strategy.textContent = 'Awaiting analysis';
    this.confidence.textContent = '--';
    this.rationale.textContent = 'Generate a plan to compare response strategies and expose operational dependencies.';
    for (const metric of this.config.metrics) this.setMetric(metric.id, metric.value);
    this.remainingSeconds = this.config.countdownSeconds;
    this.countdownRunning = true;
    this._renderCountdown();
    this.setPhase('observe');
  }

  update(dt) {
    if (!this.countdownRunning) return;
    const previous = Math.ceil(this.remainingSeconds);
    this.remainingSeconds = Math.max(0, this.remainingSeconds - dt);
    if (Math.ceil(this.remainingSeconds) !== previous) this._renderCountdown();
  }

  _renderCountdown() {
    const seconds = Math.ceil(this.remainingSeconds);
    const minutes = Math.floor(seconds / 60);
    this.countdown.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  showToast(message, duration = 2100) {
    this.toast.textContent = message;
    this.toast.classList.add('is-visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toast.classList.remove('is-visible'), duration);
  }

  dispose() {
    clearTimeout(this._toastTimer);
    clearTimeout(this._worldCalloutTimer);
    this.clear();
    this.root.innerHTML = '';
  }
}
