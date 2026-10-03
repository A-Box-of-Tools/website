# Die Datei, die nur der Browser öffnet, in dem Sie gerade lesen

Ein Bild von einer Website kommt als `.avif`, und Ihr Bildbetrachter lehnt es ab, während der Browser es problemlos anzeigt. Dieser Unterschied erklärt alles und ist der Grund, warum die Umwandlung Ihren Rechner nicht verlassen muss.

[AVIF zu JPG öffnen](https://abox.tools/de/avif-in-jpg-umwandeln/): Das Format, in dem Websites heute speichern, in dem Format, das überall angenommen wird.

Zuletzt aktualisiert 17. September 2026

## Die kurze Antwort

Öffnen Sie den [AVIF-zu-JPG-Konverter](https://abox.tools/de/avif-in-jpg-umwandeln/), ziehen Sie die Dateien hinein und drücken Sie „Umwandeln“. Lassen Sie die Qualität bei 92. Sie erhalten JPEG-Dateien mit je einer Downloadschaltfläche oder bei mehreren ein ZIP-Archiv.

Nichts wird hochgeladen, und auch vorab muss nichts heruntergeladen werden. Der Decoder steckt bereits im Browser, in dem Sie diese Seite lesen. Dieser entscheidende Punkt wird unten ausführlicher erklärt.

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

## Was JPEG nicht übernehmen kann

Zwei Dinge, die die meisten Bilder nicht betreffen:

**Transparenz.** AVIF kann einen transparenten Hintergrund haben, JPEG nicht. Deshalb muss dahinter eine Farbe stehen. Das Werkzeug fragt nach ihr und verwendet standardmäßig Weiß, aber nur bei tatsächlich transparenten Dateien. Die meisten AVIFs von Webseiten sind undurchsichtige Fotos; die Frage erscheint dann nicht. Soll Transparenz bleiben, verwenden Sie den [Bildkompressor](https://abox.tools/de/bild-komprimieren/), der AVIF liest und PNG sowie WebP schreibt.

**HDR und große Farbtiefe.** AVIF kann zehn oder zwölf Bit pro Kanal und hellere Spitzlichter als ein gewöhnlicher Bildschirm speichern. JPEG hat acht Bit und kein HDR. Solche Bilder werden auf den gewöhnlichen Dynamikbereich reduziert. Fast kein Bild von einer normalen Webseite nutzt diese Möglichkeiten. Bei Ihren Bildern entsteht daher sehr wahrscheinlich kein solcher Verlust.

## Die Gegenrichtung ist ein anderes Problem

Hier gibt es kein JPG-zu-AVIF-Werkzeug. Der Grund ist dieselbe Tatsache von der anderen Seite: **Kein Browser schreibt AVIF**. Ein Canvas liefert stattdessen stillschweigend PNG mit der falschen Formatangabe.

Eine Seite, die AVIF im Browser verspricht, liegt daher entweder falsch oder schickt Ihr Bild zur Kodierung an einen Server. Für die korrekte Verarbeitung ohne Server muss ein Encoder entwickelt werden. Diese echte Arbeit steht auf [der Roadmap](https://abox.tools/de/roadmap/), statt hier nur behauptet zu werden.

## Die Metadaten kommen nicht mit

Das Bild wird dekodiert und neu gezeichnet. Es bleibt bei Pixeln: EXIF, GPS, Farbprofile und XMP gehen verloren. Bei einem Bild von einer Webseite waren diese Informationen meist ohnehin nicht vorhanden.

Um vor einer Entscheidung vorhandene Informationen zu prüfen, verwenden Sie den [EXIF-Betrachter und Entferner](https://abox.tools/de/exif-daten-entfernen/). Er komprimiert nichts erneut. Der Ratgeber [Entfernt eine Bildumwandlung die Metadaten?](https://abox.tools/de/ratgeber/entfernt-das-umwandeln-die-metadaten-eines-fotos/) erklärt das ausführlicher.
