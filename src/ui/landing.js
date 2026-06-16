// Página de inicio con logos institucionales y acceso al simulador.
export function showLanding(onEnter) {
  const ui = document.getElementById('ui');
  const base = import.meta.env.BASE_URL;
  const el = document.createElement('div');
  el.className = 'landing';
  el.innerHTML = `
    <div class="logos">
      <img src="${base}logo.png" alt="UNAM" />
      <img src="${base}logofesi.png" alt="FES Iztacala" />
    </div>
    <div class="tagline">Centro Universitario de Salud Digital</div>
    <h1>Hospital Virtual <span class="gold">UNAM</span></h1>
    <p class="lead">
      Simulador clínico en 3D donde recorres un hospital en primera persona y atiendes
      casos reales basados en las <b>Guías de Práctica Clínica del IMSS</b>. Tú decides el
      triage, el diagnóstico y el tratamiento; el paciente responde por voz y una
      inteligencia artificial evalúa, corrige y complementa tu desempeño según tu nivel
      —de primeros semestres a egresados—. Una herramienta de formación clínica
      <b>segura e interprofesional</b>.
    </p>
    <div class="features">
      <span class="feat">🏥 Recorrido 3D en primera persona</span>
      <span class="feat">🗣️ Voz + IA (Gemini)</span>
      <span class="feat">📕 GPC del IMSS</span>
      <span class="feat">👥 Roles por nivel</span>
      <span class="feat">🧪 5 casos clínicos</span>
    </div>
    <button class="enter" id="landing-enter">Ingresar al simulador →</button>
    <div class="foot">UNAM · FES Iztacala · Proyecto académico — contenido basado en GPC del IMSS, sujeto a revisión.</div>`;
  ui.appendChild(el);
  el.querySelector('#landing-enter').onclick = () => { el.remove(); onEnter(); };
}
