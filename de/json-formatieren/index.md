# JSON-Formatierer — auslegen, flach pressen oder umwandeln

JSON, XML, HTML, CSS und YAML, formatiert oder umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.

> JSON, XML, HTML, CSS und YAML formatieren und minimieren und JSON in YAML oder XML umwandeln und zurück. Die Parser laufen in Ihrem Browser, hochgeladen wird nichts - ein Token oder eine Konfigurationsdatei verlässt Ihr Gerät also nie.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/json-formatieren/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Texte und Codes werden **nie hochgeladen**. Es gibt keinen Server.

Formatieren und Umwandeln sind Rechnen auf einer Zeichenkette, und zwar hier, auf dieser Seite. Die Parser sind von Hand geschrieben und liegen in `src/` — `shared/parse-json.js`, `shared/parse-xml.js`, `css.js`, `shared/parse-yaml.js` — und mehr gibt es nicht. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, weder etwas abzurufen noch etwas zu senden. Das wiegt hier schwerer als fast überall sonst auf dieser Seite, denn was Menschen in einen Formatierer einfügen, sind Zugriffstoken, Sitzungscookies, Kundendaten und unveröffentlichter Code.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Größengrenze
- ✓ Funktioniert offline
- ✓ Quelloffen

## So formatieren oder wandeln Sie JSON um, ohne es hochzuladen

1. **Wählen Sie die Aufgabe.** Zwei Reiter, ein Eingabefeld: *Formatieren* legt JSON, XML, HTML, CSS und YAML aus oder presst sie zusammen; *Umwandeln* macht aus JSON YAML oder XML und zurück. Der Text, den Sie gerade formatiert haben, ist der Text, den Sie umwandeln, ohne ihn zweimal einzufügen.
2. **Fügen Sie ihn ein oder ziehen Sie die Datei her.** Alles, was sich markieren und kopieren lässt, funktioniert. Eine auf das Auswahlfeld gezogene Datei liest Ihr eigener Browser und legt sie ins Feld. Einen Upload-Schritt gibt es hier nicht wegzulassen.
3. **Lassen Sie die Sprache erkennen, oder sagen Sie sie.** Das Menü zeigt, als was der Text gelesen wurde, und das zu korrigieren ist ein Klick. Eine Erkennung ist nur ein Ausgangspunkt, und deshalb wird sie angezeigt statt stillschweigend angewendet.
4. **Wählen Sie die Einrückung, oder pressen Sie es flach.** Zwei Leerzeichen, vier oder ein Tabulator. Flach gepresst ist dasselbe Dokument, nur ohne jedes Leerzeichen, das nur zum Lesen da war, und das Ergebnis sagt, wie viele Bytes das gespart hat.
5. **Lesen Sie den Fehler dort, wo der Fehler ist.** Ein Parser, der hier scheitert, sagt, was er gefunden hat und in welcher Zeile und Spalte, statt „unerwartetes Zeichen an Position 4193“. Das reicht meist, um eine Konfigurationsdatei zu reparieren, ohne sonst etwas zu öffnen.
6. **Nehmen Sie das Ergebnis mit.** Kopieren Sie es, oder laden Sie es als Datei herunter, benannt nach der Sprache, in der es herauskam.

## Die ausführliche Fassung

[JSON formatieren, ohne es jemandem zu geben](https://abox.tools/de/ratgeber/json-formatieren/): JSON im eigenen Browser einrücken, prüfen und minifizieren: was ein Formatierer an Ihrer Datei niemals ändern darf, wie Sie die Fehlermeldung lesen, und warum es zählt, in welches Feld Sie das einfügen.

## Auch im Werkzeugkasten

- [YAML-zu-JSON-Umwandler](https://abox.tools/de/yaml-in-json-umwandeln/): Beide Richtungen, und es sagt Ihnen, was jede davon kostet. Nichts davon wird in den Server eines anderen eingefügt.
- [XML-Formatierer](https://abox.tools/de/xml-formatieren/): XML zum Lesen ausgelegt oder zum Ausliefern flach gepresst, und in beide Richtungen zu JSON umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.
- [Textvergleich](https://abox.tools/de/text-vergleichen/): Zwei Texte hinein, jeder Unterschied markiert, Zeile für Zeile und Wort für Wort. Nichts davon wird in den Server eines anderen eingefügt.
- [Base64-Kodierer & -Dekodierer](https://abox.tools/de/base64-kodieren/): Base64, Prozentkodierung, HTML-Entities, Hex und Backslash-Escapes, in beide Richtungen. Nichts davon wird in den Server eines anderen eingefügt.

## Fragen

### Wird mein Text irgendwohin hochgeladen?

Nein. Alles, was auf dieser Seite liest oder schreibt, sind Funktionen, die in Ihrem eigenen Browser auf Ihrer eigenen Hardware laufen. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, es ruft nie etwas ab und sendet nie etwas, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Genau deshalb sollte man es für ein Zugriffstoken, ein Sitzungscookie oder einen Kundendatensatz nehmen: So etwas in den Formatierer eines anderen einzufügen, heißt, es ihm zu geben.

### Ändert das Formatieren von JSON etwas außer der Anordnung?

Nein, und das ist schwerer, als es klingt. Die Schlüssel behalten die Reihenfolge, in der Sie sie geschrieben haben. Ein Formatierer, der auf `JSON.parse` aufbaut, zieht zahlartige Schlüssel stillschweigend nach vorn, aus `{"10":a,"2":b}` wird also `{"2":b,"10":a}`. Zahlen behalten die Ziffern, die Sie getippt haben, eine zwanzigstellige Kennung verliert ihre letzten drei also nicht an eine Fließkommazahl, und `1e999` wird nicht zu `null`. Doppelte Schlüssel bleiben beide erhalten, denn der Standard sagt nicht, welcher gewinnt, und einen wegzuwerfen hieße, für Sie zu entscheiden.

### Welche Sprachen kann es formatieren?

JSON, XML, HTML, CSS und YAML. JSON, XML, HTML und CSS lassen sich auch flach pressen, YAML nicht: Seine Kurzform ist der Flow-Stil, und der ist unlesbar, und unlesbar ist das Gegenteil des Grundes, eine Datei überhaupt in YAML zu halten. JavaScript steht mit Absicht nicht auf der Liste, siehe die Frage weiter unten.

### Warum formatiert es kein JavaScript, Python oder SQL?

Weil eine Programmiersprache auszulegen bedeutet, sie richtig zu parsen, und ein Formatierer, der es fast richtig macht, ist schlimmer als gar keiner: Er erzeugt Code, der gut aussieht und etwas anderes tut. JSON, XML, CSS und YAML haben kleine genug Grammatiken, um von Hand gelesen und mit Tests geprüft zu werden, die Sie selbst ausführen können. Ein JavaScript-Formatierer ist Prettier, das ist ein Megabyte Parser, und der gehört in Ihren Editor und nicht auf eine Webseite.

### Mein YAML sagt no, und aus dem JSON wurde eine Zeichenkette. Warum?

Weil es eine Zeichenkette ist: Hier wird YAML 1.2 gelesen und nicht 1.1. In YAML 1.1 waren `yes`, `no`, `on` und `off` Wahrheitswerte, und das ist der berühmte Fehler, der den Ländercode für Norwegen zu `false` macht. YAML 1.2 hat das abgeschafft, und dieses Werkzeug ebenso: Nur `true`, `false`, `null` und `~` werden als etwas anderes gelesen als Text. In die andere Richtung werden diese Wörter *in Anführungszeichen* zurückgeschrieben, obwohl dieses Werkzeug sie auch ohne als Text läse, denn was die Datei als Nächstes öffnet, tut das vielleicht nicht. PyYAML nimmt weiterhin standardmäßig 1.1. Streng zu lesen und vorsichtig zu schreiben ist die einzige Kombination, die in beide Richtungen stimmt.

### Was geht bei der Umwandlung von YAML nach JSON verloren?

Kommentare, denn JSON hat keinen Ort für sie. Anker, Aliase und Tags werden rundheraus abgelehnt statt geraten: Jedes davon sagt etwas, was JSON nicht sagen kann, und ein Umwandler, der sich stillschweigend für eine Auslegung entschiede, gäbe Ihnen ein Dokument, das nicht das ist, was in der Datei stand. In die andere Richtung geht nichts verloren: Jedes JSON-Dokument ist bereits ein YAML-Dokument.

### Was geht bei der Umwandlung von JSON nach XML verloren?

Der Unterschied zwischen einem leeren Objekt, einem leeren Array und einer leeren Zeichenkette, die alle zu einem leeren Element werden, und der Typ jedes Werts, denn XML hat keine Typen. Deshalb lässt die Rückumwandlung auch alles als Zeichenkette stehen, statt zu entscheiden, dass `8080` eine Zahl war. Aus einem Array wird ein wiederholtes Element, denn nur diese Form lässt sich zurücklesen, und bei einem Schlüssel, den ein Elementname nicht tragen kann, werden die sperrigen Zeichen ersetzt, statt ein Dokument auszugeben, das kein Parser liest.

### Ändert das Neu-Einrücken von HTML das Aussehen der Seite?

Es kann, und das wird hier ehrlich gesagt. Leerraum zwischen zwei Inline-Elementen ist ein Abstand zwischen zwei Wörtern, ihn zu verschieben ist also nicht umsonst. Zwei Dinge halten das im Zaum: `<pre>` und `<textarea>` werden exakt so übernommen, wie sie waren, und ein Element, das nichts als Text enthält, bleibt in einer Zeile. Alles andere wird ausgelegt.

### Wie groß darf die Datei sein?

Hier ist keine Grenze gesetzt, denn es zahlt kein Server dafür. Die praktische Obergrenze ist Ihr eigenes Gerät: Ein paar Megabyte JSON sind kein Problem, und bei einem sehr langen Dokument wartet die Seite auf eine Pause in Ihrem Tippen, statt mit Ihnen um die Tastatur zu kämpfen.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und keine Grenze dafür, wie viel Sie einfügen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihren Text übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihren Text zum Formatieren wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Was Sie einfügen, hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem ein eingefügtes Token eingesammelt werden könnte, und im Code steht auch nichts, das es dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** In `src/` gibt es nirgends ein `fetch`, kein `XMLHttpRequest` und kein `sendBeacon`. Alles, was hier liest oder schreibt, sind Funktionen auf dieser Seite, die eine Zeichenkette nehmen und eine Zeichenkette zurückgeben.
- **Die Formatierer behalten, was sie bekommen haben.** Ein JSON-Objekt kommt mit seinen Schlüsseln in der Reihenfolge zurück, in der Sie sie geschrieben haben, und mit den Zahlen so geschrieben, wie Sie sie geschrieben haben. Denn `src/shared/parse-json.js` ist ein Parser und kein Aufruf von `JSON.parse`, das zahlartige Schlüssel umsortiert und aus einer zwanzigstelligen Kennung die nächstgelegene Fließkommazahl macht. Die Tests in `tests/js/text-format.test.js` prüfen genau das.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird ein Zeichen Ihres Textes übergeben. Jede Zeile, die ihn liest, auswertet oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/shared/parse-json.js` für den Parser, der Ihre Schlüssel in der Reihenfolge lässt, in der Sie sie geschrieben haben, und `src/convert.js` dafür, warum eine Umwandlung ein Parser und ein Schreiber ist, ohne etwas dazwischen, das beide Formate zugleich kennt.
