# Zwischen YAML und JSON umwandeln

Wandeln Sie ein Dokument lokal um und prüfen Sie die Werte vor der Nutzung. YAML-Kommentare verschwinden in JSON; dieser Leser lehnt nicht unterstützte YAML-Konstrukte bewusst ab.

[YAML-zu-JSON-Umwandler öffnen](https://abox.tools/de/yaml-in-json-umwandeln/): Beide Richtungen, und es sagt Ihnen, was jede davon kostet. Nichts davon wird in den Server eines anderen eingefügt.

Zuletzt aktualisiert 13. Oktober 2026

## Richtung wählen und Text hinzufügen

Fügen Sie ein Dokument ein oder wählen Sie eine Datei. Das Menü wählt YAML zu JSON oder JSON zu YAML; der Import einer `.json`-, `.yaml`- oder `.yml`-Datei setzt die passende Richtung. Prüfen Sie das Ergebnis vor Kopieren oder Herunterladen.

Die Umwandlung läuft im Browser ohne Upload der Konfiguration. Bewahren Sie das Original auf: Formatierung und Kommentare können für die Pflege wichtig sein, auch bei unveränderten Daten.

![YAML-Eingabe und JSON-Ausgabe mit der Anzahl verworfener Kommentare.](https://abox.tools/screens/convert-yaml-and-json/values.webp)

Der Kommentar entfällt; no bleibt eine Zeichenkette und die große Ganzzahl behält ihre Ziffern.

## Eine Anwendungskonfiguration zwischen Formaten übertragen

Erwartet eine Anwendung YAML und eine andere JSON, beginnen Sie mit einer Kopie eines Konfigurationsdokuments. Wählen Sie Richtung und zwei Leerzeichen. Lassen Sie die Sortierung aus, wenn vorhandene Gruppen die Prüfung erleichtern. Prüfen Sie, dass zitierte Kennungen Strings, Schalter boolesche Werte und Listen die erwarteten Einträge bleiben. Speichern Sie unter neuem Namen und verwenden Sie vor dem Ersetzen der funktionierenden Datei die Konfigurationsprüfung der Zielanwendung. Eine erfolgreiche Konvertierung beweist nur, dass dieser Parser die unterstützte Syntax verstanden hat, nicht die Gültigkeit der Einstellungen für diese Anwendung.

Eine zweite nützliche Aufgabe ist der Vergleich zweier Umgebungen in verschiedenen Formaten. Konvertieren Sie die YAML-Kopie zu JSON und folgen Sie dem [JSON-Vergleichsablauf](https://abox.tools/de/ratgeber/zwei-json-dateien-vergleichen/) mit gleich formatierten Kopien. Prüfen Sie Hostnamen, Limits und Schalter. Behalten Sie das YAML-Original wegen seiner Kommentare. Konvertieren Sie getrennte YAML-Dokumente einzeln und verwenden Sie einen vollständigeren Parser, wenn Anker, Aliase oder Tags dazugehören.

## Die unterstützte YAML-Teilmenge nutzen

Der Leser verarbeitet übliche Zuordnungen, Sequenzen und skalare Werte mit YAML-1.2-artiger Auflösung. Er ist keine vollständige YAML-1.2-Implementierung. Anker, Aliase, eigene Tags und Mehrdokument-Streams stoppen die Umwandlung. Braucht die Datei diese Funktionen, nutzen Sie einen passenden Parser; einen Alias ohne Wahrung seiner Bedeutung zu entfernen verändert die Konfiguration.

Ein Parsefehler bietet Zur Fehlerstelle. Korrigieren Sie die gemeldete Eingabe statt die alte Ausgabe zu nutzen, die beim Bearbeiten nicht mehr verfügbar ist.

## Kommentare, Zeichenketten und Zahlen prüfen

```
enabled: true
country: no
account: 12345678901234567890
```

Hier bleibt `no` die Zeichenkette `"no"`, statt wie unter YAML 1.1 zu false zu werden. Der Umwandler behält den Zahlentext, ohne die lange Kontonummer durch JavaScript-Gleitkommazahlen zu runden. Die Anwendung, die das Ergebnis liest, kann eigene Zahlengrenzen haben.

JSON hat keine Kommentare; YAML-Kommentare werden verworfen und das Werkzeug meldet die gelesenen Kommentare. Ein `#` innerhalb einer Zeichenkette in Anführungszeichen oder eines Blockskalars ist Inhalt, kein Kommentar.

## JSON zurück in YAML umwandeln

Das Datenmodell wird übernommen, aber die Ausgabe ist neu geschriebenes YAML und stellt keine früheren Kommentare oder Formatierungen wieder her. Mehrdeutige Wörter werden für YAML-1.1-Leser in Anführungszeichen gesetzt. Prüfen Sie Version und Schema der Zielanwendung, besonders bei Bereitstellungskonfigurationen.

Die [YAML-Spezifikation](https://yaml.org/spec/1.2.2/) beschreibt die ganze Sprache. Für das Prüfen oder Minimieren von JSON allein nutzen Sie den [JSON-Formatierer](https://abox.tools/de/json-formatieren/).
