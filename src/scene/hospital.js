import * as THREE from 'three';
import { mat, brick, wall, emissivePanel, floorTexture } from './lego.js';
import { makeMinifig, layDown } from './minifig.js';
import { makeDevice } from './devices.js';
import { Crowd } from './crowd.js';
import { crashCart, ivPole, screen, stool, chair, cabinet, surgicalLight, instrumentTray, plant, toyBox, slidingDoor, gurney, wallMonitor } from './props.js';

const CH = 4;     // altura de techo
const WT = 0.25;  // grosor de muro

// Posición de cada caso en el edificio (lado del pasillo + centro en Z).
const ROOM_SLOTS = {
  urgencias:   { side: 'left',  cz: -12 },
  reanimacion: { side: 'right', cz: -18 },
  consulta:    { side: 'left',  cz: -28 },
  quirofano:   { side: 'right', cz: -36 },
  pediatria:   { side: 'left',  cz: -44 }
};
const DOOR_W = 3;

export function buildHospital(scene, cases) {
  const walls = [];
  const interactables = [];
  const doors = [];
  const idleFigs = [];

  // ---------- helpers de muros + colisión ----------
  function addWall(ax, az, bx, bz, h = CH, color = '#e9eef7') {
    const vertical = Math.abs(bx - ax) < 0.001;
    const cx = (ax + bx) / 2, cz = (az + bz) / 2;
    const sx = vertical ? WT : Math.abs(bx - ax);
    const sz = vertical ? Math.abs(bz - az) : WT;
    const m = wall(sx, h, sz, color); m.position.set(cx, h / 2, cz); scene.add(m);
    walls.push({ x0: cx - sx / 2, x1: cx + sx / 2, z0: cz - sz / 2, z1: cz + sz / 2 });
    return m;
  }
  function addVWall(x, z1, z2, gaps = [], color) {
    let cur = Math.min(z1, z2); const end = Math.max(z1, z2);
    gaps.slice().sort((a, b) => a.c - b.c).forEach((g) => {
      const s = g.c - g.w / 2;
      if (s > cur) addWall(x, cur, x, s, CH, color);
      cur = g.c + g.w / 2;
    });
    if (cur < end) addWall(x, cur, x, end, CH, color);
  }
  function addHWall(z, x1, x2, gaps = [], color) {
    let cur = Math.min(x1, x2); const end = Math.max(x1, x2);
    gaps.slice().sort((a, b) => a.c - b.c).forEach((g) => {
      const s = g.c - g.w / 2;
      if (s > cur) addWall(cur, z, s, z, CH, color);
      cur = g.c + g.w / 2;
    });
    if (cur < end) addWall(cur, z, end, z, CH, color);
  }

  // ---------- piso + techo ----------
  const fW = 31, fD = 56, fz = -21.5;
  const ftex = floorTexture(); ftex.repeat.set(fW / 2.2, fD / 2.2);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(fW, fD),
    new THREE.MeshStandardMaterial({ map: ftex, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, fz); floor.receiveShadow = true;
  scene.add(floor);

  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(fW, fD), mat('#f4f7fc'));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, CH, fz); scene.add(ceil);

  // ---------- letrero de entrada ----------
  scene.add(label('🏥 Hospital Virtual UNAM', 0, 3.4, 5.7, 5, 1.25));

  // ---------- lobby ----------
  addHWall(6, -8, 8, [], '#dde6f4');                 // fondo lobby
  addVWall(-8, -4, 6); addVWall(8, -4, 6);           // lados lobby
  addHWall(-4, -8, 8, [{ c: 0, w: 6 }]);             // frente lobby (entrada al pasillo)
  // recepción
  const desk = brick(4, 1.1, 1.2, '#2b3a67'); desk.position.set(0, 0.55, 3.6); scene.add(desk);
  scene.add(label('Recepción', 0, 1.9, 3.6, 2.2, 0.55));
  // plantas y sillas del lobby
  [[-7, 4.8], [7, 4.8], [-7, -3], [7, -3]].forEach(([x, z]) => { const p = plant(); p.position.set(x, 0, z); scene.add(p); });
  [[-3, -2.6], [3, -2.6]].forEach(([x, z]) => { const c = chair(); c.position.set(x, 0, z); c.rotation.y = x < 0 ? 0.5 : -0.5; scene.add(c); });

  // ---------- pasillo (muros con puertas) ----------
  const leftDoors = Object.values(ROOM_SLOTS).filter(s => s.side === 'left').map(s => ({ c: s.cz, w: DOOR_W }));
  const rightDoors = Object.values(ROOM_SLOTS).filter(s => s.side === 'right').map(s => ({ c: s.cz, w: DOOR_W }));
  addVWall(-3, -49, -4, leftDoors, '#dde6f4');
  addVWall(3, -49, -4, rightDoors, '#dde6f4');
  addHWall(-49, -3, 3);                               // fin de pasillo
  // luminarias de techo en el pasillo
  for (let z = -8; z > -48; z -= 8) {
    const lamp = emissivePanel(2.4, 1.2, '#ffffff', 1.4); lamp.position.set(0, CH - 0.02, z); scene.add(lamp);
  }

  // ---------- salas ----------
  const byRoom = {};
  cases.forEach((c) => { if (!byRoom[c.room]) byRoom[c.room] = c; });

  Object.entries(ROOM_SLOTS).forEach(([room, slot]) => {
    const caseObj = byRoom[room] || cases.find((c) => c.room === room);
    if (!caseObj) return;
    const left = slot.side === 'left';
    const innerX = left ? -3 : 3;     // borde con el pasillo
    const outerX = left ? -15 : 15;   // pared exterior
    const cx = (innerX + outerX) / 2; // centro de la sala
    const cz = slot.cz;
    const color = caseObj.color || '#37c2ff';

    // muros de la sala (3 lados; el del pasillo ya tiene la puerta)
    addVWall(outerX, cz - 5, cz + 5, [], '#eef2fa');
    addHWall(cz - 5, outerX, innerX, [], '#eef2fa');
    addHWall(cz + 5, outerX, innerX, [], '#eef2fa');

    // piso temático
    const tint = new THREE.Mesh(new THREE.PlaneGeometry(11.4, 9.4),
      new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.14, roughness: 1 }));
    tint.rotation.x = -Math.PI / 2; tint.position.set(cx, 0.02, cz); scene.add(tint);
    // ventana exterior (panel luminoso)
    const win = new THREE.Mesh(new THREE.PlaneGeometry(5, 2),
      new THREE.MeshStandardMaterial({ color: '#bfe3ff', emissive: '#bfe3ff', emissiveIntensity: 0.5, roughness: 1 }));
    win.position.set(outerX + (left ? 0.14 : -0.14), 2.1, cz);
    win.rotation.y = left ? Math.PI / 2 : -Math.PI / 2; scene.add(win);
    // luminaria
    const lamp = emissivePanel(3, 1.4, '#ffffff', 1.5); lamp.position.set(cx, CH - 0.02, cz); scene.add(lamp);

    // dintel + letrero sobre la puerta
    const lintel = brick(WT, 1.4, DOOR_W, color); lintel.position.set(innerX, CH - 0.7, cz); scene.add(lintel);
    const spr = label(`${caseObj.icon || ''} ${caseObj.section}`, innerX + (left ? 0.9 : -0.9), 3.5, cz, 3, 0.7);
    scene.add(spr);

    // puerta corredera automática (se abre al acercarse)
    const door = slidingDoor(innerX, cz);
    scene.add(door.group); doors.push(door);

    // cama contra la pared exterior
    const bedX = cx + (left ? -1.6 : 1.6);
    const bed = brick(2.6, 0.55, 1.3, '#e6ecf7'); bed.position.set(bedX, 0.4, cz); scene.add(bed);
    const pillow = brick(0.7, 0.2, 1.1, '#ffffff'); pillow.position.set(bedX + (left ? 0.85 : -0.85), 0.72, cz); scene.add(pillow);

    // paciente con su dolencia
    const ail = caseObj.patient?.ailment;
    const patient = makeMinifig({ kind: 'patient', ailment: ail });
    if (ail === 'paro' || ail === 'quirurgico' || ail === 'sangrado') {
      patient.position.set(bedX, 0.7, cz); layDown(patient); patient.rotation.z = left ? Math.PI / 2 : -Math.PI / 2;
    } else {
      patient.position.set(cx, 0, cz + 2.5); patient.rotation.y = left ? Math.PI / 2 : -Math.PI / 2;
    }
    scene.add(patient); idleFigs.push(patient);

    // monitor de pared encendido (sobre la pared del fondo de la sala)
    const wm = wallMonitor(); wm.position.set(cx, 2.3, cz - 4.85); scene.add(wm);

    // aparatos de medición LEGO con valores del caso
    (caseObj.devices || []).slice(0, 2).forEach((d, i) => {
      const dev = makeDevice(d.kind, d.label, d.data);
      dev.position.set(cx + (left ? 1.8 : -1.8), 0, cz - 3 + i * 2.4);
      dev.rotation.y = left ? -Math.PI / 2 : Math.PI / 2;
      scene.add(dev);
    });

    // pad de interacción frente a la cama
    const pad = new THREE.Mesh(new THREE.CircleGeometry(1.1, 28),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }));
    pad.rotation.x = -Math.PI / 2; pad.position.set(cx, 0.05, cz - 1.6); scene.add(pad);
    interactables.push({ slug: caseObj.slug, position: new THREE.Vector3(cx, 1, cz - 1.6), pad });

    // ---------- mobiliario de la sala ----------
    const ivp = ivPole(); ivp.position.set(bedX + (left ? -0.3 : 0.3), 0, cz + 1.0); scene.add(ivp);
    const bio = screen(color); bio.position.set(cx + (left ? -3.0 : 3.0), 0, cz + 2.4); bio.rotation.y = left ? -0.3 : 0.3; scene.add(bio);
    const st = stool(); st.position.set(cx, 0, cz - 0.9); scene.add(st);
    const cab = cabinet(); cab.position.set(cx, 0, cz + 4.4); cab.rotation.y = Math.PI; scene.add(cab);
    if (room === 'urgencias' || room === 'reanimacion') {
      const cc = crashCart(); cc.position.set(cx + (left ? -2.8 : 2.8), 0, cz - 3.2); scene.add(cc);
    }
    if (room === 'quirofano') {
      const sl = surgicalLight(); sl.position.set(bedX, 0, cz); scene.add(sl);
      const tr = instrumentTray(); tr.position.set(cx + (left ? -2.4 : 2.4), 0, cz + 1.2); scene.add(tr);
    }
    if (room === 'consulta') { const ch = chair(color); ch.position.set(cx, 0, cz + 1.6); ch.rotation.y = Math.PI; scene.add(ch); }
    if (room === 'pediatria') { const tb = toyBox(); tb.position.set(cx, 0, cz + 3.2); scene.add(tb); }
  });

  // ---------- multitud ----------
  const crowd = new Crowd(scene);
  // bancas + pacientes sentados en el lobby
  [-5.5, 5.5].forEach((bx) => {
    const bench = brick(1.0, 0.45, 4, '#7c89b8'); bench.position.set(bx, 0.32, 0.5); scene.add(bench);
  });
  crowd.addSeated([
    { x: -5.4, z: 1.6, ry: Math.PI / 2 }, { x: -5.4, z: -0.4, ry: Math.PI / 2 },
    { x: 5.4, z: 1.6, ry: -Math.PI / 2 }, { x: 5.4, z: -0.4, ry: -Math.PI / 2 }
  ]);
  // personal deambulando por lobby + pasillo
  crowd.spawnStaff(7, { x0: -2.4, x1: 2.4, z0: -47, z1: 4 });
  // pacientes en cama respiran/parpadean
  idleFigs.forEach((f) => crowd.addIdle(f));

  // camillas con ruedas estacionadas en el pasillo
  [[-2.4, -8], [2.4, -22], [-2.4, -34]].forEach(([x, z]) => {
    const gu = gurney(); gu.position.set(x, 0, z); gu.rotation.y = Math.PI / 2; scene.add(gu);
  });
  // monitores de pared encendidos en el pasillo (sin tapar puertas)
  [-6, -32, -46].forEach((z) => {
    const wm = wallMonitor(); wm.position.set(-2.86, 2.4, z); wm.rotation.y = Math.PI / 2; scene.add(wm);
  });

  return {
    interactables, walls, doors,
    footprint: { x0: -15.4, x1: 15.4, z0: -49.4, z1: 6.4 },
    crowd, spawn: { x: 0, y: 1.65, z: 4 }
  };
}

// Letrero tipo cartel (sprite) limpio y proporcionado.
function label(text, x, y, z, w = 3, h = 0.7) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,255,255,0.96)'; round(g, 8, 8, 496, 112, 26); g.fill();
  g.fillStyle = '#13203f'; g.font = 'bold 56px -apple-system,Segoe UI,sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 66);
  const t = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true }));
  s.scale.set(w, h, 1); s.position.set(x, y, z);
  return s;
}
function round(x, a, b, w, h, r) {
  x.beginPath(); x.moveTo(a + r, b);
  x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath();
}
