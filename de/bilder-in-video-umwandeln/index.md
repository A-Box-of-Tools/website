# Bilder in Video

Aus einer Render-Sequenz, Zeitrafferfotos oder einer Diashow ein MP4 machen.

> Eine Bildsequenz im Browser in MP4 umwandeln. Ein Einzelbild pro Bild für Renderings und Zeitraffer oder Sekunden pro Foto für eine Diashow. Kein Upload, kein Konto.

Dies ist ein interaktives Browser-Werkzeug unter https://abox.tools/de/bilder-in-video-umwandeln/. Dateien werden auf dem Gerät verarbeitet, auf dem dieser Browser läuft. Bewusstes Teilen und optionale Netzwerkfunktionen werden auf der Seite erklärt. Hier folgt die schriftliche Erklärung; zum Benutzen öffnen Sie die Adresse.

## Ihre Bilder werden **in Ihrem Browser verarbeitet**. Kein Upload zur Verarbeitung.

Jedes Einzelbild wird von Ihrem eigenen Browser kodiert, und das Video entsteht im Arbeitsspeicher dieses Geräts. Der Encoder geht nie ans Netz, und selbst wenn er es täte, stünde am anderen Ende dieser Seite kein Server, an den ein Bild gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So wandeln Sie eine Bildsequenz oder Diashow in MP4 um

1. **Wählen Sie Ihre Bilder aus.** Ziehen Sie einen Ordner auf das Auswahlfeld oder suchen Sie die Dateien von Hand heraus. Der Browser liest sie direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Einzelbilder für eine Sequenz wählen, Sekunden für eine Diashow.** Verwenden Sie „Nach Name sortieren“ für nummerierte Render-Einzelbilder und prüfen Sie die erste und die letzte Kachel. Behalten Sie für eine Render-Sequenz oder einen Foto-Zeitraffer ein Einzelbild pro Bild bei und passen Sie die Bildrate an Ihre Quelle an. Für eine Diashow wechseln Sie zu Sekunden, geben eine Standzeit wie drei ein und drücken „Auf alle anwenden“. Durch Ziehen sortieren Sie um, und die Standzeit eines einzelnen Bildes lässt sich überschreiben.
3. **Wählen Sie Auflösung und Bildrate.** Wählen Sie 1080p für einen ersten Export oder die quadratische oder hochkante Form des Ziels. „An höchste Auflösung anpassen“ nimmt die größte Breite und die größte Höhe aller Bilder. „Hineinpassen“ behält das ganze Bild, „Bild ausfüllen“ schneidet die Ränder ab. Prüfen Sie vor dem Kodieren die Übersicht zu Dauer und Ausgabegröße.
4. **Video erzeugen und herunterladen.** Die Kodierung läuft auf Ihrer eigenen Hardware. Wie lange sie dauert, hängt daher von Ihrem Gerät ab und nicht von einer Warteschlange. Das fertige MP4 geht direkt in die Downloads Ihres Browsers.

## Die ausführliche Fassung

[Eine Bildsequenz oder Fotodiashow in MP4 umwandeln](https://abox.tools/de/ratgeber/aus-bildern-ein-video-machen/): Nummerierte Renderframes oder Zeitrafferfotos in MP4 umwandeln oder eine Fotodiashow erstellen. Frames oder Sekunden wählen, die Reihenfolge prüfen und Beschnitt oder falsches Timing vermeiden.

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

MP4 mit H.264-Video ist das bevorzugte Ausgabeformat. Die Ausweichlösung zeichnet in Echtzeit auf, meist als WebM, das weniger Schnittprogramme annehmen. Lassen Sie den Tab während dieser Aufzeichnung sichtbar; das Timing ist nur ungefähr, und Bilder können ausfallen, wenn das Dekodieren nicht nachkommt. Nutzen Sie für exakte nummerierte Sequenzen den MP4-Encoder, wenn Ihr Browser ihn unterstützt.

### Kann ich das für eine Render-Sequenz aus Blender oder After Effects nutzen?

Ja, eine durchnummerierte Render-Sequenz ist geradezu der Anlass für dieses Werkzeug. Fügen Sie die Einzelbilder hinzu, die Ihr Renderer geschrieben hat, lassen Sie die Standzeit bei einem Einzelbild und stellen Sie die Bildrate passend zum Render ein. „Nach Name sortieren“ zählt so, wie Sie es erwarten würden: `frame_2` landet vor `frame_10` und nicht dahinter. \
\
Eines sollten Sie vorher wissen. H.264 hat keinen Alphakanal, Transparenz wird also auf die Hintergrundfarbe heruntergerechnet statt mitgenommen. Muss das Alpha erhalten bleiben, setzen Sie die Einzelbilder besser in Ihrem Schnittprogramm zusammen.

### Kann ich aus Fotos einen Zeitraffer machen?

Ja, und es ist dieselbe Aufgabe wie eine Render-Sequenz. Halten Sie jedes Foto ein einzelnes Einzelbild lang und wählen Sie eine Bildrate. Bei 30 fps ergeben je dreißig Fotos eine Sekunde Video, bei 12 fps laufen dieselben Fotos zweieinhalb Sekunden. \
\
„Nach Datum sortieren“ verwendet das Änderungsdatum der Dateien, das sich beim Kopieren oder Bearbeiten von Fotos ändern kann. Prüfen Sie die Reihenfolge, wenn die Dateinamen wieder bei 0001 begonnen haben. Fotos unterschiedlicher Größe sind kein Problem, denn „An höchste Auflösung anpassen“ beginnt mit der größten Breite und der größten Höhe, begrenzt dann die längste Kante auf 7680 Pixel und rundet auf gerade Abmessungen. Prüfen Sie die Übersicht zur Ausgabegröße; sehr große Originale können trotzdem verkleinert werden.

### Gibt es eine Grenze für die Zahl der Bilder oder die Länge des Videos?

Eine feste Obergrenze für die Bildanzahl gibt es nicht, aber MP4-Exporte müssen unter 4 GiB (etwa 4,3 GB) bleiben. Das fertige Video wird vor dem Download im Arbeitsspeicher zusammengesetzt, daher kann Ihrem Gerät der Speicher lange vor dieser Grenze ausgehen. Auch der Encoder des Browsers begrenzt die Ausgabeabmessungen. Wenn ein großer Export fehlschlägt, verringern Sie die Auflösung, kürzen Sie die Sequenz oder teilen Sie sie auf.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Bilder übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Bilder zum Verarbeiten wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

### Kann ich Musik oder eine Tonspur hinzufügen?

Noch nicht. Das Werkzeug erzeugt reines Video, und das MP4, das es schreibt, hat eine einzige Videospur und keine Tonspur. Brauchen Sie Ton, legen Sie ihn hinterher in einem Schnittprogramm darunter.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Die Verarbeitung findet in diesem Browser statt.** Dieses Werkzeug verarbeitet Eingaben und Ergebnisse im Browser. Sein Verarbeitungscode lädt sie nicht zur Verarbeitung hoch. Content-Security-Policy begrenzt Ressourcen und Verbindungsziele; erlaubte Hosts können jedoch Anfragen empfangen. Die Richtlinie prüft keine Nutzdaten und beweist allein keine ausbleibende Übertragung. Vergleichen Sie Quelltext und konkrete Anfragen oder führen Sie die lokale Operation ohne Verbindung aus.
- **Die Kodierung ist lokal.** WebCodecs läuft in Ihrem Browser, und die fertige Datei geht direkt in einen Download. Eine Serverseite hat dieses Programm nicht.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihre Bilder übergeben, weder eine Datei noch ein Vorschaubild, ein Name, eine Größe oder eine Anzahl. Jede Zeile, die ein Bild liest, dekodiert, zusammensetzt oder kodiert, kommt von dieser Domain selbst und steht im Repository.
- **Der Spenden-Button lädt nichts und bekommt nichts.** Der Button „Buy me a coffee“ in der Kopfzeile wird von dieser Seite selbst gezeichnet und lädt nirgendwoher etwas. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihre Bilder bekommt er nichts. Solange Sie ihn nicht anklicken, passiert nichts, und was Sie damit ansteuern, ist die Seite von jemand anderem.
- **Eine bewusste Ausnahme.** Benutzen Sie „Von einer Webadresse hinzufügen“, wird jener Server kontaktiert, um das Bild zu holen, und sieht dabei Ihre IP-Adresse. Abgerufen wird nur, was Sie selbst einfügen, und nur in eine Richtung, nämlich herein: `img-src` ist geöffnet, `connect-src` nicht. Der Zähler weiter unten führt jede fremde Adresse auf, die kontaktiert wurde.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles außer dem Laden per Webadresse arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, sowie `src/encoder.js` für die Kodierschleife, die nie ans Netz geht.
