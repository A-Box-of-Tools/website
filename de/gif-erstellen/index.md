# GIF erstellen — aus Bildern ein animiertes GIF

Aus einer Reihe von Bildern eine Animation machen.

> JPG-, PNG- oder WebP-Bilder in ein animiertes GIF verwandeln, kostenlos und vollständig im Browser. Reihenfolge, Tempo und Größe bestimmen Sie. Es wird nichts hochgeladen, und es geht auch offline.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/gif-erstellen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Jedes Einzelbild wird von Ihrem eigenen Browser gezeichnet, auf eine Farbtabelle reduziert und komprimiert, und das fertige GIF entsteht im Arbeitsspeicher dieses Geräts. Am anderen Ende dieser Seite steht gar kein Server, an den ein Bild gehen könnte, selbst wenn hier irgendetwas das wollte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So machen Sie aus Bildern ein GIF

1. **Wählen Sie Ihre Bilder aus.** Ziehen Sie einen Ordner auf das Auswahlfeld oder suchen Sie die Dateien von Hand heraus. Der Browser liest sie direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Bringen Sie sie in die Abspielreihenfolge.** Ziehen Sie am Griff oder nehmen Sie die Pfeile. „Nach Name sortieren“ zählt so, wie man es erwartet, `frame_2` landet also vor `frame_10`.
3. **Legen Sie fest, wie lange jedes Einzelbild steht.** Eine halbe Sekunde je Bild ist eine Diaschau, eine Zwanzigstelsekunde ist Animation. Geben Sie allen auf einmal dieselbe Standzeit, oder lassen Sie eines länger stehen.
4. **Wählen Sie eine Größe und die Art der Farbwahl.** Ein GIF wächst mit seiner Fläche und der Zahl seiner Einzelbilder, und es gibt keinen Qualitätsregler, der das wieder einfängt. Die Größe ist deshalb die wichtigste Einstellung. 256 Farben je Einzelbild sehen am besten aus und sind die Voreinstellung; eine gemeinsame Farbtabelle ist kleiner und ruhiger.
5. **GIF erstellen und herunterladen.** Gebaut wird es auf Ihrer eigenen Hardware. Wie lange das dauert, hängt daher von Ihrem Gerät ab und nicht von einer Warteschlange. Die fertige Animation läuft auf der Seite, bevor Sie sie speichern.

## Die ausführliche Fassung

[Aus Bildern ein animiertes GIF machen](https://abox.tools/de/ratgeber/aus-bildern-ein-gif-machen/): Aus einer Reihe Bilder ein animiertes GIF: wie schnell ein GIF wirklich laufen kann, was die Paletteneinstellung ändert, und die drei Dinge, die die Datei tatsächlich kleiner machen.

## Auch im Werkzeugkasten

- [GIF-Zerleger](https://abox.tools/de/gif-in-einzelbilder-zerlegen/): Jedes Einzelbild einzeln als PNG heraus.
- [GIF-Analyse](https://abox.tools/de/gif-analysieren/): Einzelbilder, Anzeigedauern, Farbtabellen und wohin jedes Byte gegangen ist.
- [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/): Aus einem Ordner voller Bilder ein Video machen.
- [Video-Schneider](https://abox.tools/de/video-schneiden/): Beim Abspielen markieren, was bleiben soll. Und alles davon als ein Video zurückbekommen.

## Fragen

### Werden meine Bilder irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, zeichnet, reduziert und komprimiert sie auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Trennen Sie die Netzverbindung, und es macht weiter GIFs.

### Welche Bildformate kann ich verwenden?

Jedes Standbildformat, das Ihr Browser dekodieren kann, in der Praxis also JPG, PNG, WebP, GIF, AVIF und auf Apple-Geräten HEIC. Eine eigene Liste, die hier gepflegt werden müsste, gibt es nicht, denn das Dekodieren ist Sache des Browsers und nicht unsere.

### Warum ist mein GIF so groß?

Weil ein GIF jedes Einzelbild als vollständige Pixel speichert. Es gibt keinen Bewegungsausgleich, nichts wird als „wie eben, nur verschoben“ abgelegt, und einen Qualitätsregler gibt es auch nicht. Die Größe ist ungefähr die Fläche mal die Zahl der Einzelbilder, und nur drei Dinge drücken sie. \
\
Machen Sie es kleiner: Halbe Maße sind ein Viertel Datei. Nehmen Sie weniger Einzelbilder oder lassen Sie jedes länger stehen. Gehen Sie auf 64 oder 32 Farben herunter und schalten Sie das Rastern ab, was bei flächiger Grafik weniger kostet, als es klingt, und bei Fotos sehr viel. Wenn es dann immer noch nicht passt, ist die ehrliche Antwort: Was Sie da bauen, ist ein Video, und ein MP4 davon ist vielleicht ein Zehntel so groß.

### Wie schnell kann ein GIF laufen?

Nicht so schnell, wie die Zahl vermuten lässt. Das Format speichert die Dauer jedes Einzelbildes in Hundertstelsekunden, und Browser heben alles unter zwei davon seit den Neunzigern auf eine Zehntelsekunde an. Diese Regel wurde für die rotierenden Globen jener Zeit geschrieben und nie wieder entfernt. Eine Dauer von 0,01 s läuft also nicht mit 100 Bildern je Sekunde, sondern mit 10. Deshalb bietet dieses Werkzeug nichts unter 0,02 s an, und 0,05 s, also 20 Bilder je Sekunde, ist ungefähr so schnell, wie zu verlangen sich lohnt.

### Was ändert die Einstellung zur Farbtabelle?

Ein GIF-Einzelbild hält höchstens 256 Farben, und irgendjemand muss sie auswählen. \
\
**Beste Farben für jedes Einzelbild** sucht für jedes Bild eigene 256 aus. Das sieht am schärfsten aus und ist bei einer Reihe unabhängiger Fotos die richtige Antwort. **Eine Farbtabelle für das ganze GIF** baut eine einzige Tabelle aus allen Einzelbildern zusammen. Das ergibt eine kleinere Datei und verhindert das Flackern, das entsteht, wenn die Farbtabelle zwischen Einzelbildern derselben Szene springt. Danach greift man also, wenn die Einzelbilder eine Folge sind und keine Sammlung.

### Kann ich einen transparenten Hintergrund behalten?

Ja, wenn Ihre Bilder einen haben: Stellen Sie „Transparenz“ auf „Transparente Flächen behalten“. Eines sollten Sie vorher wissen. GIF-Transparenz ist ein einziges Bit, ein Pixel ist also entweder unsichtbar oder voll gemalt und dazwischen gibt es nichts. Kantengeglättete Ränder, weiche Schatten und alles Verlaufende bekommen dadurch eine harte Kante. Wenn Ihre Animation auf einen Hintergrund kommt, dessen Farbe Sie kennen, sieht es besser aus, sie auf diese Farbe zu legen.

### Gibt es eine Grenze, wie viele Bilder ich nehmen kann?

Im Werkzeug ist keine Grenze eingebaut. Die praktische Obergrenze sind der Arbeitsspeicher Ihres Geräts und Ihre Geduld mit der Datei, die dabei herauskommt. Die Bilder werden eines nach dem anderen gelesen, hundert Einzelbilder sind also kein Problem, hundert Einzelbilder mit 640 px sind aber auch ein sehr großes GIF. Siehe oben, „Warum ist mein GIF so groß?“

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Auf dem Ergebnis liegt auch kein Wasserzeichen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Bilder übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Bilder zum Verarbeiten wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Bilder haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien eingesammelt werden könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen. Früher stand hier `connect-src 'none'`, was keine Ausnahme kannte. Die Werbung hat das gekostet, und das gehört dazugesagt.
- **Der Kodierer sind vier Dateien in diesem Repository.** Ein GIF braucht eine Farbreduktion und einen LZW-Kompressor, und der Browser bringt beides nicht mit. Also stehen beide hier ausgeschrieben, in `src/quantize.js` und `src/lzw.js`, mit dem Container in `src/gif.js`. Um eines zu machen, wird nichts nachgeladen, und beim ersten Gebrauch wird auch keine Engine heruntergeladen.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihre Bilder übergeben, weder eine Datei noch ein Vorschaubild, ein Name, eine Größe oder eine Anzahl. Jede Zeile, die ein Bild liest, dekodiert, zeichnet oder komprimiert, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihre Bilder bekommt er nichts. Es passiert nichts, solange Sie nicht klicken, und was Sie dann öffnen, ist die Seite von jemand anderem.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihre Bilder zum Zusammenbauen wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/quantize.js` für die Farbtabelle, auf die jedes Einzelbild reduziert wird, sowie `src/lzw.js` und `src/gif.js` für den Kompressor und die Datei, in die er schreibt. In keinem davon steht eine Zeile, die ins Netz greifen könnte.
