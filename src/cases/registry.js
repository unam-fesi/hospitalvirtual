import { supabase } from '../lib/supabase.js';
import { SEED_CASES } from './seed.js';

// Normaliza un caso semilla (opciones ya agrupadas por dificultad) agregando ids sintéticos.
function normalizeSeed(c) {
  const steps = c.steps.map((s, i) => ({
    id: `${c.slug}-s${i}`,
    competency: s.competency,
    patient_say: s.patient_say,
    prompt: s.prompt,
    ideal_answer: s.ideal_answer,
    key_points: s.key_points || [],
    device_ref: s.device_ref || null,
    options: {
      principiante: (s.options.principiante || []).map((o, j) => ({ id: `${c.slug}-s${i}-p${j}`, ...o })),
      avanzado: (s.options.avanzado || []).map((o, j) => ({ id: `${c.slug}-s${i}-a${j}`, ...o }))
    }
  }));
  return { ...c, id: c.slug, steps };
}

// Mapea las filas de la base de datos a la forma normalizada que usa el motor.
function normalizeDb(c) {
  const steps = (c.case_steps || [])
    .sort((a, b) => a.step_order - b.step_order)
    .map((s) => {
      const byDiff = { principiante: [], avanzado: [] };
      (s.step_options || []).forEach((o) => {
        (byDiff[o.difficulty] || byDiff.principiante).push({
          id: o.id, label: o.label, is_correct: o.is_correct, points: o.points,
          keywords: o.keywords || [], feedback: o.feedback
        });
      });
      return {
        id: s.id, competency: s.competency, patient_say: s.patient_say, prompt: s.prompt,
        ideal_answer: s.ideal_answer, key_points: s.key_points || [], device_ref: s.device_ref,
        options: byDiff
      };
    });
  return {
    id: c.id, slug: c.slug, section: c.section, room: c.room, title: c.title, subtitle: c.subtitle,
    color: c.color, icon: c.icon, guideline: c.guideline, patient: c.patient || {},
    devices: (c.case_devices || []).map((d) => ({ kind: d.kind, label: d.label, data: d.data })),
    competencies: [...new Set(steps.map((s) => s.competency))],
    steps
  };
}

// Carga casos: primero intenta la base (publicados); si está vacía, usa la semilla local.
export async function loadCases() {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*, case_steps(*, step_options(*)), case_devices(*)')
      .eq('is_published', true);
    if (error) throw error;
    if (data && data.length) return data.map(normalizeDb);
  } catch (e) {
    console.warn('loadCases: usando semilla local —', e.message);
  }
  return SEED_CASES.map(normalizeSeed);
}

// Publica los casos semilla en la base (idempotente por slug). Requiere rol docente/admin por RLS.
export async function publishSeedToDatabase() {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) throw new Error('Inicia sesión para publicar casos.');
  let count = 0;
  for (const c of SEED_CASES) {
    const { data: caseRow, error: ce } = await supabase.from('cases').upsert({
      slug: c.slug, section: c.section, room: c.room, title: c.title, subtitle: c.subtitle,
      color: c.color, icon: c.icon, guideline: c.guideline, patient: c.patient,
      is_published: true, created_by: u.user.id
    }, { onConflict: 'slug' }).select().single();
    if (ce) { console.warn('upsert case', ce.message); continue; }

    // limpia contenido previo para re-sembrar de forma consistente
    await supabase.from('case_steps').delete().eq('case_id', caseRow.id);
    await supabase.from('case_devices').delete().eq('case_id', caseRow.id);

    for (const d of c.devices || []) {
      await supabase.from('case_devices').insert({ case_id: caseRow.id, kind: d.kind, label: d.label, data: d.data });
    }
    for (let i = 0; i < c.steps.length; i++) {
      const s = c.steps[i];
      const { data: stepRow, error: se } = await supabase.from('case_steps').insert({
        case_id: caseRow.id, step_order: i, competency: s.competency, patient_say: s.patient_say,
        prompt: s.prompt, ideal_answer: s.ideal_answer, key_points: s.key_points, device_ref: s.device_ref
      }).select().single();
      if (se) { console.warn('insert step', se.message); continue; }
      const opts = [];
      for (const diff of ['principiante', 'avanzado']) {
        for (const o of s.options[diff] || []) {
          opts.push({ step_id: stepRow.id, difficulty: diff, label: o.label,
            is_correct: o.is_correct, points: o.points, keywords: o.keywords, feedback: o.feedback });
        }
      }
      if (opts.length) await supabase.from('step_options').insert(opts);
    }
    count++;
  }
  return count;
}
