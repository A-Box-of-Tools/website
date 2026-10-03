# XML-Formatierer — auslegen, flach pressen oder in JSON umwandeln

XML zum Lesen ausgelegt oder zum Ausliefern flach gepresst, und in beide Richtungen zu JSON umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.

> XML formatieren, einrücken und minimieren und XML in JSON oder JSON in XML umwandeln. Der Parser läuft in Ihrem Browser, hochgeladen wird nichts - ein Feed, eine Rechnung oder eine Konfigurationsdatei verlässt Ihr Gerät also nie.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/xml-formatieren/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre XML- und JSON-Dateien werden **nie hochgeladen**. Es gibt keinen Server.

Formatieren und Umwandeln sind Rechnen auf einer Zeichenkette, und zwar hier, auf dieser Seite. Der Parser ist von Hand geschrieben und steht in `src/shared/parse-xml.js`, und mehr gibt es nicht. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, weder etwas abzurufen noch etwas zu senden. Das wiegt hier schwerer, als das Wort „XML“ vermuten lässt, denn was in diesem Format ankommt, ist meist eine Rechnung, ein Kontoauszug, eine Patientenakte oder eine SOAP-Nachricht mit den Zugangsdaten von jemandem im Kopf.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Größengrenze
- ✓ Funktioniert offline
- ✓ Quelloffen

## So formatieren Sie XML, ohne es hochzuladen

1. **Wählen Sie die Aufgabe.** Zwei Reiter, ein Feld: *Formatieren* legt XML aus oder presst es flach, *Umwandeln* macht JSON daraus oder JSON wieder zu XML. Das XML, das Sie gerade ausgelegt haben, ist das XML, das Sie umwandeln, ohne es zweimal einzufügen.
2. **Fügen Sie es ein, oder legen Sie die Datei ab.** Alles, was sich markieren und kopieren lässt, funktioniert, und eine `.xml`-, `.svg`-, `.rss`- oder `.xsd`-Datei, die Sie auf das Auswahlfeld ziehen, wird von Ihrem eigenen Browser gelesen und in das Feld gesetzt. Es gibt keinen Upload-Schritt, den man weglassen müsste.
3. **Wählen Sie die Einrückung, oder pressen Sie es flach.** Zwei Leerzeichen, vier oder ein Tabulator. Flach gepresst ist dasselbe Dokument ohne jedes Leerzeichen, das nur zum Lesen da war, und das Ergebnis sagt, wie viele Bytes das gespart hat.
4. **Lesen Sie den Fehler dort, wo der Fehler ist.** Ein Parser, der hier scheitert, sagt, *welches Tag* nie geschlossen wurde und in welcher Zeile und Spalte, statt „Fehler in Zeile 1“, was ein Browser über ein Dokument sagt, das er auf einen Schlag gelesen hat.
5. **Nehmen Sie das Ergebnis mit.** Kopieren Sie es, oder laden Sie es als Datei herunter, benannt nach dem Format, in dem es herauskam.

## Auch im Werkzeugkasten

- [Textvergleich](https://abox.tools/de/text-vergleichen/): Zwei Texte hinein, jeder Unterschied markiert, Zeile für Zeile und Wort für Wort. Nichts davon wird in den Server eines anderen eingefügt.
- [Base64-Kodierer & -Dekodierer](https://abox.tools/de/base64-kodieren/): Base64, Prozentkodierung, HTML-Entities, Hex und Backslash-Escapes, in beide Richtungen. Nichts davon wird in den Server eines anderen eingefügt.
- [Text & Dateien teilen](https://abox.tools/de/text-teilen/): Die Freigabe lebt in diesem offenen Tab. Leser holen sie verschlüsselt direkt aus Ihrem Browser, und mit dem Schließen des Tabs endet sie - auf keinem Server ist irgendetwas gespeichert.
- [QR- & Barcode-Generator](https://abox.tools/de/qr-code-erstellen/): Eintippen, und es wird ein Code. Zum Erzeugen wird nichts gesendet.

## Fragen

### Wird mein XML irgendwohin hochgeladen?

Nein. Der Parser und der Drucker auf dieser Seite sind Funktionen, die in Ihrem eigenen Browser auf Ihrer eigenen Hardware laufen. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht — es ruft nie etwas ab und sendet nie etwas — und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Das wiegt bei XML schwerer, als der Ruf des Formats vermuten lässt: Was darin ankommt, ist meist eine Rechnung, ein Kontoauszug, eine Patientenakte oder eine SOAP-Anfrage mit Zugangsdaten im Kopf.

### Löst es externe Entitäten auf?

Nein, und es gibt auch nichts abzuschalten. Das Auflösen externer Entitäten ist der Weg, auf dem ein XML-Parser dazu gebracht wird, Dateien von dem Gerät zu lesen, auf dem er läuft — der Angriff, der üblicherweise XXE geschrieben wird — und `src/shared/parse-xml.js` ist ein von Hand geschriebener Leser ohne jede Entitätsauflösung. Ihr Text wird auch niemals dem `DOMParser` des Browsers übergeben. Ein `DOCTYPE` wird durchgereicht, ohne jemals ausgeführt zu werden.

### Was geht beim Umwandeln von XML in JSON verloren?

Die Reihenfolge gemischter Inhalte, die Kommentare und der Unterschied zwischen einem Attribut und einem Kindelement — wobei der letzte eher abgemildert als getilgt wird, denn ein Attribut wird zu einem Member, dessen Name mit `@` anfängt. Der eigene Text eines Elements wird zu `#text`, wenn er neben etwas anderem stehen muss, und wiederholte Kinder werden zu einem Array. Jeder Wert bleibt eine Zeichenkette: XML kennt keine Typen, und zu entscheiden, dass `8080` eine Zahl war, hieße, eine Information zu erfinden.

### Was geht beim Umwandeln von JSON in XML verloren?

Der Unterschied zwischen einem leeren Objekt, einem leeren Array und einer leeren Zeichenkette, die alle drei zu einem leeren Element werden, und der Typ jedes Werts, denn XML kennt keine Typen. Ein Array wird zu einem wiederholten Element, was die einzige Form ist, die sich zurücklesen lässt, und bei einem Schlüssel, den ein Elementname nicht tragen kann, werden die sperrigen Zeichen ersetzt, statt ein Dokument auszugeben, das kein Parser lesen wird.

### Kann es ein SVG, einen RSS-Feed oder eine POM-Datei formatieren?

Ja. Alle drei sind XML, und dies liest XML und nicht irgendeinen bestimmten Dialekt davon. Ein so ausgelegtes SVG lässt sich leichter von Hand bearbeiten; ein RSS- oder Atom-Feed wird üblicherweise flach gepresst ausgeliefert und ist unlesbar, bis ihn etwas wieder auseinander legt. An der Bedeutung des Dokuments ändert die Anordnung nichts.

### Ändert das neue Einrücken die Bedeutung des XML?

Bei einem Dokument, dessen Elemente andere Elemente enthalten, nicht. Wo es eine Rolle spielen kann, ist Text: Leerraum innerhalb eines Elements, das Wörter enthält, ist Teil dieses Textes, und deshalb bleibt ein Element, das nichts als Text enthält, auf einer Zeile, statt auseinandergelegt zu werden. `CDATA`-Abschnitte werden genau so durchgereicht, wie sie waren.

### Warum nicht einfach den XML-Parser des Browsers nehmen?

Wegen dem, was er sagt, wenn das Dokument kaputt ist. Der `DOMParser` gibt ein Fehlerdokument zurück, dessen Wortlaut in jedem Browser anders ist und oft auf „Fehler in Zeile 1“ hinausläuft. Ein von Hand geschriebener Leser kann sagen, welches Tag nie geschlossen wurde und wo es geöffnet wurde, und genau das wollten Sie wissen. Keine externen Entitäten aufzulösen, ist der zweite Grund.

### Wie groß darf die Datei sein?

Hier ist keine Grenze eingebaut, denn es gibt keinen Server, der dafür bezahlt. Die praktische Obergrenze ist Ihr eigenes Gerät: Ein paar Megabyte XML sind unproblematisch, und bei einem sehr langen Dokument wartet die Seite auf eine Pause beim Tippen, bevor sie neu formatiert, statt Ihnen die Tastatur streitig zu machen.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und keine Grenze dafür, wie viel Sie einfügen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihren Text übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr XML zum Formatieren wegschickt, bliebe in dem Moment stehen, in dem Sie die Verbindung trennen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Was Sie einfügen, hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem eine eingefügte Rechnung eingesammelt werden könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** In `src/` gibt es nirgends ein `fetch`, kein `XMLHttpRequest` und kein `sendBeacon`. Der Parser und der Drucker sind Funktionen auf dieser Seite, die eine Zeichenkette nehmen und eine Zeichenkette zurückgeben.
- **Externe Entitäten werden niemals aufgelöst.** Ein `DOCTYPE` mit einer externen Entität darin ist der Weg, auf dem ein XML-Parser dazu gebracht wird, eine Datei von dem Gerät zu lesen, das gerade parst, und es ist das älteste Loch des Formats. `src/shared/parse-xml.js` ist ein von Hand geschriebener Leser, in dem überhaupt keine Entitätsauflösung steckt — nicht abgeschaltet, sondern gar nicht vorhanden — und diese Seite übergibt Ihren Text auch niemals dem `DOMParser` des Browsers.
- **Jeder Wert aus XML ist eine Zeichenkette.** `<port>8080</port>` sagt nichts darüber, ob das eine Zahl ist, also steht im JSON `"8080"`. Das für Sie zu entscheiden hieße, eine Information zu erfinden, die dann weiterreist, als hätte sie in der Datei gestanden.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem von ihnen wird ein Zeichen Ihres Textes übergeben. Jede Zeile, die ihn liest, parst oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug arbeitet unverändert weiter, denn einen Netzschritt gab es darin nie. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/shared/parse-xml.js` für den Parser, der Ihnen sagt, welches Tag nie geschlossen wurde, und `src/convert.js` dafür, warum jeder Wert als Zeichenkette aus dem XML kommt, statt erraten zu werden.
