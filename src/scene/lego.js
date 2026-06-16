import * as THREE from 'three';

const matCache = new Map();
// Materiales PBR suaves (mejor con iluminación de ambiente / IBL).
export function mat(color, { rough = 0.85, metal = 0.0 } = {}) {
  const key = color + rough + metal;
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }));
  return matCache.get(key);
}

// Caja lisa (sin studs) para mobiliario y estructura.
export function brick(w, h, d, color, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
export function wall(w, h, d, color = '#eef2fa') { return brick(w, h, d, color); }

// Panel emisivo para luminarias de techo / pantallas.
export function emissivePanel(w, d, color = '#ffffff', intensity = 1.1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 1 }));
  m.rotation.x = Math.PI / 2;
  return m;
}

// Textura de piso tipo loseta de hospital.
export function floorTexture(color1 = '#dfe6f1', color2 = '#cfd8e8') {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = color1; x.fillRect(0, 0, 128, 128);
  x.fillStyle = color2; x.fillRect(0, 0, 64, 64); x.fillRect(64, 64, 64, 64);
  x.strokeStyle = 'rgba(120,140,170,0.35)'; x.lineWidth = 3; x.strokeRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// (conservado por compatibilidad; el hospital nuevo usa losas planas)
export function basePlate(size, color = '#3a7d44') {
  const m = new THREE.Mesh(new THREE.BoxGeometry(size, 1, size), mat(color));
  m.position.y = -0.5; m.receiveShadow = true;
  return m;
}
