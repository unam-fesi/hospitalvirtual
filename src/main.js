import './style.css';
import { getSession, getProfile, signOut, onAuthChange } from './auth/auth.js';
import { loadCases, publishSeedToDatabase } from './cases/registry.js';
import { World } from './scene/world.js';
import { showLogin } from './ui/login.js';
import { mountHud } from './ui/hud.js';
import { openCase } from './ui/casePanel.js';
import { openEditor } from './ui/editor.js';
import { openWizard } from './ui/wizard.js';
import { showLanding } from './ui/landing.js';
import { createTouchControls } from './ui/touch.js';
import { toast } from './ui/toast.js';

let world = null;

async function boot() {
  const session = await getSession();
  if (session) {
    const profile = await getProfile(true);
    startApp(profile);
  } else {
    showLogin((profile) => startApp(profile));
  }
}

async function startApp(profile) {
  const ui = document.getElementById('ui');
  ui.innerHTML = ''; // limpia login

  let hud, touchUI = null;
  const cases = await loadCases();

  world = new World(document.getElementById('scene'), {
    onEnterCase: (slug) => {
      const resume = () => { world.setPaused(false); hud.setLocked(false); hud.showMenu(); };
      if (slug === '__aula__') {
        world.setPaused(true);
        openWizard(profile, { onClose: resume });
        return;
      }
      const c = cases.find((x) => x.slug === slug);
      if (!c) return;
      world.setPaused(true);
      openCase(c, profile, { onClose: resume });
    },
    onProximity: (slug) => {
      const verb = world.isTouch ? 'Toca <b>E</b>' : 'Presiona <b>E</b>';
      hud.setPrompt(!slug ? '' : slug === '__aula__'
        ? `${verb} para abrir la encuesta del Aula`
        : `${verb} para atender al paciente`);
      if (touchUI) touchUI.setActionActive(!!slug);
    },
    onLockChange: (locked) => { hud.setLocked(locked); if (touchUI) touchUI.setVisible(locked); }
  });

  hud = mountHud(profile, {
    isTouch: world.isTouch,
    onEnterHospital: () => world.lock(),
    onEditor: () => openEditor(profile, { onClose: () => {}, onPublished: () => {} }),
    onLogout: async () => { await signOut(); location.reload(); },
    onPublishSeed: async () => {
      try { const n = await publishSeedToDatabase(); toast(`Publicados ${n} casos en la base ✅`, 'good'); }
      catch (e) { toast('Error: ' + (e.message || e), 'bad'); }
    }
  });

  if (world.isTouch) touchUI = createTouchControls(world);
  world.build(cases);
  hud.setLocked(false);
}

// si la sesión cambia (logout en otra pestaña, etc.)
onAuthChange((session) => { if (!session) {/* el reload de logout ya gestiona */} });

// primero la landing; al "Ingresar" arranca el flujo (login o app)
showLanding(boot);
