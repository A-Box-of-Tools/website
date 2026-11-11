# XML formatieren und prüfen

XML ohne Upload neu einrücken, Parsefehler an der Quelle finden und die Änderungen bei der Umwandlung in JSON verstehen.

[XML-Formatierer öffnen](https://abox.tools/de/xml-formatieren/): XML zum Lesen ausgelegt oder zum Ausliefern flach gepresst, und in beide Richtungen zu JSON umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.

Zuletzt aktualisiert 13. Oktober 2026

## XML einfügen oder importieren

Öffnen Sie den Formatierer und fügen Sie XML ein oder wählen Sie eine Textdatei. Wählen Sie zwei Leerzeichen, vier oder einen Tab zur Einrückung oder die minimierte Ausgabe. Kopieren oder laden Sie das gültige Ergebnis herunter. Beim Tippen wird die alte Ausgabe ungültig, während die neue Eingabe geprüft wird.

Der Parser läuft lokal. Er prüft Syntax, validiert aber weder XSD noch DTD, beweist keine korrekte Konfiguration für Ihre Anwendung und ruft keine im Text genannte URL auf.

![XML-Eingabe und JSON-Abbildung mit Attribut, Zeichenkettenwert und wiederholten Elementen.](https://abox.tools/screens/format-and-check-xml/mapping.webp)

Das Attribut wird zu @region, der Port bleibt eine Zeichenkette und wiederholte feature-Elemente werden zu einem Array.

## Eine Antwort, einen Feed oder eine Konfigurationsänderung untersuchen

Eine einzeilige API-Antwort oder ein RSS-Feed lässt sich leichter prüfen, wenn jedes Element eine eigene Zeile hat. Importieren Sie das gespeicherte XML, wählen Sie zwei Leerzeichen und nutzen Sie Bei Fehler zur Stelle springen, wenn das Parsen stoppt. Prüfen Sie äußeres Element, Attribute und wiederholte Einträge im formatierten Ergebnis. Eine Adresse mit kaufmännischem Und braucht im normalen XML-Text oder Attribut `&amp;`. Ein rohes & ersetzt das nicht. Prüfen Sie das korrigierte Dokument auch in der Anwendung, die es verarbeitet. Diese Seite validiert weder Feedregeln noch ein XSD.

Konvertieren Sie für eine Migration von XML-Konfiguration zu JSON eine Kopie. Prüfen Sie `@`-Attribute, Arrays wiederholter Elemente und Stringwerte, bevor Sie das Ergebnis mit der vorgeschlagenen JSON-Datei vergleichen. [Formatieren Sie beide JSON-Kopien zuerst gleich](https://abox.tools/de/ratgeber/zwei-json-dateien-vergleichen/). Dies eignet sich für datenorientierte Dokumente. Die Zuordnung verliert Kommentare und die Reihenfolge gemischter Inhalte und ist deshalb kein Erhaltungsformat für Prosa.

## Einem Parsefehler folgen

Ein offenes Tag, ein falsches Endtag oder eine ungültige Zeichenreferenz stoppt Formatierung und Umwandlung. Zur Fehlerstelle setzt den Cursor an die gemeldete Position. Es braucht ein äußeres Element; zwei Wurzeln oder Text außerhalb der Wurzel werden abgelehnt.

```
<settings>
  <port>8080</port>
</settings>
```

DOCTYPE-Text bleibt wörtlich erhalten. Externe Entitäten werden nicht aufgelöst; eine genannte Datei oder Website in einer Deklaration wird nicht geladen.

## Leerraum vor dem Einrücken verstehen

Textwerte, CDATA und Elemente mit gemischtem Inhalt behalten ihren Text. Leerraum nur zwischen Kindelementen gilt als Layout, sofern `xml:space="preserve"` nicht wirkt. Das erleichtert lesbare Konfigurationen; behandelt Ihre Anwendung die Leerzeichen als Daten, prüfen Sie das Ergebnis vor weiterer Nutzung.

## Was XML zu JSON verändert

Wählen Sie die Umwandlungsrichtung, bevor Sie das Ergebnis lesen. Attribute werden Schlüssel mit `@`, wiederholte Elemente Arrays und Text neben anderen Inhalten verwendet `#text`. XML-Werte bleiben Zeichenketten: `<port>8080</port>` wird nicht automatisch zur Zahl.

Kommentare und die verflochtene Reihenfolge von Text und Kindelementen gehen bei der JSON-Abbildung verloren. Zurückumwandeln verspricht deshalb nicht das Originaldokument. Speichern Sie eine Originalkopie und vergleichen Sie die von Ihrer Anwendung verwendeten Felder.

Für JSON-Formatierung ohne diese Abbildung nutzen Sie den [JSON-Formatierer](https://abox.tools/de/json-formatieren/).
