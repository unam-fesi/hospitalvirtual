import * as THREE from 'three';
import { mat } from './lego.js';

// Personaje humanoide estilizado y CONECTADO (articulaciones con esferas, sin partes flotantes).
// NO usa marca registrada. API: makeMinifig, animateWalk, animateIdle, sit, layDown.
export function makeMinifig({ kind = 'patient', ailment = null, skin = '#f1c27d' } = {}) {
  const g = new THREE.Group();
  const pal = {
    doctor: { suit: '#eaf1fb', accent: '#3a6ff0', hair: '#3a2a1e' },
    nurse: { suit: '#19b9a6', accent: '#0c8276', hair: '#2a1c14' },
    patient: { suit: '#aab6d6', accent: '#7a88b4', hair: '#4a3526' }
  }[kind] || { suit: '#aab6d6', accent: '#7a88b4', hair: '#4a3526' };
  if (ailment === 'quirurgico') { pal.suit = '#6cc0e8'; pal.accent = '#3f9bd0'; }
  if (ailment === 'paro') skin = '#d7d2c7';
  if (kind === 'patient') {
    const hairs = ['#4a3526', '#2a1c14', '#6b4b2a', '#8a8f99', '#3a2a1e', '#1f1a17'];
    pal.hair = hairs[Math.floor(Math.random() * hairs.length)];
  }
  const suit = mat(pal.suit), skinM = mat(skin);
  const ball = (r, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m);
  const cyl = (r1, r2, h, m) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 16), m);

  const hipY = 0.92;

  // ----- piernas (pivote en cadera, con rodilla y pie) -----
  const legMat = mat('#2c3553');
  function leg(x) {
    const piv = new THREE.Group(); piv.position.set(x, hipY, 0);
    const hip = ball(0.16, suit); piv.add(hip);
    const thigh = cyl(0.13, 0.115, 0.92, legMat); thigh.position.y = -0.46; thigh.castShadow = true; piv.add(thigh);
    const knee = ball(0.12, legMat); knee.position.y = -0.5; piv.add(knee);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.13, 0.36), mat('#1b2238'));
    foot.position.set(0, -0.9, 0.07); foot.castShadow = true; piv.add(foot);
    return piv;
  }
  const lLeg = leg(-0.15), rLeg = leg(0.15); g.add(lLeg, rLeg);

  // ----- pelvis + torso (grupo para respirar) -----
  const pelvis = ball(0.26, suit); pelvis.position.y = hipY + 0.02; pelvis.scale.set(1, 0.8, 0.9); g.add(pelvis);
  const torso = new THREE.Group(); torso.position.y = hipY; g.add(torso);
  const trunk = cyl(0.27, 0.24, 0.62, suit); trunk.position.y = 0.42; trunk.castShadow = true; torso.add(trunk);
  const chest = ball(0.28, suit); chest.position.y = 0.6; chest.scale.set(1, 0.85, 0.82); torso.add(chest);
  const shoulders = ball(0.3, suit); shoulders.position.y = 0.73; shoulders.scale.set(1, 0.6, 0.9); torso.add(shoulders);

  if (kind === 'doctor') { const coat = cyl(0.31, 0.3, 0.55, mat('#ffffff')); coat.position.y = hipY + 0.3; coat.castShadow = true; g.add(coat); }
  const collar = cyl(0.17, 0.17, 0.1, mat(pal.accent)); collar.position.y = hipY + 0.8; g.add(collar);
  const neck = cyl(0.1, 0.1, 0.18, skinM); neck.position.y = hipY + 0.86; g.add(neck);

  // ----- brazos (hombro + codo + mano) -----
  function arm(x) {
    const grp = new THREE.Group(); grp.position.set(x, hipY + 0.7, 0);
    grp.add(ball(0.13, suit));
    const upper = cyl(0.095, 0.085, 0.64, suit); upper.position.y = -0.35; upper.castShadow = true; grp.add(upper);
    const elbow = ball(0.09, suit); elbow.position.y = -0.64; grp.add(elbow);
    const hand = ball(0.1, skinM); hand.position.y = -0.72; grp.add(hand);
    grp.rotation.z = x < 0 ? 0.13 : -0.13;
    return grp;
  }
  const lArm = arm(-0.3), rArm = arm(0.3); g.add(lArm, rArm);
  if (ailment === 'dolor_pecho') { rArm.rotation.set(-1.2, 0, 0.2); rArm.position.set(0.15, hipY + 0.68, 0.12); }

  // ----- cabeza + cara con detalle -----
  const hY = hipY + 1.16;
  const head = ball(0.22, skinM); head.position.y = hY; head.castShadow = true; g.add(head);
  const eyeW = mat('#ffffff'), eyeD = mat('#26303f');
  const eyeWhites = [];
  const closed = ailment === 'paro';
  function eye(x) {
    if (closed) {
      const lid = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.03), eyeD);
      lid.position.set(x, hY + 0.02, 0.2); g.add(lid);
    } else {
      const w = ball(0.05, eyeW); w.scale.set(1, 1.2, 0.55); w.position.set(x, hY + 0.02, 0.185); g.add(w); eyeWhites.push(w);
      const p = ball(0.026, eyeD); p.position.set(x, hY + 0.01, 0.215); g.add(p);
    }
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.022, 0.025), mat(pal.hair));
    brow.position.set(x, hY + 0.11, 0.185); brow.rotation.z = x < 0 ? 0.1 : -0.1; g.add(brow);
  }
  eye(-0.085); eye(0.085);
  const nose = ball(0.038, skinM); nose.position.set(0, hY - 0.01, 0.21); nose.scale.set(1, 1.3, 1); g.add(nose);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.026, 0.02), mat(ailment === 'paro' ? '#8b97a6' : '#b5675f'));
  mouth.position.set(0, hY - 0.11, 0.2); g.add(mouth);
  [-0.215, 0.215].forEach((x) => { const e = ball(0.045, skinM); e.scale.set(0.6, 1, 1); e.position.set(x, hY, 0); g.add(e); });

  // oxígeno: mascarilla (paro) o cánula nasal (encamados)
  if (ailment === 'paro') {
    const mask = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#cfeafc', transparent: true, opacity: 0.55, roughness: 0.2 }));
    mask.rotation.x = Math.PI / 2; mask.position.set(0, hY - 0.07, 0.16); g.add(mask);
    const tube = cyl(0.015, 0.015, 0.45, mat('#e3eaf5')); tube.position.set(0.12, hY - 0.25, 0.14); tube.rotation.z = 0.7; g.add(tube);
  } else if (ailment === 'sangrado' || ailment === 'quirurgico' || ailment === 'pediatrico') {
    const cn = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 16), mat('#eef3fb')); cn.position.set(0, hY - 0.04, 0.2); g.add(cn);
  }

  // cabello / gorro
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.235, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.7), mat(pal.hair));
  hair.position.y = hY + 0.02; g.add(hair);
  if (kind === 'nurse' || ailment === 'quirurgico') {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.245, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.4), mat('#2bb6c9'));
    cap.position.y = hY + 0.06; g.add(cap);
  }

  // ----- detalle de cuerpo -----
  const belt = cyl(0.255, 0.235, 0.08, mat('#34405e')); belt.position.y = hipY + 0.06; g.add(belt);
  if (kind === 'doctor' || kind === 'nurse') {
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.02), mat('#ffffff')); badge.position.set(-0.13, hipY + 0.5, 0.23); g.add(badge);
  }
  if (kind === 'doctor') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 8, 24), mat('#2b3550')); ring.position.set(0, hipY + 0.62, 0.05); ring.rotation.x = 0.5; g.add(ring);
    const piece = cyl(0.055, 0.055, 0.03, mat('#aeb8cf')); piece.position.set(0.02, hipY + 0.4, 0.22); piece.rotation.x = Math.PI / 2; g.add(piece);
  }
  if (ailment === 'sangrado') { const w = new THREE.Mesh(new THREE.CircleGeometry(0.12, 14), mat('#b3091f')); w.position.set(0.04, hipY + 0.36, 0.27); g.add(w); }
  if (ailment === 'pediatrico') {
    for (let i = 0; i < 6; i++) { const d = ball(0.026, mat('#e03e3e')); d.position.set(-0.16 + Math.random() * 0.32, hY - 0.18 + Math.random() * 0.18, 0.2); g.add(d); }
  }

  g.userData.legs = [lLeg, rLeg];
  g.userData.torso = torso;
  g.userData.eyes = eyeWhites;
  g.userData.phase = Math.random() * 10;
  g.scale.setScalar(ailment === 'pediatrico' ? 0.62 : 0.9);
  return g;
}

// Acostado boca arriba a lo largo del eje X (para camas).
export function layOnBed(fig, headTowardPlusX = true) {
  fig.rotation.z = headTowardPlusX ? -Math.PI / 2 : Math.PI / 2;
}
export function layDown(fig) { fig.rotation.z = -Math.PI / 2; }
export function sit(fig) { (fig.userData.legs || []).forEach((l) => { l.rotation.x = -Math.PI / 2; }); }

export function animateWalk(fig, t, speed = 1) {
  const legs = fig.userData.legs || [];
  if (legs.length === 2) {
    legs[0].rotation.x = Math.sin(t * 6 * speed) * 0.5;
    legs[1].rotation.x = -Math.sin(t * 6 * speed) * 0.5;
  }
}
export function animateIdle(fig, t) {
  const u = fig.userData; const ph = u.phase || 0;
  if (u.torso) u.torso.scale.y = 1 + Math.sin(t * 1.6 + ph) * 0.03;
  if (u.eyes) { const blink = ((t * 0.55 + ph) % 3.2) > 3.05 ? 0.12 : 1.2; u.eyes.forEach((e) => { e.scale.y = blink; }); }
}
