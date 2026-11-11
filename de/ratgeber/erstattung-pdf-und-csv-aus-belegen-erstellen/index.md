# Aus Belegfotos ein PDF und eine CSV zur Erstattung erstellen

Für eine Erstattung werden häufig lesbare Belege und eine Ausgabenliste benötigt. Beginnen Sie mit einem gemeinsam geprüften Fotosatz, damit PDF und CSV dieselben Dokumente in derselben Reihenfolge beschreiben.

Zuletzt aktualisiert 22. Oktober 2026

## Belege und Tabellenzeilen aus denselben Datensätzen erstellen

Ein PDF gibt dem Empfänger lesbare Belege. Eine CSV liefert Felder, die er prüfen oder in einer Tabellenkalkulation öffnen kann. Beginnen Sie im [Beleg- und Rechnungsausleser](https://abox.tools/de/belege-rechnungen-auslesen/), prüfen Sie die Datensätze und verwenden Sie danach dessen aufbereitete JPEG-Anhänge in [Bilder zu PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/). Komprimieren Sie das PDF nur, wenn es eine niedrigere Anhanggrenze einhalten muss.

Dieses Beispiel verwendet drei erfundene Belege in kanadischen Dollar:

| Beleg in Datensatzreihenfolge | Bestätigter Gesamtbetrag |
| --- | --- |
| 1. North Street Print | CAD 12,40 |
| 2. Market Car Park | CAD 8,00 |
| 3. Harbour Stationery | CAD 17,60 |

Die erwartete Summe beträgt CAD 38,00. Prüfen Sie zuerst, welche Felder und Anhangformate der Empfänger verlangt. Dieser Artikel stellt zwei zueinander passende Dateien zusammen. Er entscheidet nicht, ob eine Ausgabe erstattungsfähig ist.

## Mit einem Foto pro Dokument beginnen

Bewahren Sie die Originale auf und wählen Sie Kopien im [Ausleser](https://abox.tools/de/belege-rechnungen-auslesen/) aus. Er akzeptiert vom Browser unterstützte JPEG-, PNG-, WebP- und AVIF-Bilder, bis zu 20 Bilder pro Durchgang und 20 MB pro Bild. Die Erkennung verwendet ein lokales Modell für gedruckten englischen Text. Wandeln Sie nicht unterstützte Bilder vorher um und beschaffen Sie ein schärferes Foto, wenn Datum oder Betrag nicht mehr lesbar sind.

Ein Bild wird zu einem Dokumentdatensatz. Drei Seiten einer Rechnung werden nicht automatisch zu einer Ausgabe zusammengefasst. Wiederholte Summen auf diesen Seiten können mehrere Datensätze für denselben Betrag erzeugen. Dieser einfache Ablauf setzt einen vollständigen Beleg pro Foto voraus. Der [Ratgeber zum Auslesen](https://abox.tools/de/ratgeber/belege-rechnungen-aus-fotos-auslesen/) beschreibt den Funktionsumfang und die Prüfschritte.

## Felder und Zuschnitte gemeinsam prüfen

Die Erkennung schlägt Werte vor. Vergleichen Sie diese mit dem Bild. Prüfen Sie Händler, Datum, Referenz, Gesamtbetrag und Währung. Eine Zwischensumme, ein Steuerbetrag, der gegebene Barbetrag oder das Wechselgeld können plausibel aussehen, ohne der Endbetrag des Belegs zu sein. Erfinden Sie keinen fehlenden Wert, nur damit eine Zeile vollständig aussieht.

Lassen Sie das gesamte Dokument im Zuschnitt des Anhangs, einschließlich Belegnummer, Endbetrag und relevanter Steueraufschlüsselung. Bestätigen Sie Felder und Zuschnitt erst, nachdem Sie sie gelesen haben. Eine spätere Änderung des Zuschnitts oder eines Feldes kann die Bestätigung aufheben. Prüfen Sie den Status deshalb vor dem Export erneut.

Wählen Sie für dieses Beispiel CAD als Zielwährung und prüfen Sie, dass alle drei ursprünglichen Währungen CAD sind. Datensätze mit derselben Währung verwenden den Kurs eins. Eine Online-Abfrage von Wechselkursen ist nicht nötig. Bei unterschiedlichen Währungen folgen Sie der Kursprüfung im Ausleser-Ratgeber, statt ungleiche Währungsbeträge zu addieren.

Nur bestätigte Datensätze fließen in die Summen ein. Eine richtig aussehende Summe kann trotzdem einen noch nicht fertig geprüften Beleg auslassen. Prüfen Sie daher gemeinsam, dass drei Datensätze bestätigt sind und CAD 38,00 ergeben. Duplikatwarnungen vergleichen nur Dateinamen und Größe. Prüfen Sie die Bilder, denn umbenannte Duplikate können unbemerkt bleiben und unterschiedliche Bilder eine Warnung auslösen.

## Zueinander passende Zeilen und Bilder exportieren

Laden Sie die geprüfte CSV und die vorbereiteten JPEG-Anhänge herunter oder die ZIP-Datei, die beides enthält. Entpacken Sie die ZIP-Datei, bevor Sie die Bilder für das nächste Werkzeug auswählen. Die Anhangnamen enthalten feste Datensatznummern, während die Dateinamenspalte der CSV den ursprünglichen Fotonamen enthält. Speichern Sie auch den Textbericht. Er führt ursprüngliche und vorbereitete Anhangnamen gemeinsam auf. Verwenden Sie diese Zuordnung zusammen mit Händler, Datum und Betrag, um Zeilen und Bilder abzugleichen, besonders bei wiederkehrenden Kameradateinamen.

Eine CSV lässt sich auch exportieren, wenn die Prüfung noch nicht abgeschlossen ist. Öffnen Sie die tatsächlich heruntergeladene Datei und kontrollieren Sie Status und Felder jedes Datensatzes. Ein Export allein bedeutet nicht, dass alles bestätigt wurde. In diesem Beispiel müssen drei vorgesehene Ausgabendatensätze vorhanden sein, jeweils mit passendem Bild und dem geprüften CAD-Betrag aus der Tabelle oben. Die CSV endet außerdem mit Zeilen für Dokumentanzahl, Anzahl geprüfter Dokumente und Gesamtsumme. Das sind Zusammenfassungen, keine weiteren Belege. Lassen Sie sie weg, wenn Sie die Ausgabenzeilen selbst summieren.

Speichern Sie das Paar als `workshop-expenses.csv` und einen Arbeitsordner mit nummerierten Belegbildern. Bewahren Sie die Originalfotos getrennt auf. Beim Öffnen einer CSV kann eine Tabellenkalkulation Daten und Zahlen auf ihre eigene Weise interpretieren. Vergleichen Sie die Anzeige daher mit dem exportierten Text und dem Beleg, bevor Sie sich auf einen importierten Wert verlassen.

## Das PDF in Datensatzreihenfolge erstellen

Wählen Sie die vorbereiteten JPEGs in [Bilder zu PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/). Bei dieser Übergabe laden Sie Dateien herunter und wählen sie erneut aus. Würden Sie stattdessen wieder die ursprünglichen Kamerafotos auswählen, gingen die geprüften Zuschnitte und die Verbindung zu diesen Anhängen verloren.

Ordnen Sie die Bilder wie die Ausgabenzeilen der CSV: Druck, Parken, dann Schreibwaren. Prüfen Sie die Dateinamenszuordnung im Bericht, statt sich auf die Sortierung des Dateiauswahldialogs zu verlassen. Wählen Sie eine Seitengestaltung, die jeden Beleg vollständig und lesbar erhält, und speichern Sie `workshop-receipts.pdf`. Der [Ratgeber zu Bildern als PDF](https://abox.tools/de/ratgeber/bilder-zu-pdf-zusammenfuegen/) erklärt Seitengrößen und Bildqualität.

![Die Seiteneinstellungen von Bilder zu PDF zur Wahl der Papiergröße und der Einpassung eines Bildes auf die Seite.](https://abox.tools/screens/prepare-a-reimbursement-pdf-and-csv/layout.webp)

Die Seiteneinstellungen. Erhalten Sie lange Belege vollständig und prüfen Sie ihr Kleingedrucktes im exportierten PDF, nicht nur in der Vorschau.

Öffnen Sie das heruntergeladene PDF und lesen Sie jede Seite. Prüfen Sie Ausrichtung, vollständige Ränder, Datumsangaben und kleine Steuerbeträge. Dieses bildbasierte PDF erhält nicht allein deshalb eine durchsuchbare Textebene, weil zur Erstellung der CSV OCR verwendet wurde.

## Nur komprimieren, wenn die Grenze des Empfängers es verlangt

Ist das PDF klein genug, behalten Sie es. Der Ausleser erstellt bereits komprimierte JPEG-Anhänge. Ein weiterer Durchgang bringt daher möglicherweise wenig und macht kleine Schrift schwerer lesbar. Andernfalls probieren Sie eine Kopie im [PDF-Kompressor](https://abox.tools/de/pdf-verkleinern/), vergleichen Sie die Größen und lesen Sie jeden Beleg erneut. Komprimierung garantiert keine bestimmte Einsparung. Der [Ratgeber zur PDF-Komprimierung](https://abox.tools/de/ratgeber/pdf-kleiner-machen/) erklärt die Abwägungen.

## Die beiden einzureichenden Dateien prüfen

- Die CSV enthält die drei vorgesehenen, bestätigten Ausgaben mit den richtigen Währungen.
- Jeder Beleg passt zu einem Datensatz und erscheint in der entsprechenden Reihenfolge im PDF.
- Jede endgültige PDF-Seite enthält weiterhin die Angaben, die ihren Betrag belegen.
- Die bestätigten CAD-Beträge ergeben zusammen CAD 38,00.
- Genau diese Anhänge erfüllen die Format- und Größenvorgaben des Empfängers.

OCR und manuelle Prüfung geschehen in diesem Beispiel lokal. Eine optionale Abfrage historischer Wechselkurse ist eine eigene Netzwerkaktion; das Versenden der Dateien per E-Mail oder über einen anderen Dienst ist eine weitere. Bewahren Sie Originale für spätere Rückfragen auf. Ein passendes PDF-CSV-Paar erleichtert die Prüfung, beweist aber weder eine korrekte Erkennung noch garantiert es die Annahme.
