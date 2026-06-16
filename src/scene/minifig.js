import * as THREE from 'three';
import { mat } from './lego.js';

// Personajes estilizados (redondeados, NO LEGO: sin studs ni cabeza cilíndrica de marca).
// Mantiene la API: makeMinifig, animateWalk, sit, layDown.
export function makeMinifig({ kind = 'patient', ailment = null, skin = '#f1c27d' } = {}) {
  const g = new THREE.Group();
  const palette = {
    doctor: { suit: '#eaf1fb', accent: '#3a6ff0', hair: '#3a2a1e' },
    nurse: { suit: '#19b9a6', accent: '#0c8276', hair: '#2a1c14' },
    patient: { suit: '#aab6d6', accent: '#7a88b4', hair: '#4a3526' }
  }[kind] || { suit: '#aab6d6', accent: '#7a88b4', hair: '#4a3526' };
  if (ailment === 'quirurgico') { palette.suit = '#6cc0e8'; palette.accent = '#3f9bd0'; }
  if (ailment === 'paro') skin = '#d7d2c7';

  const suit = mat(palette.suit);
  const skinM = mat(skin);

  // piernas con pivote en cadera (para caminar)
  const hipY = 0.95;
  const legGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.82, 12);
  const legMat = mat('#2c3553');
  function leg(x) {
    const pivot = new THREE.Group(); pivot.position.set(x, hipY, 0);
    const m = new THREE.Mesh(legGeo, legMat); m.position.y = -0.41; m.castShadow = true;
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.34), mat('#1b2238'));
    foot.position.set(0, -0.82, 0.05); m.add(foot);
    pivot.add(m); return pivot;
  }
  const lLeg = leg(-0.16), rLeg = leg(0.16); g.add(lLeg, rLeg);

  // pelvis + torso (cápsula: cilindro + esferas para redondear)
  const torso = new THREE.Group(); torso.position.y = hipY + 0.05;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.7, 16), suit);
  trunk.position.y = 0.35; trunk.castShadow = true;
  const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), suit);
  shoulder.position.y = 0.68; shoulder.scale.set(1, 0.7, 1);
  torso.add(trunk, shoulder);
  g.add(torso);

  // bata de doctor / detalle de color
  if (kind === 'doctor') {
    const coat = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.3, 0.5, 16), mat('#ffffff'));
    coat.position.y = hipY + 0.2; coat.castShadow = true; g.add(coat);
  }
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12), mat(palette.accent));
  collar.position.y = hipY + 0.78; g.add(collar);

  // brazos (cápsulas)
  const armGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.66, 10);
  function arm(x) {
    const a = new THREE.Mesh(armGeo, suit); a.position.set(x, hipY + 0.32, 0); a.castShadow = true;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), skinM); hand.position.y = -0.36; a.add(hand);
    return a;
  }
  const lArm = arm(-0.34), rArm = arm(0.34); g.add(lArm, rArm);
  if (ailment === 'dolor_pecho') { rArm.rotation.x = -1.3; rArm.position.set(0.18, hipY + 0.42, 0.16); }

  // cuello + cabeza (esfera)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 10), skinM);
  neck.position.y = hipY + 0.86; g.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), skinM);
  head.position.y = hipY + 1.12; head.castShadow = true; g.add(head);
  // cabello (medio casquete)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.8), mat(palette.hair));
  hair.position.y = hipY + 1.16; g.add(hair);
  // gorro quirúrgico
  if (kind === 'nurse' || ailment === 'quirurgico') {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.4), mat('#2bb6c9'));
    cap.position.y = hipY + 1.2; g.add(cap);
  }

  // ----- cara con detalle (mira hacia +z) -----
  const eyeW = mat('#ffffff'), eyeD = mat('#26303f');
  function eye(x) {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), eyeW);
    w.scale.set(1, 1.2, 0.6); w.position.set(x, hipY + 1.16, 0.205); g.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), eyeD);
    p.position.set(x, hipY + 1.15, 0.245); g.add(p);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.024, 0.025), mat(palette.hair));
    brow.position.set(x, hipY + 1.27, 0.22); brow.rotation.z = x < 0 ? 0.12 : -0.12; g.add(brow);
  }
  eye(-0.095); eye(0.095);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), skinM);
  nose.position.set(0, hipY + 1.09, 0.24); nose.scale.set(1, 1.2, 1); g.add(nose);
  const mouthCol = ailment === 'paro' ? '#7d8a99' : '#b5675f';
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.028, 0.02), mat(mouthCol));
  mouth.position.set(0, hipY + 1.0, 0.225); g.add(mouth);
  const ears = [-0.235, 0.235].map((x) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), skinM);
    e.scale.set(0.6, 1, 1); e.position.set(x, hipY + 1.12, 0); g.add(e); return e;
  });

  // ----- detalle de cuerpo -----
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.245, 0.09, 16), mat('#34405e'));
  belt.position.y = hipY + 0.04; g.add(belt);
  if (kind === 'doctor' || kind === 'nurse') {
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.02), mat('#ffffff'));
    badge.position.set(-0.13, hipY + 0.42, 0.22); g.add(badge);
  }
  if (kind === 'doctor') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 8, 24), mat('#2b3550'));
    ring.position.set(0, hipY + 0.58, 0.04); ring.rotation.x = 0.5; g.add(ring);
    const chestPiece = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 12), mat('#aeb8cf'));
    chestPiece.position.set(0.02, hipY + 0.34, 0.2); g.add(chestPiece);
  }

  // marcas de dolencia
  if (ailment === 'sangrado') {
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), mat('#b3091f'));
    w.position.set(0.04, hipY + 0.3, 0.27); g.add(w);
  }
  if (ailment === 'pediatrico') {
    for (let i = 0; i < 6; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), mat('#e03e3e'));
      d.position.set(-0.16 + Math.random() * 0.32, hipY + 1.0 + Math.random() * 0.2, 0.22); g.add(d);
    }
  }

  g.userData.legs = [lLeg, rLeg];
  g.scale.setScalar(ailment === 'pediatrico' ? 0.6 : 0.82); // altura ~1.5–1.8 m
  return g;
}

export function layDown(fig) { fig.rotation.x = -Math.PI / 2; fig.position.y += 0.5; }
export function sit(fig) { (fig.userData.legs || []).forEach((l) => { l.rotation.x = -Math.PI / 2; }); }
export function animateWalk(fig, t, speed = 1) {
  const legs = fig.userData.legs || [];
  if (legs.length === 2) {
    legs[0].rotation.x = Math.sin(t * 6 * speed) * 0.5;
    legs[1].rotation.x = -Math.sin(t * 6 * speed) * 0.5;
  }
}
