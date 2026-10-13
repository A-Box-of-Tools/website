# Das vom Web gespeicherte Bild in dem Format, das überall angenommen wird

Wer heute ein Webbild per Rechtsklick speichert, erhält oft eine `.webp`-Datei. Der Browser liest sie problemlos, andere Software häufig nicht. Hier erfahren Sie, was das Format ist, was eine Umwandlung kostet und warum JPEG meist größer wird.

[WebP zu JPG öffnen](https://abox.tools/de/webp-in-jpg-umwandeln/): Die Bilder, die das Web speichert, in dem Format, das überall angenommen wird.

Zuletzt aktualisiert 4. Oktober 2026

AVIF wird ebenfalls angenommen, wenn Ihr Browser es dekodieren kann. Das Ausgabeformat bleibt JPEG. AVIF-Sequenzen liefern nur das erste dekodierte Bild. Das Browser-Canvas erzeugt eine 8-Bit-SDR-Kopie: Farben oder HDR können sich ändern, Metadaten entfallen und die Datei kann größer sein. Ihre Originaldatei bleibt unverändert.

## Die kurze Antwort

Öffnen Sie den [WebP-zu-JPG-Konverter](https://abox.tools/de/webp-in-jpg-umwandeln/), ziehen Sie die Dateien hinein und drücken Sie „Umwandeln“. Lassen Sie die Qualität ohne besonderen Grund bei 92. Sie erhalten JPEG-Dateien mit je einer Downloadschaltfläche oder bei mehreren ein ZIP-Archiv.

Dabei wird nichts hochgeladen, weil es nicht nötig ist. Dieser Punkt erklärt zugleich, warum die Arbeit so schnell geht: Der Decoder steckt bereits im Browser.

## Warum Sie überhaupt eine .webp-Datei haben

WebP ist Googles Bildformat. Websites verwenden es, weil es bei gleicher sichtbarer Qualität deutlich kleiner als JPEG ist, meist um ein Viertel bis Drittel und gelegentlich mehr. Für Websites mit Millionen Bildern spart das Bandbreite und Ladezeit. Deshalb haben die meisten großen Websites in den letzten Jahren umgestellt.

Wenn Sie ein Bild per Rechtsklick speichern, landet daher das ausgelieferte Format im Downloadordner. Sie haben WebP nicht ausgewählt, sondern einfach ein Bild gespeichert.

Dann lässt es sich am gewünschten Ort nicht verwenden. Typische Hindernisse:

- Uploadformulare, deren Liste erlaubter Erweiterungen Jahre alt ist;
- ältere Versionen von Word, PowerPoint und Photoshop;
- die meisten E-Reader und viel Drucker- oder Kamerasoftware;
- manche Druckereien, die nur JPEG oder TIFF annehmen.

Ihr Browser öffnet es dagegen problemlos. Jeder Browser liest WebP seit 2020. Die Lücke zwischen dieser Unterstützung und der anderer Software ist der Grund für diese Seite.

## Die JPG-Datei wird wahrscheinlich größer. Das ist kein Fehler

Das überrascht viele Menschen und sollte vor der Umwandlung klar sein: Ein WebP von 300 KB wird oft zu einem JPEG von 450 KB. Dabei ist nichts schiefgegangen.

WebP kodiert effizienter als JPEG. JPEG wurde 1992 fertiggestellt; WebP kam 2010 mit zwanzig weiteren Forschungsjahren. Beim Wechsel zum älteren Format muss ein weniger leistungsfähiger Kompressor dasselbe Bild beschreiben und benötigt mehr Bytes. Sie tauschen Platzersparnis gegen Kompatibilität. Wenn das Ziel kein WebP akzeptiert, ist das sinnvoll. Ein Konverter, der diesen Tausch verheimlicht, würde Sie jedoch täuschen.

Wenn die Größe danach wichtig ist, verkleinert der [Bildkompressor](https://abox.tools/de/bild-komprimieren/) das JPEG auf einen gewünschten Wert. Das Werkzeug bietet ihn direkt unter dem Ergebnis an.

## Die Transparenz muss ersetzt werden

Das wird leicht übersehen und ist der Grund für Logos mit schwarzem Rechteck aus anderen Konvertern.

WebP kann transparent sein, JPEG nicht. Ohne Alphakanal lässt sich im JPEG nicht festhalten, dass an einer Stelle nichts ist. Hinter das Bild muss eine Farbe gezeichnet werden. Konverter, die nicht danach fragen, erhalten keine Transparenz, sondern entscheiden für Sie. Häufig wählen sie dabei Schwarz.

Der [Konverter hier](https://abox.tools/de/webp-in-jpg-umwandeln/) fragt, verwendet standardmäßig Weiß und fragt nur bei tatsächlich transparenten Dateien. Geprüft werden die dekodierten Pixel statt nur das Format. Viele WebP-Dateien haben einen Alphakanal, der überall undurchsichtig ist. Ein Farbwähler ohne Wirkung wäre dann unnötig.

Brauchen Sie die Transparenz, wandeln Sie nicht in JPEG um. Behalten Sie das WebP oder erzeugen Sie mit dem [Bildkompressor](https://abox.tools/de/bild-komprimieren/) ein PNG. Er liest WebP und schreibt PNG.

## Animiertes WebP liefert ein einzelnes Bild

WebP kann wie GIF eine Animation enthalten. JPEG enthält genau ein Bild und kann die übrigen Animationsbilder nicht übernehmen.

Das Werkzeug erklärt das vor dem Start in der Dateizeile und anschließend im Ergebnis. Sie erhalten das erste Bild. Soll die Animation abspielbar bleiben, benötigen Sie ein Video statt eines Standbilds. Der Ratgeber [GIF in MP4 umwandeln](https://abox.tools/de/ratgeber/gif-in-mp4-umwandeln/) erklärt diesen Weg.

## Das Bild wird erneut komprimiert. Daran führt kein Weg vorbei

WebP und JPEG verwenden verschiedene Codecs. Kein geschickter Containerwechsel wandelt eines ins andere um. Das Bild muss zu Pixeln dekodiert und neu kodiert werden. Alle WebP-zu-JPG-Konverter tun das, auch solche mit Upload.

Sie bestimmen den Qualitätsverlust. Der Regler beginnt bei 92, womit sich ein Foto kaum vom Original unterscheiden lässt. Unter etwa 75 werden Verluste an harten Kanten und Text sichtbar.

Ein besonderer Fall ist **verlustfreies** WebP, wie es Grafikprogramme für flache Grafiken schreiben. Das daraus erzeugte JPEG ist die erste verlustbehaftete Kopie dieses Bildes. Das Werkzeug markiert solche Dateien in der Liste, damit Sie bewusst entscheiden können.

## Die Metadaten kommen nicht mit

Die Umwandlung über ein Browser-Canvas übernimmt nur Pixel. EXIF, GPS-Koordinaten, Farbprofile und Urheberrechtsblöcke bleiben zurück.

Wer ein Bild weitergeben möchte, wünscht das oft ohnehin. Falls Sie die Daten brauchen oder sie vor einer Entscheidung prüfen möchten, liest und schreibt der [EXIF-Betrachter und Entferner](https://abox.tools/de/exif-daten-entfernen/) sie ohne erneute Bildkomprimierung. Mehr dazu steht in [Entfernt eine Bildumwandlung die Metadaten?](https://abox.tools/de/ratgeber/entfernt-das-umwandeln-die-metadaten-eines-fotos/).

## Warum dieses Werkzeug keinen Upload verlangt

Bei der Suche nach einem WebP-Konverter verlangen fast alle Ergebnisse einen Upload an einen Server. Fragen Sie sich, wozu der Server gebraucht wird. Hier lautet die Antwort: zu nichts.

Zum Lesen von WebP braucht es einen WebP-Decoder. Ihr Browser hat ihn seit 2020; deshalb konnte er das ursprüngliche Webbild anzeigen. Zum Schreiben von JPEG braucht es einen JPEG-Encoder, den Browser seit ihren Anfängen haben. Beide benötigten Fähigkeiten sind schon auf Ihrem Rechner. Eine Website mit Upload verwendet ihre eigene Kopie vorhandener Software und hält währenddessen Ihr Bild.

Das gilt nicht für jede Umwandlung. Der [HEIC-Konverter](https://abox.tools/de/ratgeber/heic-in-jpg-umwandeln/) braucht tatsächlich einen Decoder, den Ihr Browser nicht hat. Deshalb liefert er einen mit und erklärt das ausführlich. Die ehrliche Antwort hängt vom Format ab. Fragen Sie bei jedem Konverter, welcher Fall vorliegt. Die allgemeine Erklärung dazu steht in [Ist es sicher, Dateien hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/).
