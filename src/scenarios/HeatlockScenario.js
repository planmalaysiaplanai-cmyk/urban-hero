import { StrategyScenario } from './StrategyScenario.js';
import { HEAT_STRATEGY } from './strategyDefinitions.js';

export class HeatlockScenario extends StrategyScenario {
  constructor(context) {
    super(context, HEAT_STRATEGY);
  }
}
