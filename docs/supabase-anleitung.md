# Supabase für Pokerrunde einrichten

Schritt für Schritt, für jemanden ohne Vorwissen und ohne Supabase-Konto.
Du brauchst: einen Computer (am Handy geht es auch, ist aber fummeliger), eine E-Mail-Adresse und etwa 20 Minuten.
Programmieren musst du nichts. Den Code baut Claude, du klickst nur und schickst am Ende zwei Werte.

---

## 0. Kurz erklärt

**Was ist Supabase?** Ein Server mit Datenbank im Internet. Pokerrunde speichert dort die Spielerkonten
(Name und Passwort), Chips, Freunde und wer gerade online ist. Dadurch sieht jeder alle anderen Spieler,
kann sie als Freund hinzufügen, einladen und live mit ihnen spielen, auch auf einem neuen Handy.

**Anmeldung in der App:** Jeder Spieler wählt einen Namen und ein Passwort. Eine E-Mail braucht er nicht.

**Was kostet das?**

| Tarif | Preis | Projekte | Für Pokerrunde |
|---|---|---|---|
| **Free** | 0 € | 2 aktive Projekte pro Konto | reicht für eine Freundesrunde locker (500 MB Datenbank, 50.000 Spieler im Monat, 200 gleichzeitige Live-Verbindungen) |
| **Pro** | ab ca. 25 $ im Monat | ein Projekt inklusive, jedes weitere ca. 10 $ im Monat | nur nötig, wenn mehr als 2 Projekte gleichzeitig laufen sollen |

Haken beim Free-Tarif: Ein Projekt, das 7 Tage lang niemand benutzt, wird pausiert. Claude baut dafür einen
automatischen Wachhalter. Die Preise können sich ändern, aktuell stehen sie auf https://supabase.com/pricing.

> Wichtig: Die Gratis-Grenze gilt pro Person. Lege das Konto deshalb wirklich für dich selbst an und nicht als
> zweites Konto für jemanden, der schon zwei Gratis-Projekte hat.

---

## 1. Konto anlegen (ca. 3 Minuten)

1. Öffne **https://supabase.com**.
2. Klicke oben rechts auf **Start your project**.
3. Klicke auf **Sign up** (falls die Seite „Sign in“ zeigt, unten auf **Don't have an account? Sign up**).
4. Trage deine **E-Mail** und ein **Passwort** ein und klicke auf **Sign up**.
   (Hast du ein GitHub-Konto, geht auch **Continue with GitHub**.)
5. Öffne dein E-Mail-Postfach. Von Supabase kommt eine Mail „Confirm your signup“.
   Klicke darin auf **Confirm your mail**. Keine Mail da? Im Spam-Ordner nachsehen.
6. Du landest im Supabase-Dashboard.

✅ **Geschafft, wenn:** Du oben „Dashboard“ oder „Create a new organization“ siehst.

---

## 2. Organisation anlegen (1 Minute)

Supabase fragt beim ersten Mal nach einer **Organization**. Das ist nur ein Ordner für deine Projekte.

1. **Name:** `Pokerrunde`
2. **Type:** `Personal`
3. **Plan:** **Free - $0/month**
4. Klicke auf **Create organization**.

---

## 3. Projekt anlegen (ca. 5 Minuten)

1. Klicke auf **New project**.
2. Fülle aus:
   - **Organization:** `Pokerrunde`
   - **Project name:** `pokerrunde`
   - **Database Password:** Klicke auf **Generate a password** und danach auf **Copy**.
     Speichere das Passwort sofort in einer Notiz-App oder deinem Passwort-Manager.
     **Dieses Passwort schickst du niemandem, auch nicht Jannis oder Claude.** Es wird nicht gebraucht.
   - **Region:** **Central EU (Frankfurt)**
   - Gibt es die Schalter **Enable Data API** und **Enable automatic RLS**: beide **an** lassen.
3. Klicke auf **Create new project**.
4. Warte 1 bis 2 Minuten, bis oben nicht mehr „Setting up project“ steht.

✅ **Geschafft, wenn:** Links ein Menü mit **Table Editor**, **SQL Editor**, **Authentication** usw. erscheint.

---

## 4. Anmeldung mit Name und Passwort vorbereiten (ca. 3 Minuten)

Die App macht aus dem Spielernamen intern eine Adresse, an die keine Mail geht. Deshalb darf Supabase
keine Bestätigungs-Mail verlangen.

1. Klicke links auf **Authentication** (Symbol mit Personen).
2. Klicke auf **Sign In / Providers** (manchmal heißt es **Providers**).
3. Oben bei den allgemeinen Einstellungen:
   - **Allow new users to sign up:** **an**
   - **Allow anonymous sign-ins:** **aus**
   - Klicke auf **Save changes**.
4. In der Liste der Provider auf **Email** klicken:
   - **Enable Email provider:** **an**
   - **Confirm email:** **aus** ← das ist der wichtigste Schalter
   - **Secure email change:** egal, kann so bleiben
   - Klicke auf **Save**.
5. Klicke links auf **URL Configuration**:
   - **Site URL:** `https://kortjannis-web.github.io/Pokerrunde/` eintragen und **Save** klicken.

✅ **Geschafft, wenn:** Bei **Email** „Confirm email“ ausgeschaltet ist.

---

## 5. Jannis ins Team holen (empfohlen, 2 Minuten)

Dann kann Claude über Jannis' Zugang die Datenbank selbst einrichten und du musst nichts weiter tun.

1. Klicke ganz oben links auf den Namen der Organisation **Pokerrunde** und dann auf **Organization settings**
   (oder links unten auf das Zahnrad).
2. Klicke auf **Team**.
3. Klicke auf **Invite member** (oder **Invite**).
4. **Email:** die Adresse, mit der Jannis bei Supabase angemeldet ist (frag ihn danach).
5. **Role:** **Developer**
6. Klicke auf **Invite**.

Jannis bekommt eine Mail und nimmt die Einladung an. Danach kann er (bzw. Claude in seinem Browser)
Tabellen anlegen und die App mit deinem Projekt verbinden.

> Kommt eine Meldung, dass die Einladung nicht geht: Kein Problem, dann Teil 7 machen.

---

## 6. Die zwei Werte an Jannis schicken (2 Minuten)

1. Klicke links unten auf das Zahnrad **Project Settings**.
2. Klicke auf **Data API** (manchmal **API**). Kopiere die **Project URL**. Sie sieht so aus:
   `https://abcdefghijkl.supabase.co`
3. Klicke auf **API Keys**. Kopiere den **Publishable key**. Er beginnt mit `sb_publishable_`.
   - Siehst du nur „Legacy API keys“: nimm den Schlüssel **anon public** (sehr lang, beginnt mit `eyJ`).
4. Schick beide an Jannis, zum Beispiel per WhatsApp:
   > URL: https://abcdefghijkl.supabase.co
   > KEY: sb_publishable_xxxxxxxxxxxxxxxx

Diese zwei Werte sind dafür gemacht, öffentlich in einer App zu stehen. Was man damit darf, regeln die
Sicherheitsregeln in der Datenbank.

### Was du NIEMALS schickst oder irgendwo einträgst

| Name in Supabase | Warum geheim |
|---|---|
| **Secret key** (`sb_secret_…`) | darf alles in der Datenbank, ohne jede Regel |
| **service_role** (alte Ansicht) | dasselbe wie der Secret key |
| **Database Password** | voller Zugriff auf die Datenbank |
| **JWT Secret** | damit könnte man sich als jeder Spieler ausgeben |

---

## 7. Nur falls Teil 5 nicht geklappt hat: Datenbank selbst einrichten (3 Minuten)

Claude legt die Datenbank als eine Datei ins Repo: `supabase/pokerrunde.sql`. Jannis sagt dir, wann sie fertig ist.

1. Öffne im Browser:
   `https://github.com/kortjannis-web/Pokerrunde/blob/main/supabase/pokerrunde.sql`
2. Klicke oben rechts über dem Text auf das Symbol mit den zwei Kästchen (**Copy raw file**).
3. In Supabase links auf **SQL Editor** klicken.
4. Oben auf **+ New query** (oder **New SQL snippet**) klicken.
5. In das große Feld klicken und einfügen (Strg+V, am Mac Cmd+V).
6. Unten rechts auf **Run** klicken.
7. Ergebnis:
   - ✅ **„Success. No rows returned“**: fertig.
   - ⚠️ Frage **„This query has destructive operations“**: auf **Run this query** klicken. Das ist richtig so.
   - ❌ Rote Fehlermeldung: Screenshot an Jannis schicken, nichts selbst ändern.

Zweimal ausführen schadet nicht. Wenn du unsicher bist, ob es geklappt hat: einfach nochmal.

---

## 8. Ab und zu reinschauen (1 Minute im Monat)

1. In Supabase oben auf die Organisation klicken und **Usage** öffnen.
2. Ist alles unter 80 %: nichts zu tun. Darüber: Jannis Bescheid sagen.

---

## 9. Probleme und Lösungen

**„Project is paused“ / die App meldet „Server gerade nicht erreichbar“**
Supabase öffnen, das Projekt anklicken, **Restore project** klicken und 2 bis 5 Minuten warten.
Die Daten bleiben erhalten. Bis dahin läuft die App ohne Konten weiter.

**Ein Spieler kann sich nicht registrieren („Signups not allowed“)**
Teil 4, Schritt 3: **Allow new users to sign up** muss an sein.

**Ein Spieler bekommt „Email not confirmed“**
Teil 4, Schritt 4: **Confirm email** muss aus sein.

**Ein Spieler hat sein Passwort vergessen**
Jannis kann es im Projekt unter **Authentication → Users** zurücksetzen (Spieler suchen, Menü am Zeilenende).

---

## 10. Checkliste

- [ ] Teil 1: Konto angelegt und E-Mail bestätigt
- [ ] Teil 2: Organisation `Pokerrunde` im Free-Tarif
- [ ] Teil 3: Projekt `pokerrunde` in Frankfurt, Datenbank-Passwort sicher gespeichert
- [ ] Teil 4: Neue Konten erlaubt, anonyme Anmeldung aus, **Confirm email aus**, Site URL gespeichert
- [ ] Teil 5: Jannis als Developer eingeladen (oder Teil 7 erledigt)
- [ ] Teil 6: Project URL und Publishable key an Jannis geschickt
