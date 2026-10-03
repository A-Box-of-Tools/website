# Bild schwärzen — unkenntlich machen oder verpixeln

Was Sie abdecken, wird aus der Datei gelöscht und nicht darin versteckt.

> Namen, Adressen oder Kontonummern in einem Foto oder Screenshot abdecken und das Bild neu speichern, sodass die verdeckten Pixel wirklich weg sind und nicht unter einem Rechteck liegen. Läuft komplett im Browser.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/bild-schwaerzen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Das Bild wird von Ihrem eigenen Browser dekodiert, übermalt und wieder kodiert, mit den Codecs, die er ohnehin mitbringt. Netzfunktionen hat dieses Werkzeug keine, weder zum Abrufen noch zum Senden. Das wiegt hier schwerer als fast überall sonst auf dieser Seite: Wer ein Bild schwärzen will, hat meist eines vor sich, auf dem noch ein Name, eine Adresse oder eine Kontonummer zu lesen ist.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Funktioniert offline
- ✓ Quelloffen

## So schwärzen Sie ein Bild, damit das Verdeckte wirklich weg ist

1. **Wählen Sie das Bild aus.** Ein Screenshot, ein Scan oder ein Foto, alles, was Ihr Browser öffnen kann. Es wird direkt von Ihrer Festplatte gelesen, dabei geht nichts irgendwohin.
2. **Ziehen Sie einen Kasten über das, was niemand sehen soll.** Und dann den nächsten. Ein Kasten lässt sich verschieben, an seinen Griffen in der Größe ändern oder mit der Tabulatortaste ansteuern und mit den Pfeiltasten bewegen. Was unter dem Kasten erscheint, ist das echte Ergebnis, gezeichnet von demselben Code, der später die Datei schreibt.
3. **Wählen Sie Schwarz, Verpixeln oder Weichzeichnen — und nehmen Sie Schwarz.** Eine schwarze Fläche lässt gar nichts übrig. Verpixeln und Weichzeichnen ersetzen die Pixel durch Mittelwerte ihrer selbst, und das genügt für ein Gesicht im Hintergrund, nicht aber für irgendetwas, das sich als Text lesen lässt.
4. **Auf „Schwärzen und speichern“ klicken, dann die Datei prüfen.** Das Bild, das danach zu sehen ist, ist die fertige Datei, noch einmal dekodiert. Öffnen Sie sie in einem Bildbearbeitungsprogramm und suchen Sie nach einer Ebene, oder versuchen Sie, den verdeckten Text zu markieren: Es gibt nur ein flaches Bild, und die abgedeckten Stellen wurden überschrieben, bevor es geschrieben wurde.

## Die ausführliche Fassung

[Ein Bild so schwärzen, dass das Verdeckte wirklich weg ist](https://abox.tools/de/ratgeber/bild-unkenntlich-machen/): Schwarze Kästen aus den meisten Programmen liegen auf dem Bild und lassen sich beiseiteschieben. Was eine echte Schwärzung von einer Abdeckung unterscheidet, warum verpixelter Text zurückgelesen werden kann und wie Sie eine Datei prüfen, bevor Sie sie verschicken.

## Auch im Werkzeugkasten

- [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/): Sehen, was ein Foto über Sie verrät. Und es dann herausnehmen.
- [DICOM-Viewer](https://abox.tools/de/dicom-viewer/): CT, MRT, Röntgen und Ultraschall, mit Fenster, Header und Messungen.
- [Bild zu ICO](https://abox.tools/de/favicon-erstellen/): Ein Bild hinein. Jede Größe, die ein Browser, Windows oder ein Mac verlangt, heraus.
- [Bild als Data-URI](https://abox.tools/de/bild-als-base64/): Das ganze Bild als eine Zeile Text. Direkt in CSS oder HTML einfügen.

## Fragen

### Wird mein Bild irgendwohin hochgeladen?

Nein. Die Datei wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware dekodiert, geschwärzt und wieder kodiert. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf. Keine davon gehört uns. Laden Sie die Seite einmal, trennen Sie die Internetverbindung, und sie arbeitet weiter.

### Ist der verdeckte Teil wirklich aus der Datei verschwunden?

Ja, und genau dafür gibt es dieses Werkzeug. Das Bild wird in einen Puffer aus Pixeln dekodiert, die Kästen überschreiben die Pixel in ihrem Inneren, und der Puffer wird als neue Datei kodiert. Die ursprünglichen Werte sind aus dem Speicher verschwunden, bevor der Encoder überhaupt etwas bekommt. Es gibt also keine Ebene zum Verstecken, keine Anmerkung zum Entfernen und keinen Verlauf zum Rückgängigmachen. Prüfen können Sie das so, wie Sie jede fremde Behauptung prüfen würden: Öffnen Sie das Ergebnis in einem Bildbearbeitungsprogramm und suchen Sie nach einer zweiten Ebene, oder versuchen Sie, den abgedeckten Text zu markieren.

### Lässt sich eine verpixelte oder weichgezeichnete Stelle wiederherstellen?

Manchmal, und das ist der eine Punkt, den man vor der Auswahl gelesen haben sollte. Eine schwarze Fläche ersetzt alles darunter durch eine einzige Farbe, es bleibt also nichts übrig: keine Kante, kein Mittelwert, nicht einmal die Anzahl der Zeichen. Verpixeln ersetzt jeden Block durch den Mittelwert dieses Blocks, und ein Raster aus Mittelwerten ist immer noch eine Messung dessen, was darunter lag. Bei Text in einer gewöhnlichen Schrift in vorhersagbarer Größe hat das in veröffentlichten Arbeiten gereicht, um das Original zu rekonstruieren: Man rendert Kandidaten, verpixelt sie genauso und vergleicht. Weichzeichnen ist eine Faltung, und Faltungen lassen sich im Prinzip umkehren. Verpixeln Sie also ruhig ein Gesicht im Hintergrund, und schwärzen Sie alles, was sich als Text lesen lässt.

### Warum ist ein schwarzes Rechteck aus einem Textprogramm nicht dasselbe?

Weil die meisten Programme das Rechteck neben dem Bild speichern und nicht darin. Eine Form, die in einem PDF-Betrachter, einer Präsentation, einer Textverarbeitung oder einem Bildeditor mit Ebenen gezeichnet wird, ist ein Objekt mit einer Position, das auf der Seite liegt. Wer es verschiebt, löscht oder die Datei in einem anderen Programm öffnet, bekommt genau das zurück, was es verdeckt hat. Zeitungen, Gerichte und Ministerien haben auf diesem Weg schon Dokumente veröffentlicht. Hier wird das Rechteck überhaupt nicht gespeichert. Es ist eine Menge von Pixelwerten, geschrieben über die, die vorher da waren.

### Entfernt es auch die EXIF- und GPS-Daten?

Ja, als Nebenwirkung. Speichern heißt hier, eine Fläche voller Pixel zu kodieren, und eine solche Fläche trägt keine Tags. Ort, Kameramodell, Zeitstempel und das eingebettete Vorschaubild werden also schlicht nicht in die neue Datei geschrieben. Das Vorschaubild ist hier besonders wichtig: Es ist eine kleine zweite Kopie des Bildes, es wird beim Bearbeiten nicht immer neu erzeugt, und ein geschwärztes Foto mit einem ungeschwärzten Vorschaubild macht die ganze Arbeit zunichte. Wenn die Metadaten weg sollen, ohne dass das Bild überhaupt neu kodiert wird, schreibt der [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/) stattdessen den Container neu.

### Welche Formate kann es lesen und schreiben?

Es liest alles, was Ihr Browser dekodieren kann, in der Praxis also JPEG, PNG, WebP, GIF, BMP und in den meisten aktuellen Browsern auch AVIF. Geschrieben werden JPEG, PNG und WebP, weil das die Encoder sind, die Browser mitbringen. Bei „Automatisch“ kommt ein JPEG als JPEG zurück und alles andere als PNG. So bleibt ein Foto so groß wie ein Foto, und der übrige Text auf einem Screenshot bleibt scharf. Für die Schwärzung macht die Wahl keinen Unterschied: Die Pixel sind schon weg, bevor der Encoder sie zu sehen bekommt.

### Geht das auch ohne Maus?

Ja. „Kasten in der Mitte hinzufügen“ setzt einen auf das Bild, mit der Tabulatortaste wechseln Sie zwischen den Kästen, die Pfeiltasten bewegen den ausgewählten und Alt mit den Pfeiltasten ändert seine Größe. Mit Umschalt sind es zehn Pixel pro Schritt, und Entf entfernt ihn. Zu jedem Kasten gibt es außerdem unter dem Bild eine Zeile mit Größe, Position, Wirkung und einer Schaltfläche zum Entfernen. Das ganze Werkzeug ist also mit der Tastatur bedienbar und für einen Screenreader lesbar.

### Funktioniert es auf dem Handy?

Ja. Zeichnen, Verschieben und Größenänderung laufen über Pointer-Ereignisse statt über Mausereignisse, ein Finger arbeitet also genauso, und die Griffe werden auf einem Touchscreen größer gezeichnet. Das Bild auf dem Bildschirm wird beim Arbeiten in Bildschirmgröße neu gezeichnet. Die Datei selbst wird immer in voller Auflösung geschwärzt, sobald Sie die Schaltfläche drücken.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Auch für die Bildgröße gibt es keine Grenze, weil kein Server dafür bezahlt: Die Arbeit passiert auf Ihrem eigenen Gerät. Finanziert wird die Seite über Werbung, und die Anzeigen bekommen nichts über Ihre Bilder zu sehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Bilder haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien landen könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Die verdeckten Pixel verschwinden hier, nicht erst auf dem Weg hinaus.** Das Bild wird in einen Puffer aus Pixeln dekodiert, die Kästen werden in diesen Puffer geschrieben, und der Puffer geht an den Encoder. Eine Fassung des Bildes mit den Kästen als eigener Ebene gibt es auf dieser Seite nicht, weil eine solche Fassung nie entsteht. Nachzulesen in `src/redact.js`.
- **Nichts hier ruft etwas ab.** Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`. Die Arbeit besteht aus `getImageData`, drei Schleifen über die Bytes und `canvas.toBlob`, und all das ist in Ihrem Browser bereits eingebaut.
- **Die Kästen werden nirgendwohin gemeldet.** Wo Sie gezogen haben, wie viele Kästen es sind, wie groß sie sind und welche Art Sie gewählt haben, bleibt im Arbeitsspeicher dieser Seite, bis Sie sie schließen. In diesem Repository gibt es kein Analytics-Ereignis, das irgendetwas davon mitnimmt, und die eine Frage, die diese Seite nach einem Download stellt, sendet Daumen hoch oder runter und den Namen des Werkzeugs, sonst nichts.
- **Es funktioniert offline.** Trennen Sie die Internetverbindung, und das Werkzeug bleibt dasselbe, weil nie ein Netzschritt darin war. Das ist der einfachste Beweis von allen. Und der, den man laufen lassen sollte, bevor man einen Reisepass schwärzt.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/redact.js` für die drei Funktionen, die die Pixel überschreiben, und `src/preview.js` dafür, warum die Vorschau auf dem Bildschirm von genau diesen drei Funktionen gezeichnet wird.
