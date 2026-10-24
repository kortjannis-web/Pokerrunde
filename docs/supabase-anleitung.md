# Supabase einrichten: Schritt-für-Schritt-Anleitung

Diese Anleitung ist für dich als Nutzer. Du brauchst keine Programmierkenntnisse, nur Klicken und Kopieren.
Den Code baut Claude. Hier steht nur, was **du** in Supabase einstellen musst und wann.

Zusammenhang mit dem Plan: `docs/plan-neue-features.md`, Schritte 5 bis 13.

---

## 0. Kurz erklärt: Was ist Supabase und was ändert sich?

**Heute:** Die Handys verbinden sich über einen fremden Gratis-Vermittler (PeerJS) direkt miteinander.
Chips, Freunde und Statistik liegen nur im Browser des Handys. Ist ein Freund offline, kommt nichts bei ihm an.
Wer das Handy wechselt oder den Browser leert, verliert alles.

**Mit Supabase:** Ihr bekommt einen eigenen kleinen Server mit Datenbank. Damit:
- landen Chips, Level, Aufgaben und Statistik im **Konto** und sind auf jedem Gerät gleich,
- kommen Freundesanfragen, Einladungen und Geschenke an, **auch wenn der andere offline ist**,
- seht ihr „Online · spielt Blackjack“,
- werden **Freundesfeed, Wochenliga und Push-Nachrichten** überhaupt erst möglich,
- laufen die Verbindungen stabiler (normale Websocket-Verbindung statt direkt von Handy zu Handy).

PeerJS bleibt als Rückfall drin. Ist Supabase mal weg, läuft die App wie heute weiter.

**Kosten:** Der Free-Plan ist gratis und reicht für eine Freundesrunde locker:

| Grenze (Free-Plan) | Wert | Für euch |
|---|---|---|
| aktive Nutzer pro Monat | 50.000 | weit mehr als genug |
| Datenbank | 500 MB | reicht für Jahre |
| gleichzeitige Echtzeit-Verbindungen | 200 | reicht für ca. 100 gleichzeitig spielende Leute |
| Echtzeit-Nachrichten pro Monat | 2 Mio. | reicht für sehr viele Runden |
| Edge-Function-Aufrufe pro Monat | 500.000 | Push-Nachrichten, mehr als genug |
| Mails vom eingebauten Mailversand | nur wenige pro Stunde | reicht zum Konto-Sichern, siehe 4.4 |

**Einziger Haken:** Ein Free-Projekt wird **nach 7 Tagen ohne Nutzung pausiert**. Claude baut dafür einen
automatischen Wachhalter (Teil 8). Falls es doch passiert: Teil 10, Problem 1.

> Die Grenzen können sich ändern. Aktuell stehen sie auf https://supabase.com/pricing.

---

## 1. Konto und Projekt anlegen (ca. 5 Minuten)

1. Öffne **https://supabase.com** und tippe oben rechts auf **Start your project** (oder **Sign in**).
2. Tippe auf **Continue with GitHub** und melde dich mit deinem GitHub-Konto (**kortjannis-web**) an.
   Wenn GitHub fragt, ob Supabase auf dein Konto zugreifen darf: **Authorize**.
3. Wirst du nach einer **Organization** gefragt:
   - **Name:** zum Beispiel `Pokerrunde`
   - **Type:** `Personal`
   - **Plan:** **Free** ($0)
   - **Create organization** tippen.
4. Tippe auf **New project** und fülle aus:
   - **Organization:** die eben angelegte
   - **Project name:** `pokerrunde`
   - **Database Password:** auf **Generate a password** tippen, dann auf **Copy**. Speichere das Passwort in
     deinem Passwort-Manager oder einer Notiz-App.
     **Dieses Passwort schickst du niemandem, auch nicht in den Chat.** Claude braucht es nicht.
   - **Region:** **Central EU (Frankfurt)**, damit es in Deutschland am schnellsten ist
   - Falls es die Optionen gibt: **Enable Data API** an lassen; **Enable automatic RLS** an lassen.
5. Tippe auf **Create new project**. Jetzt 1 bis 2 Minuten warten, bis oben nicht mehr „Setting up project“
   steht.

✅ **Geschafft, wenn:** Du die Startseite deines Projekts siehst (links ein Menü mit Table Editor,
SQL Editor, Authentication …).

---

## 2. Die zwei Werte für den Chat holen

1. Tippe oben auf den Knopf **Connect** (oder links unten auf das Zahnrad **Project Settings**).
2. **Project URL** kopieren. Sie steht unter **Data API** bzw. **API** und sieht so aus:
   `https://abcdefghijkl.supabase.co`
3. Öffne **Project Settings → API Keys**.
4. Kopiere den **Publishable key**. Er beginnt mit `sb_publishable_`.
   - Siehst du nur die alte Ansicht („Legacy API keys“): nimm den Schlüssel **anon public**
     (sehr lang, beginnt mit `eyJ`).
5. Schick beide in den Chat, zum Beispiel so:
   > URL: https://abcdefghijkl.supabase.co
   > KEY: sb_publishable_xxxxxxxxxxxxxxxx

### Was du NIEMALS schickst oder irgendwo einträgst

| Name in Supabase | Warum geheim |
|---|---|
| **Secret key** (`sb_secret_…`) | Darf alles in der Datenbank, ohne jede Regel |
| **service_role** (alte Ansicht) | Dasselbe wie der Secret key |
| **Database Password** | Voller Zugriff auf die Datenbank |
| **JWT Secret** | Damit könnte man sich als jeder ausgeben |

Der **Publishable key** bzw. **anon public** ist dagegen ausdrücklich dafür gemacht, öffentlich in einer
Webseite zu stehen. Was man damit darf, regeln die Sicherheitsregeln (Row Level Security), die Claude per
SQL anlegt.

---

## 3. Anmeldung ohne E-Mail einschalten (ca. 2 Minuten)

Damit bekommt jeder Spieler beim ersten Öffnen automatisch und unsichtbar ein Konto, ganz ohne Registrierung.

1. Links im Menü auf **Authentication** tippen.
2. Dann auf **Sign In / Providers** (in manchen Ansichten heißt es **Providers** oder **Sign In / Up**).
3. Suche den Schalter **Allow anonymous sign-ins**, schalte ihn **ein** und tippe auf **Save**.
4. Weiter unten bei den Providern muss **Email** eingeschaltet sein (ist es normalerweise).
   - **Confirm email:** an lassen.
5. Links **Authentication → URL Configuration** öffnen:
   - **Site URL:** `https://kortjannis-web.github.io/Pokerrunde/` eintragen, **Save**
   - Bei **Redirect URLs** auf **Add URL** tippen, `https://kortjannis-web.github.io/Pokerrunde/**` eintragen
     (mit den zwei Sternchen am Ende), **Save URLs**.

✅ **Geschafft, wenn:** „Allow anonymous sign-ins“ grün bzw. an ist und die Site URL gespeichert ist.

> Optional, gegen Spam-Konten: Unter **Authentication → Attack Protection** kann man eine Captcha-Prüfung
> einschalten. Für eine Freundesrunde ist das nicht nötig. Falls doch gewünscht, Claude vorher fragen,
> weil die App dafür angepasst werden muss.

---

## 4. Anmelde-Code per E-Mail (für „Konto sichern“ und zweites Gerät)

Spieler können später ihr Konto mit einer E-Mail sichern und sich auf einem zweiten Handy anmelden. Dafür
schicken wir einen **6-stelligen Code** statt eines Links. Ein Link würde sich auf dem iPhone im Safari
öffnen statt in der App auf dem Homescreen.

1. Links **Authentication → Emails** öffnen (manchmal **Email Templates**).
2. Reiter **Templates** → Vorlage **Magic Link** öffnen.
3. **Subject** ändern zu: `Dein Code für Pokerrunde`
4. Den gesamten Text im Feld **Body** ersetzen durch:
   ```html
   <h2>Pokerrunde</h2>
   <p>Dein Code zum Anmelden:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
   <p>Der Code gilt eine Stunde. Wenn du das nicht warst, ignoriere diese Mail.</p>
   ```
5. **Save** tippen.
6. Dasselbe für die Vorlage **Confirm signup** und **Change Email Address** (falls vorhanden): Subject wie oben,
   im Body muss `{{ .Token }}` vorkommen.

### 4.4 Wenn Mails nicht ankommen (optional, nur bei Bedarf)

Der eingebaute Mailversand schickt nur **sehr wenige Mails pro Stunde** und manchmal landen sie im Spam.
Für ein paar Freunde reicht das. Wird es mehr, eigenen Mailversand einrichten (z. B. Resend, gratis bis
3.000 Mails im Monat):
1. Auf https://resend.com registrieren, unter **API Keys** einen Schlüssel erstellen.
2. In Supabase **Authentication → Emails → SMTP Settings** → **Enable custom SMTP**:
   Host `smtp.resend.com`, Port `465`, Username `resend`, Password = der Resend-Schlüssel,
   Absender z. B. `onboarding@resend.dev` (oder eigene Domain), **Save**.
3. Diesen Resend-Schlüssel ebenfalls niemandem schicken.

---

## 5. SQL ausführen (immer, wenn Claude es sagt)

Claude legt die Datenbank-Bausteine als Dateien ins Repo, zum Beispiel:
`supabase/migrations/001_profile.sql`, `002_friends.sql`, `003_chips.sql` …
Nach jedem Schritt sagt Claude dir **genau, welche Datei** jetzt dran ist.

**So führst du eine Datei aus:**
1. Öffne die Datei auf GitHub:
   `https://github.com/kortjannis-web/Pokerrunde/blob/main/supabase/migrations/<DATEINAME>`
2. Tippe auf **Raw** (oben rechts über dem Code). Jetzt siehst du nur den reinen Text.
3. Alles markieren und kopieren (am Computer: Strg+A, Strg+C; am Handy: lange tippen → Alles auswählen →
   Kopieren). Oder auf GitHub den Knopf **Copy raw file** (zwei Kästchen-Symbol) nutzen.
4. In Supabase links **SQL Editor** öffnen.
5. Oben auf **+ New query** (bzw. **New SQL snippet**) tippen.
6. Den kopierten Text in das große Feld einfügen.
7. Unten rechts auf **Run** tippen (am Computer auch Strg+Enter).
8. Ergebnis:
   - ✅ **„Success. No rows returned“** (oder eine kleine Tabelle) = alles gut.
   - ⚠️ Fragt Supabase **„This query has destructive operations“** oder **„Run this query?“**: Das kommt bei
     Befehlen wie `drop policy if exists` vor, die Claude zum sauberen Neuanlegen benutzt. **Run this query**
     bestätigen ist dann richtig.
   - ❌ Rote Fehlermeldung: Screenshot oder Text der Meldung in den Chat schicken. Nichts selbst ändern.
9. Optional: Die Abfrage oben links umbenennen (z. B. „001 profile“), dann findest du sie wieder.

**Wichtig:**
- Dateien **in der Reihenfolge der Nummern** ausführen, keine überspringen.
- Alle Dateien sind so gebaut, dass **zweimal ausführen nicht schadet**. Wenn du unsicher bist, ob du eine
  schon ausgeführt hast: einfach nochmal.
- Kontrolle: Links **Table Editor** öffnen. Dort tauchen die neuen Tabellen auf (z. B. `profiles`).

---

## 6. Echtzeit (Realtime) prüfen

Für Tische, Online-Status und Feed nutzt die App **Realtime**. Normalerweise ist nichts zu tun.

1. Links **Realtime** öffnen (bei manchen Ansichten unter **Database → Realtime** oder **Project Settings →
   Realtime**).
2. Unter **Settings** prüfen:
   - Ist ein Schalter **„Allow public access“** da: so lassen, wie Claude es sagt (Claude schreibt dazu,
     ob „private channels only“ an oder aus sein soll).
3. Den Feed schaltet Claude per SQL frei (`alter publication supabase_realtime add table …`). Ein Klick im
   Dashboard ist dafür nicht nötig.

Test: In der App unter **Profil → Einstellungen** steht nach Schritt 6 „Verbindung: Supabase“.

---

## 7. Push-Nachrichten einrichten (Plan Schritt 12)

Erst machen, wenn Claude Schritt 12 gebaut hat. Claude gibt dir dazu:
- den Code der Funktion (Datei `supabase/functions/push/index.ts` im Repo),
- **im Chat** einen privaten Schlüssel `VAPID_PRIVATE_KEY` (niemals ins Repo und niemandem weitergeben).

### 7.1 Die Funktion anlegen
1. Links **Edge Functions** öffnen.
2. **Deploy a new function** → **Via Editor** wählen.
3. **Function name:** `push` (genau so, klein geschrieben).
4. Den Beispielcode im Editor komplett löschen.
5. Inhalt von `supabase/functions/push/index.ts` von GitHub kopieren (wie in Teil 5, über **Raw**) und einfügen.
6. **Deploy function** tippen und warten, bis „Deployed“ bzw. ein grüner Haken erscheint.
7. Falls Claude es sagt: In den Details der Funktion **Verify JWT** (bzw. „Enforce JWT verification“)
   ausschalten oder anlassen, genau wie angegeben.

### 7.2 Geheime Schlüssel (Secrets) eintragen
1. **Edge Functions → Secrets** öffnen (oder **Project Settings → Edge Functions → Secrets**).
2. Für jeden Schlüssel, den Claude nennt, auf **Add new secret**:
   - `VAPID_PUBLIC_KEY` = öffentlicher Schlüssel (von Claude)
   - `VAPID_PRIVATE_KEY` = privater Schlüssel (von Claude, nur im Chat)
   - `VAPID_SUBJECT` = `mailto:` + deine E-Mail
3. **Save** tippen. `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` musst du **nicht** eintragen. Die kennt
   jede Funktion automatisch.

### 7.3 Auslöser (nur falls Claude es nicht per SQL erledigt)
1. Links **Database → Webhooks** (manchmal unter **Integrations → Database Webhooks**). Falls gefragt:
   **Enable webhooks**.
2. **Create a new hook**:
   - **Name:** `push_invites`
   - **Table:** die Tabelle, die Claude nennt (z. B. `invites`)
   - **Events:** **Insert** anhaken
   - **Type:** **Supabase Edge Functions** → Funktion `push`
   - **Create webhook** tippen.
3. Für weitere Tabellen (Freundschaftsanfragen, Geschenke) genauso, wenn Claude sie nennt.

### 7.4 Push auf dem Handy
- **iPhone:** geht nur, wenn die App über Safari → Teilen → **Zum Home-Bildschirm** installiert ist
  (iOS 16.4 oder neuer). Dann in der App unter Einstellungen Push einschalten und erlauben.
- **Android:** direkt im Chrome möglich, besser auch als App installieren (Menü → **App installieren**).

---

## 8. Der Wachhalter (gegen „Projekt pausiert“)

Claude legt eine GitHub-Action an (`.github/workflows/supabase-wach.yml`), die zweimal pro Woche kurz bei
Supabase anklopft. Du musst nur prüfen, ob GitHub Actions erlaubt sind:

1. Öffne https://github.com/kortjannis-web/Pokerrunde/settings/actions
2. Unter **Actions permissions**: **Allow all actions and reusable workflows** wählen, **Save**.
3. Öffne den Reiter **Actions** im Repo. Steht dort „Workflows aren't being run on this repository“, auf
   **I understand my workflows, go ahead and enable them** tippen.
4. Test: Im Reiter **Actions** links „Supabase wach halten“ wählen → **Run workflow** → **Run workflow**.
   Nach ca. 30 Sekunden sollte ein grüner Haken erscheinen.

> GitHub schaltet geplante Actions ab, wenn im Repo 60 Tage lang gar nichts passiert. Dann bekommst du eine
> Mail von GitHub; dort auf **Continue running workflow** tippen.

---

## 9. Ab und zu reinschauen (1 Minute im Monat)

1. In Supabase links **Reports** oder oben in der Organisation **Usage** öffnen.
2. Wichtig sind: **Database size**, **Realtime peak connections**, **Realtime messages**,
   **Edge function invocations**, **Monthly active users**.
3. Alles unter 80 % des Limits: nichts zu tun.
   Über 80 %: Claude Bescheid sagen. Dann kann man sparsamer senden, aufräumen oder auf Cloudflare ausweichen
   (siehe `docs/online-ersatzloesungen.md`).

---

## 10. Probleme und Lösungen

**Problem 1: „Project is paused“ / App meldet „Server gerade nicht erreichbar“**
- Supabase öffnen → Projekt antippen → **Restore project** → 2 bis 5 Minuten warten. Daten bleiben erhalten.
- Bis dahin läuft die App im Notbetrieb über PeerJS weiter.
- Passiert es öfter: Teil 8 (Wachhalter) prüfen.

**Problem 2: Tische lassen sich nicht erstellen / Beitreten scheitert**
- In der App unter Einstellungen nachsehen: „Supabase“ oder „PeerJS (Rückfall)“?
- Supabase-Statusseite prüfen: https://status.supabase.com
- Ist Supabase gestört oder sind Limits erreicht: Claude sagen „Supabase macht Probleme“. Dann kommt der
  Cloudflare-Plan aus `docs/online-ersatzloesungen.md`.

**Problem 3: Der Mail-Code kommt nicht an**
- Spam-Ordner prüfen. Eine Stunde warten (Mail-Limit). Wenn es öfter vorkommt: Teil 4.4 (eigener Mailversand).

**Problem 4: Rote Fehlermeldung im SQL Editor**
- Text oder Screenshot in den Chat. Häufige Ursache: Eine frühere Datei wurde noch nicht ausgeführt.
  Dann die fehlende Nummer zuerst ausführen.

**Problem 5: Push kommt nicht an**
- iPhone: App wirklich vom Homescreen geöffnet? Mitteilungen in den iPhone-Einstellungen für die App erlaubt?
- Supabase → **Edge Functions → push → Logs** öffnen und den Text der roten Zeilen in den Chat schicken.

**Problem 6: Ein Freund sieht seine alten Chips nicht mehr**
- Neues Gerät oder Browser geleert? Dann in der App **Profil → Konto → Auf anderem Gerät anmelden** mit der
  E-Mail, mit der er sein Konto gesichert hat. Hat er es nie gesichert, ist der alte Stand nur auf dem alten
  Gerät. Deshalb in der App ruhig öfter an „Konto sichern“ erinnern.

---

## 11. Checkliste

- [ ] Teil 1: Projekt `pokerrunde` in Frankfurt angelegt, Datenbank-Passwort sicher gespeichert
- [ ] Teil 2: Project URL und Publishable key in den Chat geschickt
- [ ] Teil 3: Anonymous sign-ins an, Site URL und Redirect URL eingetragen
- [ ] Teil 4: Mail-Vorlagen mit `{{ .Token }}` gespeichert
- [ ] Teil 5: SQL-Dateien in der Reihenfolge ausgeführt, die Claude genannt hat
- [ ] Teil 6: In der App steht „Verbindung: Supabase“
- [ ] Teil 7: Push-Funktion, Secrets und ggf. Webhooks angelegt (erst nach Schritt 12)
- [ ] Teil 8: GitHub Actions erlaubt, Wachhalter einmal von Hand gestartet
- [ ] Teil 9: Erinnerung im Kalender: einmal im Monat Usage ansehen
