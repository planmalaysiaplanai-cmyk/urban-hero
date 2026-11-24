import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  SphereGeometry
} from 'three';
import { LAYER } from '../core/Layers.js';

const CITY_RADIUS = 12.5;

const BUILDINGS = [
  [-8.2, -0.8, 1.4, 1.4, 2.2],
  [-8.0, 1.4, 1.7, 1.2, 3.1],
  [-7.8, 6.4, 1.5, 1.4, 2.6],
  [-5.9, 6.5, 1.2, 1.4, 1.7],
  [-3.6, 6.3, 1.6, 1.4, 2.5],
  [-2.0, 4.1, 1.2, 1.4, 1.9],
  [-8.2, -5.7, 1.5, 1.5, 2.4],
  [-5.8, -5.9, 1.8, 1.3, 1.8],
  [-3.4, -5.8, 1.4, 1.5, 2.9],
  [2.7, -5.8, 1.4, 1.6, 2.2],
  [5.3, -6.0, 1.8, 1.3, 2.5],
  [8.0, -5.7, 1.4, 1.5, 1.8],
  [8.1, -0.6, 1.5, 1.5, 2.9],
  [8.0, 1.5, 1.4, 1.2, 2.0],
  [8.2, 6.0, 1.7, 1.5, 3.2],
  [5.6, 6.3, 1.4, 1.5, 2.3],
  [3.2, 6.1, 1.4, 1.4, 1.7],
  [-2.5, -2.3, 1.4, 1.3, 1.5],
  [2.5, -2.2, 1.2, 1.4, 2.0],
  [-2.6, 1.8, 1.5, 1.3, 2.2],
  [2.5, 1.9, 1.6, 1.3, 2.6]
];

/** A compact holographic city built to preserve the sandbox's flat cast plane. */
export class CityWorld {
  constructor({ scenario = 'frozen' } = {}) {
    this.scenario = scenario;
    this.group = new Group();
    this.group.name = 'PLAN AI Holographic City';
    this.group.layers.set(LAYER.WORLD);

    this._geometries = new Set();
    this._materials = new Set();
    this._textures = new Set();
    this._state = {
      analysis: false,
      windShift: false,
      powerRestored: false,
      powerFailed: false,
      powerRerouted: false,
      gridIsolated: false,
      routeActive: false,
      roadHeating: false,
      evacuationActive: false,
      barrierTarget: 0,
      barrierExtensionTarget: 0,
      hospitalProtected: false,
      threat: 0.12,
      floodLevel: 0,
      floodTarget: 0,
      pumpsActive: false,
      pumpFailed: false,
      metroClosed: false,
      retentionOpen: false,
      retentionExpanded: false,
      hospitalAccess: false,
      heatLevel: 0.18,
      heatTarget: 0.18,
      coolingHubsActive: false,
      shadeActive: false,
      feederFailed: false,
      demandManaged: false,
      clinicLoop: false,
      hydrationActive: false,
      heatStable: false,
      fireLevel: 0.12,
      fireTarget: 0.12,
      firebreakActive: false,
      firebreakExtended: false,
      cleanAirActive: false,
      ventilationSealed: false,
      waterPressure: 1,
      waterPressureTarget: 1,
      pressureFailed: false,
      emberBreach: false,
      gasIsolated: false,
      fireStable: false
    };

    this._buildTable();
    this._buildRoads();
    this._buildBuildings();
    this._buildFacilities();
    this._buildRoutes();
    this._buildResponseInfrastructure();
    this._buildFloodSystems();
    this._buildHeatSystems();
    this._buildWildfireSystems();
    this._buildStorm();
    this._buildScan();
  }

  _geometry(geometry) {
    this._geometries.add(geometry);
    return geometry;
  }

  _material(material) {
    this._materials.add(material);
    return material;
  }

  _buildTable() {
    const platformMaterial = this._material(
      new MeshStandardMaterial({
        color: '#071019',
        emissive: '#061b29',
        emissiveIntensity: 0.55,
        roughness: 0.62,
        metalness: 0.55
      })
    );
    const platform = new Mesh(
      this._geometry(new CylinderGeometry(CITY_RADIUS, CITY_RADIUS + 0.3, 0.18, 96)),
      platformMaterial
    );
    platform.position.y = 0.08;
    platform.receiveShadow = true;
    platform.name = 'CityTable';
    this.group.add(platform);

    const ringMaterial = this._material(
      new MeshBasicMaterial({
        color: '#2cbde7',
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide
      })
    );
    for (const radius of [4.4, 8.4, 12.15]) {
      const ring = new Mesh(this._geometry(new RingGeometry(radius - 0.025, radius + 0.025, 96)), ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.185;
      this.group.add(ring);
    }
  }

  _buildRoads() {
    const roadMaterial = this._material(
      new MeshBasicMaterial({
        color: '#143344',
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      })
    );
    const laneMaterial = this._material(
      new MeshBasicMaterial({
        color: '#48cae4',
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        blending: AdditiveBlending
      })
    );

    const strip = (x, z, width, depth, material, y = 0.19) => {
      const mesh = new Mesh(this._geometry(new PlaneGeometry(width, depth)), material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, y, z);
      this.group.add(mesh);
      return mesh;
    };

    strip(0, 0, 2.0, 21.5, roadMaterial);
    strip(0, 0, 21.5, 2.0, roadMaterial);
    strip(-5.4, 0.4, 1.05, 17.2, roadMaterial);
    strip(5.4, 0.2, 1.05, 17.4, roadMaterial);
    strip(0, 4.7, 18.5, 0.85, roadMaterial);
    strip(0, -4.6, 18.5, 0.85, roadMaterial);

    for (let z = -9; z <= 9; z += 1.2) strip(0, z, 0.05, 0.55, laneMaterial, 0.205);
    for (let x = -9; x <= 9; x += 1.2) strip(x, 0, 0.55, 0.05, laneMaterial, 0.205);
  }

  _buildBuildings() {
    const geometry = this._geometry(new BoxGeometry(1, 1, 1));
    this.cityBuildings = [];
    for (const [x, z, width, depth, height] of BUILDINGS) {
      const material = this._material(
        new MeshStandardMaterial({
          color: '#0a1720',
          emissive: '#0a3445',
          emissiveIntensity: 0.5,
          roughness: 0.46,
          metalness: 0.38
        })
      );
      const building = new Mesh(geometry, material);
      building.position.set(x, 0.2 + height * 0.5, z);
      building.scale.set(width, height, depth);
      building.castShadow = true;
      building.receiveShadow = true;
      this.group.add(building);
      this.cityBuildings.push({ mesh: building, material, x, z });

      const edges = new LineSegments(
        this._geometry(new EdgesGeometry(new BoxGeometry(width, height, depth))),
        this._material(
          new LineBasicMaterial({ color: '#3cb8d4', transparent: true, opacity: 0.28 })
        )
      );
      edges.position.copy(building.position);
      this.group.add(edges);
    }
  }

  _buildFacilities() {
    if (this.scenario === 'flood') {
      this.facilities = {
        hospital: this._facility('DISTRICT HOSPITAL', 5.3, 3.15, '#75e6ff', 2.4, 1.7, 1.65),
        power: this._facility('PUMP STATION 4', 5.35, -3.2, '#8fffc1', 2.2, 1.6, 1.35),
        shelter: this._facility('ELEVATED SHELTER', -5.35, -3.2, '#8fffc1', 2.15, 1.55, 1.1),
        sector: this._facility('RIVERSIDE EAST', -5.25, 3.15, '#ffb267', 2.4, 1.7, 1.0)
      };
      return;
    }
    if (this.scenario === 'heat') {
      this.facilities = {
        hospital: this._facility('COMMUNITY CLINIC', 5.3, 3.15, '#75e6ff', 2.4, 1.7, 1.65),
        power: this._facility('NORTH FEEDER', 5.35, -3.2, '#ffb45e', 2.2, 1.6, 1.35),
        shelter: this._facility('COOLING HUB 7', -5.35, -3.2, '#8fffc1', 2.15, 1.55, 1.1),
        sector: this._facility('HEAT ZONE A', -5.25, 3.15, '#ff8b4a', 2.4, 1.7, 1.0)
      };
      return;
    }
    if (this.scenario === 'wildfire') {
      this.facilities = {
        hospital: this._facility('REGIONAL HOSPITAL', 5.3, 3.15, '#75e6ff', 2.4, 1.7, 1.65),
        power: this._facility('PRESSURE STATION 3', 5.35, -3.2, '#63c8ff', 2.2, 1.6, 1.35),
        shelter: this._facility('CLEAN-AIR SHELTER', -5.35, -3.2, '#8fffc1', 2.15, 1.55, 1.1),
        sector: this._facility('SECTOR WEST', -5.25, 3.15, '#ff8b4a', 2.4, 1.7, 1.0)
      };
      return;
    }
    this.facilities = {
      hospital: this._facility('CENTRAL HOSPITAL', 5.3, 3.15, '#75e6ff', 2.4, 1.7, 1.65),
      power: this._facility('EAST GRID', 5.35, -3.2, '#ffb45e', 2.2, 1.6, 1.35),
      shelter: this._facility('SHELTER BRAVO', -5.35, -3.2, '#8fffc1', 2.15, 1.55, 1.1),
      sector: this._facility('SECTOR C', -5.25, 3.15, '#ffb267', 2.4, 1.7, 1.0)
    };
  }

  _facility(label, x, z, accent, width, depth, height) {
    const material = this._material(
      new MeshStandardMaterial({
        color: '#0b1820',
        emissive: new Color(accent).multiplyScalar(0.35),
        emissiveIntensity: 1.2,
        roughness: 0.38,
        metalness: 0.58
      })
    );
    const mesh = new Mesh(this._geometry(new BoxGeometry(width, height, depth)), material);
    mesh.position.set(x, 0.2 + height * 0.5, z);
    mesh.castShadow = true;
    this.group.add(mesh);

    const markerMaterial = this._material(
      new MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.75,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    const marker = new Mesh(this._geometry(new RingGeometry(1.45, 1.52, 64)), markerMaterial);
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(x, 0.23, z);
    this.group.add(marker);

    const sprite = this._label(label, accent);
    sprite.position.set(x, height + 1.25, z);
    this.group.add(sprite);

    return { mesh, material, marker, markerMaterial, sprite, accent: new Color(accent) };
  }

  _label(text, accent) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(4, 12, 18, 0.82)';
    ctx.fillRect(12, 12, 488, 66);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 488, 66);
    ctx.fillStyle = '#eafaff';
    ctx.font = '600 28px Bahnschrift, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 46);

    const texture = new CanvasTexture(canvas);
    this._textures.add(texture);
    const material = this._material(
      new SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false })
    );
    const sprite = new Sprite(material);
    sprite.scale.set(3.8, 0.72, 1);
    sprite.renderOrder = 20;
    return sprite;
  }

  _buildRoutes() {
    const material = this._material(
      new MeshBasicMaterial({
        color: '#62f2cf',
        transparent: true,
        opacity: 0.12,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    const makeSegment = (x, z, width, depth, rotation = 0) => {
      const mesh = new Mesh(this._geometry(new PlaneGeometry(width, depth)), material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = rotation;
      mesh.position.set(x, 0.235, z);
      this.group.add(mesh);
      return mesh;
    };
    this.routeMaterial = material;
    this.routeSegments = [
      makeSegment(-5.3, 0.1, 0.32, 6.1),
      makeSegment(-2.7, -3.0, 0.32, 5.2, Math.PI / 2)
    ];
  }

  _buildResponseInfrastructure() {
    this.barrierGroup = new Group();
    this.barrierGroup.name = 'ModularStormBarrier';
    this.group.add(this.barrierGroup);

    const panelMaterial = this._material(
      new MeshStandardMaterial({
        color: '#173442',
        emissive: '#2bbad6',
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.72,
        roughness: 0.25,
        metalness: 0.72
      })
    );
    const edgeMaterial = this._material(
      new LineBasicMaterial({ color: '#75e6ff', transparent: true, opacity: 0.8 })
    );
    this.barrierPanels = [];
    this.extensionPanels = [];

    const makePanel = (x, z, rotation, extension = false) => {
      const panel = new Mesh(this._geometry(new BoxGeometry(1.35, 1.65, 0.16)), panelMaterial);
      panel.position.set(x, -0.72, z);
      panel.rotation.y = rotation;
      panel.castShadow = true;
      this.barrierGroup.add(panel);

      const edges = new LineSegments(
        this._geometry(new EdgesGeometry(new BoxGeometry(1.35, 1.65, 0.16))),
        edgeMaterial
      );
      edges.position.copy(panel.position);
      edges.rotation.copy(panel.rotation);
      this.barrierGroup.add(edges);
      const record = { panel, edges };
      (extension ? this.extensionPanels : this.barrierPanels).push(record);
    };

    for (let x = -8.0; x <= 1.4; x += 1.45) makePanel(x, 4.65, 0);
    for (let z = 3.25; z >= 0.5; z -= 1.4) makePanel(2.1, z, Math.PI / 2, true);

    this.heatingMaterial = this._material(
      new MeshBasicMaterial({
        color: '#ffb45e',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    this.heatingSegments = [];
    const heatingSegment = (x, z, width, depth, rotation = 0) => {
      const mesh = new Mesh(this._geometry(new PlaneGeometry(width, depth)), this.heatingMaterial);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = rotation;
      mesh.position.set(x, 0.245, z);
      this.group.add(mesh);
      this.heatingSegments.push(mesh);
    };
    heatingSegment(-5.3, 0.1, 0.62, 6.1);
    heatingSegment(-2.7, -3.0, 0.62, 5.2, Math.PI / 2);

    this.powerLineMaterial = this._material(
      new MeshBasicMaterial({
        color: '#75e6ff',
        transparent: true,
        opacity: 0.08,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    this.powerLines = [];
    const powerSegment = (x, z, width, depth, rotation = 0) => {
      const mesh = new Mesh(this._geometry(new PlaneGeometry(width, depth)), this.powerLineMaterial);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = rotation;
      mesh.position.set(x, 0.255, z);
      this.group.add(mesh);
      this.powerLines.push(mesh);
    };
    powerSegment(5.35, 0, 0.14, 6.2);
    powerSegment(2.65, 3.1, 0.14, 5.4, Math.PI / 2);
    powerSegment(0, 0, 0.14, 6.3, Math.PI / 2);
    powerSegment(0, 1.55, 0.14, 3.1);
    powerSegment(2.65, 3.1, 0.14, 5.3, Math.PI / 2);

    this.evacuationMaterial = this._material(
      new MeshBasicMaterial({ color: '#b9fff0', transparent: true, opacity: 0.9 })
    );
    this.evacuationUnits = [];
    const unitGeometry = this._geometry(new SphereGeometry(0.12, 10, 8));
    for (let i = 0; i < 18; i++) {
      const unit = new Mesh(unitGeometry, this.evacuationMaterial);
      unit.visible = false;
      unit.userData.offset = i / 18;
      unit.position.y = 0.38;
      this.group.add(unit);
      this.evacuationUnits.push(unit);
    }

    this.gridIsolationMaterial = this._material(
      new MeshBasicMaterial({
        color: '#ff725c',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.gridIsolation = new Mesh(
      this._geometry(new RingGeometry(1.75, 1.9, 64)),
      this.gridIsolationMaterial
    );
    this.gridIsolation.rotation.x = -Math.PI / 2;
    this.gridIsolation.position.set(5.35, 0.27, -3.2);
    this.group.add(this.gridIsolation);
  }

  _buildStorm() {
    const material = this._material(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0.45 },
          uShift: { value: 0 }
        },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uShift;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            float wave = sin(p.x * 1.8 + uTime * 1.7) * 0.22;
            wave += sin(p.x * 4.1 - uTime * 2.2) * 0.08;
            p.z += wave * (0.35 + uShift * 0.65);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uIntensity;
          varying vec2 vUv;
          void main() {
            vec2 p = vUv * 2.0 - 1.0;
            float bands = sin(vUv.x * 42.0 + uTime * 3.3 + sin(vUv.y * 17.0)) * 0.5 + 0.5;
            float cloud = sin(vUv.x * 11.0 - uTime * 1.2) * sin(vUv.y * 19.0 + uTime) * 0.5 + 0.5;
            float edge = smoothstep(1.0, 0.35, abs(p.y));
            float alpha = (0.12 + bands * 0.18 + cloud * 0.26) * edge * uIntensity;
            vec3 color = mix(vec3(0.08, 0.32, 0.58), vec3(0.55, 0.9, 1.0), bands);
            gl_FragColor = vec4(color, alpha);
          }
        `
      })
    );
    this.stormMaterial = material;
    this.storm = new Mesh(this._geometry(new PlaneGeometry(23, 6, 48, 12)), material);
    this.storm.position.set(0, 3.0, 13.5);
    this.storm.rotation.y = Math.PI;
    this.storm.layers.set(LAYER.VFX);
    this.storm.renderOrder = 5;
    this.storm.visible = this.scenario === 'frozen';
    this.group.add(this.storm);
  }

  _buildFloodSystems() {
    this.floodGroup = new Group();
    this.floodGroup.name = 'RisingTideSystems';
    this.floodGroup.visible = this.scenario === 'flood';
    this.group.add(this.floodGroup);

    this.riverMaterial = this._material(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uLevel: { value: 0 } },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uLevel;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.z += sin(p.x * 1.4 + uTime * 1.8) * (0.08 + uLevel * 0.16);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uLevel;
          varying vec2 vUv;
          void main() {
            float waveA = sin(vUv.x * 54.0 + uTime * 3.2 + sin(vUv.y * 18.0)) * 0.5 + 0.5;
            float waveB = sin(vUv.y * 41.0 - uTime * 2.1) * 0.5 + 0.5;
            float edge = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
            vec3 color = mix(vec3(0.03, 0.28, 0.42), vec3(0.22, 0.76, 0.9), waveA);
            float alpha = (0.22 + waveA * 0.18 + waveB * 0.08 + uLevel * 0.2) * edge;
            gl_FragColor = vec4(color, alpha);
          }
        `
      })
    );
    this.river = new Mesh(this._geometry(new PlaneGeometry(24, 6.4, 48, 16)), this.riverMaterial);
    this.river.rotation.x = -Math.PI / 2;
    this.river.position.set(0, 0.27, 8.5);
    this.river.renderOrder = 6;
    this.floodGroup.add(this.river);

    this.floodplainMaterial = this._material(
      new MeshBasicMaterial({
        color: '#3fc5e6',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.floodplain = new Mesh(
      this._geometry(new PlaneGeometry(16, 10)),
      this.floodplainMaterial
    );
    this.floodplain.rotation.x = -Math.PI / 2;
    this.floodplain.position.set(-1.8, 0.255, 3.7);
    this.floodplain.renderOrder = 5;
    this.floodGroup.add(this.floodplain);

    this.retentionMaterial = this._material(
      new MeshBasicMaterial({
        color: '#3fa9d0',
        transparent: true,
        opacity: 0.04,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.retentionBasin = new Mesh(
      this._geometry(new CircleGeometry(2.6, 64)),
      this.retentionMaterial
    );
    this.retentionBasin.rotation.x = -Math.PI / 2;
    this.retentionBasin.position.set(-7.4, 0.27, -6.5);
    this.floodGroup.add(this.retentionBasin);

    const gateMaterial = this._material(
      new MeshStandardMaterial({
        color: '#173442',
        emissive: '#75e6ff',
        emissiveIntensity: 0.4,
        metalness: 0.75,
        roughness: 0.28
      })
    );
    this.metroGates = [];
    for (const x of [-0.72, 0, 0.72]) {
      const gate = new Mesh(this._geometry(new BoxGeometry(0.58, 1.1, 0.15)), gateMaterial);
      gate.position.set(x, -0.42, -1.25);
      gate.castShadow = true;
      this.floodGroup.add(gate);
      this.metroGates.push(gate);
    }

    this.pumpMaterial = this._material(
      new MeshBasicMaterial({
        color: '#68f3c5',
        transparent: true,
        opacity: 0.22,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.pumpRotors = [];
    for (const radius of [0.45, 0.72, 1.0]) {
      const rotor = new Mesh(this._geometry(new RingGeometry(radius - 0.035, radius + 0.035, 48)), this.pumpMaterial);
      rotor.rotation.x = -Math.PI / 2;
      rotor.position.set(5.35, 0.28, -3.2);
      this.floodGroup.add(rotor);
      this.pumpRotors.push(rotor);
    }

    this.accessMaterial = this._material(
      new MeshBasicMaterial({
        color: '#68f3c5',
        transparent: true,
        opacity: 0.06,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    this.hospitalAccess = new Mesh(this._geometry(new PlaneGeometry(0.4, 6.4)), this.accessMaterial);
    this.hospitalAccess.rotation.x = -Math.PI / 2;
    this.hospitalAccess.position.set(5.35, 0.26, 0);
    this.floodGroup.add(this.hospitalAccess);
  }

  _buildHeatSystems() {
    this.heatGroup = new Group();
    this.heatGroup.name = 'HeatlockSystems';
    this.heatGroup.visible = this.scenario === 'heat';
    this.group.add(this.heatGroup);

    this.heatSkyMaterial = this._material(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uHeat: { value: 0.18 } },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uHeat;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.x += sin(p.y * 8.0 + uTime * 2.4) * 0.05 * uHeat;
            p.y += sin(p.x * 2.8 - uTime * 1.6) * 0.08 * uHeat;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uHeat;
          varying vec2 vUv;
          void main() {
            float horizon = smoothstep(0.08, 0.52, vUv.y) * smoothstep(1.0, 0.42, vUv.y);
            float shimmer = sin(vUv.x * 72.0 + sin(vUv.y * 23.0 + uTime * 2.0)) * 0.5 + 0.5;
            float bands = sin(vUv.y * 34.0 - uTime * 1.7) * 0.5 + 0.5;
            vec3 color = mix(vec3(1.0, 0.22, 0.04), vec3(1.0, 0.72, 0.16), shimmer);
            float alpha = horizon * (0.035 + shimmer * 0.055 + bands * 0.04) * (0.45 + uHeat);
            gl_FragColor = vec4(color, alpha);
          }
        `
      })
    );
    this.heatSky = new Mesh(this._geometry(new PlaneGeometry(24, 8, 56, 20)), this.heatSkyMaterial);
    this.heatSky.position.set(0, 3.7, 12.7);
    this.heatSky.rotation.y = Math.PI;
    this.heatSky.renderOrder = 4;
    this.heatGroup.add(this.heatSky);

    this.heatZoneMaterial = this._material(
      new MeshBasicMaterial({
        color: '#ff5c35',
        transparent: true,
        opacity: 0.08,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.heatZones = [];
    const heatSpots = [
      [-5.25, 3.15, 2.7],
      [-1.9, 5.6, 2.1],
      [2.5, -2.2, 1.9],
      [5.3, 3.15, 2.2]
    ];
    for (const [x, z, radius] of heatSpots) {
      const zone = new Mesh(this._geometry(new CircleGeometry(radius, 64)), this.heatZoneMaterial);
      zone.rotation.x = -Math.PI / 2;
      zone.position.set(x, 0.258, z);
      zone.userData.phase = x + z;
      this.heatGroup.add(zone);
      this.heatZones.push(zone);
    }

    this.coolingMaterial = this._material(
      new MeshBasicMaterial({
        color: '#68f3c5',
        transparent: true,
        opacity: 0.04,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.coolingHubs = [];
    for (const [x, z] of [[-5.35, -3.2], [-5.25, 3.15], [5.3, 3.15]]) {
      const hub = new Mesh(this._geometry(new RingGeometry(0.55, 1.35, 64)), this.coolingMaterial);
      hub.rotation.x = -Math.PI / 2;
      hub.position.set(x, 0.275, z);
      hub.userData.phase = x - z;
      this.heatGroup.add(hub);
      this.coolingHubs.push(hub);
    }

    this.shadeMaterial = this._material(
      new MeshBasicMaterial({
        color: '#54d8ff',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.shadeSegments = [];
    for (const [x, z, width, depth, rotation] of [
      [-5.3, 0.05, 0.72, 6.2, 0],
      [-2.65, -3.0, 0.72, 5.3, Math.PI / 2],
      [2.65, 3.1, 0.72, 5.3, Math.PI / 2]
    ]) {
      const shade = new Mesh(this._geometry(new PlaneGeometry(width, depth)), this.shadeMaterial);
      shade.rotation.x = -Math.PI / 2;
      shade.rotation.z = rotation;
      shade.position.set(x, 0.27, z);
      this.heatGroup.add(shade);
      this.shadeSegments.push(shade);
    }

    this.gridLoadMaterial = this._material(
      new MeshBasicMaterial({
        color: '#ff9a4c',
        transparent: true,
        opacity: 0.16,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.gridLoadRings = [];
    for (const radius of [0.65, 1.05, 1.48]) {
      const ring = new Mesh(this._geometry(new RingGeometry(radius - 0.045, radius + 0.045, 64)), this.gridLoadMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(5.35, 0.29, -3.2);
      this.heatGroup.add(ring);
      this.gridLoadRings.push(ring);
    }

    this.clinicLoopMaterial = this._material(
      new MeshBasicMaterial({
        color: '#68f3c5',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    this.clinicLoop = new Mesh(this._geometry(new PlaneGeometry(0.26, 6.35)), this.clinicLoopMaterial);
    this.clinicLoop.rotation.x = -Math.PI / 2;
    this.clinicLoop.position.set(5.35, 0.285, 0);
    this.heatGroup.add(this.clinicLoop);

    this.hydrationMaterial = this._material(
      new MeshBasicMaterial({
        color: '#8aeaff',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.hydrationPoints = [];
    for (const [x, z] of [[-5.3, 0], [0, 0], [0, 4.7], [5.35, 1.4]]) {
      const point = new Mesh(this._geometry(new RingGeometry(0.18, 0.34, 32)), this.hydrationMaterial);
      point.rotation.x = -Math.PI / 2;
      point.position.set(x, 0.29, z);
      this.heatGroup.add(point);
      this.hydrationPoints.push(point);
    }
  }

  _buildWildfireSystems() {
    this.wildfireGroup = new Group();
    this.wildfireGroup.name = 'EmberProtocolSystems';
    this.wildfireGroup.visible = this.scenario === 'wildfire';
    this.group.add(this.wildfireGroup);

    this.greenbeltMaterial = this._material(
      new MeshStandardMaterial({
        color: '#132a20',
        emissive: '#173b2a',
        emissiveIntensity: 0.45,
        roughness: 0.9,
        metalness: 0.04
      })
    );
    const treeGeometry = this._geometry(new CylinderGeometry(0, 0.34, 0.95, 8));
    this.greenbeltTrees = [];
    for (let index = 0; index < 24; index++) {
      const x = -10.4 + (index % 12) * 1.85;
      const z = 8.0 + Math.floor(index / 12) * 1.25 + Math.sin(index * 2.7) * 0.24;
      const tree = new Mesh(treeGeometry, this.greenbeltMaterial);
      tree.position.set(x, 0.7, z);
      tree.scale.setScalar(0.8 + (index % 4) * 0.12);
      tree.castShadow = true;
      this.wildfireGroup.add(tree);
      this.greenbeltTrees.push(tree);
    }

    this.firefrontMaterial = this._material(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uFire: { value: 0.12 }, uBreach: { value: 0 } },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uFire;
          uniform float uBreach;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.y += sin(p.x * 1.8 + uTime * 2.1) * (0.08 + uFire * 0.18);
            p.y -= uBreach * smoothstep(0.55, 1.0, vUv.x) * 1.4;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uFire;
          varying vec2 vUv;
          void main() {
            float tongues = sin(vUv.x * 58.0 + sin(vUv.y * 21.0) - uTime * 4.0) * 0.5 + 0.5;
            float front = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.46, vUv.y);
            float sparks = step(0.91, sin(vUv.x * 177.0 + uTime * 5.0) * 0.5 + 0.5);
            vec3 color = mix(vec3(0.95, 0.08, 0.015), vec3(1.0, 0.72, 0.08), tongues);
            float alpha = front * (0.12 + tongues * 0.24 + sparks * 0.14) * (0.45 + uFire);
            gl_FragColor = vec4(color, alpha);
          }
        `
      })
    );
    this.firefront = new Mesh(this._geometry(new PlaneGeometry(22, 5.2, 52, 14)), this.firefrontMaterial);
    this.firefront.rotation.x = -Math.PI / 2;
    this.firefront.position.set(0, 0.29, 8.7);
    this.firefront.renderOrder = 7;
    this.wildfireGroup.add(this.firefront);

    this.smokeMaterial = this._material(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        uniforms: { uTime: { value: 0 }, uSmoke: { value: 0.12 }, uShift: { value: 0 } },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uShift;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.x += sin(p.y * 2.4 + uTime * 0.7) * (0.18 + uShift * 0.55);
            p.z += sin(p.x * 1.1 - uTime * 0.5) * 0.16;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uSmoke;
          varying vec2 vUv;
          void main() {
            vec2 p = vUv * 2.0 - 1.0;
            float cloudA = sin(vUv.x * 13.0 + sin(vUv.y * 9.0) + uTime * 0.55) * 0.5 + 0.5;
            float cloudB = sin(vUv.x * 31.0 - vUv.y * 17.0 - uTime * 0.8) * 0.5 + 0.5;
            float edge = smoothstep(1.0, 0.35, abs(p.y));
            vec3 color = mix(vec3(0.08, 0.09, 0.1), vec3(0.32, 0.16, 0.08), cloudB);
            float alpha = edge * (0.05 + cloudA * 0.13 + cloudB * 0.08) * (0.55 + uSmoke);
            gl_FragColor = vec4(color, alpha);
          }
        `
      })
    );
    this.smokePlume = new Mesh(this._geometry(new PlaneGeometry(24, 7, 44, 16)), this.smokeMaterial);
    this.smokePlume.position.set(0, 3.8, 12.5);
    this.smokePlume.rotation.y = Math.PI;
    this.smokePlume.renderOrder = 3;
    this.wildfireGroup.add(this.smokePlume);

    this.firebreakMaterial = this._material(
      new MeshBasicMaterial({
        color: '#69e6ff',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    this.firebreakExtensionMaterial = this._material(this.firebreakMaterial.clone());
    this._materials.add(this.firebreakExtensionMaterial);
    const firebreak = (x, z, width, depth, material) => {
      const mesh = new Mesh(this._geometry(new PlaneGeometry(width, depth)), material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.315, z);
      this.wildfireGroup.add(mesh);
      return mesh;
    };
    this.firebreak = firebreak(-3.45, 5.0, 10.5, 0.5, this.firebreakMaterial);
    this.firebreakExtension = firebreak(2.05, 3.0, 0.5, 4.5, this.firebreakExtensionMaterial);

    this.airSensorMaterial = this._material(
      new MeshBasicMaterial({
        color: '#8aeaff',
        transparent: true,
        opacity: 0.16,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.airSensors = [];
    for (const [x, z] of [[-5.25, 3.15], [-5.35, -3.2], [0, 0], [5.3, 3.15]]) {
      const sensor = new Mesh(this._geometry(new RingGeometry(0.22, 0.42, 32)), this.airSensorMaterial);
      sensor.rotation.x = -Math.PI / 2;
      sensor.position.set(x, 0.32, z);
      this.wildfireGroup.add(sensor);
      this.airSensors.push(sensor);
    }

    this.cleanAirMaterial = this._material(
      new MeshBasicMaterial({
        color: '#68f3c5',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
        wireframe: true
      })
    );
    this.cleanAirDome = new Mesh(this._geometry(new SphereGeometry(1.72, 24, 12)), this.cleanAirMaterial);
    this.cleanAirDome.position.set(-5.35, 1.02, -3.2);
    this.cleanAirDome.scale.y = 0.55;
    this.wildfireGroup.add(this.cleanAirDome);

    this.waterFlowMaterial = this._material(
      new MeshBasicMaterial({
        color: '#63c8ff',
        transparent: true,
        opacity: 0.12,
        blending: AdditiveBlending,
        depthWrite: false
      })
    );
    this.waterMains = [];
    for (const [x, z, width, depth, rotation] of [
      [5.35, 0, 0.2, 6.2, 0],
      [0.05, 3.1, 0.2, 10.6, Math.PI / 2],
      [0, -3.05, 0.2, 10.7, Math.PI / 2]
    ]) {
      const main = new Mesh(this._geometry(new PlaneGeometry(width, depth)), this.waterFlowMaterial);
      main.rotation.x = -Math.PI / 2;
      main.rotation.z = rotation;
      main.position.set(x, 0.31, z);
      this.wildfireGroup.add(main);
      this.waterMains.push(main);
    }

    this.pressureMaterial = this._material(
      new MeshBasicMaterial({
        color: '#63c8ff',
        transparent: true,
        opacity: 0.22,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.pressureRings = [];
    for (const radius of [0.5, 0.82, 1.16]) {
      const ring = new Mesh(this._geometry(new RingGeometry(radius - 0.035, radius + 0.035, 48)), this.pressureMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(5.35, 0.33, -3.2);
      this.wildfireGroup.add(ring);
      this.pressureRings.push(ring);
    }

    this.gasIsolationMaterial = this._material(
      new MeshBasicMaterial({
        color: '#ff654f',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.gasIsolation = new Mesh(this._geometry(new RingGeometry(1.65, 1.84, 64)), this.gasIsolationMaterial);
    this.gasIsolation.rotation.x = -Math.PI / 2;
    this.gasIsolation.position.set(-5.25, 0.33, 3.15);
    this.wildfireGroup.add(this.gasIsolation);
  }

  _buildScan() {
    this.scanMaterial = this._material(
      new MeshBasicMaterial({
        color: '#7eeaff',
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide
      })
    );
    this.scan = new Mesh(this._geometry(new RingGeometry(0.1, 0.22, 96)), this.scanMaterial);
    this.scan.rotation.x = -Math.PI / 2;
    this.scan.position.y = 0.27;
    this.scan.renderOrder = 8;
    this.group.add(this.scan);
  }

  setAnalysis(active) {
    this._state.analysis = active;
  }

  activateRoute(active = true) {
    this._state.routeActive = active;
  }

  deployBarrier(extended = false) {
    if (extended) this._state.barrierExtensionTarget = 1;
    else this._state.barrierTarget = 1;
  }

  setRoadHeating(active = true) {
    this._state.roadHeating = active;
  }

  startEvacuation(active = true) {
    this._state.evacuationActive = active;
  }

  stageHospitalMicrogrid() {
    this._state.hospitalProtected = true;
    this.facilities.hospital.accent.set('#8fffc1');
  }

  failPower() {
    this._state.powerFailed = true;
    this._state.powerRestored = false;
    this._state.gridIsolated = false;
    this.facilities.power.accent.set('#ff5e4f');
    this.facilities.hospital.accent.set('#ffb45e');
  }

  reroutePower() {
    this._state.powerFailed = false;
    this._state.powerRerouted = true;
    this._state.powerRestored = true;
    this.facilities.power.accent.set('#75e6ff');
    this.facilities.hospital.accent.set('#8fffc1');
  }

  isolateGrid() {
    this._state.powerFailed = false;
    this._state.powerRerouted = true;
    this._state.gridIsolated = true;
  }

  restorePower() {
    this._state.powerRestored = true;
    this.facilities.power.accent.set('#75e6ff');
  }

  protectHospital() {
    this._state.hospitalProtected = true;
    this.facilities.hospital.accent.set('#8fffc1');
  }

  triggerWindShift() {
    this._state.windShift = true;
    this._state.threat = 0.72;
  }

  startFloodRise(level = 0.42) {
    this._state.floodTarget = Math.max(this._state.floodTarget, level);
  }

  closeMetro() {
    this._state.metroClosed = true;
  }

  activatePumps() {
    this._state.pumpsActive = true;
    this._state.pumpFailed = false;
    this.facilities.power.accent.set('#68f3c5');
  }

  openRetentionBasin(expanded = false) {
    this._state.retentionOpen = true;
    if (expanded) this._state.retentionExpanded = true;
  }

  failPump() {
    this._state.pumpsActive = false;
    this._state.pumpFailed = true;
    this._state.floodTarget = 0.82;
    this.facilities.power.accent.set('#ff5e4f');
    this.facilities.hospital.accent.set('#ffb45e');
  }

  restorePumpPower() {
    this._state.pumpsActive = true;
    this._state.pumpFailed = false;
    this._state.powerRerouted = true;
    this.facilities.power.accent.set('#68f3c5');
  }

  protectHospitalAccess() {
    this._state.hospitalAccess = true;
    this.facilities.hospital.accent.set('#68f3c5');
  }

  stabilizeFlood() {
    this._state.floodTarget = 0.38;
    this._state.pumpsActive = true;
    this._state.pumpFailed = false;
  }

  markFloodIsolation() {
    this._state.gridIsolated = true;
  }

  setFloodOutcome(drainage) {
    this._state.floodTarget = 0.92 - drainage * 0.62;
  }

  startHeatwave(level = 0.58) {
    this._state.heatTarget = Math.max(this._state.heatTarget, level);
    this._state.heatStable = false;
  }

  activateCoolingHubs(active = true) {
    this._state.coolingHubsActive = active;
    this.facilities.shelter.accent.set(active ? '#68f3c5' : '#ffb45e');
  }

  deployShade(active = true) {
    this._state.shadeActive = active;
  }

  manageHeatDemand(active = true) {
    this._state.demandManaged = active;
  }

  failCoolingFeeder() {
    this._state.feederFailed = true;
    this._state.coolingHubsActive = false;
    this._state.clinicLoop = false;
    this._state.heatTarget = 0.94;
    this.facilities.power.accent.set('#ff5e4f');
    this.facilities.hospital.accent.set('#ff9a4c');
    this.facilities.shelter.accent.set('#ff9a4c');
  }

  shedNonCriticalLoads() {
    this._state.demandManaged = true;
  }

  powerClinicLoop() {
    this._state.clinicLoop = true;
    this._state.hospitalProtected = true;
    this.facilities.hospital.accent.set('#68f3c5');
  }

  restoreCoolingNetwork() {
    this._state.feederFailed = false;
    this._state.coolingHubsActive = true;
    this._state.powerRerouted = true;
    this.facilities.power.accent.set('#75e6ff');
    this.facilities.shelter.accent.set('#68f3c5');
  }

  activateHydrationPoints(active = true) {
    this._state.hydrationActive = active;
  }

  stabilizeHeat() {
    this._state.heatTarget = 0.38;
    this._state.heatStable = true;
    this._state.coolingHubsActive = true;
  }

  setHeatOutcome(protection, cooling) {
    this._state.heatTarget = 0.98 - protection * 0.5;
    this._state.heatStable = protection >= 0.8 && cooling >= 0.65;
  }

  startWildfire(level = 0.5) {
    this._state.fireTarget = Math.max(this._state.fireTarget, level);
    this._state.fireStable = false;
  }

  deployFirebreak(extended = false) {
    if (extended) this._state.firebreakExtended = true;
    else this._state.firebreakActive = true;
  }

  sealVentilation(active = true) {
    this._state.ventilationSealed = active;
    this._state.hospitalProtected = active;
    if (active) this.facilities.hospital.accent.set('#68f3c5');
  }

  activateCleanAirShelter(active = true) {
    this._state.cleanAirActive = active;
    this.facilities.shelter.accent.set(active ? '#68f3c5' : '#ffb45e');
  }

  stageFireFlow() {
    this._state.waterPressureTarget = 0.84;
    this.facilities.power.accent.set('#63c8ff');
  }

  triggerEmberBreach() {
    this._state.emberBreach = true;
    this._state.fireTarget = 0.88;
  }

  failWaterPressure() {
    this._state.pressureFailed = true;
    this._state.waterPressureTarget = 0.22;
    this.facilities.power.accent.set('#ff5e4f');
    this.facilities.sector.accent.set('#ff5e4f');
  }

  restoreMobileFireFlow() {
    this._state.pressureFailed = false;
    this._state.waterPressureTarget = 0.74;
    this.facilities.power.accent.set('#63c8ff');
  }

  setFireFlowReserve() {
    this._state.waterPressureTarget = 0.58;
  }

  setWildfireOutcome(protection, pressure, suppressed) {
    this._state.waterPressureTarget = pressure;
    this._state.pressureFailed = pressure < 0.6;
    this.facilities.power.accent.set(pressure < 0.6 ? '#ff5e4f' : '#63c8ff');
    this._state.fireTarget = suppressed ? 0.28 : 0.95 - protection * 0.35;
    this._state.fireStable = suppressed;
    this._state.emberBreach = !suppressed;
  }

  isolateGasNetwork() {
    this._state.gasIsolated = true;
  }

  stabilizeWildfire() {
    this._state.fireTarget = 0.32;
    this._state.fireStable = true;
    this._state.emberBreach = false;
    this._state.firebreakActive = true;
    this._state.firebreakExtended = true;
  }

  reset() {
    Object.assign(this._state, {
      analysis: false,
      windShift: false,
      powerRestored: false,
      powerFailed: false,
      powerRerouted: false,
      gridIsolated: false,
      routeActive: false,
      roadHeating: false,
      evacuationActive: false,
      barrierTarget: 0,
      barrierExtensionTarget: 0,
      hospitalProtected: false,
      threat: 0.12,
      floodLevel: 0,
      floodTarget: 0,
      pumpsActive: false,
      pumpFailed: false,
      metroClosed: false,
      retentionOpen: false,
      retentionExpanded: false,
      hospitalAccess: false,
      heatLevel: 0.18,
      heatTarget: 0.18,
      coolingHubsActive: false,
      shadeActive: false,
      feederFailed: false,
      demandManaged: false,
      clinicLoop: false,
      hydrationActive: false,
      heatStable: false,
      fireLevel: 0.12,
      fireTarget: 0.12,
      firebreakActive: false,
      firebreakExtended: false,
      cleanAirActive: false,
      ventilationSealed: false,
      waterPressure: 1,
      waterPressureTarget: 1,
      pressureFailed: false,
      emberBreach: false,
      gasIsolated: false,
      fireStable: false
    });
    this.facilities.power.accent.set(this.scenario === 'flood' ? '#8fffc1' : '#ffb45e');
    this.facilities.hospital.accent.set('#75e6ff');
    if (this.scenario === 'heat') {
      this.facilities.shelter.accent.set('#8fffc1');
      this.facilities.sector.accent.set('#ff8b4a');
    }
    if (this.scenario === 'wildfire') {
      this.facilities.power.accent.set('#63c8ff');
      this.facilities.shelter.accent.set('#8fffc1');
      this.facilities.sector.accent.set('#ff8b4a');
    }
  }

  update(elapsed) {
    const state = this._state;
    this.stormMaterial.uniforms.uTime.value = elapsed;
    this.stormMaterial.uniforms.uIntensity.value = state.windShift ? 0.85 : 0.48;
    this.stormMaterial.uniforms.uShift.value = state.windShift ? 1 : 0;
    this.storm.position.z += ((13.5 - state.threat * 7.2) - this.storm.position.z) * 0.018;
    this.storm.rotation.z = state.windShift ? Math.sin(elapsed * 0.7) * 0.07 : 0;

    state.floodLevel += (state.floodTarget - state.floodLevel) * 0.012;
    this.riverMaterial.uniforms.uTime.value = elapsed;
    this.riverMaterial.uniforms.uLevel.value = state.floodLevel;
    this.floodplainMaterial.opacity += ((0.04 + state.floodLevel * 0.42) - this.floodplainMaterial.opacity) * 0.035;
    this.floodplain.scale.set(0.62 + state.floodLevel * 0.62, 0.62 + state.floodLevel * 0.62, 1);

    const retentionTarget = state.retentionOpen ? (state.retentionExpanded ? 0.72 : 0.48) : 0.04;
    this.retentionMaterial.opacity += (retentionTarget - this.retentionMaterial.opacity) * 0.06;
    this.retentionBasin.scale.setScalar(state.retentionExpanded ? 1.32 : 1);

    for (const gate of this.metroGates) {
      const targetY = state.metroClosed ? 0.78 : -0.42;
      gate.position.y += (targetY - gate.position.y) * 0.09;
    }

    const pumpTarget = state.pumpsActive ? 0.88 : state.pumpFailed ? 0.2 : 0.22;
    this.pumpMaterial.opacity += (pumpTarget - this.pumpMaterial.opacity) * 0.08;
    this.pumpMaterial.color.set(state.pumpFailed ? '#ff5e4f' : '#68f3c5');
    for (const [index, rotor] of this.pumpRotors.entries()) {
      if (state.pumpsActive) rotor.rotation.z += 0.008 * (index + 1);
      rotor.scale.setScalar(1 + Math.sin(elapsed * 3 + index) * 0.04);
    }

    this.accessMaterial.opacity += ((state.hospitalAccess ? 0.86 : 0.06) - this.accessMaterial.opacity) * 0.08;

    state.heatLevel += (state.heatTarget - state.heatLevel) * 0.012;
    this.heatSkyMaterial.uniforms.uTime.value = elapsed;
    this.heatSkyMaterial.uniforms.uHeat.value = state.heatLevel;
    const heatOpacity = 0.035 + state.heatLevel * (state.heatStable ? 0.12 : 0.3);
    this.heatZoneMaterial.opacity += (heatOpacity - this.heatZoneMaterial.opacity) * 0.045;
    this.heatZoneMaterial.color.set(state.heatStable ? '#ffb85c' : '#ff5c35');
    for (const zone of this.heatZones) {
      const pulse = 1 + Math.sin(elapsed * (1.4 + state.heatLevel) + zone.userData.phase) * 0.055;
      zone.scale.setScalar(pulse * (0.82 + state.heatLevel * 0.34));
    }

    const coolingOpacity = state.coolingHubsActive ? 0.78 : state.feederFailed ? 0.05 : 0.04;
    this.coolingMaterial.opacity += (coolingOpacity - this.coolingMaterial.opacity) * 0.08;
    this.coolingMaterial.color.set(state.feederFailed ? '#ff6a4f' : '#68f3c5');
    for (const hub of this.coolingHubs) {
      const pulse = state.coolingHubsActive
        ? 1.05 + Math.sin(elapsed * 3.2 + hub.userData.phase) * 0.12
        : 1;
      hub.scale.setScalar(pulse);
      if (state.coolingHubsActive) hub.rotation.z += 0.004;
    }

    this.shadeMaterial.opacity += ((state.shadeActive ? 0.66 : 0) - this.shadeMaterial.opacity) * 0.08;
    const gridLoadTarget = state.feederFailed ? 0.9 : state.demandManaged ? 0.16 : 0.38 + state.heatLevel * 0.28;
    this.gridLoadMaterial.opacity += (gridLoadTarget - this.gridLoadMaterial.opacity) * 0.08;
    this.gridLoadMaterial.color.set(state.feederFailed ? '#ff5147' : state.demandManaged ? '#68f3c5' : '#ff9a4c');
    for (const [index, ring] of this.gridLoadRings.entries()) {
      ring.scale.setScalar(1 + Math.sin(elapsed * (2.4 + index * 0.5)) * (state.feederFailed ? 0.12 : 0.04));
      ring.rotation.z += 0.0025 * (index + 1);
    }
    this.clinicLoopMaterial.opacity += ((state.clinicLoop ? 0.92 : 0) - this.clinicLoopMaterial.opacity) * 0.1;
    this.hydrationMaterial.opacity += ((state.hydrationActive ? 0.84 : 0) - this.hydrationMaterial.opacity) * 0.1;
    for (const [index, point] of this.hydrationPoints.entries()) {
      point.scale.setScalar(1 + Math.sin(elapsed * 3.8 + index) * 0.13);
    }

    state.fireLevel += (state.fireTarget - state.fireLevel) * 0.014;
    state.waterPressure += (state.waterPressureTarget - state.waterPressure) * 0.025;
    this.firefrontMaterial.uniforms.uTime.value = elapsed;
    this.firefrontMaterial.uniforms.uFire.value = state.fireLevel;
    this.firefrontMaterial.uniforms.uBreach.value = state.emberBreach ? 1 : 0;
    const firefrontZ = 9.15 - state.fireLevel * (state.emberBreach ? 4.6 : 2.5);
    this.firefront.position.z += (firefrontZ - this.firefront.position.z) * 0.024;
    this.smokeMaterial.uniforms.uTime.value = elapsed;
    this.smokeMaterial.uniforms.uSmoke.value = state.fireLevel;
    this.smokeMaterial.uniforms.uShift.value = state.emberBreach ? 1 : 0;
    this.smokePlume.position.x += (((state.emberBreach ? -3.2 : 0)) - this.smokePlume.position.x) * 0.018;
    this.greenbeltMaterial.emissive.set(state.fireStable ? '#173b2a' : '#5b2113');
    this.greenbeltMaterial.emissiveIntensity += ((0.35 + state.fireLevel * 0.95) - this.greenbeltMaterial.emissiveIntensity) * 0.05;

    this.firebreakMaterial.opacity += ((state.firebreakActive ? 0.82 : 0) - this.firebreakMaterial.opacity) * 0.09;
    this.firebreakExtensionMaterial.opacity += ((state.firebreakExtended ? 0.9 : 0) - this.firebreakExtensionMaterial.opacity) * 0.09;
    this.firebreakMaterial.color.set(state.fireStable ? '#68f3c5' : '#69e6ff');
    this.firebreakExtensionMaterial.color.set(state.fireStable ? '#68f3c5' : '#69e6ff');

    const sensorTarget = state.cleanAirActive || state.ventilationSealed ? 0.76 : 0.16;
    this.airSensorMaterial.opacity += (sensorTarget - this.airSensorMaterial.opacity) * 0.08;
    this.airSensorMaterial.color.set(state.emberBreach ? '#ff9a4c' : '#8aeaff');
    for (const [index, sensor] of this.airSensors.entries()) {
      sensor.scale.setScalar(1 + Math.sin(elapsed * 3.1 + index) * 0.12);
    }
    this.cleanAirMaterial.opacity += ((state.cleanAirActive ? 0.38 : 0) - this.cleanAirMaterial.opacity) * 0.08;
    this.cleanAirDome.rotation.y += state.cleanAirActive ? 0.003 : 0;

    const waterOpacity = state.pressureFailed ? 0.025 : 0.18 + state.waterPressure * 0.68;
    this.waterFlowMaterial.opacity += (waterOpacity - this.waterFlowMaterial.opacity) * 0.09;
    this.waterFlowMaterial.color.set(state.pressureFailed ? '#ff5e4f' : '#63c8ff');
    this.pressureMaterial.opacity += ((state.pressureFailed ? 0.84 : 0.18 + state.waterPressure * 0.52) - this.pressureMaterial.opacity) * 0.08;
    this.pressureMaterial.color.set(state.pressureFailed ? '#ff5e4f' : '#63c8ff');
    for (const [index, ring] of this.pressureRings.entries()) {
      const pulse = state.pressureFailed ? 0.14 : 0.045;
      ring.scale.setScalar(1 + Math.sin(elapsed * (2.5 + index * 0.4)) * pulse);
      if (!state.pressureFailed) ring.rotation.z += 0.003 * (index + 1);
    }
    this.gasIsolationMaterial.opacity += ((state.gasIsolated ? 0.72 : 0) - this.gasIsolationMaterial.opacity) * 0.1;
    this.gasIsolationMaterial.color.set(state.gasIsolated ? '#68f3c5' : '#ff654f');
    this.gasIsolation.scale.setScalar(1 + Math.sin(elapsed * 4.2) * 0.07);

    const scanCycle = (elapsed * 0.32) % 1;
    this.scan.visible = state.analysis;
    this.scan.scale.setScalar(1 + scanCycle * CITY_RADIUS * 4.4);
    this.scanMaterial.opacity = state.analysis ? (1 - scanCycle) * 0.7 : 0;

    this.routeMaterial.opacity += ((state.routeActive ? 0.82 : 0.12) - this.routeMaterial.opacity) * 0.08;
    this.routeMaterial.color.set(state.windShift ? '#58c8ff' : '#62f2cf');
    this.heatingMaterial.opacity += ((state.roadHeating ? 0.7 : 0) - this.heatingMaterial.opacity) * 0.08;
    this.heatingMaterial.color.setHSL(0.08 + Math.sin(elapsed * 4) * 0.015, 0.9, 0.65);

    for (const { panel, edges } of this.barrierPanels) {
      const targetY = state.barrierTarget ? 1.02 : -0.72;
      panel.position.y += (targetY - panel.position.y) * 0.08;
      edges.position.y = panel.position.y;
    }
    for (const { panel, edges } of this.extensionPanels) {
      const targetY = state.barrierExtensionTarget ? 1.02 : -0.72;
      panel.position.y += (targetY - panel.position.y) * 0.08;
      edges.position.y = panel.position.y;
    }

    const powerOpacity = state.powerRerouted ? 0.92 : state.powerFailed ? 0.02 : 0.08;
    this.powerLineMaterial.opacity += (powerOpacity - this.powerLineMaterial.opacity) * 0.1;
    this.powerLineMaterial.color.set(state.powerFailed ? '#ff5e4f' : '#75e6ff');
    const isolationOpacity = state.powerFailed ? 0.86 : state.gridIsolated ? 0.62 : 0;
    this.gridIsolationMaterial.opacity += (isolationOpacity - this.gridIsolationMaterial.opacity) * 0.1;
    this.gridIsolationMaterial.color.set(state.gridIsolated ? '#68f3c5' : '#ff725c');
    this.gridIsolation.scale.setScalar(1 + Math.sin(elapsed * 5) * 0.06);

    for (const building of this.cityBuildings) {
      const eastAffected = building.x > 1.5;
      const heatOutage = this.scenario === 'heat' && state.feederFailed && eastAffected;
      const smokeAffected = this.scenario === 'wildfire' && state.emberBreach && building.x < 1.5;
      const targetIntensity = (state.powerFailed && eastAffected) || heatOutage
        ? 0.02
        : this.scenario === 'heat'
          ? 0.38 + state.heatLevel * 0.34
          : smokeAffected
            ? 0.16
          : 0.5;
      building.material.emissiveIntensity += (targetIntensity - building.material.emissiveIntensity) * 0.08;
      if (this.scenario === 'heat') {
        building.material.emissive.set(state.heatStable ? '#174858' : '#672616');
      }
      if (this.scenario === 'wildfire') {
        building.material.emissive.set(smokeAffected ? '#4d1d14' : '#0a3445');
      }
    }

    for (const unit of this.evacuationUnits) {
      unit.visible = state.evacuationActive;
      if (!unit.visible) continue;
      const progress = (elapsed * 0.1 + unit.userData.offset) % 1;
      if (progress < 0.55) {
        const t = progress / 0.55;
        unit.position.set(-5.3, 0.38, 3.15 + (-3.0 - 3.15) * t);
      } else {
        const t = (progress - 0.55) / 0.45;
        unit.position.set(-5.3 + (0 - -5.3) * t, 0.38, -3.0);
      }
    }

    for (const [id, facility] of Object.entries(this.facilities)) {
      const pulse = 0.8 + Math.sin(elapsed * 2.5 + facility.mesh.position.x) * 0.22;
      facility.material.emissive.copy(facility.accent);
      facility.material.emissiveIntensity = pulse * 0.72;
      facility.markerMaterial.color.copy(facility.accent);
      facility.markerMaterial.opacity = 0.45 + pulse * 0.25;

      if (id === 'hospital' && state.hospitalProtected) {
        facility.marker.scale.setScalar(1 + Math.sin(elapsed * 3) * 0.06);
        facility.markerMaterial.opacity = 0.92;
      } else {
        facility.marker.scale.setScalar(1);
      }
    }
  }

  dispose() {
    this.group.parent?.remove(this.group);
    for (const geometry of this._geometries) geometry.dispose();
    for (const material of this._materials) material.dispose();
    for (const texture of this._textures) texture.dispose();
  }
}
