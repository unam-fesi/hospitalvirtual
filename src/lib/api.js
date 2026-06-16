import { supabase } from './supabase.js';

// ---------- Edge Functions (PUM-AI) ----------
async function invoke(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  return data;
}

// Evalúa una respuesta abierta (rol egresado) contra la GPC. Devuelve {score,verdict,missing,complement,corrected}
export function evaluateResponse(payload) {
  return invoke('evaluate-response', payload);
}

// Interpreta semánticamente la respuesta por voz y la mapea a una opción. {optionIndex,optionId,confidence}
export function interpretVoice(transcript, options) {
  return invoke('interpret-voice', { transcript, options });
}

// Sugiere un caso completo a partir de un tema + GPC IMSS. Devuelve el JSON del caso.
export function suggestCase(params) {
  return invoke('suggest-case', params);
}

// ---------- Persistencia de intentos ----------
export async function createAttempt(caseId, role, maxScore) {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return null;
  const { data, error } = await supabase.from('attempts')
    .insert({ user_id: u.user.id, case_id: caseId, role, max_score: maxScore })
    .select().single();
  if (error) { console.warn('createAttempt', error.message); return null; }
  return data;
}
export async function saveAttemptStep(attemptId, payload) {
  if (!attemptId) return;
  const { error } = await supabase.from('attempt_steps')
    .insert({ attempt_id: attemptId, ...payload });
  if (error) console.warn('saveAttemptStep', error.message);
}
export async function finishAttempt(attemptId, score, maxScore, summary) {
  if (!attemptId) return;
  const percent = maxScore ? Math.round((score / maxScore) * 100) : 0;
  const { error } = await supabase.from('attempts')
    .update({ score, percent, summary, finished_at: new Date().toISOString() })
    .eq('id', attemptId);
  if (error) console.warn('finishAttempt', error.message);
}
