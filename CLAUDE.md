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
Poker `hello`-Feld `v` = Konstante `PK_V` (aktuell 5; der Ersteller nimmt nur Mitspieler ab `PK_V` und schickt
älteren `{ t: 'old' }`; 5 ergänzt das Level `lv` im öffentlichen Profil, 4 das Feld `rid` zum Wiederverbinden),
Blackjack `BJ_V` (aktuell 5), Roulette `RL_V` (aktuell 2); bei Blackjack und Roulette müssen beide Seiten genau
gleich sein. Alte Versionen werden dann mit einer Meldung „App einmal ganz schließen und neu öffnen“ abgewiesen.
