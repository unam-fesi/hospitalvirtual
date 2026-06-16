// Página de inicio con logos institucionales y acceso al simulador.
export function showLanding(onEnter) {
  const ui = document.getElementById('ui');
  const base = import.meta.env.BASE_URL;
  const el = document.createElement('div');
  el.className = 'landing';

  // [icono, título, texto al frente, dato al reverso]
  const features = [
    ['🏥', 'Recorrido 3D', 'Explora el hospital en primera persona.', 'Edificio con explanada, lobby, pasillo y 5 salas navegables con puertas automáticas.'],
    ['🗣️', 'Voz + PUM-AI', 'El paciente habla y tú respondes.', 'Reconocimiento de voz en español; PUM-AI interpreta tu respuesta y la evalúa contra la GPC.'],
    ['📕', 'GPC del IMSS', 'Casos con respaldo clínico.', 'IMSS-162 (choque), 633 (RCP), 357 (IAMCEST), Cirugía Segura OMS y anafilaxia.'],
    ['👥', 'Roles por nivel', 'Dificultad adaptada al alumno.', 'Primeros semestres: opción múltiple sencilla. Egresados: respuesta abierta evaluada por IA.'],
    ['🧪', '5 casos clínicos', 'Distintas áreas del hospital.', 'Acuchillado, paro cardiorrespiratorio, dolor torácico, seguridad quirúrgica y anafilaxia pediátrica.'],
    ['🤝', 'Interprofesional', 'Trabajo clínico colaborativo.', 'Medicina, enfermería y anestesia coordinándose para una atención segura.']
  ];

  el.innerHTML = `
    <div class="logos">
      <img class="logo-fesi" src="${base}logofesi.png" alt="FES Iztacala" />
      <img class="logo-unam" src="${base}logo.png" alt="Hospital Virtual" />
    </div>
    <div class="tagline">Centro Universitario de Salud Digital</div>
    <h1>Hospital Virtual <span class="gold">UNAM</span></h1>
    <p class="lead">
      Simulador clínico en 3D donde recorres un hospital en primera persona y atiendes
      casos reales basados en las <b>Guías de Práctica Clínica del IMSS</b>. Tú decides el
      triage, el diagnóstico y el tratamiento; el paciente responde por voz y <b>PUM-AI</b>,
      nuestra inteligencia artificial, evalúa, corrige y complementa tu desempeño.
    </p>
    <p class="hintflip">👆 Toca una tarjeta para ver más</p>
    <div class="featgrid">
      ${features.map(([ic, t, d, back]) => `
        <button class="featcard" type="button">
          <div class="fc-inner">
            <div class="fc-face fc-front"><div class="ic">${ic}</div><div class="ft">${t}</div><div class="fd">${d}</div></div>
            <div class="fc-face fc-back"><div class="ft">${ic} ${t}</div><div class="fd">${back}</div></div>
          </div>
        </button>`).join('')}
    </div>
    <button class="enter" id="landing-enter">Ingresar al simulador →</button>
    <div class="foot">UNAM · FES Iztacala · Proyecto académico — contenido basado en GPC del IMSS, sujeto a revisión.</div>`;
  ui.appendChild(el);

  el.querySelectorAll('.featcard').forEach((c) => {
    c.addEventListener('click', () => c.classList.toggle('flipped'));
  });
  el.querySelector('#landing-enter').onclick = () => { el.remove(); onEnter(); };
}
