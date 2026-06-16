-- ============================================================
-- HOSPITAL VIRTUAL UNAM — esquema inicial (aplicado al proyecto gnkjamiydryhrxzloxfd)
-- Copia versionada de la migración para el repositorio.
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'principiante'
    check (role in ('principiante','avanzado','egresado','docente','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''),
          coalesce(new.raw_user_meta_data->>'role','principiante'));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.current_role_is(roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = any(roles));
$$;

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  section text not null, title text not null, subtitle text,
  color text default '#37c2ff', icon text default '🏥',
  guideline text, room text default 'urgencias',
  patient jsonb default '{}'::jsonb,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.case_steps (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  step_order int not null, competency text not null,
  patient_say text, prompt text not null, ideal_answer text,
  key_points jsonb default '[]'::jsonb, device_ref text,
  created_at timestamptz not null default now(),
  unique (case_id, step_order)
);

create table if not exists public.step_options (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.case_steps(id) on delete cascade,
  difficulty text not null default 'principiante'
    check (difficulty in ('principiante','avanzado')),
  label text not null, is_correct boolean not null default false,
  points int not null default 0, keywords jsonb default '[]'::jsonb, feedback text
);

create table if not exists public.case_devices (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  kind text not null, label text not null, data jsonb not null default '{}'::jsonb
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  role text, score int default 0, max_score int default 0, percent numeric default 0,
  summary jsonb default '{}'::jsonb,
  started_at timestamptz not null default now(), finished_at timestamptz
);

create table if not exists public.attempt_steps (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  step_id uuid references public.case_steps(id) on delete set null,
  user_answer text, chosen_option_id uuid references public.step_options(id) on delete set null,
  ai_score int, ai_verdict text, ai_feedback text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_steps enable row level security;
alter table public.step_options enable row level security;
alter table public.case_devices enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_steps enable row level security;

create policy "perfil propio select" on public.profiles for select using (id = auth.uid());
create policy "perfil propio update" on public.profiles for update using (id = auth.uid());
create policy "perfil propio insert" on public.profiles for insert with check (id = auth.uid());

create policy "casos leer" on public.cases for select using (
  is_published or created_by = auth.uid() or public.current_role_is(array['docente','admin']));
create policy "casos crear" on public.cases for insert with check (created_by = auth.uid());
create policy "casos actualizar" on public.cases for update using (created_by = auth.uid() or public.current_role_is(array['docente','admin']));
create policy "casos borrar" on public.cases for delete using (created_by = auth.uid() or public.current_role_is(array['docente','admin']));

create policy "pasos leer" on public.case_steps for select using (
  exists (select 1 from public.cases c where c.id = case_id
          and (c.is_published or c.created_by = auth.uid() or public.current_role_is(array['docente','admin']))));
create policy "pasos gestionar" on public.case_steps for all using (
  exists (select 1 from public.cases c where c.id = case_id and (c.created_by = auth.uid() or public.current_role_is(array['docente','admin']))))
  with check (exists (select 1 from public.cases c where c.id = case_id and (c.created_by = auth.uid() or public.current_role_is(array['docente','admin']))));

create policy "opciones leer" on public.step_options for select using (
  exists (select 1 from public.case_steps s join public.cases c on c.id = s.case_id where s.id = step_id
          and (c.is_published or c.created_by = auth.uid() or public.current_role_is(array['docente','admin']))));
create policy "opciones gestionar" on public.step_options for all using (
  exists (select 1 from public.case_steps s join public.cases c on c.id = s.case_id where s.id = step_id and (c.created_by = auth.uid() or public.current_role_is(array['docente','admin']))))
  with check (exists (select 1 from public.case_steps s join public.cases c on c.id = s.case_id where s.id = step_id and (c.created_by = auth.uid() or public.current_role_is(array['docente','admin']))));

create policy "devices leer" on public.case_devices for select using (
  exists (select 1 from public.cases c where c.id = case_id
          and (c.is_published or c.created_by = auth.uid() or public.current_role_is(array['docente','admin']))));
create policy "devices gestionar" on public.case_devices for all using (
  exists (select 1 from public.cases c where c.id = case_id and (c.created_by = auth.uid() or public.current_role_is(array['docente','admin']))))
  with check (exists (select 1 from public.cases c where c.id = case_id and (c.created_by = auth.uid() or public.current_role_is(array['docente','admin']))));

create policy "intentos propios" on public.attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "intento pasos propios" on public.attempt_steps for all
  using (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()));
