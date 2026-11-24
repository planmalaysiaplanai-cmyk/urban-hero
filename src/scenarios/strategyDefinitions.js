const completed = (reason) => ({ status: 'completed', reason });
const partial = (reason) => ({ status: 'partial', reason });
const failed = (reason) => ({ status: 'failed', reason });
const action = (id, label, category, cost, effects, detail, risk, commands, resolve) => ({
  id, label, category, cost, effects, detail, risk, rationale: `${detail} ${risk}`, commands, resolve
});

export const FLOOD_STRATEGY = {
  id: 'flood', residents: 9400, base: [0.44, 0.22, 1], weights: [0.5, 0.35, 0.15], resourceCost: 0.003,
  analysis: 'Linking flood depth, pump power, hospital access and evacuation routes',
  initial: [
    action('metro', 'Seal Metro Central', 'Mobility', 14, [0.1, 0.05, 0],
      'Floodgates keep river water out of the underground network.', 'Closure removes metro capacity from evacuation.', [['closeMetro']]),
    action('pumps', 'Activate hospital-zone pumps', 'Water', 22, [0.05, 0.24, -0.05],
      'Pumps drain the hospital district while power remains available.', 'Fails after the substation floods unless backup power is staged.', [['activatePumps']],
      ({ initial }) => initial.has('backup') ? completed('Staged backup keeps installed pumps online after grid loss, preserving drainage.') : failed('The flooded substation cuts pump power. Pumping capacity is lost without backup.')),
    action('barrier', 'Raise river barriers', 'Infrastructure', 24, [0.12, 0.09, 0],
      'Delay the first river overflow into Riverside East.', 'Peak tide overtops the first line; a second layer is still needed.', [['deployBarrier']],
      () => partial('Peak tide overtops the barrier. It buys evacuation time but cannot drain trapped water.')),
    action('basin', 'Open park retention basin', 'Water', 18, [0.08, 0.22, 0],
      'Store overflow away from homes without electrical power.', 'The park is deliberately inundated to protect occupied blocks.', [['openRetentionBasin']]),
    action('evacuate', 'Evacuate Riverside early', 'Population', 16, [0.17, 0, 0],
      'Move mobility-risk residents before road depth rises.', 'Transport crews are committed before peak tide.', [['activateRoute'], ['startEvacuation']]),
    action('backup', 'Stage mobile pump power', 'Energy', 20, [0, 0.08, -0.03],
      'An independent feeder can supply the installed pump network.', 'Requires pumps; a generator alone cannot remove floodwater.', [],
      ({ initial }) => initial.has('pumps') ? completed('Backup power and installed pumps work together through the substation outage.') : partial('Power is ready, but no pumps were activated. The generator provides only reserve capacity.')),
    action('access', 'Reserve elevated hospital access', 'Health', 18, [0.1, 0.06, 0],
      'Reserve an elevated lane for medical transport.', 'Ordinary traffic loses one lane.', [['protectHospitalAccess']]),
    action('sandbags', 'Sandbag residential doors', 'Infrastructure', 12, [0.06, 0.02, 0],
      'Slow shallow water entry into ground-floor homes.', 'Deep tidal flooding overwhelms door-level protection.', [],
      () => partial('Sandbags delay shallow ingress but cannot hold the peak tidal depth.'))
  ],
  emergency: [
    action('power', 'Restore pumps with mobile power', 'Energy', 22, [0.06, 0.3, -0.05],
      'Restore the existing pump network independently of East Grid.', 'Requires pumps activated in preparation.', [['restorePumpPower']],
      ({ initial }) => !initial.has('pumps') ? failed('No active pump installation exists to power. The generator cannot drain water by itself.')
        : initial.has('backup') ? partial('Backup already keeps pumps running; extra generation adds only redundancy.')
          : completed('Mobile power restores the installed pumps lost during substation flooding.')),
    action('expand', 'Expand the retention basin', 'Water', 16, [0.07, 0.23, 0],
      'Increase controlled overflow storage inside the park boundary.', 'Full capacity requires the basin opened before impact.', [['openRetentionBasin', true]],
      ({ initial }) => initial.has('basin') ? completed('The prepared basin can accept extra overflow immediately, with no grid dependency.')
        : partial('An unprepared park needs emergency earthworks; only part of the storage becomes available.')),
    action('accessRescue', 'Protect emergency hospital lane', 'Health', 14, [0.14, 0.04, 0],
      'Preserve access for ambulances through the flood peak.', 'A pre-reserved lane avoids clearance delays.', [['protectHospitalAccess']],
      ({ initial }) => initial.has('access') ? completed('The reserved elevated lane is ready for uninterrupted emergency traffic.')
        : partial('Crews must clear stranded traffic before medical access can be restored.')),
    action('rapid', 'Accelerate elevated evacuation', 'Population', 12, [0.15, 0, 0],
      'Use the established elevated corridor for a second evacuation wave.', 'Late route setup loses time if early evacuation was skipped.', [['activateRoute'], ['startEvacuation']],
      ({ initial }) => initial.has('evacuate') ? completed('The prepared corridor and transport crews move the second wave immediately.')
        : partial('Crews must establish a route in rising water; evacuation moves fewer residents.')),
    action('isolate', 'Isolate the flooded substation', 'Energy', 10, [0, 0.1, 0.02],
      'Separate wet electrical equipment from the response network.', 'Isolation prevents another interruption but does not restore pump flow.', [['markFloodIsolation']]),
    action('boats', 'Deploy rescue boats', 'Population', 18, [0.14, 0, -0.03],
      'Reach stranded residents independently of roads and pump power.', 'Smaller carrying capacity than a prepared evacuation corridor.', [['activateRoute'], ['startEvacuation']])
  ],
  start: [['startFloodRise', 0.44]],
  hazard: ['thunder', [8.6, 8.8], [5.35, -3.2]],
  disruptionTitle: 'Peak tide and substation flooding',
  shock(city, initial) {
    city.startFloodRise(0.82);
    if (initial.has('pumps') && initial.has('backup')) city.restorePumpPower();
    else city.failPump();
  },
  disruption(evaluation) {
    return `Peak tide overtops the river edge. ${evaluation.initialResults.get('pumps') === 'completed' ? 'Prepared backup keeps pumps running.' : 'Pump flow is unavailable after substation flooding.'} Choose the next response using live drainage and access conditions.`;
  },
  finish(city, evaluation) { city.setFloodOutcome(evaluation.metrics.grid); }
};

export const HEAT_STRATEGY = {
  id: 'heat', residents: 13000, base: [0.4, 0.2, 0.12], weights: [0.5, 0.3, 0.2], resourceCost: 0,
  analysis: 'Linking heat exposure, clinic cooling, demand peaks and walking access',
  initial: [
    action('hubs', 'Open distributed cooling hubs', 'Health', 22, [0.17, 0.19, -0.04],
      'Place cooled refuge near vulnerable residents.', 'Grid-fed hubs lose cooling during a feeder trip.', [['activateCoolingHubs']],
      ({ initial }) => initial.has('battery') || initial.has('demand') ? completed('Battery reserve or demand control keeps distributed cooling available through the peak.')
        : failed('Unprotected grid-fed hubs lose power when North Feeder trips.')),
    action('shade', 'Deploy shade corridors', 'Mobility', 16, [0.12, 0.04, 0],
      'Reduce pedestrian heat exposure without adding cooling demand.', 'Shading protects the walking route, not indoor clinical loads.', [['deployShade'], ['activateRoute']]),
    action('demand', 'Pre-cool and flatten demand', 'Energy', 20, [0, 0.2, 0.28],
      'Move flexible loads before the peak to prevent feeder overload.', 'Uses commercial scheduling flexibility in advance.', [['manageHeatDemand']]),
    action('battery', 'Reserve clinic battery storage', 'Energy', 24, [0.06, 0.15, 0.16],
      'Reserve independent power for the clinic cooling loop.', 'Battery capacity cannot power every commercial building.', [['powerClinicLoop']]),
    action('water', 'Install hydration points', 'Health', 10, [0.08, 0.02, 0],
      'Provide water at transit and pedestrian nodes.', 'Hydration reduces exposure but does not replace indoor cooling.', [['activateHydrationPoints']]),
    action('outreachPrep', 'Register vulnerable households', 'Population', 12, [0.09, 0.02, 0],
      'Locate mobility-risk residents before the heat peak.', 'Requires a later response team to complete transfers.', []),
    action('massAC', 'Run all public AC at maximum', 'Energy', 28, [0.11, 0.1, -0.1],
      'Attempt broad indoor cooling immediately.', 'Simultaneous startup causes rebound demand without demand controls.', [['activateCoolingHubs']],
      ({ initial }) => initial.has('demand') ? partial('Demand controls limit simultaneous startup; only some AC loads can run.')
        : failed('Uncontrolled startup overloads the feeder and removes the planned cooling benefit.')),
    action('shelter', 'Prepare passive refuge buildings', 'Population', 14, [0.1, 0.06, 0.04],
      'Use insulated civic buildings with low cooling demand.', 'Lower capacity than powered hubs, but less exposed to grid loss.', [])
  ],
  emergency: [
    action('shed', 'Shed non-critical commercial loads', 'Energy', 14, [0, 0.17, 0.32],
      'Release grid capacity for life-safety cooling.', 'Commercial activity is curtailed during the peak.', [['shedNonCriticalLoads']]),
    action('clinic', 'Form protected clinic microgrid', 'Health', 18, [0.1, 0.2, 0.08],
      'Connect prepared storage to the clinic loop.', 'Full output requires battery storage reserved in preparation.', [['powerClinicLoop']],
      ({ initial }) => initial.has('battery') ? completed('Reserved batteries supply the clinic loop immediately and isolate it from feeder risk.')
        : partial('Mobile storage arrives late; only part of the clinical cooling load is served.')),
    action('restore', 'Restart cooling hubs in stages', 'Health', 16, [0.13, 0.24, -0.06],
      'Restart installed hubs without a simultaneous demand spike.', 'Requires prepared hubs and demand control, batteries or successful load shedding.', [['restoreCoolingNetwork']],
      ({ initial, effective }) => !initial.has('hubs') ? failed('No distributed hub network was prepared to restart.')
        : initial.has('demand') || initial.has('battery') || effective('shed') ? completed('Prepared hubs restart on available capacity without rebound overload.')
          : failed('The feeder has no spare capacity. Restarting hubs triggers another overload.')),
    action('outreach', 'Dispatch heat-response teams', 'Population', 12, [0.17, 0.02, 0],
      'Move vulnerable residents into the protected cool zones.', 'Registered households and shaded access are needed for full coverage.', [['activateRoute'], ['startEvacuation']],
      ({ initial }) => initial.has('outreachPrep') && initial.has('shade') ? completed('Teams have household locations and a shaded route, enabling rapid transfers.')
        : partial('Missing household data or shaded access slows the transfer teams.')),
    action('extendShade', 'Extend shade and hydration', 'Mobility', 10, [0.12, 0.05, 0],
      'Expand existing low-energy protection along walking routes.', 'Full coverage requires shade or hydration infrastructure prepared earlier.', [['deployShade'], ['activateHydrationPoints']],
      ({ initial }) => initial.has('shade') || initial.has('water') ? completed('Prepared fixtures let crews expand shade and water coverage quickly.')
        : partial('Crews must install fixtures from scratch, reducing coverage during the peak.')),
    action('forceAC', 'Force immediate full cooling restart', 'Energy', 20, [0.1, 0.12, -0.12],
      'Attempt to restore every cooling load at once.', 'Fails without demand control or successful commercial load shedding.', [['restoreCoolingNetwork']],
      ({ initial, effective }) => initial.has('demand') || effective('shed') ? partial('Capacity limits prevent a full restart; only some loads recover.')
        : failed('Rebound demand trips the feeder again. Cooling cannot be restored at full load.'))
  ],
  start: [['startHeatwave', 0.62]],
  hazard: ['meteor', [10.2, 8.8], [5.35, -3.2]],
  hazardWhen: (initial) => !initial.has('demand'),
  disruptionTitle: 'Evening demand peak and heat escalation',
  shock(city, initial) {
    city.startHeatwave(0.94);
    if (!initial.has('demand')) {
      city.failCoolingFeeder();
      if (initial.has('battery')) {
        city.powerClinicLoop();
        if (initial.has('hubs')) city.activateCoolingHubs();
      }
    }
  },
  disruption(evaluation, initial) {
    return `${initial.has('demand') ? 'Prepared demand controls prevent a full feeder trip.' : 'North Feeder trips at the evening peak.'} ${evaluation.initialResults.get('hubs') === 'completed' ? 'Protected hubs remain available.' : 'Unprotected cooling capacity is unavailable.'} Preserve clinic cooling and choose how to relieve demand.`;
  },
  finish(city, evaluation) { city.setHeatOutcome(evaluation.metrics.safety, evaluation.metrics.grid); }
};

export const WILDFIRE_STRATEGY = {
  id: 'wildfire', residents: 11200, base: [0.4, 0.22, 0.22], weights: [0.45, 0.3, 0.25], resourceCost: 0,
  analysis: 'Linking fire spread, smoke exposure, clean-air access and suppression pressure',
  initial: [
    action('firebreak', 'Prepare western firebreak', 'Containment', 22, [0.16, 0.02, 0],
      'Clear a defensible strip along the greenbelt edge.', 'Wind-carried embers can jump the first firebreak.', [['deployFirebreak']],
      () => partial('The first line delays flame spread, but wind-carried embers ignite a spot fire beyond it.')),
    action('ventilation', 'Seal hospital ventilation', 'Health', 18, [0.08, 0.23, 0],
      'Maintain filtered indoor air for critical patients.', 'Sealed ventilation does not reduce outdoor smoke.', [['sealVentilation']]),
    action('shelter', 'Open clean-air shelters', 'Population', 18, [0.12, 0.2, 0],
      'Provide filtered refuge outside the smoke corridor.', 'Reaching refuge still requires a usable access route.', [['activateCleanAirShelter']]),
    action('water', 'Stage district fire-flow reserve', 'Water', 20, [0.02, 0, 0.36],
      'Reserve water storage independent of the district main.', 'Mobile connection is needed after a pressure-line rupture.', [['stageFireFlow']]),
    action('evacuate', 'Clear the smoke corridor early', 'Mobility', 16, [0.16, 0.06, 0],
      'Establish transport lanes before smoke reduces visibility.', 'Response traffic uses road space before ignition is certain.', [['activateRoute'], ['startEvacuation']]),
    action('gas', 'Segment exposed gas utilities', 'Infrastructure', 12, [0.08, 0, 0],
      'Reduce the chance of a second utility-fed fire.', 'Gas isolation does not restore water pressure.', [['isolateGasNetwork']]),
    action('sprinklers', 'Run perimeter sprinklers', 'Water', 24, [0.12, 0.05, -0.05],
      'Wet the defensible edge using reserved fire-flow water.', 'Fails after line rupture if no independent water reserve exists.', [],
      ({ initial }) => initial.has('water') ? completed('Reserved water keeps the perimeter wet through the main-pressure failure.')
        : failed('The ruptured main removes sprinkler pressure; the wet perimeter cannot be maintained.')),
    action('masks', 'Distribute smoke respirators', 'Health', 10, [0.06, 0.06, 0],
      'Reduce smoke exposure during short outdoor transfers.', 'Respirators only partly protect long-duration outdoor exposure.', [],
      () => partial('Respirators help during transfers, but cannot replace filtered indoor refuge.'))
  ],
  emergency: [
    action('mobile', 'Connect mobile fire-flow storage', 'Water', 18, [0.05, 0, 0.38],
      'Bypass the ruptured pressure line for suppression crews.', 'Full flow requires water reserved before the breach.', [['restoreMobileFireFlow']],
      ({ initial }) => initial.has('water') ? completed('Prepared storage connects immediately, restoring independent suppression pressure.')
        : partial('Unstaged tankers arrive late; only limited emergency flow becomes available.')),
    action('extend', 'Build a secondary firebreak', 'Containment', 16, [0.17, 0.04, 0],
      'Connect a second line around the ember-driven spot fire.', 'Full containment needs a prepared first firebreak.', [['deployFirebreak', true]],
      ({ initial }) => initial.has('firebreak') ? completed('The second line joins the prepared firebreak and closes the ember exposure.')
        : partial('An isolated second line slows fire spread but leaves unprepared seams.')),
    action('isolate', 'Isolate the utility breach', 'Infrastructure', 10, [0.1, 0, 0.04],
      'Close exposed gas and water segments around the spot fire.', 'Adds less protection if gas segmentation was already completed.', [['isolateGasNetwork']],
      ({ initial }) => initial.has('gas') ? partial('Gas is already segmented; emergency isolation mainly limits the remaining water leak.')
        : completed('Utility isolation prevents secondary ignition and limits pressure loss.')),
    action('corridor', 'Protect the clean-air corridor', 'Population', 12, [0.15, 0.19, 0],
      'Move residents into filtered refuge along the cleared route.', 'Full protection needs both prepared shelters and early route clearance.', [['activateRoute'], ['startEvacuation']],
      ({ initial }) => initial.has('shelter') && initial.has('evacuate') ? completed('Prepared shelters and cleared lanes provide a continuous clean-air evacuation network.')
        : partial('Missing filtered refuge or route clearance leaves residents exposed during part of the transfer.')),
    action('suppress', 'Suppress both fire zones', 'Containment', 10, [0.16, 0.12, -0.04],
      'Hold both perimeters with a coordinated suppression attack.', 'Requires full mobile fire-flow AND a connected secondary firebreak.', [],
      ({ effective }) => effective('mobile') && effective('extend') ? completed('Reliable pressure and a closed secondary line let crews suppress both fire zones.')
        : failed('Suppression lacks reliable water or a closed firebreak. Crews cannot safely hold both perimeters.')),
    action('filters', 'Deploy mobile air filters', 'Health', 14, [0.08, 0.24, 0],
      'Increase filtered indoor capacity at prepared refuge sites.', 'Unprepared buildings require sealing before filters become fully useful.', [['activateCleanAirShelter']],
      ({ initial }) => initial.has('shelter') || initial.has('ventilation') ? completed('Prepared sealed buildings let mobile filters improve indoor air immediately.')
        : partial('Unsealed civic buildings admit smoke, reducing the useful filter capacity.'))
  ],
  start: [['startWildfire', 0.5]],
  hazard: ['meteor', [9.8, 10.4], [-2.7, 4]],
  disruptionTitle: 'Ember breach and pressure-line rupture',
  shock(city, initial) {
    city.triggerEmberBreach();
    city.failWaterPressure();
    if (initial.has('water')) city.setFireFlowReserve();
  },
  disruption(evaluation, initial) {
    return `A wind shift sends embers across the first line and ruptures the pressure main. ${initial.has('water') ? 'Independent water storage is reserved but needs connection.' : 'No independent water reserve was staged.'} ${evaluation.initialResults.get('sprinklers') === 'failed' ? 'Perimeter sprinklers have failed.' : 'Containment now depends on a second firebreak and reliable suppression flow.'}`;
  },
  finish(city, evaluation) {
    city.setWildfireOutcome(evaluation.metrics.safety, evaluation.metrics.energy, evaluation.results.get('suppress') === 'completed');
  }
};

export const STRATEGY_DEFINITIONS = [FLOOD_STRATEGY, HEAT_STRATEGY, WILDFIRE_STRATEGY];
