# GIF zu MP4 — dieselbe Animation bei einem Zehntel der Größe

Jedes Einzelbild, mit der Verzögerung, die das GIF ihm gibt, als H.264 in einem MP4. Umgewandelt auf Ihrem Gerät; die Datei geht nie hinauf.

> Ein animiertes GIF im Browser in ein MP4 verwandeln, bei einem Bruchteil der Größe. Jedes Einzelbild behält die eigenen Zeiten des GIFs; nichts wird neu abgetastet. H.264 in einem MP4, die Datei, die jede Plattform annimmt. Es wird nichts hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/gif-in-mp4-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre GIFs werden **nie hochgeladen**. Es gibt keinen Server.

Das GIF, das Sie wählen, wird auf diesem Gerät im Arbeitsspeicher dekodiert, Bild für Bild gezeichnet, kodiert und in ein MP4 geschrieben, vom Encoder Ihres eigenen Browsers und von Code, der von dieser Adresse kommt. Nichts hier kann etwas hochladen, und am anderen Ende dieser Seite steht kein Server, der es annehmen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So wandeln Sie ein GIF in ein MP4 um

1. **Wählen Sie das GIF aus.** Eines nach dem anderen. Der Browser liest es direkt von Ihrer Festplatte, und die Seite sagt, was es ist: wie groß, wie viele Einzelbilder, wie lange es spielt und welche Maße in Pixeln es hat.
2. **Lesen Sie, was geschrieben wird.** Eine Zeile: die Maße, die Einzelbilder und ihre Zeiten, die Länge und die Bitrate. Einzustellen gibt es nichts, es sei denn, das GIF hat transparente Stellen; dann erscheint ein Farbfeld für das, was dorthin kommt.
3. **Wandeln Sie es um, und lesen Sie die Zeile, die sagt, dass es geprüft wurde.** Jedes Einzelbild wird gezeichnet und kodiert, und ein Balken sagt, wie weit es ist. Dann wird die fertige Datei hier noch einmal geöffnet und muss so lange spielen wie das GIF, mit jedem Bild an seinem Platz. Sie spielt unter dem Download aus dem Arbeitsspeicher, in Schleife, damit Sie den Übergang sehen.

## Die ausführliche Fassung

[How to convert a GIF to MP4, and why it gets so much smaller](https://abox.tools/de/guides/convert-a-gif-to-mp4/): Why an MP4 of the same animation is a tenth of the size of the GIF, what a video cannot do that a GIF can, why the frame timing is what most converters get wrong, and how to convert a GIF in your browser without uploading it.

## Auch im Werkzeugkasten

- [Video zu GIF](https://abox.tools/de/video-in-gif-umwandeln/): Abschnitt, Größe und Bildrate selbst wählen.
- [GIF-Ersteller](https://abox.tools/de/gif-erstellen/): Aus einer Reihe von Bildern eine Animation machen.
- [GIF-Zerleger](https://abox.tools/de/gif-in-einzelbilder-zerlegen/): Jedes Einzelbild einzeln als PNG heraus.
- [GIF-Analyse](https://abox.tools/de/gif-analysieren/): Einzelbilder, Anzeigedauern, Farbtabellen und wohin jedes Byte gegangen ist.

## Fragen

### Warum ist das MP4 so viel kleiner?

Weil ein GIF jedes Einzelbild als Bild mit höchstens 256 Farben speichert, ohne sich an das Bild davor zu erinnern, und ein Videocodec nur speichert, was sich geändert hat. H.264 hat darin dreißig Jahre Übung. Dieselbe Animation kommt meist bei einem Zehntel der Größe heraus, oft weniger, und sieht besser aus, weil sie nicht mehr auf 256 Farben beschränkt ist. Ein winziges oder ein sehr stilles GIF kann größer herauskommen; die Seite sagt es, wenn das passiert.

### Bleiben die Zeiten gleich?

Ja, Bild für Bild. Ein GIF hat keine Bildrate, nur eine Verzögerung auf jedem Einzelbild, und das Video behält jede Verzögerung so, wie sie ist: Jedes Einzelbild des GIFs ist ein Einzelbild des Videos, das genau so lange dauert. Nichts wird neu abgetastet, verdoppelt oder weggelassen. Die einzige Freiheit, die sich die Seite nimmt, nimmt sich jeder Browser auch: Eine Verzögerung unter zwei Hundertstelsekunden wird als zehn abgespielt, das Video spielt also so lange, wie das GIF in einem Browser spielt. Die fertige Datei wird noch einmal geöffnet, um beides zu prüfen.

### Läuft es in Schleife?

Das entscheidet, was es abspielt. Ein GIF trägt seine eigene Anweisung zum Wiederholen mit sich; ein MP4 kennt so etwas nicht, und der Player entscheidet. Die meisten Feeds und Chat-Apps wiederholen ein kurzes Video, und die Vorschau auf dieser Seite läuft in Schleife, damit Sie den Übergang sehen. Ein Videoplayer auf dem Desktop spielt es meist einmal ab.

### Was passiert mit den transparenten Stellen?

Sie bekommen eine Farbe, denn ein Video ist ein gefülltes Rechteck. Bei einem GIF mit transparenten Stellen zeigt die Seite ein Farbfeld, mit Weiß als Vorgabe, weil die meisten Seiten weiß sind; bei einem ohne wird das Feld nicht gezeigt. Die Farbe wird hinter die Einzelbilder gezeichnet, bevor sie kodiert werden, sie ist also Teil des Bildes.

### Ändert es die Größe des Bildes?

Nur um ein Pixel, und nur wenn es sein muss. H.264 braucht auf beiden Seiten eine gerade Kantenlänge, ein GIF mit ungerader Breite oder Höhe bekommt also eine Linie in der Hintergrundfarbe dazu; neu abgetastet wird nichts. Ein GIF, das breiter als 3840 Pixel ist, wird darauf verkleinert gezeichnet, denn darauf ist bei Encodern Verlass. Die Seite nennt die Größe, die sie schreiben wird, bevor sie anfängt.

### Wie lange dauert es?

Ein paar Sekunden für ein gewöhnliches GIF auf einem Gerät mit Hardware-Encoder, und das sind die meisten Laptops und jedes neuere Telefon; ohne einen länger. Das GIF wird zuerst in den Arbeitsspeicher dekodiert, und ein sehr langes kann mehr sein, als die Seite halten will: Bei einem halben Gigabyte an Einzelbildern hört sie auf und sagt es. Der Balken sagt, bei welchem Bild sie ist, und Abbrechen hält sofort an und schreibt nichts.

### Werden meine GIFs irgendwohin hochgeladen?

Nein. Das GIF wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, dekodiert, kodiert und geschrieben, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Am einfachsten überzeugen Sie sich, indem Sie die Netzverbindung trennen und die Seite trotzdem benutzen.

### Funktioniert es auf dem Telefon?

Auf einem Telefon, dessen Browser Video kodieren kann, ja, und der eigene Hardware-Encoder eines Telefons ist schnell. Was einem Telefon fehlt, ist Arbeitsspeicher: Die Einzelbilder des GIFs werden zuerst in den Speicher dekodiert, ein sehr langes kann also mehr sein, als ein Telefon halten kann.

### Gibt es eine Größengrenze, und kostet es etwas?

Die Seite hört bei einem halben Gigabyte an dekodierten Einzelbildern auf, ein GIF zu lesen, und das sind sehr viele Bilder; sie sagt es dann. Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre GIFs übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr GIF zum Umwandeln wegschickt, bliebe in dem Moment stehen, in dem Sie die Verbindung trennen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Warum ein MP4 ein Zehntel so groß ist, und warum jede Plattform es lieber nimmt.** Ein GIF speichert jedes Einzelbild als Bild, mit höchstens 256 Farben und ohne zu wissen, wie das Bild davor aussah. Ein Videocodec speichert, was sich geändert hat, in voller Farbe, und H.264 hat darin dreißig Jahre Übung; dieselbe Animation kommt bei einem Zehntel der Größe heraus, oft weniger, und sieht besser aus. Deshalb weist jede Social-Media-Plattform, jede Chat-App und jedes Content-System ein großes GIF entweder ab oder macht beim Hochladen stillschweigend ein MP4 daraus. Und wenn irgendwo „GIF zu groß“ steht, war das MP4 die ganze Zeit das, was gewollt war.
- **Der Upload ist der langsame Teil, und er ist der Teil, der hier nicht stattfindet.** Jeder Online-Umwandler verlangt zuerst die Datei: 30 MB gehen über Ihre Verbindung hinauf, damit 3 MB zurückkommen können, noch bevor sich die Frage stellt, wer die Datei behält. Diese Seite liest das GIF mit Code, der von dieser Adresse kommt, und schreibt das MP4 mit dem Encoder, der ohnehin in Ihrem Browser steckt. Die einzigen Bytes, die sich bewegen, gehen somit von Ihrer Festplatte in Ihren Arbeitsspeicher und zurück. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine einzige davon gehört uns. Und sie arbeitet auch mit getrennter Netzverbindung.
- **Die Zeiten bleiben Bild für Bild erhalten, und das machen die meisten Umwandler falsch.** Ein GIF hat keine Bildrate. Jedes Einzelbild sagt selbst, wie lange es stehen bleibt, und diese Verzögerungen sind verschieden: Eine Diaschau hält ein Bild zwei Sekunden und blättert dann durch zehn. Ein Umwandler, der eine Bildrate wählt und darauf neu abtastet, verdoppelt manche Bilder und lässt andere weg, und die Diaschau kommt ruckelig oder zu kurz heraus. Hier ist jedes Einzelbild des GIFs ein Einzelbild des Videos, und es dauert genau so lange wie seine Verzögerung. Die einzige Freiheit, die sich die Seite nimmt, nimmt sich jeder Browser auch: Eine Verzögerung unter zwei Hundertstelsekunden wird als zehn abgespielt. Und die fertige Datei wird noch einmal geöffnet, um nachzuzählen, dass jedes Bild da ist und dass sie so lange spielt wie das GIF.
- **Zwei Dinge, die ein GIF kann und ein Video nicht, vorab gesagt.** Ein GIF kann durchscheinen lassen, was unter ihm liegt; ein Video ist ein gefülltes Rechteck. Wo das GIF transparent ist, muss eine Farbe hin, und die Seite fragt, welche. Sie fragt nur bei einem GIF, das solche Stellen hat, und schlägt Weiß vor, weil die meisten Seiten weiß sind. Und ein GIF trägt seine eigene Anweisung mit sich, sich zu wiederholen; ein MP4 tut das nicht, und ob das Video in Schleife läuft, entscheidet, was es abspielt. Die meisten Feeds und Chat-Apps wiederholen ein kurzes. Die Vorschau hier läuft in Schleife, damit Sie den Übergang sehen.
- **Was es auf Ihrem Gerät kostet, ehrlich gesagt.** Das Kodieren dauert so lange, wie Ihr Gerät braucht: mit einem Hardware-Encoder, und den haben die meisten Laptops und jedes Telefon aus den letzten zehn Jahren, ein paar Sekunden für ein gewöhnliches GIF; ohne einen länger. Jedes Einzelbild des GIFs wird zuerst in den Arbeitsspeicher dekodiert, und dort liegt die Grenze: Ein GIF sind ein paar Megabyte, die sich auf ein Byte pro Pixel und Bild ausdehnen, und die Seite hört bei einem halben Gigabyte davon auf zu lesen und sagt es, statt den Tab abstürzen zu lassen. Abbrechen geht jederzeit.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr GIF übergeben: keine Datei, kein Einzelbild, kein Name, keine Größe und keine Länge. Jede Zeile, die es liest, kodiert oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht: Er meldet keinen Besuch, und über Sie oder Ihre GIFs bekommt er nichts. Es passiert nichts, solange Sie ihn nicht anklicken, und wohin Sie dann kämen, ist die Seite eines anderen.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihr GIF zum Umwandeln wegschickt, bliebe stehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/plan.js` dafür, wie aus den Verzögerungen des GIFs die Zeiten des Videos werden, `src/encode.js` für das Zeichnen und das Kodieren und `src/shared/gif-decode.js` für den Leser. Keines davon kann das Netz erreichen, und der Schreiber daneben auch nicht.
