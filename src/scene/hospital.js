import * as THREE from 'three';
import { basePlate, wall, brick, mat } from './lego.js';
import { makeMinifig, layDown } from './minifig.js';
import { makeDevice } from './devices.js';
import { Crowd } from './crowd.js';

// Posición de cada sala en el plano (cx,cz) y lado del pasillo.
const ROOM_POS = {
  urgencias:   { cx: -7, cz: -9,  side: 'left' },
  consulta:    { cx: -7, cz: -21, side: 'left' },
  pediatria:   { cx: -7, cz: -33, side: 'left' },
  reanimacion: { cx:  7, cz: -13, side: 'right' },
  quirofano:   { cx:  7, cz: -27, side: 'right' }
};

function labelSprite(text, color = '#0b1020', bg = 'rgba(234,240,255,0.95)') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = bg; roundRect(x, 6, 6, c.width - 12, c.height - 12, 24); x.fill();
  x.fillStyle = color; x.font = 'bold 52px -apple-system,Segoe UI,sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  spr.scale.set(4, 1, 1);
  return spr;
}
function roundRect(x, a, b, w, h, r) {
  x.beginPath(); x.moveTo(a + r, b);
  x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath();
}

function buildRoom(scene, slug, caseObj) {
  const pos = ROOM_POS[slug] || { cx: -7, cz: -9, side: 'left' };
  const { cx, cz, side } = pos;
  const left = side === 'left';
  const color = caseObj?.color || '#37c2ff';

  // piso de color de la sala
  const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.06, 8), mat('#cdd8ef'));
  floor.position.set(cx, 0.02, cz); floor.receiveShadow = true;
  const tint = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.07, 7.4),
    new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.18 }));
  tint.position.set(cx, 0.04, cz);
  scene.add(floor, tint);

  // muros (3 lados; el lado del pasillo queda abierto)
  const H = 3, outerX = left ? cx - 4 : cx + 4;
  scene.add(place(wall(0.3, H, 8, '#e7edf7'), outerX, H / 2, cz));       // pared exterior
  scene.add(place(wall(8, H, 0.3, '#eef2fa'), cx, H / 2, cz - 4));       // pared fondo
  scene.add(place(wall(8, H, 0.3, '#eef2fa'), cx, H / 2, cz + 4));       // pared frente
  // franja de color sobre la entrada
  scene.add(place(brick(8, 0.5, 0.4, color, { studs: false }), cx, H, left ? cz + 0 : cz + 0));

  // letrero de la sala sobre el pasillo
  const lab = labelSprite(`${caseObj?.icon || ''} ${caseObj?.section || slug}`);
  lab.position.set(left ? cx + 3.6 : cx - 3.6, 2.7, cz);
  scene.add(lab);

  // cama + paciente con su dolencia
  const bed = brick(2.4, 0.7, 1.1, '#dfe7f5', { studs: false });
  bed.position.set(cx, 0.45, cz - 1.5);
  scene.add(bed);
  const patient = makeMinifig({ kind: 'patient', ailment: caseObj?.patient?.ailment });
  const ail = caseObj?.patient?.ailment;
  if (ail === 'paro' || ail === 'quirurgico' || ail === 'sangrado') {
    patient.position.set(cx, 0.85, cz - 1.5); layDown(patient);
  } else {
    patient.position.set(cx, 0, cz - 1.0); patient.rotation.y = Math.PI;
  }
  scene.add(patient);

  // aparatos de medición LEGO con los valores del caso
  (caseObj?.devices || []).slice(0, 2).forEach((d, i) => {
    const dev = makeDevice(d.kind, d.label, d.data);
    dev.position.set(cx + (left ? 2.6 : -2.6), 0, cz - 2.2 + i * 1.8);
    dev.rotation.y = left ? -Math.PI / 2 : Math.PI / 2;
    scene.add(dev);
  });

  // pad de interacción brillante frente a la cama
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.08, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }));
  pad.position.set(cx, 0.06, cz + 0.6);
  scene.add(pad);
  const ring = labelSprite('Atender (E)', '#04263a', 'rgba(55,194,255,0.95)');
  ring.scale.set(2.4, 0.6, 1); ring.position.set(cx, 1.4, cz + 0.6);
  scene.add(ring);

  return { slug, position: new THREE.Vector3(cx, 1, cz + 0.6), pad, ring, color };
}

function place(mesh, x, y, z) { mesh.position.set(x, y, z); return mesh; }

// Construye todo el hospital. Devuelve interactuables, límites de caminado y la multitud.
export function buildHospital(scene, cases) {
  scene.add(basePlate(96, '#3a7d44'));

  // pasillo central
  const corridor = new THREE.Mesh(new THREE.BoxGeometry(6, 0.06, 44), mat('#c3cde4'));
  corridor.position.set(0, 0.03, -18); corridor.receiveShadow = true;
  scene.add(corridor);
  scene.add(place(wall(0.3, 3, 44, '#e7edf7'), -3.05, 1.5, -18)); // se interrumpe visualmente por salas
  scene.add(place(wall(0.3, 3, 44, '#e7edf7'), 3.05, 1.5, -18));
  scene.add(place(wall(6.6, 3, 0.3, '#e7edf7'), 0, 1.5, -40));     // fondo del pasillo
  scene.add(place(wall(6.6, 3, 0.3, '#e7edf7'), 0, 1.5, 3));       // entrada

  // techo-letrero de entrada
  const entrance = labelSprite('🏥 Hospital Virtual UNAM');
  entrance.scale.set(6, 1.5, 1); entrance.position.set(0, 3.4, 2.8);
  scene.add(entrance);

  // crea cada sala asociada a su caso
  const interactables = [];
  const bySlugRoom = {};
  cases.forEach((c) => { if (c.room && !bySlugRoom[c.room]) bySlugRoom[c.room] = c; });
  Object.keys(ROOM_POS).forEach((room) => {
    const caseObj = bySlugRoom[room] || cases.find((c) => c.room === room);
    if (!caseObj) return;
    const r = buildRoom(scene, room, caseObj);
    interactables.push({ slug: caseObj.slug, position: r.position, pad: r.pad, ring: r.ring });
  });

  // sala de espera junto a la entrada: bancas + pacientes sentados
  const crowd = new Crowd(scene);
  const benchY = 0.35;
  [-2.2, 2.2].forEach((bx) => {
    const bench = brick(0.8, 0.5, 3, '#8c7ae6', { studs: false });
    bench.position.set(bx, benchY, -1.5); scene.add(bench);
  });
  crowd.addSeated([
    { x: -2.2, z: -0.6, ry: Math.PI / 2 },
    { x: -2.2, z: -2.2, ry: Math.PI / 2 },
    { x: 2.2, z: -1.0, ry: -Math.PI / 2 },
    { x: 2.2, z: -2.4, ry: -Math.PI / 2 }
  ]);
  // personal deambulando por el pasillo
  crowd.spawnStaff(6, { x0: -2.4, x1: 2.4, z0: -38, z1: 0 });

  // límites de caminado (pasillo + salas)
  const bounds = [{ x0: -3, x1: 3, z0: -39, z1: 2 }];
  Object.values(ROOM_POS).forEach(({ cx, cz }) => {
    bounds.push({ x0: cx - 3.6, x1: cx + 3.6, z0: cz - 3.6, z1: cz + 3.6 });
  });

  return { interactables, bounds, crowd, spawn: { x: 0, y: 1.6, z: 0 } };
}
