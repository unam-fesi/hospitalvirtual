export function toast(msg, kind = '') {
  const wrap = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = 't ' + kind;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .4s'; }, 3200);
  setTimeout(() => el.remove(), 3700);
}
