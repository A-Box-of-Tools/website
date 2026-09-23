# Bilder in Video — eine MP4-Diashow erstellen

Aus einem Ordner voller Bilder ein Video machen.

> JPG-, PNG- oder WebP-Bilder in ein MP4-Diashow-Video verwandeln, kostenlos und vollständig in Ihrem Browser. Nichts wird hochgeladen, keine Anmeldung, und offline geht es auch.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/bilder-in-video-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Jedes Einzelbild wird von Ihrem eigenen Browser kodiert, und das Video entsteht im Arbeitsspeicher dieses Geräts. Der Encoder geht nie ans Netz, und selbst wenn er es täte, stünde am anderen Ende dieser Seite kein Server, an den ein Bild gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So machen Sie aus Bildern ein Video

1. **Wählen Sie Ihre Bilder aus.** Ziehen Sie einen Ordner auf das Auswahlfeld oder suchen Sie die Dateien von Hand heraus. Der Browser liest sie direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Bringen Sie sie in die Reihenfolge und legen Sie die Standzeit fest.** Umsortiert wird durch Ziehen. Die Standzeit lässt sich in Einzelbildern oder in Sekunden angeben, entweder für alle Bilder auf einmal oder Bild für Bild.
3. **Wählen Sie Auflösung und Bildrate.** „An höchste Auflösung anpassen“ richtet sich nach Ihrem größten Bild. Die Voreinstellungen decken 4K, 1080p, 720p, quadratisch und hochkant ab, und für den Fall, dass nichts davon passt, gibt es eine eigene Größe.
4. **Video erzeugen und herunterladen.** Die Kodierung läuft auf Ihrer eigenen Hardware. Wie lange sie dauert, hängt daher von Ihrem Gerät ab und nicht von einer Warteschlange. Das fertige MP4 geht direkt in die Downloads Ihres Browsers.

## Die ausführliche Fassung

[So machen Sie aus einem Ordner voller Bilder ein Video](https://abox.tools/de/ratgeber/aus-bildern-ein-video-machen/): Eine MP4-Diashow aus Fotos bauen: was Bildrate und Standzeit wirklich steuern, was mit Bildern im falschen Format geschieht und warum das Ergebnis keine Tonspur hat.

## Auch im Werkzeugkasten

- [Video-Schneider](https://abox.tools/de/video-schneiden/): Beim Abspielen markieren, was bleiben soll. Und alles davon als ein Video zurückbekommen.
- [Video-Zuschneider](https://abox.tools/de/video-zuschneiden/): Einen Clip auf den Teil zurechtschneiden, auf den es ankommt.
- [Video-Umkehrer](https://abox.tools/de/video-rueckwaerts-abspielen/): Das letzte Einzelbild zuerst, samt Ton.
- [Zeitraffer-Generator](https://abox.tools/de/zeitraffer-erstellen/): Eine Stunde Aufnahme in zwanzig Sekunden.

## Fragen

### Werden meine Bilder irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, setzt zusammen und kodiert auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Die eine Ausnahme ist die optionale Funktion „Von einer Webadresse hinzufügen“, die ein von Ihnen eingefügtes Bild abruft. Jener Server sieht dabei Ihre IP-Adresse.

### Welche Bildformate kann ich verwenden?

Jedes Standbildformat, das Ihr Browser dekodieren kann, in der Praxis also JPG, PNG, WebP, GIF, AVIF und auf Apple-Geräten HEIC. Eine eigene Liste, die aktuell gehalten werden müsste, gibt es hier nicht, denn das Dekodieren ist Sache des Browsers und nicht unsere.

### Welches Videoformat kommt heraus?

MP4 mit H.264-Video, das praktisch überall läuft. In einem Browser ohne WebCodecs weicht das Werkzeug darauf aus, stattdessen WebM aufzuzeichnen, also dasselbe Material in einem Container, den weniger Schnittprogramme annehmen.

### Kann ich das für eine Render-Sequenz aus Blender oder After Effects nutzen?

Ja, eine durchnummerierte Render-Sequenz ist geradezu der Anlass für dieses Werkzeug. Fügen Sie die Einzelbilder hinzu, die Ihr Renderer geschrieben hat, lassen Sie die Standzeit bei einem Einzelbild und stellen Sie die Bildrate passend zum Render ein. „Nach Name sortieren“ zählt so, wie Sie es erwarten würden: `frame_2` landet vor `frame_10` und nicht dahinter. \
\
Eines sollten Sie vorher wissen. H.264 hat keinen Alphakanal, Transparenz wird also auf die Hintergrundfarbe heruntergerechnet statt mitgenommen. Muss das Alpha erhalten bleiben, setzen Sie die Einzelbilder besser in Ihrem Schnittprogramm zusammen.

### Kann ich aus Fotos einen Zeitraffer machen?

Ja, und es ist dieselbe Aufgabe wie eine Render-Sequenz. Halten Sie jedes Foto ein einzelnes Einzelbild lang und wählen Sie eine Bildrate. Bei 30 fps ergeben je dreißig Fotos eine Sekunde Video, bei 12 fps laufen dieselben Fotos zweieinhalb Sekunden. \
\
„Nach Datum sortieren“ bringt eine Kamerarolle zurück in die Reihenfolge, in der sie aufgenommen wurde, und darauf kommt es an, wenn die Dateinamen zwischendurch wieder bei 0001 angefangen haben. Fotos unterschiedlicher Größe sind kein Problem, denn „An höchste Auflösung anpassen“ legt das Video so aus, dass keines von ihnen verkleinert wird.

### Gibt es eine Grenze für die Zahl der Bilder oder die Länge des Videos?

Im Werkzeug ist keine Grenze eingebaut. Die praktische Obergrenze setzt der Arbeitsspeicher Ihres Geräts, denn das fertige Video wird dort zusammengesetzt, bevor Sie es herunterladen. Als Erstes bekommen das sehr große 4K-Diashows zu spüren.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Bilder übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Bilder zum Verarbeiten wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

### Kann ich Musik oder eine Tonspur hinzufügen?

Noch nicht. Das Werkzeug erzeugt reines Video, und das MP4, das es schreibt, hat eine einzige Videospur und keine Tonspur. Brauchen Sie Ton, legen Sie ihn hinterher in einem Schnittprogramm darunter.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Bilder haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien landen könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen. Früher stand hier `connect-src 'none'`, was absolut war. Die Werbung hat das gekostet, und es auszusprechen gehört zum Handel dazu.
- **Die Kodierung ist lokal.** WebCodecs läuft in Ihrem Browser, und die fertige Datei geht direkt in einen Download. Eine Serverseite hat dieses Programm nicht.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihre Bilder übergeben, weder eine Datei noch ein Vorschaubild, ein Name, eine Größe oder eine Anzahl. Jede Zeile, die ein Bild liest, dekodiert, zusammensetzt oder kodiert, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihre Bilder bekommt er nichts. Solange Sie ihn nicht anklicken, passiert nichts, und was Sie damit ansteuern, ist die Seite von jemand anderem.
- **Eine bewusste Ausnahme.** Benutzen Sie „Von einer Webadresse hinzufügen“, wird jener Server kontaktiert, um das Bild zu holen, und sieht dabei Ihre IP-Adresse. Abgerufen wird nur, was Sie selbst einfügen, und nur in eine Richtung, nämlich herein: `img-src` ist geöffnet, `connect-src` nicht. Der Zähler weiter unten führt jede fremde Adresse auf, die kontaktiert wurde.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles außer dem Laden per Webadresse arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, sowie `src/encoder.js` für die Kodierschleife, die nie ans Netz geht.
