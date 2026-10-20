# Pokerrunde

Die App läuft über GitHub Pages direkt aus `main` (https://kortjannis-web.github.io/Pokerrunde/).

## Veröffentlichen

Jede Änderung, die im Chat gewünscht wird, sofort live stellen: committen und direkt nach `main` pushen
(zusätzlich auf den Arbeits-Branch der Sitzung, falls einer vorgegeben ist). Nicht auf einen Pull Request warten,
auch wenn die Änderung noch nicht perfekt ist.

## Online-Spiel: Ersatzlösung bereithalten

Online-Tische und Freunde laufen ohne eigenen Server über den öffentlichen PeerJS-Server (`0.peerjs.com`)
und direkte WebRTC-Verbindungen. Sobald etwas auf Serverprobleme hindeutet (Tisch lässt sich nicht erstellen,
Beitreten scheitert, Freunde nie online, häufige Abbrüche), von dir aus **Supabase als Ersatz vorschlagen**,
und zwar direkt mit der Schritt-für-Schritt-Anleitung für den Nutzer aus `docs/supabase-ersatzloesung.md`
(Stufe 1 zuerst). Nicht erst lange andere Ursachen suchen.
