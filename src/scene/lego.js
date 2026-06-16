import * as THREE from 'three';

export const STUD = 0.34;
const matCache = new Map();
export function mat(color) {
  if (!matCache.has(color)) matCache.set(color, new THREE.MeshLambertMaterial({ color }));
  return matCache.get(color);
}

// Ladrillo LEGO con studs en la cara superior.
export function brick(w, h, d, color, { studs = true, studDensity = 1 } = {}) {
  const g = new THREE.Group();
  const m = mat(color);
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);
  if (studs) {
    const sx = Math.max(1, Math.round((w / 1.0) * studDensity));
    const sz = Math.max(1, Math.round((d / 1.0) * studDensity));
    const sg = new THREE.CylinderGeometry(STUD / 2, STUD / 2, 0.18, 10);
    const im = new THREE.InstancedMesh(sg, m, sx * sz);
    let i = 0; const mtx = new THREE.Matrix4();
    for (let a = 0; a < sx; a++) for (let b = 0; b < sz; b++) {
      const px = -w / 2 + (a + 0.5) * (w / sx);
      const pz = -d / 2 + (b + 0.5) * (d / sz);
      mtx.makeTranslation(px, h / 2 + 0.09, pz);
      im.setMatrixAt(i++, mtx);
    }
    im.castShadow = true;
    g.add(im);
  }
  return g;
}

// Placa base verde con studs (instanciados).
export function basePlate(size, color = '#3a7d44') {
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.BoxGeometry(size, 1, size), mat(color));
  plate.position.y = -0.5; plate.receiveShadow = true; g.add(plate);
  const n = Math.min(40, Math.round(size / 2));
  const sg = new THREE.CylinderGeometry(STUD / 2, STUD / 2, 0.16, 8);
  const im = new THREE.InstancedMesh(sg, mat(color), n * n);
  let i = 0; const mtx = new THREE.Matrix4();
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    mtx.makeTranslation(-size / 2 + (a + 0.5) * (size / n), 0.08, -size / 2 + (b + 0.5) * (size / n));
    im.setMatrixAt(i++, mtx);
  }
  im.receiveShadow = true; g.add(im);
  return g;
}

// Pared simple tipo ladrillo (sin studs por rendimiento).
export function wall(w, h, d, color = '#dfe6f2') {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
