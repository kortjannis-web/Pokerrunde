# Pokerrunde

Die App läuft über GitHub Pages direkt aus `main` (https://kortjannis-web.github.io/Pokerrunde/).

## Veröffentlichen

Jede Änderung, die im Chat gewünscht wird, sofort live stellen: committen und direkt nach `main` pushen
(zusätzlich auf den Arbeits-Branch der Sitzung, falls einer vorgegeben ist). Nicht auf einen Pull Request warten,
auch wenn die Änderung noch nicht perfekt ist.

## Online-Spiel: Ersatzlösungen bereithalten

Online-Tische und Freunde laufen ohne eigenen Server über den öffentlichen PeerJS-Server (`0.peerjs.com`)
und direkte WebRTC-Verbindungen. Sobald etwas auf Serverprobleme hindeutet, von dir aus eine Ersatzlösung
vorschlagen, und zwar direkt mit der Schritt-für-Schritt-Anleitung für den Nutzer aus `docs/online-ersatzloesungen.md`.
Nicht erst lange andere Ursachen suchen. Das gilt für:

- Verbindungsprobleme: Tisch lässt sich nicht erstellen, Beitreten scheitert, Freunde nie online, häufige Abbrüche
- Beschwerden über den Server: langsam, hängt, „geht wieder nicht“, Fehlermeldungen vom Vermittlungsserver
- Auslastung und Grenzen: Server überlastet, Limits/Kontingente erreicht (auch bei Supabase oder Cloudflare selbst)
- Probleme mit Cloudflare oder Wunsch nach Cloudflare

Reihenfolge: zuerst **Supabase Stufe 1**; macht Supabase Probleme (Ausfall, Auslastung, Limits) oder will der Nutzer
es nicht, **Cloudflare** vorschlagen; macht Cloudflare Probleme, zurück zu Supabase bzw. PeerJS als Rückfall.
Immer den bisherigen Weg als Rückfall im Code behalten.

## Online-Versionen

Ersteller und Mitspieler müssen dieselbe App-Version haben, sonst rechnen sie verschieden. Wer die Nachrichten
zwischen den Handys ändert (neue Felder/Nachrichtentypen, andere Bedeutung), erhöht die Versionsnummer:
Poker `hello`-Feld `v` = Konstante `PK_V` (aktuell 9; der Ersteller nimmt nur Mitspieler ab `PK_V` und schickt
älteren `{ t: 'old' }`; 9 bringt im `cos` die Siegesanimation `win`, das Profilbild `av` und den Regenschirm `um` sowie
Wurfgegenstände `{ t: 'tom', k }` (k fehlt = Tomate, `k: 'schirm'` = Abprall-Meldung mit `n`), 8 Profilrahmen und Titel
`cos { frame, title }` im öffentlichen Profil und im Stand, 7 Schnellsätze `{ t: 'chat', q }` und Karten zeigen `{ t: 'show', c }`
mit den Feldern `sh`/`sb` im Stand, 6 ersetzt das Level `lv` durch die Sternzahl `st` im öffentlichen Profil, 5 brachte `lv`,
4 das Feld `rid` zum Wiederverbinden), Blackjack `BJ_V` (aktuell 9: `cos.win/av/um` und Würfe mit `k`, 8 `cos` im Profil,
7 Schnellsätze), Roulette `RL_V` (aktuell 6: `cos.win/av/um` und Würfe `{ t: 'tom' }`, 5 `cos` im Profil,
4 Reaktionen und Schnellsätze); bei Blackjack
und Roulette müssen beide Seiten genau gleich sein. Alte Versionen werden dann mit einer Meldung „App einmal ganz schließen und neu öffnen“ abgewiesen.
Das Feld `cos` (siehe `window.PRLook` in index.html) ist erweiterbar: neue Unterfelder mit `PRLook.field(name, clean, mine)`
anmelden; ältere Apps ignorieren unbekannte Unterfelder. Wer `cos` neu belegt (z. B. Siegesanimation `win`), erhöht trotzdem
die Versionen, damit alle am Tisch dasselbe sehen. Die Freundesliste (`myPub`) hat keine Version und schickt `cos` einfach mit.
