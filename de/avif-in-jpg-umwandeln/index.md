# AVIF zu JPG — das Bild öffnen, das sich nicht öffnen lässt

Das Format, in dem Websites heute speichern, in dem Format, das überall angenommen wird.

> Wandeln Sie AVIF-Bilder im Browser in JPG um. Ihr Browser dekodiert AVIF bereits: ohne Upload, ohne Konto und auch offline. Transparente Bereiche werden mit einer Farbe Ihrer Wahl gefüllt.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/avif-in-jpg-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Die Umwandlung läuft in Ihrem Browser auf Ihrer eigenen Hardware. Kein Decoder muss heruntergeladen werden, und es gibt keine Wartezeit. Ihr Browser liest AVIF seit 2021; deshalb wird das Bild, das sich anderswo nicht öffnen lässt, in einem Browsertab problemlos angezeigt. Diese Seite nutzt den Decoder, zeichnet das Bild und schreibt eine JPEG-Datei. Sie hat keine Netzwerkfunktion und keinen Server, an den ein Foto gesendet werden könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Größenbegrenzung
- ✓ Funktioniert offline
- ✓ Open Source

## So wandeln Sie AVIF in JPG um

1. **Wählen Sie Ihre AVIF-Dateien.** Ziehen Sie sie auf die Dateiauswahl oder wählen Sie sie von Hand. Jede Datei wird anhand ihrer ersten Bytes statt ihres Namens erkannt. Ein beim Download umbenanntes AVIF funktioniert deshalb weiterhin. Eine tatsächliche PNG-Datei wird mit einer Erklärung ihres Formats abgelehnt.
2. **Wählen Sie die Qualität und die Farbe hinter transparenten Bereichen.** Der Regler beginnt bei 92. Ein Foto lässt sich damit kaum vom Original unterscheiden. Das Farbfeld erscheint nur, wenn eine Datei transparente Bereiche hat, weil JPEG diese mit einer Farbe füllen muss.
3. **Drücken Sie „Umwandeln“ und laden Sie das Ergebnis herunter.** Jedes Ergebnis nennt die Ausgangsdatei, die neue Größe und den Größenunterschied. Meist wird es deutlich größer, weil AVIF effizienter kodiert und Sie Speicherplatz gegen Kompatibilität tauschen. Eine Datei erhält eine Downloadschaltfläche, mehrere zusätzlich ein ZIP-Archiv.

## Die ausführliche Fassung

[Die Datei, die nur der Browser öffnet, in dem Sie gerade lesen](https://abox.tools/de/ratgeber/avif-in-jpg-umwandeln/): Ein heruntergeladenes .avif-Bild lässt sich nicht öffnen? Ihr Browser liest es bereits. Was AVIF ist, was JPEG nicht übernimmt, warum es größer wird und wie die Umwandlung ohne Upload gelingt.

## Auch im Werkzeugkasten

- [Passbild-Ersteller](https://abox.tools/de/biometrisches-passbild/): Land auswählen. Es wendet genau die Vorschrift dieses Landes an.
- [Bild-Stacker](https://abox.tools/de/bilder-stacken/): Zwanzig Aufnahmen werden eine, ohne zwanzig Uploads und ohne RAW-Konverter.
- [Bild-Schwärzer](https://abox.tools/de/bild-schwaerzen/): Was Sie abdecken, wird aus der Datei gelöscht und nicht darin versteckt.
- [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/): Sehen, was ein Foto über Sie verrät. Und es dann herausnehmen.

## Fragen

### Wird mein Bild irgendwo hochgeladen?

Nein. Ihr Browser liest, dekodiert und schreibt die Datei auf Ihrer eigenen Hardware. Dieses Werkzeug hat keinerlei Netzwerkfunktion: Es ruft nichts ab und versendet nichts. Die `Content-Security-Policy` der Seite nennt jede erlaubte Kontaktadresse; keine gehört zu dieser Website. Nicht einmal ein Decoder muss zuerst geladen werden, denn Ihr Browser hat bereits einen.

### Warum öffnet kein Programm auf meinem Rechner diese Datei?

Weil AVIF dort noch neu ist, wo es darauf ankommt. Websites verwenden es, weil es bei gleicher Qualität erheblich kleiner als JPEG ist. Wer ein Bild speichert, bekommt deshalb inzwischen eine `.avif`-Datei. Das Programm zum Öffnen ist oft älter als das Format. Windows braucht eine Erweiterung, viele Desktopeditoren lehnen es ab, und die meisten E-Reader, Drucker und Uploadformulare kennen es nicht. Ihr Browser liest es dagegen problemlos. Deshalb kann diese Seite helfen, und deshalb haben Sie die Datei überhaupt erhalten.

### Wird die JPG-Datei größer als das AVIF?

Mit großer Wahrscheinlichkeit, oft um ein Mehrfaches. Das Ergebnis zeigt den Unterschied ausdrücklich. AVIF gehört zu den effizientesten Bildcodecs und JPEG zu den ältesten. Ein Bild von 40 KB als AVIF kann bei gleicher sichtbarer Qualität als JPEG leicht 200 KB belegen. Sie tauschen Speicherplatz gegen Kompatibilität. Wenn die Größe danach wichtig ist, verkleinert der [Bildkompressor](https://abox.tools/de/bild-komprimieren/) das JPEG auf eine gewünschte Größe.

### Was passiert mit der Transparenz?

Sie wird mit einer Farbe Ihrer Wahl gefüllt. Die Seite erklärt das vor dem Start. AVIF hat einen Alphakanal, JPEG nicht; Transparenz kann bei dieser Umwandlung also nicht erhalten bleiben. Sie entscheiden, welche Farbe darunter liegt. Die meisten AVIF-Dateien sind undurchsichtige Fotos, bei denen das Farbfeld nie erscheint. Soll Transparenz bleiben, verwenden Sie den [Bildkompressor](https://abox.tools/de/bild-komprimieren/), der AVIF liest und PNG sowie WebP schreibt.

### Was ist mit HDR und 10-Bit-Farbe?

Beides geht verloren, weil JPEG es nicht aufnehmen kann. AVIF speichert zehn oder zwölf Bit pro Kanal und Spitzlichter, die heller sind als die Anzeige eines gewöhnlichen Bildschirms. JPEG hat acht Bit und kennt keinen solchen Dynamikbereich. Ein HDR-AVIF wird deshalb zu einem gewöhnlichen Bild. Für eine überall zu öffnende Datei ist das passend, für eine Archivierung ein echter Verlust. Fast kein Bild von einer gewöhnlichen Webseite enthält HDR; für die meisten Menschen ändert sich daher nichts.

### Wird das Bild erneut komprimiert?

Ja, das ist erforderlich. AVIF und JPEG verwenden verschiedene Codecs. Ohne Dekodierung und anschließende neue Kodierung lässt sich nicht zwischen ihnen wechseln. Das gilt für jeden AVIF-Konverter, auch für solche mit Upload. Sie bestimmen den Qualitätsverlust. Der Regler beginnt bei 92, womit sich ein Foto kaum vom Original unterscheiden lässt.

### Geht es auch andersherum, von JPG zu AVIF?

Hier nicht. Der Grund: Kein Browser schreibt AVIF. Ein Canvas, das um AVIF gebeten wird, liefert stillschweigend PNG mit dem falschen Typ. Eine Seite, die AVIF im Browser verspricht, liegt daher entweder falsch oder sendet das Bild zur Kodierung an einen Server. Für die korrekte Verarbeitung ohne Server wäre ein eigener Encoder nötig. Diese Arbeit steht auf [der Roadmap](https://abox.tools/de/roadmap/), statt hier nur behauptet zu werden.

### Bleiben Datum, Kamera und Standort erhalten?

Nein. Das Bild wird auf ein Canvas gezeichnet, das nur Pixel enthält. EXIF, GPS, Farbprofile und XMP bleiben zurück. Bei Bildern von Webseiten sind diese Daten meist ohnehin nicht vorhanden. Um vorhandene Daten zu sehen oder zu bearbeiten, verwenden Sie den [EXIF-Betrachter und Entferner](https://abox.tools/de/exif-daten-entfernen/); er komprimiert das Bild dabei nicht erneut.

### Kann ich einen ganzen Ordner auf einmal umwandeln?

Ja. Ziehen Sie beliebig viele Dateien hinein. Zahl und Größe sind nicht begrenzt, weil kein Server dafür aufkommen muss. Jede erhält eine eigene Zeile und einen eigenen Download. Ab zwei Dateien gibt es zusätzlich ein ZIP-Archiv mit allen Ergebnissen.

### Ist es kostenlos und funktioniert es offline?

Es ist kostenlos, ohne Konto, Anmeldung, Testphase oder Wasserzeichen. Werbung finanziert die Website und erhält keine Informationen über Ihre Bilder. Laden Sie die Seite einmal und trennen Sie die Internetverbindung: Sie arbeitet unverändert weiter. Das ist zugleich der stärkste verfügbare Beweis, dass nichts hochgeladen wird.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Bilder haben kein Ziel außerhalb Ihres Rechners.** Die Content-Security-Policy nennt jede Adresse, die diese Seite kontaktieren darf. Keine davon gehört zu dieser Website. Es gibt keinen Endpunkt, der Ihre Dateien sammeln könnte, und keinen Code, der sie versenden würde.
- **Der Decoder steckt bereits im Browser. Das ist der ganze Trick.** Ein AVIF, das Ihr Bildbetrachter ablehnt, öffnet sich in einem Browsertab problemlos: Chrome und Firefox dekodieren AVIF seit 2021, Safari seit 2023. Diese Seite ergänzt diesen Decoder um eine Speicherschaltfläche. Sie öffnet die Datei, zeichnet das Bild und schreibt ein JPEG. Es gibt also keine Engine zum Herunterladen, keine Wartezeit vor der ersten Umwandlung und keinen Grund für einen Server. Genau das verschweigen Konverter, die einen Upload verlangen.
- **Die transparenten Bereiche und die Farbe dahinter.** AVIF kann einen Alphakanal enthalten, JPEG nicht. Deshalb muss dahinter eine Farbe stehen. Diese Seite fragt nach ihr und verwendet standardmäßig Weiß. Sie fragt nur, wenn eine Datei tatsächlich Transparenz enthält, festgestellt anhand der dekodierten Pixel. Die meisten AVIF-Dateien von Websites sind undurchsichtige Fotos. Dann bleibt das Farbfeld verborgen.
- **Was JPEG aus einem AVIF nicht übernehmen kann.** AVIF kann mehr Farben und hellere Spitzlichter beschreiben als JPEG: zehn oder zwölf Bit pro Kanal und HDR. JPEG hat acht Bit und kein HDR. Ein entsprechendes Bild wird auf den gewöhnlichen Dynamikbereich reduziert. Bei der großen Mehrheit der Bilder gibt es nichts zu reduzieren und keinen sichtbaren Unterschied; bei einem Bildschirmfoto eines HDR-Fotos möglicherweise schon. Das steht deshalb vorab hier.
- **Was Google lädt und welche Informationen es nicht erhält.** Werbe- und Messskripte kommen von Google, die Spendenschaltfläche von Buy Me a Coffee. Keines davon erhält Informationen über Ihre Bilder. Jede Zeile, die eine Datei liest, dekodiert oder schreibt, wird von dieser Herkunft ausgeliefert und steht im Repository.
- **Es funktioniert offline.** Laden Sie die Seite einmal und trennen Sie die Netzwerkverbindung. Das Werkzeug arbeitet unverändert weiter. Das ist der einfachste Beweis: Ein Konverter, der Ihre Bilder zur Verarbeitung verschickt, könnte das nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, sowie `src/shared/image-convert.js` für die Umwandlung: die Formaterkennung, die echte AVIF-Dateien identifiziert, die Dekodierung und das Canvas, aus dem JPEG geschrieben wird. Die anderen beiden Formatkonverter verwenden dieselbe Datei; sie enthält keinen Codec.
