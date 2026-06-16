import * as THREE from 'three';
import { mat } from './lego.js';

// Dibuja los valores del aparato en un canvas y lo usa como textura de "pantalla".
function screenTexture(lines, { bg = '#031018', fg = '#37ffd0', accent = '#ffd166' } = {}) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 160;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
  x.strokeStyle = '#0a3b46'; x.lineWidth = 4; x.strokeRect(4, 4, c.width - 8, c.height - 8);
  x.font = 'bold 22px monospace'; x.textBaseline = 'top';
  let y = 16;
  lines.forEach((ln, i) => {
    x.fillStyle = i === 0 ? accent : fg;
    x.fillText(ln, 16, y);
    y += 26;
  });
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

function consoleBody(color = '#1b2647') {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 0.7), mat('#2a3a66'));
  base.position.y = 0.1; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), mat('#9fb0d8'));
  pole.position.y = 0.7; g.add(pole);
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.25), mat(color));
  box.position.y = 1.4; box.castShadow = true; g.add(box);
  return g;
}

// Crea un aparato LEGO según su tipo, mostrando los datos del caso.
export function makeDevice(kind, label, data = {}) {
  const g = consoleBody();
  let lines = [label];
  let opts = {};
  if (kind === 'monitor') {
    if (data.ritmo) lines.push(data.ritmo);
    if (data.FC !== undefined) lines.push(`FC ${data.FC}`);
    if (data.TA) lines.push(`TA ${data.TA}`);
    if (data.SpO2 !== undefined) lines.push(`SpO2 ${data.SpO2}`);
    if (data.FR !== undefined) lines.push(`FR ${data.FR}`);
  } else if (kind === 'ecg') {
    lines = ['ECG 12 deriv.', ...(String(data.hallazgo || '').match(/.{1,16}/g) || [])];
    opts = { fg: '#7CFC00' };
  } else if (kind === 'eco' || kind === 'rayosx') {
    lines = [label, ...(String(data.hallazgo || '').match(/.{1,16}/g) || [])];
    opts = { bg: '#05080f', fg: '#bcd' };
  } else { // lab / ficha / consentimiento
    lines = [label, ...Object.entries(data).map(([k, v]) => `${k}: ${v}`).slice(0, 4)];
    opts = { fg: '#9be7ff' };
  }
  const tex = screenTexture(lines, opts);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.66),
    new THREE.MeshBasicMaterial({ map: tex }));
  screen.position.set(0, 1.4, 0.131);
  g.add(screen);
  g.userData = { kind, label, data };
  return g;
}
