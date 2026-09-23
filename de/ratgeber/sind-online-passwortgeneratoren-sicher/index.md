# Ist es sicher, einen Online-Passwortgenerator zu benutzen?

Ihr Verdacht ist richtig, behalten Sie ihn: Eine Seite, die Passwörter erzeugt, ist genau die Seite, die sie sich nicht merken darf. Die gute Nachricht ist, dass sich das prüfen lässt — die Zufälligkeit entsteht auf Ihrer Maschine, Senden ist sichtbar, und ein Generator, der behält, was er erzeugt, lässt sich ertappen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Der Verdacht hinter dieser Frage ist genau richtig, also behalten Sie ihn. Eine Seite, die Passwörter erzeugt, ist die eine Seite im Netz, die nichts Empfindliches empfängt und alles Empfindliche *behalten* könnte: Ihre Ausgabe ist das Geheimnis, und ein Generator, der sein Erzeugnis überträgt, wäre kein schwaches Werkzeug, sondern eine Passwortsammlung. Die Frage ist nie, ob eine Generator-Seite vertrauenswürdig aussieht. Sie ist, ob sie das Passwort behalten *könnte*, wenn sie wollte — und das lässt sich, ungewöhnlicherweise, prüfen.

Drei Dinge entscheiden es: woher die Zufälligkeit kommt, ob das Ergebnis die Seite verlassen kann, und ob irgendetwas am Ergebnis vorhersagbar ist. Alle drei haben ehrliche Antworten, die ein Besucher nachprüfen kann — mehr, als sich von einem heruntergeladenen Programm sagen lässt, das in einem Fenster erzeugt, in das niemand hineinsehen kann.

## Woher Browser-Zufall kommt

Jeder ernsthafte Generator in einem Browser schöpft aus einem Brunnen: `crypto.getRandomValues`, dem kryptografischen Zufallsgenerator des Browsers, vom Betriebssystem aus Hardware- Rauschen gespeist und laufend nachgespeist. Es ist dieselbe Quelle, aus der der Browser TLS-Schlüssel zieht — die Verschlüsselung, auf der Ihre Bankverbindung läuft. Es gibt keinen nennenswerten Sinn, in dem ein Desktop-Programm besseren Zufall hätte als eine Webseite; beide enden am selben Brunnen des Betriebssystems.

Was eine Seite *nicht* benutzen darf, ist `Math.random()`, die Würfelfunktion für den Hausgebrauch. Browser implementieren sie mit einem schnellen Generator, dessen innerer Zustand sich aus einer Handvoll aufeinanderfolgender Ausgaben rekonstruieren lässt — Passwörter darauf gebaut sehen zufällig aus und sind berechenbar für jeden, der eines davon gesehen hat. Das ist nicht theoretisch; es ist gegen ausgelieferte Generatoren mehr als einmal vorgeführt worden. Von außen ist es zudem unsichtbar — das stärkste Argument für Generatoren, deren Code sich lesen lässt: Der Unterschied zwischen den beiden Funktionen ist ein Wort im Quelltext.

Darüber hinaus gibt es noch eine feinere Stufe der Sorgfalt. Aus zufälligen 32-Bit-Worten „eine Zahl unter 26“ per simplem Rest zu machen ist ganz leicht zu den niedrigen Buchstaben hin verzerrt; ein sorgfältiger Generator zieht stattdessen neu. Der [Generator hier](https://abox.tools/de/passwort-generator/) tut das — die vermiedene Verzerrung liegt bei etwa eins zu 165 Millionen, im Gebrauch unsichtbar und genau die Sorte Detail, die ein für die Aufgabe gebautes Werkzeug von einem aus dem Forum kopierten Schnipsel trennt.

## Was eine schlechte Generator-Seite tun könnte

Die Versagensarten beim Namen genannt, denn jede ist prüfbar:

- **Das Passwort hinausschicken.** Die Seite erzeugt lokal und sendet dann, was sie erzeugt hat — beim Klick, mit der Analytik, später gebündelt. Das ist die disqualifizierende Variante, und sie ist sichtbar: Es muss eine Netzwerkanfrage sein, und Anfragen lassen sich beobachten.
- **Auf dem Server erzeugen.** Das Passwort kommt über das Netz an, statt darüber zu gehen — der Betreiber hat es also zuerst gesehen, und über seine Entstehung erfahren Sie nichts. Dieselbe Prüfung, andere Richtung.
- **Schwach erzeugen.** `Math.random`, ein Zeitstempel als Saat, eine Wortliste von ein paar hundert Einträgen, als stark verkauft. Kein Netzwerk-Tab fängt diese Variante; nur lesbarer Quelltext, oder eine ehrliche Stärkeanzeige, die aus den tatsächlichen Einstellungen gezählt ist.
- **Eine Chronik führen.** Hilfsbereit die letzten zwanzig Passwörter merken — in einem Speicher, der den Tab überlebt, auf einer Maschine, die geteilt sein könnte.

Der [Passwort- und Passphrasen-Generator](https://abox.tools/de/passwort-generator/) dieser Seite ist gegen alle vier von Bauart her gefeit: `crypto.getRandomValues` und sonst nichts, Erzeugung in der Seite, keinerlei Speicherung, keine Chronik, und eine Stärkezeile, die exakt meldet, wie viele Ergebnisse mit Ihren Einstellungen möglich waren. Die Wortlisten für Passphrasen sind die Diceware-Listen der EFF, unverändert im eigenen Ordner des Werkzeugs mitgeliefert.

## Wie man jeden Generator prüft, diesen eingeschlossen

Die vollständige Methode steht im [Ratgeber zum Hochladen](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/), und dies ist die Seite, auf die man sie vor allen anderen anwendet:

- **Erst den Stecker ziehen.** Seite laden, offline gehen, *dann* erzeugen. Ein ohne Verbindung erzeugtes Passwort kann nicht geholt worden sein und nicht im Moment seiner Entstehung gesendet worden sein. Diese Seite arbeitet offline weiter; das ist ihr Sinn.
- **Den Netzwerk-Tab beim Erzeugen beobachten.** Knopf drücken, Liste ansehen: Nichts darf abgehen. Dann das Passwort kopieren und wieder hinsehen — das Kopieren ist der Moment, den eine unehrliche Seite wählen würde.
- **Nach dem suchen, was eine Sammlung bräuchte.** Ein Konto, eine Sync-Funktion, eine Liste „zuletzt erzeugt“. Ein Generator mit Gedächtnis hat eine Kopie.

Ein ehrlicher Vorbehalt gehört ans Ende. Eine Prüfung sagt, was die Seite tat, während Sie zusahen; Code, der veröffentlicht ist und lesbar ausgeliefert wird — wie alles auf dieser Seite —, sagt, was sie überhaupt tut. Bleibt die Maschine selbst: Keine Webseite kann ein Passwort vor einem kompromittierten Browser oder mitlesender Schadsoftware schützen, ein Generator auch nicht. Was die Prüfungen einbringen, ist kleiner und real — ein Passwort, das nie ein Server gesehen hat, erzeugt von Arithmetik, die Sie lesen durften.
