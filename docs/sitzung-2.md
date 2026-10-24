# Sitzung 2: Übergabe aus Sitzung 1

Diese Datei bereitet die zweite Sitzung vor. **Für dich:** Öffne einen neuen Chat mit Claude Code an diesem
Repo und füge den Prompt aus „Prompt für den neuen Chat“ unten ein. Mehr ist nicht nötig.

## Was in Sitzung 1 eingebaut wurde

Alles ist live auf `main`. Die Schritte beziehen sich auf `docs/plan-neue-features.md`.

| Schritt | Inhalt | Stand |
|---|---|---|
| 1 | Ereignis-Zentrale (`PR.on/emit`) | fertig |
| 2 | **Sterne statt Level** (1 ⭐ pro 1.000 Chips Gewinn), Meilensteine | fertig (Level/XP auf Wunsch des Nutzers gestrichen) |
| 3 | Tägliche Aufgaben (3 pro Tag, für alle gleich, Truhe) | fertig |
| 4 | Serie 2.0 mit Truhen und Streak-Schutz | fertig |
| 14 | Schnellsätze (Poker, Blackjack, Roulette, Crash) | fertig |
| 15 | Karten zeigen (Poker) | fertig |
| 16 | Auswertung nach der Hand (Standard aus) | fertig |
| 17 | Shop mit Reitern, Kartenrücken, Tischfilz, Chip-Designs | fertig |
| 18 | Profilrahmen, Titel, 44+ Erfolge | fertig |
| 19 | Siegesanimationen und Gewinn-Sounds | fertig |
| 20 | Wurfgegenstände inkl. Regenschirm | fertig |
| 21 | Profilbild selbst gestalten | fertig |
| 22 | Sit & Go | fertig |
| 23 | Spin & Go | fertig |
| 26 | Crash (eigene Menüseite) | fertig |
| 27 | Reaktionsduell (eigene Menüseite, gegen Bot und mit Freunden, ⚡ Duell in der Freundesliste) | fertig |

## Was in Sitzung 2 drankommt

1. **Schritt 24: Video-Poker** als eigene Wisch-Seite **zwischen Roulette und Crash** (über `window.PRMenu`).
2. **Schritt 25: Rubbellose** im Shop (Reiter „Artikel“), ein Kleeblatt-Los als Bonus der Aufgaben-Truhe
   (`PRQ.onChest`), verschenken an Freunde, sobald Schritt 9 da ist.
3. **Supabase blind vorbauen (Schritte 6 bis 13).** Entscheidung des Nutzers: Er richtet Supabase erst
   **nach** Sitzung 2 ein. Deshalb:
   - Konstanten `SUPABASE_URL = ''` und `SUPABASE_KEY = ''` oben in `index.html`. Sind sie leer, ist alles aus
     und die App läuft exakt wie heute (PeerJS + localStorage). Das muss getestet werden.
   - Alles bauen, was die Schritte 6 bis 13 verlangen: Transportschicht mit PeerJS-Rückfall, Konto und Cloud-
     Speicher, Freunde/Online-Status/Einladungen in der Datenbank, Chip-Konto mit Geschenken, Freundesfeed,
     Wochenliga (Krone über `PRCos.grant('krone','frame',7*864e5)`), Push (Edge Function + `sw.js`),
     Wachhalter-Action (läuft nur, wenn URL und Key gesetzt sind), Aufräum-Jobs.
   - SQL als `supabase/migrations/001_….sql` bis `006_….sql` (idempotent, Row Level Security überall).
     Edge Function unter `supabase/functions/push/index.ts`.
   - Testen ohne echten Server: mit leeren Konstanten muss alles wie vorher laufen; mit einer erfundenen,
     nicht erreichbaren URL muss die App ohne Fehler auf PeerJS zurückfallen; die Supabase-Aufrufe gegen
     einen kleinen Ersatz (Mock von supabase-js) prüfen, so gut es geht. SQL wenn möglich mit einem
     SQL-Parser prüfen.
   - **`docs/supabase-anleitung.md` anpassen**, wenn sich an den Schritten für den Nutzer etwas ändert
     (Dateinamen, Secrets, Webhooks, Einstellungen), und es ihm am Ende ausdrücklich sagen.
   - Am Ende eine kurze Liste für den Nutzer: „Wenn du Supabase eingerichtet hast, schick mir URL + Key, dann
     trage ich sie ein und wir testen live“.
4. Abschluss: Gesamttest, Plan-Doku aktualisieren, Bericht an den Nutzer.

## Hinweise zur Arbeitsweise (bewährt in Sitzung 1)

- **Arbeitsanweisung für Helfer:** `dev/ARBEITSANWEISUNG.md`. Sie enthält Regeln, eine Karte von
  `index.html`, alle gebauten Schnittstellen (PRBus, PRStars, PRQ, PRDaily, PRChest, PRChat, PRCoach, PRCos,
  PRLook, PRAch, PRFx, PRAv, TOM, PR.tn/PRTn, PRMenu, CR, RX …) und die aktuellen Online-Versionen.
  Nach jedem Schritt um die neuen Schnittstellen ergänzen.
- **Prüfwerkzeuge:** `node dev/test/check.js` (Syntax aller Skripte), `node dev/test/smoke.js <ordner>`
  (Rauchtest auf Handybreite mit Screenshots aller Menüseiten), `dev/test/fakepeer.js` plus
  `dev/test/online-vorlage.js` (Online-Tests mit zwei Browsern ohne echtes PeerJS).
- Schritte nacheinander bauen, weil alle in dieselbe Datei schreiben. Der Nutzer möchte **zügiges Tempo**:
  nur das Wichtigste testen (Syntax, Rauchtest, ein echter Durchlauf pro Feature, kurzer Online-Test).
- Jeder Schritt wird sofort committet und nach `main` gepusht (CLAUDE.md).

## Prompt für den neuen Chat

```text
Das ist Sitzung 2 des großen Feature-Pakets. Lies zuerst docs/sitzung-2.md, dev/ARBEITSANWEISUNG.md,
CLAUDE.md und in docs/plan-neue-features.md die Schritte 6–13, 24 und 25.

Baue dann alles aus „Was in Sitzung 2 drankommt“ in docs/sitzung-2.md vollständig und voll integriert ein:
Video-Poker (eigene Wisch-Seite zwischen Roulette und Crash), Rubbellose und Supabase blind vorgebaut mit
leeren Platzhaltern (ohne Schlüssel läuft alles wie bisher). Arbeite Schritt für Schritt (gern mit Helfern
nacheinander, die dev/ARBEITSANWEISUNG.md bekommen), teste zügig nur das Wichtigste, committe und pushe
jeden Schritt sofort nach main.

Wenn Fragen da sind, stell sie ganz am Anfang. Falls sich an meinen Supabase-Schritten
(docs/supabase-anleitung.md) etwas ändert, pass die Anleitung an und sag es mir am Ende ausdrücklich.
Am Ende: kurzer Bericht, was reingekommen ist und wozu, und was ich als Nächstes tun muss.
```
