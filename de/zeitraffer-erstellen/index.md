# Zeitraffer erstellen — ein Video im Zeitraffer abspielen

Eine Stunde Aufnahme in zwanzig Sekunden.

> Ein langes Video zum Zeitraffer machen, mit 10x, 60x oder jedem Tempo, das Sie eintippen. Läuft im Browser: kein Upload, kein Wasserzeichen, auch offline.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/zeitraffer-erstellen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Videos werden **nie hochgeladen**. Es gibt keinen Server.

Jedes Einzelbild wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware ausgewählt, dekodiert und neu kodiert. Abrufen oder senden kann hier nichts, denn eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Video gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Jedes Tempo, das Sie eintippen
- ✓ Funktioniert offline

## So erstellen Sie einen Zeitraffer aus einem Video

1. **Wählen Sie ein Video aus.** Ziehen Sie ein MP4, MOV, M4V oder WebM auf das Auswahlfeld oder suchen Sie eines von Hand heraus. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Sagen Sie, wie viel schneller.** Drücken Sie eines der Tempi oder tippen Sie Ihr eigenes ein. Wenn Sie lieber angeben, wie lang das Ergebnis werden soll, etwa „in zwanzig Sekunden“, tippen Sie das ein und das Tempo ergibt sich daraus.
3. **Prüfen Sie das Intervall.** Die Zeile unter dem Tempo sagt, was wirklich geschieht: alle wie viel Sekunden des Originals ein Einzelbild genommen wird. Das ist die Zahl, die man an einer Kamera einstellen würde, und die, die man vor dem Start am besten kurz gegenprüft.
4. **Erstellen und herunterladen.** Die Arbeit passiert auf Ihrer eigenen Hardware. Wie lange sie dauert, hängt daher von Ihrem Gerät ab und nicht von einer Warteschlange. Das fertige Video geht direkt in die Downloads Ihres Browsers.

## Die ausführliche Fassung

[So verwandeln Sie ein langes Video in einen Zeitraffer](https://abox.tools/de/ratgeber/langes-video-in-zeitraffer-verwandeln/): Aus einer Stunde Material eine anschaubare Minute: wie man die Geschwindigkeit wählt, warum die Ziellänge besser ist als Kopfrechnen, und wann das Ergebnis ein GIF werden sollte.

## Auch im Werkzeugkasten

- [Standbild-Greifer](https://abox.tools/de/standbild-aus-video/): Ein Standbild in voller Qualität, von jeder Stelle.
- [Video zu GIF](https://abox.tools/de/video-in-gif-umwandeln/): Abschnitt, Größe und Bildrate selbst wählen.
- [GIF-Ersteller](https://abox.tools/de/gif-erstellen/): Aus einer Reihe von Bildern eine Animation machen.
- [GIF-Zerleger](https://abox.tools/de/gif-in-einzelbilder-zerlegen/): Jedes Einzelbild einzeln als PNG heraus.

## Fragen

### Wird mein Video irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, dekodiert, wählt aus und kodiert es auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und erstellt trotzdem einen Zeitraffer.

### Was bedeutet das Tempo genau?

Das Verhältnis zwischen dem, was hineingeht, und dem, was herauskommt. Bei 60× wird aus einer Stunde Aufnahme eine Minute, egal mit welcher Bildrate Sie sie abspielen. Darunter nimmt das Werkzeug alle *Tempo ÷ Bildrate* Sekunden ein Einzelbild. 60× bei 30 Bildern pro Sekunde ist also alle zwei Sekunden eines. Die Seite zeigt Ihnen dieses Intervall vor dem Start, denn es ist die Zahl, an der man sieht, was tatsächlich passiert.

### Welche Videoformate kann ich beschleunigen?

MP4, M4V und MOV werden direkt gelesen, egal was darin steckt, also H.264, HEVC, AV1 oder VP9, solange Ihr Browser diesen Codec dekodieren kann. Alles andere, was Ihr Browser abspielen kann, allen voran WebM, wird gelesen, indem die Wiedergabe zu jedem Moment gespult wird. Das funktioniert bei jedem Format, das der Browser abspielt. Was er weder lesen noch abspielen kann, in der Praxis AVI, WMV, FLV und die meisten MKVs, wird gleich mit einer entsprechenden Meldung abgelehnt, statt auf halbem Weg zu scheitern. Heraus kommt immer ein MP4.

### Warum hat der Zeitraffer keinen Ton?

Weil nichts davon erhaltenswert wäre. Ton, der dreißigmal zu schnell läuft, ist weder Sprache noch Musik, sondern ein Piepsen. Und die Alternative, den Ton in Originalgeschwindigkeit unter ein Bild zu legen, das ihm längst davongelaufen ist, wäre ein anderer Clip als der, den Sie angefordert haben. Die Tonspur fällt also weg, und genau das ist auch der Hauptgrund, warum aus einer Stunde Video ein paar Megabyte werden. Wenn Sie den Ton für sich brauchen: Der [Audio-Editor](https://abox.tools/de/audio-bearbeiten/) speichert ihn.

### Geht das schneller, als das ganze Video umzuwandeln?

Erheblich, und genau dafür wird die Datei direkt gelesen. Ein Einzelbild lässt sich nur dekodieren, indem man beim Keyframe davor anfängt, aber nirgends steht, dass die Bilder dazwischen behalten werden müssen. Ein Zeitraffer mit 60× aus einer Stunde dekodiert also ein paar tausend Einzelbilder statt hunderttausend. Die Übersicht sagt Ihnen vor dem Klick, wie viele es genau sein werden.

### Kostet das Qualität?

Die behaltenen Einzelbilder werden ein zweites Mal kodiert, und das kostet ein wenig. Vermeiden lässt es sich nicht, denn der fertige Clip zeigt sie zu Zeitpunkten, für die in der Originaldatei nichts kodiert war. Wofür dieses Werkzeug mehr ausgibt als die anderen Video-Werkzeuge hier, ist die Bitrate, und das mit Absicht: Zwei Einzelbilder im Abstand von zwei Sekunden haben viel weniger gemeinsam als zwei im Abstand einer Dreißigstelsekunde. Ein Codec kann also weniger wiederverwenden, und ein auf normale Aufnahmen abgestimmter Wert käme klotzig heraus.

### Gibt es eine Grenze für Größe oder Länge des Videos?

Im Werkzeug ist keine Grenze eingebaut, und die Datei wandert auch nicht auf einmal in den Arbeitsspeicher. Gelesen werden nur kurze Stücke rund um jeden Moment und sonst nichts. Die praktische Obergrenze ist der fertige Zeitraffer, der vor dem Download im Arbeitsspeicher zusammengesetzt wird, und ein Zeitraffer ist per Definition kurz. Die Übersicht zeigt vor dem Start, wie groß er ungefähr wird.

### Kann ich nur einen Teil des Clips beschleunigen?

Hier nicht. Dieses Werkzeug nimmt das Ganze, vom ersten bis zum letzten Einzelbild. Schneiden Sie den gewünschten Abschnitt vorher mit dem [Video-Schneider](https://abox.tools/de/video-schneiden/) heraus, der das ohne eine einzige Neukodierung erledigt, und beschleunigen Sie dann, was dabei herauskommt.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihr Video übergeben.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Videos haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Datei landen könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Es gibt keine Adresse zum Einfügen, nichts herunterzuladen und keine Engine, die beim ersten Gebrauch nachgeladen wird. Jedes Byte, das Ihr Video berührt, kam beim Laden der Seite von dieser Domain selbst.
- **Dekodieren und Kodieren passieren lokal.** Die Einzelbilder laufen durch WebCodecs in Ihrem eigenen Browser oder durch dieselbe Wiedergabe-Engine, die Ihnen den Clip ohnehin zeigen würde. Die fertige Datei entsteht im Arbeitsspeicher dieses Geräts und geht von dort direkt in einen Download.
- **Das meiste der Datei wird nie gelesen.** Ein Zeitraffer braucht alle paar Sekunden ein Einzelbild, deshalb liest das Werkzeug rund um jeden dieser Momente nur ein kurzes Stück und überspringt den Rest. Das ist eine Entscheidung fürs Tempo und nicht für den Datenschutz, aber wissenswert ist es trotzdem: Selbst hier auf Ihrem Gerät wird der größte Teil Ihres Videos nie geöffnet.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe oder eine Länge. Jede Zeile, die liest, dekodiert, auswählt oder kodiert, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihr Video bekommt er nichts.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/plan.js` für die Rechnung, die festlegt, aus welchem Moment jedes Einzelbild stammt, und `src/decode.js` für die Schleife, die nur die Teile der Datei liest, die diese Momente brauchen. Keines davon importiert etwas, das eine Anfrage stellen könnte.
