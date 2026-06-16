import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildHospital } from './hospital.js';

const SPEED = 38;
const RADIUS = 0.42;

export class World {
  constructor(container, { onEnterCase, onProximity, onLockChange } = {}) {
    this.container = container;
    this.onEnterCase = onEnterCase || (() => {});
    this.onProximity = onProximity || (() => {});
    this.onLockChange = onLockChange || (() => {});
    this.paused = false;
    this.move = { f: false, b: false, l: false, r: false };
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.clock = new THREE.Clock();
    this.currentTarget = null;
    this._initRenderer();
  }

  _initRenderer() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a2236');
    scene.fog = new THREE.Fog('#1a2236', 26, 95);
    this.scene = scene;

    this.camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    this.renderer = renderer;
    this.container.appendChild(renderer.domElement);

    // iluminación de ambiente (IBL) para un look suave y realista
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    scene.add(new THREE.HemisphereLight('#eaf2ff', '#2a3552', 0.55));
    const sun = new THREE.DirectionalLight('#fff4e2', 1.4);
    sun.position.set(16, 26, 14); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 120;
    Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 20, bottom: -60 });
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    // luces cálidas de pasillo
    [-12, -26, -40].forEach((z) => {
      const p = new THREE.PointLight('#fff1d6', 22, 18, 2); p.position.set(0, 3.4, z); scene.add(p);
    });

    this.controls = new PointerLockControls(this.camera, renderer.domElement);
    this.controls.pointerSpeed = 0.7; // mirar más suave
    scene.add(this.controls.getObject());
    this.controls.addEventListener('lock', () => this.onLockChange(true));
    this.controls.addEventListener('unlock', () => this.onLockChange(false));

    addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
    this._bindKeys();
  }

  _bindKeys() {
    const set = (e, v) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.move.f = v; break;
        case 'KeyS': case 'ArrowDown': this.move.b = v; break;
        case 'KeyA': case 'ArrowLeft': this.move.l = v; break;
        case 'KeyD': case 'ArrowRight': this.move.r = v; break;
      }
    };
    addEventListener('keydown', (e) => {
      set(e, true);
      if (e.code === 'KeyE' && this.currentTarget && !this.paused) this.onEnterCase(this.currentTarget);
    });
    addEventListener('keyup', (e) => set(e, false));
  }

  build(cases) {
    const { interactables, walls, doors, footprint, crowd, spawn } = buildHospital(this.scene, cases);
    this.interactables = interactables;
    this.walls = walls;
    this.doors = doors || [];
    this.footprint = footprint;
    this.crowd = crowd;
    this.controls.getObject().position.set(spawn.x, spawn.y, spawn.z);
    this._loop();
  }

  lock() { try { this.controls.lock(); } catch (e) {} }
  setPaused(p) { this.paused = p; if (p && this.controls.isLocked) this.controls.unlock(); }

  _collides(x, z) {
    const f = this.footprint;
    if (x < f.x0 || x > f.x1 || z < f.z0 || z > f.z1) return true;
    for (const w of this.walls) {
      if (x > w.x0 - RADIUS && x < w.x1 + RADIUS && z > w.z0 - RADIUS && z < w.z1 + RADIUS) return true;
    }
    return false;
  }

  _loop() {
    const tick = () => {
      requestAnimationFrame(tick);
      const dt = Math.min(0.05, this.clock.getDelta());
      const t = this.clock.elapsedTime;

      if (!this.paused && this.controls.isLocked) {
        this.velocity.x -= this.velocity.x * 12 * dt;
        this.velocity.z -= this.velocity.z * 12 * dt;
        if (Math.abs(this.velocity.x) < 0.02) this.velocity.x = 0;  // evita deriva
        if (Math.abs(this.velocity.z) < 0.02) this.velocity.z = 0;
        this.direction.z = Number(this.move.f) - Number(this.move.b);
        this.direction.x = Number(this.move.r) - Number(this.move.l);
        this.direction.normalize();
        if (this.move.f || this.move.b) this.velocity.z -= this.direction.z * SPEED * dt;
        if (this.move.l || this.move.r) this.velocity.x -= this.direction.x * SPEED * dt;

        const obj = this.controls.getObject();
        const px = obj.position.x, pz = obj.position.z;
        this.controls.moveRight(-this.velocity.x * dt);
        this.controls.moveForward(-this.velocity.z * dt);
        const nx = obj.position.x, nz = obj.position.z;
        if (this._collides(nx, nz)) {                 // deslizar por la pared
          if (!this._collides(nx, pz)) obj.position.z = pz;
          else if (!this._collides(px, nz)) obj.position.x = px;
          else { obj.position.x = px; obj.position.z = pz; this.velocity.set(0, 0, 0); }
        }
        obj.position.y = 1.65;
        this._checkProximity(obj.position);
      }

      if (this.crowd) this.crowd.update(dt, t);
      (this.interactables || []).forEach((it) => {
        if (it.pad) it.pad.material.opacity = 0.35 + 0.2 * Math.sin(t * 3);
      });
      // puertas automáticas: se abren al acercarse
      const ppos = this.controls.getObject().position;
      (this.doors || []).forEach((d) => {
        const target = ppos.distanceTo(d.center) < 4 ? 1 : 0;
        d.amt += (target - d.amt) * 0.12;
        d.panels[0].position.z = d.closedZ[0] + (d.openZ[0] - d.closedZ[0]) * d.amt;
        d.panels[1].position.z = d.closedZ[1] + (d.openZ[1] - d.closedZ[1]) * d.amt;
      });
      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  _checkProximity(pos) {
    let near = null, best = 3.2;
    for (const it of this.interactables) {
      const d = pos.distanceTo(it.position);
      if (d < best) { best = d; near = it; }
    }
    const slug = near ? near.slug : null;
    if (slug !== this.currentTarget) { this.currentTarget = slug; this.onProximity(slug); }
  }
}
