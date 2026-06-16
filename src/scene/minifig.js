import * as THREE from 'three';
import { mat } from './lego.js';

// Construye una minifigura LEGO a partir de cajas/cilindros.
// kind: 'doctor' | 'nurse' | 'patient'
// ailment: 'sangrado' | 'paro' | 'dolor_pecho' | 'quirurgico' | 'pediatrico' | null
export function makeMinifig({ kind = 'patient', ailment = null, skin = '#ffcf4d' } = {}) {
  const g = new THREE.Group();
  const colors = {
    doctor: { shirt: '#f4f7fb', pants: '#2b3a67' },
    nurse: { shirt: '#22b8a6', pants: '#0f6f63' },
    patient: { shirt: '#9fb0d8', pants: '#5c6b91' }
  }[kind] || { shirt: '#9fb0d8', pants: '#5c6b91' };
  if (ailment === 'quirurgico') { colors.shirt = '#5fb6e6'; colors.pants = '#5fb6e6'; }
  if (ailment === 'paro') { skin = '#cdd6e0'; } // palidez

  // piernas (con pivote en la cadera para animar el caminado)
  const legGeo = new THREE.BoxGeometry(0.26, 0.7, 0.3);
  const legMat = mat(colors.pants);
  const hipY = 0.7;
  function makeLeg(x) {
    const pivot = new THREE.Group();
    pivot.position.set(x, hipY, 0);
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.y = -0.35; leg.castShadow = true;
    pivot.add(leg);
    return pivot;
  }
  const lLeg = makeLeg(-0.16), rLeg = makeLeg(0.16);
  g.add(lLeg, rLeg);

  // torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.36), mat(colors.shirt));
  torso.position.y = hipY + 0.35; torso.castShadow = true;
  g.add(torso);

  // bata de doctor (faldón blanco)
  if (kind === 'doctor') {
    const coat = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.5, 0.42), mat('#ffffff'));
    coat.position.y = hipY + 0.05; coat.castShadow = true; g.add(coat);
  }

  // brazos
  const armGeo = new THREE.BoxGeometry(0.18, 0.6, 0.22);
  const lArm = new THREE.Mesh(armGeo, mat(colors.shirt));
  const rArm = new THREE.Mesh(armGeo, mat(colors.shirt));
  lArm.position.set(-0.39, hipY + 0.4, 0); rArm.position.set(0.39, hipY + 0.4, 0);
  lArm.castShadow = rArm.castShadow = true;
  g.add(lArm, rArm);
  if (ailment === 'dolor_pecho') { rArm.rotation.x = -1.2; rArm.position.set(0.28, hipY + 0.5, 0.18); }

  // cabeza
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 16), mat(skin));
  head.position.y = hipY + 0.95; head.castShadow = true; g.add(head);
  // gorro / cabello
  const capColor = kind === 'doctor' ? '#2b3a67' : kind === 'nurse' ? '#0f6f63' : '#6b4b2a';
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 16), mat(capColor));
  cap.position.y = hipY + 1.22; g.add(cap);

  // marcas de dolencia
  if (ailment === 'sangrado') {
    const blood = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.02), mat('#c1121f'));
    blood.position.set(0.05, hipY + 0.3, 0.19); g.add(blood);
  }
  if (ailment === 'pediatrico') {
    for (let i = 0; i < 5; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), mat('#e03e3e'));
      dot.position.set(-0.18 + Math.random() * 0.36, hipY + 0.85 + Math.random() * 0.2, 0.2);
      g.add(dot);
    }
  }

  g.userData.legs = [lLeg, rLeg];
  // tamaño: niños más pequeños
  const scale = ailment === 'pediatrico' ? 0.62 : 1;
  g.scale.setScalar(scale);
  return g;
}

// Pone al personaje en pose acostada (para paro / quirófano).
export function layDown(fig) {
  fig.rotation.x = -Math.PI / 2;
  fig.position.y += 0.4;
}

// Pose sentada simple (gira las piernas hacia adelante).
export function sit(fig) {
  (fig.userData.legs || []).forEach((l) => { l.rotation.x = -Math.PI / 2; });
}

// Anima el caminado balanceando las piernas.
export function animateWalk(fig, t, speed = 1) {
  const legs = fig.userData.legs || [];
  if (legs.length === 2) {
    legs[0].rotation.x = Math.sin(t * 6 * speed) * 0.5;
    legs[1].rotation.x = -Math.sin(t * 6 * speed) * 0.5;
  }
}
