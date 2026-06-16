// Configuración pública. La llave publishable es segura de exponer (RLS protege los datos).
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://gnkjamiydryhrxzloxfd.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_od2ygh1B8bGbS1yfsAHkDQ_KzpuJvJ0';

// Roles y cómo se comportan en la simulación
export const ROLES = {
  principiante: { label: 'Estudiante (primeros semestres)', ui: 'opciones', difficulty: 'principiante' },
  avanzado:     { label: 'Estudiante (últimos semestres)',  ui: 'opciones', difficulty: 'avanzado' },
  egresado:     { label: 'Egresado / Internado',            ui: 'abierta',  difficulty: 'avanzado' },
  docente:      { label: 'Docente',                         ui: 'opciones', difficulty: 'avanzado' },
  admin:        { label: 'Administrador',                   ui: 'opciones', difficulty: 'avanzado' }
};
