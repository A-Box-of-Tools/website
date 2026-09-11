# Video rückwärts — einen Clip rückwärts abspielen

Das letzte Einzelbild zuerst, samt Ton.

> Ein MP4, MOV oder WebM rückwärts abspielen lassen, mit umgekehrtem Ton. Läuft im Browser: Es wird nichts hochgeladen, es gibt kein Wasserzeichen, und es geht auch offline.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/video-rueckwaerts-abspielen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Videos werden **nie hochgeladen**. Es gibt keinen Server.

Jedes Einzelbild wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware dekodiert, umgedreht und wieder kodiert. Abrufen oder senden kann hier nichts, denn eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Video gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Kehrt den Ton mit um
- ✓ Funktioniert offline

## So spielen Sie ein Video rückwärts ab

1. **Wählen Sie ein Video aus.** Ziehen Sie ein MP4, MOV, M4V oder WebM auf das Auswahlfeld oder suchen Sie eines von Hand heraus. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Entscheiden Sie über den Ton.** „Den Ton mit umkehren“ dreht die Spur Sample für Sample um, und nur so kommt Sprache als rückwärts gespielte Sprache heraus statt als Stille. Für einen stummen Clip schalten Sie es ab, das geht schneller.
3. **Entscheiden Sie, wie viel Qualität ausgegeben wird.** Das Bild muss neu kodiert werden, denn die Einzelbilder kommen in einer Reihenfolge heraus, für die in der Datei nichts kodiert war. „Ausgewogen“ bleibt nah an dem, was das Original ausgegeben hat, „Beste Qualität“ legt noch etwas drauf.
4. **Umkehren und herunterladen.** Die Arbeit passiert auf Ihrer eigenen Hardware. Wie lange sie dauert, hängt daher von Ihrem Gerät ab und nicht von einer Warteschlange. Das fertige Video geht direkt in die Downloads Ihres Browsers.

## Die ausführliche Fassung

[So spielen Sie ein Video rückwärts ab](https://abox.tools/de/ratgeber/video-rueckwaerts-abspielen/): Einen Clip rückwärts laufen lassen: was das Umkehren mit Bild und Ton macht, warum es ohne Neukodierung nicht geht, warum es länger dauert als Kürzen, und was man vorher tun sollte.

## Auch im Werkzeugkasten

- [Zeitraffer-Generator](https://abox.tools/de/zeitraffer-erstellen/): Eine Stunde Aufnahme in zwanzig Sekunden.
- [Standbild-Greifer](https://abox.tools/de/standbild-aus-video/): Ein Standbild in voller Qualität, von jeder Stelle.
- [Video zu GIF](https://abox.tools/de/video-in-gif-umwandeln/): Abschnitt, Größe und Bildrate selbst wählen.
- [GIF-Ersteller](https://abox.tools/de/gif-erstellen/): Aus einer Reihe von Bildern eine Animation machen.

## Fragen

### Wird mein Video irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, dekodiert, kehrt um und kodiert es auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und kehrt trotzdem einen Clip um.

### Welche Videoformate kann ich umkehren?

MP4, M4V und MOV werden direkt gelesen, egal was darin steckt, also H.264, HEVC, AV1 oder VP9, solange Ihr Browser diesen Codec dekodieren kann. Alles andere, was Ihr Browser abspielen kann, allen voran WebM, wird stattdessen umgekehrt, indem der eigene Player des Browsers rückwärts durch den Clip gesteppt wird. Das funktioniert, dauert aber länger. Was der Browser weder lesen noch abspielen kann, in der Praxis AVI, WMV, FLV und die meisten MKVs, wird gleich mit einer entsprechenden Meldung abgelehnt, statt auf halbem Weg zu scheitern. Heraus kommt immer ein MP4.

### Wird der Ton mit umgekehrt?

Ja, sofern Sie es nicht abschalten. Die ganze Spur wird dekodiert, die Samples werden in die andere Reihenfolge gebracht, und dann wird wieder als AAC kodiert. Um diese zweite Kodierung kommt man nicht herum: Ein Audio-Paket sind einige Dutzend Millisekunden Klang, kodiert gegen das Paket davor. Die Pakete verkehrt herum hinauszuschreiben, spielte also kurze Stücke vorwärts in der falschen Reihenfolge, und das klingt nach Defekt und nicht nach Umkehrung.

### Kostet das Umkehren Qualität?

Das Bild wird ein zweites Mal kodiert, und das kostet ein wenig. Hier lässt sich das nicht vermeiden, wie es beim Kürzen möglich ist: Ein umgekehrter Clip zeigt seine Einzelbilder in einer Reihenfolge, für die in der Originaldatei nichts kodiert war, jedes Einzelbild muss also neu geschrieben werden. Was das Werkzeug dabei nicht tut, ist mehr auszugeben, als das Original ausgegeben hat, denn darüber hinaus zu kodieren macht die Datei nur größer, ohne sie besser aussehen zu lassen.

### Gibt es eine Grenze für Größe oder Länge des Videos?

Im Werkzeug ist keine Grenze eingebaut, und die Datei wandert auch nicht auf einmal in den Arbeitsspeicher, sondern wird Einzelbildgruppe für Einzelbildgruppe rückwärts durchgegangen. Die praktischen Obergrenzen sind das fertige Video, das vor dem Download im Arbeitsspeicher zusammengesetzt wird, und der Ton, der ganz gehalten werden muss, weil eine Umkehrung das letzte Sample braucht, bevor sie das erste schreiben kann.

### Warum dauert es bei manchen Dateien länger als bei anderen?

Weil es zwei Wege hinein gibt. Ein MP4 oder MOV liest dieses Werkzeug direkt und dekodiert es gruppenweise, und das läuft so schnell, wie Ihr Gerät eben ist. Alles andere wird umgekehrt, indem der eigene Player des Browsers nacheinander nach einzelnen Momenten des Clips gefragt wird, und jeder dieser Sprünge zwingt den Browser, ab dem Schlüsselbild davor zu dekodieren. Welchen der beiden Wege sie nimmt und warum, sagt die Seite, bevor Sie anfangen.

### Kann ich auch nur einen Teil eines Clips umkehren?

Hier nicht. Dieses Werkzeug kehrt das Ganze um: Der Clip, der herauskommt, ist genauso lang wie der, der hineinging, nur mit dem letzten Einzelbild zuerst. Schneiden Sie den gewünschten Teil vorher mit dem [Video-Schneider](https://abox.tools/de/video-schneiden/) heraus, der das ohne die Neukodierung eines einzigen Einzelbildes erledigt, und kehren Sie dann um, was dabei herauskommt.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihr Video übergeben.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Videos haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Datei landen könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Eine Netzfunktion hat dieses Werkzeug überhaupt nicht. Es gibt keine Adresse zum Einfügen, nichts herunterzuladen und keine Engine, die beim ersten Gebrauch nachgeladen wird. Jedes Byte, das Ihr Video berührt, kam beim Laden der Seite von dieser Domain selbst.
- **Dekodieren und Kodieren passieren lokal.** Die Einzelbilder laufen durch WebCodecs in Ihrem eigenen Browser oder durch dieselbe Wiedergabe-Engine, die Ihnen den Clip ohnehin zeigen würde. Die fertige Datei entsteht im Arbeitsspeicher dieses Geräts und geht von dort direkt in einen Download.
- **Der Ton wird ebenfalls hier umgedreht.** Eine Tonspur umzukehren heißt, sie zu dekodieren, und dieses Dekodieren ist das des Browsers und passiert auf diesem Gerät. Nichts hört mit, nichts behält etwas, und weiterreichen könnte es auch nichts: Es gibt hier keinen Weg im Code, der ein Byte verschickt.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe oder eine Länge. Jede Zeile, die liest, dekodiert, umkehrt oder kodiert, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihr Video bekommt er nichts.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/timeline.js` für die Rechnung, die entscheidet, welches Einzelbild wann herauskommt, und `src/reverse.js` für die Schleife, die die Datei gruppenweise rückwärts durchgeht. Keines davon importiert etwas, das eine Anfrage stellen könnte.
