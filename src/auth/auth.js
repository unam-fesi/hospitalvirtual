import { supabase } from '../lib/supabase.js';

let _profile = null;

export async function signUp({ email, password, fullName, role }) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, role } }
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  _profile = null;
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Devuelve el perfil (incluye role). Si por RLS o latencia falla, cae a metadata del usuario.
export async function getProfile(force = false) {
  if (_profile && !force) return _profile;
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', u.user.id).maybeSingle();
  _profile = data || {
    id: u.user.id,
    full_name: u.user.user_metadata?.full_name || '',
    role: u.user.user_metadata?.role || 'principiante'
  };
  return _profile;
}

export function onAuthChange(cb) {
  return supabase.auth.onAuthStateChange((_event, session) => { _profile = null; cb(session); });
}
