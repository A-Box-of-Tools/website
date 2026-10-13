# YAML zu JSON — und JSON zurück zu YAML

Beide Richtungen, und es sagt Ihnen, was jede davon kostet. Nichts davon wird in den Server eines anderen eingefügt.

> Eine unterstützte Teilmenge von YAML 1.2 im Browser in JSON umwandeln und zurück. Anker, Aliase, Tags und mehrere Dokumente werden abgelehnt; Kommentare gehen in JSON verloren. Kein Upload.

Dies ist ein interaktives Browser-Werkzeug unter https://abox.tools/de/yaml-in-json-umwandeln/. Dateien werden auf dem Gerät verarbeitet, auf dem dieser Browser läuft. Bewusstes Teilen und optionale Netzwerkfunktionen werden auf der Seite erklärt. Hier folgt die schriftliche Erklärung; zum Benutzen öffnen Sie die Adresse.

## Ihre YAML- und JSON-Dateien werden **in Ihrem Browser verarbeitet**. Kein Upload zur Verarbeitung.

Umwandeln ist Rechnen auf einer Zeichenkette, und zwar hier, auf dieser Seite. Die beiden Parser sind von Hand geschrieben und liegen in `src/` — `shared/parse-yaml.js` und `shared/parse-json.js` — und mehr gibt es nicht. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, weder etwas abzurufen noch etwas zu senden. Das wiegt hier schwerer als fast überall sonst auf dieser Seite: Eine YAML-Datei ist meist eine Deployment-Konfiguration, und eine Deployment-Konfiguration steckt meist voller Hostnamen, Bucket-Namen und Geheimnisse.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Größengrenze
- ✓ Funktioniert offline
- ✓ Quelloffen

## So wandeln Sie YAML in JSON um, ohne es hochzuladen

1. **Wählen Sie die Richtung.** *YAML zu JSON* oder *JSON zu YAML*. Die Notiz unter dem Menü sagt Ihnen, was diese Richtung verliert, bevor Sie etwas einfügen, und nicht danach.
2. **Fügen Sie es ein, oder legen Sie die Datei ab.** Alles, was sich markieren und kopieren lässt, funktioniert. Eine Datei, die Sie auf das Auswahlfeld ziehen, wird von Ihrem eigenen Browser gelesen und in das Feld gesetzt — es gibt keinen Upload-Schritt, den man weglassen müsste — und eine Endung `.json` oder `.yaml` stellt die Richtung gleich mit ein.
3. **Wählen Sie die Einrückung.** Zwei Leerzeichen, vier oder ein Tabulator. Der Tabulator wird nur für JSON angeboten: YAML ist über Leerzeichen definiert, und ein Tabulator ist darin keine erlaubte Einrückung.
4. **Lesen Sie den Fehler dort, wo der Fehler ist.** Ein Parser, der hier scheitert, sagt, was er gefunden hat und in welcher Zeile und Spalte, statt „unerwartetes Token an Position 4193“. Das reicht üblicherweise, um eine Konfigurationsdatei zu reparieren, ohne sonst etwas zu öffnen.
5. **Nehmen Sie das Ergebnis mit.** Kopieren Sie es, oder laden Sie es als Datei herunter, benannt nach dem Format, in dem es herauskam.

## Die ausführliche Fassung

[Zwischen YAML und JSON umwandeln](https://abox.tools/de/guides/convert-yaml-and-json/): Eine unterstützte YAML-Teilmenge im Browser in JSON umwandeln oder zurück. Kommentarverlust, abgelehnte Konstrukte und genaue Zahlentexte vor Nutzung prüfen.

## Auch im Werkzeugkasten

- [XML-Formatierer](https://abox.tools/de/xml-formatieren/): XML zum Lesen ausgelegt oder zum Ausliefern flach gepresst, und in beide Richtungen zu JSON umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.
- [Textvergleich](https://abox.tools/de/text-vergleichen/): Zwei Texte hinein, jeder Unterschied markiert, Zeile für Zeile und Wort für Wort. Nichts davon wird in den Server eines anderen eingefügt.
- [Base64-Kodierer & -Dekodierer](https://abox.tools/de/base64-kodieren/): Base64, Prozentkodierung, HTML-Entities, Hex und Backslash-Escapes, in beide Richtungen. Nichts davon wird in den Server eines anderen eingefügt.
- [Text & Dateien teilen](https://abox.tools/de/text-teilen/): Die Freigabe lebt in diesem offenen Tab. Leser holen sie verschlüsselt direkt aus Ihrem Browser, und mit dem Schließen des Tabs endet sie - auf keinem Server ist irgendetwas gespeichert.

## Fragen

### Wird mein YAML irgendwohin hochgeladen?

Nein. Beide Parser und beide Schreiber auf dieser Seite sind Funktionen, die in Ihrem eigenen Browser auf Ihrer eigenen Hardware laufen. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht — es ruft nie etwas ab und sendet nie etwas — und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Genau deshalb ist es das Werkzeug für eine Deployment-Konfiguration: Die stecken voller Hostnamen, Bucket-Namen und gelegentlich eines Geheimnisses, das jemand verschieben wollte, und eine davon in den Umwandler eines anderen einzufügen heißt, sie ihm zu geben.

### Was geht beim Umwandeln von YAML in JSON verloren?

JSON verliert Kommentare. Dieser Parser unterstützt bewusst nur eine Teilmenge von YAML 1.2 und lehnt Anker, Aliase und Tags ab, statt eine Auflösung oder Typumwandlung für Sie zu wählen. JSON stellt einen Wertebaum dar; YAML kann gemeinsame Knoten und typisierte Werte darstellen. Mehrdokument-Streams werden abgelehnt statt in ein erfundenes Array verpackt. JSON zu YAML erhält die dargestellten Werte. [Die YAML-Spezifikation](https://yaml.org/spec/1.2.2/) beschreibt das umfassendere Format.

### In meinem YAML steht no, und im JSON kam eine Zeichenkette heraus. Warum?

YAML 1.1 las `yes`, `no`, `on` und `off` als Boolesche Werte und machte Norwegens Ländercode zu `false`. Diese unterstützte Teilmenge nutzt YAML 1.2: Diese Wörter bleiben Zeichenketten, `true` und `false` sind Boolesche Werte, `null` und `~` sind null, numerische Skalare sind Zahlen. Der YAML-Schreiber setzt mehrdeutige Wörter für ältere Leser in Anführungszeichen.

### Bleibt die Reihenfolge meiner Schlüssel erhalten?

Ja, in beiden Richtungen, und das ist schwerer, als es klingt. Ein Umwandler, der auf `JSON.parse` aufbaut, zieht ganzzahlig aussehende Schlüssel stillschweigend nach vorn, aus `{"10":a,"2":b}` wird also `{"2":b,"10":a}`. Zahlen behalten die Ziffern, die Sie getippt haben, eine zwanzigstellige Kontonummer verliert ihre letzten drei also nicht an ein Double. Wenn Sie sie *sortiert* haben wollen, gibt es ein Kästchen dafür, und es sortiert danach, wie die Schlüssel sich lesen, und nicht nach ihren Codepunkten.

### Kann es mehrere YAML-Dokumente auf einmal umwandeln?

Nein, und es sagt das, statt sich eines auszusuchen. Eine Datei mit `---`-Trennern enthält mehr als ein Dokument, und JSON hat keine Form, die „mehrere Dokumente“ bedeutet — ein Array wäre eine Behauptung, die die Datei nie aufgestellt hat. Wandeln Sie sie einzeln um.

### Warum gibt es hier keinen YAML-Formatierer?

Weil YAML keine gepresste Form hat, die sich zu schreiben lohnte — die kurze ist der Flow-Stil, der unlesbar ist, und unlesbar ist das Gegenteil des Grundes, eine Datei überhaupt in YAML zu halten. JSON, XML, HTML und CSS auszulegen, ist die Aufgabe des [JSON-Formatierers](https://abox.tools/de/json-formatieren/), und er legt auch YAML aus.

### Wie groß darf die Datei sein?

Hier ist keine Grenze eingebaut, denn es gibt keinen Server, der dafür bezahlt. Die praktische Obergrenze ist Ihr eigenes Gerät: Ein paar Megabyte YAML sind unproblematisch, und bei einem sehr langen Dokument wartet die Seite auf eine Pause beim Tippen, bevor sie umwandelt, statt Ihnen die Tastatur streitig zu machen.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und keine Grenze dafür, wie viel Sie einfügen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihren Text übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird: Ein Werkzeug, das Ihre Konfiguration zum Umwandeln wegschickt, bliebe in dem Moment stehen, in dem Sie die Verbindung trennen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Die Verarbeitung findet in diesem Browser statt.** Dieses Werkzeug verarbeitet Eingaben und Ergebnisse im Browser. Sein Verarbeitungscode lädt sie nicht zur Verarbeitung hoch. Content-Security-Policy begrenzt Ressourcen und Verbindungsziele; erlaubte Hosts können jedoch Anfragen empfangen. Die Richtlinie prüft keine Nutzdaten und beweist allein keine ausbleibende Übertragung. Vergleichen Sie Quelltext und konkrete Anfragen oder führen Sie die lokale Operation ohne Verbindung aus.
- **Nichts hier ruft etwas ab.** In `src/` gibt es nirgends ein `fetch`, kein `XMLHttpRequest` und kein `sendBeacon`. Beide Parser und beide Schreiber sind Funktionen auf dieser Seite, die eine Zeichenkette nehmen und eine Zeichenkette zurückgeben.
- **Die unterstützte Teilmenge nutzt YAML-1.2-Skalarregeln.** In YAML 1.1 war `no` ein Wahrheitswert, und das ist der berühmte Fehler, der aus dem Ländercode für Norwegen `false` macht. Hier wird 1.2 gelesen, wo es die Zeichenkette ist, nach der es aussieht. In der anderen Richtung werden diese Wörter *in Anführungszeichen* zurückgeschrieben, denn was die Datei als Nächstes öffnet, kann immer noch ein 1.1-Leser sein. `tests/js/text-convert.test.js` prüft beide Hälften.
- **Eine Umwandlung, die nicht ehrlich sein kann, hört lieber auf.** JSON verliert Kommentare. Dieser Parser unterstützt bewusst nur eine Teilmenge von YAML 1.2 und lehnt Anker, Aliase und Tags ab, statt eine Auflösung oder Typumwandlung für Sie zu wählen. JSON stellt einen Wertebaum dar; YAML kann gemeinsame Knoten und typisierte Werte darstellen. Mehrdokument-Streams werden abgelehnt statt in ein erfundenes Array verpackt. JSON zu YAML erhält die dargestellten Werte.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem von ihnen wird ein Zeichen Ihres Textes übergeben. Jede Zeile, die ihn liest, parst oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug arbeitet unverändert weiter, denn einen Netzschritt gab es darin nie. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/shared/parse-yaml.js` für den Leser, der einen Anker lieber ablehnt, als zu raten, was er bedeuten sollte, und `src/convert.js` dafür, warum eine Umwandlung ein Parser und ein Schreiber ist, ohne etwas dazwischen, das beide Formate zugleich kennt.
