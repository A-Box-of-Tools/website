# In MP4 umwandeln — WebM, MKV und MOV in die Datei, die sich hochladen lässt

Was auch immer vom Bildschirmrekorder, vom Ripper oder von der Kamera kam, als H.264 und AAC in einem MP4. Kopiert, wo es geht, und nur dort neu kodiert, wo es sein muss.

> Ein WebM, MKV, MOV oder beliebiges MP4 in ein MP4 mit H.264 und AAC umwandeln, die Datei, die jedes Handy, jeder Browser und jedes Upload-Formular annimmt. H.264 und AAC werden unangetastet übernommen; alles andere wird auf Ihrem Gerät neu kodiert. Nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/in-mp4-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Videos werden **nie hochgeladen**. Es gibt keinen Server.

Das Video, das Sie auswählen, wird von den Codecs Ihres eigenen Browsers und von Code, der von dieser Adresse ausgeliefert wird, gelesen, auseinandergenommen und im Arbeitsspeicher dieses Geräts als MP4 neu geschrieben. Einen Upload kann hier nichts auslösen, und am anderen Ende dieser Seite steht kein Server, der einen entgegennehmen könnte. Kein Gigabyte geht hinauf, um als ein anderes Gigabyte zurückzukommen.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So wandeln Sie ein Video in MP4 um

1. **Wählen Sie das Video aus.** Eine Datei auf einmal: WebM, MKV, MOV, M4V oder MP4. Der Browser liest sie direkt von Ihrer Festplatte, und die Seite sagt, was sie ist: wie lang, wie groß, welche Bildgröße und in welchem Container sie kam.
2. **Lesen Sie die zwei Sätze.** Einer für das Bild, einer für den Ton. Jeder sagt entweder, dass die Spur schon das ist, was ein MP4 haben möchte, und unangetastet übernommen wird, oder was sie ist und als was sie neu kodiert wird. Einzustellen gibt es nichts; die Datei entscheidet. Ist der Ton etwas, das der Browser nicht lesen kann, oder soll der Clip lieber stumm sein, setzen Sie das Häkchen, um ihn wegzulassen.
3. **Wandeln Sie es um, und lesen Sie die Zeile, die sagt, dass es geprüft wurde.** Was kopiert wird, wird kopiert; was neu kodiert wird, wird Bild für Bild neu kodiert, mit einem Balken, der sagt, wo es steht. Dann wird die fertige Datei hier erneut geöffnet und muss so lang sein wie vorher, H.264 sein und den Ton tragen, den sie versprochen hat. Sie wird unter dem Download aus dem Arbeitsspeicher abgespielt, damit Sie sehen, dass sie heil ist.

## Die ausführliche Fassung

[How to convert a video to the MP4 that uploads](https://abox.tools/de/guides/convert-a-video-to-mp4/): What an MP4 that uploads actually is, why a WebM, an MKV or an iPhone MOV gets refused, which conversions lose nothing and which cost a generation, and how to do it in your browser without uploading the file.

## Auch im Werkzeugkasten

- [Video-Rotator](https://abox.tools/de/video-drehen/): Eine Vierteldrehung, eine halbe Drehung, in die andere Richtung. In den Header der Datei geschrieben, sodass kein einziges Einzelbild dekodiert wird und nichts verloren geht.
- [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/): Aus einem Ordner voller Bilder ein Video machen.
- [Video-Schneider](https://abox.tools/de/video-schneiden/): Beim Abspielen markieren, was bleiben soll. Und alles davon als ein Video zurückbekommen.
- [Video-Zuschneider](https://abox.tools/de/video-zuschneiden/): Einen Clip auf den Teil zurechtschneiden, auf den es ankommt.

## Fragen

### Wird die Qualität schlechter?

Nicht bei dem, was kopiert wurde, und die Seite sagt, was das war. H.264-Einzelbilder und AAC-Pakete gehen Byte für Byte hinüber, ein MKV mit H.264 darin kommt also als MP4 mit genau demselben Bild heraus. Eine Spur, die neu kodiert werden musste, also VP9, VP8, AV1 oder HEVC beim Bild und Opus, Vorbis, MP3 oder FLAC beim Ton, ist eine Generation weiter von der Kamera entfernt, mit einer Bitrate, die dem nachempfunden ist, was die Quelle ausgegeben hat, damit der Verlust klein ist statt keiner. Behalten Sie so oder so Ihr Original.

### Warum nicht HEVC oder VP9 im MP4 behalten? Die sind kleiner.

Weil sich die Datei dann an weniger Orten öffnen ließe als die, mit der Sie begonnen haben, und der Sinn der Umwandlung war, dass sie sich überall öffnen lässt. HEVC in einem MP4 braucht eine Lizenz, die das Gerät womöglich nicht hat; VP9 oder AV1 in einem MP4 lehnen die meisten Upload-Formulare und jedes Mailprogramm ab. H.264 und AAC sind die eine Kombination, die nichts ablehnt, also schreibt die Seite genau das, und sie nennt den Preis vorab, statt ihn zu verstecken.

### Mein WebM ist eine Bildschirmaufnahme. Überlebt der Ton?

Ja. Ein Browser nimmt Opus auf, und das kann ein MP4 nicht tragen, also wird es dekodiert und mit 160 kbit/s als AAC neu kodiert, mehr, als ein Mikrofon je gebraucht hat. Das Bild, VP8 oder VP9, wird als H.264 neu kodiert. Beides passiert auf Ihrem Gerät, und die fertige Datei wird hier erneut geöffnet, um zu prüfen, dass sie so lang ist wie vorher und ihren Ton noch hat.

### Warum muss mein MOV überhaupt umgewandelt werden? Ist das nicht schon MP4?

Beinahe. MOV und MP4 sind derselbe Entwurf, und ein MOV mit H.264 und AAC darin wird in Sekunden übernommen, ohne dass ein Einzelbild neu kodiert wird. Was sich ändert, ist der Container, und genau den hat ein Formular abgelehnt, das auf die Dateiendung schaut. Ein iPhone-MOV mit HEVC darin ist der andere Fall: Das Bild wird als H.264 neu kodiert, überall dort, wo der Browser HEVC dekodieren kann, also auf den meisten Geräten, aber nicht auf allen.

### Welche Dateien liest es?

WebM und MKV mit VP8-, VP9-, AV1-, H.264- oder HEVC-Bild und Opus-, Vorbis-, AAC-, MP3- oder FLAC-Ton; MP4, MOV und M4V mit H.264-, HEVC-, VP9- oder AV1-Bild und AAC-Ton. Was der Browser nicht dekodiert, wird benannt: Ein Bild, das er nicht lesen kann, hält die Umwandlung an, ein Ton, den er nicht lesen kann, wird weggelassen, und das Bild wird trotzdem umgewandelt. AVI, WMV, FLV und MPEG-2 werden hier nicht gelesen.

### Wie lange dauert es?

Eine Kopie dauert etwa so lange, wie die Datei zweimal zu lesen: Sekunden bei den meisten Clips. Eine Neukodierung dauert so lange, wie Ihr Gerät zum Kodieren des Bildes braucht: mit Hardware-Encoder, also auf den meisten Laptops und jedem neueren Handy, schneller, als der Clip lang ist; ohne einen langsamer, und ein langer 4K-Clip ist eine lange Wartezeit. Der Balken sagt, bei welchem Einzelbild er steht, und Abbrechen hält sofort an und schreibt nichts.

### Werden meine Videos irgendwohin hochgeladen?

Nein. Die Datei wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, wo nötig dekodiert, kodiert und geschrieben, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört dieser Seite. Am einfachsten überzeugen Sie sich, indem Sie die Netzverbindung trennen und die Seite trotzdem benutzen. Bei einem Werkzeug für Dateien dieser Größe ist das auch der schnellste Weg: Der Upload dauert meist länger als die Umwandlung.

### Funktioniert es auf dem Handy?

Auf einem Handy, dessen Browser Video dekodieren und kodieren kann, ja, und der eigene Hardware-Encoder eines Handys ist schnell. Was einem Handy fehlt, ist Arbeitsspeicher: Die fertige Datei wird bis zum Speichern im Arbeitsspeicher gehalten, ein sehr langer Clip kann also mehr sein, als ein Handy fassen kann. Kürzen Sie ihn zuerst mit dem [Video-Schneider](https://abox.tools/de/video-schneiden/), oder wandeln Sie ihn auf einem Laptop um.

### Gibt es eine Größengrenze, und kostet es etwas?

Die Datei wird in Häppchen von Ihrer Festplatte gelesen, eine Datei größer als Ihr Arbeitsspeicher geht also problemlos hinein; die fertige Datei wird bis zum Download im Arbeitsspeicher gehalten, und ein hier geschriebenes MP4 kann nicht größer als 4 GB sein. Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Videos übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist auch der einfachste Beweis dafür, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr Video zum Umwandeln wegschickt, bliebe in dem Moment stehen, in dem Sie die Verbindung trennen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Der Upload ist der langsame Teil, und er ist der Teil, der nicht stattfindet.** Ein Video ist für die meisten Menschen die größte Datei, die sie je bewegen, und jeder Online-Konverter verlangt zuerst die ganze: Das Gigabyte geht über Ihre Verbindung hinauf, damit ein anderes Gigabyte zurückkommen kann, und der Upload dauert meist länger als die Umwandlung, die er bezahlt, noch vor jeder Frage danach, wer die Datei behält. Diese Seite liest die Datei mit Code, der von dieser Adresse ausgeliefert wird, und schreibt die neue mit den Codecs, die ohnehin in Ihrem Browser stecken. Die einzigen Bytes, die sich bewegen, gehen also von Ihrer Festplatte in Ihren Arbeitsspeicher und zurück. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine einzige davon gehört dieser Seite. Und sie funktioniert bei getrennter Netzverbindung.
- **Was „MP4“ hier bedeutet, und warum nichts anderes geschrieben wird.** Die Datei, die sich überall hochladen lässt, ist H.264-Bild und AAC-Ton in einem schlichten MP4-Container. Das nehmen Handys auf, das spielt jeder Browser ab, und das nehmen Chat-Apps, Mailprogramme und Upload-Formulare ohne Widerrede an. Ein WebM, ein MKV oder ein MP4 mit HEVC, VP9 oder AV1 darin wird von so vielen von ihnen abgelehnt, dass Menschen mit einem hierherkommen. Also schreibt die Seite genau das und nur das. Sie kopiert nie einen anderen Bild-Codec als H.264 ins Ergebnis, so gut er auch sein mag, denn eine Datei, die sich an weniger Orten öffnen lässt als das Original, ist keine Umwandlung.
- **Es kopiert, was es kann, kodiert nur neu, was es muss, und sagt, was von beidem.** Eine Umwandlung ist nicht immer eine Neukodierung. H.264-Einzelbilder in einem MKV sind dieselben Bytes, die ein MP4 haben möchte, sie werden also Bild für Bild übernommen und verlieren nichts; dasselbe gilt für AAC. VP9 oder VP8 in einem WebM, HEVC in einem iPhone-MOV, Opus oder Vorbis beim Ton: Die werden dekodiert und neu kodiert, und das Ergebnis ist eine Generation weiter von der Kamera entfernt. Die Seite ermittelt für jede Spur, welches von beidem sie braucht, bevor Sie etwas drücken, und sagt es in zwei Sätzen, damit „umwandeln“ nie ein Wort ist, hinter dem sich eine Neukodierung versteckt.
- **Das Ergebnis wird erneut geöffnet und geprüft.** Ein Konverter, der die letzte Sekunde verliert oder die Tonspur ohne den Ton schreibt, liefert trotzdem ein MP4. Deshalb wird die fertige Datei hier erneut geöffnet, von demselben Leser, der auch liest, was Sie hineingeben, und sie muss so lang sein wie vorher, H.264 sein und den Ton tragen, den sie tragen sollte. Sie wird unter dem Download aus dem Arbeitsspeicher abgespielt, damit Sie sehen, dass sie heil ist, bevor Sie sie speichern.
- **Was es auf Ihrem Gerät kostet, ehrlich gesagt.** Eine Kopie ist schnell: Die Datei wird einmal für ihren Aufbau gelesen und noch einmal, während sie geschrieben wird. Eine Neukodierung dauert so lange, wie Ihr Gerät zum Kodieren des Clips braucht: mit Hardware-Encoder, also auf den meisten Laptops und jedem neueren Handy, schneller, als der Clip lang ist; ohne einen langsamer, und ein langer 4K-Clip ist eine lange Wartezeit. Die Datei wird in Häppchen von der Festplatte gelesen, ein Clip größer als Ihr Arbeitsspeicher geht also problemlos hinein, aber die fertige Datei wird bis zum Download im Arbeitsspeicher gehalten, und dort liegt die Grenze eines Laptops. Abbrechen geht jederzeit.
- **Welche Dateien es liest, und welche nicht.** WebM und MKV, die dasselbe Format unter zwei Namen sind, mit VP8, VP9, AV1, H.264 oder HEVC darin und Opus, Vorbis, AAC, MP3 oder FLAC als Ton; und MP4, MOV und M4V mit H.264, HEVC, VP9 oder AV1 darin und AAC als Ton. Ein Bild, das der Browser nicht dekodiert, am häufigsten HEVC auf einem Gerät ohne die Lizenz dafür, wird benannt und abgelehnt; ein Ton, den er nicht dekodiert, wird benannt und weggelassen, und das Bild wird trotzdem umgewandelt. AVI, WMV, FLV und MPEG-2 werden hier nicht gelesen, und die Seite sagt das, statt vage zu scheitern.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe, eine Länge oder das Format, aus dem es umgewandelt wurde. Jede Zeile, die ein Video liest, kodiert oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht: Er meldet keinen Besuch, und über Sie oder Ihre Videos bekommt er nichts. Solange Sie ihn nicht anklicken, passiert nichts, und wohin Sie dann kämen, ist die Seite von jemand anderem.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihr Video zum Umwandeln wegschickt, bliebe stehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/plan.js` dafür, welche Spur kopiert und welche neu kodiert wird, `src/convert.js` für das Kopieren und das Schreiben, und `src/shared/mkv-reader.js` dafür, wie ein WebM oder MKV gelesen wird. Keines davon erreicht das Netz, und die Leser und der Schreiber daneben ebenso wenig.
