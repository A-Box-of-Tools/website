# Ton aus Video extrahieren — der Ton für sich, als WAV

Ziehen Sie ein Video hinein und nehmen Sie den Ton heraus. Das Bild wird nie dekodiert, und hochgeladen wird nichts.

> Holen Sie den Ton aus einem MP4, MOV oder WebM und speichern Sie ihn als WAV. Das Video verlässt Ihr Gerät nicht, und sein Bild wird nie dekodiert. Die ganze Arbeit läuft in Ihrem eigenen Browser.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/ton-aus-video-extrahieren/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Videos werden **nie hochgeladen**. Es gibt keinen Server.

Der Dekoder ist der, den Ihr Browser ohnehin schon hat. Es ist derselbe Code, der eine Datei in einem `<video>`-Element abspielt, und gefragt wird er nach der Tonspur und nach nichts sonst. Ein WAV zu schreiben heißt, einen vierundvierzig Byte langen Kopf vor die Samples zu setzen, nachzulesen in `src/shared/wav.js`. In der Schleife sitzt kein Kodierer, es gibt keinen Upload-Schritt, und eine Netzfunktion hat diese Seite überhaupt nicht.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Größengrenze
- ✓ Funktioniert offline
- ✓ Quelloffen

## So holen Sie den Ton aus einem Video, ohne es hochzuladen

1. **Ziehen Sie das Video hinein.** Ein MP4, MOV, M4V oder WebM, vom Telefon, aus einer Kamera, von einem Bildschirmrekorder oder aus einem Download. Ihr eigener Browser liest es, und es gibt keinen Upload-Schritt, den man weglassen müsste.
2. **Lesen Sie, was gefunden wurde.** Die Länge, die Zahl der Kanäle und die Abtastrate, direkt aus der Datei. Wenn die Datei ihre Rate nicht angegeben hat, sagt die Seite das, statt still neu abzutasten und zu behaupten, es sei nichts angerührt worden.
3. **Wählen Sie Mono, wenn es kleiner sein soll.** Lässt man die Kanäle in Ruhe, bleibt die Aufnahme genau so, wie sie war. Die Mischung auf Mono halbiert die Datei und ist das, was eine Transkription oder eine Sprachaufnahme will. Dabei werden die Kanäle gemittelt, statt einen davon wegzuwerfen.
4. **Hören Sie es ab, bevor Sie es speichern.** Der Player spielt die Datei, die gleich heruntergeladen wird, nicht das Video. Klingt es richtig, ist der Download richtig.
5. **Nehmen Sie es mit, oder geben Sie es weiter.** Laden Sie das WAV herunter, oder schicken Sie es direkt an den Schneider oder den Editor, ohne es vorher zu speichern.

## Auch im Werkzeugkasten

- [Audio-Schneider](https://abox.tools/de/audio-schneiden/): Markieren Sie beim Abspielen, was bleiben soll. Zurück kommt eine Datei, geschnitten genau dort, wo Sie es gesagt haben.
- [Audio-Editor](https://abox.tools/de/audio-bearbeiten/): Rückwärts abspielen, das Tempo ändern, eine leise Aufnahme anheben. Alles hier, auf Ihrem Gerät.
- [PDF-Zusammenfügen & Teilen](https://abox.tools/de/pdf-zusammenfuegen/): Seiten umsortieren, ohne den Umweg über einen Server.
- [PDF-Kompressor](https://abox.tools/de/pdf-verkleinern/): Ein Dokument verkleinern, ohne es irgendwohin zu schicken.

## Fragen

### Wird mein Video irgendwohin hochgeladen?

Nein. Das Dekodieren und das Schreiben geschehen beide in Ihrem eigenen Browser, auf Ihrer eigenen Hardware. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, es ruft nie etwas ab und sendet nie etwas, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und holt den Ton trotzdem heraus.

### Bekomme ich auch ein MP3?

Nein, und es wird auch nicht so getan. Kein Browser bringt einen MP3-Kodierer mit, und der einzige Weg zu einem führt darüber, Ihr Video an einen Server zu schicken, der einen hat. Genau das ist das eine, wofür es diese Seite nicht gibt. Was Sie bekommen, ist ein WAV: die Samples mit einem vierundvierzig Byte langen Kopf davor, wofür es keinen Kodierer braucht und was keine Qualität kosten kann. Größer ist es allerdings, rund zehn Megabyte je Minute in Stereo, und öffnen kann es jeder Player, jedes Telefon und jedes Schnittprogramm. Was ein MP3 will, macht daraus in einer Sekunde eines.

### Wird das Bild jemals angesehen?

Nein, und hier gibt es nichts, was es ansehen könnte. Der Dekoder des Browsers bekommt die Datei und wird nach ihrer Tonspur gefragt. Die Videospur wird nie dekodiert, nie gezeichnet und erreicht den Code dieser Seite überhaupt nicht. In `src/` liegt kein Video-Dekoder, der laufen könnte. In der Datei, die herauskommt, ist Ton und sonst nichts.

### Es heißt, es sei kein Ton lesbar, aber das Video läuft einwandfrei.

Dann hat das Video mit ziemlicher Sicherheit gar keine Tonspur. Eine Bildschirmaufnahme ohne ausgewähltes Mikrofon ist stumm, und ein Schnitt, den ein Programm mit stummgeschaltetem Ton exportiert hat, ebenso. Beide laufen einwandfrei, weil es ein Bild zu zeigen gibt. Die Meldung nennt diesen Fall zuerst, weil er der wahrscheinlichere der beiden ist; der andere ist ein Format, das dieser Browser nicht liest. Öffnen Sie die Datei in einem Player und achten Sie auf einen Lautstärkeregler, der nichts bewirkt. Das ist der schnellste Weg zu sehen, welcher der beiden Fälle vorliegt.

### Welche Videoformate kann ich öffnen?

Alles, was Ihr Browser dekodiert, in der Praxis also MP4, M4V, MOV und WebM sowie sämtliche Audioformate dazu. Draußen bleibt dieselbe kurze Liste wie überall sonst auf dieser Seite: AVI, WMV und die meisten MKVs. Eine Datei, die Ihr Browser nicht liest, wird mit einer entsprechenden Meldung abgelehnt, statt auf halbem Weg zu scheitern.

### Geht dabei Qualität verloren?

Nichts über das hinaus, was das Video seinem eigenen Ton bei der Aufnahme schon angetan hat. Die Samples, die der Dekoder zurückgibt, werden so aufgeschrieben, wie sie sind. Es gibt kein zweites Kodieren und damit auch keine zweite Verlustgeneration. Zu wissen ist nur eines: die Abtastrate. Die Rate der Datei wird zuerst aus deren Kopf gelesen, und dekodiert wird mit genau dieser Rate, damit Ihre Aufnahme nicht stillschweigend neu abgetastet wird. Gibt eine Datei keine an, sagt die Seite, mit welcher Rate sie gerechnet hat.

### Warum ist das WAV so viel größer als das Video?

Weil ein WAV nicht komprimiert ist und die Tonspur des Videos es war. Ton in CD-Qualität braucht rund zehn Megabyte je Minute in Stereo, ganz gleich, was darauf zu hören ist; die AAC-Spur in einem MP4 vielleicht ein Zehntel davon. Die Mischung auf Mono halbiert das. Das ist der Preis dafür, nicht neu zu kodieren, und er wird einmal bezahlt: Was Sie als Nächstes damit öffnen, kann die Datei komprimieren.

### Wie lang darf das Video sein?

Hier ist keine Grenze eingebaut, denn es gibt keinen Server, der dafür bezahlt. Die praktische Obergrenze ist der Arbeitsspeicher Ihres Geräts: Die Datei wird eingelesen, und die ganze Tonspur liegt als Samples im Speicher, sodass einer sehr langen Aufnahme auf einem kleinen Gerät der Platz ausgehen kann. Ein paar Stunden Video sind normalerweise unproblematisch, und ein Telefon schafft weniger als ein Notebook.

### Kann ich den Ton kürzen oder lauter machen?

Ja, aber nicht hier. Diese Seite erledigt eine Aufgabe. Sobald es ein Ergebnis gibt, steht neben dem Download eine Reihe von Links, die es direkt in den [Audio-Schneider](https://abox.tools/de/audio-schneiden/) oder den [Audio-Editor](https://abox.tools/de/audio-bearbeiten/) trägt, ohne es vorher zu speichern und ohne dass eines von beiden es hochladen würde.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und keine Grenze dafür, wie viele Videos Sie öffnen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Datei übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr Video zum Verarbeiten wegschickt, bliebe in dem Moment stehen, in dem Sie die Verbindung trennen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihr Video hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem eine Datei landen könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Das Bild wird gar nicht erst dekodiert.** Angefordert wird allein die Tonspur. Die Einzelbilder werden nicht gelesen, nicht dekodiert, nicht gezeichnet und nicht angesehen, denn auf dieser Seite gibt es keinen Code, der das könnte, und in der Datei, die herauskommt, ist Ton und sonst nichts. Das ist kein Versprechen über Zurückhaltung. `decodeAudioData` bekommt die Bytes und gibt Ton zurück, und in `src/` liegt kein Video-Dekoder, der laufen könnte.
- **Der Dekoder ist der, den Ihr Browser ohnehin schon hat.** Hier wird nichts ausgeliefert, um Ihr Format zu lesen, und dafür wird auch nichts außerhalb dieser Seite gefragt. Welche Dateien funktionieren, ist damit genau das, was Ihr Browser ohnehin abspielt.
- **Die Samples werden aufgeschrieben, nicht neu kodiert.** Ein WAV sind die Samples, die der Dekoder zurückgegeben hat, mit einem Kopf davor. In der Schleife sitzt kein Kodierer, der Entscheidungen über Ihre Aufnahme trifft, und es gibt nichts, was man als Upload beschreiben könnte, auf dem so etwas passieren würde.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem von ihnen wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Sample, ein Name, eine Größe oder eine Länge.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug arbeitet unverändert weiter, denn einen Netzschritt gab es darin nie. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/shared/audio-decode.js` für den einen Dekoder, den es gibt, und dafür, warum das Bild nie angefordert wird, und `src/shared/samplerate.js` für das Auslesen des Kopfes, das verhindert, dass Ihre Aufnahme stillschweigend neu abgetastet wird.
