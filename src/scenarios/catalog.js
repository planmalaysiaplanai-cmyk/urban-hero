export const SCENARIO_CONFIGS = {
  frozen: {
    id: 'frozen',
    number: '01',
    category: 'Climate + Energy',
    title: 'The Frozen',
    accentTitle: 'Storm',
    summary:
      'Protect the city, restore critical power and evacuate civilians before the cryogenic supercell reaches Sector C.',
    countdownSeconds: 272,
    threat: 'Severe',
    constraints: [
      'Hospital power protected',
      'Energy use below 60%',
      'Prioritize civilian safety'
    ],
    metrics: [
      { id: 'safety', label: 'Population safety', value: 0.78 },
      { id: 'grid', label: 'Grid stability', value: 0.64 },
      { id: 'energy', label: 'Emergency energy', value: 1 }
    ],
    plan: {
      initial: {
        strategy: 'Controlled containment',
        confidence: '87%',
        rationale: 'Use physical storm barriers, a heated evacuation route and staged backup power before impact.'
      },
      adapted: {
        strategy: 'Adaptive containment',
        confidence: '91%',
        rationale: 'Extend the physical barrier, isolate the transformer and feed the hospital from a verified western circuit.'
      }
    },
    disruption: {
      kicker: 'Compound disruption / Ice + Energy',
      title: 'Barrier breach and grid failure',
      body: 'The changed wind vector carried ice around the barrier. The same storm surge overloaded the eastern transformer and cut hospital grid power.',
      viability: '61%'
    },
    report: {
      lead: 'PLAN AI extended the physical barrier, kept Route Bravo warm and rerouted hospital power around the damaged transformer.',
      stats: [
        ['Civilians protected', '94%'],
        ['Critical facilities', '5 / 6'],
        ['Infrastructure damage', '12%'],
        ['Energy consumed', '57%']
      ],
      counterfactual: '31% more civilians exposed'
    }
  },
  flood: {
    id: 'flood',
    number: '02',
    category: 'Water + Mobility',
    title: 'Operation',
    accentTitle: 'Rising Tide',
    summary:
      'Protect critical infrastructure and evacuate Riverside East before the river and peak tide overwhelm the drainage network.',
    countdownSeconds: 370,
    threat: 'Critical',
    constraints: [
      'Keep hospital access open',
      'Protect Metro Central',
      'Limit emergency energy to 70%'
    ],
    metrics: [
      { id: 'safety', label: 'Population safety', value: 0.72 },
      { id: 'grid', label: 'Drainage capacity', value: 0.61 },
      { id: 'energy', label: 'Emergency energy', value: 1 }
    ],
    plan: {
      initial: {
        strategy: 'Controlled diversion',
        confidence: '89%',
        rationale: 'Seal underground access, pump the hospital district and divert overflow into the park retention basin.'
      },
      adapted: {
        strategy: 'Powered diversion',
        confidence: '92%',
        rationale: 'Restore Pump 4 with mobile power, expand the retention basin and preserve elevated hospital access.'
      }
    },
    disruption: {
      kicker: 'Compound disruption / Water + Energy',
      title: 'Pump failure and rapid rise',
      body: 'Floodwater entered the eastern substation and cut power to Pump Station 4. Water is now advancing toward the hospital access road.',
      viability: '58%'
    },
    report: {
      lead: 'PLAN AI restored pumping through mobile power, expanded controlled water storage and preserved hospital access.',
      stats: [
        ['Residents evacuated', '8,914'],
        ['Critical facilities', '6 / 6'],
        ['Maximum flood depth', '1.4 m'],
        ['Energy consumed', '66%']
      ],
      counterfactual: 'Hospital access lost for 3.2 hours'
    }
  },
  heat: {
    id: 'heat',
    number: '03',
    category: 'Health + Energy',
    title: 'Code Red',
    accentTitle: 'Heatlock',
    summary:
      'Protect heat-vulnerable residents and keep the district cooling network online through the evening demand peak.',
    countdownSeconds: 425,
    threat: 'Extreme',
    constraints: [
      'Keep community clinics below 27C',
      'Prioritize vulnerable residents',
      'Reduce peak grid demand by 25%'
    ],
    metrics: [
      { id: 'safety', label: 'Heat protection', value: 0.68 },
      { id: 'grid', label: 'Cooling resilience', value: 0.57 },
      { id: 'energy', label: 'Grid headroom', value: 0.42 }
    ],
    plan: {
      initial: {
        strategy: 'Distributed cooling',
        confidence: '86%',
        rationale: 'Open local cooling hubs, shade the pedestrian network and flatten demand before the evening peak.'
      },
      adapted: {
        strategy: 'Protected cool island',
        confidence: '90%',
        rationale: 'Shed non-critical loads, power the clinic loop by microgrid and concentrate cooling around vulnerable residents.'
      }
    },
    disruption: {
      kicker: 'Compound disruption / Heat + Energy',
      title: 'Cooling feeder trip and heat spike',
      body: 'Peak air-conditioning demand ignited the North Feeder transformer. Three cooling hubs and the community clinic have lost grid power.',
      viability: '49%'
    },
    report: {
      lead: 'PLAN AI formed a protected cool island, restored the clinic loop and lowered neighborhood heat exposure through targeted shade and hydration.',
      stats: [
        ['Residents protected', '12,480'],
        ['Cooling hubs online', '7 / 7'],
        ['Peak demand reduced', '31%'],
        ['Heat exposure reduced', '42%']
      ],
      counterfactual: '2,140 additional heat emergencies'
    }
  },
  wildfire: {
    id: 'wildfire',
    number: '04',
    category: 'Fire + Public Health',
    title: 'Ember',
    accentTitle: 'Protocol',
    summary:
      'Contain a fast-moving greenbelt fire, preserve water pressure and protect residents from hazardous smoke entering the city.',
    countdownSeconds: 338,
    threat: 'Severe',
    constraints: [
      'Maintain hospital clean-air mode',
      'Keep fire-flow pressure above 60%',
      'Evacuate the western smoke corridor'
    ],
    metrics: [
      { id: 'safety', label: 'Population protection', value: 0.71 },
      { id: 'grid', label: 'Air quality defense', value: 0.54 },
      { id: 'energy', label: 'Fire-flow pressure', value: 0.82 }
    ],
    plan: {
      initial: {
        strategy: 'Defensible clean-air network',
        confidence: '88%',
        rationale: 'Hold the greenbelt edge, protect building ventilation and move residents through a monitored clean-air corridor.'
      },
      adapted: {
        strategy: 'Split-zone suppression',
        confidence: '93%',
        rationale: 'Isolate the ruptured main, feed suppression from mobile storage and contain the spot fire with a second firebreak.'
      }
    },
    disruption: {
      kicker: 'Compound disruption / Fire + Water',
      title: 'Ember breach and pressure loss',
      body: 'A wind shift carried embers across the western firebreak. The spot fire ruptured the district pressure line, cutting suppression flow to Sector West.',
      viability: '46%'
    },
    report: {
      lead: 'PLAN AI split the water network, contained the spot fire and maintained a protected clean-air corridor through the smoke peak.',
      stats: [
        ['Residents protected', '10,760'],
        ['Fire perimeter held', '91%'],
        ['Clean-air facilities', '8 / 8'],
        ['Water pressure restored', '74%']
      ],
      counterfactual: 'Fire crosses into 3 residential blocks'
    }
  }
};

export function getScenarioConfig(id) {
  return SCENARIO_CONFIGS[id] ?? SCENARIO_CONFIGS.frozen;
}
