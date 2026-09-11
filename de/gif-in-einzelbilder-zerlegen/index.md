# GIF zerlegen — jedes Einzelbild als eigenes PNG

Jedes Einzelbild einzeln als PNG heraus.

> Ein animiertes GIF in seine Einzelbilder zerlegen und jedes davon als PNG speichern, kostenlos und vollständig im Browser. Transparenz und Timing bleiben erhalten. Es wird nichts hochgeladen, und es geht auch offline.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/gif-in-einzelbilder-zerlegen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre GIFs werden **nie hochgeladen**. Es gibt keinen Server.

Das GIF wird von Ihrem eigenen Browser gelesen, entpackt und gezeichnet, und jedes PNG entsteht im Arbeitsspeicher dieses Geräts. Am anderen Ende dieser Seite steht gar kein Server, an den eine Animation gehen könnte, selbst wenn hier irgendetwas das wollte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So zerlegen Sie ein GIF in seine Einzelbilder

1. **Wählen Sie das GIF aus.** Ziehen Sie es auf das Auswahlfeld oder suchen Sie es von Hand heraus. Der Browser liest es direkt von Ihrer Festplatte, und die Seite sagt Ihnen, was sie gefunden hat: die Größe, die Zahl der Einzelbilder, die Spieldauer und wie oft die Animation wiederholt.
2. **Entscheiden Sie, was in jedem PNG stehen soll.** **Das Einzelbild, wie es erscheint** ist das, was fast alle wollen, also das ganze Bild in diesem Moment der Animation. **Nur die Pixel, die dieses Einzelbild speichert** ist der Flicken, den die Datei tatsächlich enthält, in seiner eigenen Größe und an seiner eigenen Stelle. So bleibt ein GIF klein, und so sieht die Animation gerade nicht aus.
3. **Entscheiden Sie, was mit der Transparenz passiert.** PNG behält sie, und das ist die ehrliche Voreinstellung. Füllen Sie sie stattdessen mit einer Farbe, wenn die Einzelbilder irgendwo landen, wo Transparenz ignoriert und daraus sonst Schwarz wird.
4. **Suchen Sie sich die Einzelbilder aus.** Voreingestellt sind alle. „Jedes zweite Einzelbild behalten“ dünnt eine lange Aufnahme aus, und die Häkchen im Raster übersteuern das. An der Nummerierung ändert sich dabei nie etwas, Einzelbild 42 heißt also weiter Einzelbild 42, wie wenige seiner Nachbarn Sie auch behalten haben.
5. **Laden Sie sie herunter.** Einzeln aus dem Raster oder alle zusammen als ein ZIP, damit es eine Speicherabfrage gibt statt hunderter. Das ZIP kann eine `frames.txt` mitbringen, in der steht, wie lange jedes Einzelbild stand. Das ist das eine, was ein Ordner voller PNGs von sich aus nicht sagen kann.

## Die ausführliche Fassung

[Ein GIF in Einzelbilder zerlegen](https://abox.tools/de/ratgeber/gif-in-einzelbilder-zerlegen/): Jedes Bild eines animierten GIFs als PNG: warum manche Bilder nur ein kleiner Ausschnitt sind, was mit der Transparenz passiert und wie Sie die Zeiten behalten, um die Animation wieder zusammenzusetzen.

## Auch im Werkzeugkasten

- [GIF-Analyse](https://abox.tools/de/gif-analysieren/): Einzelbilder, Anzeigedauern, Farbtabellen und wohin jedes Byte gegangen ist.
- [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/): Aus einem Ordner voller Bilder ein Video machen.
- [Video-Schneider](https://abox.tools/de/video-schneiden/): Beim Abspielen markieren, was bleiben soll. Und alles davon als ein Video zurückbekommen.
- [Video-Zuschneider](https://abox.tools/de/video-zuschneiden/): Einen Clip auf den Teil zurechtschneiden, auf den es ankommt.

## Fragen

### Wird mein GIF irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, entpackt und zeichnet die Datei auf Ihrer eigenen Hardware, und jedes PNG entsteht hier im Arbeitsspeicher. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Trennen Sie die Netzverbindung, und es zerlegt weiter GIFs.

### Warum sieht ein Einzelbild aus wie ein kleiner Ausschnitt?

Weil genau das in der Datei steht. Ein GIF ist ein erstes Bild und danach lauter Flicken: Jedes spätere Einzelbild speichert nur das Rechteck, das sich geändert hat, und alles andere auf dem Schirm ist das, was die vorherigen dort hinterlassen haben. Ein sprechender Kopf vor einer ruhigen Wand speichert deshalb ein Gesicht pro Einzelbild statt eines ganzen Bildes, und nur darum ist das Format nicht riesig. \
\
Zu sehen bekommen Sie das, weil „Nur die Pixel, die dieses Einzelbild speichert“ ausgewählt ist. Stellen Sie auf „Das Einzelbild, wie es erscheint“ um, und jedes PNG ist das ganze Bild, so wie die Animation in diesem Moment aussieht.

### Bleibt die Transparenz erhalten?

Ja. GIF-Transparenz ist ein einziges Bit, ein Pixel ist also entweder gemalt oder unsichtbar und dazwischen gibt es nichts, und PNG speichert genau das. Die Einzelbilder kommen also mit unversehrten transparenten Flächen heraus. Wenn Ihnen ein deckender Hintergrund lieber ist, stellen Sie „Transparente Flächen“ auf eine Farbe. Die wird ins PNG geschrieben und lässt sich hinterher nicht wieder herausnehmen.

### Warum sind die Anzeigedauern nicht die Zahlen, die ich erwartet habe?

Ein GIF speichert jede Dauer in Hundertstelsekunden, und Browser heben alles unter zwei davon seit den Neunzigern auf eine Zehntelsekunde an. Diese Regel wurde für die rotierenden Globen jener Zeit geschrieben und nie wieder entfernt. Ein Einzelbild, in dessen Datei 0,01 s steht, läuft deshalb überall mit 0,10 s. Dieses Werkzeug zeigt die Dauer so an, wie sie wirklich abgespielt wird, und schreibt daneben, was in der Datei steht, sobald beides auseinandergeht.

### Kann ich die Einzelbilder wieder zusammensetzen?

Ja, mit dem [GIF-Ersteller](https://abox.tools/de/gif-erstellen/) auf dieser Seite oder mit allem anderen, was einen Ordner voller Bilder annimmt. Genau dafür ist die `frames.txt` im ZIP da: Beim Zerlegen geht das Timing verloren, weil ein PNG nirgends festhalten kann, wie lange es stand, also trägt die Liste die Dauer und die Position jedes Einzelbildes mit hinaus.

### In welchen Formaten lassen sich die Einzelbilder speichern?

In PNG, und mit Absicht nur in PNG. Ein GIF-Einzelbild hat höchstens 256 Farben und ein Bit Transparenz. PNG speichert das exakt und verlustfrei, während JPEG die Transparenz wegwerfen, Farben erfinden würde, die das Einzelbild nie hatte, und aus flächiger Grafik meist eine *größere* Datei macht. Wenn Sie JPEGs brauchen, wandeln Sie die PNGs hinterher mit der [Bildgrößenänderung](https://abox.tools/de/bildgroesse-aendern/) um.

### Gibt es eine Grenze, wie viele Einzelbilder gelesen werden?

Eine feste Grenze gibt es nicht. Die praktische Obergrenze ist der Arbeitsspeicher Ihres Geräts: Ein GIF wird beim Lesen auf etwa ein Byte je Pixel und Einzelbild aufgeblasen, eine kleine Datei kann also sehr viel Speicher bedeuten. Diese Seite hört dann lieber auf zu lesen, als den Tab sterben zu lassen. Passiert das, sagt sie es und gibt die Einzelbilder heraus, die sie bekommen hat.

### Öffnet es auch ein beschädigtes GIF?

Meistens. Abgebrochene Downloads, eine fehlende Endmarke und ein letztes Einzelbild, das mitten im Datenstrom aufhört, sind alle häufig, und ein Leser, der so etwas ablehnt, nützt genau bei den Dateien nichts, die man am dringendsten auseinandernehmen möchte. Was vollständig ist, kommt heraus, mit einem Hinweis darauf, was nicht stimmte. Abgelehnt wird nur, was gar kein GIF ist.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Auf den Einzelbildern liegt auch kein Wasserzeichen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Dateien übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Animation zum Verarbeiten wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihr GIF hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien eingesammelt werden könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen. Früher stand hier `connect-src 'none'`, was keine Ausnahme kannte. Die Werbung hat das gekostet, und das gehört dazugesagt.
- **Der GIF-Leser sind zwei Dateien in diesem Repository.** Ein Browser spielt ein GIF ab, rückt seine Bestandteile aber nicht heraus, also wird das Format hier selbst gelesen. `src/gif.js` ist der Container samt LZW-Entpacker, `src/compose.js` sind die Entsorgungsregeln, die festlegen, wie ein Einzelbild aussieht, wenn die vorherigen darunter liegen. Zum Öffnen einer Datei wird nichts nachgeladen, und beim ersten Gebrauch wird auch keine Engine heruntergeladen.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihre Animation übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe oder eine Anzahl. Jede Zeile, die ein Bild liest, entpackt, zeichnet oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihre Dateien bekommt er nichts. Es passiert nichts, solange Sie nicht klicken, und was Sie dann öffnen, ist die Seite von jemand anderem.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihre Animation zum Zerlegen wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/gif.js` für den Leser, der die Einzelbilder entpackt, und `src/compose.js` für die Regeln, nach denen sie übereinandergelegt werden. In keinem von beiden steht eine Zeile, die ins Netz greifen könnte.
