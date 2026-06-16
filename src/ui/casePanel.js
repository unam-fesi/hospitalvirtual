import { speak, stopSpeak, listenOnce, sttSupported } from '../lib/voice.js';
import { evaluateResponse, interpretVoice, createAttempt, saveAttemptStep, finishAttempt } from '../lib/api.js';
import { optionsFor, uiModeFor, STEP_MAX, openScoreToPoints, buildReport } from '../cases/engine.js';
import { renderReport } from './report.js';
import { toast } from './toast.js';

export function openCase(caseObj, profile, { onClose }) {
  const role = profile?.role || 'principiante';
  const mode = uiModeFor(role); // 'opciones' | 'abierta'
  const ui = document.getElementById('ui');

  const scrim = document.createElement('div');
  scrim.className = 'drawer';
  scrim.innerHTML = `
    <header>
      <span class="dot" style="background:${caseObj.color}"></span>
      <div><h2>${caseObj.section} — ${caseObj.title}</h2><p>${caseObj.subtitle || ''}</p></div>
      <button class="x" id="case-close">×</button>
    </header>
    <div class="body" id="case-body"></div>`;
  ui.appendChild(scrim);

  const body = scrim.querySelector('#case-body');
  const state = { step: 0, score: 0, perComp: {}, attemptId: null, notes: [] };
  caseObj.steps.forEach((s) => {
    state.perComp[s.competency] = state.perComp[s.competency] || { got: 0, max: 0 };
    state.perComp[s.competency].max += STEP_MAX;
  });

  const maxScore = caseObj.steps.length * STEP_MAX;
  createAttempt(caseObj.id, role, maxScore).then((a) => { state.attemptId = a?.id || null; });

  function close() { stopSpeak(); scrim.remove(); onClose && onClose(); }
  scrim.querySelector('#case-close').onclick = close;

  // ---------- helpers de aparatos / signos vitales ----------
  function monitor() { return (caseObj.devices || []).find((d) => d.kind === 'monitor'); }
  function vitalsHTML() {
    const m = monitor(); if (!m) return '';
    const v = m.data; const items = [];
    if (v.FC !== undefined) items.push(['FC', v.FC, 'lpm']);
    if (v.TA) items.push(['TA', v.TA, 'mmHg']);
    if (v.SpO2 !== undefined) items.push(['SpO₂', v.SpO2, '%']);
    if (v.FR !== undefined) items.push(['FR', v.FR, 'rpm']);
    if (!items.length) return '';
    return `<div class="vitals">${items.map(([k, val, u]) => {
      let cls = '';
      if (k === 'SpO₂' && val !== '—' && val < 92) cls = 'bad';
      else if (k === 'SpO₂' && val < 95) cls = 'warn';
      if (k === 'FC' && val === 0) cls = 'bad'; else if (k === 'FC' && val > 120) cls = 'warn';
      return `<div class="vital ${cls}"><div class="v">${val}</div><div class="k">${k} ${u}</div></div>`;
    }).join('')}</div>`;
  }
  function devicesHTML(step) {
    const list = (caseObj.devices || []).filter((d) => d.kind !== 'monitor');
    if (!list.length) return '';
    return `<div class="devices">${list.map((d) => {
      const highlight = step && step.device_ref === d.kind;
      const rows = d.kind === 'ecg' || d.kind === 'eco' || d.kind === 'rayosx'
        ? `<div class="film">${(d.data.hallazgo || '')}</div>`
        : Object.entries(d.data).map(([k, val]) => `${k}: <b>${val}</b>`).join('<br>');
      return `<div class="device ${d.kind === 'rayosx' || d.kind === 'eco' ? 'xray' : ''}"
        style="${highlight ? 'border-color:var(--accent)' : ''}">
        <div class="dh">${d.label}${highlight ? ' ◀' : ''}</div><div class="dv">${rows}</div></div>`;
    }).join('')}</div>`;
  }

  // ---------- render de un paso ----------
  function renderStep() {
    const s = caseObj.steps[state.step];
    const pct = Math.round((state.step / caseObj.steps.length) * 100);
    body.innerHTML = `
      <div class="guideline">📕 <b>${caseObj.guideline || 'GPC IMSS'}</b></div>
      <div class="progress"><span>Paso ${state.step + 1}/${caseObj.steps.length} · ${s.competency}</span>
        <div class="bar"><i style="width:${pct}%"></i></div><span>${state.score} pts</span></div>
      ${vitalsHTML()}
      ${devicesHTML(s)}
      <div class="stepbox">
        <div class="patient"><div class="av">${caseObj.patient?.avatar || '🧑'}</div>
          <div class="say" id="say">${s.patient_say || ''}</div></div>
        <div class="prompt">${s.prompt}</div>
        <div id="answer-zone"></div>
      </div>`;
    if (s.patient_say) speak(s.patient_say);
    if (mode === 'abierta') renderOpen(s); else renderOptions(s);
  }

  // ---------- modo opción múltiple (principiante / avanzado) ----------
  function renderOptions(s) {
    const zone = body.querySelector('#answer-zone');
    const opts = optionsFor(s, role);
    zone.innerHTML = `
      <div id="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}">${o.label}</button>`).join('')}</div>
      <div class="heard" id="heard"></div>
      <div class="controls">
        <button class="btn mic" id="mic" ${sttSupported() ? '' : 'disabled'}>🎤 ${sttSupported() ? 'Responder por voz' : 'Voz no disponible'}</button>
        <button class="btn" id="repeat">🔊 Repetir paciente</button>
      </div>`;
    zone.querySelectorAll('.opt').forEach((b) => {
      b.onclick = () => commitOption(s, opts, +b.dataset.i);
    });
    zone.querySelector('#repeat').onclick = () => speak(s.patient_say);
    zone.querySelector('#mic').onclick = () => voiceToOption(s, opts);
  }

  async function voiceToOption(s, opts) {
    const mic = body.querySelector('#mic'); const heard = body.querySelector('#heard');
    mic.classList.add('live'); mic.textContent = '🎤 Escuchando…';
    try {
      const transcript = await listenOnce();
      heard.textContent = 'Te escuché: "' + transcript + '"';
      const res = await interpretVoice(transcript, opts.map((o) => ({ id: o.id, label: o.label, keywords: o.keywords })));
      const idx = res?.optionIndex ?? -1;
      if (idx >= 0) commitOption(s, opts, idx);
      else heard.textContent += ' — no identifiqué la acción, intenta de nuevo o toca una opción.';
    } catch (e) {
      heard.textContent = 'No te entendí, intenta de nuevo o usa los botones.';
    } finally { mic.classList.remove('live'); mic.textContent = '🎤 Responder por voz'; }
  }

  function commitOption(s, opts, i) {
    const o = opts[i];
    body.querySelectorAll('#opts .opt').forEach((b, bi) => {
      b.disabled = true;
      if (opts[bi].is_correct) b.classList.add('correct');
      if (bi === i && !o.is_correct) b.classList.add('wrong');
    });
    state.score += o.points;
    state.perComp[s.competency].got += o.points;
    if (!o.is_correct) { speak('¿Está seguro de eso, doctor?'); state.notes.push(`${s.competency}: ${o.feedback}`); }
    saveAttemptStep(state.attemptId, { step_id: dbStepId(s), chosen_option_id: dbOptId(o), ai_score: o.points * 5, ai_verdict: o.is_correct ? 'correcto' : 'incorrecto', ai_feedback: o.feedback });
    showFeedback(o.is_correct ? 'ok' : 'no', (o.is_correct ? '✅ ' : '⚠️ ') + o.feedback);
  }

  // ---------- modo respuesta abierta (egresado) — evalúa Gemini ----------
  function renderOpen(s) {
    const zone = body.querySelector('#answer-zone');
    zone.innerHTML = `
      <textarea class="openans" id="open" placeholder="Describe tu conducta clínica con detalle…"></textarea>
      <div class="heard" id="heard"></div>
      <div class="controls">
        <button class="btn mic" id="mic" ${sttSupported() ? '' : 'disabled'}>🎤 ${sttSupported() ? 'Dictar respuesta' : 'Voz no disponible'}</button>
        <button class="btn primary" id="evaluate">Evaluar respuesta →</button>
      </div>
      <div class="thinking" id="thinking"></div>`;
    const ta = zone.querySelector('#open');
    zone.querySelector('#mic').onclick = async () => {
      const mic = zone.querySelector('#mic'); mic.classList.add('live'); mic.textContent = '🎤 Escuchando…';
      try { const t = await listenOnce(); ta.value = (ta.value ? ta.value + ' ' : '') + t; }
      catch { zone.querySelector('#heard').textContent = 'No te entendí, intenta de nuevo.'; }
      finally { mic.classList.remove('live'); mic.textContent = '🎤 Dictar respuesta'; }
    };
    zone.querySelector('#evaluate').onclick = () => evaluateOpen(s, ta.value.trim());
  }

  async function evaluateOpen(s, answer) {
    if (!answer) return toast('Escribe o dicta tu respuesta', 'bad');
    const think = body.querySelector('#thinking'); think.textContent = '⏳ La IA está evaluando tu respuesta contra la GPC…';
    try {
      const res = await evaluateResponse({
        prompt: s.prompt, userAnswer: answer, idealAnswer: s.ideal_answer,
        keyPoints: s.key_points, guideline: caseObj.guideline, role,
        measurements: Object.fromEntries((caseObj.devices || []).map((d) => [d.kind, d.data]))
      });
      const pts = openScoreToPoints(res.score);
      state.score += pts; state.perComp[s.competency].got += pts;
      const kind = res.verdict === 'correcto' ? 'ok' : res.verdict === 'parcial' ? 'partial' : 'no';
      let html = `<b>${(res.verdict || '').toUpperCase()}</b> · ${res.score}/100<br>${res.complement || ''}`;
      if (res.missing && res.missing.length) html += `<br><br><b>Faltó:</b> ${res.missing.join('; ')}`;
      if (res.corrected) html += `<br><br><b>Respuesta modelo:</b> ${res.corrected}`;
      if (res.complement) state.notes.push(`${s.competency}: ${res.complement}`);
      saveAttemptStep(state.attemptId, { step_id: dbStepId(s), user_answer: answer, ai_score: res.score, ai_verdict: res.verdict, ai_feedback: res.complement });
      think.textContent = '';
      showFeedback(kind, html);
    } catch (e) {
      think.textContent = '';
      toast('No se pudo evaluar (¿sesión o conexión?): ' + (e.message || e), 'bad');
    }
  }

  // ---------- feedback + avance ----------
  function showFeedback(kind, html) {
    const s = caseObj.steps[state.step];
    const fb = document.createElement('div'); fb.className = 'fb ' + kind; fb.innerHTML = html;
    body.querySelector('#answer-zone').appendChild(fb);
    const last = state.step >= caseObj.steps.length - 1;
    const nav = document.createElement('div'); nav.className = 'controls';
    nav.innerHTML = `<button class="btn primary" id="next">${last ? 'Ver evaluación de la IA →' : 'Siguiente paso →'}</button>`;
    body.querySelector('#answer-zone').appendChild(nav);
    nav.querySelector('#next').onclick = () => { if (last) finish(); else { state.step++; renderStep(); } };
  }

  function finish() {
    const report = buildReport(caseObj, state.perComp, state.score);
    finishAttempt(state.attemptId, state.score, report.max, { pct: report.pct, comps: report.comps });
    speak(report.pct >= 65 ? 'Buen trabajo, doctor. Gracias por atenderme.' : 'Doctor, creo que necesita repasar este caso.');
    renderReport(body, report, caseObj, state.notes, {
      onRetry: () => { Object.assign(state, { step: 0, score: 0, notes: [] }); caseObj.steps.forEach((s) => state.perComp[s.competency].got = 0); renderStep(); },
      onClose: close
    });
  }

  // ids reales solo si vienen de la base (uuid); en semilla son sintéticos -> null
  function dbStepId(s) { return isUuid(s.id) ? s.id : null; }
  function dbOptId(o) { return isUuid(o.id) ? o.id : null; }
  function isUuid(v) { return typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v); }

  renderStep();
}
