# Beleg- und Rechnungsangaben aus Fotos auslesen

Ein Stapel Belege wird brauchbar, wenn jeder Betrag lesbar ist und der Bericht zeigt, wie viele Dokumente gezählt wurden. Die Texterkennung spart Tipparbeit; erst Ihr Vergleich mit dem Bild macht das Ergebnis versandfertig. Hier erfahren Sie, was Sie prüfen sollten, wie das ganze Dokument in einem kleineren Anhang erhalten bleibt, was die Summen bedeuten und wie Sie Bilder und Bericht in Ihre eigene E-Mail-App übernehmen.

[Belege und Rechnungen auslesen öffnen](https://abox.tools/de/belege-rechnungen-auslesen/): Fotos auslesen, Felder und Ausschnitte prüfen und komprimierte Bilder mit Einzelbeträgen und Summen per E-Mail vorbereiten.

Zuletzt aktualisiert 4. Oktober 2026

## Ein Dokument pro Foto

Fotografieren Sie den ganzen Beleg oder die ganze Rechnung mit aufrechtem, scharfem Druck. Füllen Sie den Bildrahmen, sorgen Sie für gleichmäßiges Licht und vermeiden Sie Ihren Schatten auf der Seite. Händlername und Gesamtbetrag müssen sichtbar sein. Verblasster Thermodruck und Spiegelungen können eine Ziffer verdecken, die keine Software aus dem Bild wiederherstellen kann.

Fügen Sie JPEG-, PNG-, WebP- oder AVIF-Dateien hinzu, bis zu 20 pro Stapel und 20 MB pro Datei. Jedes Bild wird zu einem Dokument. Bei einer zweiseitigen Rechnung ist Vorsicht nötig. Dieses Werkzeug verbindet die Seiten nicht zu einer Rechnung; wenn Sie beide als einzelne Dokumente hinzufügen, könnten Sie denselben Betrag zweimal zählen. Verwenden Sie die Seite mit den Identifikationsangaben und dem Gesamtbetrag und hängen Sie die andere Seite beim Versand selbst an.

Ein Bild mit mehreren Belegen oder eine Sammlung von Belegvorlagen wird nicht automatisch aufgeteilt. Verwenden Sie für jedes Dokument ein eigenes Bild oder einen eigenen Ausschnitt. Text mehrerer Belege kann einen gemischten Vorschlag ergeben, der zu keinem davon gehört.

Das mitgelieferte OCR-Modell liest gedruckten englischen Text. Handschrift und andere Schriften liegen außerhalb seiner Unterstützung. Erzeugt Ihr Telefon HEIC-Dateien, exportieren Sie JPEG-Kopien oder wandeln Sie sie vor dem Hinzufügen mit [HEIC in JPG](https://abox.tools/de/heic-in-jpg-umwandeln/) um.

## Vorschläge mit dem Bild vergleichen

Starten Sie die Texterkennung und prüfen Sie Foto, vorgeschlagene Felder und erkannten Rohtext jedes Dokuments. Drehen Sie ein seitliches Foto und lesen Sie es erneut aus. Passen Sie den Ausschnitt an ein vollständiges Dokument an und lesen Sie ihn bei Bedarf erneut aus. Kleine Ausschnitte werden für die Texterkennung bis zu dreifach vergrößert und erhalten einen schmalen weißen Rand. Die längste Seite der Arbeitskopie bleibt dabei innerhalb von 2400 Pixeln. Eine größere Arbeitskopie kann der Erkennung helfen, stellt aber keine durch Unschärfe verlorenen Details wieder her. Originalbild und ausgehender Anhang werden für die Texterkennung nicht vergrößert.

Eine schwache erste Erkennung oder ein fehlender Betrag oder ein fehlendes Datum kann eine zweite Erkennung mit lokaler Kontrastanpassung auslösen, die Druck und Papier besser trennen soll. Öffnen Sie „Aus diesem Bild erkannter Text“, um beide Erkennungen mit dem Foto zu vergleichen. Ungeklärte Widersprüche bei Beträgen, Datumsangaben, Belegnummern oder Währungen können Felder zur Prüfung leer lassen. Eine gedruckte Währung hat Vorrang vor einer Vermutung anhand der Adresse; ein erkanntes Beleg- oder Rechnungsdatum hat Vorrang vor dem Datum eines angehängten Kartenzahlungsnachweises. Korrigieren Sie den bearbeitbaren Text, bevor Sie damit die Felder ausfüllen, oder geben Sie die Felder direkt ein. Die zweite Erkennung wird separat zum Vergleich angezeigt. Keine der beiden Erkennungen garantiert, dass eine unscharfe oder verblasste Ziffer richtig ist.

Ein fehlender Händlername oder eine ungeklärte Dollar- oder Yen-Währung kann zusätzlich eine genauere Erkennung des Dokumentkopfs auslösen. Deren Text steht unter den Erkennungen des Dokumentinhalts zum Vergleich und liefert nur Händlername und Währungsvorschläge anhand der Adresse. Prüfen Sie auch diese Vorschläge am Bild.

Prüfen Sie vor dem Bestätigen diese fünf Felder:

- **Händler.** Das auf dem Dokument genannte Unternehmen oder der Lieferant. Ein stilisiertes Logo kann für das englische Textmodell unlesbar sein; geben Sie den Namen selbst ein, wenn das Feld leer bleibt.
- **Datum.** Das gedruckte Datum. Eine Rechnung kann Ausstellungs- und Fälligkeitsdatum nennen; ein numerisches Datum wie 03/04 ist möglicherweise mehrdeutig. Das separate Umrechnungsdatum müssen Sie prüfen und auswählen.
- **Belegnummer.** Die Beleg- oder Rechnungsnummer, sofern gedruckt. Eine Karten- oder Telefonnummer ist keine Dokumentnummer. Das Feld kann leer bleiben, wenn kein zuverlässiger Kandidat vorliegt.
- **Währung.** Wählen Sie einen gängigen Code wie USD, CAD oder EUR oder geben Sie über „Anderen Code eingeben“ einen weiteren Code mit drei Buchstaben ein. Eine beim Gesamtbetrag gedruckte Währung hat Vorrang. Ein Pfundzeichen schlägt GBP vor; ein einzelnes Dollarzeichen unterscheidet nicht zwischen USD, CAD, AUD und anderen Dollarwährungen. Ein eindeutiges Land oder eine charakteristische Postleitzahl mit Region in der Händleradresse können ersatzweise einen Vorschlag liefern. Die gedruckte Adresszeile wird zum Vergleich angezeigt. Eine Stadt allein oder eine Kunden-, Liefer- oder Bankadresse reicht nicht. Prüfen Sie jeden Vorschlag am Beleg; vor dem Bestätigen ist eine Währung erforderlich.
- **Gesamtbetrag.** Der endgültige Betrag des Dokuments. Die Auswertung vermeidet Beschriftungen für Rabatte und gegebenes Bargeld, doch die Texterkennung kann diese übersehen. Prüfen Sie, dass keine Zwischensumme, kein Rabatt, Steuerbetrag, gegebenes Bargeld, Rückgeld oder offener Restbetrag vorgeschlagen wurde.

Korrigieren Sie ein falsches Feld direkt. Die Texterkennung spart Tipparbeit, kann aber weiterhin eine 3 für eine 8 halten oder ein Dezimaltrennzeichen verlieren. Eine Bestätigung hält fest, dass Sie das Dokument geprüft haben. Sie beweist nicht, dass die Rechnung rechnerisch stimmt, und das Werkzeug erfasst keine Einzelpositionen. Beträge unterstützen höchstens zwei Nachkommastellen.

## Das ganze Dokument im Ausschnitt behalten

Bei zuverlässigen Dokumentkanten schlägt das Werkzeug einen Ausschnitt vor. Bei einem langen, bildfüllenden Beleg kann seitlicher Hintergrund entfernt werden, während die ganze Höhe erhalten bleibt. So bleibt ein Datum unter dem Barcode sichtbar. Bei einem langen Beleg auf farbigem Papier kann dieselbe Papierfarbe jenseits einer erkannten Kante dafür sorgen, dass dieses Bildende ganz erhalten bleibt. Kopf oder letzte Zeile bleiben geschützt, zusammen mit etwas zusätzlichem Hintergrund. Sind die Kanten unklar, bleibt das ganze Bild erhalten. Vergleichen Sie den Ausschnitt mit dem Originalfoto und entfernen Sie Hintergrund, ohne Dokumentkanten oder Text abzuschneiden. Ein vorgeschlagener Ausschnitt kann falsch sein, besonders bei einem dunklen Beleg, einer gemusterten Unterlage oder einem Foto mit mehreren Blättern.

Der ausgehende Anhang ist eine neue JPEG-Kopie mit höchstens 1600 Pixeln an der längsten Seite. Kleinere Ausschnitte werden nicht vergrößert. Die Komprimierung strebt etwa 350 KB pro Bild an. Die tatsächliche Größe wird angezeigt, weil dieses Ziel nicht garantiert ist. Prüfen Sie die vorbereitete Vorschau auf lesbares Kleingedrucktes und einen lesbaren Gesamtbetrag. Ihr Originalfoto bleibt unverändert und wird nicht an die E-Mail angehängt.

Bestätigen Sie das Dokument erst nach der Prüfung von Feldern und Ausschnitt. Änderungen an einem Feld, Ausschnitt oder der Drehung setzen die Bestätigung zurück. Ein geändertes Bild kann dadurch nicht unbemerkt mit einer früheren Prüfbestätigung versendet werden.

## E-Mail-Währung und Kurs jedes Dokuments wählen

Als E-Mail-Währung wird standardmäßig die häufigste Dokumentwährung gewählt. Bei Gleichstand gilt die zuerst vorkommende Währung. Eine manuelle Wahl bleibt erhalten; „Standardwährung verwenden“ stellt die automatische Auswahl wieder her.

Behalten Sie die auf dem Dokument gedruckte Währung als Originalwährung. Wählen Sie eine gemeinsame E-Mail-Währung über einen gängigen Code oder „Anderen Code eingeben“. Dieselbe Zielwährung steht an jedem Dokument. Eine Änderung aktualisiert den Stapel und setzt Kurse und Prüfbestätigungen für die vorherige Währung zurück.

Geben Sie für jedes Dokument einen manuellen Kurs in der angezeigten Richtung ein, etwa „1 CAD = 0.70 USD“. Dokumente in der Zielwährung verwenden Kurs 1. Bei manuellen Kursen ist ein Datum optional. Prüfen Sie für einen Online-Kurs das Belegdatum im Umrechnungsdatumsfeld, wählen Sie die Online-Abfrage und drücken Sie „Historischen Kurs abrufen“. Ein gedrucktes Datum wie 03/04 ist mehrdeutig; die Abfrage verwendet deshalb das ausdrücklich gewählte Datum. Auch ein eindeutiges Datum wie 24/09/2018 bleibt in seiner gedruckten Form. Wählen Sie den 24. September 2018 im Umrechnungsdatumsfeld selbst aus.

Die optionale Abfrage verwendet [Frankfurter-Referenzkurse](https://frankfurter.dev/). Nur das Währungspaar und das gewählte Datum gehen an api.frankfurter.dev. Bilder, Beträge, Dateinamen, OCR-Texte und E-Mail-Adressen werden nicht gesendet. Der Dienst sieht Ihre Anfrage und IP-Adresse. Prüfen Sie das zurückgegebene Beobachtungsdatum. Es kann vor dem Belegdatum liegen, wenn kein Kurs veröffentlicht wurde. Referenzkurse können vom Kurs der Bank oder Kartenabrechnung abweichen. Ist das Währungspaar oder Datum nicht verfügbar, geben Sie einen manuellen Kurs ein. Ein fehlender historischer Kurs wird niemals unbemerkt durch einen aktuellen ersetzt.

Prüfen Sie Originalbetrag, Kurs und umgerechneten Betrag vor dem Bestätigen. E-Mail und CSV bewahren diese Angaben, damit sich der Gesamtbetrag auf jedes Dokument zurückführen lässt. Änderungen an einer Währung oder einem Datum erfordern einen neuen Kurs und eine neue Prüfung.

## Was Dokumentanzahl und Summen aussagen

Der Bericht enthält Angaben und Betrag jedes Dokuments sowie die Dokumentanzahl und die Anzahl geprüfter und noch zu prüfender Dokumente. Nur geprüfte Beträge fließen in die Originalsummen nach Währung und den umgerechneten Gesamtbetrag ein. Wählen Sie eine gemeinsame E-Mail-Währung für den ganzen Stapel; jedes Dokument zeigt dieselbe Währung. Jeder umgerechnete Dokumentbetrag wird vor dem Addieren auf zwei Nachkommastellen gerundet. Der Gesamtbetrag entspricht so den in der E-Mail aufgeführten Einzelbeträgen.

Vergleichen Sie die Anzahl mit Ihren Originalbelegen. Ein fehlendes Foto lässt eine Ausgabe aus, ein doppeltes zählt sie zweimal. Es gibt keine automatische Erkennung doppelter Bilder. Entfernen Sie alles, was nicht mitgezählt werden soll, und speichern oder kopieren Sie den Bericht, bevor Sie den Tab schließen. Der Stapel liegt im Arbeitsspeicher, ohne gespeicherten Dokumentverlauf. Während der Prüfung können kopierte Berichte und CSV-Dateien noch ungeprüfte Zeilen enthalten, die entsprechend markiert sind. E-Mail und Anhangdownloads werden erst verfügbar, wenn jedes verbleibende Dokument geprüft und seine JPEG-Kopie fertig ist.

## Bericht mit komprimierten Bildern per E-Mail vorbereiten

Der vorgeschlagene Betreff enthält die Dokumentanzahl und ergänzt den Gesamtbetrag in der Zielwährung, sobald alle Dokumente geprüft sind. Ändern Sie den Betreff für Ihre eigene Formulierung. Ihre Änderungen bleiben bei späteren Änderungen am Stapel erhalten.

Verwenden Sie nach der Prüfung aller Dokumente „E-Mail mit Bildern“. Unterstützt der Browser das Teilen von Dateien, öffnet sich das Teilen-Menü des Geräts mit den vorbereiteten JPEG-Kopien und dem Bericht. Wählen Sie dort Ihre E-Mail-App. Der Bericht enthält jeden Dokumentbetrag, die Dokumentanzahl, die Summen nach Originalwährung und einen umgerechneten Gesamtbetrag. Prüfen Sie in der E-Mail-App Betreff, Empfänger, Text und jeden Anhang und senden Sie die Nachricht selbst.

Teilen-Menüs und E-Mail-Apps unterscheiden sich. Eine App kann die Bilder ohne den Bericht annehmen; die Seite kann dort keinen Empfänger auswählen. Kopieren Sie den Bericht bei Bedarf in die Nachricht. Die Seite kann weder senden noch feststellen, ob die App die Nachricht zugestellt hat.

## E-Mail-Datei herunterladen oder Kopien selbst anhängen

„E-Mail-Datei herunterladen“ erstellt eine `.eml`-Nachricht mit dem vollständigen Bericht und jedem vorbereiteten JPEG-Anhang. Ein auf der Seite optional eingegebener Empfänger gilt für diese Datei. Ist das Teilen von Dateien im Browser nicht verfügbar, lädt die E-Mail-Schaltfläche dieselbe Datei herunter. Öffnen Sie sie in Ihrer E-Mail-App und prüfen Sie vor dem Senden, ob alle Anhänge vorhanden sind.

Manche E-Mail-Apps öffnen die Datei als Entwurf, andere zeigen sie als empfangene Nachricht an, die weitergeleitet oder erneut gesendet werden muss. Keine Browserfunktion garantiert in jeder E-Mail-App ein Verfassen-Fenster mit Anhängen. Kann Ihre App die Datei nicht verwenden, laden und entpacken Sie das ZIP und hängen dessen JPEG-Kopien und CSV an eine neue Nachricht an. Kopieren Sie den Bericht in den Nachrichtentext. Bewahren Sie die Originalfotos separat auf, falls der Empfänger später die Dokumente in voller Auflösung benötigt.

## Wohin die Informationen gehen

Auslesen und Bearbeiten laufen in diesem Browser. Texterkennung und englische Daten werden mit der Seite geliefert. Kein Foto und kein erkanntes Feld wird zur Texterkennung hochgeladen. Manuelle Umrechnung bleibt lokal. Historische Online-Kurse sind der oben beschriebene optionale Netzwerkschritt. Warten Sie vor dem Trennen der Verbindung auf die Bereitmeldung der Offline-Anzeige. Das zwischengespeicherte Werkzeug kann dann ohne Verbindung Fotos auslesen, den Bericht erstellen, JPEG-Kopien vorbereiten und CSV, E-Mail-Datei oder ZIP speichern.

E-Mail und Teilen sind ein bewusst gewählter nächster Schritt. Diese Schaltflächen übergeben Bericht oder Dateien an die von Ihnen gewählte App, die deren spätere Zustellung steuert. Eine E-Mail-App kann einen Entwurf offline speichern und nach dem Verbinden senden. Prüfen Sie Empfänger und Anhänge wie bei jeder anderen Nachricht mit Belegen oder Rechnungen.
