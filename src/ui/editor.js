import { supabase } from '../lib/supabase.js';
import { suggestCase } from '../lib/api.js';
import { publishSeedToDatabase } from '../cases/registry.js';
import { toast } from './toast.js';

const ROOMS = [
  ['urgencias', 'Urgencias'], ['reanimacion', 'Reanimación'], ['consulta', 'Consulta Externa'],
  ['quirofano', 'Quirófano'], ['pediatria', 'Pediatría']
];

// Editor: arma casos manualmente o con sugerencia de IA basada en GPC del IMSS.
export function openEditor(profile, { onClose, onPublished } = {}) {
  const ui = document.getElementById('ui');
  const drawer = document.createElement('div');
  drawer.className = 'drawer editor';
  drawer.innerHTML = `
    <header>
      <span class="dot" style="background:#8c7ae6"></span>
      <div><h2>Editor de casos clínicos</h2><p>Crea casos o pide a la IA un borrador desde la GPC del IMSS</p></div>
      <button class="x" id="ed-close">×</button>
    </header>
    <div class="body">
      <button class="btn primary" id="ed-seed" style="width:100%">⇪ Publicar los 5 casos semilla (IMSS) en la base</button>
      <p class="muted" style="margin:8px 0 16px">Útil la primera vez para poblar la base de datos.</p>
      <hr style="border-color:var(--line)">
      <h3 style="margin:14px 0 4px">Nuevo caso</h3>
      <div class="row">
        <div><label>Tema clínico</label><input id="ed-topic" placeholder="Ej. Crisis asmática en adulto"></div>
        <div><label>GPC de referencia</label><input id="ed-gpc" placeholder="GPC IMSS-…"></div>
      </div>
      <div class="row">
        <div><label>Sala</label><select id="ed-room">${ROOMS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></div>
        <div><label>Sección (etiqueta)</label><input id="ed-section" placeholder="Urgencias"></div>
      </div>
      <div class="controls" style="margin-top:12px">
        <button class="btn mic" id="ed-suggest">✨ Sugerir con IA (GPC)</button>
      </div>
      <div id="ed-preview" class="steplist"></div>
      <div class="controls" style="margin-top:12px">
        <button class="btn primary" id="ed-publish" disabled>Guardar y publicar caso</button>
      </div>
    </div>`;
  ui.appendChild(drawer);
  drawer.querySelector('#ed-close').onclick = () => { drawer.remove(); onClose && onClose(); };

  drawer.querySelector('#ed-seed').onclick = async (e) => {
    e.target.disabled = true; e.target.textContent = 'Publicando…';
    try { const n = await publishSeedToDatabase(); toast(`Publicados ${n} casos en la base ✅`, 'good'); onPublished && onPublished(); }
    catch (err) { toast('Error: ' + (err.message || err), 'bad'); }
    finally { e.target.disabled = false; e.target.textContent = '⇪ Publicar los 5 casos semilla (IMSS) en la base'; }
  };

  let draft = null;
  drawer.querySelector('#ed-suggest').onclick = async (e) => {
    const topic = drawer.querySelector('#ed-topic').value.trim();
    if (!topic) return toast('Escribe un tema clínico', 'bad');
    e.target.classList.add('live'); e.target.textContent = '✨ Generando…';
    try {
      draft = await suggestCase({
        topic, section: drawer.querySelector('#ed-section').value.trim() || topic,
        room: drawer.querySelector('#ed-room').value, guideline: drawer.querySelector('#ed-gpc').value.trim()
      });
      renderPreview(draft);
      drawer.querySelector('#ed-publish').disabled = false;
      if (draft._mock) toast('Borrador de plantilla (configura GEMINI_API_KEY para casos completos)', '');
      else toast('Borrador generado por IA ✨', 'good');
    } catch (err) { toast('No se pudo generar: ' + (err.message || err), 'bad'); }
    finally { e.target.classList.remove('live'); e.target.textContent = '✨ Sugerir con IA (GPC)'; }
  };

  function renderPreview(c) {
    const prev = drawer.querySelector('#ed-preview');
    prev.innerHTML = `<div class="stepcard"><b>${c.icon || '🏥'} ${c.title || ''}</b><br>
      <span class="muted">${c.subtitle || ''} · ${c.guideline || ''}</span></div>` +
      (c.steps || []).map((s, i) => `<div class="stepcard"><b>Paso ${i + 1}:</b> ${s.competency}<br>
        <span class="muted">${s.prompt || ''}</span></div>`).join('');
  }

  drawer.querySelector('#ed-publish').onclick = async (e) => {
    if (!draft) return;
    e.target.disabled = true; e.target.textContent = 'Guardando…';
    try { await publishDraft(draft); toast('Caso publicado ✅ (recarga para verlo en 3D)', 'good'); onPublished && onPublished(); }
    catch (err) { toast('Error al publicar: ' + (err.message || err), 'bad'); e.target.disabled = false; e.target.textContent = 'Guardar y publicar caso'; }
  };
}

// Inserta un borrador (forma de suggest-case) en la base.
async function publishDraft(c) {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) throw new Error('Inicia sesión');
  const slug = (c.slug || c.title || 'caso').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  const { data: caseRow, error } = await supabase.from('cases').insert({
    slug, section: c.section, room: c.room, title: c.title, subtitle: c.subtitle,
    color: c.color || '#37c2ff', icon: c.icon || '🏥', guideline: c.guideline,
    patient: c.patient || {}, is_published: true, created_by: u.user.id
  }).select().single();
  if (error) throw error;
  for (const d of c.devices || []) {
    await supabase.from('case_devices').insert({ case_id: caseRow.id, kind: d.kind, label: d.label, data: d.data || {} });
  }
  for (let i = 0; i < (c.steps || []).length; i++) {
    const s = c.steps[i];
    const { data: stepRow, error: se } = await supabase.from('case_steps').insert({
      case_id: caseRow.id, step_order: i, competency: s.competency, patient_say: s.patient_say,
      prompt: s.prompt, ideal_answer: s.ideal_answer, key_points: s.key_points || [], device_ref: s.device_ref
    }).select().single();
    if (se) throw se;
    const opts = (s.options || []).map((o) => ({
      step_id: stepRow.id, difficulty: o.difficulty || 'principiante', label: o.label,
      is_correct: !!o.is_correct, points: o.points || 0, keywords: o.keywords || [], feedback: o.feedback
    }));
    if (opts.length) await supabase.from('step_options').insert(opts);
  }
}
