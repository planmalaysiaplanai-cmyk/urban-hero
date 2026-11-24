import { StrategyScenario } from './StrategyScenario.js';
import { FLOOD_STRATEGY } from './strategyDefinitions.js';

export class RisingTideScenario extends StrategyScenario {
  constructor(context) {
    super(context, FLOOD_STRATEGY);
  }
}
