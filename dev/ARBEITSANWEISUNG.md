# Arbeitsanweisung für Bau-Schritte an der Pokerrunde (aus Sitzung 1, für Sitzung 2 weiterverwenden)

Du baust einen Teil eines großen Feature-Pakets in die Web-App „Pokerrunde“ ein. Andere Helfer bauen vor und nach
dir weitere Teile in dieselbe Datei – arbeite sauber, klein und nachvollziehbar.

## Repo und Regeln
- Repo: /home/user/Pokerrunde. Alles Wesentliche steckt in **index.html** (über 15.000 Zeilen, fast 1 MB). Die Datei
  NIEMALS komplett lesen: mit Grep/`sed -n 'a,bp'` gezielt Abschnitte ansehen.
- Lies zuerst: `CLAUDE.md` (Regeln, Online-Versionen!), in `docs/plan-neue-features.md` den Abschnitt
  „Gilt für alle“ und den/die Schritt(e), die du bauen sollst. Der Prompt dort ist deine Spezifikation.
  Wo dein Auftrag (unten bzw. in der Nachricht) davon abweicht, gilt dein Auftrag.
- Stil: ES5 wie im bestehenden Code (`var`, `function`, keine Arrow-Functions, kein `let/const`, keine Module),
  jedes Feature als eigene IIFE in einem `<script>`-Block, Kommentare auf Deutsch OHNE Umlaute (ae/oe/ue),
  Texte in der Oberfläche auf Deutsch MIT Umlauten. CSS in den `<style>`-Block oben (eigener kommentierter
  Abschnitt `/* ---------- Name ---------- */`), HTML-Overlays bei den anderen Overlays (class="overlay" hidden,
  Inhalt in `.endcard`). Bestehende Bausteine wiederverwenden (Klassen .btn, .btn.primary, .btn.wide, .overlay,
  .endcard, .seg, .psec, Toast über `PR.toast`/toastMsg falls vorhanden, Sounds über `PR.Snd`).
- localStorage immer in try/catch, Schlüssel mit Präfix `pr-`, alte Spielstände dürfen nie kaputtgehen.
- Handy zuerst (360–430 px Breite), nichts ragt über den Rand, Knöpfe daumengroß. Neue Overlays müssen in
  `menuFree()` (Tagesbonus-Skript, sucht nach `function menuFree`) berücksichtigt werden, damit der
  Tagesbonus nicht darüber aufgeht.

## Grobe Karte von index.html (Zeilennummern ungefähr, verschieben sich)
- `<style>` oben bis ca. Zeile 1480; danach HTML: `#menu` (Hauptmenü mit Wisch-Seiten `#mSwipe`/`#mTrack`,
  Punkte `.mdots`), Pokertisch, Blackjack, Slots, Pop the Lock, Roulette, Overlays (#profile, #pview, #friends,
  #daily, #shop, #giftDlg …).
- Skript 1 (~2250): `window.Poker` = Engine (Handbewertung, `equity()`, Bots mit `STYLES`, `createGame`,
  `BLINDS`, `START_CHIPS`, `REBUY`).
- Skript 2 (~3160–5650): Poker-Oberfläche, Profil (`PROF`, `saveProf`, `renderBank`), Statistik, Online-Tisch
  über PeerJS (hello `v: 4`, Ersteller akzeptiert ab 3), Reaktionen (`showReaction`), Tomaten am Pokertisch,
  am Ende `window.PR = { … }` (gemeinsame Schnittstelle: prof(), saveProf(), renderBank(), Snd, fmt, profName …).
- Skript 3 (~5655–7000): Blackjack (`BJ_V`), Hauptmenü-Wischen (`var GAMES = ['lock','slots','poker','bj','rl']`,
  `setPage`, `mixes`), Online-Blackjack.
- Skript 4 (~7000–7960): Slots (`window.SL`). Skript 5 (~7963–8508): Pop the Lock (`window.LK`, Upgrades
  `pr-lkup2`, Jackpot-Glas `pr-jar`). Skript 6 (~8510–9300): Roulette (`RL_V`, `window.RL`).
- Skript 7 (~9300–10080): Freunde (Spielercode `pr-pcode`, `pr-friends`, PeerJS-Vermittlung, Einladungen,
  Anfragen, Chips schicken). Skript 8 (~10080): Tägliche Belohnung (`DAILY`, `pr-daily`, `menuFree`).
  Danach: Spielzeit (`window.PRT`), Tomaten werfen (`pr-tom`), Shop (`#shop`), weitere kleine Skripte,
  ganz am Ende Service-Worker-Registrierung.
- `sw.js`: Cache-Name `pokerrunde-v4`, Liste `FILES` (neue Dateien dort eintragen; die Seite selbst lädt
  network-first, der Cache-Name muss nicht erhöht werden).

## Online-Versionen (wichtig!)
Wer Nachrichten zwischen den Handys ändert (neue Nachrichtentypen/Felder mit Bedeutung), erhöht die Version
und passt die Untergrenze beim Ersteller an, damit alte Apps mit „App einmal ganz schließen und neu öffnen“
abgewiesen werden: Poker `hello`-Feld `v` (alle Stellen, die `v: N` senden, und die Prüfung beim Ersteller),
Blackjack `BJ_V`, Roulette `RL_V`. Lies die AKTUELLEN Werte im Code (ein Helfer vor dir hat sie evtl. schon
erhöht) und erhöhe um 1, falls du Nachrichten änderst. Aktualisiere dann den Abschnitt „Online-Versionen“ in
`CLAUDE.md` mit den neuen Zahlen. Neue Spiele mit eigenem Protokoll bekommen eine eigene Konstante (z. B. `CR_V`).

## Schnittstellen der anderen Schritte (sobald gebaut – im Code nachsehen)
- Ereignis-Zentrale: `PR.on(name, fn)`, `PR.off`, `PR.emit(name, daten)` (Schritt 1). Neue Spiele/Features
  melden ihre Ereignisse dort.
- KEIN XP/Level mehr (vom Nutzer gestrichen) – stattdessen STERNE: `window.PRStars` (Schritt 2 neu).
- Erfolge: `PR.ach` (Schritt 18) – neue Features schalten passende Erfolge frei.
Wenn du eine Schnittstelle baust, dokumentiere sie mit einem kurzen Kommentar an der Definition.

## Schon gebaut (Stand laufend aktualisiert)
- Schritt 1: `window.PRBus` (eigenes Skript vor der Engine) mit `PR.on(name, fn)` (fn(daten, name),
  '*' hört alles), `PR.off`, `PR.emit`; Ereignisliste im Kommentar über PRBus (bet, win, poker:hand, bj:round,
  slots:spin, rl:spin, lock:round, tomato, gift, game:open, online:round, stars, milestone, streak, quest …).
  Neue Spiele melden 'win' {game, amount, net} genau einmal pro Runde – dann zählen sie automatisch für Sterne.
- Schritt 2 neu (Sterne statt Level): `window.PRStars` (auch PR.stars) { count(), won(), info(), STAR_CHIPS=1000,
  MILESTONES, UNLOCKS, addUnlock({stars, kind, id, label, icon}), unlocksFor(n), unlocked(id, kind?), need(id, kind?) },
  Speicher `pr-stars`. 1 Stern pro 1.000 Chips Netto-Gewinn. Abzeichen am Profilbild: `window.PRStarBadge(el, n)`,
  Kurzform `window.PRStarShort(n)`. Menü: `#starBar`, Ansicht `#starView`, Feier `#starUp`.
  Freischaltungen, die früher „ab Level X“ hießen, hängen jetzt an Sternen (siehe Plan).
- Chip-Gutschriften außerhalb von Spielen erst im Menü auszahlen, wenn `prIdle` wahr ist (so überschreibt
  saveBank am Pokertisch nichts) – mach es für deine Gutschriften genauso.
- Schritte 3+4: `window.PRQ` { list(), progress(id,n), done(), onChest(fn), addQuest(def), REWARDS, CHEST },
  `window.PRChest.open({kick,title,text,lines,onOpen(add),onClose})` (Truhen-Animation), `window.PRDaily`
  { info(), chestOf, amountOf, SHIELD_PRICE, MAX_SHIELDS, buyShield() }. Menü oben links: Profil-Pille (mit
  Flamme), darunter runder Shop-Knopf + Sterne-Balken, darunter runder Aufgaben-Knopf (#quests). Overlays stehen in
  drei Listen (Tagesbonus `menuFree`, Sterne `free()`, Aufgaben `menuFree`) – neue Overlays in ALLE eintragen
  (mit Grep nach `'#quests'` finden).
- Schritte 14–16: `window.PRChat` (Sätze/Sprechblasen/Stummschalten), `window.PRCoach` (Auswertung, pr-coach),
  Ereignisse 'chat' {game,text}, 'poker:show' {cards, bluff}, 'coach' {score}; Statistik pr-pkshow {n, b}.
  Roulette hat jetzt auch Reaktionen/Sätze am Online-Tisch.
- Schritte 17+18: Shop mit Reitern Artikel/Tisch/Profil/Effekte. `window.PRCos` / PR.cos { items, item(id,kind),
  owned(id,kind), buy(id,kind), equip(kind,id), current(kind), onChange(fn), addItem(def), addSection(tab,{kind,title,sub})
  (tab 'tisch'|'profil'|'fx'), scope(el), grant(id,kind,ms), revoke, bought(), open(tab) }, Speicher pr-cos. Ids nur je
  kind eindeutig – immer kind mitgeben. `window.PRLook` { frame(host,id), title(afterEl,id), titleText(id), clean(cos),
  mine(), field(name, clean, mine) } – Netzfeld `cos` im öffentlichen Profil, erweiterbar über PRLook.field.
  `window.PRAch` / PR.ach { list, has, count, unlock, progress, bump, onUnlock, def, open, add({id,icon,name,desc,goal?,
  title?,ev?,f?,abs?}) }, Ereignis 'ach' {id}, Speicher pr-ach. Spätere Spiele legen ihre Erfolge selbst per PRAch.add an
  (blitzfinger, kartenhai, glueckspilz, crash-…). Krone für Wochenliga: PRCos.grant('krone','frame',7*864e5).
- Schritte 19–21: `window.PRFx` { play(id,{el,small}), big(game, el), other(cos, el), sound(id), reduced(), othersOn() }
  – große Gewinne neuer Spiele über PRFx.big(game, el) feiern (Ereignis 'bigwin'). `window.PRAv` (Profilbild: paint(el,
  name, color, av), mine(el), net()) – neue Spiele zeichnen Profilbilder IMMER über PRAv.paint. `window.TOM` (Würfe),
  PR.Snd.fx/vib/winStd/winHook. Netzfeld cos hat win, av, um.
- Schritte 22+23: Poker-Turniere (PR.tn, window.PRTn, Engine-Option tourney). Ereignis 'poker:sng'. 'win' mit
  tourney:true nur am Turnierende. Eine eigene Jackpot-Lichtshow nutzt die CSS-Animationen lkblink/lkhalo/lkmq und den
  Münzregen der Slots – bei Bedarf in PRTn nachsehen und wiederverwenden.
- Schritt 26 (Crash): Menü ist datengetrieben: `window.PRMenu { games, page(), idx(g), go(g, anim) }`, Seiten aus
  `.mpage[data-g]`, `.mgrp[data-g]`, Hintergrund-Klasse `.mbg-<spiel>` (Punkte/Hintergründe entstehen von selbst).
  Crash: `window.CR`, `window.CRT` (Würfe), PRChat-Liste 'cr', Protokoll `CR_V = 1`, Freunde-Status g:'cr'
  (myStatus/cleanSt/stText/Anfrage/Annehmen/Einladen in Skript 7). Besserer fakepeer (puffert Nachrichten vor open,
  nötig für Freundes-Tests): `dev/test/fakepeer.js`,
  Vorlage `dev/test/online-vorlage.js` (Seiten vor goto in pages eintragen).
- Schritt 27 (Reaktion): siebte Menüseite, `window.RX` { on(), state(), host(done), join(code), friends(done) },
  Protokoll `RX_V = 1`, Freunde-Nachrichten duel/duelok/duelno, Status g:'rx', PRChat-Liste 'rx'.
  Menü-Reihenfolge jetzt: lock · slots · poker · bj · rl · cr · rx (Video-Poker kommt zwischen rl und cr).
- Versionen jetzt: Poker `PK_V = 10` (Ersteller nimmt ab 10, schickt älteren {t:'old'}), `BJ_V = 9`, `RL_V = 6`, `CR_V = 1`, `RX_V = 1`.
  Öffentliches Profil hat Feld `st` (Sterne). Immer die AKTUELLEN Werte im Code nachsehen.
- Online-Test ohne echtes PeerJS: `dev/test/fakepeer.js`
  und `online.js` (zwei getrennte Browser über einen PeerJS-Ersatz) – als Vorlage kopieren und nutzen.

## Prüfen (Pflicht vor jedem Commit)
1. Syntax: `node dev/test/check.js`
2. Rauchtest (lädt die App auf 390 px, sammelt JS-Fehler, Screenshots aller Menüseiten):
   `node dev/test/smoke.js <ausgabeordner>`
   Die Datei `smoke.js` darfst du als Vorlage für eigene Playwright-Tests kopieren (eigene Kopie im
   Scratchpad-Ordner der Sitzung oder unter dev/test/, Ausgaben nach dev/test/shots/ – nicht committen). Spiele deine Features in Playwright wirklich durch
   (z. B. Pokerhand gegen Bots, Blackjack-Runde, Shop öffnen, Overlays), sieh dir die Screenshots mit dem
   Read-Tool an und prüfe Layout auf 360 px und 430 px Breite. localStorage kannst du per
   `page.evaluate` vorbelegen, um Zustände zu testen.
3. Online (PeerJS) lässt sich hier meist nicht testen (Netz). Prüfe Protokolländerungen deshalb durch genaues
   Lesen: Ersteller und Mitspieler, alte Versionen werden abgewiesen, verdeckte Karten werden nie gesendet.

## Abschluss
- `git pull -q origin main` (falls nötig), committen mit deutscher Nachricht im Stil des bestehenden Logs
  (z. B. „XP und Level: Balken im Menü, Level-Aufstieg mit Chips …“). Commit-Nachricht endet mit:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HjgeFiuHZDdrAJSMbetpW5
  ```
  Dann pushen: `git push origin HEAD:main` und `git push -u origin ccr-770c49e5-tojlvh`
  (bei Netzfehlern bis zu 4 Mal mit 2/4/8/16 s Pause wiederholen). Lieber mehrere kleine Commits (einer pro
  Teilschritt) als einen riesigen.
- Deine Antwort an mich (auf Deutsch, knapp):
  1. Für den Nutzerbericht: 2–5 Sätze pro Feature, was neu ist und wozu (für Laien verständlich).
  2. Technisch: neue localStorage-Schlüssel, neue Schnittstellen (Name + Signatur), geänderte Versionen,
     Commit-Hashes.
  3. Offen/Unsicher: was du nicht testen konntest, bekannte Schwächen, Ideen.
