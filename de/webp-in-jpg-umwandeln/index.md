# WebP zu JPG — ohne Upload umwandeln

Die Bilder, die das Web speichert, in dem Format, das überall angenommen wird.

> Wandeln Sie WebP und AVIF-Bilder im Browser in JPG um. Ihr Browser dekodiert WebP bereits: ohne Upload, ohne Konto und auch offline. Transparente Bereiche werden mit einer Farbe Ihrer Wahl gefüllt.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/webp-in-jpg-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Die Umwandlung läuft in Ihrem Browser auf Ihrer eigenen Hardware. Kein Decoder muss heruntergeladen werden, und keine Engine muss starten. Ihr Browser liest WebP seit 2020 und schreibt JPEG seit seinen Anfängen. Alles, was diese Seite braucht, war daher schon auf Ihrem Rechner. Deshalb kann sie ihr Versprechen halten: Sie hat keine Netzwerkfunktion und keinen Server, an den ein Bild gesendet werden könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Größenbegrenzung
- ✓ Funktioniert offline
- ✓ Open Source

## So wandeln Sie WebP in JPG um

1. **Wählen Sie Ihre WebP und AVIF-Dateien.** Ziehen Sie sie auf die Dateiauswahl oder wählen Sie sie von Hand. Jede Datei wird anhand ihrer ersten Bytes statt ihres Namens erkannt. Ein WebP namens „.jpg“ funktioniert weiterhin. Eine tatsächliche PNG-Datei wird mit einer Erklärung ihres Formats abgelehnt, statt in eine Kopie ihrer selbst umgewandelt zu werden.
2. **Lesen Sie die Angaben zu jeder Datei.** Die Liste nennt Größe und Abmessungen sowie drei Dinge, die vor der Umwandlung wichtig sind: ob das WebP verlustfrei ist, transparente Bereiche hat oder animiert ist. Jeder Hinweis erscheint nur, wenn er für die Datei zutrifft.
3. **Wählen Sie die Qualität und die Farbe hinter der Transparenz.** Der Regler beginnt bei 92. Ein Foto lässt sich damit kaum vom Original unterscheiden. Das Farbfeld erscheint nur, wenn eine Datei transparente Bereiche hat, weil JPEG diese mit einer Farbe füllen muss.
4. **Drücken Sie „Umwandeln“ und laden Sie das Ergebnis herunter.** Jedes Ergebnis nennt die Ausgangsdatei, die neue Größe und den Unterschied. Ein Hinweis erklärt aufgefüllte Transparenz oder die Übernahme nur des ersten Animationsbildes. Eine Datei erhält eine Downloadschaltfläche, mehrere zusätzlich ein ZIP-Archiv.

## Die ausführliche Fassung

[Das vom Web gespeicherte Bild in dem Format, das überall angenommen wird](https://abox.tools/de/ratgeber/webp-in-jpg-umwandeln/): Ein gespeichertes .webp-Bild lässt sich nicht öffnen? Was WebP ist, warum JPG größer wird, was mit Transparenz passiert und wie die Umwandlung ohne Upload gelingt.

## Auch im Werkzeugkasten

- [PNG zu WebP](https://abox.tools/de/png-in-webp-umwandeln/): Dasselbe Bild, oft ein Drittel kleiner, mit unveränderten transparenten Bereichen.
- [AVIF zu JPG](https://abox.tools/de/avif-in-jpg-umwandeln/): Das Format, in dem Websites heute speichern, in dem Format, das überall angenommen wird.
- [Passbild-Ersteller](https://abox.tools/de/biometrisches-passbild/): Land auswählen. Es wendet genau die Vorschrift dieses Landes an.
- [Bild-Stacker](https://abox.tools/de/bilder-stacken/): Zwanzig Aufnahmen werden eine, ohne zwanzig Uploads und ohne RAW-Konverter.

## Fragen

### Wird mein Bild irgendwo hochgeladen?

Nein. Ihr Browser liest, dekodiert und schreibt die Datei auf Ihrer eigenen Hardware. Dieses Werkzeug hat keinerlei Netzwerkfunktion: Es ruft nichts ab und versendet nichts. Die `Content-Security-Policy` der Seite nennt jede erlaubte Kontaktadresse; keine gehört zu dieser Website. Anders als beim HEIC-Konverter muss nicht einmal ein Decoder zuerst geladen werden. Ihr Browser hat bereits einen.

### Warum sollte ich WebP überhaupt in JPG umwandeln?

Weil die empfangende Software noch nicht mit WebP umgehen kann. Browser speichern beim Rechtsklick auf ein Webbild oft WebP, das besonders kleine Dateien erzeugt. Viele Programme akzeptieren es trotzdem nicht: ältere Office- und Photoshop-Versionen, manche Druckereien, Uploadformulare mit Erweiterungsprüfung, die meisten E-Reader und viel mit Kameras oder Druckern gelieferte Software. JPG ist das Format, das praktisch nie abgelehnt wird.

### Was passiert mit transparenten Bereichen?

Sie werden mit einer Farbe Ihrer Wahl gefüllt. Die Seite erklärt das vor dem Start. JPEG hat keinen Alphakanal, Transparenz kann dabei also nicht bleiben. Sie entscheiden, welche Farbe darunter liegt. Weiß ist die Voreinstellung, weil es für ein Logo in einem Dokument meist passt. Brauchen Sie Transparenz, behalten Sie das WebP oder erzeugen Sie mit dem [Bildkompressor](https://abox.tools/de/bild-komprimieren/) ein PNG. Er schreibt PNG und WebP ebenso wie JPEG.

### Kann es ein animiertes WebP umwandeln?

Es wandelt das erste Bild um und erklärt das sowohl vor dem Start in der Dateizeile als auch im Ergebnis. JPEG enthält ein einzelnes Bild und kann die übrigen nicht aufnehmen. Brauchen Sie alle Bilder einzeln oder die Animation als Video, sind [GIF zerlegen](https://abox.tools/de/gif-in-einzelbilder-zerlegen/) und [GIF zu MP4](https://abox.tools/de/gif-in-mp4-umwandeln/) die passenden Werkzeuge, sobald die Animation als GIF vorliegt.

### Wird das Bild erneut komprimiert?

Ja, das ist erforderlich. WebP und JPEG verwenden verschiedene Codecs; ohne Dekodierung und erneute Kodierung lässt sich nicht wechseln. Das gilt für alle WebP-zu-JPG-Konverter, auch für solche mit Upload. Sie bestimmen den Qualitätsverlust. Der Regler beginnt bei 92, womit sich ein Foto kaum vom Original unterscheiden lässt. Bei einem verlustfreien WebP ist das JPEG die erste verlustbehaftete Kopie dieses Bildes. Deshalb markiert die Liste verlustfreie Dateien vorab.

### Wird die JPG-Datei größer als das WebP?

Oft ja. Das Ergebnis zeigt den Unterschied ausdrücklich. WebP kodiert bei gleicher sichtbarer Qualität effizienter als JPEG; deshalb hat das Web darauf umgestellt. Die Umwandlung zurück braucht meist mehr Platz. Sie tauschen Speicherplatz gegen Kompatibilität, was sinnvoll ist, wenn das Ziel kein WebP akzeptiert. Wenn die Größe danach wichtig ist, verkleinert der [Bildkompressor](https://abox.tools/de/bild-komprimieren/) das JPEG auf einen gewünschten Wert.

### Bleiben Datum, Kamera und Standort erhalten?

Nein. Das Bild wird auf ein Canvas gezeichnet, das nur Pixel enthält. EXIF, GPS, Farbprofile und XMP bleiben zurück. Die meisten WebP-Bilder im Web haben diese Daten bereits verloren. Wer ein Bild versenden will, wünscht das meist ohnehin. [EXIF-Betrachter und Entferner](https://abox.tools/de/exif-daten-entfernen/) liest und bearbeitet Metadaten von JPEG, PNG und WebP, ohne deren Bilder neu zu kodieren. Bei AVIF zeigt es verfügbares EXIF schreibgeschützt an und bereinigt durch Umwandlung des ersten dekodierten Bildes in ein neues PNG; Farben oder HDR können sich ändern.

### Kann ich einen ganzen Ordner auf einmal umwandeln?

Ja. Ziehen Sie beliebig viele Dateien hinein. Zahl und Größe sind nicht begrenzt, weil kein Server dafür aufkommen muss. Jede erhält eine eigene Zeile und einen eigenen Download. Ab zwei gibt es ein ZIP-Archiv mit allen Ergebnissen. Bei gleichen Namen wird vor der Erweiterung eine Zahl ergänzt, damit sich im Archiv nichts unbemerkt ersetzt.

### Ist es kostenlos und brauche ich ein Konto?

Es ist kostenlos, ohne Konto, Anmeldung, Testphase oder Wasserzeichen. Werbung finanziert die Website und erhält keine Informationen über Ihre Bilder.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal und trennen Sie die Internetverbindung. Sie arbeitet unverändert weiter. Das ist zugleich der stärkste verfügbare Beweis, dass nichts hochgeladen wird. Ein Konverter, der Dateien zur Verarbeitung versendet, würde ohne Verbindung sofort stoppen; dieser tut das nicht.

### Kann ich auch AVIF-Bilder umwandeln?

AVIF wird ebenfalls angenommen, wenn Ihr Browser es dekodieren kann. Das Ausgabeformat bleibt JPEG. AVIF-Sequenzen liefern nur das erste dekodierte Bild. Das Browser-Canvas erzeugt eine 8-Bit-SDR-Kopie: Farben oder HDR können sich ändern, Metadaten entfallen und die Datei kann größer sein. Ihre Originaldatei bleibt unverändert.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Bilder haben kein Ziel außerhalb Ihres Rechners.** Die Content-Security-Policy nennt jede Adresse, die diese Seite kontaktieren darf. Keine davon gehört zu dieser Website. Es gibt keinen Endpunkt, der Ihre Dateien sammeln könnte, und keinen Code, der sie versenden würde.
- **Kein Decoder zum Ausliefern, deshalb kein Server.** Jeder seit 2020 veröffentlichte Browser dekodiert WebP, und alle schreiben schon viel länger JPEG. Dieses Werkzeug hat daher keine eigene Engine, lädt bei der ersten Nutzung nichts nach und braucht keinen Server. Genau das verschweigen Konverter, die einen Upload verlangen. Der [HEIC-Konverter](https://abox.tools/de/heic-in-jpg-umwandeln/) hier enthält dagegen einen Codec, weil tatsächlich nur Safari HEIC öffnet. Seine Seite erklärt das.
- **Die transparenten Bereiche und die Farbe dahinter.** WebP kann transparent sein, JPEG nicht. Das Format hat keinen Alphakanal, deshalb muss eine Hintergrundfarbe darunter liegen. Diese Seite fragt nach ihr und verwendet standardmäßig Weiß. Sie fragt nur bei tatsächlich transparenten Dateien; das wird an den dekodierten Pixeln festgestellt, nicht am Format vermutet. Ein Konverter, der nicht fragt, behält die Transparenz nicht. Er wählt meist Schwarz, daher kommen Logos mit schwarzem Hintergrund.
- **Was ein Canvas nicht übernimmt.** Das Bild wird dekodiert und auf ein Canvas gezeichnet, das nur Pixel enthält. EXIF, ICC-Farbprofile, XMP und Urheberrechtsblöcke gehen dabei verloren. Für viele Menschen ist das erwünscht, für andere ein Verlust. Deshalb steht es vorab hier. [EXIF-Betrachter und Entferner](https://abox.tools/de/exif-daten-entfernen/) liest und bearbeitet Metadaten von JPEG, PNG und WebP, ohne deren Bilder neu zu kodieren. Bei AVIF zeigt es verfügbares EXIF schreibgeschützt an und bereinigt durch Umwandlung des ersten dekodierten Bildes in ein neues PNG; Farben oder HDR können sich ändern.
- **Was Google lädt und welche Informationen es nicht erhält.** Werbe- und Messskripte kommen von Google, die Spendenschaltfläche von Buy Me a Coffee. Keines davon erhält Informationen über Ihre Bilder. Jede Zeile, die eine Datei liest, dekodiert oder schreibt, wird von dieser Herkunft ausgeliefert und steht im Repository.
- **Es funktioniert offline.** Laden Sie die Seite einmal und trennen Sie die Netzwerkverbindung. Das Werkzeug arbeitet unverändert weiter. Das ist der einfachste Beweis: Ein Konverter, der Ihre Bilder zur Verarbeitung verschickt, könnte das nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, sowie `src/shared/image-convert.js` für die Umwandlung: die Erkennung des tatsächlichen Formats, die Dekodierung und das Canvas, aus dem JPEG geschrieben wird. Die anderen beiden Formatkonverter verwenden dieselbe Datei. Sie hat etwa dreihundert Zeilen und enthält keinen Codec.
