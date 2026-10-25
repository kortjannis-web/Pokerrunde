-- Pokerrunde: Datenbank fuer Konten, Hall, Freunde und Einladungen.
-- Einmal im Supabase SQL Editor ausfuehren (komplett kopieren, Run). Zweimal ausfuehren schadet nicht.
-- Anmeldung: Name + Passwort. Die App bildet aus dem Namen eine nie benutzte Mail-Adresse und schickt nur einen
-- Hash des Passworts (siehe window.PRSB in index.html). In Supabase muss "Confirm email" aus sein.
--
-- profiles     oeffentliches Profil jedes Spielers (Hall): Name, Spielercode, Farbe, Chips, Sterne, Aussehen
-- saves        privater Spielstand (alle pr-* Werte aus dem Browser), nur fuer den Besitzer
-- friendships  Freundschaften a -> b (a hat gefragt), 'pending' oder 'accepted'; schreiben nur ueber Funktionen
-- invites      Einladungen an den eigenen Tisch (nur an Freunde), werden nach einem Tag geloescht
-- Online-Status laeuft nicht ueber die Datenbank, sondern ueber Realtime Presence (Kanal 'hall').

-- ---------- Profile ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 14),
  name_key text generated always as (lower(btrim(name))) stored,
  code text not null check (code ~ '^[A-Z2-9]{6}$'),
  color text not null default '#b5543f' check (color ~ '^#[0-9a-fA-F]{6}$'),
  bank bigint not null default 0 check (bank >= 0),
  stars integer not null default 0 check (stars >= 0),
  cos jsonb not null default '{}'::jsonb check (octet_length(cos::text) < 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  seen_at timestamptz not null default now()
);
create unique index if not exists profiles_name_key on public.profiles (name_key);
create unique index if not exists profiles_code_key on public.profiles (code);
create index if not exists profiles_seen on public.profiles (seen_at desc);

alter table public.profiles enable row level security;
drop policy if exists "profiles lesen" on public.profiles;
create policy "profiles lesen" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles eigenes aendern" on public.profiles;
create policy "profiles eigenes aendern" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- Name und Spielercode aendert nur die Datenbank (Name = Anmeldung), alles andere der Spieler selbst
revoke insert, update, delete on public.profiles from anon, authenticated;
revoke select on public.profiles from anon;
grant select on public.profiles to authenticated;
grant update (color, bank, stars, cos, updated_at, seen_at) on public.profiles to authenticated;

-- freier Spielercode (6 Zeichen ohne 0, O, 1, I, L)
create or replace function public.pr_new_code() returns text
language plpgsql volatile set search_path = public as $$
declare
  abc constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(abc, 1 + floor(random() * length(abc))::int, 1); end loop;
    exit when not exists (select 1 from public.profiles where code = c);
  end loop;
  return c;
end $$;
revoke execute on function public.pr_new_code() from public, anon, authenticated;

-- neues Konto: Profil anlegen (Name, Spielercode und Farbe kommen aus den Metadaten der Registrierung).
-- Ist der Name vergeben, schlaegt die Registrierung fehl (eindeutiger Index), die App prueft vorher mit name_free.
create or replace function public.pr_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  n text := left(btrim(coalesce(m ->> 'name', '')), 14);
  c text := upper(coalesce(m ->> 'code', ''));
  col text := coalesce(m ->> 'color', '');
begin
  if char_length(n) < 2 then n := 'Spieler' || upper(substr(replace(new.id::text, '-', ''), 1, 6)); end if;
  if c !~ '^[A-Z2-9]{6}$' or exists (select 1 from public.profiles where code = c) then c := public.pr_new_code(); end if;
  if col !~ '^#[0-9a-fA-F]{6}$' then col := '#b5543f'; end if;
  insert into public.profiles (id, name, code, color) values (new.id, n, c, col);
  return new;
end $$;
revoke execute on function public.pr_new_user() from public, anon, authenticated;
drop trigger if exists pr_on_new_user on auth.users;
create trigger pr_on_new_user after insert on auth.users for each row execute function public.pr_new_user();

-- ist ein Name noch frei? (vor der Registrierung, auch ohne Anmeldung)
create or replace function public.name_free(n text) returns boolean
language sql stable security definer set search_path = public as $$
  select char_length(btrim(coalesce(n, ''))) between 2 and 14
     and not exists (select 1 from public.profiles where name_key = lower(btrim(n)));
$$;
revoke execute on function public.name_free(text) from public;
grant execute on function public.name_free(text) to anon, authenticated;

-- ---------- Spielstand (privat) ----------
create table if not exists public.saves (
  id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (octet_length(data::text) < 500000),
  updated_at timestamptz not null default now()
);
alter table public.saves enable row level security;
drop policy if exists "saves eigene lesen" on public.saves;
create policy "saves eigene lesen" on public.saves for select to authenticated using (id = (select auth.uid()));
drop policy if exists "saves eigene anlegen" on public.saves;
create policy "saves eigene anlegen" on public.saves for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "saves eigene aendern" on public.saves;
create policy "saves eigene aendern" on public.saves for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke all on public.saves from anon;
grant select, insert, update on public.saves to authenticated;

-- ---------- Freundschaften ----------
create table if not exists public.friendships (
  a uuid not null references public.profiles (id) on delete cascade,   -- hat gefragt
  b uuid not null references public.profiles (id) on delete cascade,   -- wurde gefragt
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (a, b),
  check (a <> b)
);
create index if not exists friendships_b on public.friendships (b);
alter table public.friendships enable row level security;
drop policy if exists "friendships eigene lesen" on public.friendships;
create policy "friendships eigene lesen" on public.friendships for select to authenticated
  using (a = (select auth.uid()) or b = (select auth.uid()));
revoke all on public.friendships from anon;
revoke insert, update, delete on public.friendships from authenticated;
grant select on public.friendships to authenticated;

-- anfragen (hat der andere schon gefragt, sind beide sofort befreundet). Ergebnis: 'pending' oder 'accepted'
create or replace function public.befriend(other uuid) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null or other is null or other = me then raise exception 'ungueltig'; end if;
  if not exists (select 1 from public.profiles where id = other) then raise exception 'unbekannter Spieler'; end if;
  if (select count(*) from public.friendships where a = me or b = me) >= 100 then raise exception 'zu viele Freunde'; end if;
  if exists (select 1 from public.friendships where a = other and b = me) then
    update public.friendships set status = 'accepted', updated_at = now() where a = other and b = me;
    return 'accepted';
  end if;
  insert into public.friendships (a, b) values (me, other) on conflict (a, b) do nothing;
  return coalesce((select status from public.friendships where a = me and b = other), 'pending');
end $$;

-- Anfrage annehmen (nur der Gefragte)
create or replace function public.accept_friend(other uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update public.friendships set status = 'accepted', updated_at = now() where a = other and b = auth.uid();
  return found;
end $$;

-- Freundschaft beenden oder Anfrage ablehnen/zuruecknehmen (beide Richtungen)
create or replace function public.unfriend(other uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  delete from public.friendships where (a = auth.uid() and b = other) or (a = other and b = auth.uid());
  return found;
end $$;
revoke execute on function public.befriend(uuid), public.accept_friend(uuid), public.unfriend(uuid) from public, anon;
grant execute on function public.befriend(uuid), public.accept_friend(uuid), public.unfriend(uuid) to authenticated;

-- ---------- Einladungen ----------
create table if not exists public.invites (
  id bigint generated always as identity primary key,
  from_id uuid not null references public.profiles (id) on delete cascade,
  to_id uuid not null references public.profiles (id) on delete cascade,
  g text not null check (g in ('poker', 'bj', 'rl', 'cr', 'rx')),
  code text not null check (code ~ '^[A-Z2-9]{5}$'),
  created_at timestamptz not null default now()
);
create index if not exists invites_to on public.invites (to_id, created_at desc);
alter table public.invites enable row level security;
drop policy if exists "invites eigene lesen" on public.invites;
create policy "invites eigene lesen" on public.invites for select to authenticated
  using (from_id = (select auth.uid()) or to_id = (select auth.uid()));
drop policy if exists "invites an freunde" on public.invites;
create policy "invites an freunde" on public.invites for insert to authenticated
  with check (from_id = (select auth.uid()) and exists (
    select 1 from public.friendships f where f.status = 'accepted'
      and ((f.a = from_id and f.b = to_id) or (f.a = to_id and f.b = from_id))));
drop policy if exists "invites eigene loeschen" on public.invites;
create policy "invites eigene loeschen" on public.invites for delete to authenticated
  using (from_id = (select auth.uid()) or to_id = (select auth.uid()));
revoke all on public.invites from anon;
revoke update on public.invites from authenticated;
grant select, insert, delete on public.invites to authenticated;

-- ---------- Echtzeit: neue Spieler, Freundschaften, Einladungen live in der App ----------
do $$
declare t text;
begin
  foreach t in array array['profiles', 'friendships', 'invites'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------- Aufraeumen: alte Einladungen taeglich loeschen (pg_cron, falls vorhanden) ----------
do $$ begin
  create extension if not exists pg_cron;
exception when others then raise notice 'pg_cron fehlt, alte Einladungen bleiben liegen (stoert nicht)';
end $$;
do $$ begin
  perform cron.schedule('pr-invites-aufraeumen', '17 4 * * *', $c$ delete from public.invites where created_at < now() - interval '1 day' $c$);
exception when others then raise notice 'pg_cron-Job nicht angelegt';
end $$;
