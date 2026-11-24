import { StrategyScenario } from './StrategyScenario.js';
import { WILDFIRE_STRATEGY } from './strategyDefinitions.js';

export class EmberProtocolScenario extends StrategyScenario {
  constructor(context) {
    super(context, WILDFIRE_STRATEGY);
  }
}
