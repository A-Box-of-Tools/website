# YAML zu JSON — und JSON zurück zu YAML

Beide Richtungen, und es sagt Ihnen, was jede davon kostet. Nichts davon wird in den Server eines anderen eingefügt.

> YAML in JSON und JSON in YAML umwandeln, in Ihrem Browser. Gelesen wird YAML 1.2, also bleiben yes und no Zeichenketten, und es sagt genau, was jede Richtung verliert. Hochgeladen wird nichts, eine Konfigurationsdatei verlässt Ihr Gerät also nie.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/yaml-in-json-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre YAML- und JSON-Dateien werden **nie hochgeladen**. Es gibt keinen Server.

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

## Auch im Werkzeugkasten

- [XML-Formatierer](https://abox.tools/de/xml-formatieren/): XML zum Lesen ausgelegt oder zum Ausliefern flach gepresst, und in beide Richtungen zu JSON umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.
- [Textvergleich](https://abox.tools/de/text-vergleichen/): Zwei Texte hinein, jeder Unterschied markiert, Zeile für Zeile und Wort für Wort. Nichts davon wird in den Server eines anderen eingefügt.
- [Base64-Kodierer & -Dekodierer](https://abox.tools/de/base64-kodieren/): Base64, Prozentkodierung, HTML-Entities, Hex und Backslash-Escapes, in beide Richtungen. Nichts davon wird in den Server eines anderen eingefügt.
- [Text & Dateien teilen](https://abox.tools/de/text-teilen/): Die Freigabe lebt in diesem offenen Tab. Leser holen sie verschlüsselt direkt aus Ihrem Browser, und mit dem Schließen des Tabs endet sie - auf keinem Server ist irgendetwas gespeichert.

## Fragen

### Wird mein YAML irgendwohin hochgeladen?

Nein. Beide Parser und beide Schreiber auf dieser Seite sind Funktionen, die in Ihrem eigenen Browser auf Ihrer eigenen Hardware laufen. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht — es ruft nie etwas ab und sendet nie etwas — und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Genau deshalb ist es das Werkzeug für eine Deployment-Konfiguration: Die stecken voller Hostnamen, Bucket-Namen und gelegentlich eines Geheimnisses, das jemand verschieben wollte, und eine davon in den Umwandler eines anderen einzufügen heißt, sie ihm zu geben.

### Was geht beim Umwandeln von YAML in JSON verloren?

Die Kommentare, denn JSON hat keinen Platz für einen. Anker, Aliase und Tags werden rundheraus abgelehnt, statt erraten zu werden — jedes davon sagt etwas, das JSON nicht sagen kann, und ein Umwandler, der stillschweigend eine Deutung auswählte, gäbe Ihnen ein Dokument, das nicht das ist, was in der Datei stand. Die andere Richtung verliert nichts: Jedes JSON-Dokument ist bereits ein YAML-Dokument.

### In meinem YAML steht no, und im JSON kam eine Zeichenkette heraus. Warum?

Weil es eine Zeichenkette ist und hier YAML 1.2 gelesen wird, nicht 1.1. In YAML 1.1 waren `yes`, `no`, `on` und `off` Wahrheitswerte, und das ist der berühmte Fehler, der aus dem Ländercode für Norwegen `false` macht. YAML 1.2 hat das fallen gelassen, und dieses Werkzeug auch: Nur `true`, `false`, `null` und `~` werden als etwas anderes als Text gelesen. In der anderen Richtung werden diese Wörter *in Anführungszeichen* zurückgeschrieben, obwohl sie hier auch ohne als Text gelesen würden — denn was die Datei als Nächstes öffnet, tut das vielleicht nicht. PyYAML verwendet immer noch 1.1 als Voreinstellung. Streng zu lesen und vorsichtig zu schreiben, ist die einzige Kombination, die in beide Richtungen richtig ist.

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

- **Was Sie einfügen, hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem eine eingefügte Konfiguration eingesammelt werden könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** In `src/` gibt es nirgends ein `fetch`, kein `XMLHttpRequest` und kein `sendBeacon`. Beide Parser und beide Schreiber sind Funktionen auf dieser Seite, die eine Zeichenkette nehmen und eine Zeichenkette zurückgeben.
- **Es liest YAML 1.2, Norwegen bleibt also Norwegen.** In YAML 1.1 war `no` ein Wahrheitswert, und das ist der berühmte Fehler, der aus dem Ländercode für Norwegen `false` macht. Hier wird 1.2 gelesen, wo es die Zeichenkette ist, nach der es aussieht. In der anderen Richtung werden diese Wörter *in Anführungszeichen* zurückgeschrieben, denn was die Datei als Nächstes öffnet, kann immer noch ein 1.1-Leser sein. `tests/js/text-convert.test.js` prüft beide Hälften.
- **Eine Umwandlung, die nicht ehrlich sein kann, hört lieber auf.** Ein Anker, ein Alias oder ein Tag im YAML beendet die Umwandlung mit einer Meldung, in welcher Zeile er steht, statt ein JSON-Dokument zu liefern, das stillschweigend etwas anderes bedeutet. JSON hat keine Möglichkeit, „derselbe Knoten zweimal“ zu sagen, und eine Deutung auszuwählen hieße, für Sie zu entscheiden.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem von ihnen wird ein Zeichen Ihres Textes übergeben. Jede Zeile, die ihn liest, parst oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug arbeitet unverändert weiter, denn einen Netzschritt gab es darin nie. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/shared/parse-yaml.js` für den Leser, der einen Anker lieber ablehnt, als zu raten, was er bedeuten sollte, und `src/convert.js` dafür, warum eine Umwandlung ein Parser und ein Schreiber ist, ohne etwas dazwischen, das beide Formate zugleich kennt.
