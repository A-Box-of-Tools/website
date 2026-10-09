# PNG zu WebP — kleiner, mit vollständiger Transparenz

Dasselbe Bild, oft ein Drittel kleiner, mit unveränderten transparenten Bereichen.

> Wandeln Sie PNG und AVIF-Bilder im Browser in WebP um, verlustfrei oder noch kleiner. Transparenz bleibt in beiden Modi erhalten. Ohne Upload, ohne Konto und auch offline.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/png-in-webp-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Die Umwandlung läuft in Ihrem Browser auf Ihrer eigenen Hardware. Alle Browser schreiben seit 2020 WebP. Der Encoder war daher schon auf Ihrem Rechner, bevor Sie diese Seite geöffnet haben. Es gibt nichts herunterzuladen und keine Wartezeit. Deshalb kann diese Seite ihr Versprechen halten: Sie hat keine Netzwerkfunktion und keinen Server, an den ein Bild gesendet werden könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Größenbegrenzung
- ✓ Funktioniert offline
- ✓ Open Source

## So wandeln Sie PNG in WebP um

1. **Wählen Sie Ihre PNG und AVIF-Dateien.** Ziehen Sie sie auf die Dateiauswahl oder wählen Sie sie von Hand. Jede Datei wird anhand ihrer ersten Bytes statt ihres Namens erkannt. Eine tatsächliche JPEG-Datei wird mit einer entsprechenden Erklärung abgelehnt, statt in eine Kopie ihrer selbst umgewandelt zu werden. Jede Zeile nennt vorhandene Transparenz, weil deren Verlust vielen Menschen besonders wichtig ist.
2. **Wählen Sie verlustfrei oder kleiner.** Verlustfrei behält jeden undurchsichtigen PNG-Pixel und erzeugt trotzdem eine kleinere Datei. Das passt für Bildschirmfotos, Diagramme, Logos und Bilder mit Text. „Kleiner“ aktiviert den Qualitätsregler und passt für Fotos, bei denen der Unterschied kaum sichtbar ist und die Platzersparnis enorm sein kann.
3. **Drücken Sie „Umwandeln“ und lesen Sie die Ergebnisangaben.** Jedes Ergebnis nennt die neue Größe und ihren Unterschied zur ursprünglichen. Danach zeigt es die vom Browser tatsächlich geschriebene Kodierung: verlustfrei oder verlustbehaftet mit der gewählten Qualität. Die Zeile wird aus der fertigen Datei gelesen, nicht einfach aus der Einstellung übernommen.
4. **Laden Sie einzeln oder alles zusammen herunter.** Eine Datei erhält eine Downloadschaltfläche, ab zwei gibt es zusätzlich ein ZIP-Archiv mit allen Ergebnissen. Bei gleichen Dateinamen wird vor der Erweiterung eine Zahl ergänzt, damit sich im Archiv nichts unbemerkt ersetzt.

## Die ausführliche Fassung

[Dasselbe Bild, ein Drittel kleiner, mit erhaltener Transparenz](https://abox.tools/de/ratgeber/png-in-webp-umwandeln/): WebP ist schon verlustfrei kleiner als PNG und mit Verlusten noch viel kleiner. Welche Wahl zu Ihrem Bild passt, was jeder Modus spart und wie die Umwandlung ohne Upload gelingt.

## Auch im Werkzeugkasten

- [AVIF zu JPG](https://abox.tools/de/avif-in-jpg-umwandeln/): Das Format, in dem Websites heute speichern, in dem Format, das überall angenommen wird.
- [Passbild-Ersteller](https://abox.tools/de/biometrisches-passbild/): Land auswählen. Es wendet genau die Vorschrift dieses Landes an.
- [Bild-Stacker](https://abox.tools/de/bilder-stacken/): Zwanzig Aufnahmen werden eine, ohne zwanzig Uploads und ohne RAW-Konverter.
- [Bild-Schwärzer](https://abox.tools/de/bild-schwaerzen/): Was Sie abdecken, wird aus der Datei gelöscht und nicht darin versteckt.

## Fragen

### Wird mein Bild irgendwo hochgeladen?

Nein. Ihr Browser liest, dekodiert und schreibt die Datei auf Ihrer eigenen Hardware. Dieses Werkzeug hat keinerlei Netzwerkfunktion: Es ruft nichts ab und versendet nichts. Die `Content-Security-Policy` der Seite nennt jede erlaubte Kontaktadresse; keine gehört zu dieser Website.

### Bleibt die Transparenz erhalten?

Ja, in beiden Modi. Das ist der wichtigste Grund, PNG in WebP statt in JPEG umzuwandeln. WebP hat einen echten Alphakanal. Ein Logo mit transparentem Hintergrund behält ihn; keine Farbe muss gewählt und nichts aufgefüllt werden. Jede Dateizeile nennt vor der Umwandlung vorhandene Transparenz. Das Ergebnis bestätigt ihre Übernahme.

### Was unterscheidet verlustfrei von kleiner?

Verlustfrei bedeutet, dass jeder undurchsichtige WebP-Pixel dem ursprünglichen PNG-Pixel entspricht. Die Datei wird trotzdem meist um ein Fünftel bis ein Drittel kleiner, weil WebP verlustfrei effizienter kodiert als PNG. Die Einschränkung bei halbtransparenten Pixeln wird in der nächsten Frage erläutert. „Kleiner“ verwendet die verlustbehaftete WebP-Kodierung, die kaum bemerkte Details verwirft und ein Foto auf ein Zehntel verkleinern kann. Als Faustregel: Text, flache Farbflächen und scharfe Kanten brauchen verlustfrei; Fotos den anderen Modus.

### Sie sagen „jeden undurchsichtigen Pixel“. Was ist mit halbtransparenten?

Sie können sich sehr geringfügig verändern. Das liegt am Canvas, nicht an WebP. Ein Browser speichert Canvas-Farben bereits mit ihrer Deckkraft multipliziert. Diese Multiplikation lässt sich nicht exakt rückgängig machen: Je durchsichtiger ein Pixel ist, desto weniger seiner ursprünglichen Farbe bleibt rechnerisch erhalten. Jeder browserbasierte Konverter hat diese Eigenschaft, auch dieser, weil das Canvas das Bild zwischen den Formaten überträgt. \
\
Praktisch bedeutet das: Vollständig undurchsichtige sowie vollständig unsichtbare Pixel bleiben Bit für Bit gleich. Dazwischen können die gespeicherten Farbwerte wechseln. Hier wurden bei Pixeln mit weniger als einem Viertel Deckkraft Unterschiede bis 63 von 255 gemessen, bei allen übrigen höchstens 4. Das ist nicht sichtbar. Gerade die am stärksten veränderten Farben werden am wenigsten angezeigt: Ein fast unsichtbarer Pixel trägt unabhängig vom gespeicherten Wert nur fast unsichtbare Farbe bei. Der geglättete Rand eines Logos ist der einzige betroffene Bereich und sieht hinterher gleich aus. \
\
Brauchen Sie eine bitgenaue Archivkopie, behalten Sie das PNG. Brauchen Sie das gleiche Aussehen bei einem Drittel weniger Platz, ist dieses Werkzeug dafür gedacht.

### Wie prüfen Sie, ob es wirklich verlustfrei war?

Die fertige Datei wird erneut gelesen und geprüft. WebP speichert Pixel in einem von zwei Blöcken: `VP8L` für verlustfreie und `VP8` für verlustbehaftete Kodierung. Diese Seite liest den vorhandenen Block und zeigt ihn in der Ergebniszeile an. Das ist nötig, weil ein Canvas keinen Schalter für Verlustfreiheit hat. Die höchste Qualität fordert sie indirekt an; jeder aktuelle Browser versteht das. Diese Seite prüft trotzdem nach.

### Lässt sich WebP wirklich überall öffnen?

Im Web ja: Chrome, Edge, Firefox und Safari zeigen WebP seit 2020. Für Websites ist kein Ersatzformat mehr nötig. Außerhalb des Browsers ist die Unterstützung uneinheitlicher. Windows und macOS zeigen inzwischen Vorschauen, doch ältere Desktopsoftware, einige Uploadformulare und viele E-Reader lehnen WebP weiterhin ab. Verwenden Sie für solche Ziele den Konverter [WebP zu JPG](https://abox.tools/de/webp-in-jpg-umwandeln/), der in die andere Richtung arbeitet.

### Warum ist mein PNG überhaupt so groß?

PNG ist verlustfrei, und Fotos lassen sich so schlecht komprimieren. Bei Bildschirmfotos und Logos wiederholen sich große Flächen; dafür ist PNG hervorragend. Bei Fotos wiederholt sich fast nichts. Ein Handyfoto als PNG ist oft zehnmal so groß wie dasselbe Bild als JPEG. Genau dafür ist hier der verlustbehaftete Modus sinnvoll. Muss die Datei unter einer bestimmten Größe bleiben, verwendet der [Bildkompressor](https://abox.tools/de/bild-komprimieren/) eine Zielgröße statt eines Qualitätswerts.

### Bleiben Datum, Kamera und Standort erhalten?

Nein. Das Bild wird auf ein Canvas gezeichnet, das nur Pixel enthält. Alle umgebenden Metadaten bleiben zurück. Bei PNG ist das meist unbedeutend, weil die meisten Dateien keine Kameradaten enthalten. [EXIF-Betrachter und Entferner](https://abox.tools/de/exif-daten-entfernen/) liest und bearbeitet Metadaten von JPEG, PNG und WebP, ohne deren Bilder neu zu kodieren. Bei AVIF zeigt es verfügbares EXIF schreibgeschützt an und bereinigt durch Umwandlung des ersten dekodierten Bildes in ein neues PNG; Farben oder HDR können sich ändern.

### Kann ich einen ganzen Ordner auf einmal umwandeln?

Ja. Ziehen Sie beliebig viele Dateien hinein. Zahl und Größe sind nicht begrenzt, weil kein Server dafür aufkommen muss. Jede erhält eine eigene Zeile und einen eigenen Download. Ab zwei gibt es ein ZIP-Archiv mit allen Ergebnissen und der gesamten Ersparnis am Anfang.

### Ist es kostenlos und brauche ich ein Konto?

Es ist kostenlos, ohne Konto, Anmeldung, Testphase oder Wasserzeichen. Werbung finanziert die Website und erhält keine Informationen über Ihre Bilder.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal und trennen Sie die Internetverbindung. Sie arbeitet unverändert weiter. Das ist zugleich der stärkste verfügbare Beweis, dass nichts hochgeladen wird. Ein Konverter, der Dateien zur Verarbeitung versendet, würde ohne Verbindung sofort stoppen; dieser tut das nicht.

### Kann ich auch AVIF-Bilder umwandeln?

AVIF wird ebenfalls angenommen, wenn Ihr Browser es dekodieren kann. Das Ausgabeformat bleibt WebP. AVIF-Sequenzen liefern nur das erste dekodierte Bild. Das Browser-Canvas erzeugt eine 8-Bit-SDR-Kopie: Farben oder HDR können sich ändern, Metadaten entfallen und die Datei kann größer sein. Ihre Originaldatei bleibt unverändert.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Bilder haben kein Ziel außerhalb Ihres Rechners.** Die Content-Security-Policy nennt jede Adresse, die diese Seite kontaktieren darf. Keine davon gehört zu dieser Website. Es gibt keinen Endpunkt, der Ihre Dateien sammeln könnte, und keinen Code, der sie versenden würde.
- **Die Transparenz bleibt erhalten. Genau darum geht es meistens.** WebP hat ebenso wie PNG einen Alphakanal. Ein Logo mit transparentem Hintergrund behält ihn. Es gibt keine Hintergrundfarbe zu wählen und keine Transparenz aufzufüllen. Das unterscheidet dieses Werkzeug vom benachbarten Konverter [WebP zu JPG](https://abox.tools/de/webp-in-jpg-umwandeln/), der danach fragen muss, weil JPEG keinen Alphakanal hat.
- **Verlustfreiheit wird geprüft.** Ein Canvas hat keinen Schalter für verlustfreies WebP. Der Browser wählt die Kodierung anhand des Qualitätswerts; alle aktuellen Browser verwenden am oberen Ende verlustfreie Kodierung. Das ist ein Verhalten der Engine und keine Garantie der Spezifikation. Deshalb liest diese Seite jede geschriebene Datei erneut und zeigt, ob ihre Bytes tatsächlich verlustfrei kodiert sind. Ändert ein Browser sein Verhalten, erfahren Sie es sofort.
- **Was ein Canvas nicht übernimmt.** Das Bild wird dekodiert und auf ein Canvas gezeichnet, das nur Pixel enthält. Textblöcke, ICC-Farbprofile und XMP-Blöcke im PNG gehen dabei verloren. Die Pixel bleiben — das bedeutet hier verlustfrei —, die Metadaten darum nicht. [EXIF-Betrachter und Entferner](https://abox.tools/de/exif-daten-entfernen/) liest und bearbeitet Metadaten von JPEG, PNG und WebP, ohne deren Bilder neu zu kodieren. Bei AVIF zeigt es verfügbares EXIF schreibgeschützt an und bereinigt durch Umwandlung des ersten dekodierten Bildes in ein neues PNG; Farben oder HDR können sich ändern.
- **Was Google lädt und welche Informationen es nicht erhält.** Werbe- und Messskripte kommen von Google, die Spendenschaltfläche von Buy Me a Coffee. Keines davon erhält Informationen über Ihre Bilder. Jede Zeile, die eine Datei liest, dekodiert oder schreibt, wird von dieser Herkunft ausgeliefert und steht im Repository.
- **Es funktioniert offline.** Laden Sie die Seite einmal und trennen Sie die Netzwerkverbindung. Das Werkzeug arbeitet unverändert weiter. Das ist der einfachste Beweis: Ein Konverter, der Ihre Bilder zur Verarbeitung verschickt, könnte das nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, sowie `src/shared/image-convert.js` für die Umwandlung, besonders `encodeWebp`. Die Funktion schreibt die Datei und liest ihre RIFF-Blöcke erneut, um zu prüfen, ob der Browser tatsächlich die angeforderte verlustfreie Kodierung verwendet hat.
