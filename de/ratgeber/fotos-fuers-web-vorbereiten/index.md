# So machen Sie Handyfotos fertig fürs Web

Ein Handyfoto hat das falsche Format, ist viermal zu groß und weiß, wo Sie wohnen. Es postbar zu machen ist eine kurze Kette: umwandeln, zuschneiden, komprimieren. Jeder Schritt läuft auf Ihrem eigenen Gerät, und genau dorthin gehören Fotos mit Ihren GPS-Koordinaten darin.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

1. **iPhone-Fotos zuerst:** Schicken Sie alle HEIC-Dateien durch den [HEIC-Konverter](https://abox.tools/de/heic-in-jpg-umwandeln/) und wählen Sie, die Metadaten wegzulassen. Er sagt Ihnen, bevor irgendetwas umgewandelt wird, welche Fotos GPS-Koordinaten tragen. Fotos, die schon JPEG sind, überspringen diesen Schritt.
2. **Zuschneiden und skalieren:** Ziehen Sie den Stapel auf den [Bildgrößen-Änderer](https://abox.tools/de/bildgroesse-aendern/). Setzen Sie eine lange Kante, 1600 Pixel passen für die meisten Seiten, 2000, wenn Leser zoomen werden, oder legen Sie mit einem Klick ein Seitenverhältnis über den ganzen Stapel.
3. **Das Budget treffen:** Zum Schluss in den [Bildverkleinerer](https://abox.tools/de/bild-komprimieren/), der ein Ziel in Kilobyte nimmt statt eines Qualitätsreglers und einen Stapel als ein Zip zurückgibt.

Alles läuft in Ihrem Browser. Die Originale, volle Auflösung, GPS und alles, verlassen Ihr Gerät nie, und genau das ist der Grund, dies lokal zu erledigen statt über eine Konverter-Website.

## Wohin die Metadaten gehen

Das stille Risiko eines Handyfotos sind nicht die Pixel, sondern die Etiketten. EXIF-Metadaten verzeichnen die Kamera, die Zeitstempel und, auf fast jedem Telefon, die GPS-Koordinaten des Aufnahmeorts. Posten Sie das, veröffentlichen Sie womöglich Ihre Wohnadresse in einer Form, die jeder Betrachter lesen kann.

Das Nützliche an dieser Kette ist, dass sie die Etiketten von selbst erledigt. Skalieren und Komprimieren zeichnen das Bild beide aus Pixeln neu, und neu gezeichnete Pixel tragen keine Etiketten. Was aus Schritt 2 oder 3 kommt, ist also sauber, ohne dass Sie darum bitten. Die zwei Fälle, die eine Entscheidung brauchen:

- **HEIC umwandeln:** Der Konverter kann die Metadaten mitnehmen oder weglassen, es ist ein Kästchen, und er warnt, welche Fotos GPS an Bord haben. Für alles Öffentliche: weglassen.
- **Ein Foto, das Sie nicht skalieren:** Sollen die Pixel Byte für Byte unangetastet bleiben, nehmen Sie den [EXIF-Editor](https://abox.tools/de/exif-daten-entfernen/), der die Etiketten entfernt, ohne das Bild neu zu kodieren. Der [Metadaten-Ratgeber](https://abox.tools/de/ratgeber/exif-und-gps-daten-entfernen/) ist die lange Fassung.

## Warum vor dem Komprimieren skaliert wird

Weil Pixel das Budget sind. Ein 12-Megapixel-Foto, hart genug gepresst für einen 300-KB-Platz, sieht sichtbar schlechter aus als ein 2-Megapixel-Foto, das sanft in denselben Platz komprimiert wurde: Dieselben Kilobyte verteilen sich auf die sechsfache Fläche. Erst die Anzeigegröße zu entscheiden lässt den Verkleinerer sein Budget für Qualität ausgeben statt für Auflösung, die niemand sehen wird.

Der Verkleinerer skaliert von sich aus, wenn das Ziel anders nicht zu erreichen ist, aber er behandelt das als letzten Ausweg. Das Zuschneiden selbst im Größen-Änderer zu machen hält die Entscheidung, was wegfällt und welche Kante zählt, dort, wo sie hingehört.

Der [Skalier-Ratgeber](https://abox.tools/de/ratgeber/bild-skalieren/) und der [Komprimier-Ratgeber](https://abox.tools/de/ratgeber/bild-auf-groesse-komprimieren/) gehen je in ihrer Hälfte tiefer, auch dazu, was die Qualitätszahlen wirklich messen.

![Der Bild-Skalierer auf längste Seite gestellt, mit 1600 eingetragen und Voreinstellungen daneben.](https://abox.tools/screens/get-photos-ready-for-the-web/long-edge.webp)

Zuerst die lange Kante, denn sie ist die eine Einstellung, die ein Hoch- und ein Querformat gleich behandelt.

## Der ganze Stapel auf einmal

Jedes Werkzeug der Kette nimmt einen Ordner voll Dateien in einem Zug: Der Konverter macht jedes HEIC einschließlich Serienbildern, der Größen-Änderer legt ein Zuschneiden über den ganzen Satz oder lässt Sie jedes Foto anders rahmen, und der Verkleinerer gibt alles als ein einziges Zip zurück. Zwanzig Fotos kosten kaum mehr Ihrer Aufmerksamkeit als eines; die Rechenzeit gehört Ihrem Gerät, und sie ist kürzer, als jeder Upload gewesen wäre.

![Drei Ergebniszeilen, jede mit einem Foto, das von Megabyte auf etwa 150 kB gebracht wurde, samt der jeweils erreichten Qualität.](https://abox.tools/screens/get-photos-ready-for-the-web/quality.webp)

Und danach die Qualität, für den ganzen Stapel auf einmal. Die Reihenfolge zählt, und der Abschnitt darüber sagt, warum.

## Wenn Sie das jede Woche tun

Dass die Kette hier auf drei oder vier Seiten lebt, ist Absicht: Jede Seite macht eine Aufgabe, und jede beweist für sich, dass nichts Ihr Gerät verlässt. Aber jeder Schritt ist quelloffen: MIT-lizenziert, ein Ordner je Werkzeug, abhängigkeitsfreie ES-Module mit READMEs, die den Decoder, das Resampling und die Suche nach dem Größenziel erklären.

Wenn Ihre Fotos jedes Mal dieselbe Form annehmen, dieselbe lange Kante, dasselbe Budget, dasselbe Etiketten-weg, setzen Sie einen Coding-Agenten auf das [Repository](https://github.com/A-Box-of-Tools/website) an und lassen Sie ihn diese Module zu einer einzigen Ablagefläche mit Ihren Voreinstellungen zusammensetzen. Die Module sind zum Lesen geschrieben, und sie herauszuheben ist genau das, wofür die Lizenz da ist.
