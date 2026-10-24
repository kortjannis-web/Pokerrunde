# Plan: neue Spielmodi, Fortschritt, Supabase und mehr

Stand: 24.10.2026. Diese Datei sammelt alle besprochenen Ideen als **fertige Prompts**.
So benutzt du sie:

1. Geh die Liste durch und streiche, was du nicht willst (oder schreib dazu, was anders sein soll).
2. Für einen Schritt einfach in den Chat schreiben: **„Mach Schritt 7 aus docs/plan-neue-features.md“**
   (oder den Prompt-Text kopieren und anpassen).
3. Die Reihenfolge unten ist ein Vorschlag. Was einen anderen Schritt braucht, steht jeweils unter „Braucht“.

**Wichtig zu Supabase:** Supabase ist **noch nicht eingebaut**. Bisher steht es nur als Notfallplan in
`docs/online-ersatzloesungen.md`. Die App läuft komplett über PeerJS (Handy zu Handy) und speichert alles nur
im Browser. Für Freundesfeed, Wochenliga, Einladungen an Freunde, die gerade offline sind, Chips auf mehreren
Geräten und Push-Nachrichten **lohnt sich Supabase jetzt**: Ohne Server klappt das alles nur, wenn beide
gleichzeitig die App offen haben.

---

## Übersicht

| Nr. | Schritt | Braucht | Online-Version erhöhen? | Aufwand |
|---|---|---|---|---|
| 1 | Ereignis-Zentrale (unsichtbares Fundament) | – | nein | klein |
| 2 | XP-Balken und Level | 1 | ja, falls Level am Tisch sichtbar | mittel |
| 3 | Tägliche Aufgaben | 1, 2 | nein | mittel |
| 4 | 7-Tage-Serie 2.0 mit Streak-Schutz | 2 | nein | klein |
| 5 | Supabase: Projekt anlegen (**machst du**, ca. 10 Min.) | – | – | – |
| 6 | Supabase: Verbindung für Tische und Freunde | 5 | nein (Übergang beachten) | groß |
| 7 | Supabase: Konto und Speichern in der Cloud | 5 | nein | groß |
| 8 | Supabase: Freunde, Online-Status, Einladungen | 7 | nein | mittel |
| 9 | Supabase: Chips sicher buchen, Geschenke | 7 | nein | mittel |
| 10 | Freundesfeed | 7, 8, 1 | nein | mittel |
| 11 | Wochenliga | 9 | nein | mittel |
| 12 | Push-Benachrichtigungen | 8 | nein | mittel |
| 13 | Supabase: Wartung und Sicherheitsnetz | 5 | nein | klein |
| 14 | Schnellsätze am Tisch | – | **ja** (Poker, BJ, Roulette) | klein |
| 15 | Karten zeigen (Poker) | – | **ja** (Poker) | klein |
| 16 | Auswertung nach der Hand (Standard: aus) | 1 | nein | mittel |
| 17 | Personalisierung 1: Kartenrücken, Tischfilz, Chips | Shop | nein | mittel |
| 18 | Personalisierung 2: Profilrahmen und Titel | 2 | **ja** | mittel |
| 19 | Personalisierung 3: Siegesanimationen und Sounds | – | **ja** | mittel |
| 20 | Personalisierung 4: neue Wurfgegenstände | Tomaten | **ja** | mittel |
| 21 | Personalisierung 5: Profilbild selbst gestalten | – | **ja** | klein |
| 22 | Sit & Go (Poker-Turnier) | 1 | **ja** (Poker) | groß |
| 23 | Spin & Go (Turnier mit Glücksrad) | 22 | **ja** (Poker) | mittel |
| 24 | Video-Poker | 1 | nein (nur allein) | mittel |
| 25 | Rubbellose | Shop | nein | mittel |
| 26 | Crash | 1 | neues Protokoll `CR_V` | groß |
| 27 | Reaktionsduell (online plus anpassbare KI) | 1 | neues Protokoll `RX_V` | mittel |

**Tipp zu „App neu öffnen“:** Bei jedem Schritt mit „Online-Version erhöhen“ müssen alle die App einmal ganz
schließen und neu öffnen. Am besten bündelst du diese Schritte (zum Beispiel 14, 15, 18, 19, 20, 21 zusammen
in einer Woche), dann gibt es die Meldung nur einmal.

**Vorgeschlagene Reihenfolge:**
1 → 2 → 3 → 4 (schnelle Erfolge, alles ohne Server) → 14 + 15 + 16 (Tischgefühl) → 5 bis 9 (Supabase-Fundament)
→ 10 + 11 + 12 + 13 → 17 bis 21 (Personalisierung, zusammen mit einer Versionserhöhung) → 22 bis 27 (neue Spiele).

---

## Gilt für alle Prompts

Jeder Prompt unten beginnt mit „Beachte ‚Gilt für alle‘“. Gemeint ist das hier:

```text
Gilt für alle Schritte:
- Halte dich an CLAUDE.md: sofort committen und nach main pushen (plus Arbeits-Branch), Versionsregeln für
  Online-Nachrichten beachten (Poker hello-Feld v, BJ_V, RL_V; neue Spiele bekommen ein eigenes *_V).
- Alles bleibt in index.html im bestehenden Stil (Kommentare auf Deutsch ohne Umlaute im Code, Texte in der
  Oberfläche auf Deutsch mit Umlauten, keine neuen Frameworks). Neue Bibliotheken nur mit fester Version
  (wie peerjs.min.js als Datei im Repo und in sw.js unter FILES eintragen).
- Handy zuerst: auf 360 bis 430 px Breite testen, Daumen-freundliche Knöpfe, nichts darf über den Rand ragen.
  Mit Playwright (vorinstalliert) Screenshots auf Handybreite machen und selbst prüfen.
- localStorage immer in try/catch, neue Schlüssel mit Präfix pr-, alte Spielstände dürfen nie kaputtgehen.
- Chips: Es ist Spielgeld. Keine echten Käufe, keine Tricks mit künstlichen Beinahe-Gewinnen.
  Gewinnwahrscheinlichkeiten ehrlich per Zufall (crypto.getRandomValues, wo es um Geld geht).
- Neue Ereignisse an die Ereignis-Zentrale (Schritt 1) melden, damit XP, Aufgaben, Feed und Erfolge sie sehen.
- Neue Einstellungen kommen ins Profil unter „Einstellungen“.
- Am Ende kurz auf Deutsch zusammenfassen, was neu ist und was ich testen soll.
```

---

# Teil A: Fortschritt (ohne Server)

## Schritt 1: Ereignis-Zentrale

**Was es ist:** Eine unsichtbare Schaltstelle. Jedes Spiel meldet dort, was passiert („Hand gewonnen“,
„10 Chips gesetzt“). XP, Aufgaben, Feed und Liga hören nur dort zu, statt dass man jedes Spiel einzeln umbaut.
Für dich ändert sich sichtbar nichts. Alles Weitere wird dadurch aber viel einfacher und fehlerfreier.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md.

Baue eine zentrale Ereignis-Schnittstelle in index.html: PR.on(name, fn), PR.off(name, fn), PR.emit(name, daten).
Fehler in einem Zuhörer dürfen das Spiel nie stören (try/catch pro Zuhörer).

Melde aus allen Spielen mindestens diese Ereignisse (nur für den eigenen Spieler, nie für Bots oder Mitspieler):
- 'bet'   { game, amount }  gesetzte Chips. Poker: jeder Chip, den ich in den Pot lege (Blinds, Mitgehen,
          Erhöhen). Blackjack: Einsatz inkl. Verdoppeln, Teilen, Versicherung. Slots: Einsatz pro Dreh.
          Roulette: Summe aller Chips pro Dreh. Pop the Lock: nichts (kostenlos).
- 'win'   { game, amount, net }  ausgezahlter Gewinn und Netto-Ergebnis der Runde
- 'poker:hand' { won, net, pot, handName, showdown, allin, hole, board, online, bigBlind }
- 'bj:round'   { result: 'win'|'lose'|'push'|'bj', net, doubled, split }
- 'slots:spin' { bet, win, mult, extraSpins, jackpot }
- 'rl:spin'    { bet, win, number, straightHit }
- 'lock:round' { level, hits, jackpot }
- 'tomato'     { game }   (Tomate geworfen)
- 'gift'       { amount } (Chips an Freund geschickt)
- 'game:open'  { game }   (Spiel geöffnet)
- 'online:round' { game } (eine Runde mit echten Mitspielern gespielt)

Mit window.PR_DEBUG = true sollen alle Ereignisse in der Konsole erscheinen. Prüfe mit Playwright, dass in
jedem Spiel nach einer Runde die erwarteten Ereignisse kommen. Keine sichtbare Änderung in der App.
```

## Schritt 2: XP-Balken und Level

**Deine Idee:** XP = insgesamt gesetztes Geld. Das finde ich gut, weil es einfach und für jeden verständlich ist.
Zwei Ergänzungen:
- **Obergrenze pro Einsatz** (5.000 XP), sonst springt ein All-in über 1 Mio. Chips gleich 30 Level.
- Pop the Lock ist kostenlos, gibt aber trotzdem ein paar XP. Aufgaben und Serie geben ebenfalls XP.
- **Start-XP aus der bisherigen Statistik:** Niemand fängt bei 0 an. Psychologisch heißt das „Endowed Progress“:
  Wer schon Fortschritt sieht, macht eher weiter.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 1.

Baue XP und Level über alle Spiele:
- XP-Quelle: 1 XP pro gesetztem Chip (Ereignis 'bet'), aber höchstens 5.000 XP aus einem einzelnen 'bet'.
  Pop the Lock: 5 XP pro Treffer, 50 XP pro Runde. Später kommen XP aus Aufgaben und der Serie dazu
  (Funktion PR.addXP(menge, grund) dafür anbieten).
- Level-Kurve: von Level n auf n+1 braucht man round(500 * n^1.5) XP. Höchstes Level 100.
- Start-XP einmalig aus der vorhandenen Statistik schätzen: Pokerhände x 20, Blackjack-Runden x 20,
  Slots-Drehs x 5, Roulette-Drehs x 10, Pop-the-Lock-Runden x 50. Danach normal weiterzählen.
- Belohnung pro Level-Aufstieg: 100 x neues Level Chips. Lege eine Tabelle LEVEL_REWARDS an, in die spätere
  Schritte Freischaltungen (Rahmen, Titel, Kartenrücken) eintragen können.
- Oberfläche: im Hauptmenü unter dem Profil ein schmaler Balken mit „Lv 12“ und Fortschritt; antippen öffnet
  eine Ansicht mit XP bis zum nächsten Level und den nächsten Belohnungen. Nach einer Runde kurz und dezent
  „+120 XP“ am Balken (nicht während einer laufenden Hand einblenden). Level-Aufstieg: kurze, schöne Animation
  mit Sound und Vibration (Einstellung Vibration beachten), dann Chips gutschreiben.
- Im Profil: Level, gesamte XP, gesamt gesetzte Chips.
- Speichern in pr-xp { xp, lv, wagered, claimed }.
- Online: Level als kleines Abzeichen am Platz für die anderen anzeigen (Feld lv im öffentlichen Profil).
  Versionsregel aus CLAUDE.md beachten; wenn das Feld rein optional ist, wie bei rid begründen und die
  Untergrenze beim Ersteller entsprechend setzen.
```

## Schritt 3: Tägliche Aufgaben

**Psychologie:** Kleine, klare Ziele mit Fortschrittsbalken („2 von 5“) ziehen enorm. Sie lenken Spieler auch in
Spiele, die sie sonst nie öffnen. **Alle Freunde bekommen dieselben drei Aufgaben** (aus dem Datum berechnet),
dann kann man sich darüber austauschen („Hast du den Flush schon?“).

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritte 1 und 2.

Baue tägliche Aufgaben:
- Jeden Tag 3 Aufgaben: 1 leicht, 1 mittel, 1 schwer. Auswahl per Zufallsgenerator mit dem Datum
  (Europe/Berlin) als Startwert, damit alle Freunde dieselben haben. Neu um Mitternacht.
- Belohnung: leicht 200 Chips + 300 XP, mittel 500 + 800 XP, schwer 1.500 + 2.000 XP.
  Alle drei geschafft: Bonus-Truhe mit 1.000 Chips (später auch Rubbellos aus Schritt 25).
- Einmal am Tag eine Aufgabe kostenlos neu würfeln.
- Belohnung muss man mit „Abholen“ antippen (Abholen fühlt sich gut an), mit Chip-Sound.
- Aufgaben-Pool (mindestens 25, jede mit Schwierigkeit), z. B.:
  Gewinne 5 Pokerhände · Gewinne eine Hand mit Flush oder besser · Gewinne eine Hand, ohne dass es zum
  Showdown kommt · Gewinne ein All-in · Spiele 20 Runden Blackjack · Hol dir 2 Blackjacks · Gewinne nach dem
  Verdoppeln · Gewinne mit geteilten Karten · Drehe 30 Mal Slots · Erreiche Extra Spins · Gewinne 20x deinen
  Einsatz bei Slots · Triff beim Roulette eine Zahl direkt · Spiele 10 Roulette-Drehs · Gewinne auf Rot oder
  Schwarz 3 Mal in Folge · Schaffe 25 Treffer in Pop the Lock · Spiele 3 Runden Pop the Lock · Wirf 3 Tomaten ·
  Spiele eine Runde mit einem Freund online · Spiele heute 3 verschiedene Spiele · Setze heute insgesamt
  10.000 Chips · Gewinne heute insgesamt 5.000 Chips netto · Spiele 15 Minuten.
  Aufgaben, die online brauchen, nur leicht/mittel und nur, wenn man Freunde hat.
- Oberfläche: im Hauptmenü ein Knopf (Zettel- oder Haken-Symbol) mit rotem Punkt, solange etwas offen oder
  abholbar ist. Ansicht mit drei Karten, Fortschrittsbalken, Belohnung, Countdown bis Mitternacht.
  Wird eine Aufgabe fertig: kurze Meldung, aber nie mitten in einer Hand.
- Speichern in pr-quests { day, list: [{ id, prog, done, claimed }], reroll, chest }.
```

## Schritt 4: 7-Tage-Serie 2.0 mit Streak-Schutz

**Psychologie:** Eine Serie zu verlieren tut mehr weh, als ein Gewinn freut (Verlustaversion). Deshalb holen
Leute jeden Tag ihren Bonus ab. Der **Streak-Schutz** nimmt den Frust, wenn man einen Tag vergisst. Er ist
gleichzeitig etwas Sinnvolles, wofür man Chips ausgeben kann.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 2.

Erweitere die tägliche Belohnung (pr-daily, DAILY-Tabelle):
- Tag 1 bis 7 wie bisher (100 … 500). Ab Tag 8 jeden Tag 500.
- Truhen an Tag 7 (1.000 Chips + 500 XP), Tag 14 (2.500 + 1.000 XP), Tag 21 (5.000 + 2.000 XP),
  Tag 28 (10.000 + 5.000 XP und Profilrahmen „Stammgast“, sobald Schritt 18 da ist). Danach alle 7 Tage
  eine Truhe mit 5.000. Truhe mit eigener kleiner Öffnen-Animation.
- Die Ansicht zeigt die aktuelle Woche (7 Felder) und darüber die Serie „🔥 12 Tage“ plus die nächste Truhe.
- Streak-Schutz im Shop: 2.000 Chips, höchstens 2 im Besitz. Wird automatisch verbraucht, wenn genau ein Tag
  fehlt. Dann Meldung: „Dein Streak-Schutz hat deine 12-Tage-Serie gerettet 🛡️“.
- Serie verloren: freundliche Meldung mit bester Serie („Rekord: 23 Tage“), kein Drama.
- Flamme mit Zahl klein am Profil im Menü (und später für Freunde sichtbar).
- pr-daily erweitern zu { day, streak, best, shields }, alte Daten weiter lesen können.
```

---

# Teil B: Supabase (Server für alles Soziale)

**Was es bringt:** Konto ohne Anmeldung (läuft unsichtbar im Hintergrund), Chips und Fortschritt auf jedem
Gerät gleich, Freundesanfragen und Einladungen auch an Freunde, die gerade offline sind, Online-Status mit
„spielt gerade Blackjack“, Freundesfeed, Wochenliga, Push-Nachrichten, und eine stabilere Verbindung als
PeerJS (über eine normale Websocket-Verbindung statt direkt von Handy zu Handy).

**Kosten:** Der Free-Plan reicht für eine Freundesrunde locker (50.000 aktive Nutzer im Monat, 500 MB
Datenbank, 200 gleichzeitige Echtzeit-Verbindungen, 2 Mio. Echtzeit-Nachrichten im Monat).
Einziger Haken: Ein Free-Projekt wird **nach 7 Tagen ohne Nutzung pausiert**. Schritt 13 baut dagegen einen
automatischen „Wachhalter“.

**PeerJS bleibt immer als Rückfall drin.** Ist Supabase nicht erreichbar, läuft alles wie heute.

## Schritt 5: Supabase-Projekt anlegen (das machst du, ca. 10 Minuten)

Die ausführliche Anleitung mit allen Klicks, Push, Wachhalter und Problemlösungen steht in
**`docs/supabase-anleitung.md`**. Hier die Kurzfassung:

**A. Konto und Projekt**
1. Öffne https://supabase.com und tippe oben rechts auf **Start your project** (oder **Sign in**).
2. Wähle **Continue with GitHub** und melde dich mit deinem GitHub-Konto an (kortjannis-web).
3. Falls gefragt: eine **Organization** anlegen. Name egal (z. B. „Pokerrunde“), Plan **Free**.
4. Tippe auf **New project**:
   - **Project name:** `pokerrunde`
   - **Database Password:** auf **Generate a password** tippen und das Passwort in deinem Passwort-Manager
     speichern. **Dieses Passwort schickst du niemandem, auch nicht in den Chat.**
   - **Region:** **Central EU (Frankfurt)**, damit es für Deutschland schnell ist
   - Tippe auf **Create new project** und warte 1 bis 2 Minuten, bis das Projekt fertig ist.

**B. Die zwei Werte für den Chat**
5. Im Projekt links unten auf das Zahnrad **Project Settings** tippen.
6. Unter **Data API** (oder oben über den Knopf **Connect**) die **Project URL** kopieren.
   Sie sieht so aus: `https://abcdefgh.supabase.co`.
7. Unter **API Keys** den **Publishable key** kopieren (beginnt mit `sb_publishable_…`).
   Gibt es nur die alte Ansicht, nimm den **anon public**-Key (lang, beginnt mit `eyJ…`).
8. Schick beide Werte in den Chat. Der Publishable- bzw. anon-Key darf öffentlich in der App stehen,
   dafür ist er gemacht. **Niemals** schicken: den **Secret key** (`sb_secret_…`), den
   **service_role**-Key oder das Datenbank-Passwort.

**C. Anmeldung ohne E-Mail einschalten**
9. Links auf **Authentication** tippen, dann **Sign In / Providers** (manchmal nur „Providers“).
10. **Allow anonymous sign-ins** einschalten und **Save** tippen.
11. **Email** muss eingeschaltet bleiben (ist es normalerweise schon). Darüber verbindest du später dein
    Konto mit einem zweiten Gerät.
12. Unter **Authentication → URL Configuration**:
    - **Site URL:** `https://kortjannis-web.github.io/Pokerrunde/`
    - Bei **Redirect URLs** auf **Add URL** tippen und `https://kortjannis-web.github.io/Pokerrunde/**` eintragen,
      dann speichern.
13. Unter **Authentication → Emails → Templates** die Vorlage **Magic Link** öffnen und im Text die Zeile
    `Dein Code: {{ .Token }}` ergänzen, dann speichern. Damit kommt ein 6-stelliger Code per Mail. Das
    funktioniert auch in der App auf dem Homescreen, wo ein Link sich sonst im falschen Browser öffnet.

**D. Später, wenn Claude es sagt: SQL ausführen**
14. Claude legt Dateien wie `supabase/migrations/001_profile.sql` ins Repo und sagt dir, welche dran ist.
15. In Supabase links **SQL Editor** öffnen, oben **New query** tippen.
16. Den Inhalt der Datei auf GitHub öffnen (Knopf **Raw**), alles markieren, kopieren und in das Feld einfügen.
17. Unten rechts **Run** tippen. Erwartet wird „Success. No rows returned“.
    Alle Dateien sind so gebaut, dass zweimal Ausführen nichts kaputtmacht. Bei einer roten Fehlermeldung:
    Screenshot in den Chat schicken.

## Schritt 6: Verbindung für Tische und Freunde über Supabase

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Hier sind Project URL und Publishable Key:
URL: <hier einfügen>   KEY: <hier einfügen>

Baue „Stufe 1“ aus docs/online-ersatzloesungen.md: Supabase Realtime als Transport für Poker-, Blackjack-
und Roulette-Tische und für die Freunde (Online-Status, Anfragen, Einladungen).
- supabase-js mit fester Version als Datei ins Repo (wie peerjs.min.js) und in sw.js unter FILES.
  URL und Key als Konstanten oben in index.html (der Publishable Key darf öffentlich sein).
- Eine Transportschicht mit derselben Form wie heute (send, on('data'), on('open'), on('close')), damit der
  Spielcode fast unverändert bleibt. Kanäle: pr-poker-<CODE>, pr-bj-<CODE>, pr-rl-<CODE>, Posteingang
  pr-u-<SPIELERCODE>. Presence ersetzt connection/close; „Tisch belegt“ über Presence prüfen.
- Übergangsphase: Der Ersteller eines Tisches ist gleichzeitig über Supabase UND über PeerJS erreichbar,
  damit Freunde mit alter App noch beitreten können. Beitreten probiert zuerst Supabase, nach 6 Sekunden
  ohne Antwort PeerJS. Ist Supabase gar nicht erreichbar: alles wie bisher über PeerJS.
- Wiederverbinden nach kurzem Netzabbruch (rid) muss weiter funktionieren, auch beim Wechsel WLAN/Mobilfunk.
- Grenzen von Supabase Realtime (Nachrichten pro Sekunde, Größe pro Nachricht) prüfen und Spielstände
  nicht öfter als nötig senden.
- Kleine Anzeige im Profil unter Einstellungen: „Verbindung: Supabase“ bzw. „PeerJS (Rückfall)“.
- Mit Playwright zwei Browser starten und einen Poker-, einen Blackjack- und einen Roulette-Tisch komplett
  durchspielen, inkl. Verbindung kurz trennen und wiederverbinden.
- Danach docs/online-ersatzloesungen.md aktualisieren (Supabase ist jetzt der Hauptweg, PeerJS der Rückfall,
  Cloudflare die nächste Ersatzlösung).
```

## Schritt 7: Konto und Speichern in der Cloud

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 5 (und am besten 6).

Baue Konten und Cloud-Speicher mit Supabase:
- Beim App-Start still anonym anmelden (signInAnonymously), Sitzung bleibt gespeichert. Ohne Netz läuft die
  App wie bisher nur mit localStorage und gleicht später ab.
- Lege supabase/migrations/001_profile.sql an (idempotent mit if not exists): Tabelle profiles
  (id = auth.uid, player_code unique, name, color, level, xp, bank, stats jsonb, settings jsonb,
  cosmetics jsonb, created_at, updated_at) mit Row Level Security: jeder liest und schreibt nur die eigene
  Zeile; Freunde dürfen später Name, Farbe, Level, Kosmetik lesen (als eigene View oder Policy vorbereiten).
- Erstes Anmelden: alle pr-*-Daten (Profil, Chips, Statistiken, XP, Aufgaben, Serie, Upgrades, Tomaten,
  Spielzeit, Spielercode pr-pcode) ins Konto übernehmen. Den bestehenden Spielercode behalten.
- Abgleich: Änderungen gesammelt alle 5 Sekunden und beim Verlassen der App (visibilitychange) hochladen.
  Bei zwei Geräten gewinnt der neuere Stand (updated_at), bis Schritt 9 die Chips serverseitig bucht.
- Im Profil neuer Bereich „Konto“:
  * „Konto sichern“: E-Mail eingeben, 6-stelliger Code per Mail, damit wird das anonyme Konto dauerhaft.
  * „Auf anderem Gerät anmelden“: E-Mail und Code, danach Spielstand vom Konto laden (vorher fragen, ob der
    Spielstand auf diesem Gerät ersetzt werden soll).
  * Hinweis: Der eingebaute Mailversand von Supabase schafft nur wenige Mails pro Stunde. Für die
    Freundesrunde reicht das; sonst später eigenen Mailversand (z. B. Resend) einrichten und mir die
    Schritte erklären.
- Sag mir am Ende genau, welche SQL-Datei ich im SQL Editor ausführen muss (Anleitung in Schritt 5 D).
```

## Schritt 8: Freunde, Online-Status, Einladungen

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 7.

Verlege die Freunde in die Datenbank:
- Migration 002_friends.sql: friendships (a, b, status 'pending'|'accepted', created_at), invites (from, to,
  game, table_code, created_at, expires_at = 10 Minuten), jeweils mit RLS (nur Beteiligte lesen/schreiben),
  RPC-Funktionen request_friend(code), accept_friend(id), remove_friend(id).
- Freundschaftsanfragen funktionieren auch, wenn der andere offline ist; er sieht sie beim nächsten Öffnen.
  Bestehende pr-friends übernehmen: Hatten sich zwei schon gegenseitig, direkt 'accepted'.
- Online-Status über einen Realtime-Presence-Kanal mit { code, game, table, joinable }: in der Freundesliste
  „Online · spielt Blackjack“ bzw. „zuletzt online vor 2 Std.“. Bei joinable direkt „Mitspielen anfragen“
  (bestehender Ablauf „Mitspielen nur per Anfrage“).
- Einladungen und Mitspiel-Anfragen gehen über Realtime, landen aber zusätzlich in invites, damit sie bei
  kurz abwesenden Freunden nicht verloren gehen.
- Fällt Supabase aus: Freunde wie bisher über PeerJS.
```

## Schritt 9: Chips sicher buchen und Geschenke

**Ehrlich gesagt:** Bei einer Freunde-App muss es keinen perfekten Schutz gegen Schummeln geben. Dieser Schritt
macht aber Geschenke zuverlässig (kein doppeltes oder verlorenes Geschenk mehr), lässt den Tagesbonus nur
einmal pro Tag zu und macht Liga und Feed vertrauenswürdig.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 7.

Baue ein Chip-Konto auf dem Server:
- Migration 003_chips.sql: Tabelle chip_tx (id, user_id, delta, reason, game, created_at), profiles.bank
  wird nur noch über security-definer-Funktionen geändert:
  * apply_chips(delta, reason, game): Spielergebnisse, gesammelt hochgeladen (nicht jede Hand einzeln),
    mit Plausibilitätsgrenzen pro Grund (z. B. Gewinn nie mehr als Einsatz x höchste mögliche Quote).
  * claim_daily(): Tagesbonus und Serie serverseitig (einmal pro Tag Europe/Berlin), gleiche Beträge wie
    Schritt 4.
  * send_gift(to_code, amount): nur an bestätigte Freunde, höchstens 50.000 pro Tag, atomar (Abbuchen und
    Gutschreiben in einer Transaktion). Kommt auch an, wenn der Freund offline ist; er bekommt beim nächsten
    Öffnen eine Meldung „Max hat dir 1.000 Chips geschenkt 🎁“.
- Die App schickt Änderungen als Differenzen mit Grund statt als absoluten Kontostand. Ohne Netz werden sie
  gesammelt und später nachgereicht.
- Der bestehende Geschenk-Ablauf (drei Punkte am Freund) nutzt send_gift, sonst wie bisher über PeerJS.
- Im Profil: „Chip-Verlauf“ mit den letzten 50 Buchungen (Grund, Betrag, Zeit).
```

## Schritt 10: Freundesfeed

**So funktioniert er:** Erreichst du etwas Besonderes, legt die App automatisch einen kurzen Eintrag in der
Datenbank an. Deine Freunde sehen ihn sofort (Echtzeit) oder beim nächsten Öffnen in der Freundesliste unter
„Neuigkeiten“ und können mit 👏 😂 😮 🍅 reagieren. Ohne Server ginge das nur, wenn ihr gleichzeitig online
seid. Deshalb kommt der Feed nach Supabase.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritte 1, 7, 8.

Baue einen Freundesfeed:
- Migration 004_feed.sql: feed (id, user_id, kind, data jsonb, created_at), feed_reactions (feed_id,
  user_id, emoji, unique pro Nutzer und Eintrag). RLS: lesen eigene + Einträge bestätigter Freunde,
  schreiben nur eigene über RPC post_feed(kind, data) mit Liste erlaubter kinds und höchstens 10 Einträgen
  pro Nutzer und Tag. Tabelle zur Realtime-Publication hinzufügen. Einträge älter als 14 Tage per pg_cron
  löschen.
- Einträge entstehen automatisch (über die Ereignis-Zentrale) bei: Royal Flush, Straight Flush, Vierling;
  Poker-Pot ab 5.000 und mindestens 10 Big Blinds; Blackjack-Gewinn ab 5.000; Slots ab 50x Einsatz oder
  Jackpot; Roulette-Zahl direkt getroffen ab 1.000 Gewinn; Pop-the-Lock-Jackpot; alle 5 Level; alle drei
  Tagesaufgaben; Serie 7/14/30/50/100; Wochenliga gewonnen; später Crash ab 10x, Reaktion unter 200 ms,
  Rubbellos-Hauptgewinn, Turniersieg.
- Oberfläche: in den Freunden ein Reiter „Neuigkeiten“ mit Profilbild, kurzem Text („Lea hat einen
  Royal Flush 👑“), Zeit („vor 5 Min.“), Reaktionsleiste. Zähler mit ungelesenen Einträgen am Freunde-Knopf.
  Neue Einträge live als kleine Meldung im Menü, am Tisch erst nach der laufenden Hand.
- Einstellung „Meine Erfolge im Feed teilen“ (Standard: an).
```

## Schritt 11: Wochenliga

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 9.

Baue eine Wochenliga unter Freunden:
- Woche: Montag 00:00 bis Sonntag 23:59 Europe/Berlin.
- Zwei Ranglisten: „Wochengewinn“ (Netto-Chips aus Spielen, ohne Geschenke, Tagesbonus und Aufgaben) und
  „Fleißigster“ (XP dieser Woche). Berechnet auf dem Server aus chip_tx bzw. XP-Buchungen.
- Migration 005_league.sql: Tabellen/Views für die Woche, Funktion close_week(). pg_cron läuft stündlich und
  schließt die Woche nur, wenn in Berlin gerade Montag 0 Uhr vorbei ist (pg_cron rechnet in UTC, Sommer- und
  Winterzeit beachten).
- Wochenende: Platz 1 bekommt für die ganze nächste Woche eine Krone 👑 am Profilbild (überall sichtbar),
  Plätze 1 bis 3 bekommen 5.000 / 2.500 / 1.000 Chips, wenn mindestens 3 Freunde mitgespielt haben.
  Feed-Eintrag für den Sieger.
- Oberfläche: in den Freunden ein Reiter „Liga“ mit Countdown („endet in 2 T 5 Std.“), beiden Ranglisten,
  eigener Platz hervorgehoben. Montags beim ersten Öffnen: Siegertreppchen der letzten Woche als Overlay.
  „Ruhmeshalle“ mit allen bisherigen Wochensiegern.
- Ersetzt die bisherige Chip-Rangliste nicht; die Spielzeit-Rangliste bleibt auch.
```

## Schritt 12: Push-Benachrichtigungen

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 8.

Baue Web-Push:
- Funktioniert auf Android im Browser und auf dem iPhone nur, wenn die App zum Homescreen hinzugefügt ist
  (iOS 16.4+). Erkläre das in der App kurz, wenn jemand Push einschalten will.
- Erlaubnis nie beim Start abfragen, sondern erst, wenn es Sinn ergibt (z. B. nach der ersten Einladung oder
  über den Schalter in den Einstellungen).
- VAPID-Schlüssel: du erzeugst sie; den öffentlichen in die App, den privaten schickst du mir nur im Chat
  (nicht ins Repo) und sagst mir, wo ich ihn in Supabase als Secret eintrage.
- Migration 006_push.sql: push_subs (user_id, endpoint, keys, created_at) mit RLS; Trigger bzw. pg_net-Aufruf
  der Edge Function bei: Einladung, Mitspiel-Anfrage, Freundschaftsanfrage, Geschenk, Ligaergebnis.
  Erinnerung „Deine 🔥 12-Tage-Serie endet heute“ um 19 Uhr, wenn noch nicht abgeholt.
- Edge Function supabase/functions/push/index.ts. Gib mir eine idiotensichere Anleitung, wie ich sie im
  Supabase-Dashboard über den Editor anlege (Edge Functions → Deploy a new function → Via Editor) und das
  Secret setze.
- sw.js: push- und notificationclick-Handler, Tippen öffnet die App direkt an der richtigen Stelle.
- Einstellungen: einzelne Schalter pro Art. Höchstens eine Erinnerung pro Tag, Einladungen immer.
```

## Schritt 13: Wartung und Sicherheitsnetz

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 5.

- GitHub-Action .github/workflows/supabase-wach.yml: zweimal pro Woche eine kleine Leseanfrage an Supabase
  (mit dem öffentlichen Key), damit das Free-Projekt nie wegen Inaktivität pausiert.
- pg_cron-Aufräumjobs: abgelaufene Einladungen, alter Feed, alte Presence-Reste.
- In der App: Ist Supabase nicht erreichbar, still auf PeerJS und localStorage zurückfallen; nur ein kleiner
  Hinweis im Profil „Server gerade nicht erreichbar, du spielst im Notbetrieb“.
- Schreib in docs/online-ersatzloesungen.md eine kurze Anleitung für mich: wo ich in Supabase die Auslastung
  sehe (Reports/Usage), was bei „Projekt pausiert“ zu tun ist (Restore project) und wann Cloudflare die
  bessere Wahl wäre.
```

---

# Teil C: Am Tisch

## Schritt 14: Schnellsätze

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md.

Erweitere das Reaktionsfeld (Poker, Blackjack, Roulette) um einen zweiten Reiter „Sätze“ neben den Emojis:
- Sätze erscheinen 3 Sekunden als Sprechblase am Profilbild, gleiches Limit wie Reaktionen (3 in 9 Sekunden).
- Mindestens diese: „Hallo zusammen 👋“, „Schöne Hand 👏“, „Glück gehabt 🙄“, „Du blufft doch!“,
  „Ich hab's gewusst“, „Nicht schon wieder…“, „All-in? Mutig 😏“, „Gut gespielt“, „Mach schneller ⏰“,
  „Revanche!“, „Danke für die Chips 😘“, „Autsch“, „Na warte…“, „Was war das denn?“, „GG“, „Ich bin raus“.
  Blackjack/Roulette bekommen 4 eigene passende („Dealer, sei nett!“, „Alles auf Rot!“ …).
- Bots sagen selten (höchstens alle paar Hände) etwas Passendes, z. B. nach einem Bad Beat „Glück gehabt 🙄“.
- Langes Drücken auf ein Profilbild: „Stummschalten“ für Sätze und Reaktionen dieses Spielers.
- Neuer Nachrichtentyp: Versionen nach CLAUDE.md erhöhen (Poker v, BJ_V, RL_V).
```

## Schritt 15: Karten zeigen

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md.

Poker: Nach einer Hand, die ohne Showdown endet (alle anderen haben gepasst, oder ich habe gepasst), kann ich
4 Sekunden lang meine Karten zeigen: Knopf „Zeigen“ oder einzelne Karte antippen, um nur eine zu zeigen.
- Die anderen sehen die Karten an meinem Platz aufgedeckt mit kleinem Schild „gezeigt“.
- Hat jemand mit schwacher Hand gewonnen (unter einem Paar, ohne Showdown) und zeigt: Schild „Bluff 😏“.
- Bots zeigen gelegentlich einen Bluff (ca. 15 %), mit passendem Schnellsatz, wenn Schritt 14 da ist.
- Ereignis 'poker:show' an die Ereignis-Zentrale; Profil-Statistik „gezeigte Bluffs“.
- Online: neuer Nachrichtentyp, Poker-Version nach CLAUDE.md erhöhen. Verdeckte Karten anderer nie mitsenden.
```

## Schritt 16: Auswertung nach der Hand (Standard: aus)

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 1.

Neuer Schalter in den Einstellungen: „Auswertung nach der Hand (Poker)“, Standard AUS.
Wenn an:
- Nach jeder Pokerhand, in der ich mindestens eine Entscheidung hatte, schiebt sich unten eine kleine Karte
  rein (blockiert nichts, Antippen schließt, nach 7 Sekunden weg; nie während ich dran bin).
- Pro Entscheidung (Preflop/Flop/Turn/River): meine Gewinnchance zu dem Zeitpunkt (bestehende equity()-
  Funktion gegen zufällige Hände der noch aktiven Gegner) gegen die Pot-Odds, Urteil 👍 gut / 🤔 knapp /
  👎 teuer. Beispiel: „Turn: 38 % Gewinnchance, du musstest 25 % vom Pot zahlen → Mitgehen war richtig 👍“.
- Rückblick, nur mit aufgedeckten Karten: „Gegen seine Karten hattest du 12 %“. Online NIE verdeckte Karten
  anderer verwenden (der Ersteller kennt sie, sie dürfen nicht durchsickern). Gegen Bots offline darf
  „Du hättest gewonnen“ nach einem Passen kommen.
- Rechnen ohne Ruckeln: Simulationen in kleinen Stücken (requestAnimationFrame/setTimeout) oder Web Worker.
- Im Profil: „Entscheidungsqualität“ der letzten 100 Entscheidungen in Prozent.
- Blackjack: Der bestehende Tipp bleibt. Ist der Schalter an, zusätzlich am Rundenende kurz
  „Abweichung von der Grundstrategie“, wenn ich anders gespielt habe.
```

---

# Teil D: Personalisierung (alle 5)

Gemeinsam für 17 bis 21: Der Shop bekommt Reiter **Artikel · Tisch · Profil · Effekte**. Jeder Gegenstand hat
eine Vorschau, einen Preis oder eine Freischalt-Bedingung (Level, Erfolg, Serie) und den Knopf „Anlegen“.
Manche Dinge kann man **nicht kaufen, sondern nur verdienen**. Das macht sie wertvoll (Status) und gibt
Gründe weiterzuspielen.

## Schritt 17: Kartenrücken, Tischfilz, Chip-Designs

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md.

Baue den Shop um (Reiter Artikel · Tisch · Profil · Effekte, Artikel = Tomaten, Pop-the-Lock-Upgrades,
später Streak-Schutz und Rubbellose). Reiter „Tisch“:
- Kartenrücken (mindestens 8): Klassisch Rot (Standard), Blau, Schwarz-Gold, Holz, Neon, Pokerrunde-Logo,
  Diamant (ab Level 30, nicht kaufbar), Glitzer animiert (100.000 Chips). Preise 2.000 bis 25.000.
- Tischfilz (mindestens 6): Grün (Standard), Blau, Bordeaux, Schwarz, Lila Samt, Vegas-Muster. Gilt für Poker
  und Blackjack, Roulette-Tisch optional passend einfärben.
- Chip-Designs (mindestens 4): Standard, Gold, Neon, Retro.
- Alles in CSS/SVG/Canvas zeichnen, keine großen Bilddateien. Nur auf dem eigenen Gerät sichtbar
  (kein Protokoll ändern). Speichern in pr-cos { owned: [], on: {} }, später ins Konto (Schritt 7).
```

## Schritt 18: Profilrahmen und Titel

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 2.

Reiter „Profil“ im Shop:
- Rahmen ums Profilbild: Bronze (Lv 10), Silber (Lv 25), Gold (Lv 50), Diamant (Lv 75), alle verdient;
  Flammen (Serie 30), Krone (Wochenliga-Sieg, nur eine Woche), Stammgast (Serie 28); kaufbar: Neon, Holz,
  Regenbogen animiert (5.000 bis 50.000).
- Titel unter dem Namen (einer auswählbar), verdient durch Erfolge: „Bluff-König“ (10 gezeigte Bluffs),
  „Tomaten-Sniper“ (50 Tomaten geworfen), „Schlossknacker“ (Pop-the-Lock-Jackpot), „Highroller“ (Einsatz ab
  50.000), „Stammgast“ (Serie 28), „Blitzfinger“ (Reaktion unter 180 ms), „Kartenhai“ (Sit-&-Go-Sieg),
  „Glückspilz“ (Spin & Go mit 25x oder mehr), „Hausbank“ (100.000 im Blackjack gewonnen).
  Lege eine kleine Erfolgsliste an (pr-ach), die auch im Profil zu sehen ist („12 von 40 Erfolgen“).
- Rahmen und Titel sehen die anderen am Tisch und in der Freundesliste: Feld cos { frame, title } im
  öffentlichen Profil, Versionen nach CLAUDE.md erhöhen.
```

## Schritt 19: Siegesanimationen und Sounds

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md.

Reiter „Effekte“ im Shop:
- Siegesanimation bei großen Gewinnen (Poker-Pot ab 10 Big Blinds, Blackjack mit Blackjack, Slots ab 20x,
  Roulette-Zahl direkt): Konfetti, Goldregen, Feuerwerk, Chip-Regen, Blitze. Standard: die bisherige.
- Gewinn-Sound: Standard, „Ka-ching“, Fanfare, Jubel, Retro 8-Bit (alles mit WebAudio erzeugt, keine Dateien).
- Preise 3.000 bis 30.000, Feuerwerk erst ab Level 20.
- Online sehen die anderen meine Animation an meinem Platz (Feld im öffentlichen Profil, Version erhöhen).
  Einstellung „Effekte anderer anzeigen“ (Standard: an). Animationen kurz halten (max. 2 Sekunden) und
  „Bewegung reduzieren“ des Handys beachten.
```

## Schritt 20: Neue Wurfgegenstände

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md.

Neben der Tomate weitere Wurfgegenstände im Shop (Reiter Artikel), mit eigenem Klecks/Effekt und Sound,
gleiche Wurfsteuerung wie die Tomate:
- Ei 🥚 (2 Chips), Torte 🥧 (5), Wasserbombe 💦 (5), Konfetti-Bombe 🎉 (5, freundlich), Rose 🌹 (10, freundlich,
  bleibt kurz am Profilbild liegen), Schneeball ❄️ (nur Dezember bis Februar).
- Regenschirm ☂️ (50 Chips): fängt den nächsten Wurf auf mich ab, mit lustiger Abprall-Animation.
- Auswahl: lange auf das Tomaten-Symbol drücken → Auswahl der Gegenstände mit Anzahl. Verkaufen wie bei
  Tomaten (Hälfte zurück).
- Bestand in pr-tom erweitern (alte Tomatenzahl übernehmen). Online: bestehende Wurf-Nachricht um Feld k
  (Art) erweitern, Versionen erhöhen. Erfolg „Tomaten-Sniper“ zählt alle Würfe.
```

## Schritt 21: Profilbild selbst gestalten

**Psychologie:** Was man selbst gestaltet hat, schätzt man viel mehr (IKEA-Effekt) und zeigt es gern her.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md.

Im Profil „Profilbild gestalten“:
- Statt nur Buchstabe + Farbe: wählbar Buchstabe ODER Emoji (Auswahl von ca. 60 passenden Emojis),
  Hintergrund (Farbe, Farbverlauf, Muster wie Streifen/Punkte/Karo), Schriftstil des Buchstabens.
- Live-Vorschau, so wie es am Tisch aussieht (mit Rahmen aus Schritt 18, falls vorhanden).
- Einige Muster/Emojis kosten Chips oder brauchen ein Level.
- Kompakt als kleines Objekt im öffentlichen Profil senden (Feld av), Versionen erhöhen. Überall verwenden:
  Tisch, Freundesliste, Feed, Liga, Menü.
```

---

# Teil E: Neue Spiele und Modi

## Schritt 22: Sit & Go (Poker-Turnier)

**Was das ist:** Ein kleines Turnier, das startet, sobald der Tisch voll ist. Alle zahlen denselben Einsatz und
bekommen dieselben **Turnierchips**. Die Blinds steigen, und wer keine Chips mehr hat, ist raus. Am Ende
bekommen die Besten den Preistopf. Anders als beim normalen Poker gibt es einen klaren Sieger, Platzierungen
und kein Nachkaufen.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 1.

Baue Sit & Go als Modus im Poker-Bereich (neben dem normalen Tisch):
- 5 Plätze (Tischgröße der App), mit Bots aufgefüllt; online mit Freunden, Ersteller rechnet wie bisher.
- Einsatz aus dem Guthaben: 100 / 500 / 2.000 / 10.000. Preistopf = 5 x Einsatz (ohne Abzug).
  Auszahlung: Platz 1 = 65 %, Platz 2 = 35 %.
- Jeder bekommt 1.500 Turnierchips (getrennt vom Guthaben). Kein Nachkaufen.
- Blinds: 10/20, 15/30, 25/50, 50/100, 75/150, 100/200, 150/300, 200/400, 300/600, 500/1.000, danach weiter
  verdoppelnd. „Normal“ alle 6 Hände, „Turbo“ alle 3 Hände.
- Wer ausscheidet: „Platz 4 von 5“ mit Ergebnis; Wahl „Zuschauen“ oder „Zurück zum Menü“. Bin ich offline gegen
  Bots raus, steht meine Platzierung fest, der Rest muss nicht weitergespielt werden.
- Ende: Siegertreppchen mit Sound, Auszahlung ins Guthaben, Ereignis 'poker:sng' { place, buyin, prize }.
- Profil-Statistik: Turniere, Siege, Geldplätze in Prozent, bester Platz, Netto.
- Online: neue Felder für den Modus → Poker-Version nach CLAUDE.md erhöhen.
```

## Schritt 23: Spin & Go (Turnier mit Glücksrad)

**Was das ist:** Ein Mini-Turnier zu dritt. Vor dem Start dreht ein Glücksrad, um wie viel der Preistopf
vervielfacht wird: meist 2x, selten 25x oder sogar 1.000x. Die Blinds steigen sehr schnell, eine Partie dauert
nur 3 bis 5 Minuten. Die Spannung kommt vom Rad: Jeder hofft auf den großen Multiplikator, selbst wenn er ihn
selten trifft.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 22 (Turnier-Grundlage).

Baue Spin & Go:
- 3 Spieler (ich + 2 Bots oder Freunde). Einsatz: 100 / 500 / 2.000 / 10.000.
- 500 Turnierchips, Blinds 10/20 und alle 3 Hände eine Stufe höher (gleiche Leiter wie Sit & Go).
- Vor dem Start Glücksrad mit Multiplikator für den Preistopf (Topf = Multiplikator x Einsatz):
    2x 80 % · 3x 12 % · 5x 5 % · 10x 2,5 % · 25x 0,4 % · 100x 0,09 % · 1.000x 0,01 %
  (Erwartungswert 2,75 → bei gleich guten Spielern fließen ca. 92 % zurück, das ist die Chip-Senke).
  Zufall mit crypto.getRandomValues; Werte als Tabelle im Code, leicht änderbar.
- Auszahlung: bis 10x alles an den Sieger; ab 25x Platz 1 = 80 %, Platz 2 = 12 %, Platz 3 = 8 %.
- Rad: eigene Animation (gern im Stil des Slots-Glücksrads), langsam auslaufend, Ticken; bei 25x und mehr die
  Jackpot-Lichtshow aus Pop the Lock wiederverwenden. Feed-Eintrag ab 25x.
- Online: Ersteller dreht und schickt das Ergebnis; Poker-Version erhöhen.
- Profil-Statistik: gespielt, gewonnen, höchster Multiplikator, Netto.
```

## Schritt 24: Video-Poker

**Was das ist:** Ein Poker-Automat für dich allein, ohne Gegner. Du bekommst 5 Karten, tippst die an, die du
**halten** willst, und tauschst den Rest einmal aus. Danach zahlt der Automat nach einer festen Tabelle aus:
ab einem Paar Buben 1x, Zwei Paare 2x, Drilling 3x, Straße 4x, Flush 6x, Full House 9x, Vierling 25x,
Straight Flush 50x, Royal Flush 250x (mit 5 Münzen sogar 800x). Das Spiel ist schnell und es kommt wirklich
aufs richtige Halten an. Mit perfektem Spiel fließen 99,5 % zurück. Beliebt ist auch das **„Doppeln“**
danach: Höher oder tiefer als die Karte des Dealers? Gewinn verdoppeln oder alles verlieren.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 1.

Baue Video-Poker „Jacks or Better“ als neue Seite im Hauptmenü (rechts neben Roulette; Start bleibt Poker):
- Automaten-Look passend zur App (wie Slots/Pop the Lock: Rahmen, Lichter, LED-Schrift).
- Münzen 1 bis 5, Münzwert 1 / 5 / 25 / 100 Chips. Auszahltabelle 9/6 pro Münze: Royal Flush 250 (bei 5 Münzen
  800), Straight Flush 50, Vierling 25, Full House 9, Flush 6, Straße 4, Drilling 3, Zwei Paare 2,
  Paar Buben oder besser 1. Tabelle oben sichtbar, aktuelle Spalte und Treffer leuchten.
- Ablauf: „Geben“ → Karten antippen = HALTEN (Schild über der Karte) → „Ziehen“ → Auszahlung mit Sound.
  Bestehende Handbewertung der App wiederverwenden.
- Doppeln nach einem Gewinn (optional): eine Dealer-Karte offen, 4 verdeckt, ich wähle eine; höher = doppelt,
  gleich = unentschieden, tiefer = weg. Höchstens 5 Mal hintereinander, „Gewinn nehmen“ jederzeit.
- 💡 Tipp-Knopf wie beim Blackjack: zeigt die beste Halte-Strategie (vereinfachte optimale Strategie für 9/6).
- Statistik im Profil (pr-vpstats): Spiele, Gewinne, Saldo, beste Hand, Royal Flushes. Ereignisse melden.
- Später möglich: Varianten Deuces Wild und Bonus Poker (nicht jetzt bauen).
```

## Schritt 25: Rubbellose

**Was das ist:** Lose im Shop kaufen und mit dem Finger freirubbeln. Ein Los dauert 10 Sekunden, fühlt sich
toll an und nimmt Chips aus dem Umlauf (im Schnitt kommen ca. 85 % zurück). Man kann sie auch verschenken.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md.

Baue Rubbellose:
- Drei Sorten im Shop (Reiter Artikel): „Kleeblatt“ 50 Chips (Hauptgewinn 5.000), „Goldrausch“ 500 Chips
  (Hauptgewinn 100.000), „Diamant“ 5.000 Chips (Hauptgewinn 1.000.000). Jede Sorte mit eigenem Design.
- Spielprinzip: 9 Felder mit Beträgen, 3 gleiche = dieser Gewinn. Zusätzliches Bonusfeld mit „x2“ (selten).
- Ergebnis beim Kauf auslosen (crypto.getRandomValues), Gewinntabelle so berechnen, dass ca. 85 % zurückfließen
  und etwa jedes 3. Los etwas gewinnt (oft nur den Einsatz zurück). Tabelle und Rechnung als Kommentar im Code.
  Ehrlich: keine absichtlich eingebauten „knapp daneben“-Lose, nur was der Zufall ergibt.
- Rubbeln auf Canvas (destination-out) mit dem Finger, Rubbel-Geräusch, leichte Vibration; ab 60 % frei wird
  automatisch alles aufgedeckt; Knopf „Alles aufdecken“.
- Gekaufte Lose kann man sammeln und später rubbeln. Ein Kleeblatt-Los als Bonus der Aufgaben-Truhe
  (Schritt 3). Verschenken an Freunde über den Geschenk-Ablauf, sobald Schritt 9 da ist.
- Statistik (pr-scstats), Ereignisse, Feed ab Hauptgewinn.
```

## Schritt 26: Crash

**Was das ist:** Eine Rakete startet, und ein Multiplikator steigt von 1,00x immer schneller: 1,5x, 2x, 5x …
Irgendwann stürzt sie zufällig ab. Wer vorher auf **„Auszahlen“** drückt, bekommt Einsatz x aktuellen
Multiplikator. Wer zu lange wartet, verliert alles. Die Spannung „noch kurz … noch kurz …“ ist enorm. Mit
Freunden in derselben Runde siehst du, wer wann aussteigt („Lea ist bei 3,2x raus!“), und das macht es
sozial.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 1.

Baue Crash als neue Seite im Hauptmenü (Platz mit mir absprechen, Start bleibt Poker):
- Absturzpunkt pro Runde: crash = max(1,00; floor(100 * 0,97 / (1 - U)) / 100), U zufällig aus
  crypto.getRandomValues, gedeckelt bei 1.000x. Das ergibt ca. 3 % Hausvorteil (Chip-Senke) und gelegentlich
  sofortigen Absturz bei 1,00x.
- Multiplikator wächst m(t) = e^(0,08 · t) (t in Sekunden): 2x nach ca. 9 s, 10x nach ca. 29 s.
- Ablauf: 7 Sekunden Einsätze (Countdown), Flug mit Kurve und Rakete, Absturz mit Explosion, 3 Sekunden Pause.
- Knöpfe: großer „Auszahlen“-Knopf mit aktuellem Betrag, „Halb auszahlen“ (Rest fliegt weiter),
  Auto-Auszahlen bei frei wählbarem Multiplikator. Leiste mit den letzten 20 Absturzpunkten (farbig).
- Allein: 3 bis 4 Bots mit Namen (als Bots erkennbar) setzen und steigen sichtbar aus, für Atmosphäre.
- Online wie Roulette: Raum, in den Freunde jederzeit dazukommen. Der Ersteller lost den Absturzpunkt aus und
  verrät ihn erst beim Absturz; er schickt Startzeitpunkt und Takt, alle rechnen die Kurve lokal.
  Auszahlen: Mitspieler schickt seinen Multiplikator, der Ersteller akzeptiert ihn, wenn er unter dem
  Absturzpunkt liegt und höchstens leicht über dem Wert, den die Kurve beim Ersteller gerade zeigt
  (Verzögerung ausgleichen). Namen fliegen beim Aussteigen mit Multiplikator von der Rakete.
  Eigenes Protokoll mit CR_V = 1 und Abweisung alter Versionen wie bei BJ/Roulette.
- Statistik (pr-crstats): Runden, Netto, höchster Auszahl-Multiplikator; Feed ab 10x; Ereignisse melden.
```

## Schritt 27: Reaktionsduell

**Meine Meinung zu deiner Idee:** Ich finde sie sehr gut. Sie ist simpel, dauert 30 Sekunden und schafft
echte Duelle unter Freunden („Revanche!“). Online wäre der Hauptmodus. Wichtig ist die Fairness trotz
Internet-Verzögerung: Jedes Handy misst die Reaktionszeit **selbst**, ab dem Moment, in dem der Knopf auf
diesem Handy grün wird. Die Verbindung spielt dann keine Rolle. Gegen Fehlstarts gibt es Fallen: Ab und zu
wird der Knopf kurz gelb statt grün, und wer dann drückt, verliert die Runde.

**Zur anpassbaren KI:** Auch gut, als **Trainingsgegner** mit kleinen Einsätzen. Sie orientiert sich an deinem
Tempo der letzten Runden. Gute Spieler gewinnen gegen sie ca. 55 % der Runden, schwächere ca. 45 %. Gute
verdienen also leicht, schwache verlieren nur wenig. Ich würde offen dazuschreiben „Der Gegner passt sich
deinem Tempo an“. Bei Spielgeld ist das völlig in Ordnung, fühlt sich fair an, und niemand frustriert.

```text
Beachte „Gilt für alle“ in docs/plan-neue-features.md. Braucht Schritt 1.

Baue ein Reaktionsduell:
- Einstieg: bei online Freunden in der Freundesliste „⚡ Duell“ (Anfrage wie Mitspielen) und eine Ansicht
  „Reaktion“ (im Menü oder in den Freunden, Platz mit mir absprechen) mit „Freund herausfordern“ und
  „Gegen KI trainieren“.
- Online 2 bis 5 Spieler, Einsatz 10 / 100 / 1.000 / 10.000 (alle gleich, Gewinner bekommt alles),
  Best of 5 Runden.
- Runde: großer runder Knopf blau mit „Warten…“. Nach zufällig 1,5 bis 6 Sekunden wird er grün → so schnell wie
  möglich drücken. In ca. 20 % der Runden wird er vorher kurz gelb (Falle). Drücken bei blau oder gelb =
  Fehlstart, Runde verloren. Zeiten unter 100 ms zählen als Fehlstart (menschlich unmöglich).
- Messen: Der Ersteller schickt pro Runde nur die Wartezeit (und ob es eine Falle gibt). Jedes Handy startet
  seinen Countdown beim Empfang, merkt sich den Zeitpunkt, an dem grün wirklich gezeichnet wurde
  (requestAnimationFrame danach), und misst bis pointerdown mit performance.now(). Ergebnisse werden erst
  gezeigt, wenn alle gedrückt haben oder 3 Sekunden um sind. Danach Zeiten aller in ms mit Siegerjubel.
- KI-Training: Die KI nimmt den Median meiner letzten 20 Zeiten m und reagiert mit m · f, f normalverteilt
  um μ mit Streuung 0,07. μ = 1,03 wenn m < 230 ms (ich gewinne ca. 55–60 %), μ = 1,00 bei 230–320 ms,
  μ = 0,97 wenn m > 320 ms (ich gewinne ca. 45 %). KI nie unter 150 ms, 3 % Fehlstart-Chance.
  Einsatz gegen KI höchstens 1.000. Text in der Ansicht: „Der KI-Gegner passt sich deinem Tempo an“.
- Bestzeit und Durchschnitt im Profil (pr-rxstats), Erfolg „Blitzfinger“ unter 180 ms, Feed unter 200 ms,
  Schnellsatz „Revanche!“ nach dem Duell mit Knopf für eine neue Runde.
- Eigenes Protokoll RX_V = 1, alte Versionen abweisen wie bei BJ/Roulette.
```

---

## Platz für deine Notizen

- [ ] …
