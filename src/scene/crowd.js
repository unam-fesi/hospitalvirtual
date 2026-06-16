import * as THREE from 'three';
import { makeMinifig, animateWalk, sit, animateIdle } from './minifig.js';

// Gestiona personal que deambula, pacientes sentados y figuras "vivas".
export class Crowd {
  constructor(scene) {
    this.scene = scene;
    this.agents = [];     // personal que camina
    this.seated = [];     // pacientes sentados
    this.idle = [];       // figuras quietas que respiran/parpadean (p. ej. pacientes en cama)
  }

  addIdle(fig) { this.idle.push(fig); }

  spawnStaff(n, bounds) {
    for (let i = 0; i < n; i++) {
      const kind = Math.random() < 0.5 ? 'doctor' : 'nurse';
      const fig = makeMinifig({ kind });
      const p = this._rand(bounds);
      fig.position.set(p.x, 0, p.z);
      this.scene.add(fig);
      this.agents.push({
        fig, bounds,
        target: this._rand(bounds),
        speed: 0.9 + Math.random() * 0.8,
        phase: Math.random() * 10
      });
    }
  }

  addSeated(positions) {
    positions.forEach((p, i) => {
      const fig = makeMinifig({ kind: 'patient' });
      fig.position.set(p.x, 0, p.z);
      fig.rotation.y = p.ry ?? 0;
      sit(fig);
      this.scene.add(fig);
      this.seated.push(fig);
    });
  }

  _rand(b) {
    return {
      x: b.x0 + Math.random() * (b.x1 - b.x0),
      z: b.z0 + Math.random() * (b.z1 - b.z0)
    };
  }

  update(dt, t) {
    for (const a of this.agents) {
      const dx = a.target.x - a.fig.position.x;
      const dz = a.target.z - a.fig.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.4) { a.target = this._rand(a.bounds); continue; }
      const vx = (dx / dist) * a.speed * dt;
      const vz = (dz / dist) * a.speed * dt;
      a.fig.position.x += vx;
      a.fig.position.z += vz;
      a.fig.rotation.y = Math.atan2(dx, dz);
      animateWalk(a.fig, t + a.phase, a.speed);
      animateIdle(a.fig, t);
    }
    for (const f of this.seated) animateIdle(f, t);
    for (const f of this.idle) animateIdle(f, t);
  }
}
