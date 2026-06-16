import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { buildHospital } from './hospital.js';

const SPEED = 60;

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
    scene.background = new THREE.Color('#0b1020');
    scene.fog = new THREE.Fog('#0b1020', 30, 80);
    this.scene = scene;

    this.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 200);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    scene.add(new THREE.HemisphereLight('#dbe9ff', '#23335c', 1.0));
    const sun = new THREE.DirectionalLight('#fff6e6', 0.9);
    sun.position.set(18, 30, 12); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50 });
    scene.add(sun);

    this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
    scene.add(this.controls.getObject());

    this.controls.addEventListener('lock', () => this.onLockChange(true));
    this.controls.addEventListener('unlock', () => this.onLockChange(false));

    addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
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
      if (e.code === 'KeyE' && this.currentTarget && !this.paused) {
        this.onEnterCase(this.currentTarget);
      }
    });
    addEventListener('keyup', (e) => set(e, false));
  }

  build(cases) {
    const { interactables, bounds, crowd, spawn } = buildHospital(this.scene, cases);
    this.interactables = interactables;
    this.bounds = bounds;
    this.crowd = crowd;
    this.controls.getObject().position.set(spawn.x, spawn.y, spawn.z);
    this._loop();
  }

  lock() { try { this.controls.lock(); } catch (e) {} }
  setPaused(p) { this.paused = p; if (p && this.controls.isLocked) this.controls.unlock(); }

  _walkable(x, z) {
    const m = 0.35;
    return this.bounds.some(b => x > b.x0 + m && x < b.x1 - m && z > b.z0 + m && z < b.z1 - m);
  }

  _loop() {
    const tick = () => {
      requestAnimationFrame(tick);
      const dt = Math.min(0.05, this.clock.getDelta());
      const t = this.clock.elapsedTime;

      if (!this.paused && this.controls.isLocked) {
        this.velocity.x -= this.velocity.x * 10 * dt;
        this.velocity.z -= this.velocity.z * 10 * dt;
        this.direction.z = Number(this.move.f) - Number(this.move.b);
        this.direction.x = Number(this.move.r) - Number(this.move.l);
        this.direction.normalize();
        if (this.move.f || this.move.b) this.velocity.z -= this.direction.z * SPEED * dt;
        if (this.move.l || this.move.r) this.velocity.x -= this.direction.x * SPEED * dt;

        const obj = this.controls.getObject();
        const px = obj.position.x, pz = obj.position.z;
        this.controls.moveRight(-this.velocity.x * dt);
        this.controls.moveForward(-this.velocity.z * dt);
        obj.position.y = 1.6;
        if (!this._walkable(obj.position.x, obj.position.z)) {
          obj.position.x = px; obj.position.z = pz;
          this.velocity.set(0, 0, 0);
        }
        this._checkProximity(obj.position);
      }

      if (this.crowd) this.crowd.update(dt, t);
      // pulso de los pads de interacción
      (this.interactables || []).forEach((it) => {
        if (it.pad) it.pad.material.opacity = 0.35 + 0.2 * Math.sin(t * 3);
      });
      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  _checkProximity(pos) {
    let near = null, best = 3.0;
    for (const it of this.interactables) {
      const d = pos.distanceTo(it.position);
      if (d < best) { best = d; near = it; }
    }
    const slug = near ? near.slug : null;
    if (slug !== this.currentTarget) {
      this.currentTarget = slug;
      this.onProximity(slug);
    }
  }
}
