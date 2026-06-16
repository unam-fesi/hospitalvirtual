# 🏥 Hospital Virtual UNAM — Simulación clínica 3D

MVP de simulación clínica para las carreras de la salud de la UNAM. El alumno **recorre un
hospital 3D (estilo bloques/voxel, personajes estilizados propios) en primera persona**,
entra a una sala, atiende un **caso clínico real
basado en las Guías de Práctica Clínica (GPC) del IMSS**, y nuestra **IA propia (PUM-AI)** evalúa,
corrige y complementa su desempeño. Soporta **voz** (el paciente habla y el alumno responde)
y **roles de usuario** que cambian la dificultad.

> Complementa la app de expediente electrónico existente (telemedicina, IA educativa,
> aprendizaje interprofesional) aportando la pieza de **simulación**.

---

## ✨ Funcionalidades

- **Recorrido 3D (walkthrough)** en primera persona por un edificio de hospital (lobby,
  pasillo y salas cerradas con puertas), con sala de espera, pacientes sentados y
  **doctores/enfermeras caminando** aleatoriamente.
- **5 salas con 5 casos** (GPC IMSS): Urgencias (acuchillado), Reanimación (paro/RCP),
  Consulta (dolor torácico/IAMCEST), Quirófano (cirugía segura OMS) y Pediatría (anafilaxia).
- **Personajes estilizados según su dolencia** (sangrado, palidez del paro, mano al pecho,
  bata quirúrgica, ronchas pediátricas).
- **Aparatos de medición 3D** (monitor de signos vitales, ECG, eco/FAST, báscula,
  expediente) cuyos **valores se consideran** en el diagnóstico/triage.
- **Roles**: primeros semestres (opciones sencillas) · últimos semestres (opciones técnicas) ·
  **egresado/internado (respuesta abierta evaluada semánticamente por PUM-AI)**.
- **Respuestas barajadas** (posición aleatoria) y **evaluación por voz** interpretada con IA.
- **Editor de casos** con **sugerencia por IA** desde la GPC del IMSS, y persistencia en Supabase.
- **Reporte por competencias** con retroalimentación de la IA.

---

## 🧱 Arquitectura

```
Frontend (Vite + Three.js, JS modular)
  src/scene/    -> mundo 3D: lego, minifiguras, multitud, aparatos, hospital, controles
  src/cases/    -> motor de casos, registro (Supabase/semilla), 5 casos GPC IMSS
  src/ui/       -> login, HUD, panel de caso, reporte, editor
  src/lib/      -> cliente Supabase, llamadas a IA, voz (Web Speech)
  src/auth/     -> autenticación y roles

Backend (Supabase)
  Postgres + RLS  -> profiles/roles, cases, case_steps, step_options, case_devices, attempts
  Edge Functions  -> evaluate-response · interpret-voice · suggest-case  (todas llaman a PUM-AI,
                      con *fallback mock* si no hay API key)
```

**Proyecto Supabase ya creado:** `hospital-virtual`
- URL: `https://gnkjamiydryhrxzloxfd.supabase.co`
- Ref: `gnkjamiydryhrxzloxfd`
- La llave *publishable* (pública) ya está en `src/config.js` y en `.env.example`.

---

## 🚀 Cómo correr

```bash
npm install
npm run dev          # abre http://localhost:5173
```

Para producción: `npm run build` y publica la carpeta `dist/` (Vercel, Netlify, GitHub Pages…).

---

## 🔑 Conectar PUM-AI (evaluación real con IA)

PUM-AI es la IA propia del proyecto (en desarrollo). Las Edge Functions ya están desplegadas y
funcionan en **modo mock** sin credenciales. Para activar la evaluación semántica real se
configuran estos secrets en Supabase (una sola vez, por dashboard o CLI):

- `PUMAI_API_KEY` — llave del servicio de IA.
- `PUMAI_MODEL` — identificador del modelo a usar.
- `PUMAI_ENDPOINT` *(opcional)* — URL base del servicio si PUM-AI corre en infraestructura propia.

**Opción dashboard:** Supabase → proyecto `hospital-virtual` → *Edge Functions* → *Secrets* →
agrega `PUMAI_API_KEY` y `PUMAI_MODEL`.

**Opción CLI:**
```bash
supabase secrets set PUMAI_API_KEY=tu_llave PUMAI_MODEL=tu_modelo --project-ref gnkjamiydryhrxzloxfd
```

Mientras no estén configurados, las funciones responden con el evaluador mock (coincidencia de
puntos clave). Con las credenciales reales, evalúa PUM-AI.

---

## 👤 Autenticación (para que el modo demo funcione)

El botón **“Entrar al hospital (demo)”** usa *acceso anónimo* de Supabase. Activa **una** de estas
opciones en el dashboard (Authentication → Sign In / Providers):

- **Anonymous sign-ins = ON**  → el modo demo funciona sin correo (recomendado para presentar). ó
- **Confirm email = OFF**      → permite registrarse e ingresar al instante con correo.

El rol elegido en la pantalla de acceso se guarda en el perfil del usuario.

---

## 🗃️ Poblar la base con los 5 casos

Los casos funcionan de inmediato desde la semilla local (`src/cases/seed.js`). Para guardarlos
en la base (y que el editor/IA trabajen sobre ellos): inicia sesión como **docente/admin** y usa
el botón **“⇪ Publicar casos”** del HUD, o el botón equivalente dentro del **Editor**.

> Para tener rol docente/admin: en Supabase → Table editor → `profiles`, cambia tu `role`.

---

## 📕 Guías de Práctica Clínica de referencia (IMSS)

| Caso | Sala | GPC IMSS |
|------|------|----------|
| Herida por arma blanca / choque | Urgencias | **IMSS-162-09** (choque hipovolémico) · ATLS |
| Paro cardiorrespiratorio / RCP | Reanimación | **IMSS-633-13** (RCP en adultos) |
| Dolor torácico / IAMCEST | Consulta | **IMSS-357** (IAM con elevación del ST) |
| Seguridad quirúrgica | Quirófano | **Lista de Verificación Cirugía Segura IMSS-OMS** (2660-003-063) |
| Anafilaxia pediátrica | Pediatría | Catálogo GPC IMSS (anafilaxia) · WAO/EAACI |

> El contenido es educativo y debe revisarse por un comité académico antes de uso formal.

---

## 🎮 Controles

- **Click** en la pantalla para mirar (pointer lock).
- **WASD / flechas** para caminar.
- Acércate a un paciente y presiona **E** para iniciar el caso.
- En el caso: responde con **botones** o con **🎤 voz**. Los egresados escriben/dictan y la **IA evalúa**.

---

## 📦 Subir a GitHub

```bash
cd "hospital-virtual"
git init && git add . && git commit -m "MVP Hospital Virtual UNAM"
git branch -M main
git remote add origin git@github.com:TU_USUARIO/hospital-virtual.git
git push -u origin main
```

`.env` está en `.gitignore`. La llave publishable es pública por diseño; las llaves
**secretas** (service_role, PUM-AI) **nunca** van al repo.

---

Hecho para el Centro Universitario de Salud Digital y Hospital Virtual de la UNAM.
