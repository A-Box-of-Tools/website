# Audio bearbeiten — rückwärts, schneller oder lauter

Rückwärts abspielen, das Tempo ändern, eine leise Aufnahme anheben. Alles hier, auf Ihrem Gerät.

> Eine Aufnahme rückwärts abspielen, schneller oder langsamer machen und eine leise Aufnahme anheben. Holt auch den Ton aus einem Video. Läuft im Browser: nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/audio-bearbeiten/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Aufnahmen werden **nie hochgeladen**. Es gibt keinen Server.

Ihre Datei wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, bearbeitet und geschrieben. Abrufen oder senden kann hier nichts, denn eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den eine Aufnahme gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Video hinein, Audio heraus
- ✓ Funktioniert offline

## So bearbeiten Sie eine Audiodatei

1. **Wählen Sie eine Datei aus.** Ziehen Sie eine MP3-, WAV-, FLAC-, M4A-, Ogg- oder Opus-Datei auf das Auswahlfeld, oder gleich ein Video, wenn es Ihnen um den Ton daraus geht. Der Browser liest sie direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Drehen Sie sie um, falls Sie deshalb hier sind.** Dafür genügt ein Häkchen. Die Samples werden von hinten nach vorn geschrieben, und das ist exakt umkehrbar. Machen Sie es zweimal, haben Sie Sample für Sample die Datei, mit der Sie angefangen haben.
3. **Stellen Sie das Tempo ein.** Ziehen Sie den Regler, tippen Sie einen Faktor ein oder nehmen Sie eine der Voreinstellungen. Dann entscheiden Sie, was mit der Tonhöhe passiert. Halten Sie sie, wo sie ist, wenn Sie eine Vorlesung mit 1,5× hören wollen. Oder lassen Sie sie mit dem Tempo mitgehen, so wie es ein Tonband tut, das eine Stimme höher oder tiefer macht.
4. **Stellen Sie den Pegel ein.** Nennen Sie entweder eine Änderung in Dezibel, oder lassen Sie die Aufnahme so weit anheben, dass ihr lautester Moment knapp unter der Decke liegt. Wo dieser Moment landen wird, sagt Ihnen die Seite vorher, und sie warnt Sie, wenn Ihre Einstellung ihn über die Vollaussteuerung hinausschieben würde.
5. **Speichern Sie.** Die Arbeit passiert auf Ihrer eigenen Hardware. Wie lange sie dauert, hängt daher von Ihrem Gerät ab und nicht von einer Warteschlange. Heraus kommt eine WAV, also die Samples selbst mit einem Header davor. Sie wird zuerst auf der Seite abgespielt und geht dann direkt in die Downloads Ihres Browsers.

## Die ausführliche Fassung

[So räumen Sie ein Sprachmemo auf, bevor Sie es verschicken](https://abox.tools/de/ratgeber/sprachmemo-aufraeumen/): Die tote Luft und die Fehlstarts wegschneiden, dann den Pegel auf Vollaussteuerung heben. Zwei Browser-Werkzeuge nacheinander, in der Reihenfolge, die die Qualität bewahrt, und die Aufnahme verlässt Ihr Gerät nie.

## Auch im Werkzeugkasten

- [PDF-Zusammenfügen & Teilen](https://abox.tools/de/pdf-zusammenfuegen/): Seiten umsortieren, ohne den Umweg über einen Server.
- [PDF-Kompressor](https://abox.tools/de/pdf-verkleinern/): Ein Dokument verkleinern, ohne es irgendwohin zu schicken.
- [PDF-Schwärzer](https://abox.tools/de/pdf-schwaerzen/): Die Buchstaben werden aus der Datei gelöscht, und danach wird die Datei durchsucht, um es zu belegen.
- [Bilder in PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/): Ihre Bilder in ein einziges Dokument packen.

## Fragen

### Wird mein Audio irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, bearbeitet und schreibt es auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und kehrt trotzdem eine Aufnahme um.

### Kann ich den Ton aus einem Video holen?

Ja, und hier ist das dieselbe Aufgabe wie das Öffnen einer MP3. Ziehen Sie ein MP4, MOV oder WebM hinein, und es wird nur die Tonspur dekodiert. Das Bild wird nie gelesen, und heraus kommt eine Audiodatei ohne Video darin. Wenn das schon alles ist, was Sie wollen — den Ton, unverändert —, dann erledigt [Ton aus Video extrahieren](https://abox.tools/de/ton-aus-video-extrahieren/) dieselbe Aufgabe auf einer Seite, auf der sonst nichts steht. Kommen Sie hierher zurück, wenn der Ton auch verändert werden soll.

### Ändert eine Tempoänderung die Tonhöhe?

Nur wenn Sie es so wollen. „Tonhöhe halten“ schneidet die Aufnahme in überlappende Fenster von etwa fünfzig Millisekunden und legt sie enger oder weiter auseinander wieder ab. Jede Position wird dabei so gewählt, dass die Wellen an der Schnittstelle zusammenpassen, und deshalb bleibt eine Stimme bei 1,5× dieselbe Stimme. „Mitgehen lassen“ rechnet stattdessen neu ab, und genau das tut ein schneller laufendes Tonband: doppeltes Tempo ist genau eine Oktave höher.

### Warum speichert es eine WAV und keine MP3?

Weil kein Browser einen MP3-Encoder mitbringt und dieses Werkzeug sich weigert, Ihre Aufnahme an einen Server zu schicken, der einen hat. Eine WAV braucht überhaupt keinen Encoder, denn sie besteht aus den Samples mit einem vierundvierzig Byte großen Header davor. Damit ist sie zugleich die ehrliche Option und die einzige, die keine Qualität kosten kann. Größer ist sie allerdings, rund zehn Megabyte pro Minute in Stereo. Öffnen kann sie jeder Player, jedes Telefon und jeder Editor, und alles, was eine MP3 will, macht daraus eine.

### Welche Formate kann ich öffnen?

Alles, was Ihr Browser dekodiert, in der Praxis also MP3, WAV, FLAC, M4A und AAC, Ogg Vorbis und Opus sowie den Ton in MP4-, M4V-, MOV- und WebM-Videos. Draußen bleibt dieselbe kurze Liste wie überall sonst: AVI, WMA und die meisten MKVs. Eine Datei, die dieser Browser nicht lesen will, wird gleich mit einer entsprechenden Meldung abgelehnt, statt auf halbem Weg zu scheitern.

### Verzerrt es, wenn ich es lauter mache?

Nur wenn Sie über die Vollaussteuerung hinausgehen, und das sagt Ihnen die Seite vorher. Digitales Audio hat eine harte Decke. Lauter als Vollaussteuerung kann ein Sample nicht werden, alles darüber wird also an der Decke plattgedrückt, und genau so klingt Verzerrung. „So laut wie möglich“ ist die Einstellung, die das gar nicht tun kann, denn sie rechnet aus, wie viel Luft die Aufnahme noch hat, und nutzt genau so viel. Unterhalb der Decke ist alles bloß Multiplikation: 6 dB hoch und 6 dB wieder herunter, und die Samples stehen, wo sie standen.

### Kostet Umkehren oder eine Tempoänderung Qualität?

Umkehren nicht. Dieselben Samples kommen in der anderen Reihenfolge heraus, und das ist exakt. Eine Tempoänderung verschiebt dagegen jedes Sample und ist damit Rechnerei statt Kopie. Das Resampling filtert dabei ordentlich, damit hohe Töne beim Beschleunigen nicht als metallisches Klingeln zurückfalten, und die Fenster der Zeitdehnung werden dort gesetzt, wo die Wellen zusammenpassen, statt dort, wo die Rechnung gerade hinfiel. Neu kodiert wird auf keinem der beiden Wege etwas, denn einen Encoder gibt es hier gar nicht.

### Gibt es eine Grenze für die Länge der Datei?

Im Werkzeug ist keine Grenze eingebaut. Die praktische Obergrenze setzt der Arbeitsspeicher, denn die gesamte Aufnahme wird auf einmal in diese Seite dekodiert, und vor dem Download wird eine WAV im Speicher zusammengesetzt. Eine Stunde Stereo braucht damit knapp unter einem Gigabyte Arbeitsraum. Eine WAV über vier Gigabyte wird rundweg abgelehnt, weil das Größenfeld des Formats selbst so etwas gar nicht beschreiben kann.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Aufnahme übergeben.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Aufnahmen haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Datei landen könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Es gibt keine Adresse zum Einfügen, nichts herunterzuladen und keine Engine, die beim ersten Gebrauch nachgeladen wird. Jedes Byte, das Ihr Audio berührt, kam beim Laden der Seite von dieser Domain selbst.
- **Der Decoder ist der, den Ihr Browser ohnehin hat.** Die Datei geht an `decodeAudioData`, also an denselben Code, der eine Aufnahme in einem `<audio>`-Element abspielt. Um Ihr Format zu lesen, wird hier nichts ausgeliefert und auch nichts von außerhalb dieser Seite angefordert.
- **Das Bild eines Videos wird überhaupt nicht dekodiert.** Ziehen Sie ein Video hinein, wird nur seine Tonspur angefordert. Die Einzelbilder werden nicht gelesen, nicht dekodiert, nicht gezeichnet und nicht angesehen, denn auf dieser Seite gibt es gar keinen Code, der das könnte. Was herauskommt, enthält Klang und sonst nichts.
- **Die Samples werden aufgeschrieben, nicht neu kodiert.** Eine WAV besteht aus den Samples, die diese Seite berechnet hat, mit einem Header davor. In der Kette sitzt kein Encoder, der über Ihre Aufnahme entscheidet, und es gibt auch nichts, was sich als Upload beschreiben ließe, worauf so etwas passieren könnte.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihre Aufnahme übergeben, weder eine Datei noch ein Sample, ein Name, eine Größe, eine Länge oder wie laut sie war. Jede Zeile, die liest, bearbeitet und schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihre Datei bekommt er nichts.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/shared/audio-decode.js` für die zwanzig Zeilen, die Ihre Datei an den browsereigenen Decoder übergeben, `src/stretch.js` für die Zeitdehnung, `src/speed.js` für das Resampling und `src/shared/wav.js` für den Header, der vor die Samples kommt. Keines davon importiert etwas, das eine Anfrage stellen könnte.
