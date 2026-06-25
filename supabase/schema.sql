-- ════════════════════════════════════════════════════════════════
-- OltreAge — Schema Supabase (Postgres + RLS + Storage)
-- Esegui questo file nel SQL Editor del progetto Supabase.
-- Mappa 1:1 i tipi di lib/store.ts.
-- ════════════════════════════════════════════════════════════════

-- ── Estensioni ──────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Reset (idempotente) ─────────────────────────────────────────
-- Rimuove SOLO le tabelle di OltreAge, così rilanciare lo script è sicuro
-- e sovrascrive eventuali tabelle "profiles" di un template preesistente.
drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.documents        cascade;
drop table if exists public.banca_iscrizioni cascade;
drop table if exists public.banca_items      cascade;
drop table if exists public.profiles         cascade;
drop table if exists public.apartments       cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin()        cascade;

-- ── Tabelle ─────────────────────────────────────────────────────

create table if not exists public.apartments (
  id        uuid primary key default gen_random_uuid(),
  numero    text not null,
  fascia    text not null check (fascia in ('minima','avanzata','totale')),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  role         text not null default 'residente'
               check (role in ('admin','residente','collaboratore','personale')),
  nome         text not null default '',
  cognome      text not null default '',
  data_nascita date,
  telefono     text,
  indirizzo    text,
  note         text,
  foto_url     text,
  apartment_id uuid references public.apartments(id) on delete set null,
  crediti      int not null default 0,
  interessi    text[] not null default '{}',
  offre        text[] not null default '{}',
  cerca        text[] not null default '{}',
  lingue       text[] not null default '{}',
  disponibilita text[] not null default '{}',
  tratti       jsonb,
  created_at   timestamptz not null default now()
);

create table if not exists public.banca_items (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null check (tipo in ('attivita','evento','news')),
  titolo      text not null,
  descrizione text,
  data        date not null default current_date,
  crediti     int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.banca_iscrizioni (
  item_id uuid references public.banca_items(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (item_id, user_id)
);

create table if not exists public.documents (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  tipo       text not null,
  nome       text not null,
  path       text not null,          -- path nel bucket "documents"
  created_at timestamptz not null default now()
);

-- ── Helper: l'utente corrente è admin? ──────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- staff = admin o personale (SECURITY DEFINER: evita ricorsione RLS su profiles)
create or replace function public.is_staff()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','personale')
  );
$$;

-- ── Trigger: crea profilo alla registrazione ────────────────────
-- Il PRIMO utente registrato diventa automaticamente admin.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  has_admin boolean;
begin
  select exists(select 1 from public.profiles where role = 'admin') into has_admin;
  insert into public.profiles (id, email, role, nome, cognome)
  values (
    new.id,
    new.email,
    case when has_admin then coalesce(new.raw_user_meta_data->>'role','residente') else 'admin' end,
    coalesce(new.raw_user_meta_data->>'nome',''),
    coalesce(new.raw_user_meta_data->>'cognome','')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ──────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.apartments       enable row level security;
alter table public.banca_items      enable row level security;
alter table public.banca_iscrizioni enable row level security;
alter table public.documents        enable row level security;

-- profiles: admin vede/gestisce tutti; ognuno vede/aggiorna sé stesso
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (is_staff() or id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (is_admin() or id = auth.uid());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert
  with check (is_admin() or id = auth.uid());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles for delete using (is_admin());

-- apartments: lettura a tutti gli autenticati; scrittura solo admin
drop policy if exists apt_select on public.apartments;
create policy apt_select on public.apartments for select using (auth.role() = 'authenticated');
drop policy if exists apt_write on public.apartments;
create policy apt_write on public.apartments for all using (is_admin()) with check (is_admin());

-- banca_items: lettura a tutti; scrittura solo admin
drop policy if exists banca_select on public.banca_items;
create policy banca_select on public.banca_items for select using (auth.role() = 'authenticated');
drop policy if exists banca_write on public.banca_items;
create policy banca_write on public.banca_items for all using (is_admin()) with check (is_admin());

-- iscrizioni: ognuno gestisce le proprie; admin tutte
drop policy if exists isc_select on public.banca_iscrizioni;
create policy isc_select on public.banca_iscrizioni for select using (auth.role() = 'authenticated');
drop policy if exists isc_write on public.banca_iscrizioni;
create policy isc_write on public.banca_iscrizioni for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- documents: il proprietario e l'admin
drop policy if exists doc_select on public.documents;
create policy doc_select on public.documents for select using (user_id = auth.uid() or is_admin());
drop policy if exists doc_write on public.documents;
create policy doc_write on public.documents for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- ── Seed: 12 appartamenti (4 per fascia) ────────────────────────
insert into public.apartments (numero, fascia)
select 'A' || lpad(g::text, 2, '0'),
       case when g <= 4 then 'minima' when g <= 8 then 'avanzata' else 'totale' end
from generate_series(1,12) g
where not exists (select 1 from public.apartments);

-- ── Storage buckets ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('avatars','avatars', true)   on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('documents','documents', false) on conflict (id) do nothing;

-- avatars: lettura pubblica, scrittura autenticati
drop policy if exists avatars_read on storage.objects;
create policy avatars_read on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists avatars_write on storage.objects;
create policy avatars_write on storage.objects for all
  using (bucket_id = 'avatars' and auth.role() = 'authenticated')
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- documents: solo autenticati (RLS fine-grained gestita lato app/route)
drop policy if exists documents_rw on storage.objects;
create policy documents_rw on storage.objects for all
  using (bucket_id = 'documents' and auth.role() = 'authenticated')
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');
