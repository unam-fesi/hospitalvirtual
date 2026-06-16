import { supabase } from '../lib/supabase.js';
import { signIn, signUp, getProfile } from '../auth/auth.js';
import { ROLES } from '../config.js';
import { toast } from './toast.js';

// Pantalla de acceso: selector de rol + entrada demo (anónima) + login/registro por correo.
export function showLogin(onSuccess) {
  const ui = document.getElementById('ui');
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  let role = 'principiante';

  scrim.innerHTML = `
    <div class="card">
      <h1>🏥 Hospital Virtual UNAM</h1>
      <p class="sub">Simulación clínica 3D · elige tu nivel para empezar</p>

      <label>Tu rol / nivel</label>
      <div id="roles" class="tabs" style="flex-wrap:wrap"></div>

      <button id="enter" class="btn primary" style="width:100%;margin-top:6px">Entrar al hospital (demo)</button>

      <details style="margin-top:14px">
        <summary class="muted" style="cursor:pointer">Acceder con correo institucional</summary>
        <div style="margin-top:10px">
          <div class="tabs">
            <button class="btn active" id="tab-in">Ingresar</button>
            <button class="btn" id="tab-up">Registrarme</button>
          </div>
          <div id="signup-name" style="display:none">
            <label>Nombre completo</label><input id="fullname" placeholder="Nombre Apellido" />
          </div>
          <label>Correo</label><input id="email" type="email" placeholder="alumno@unam.mx" />
          <label>Contraseña</label><input id="password" type="password" placeholder="••••••••" />
          <button id="submit" class="btn" style="width:100%;margin-top:12px">Ingresar</button>
        </div>
      </details>
    </div>`;

  ui.appendChild(scrim);

  // botones de rol
  const rolesEl = scrim.querySelector('#roles');
  Object.entries(ROLES).forEach(([key, val]) => {
    if (key === 'admin') return;
    const b = document.createElement('button');
    b.className = 'btn' + (key === role ? ' active' : '');
    b.textContent = val.label;
    b.style.flex = '1 1 45%';
    b.onclick = () => { role = key; rolesEl.querySelectorAll('.btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); };
    rolesEl.appendChild(b);
  });

  let mode = 'in';
  const tabIn = scrim.querySelector('#tab-in'), tabUp = scrim.querySelector('#tab-up');
  const submit = scrim.querySelector('#submit'), nameWrap = scrim.querySelector('#signup-name');
  tabIn.onclick = () => { mode = 'in'; tabIn.classList.add('active'); tabUp.classList.remove('active'); nameWrap.style.display = 'none'; submit.textContent = 'Ingresar'; };
  tabUp.onclick = () => { mode = 'up'; tabUp.classList.add('active'); tabIn.classList.remove('active'); nameWrap.style.display = 'block'; submit.textContent = 'Crear cuenta'; };

  async function finish() {
    const profile = await getProfile(true);
    scrim.remove();
    onSuccess(profile);
  }

  // Entrada demo (anónima)
  scrim.querySelector('#enter').onclick = async (e) => {
    const btn = e.currentTarget; btn.disabled = true; btn.textContent = 'Entrando…';
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      // fija el rol elegido en el perfil
      if (data?.user) await supabase.from('profiles').update({ role, full_name: 'Invitado' }).eq('id', data.user.id);
      await finish();
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Entrar al hospital (demo)';
      toast('Modo demo no disponible: ' + (err.message || err) + '. Usa correo.', 'bad');
    }
  };

  // Login / registro por correo
  submit.onclick = async () => {
    const email = scrim.querySelector('#email').value.trim();
    const password = scrim.querySelector('#password').value;
    if (!email || !password) return toast('Escribe correo y contraseña', 'bad');
    submit.disabled = true;
    try {
      if (mode === 'up') {
        const fullName = scrim.querySelector('#fullname').value.trim();
        await signUp({ email, password, fullName, role });
        // intenta iniciar sesión (si la confirmación por correo está desactivada)
        try { await signIn({ email, password }); await finish(); }
        catch { toast('Cuenta creada. Revisa tu correo para confirmar y luego ingresa.', 'good'); submit.disabled = false; }
      } else {
        await signIn({ email, password });
        await finish();
      }
    } catch (err) {
      submit.disabled = false;
      toast(err.message || 'Error de autenticación', 'bad');
    }
  };
}
