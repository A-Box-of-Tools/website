# So vergleichen Sie zwei JSON-Dateien

Vergleichen Sie zwei JSON-Dateien, wie sie kommen, und das meiste, was aufleuchtet, ist nichts: Einrückung, Zeilenumbrüche, Schlüssel in anderer Reihenfolge. Die Lösung ist kein klügerer Vergleich, sondern beide Dateien vorher durch denselben Formatierer zu schicken, sodass nur echte Unterschiede übrig bleiben. Beide Schritte laufen in Ihrem Browser, und dorthin gehören Konfigurationsdateien mit Geheimnissen darin.

[Textvergleich öffnen](https://abox.tools/de/text-vergleichen/): Zwei Texte hinein, jeder Unterschied markiert, Zeile für Zeile und Wort für Wort. Nichts davon wird in den Server eines anderen eingefügt.

Zuletzt aktualisiert 13. Oktober 2026

## Die kurze Antwort

1. Öffnen Sie den [JSON-Formatierer](https://abox.tools/de/json-formatieren/), fügen Sie die erste Datei ein, stellen Sie die Einrückung auf zwei Leerzeichen und setzen Sie den Haken bei *Die Schlüssel jedes Objekts sortieren*. Kopieren Sie das Ergebnis.
2. Öffnen Sie den [Textvergleich](https://abox.tools/de/text-vergleichen/) und fügen Sie es in das linke Feld ein.
3. Dasselbe mit der zweiten Datei, in das rechte Feld.

Das Ergebnis lässt sich viel leichter lesen. Sie sehen geänderte Werte, neue Schlüssel und entfernte Einträge. Formatunterschiede und umsortierte Schlüssel, die einen normalen Vergleich überlagert hätten, verschwinden, weil beide Seiten vor dem Vergleich gleich geschrieben wurden.

Keine der beiden Seiten hat irgendeine Netzfunktion, was zu wissen sich lohnt: Das JSON, das Menschen vergleichen, sind so oft Konfigurationsdateien, in denen noch Zugangsdaten stehen.

## Konfigurationsänderungen und API-Regressionen

Behalten Sie beim Vergleich von Staging und Produktion die Originale und formatieren Sie jeweils eine Kopie mit zwei Leerzeichen und sortierten Objektschlüsseln. Setzen Sie Staging links und Produktion rechts ein. Lassen Sie Groß-/Kleinschreibung und Leerraum ignorieren ausgeschaltet und prüfen Sie Endpunkte, Funktionsschalter und Grenzwerte. Leerzeichen in einem String und die Schreibweise eines Schlüssels können wichtig sein. Laden Sie den Patch erst herunter, wenn die Zuordnung der Umgebungen zu den Seiten feststeht.

Dasselbe Vorgehen prüft eine API-Antwort vor und nach einer Änderung. Verwenden Sie dieselben Eingaben und berücksichtigen Sie Zeitstempel oder erzeugte IDs getrennt. Arrays behalten ihre Reihenfolge. Eine umsortierte Liste unterscheidet sich weiterhin, wie es für eine geordnete JSON-Sequenz richtig ist. Auch gleichwertige Zahlenschreibweisen wie `1` und `1.0` oder unterschiedlich maskierte Strings können abweichen. Hier wird formatierter Text verglichen. Es ist weder eine Schemaprüfung noch eine Prüfung aller JSON-Werte auf Gleichwertigkeit. Der [JSON-Standard](https://www.rfc-editor.org/rfc/rfc8259.html#section-1) unterscheidet ungeordnete Objekte von geordneten Arrays.

## Warum ein roher JSON-Vergleich fast nur Rauschen ist

JSON ist Leerraum gleichgültig, und der Reihenfolge der Schlüssel gibt es keine Bedeutung. Dasselbe Dokument kann eine Zeile lang sein oder vierhundert, die Schlüssel in Tippreihenfolge tragen oder in der, die irgendeine Bibliothek ausgegeben hat, und Werkzeuge schreiben beides ungefragt um. Eine Seite minimiert, die andere ausgelegt; eine von Hand gespeichert, die andere von einem Serialisierer, der alphabetisch sortiert: Ein Zeilenvergleich sieht zwei fremde Dateien.

Die zwei schlimmsten Fälle machen den Punkt. Eine **minimierte** Datei ist eine Zeile, ein Vergleich dagegen also eine einzige riesige geänderte Zeile, wahr und nutzlos. Und zwei Dateien mit **demselben Inhalt in anderer Reihenfolge** vergleichen sich als alles-geändert, wo die ehrliche Antwort „nichts“ wäre.

![Die Vergleichsoptionen: Ansicht nebeneinander oder untereinander, ein Schalter für nur geänderte Zeilen und Schalter für das Ignorieren von Leerraum, Groß- und Kleinschreibung und Leerzeilen.](https://abox.tools/screens/compare-two-json-files/options.webp)

Verwenden Sie die Ignorieren-Schalter vorsichtig. Sie wirken auf die Ansicht, während der heruntergeladene Patch alle Eingabeunterschiede einschließlich Zeilenenden behält.

## Was die Normalform des Formatierers behebt

Beide Dateien durch denselben Formatierer mit denselben Einstellungen zu schicken ist genau, was ein Vergleich braucht: eine Schreibweise je Dokument.

- **Gleiche Einrückung** stellt jeden Schlüssel auf seine eigene Zeile. Der Vergleich arbeitet dann Zeile für Zeile, und seine Wortmarkierungen können auf den einen Wert zeigen, der sich in einer Zeile geändert hat.
- **Sortierte Schlüssel** bringen beide Seiten in dieselbe Ordnung, womit die Reihenfolge aufhört, ein Unterschied zu sein. Sortiert wird danach, wie Schlüssel sich lesen, nicht nach Codepunkten, `item2` vor `item10`, und auf beiden Seiten identisch.
- **Sonst bewegt sich nichts.** Dieser Formatierer behält Zahlen als die Ziffern, die Sie geschrieben haben, und behält doppelte Schlüssel, statt sie aufzulösen. Das In-Normalform-Bringen kann also selbst keinen Unterschied erfinden. Der [Formatierer-Ratgeber](https://abox.tools/de/ratgeber/json-formatieren/) erklärt, warum das seltener ist, als es sein sollte.

Ein ehrlicher Vorbehalt: Die sortierte Ausgabe ist das Dokument mit verschobenen Schlüsseln. Wenn ein nachgelagertes Werkzeug auf die Reihenfolge achtet, wenige tun es, aber es gibt sie, dann behandeln Sie die sortierten Kopien als das, was verglichen wird, nicht als Ersatz für die Originale.

## Das Ergebnis lesen, und es mitnehmen

Der Vergleich markiert entfernte Zeilen links, hinzugekommene rechts und hebt innerhalb einer geänderten Zeile die Wörter hervor, die sich unterscheiden. Auf einer Normalform ist das typischerweise der eine Wert, der von `false` auf `true` gewandert ist. Die unveränderte Mitte klappt zu einer Zahl zusammen, sodass eine Konfiguration von zweitausend Zeilen mit drei Änderungen sich als drei kurze Passagen liest.

Der Download ist eine Unified-`.patch`-Datei, das Format, das Code-Reviews verstehen. Sie beschreibt die Normalformen, und das ist meist genau, was ein Review will: die Änderung, ohne das Umformatieren.

Das Vorgehen Formatieren, dann Vergleichen kann auch YAML oder XML leichter prüfbar machen. Ihre Leerraum- und Konvertierungsregeln unterscheiden sich aber von JSON. Behalten Sie die ursprüngliche Sprache, wenn sich nur das Layout ändern soll. Die Ignorieren-Schalter des Vergleichs beeinflussen seine Ansicht. Der Patch vergleicht die tatsächlichen Eingabestrings. Das sind hier Ihre formatierten Kopien, also ist es kein Patch gegen die unveränderten Originale.

![Zwei Fassungen einer JSON-Konfiguration nebeneinander, geänderte Zeilen markiert: eine Versionsnummer, eine Anzahl Wiederholversuche, ein hinzugekommener Schalter und eine hinzugekommene Region.](https://abox.tools/screens/compare-two-json-files/diff.webp)

Vier echte Unterschiede, und sonst nichts gemeldet. Das Lesen ist die leichte Hälfte; die Arbeit haben die Einstellungen darüber erledigt.

## Wenn Sie das jede Woche tun

Zweimal formatieren, zweimal einfügen: Die Schritte leben auf zwei Seiten, weil jede Seite eine Aufgabe macht und jede für sich beweisen kann, dass nichts von dem, was Sie einfügten, irgendwohin ging. Aber beide sind quelloffen: MIT-lizenziert, abhängigkeitsfreie ES-Module, der Parser des Formatierers behält Schlüsselreihenfolge und Ziffern, der Vergleich ist Myers' Algorithmus, jedes mit einem README, das es erklärt.

Wenn das zu Ihrem Alltag gehört, setzen Sie einen Coding-Agenten auf das [Repository](https://github.com/A-Box-of-Tools/website) an und lassen Sie sich eine Seite mit zwei Feldern bauen, die beim Vergleichen gleich in Normalform bringt: `parseJson`, `printJson` und `compareText` sind drei Importe entfernt. Die Module sind zum Lesen geschrieben, und sie herauszuheben ist genau das, wofür die Lizenz da ist.
