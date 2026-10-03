# Dasselbe Bild, ein Drittel kleiner, mit erhaltener Transparenz

Verlustfreies WebP behält die PNG-Pixel in einer kleineren Datei. Der verlustbehaftete Modus verkleinert Fotos bis auf ein Zehntel. Welche Wahl passt, hängt vollständig vom Bildinhalt ab. Hier erfahren Sie, wie Sie entscheiden.

[PNG zu WebP öffnen](https://abox.tools/de/png-in-webp-umwandeln/): Dasselbe Bild, oft ein Drittel kleiner, mit unveränderten transparenten Bereichen.

Zuletzt aktualisiert 17. September 2026

## Die kurze Antwort

Öffnen Sie den [PNG-zu-WebP-Konverter](https://abox.tools/de/png-in-webp-umwandeln/), ziehen Sie die Dateien hinein und wählen Sie eine von zwei Möglichkeiten:

- **Verlustfrei** für Text, flache Farbflächen und scharfe Kanten: Bildschirmfotos, Diagramme, Logos, Schaubilder und alles Gezeichnete. Jeder undurchsichtige Pixel bleibt exakt gleich, und die Datei wird trotzdem kleiner.
- **Kleiner** für Fotos. Die Ersparnis ist enorm, und der Unterschied ist kaum zu erkennen.

In beiden Fällen wird nichts hochgeladen. Ihr Browser schreibt WebP seit 2020; der Encoder steckt bereits auf Ihrem Rechner.

## Warum PNG überhaupt so groß ist

PNG ist verlustfrei und verwirft nichts. Es sucht nach Wiederholungen, etwa gleichen Pixeln oder ähnlichen Zeilen, und beschreibt sie kompakt.

Das funktioniert hervorragend bei den Bildern, für die PNG entwickelt wurde. Bildschirmfotos bestehen meist aus flachen Flächen und wiederholtem Text, Logos aus wenigen Vollfarben. Beides lässt sich stark komprimieren.

Bei Fotos funktioniert es schlecht, weil sich fast nichts wiederholt. Gras, Himmelsverläufe und Sensorrauschen unterscheiden sich von Pixel zu Pixel, und PNG hält alles fest. Ein Handyfoto als PNG ist oft zehnmal so groß wie dasselbe Bild als JPEG. PNG ist nicht schlecht; ein verlustfreies Format wurde nur mit etwas beauftragt, das kaum jemand verlustfrei benötigt.

Deshalb hängt die richtige Wahl vom Bildinhalt ab.

## Verlustfreies WebP: der direkte Austausch

WebP hat einen verlustfreien Modus, der effizienter als PNG komprimiert: neuer und mit zusätzlichen Verfahren. Bei den Bildern, für die PNG gut geeignet ist, spart er meist ein weiteres Fünftel bis Drittel, ohne dafür Bildinhalt aufzugeben.

Dieser Modus passt zu Text und harten Kanten: Bildschirmfotos für Dokumentation, Entwürfe von Benutzeroberflächen, Diagramme, Strichzeichnungen, Logos, Schaubilder und Pixelgrafik. Das Ergebnis ist dasselbe Bild in einer kleineren Datei. Dagegen spricht nur Software, die WebP nicht lesen kann.

„Verlustfrei“ sollte geprüft werden. Das Werkzeug tut das: WebP speichert die Pixel in einem von zwei Blöcken. Der Konverter liest das Ergebnis erneut, um den tatsächlich geschriebenen Block zu bestimmen. Würde ein Browser die Anforderung nicht mehr erfüllen, zeigte die Zeile das an, statt eine verlustbehaftete Datei als verlustfrei auszugeben. Alle aktuellen Browser erfüllen sie.

## Verlustbehaftetes WebP: für Fotos

Der andere Modus verwirft kaum bemerkte Details, ähnlich wie JPEG, aber deutlich effizienter. Bei Fotos wird aus einem PNG von 2 MB häufig weniger als 200 KB. Nebeneinander lassen sich die Bilder kaum unterscheiden.

Der Qualitätsregler beginnt bei 80, der WebP-Voreinstellung, die für Fotos meist sehr gut ist. Unter etwa 60 werden die Verluste sichtbar.

Für flache Farbflächen von oben eignet sich dieser Modus *nicht*. Verlustbehaftete Komprimierung glättet; bei Text und harten Kanten ist genau das falsch. Um Buchstaben entsteht ein schwacher Saum wie bei einem schlechten Scan. Enthält das Bild Wörter, wählen Sie verlustfrei.

## Die Transparenz bleibt in beiden Fällen erhalten

Die häufigste Sorge lässt sich einfach beantworten: WebP hat wie PNG einen echten Alphakanal. Ein Logo mit transparentem Hintergrund behält ihn. Keine Hintergrundfarbe muss gewählt und nichts aufgefüllt werden.

Anders ist es bei der Umwandlung *in* JPEG. JPEG hat keinen Alphakanal und verliert die Transparenz. Der Ratgeber [WebP in JPG umwandeln](https://abox.tools/de/ratgeber/webp-in-jpg-umwandeln/) erklärt das in einem eigenen Abschnitt. WebP hat dieses Problem nicht und ist deshalb bei freier Wahl oft das bessere Zielformat.

Eine gemessene Einschränkung gehört zur genauen Aussage der Werkzeugseite: Bei *teilweise* transparenten Pixeln kann sich der darunter gespeicherte Farbwert minimal verändern. Das liegt am Browser-Canvas, das Farben mit der Deckkraft multipliziert und die Rechnung nicht exakt rückgängig machen kann, nicht an WebP. Es ist unsichtbar, weil die am stärksten veränderten Farbwerte zugleich am wenigsten zum sichtbaren Bild beitragen. Undurchsichtige Pixel bleiben Bit für Bit gleich.

## Lässt sich WebP wirklich überall öffnen?

Im Web ja. Chrome, Edge, Firefox und Safari zeigen WebP seit 2020. Für eine Website müssen Sie daher kein Ersatzformat mehr vorsehen. Kleinere Seiten mit demselben Bild sind der wichtigste Grund für diese Umwandlung.

Außerhalb des Browsers ist es uneinheitlicher. Windows und macOS zeigen inzwischen Vorschauen, aber ältere Desktopsoftware, manche Uploadformulare und die meisten E-Reader lehnen WebP noch ab. Für solche Ziele benötigen Sie das umgekehrte Werkzeug [WebP zu JPG](https://abox.tools/de/webp-in-jpg-umwandeln/) und seinen [Ratgeber](https://abox.tools/de/ratgeber/webp-in-jpg-umwandeln/).

## Was nicht mitkommt

Die Pixel bleiben, die umgebenden Informationen nicht. Bei der Umwandlung über ein Canvas gehen Textblöcke, ICC-Farbprofile und XMP-Blöcke des PNGs verloren.

Bei den meisten PNGs ist das unbedeutend. Sie enthalten selten Kameradaten, Bildschirmfotos gar keine. Um vorhandene Daten zu sehen, verwenden Sie den [EXIF-Betrachter und Entferner](https://abox.tools/de/exif-daten-entfernen/), der sie ohne erneute Bildkomprimierung liest und schreibt.

## Warum es keinen Upload gibt

Beide benötigten Fähigkeiten stecken schon auf Ihrem Rechner. Der Browser dekodiert PNG und kodiert seit 2020 WebP. Dieselbe Unterstützung ermöglicht Websites überhaupt erst die Verwendung von WebP.

Ein Konverter, der Ihre Dateien an einen Server schickt, verwendet also seine eigene Kopie einer bereits vorhandenen Software und hält währenddessen Ihre Bilder. Das [Werkzeug hier](https://abox.tools/de/png-in-webp-umwandeln/) arbeitet in der Seite und funktioniert deshalb auch ohne Netzwerk. Das ist der einfachste Beweis, dass nichts versendet wurde. Die allgemeine Erklärung steht in [Ist es sicher, Dateien hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/).
