# Die Datei, die nur der Browser öffnet, in dem Sie gerade lesen

Ein Bild von einer Website kommt als `.avif`, und Ihr Bildbetrachter lehnt es ab, während der Browser es problemlos anzeigt. Dieser Unterschied erklärt alles und ist der Grund, warum die Umwandlung Ihren Rechner nicht verlassen muss.

[AVIF zu JPG öffnen](https://abox.tools/de/avif-in-jpg-umwandeln/): Das Format, in dem Websites heute speichern, in dem Format, das überall angenommen wird.

Zuletzt aktualisiert 13. Oktober 2026

## Die kurze Antwort

Öffnen Sie den [AVIF-zu-JPG-Konverter](https://abox.tools/de/avif-in-jpg-umwandeln/), ziehen Sie die Dateien hinein und drücken Sie „Umwandeln“. Lassen Sie die Qualität bei 92. Sie erhalten JPEG-Dateien mit je einer Downloadschaltfläche oder bei mehreren ein ZIP-Archiv.

Nichts wird hochgeladen, und auch vorab muss nichts heruntergeladen werden. Der Decoder steckt bereits im Browser, in dem Sie diese Seite lesen. Dieser entscheidende Punkt wird unten ausführlicher erklärt.

## JPEG verwenden, wenn Kompatibilität das Problem ist

**Ein heruntergeladenes Bild für ein Dokument oder Uploadformular.** Konvertieren Sie vom ursprünglichen AVIF, beginnen Sie mit Qualität 92 und öffnen Sie das JPEG in der Anwendung, die es abgelehnt hat. Nennt das Formular auch ein Byte-Limit, prüfen Sie die neue Größe. Die Konvertierung kann die Datei vergrößern. Erfüllen Sie diese zweite Vorgabe mit dem [Bildkompressor](https://abox.tools/de/bild-komprimieren/) bei ausgewähltem JPEG.

**Eine Kopie für einen Bilderrahmen, Drucker oder ein älteres Gerät.** Testen Sie zuerst ein Bild auf dem Gerät, bevor Sie einen ganzen Ordner konvertieren. Falls kleinere Maße nötig sind, skalieren Sie die Kopie entsprechend. Eine umbenannte AVIF-Endung ändert weder Codec noch Größe. Behalten Sie das AVIF-Master, besonders bei HDR-Bildern. Dies ist eine unbewegte SDR-Kopie für Kompatibilität. Eine Sequenz trägt nur ihr erstes dekodiertes Bild bei. Für ein transparentes Logo, das transparent bleiben soll, wählen Sie stattdessen PNG oder WebP im Skalierer.

## Was AVIF ist und warum Sie eine solche Datei haben

AVIF speichert ein Standbild wie ein modernes Videobild: ein einzelnes Schlüsselbild des Videocodecs **AV1** im selben Box-Container wie MP4. Das klingt ungewöhnlich für ein Bildformat, funktioniert aber hervorragend. In AV1 steckt viel mehr Entwicklungsarbeit als in reine Bildcodecs, weil mit Video mehr Geld verdient wird.

Das Ergebnis ist bei gleicher sichtbarer Qualität erheblich kleiner als JPEG, oft um das Drei- bis Fünffache. Deshalb verwenden Websites AVIF. Wenn Sie dort ein Bild speichern, bekommen Sie das Format, das die Website ausgeliefert hat. Sie haben AVIF nicht selbst gewählt.

Danach öffnet kein Programm auf Ihrem Rechner die Datei:

- Windows braucht eine Erweiterung aus dem Store, bevor Fotos sie anzeigt;
- viele Desktopprogramme zur Bildbearbeitung lehnen sie weiterhin ab;
- Uploadformulare mit Erweiterungsprüfung kennen sie meist nicht;
- Drucker, E-Reader und Kamerasoftware liegen Jahre zurück.

## Ihr Browser liest sie. Das ist der ganze Trick

Ziehen Sie die sonst nicht zu öffnende Datei in einen Browsertab. Sie wird problemlos angezeigt. Chrome und Firefox dekodieren AVIF seit 2021, Safari seit 2023.

Das erklärt, warum die Umwandlung keinen Server braucht. Ein Konverter muss AVIF lesen und JPEG schreiben. Ihr Browser kann bereits beides. Das [Werkzeug hier](https://abox.tools/de/avif-in-jpg-umwandeln/) ergänzt den Decoder um eine Speicherschaltfläche: Es öffnet und zeichnet das Bild und fordert anschließend ein JPEG an.

Verlangt ein Konverter den Upload eines AVIFs, verwendet er seine eigene Kopie einer Software, die Sie bereits besitzen, und behält währenddessen Ihr Bild.

## Der Vergleich, der erklärt, welche Konverter einen Server brauchen

AVIF hat einen nahen Verwandten: **HEIC**, das Speicherformat des iPhones. Der Aufbau ist fast identisch: derselbe Box-Container und darin ein Standbild eines Videocodecs, HEVC statt AV1. Die Softwareunterstützung ist jedoch genau umgekehrt.

|  | HEIC | AVIF |
| --- | --- | --- |
| Browser mit Decoder | nur Safari | alle |
| Browser mit Encoder | keiner | keiner |
| Ein Konverter muss daher mitliefern | einen Decoder von etwa 1,4 MB | gar nichts |

Deshalb lädt unser [HEIC-Konverter](https://abox.tools/de/heic-in-jpg-umwandeln/) beim ersten Einsatz einen Codec und erklärt das ausführlich, während dieser nichts herunterlädt. Dieselbe Website und dasselbe Versprechen führen zu verschiedenen ehrlichen Antworten, weil die Formate sich tatsächlich unterscheiden.

Daraus folgt eine Frage für jeden Konverter: *Kann mein Browser das bereits?* Falls ja, ist ein Upload eine Entscheidung der Website und keine Voraussetzung der Aufgabe.

## Die JPG-Datei wird um ein Mehrfaches größer

Rechnen Sie damit. Ein AVIF von 40 KB kann bei gleicher sichtbarer Qualität als JPEG leicht 200 KB belegen. Das Beispiel auf der Werkzeugseite wird etwa fünfmal größer. Die Ergebniszeile zeigt das ausdrücklich.

AVIF gehört zu den effizientesten Bildcodecs, JPEG zu den ältesten. Sie tauschen Speicherplatz gegen Kompatibilität. Wenn das Ziel kein AVIF annimmt, ist das der richtige Tausch. Ein Tausch bleibt es trotzdem.

Wenn die Größe danach wichtig ist, verkleinert der [Bildkompressor](https://abox.tools/de/bild-komprimieren/) das JPEG auf einen gewünschten Wert. Das Werkzeug bietet ihn unter dem Ergebnis an.

## Was diese Umwandlung nicht erhält

Zwei Dinge, die die meisten Bilder nicht betreffen:

**Transparenz.** AVIF kann einen transparenten Hintergrund haben, JPEG nicht. Deshalb muss dahinter eine Farbe stehen. Das Werkzeug fragt nach ihr und verwendet standardmäßig Weiß, aber nur bei tatsächlich transparenten Dateien. Die meisten AVIFs von Webseiten sind undurchsichtige Fotos; die Frage erscheint dann nicht. Soll Transparenz bleiben, verwenden Sie den [Bildkompressor](https://abox.tools/de/bild-komprimieren/), der AVIF liest und PNG sowie WebP schreibt.

**HDR und hohe Farbtiefe.** Dieses Werkzeug schreibt ein gewöhnliches 8-Bit-SDR-JPEG aus einem Browser-Canvas. Zusätzliche AVIF-Farbtiefe und HDR-Informationen bleiben nicht erhalten; Farben oder helle Spitzlichter können sich ändern. Für das Archiv das Original behalten. HDR-Formate auf JPEG-Basis gibt es: [Androids Ultra-HDR-Spezifikation](https://developer.android.com/media/platform/hdr-image-format) beschreibt eine Gain Map, die dieses Werkzeug nicht erzeugt.

## Die Gegenrichtung ist ein anderes Problem

Hier gibt es kein JPG-zu-AVIF-Werkzeug, weil **diese Seite keinen AVIF-Encoder mitliefert**. Die Canvas-Ausgabe nutzt JPEG, PNG oder WebP und gibt kein umbenanntes PNG als AVIF aus.

Mit einem eigenen Encoder, auch WebAssembly, ist lokales AVIF-Kodieren ohne Server möglich. Das ist eine andere Umsetzung als diese Seite. Ein nicht unterstütztes natives Canvas-Format fällt auf PNG zurück, wie [die Canvas-Dokumentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) erklärt.

## Die Metadaten kommen nicht mit

Das Bild wird dekodiert und neu gezeichnet. Es bleibt bei Pixeln: EXIF, GPS, Farbprofile und XMP gehen verloren. Bei einem Bild von einer Webseite waren diese Informationen meist ohnehin nicht vorhanden.

Um vor einer Entscheidung vorhandene Informationen zu prüfen, verwenden Sie den [EXIF-Betrachter und Entferner](https://abox.tools/de/exif-daten-entfernen/). Er komprimiert nichts erneut. Der Ratgeber [Entfernt eine Bildumwandlung die Metadaten?](https://abox.tools/de/ratgeber/entfernt-das-umwandeln-die-metadaten-eines-fotos/) erklärt das ausführlicher.
