import { ROLES } from '../config.js';

export const STEP_MAX = 20; // cada paso vale 20 puntos (unifica opción múltiple y respuesta abierta)

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function difficultyFor(role) { return ROLES[role]?.difficulty || 'principiante'; }
export function uiModeFor(role) { return ROLES[role]?.ui || 'opciones'; }

// Opciones del paso según dificultad, ya barajadas (posición aleatoria).
export function optionsFor(step, role) {
  const diff = difficultyFor(role);
  const list = step.options?.[diff]?.length ? step.options[diff] : step.options?.principiante || [];
  return shuffle(list);
}

export function maxScore(caseObj) { return (caseObj.steps?.length || 0) * STEP_MAX; }

// Convierte el score 0-100 de la IA (respuesta abierta) a puntos del paso.
export function openScoreToPoints(aiScore) {
  return Math.round((Math.max(0, Math.min(100, aiScore || 0)) / 100) * STEP_MAX);
}

// Califica y arma el reporte por competencia.
export function buildReport(caseObj, perComp, score) {
  const max = maxScore(caseObj);
  const pct = max ? Math.round((score / max) * 100) : 0;
  const comps = caseObj.competencies.map((k) => {
    const got = perComp[k]?.got || 0;
    const mx = perComp[k]?.max || STEP_MAX;
    return { name: k, pct: Math.round((got / mx) * 100) };
  });
  const strong = comps.filter((c) => c.pct >= 85).map((c) => c.name);
  const weak = comps.filter((c) => c.pct < 60).map((c) => c.name);
  let grade, color;
  if (pct >= 85) { grade = 'Excelente desempeño clínico'; color = 'var(--good)'; }
  else if (pct >= 65) { grade = 'Competente, con áreas de mejora'; color = 'var(--warn)'; }
  else { grade = 'Requiere reforzar — repite el caso'; color = 'var(--bad)'; }
  return { pct, score, max, comps, strong, weak, grade, color };
}
