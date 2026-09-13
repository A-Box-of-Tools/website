# Video komprimieren — auf eine Größe, die sich wirklich verschicken lässt

Sagen Sie, wie groß es sein darf. Den Rest ermittelt das Werkzeug, und es misst das Ergebnis, bevor Sie es bekommen.

> Ein Video im Browser auf unter 8, 16, 25 oder beliebig viele Megabyte verkleinern. Nennen Sie die Größe; das Werkzeug wählt Bildgröße und Bitrate, kodiert und misst das Ergebnis. Nichts wird hochgeladen, und der Ton wird unangetastet übernommen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/video-komprimieren/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Videos werden **nie hochgeladen**. Es gibt keinen Server.

Das Video, das Sie auswählen, wird von den Codecs Ihres eigenen Browsers und von Code, der von dieser Adresse ausgeliefert wird, dekodiert, kleiner gezeichnet, neu kodiert und im Arbeitsspeicher dieses Geräts zurückgeschrieben. Einen Upload kann hier nichts auslösen, und am anderen Ende dieser Seite steht kein Server, der einen entgegennehmen könnte. Kein Gigabyte geht hinauf, um klein zurückzukommen.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So komprimieren Sie ein Video auf eine Größe, die sich verschicken lässt

1. **Wählen Sie das Video aus.** Ein Clip auf einmal, MP4 oder MOV. Der Browser liest ihn direkt von Ihrer Festplatte, und die Seite sagt, was er ist: wie lang, wie groß, welche Bildgröße und was er pro Sekunde ausgibt.
2. **Sagen Sie, wie groß es sein darf.** Tippen Sie eine Zahl Megabyte ein, oder drücken Sie die Grenze, die man Ihnen genannt hat, also 8, 16, 25, 50 oder 100, oder die Hälfte oder ein Viertel dessen, was die Datei ist. Die Zeile darunter sagt, was das kauft: die Bildgröße und Bitrate, für die Länge und Ton des Clips Platz lassen, und wo das Ergebnis herauskommen sollte. Lassen Sie den Ton weg, wenn lieber die ganze Zahl ans Bild gehen soll.
3. **Überstimmen Sie die Bildgröße, wenn Sie möchten.** Die Zahl wählt von selbst eine Sprosse der Leiter. Wählen Sie selbst eine, wenn Sie es besser wissen, etwa bei einer Bildschirmaufnahme, die in 1080p lesbar bleiben muss, oder einem Clip, der nur auf dem Handy angesehen wird, dann wird die Bitrate stattdessen darüber verteilt. Eine Sprosse ist eine Obergrenze: Das Bild wird nie größer gemacht, als es kam.
4. **Komprimieren Sie es, und lesen Sie die Zeile, die sagt, dass es gemessen wurde.** Das Bild wird Bild für Bild dekodiert, kleiner gezeichnet und neu kodiert, mit einem Balken, der sagt, wo es steht. Dann wird die fertige Datei an der Zahl gemessen und hier erneut geöffnet, um ihre Länge zu prüfen; kam sie darüber heraus, wird sie noch einmal kodiert, enger, und die Seite sagt das. Das Ergebnis wird unter dem Download aus dem Arbeitsspeicher abgespielt, damit Sie sehen, dass es heil ist.

## Die ausführliche Fassung

[How to compress a video to a size that will send](https://abox.tools/de/guides/compress-a-video/): What a size limit actually costs a video, where the megabytes go, why the frame size drops before the picture goes to mud, how to lose as little as the number allows, and how to do it in your browser without the upload.

## Auch im Werkzeugkasten

- [MP4-Konverter](https://abox.tools/de/in-mp4-umwandeln/): Was auch immer vom Bildschirmrekorder, vom Ripper oder von der Kamera kam, als H.264 und AAC in einem MP4. Kopiert, wo es geht, und nur dort neu kodiert, wo es sein muss.
- [Video-Rotator](https://abox.tools/de/video-drehen/): Eine Vierteldrehung, eine halbe Drehung, in die andere Richtung. In den Header der Datei geschrieben, sodass kein einziges Einzelbild dekodiert wird und nichts verloren geht.
- [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/): Aus einem Ordner voller Bilder ein Video machen.
- [Video-Schneider](https://abox.tools/de/video-schneiden/): Beim Abspielen markieren, was bleiben soll. Und alles davon als ein Video zurückbekommen.

## Fragen

### Wie klein kann ein Video werden?

So klein wie die Zahl, die Sie eintippen, bis zu dem Punkt, an dem nichts Ansehbares mehr hineinpasst, und die Seite sagt Ihnen, wo der liegt. Der Ton wird übernommen, wie er ist, er kostet also, was er kostet (etwa ein Megabyte pro Minute bei gewöhnlichem Stereo), und das Bild braucht bei der kleinsten Bildgröße ein paar hundert Kilobit pro Sekunde, um überhaupt ein Bild zu sein. Den Ton wegzulassen gibt seinen Anteil dem Bild, und bei einem kurzen Clip mit enger Grenze macht das oft den Unterschied.

### Warum hat sich die Bildgröße geändert?

Weil eine Bitrate nur im Verhältnis dazu etwas bedeutet, wie viele Pixel sie zu malen hat. Zwei Megabit pro Sekunde sind bei 720p großzügig und bei 4K Matsch, also wird das Bild, sobald die Zahl die Bitrate festgelegt hat, die Leiter hinuntergestuft, bis jedes Einzelbild genug Bits abbekommt, um wie ein Bild auszusehen. Ein kleineres klares Bild schlägt ein großes verschmiertes, und jeder Dienst, der Uploads komprimiert, macht es stillschweigend genauso. Hier wird es gesagt, bevor es beginnt, und die Sprosse können Sie selbst wählen.

### Wird die Qualität schlechter?

Ja, um genau so viel, wie die Zahl verlangt, und nicht mehr. Ein komprimiertes Video ist ein neu kodiertes Video: Das Bild wird mit einer niedrigeren Bitrate neu geschrieben, eine Generation weiter von der Kamera entfernt. Der Ton wird nicht angerührt. Was Sie verlieren, entscheidet die Zahl, die Sie eingetippt haben. Ein 900-MB-Clip, der auf 25 MB gebracht wird, hat die meisten seiner Bits verloren, ein Clip, der auf die Hälfte gebracht wird, wenige. Und die Seite nennt die Bitrate und Bildgröße, die sie gewählt hat, damit der Tausch sichtbar ist statt versteckt.

### Welches Format schreibt es?

MP4 mit H.264-Video, und die Tonspur übernommen, wie sie war. Das ist die eine Kombination, die jedes Handy, jeder Browser, jede Chat-App und jedes Mailprogramm abspielt, und genau das braucht eine Datei, die durchgehen muss. WebM, HEVC oder AV1 schreibt es nicht: kleiner bei gleicher Qualität, aber nichts, was die Hälfte der Leute öffnen könnte, denen Sie es schicken würden.

### Welche Dateien liest es?

MP4 und MOV, also das, was Handys, Kameras und Bildschirmrekorder schreiben, mit H.264, HEVC, VP9 oder AV1 darin, solange Ihr Browser sie dekodiert. Ein HEVC-Clip vom iPhone öffnet sich überall dort, wo das Gerät eine Lizenz für HEVC hat, und das sind die meisten Geräte. WebM, MKV und AVI werden hier noch nicht gelesen; die Seite sagt das, wenn sie auf eines trifft, statt vage zu scheitern.

### Wie lange dauert es?

So lange, wie Ihr Gerät zum Kodieren des Clips braucht. Mit Hardware-Encoder, also auf den meisten Laptops und jedem neueren Handy, geht es schneller, als der Clip lang ist; eine Minute 1080p dauert meist weniger als eine Minute. Ohne einen ist es langsamer, und ein langer 4K-Clip ist so oder so eine lange Wartezeit. Der Balken sagt, bei welchem Einzelbild er steht, und Abbrechen hält sofort an und schreibt nichts.

### Warum hat es zwei Durchgänge gebraucht?

Weil ein Encoder nahe der Bitrate landet, die man von ihm verlangt, und nicht genau auf ihr, und bei einem unruhigen Clip kann er darüber landen. Die Datei wird etwas unter der Zahl angefordert und gemessen; kam sie trotzdem darüber heraus, wird die Bitrate aus dem Abstand neu berechnet und der Clip noch einmal kodiert. Zwei Durchgänge reichen immer, und die Seite sagt, wenn es zwei gebraucht hat.

### Werden meine Videos irgendwohin hochgeladen?

Nein. Der Clip wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, dekodiert, kodiert und geschrieben, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört dieser Seite. Am einfachsten überzeugen Sie sich, indem Sie die Netzverbindung trennen und die Seite trotzdem benutzen. Bei einem Werkzeug für Dateien dieser Größe ist das auch der schnellste Weg: Der Upload dauert meist länger als die Kodierung.

### Funktioniert es auf dem Handy?

Auf einem Handy, dessen Browser Video kodieren kann, ja, und der eigene Hardware-Encoder eines Handys ist schnell. Was einem Handy fehlt, ist Arbeitsspeicher: Die fertige Datei wird bis zum Speichern im Arbeitsspeicher gehalten, ein sehr langer Clip kann also mehr sein, als ein Handy fassen kann. Kürzen Sie ihn zuerst mit dem [Video-Schneider](https://abox.tools/de/video-schneiden/), oder komprimieren Sie ihn auf einem Laptop.

### Gibt es eine Größengrenze, und kostet es etwas?

Im Werkzeug ist keine Grenze eingebaut. Der Clip wird in Häppchen von Ihrer Festplatte gelesen, eine Datei größer als Ihr Arbeitsspeicher geht also problemlos hinein; die Grenze ist die fertige Datei, die bis zum Download im Arbeitsspeicher gehalten wird, und ein Laptop nimmt ein paar hundert Megabyte Ergebnis ohne Klagen. Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Videos übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist auch der einfachste Beweis dafür, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr Video zum Komprimieren wegschickt, bliebe in dem Moment stehen, in dem Sie die Verbindung trennen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Der Upload ist der langsame Teil, und er ist der Teil, der nicht stattfindet.** Ein Video ist für die meisten Menschen die größte Datei, die sie je zu verschicken versuchen, und genau deshalb geht es nicht durch. Jeder Online-Kompressor verlangt zuerst die ganze Datei: Die 900 MB gehen über Ihre Verbindung hinauf, damit 25 MB zurückkommen können, und dieser Upload dauert meist länger als die Kodierung, die er bezahlt, noch vor jeder Frage danach, wer die Datei behält. Diese Seite kodiert mit den Codecs, die ohnehin in Ihrem Browser stecken, auf Ihrem eigenen Gerät. Die einzigen Bytes, die sich bewegen, gehen also von Ihrer Festplatte in Ihren Arbeitsspeicher und zurück. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine einzige davon gehört dieser Seite. Und sie funktioniert bei getrennter Netzverbindung.
- **Es beginnt bei der Zahl, denn auf die Zahl kommt es an.** Eine Chat-App erlaubt 8 MB oder 25; eine E-Mail 25; ein Formular, was immer dort steht. Was Sie wollen, ist die Datei darunter, mit so wenig Verlust, wie die Zahl zulässt. Also fragt die Seite nach der Zahl und ermittelt den Rest: Der Ton wird übernommen, wie er ist, der Container nimmt sich ein wenig, und was über die Länge des Clips übrig bleibt, darf das Bild ausgeben. Diese Bitrate ist nur im Verhältnis dazu etwas wert, wie viele Pixel sie zu malen hat, also wird das Bild eine Leiter der bekannten Größen hinuntergestuft, bis jedes Einzelbild genug davon abbekommt, um wie ein Bild auszusehen, und nie hinauf. Die Seite sagt das alles, bevor sie beginnt, und die Bildgröße können Sie überstimmen.
- **Ein komprimiertes Video ist ein neu kodiertes Video, und die Seite sagt das.** „Komprimieren“ heißt bei einer ZIP-Datei etwas Verlustfreies und bei einem Video nichts dergleichen. Das Bild wird dekodiert, kleiner gezeichnet und mit H.264 in der von der Zahl zugelassenen Bitrate neu kodiert, und ist danach eine Generation weiter von der Kamera entfernt als die Datei, mit der Sie begonnen haben. Der Ton nicht: Seine Samples werden genau so in die neue Datei kopiert, wie sie waren. Das Ergebnis ist ein MP4, weil das der eine Container ist, den jedes Handy, jeder Browser und jede Chat-App abspielt, und diese Seite hat längst ausgeschlossen, ein Format zu versprechen, das die Hälfte ihrer Besucher gar nicht hätte erzeugen können.
- **Das Ergebnis wird gemessen und, wenn es danebenlag, einmal nachgezogen.** Ein Encoder landet nahe einer Bitrate und nicht genau auf ihr, also wird die Datei etwas unter der Zahl angefordert und dann gemessen. Kam sie trotzdem darüber heraus, wird die Bitrate aus dem Abstand neu berechnet und der Clip ein zweites Mal kodiert; zwei Durchgänge reichen immer, und die Seite sagt, wenn es zwei gebraucht hat. Dann wird die fertige Datei hier erneut geöffnet und muss so lang sein wie vorher: Ein Kompressor, der die letzte Sekunde oder den Ton verliert, wäre immer noch eine kleinere Datei, und nur das Zurücklesen des Ergebnisses kann den Unterschied erkennen.
- **Was es auf Ihrem Gerät kostet, ehrlich gesagt.** Das Kodieren dauert so lange, wie Ihr Gerät braucht. Mit Hardware-Encoder, also auf den meisten Laptops und jedem Handy aus dem letzten Jahrzehnt, geht es schneller, als der Clip lang ist; ohne einen langsamer, und ein langer 4K-Clip ist so oder so eine lange Wartezeit. Die ganze Datei wird in Häppchen von Ihrer Festplatte gelesen, ein Clip größer als Ihr Arbeitsspeicher ist also kein Problem, aber die fertige Datei wird bis zum Download im Arbeitsspeicher gehalten, und dort liegt die Grenze eines Laptops. Abbrechen geht jederzeit.
- **Welche Dateien es liest, und welche nicht.** MP4 und MOV, also das, was Handys, Kameras und Bildschirmrekorder schreiben, mit H.264, HEVC, VP9 oder AV1 darin, je nachdem, was Ihr Browser dekodiert. Ein HEVC-Clip vom iPhone öffnet sich überall dort, wo das Gerät eine Lizenz dafür hat, und das sind die meisten. WebM, MKV und AVI werden hier noch nicht gelesen, und die Seite sagt das, statt vage zu scheitern.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe, eine Länge oder die Zahl, die Sie verlangt haben. Jede Zeile, die ein Video liest, kodiert oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht: Er meldet keinen Besuch, und über Sie oder Ihre Videos bekommt er nichts. Solange Sie ihn nicht anklicken, passiert nichts, und wohin Sie dann kämen, ist die Seite von jemand anderem.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihr Video zum Komprimieren wegschickt, bliebe stehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/plan.js` dafür, wie aus einer Zahl eine Bildgröße und eine Bitrate werden, und `src/encode.js` für das Dekodieren, das Zeichnen und das Kodieren, und den Ton, der daran vorbei kopiert wird. Keines davon erreicht das Netz, und der Leser und der Schreiber daneben ebenso wenig.
