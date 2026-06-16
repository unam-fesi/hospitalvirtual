import './style.css';
import { getSession, getProfile, signOut, onAuthChange } from './auth/auth.js';
import { loadCases, publishSeedToDatabase } from './cases/registry.js';
import { World } from './scene/world.js';
import { showLogin } from './ui/login.js';
import { mountHud } from './ui/hud.js';
import { openCase } from './ui/casePanel.js';
import { openEditor } from './ui/editor.js';
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

  let hud;
  const cases = await loadCases();

  world = new World(document.getElementById('scene'), {
    onEnterCase: (slug) => {
      const c = cases.find((x) => x.slug === slug);
      if (!c) return;
      world.setPaused(true);
      openCase(c, profile, {
        onClose: () => { world.setPaused(false); hud.setLocked(false); hud.showMenu(); }
      });
    },
    onProximity: (slug) => hud.setPrompt(slug ? 'Presiona <b>E</b> para atender al paciente' : ''),
    onLockChange: (locked) => hud.setLocked(locked)
  });

  hud = mountHud(profile, {
    onEnterHospital: () => world.lock(),
    onEditor: () => openEditor(profile, { onClose: () => {}, onPublished: () => {} }),
    onLogout: async () => { await signOut(); location.reload(); },
    onPublishSeed: async () => {
      try { const n = await publishSeedToDatabase(); toast(`Publicados ${n} casos en la base ✅`, 'good'); }
      catch (e) { toast('Error: ' + (e.message || e), 'bad'); }
    }
  });

  world.build(cases);
  hud.setLocked(false);
}

// si la sesión cambia (logout en otra pestaña, etc.)
onAuthChange((session) => { if (!session) {/* el reload de logout ya gestiona */} });

boot();
