# Entfernt das Umwandeln eines Fotos seine Metadaten?

Manchmal, und beide Antworten haben schon Leute verbrannt. Ein Neukodieren über eine Leinwand streift alles ab; ein sorgfältiger Konverter trägt alles hinüber; das Bild sieht in beiden Fällen gleich aus. Der einzige verlässliche Zug ist, mit dem Vorhersagen aufzuhören und in die Datei zu sehen.

Zuletzt aktualisiert 13. Oktober 2026

## Die kurze Antwort

Manchmal. Ein Foto umzuwandeln, zu verkleinern oder zu komprimieren entfernt seine Metadaten, wenn das Werkzeug das Bild aus Pixeln neu aufbaut — und behält sie, wenn das Werkzeug sie absichtlich hinüberträgt. Und nichts auf dem Bildschirm sagt Ihnen, welches von beidem geschah. Das Bild sieht in beiden Fällen gleich aus, denn Metadaten waren nie Teil des Bildes.

Beide Ausgänge überraschen, in entgegengesetzte Richtungen. Jemand verlässt sich darauf, dass „bloßes Verkleinern“ den Aufnahmeort tilgt — und er überlebt. Jemand anderes verlässt sich darauf, dass das Aufnahmedatum einen Formatwechsel übersteht — und es ist fort. Beide Fehler haben dieselbe Kur: aufhören vorherzusagen, was ein Werkzeug vermutlich tat, und nachsehen, was die Datei tatsächlich enthält.

## Eine Archivkopie und eine Kopie zum Teilen behalten

**Für eine Fotobibliothek** behalten Sie das Original und wählen eine Konvertierung, die benötigte Aufnahmedaten gezielt erhält. Der [HEIC-Konverter](https://abox.tools/de/ratgeber/heic-in-jpg-umwandeln/) kann unterstützte Metadaten im JPEG erhalten. Prüfen Sie ein Beispiel vor dem ganzen Bestand. Das Änderungsdatum im Dateisystem ist ein anderer Eintrag als das Aufnahmedatum eines Fotos.

**Für eine Verkaufsanzeige oder ein öffentliches Portfolio** erstellen Sie eine eigene Kopie zum Teilen. Skalieren oder komprimieren Sie sie nach Bedarf, [entfernen Sie unerwünschte Tags](https://abox.tools/de/ratgeber/exif-und-gps-daten-entfernen/) gezielt und prüfen Sie den fertigen Download. Laden Sie das Archivoriginal nicht mit hoch.

So fällt auch der leicht übersehene Fall auf, dass ein Skalierer oder Kompressor keine Änderung für nötig hält und die Originalbytes zurückgibt. Eine bereits kleine Datei kann weiterhin GPS-Daten enthalten, obwohl sie eine Seite zur Bildbereinigung durchlaufen hat.

## Was da mitreist, und warum es getrennt ist

Eine Fotodatei ist zwei Dinge in einem Behälter: das kodierte Bild und ein Block von Angaben darüber — EXIF, oft dazu XMP und ein Farbprofil. Die Angaben umfassen typischerweise Aufnahmezeitpunkt, Kamera und Objektiv, Belichtung, die GPS-Koordinaten Ihres Standorts, und häufig ein kleines eingebettetes Vorschaubild — manchmal des Bildes, wie es *vor* einer Bearbeitung war, weshalb ein Zuschnitt verfehlen kann, was er abschnitt. Die volle Führung durch diesen Block steht im [EXIF-Ratgeber](https://abox.tools/de/ratgeber/exif-und-gps-daten-entfernen/).

Der Punkt, der alles entscheidet: Die Angaben liegen *neben* den Pixeln, nicht in ihnen. Ein Werkzeug, das das Bild dekodiert, bekommt Pixel und keine Angaben; was es hinausschreibt, enthält nur, was es zurücklegt. Ein Werkzeug, das die Datei ohne Neukodieren bearbeitet, kann die Angaben unberührt lassen — oder genau sie entfernen und sonst nichts.

## Warum Neukodieren abstreift und Kopieren behält

Die meisten Bildarbeiten im Browser nutzen einen Canvas. Die Datei wird zu Rohpixeln dekodiert, diese werden verändert und neu kodiert. Der neue Export kopiert Kameratags nur, wenn das Werkzeug sie ausdrücklich wiederherstellt. Wenn der [Bildkompressor](https://abox.tools/de/bild-komprimieren/) und der [Bildskalierer](https://abox.tools/de/bildgroesse-aendern/) hier ein Bild tatsächlich neu kodieren, enthalten die neuen Ergebnisse kein EXIF, GPS oder XMP. Beide können aber ein unverändertes Original zurückgeben, wenn keine Verringerung nötig ist. Diese Durchleitung erhält dessen Metadaten. Prüfen Sie den Download, statt aus dem Seitennamen auf ihre Entfernung zu schließen.

Ein Konverter dagegen kann sich Mühe geben zu bewahren. Der [HEIC-zu-JPG-Konverter](https://abox.tools/de/heic-in-jpg-umwandeln/) dieser Seite tut genau das: Er hebt den Metadatenblock aus dem HEIC-Behälter und setzt ihn ins JPEG ein, Daten, GPS und alles — denn eine Umwandlung soll dasselbe Foto in anderem Mantel sein. (Ein Eintrag wird bewusst umgeschrieben: die Ausrichtung, damit das Bild nicht kippt; und der Block passt nur in die JPEG-Ausgabe — das Formatmenü sagt es dazu.) Zwei ehrliche Werkzeuge, entgegengesetztes Verhalten, jedes für seine Aufgabe richtig — und genau darum taugt das Raten nach Werkzeugsorte nichts.

Jenseits des Browsers ist das Bild genauso gemischt, mit derselben Logik darunter. Bildschirmfotos und Exporte sind frische Kodierungen: keine Kamera-Angaben. Messenger komprimieren kräftig nach, also verlieren als Fotos verschickte Fotos meist ihre Angaben — dieselbe Datei „als Dokument“ verschickt reist aber Byte für Byte, Angaben inklusive. E-Mail-Anhänge und Cloud-Laufwerke bewegen Dateien unverändert. Das Muster hält: neu aufgebaut heißt abgestreift, kopiert heißt behalten.

## Prüfen statt annehmen

Die Prüfung dauert keine Minute: Öffnen Sie die Ausgabedatei — nicht das Original — im [EXIF-Betrachter und -Entferner](https://abox.tools/de/exif-daten-entfernen/) und lesen Sie, was da ist. Er zerlegt die Datei auf Ihrer eigenen Maschine und zeigt jeden Eintrag, das eingebettete Vorschaubild eingeschlossen. Nichts da, nichts geleckt. Noch da, und Sie sehen genau was.

Drei Gewohnheiten folgen aus alldem:

- **Wenn das Ziel Privatheit ist, entfernen Sie absichtlich.** Nehmen Sie die Angaben mit dem EXIF-Werkzeug heraus — es bearbeitet die Datei ohne Neukodieren, das Bild verliert also nichts — und prüfen Sie dann das Ergebnis. Verlassen Sie sich nicht auf ein Verkleinern, das nebenbei zufällig abstreift.
- **Wenn das Ziel das Bewahren ist, wandeln Sie mit einem Werkzeug um, das Bewahren zusagt** — und prüfen Sie auch das, denn „hat es wohl behalten“ scheitert in der anderen Richtung: Ein Fotoarchiv mit weggekochten Daten ist auch ein Verlust.
- **Prüfen Sie die Datei, die Sie wirklich verschicken**, nach dem letzten Schritt Ihrer Kette. Jedes Werkzeug entscheidet für sich, und nur der Inhalt der letzten Datei zählt.

Und wenn das Prüfwerkzeug selbst eine Webseite ist, gilt die übliche Frage auch ihm — ein Metadaten-Betrachter bekommt Ihr Foto, GPS und alles. Der hiesige läuft vollständig in Ihrem Browser, ohne dass irgendetwas irgendwohin geschickt wird, und [der Ratgeber zum Hochladen](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) zeigt, wie sich diese Behauptung prüfen lässt, statt sie zu glauben.
