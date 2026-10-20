# Ersatzlösung: Supabase statt öffentlichem PeerJS-Server

Stand heute laufen Online-Tische (Poker, Blackjack) und Freunde ohne eigenen Server:

- **Vermittlung:** öffentlicher, kostenloser PeerJS-Server `0.peerjs.com` (Tischcode bzw. Spielercode als Kennung)
- **Adresse finden:** Google-STUN `stun.l.google.com:19302`
- **Spieldaten:** direkt von Handy zu Handy (WebRTC), der Ersteller rechnet das Spiel
- **Gespeichert:** nur im Browser (Chips, Statistik, Spielercode `pr-pcode`, Freunde `pr-friends`)

Diese Datei ist die sofort einsetzbare zweite Lösung, falls das Probleme macht.

## Wann umsteigen

Typische Anzeichen (Meldungen aus der App oder vom Nutzer):

- „Keine Verbindung zum Vermittlungsserver“ / Tisch lässt sich nicht erstellen, obwohl Internet da ist
- „Verbindung zum Tisch fehlgeschlagen“ / Beitreten klappt nur in manchen Netzen (oft Mobilfunk)
- Freunde werden nie als online angezeigt, obwohl beide die App offen haben
- Verbindungen brechen während des Spiels häufig ab
- Wunsch nach Konto, Chips auf mehreren Geräten, Einladungen an Freunde, die gerade offline sind

## Stufe 1: nur die Vermittlung ersetzen (schnell, ohne Datenbank)

Supabase **Realtime** übernimmt alles, was heute über PeerJS läuft. Die Spiellogik bleibt gleich
(Ersteller rechnet, schickt Spielstände an alle), nur der Transport ändert sich. Damit fallen auch die
WebRTC-Probleme in strengen Netzen weg, weil alles über eine normale Websocket-Verbindung läuft.

### Was der Nutzer tun muss (ca. 5 Minuten)

1. Auf https://supabase.com mit GitHub anmelden, **New project** anlegen
   (Name z. B. `pokerrunde`, Region **Frankfurt (eu-central-1)**, Datenbank-Passwort beliebig, Free-Plan reicht).
2. Warten, bis das Projekt bereit ist, dann **Project Settings → API** öffnen.
3. Zwei Werte kopieren und in den Chat schicken:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public** Key (der lange Schlüssel unter „Project API keys“, *nicht* der `service_role`-Key)
4. Fertig. Der anon-Key darf öffentlich in der Seite stehen (dafür ist er gedacht).

### Was Claude dann umbaut

- Supabase-Bibliothek fest eingebunden laden, z. B. `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js`
  (oder als Datei ins Repo legen wie `peerjs.min.js`, dann in `sw.js` zu `FILES` hinzufügen).
- Eine kleine Transportschicht mit derselben Form wie heute (`send`, `on('data')`, `on('close')`), damit
  Poker-, Blackjack- und Freunde-Code fast unverändert bleiben:
  - **Tisch:** Kanal `pr-poker-<CODE>` bzw. `pr-bj-<CODE>`. Mitspieler senden per `broadcast` an den Ersteller
    (`{ to: 'host', from: <id>, ... }`), der Ersteller sendet Spielstände (`{ to: <id> | 'all', ... }`).
    Wer da ist, zeigt **Presence** auf dem Kanal (ersetzt `connection`/`close`).
    Tisch „belegt“ prüfen: vor dem Eröffnen kurz dem Kanal beitreten und schauen, ob ein Ersteller in Presence ist.
  - **Freunde:** jeder abonniert Kanal `pr-u-<SPIELERCODE>` (eigener Posteingang) und meldet sich per Presence an.
    Online-Status: Presence auf den Kanälen der Freunde (oder ein gemeinsamer Kanal `pr-online` mit
    Spielercode + Status als Presence-Daten, gefiltert auf die eigene Freundesliste).
    Einladungen / Hinzufügen / Entfernen: `broadcast` in den Posteingang des Freundes.
- PeerJS als Rückfall behalten: wenn Supabase nicht erreichbar ist, wie bisher über PeerJS.
- Free-Plan-Grenzen (200 gleichzeitige Verbindungen, 2 Mio. Nachrichten im Monat) reichen für eine Freundesrunde locker.

## Stufe 2: Konten und Daten in der Datenbank (größerer Umbau, nur wenn gewünscht)

Bringt: Chips, Statistik, Spielercode und Freunde auf jedem Gerät gleich, Freundschaftsanfragen und
Einladungen auch an Offline-Freunde, Chips nicht mehr selbst gemeldet.

Zusätzlich vom Nutzer:

1. **Authentication → Providers:** „Anonymous sign-ins“ einschalten (Konto ohne E-Mail, später verknüpfbar),
   optional E-Mail (Magic Link), damit man sich auf einem zweiten Gerät anmelden kann.
2. **Authentication → URL Configuration:** Site URL `https://kortjannis-web.github.io/Pokerrunde/` eintragen.
3. Im **SQL Editor** das SQL ausführen, das Claude liefert (Tabellen mit Row Level Security), z. B.:
   - `profiles` (id = auth.uid, name, color, player_code unique, bank, hands, wins)
   - `friendships` (a, b, status `pending`/`accepted`), Lesen/Schreiben nur für die beiden Beteiligten
   - `invites` (from, to, game, table_code, created_at), Lesen nur für den Empfänger
   - Chips später serverseitig über eine Postgres-Funktion buchen, damit niemand sie hochsetzen kann

Beim Umstieg den bestehenden Spielercode (`pr-pcode`) und die Freundesliste (`pr-friends`) aus dem
Browser ins Konto übernehmen, damit niemand neu anfangen muss.

## Kleinere Alternative

Wenn nur in einzelnen Netzen keine direkte Verbindung zustande kommt (Vermittlung selbst funktioniert),
reicht auch ein TURN-Weiterleitungsserver in `iceServers` (über `window.PR_PEER_OPTS.config`), z. B. ein
kostenloser Zugang bei Metered oder Cloudflare Calls. Supabase Stufe 1 löst das Problem aber mit.
