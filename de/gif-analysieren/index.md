# GIF analysieren — was wirklich in einem GIF steckt

Einzelbilder, Anzeigedauern, Farbtabellen und wohin jedes Byte gegangen ist.

> Ein GIF im Browser auseinandernehmen: jedes Einzelbild mit Anzeigedauer und Entsorgungsart, die Farbtabellen, die Wiederholungen und eine Byte-für-Byte-Aufstellung, wohin die Dateigröße gegangen ist. Es wird nichts hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/gif-analysieren/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre GIFs werden **nie hochgeladen**. Es gibt keinen Server.

Geöffnet und auseinandergenommen wird die Datei von Ihrem eigenen Browser. Die Blockstruktur, die LZW-Entpackung und jedes auf dieser Seite gezeichnete Einzelbild entstehen auf diesem Gerät. Am anderen Ende dieser Seite steht gar kein Server, an den eine Datei gehen könnte, selbst wenn hier irgendetwas das wollte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So analysieren Sie ein GIF

1. **Wählen Sie ein GIF aus.** Ziehen Sie es auf das Auswahlfeld oder suchen Sie es von Hand heraus. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Lesen Sie zuerst die Übersicht.** Die Leinwandgröße, die Zahl der Einzelbilder, wie lange die Animation laut Datei läuft und wie lange sie tatsächlich spielt. Die letzten beiden gehen häufiger auseinander, als man denkt, und der Grund steht im nächsten Abschnitt.
3. **Sehen Sie sich an, was auffällt.** Jede Zeile dort ist an Ihrer Datei gemessen: Anzeigedauern, an die sich kein Browser hält, ein fehlender Wiederholungsblock, Farbtabellen, auf die nichts verweist, Metadaten, die größer sind als manche Einzelbilder. Nichts davon ist eine Vermutung darüber, was Sie vorhatten.
4. **Sehen Sie, wohin die Bytes gegangen sind.** Jedes Byte der Datei steht in genau einer Zeile, und die Zeilen ergeben zusammen die Datei. Wenn das meiste davon nicht bei „komprimierte Pixel“ steht, sagt Ihnen der Rest der Tabelle, wo es stattdessen liegt.
5. **Gehen Sie die Einzelbilder durch.** Jedes zeigt seine Anzeigedauer, sein Rechteck, seine Entsorgungsart und seine Größe. Schalten Sie zwischen „die Leinwand nach jedem Einzelbild“ und „nur, was jedes Einzelbild speichert“ um. Am zweiten sehen Sie, ob die Datei optimiert ist, denn ein gut gemachtes GIF speichert winzige Rechtecke und ein schlecht gemachtes jedes Mal das ganze Bild.
6. **Nehmen Sie den Bericht mit, wenn Sie ihn brauchen.** Die ganze Analyse als reiner Text, zum Einfügen in eine Nachricht oder zum Aufheben neben der Datei. Er entsteht auf der Seite aus dem, was ohnehin schon auf Ihrem Bildschirm steht.

## Die ausführliche Fassung

[Was wirklich in einem GIF steckt](https://abox.tools/de/ratgeber/was-steckt-in-einem-gif/): Einzelbilder, Verzögerungen, Aufräummethoden und Farbtabellen erklärt, warum Browser die schnellsten Verzögerungen verweigern, und wie Sie herausfinden, wohin die Dateigröße eines GIFs wirklich geht.

## Auch im Werkzeugkasten

- [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/): Aus einem Ordner voller Bilder ein Video machen.
- [Video-Schneider](https://abox.tools/de/video-schneiden/): Beim Abspielen markieren, was bleiben soll. Und alles davon als ein Video zurückbekommen.
- [Video-Zuschneider](https://abox.tools/de/video-zuschneiden/): Einen Clip auf den Teil zurechtschneiden, auf den es ankommt.
- [Video-Umkehrer](https://abox.tools/de/video-rueckwaerts-abspielen/): Das letzte Einzelbild zuerst, samt Ton.

## Fragen

### Wird mein GIF irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, entpackt und zeichnet die Datei auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Trennen Sie die Netzverbindung, und es analysiert weiter GIFs.

### Warum läuft mein GIF langsamer, als die Anzeigedauern sagen?

Weil jeder Browser sich weigert, eine Dauer unter zwei Hundertstelsekunden einzuhalten, und das Einzelbild stattdessen eine Zehntelsekunde stehen lässt. Diese Regel wurde 1996 in Netscape geschrieben, für die rotierenden Globen und Baustellenschilder jener Zeit, und seither in jeden Browser übernommen. Entfernt hat sie nie jemand. \
\
Ein GIF, dessen Einzelbilder alle 0,01 s angeben, läuft also nicht mit 100 Bildern je Sekunde, sondern mit 10, und damit fünf- bis zehnmal langsamer, als das erzeugende Programm es vorhatte. Diese Seite zeigt beide Zahlen, also was die Datei sagt und was sie wirklich tut, und markiert die betroffenen Einzelbilder. Der Ausweg liegt im Programm, das die Datei geschrieben hat: 0,02 statt 0,01 schreiben.

### Was bedeutet „Entsorgung“?

Was auf dem Bildschirm stehen bleibt, wenn die Zeit eines Einzelbildes abgelaufen ist. Dieses Feld entscheidet darüber, ob eine Animation richtig aussieht oder schmiert. \
\
**Stehen lassen** heißt, das nächste Einzelbild malt darüber, und das will man, wenn die Einzelbilder deckend sind und einander verdecken. **Auf den Hintergrund zurücksetzen** wischt zuerst das Rechteck des Einzelbildes frei, und genau das braucht Transparenz. Ohne das zeigen die durchsichtigen Stellen des nächsten Einzelbildes das vorherige darunter. **Wiederherstellen, was darunter war** legt zurück, was vor diesem Einzelbild dort stand, und so wird ein kleines bewegtes Objekt vor ruhigem Hintergrund gespeichert. Und **nicht angegeben** heißt, die Datei hat nichts dazu gesagt; jedes Anzeigeprogramm behandelt das als „stehen lassen“.

### Warum ist mein GIF so groß?

Die Tabelle „Wohin die Bytes gegangen sind“ beantwortet das für Ihre konkrete Datei statt im Allgemeinen, und es gibt nur wenige mögliche Antworten. \
\
Steckt fast alles in **komprimierten Pixeln**, ist die Datei schlicht viel Bild. Ein GIF speichert jedes Einzelbild als vollständige Pixel, ohne Bewegungsausgleich und ohne Qualitätsregler, die Größe ist also ungefähr die Fläche mal die Zahl der Einzelbilder. Weniger Einzelbilder, kleinere Maße oder weniger Farben sind die einzigen Hebel. \
\
Steckt ein großer Teil in **Farbtabellen**, schreibt die Datei je Einzelbild eine eigene Palette zu je 768 Byte. Steckt ein großer Teil in **Metadaten**, hat ein Bearbeitungsprogramm ein XMP-Paket hinterlassen, und das lässt sich entfernen, ohne das Bild anzurühren. Und wenn alle Einzelbilder die ganze Leinwand bedecken, hat der Kodierer nie herausgearbeitet, welcher Teil sich wirklich geändert hat. Bei allem Gefilmten oder Aufgezeichneten ist das der größte Teil der Datei.

### Was ist der Unterschied zwischen den beiden Ansichten?

**Die Leinwand nach jedem Einzelbild** ist das, was ein Anzeigeprogramm in diesem Moment zeigt: dieses Einzelbild über allem, was die vorherigen hinterlassen haben. **Nur, was jedes Einzelbild speichert** ist das Rechteck, das die Datei für dieses Einzelbild wirklich enthält, für sich allein und ohne etwas darunter. \
\
Interessant ist das zweite. Ein GIF darf ein Einzelbild als nur den veränderten Teil des Bildes speichern, und deshalb kann eine Bildschirmaufnahme eines weitgehend stillen Fensters klein sein. Ist in Ihrer Datei jedes Einzelbild die volle Leinwand, hat diese Arbeit niemand geleistet. Ansehen kann man der Animation das nicht, man muss nachsehen, was gespeichert ist.

### Es sagt, in meiner Datei stehe ein Kommentar oder XMP. Was ist das?

Text, der neben dem Bild mitreist und den kein Anzeigeprogramm zeichnet. Ein Kommentarblock ist meist der Name des Programms, das die Datei geschrieben hat. Ein XMP-Paket ist das XML, in dem ein Bildbearbeitungsprogramm festhält, was es getan hat, und es kann den Bearbeitungsverlauf, die Programmversion und manchmal den Namen des Autors enthalten. \
\
Diese Seite druckt beides vollständig aus, denn die interessante Frage bei Metadaten ist, was darin steht, und nicht, dass es sie gibt. Zu sehen bekommen es Sie, und sonst niemand: Nichts in diesem Repository liest davon etwas an irgendwen aus.

### Öffnet es auch ein beschädigtes GIF?

Es versucht es und sagt Ihnen, wo es aufgegeben hat. Eine Datei, die mitten in einem Block endet, an der Stelle einer Blockmarke ein anderes Byte hat oder ein Einzelbild trägt, dessen komprimierte Daten vorzeitig ausgehen, zeigt trotzdem alles, was bis dahin lesbar war, mit dem Problem obenan benannt. Genau dafür will man eine Analyse am dringendsten, deshalb wäre es falsch, wegen eines schlechten Bytes die ganze Datei wegzuwerfen.

### Verändert es meine Datei?

Nein. Dieses Werkzeug liest nur. Es gibt keine Ausgabedatei, keine Neukodierung und keinen Knopf, der ein GIF schreibt. Herunterladen können Sie einzig eine Textfassung der Analyse. Ihr Original liegt unangetastet auf Ihrer Festplatte, was zugleich die ehrliche Antwort darauf ist, was passiert, wenn Sie den Tab schließen.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Für die Dateigröße gibt es keine Grenze außer dem Arbeitsspeicher Ihres Geräts. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Datei übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihr GIF zum Analysieren wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihr GIF hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Datei eingesammelt werden könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen. Früher stand hier `connect-src 'none'`, was keine Ausnahme kannte. Die Werbung hat das gekostet, und das gehört dazugesagt.
- **Der Leser sind vier Dateien in diesem Repository.** Nichts hier benutzt den GIF-Dekoder des Browsers, um herauszufinden, was in der Datei steht, denn der sagt nicht, wohin ein Byte gegangen ist. Also wird das Format von Hand gelesen: `src/gif.js` geht die Blöcke durch, `src/lzw.js` entpackt die Pixel, `src/frames.js` stapelt sie, und `src/budget.js` zählt die Teile wieder zusammen und prüft, ob sie die Größe der Datei ergeben.
- **Kommentare und Metadaten sehen Sie, und sonst niemand.** Ein GIF kann einen Kommentarblock enthalten, ein XMP-Paket, das eine Bearbeitung beschreibt, oder ein Farbprofil, und diese Seite druckt alles davon aus. Es steht vor Ihnen auf dem Bildschirm und geht sonst nirgendwo hin. In diesem Repository gibt es kein Analytics-Ereignis, das davon etwas mitträgt, und die Seite könnte es auch nicht senden, gäbe es eines.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihre Datei übergeben, weder die Datei noch ein Vorschaubild, ein Name, eine Größe, eine Anzahl von Einzelbildern oder ein Kommentar. Jede Zeile, die ein GIF liest, entpackt oder zeichnet, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihre Dateien bekommt er nichts. Es passiert nichts, solange Sie nicht klicken, und was Sie dann öffnen, ist die Seite von jemand anderem.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihr GIF zum Analysieren wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/gif.js` für den Blockleser, der die Datei durchgeht, `src/lzw.js` für den Entpacker und `src/budget.js` für die Byte-Rechnung. In keinem davon steht eine Zeile, die ins Netz greifen könnte.
