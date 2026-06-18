// Controles táctiles estilo Roblox: joystick (mover), arrastrar (mirar) y botón de acción.
export function createTouchControls(world) {
  const ui = document.getElementById('ui');
  const wrap = document.createElement('div');
  wrap.className = 'touch-ui';
  wrap.style.display = 'none';
  wrap.innerHTML = `
    <div class="look-area" id="t-look"></div>
    <div class="joy-base" id="t-joy"><div class="joy-knob" id="t-knob"></div></div>
    <button class="touch-action" id="t-act">E</button>`;
  ui.appendChild(wrap);

  // ----- MIRAR: arrastrar en cualquier parte libre -----
  const lookEl = wrap.querySelector('#t-look');
  let lookId = null, lx = 0, ly = 0;
  lookEl.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    if (lookId === null) { lookId = t.identifier; lx = t.clientX; ly = t.clientY; }
  }, { passive: true });
  lookEl.addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) if (t.identifier === lookId) {
      world.lookDelta(t.clientX - lx, t.clientY - ly); lx = t.clientX; ly = t.clientY;
    }
  }, { passive: true });
  const endLook = (e) => { for (const t of e.changedTouches) if (t.identifier === lookId) lookId = null; };
  lookEl.addEventListener('touchend', endLook);
  lookEl.addEventListener('touchcancel', endLook);

  // ----- JOYSTICK -----
  const joy = wrap.querySelector('#t-joy'), knob = wrap.querySelector('#t-knob');
  let joyId = null, cx = 0, cy = 0; const R = 54;
  function moveKnob(px, py) {
    let dx = px - cx, dy = py - cy; const d = Math.hypot(dx, dy);
    if (d > R) { dx = dx / d * R; dy = dy / d * R; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    world.setJoystick(dx / R, dy / R);
  }
  joy.addEventListener('touchstart', (e) => {
    e.preventDefault(); const t = e.changedTouches[0]; joyId = t.identifier;
    const r = joy.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    moveKnob(t.clientX, t.clientY);
  }, { passive: false });
  joy.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) if (t.identifier === joyId) moveKnob(t.clientX, t.clientY);
  }, { passive: false });
  const endJoy = (e) => {
    for (const t of e.changedTouches) if (t.identifier === joyId) {
      joyId = null; knob.style.transform = 'translate(-50%,-50%)'; world.setJoystick(0, 0);
    }
  };
  joy.addEventListener('touchend', endJoy);
  joy.addEventListener('touchcancel', endJoy);

  // ----- BOTÓN DE ACCIÓN -----
  const act = wrap.querySelector('#t-act');
  act.addEventListener('touchstart', (e) => { e.preventDefault(); act.classList.add('press'); world.interact(); }, { passive: false });
  act.addEventListener('touchend', () => act.classList.remove('press'));

  return {
    setVisible(v) { wrap.style.display = v ? 'block' : 'none'; },
    setActionActive(on) { act.classList.toggle('ready', !!on); }
  };
}
