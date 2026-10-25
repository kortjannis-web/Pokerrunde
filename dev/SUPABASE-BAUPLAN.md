# Supabase-Bauplan (Sitzung 2, Plan-Schritte 6 bis 13)

Supabase wird **blind vorgebaut**: Der Nutzer richtet das Projekt erst später ein. Alles muss mit leeren
Konstanten exakt wie heute laufen (PeerJS + localStorage). Diese Datei legt die gemeinsame Architektur fest,
damit die Helfer der einzelnen Schritte zusammenpassen. Wer etwas baut, ergänzt hier „Stand“ unten.

## Grundregeln

- Konstanten ganz oben in `index.html` (eigenes kleines Skript vor allen anderen):
  `var SUPABASE_URL = '';` und `var SUPABASE_KEY = '';` (Publishable bzw. anon Key, darf öffentlich sein).
  Leer = Supabase komplett aus, kein Netzaufruf, kein Laden von supabase-js, keine sichtbaren Unterschiede
  (außer evtl. „Verbindung: PeerJS“ in den Einstellungen).
- Für Tests: `window.PR_SB_URL` / `window.PR_SB_KEY` (per addInitScript gesetzt) überschreiben die Konstanten.
- supabase-js als feste Version (UMD-Build aus dem npm-Paket `@supabase/supabase-js`, Version mindestens
  zwei Wochen alt) als Datei `supabase.min.js` ins Repo, in `sw.js` unter FILES. Wird nur geladen (dynamisches
  `<script>`), wenn URL und Key gesetzt sind.
- Zentrales Modul `window.PRSB` (eigene IIFE, früh im Dokument, nach PRBus):
  - `PRSB.on()` → true, wenn konfiguriert; `PRSB.ready(fn)` → fn(client) sobald Client da und angemeldet
    (nie, wenn aus oder nicht erreichbar); `PRSB.client()`; `PRSB.user()`; `PRSB.state()` →
    'aus' | 'verbinde' | 'ok' | 'notbetrieb'; `PRSB.onState(fn)`.
  - Erreichbarkeit: Ist Supabase nach ca. 8 s nicht erreichbar oder wirft Fehler, Zustand 'notbetrieb' und
    alles läuft still über PeerJS/localStorage weiter. Keine Fehlermeldungen in der Konsole fluten
    (Wiederholversuche mit wachsendem Abstand, z. B. 30 s, 60 s, 5 min).
  - Alle Aufrufe in try/catch, alle Promises mit catch. Kein Feature darf hängen, weil Supabase fehlt.
- Anzeige im Profil unter „Einstellungen“: „Verbindung: Supabase“ / „PeerJS (Rückfall)“ / bei 'notbetrieb'
  „Server gerade nicht erreichbar, du spielst im Notbetrieb“.

## Transport (Schritt 6)

Alle Spiele nutzen `new window.Peer(id, opts)`, `peer.connect(id)`, `conn.send/on('data'|'open'|'close')`.
Deshalb kein Umbau der Spiele, sondern ein **PeerJS-kompatibler Ersatz**:

- Original merken: `window.PeerJSOrig = window.Peer`. Ist Supabase an, wird `window.Peer` durch einen
  Hybrid ersetzt (gleiche Schnittstelle: Ereignisse open/connection/error/disconnected/close, `id`,
  `connect`, `destroy`, `disconnect`, `reconnect`, `destroyed`, `disconnected`; DataConnection mit `peer`,
  `open`, `send`, `close`, Ereignisse open/data/close/error).
- Realtime-Kanal pro Peer-Id: `pr-<id>` (z. B. `pr-pokerrunde-abc12`). Wer eine feste Id öffnet (Ersteller,
  Freunde-Posteingang), meldet sich per Presence als Besitzer; ist schon ein anderer Besitzer da → Fehler
  `{ type: 'unavailable-id' }` wie bei PeerJS („Tisch belegt“).
- Verbinden: Broadcast-Nachrichten auf dem Kanal des Ziels mit `{ k: 'conn'|'ack'|'data'|'close', from, to, cid, d }`;
  Presence-Leave ersetzt `close` (Netzabbruch, Tab zu). Nachrichten an andere `to` ignorieren.
- Übergang: Ein Ersteller mit fester Id ist **gleichzeitig** über Supabase und PeerJS erreichbar (Hybrid
  öffnet beides, 'open' sobald einer offen ist, 'connection' von beiden). Beitreten probiert zuerst Supabase,
  nach 6 s ohne `ack` PeerJS – die Spielseite merkt davon nichts (dasselbe Conn-Objekt).
- Supabase nicht erreichbar → reines PeerJS wie bisher.
- Sparsam senden: Realtime-Grenzen (Free: Nachrichten/Sekunde pro Projekt, Nachrichtengröße) beachten,
  Nachrichten nicht doppelt senden.
- `PRSB.transport()` → 'supabase' | 'peerjs' für die Anzeige.

## Datenbank (Schritte 7 bis 13)

- Migrationen unter `supabase/migrations/NNN_name.sql`: `001_profile.sql`, `002_friends.sql`, `003_chips.sql`,
  `004_feed.sql`, `005_league.sql`, `006_push.sql` (+ ggf. `007_wartung.sql` für Schritt 13).
- **Idempotent**: `create table if not exists`, `create or replace function`, `drop policy if exists` vor
  `create policy`, `alter table … add column if not exists`, Publication nur hinzufügen, wenn noch nicht drin
  (`do $$ … if not exists (select 1 from pg_publication_tables …)`), Trigger mit `drop trigger if exists`.
- **Row Level Security überall** (`alter table … enable row level security`), Schreiben heikler Dinge nur über
  `security definer`-Funktionen mit `set search_path = public` und Prüfung `auth.uid()`.
  Funktionen für `authenticated` freigeben (`grant execute … to authenticated`), `revoke … from anon`, wo sinnvoll.
- pg_cron: so einschalten, dass es lokal ohne Erweiterung nicht abbricht:
  `do $$ begin create extension if not exists pg_cron; exception when others then raise notice 'pg_cron fehlt'; end $$;`
  Jobs mit `cron.schedule('name', '…', $$ … $$)` (überschreibt gleichnamige Jobs, also idempotent).
- Zeitzone für Tag/Woche: `Europe/Berlin` (`now() at time zone 'Europe/Berlin'`).
- **Testen**: `bash dev/test/sql/run.sh` startet ein lokales PostgreSQL 16 mit Supabase-Attrappe
  (`dev/test/sql/supabase-stub.sql`: Rollen, `auth.uid()`, `auth.users`, Publication, `cron.*`, `net.http_post`)
  und führt alle Migrationen zweimal aus. Eigene Tests als `dev/test/sql/t_NNN_name.sql` anlegen:
  `select test_as('<uuid>'); set role authenticated; …; reset role;` und mit `do $$ … assert …; $$`
  prüfen (RLS: fremde Zeilen unsichtbar, Funktionen mit Grenzen).
- In der App: Supabase-Funktionen sind Zusatz. Der bisherige Weg (localStorage, PeerJS-Freunde, PeerJS-Geschenke)
  bleibt als Rückfall erhalten (CLAUDE.md).

## Push (Schritt 12) – Richtung

- Kein Datenbank-Webhook nötig: Die App ruft nach Einladung/Anfrage/Geschenk `functions.invoke('push', …)` auf;
  die Edge Function prüft den Absender (Token → Nutzer, nur an Freunde) und schickt mit dem Service-Key.
- Tägliche Serien-Erinnerung 19 Uhr Berlin: pg_cron + `net.http_post` an die Function oder GitHub-Action –
  Helfer entscheidet, Hauptsache der Nutzer muss nur wenige, klar beschriebene Schritte tun.
- VAPID: öffentlicher Schlüssel in die App (Konstante, leer = Push aus), privater NIE ins Repo.
- Wenn sich dadurch an `docs/supabase-anleitung.txt` etwas ändert (z. B. Teil 7.3 entfällt, Verify JWT aus),
  Anleitung anpassen und im Bericht ausdrücklich sagen.

## Testen in der App

- Mit leeren Konstanten: `node dev/test/check.js`, `node dev/test/smoke.js`, alles wie vorher.
- Mit erfundener, nicht erreichbarer URL (`window.PR_SB_URL = 'https://nichtda.invalid'`): keine Fehler,
  Rückfall auf PeerJS, Anzeige „Notbetrieb“.
- Mit Ersatz für supabase-js (`dev/test/fakesb.js`, wird in Schritt 6 angelegt und später erweitert):
  zwei Browser über den Ersatz verbinden (wie `dev/test/fakepeer.js`), Tische und Datenbank-Aufrufe prüfen.

## Stand

Gebaut (Oktober 2026), abweichend vom Plan oben ohne anonyme Konten und ohne eigenen Transport:
- `supabase/pokerrunde.sql`: profiles, saves, friendships, invites, name_free, befriend/accept_friend/unfriend, RLS,
  Realtime, Aufräum-Job. Test: `node dev/test/sql/pglite.js` (PGlite, kein installiertes Postgres nötig).
- `index.html`: Konstanten `SUPABASE_URL`/`SUPABASE_KEY` ganz oben, Skript `window.PRSB` vor dem Service-Worker:
  Konto mit Name + Passwort (Adresse aus Namens-Hash, Passwort-Hash), Konto sichern für Bestandsspieler,
  Cloud-Spielstand (alle pr-* Werte), Hall mit Presence, Freundschaften/Einladungen in der Datenbank. Das Freunde-System
  (PRF) hat dafür Haken (`PRF.on`) und `confirm/reqIn/drop/inviteIn`. Spiele laufen weiter über PeerJS.
- Tests: `node dev/test/online-konto.js` (Supabase-Ersatz `dev/test/fakesb.js` + PeerJS-Ersatz, drei Handys).
- Wachhalter: `.github/workflows/supabase-wach.yml`.
- Offen: Transport über Realtime statt PeerJS, Chip-Geschenke, Feed, Liga, Push.
