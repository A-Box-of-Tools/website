# Standbild aus Video — ein Einzelbild speichern

Ein Standbild in voller Qualität, von jeder Stelle.

> Jedes Einzelbild eines MP4, MOV oder WebM in voller Größe als PNG oder JPEG speichern. Bild für Bild vorrücken oder alle paar Sekunden eines nehmen. Läuft im Browser, es wird nichts hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/standbild-aus-video/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Videos werden **nie hochgeladen**. Es gibt keinen Server.

Die Einzelbilder werden von Ihrem eigenen Browser gefunden, dekodiert und gezeichnet, auf Ihrer eigenen Hardware. Abrufen oder senden kann hier nichts, denn eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Video gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Volle Auflösung
- ✓ Funktioniert offline

## So speichern Sie ein Standbild aus einem Video

1. **Wählen Sie ein Video aus.** Ziehen Sie ein MP4, MOV, M4V oder WebM auf das Auswahlfeld oder suchen Sie eines von Hand heraus. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Suchen Sie die Stelle.** Spielen Sie ab und halten Sie an, wo Sie wollen, oder ziehen Sie den Regler. Bei einem MP4 rückt der Regler je Schritt um genau ein Einzelbild vor, zwischen dem, was Sie sehen, und dem, was Sie speichern, wird also nichts gerundet. Die Pfeiltasten gehen ein Einzelbild weiter, mit gehaltener `Umschalttaste` zehn.
3. **Wählen Sie ein Format.** PNG speichert das Einzelbild genau so, wie es dekodiert wurde, und das ist hier mit „voller Qualität“ gemeint. JPEG und WebP sind kleiner und legen eine zweite Kompression über die des Videos. Für eine Vorschau ist das in Ordnung, für alles, was hinterher noch bearbeitet wird, nicht.
4. **Greifen Sie eines, oder eine Reihe.** Ein einzelnes Standbild geht direkt in Ihre Downloads. „Alle N Sekunden“ geht den Clip einmal durch und nimmt an jeder Marke ein Bild. Das ist für Übersichtstafeln und Vorschaubilder nützlich, und es kommt als ein ZIP heraus statt als hundert Speicherabfragen.

## Die ausführliche Fassung

[Ein Standbild aus einem Video als Bild speichern](https://abox.tools/de/ratgeber/standbild-aus-video-speichern/): So holen Sie ein Einzelbild in voller Auflösung aus einem Clip: warum ein Screenshot des pausierten Players nicht dasselbe Bild ist, welches Format sich lohnt und wie Sie genau auf dem Bild landen, das Sie meinten.

## Auch im Werkzeugkasten

- [Video zu GIF](https://abox.tools/de/video-in-gif-umwandeln/): Abschnitt, Größe und Bildrate selbst wählen.
- [GIF-Ersteller](https://abox.tools/de/gif-erstellen/): Aus einer Reihe von Bildern eine Animation machen.
- [GIF-Zerleger](https://abox.tools/de/gif-in-einzelbilder-zerlegen/): Jedes Einzelbild einzeln als PNG heraus.
- [GIF-Analyse](https://abox.tools/de/gif-analysieren/): Einzelbilder, Anzeigedauern, Farbtabellen und wohin jedes Byte gegangen ist.

## Fragen

### Wird mein Video irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest und dekodiert es auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und greift trotzdem ein Standbild.

### Was heißt „volle Qualität“ eigentlich?

Zweierlei. Das Standbild wird in der Auflösung des Videos gespeichert und nicht in der Größe der Vorschau auf der Seite. Ein 4K-Clip ergibt also ein Bild von ⁦3840 x 2160⁩. Und mit PNG wird das Einzelbild genau so abgelegt, wie es aus dem Dekoder kam, die Datei enthält also das Bild, das auch im Video steht, ohne eine zweite Runde Kompression darüber. Ein Bildschirmfoto eines Abspielfensters gibt Ihnen keines von beidem: Es hat die Größe des Fensters und entsteht, nachdem der Player skaliert und farblich angepasst hat.

### Aus welchen Videoformaten kann ich ein Einzelbild nehmen?

MP4, M4V und MOV werden direkt gelesen, egal was darin steckt, also H.264, HEVC, AV1 oder VP9, solange Ihr Browser diesen Codec dekodieren kann. Das ist der exakte Weg, auf dem das Werkzeug einzelne Einzelbilder ansprechen kann. Alles andere, was Ihr Browser abspielen kann, allen voran WebM, wird behandelt, indem der Player an die Stelle gesetzt und gezeichnet wird, was er zeigt. Das ergibt weiterhin ein Bild in voller Größe, landet aber auf dem Einzelbild, das der Player ausgesucht hat, und nicht auf dem, nach dem Sie gefragt haben. Was der Browser weder lesen noch abspielen kann, in der Praxis AVI, WMV, FLV und die meisten MKVs, wird mit einer entsprechenden Meldung abgelehnt.

### Kann ich Einzelbild für Einzelbild vorgehen?

Bei einem MP4 ja, und zwar genau. Das Werkzeug liest die Einzelbildliste der Datei selbst, die Pfeiltasten bewegen sich also zwischen den Bildern, die wirklich darin stehen. Das gilt auch für einen Clip mit schwankender Bildrate, bei dem ein fester Schritt von einer Dreißigstelsekunde abdriften würde. Auf dem Wiedergabeweg gibt es keine solche Liste, ein Schritt ist dort ungefähr ein Einzelbild, und die Seite sagt das auch.

### Warum steht mein Hochkantvideo vom Handy hier richtig herum?

Weil die Drehung mit Absicht angewendet wurde. Ein Telefon filmt im Querformat und schreibt eine Vierteldrehung in die Datei, statt die Pixel zu drehen. Das Einzelbild, das ein Dekoder herausgibt, liegt also auf der Seite, und jeder Player dreht es auf dem Weg zu Ihrem Bildschirm. Ein Werkzeug, das diesen Schritt überspringt, speichert ein plausibles Bild vom richtigen Moment, nur quer. Dieses liest die Drehung von der Spur ab und wendet sie an, bevor überhaupt etwas gezeichnet wird.

### Gibt es eine Grenze für Größe oder Länge des Videos?

Im Werkzeug ist keine Grenze eingebaut, und die Datei wandert auch nicht auf einmal in den Arbeitsspeicher, sondern läuft in Häppchen von wenigen Megabyte durch. Deshalb öffnet sich ein langer Clip so schnell wie ein kurzer. Die Standbilder liegen bis zum Download auf der Seite, die praktische Obergrenze sind also ein paar hundert 4K-PNGs und nicht das Video selbst.

### Kann ich das Standbild hinterher skalieren oder zuschneiden?

Hier nicht, aber nebenan. Dieses Werkzeug speichert das Einzelbild, wie es ist. Größe oder Form zu ändern ist eine eigene Aufgabe mit eigenen Entscheidungen, und die [Bildgrößenänderung](https://abox.tools/de/bildgroesse-aendern/) kann beides, ebenfalls ohne etwas hochzuladen. Die Datei kleiner machen, ohne das Bild zu ändern, kann die [Bildkomprimierung](https://abox.tools/de/bild-komprimieren/).

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihr Video übergeben.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Videos haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Datei landen könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Es gibt keine Adresse zum Einfügen, nichts herunterzuladen und keine Engine, die beim ersten Gebrauch nachgeladen wird. Jedes Byte, das Ihr Video berührt, kam beim Laden der Seite von dieser Domain selbst.
- **Dekodiert wird lokal.** Die Einzelbilder laufen durch WebCodecs in Ihrem eigenen Browser oder durch dieselbe Wiedergabe-Engine, die Ihnen den Clip ohnehin zeigen würde. Das Bild wird auf diesem Gerät auf eine Leinwand gezeichnet und geht von dort direkt in einen Download.
- **Die Datei wird in Häppchen von wenigen Megabyte gelesen.** Ein Video ist die eine Art Datei hier, die nicht verlässlich in den Arbeitsspeicher passt, also wird sie nie ganz geladen. Der Leser nimmt sich ein Fenster um das Einzelbild herum, nach dem Sie gefragt haben. Genau deshalb öffnet sich ein Clip von zwei Gigabyte so schnell wie ein kleiner.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe, eine Länge oder die Stelle, an der Sie stehen geblieben sind. Jede Zeile, die liest, dekodiert oder zeichnet, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihr Video bekommt er nichts.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/shared/mp4-reader.js` für den Leser, der die Einzelbilder in einem MP4 findet, und `src/frames.js` für den Teil, der das gewünschte dekodiert. Keines von beiden importiert etwas, das eine Anfrage stellen könnte.
