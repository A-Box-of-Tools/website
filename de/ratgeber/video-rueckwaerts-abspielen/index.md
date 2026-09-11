# So spielen Sie ein Video rückwärts ab

Einen Clip rückwärts laufen zu lassen klingt nach dem einfachsten Schnitt überhaupt, und es ist der, für den eine Videodatei am wenigsten gebaut ist. Hier steht, was dafür wirklich passieren muss, was es kostet, und welcher eine Schritt sich vorher lohnt.

[Video-Umkehrer öffnen](https://abox.tools/de/video-rueckwaerts-abspielen/): Das letzte Einzelbild zuerst, samt Ton.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [Video-Umkehrer](https://abox.tools/de/video-rueckwaerts-abspielen/), ziehen Sie den Clip hinein, entscheiden Sie, ob der Ton mit umgekehrt werden soll, und exportieren Sie. Heraus kommt derselbe Clip mit dem letzten Einzelbild zuerst, genauso lang wie der, der hineinging.

Anders als beim Kürzen muss dabei jedes Einzelbild neu geschrieben werden, und der Ton ebenso. Das ist kein Mangel eines bestimmten Werkzeugs, das ist Umkehren. Der Rest dieser Seite erklärt, warum, und was es für Ihre Wartezeit bedeutet.

## Warum sich ein Video nicht einfach rückwärts abspielen lässt

Eine Videodatei ist kein Stapel Bilder. Ungefähr jedes fünfzigste Einzelbild ist ein vollständiges Bild, ein *Schlüsselbild*, und alles dazwischen ist eine Beschreibung dessen, was sich gegenüber den Bildern ringsum geändert hat. Nur deshalb passt eine Stunde Video auf ein Telefon.

Es heißt auch, dass ein Dekoder nur vorwärts kann. Um Ihnen das letzte Einzelbild eines Clips zu zeigen, muss er das Schlüsselbild davor suchen und alles dazwischen dekodieren. Fragen Sie nach dem vorletzten, macht er dieselbe Arbeit noch einmal.

Umgekehrt wird deshalb gruppenweise: eine Gruppe vorwärts dekodieren, die Einzelbilder festhalten, sie dem Kodierer in der anderen Reihenfolge geben, zur Gruppe davor gehen. Die naheliegende Alternative, nämlich den ganzen Clip in eine Liste zu dekodieren und die Liste rückwärts durchzugehen, braucht etwa 3 MB Arbeitsspeicher je 1080p-Einzelbild, also 5 GB je Minute. Deshalb fallen Werkzeuge, die es so machen, bei allem um, was länger als ein paar Sekunden ist.

![Die Quellenkarte: der Name des Clips, seine Größe, seine Bildgröße, seine Länge und sein Codec.](https://abox.tools/screens/reverse-a-video/source.webp)

Was das Werkzeug über die Datei ermittelt hat. Umkehren ist die eine Handlung, die sich nicht im Fluss erledigen lässt, also entscheiden diese Zahlen, ob es in den Speicher passt.

## Was mit dem Ton passiert

Hier gehen die Umkehrwerkzeuge am weitesten auseinander, und hier lohnt es sich zu prüfen, was Sie tatsächlich bekommen haben.

Ton wird in Paketen von einigen Dutzend Millisekunden komprimiert, jedes davon kodiert gegen das vorherige. Diese Pakete verkehrt herum hinauszuschreiben, spielt eine Spur *nicht* rückwärts. Es spielt kurze Stücke vorwärts in der falschen Reihenfolge, und das klingt nach Stottern oder Defekt und nicht nach Umkehrung. Der einzige Weg, Ton richtig umzukehren, ist, die ganze Spur zu dekodieren, die Samples in die andere Reihenfolge zu bringen und wieder zu kodieren.

Genau das passiert hier, und deshalb wird der Ton neu kodiert, während der [Video-Schneider](https://abox.tools/de/video-schneiden/) und der [Video-Zuschneider](https://abox.tools/de/video-zuschneiden/) ihn nie anrühren: Diese Aufgaben ändern nicht, *wann* etwas passiert, und diese hier ändert nichts anderes.

Wenn Sie das Bild rückwärts wollen und gar keinen Ton, was für alles die übliche Wahl ist, das in einem stumm abspielenden Feed landet, schalten Sie das Häkchen ab. Das geht schneller, und die Datei wird kleiner.

![Die Export-Karte: ein Qualitätsregler, ein Schalter für den Ton und eine Übersicht über Ausgabegröße, Länge und Bildanzahl.](https://abox.tools/screens/reverse-a-video/export.webp)

Den Ton-Schalter gibt es, weil rückwärts gespielte Sprache selten das ist, was jemand wollte, und die Entscheidung vor dem Export leichter fällt als danach.

## Was es das Bild kostet

Eine Neukodierung. Die Einzelbilder kommen in einer Reihenfolge heraus, für die in der Originaldatei nichts kodiert war, jedes muss also frisch geschrieben werden.

Was ein anständiges Werkzeug nicht tut, ist *mehr* auszugeben als das Original. Ein umgekehrter Clip enthält genau dieselben Bilder wie der, der ankam, eine höhere Bitrate hat also nichts Neues zu beschreiben: Sie macht die Datei größer, ohne sie besser aussehen zu lassen. Die Qualitätseinstellung bewegt sich hier unterhalb dieser Decke statt darüber.

Wie immer summieren sich verlustbehaftete Schritte. Ein Original umzukehren ist eine Generation. Den Export eines Downloads einer Bildschirmaufnahme umzukehren sind vier, und man sieht es.

## Erst kürzen, dann umkehren

Wenn der Clip beides braucht, schneiden Sie zuerst. Kürzen ist umsonst, denn ein guter Schneider schiebt ganze Einzelbilder hinüber, ohne sie zu dekodieren, und jede Sekunde, die Sie entfernen, ist eine Sekunde, die niemand noch einmal dekodieren und kodieren muss.

Andersherum kehren Sie Material um, das Sie gleich wegwerfen. Bei einem langen Clip ist das der Unterschied zwischen ein paar Sekunden und mehreren Minuten. Der [Ratgeber zum Kürzen](https://abox.tools/de/ratgeber/video-kuerzen/) erklärt, warum dieser erste Schritt Sie überhaupt keine Qualität kosten muss.

Dieselbe Reihenfolge gilt fürs Zuschneiden: schneiden, zuschneiden, umkehren, und Sie bezahlen eine Neukodierung des kürzestmöglichen Clips.

## Wofür Menschen das wirklich verwenden

- **Der Rückspul-Gag.** Etwas fällt, zerbricht oder spritzt, und die Umkehrung setzt es wieder zusammen. Es liest sich als Witz, weil echtes Material rückwärts unverkennbar ist: Rauch sammelt sich, Wasser klettert.
- **Boomerangs von Hand.** Kehren Sie einen kurzen Clip um und hängen Sie ihn mit dem [Video-Schneider](https://abox.tools/de/video-schneiden/) an das Original. So bekommen Sie die Vorwärts-dann-rückwärts-Schleife ohne die App, die das sonst macht, und in Ihrer Länge statt in ihrer.
- **Enthüllungen.** Filmen Sie den fertigen Zustand und kehren Sie ihn um, dann wird aus einem angerichteten Teller wieder eine Zutatenliste oder ein zusammengebautes Ding fällt auseinander. Vorwärts wäre es schwerer zu filmen, und genau das ist der Punkt.
- **Rückwärts gesprochene Sprache.** Interessant allerdings nur, wenn der Ton wirklich umgekehrt ist, siehe oben.

## Formate, und wie lange es dauert

**MP4, M4V und MOV** werden direkt gelesen, egal was darin steckt, also H.264, HEVC, AV1 oder VP9, solange Ihr Browser diesen Codec dekodieren kann. Das ist der schnelle Weg: Die Datei wird Einzelbildgruppe für Einzelbildgruppe rückwärts durchgegangen, so schnell, wie Ihr Gerät eben ist.

**Alles andere, was Ihr Browser abspielen kann**, allen voran WebM, wird umgekehrt, indem der eigene Player des Browsers rückwärts durch den Clip gesteppt wird, Moment für Moment. Das funktioniert und dauert länger, denn jeder dieser Schritte zwingt den Browser, ab dem Schlüsselbild davor zu dekodieren. Die Seite sagt, welchen der beiden Wege sie nimmt und warum, bevor Sie anfangen.

**AVI, WMV, FLV und die meisten MKVs** kann der Browser weder lesen noch abspielen, und das Werkzeug lehnt sie mit einer Meldung ab, statt auf halbem Weg zu scheitern.

So oder so gehört das zu den langsameren Aufgaben auf dieser Seite, denn jedes Einzelbild wird dekodiert und kodiert und manche mehr als einmal. Ein kurzer Clip sind Sekunden; einen langen in 4K startet man und lässt ihn in Ruhe.

## Warum das keinen Upload braucht

Video im Browser zu dekodieren und neu zu kodieren ist neu und es funktioniert: WebCodecs legt denselben Hardware-Kodierer offen, mit dem Ihr Telefon Videos aufnimmt, und es ist aus demselben Grund schnell. Die Arbeit passiert auf dem Gerät, das die Datei schon hat, und bei einem großen Video ist das ohnehin die einzig sinnvolle Anordnung: Es hochzuladen und das Ergebnis herunterzuladen kostet mehr Zeit als das Kodieren.

Das Werkzeug hier hat keinerlei Netzfunktion, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und kehrt trotzdem einen Clip um.

[Ist es sicher, Dateien hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) nennt drei weitere Prüfungen, die Sie an jedem Werkzeug vornehmen können.
