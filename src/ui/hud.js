import { ROLES } from '../config.js';

// Barra superior + indicaciones de caminata + prompt de interacción.
export function mountHud(profile, { onEditor, onLogout, onPublishSeed, onEnterHospital }) {
  const ui = document.getElementById('ui');
  const role = profile?.role || 'principiante';
  const canManage = role === 'docente' || role === 'admin';

  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.innerHTML = `
    <div class="logo"><span class="cross"></span> Hospital Virtual UNAM</div>
    <span class="tag">MVP · IMSS · IA</span>
    <span class="rolepill ${role}">${ROLES[role]?.label || role}</span>
    <div class="spacer"></div>
    <button class="btn ghost" id="hud-editor">✚ Editor de casos</button>
    ${canManage ? '<button class="btn ghost" id="hud-seed">⇪ Publicar casos</button>' : ''}
    <button class="btn ghost" id="hud-logout">Salir</button>`;
  ui.appendChild(hud);

  hud.querySelector('#hud-editor').onclick = onEditor;
  hud.querySelector('#hud-logout').onclick = onLogout;
  if (canManage) hud.querySelector('#hud-seed').onclick = onPublishSeed;

  // crosshair + indicaciones
  const cross = document.createElement('div'); cross.className = 'crosshair'; ui.appendChild(cross);
  const hint = document.createElement('div'); hint.className = 'walkhint';
  hint.innerHTML = '<b>Click</b> para mirar · <b>WASD</b> para caminar · acércate a una sala y presiona <b>E</b>';
  ui.appendChild(hint);
  const tip = document.createElement('div'); tip.className = 'prompttip'; ui.appendChild(tip);

  // menú central (cuando no está bloqueado el puntero)
  const menu = document.createElement('div'); menu.className = 'center-menu';
  menu.innerHTML = `
    <div class="menu-card">
      <h1>Recorre el hospital 🏥</h1>
      <p>Haz click para entrar en primera persona. Camina por el pasillo y entra a las salas
         (Urgencias, Reanimación, Consulta, Quirófano, Pediatría y el <b>Aula de Aprendizaje</b>).
         Acércate a un paciente y presiona <b>E</b> para atender el caso, o al pizarrón del Aula para la encuesta.</p>
      <button class="btn primary" id="menu-enter">Entrar al hospital</button>
    </div>`;
  ui.appendChild(menu);
  menu.querySelector('#menu-enter').onclick = onEnterHospital;

  return {
    setLocked(locked) {
      cross.style.display = locked ? 'block' : 'none';
      hint.style.display = locked ? 'block' : 'none';
      menu.style.display = locked ? 'none' : 'flex';
      if (!locked) tip.style.display = 'none';
    },
    setPrompt(text) {
      tip.style.display = text ? 'block' : 'none';
      if (text) tip.innerHTML = text;
    },
    showMenu() { menu.style.display = 'flex'; }
  };
}
