import * as THREE from 'three';
import { mat, brick } from './lego.js';

const wheelMat = mat('#1b1f2a', { rough: 0.5 });
function wheels(g, w, d, y = 0.08) {
  [[-w, -d], [w, -d], [-w, d], [w, d]].forEach(([x, z]) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 12), wheelMat);
    c.rotation.z = Math.PI / 2; c.position.set(x, y, z); g.add(c);
  });
}

// Carrito de paro (crash cart) con desfibrilador.
export function crashCart() {
  const g = new THREE.Group();
  const body = brick(0.7, 0.95, 0.55, '#d33a3a'); body.position.y = 0.6; g.add(body);
  for (let i = 0; i < 3; i++) {
    const dr = brick(0.62, 0.04, 0.04, '#fff'); dr.position.set(0, 0.45 + i * 0.22, 0.28); g.add(dr);
  }
  const defib = brick(0.5, 0.22, 0.4, '#2a3550'); defib.position.set(0, 1.2, 0); g.add(defib);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.16),
    new THREE.MeshStandardMaterial({ color: '#1dd3a7', emissive: '#1dd3a7', emissiveIntensity: 0.8 }));
  scr.position.set(0, 1.25, 0.205); g.add(scr);
  wheels(g, 0.28, 0.22);
  return g;
}

// Portasueros (IV pole) con bolsa.
export function ivPole() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12), mat('#9aa6c2')); base.position.y = 0.05; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.9, 8), mat('#c2cbe0')); pole.position.y = 1.0; g.add(pole);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 8, 16), mat('#c2cbe0')); hook.position.y = 1.9; g.add(hook);
  const bag = brick(0.18, 0.3, 0.06, '#cfe9ff'); bag.position.set(0, 1.65, 0); bag.material.transparent = true; bag.material.opacity = 0.8; g.add(bag);
  return g;
}

// Biombo / mampara de privacidad (3 paneles).
export function screen(color = '#7fb0d8') {
  const g = new THREE.Group();
  const panel = () => brick(0.9, 1.7, 0.05, color);
  const a = panel(); a.position.set(-0.8, 0.95, 0); a.rotation.y = 0.4;
  const b = panel(); b.position.set(0, 0.95, 0.15);
  const c = panel(); c.position.set(0.8, 0.95, 0); c.rotation.y = -0.4;
  g.add(a, b, c);
  return g;
}

export function stool(color = '#37506e') {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16), mat(color)); seat.position.y = 0.55; g.add(seat);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8), mat('#9aa6c2')); pole.position.y = 0.28; g.add(pole);
  wheels(g, 0.16, 0.16, 0.06);
  return g;
}

export function chair(color = '#5566a8') {
  const g = new THREE.Group();
  const seat = brick(0.5, 0.1, 0.5, color); seat.position.y = 0.5; g.add(seat);
  const back = brick(0.5, 0.6, 0.1, color); back.position.set(0, 0.8, -0.2); g.add(back);
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([x, z]) => {
    const l = brick(0.07, 0.5, 0.07, '#3a4566'); l.position.set(x, 0.25, z); g.add(l);
  });
  return g;
}

export function cabinet(color = '#dfe6f2') {
  const g = new THREE.Group();
  const body = brick(1.0, 1.5, 0.5, color); body.position.y = 0.75; g.add(body);
  const top = brick(1.05, 0.06, 0.55, '#c7d2e6'); top.position.y = 1.53; g.add(top);
  [0.55, 1.05].forEach((y) => { const d = brick(0.9, 0.03, 0.03, '#aab6cc'); d.position.set(0, y, 0.26); g.add(d); });
  return g;
}

// Lámpara quirúrgica de techo.
export function surgicalLight() {
  const g = new THREE.Group();
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), mat('#aab6cc')); arm.position.y = 3.3; g.add(arm);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fffbe6', emissiveIntensity: 1.4 }));
  disc.position.y = 2.7; g.add(disc);
  return g;
}

export function instrumentTray() {
  const g = new THREE.Group();
  const table = brick(0.7, 0.04, 0.45, '#cfd8e8'); table.position.y = 0.95; g.add(table);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 8), mat('#9aa6c2')); pole.position.y = 0.47; g.add(pole);
  for (let i = 0; i < 4; i++) { const t = brick(0.04, 0.02, 0.22, '#dde6f4'); t.position.set(-0.25 + i * 0.16, 0.99, 0); g.add(t); }
  wheels(g, 0.2, 0.14, 0.06);
  return g;
}

export function plant() {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.4, 12), mat('#9c6b4a')); pot.position.y = 0.2; g.add(pot);
  const f1 = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), mat('#3a9d52')); f1.position.y = 0.9; f1.scale.set(1, 1.3, 1); g.add(f1);
  const f2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), mat('#46b364')); f2.position.set(0.2, 1.2, 0.1); g.add(f2);
  return g;
}

export function toyBox() {
  const g = new THREE.Group();
  const colors = ['#ff6b6b', '#ffd166', '#37c2ff', '#3ddc8a'];
  colors.forEach((c, i) => { const b = brick(0.3, 0.3, 0.3, c); b.position.set((i % 2) * 0.32 - 0.16, 0.15 + Math.floor(i / 2) * 0.32, 0); g.add(b); });
  return g;
}

// Puerta corredera automática (dos hojas de vidrio).
export function slidingDoor(x, cz, height = 2.6) {
  const g = new THREE.Group();
  const glass = () => new THREE.Mesh(new THREE.BoxGeometry(0.1, height, 1.5),
    new THREE.MeshStandardMaterial({ color: '#bfe3ff', transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.1 }));
  const a = glass(), b = glass();
  a.position.set(x, height / 2, cz - 0.75);
  b.position.set(x, height / 2, cz + 0.75);
  g.add(a, b);
  // marco lateral
  [-1.6, 1.6].forEach((dz) => { const p = brick(0.16, height + 0.2, 0.16, '#b8c2d8'); p.position.set(x, (height + 0.2) / 2, cz + dz); g.add(p); });
  return {
    group: g,
    center: new THREE.Vector3(x, 1, cz),
    panels: [a, b],
    closedZ: [cz - 0.75, cz + 0.75],
    openZ: [cz - 1.55, cz + 1.55],
    amt: 0
  };
}
