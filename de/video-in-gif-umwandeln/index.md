# Video zu GIF — ein Video in ein GIF umwandeln

Abschnitt, Größe und Bildrate selbst wählen.

> Einen Teil eines MP4, MOV oder WebM in ein animiertes GIF verwandeln. Wählen Sie Abschnitt, Breite und Bildrate; die Einzelbilder werden in Ihrem Browser gelesen und das GIF dort geschrieben. Kein Upload.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/video-in-gif-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Videos werden **nie hochgeladen**. Es gibt keinen Server.

Jedes Einzelbild wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, skaliert, quantisiert und geschrieben. Abrufen oder senden kann hier nichts, denn eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Video gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Beliebige Länge
- ✓ Funktioniert offline

## So verwandeln Sie ein Video in ein GIF

1. **Wählen Sie ein Video aus.** Ziehen Sie ein MP4, MOV, M4V oder WebM auf das Auswahlfeld oder suchen Sie eines von Hand heraus. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Markieren Sie den Abschnitt.** Spielen Sie den Clip ab und drücken Sie `I`, wo er beginnen soll, und `O`, wo er enden soll. Oder ziehen Sie die Griffe auf dem Balken. Ein GIF ist ein paar Sekunden lang, und diese Einstellung entscheidet weit mehr als die anderen beiden darüber, ob die Datei klein oder riesig wird.
3. **Wählen Sie Breite und Bildrate.** 480 Pixel Breite und 12 Bilder pro Sekunde passen zu den meisten Zwecken, für die es ein GIF gibt. Die Breite zu halbieren viertelt die Pixel, und zwölf Bilder pro Sekunde lesen sich als Bewegung, ohne dass Sie für die bezahlen, die niemand sieht.
4. **Erzeugen und herunterladen.** Die Einzelbilder werden gelesen, eine Palette aus 256 Farben wird für die ganze Animation gewählt, und jedes Einzelbild wird nur als der Teil des Bildes geschrieben, der sich geändert hat. Ist es fertig, spielt es auf der Seite ab, und das ist dieselbe Datei, die der Download Ihnen gibt.

## Die ausführliche Fassung

[So machen Sie aus einem Video ein GIF](https://abox.tools/de/ratgeber/aus-einem-video-ein-gif-machen/): Welchen Abschnitt, welche Breite und welche Bildrate Sie wählen sollten, warum ein GIF zehnmal so groß wird wie das Video, aus dem es stammt, und wann sich ein GIF überhaupt lohnt.

## Auch im Werkzeugkasten

- [GIF-Ersteller](https://abox.tools/de/gif-erstellen/): Aus einer Reihe von Bildern eine Animation machen.
- [GIF-Zerleger](https://abox.tools/de/gif-in-einzelbilder-zerlegen/): Jedes Einzelbild einzeln als PNG heraus.
- [GIF-Analyse](https://abox.tools/de/gif-analysieren/): Einzelbilder, Anzeigedauern, Farbtabellen und wohin jedes Byte gegangen ist.
- [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/): Aus einem Ordner voller Bilder ein Video machen.

## Fragen

### Wird mein Video irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, tastet ab und wandelt um, auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und erzeugt trotzdem ein GIF.

### Welche Videoformate kann ich umwandeln?

MP4, M4V und MOV werden direkt gelesen, egal was darin steckt, also H.264, HEVC, AV1 oder VP9, solange Ihr Browser diesen Codec dekodieren kann. Alles andere, was Ihr Browser abspielen kann, allen voran WebM, wird stattdessen gelesen, indem der Player auf jeden Zeitpunkt springt. Das ist langsamer und etwas weniger genau darin, welches Einzelbild wo landet. Was der Browser weder lesen noch abspielen kann, in der Praxis AVI, WMV, FLV und die meisten MKVs, wird gleich mit einer entsprechenden Meldung abgelehnt, statt auf halbem Weg zu scheitern.

### Warum ist mein GIF so groß?

Weil GIF ein Format von 1987 ist, das ganze Bilder speichert und keine Bewegung. Aus einem fünf Sekunden langen Clip lässt sich keines machen, das so klein ist wie das fünf Sekunden lange MP4, aus dem es kam. Ein GIF eines Videos ist routinemäßig zehnmal so groß wie das Video. Entschieden wird die Größe von drei Einstellungen, in dieser Reihenfolge: wie lang der Abschnitt ist, wie breit das Bild ist und wie viele Bilder pro Sekunde es hat. Die Breite zu halbieren viertelt die Pixel, und die Pixel sind es, die kosten.

### Warum nur 256 Farben?

Weil das Format es so will. Ein GIF trägt eine Tabelle von höchstens 256 Farben und speichert jedes Pixel als Nummer darin. Dieses Werkzeug wählt diese 256, indem es die Farben in jedem Einzelbild Ihres Abschnitts zählt und sie in 256 Gruppen teilt, mit Median Cut, der Standardmethode. Die Palette passt damit zu Ihrem Clip, statt ein fester Farbsatz zu sein. Wo eine Farbe fehlt, mischt das Dithering die beiden nächstgelegenen, damit ein Verlauf ein Verlauf bleibt und nicht zu Streifen wird.

### Was macht die Dithering-Einstellung?

Sie tauscht ein wenig Rauschen gegen viel weniger Streifenbildung. Ist sie an, bleibt ein Himmel, der sonst zu vier flachen Bändern würde, ein Verlauf, und Sie zahlen mit einer feinen Textur und einer größeren Datei. Ist sie aus, wird das Bild flacher und die Datei kleiner, was zu Bildschirmaufnahmen, Strichzeichnungen und allem passt, was ohnehin aus flachen Farbflächen besteht. Verwendet wird hier geordnetes Dithering und nicht die fehlerverteilende Art, damit ein unveränderter Hintergrund zwischen den Einzelbildern vollkommen still steht statt zu flimmern.

### Gibt es eine Grenze für Länge oder Größe?

Begrenzt ist der Abschnitt, und zwar durch den Arbeitsspeicher und nicht durch eine Regel. Jedes seiner Einzelbilder wird gleichzeitig gehalten, während die Palette gewählt wird. Die Seite rechnet deshalb aus, was Ihre Einstellungen kosten würden, und sagt es Ihnen vor dem Start. Sie weigert sich lieber, als den Tab den Speicher aufbrauchen und verschwinden zu lassen. Herunter bringen das ein kürzerer Abschnitt, eine kleinere Breite oder eine niedrigere Bildrate.

### Behält es den Ton?

Ein GIF kann keinen Ton tragen. Eine Fassung des Formats mit Audio gibt es nicht, und das ist der Hauptgrund, warum das Web GIFs größtenteils durch stumm laufende Videos ersetzt hat. Ist der Ton wichtig, behalten Sie das Video. Der [Video-Schneider](https://abox.tools/de/video-schneiden/) schneidet einen Abschnitt heraus, ohne ein einziges Einzelbild neu zu kodieren.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihr Video übergeben.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Videos haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Datei landen könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Es gibt keine Adresse zum Einfügen, nichts herunterzuladen und keine Engine, die beim ersten Gebrauch nachgeladen wird. Jedes Byte, das Ihr Video berührt, kam beim Laden der Seite von dieser Domain selbst.
- **Das Dekodieren ist lokal.** Die Einzelbilder laufen durch WebCodecs in Ihrem eigenen Browser oder durch dieselbe Wiedergabe-Engine, die Ihnen den Clip ohnehin zeigen würde. Welcher von beiden genommen wurde, steht oben auf der Seite, denn davon hängt ab, wie die Einzelbilder gewählt werden, und das sollten Sie sehen können.
- **Das GIF wird hier geschrieben, in Code, den Sie lesen können.** Palette, Dithering und LZW-Kompression sind rund sechshundert Zeilen im eigenen Ordner dieses Werkzeugs. Es gibt keinen Encoder-Dienst, keine zur Laufzeit nachgeladene Bibliothek und in alldem keine Stelle, an der ein Bild gesendet werden könnte.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe, eine Länge oder der Abschnitt, den Sie markiert haben. Jede Zeile, die liest, abtastet, quantisiert oder kodiert, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihr Video bekommt er nichts.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/frames.js` für die beiden Wege, auf denen die Einzelbilder aus einem Video gelesen werden, `src/quantize.js` für die Palette und `src/gif.js` für die Datei selbst, LZW inklusive. Keines davon importiert etwas, das eine Anfrage stellen könnte.
