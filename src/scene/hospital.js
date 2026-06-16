import * as THREE from 'three';
import { mat, brick, wall, emissivePanel, floorTexture } from './lego.js';
import { makeMinifig, layOnBed } from './minifig.js';
import { makeDevice } from './devices.js';
import { Crowd } from './crowd.js';
import { crashCart, ivPole, screen, stool, chair, cabinet, surgicalLight, instrumentTray, plant, toyBox, slidingDoor, gurney, wallMonitor, overBedTable, wasteBin, sink, sanitizer, sharpsBox, wallClock, poster, oxygenHeadwall, anesthesiaMachine } from './props.js';

const CH = 4;     // altura de techo
const WT = 0.25;  // grosor de muro

// Posición de cada caso en el edificio (lado del pasillo + centro en Z).
const ROOM_SLOTS = {
  urgencias:   { side: 'left',  cz: -12 },
  reanimacion: { side: 'right', cz: -18 },
  consulta:    { side: 'left',  cz: -28 },
  quirofano:   { side: 'right', cz: -36 },
  pediatria:   { side: 'left',  cz: -44 },
  aula:        { side: 'right', cz: -44, special: 'aula' }
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

  // ---------- piso (incluye explanada exterior) + techo (solo interior) ----------
  const fW = 31, fD = 66, fz = -16.5;
  const ftex = floorTexture(); ftex.repeat.set(fW / 2.2, fD / 2.2);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(fW, fD),
    new THREE.MeshStandardMaterial({ map: ftex, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, fz); floor.receiveShadow = true;
  scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(31, 56), mat('#f4f7fc'));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, CH, -21.5); scene.add(ceil);

  // ---------- FACHADA + explanada de entrada ----------
  addHWall(6, -11, 11, [{ c: 0, w: 6 }], '#cdd9ef');     // muro de fachada con entrada central
  // dintel sobre la entrada
  const elintel = brick(6.4, 1.0, WT, '#0a2e6e'); elintel.position.set(0, CH - 0.5, 6); scene.add(elintel);
  // parapeto + cruz roja + letrero (lado exterior)
  const parapet = brick(22, 1.4, 0.6, '#ffffff'); parapet.position.set(0, CH + 0.7, 6.1); scene.add(parapet);
  const crossMat = new THREE.MeshStandardMaterial({ color: '#e63946', emissive: '#e63946', emissiveIntensity: 0.4 });
  const cv = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.7, 0.2), crossMat); cv.position.set(-7.5, CH + 0.7, 6.45);
  const chz = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 0.2), crossMat); chz.position.set(-7.5, CH + 0.7, 6.45);
  scene.add(cv, chz);
  scene.add(label('🏥 HOSPITAL VIRTUAL UNAM', 1.2, CH + 0.7, 6.5, 9, 1.1));
  // explanada: jardineras, escalón y bancas
  const step = brick(8, 0.18, 1.2, '#b8c6e0'); step.position.set(0, 0.09, 6.9); scene.add(step);
  [[-9.5, 13], [9.5, 13], [-9.5, 8.5], [9.5, 8.5]].forEach(([x, z]) => { const p = plant(); p.position.set(x, 0, z); scene.add(p); });
  // muros perimetrales de la explanada (para no salirse)
  addVWall(-11, 6, 15, [], '#cdd9ef'); addVWall(11, 6, 15, [], '#cdd9ef'); addHWall(15, -11, 11, [], '#cdd9ef');

  // ---------- lobby ----------
  addVWall(-8, -4, 6); addVWall(8, -4, 6);           // lados lobby
  addHWall(-4, -8, 8, [{ c: 0, w: 6 }]);             // frente lobby (entrada al pasillo)
  const desk = brick(4, 1.1, 1.2, '#2b3a67'); desk.position.set(0, 0.55, 3.6); scene.add(desk);
  scene.add(label('Recepción', 0, 1.85, 3.6, 1.8, 0.45));
  [[-7, 4.6], [7, 4.6], [-7, -3], [7, -3]].forEach(([x, z]) => { const p = plant(); p.position.set(x, 0, z); scene.add(p); });
  [[-5.5, -2.6], [5.5, -2.6]].forEach(([x, z]) => { const c = chair(); c.position.set(x, 0, z); c.rotation.y = x < 0 ? 0.5 : -0.5; scene.add(c); });

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
    const special = slot.special;
    const caseObj = special ? null : (byRoom[room] || cases.find((c) => c.room === room));
    if (!special && !caseObj) return;
    const left = slot.side === 'left';
    const innerX = left ? -3 : 3;     // borde con el pasillo
    const outerX = left ? -15 : 15;   // pared exterior
    const cx = (innerX + outerX) / 2; // centro de la sala
    const cz = slot.cz;
    const color = special ? '#c9a227' : (caseObj.color || '#37c2ff');
    const title = special ? '📚 Aula de Aprendizaje' : `${caseObj.icon || ''} ${caseObj.section}`;

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
    const spr = label(title, innerX + (left ? 0.9 : -0.9), 3.5, cz, 3, 0.7);
    scene.add(spr);

    // puerta corredera automática (se abre al acercarse)
    const door = slidingDoor(innerX, cz);
    scene.add(door.group); doors.push(door);

    // ===== AULA DE APRENDIZAJE (pizarrón-wizard PUM-AI) =====
    if (special === 'aula') {
      const sgn = left ? 1 : -1;
      // pizarrón con texto de gis escrito en la superficie (pared del fondo z = cz-5)
      const bframe = brick(4.8, 2.1, 0.12, '#5a3d23'); bframe.position.set(cx, 2.05, cz - 4.94); scene.add(bframe);
      const bc = document.createElement('canvas'); bc.width = 1024; bc.height = 440;
      const bx = bc.getContext('2d');
      bx.fillStyle = '#16332a'; bx.fillRect(0, 0, 1024, 440);
      bx.strokeStyle = 'rgba(255,255,255,0.05)'; bx.lineWidth = 8;
      for (let s = 0; s < 7; s++) { bx.beginPath(); bx.moveTo(Math.random() * 1024, Math.random() * 440); bx.lineTo(Math.random() * 1024, Math.random() * 440); bx.stroke(); }
      bx.fillStyle = '#f3efe4'; bx.textAlign = 'center'; bx.font = 'bold 66px Georgia, serif';
      bx.fillText('Aula de Aprendizaje', 512, 86);
      bx.font = '36px Georgia, serif'; bx.fillStyle = '#dfe9c9';
      bx.fillText('Encuesta guiada por PUM-AI', 512, 142);
      bx.textAlign = 'left'; bx.font = '34px Georgia, serif'; bx.fillStyle = '#f3efe4';
      ['• ¿Cómo viste el Hospital Virtual?', '• ¿Qué contenido necesitas para tu formación?', '• PUM-AI te sugiere servicios del Ecosistema Digital']
        .forEach((l, k) => bx.fillText(l, 110, 216 + k * 52));
      bx.textAlign = 'center'; bx.font = 'italic 32px Georgia, serif'; bx.fillStyle = '#bfe3ff';
      bx.fillText('Acércate y presiona  E', 512, 410);
      const btex = new THREE.CanvasTexture(bc);
      const board = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.92),
        new THREE.MeshStandardMaterial({ map: btex, roughness: 0.95, emissive: '#0d1f18', emissiveIntensity: 0.2 }));
      board.position.set(cx, 2.05, cz - 4.87); scene.add(board);
      // canaleta para gises
      const tray = brick(4.5, 0.08, 0.18, '#6b4a2c'); tray.position.set(cx, 1.08, cz - 4.82); scene.add(tray);
      // escritorio del docente
      const tdesk = brick(2.0, 0.8, 0.8, '#2b3a67'); tdesk.position.set(cx, 0.4, cz - 3.4); scene.add(tdesk);
      // pupitres con sillas mirando al pizarrón
      for (let r = 0; r < 2; r++) for (let c = -1; c <= 1; c++) {
        const dx = cx + c * 2.0, dz = cz - 0.5 + r * 2.2;
        const d = brick(1.1, 0.06, 0.6, '#cfd8e8'); d.position.set(dx, 0.75, dz); scene.add(d);
        const legs = brick(1.0, 0.7, 0.5, '#aab6cc'); legs.position.set(dx, 0.37, dz); scene.add(legs);
        const ch = chair('#5566a8'); ch.position.set(dx, 0, dz + 0.7); ch.rotation.y = Math.PI; scene.add(ch);
      }
      // detalle: reloj y dispensador
      const clk = wallClock(); clk.position.set(cx + sgn * 1.6, 3.1, cz - 4.84); scene.add(clk);
      const san = sanitizer(); san.position.set(innerX - sgn * 0.1, 1.35, cz + 1.7); san.rotation.y = left ? Math.PI / 2 : -Math.PI / 2; scene.add(san);
      // pad de interacción frente al pizarrón
      const apad = new THREE.Mesh(new THREE.CircleGeometry(1.1, 28),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }));
      apad.rotation.x = -Math.PI / 2; apad.position.set(cx, 0.05, cz - 2.2); scene.add(apad);
      interactables.push({ slug: '__aula__', position: new THREE.Vector3(cx, 1, cz - 2.2), pad: apad });
      return;
    }

    // cama contra la pared exterior
    const bedX = cx + (left ? -1.6 : 1.6);
    const bed = brick(2.6, 0.55, 1.3, '#e6ecf7'); bed.position.set(bedX, 0.4, cz); scene.add(bed);
    const pillow = brick(0.7, 0.2, 1.1, '#ffffff'); pillow.position.set(bedX + (left ? 0.85 : -0.85), 0.72, cz); scene.add(pillow);

    // paciente con su dolencia
    const ail = caseObj.patient?.ailment;
    const patient = makeMinifig({ kind: 'patient', ailment: ail });
    if (ail === 'paro' || ail === 'quirurgico' || ail === 'sangrado') {
      // acostado boca arriba a lo largo de la cama (eje X), cabeza hacia la almohada
      patient.position.set(bedX, 0.95, cz);
      layOnBed(patient, !left ? false : true);
      patient.rotation.z = left ? Math.PI / 2 : -Math.PI / 2;
      // cobija sobre las piernas
      const blanket = brick(1.5, 0.14, 1.05, ail === 'quirurgico' ? '#7fc1e8' : '#9fb0d8');
      blanket.position.set(bedX + (left ? -0.45 : 0.45), 0.98, cz); scene.add(blanket);
    } else {
      patient.position.set(cx, 0, cz + 2.4); patient.rotation.y = left ? Math.PI / 2 : -Math.PI / 2;
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
    if (room === 'quirofano') { const am = anesthesiaMachine(); am.position.set(cx + (left ? -2.2 : 2.2), 0, cz + 3); am.rotation.y = left ? -Math.PI / 2 : Math.PI / 2; scene.add(am); }

    // ---------- detalle fijo de la sala ----------
    const sgn = left ? 1 : -1;            // hacia el interior en X
    const faceIn = left ? Math.PI / 2 : -Math.PI / 2; // mirar al interior desde pared exterior
    // cabecero con tomas de O2 detrás de la cama (pared exterior)
    const head = oxygenHeadwall(); head.position.set(outerX + sgn * 0.12, 0, cz); head.rotation.y = faceIn; scene.add(head);
    // lavabo en una esquina (pared del fondo z=cz-5)
    const sk = sink(); sk.position.set(cx - sgn * 3.0, 0, cz - 4.7); scene.add(sk);
    // dispensador de gel + punzocortantes junto a la puerta (pared del pasillo)
    const san = sanitizer(); san.position.set(innerX - sgn * 0.1, 1.35, cz + 1.7); san.rotation.y = faceIn; scene.add(san);
    const shp = sharpsBox(); shp.position.set(innerX - sgn * 0.16, 1.25, cz - 1.7); shp.rotation.y = faceIn; scene.add(shp);
    // póster y reloj en la pared del fondo (z=cz-5), mirando al interior (+z)
    const pos = poster(color); pos.position.set(cx + sgn * 2.4, 1.7, cz - 4.9); scene.add(pos);
    const clk = wallClock(); clk.position.set(cx - sgn * 2.4, 2.7, cz - 4.88); scene.add(clk);
    // bote de basura y mesa puente junto a la cama
    const wb = wasteBin(color); wb.position.set(cx - sgn * 2.0, 0, cz + 1.4); scene.add(wb);
    const obt = overBedTable(); obt.position.set(bedX - sgn * 0.1, 0, cz + 1.0); obt.rotation.y = faceIn; scene.add(obt);
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
    footprint: { x0: -15.4, x1: 15.4, z0: -49.4, z1: 15.4 },
    crowd, spawn: { x: 0, y: 1.65, z: 12 }
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
