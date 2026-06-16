// Web Speech API: voz del paciente (TTS) y respuesta del alumno (STT).
const synth = window.speechSynthesis;
let cachedVoice = null;

function pickVoice() {
  if (!synth) return null;
  const vs = synth.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
  // preferimos una voz mexicana si existe
  cachedVoice = vs.find(v => /mx|mex/i.test(v.lang) || /mexic/i.test(v.name)) || vs[0] || null;
  return cachedVoice;
}
if (synth) synth.onvoiceschanged = pickVoice;

export function speak(text, { pitch = 1, rate = 1 } = {}) {
  if (!synth || !text) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(String(text).replace(/\(.*?\)/g, ''));
  u.lang = 'es-MX'; u.pitch = pitch; u.rate = rate;
  const v = cachedVoice || pickVoice();
  if (v) u.voice = v;
  synth.speak(u);
}
export function stopSpeak() { if (synth) synth.cancel(); }

export function sttSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Escucha una sola frase y resuelve con el transcript.
export function listenOnce({ onStart, onEnd } = {}) {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return reject(new Error('STT no soportado'));
    const r = new SR();
    r.lang = 'es-MX'; r.interimResults = false; r.maxAlternatives = 1;
    let done = false;
    r.onstart = () => onStart && onStart();
    r.onresult = (e) => { done = true; resolve(e.results[0][0].transcript); };
    r.onerror = (e) => { if (!done) reject(new Error(e.error || 'error STT')); };
    r.onend = () => { onEnd && onEnd(); if (!done) reject(new Error('sin-resultado')); };
    try { r.start(); } catch (e) { reject(e); }
  });
}
