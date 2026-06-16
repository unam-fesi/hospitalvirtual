// =============================================================
// 5 CASOS CLÍNICOS — basados en Guías de Práctica Clínica (GPC) del IMSS
// Cada paso tiene:
//   - options.principiante / options.avanzado  (opción múltiple, se barajan)
//   - ideal_answer + key_points  (evaluación abierta por IA para egresados)
//   - device_ref  (aparato cuyos valores hay que considerar)
// =============================================================

export const SEED_CASES = [
  // ---------------------------------------------------------
  {
    slug: 'urgencias-acuchillado',
    section: 'Urgencias', room: 'urgencias',
    title: 'Herida por arma blanca', subtitle: 'Hombre 28 años · trauma penetrante abdominal',
    color: '#ff5d5d', icon: '🚑',
    guideline: 'GPC IMSS-162-09 (Choque hipovolémico) · protocolo ATLS',
    patient: { name: 'Luis', age: 28, weight: 75, avatar: '🤕', ailment: 'sangrado' },
    competencies: ['Triage', 'Vía aérea (A/B)', 'Circulación (C)', 'Diagnóstico', 'Manejo definitivo'],
    devices: [
      { kind: 'monitor', label: 'Monitor de signos vitales', data: { FC: 124, TA: '90/60', SpO2: 96, FR: 24 } },
      { kind: 'eco', label: 'FAST (eco a pie de cama)', data: { hallazgo: 'líquido libre en fondo de saco (+)' } }
    ],
    steps: [
      {
        competency: 'Triage', device_ref: 'monitor',
        patient_say: 'Me... me apuñalaron... me duele mucho, por favor ayúdenme.',
        prompt: 'Llega caminando con la mano en el abdomen, sangrando. Según el monitor (FC 124, TA 90/60), ¿qué prioridad de triage le asignas?',
        ideal_answer: 'Triage ROJO / reanimación: trauma penetrante de tronco con taquicardia e hipotensión = paciente potencialmente inestable.',
        key_points: ['rojo', 'reanimación', 'inestable', 'taquicardia', 'hipotensión'],
        options: {
          principiante: [
            { label: 'ROJO — atención inmediata', is_correct: true, points: 20, keywords: ['rojo', 'inmediata', 'critico'], feedback: 'Correcto. Está taquicárdico e hipotenso por la herida: es ROJO.' },
            { label: 'AMARILLO — puede esperar', is_correct: false, points: 5, keywords: ['amarillo', 'esperar'], feedback: 'Subestimas la gravedad: los signos vitales indican choque.' },
            { label: 'VERDE — herida menor', is_correct: false, points: 0, keywords: ['verde', 'menor'], feedback: 'Peligroso: una herida penetrante de abdomen nunca es "menor".' }
          ],
          avanzado: [
            { label: 'Rojo: trauma penetrante con datos de choque hipovolémico clase II-III', is_correct: true, points: 20, keywords: ['rojo', 'choque', 'clase'], feedback: 'Correcto. FC>120 y TA limítrofe = choque hemorrágico que prioriza reanimación.' },
            { label: 'Amarillo: estable, vigilar evolución', is_correct: false, points: 3, keywords: ['amarillo', 'estable'], feedback: 'No está estable: la taquicardia compensa la hipovolemia.' },
            { label: 'Verde: derivar a consulta', is_correct: false, points: 0, keywords: ['verde', 'consulta'], feedback: 'Inaceptable ante mecanismo penetrante de tronco.' }
          ]
        }
      },
      {
        competency: 'Vía aérea (A/B)', device_ref: 'monitor',
        patient_say: 'Sí... puedo hablar... pero me cuesta respirar.',
        prompt: 'Inicias la valoración primaria. ¿Por dónde empiezas?',
        ideal_answer: 'Secuencia ABCDE: A (vía aérea con control cervical) y B (ventilación/oxigenación), antes de cualquier otra cosa.',
        key_points: ['ABCDE', 'vía aérea', 'control cervical', 'ventilación', 'oxígeno'],
        options: {
          principiante: [
            { label: 'A: vía aérea con control cervical, luego B: ventilación', is_correct: true, points: 20, keywords: ['via aerea', 'cervical', 'abcde'], feedback: 'Correcto: siempre A-B-C-D-E en orden.' },
            { label: 'Suturar la herida de inmediato', is_correct: false, points: 0, keywords: ['suturar', 'cerrar'], feedback: 'No: suturar primero oculta hemorragia y atrasa lo vital.' },
            { label: 'Tomar historia clínica completa', is_correct: false, points: 2, keywords: ['historia'], feedback: 'La historia va después del ABCDE.' }
          ],
          avanzado: [
            { label: 'Vía aérea permeable (habla) + O2 alto flujo y valorar ventilación/simetría torácica', is_correct: true, points: 20, keywords: ['permeable', 'oxigeno', 'ventilacion', 'torax'], feedback: 'Correcto: descartas neumotórax y aseguras oxigenación antes de C.' },
            { label: 'Intubación de secuencia rápida inmediata', is_correct: false, points: 5, keywords: ['intubacion', 'secuencia'], feedback: 'Innecesaria: la vía aérea está permeable, no la fuerces aún.' },
            { label: 'Pasar directo a control de hemorragia', is_correct: false, points: 8, keywords: ['hemorragia'], feedback: 'Casi: pero B va antes de C en el ABCDE.' }
          ]
        }
      },
      {
        competency: 'Circulación (C)', device_ref: 'monitor',
        patient_say: 'Tengo mucho frío... y sed.',
        prompt: 'En C detectas signos de choque. ¿Cuál es tu manejo?',
        ideal_answer: 'Control de hemorragia con presión directa, 2 accesos IV gruesos (14-16G), reanimación con cristaloides tibios/hemoderivados y tipar-cruzar sangre.',
        key_points: ['presión directa', 'dos vías', 'calibre grueso', 'cristaloides', 'cruzar sangre'],
        options: {
          principiante: [
            { label: '2 vías IV gruesas, líquidos tibios y presión directa sobre la herida', is_correct: true, points: 20, keywords: ['dos vias', 'liquidos', 'presion directa', 'suero'], feedback: 'Correcto: control de hemorragia + acceso vascular + reanimación.' },
            { label: 'Colocar un torniquete en el abdomen', is_correct: false, points: 0, keywords: ['torniquete'], feedback: 'El torniquete no aplica en tronco/abdomen.' },
            { label: 'Esperar al quirófano sin canalizar', is_correct: false, points: 0, keywords: ['esperar'], feedback: 'Sin acceso IV el choque progresa.' }
          ],
          avanzado: [
            { label: 'Reanimación de control de daños: hemoderivados 1:1:1, hipotensión permisiva y ácido tranexámico', is_correct: true, points: 20, keywords: ['control de daños', 'hemoderivados', 'tranexamico', 'permisiva'], feedback: 'Correcto: estrategia moderna del choque hemorrágico por trauma.' },
            { label: 'Bolos repetidos de cristaloides hasta normotensión', is_correct: false, points: 6, keywords: ['cristaloides', 'normotension'], feedback: 'Riesgo de coagulopatía dilucional; prefiere hemoderivados e hipotensión permisiva.' },
            { label: 'Vasopresores en infusión como primera medida', is_correct: false, points: 0, keywords: ['vasopresores'], feedback: 'No: el problema es volumen, no tono vascular.' }
          ]
        }
      },
      {
        competency: 'Diagnóstico', device_ref: 'eco',
        patient_say: '(El paciente está pálido y sudoroso)',
        prompt: 'El FAST a pie de cama reporta líquido libre (+). ¿Qué significa y qué decides?',
        ideal_answer: 'Líquido libre en un inestable = hemoperitoneo por lesión visceral/vascular; indica laparotomía urgente sin retrasar con TAC.',
        key_points: ['hemoperitoneo', 'líquido libre', 'inestable', 'no TAC', 'quirófano'],
        options: {
          principiante: [
            { label: 'Hay sangrado interno: preparar quirófano', is_correct: true, points: 20, keywords: ['sangrado interno', 'quirofano', 'cirugia'], feedback: 'Correcto: el FAST positivo en un inestable obliga a cirugía.' },
            { label: 'Mandar a TAC con contraste primero', is_correct: false, points: 4, keywords: ['tac', 'tomografia'], feedback: 'No saques de reanimación a un inestable para una TAC.' },
            { label: 'Repetir el eco en 2 horas', is_correct: false, points: 0, keywords: ['repetir', 'horas'], feedback: 'No hay tiempo: el sangrado es activo.' }
          ],
          avanzado: [
            { label: 'Hemoperitoneo en paciente inestable → laparotomía exploradora inmediata', is_correct: true, points: 20, keywords: ['hemoperitoneo', 'laparotomia', 'inmediata'], feedback: 'Correcto: indicación quirúrgica clara, la TAC quedaría solo para estables.' },
            { label: 'Angiotomografía para localizar el sangrado', is_correct: false, points: 5, keywords: ['angiotomografia', 'tac'], feedback: 'Solo si se estabiliza; aquí retrasa el control quirúrgico.' },
            { label: 'Observación con eco seriado', is_correct: false, points: 0, keywords: ['observacion', 'seriado'], feedback: 'El manejo no operatorio no aplica a inestables.' }
          ]
        }
      },
      {
        competency: 'Manejo definitivo', device_ref: 'monitor',
        patient_say: '¿Me voy a... morir, doctor?',
        prompt: 'Persiste inestable con FAST positivo. ¿Destino?',
        ideal_answer: 'Activar código trauma y trasladar a quirófano para laparotomía de control de hemorragia; nunca observación ni alta.',
        key_points: ['código trauma', 'quirófano', 'laparotomía', 'control de hemorragia'],
        options: {
          principiante: [
            { label: 'Activar código trauma y llevar a quirófano', is_correct: true, points: 20, keywords: ['codigo trauma', 'quirofano', 'cirugia'], feedback: 'Correcto: control quirúrgico inmediato del sangrado.' },
            { label: 'Dejar en observación 24 h', is_correct: false, points: 0, keywords: ['observacion'], feedback: 'Fatal en un inestable con sangrado activo.' },
            { label: 'Alta con analgésico', is_correct: false, points: 0, keywords: ['alta', 'casa'], feedback: 'Riesgo vital absoluto.' }
          ],
          avanzado: [
            { label: 'Código trauma + laparotomía de control de daños y reanimación continua', is_correct: true, points: 20, keywords: ['control de daños', 'laparotomia', 'codigo'], feedback: 'Correcto: cirugía abreviada para detener el sangrado y corregir la triada letal.' },
            { label: 'Ingreso a terapia intensiva para estabilizar antes de operar', is_correct: false, points: 4, keywords: ['terapia', 'estabilizar'], feedback: 'No se estabiliza un sangrado quirúrgico fuera del quirófano.' },
            { label: 'Embolización angiográfica como primera opción', is_correct: false, points: 6, keywords: ['embolizacion'], feedback: 'Útil en casos seleccionados estables, no en este inestable.' }
          ]
        }
      }
    ]
  },

  // ---------------------------------------------------------
  {
    slug: 'reanimacion-paro',
    section: 'Reanimación / Choque', room: 'reanimacion',
    title: 'Paro cardiorrespiratorio', subtitle: 'Mujer 60 años · colapso súbito presenciado',
    color: '#ff9f1c', icon: '💗',
    guideline: 'GPC IMSS-633-13 (Reanimación cardiopulmonar en adultos)',
    patient: { name: 'Carmen', age: 60, weight: 68, avatar: '😵', ailment: 'paro' },
    competencies: ['RCP básica', 'Desfibrilación', 'Calidad de RCP', 'Fármacos', 'Post-paro'],
    devices: [
      { kind: 'monitor', label: 'Monitor / desfibrilador', data: { ritmo: 'Fibrilación ventricular', FC: 0, TA: '—', SpO2: '—' } }
    ],
    steps: [
      {
        competency: 'RCP básica', device_ref: 'monitor',
        patient_say: '(No responde, no respira normalmente)',
        prompt: 'La encuentras inconsciente. Compruebas pulso y respiración ≤10 s: no hay pulso. ¿Qué haces?',
        ideal_answer: 'Activar emergencias, pedir DEA/desfibrilador e iniciar RCP de alta calidad 30:2 sin demora.',
        key_points: ['pedir ayuda', 'DEA', 'RCP', 'compresiones', '30:2'],
        options: {
          principiante: [
            { label: 'Pedir ayuda + DEA e iniciar RCP 30:2', is_correct: true, points: 20, keywords: ['ayuda', 'dea', 'rcp', 'compresiones'], feedback: 'Correcto: activar el sistema y comprimir de inmediato.' },
            { label: 'Dar solo respiraciones de rescate', is_correct: false, points: 0, keywords: ['respiraciones'], feedback: 'Insuficiente: prioriza compresiones.' },
            { label: 'Buscar un familiar que autorice', is_correct: false, points: 0, keywords: ['familiar', 'autorizacion'], feedback: 'El paro no espera autorización.' }
          ],
          avanzado: [
            { label: 'Activar código, compresiones 100-120/min a 5-6 cm con mínima interrupción y solicitar desfibrilador', is_correct: true, points: 20, keywords: ['100', '120', 'profundidad', 'desfibrilador', 'minima interrupcion'], feedback: 'Correcto: RCP de alta calidad con métricas adecuadas.' },
            { label: 'Vía aérea avanzada antes de comprimir', is_correct: false, points: 4, keywords: ['via aerea', 'intubar'], feedback: 'No retrases las compresiones para la vía aérea.' },
            { label: 'Adrenalina antes de iniciar RCP', is_correct: false, points: 2, keywords: ['adrenalina'], feedback: 'Primero compresiones y desfibrilación si procede.' }
          ]
        }
      },
      {
        competency: 'Desfibrilación', device_ref: 'monitor',
        patient_say: '(El monitor muestra Fibrilación Ventricular)',
        prompt: 'El monitor muestra Fibrilación Ventricular. ¿Conducta?',
        ideal_answer: 'Desfibrilación inmediata (bifásico 200 J o según fabricante) y reanudar RCP enseguida.',
        key_points: ['desfibrilar', 'descarga', 'bifásico', 'reanudar RCP'],
        options: {
          principiante: [
            { label: 'Desfibrilar de inmediato y seguir con RCP', is_correct: true, points: 20, keywords: ['desfibrilar', 'descarga', 'choque'], feedback: 'Correcto: la FV es ritmo desfibrilable.' },
            { label: 'Adrenalina primero, sin desfibrilar', is_correct: false, points: 5, keywords: ['adrenalina'], feedback: 'No: la prioridad es la descarga.' },
            { label: 'Amiodarona antes de la primera descarga', is_correct: false, points: 0, keywords: ['amiodarona'], feedback: 'Solo en FV refractaria, tras descargas.' }
          ],
          avanzado: [
            { label: 'Descarga bifásica 200 J, reanudar compresiones de inmediato sin checar pulso', is_correct: true, points: 20, keywords: ['200', 'bifasica', 'sin checar'], feedback: 'Correcto: descarga y RCP inmediata, mínima pausa peri-choque.' },
            { label: 'Descarga sincronizada (cardioversión)', is_correct: false, points: 0, keywords: ['sincronizada', 'cardioversion'], feedback: 'En FV se desfibrila NO sincronizado.' },
            { label: 'Triple descarga consecutiva apilada', is_correct: false, points: 3, keywords: ['triple', 'apilada'], feedback: 'Ya no se recomienda salvo paro monitorizado en cateterismo.' }
          ]
        }
      },
      {
        competency: 'Calidad de RCP', device_ref: 'monitor',
        patient_say: '(Continúa en paro)',
        prompt: 'Tras la descarga, ¿qué haces?',
        ideal_answer: 'Reanudar compresiones de inmediato por 2 minutos sin checar pulso, minimizando interrupciones.',
        key_points: ['compresiones inmediatas', '2 minutos', 'no checar pulso', 'minimizar pausas'],
        options: {
          principiante: [
            { label: 'Reanudar compresiones de inmediato por 2 min', is_correct: true, points: 20, keywords: ['compresiones', '2 minutos', 'reanudar'], feedback: 'Correcto: no se checa pulso tras la descarga.' },
            { label: 'Checar pulso 30 segundos', is_correct: false, points: 0, keywords: ['pulso', 'checar'], feedback: 'Interrumpir tanto reduce la perfusión.' },
            { label: 'Intubar deteniendo las compresiones', is_correct: false, points: 2, keywords: ['intubar'], feedback: 'No detengas compresiones para intubar.' }
          ],
          avanzado: [
            { label: 'Compresiones continuas 2 min, rotar reanimador y usar capnografía para calidad', is_correct: true, points: 20, keywords: ['rotar', 'capnografia', 'continuas'], feedback: 'Correcto: rotación cada 2 min y EtCO2 guían la calidad.' },
            { label: 'Pausa para análisis prolongado del ritmo', is_correct: false, points: 0, keywords: ['pausa', 'analisis'], feedback: 'Las pausas largas empeoran el pronóstico.' },
            { label: 'Reducir la frecuencia para no cansarse', is_correct: false, points: 0, keywords: ['reducir', 'frecuencia'], feedback: 'Mantén 100-120/min; rota al reanimador.' }
          ]
        }
      },
      {
        competency: 'Fármacos', device_ref: 'monitor',
        patient_say: '(Persiste FV tras el segundo ciclo)',
        prompt: 'Persiste en FV. ¿Fármaco y conducta?',
        ideal_answer: 'Adrenalina 1 mg IV cada 3-5 min y amiodarona 300 mg en FV refractaria, sin interrumpir RCP/descargas.',
        key_points: ['adrenalina', '1 mg', 'cada 3-5 min', 'amiodarona', 'refractaria'],
        options: {
          principiante: [
            { label: 'Adrenalina 1 mg IV cada 3-5 min y continuar RCP/descargas', is_correct: true, points: 20, keywords: ['adrenalina', '1 mg', 'cada 3'], feedback: 'Correcto, y considera amiodarona en FV refractaria.' },
            { label: 'Atropina en bolo', is_correct: false, points: 0, keywords: ['atropina'], feedback: 'Ya no se usa en el algoritmo de paro.' },
            { label: 'Bicarbonato de rutina', is_correct: false, points: 0, keywords: ['bicarbonato'], feedback: 'Solo en situaciones específicas.' }
          ],
          avanzado: [
            { label: 'Adrenalina 1 mg c/3-5 min + amiodarona 300 mg IV y buscar causas reversibles (H y T)', is_correct: true, points: 20, keywords: ['amiodarona', '300', 'reversibles', 'h y t'], feedback: 'Correcto: fármacos + buscar 5H/5T (hipoxia, hipovolemia, taponamiento, etc.).' },
            { label: 'Lidocaína como primera línea sin adrenalina', is_correct: false, points: 6, keywords: ['lidocaina'], feedback: 'Alternativa a amiodarona, pero la adrenalina sigue indicada.' },
            { label: 'Magnesio de rutina', is_correct: false, points: 3, keywords: ['magnesio'], feedback: 'Solo si torsades de pointes / hipomagnesemia.' }
          ]
        }
      },
      {
        competency: 'Post-paro', device_ref: 'monitor',
        patient_say: '(Recupera pulso — ROSC)',
        prompt: 'Logras retorno de circulación espontánea (ROSC). ¿Siguiente paso?',
        ideal_answer: 'Cuidados post-paro: ECG de 12 derivaciones, oxigenación/ventilación controlada (evitar hiperoxia e hipocapnia), soporte hemodinámico y traslado a UCI; valorar manejo dirigido de temperatura.',
        key_points: ['ECG 12 derivaciones', 'evitar hiperoxia', 'soporte hemodinámico', 'UCI', 'temperatura dirigida'],
        options: {
          principiante: [
            { label: 'Cuidados post-paro: ECG, oxigenar y soporte, trasladar a UCI', is_correct: true, points: 20, keywords: ['ecg', 'cuidados', 'uci', 'soporte'], feedback: 'Correcto: buscar causa y proteger órganos.' },
            { label: 'Extubar y dar de alta', is_correct: false, points: 0, keywords: ['alta', 'extubar'], feedback: 'El post-paro es de altísimo riesgo.' },
            { label: 'Suspender el monitoreo', is_correct: false, points: 0, keywords: ['suspender'], feedback: 'Hay riesgo de re-paro: monitoriza.' }
          ],
          avanzado: [
            { label: 'ECG 12 derivaciones (¿IAM?), SpO2 94-98%, normocapnia, PAM ≥65 y manejo dirigido de temperatura', is_correct: true, points: 20, keywords: ['normocapnia', 'pam', 'temperatura', 'iam'], feedback: 'Correcto: paquete post-paro completo orientado a la causa.' },
            { label: 'Hiperventilar para "limpiar" CO2', is_correct: false, points: 0, keywords: ['hiperventilar'], feedback: 'La hipocapnia reduce el flujo cerebral; evítala.' },
            { label: 'FiO2 100% mantenida indefinidamente', is_correct: false, points: 4, keywords: ['fio2', '100'], feedback: 'Titula el O2: la hiperoxia daña por reperfusión.' }
          ]
        }
      }
    ]
  },

  // ---------------------------------------------------------
  {
    slug: 'consulta-dolor-toracico',
    section: 'Consulta Externa', room: 'consulta',
    title: 'Dolor torácico', subtitle: 'Hombre 55 años · dolor opresivo retroesternal',
    color: '#37c2ff', icon: '🩺',
    guideline: 'GPC IMSS-357 (IAM con elevación del ST)',
    patient: { name: 'Jorge', age: 55, weight: 88, avatar: '🧑', ailment: 'dolor_pecho' },
    competencies: ['Anamnesis', 'Estudio inicial', 'Diagnóstico', 'Tratamiento', 'Reperfusión'],
    devices: [
      { kind: 'monitor', label: 'Monitor de signos vitales', data: { FC: 98, TA: '150/95', SpO2: 95, FR: 20 } },
      { kind: 'ecg', label: 'Electrocardiograma 12 derivaciones', data: { hallazgo: 'elevación del ST en cara inferior (DII, DIII, aVF)' } }
    ],
    steps: [
      {
        competency: 'Anamnesis', device_ref: 'monitor',
        patient_say: 'Doctor, siento un peso en el pecho desde hace media hora, y el brazo izquierdo dormido.',
        prompt: 'El paciente describe su dolor. ¿Qué es lo más útil para orientar el diagnóstico?',
        ideal_answer: 'Caracterizar el dolor (opresivo, irradiación a brazo/mandíbula, relación con esfuerzo, diaforesis, duración) y factores de riesgo cardiovascular.',
        key_points: ['irradiación', 'esfuerzo', 'diaforesis', 'factores de riesgo', 'duración'],
        options: {
          principiante: [
            { label: 'Caracterizar el dolor (irradiación, esfuerzo, diaforesis) y factores de riesgo', is_correct: true, points: 20, keywords: ['irradiacion', 'esfuerzo', 'diaforesis', 'factores'], feedback: 'Correcto: el patrón orienta a origen coronario.' },
            { label: 'Preguntar solo antecedentes familiares lejanos', is_correct: false, points: 5, keywords: ['familiares'], feedback: 'Secundario; primero caracteriza el dolor actual.' },
            { label: 'Revisar la garganta', is_correct: false, points: 0, keywords: ['garganta'], feedback: 'No corresponde al cuadro de alarma.' }
          ],
          avanzado: [
            { label: 'Aplicar características de angina típica + estratificar riesgo (HEART/TIMI) y descartar causas no coronarias', is_correct: true, points: 20, keywords: ['angina tipica', 'heart', 'timi', 'estratificar'], feedback: 'Correcto: caracterización + escalas de riesgo guían la conducta.' },
            { label: 'Asumir origen gástrico por la edad', is_correct: false, points: 0, keywords: ['gastrico'], feedback: 'No asumas: hay datos de alarma coronarios.' },
            { label: 'Solicitar prueba de esfuerzo de inmediato', is_correct: false, points: 3, keywords: ['esfuerzo', 'ergometria'], feedback: 'Contraindicada en dolor agudo sin descartar IAM.' }
          ]
        }
      },
      {
        competency: 'Estudio inicial', device_ref: 'ecg',
        patient_say: 'Me está sudando mucho la frente...',
        prompt: '¿Cuál es tu primera acción diagnóstica?',
        ideal_answer: 'ECG de 12 derivaciones en menos de 10 minutos y monitorización continua.',
        key_points: ['ECG', '12 derivaciones', '10 minutos', 'monitor'],
        options: {
          principiante: [
            { label: 'ECG de 12 derivaciones en <10 min + monitor', is_correct: true, points: 20, keywords: ['ecg', '12 derivaciones', '10 minutos'], feedback: 'Correcto: estándar ante dolor torácico.' },
            { label: 'Enviar a casa con omeprazol', is_correct: false, points: 0, keywords: ['omeprazol', 'casa'], feedback: 'Peligroso: no asumas reflujo.' },
            { label: 'Radiografía de tórax y esperar', is_correct: false, points: 5, keywords: ['radiografia'], feedback: 'La RX no descarta infarto; el ECG es prioritario.' }
          ],
          avanzado: [
            { label: 'ECG <10 min + troponina de alta sensibilidad seriada y monitor; aspirina si no contraindicación', is_correct: true, points: 20, keywords: ['ecg', 'troponina', 'alta sensibilidad', 'aspirina'], feedback: 'Correcto: ECG inmediato y biomarcadores seriados.' },
            { label: 'Esperar troponinas antes del ECG', is_correct: false, points: 4, keywords: ['esperar', 'troponina'], feedback: 'El ECG va primero y de inmediato.' },
            { label: 'Dímero D para descartar el dolor', is_correct: false, points: 2, keywords: ['dimero'], feedback: 'Para TEP/disección, no para el síndrome coronario.' }
          ]
        }
      },
      {
        competency: 'Diagnóstico', device_ref: 'ecg',
        patient_say: '(El ECG muestra elevación del ST en cara inferior)',
        prompt: 'El ECG muestra elevación del ST. ¿Diagnóstico?',
        ideal_answer: 'Infarto agudo de miocardio con elevación del ST (IAMCEST), cara inferior: emergencia tiempo-dependiente.',
        key_points: ['IAMCEST', 'elevación del ST', 'infarto', 'tiempo-dependiente'],
        options: {
          principiante: [
            { label: 'Infarto agudo con elevación del ST (IAMCEST)', is_correct: true, points: 20, keywords: ['infarto', 'iamcest', 'elevacion'], feedback: 'Correcto: dato objetivo de infarto transmural.' },
            { label: 'Crisis de ansiedad', is_correct: false, points: 0, keywords: ['ansiedad'], feedback: 'No: la elevación del ST es objetiva.' },
            { label: 'Reflujo gastroesofágico', is_correct: false, points: 0, keywords: ['reflujo'], feedback: 'El ECG ya muestra isquemia.' }
          ],
          avanzado: [
            { label: 'IAMCEST inferior; vigilar bloqueo AV y compromiso de ventrículo derecho (V4R)', is_correct: true, points: 20, keywords: ['inferior', 'ventriculo derecho', 'v4r', 'bloqueo'], feedback: 'Correcto: el IAM inferior puede dar bradiarritmia y VD; pide V4R.' },
            { label: 'IAM sin elevación (SICASEST)', is_correct: false, points: 0, keywords: ['sicasest', 'sin elevacion'], feedback: 'Hay elevación del ST: es CEST.' },
            { label: 'Pericarditis aguda', is_correct: false, points: 4, keywords: ['pericarditis'], feedback: 'La distribución y la clínica favorecen IAM; no demores reperfusión.' }
          ]
        }
      },
      {
        competency: 'Tratamiento', device_ref: 'monitor',
        patient_say: 'El dolor sigue igual de fuerte.',
        prompt: '¿Manejo inicial mientras organizas la reperfusión?',
        ideal_answer: 'AAS masticable + segundo antiagregante, anticoagulación, analgesia, nitratos si no hay hipotensión/VD, y O2 solo si SpO2<90%.',
        key_points: ['aspirina', 'antiagregante', 'anticoagulación', 'nitroglicerina', 'oxígeno si hipoxemia'],
        options: {
          principiante: [
            { label: 'AAS masticable + analgesia + nitroglicerina (si no hipotenso) + O2 si SpO2<90%', is_correct: true, points: 20, keywords: ['aspirina', 'nitroglicerina', 'oxigeno', 'analgesia'], feedback: 'Correcto: antiagregación y control de la isquemia.' },
            { label: 'Solo paracetamol y observar', is_correct: false, points: 0, keywords: ['paracetamol'], feedback: 'Insuficiente para un IAM.' },
            { label: 'Oxígeno a alto flujo a todos', is_correct: false, points: 4, keywords: ['oxigeno', 'alto flujo'], feedback: 'Solo si hay hipoxemia (SpO2<90%).' }
          ],
          avanzado: [
            { label: 'AAS + inhibidor P2Y12 + anticoagulante; nitratos con precaución (IAM inferior/VD) y evitar O2 si SpO2 normal', is_correct: true, points: 20, keywords: ['p2y12', 'anticoagulante', 'precaucion', 'vd'], feedback: 'Correcto: doble antiagregación y cuidado con nitratos en compromiso de VD.' },
            { label: 'Nitroglicerina IV a dosis altas de entrada', is_correct: false, points: 2, keywords: ['nitroglicerina', 'altas'], feedback: 'Riesgo de hipotensión severa en IAM inferior/VD.' },
            { label: 'Trombolítico sin valorar contraindicaciones', is_correct: false, points: 3, keywords: ['trombolitico'], feedback: 'Primero checa contraindicaciones y la opción de ICP.' }
          ]
        }
      },
      {
        competency: 'Reperfusión', device_ref: 'ecg',
        patient_say: '¿Qué me van a hacer, doctor?',
        prompt: '¿Estrategia de reperfusión definitiva?',
        ideal_answer: 'Angioplastia primaria (ICP) idealmente <90-120 min; fibrinólisis si la ICP no estará disponible a tiempo, valorando contraindicaciones.',
        key_points: ['angioplastia primaria', 'ICP', 'tiempo', 'fibrinólisis', 'contraindicaciones'],
        options: {
          principiante: [
            { label: 'Angioplastia primaria pronto; fibrinólisis si no hay hemodinamia a tiempo', is_correct: true, points: 20, keywords: ['angioplastia', 'icp', 'fibrinolisis'], feedback: 'Correcto: tiempo es músculo.' },
            { label: 'Esperar enzimas seriadas 6 h antes de actuar', is_correct: false, points: 0, keywords: ['enzimas', 'esperar'], feedback: 'En IAMCEST no se espera.' },
            { label: 'Alta con cita en un mes', is_correct: false, points: 0, keywords: ['alta', 'cita'], feedback: 'Riesgo vital.' }
          ],
          avanzado: [
            { label: 'ICP primaria <90 min (o <120 si traslado); si no es posible, fibrinólisis <30 min y estrategia fármaco-invasiva', is_correct: true, points: 20, keywords: ['90', '120', 'farmaco-invasiva', '30'], feedback: 'Correcto: tiempos puerta-balón/aguja y estrategia fármaco-invasiva.' },
            { label: 'Fibrinólisis aunque haya ICP disponible en 60 min', is_correct: false, points: 4, keywords: ['fibrinolisis'], feedback: 'Si hay ICP a tiempo, es preferible a la fibrinólisis.' },
            { label: 'Cirugía de revascularización urgente de primera línea', is_correct: false, points: 3, keywords: ['revascularizacion', 'bypass'], feedback: 'La cirugía se reserva para anatomía no apta a ICP o complicaciones.' }
          ]
        }
      }
    ]
  },

  // ---------------------------------------------------------
  {
    slug: 'quirofano-cirugia-segura',
    section: 'Quirófano', room: 'quirofano',
    title: 'Seguridad quirúrgica (interprofesional)', subtitle: 'Checklist OMS · médico-enfermería-anestesia',
    color: '#3ddc8a', icon: '🩹',
    guideline: 'Lista de Verificación para Cirugía Segura IMSS-OMS (proc. 2660-003-063)',
    patient: { name: 'Rosa', age: 47, weight: 70, avatar: '🛏️', ailment: 'quirurgico' },
    competencies: ['Sign In', 'Marcaje', 'Time Out', 'Conteo', 'Sign Out'],
    devices: [
      { kind: 'monitor', label: 'Monitor de anestesia', data: { FC: 78, TA: '120/80', SpO2: 99, FR: 14 } },
      { kind: 'lab', label: 'Expediente / consentimiento', data: { consentimiento: 'firmado', alergias: 'penicilina', ayuno: '8 h' } }
    ],
    steps: [
      {
        competency: 'Sign In', device_ref: 'lab',
        patient_say: 'Estoy un poco nervioso por la operación...',
        prompt: 'Antes de la inducción anestésica (Sign In). El expediente marca alergia a penicilina. ¿Qué confirma el equipo?',
        ideal_answer: 'Identidad, sitio y procedimiento, consentimiento firmado, alergias (penicilina), vía aérea difícil y riesgo de sangrado, equipo de anestesia verificado.',
        key_points: ['identidad', 'sitio', 'consentimiento', 'alergias', 'vía aérea', 'sangrado'],
        options: {
          principiante: [
            { label: 'Identidad, sitio, consentimiento, alergias y riesgos de vía aérea/sangrado', is_correct: true, points: 20, keywords: ['identidad', 'consentimiento', 'alergias', 'sitio'], feedback: 'Correcto: el Sign In previene errores antes de dormir al paciente.' },
            { label: 'Iniciar sin verificar nada', is_correct: false, points: 0, keywords: ['sin verificar'], feedback: 'Omitirlo es la causa principal de eventos centinela.' },
            { label: 'Solo preguntar el nombre', is_correct: false, points: 5, keywords: ['nombre'], feedback: 'Incompleto: falta sitio, consentimiento, alergias.' }
          ],
          avanzado: [
            { label: 'Checklist Sign In completo + plan ante vía aérea difícil y profilaxis adaptada a la alergia a penicilina', is_correct: true, points: 20, keywords: ['via aerea dificil', 'profilaxis', 'penicilina', 'sign in'], feedback: 'Correcto: integra la alergia al plan antibiótico y anestésico.' },
            { label: 'Confiar en la memoria del equipo', is_correct: false, points: 0, keywords: ['memoria'], feedback: 'La verificación estructurada no se sustituye por memoria.' },
            { label: 'Posponer la verificación al final', is_correct: false, points: 0, keywords: ['posponer', 'final'], feedback: 'El Sign In es ANTES de la inducción.' }
          ]
        }
      },
      {
        competency: 'Marcaje', device_ref: 'lab',
        patient_say: '(Paciente despierto, antes de pasar a sala)',
        prompt: '¿Cuándo y cómo se marca el sitio quirúrgico?',
        ideal_answer: 'El cirujano marca el sitio con el paciente despierto y participando, antes de entrar a quirófano.',
        key_points: ['marcar sitio', 'paciente despierto', 'cirujano', 'antes de sala'],
        options: {
          principiante: [
            { label: 'El cirujano lo marca con el paciente despierto, antes de entrar', is_correct: true, points: 20, keywords: ['marcar', 'despierto', 'cirujano'], feedback: 'Correcto: previene cirugía en sitio equivocado.' },
            { label: 'No marcar, todos saben dónde es', is_correct: false, points: 0, keywords: ['no marcar'], feedback: 'Error grave.' },
            { label: 'Marcar después de la incisión', is_correct: false, points: 0, keywords: ['despues'], feedback: 'Inútil: debe ser antes.' }
          ],
          avanzado: [
            { label: 'Marcaje inequívoco por el cirujano responsable, con el paciente despierto, verificado en el Time Out', is_correct: true, points: 20, keywords: ['inequivoco', 'responsable', 'time out'], feedback: 'Correcto: se confirma de nuevo en el Time Out.' },
            { label: 'Que lo marque enfermería sin el cirujano', is_correct: false, points: 4, keywords: ['enfermeria sola'], feedback: 'Lo marca quien opera, idealmente con el paciente.' },
            { label: 'Marcar ambos lados por seguridad', is_correct: false, points: 0, keywords: ['ambos lados'], feedback: 'Confunde: se marca solo el sitio correcto.' }
          ]
        }
      },
      {
        competency: 'Time Out', device_ref: 'monitor',
        patient_say: '(Todo el equipo presente en sala)',
        prompt: 'Justo antes de la incisión (Time Out). ¿Qué se hace?',
        ideal_answer: 'Pausa quirúrgica: todo el equipo se presenta y confirma en voz alta paciente, procedimiento, sitio, profilaxis antibiótica administrada e imágenes necesarias.',
        key_points: ['pausa', 'equipo se presenta', 'confirmar paciente/sitio', 'profilaxis antibiótica', 'en voz alta'],
        options: {
          principiante: [
            { label: 'Pausa: el equipo se presenta y confirma paciente, procedimiento, sitio y profilaxis', is_correct: true, points: 20, keywords: ['pausa', 'equipo', 'antibiotica', 'confirmar'], feedback: 'Correcto: verificación final en voz alta.' },
            { label: 'Solo el cirujano decide y corta', is_correct: false, points: 0, keywords: ['cirujano corta'], feedback: 'La seguridad es de todo el equipo.' },
            { label: 'Saltarlo para ahorrar tiempo', is_correct: false, points: 0, keywords: ['saltar', 'ahorrar'], feedback: 'Nunca: 1 minuto no justifica un evento adverso.' }
          ],
          avanzado: [
            { label: 'Time Out estructurado: identidad, sitio, eventos críticos previstos, profilaxis <60 min, esterilidad e imágenes', is_correct: true, points: 20, keywords: ['eventos criticos', '60 min', 'esterilidad', 'imagenes'], feedback: 'Correcto: anticipa eventos críticos y verifica profilaxis a tiempo.' },
            { label: 'Confirmar solo el nombre del paciente', is_correct: false, points: 4, keywords: ['solo nombre'], feedback: 'Incompleto frente al Time Out completo.' },
            { label: 'Realizarlo después de la incisión', is_correct: false, points: 0, keywords: ['despues de la incision'], feedback: 'Es ANTES de la incisión.' }
          ]
        }
      },
      {
        competency: 'Conteo', device_ref: 'lab',
        patient_say: '(Cirugía en curso)',
        prompt: 'Antes de cerrar la cavidad, ¿qué verifica enfermería con el equipo?',
        ideal_answer: 'Conteo completo de gasas, compresas, agujas e instrumental, que debe coincidir con el conteo inicial, para prevenir material retenido (oblito).',
        key_points: ['conteo', 'gasas', 'instrumental', 'coincide', 'oblito'],
        options: {
          principiante: [
            { label: 'Conteo completo de gasas, compresas e instrumental', is_correct: true, points: 20, keywords: ['conteo', 'gasas', 'instrumental'], feedback: 'Correcto: previene material retenido.' },
            { label: 'Cerrar sin contar para terminar pronto', is_correct: false, points: 0, keywords: ['sin contar'], feedback: 'Arriesga dejar material dentro.' },
            { label: 'Contar solo el bisturí', is_correct: false, points: 2, keywords: ['bisturi'], feedback: 'Incompleto: cuenta todo el material.' }
          ],
          avanzado: [
            { label: 'Doble conteo verbal y registrado; si no coincide, detener cierre y buscar/radiografiar', is_correct: true, points: 20, keywords: ['doble conteo', 'registrado', 'radiografiar', 'no coincide'], feedback: 'Correcto: ante discrepancia, no se cierra hasta resolver.' },
            { label: 'Confiar en el conteo inicial únicamente', is_correct: false, points: 0, keywords: ['solo inicial'], feedback: 'Se cuenta de nuevo antes de cerrar.' },
            { label: 'Registrar el conteo al día siguiente', is_correct: false, points: 0, keywords: ['dia siguiente'], feedback: 'Se documenta en el momento.' }
          ]
        }
      },
      {
        competency: 'Sign Out', device_ref: 'lab',
        patient_say: '(Fin de la cirugía)',
        prompt: 'Antes de que el paciente salga de sala (Sign Out). ¿Qué registra el equipo?',
        ideal_answer: 'Procedimiento realizado, conteo correcto, etiquetado de muestras, problemas de equipo/instrumental y plan de recuperación postoperatoria.',
        key_points: ['procedimiento', 'conteo correcto', 'etiquetar muestras', 'plan postoperatorio'],
        options: {
          principiante: [
            { label: 'Procedimiento, conteo correcto, etiquetado de muestras y plan de recuperación', is_correct: true, points: 20, keywords: ['muestras', 'conteo', 'recuperacion'], feedback: 'Correcto: cierra el ciclo de seguridad.' },
            { label: 'Nada, ya terminó la cirugía', is_correct: false, points: 0, keywords: ['nada'], feedback: 'El cierre seguro es parte del checklist.' },
            { label: 'Solo apagar las luces', is_correct: false, points: 0, keywords: ['luces'], feedback: 'Falta documentar conteo, muestras y plan.' }
          ],
          avanzado: [
            { label: 'Sign Out: confirmar procedimiento, conteos, etiquetado correcto de muestras, incidencias y entrega estructurada a recuperación', is_correct: true, points: 20, keywords: ['entrega estructurada', 'incidencias', 'etiquetado'], feedback: 'Correcto: incluye la entrega (handoff) segura a recuperación.' },
            { label: 'Trasladar sin reporte verbal', is_correct: false, points: 0, keywords: ['sin reporte'], feedback: 'La entrega verbal estructurada reduce errores.' },
            { label: 'Etiquetar muestras horas después', is_correct: false, points: 0, keywords: ['horas despues'], feedback: 'Se etiquetan en el momento, confirmando con enfermería.' }
          ]
        }
      }
    ]
  },

  // ---------------------------------------------------------
  {
    slug: 'pediatria-anafilaxia',
    section: 'Pediatría / Urgencias', room: 'pediatria',
    title: 'Anafilaxia en niño', subtitle: 'Niño 4 años · 18 kg · urticaria y estridor tras comer',
    color: '#b388ff', icon: '🧸',
    guideline: 'Catálogo GPC IMSS (anafilaxia) · guías WAO/EAACI',
    patient: { name: 'Mateo', age: 4, weight: 18, avatar: '🧒', ailment: 'pediatrico' },
    competencies: ['Reconocimiento', 'Tratamiento 1ª línea', 'Dosis por peso', 'Soporte', 'Observación'],
    devices: [
      { kind: 'monitor', label: 'Monitor pediátrico', data: { FC: 148, TA: '85/45', SpO2: 90, FR: 34 } },
      { kind: 'lab', label: 'Báscula / ficha', data: { peso: '18 kg', alergeno: 'cacahuate', inicio: 'hace 10 min' } }
    ],
    steps: [
      {
        competency: 'Reconocimiento', device_ref: 'monitor',
        patient_say: '(Tiene ronchas, labios hinchados y hace un ruido al respirar)',
        prompt: 'Urticaria + edema labial + estridor tras alérgeno, con SpO2 90%. ¿Qué reconoces?',
        ideal_answer: 'Anafilaxia: afectación de dos sistemas (cutáneo y respiratorio) tras exposición a alérgeno, con hipoxemia; es una emergencia.',
        key_points: ['anafilaxia', 'dos sistemas', 'respiratorio', 'alérgeno', 'emergencia'],
        options: {
          principiante: [
            { label: 'Anafilaxia (piel + vía respiratoria) — emergencia', is_correct: true, points: 20, keywords: ['anafilaxia', 'emergencia'], feedback: 'Correcto: dos sistemas afectados tras alérgeno.' },
            { label: 'Resfriado común', is_correct: false, points: 0, keywords: ['resfriado'], feedback: 'No: el estridor y el edema son de anafilaxia.' },
            { label: 'Berrinche', is_correct: false, points: 0, keywords: ['berrinche'], feedback: 'Hay signos físicos objetivos graves.' }
          ],
          avanzado: [
            { label: 'Anafilaxia grave con compromiso de vía aérea (estridor, SpO2 90%) — riesgo de obstrucción', is_correct: true, points: 20, keywords: ['compromiso', 'via aerea', 'obstruccion', 'grave'], feedback: 'Correcto: el estridor y la hipoxemia marcan gravedad.' },
            { label: 'Crisis asmática aislada', is_correct: false, points: 5, keywords: ['asma'], feedback: 'El contexto alérgico y la urticaria apuntan a anafilaxia.' },
            { label: 'Reacción urticarial leve', is_correct: false, points: 0, keywords: ['leve'], feedback: 'No es leve: hay afectación respiratoria.' }
          ]
        }
      },
      {
        competency: 'Tratamiento 1ª línea', device_ref: 'monitor',
        patient_say: '(Cada vez le cuesta más respirar)',
        prompt: '¿Cuál es el tratamiento de PRIMERA línea?',
        ideal_answer: 'Adrenalina intramuscular en la cara anterolateral del muslo, de inmediato.',
        key_points: ['adrenalina', 'intramuscular', 'muslo', 'inmediata'],
        options: {
          principiante: [
            { label: 'Adrenalina intramuscular en el muslo, de inmediato', is_correct: true, points: 20, keywords: ['adrenalina', 'intramuscular', 'muslo'], feedback: 'Correcto: no debe retrasarse.' },
            { label: 'Solo antihistamínico oral', is_correct: false, points: 0, keywords: ['antihistaminico'], feedback: 'No sustituye a la adrenalina.' },
            { label: 'Esperar a ver si mejora solo', is_correct: false, points: 0, keywords: ['esperar'], feedback: 'Puede progresar a paro en minutos.' }
          ],
          avanzado: [
            { label: 'Adrenalina IM 1:1000 en muslo sin demora; preparar segunda dosis y vía aérea', is_correct: true, points: 20, keywords: ['1:1000', 'segunda dosis', 'via aerea'], feedback: 'Correcto: IM precoz y anticipar refractariedad.' },
            { label: 'Adrenalina intravenosa en bolo de entrada', is_correct: false, points: 3, keywords: ['intravenosa', 'bolo'], feedback: 'La IV se reserva a refractarios con monitorización; riesgo de arritmia.' },
            { label: 'Corticoide IV como primera medida', is_correct: false, points: 2, keywords: ['corticoide'], feedback: 'Adyuvante, no de primera línea.' }
          ]
        }
      },
      {
        competency: 'Dosis por peso', device_ref: 'lab',
        patient_say: '(La báscula marca 18 kg)',
        prompt: 'El niño pesa 18 kg (ver ficha). ¿Qué dosis de adrenalina IM (1 mg/mL) aplicas?',
        ideal_answer: '0.01 mg/kg = 0.18 mg (0.18 mL) de adrenalina 1 mg/mL, con dosis máxima de 0.3 mg en niños.',
        key_points: ['0.01 mg/kg', '0.18 mg', 'por peso', 'máximo 0.3'],
        options: {
          principiante: [
            { label: '0.01 mg/kg ≈ 0.18 mg (0.18 mL)', is_correct: true, points: 20, keywords: ['0.01', '0.18', 'peso'], feedback: 'Correcto: dosis calculada por kg.' },
            { label: '1 mg fija (dosis de adulto)', is_correct: false, points: 0, keywords: ['1 mg', 'adulto'], feedback: 'Sobredosis peligrosa.' },
            { label: '0.5 mg sin calcular', is_correct: false, points: 0, keywords: ['0.5'], feedback: 'Excede la dosis pediátrica.' }
          ],
          avanzado: [
            { label: '0.01 mg/kg = 0.18 mg IM (máx 0.3 mg), repetible cada 5-15 min si no hay respuesta', is_correct: true, points: 20, keywords: ['0.01', 'maximo', 'repetible', '5-15'], feedback: 'Correcto: dosis por peso, tope y repetición pautada.' },
            { label: '0.18 mg vía subcutánea', is_correct: false, points: 6, keywords: ['subcutanea'], feedback: 'La vía es intramuscular (absorción más rápida y fiable).' },
            { label: '0.3 mg fijos con autoinyector de adulto', is_correct: false, points: 4, keywords: ['autoinyector', 'adulto'], feedback: 'Para 18 kg corresponde el de 0.15 mg pediátrico o cálculo por peso.' }
          ]
        }
      },
      {
        competency: 'Soporte', device_ref: 'monitor',
        patient_say: '(Sigue con dificultad respiratoria)',
        prompt: 'Tras la adrenalina, ¿qué soporte añades?',
        ideal_answer: 'Oxígeno, posición cómoda, líquidos IV si hipotensión, monitorización y repetir adrenalina cada 5-15 min si no mejora.',
        key_points: ['oxígeno', 'líquidos IV', 'monitorización', 'repetir adrenalina'],
        options: {
          principiante: [
            { label: 'Oxígeno, líquidos IV, monitor y repetir adrenalina si no mejora', is_correct: true, points: 20, keywords: ['oxigeno', 'liquidos', 'monitor', 'repetir'], feedback: 'Correcto: soporte ABC y repetir si persiste.' },
            { label: 'Acostarlo boca abajo y dejarlo solo', is_correct: false, points: 0, keywords: ['boca abajo', 'solo'], feedback: 'Requiere vigilancia estrecha.' },
            { label: 'Darle de comer para que recupere fuerzas', is_correct: false, points: 0, keywords: ['comer'], feedback: 'Podría ser el alérgeno; riesgo de broncoaspiración.' }
          ],
          avanzado: [
            { label: 'O2 alto flujo, decúbito con piernas elevadas, bolo de cristaloide 20 mL/kg si hipotensión y adyuvantes (antihistamínico + corticoide)', is_correct: true, points: 20, keywords: ['20 ml/kg', 'piernas elevadas', 'corticoide', 'antihistaminico'], feedback: 'Correcto: reanimación con líquidos por peso y adyuvantes tras la adrenalina.' },
            { label: 'Sentarlo y forzar la deambulación', is_correct: false, points: 0, keywords: ['deambulacion', 'sentarlo'], feedback: 'El cambio brusco a vertical puede causar colapso ("empty ventricle").' },
            { label: 'Salbutamol como único tratamiento del estridor', is_correct: false, points: 5, keywords: ['salbutamol'], feedback: 'Útil para broncoespasmo, pero no sustituye adrenalina ni trata el edema de vía aérea.' }
          ]
        }
      },
      {
        competency: 'Observación', device_ref: 'monitor',
        patient_say: '(El niño empieza a mejorar)',
        prompt: 'Mejora tras el tratamiento. ¿Conducta al alta?',
        ideal_answer: 'Observación 4-6 h (o más si fue grave) por reacción bifásica, receta de autoinyector de adrenalina, plan de acción escrito y referencia a alergología.',
        key_points: ['observación', 'reacción bifásica', 'autoinyector', 'plan de acción', 'alergología'],
        options: {
          principiante: [
            { label: 'Observar 4-6 h por reacción bifásica + autoinyector y plan', is_correct: true, points: 20, keywords: ['observacion', 'bifasica', 'autoinyector', 'plan'], feedback: 'Correcto: puede recaer horas después.' },
            { label: 'Alta inmediata, ya está bien', is_correct: false, points: 0, keywords: ['alta inmediata'], feedback: 'Riesgo de reacción bifásica.' },
            { label: 'Suspender toda vigilancia', is_correct: false, points: 0, keywords: ['suspender'], feedback: 'Hay que vigilar y educar a la familia.' }
          ],
          avanzado: [
            { label: 'Observación prolongada (grave), prescripción y entrenamiento del autoinyector, plan escrito y envío a alergología', is_correct: true, points: 20, keywords: ['prolongada', 'entrenamiento', 'alergologia', 'plan escrito'], feedback: 'Correcto: educación + seguimiento especializado.' },
            { label: 'Alta a las 1 h si los signos son normales', is_correct: false, points: 4, keywords: ['1 hora'], feedback: 'Insuficiente tras una anafilaxia grave.' },
            { label: 'Corticoide oral 3 días como única indicación', is_correct: false, points: 3, keywords: ['corticoide oral'], feedback: 'No previene de forma fiable la fase bifásica ni sustituye el autoinyector.' }
          ]
        }
      }
    ]
  }
];
