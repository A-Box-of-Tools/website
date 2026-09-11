# Video zuschneiden — den Bildausschnitt ändern

Einen Clip auf den Teil zurechtschneiden, auf den es ankommt.

> Ein MP4, MOV oder WebM auf jedes Format zuschneiden, ob quadratisch, 9:16 oder ein exaktes Pixelfenster. Läuft im Browser: kein Upload, der Ton bleibt erhalten, auch offline.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/video-zuschneiden/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Videos werden **nie hochgeladen**. Es gibt keinen Server.

Jedes Einzelbild wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware dekodiert, zugeschnitten und kodiert. Abrufen oder senden kann hier nichts, denn eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Video gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Ton bleibt erhalten
- ✓ Funktioniert offline

## So schneiden Sie ein Video zu

1. **Wählen Sie ein Video aus.** Ziehen Sie ein MP4, MOV, M4V oder WebM auf das Auswahlfeld oder suchen Sie eines von Hand heraus. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Ziehen Sie den Rahmen über den Teil, den Sie behalten wollen.** Innen ziehen verschiebt ihn, an den Ecken ziehen ändert seine Größe. Legen Sie ihn vorher auf ein Format fest, etwa 1:1 für einen quadratischen Beitrag, 9:16 fürs Handy oder 16:9 für ein breites Bild. Oder tippen Sie in die vier Felder darunter ein exaktes Pixelfenster. Spielen Sie den Clip ab oder ziehen Sie den Regler darunter, um das Einzelbild zu wählen, an dem Sie den Rahmen ausrichten.
3. **Entscheiden Sie, wie viel Qualität ausgegeben wird.** Das Bild muss neu kodiert werden, denn ein zugeschnittenes Einzelbild ist ein anderes Bild. „Ausgewogen“ bleibt nah an dem, was die Datei für diesen Ausschnitt ohnehin schon ausgegeben hat, „Beste Qualität“ legt noch etwas drauf. Der Ton bleibt erhalten, sofern Sie ihn nicht abschalten.
4. **Zuschneiden und herunterladen.** Die Arbeit passiert auf Ihrer eigenen Hardware. Wie lange sie dauert, hängt daher von Ihrem Gerät ab und nicht von einer Warteschlange. Das fertige Video geht direkt in die Downloads Ihres Browsers.

## Die ausführliche Fassung

[So schneiden Sie ein Video auf ein anderes Format zu](https://abox.tools/de/ratgeber/video-bildausschnitt-aendern/): Einen Clip auf ein Quadrat, auf 9:16 hochkant oder auf ein exaktes Pixelfenster bringen. Welches Seitenverhältnis welche Plattform verlangt, warum Zuschneiden neu kodieren muss und Kürzen nicht, und was das kostet.

## Auch im Werkzeugkasten

- [Video-Umkehrer](https://abox.tools/de/video-rueckwaerts-abspielen/): Das letzte Einzelbild zuerst, samt Ton.
- [Zeitraffer-Generator](https://abox.tools/de/zeitraffer-erstellen/): Eine Stunde Aufnahme in zwanzig Sekunden.
- [Standbild-Greifer](https://abox.tools/de/standbild-aus-video/): Ein Standbild in voller Qualität, von jeder Stelle.
- [Video zu GIF](https://abox.tools/de/video-in-gif-umwandeln/): Abschnitt, Größe und Bildrate selbst wählen.

## Fragen

### Wird mein Video irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, dekodiert, schneidet und kodiert es auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und schneidet trotzdem einen Clip zu.

### Welche Videoformate kann ich zuschneiden?

MP4, M4V und MOV werden direkt gelesen, egal was darin steckt, also H.264, HEVC, AV1 oder VP9, solange Ihr Browser diesen Codec dekodieren kann. Alles andere, was Ihr Browser abspielen kann, allen voran WebM, wird stattdessen abgespielt und dabei aufgezeichnet. Das funktioniert, dauert aber so lange, wie der Clip lang ist. Was der Browser weder lesen noch abspielen kann, in der Praxis AVI, WMV, FLV und die meisten MKVs, wird gleich mit einer entsprechenden Meldung abgelehnt, statt auf halbem Weg zu scheitern.

### Gibt es eine Grenze für Größe oder Länge des Videos?

Im Werkzeug ist keine Grenze eingebaut, und die Datei wandert auch nicht auf einmal in den Arbeitsspeicher, sondern läuft in Häppchen von wenigen Megabyte durch. Die praktische Obergrenze setzen zwei andere Dinge: das fertige Video, das vor dem Download im Arbeitsspeicher zusammengesetzt wird, und die Zeit, die Ihr Gerät zum Kodieren braucht.

### Bleibt der Ton erhalten?

Auf dem MP4-Weg sogar exakt. Das Audio wird Sample für Sample übernommen, ohne je dekodiert zu werden, und ist damit Byte für Byte das, was in der Datei stand. Auf dem Aufzeichnungsweg wird es von der Wiedergabe abgegriffen und neu kodiert, was ein wenig Qualität kostet. So oder so gibt es ein Häkchen, um ihn ganz wegzulassen.

### Kostet das Zuschneiden Qualität?

Das Bild wird neu kodiert, denn ein zugeschnittenes Einzelbild ist ein anderes Bild, und speichern lässt es sich nicht, ohne die Pixel neu zu schreiben. Was das Werkzeug dabei nicht tut, ist mehr auszugeben, als das Original für denselben Ausschnitt ausgegeben hat. Eine Neukodierung darüber hinaus macht die Datei nur größer, ohne sie besser aussehen zu lassen.

### Kann ich auch die Länge kürzen?

Hier nicht, aber nebenan. Dieses Werkzeug ändert die Form des Bildes und sonst nichts. Der Clip, der herauskommt, ist genauso lang wie der, der hineinging, mit unversehrtem Timing und Ton. Kürzen ist eine eigene Aufgabe und hat ein eigenes Werkzeug: Der [Video-Schneider](https://abox.tools/de/video-schneiden/) markiert die behaltenswerten Teile eines Clips und speichert sie als eine Datei, ohne ein einziges Einzelbild neu zu kodieren.

### Warum ändern sich Breite und Höhe in Zweierschritten?

H.264, der Codec in einem MP4, speichert das Bild in Blöcken und kann ein Einzelbild mit einer ungeraden Pixelzahl je Seite gar nicht beschreiben. Statt Ihren Zuschnitt hinterher stillschweigend zu runden, bietet der Rahmen von vornherein nur gerade Zahlen an.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihr Video übergeben.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Videos haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Datei landen könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Es gibt keine Adresse zum Einfügen, nichts herunterzuladen und keine Engine, die beim ersten Gebrauch nachgeladen wird. Jedes Byte, das Ihr Video berührt, kam beim Laden der Seite von dieser Domain selbst.
- **Dekodieren und Kodieren passieren lokal.** Die Einzelbilder laufen durch WebCodecs in Ihrem eigenen Browser oder durch dieselbe Wiedergabe-Engine, die Ihnen den Clip ohnehin zeigen würde. Die fertige Datei entsteht im Arbeitsspeicher dieses Geräts und geht von dort direkt in einen Download.
- **Der Ton wird kopiert, nicht angehört.** Auf dem MP4-Weg werden die Audio-Samples übernommen, ohne überhaupt dekodiert zu werden. Nichts hier macht daraus je wieder Klang, und selbst wenn, könnte nichts ihn weiterreichen.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe, eine Länge oder das Format, auf das Sie zugeschnitten haben. Jede Zeile, die liest, dekodiert, zuschneidet oder kodiert, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihr Video bekommt er nichts.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/shared/mp4-reader.js` für den Leser, der die Einzelbilder in einem MP4 findet, und `src/transcode.js` für die Schleife, die sie dekodiert, zuschneidet und kodiert. Keines von beiden importiert etwas, das eine Anfrage stellen könnte.
