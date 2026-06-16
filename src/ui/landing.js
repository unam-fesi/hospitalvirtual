// Página de inicio con logos institucionales y acceso al simulador.
export function showLanding(onEnter) {
  const ui = document.getElementById('ui');
  const base = import.meta.env.BASE_URL;
  const el = document.createElement('div');
  el.className = 'landing';

  const features = [
    ['🏥', 'Recorrido 3D', 'Explora el hospital en primera persona y entra a las salas.'],
    ['🗣️', 'Voz + PUM-AI', 'El paciente habla y tú respondes; PUM-AI te evalúa.'],
    ['📕', 'GPC del IMSS', 'Casos basados en las Guías de Práctica Clínica.'],
    ['👥', 'Roles por nivel', 'De primeros semestres a egresados, distinta dificultad.'],
    ['🧪', '5 casos clínicos', 'Urgencias, reanimación, consulta, quirófano y pediatría.'],
    ['🤝', 'Interprofesional', 'Formación clínica segura y colaborativa.']
  ];

  el.innerHTML = `
    <div class="logos">
      <img class="logo-unam" src="${base}logo.png" alt="UNAM" />
      <img class="logo-fesi" src="${base}logofesi.png" alt="FES Iztacala" />
    </div>
    <div class="tagline">Centro Universitario de Salud Digital</div>
    <h1>Hospital Virtual <span class="gold">UNAM</span></h1>
    <p class="lead">
      Simulador clínico en 3D donde recorres un hospital en primera persona y atiendes
      casos reales basados en las <b>Guías de Práctica Clínica del IMSS</b>. Tú decides el
      triage, el diagnóstico y el tratamiento; el paciente responde por voz y <b>PUM-AI</b>,
      nuestra inteligencia artificial, evalúa, corrige y complementa tu desempeño según tu nivel.
    </p>
    <div class="featgrid">
      ${features.map(([ic, t, d]) => `
        <div class="featcard"><div class="ic">${ic}</div>
          <div class="ft">${t}</div><div class="fd">${d}</div></div>`).join('')}
    </div>
    <button class="enter" id="landing-enter">Ingresar al simulador →</button>
    <div class="foot">UNAM · FES Iztacala · Proyecto académico — contenido basado en GPC del IMSS, sujeto a revisión.</div>`;
  ui.appendChild(el);
  el.querySelector('#landing-enter').onclick = () => { el.remove(); onEnter(); };
}
