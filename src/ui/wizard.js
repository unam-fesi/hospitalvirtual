import { supabase } from '../lib/supabase.js';
import { speak, stopSpeak } from '../lib/voice.js';

const ECO_URL = 'https://unam-fesi.github.io/ecosistema-digital/#proyectos';

// 10 preguntas del pizarrón. Cada opción puede aportar "tags" para la sugerencia final.
const QUESTIONS = [
  { q: '¿Cómo calificarías tu experiencia general en el Hospital Virtual?',
    opts: [['Excelente'], ['Buena'], ['Regular'], ['Mala']] },
  { q: '¿Qué tan claro te resultó el recorrido 3D en primera persona?',
    opts: [['Muy claro'], ['Claro'], ['Algo confuso'], ['Difícil de usar']] },
  { q: '¿La retroalimentación de PUM-AI te ayudó a aprender?',
    opts: [['Mucho', ['ia']], ['Algo', ['ia']], ['Poco'], ['No la usé']] },
  { q: '¿Qué área te gustaría que tuviera más casos clínicos?',
    opts: [['Urgencias', ['area']], ['Pediatría', ['area']], ['Quirófano', ['area']], ['Salud mental', ['emocional']]] },
  { q: '¿Qué tipo de contenido adicional necesitas para tu formación?',
    opts: [['Realidad Virtual inmersiva', ['rv']], ['Realidad Aumentada', ['ra']], ['Videos / teleconsulta', ['videos']], ['Lecturas GPC y quizzes', ['lecturas']], ['Anatomía 3D', ['anatomia']]] },
  { q: '¿Cómo prefieres practicar?',
    opts: [['Individual'], ['En equipo interprofesional', ['equipo']], ['Ambas', ['equipo']]] },
  { q: '¿Qué tan cómodo te sentiste respondiendo por voz?',
    opts: [['Muy cómodo', ['voz']], ['Neutral', ['voz']], ['Incómodo'], ['No la usé']] },
  { q: '¿Qué nivel de dificultad prefieres por defecto?',
    opts: [['Principiante'], ['Avanzado'], ['Adaptativa según mi desempeño', ['ia', 'datos']]] },
  { q: '¿Qué te ayudaría más a reforzar tu aprendizaje?',
    opts: [['Simulación de alta fidelidad', ['simulacion']], ['Repetir casos'], ['Estadísticas de mi desempeño', ['datos']], ['Acompañamiento emocional', ['emocional']]] },
  { q: '¿Recomendarías el Hospital Virtual a tus compañeros?',
    opts: [['Sí, definitivamente'], ['Probablemente'], ['Tal vez'], ['No']] }
];

// Catálogo de servicios y proyectos del Ecosistema Digital.
const CATALOG = [
  { ic: '🧠', name: 'Inteligencia Artificial — PUM-AI', kind: 'Servicio', tags: ['ia', 'datos'], desc: 'IA clínica local: resúmenes, evaluación adaptativa y narrativa clínica automática.' },
  { ic: '🥽', name: 'Realidad Virtual', kind: 'Servicio', tags: ['rv', 'simulacion'], desc: 'Catálogo VR por carrera: 3D Organon, UbiSim, EyeSim, Nanome y más.' },
  { ic: '📲', name: 'Realidad Aumentada', kind: 'Servicio', tags: ['ra', 'anatomia'], desc: 'Guías anatómicas superpuestas sobre maniquíes (p. ej. EnfermeríAR).' },
  { ic: '🎥', name: 'Telemedicina', kind: 'Servicio', tags: ['videos'], desc: 'Teleconsulta integrada con grabación cifrada y retención NOM-024.' },
  { ic: '🏥', name: 'Simulación / Aula Inmersiva Interprofesional', kind: 'Servicio', tags: ['simulacion', 'equipo', 'area'], desc: 'Escenarios de alta fidelidad y trabajo en equipo con paciente estandarizado y VR.' },
  { ic: '🗃️', name: 'Uso de Bases de Datos', kind: 'Servicio', tags: ['datos'], desc: 'Análisis de datos y estadísticas de desempeño para tu formación.' },
  { ic: '🌿', name: 'Centro Inteligente de Sustentabilidad', kind: 'Servicio', tags: ['sustentabilidad'], desc: 'Iniciativas de sustentabilidad y cero papel.' },
  { ic: '🧪', name: 'Laboratorio de Proyectos', kind: 'Servicio', tags: ['proyectos'], desc: 'Espacio para crear material multitecnológico (IA, RV, RA).' },
  { ic: '📋', name: 'MIRC Expediente 360', kind: 'Proyecto', tags: ['ia', 'anatomia', 'videos', 'datos'], desc: 'Expediente clínico electrónico con IA, anatomía 3D y teleconsulta.' },
  { ic: '💙', name: 'Aura', kind: 'Proyecto', tags: ['emocional'], desc: 'Bienestar emocional: acompañamiento anónimo y recursos de autocuidado.' },
  { ic: '📚', name: 'Cursos y Talleres', kind: 'Servicio', tags: ['lecturas'], desc: 'Formación continua con insignias, puntos y premios.' }
];

export function openWizard(profile, { onClose } = {}) {
  const role = profile?.role || 'principiante';
  const ui = document.getElementById('ui');
  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.innerHTML = `
    <header>
      <span class="dot" style="background:#c9a227"></span>
      <div><h2>Aula de Aprendizaje</h2><p>Encuesta guiada por PUM-AI</p></div>
      <button class="x" id="wz-close">×</button>
    </header>
    <div class="body" id="wz-body"></div>`;
  ui.appendChild(drawer);

  const body = drawer.querySelector('#wz-body');
  const answers = [];
  let i = 0;

  function close() { stopSpeak(); drawer.remove(); onClose && onClose(); }
  drawer.querySelector('#wz-close').onclick = close;

  function renderQ() {
    const item = QUESTIONS[i];
    const pct = Math.round((i / QUESTIONS.length) * 100);
    body.innerHTML = `
      <div class="guideline">🤖 <b>PUM-AI</b> quiere conocer tu opinión para mejorar tu formación.</div>
      <div class="progress"><span>Pregunta ${i + 1}/${QUESTIONS.length}</span>
        <div class="bar"><i style="width:${pct}%"></i></div></div>
      <div class="stepbox">
        <div class="patient"><div class="av">🧑‍🏫</div><div class="say">${item.q}</div></div>
        <div id="wz-opts">${item.opts.map((o, k) => `<button class="opt" data-k="${k}">${o[0]}</button>`).join('')}</div>
      </div>`;
    speak(item.q);
    body.querySelectorAll('.opt').forEach((b) => {
      b.onclick = () => {
        const o = item.opts[+b.dataset.k];
        answers.push({ q: item.q, a: o[0], tags: o[1] || [] });
        i++;
        if (i < QUESTIONS.length) renderQ(); else finish();
      };
    });
  }

  function finish() {
    stopSpeak();
    // recolecta tags y puntúa el catálogo
    const tagset = new Set(); answers.forEach((a) => a.tags.forEach((t) => tagset.add(t)));
    tagset.add('ia'); // PUM-AI siempre relevante
    let ranked = CATALOG.map((s) => ({ s, score: s.tags.filter((t) => tagset.has(t)).length }))
      .sort((a, b) => b.score - a.score);
    let picks = ranked.filter((r) => r.score > 0).map((r) => r.s);
    // garantiza variedad (al menos 4) sumando los mejores restantes
    for (const r of ranked) { if (picks.length >= 5) break; if (!picks.includes(r.s)) picks.push(r.s); }
    picks = picks.slice(0, 5);

    saveFeedback(role, answers);

    const cards = picks.map((s) => `
      <a class="ecocard" href="${ECO_URL}" target="_blank" rel="noopener">
        <div class="eic">${s.ic}</div>
        <div><div class="enm">${s.name} <span class="ekind">${s.kind}</span></div>
        <div class="eds">${s.desc}</div></div>
        <div class="earrow">↗</div>
      </a>`).join('');

    body.innerHTML = `
      <div class="report">
        <div class="ai"><b>Gracias por tus respuestas 🙌</b><br><br>
          Según lo que compartiste, <b>PUM-AI</b> te recomienda estos servicios y proyectos del
          <b>Ecosistema Digital</b> para complementar tu formación:</div>
        <div class="ecolist">${cards}</div>
        <a class="btn" style="display:block;text-align:center;margin-top:8px" href="https://unam-fesi.github.io/ecosistema-digital/" target="_blank" rel="noopener">Ver todo el Ecosistema Digital ↗</a>
        <div class="controls" style="margin-top:14px">
          <button class="btn primary" id="wz-again">↻ Responder de nuevo</button>
          <button class="btn" id="wz-back">Volver al hospital</button>
        </div>
      </div>`;
    speak('Gracias por tus respuestas. PUM-AI te sugiere algunos servicios del ecosistema digital.');
    body.querySelector('#wz-again').onclick = () => { answers.length = 0; i = 0; renderQ(); };
    body.querySelector('#wz-back').onclick = close;
  }

  async function saveFeedback(role, answers) {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) await supabase.from('aula_feedback').insert({ user_id: u.user.id, role, answers });
    } catch (e) { /* best-effort */ }
  }

  renderQ();
}
