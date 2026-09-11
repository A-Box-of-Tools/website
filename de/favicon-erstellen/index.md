# Bild zu ICO — Favicon, Windows- und macOS-Symbol erstellen

Ein Bild hinein. Jede Größe, die ein Browser, Windows oder ein Mac verlangt, heraus.

> Ein PNG, JPEG oder SVG im Browser in eine echte .ico mit mehreren Größen oder eine macOS-.icns umwandeln. Favicon, Windows-App-Symbol, Mac-App-Symbol, dazu die Apple- und Android-Dateien, die eine Website braucht. Nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/favicon-erstellen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Das Skalieren und die Symboldateien selbst entstehen beide in Ihrem eigenen Browser. Gezeichnet wird das Bild auf dem Canvas, das Ihr Browser ohnehin mitbringt, und jeden Container setzen aus diesen Pixeln ein paar hundert Zeilen in `src/ico.js` und `src/icns.js` zusammen, die Sie lesen können, die Windows-`.ico` ebenso wie die macOS-`.icns`. Netzfunktionen hat dieses Werkzeug keine, weder zum Abrufen noch zum Senden. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Logo gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Funktioniert offline
- ✓ Quelloffen

## So erstellen Sie eine .ico-Datei, ohne etwas hochzuladen

1. **Wählen Sie das Bild aus.** Ziehen Sie ein PNG, JPEG, WebP oder SVG auf das Auswahlfeld, oder nehmen Sie gleich mehrere und wandeln Sie sie in einem Durchgang um. Am einfachsten ist ein quadratisches Bild, und alles ab 256 Pixeln hat genug Detail für jede Größe. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Wählen Sie die Dateien, die Sie brauchen.** Windows und ein Browser lesen `.ico`, ein Mac liest `.icns` und sieht die andere gar nicht erst an. Setzen Sie das Häkchen bei einem von beiden, oder bei beiden, wenn das, was Sie bauen, auf beiden Systemen ausgeliefert wird. Eine Website will außerdem die zusätzlichen Apple-, Android- und Kachelbilder, und dafür gibt es das dritte Kästchen.
3. **Sagen Sie, wofür das Symbol ist.** Ein Website-Favicon sind 16, 32 und 48 Pixel. Eine Windows-Anwendung will zusätzlich 256, und eine Anwendung, die auf einem hochauflösenden Notebook gut aussehen muss, will die Zwischengrößen, die Windows bei 125 % und 150 % Skalierung verlangt. Wählen Sie das Passende, oder setzen Sie die Häkchen selbst. Jede Größe auf der Liste sagt Ihnen, wer sie verlangt. Bei der `.icns` haben Sie diese Wahl nicht, denn Apple benennt genau zehn Plätze, und alle zehn kommen hinein.
4. **Kümmern Sie sich um Form und Hintergrund.** Ein Symbol ist quadratisch, und die meisten Logos sind es nicht. Füllen Sie auf, bleibt das ganze Bild erhalten, mit Platz darüber und darunter. Schneiden Sie zu, wird die Mitte genommen. Dehnen Sie, wird es gestaucht. Transparenz bleibt Transparenz, solange Sie keine Farbe wählen, die dahinter sitzt.
5. **Sehen Sie sich das mit 16 Pixeln an, bevor Sie herunterladen.** In dieser Größe wird das Symbol am häufigsten zu sehen sein, und dort verschwinden dünne Striche und kleine Schrift. Jedes Quadrat in der Vorschau wird in seiner echten Größe aus Ihrer eigenen Datei gezeichnet. Ist das kleinste ein Fleck, hilft eine einfachere Zeichnung und keine andere Einstellung.
6. **Nehmen Sie die Dateien.** Eine .ico mit jeder Größe darin, benannt als `favicon.ico`, wenn Sie das verlangt haben, denn unter dieser Adresse suchen Browser danach. Eine .icns daneben, wenn Sie das Häkchen gesetzt haben, bereit für ein Mac-Anwendungspaket. Setzen Sie auch das Häkchen für den Website-Satz, kommen die Apple-, Android- und Windows-Kachelbilder dazu, dazu das Manifest und der HTML-Block zum Einfügen in Ihre Seite. Alles, was über eine einzelne Datei hinausgeht, kommt als ZIP herunter.

## Die ausführliche Fassung

[So erstellen Sie ein Favicon, das bei sechzehn Pixeln noch lesbar ist](https://abox.tools/de/ratgeber/favicon-selbst-erstellen/): Welche Größen eine favicon.ico wirklich braucht, welche zusätzlichen Dateien iPhone, Android und Mac verlangen und warum ein Logo, das auf einem Plakat wirkt, bei sechzehn Pixeln verschwindet.

## Auch im Werkzeugkasten

- [Bild als Data-URI](https://abox.tools/de/bild-als-base64/): Das ganze Bild als eine Zeile Text. Direkt in CSS oder HTML einfügen.
- [SVG zu Bild](https://abox.tools/de/svg-in-png-umwandeln/): Nennen Sie die Größe. Ein Vektor hat keine eigene, die er verlieren könnte.
- [Bild zu SVG](https://abox.tools/de/bild-in-svg-umwandeln/): Eine Form, eine Kontur. Zeigen Sie auf das, was nicht hineingehört.
- [Größenvergleich](https://abox.tools/de/groessenvergleich-erstellen/): Größen eintippen, Bild mitnehmen. Zum Zeichnen wird nichts verschickt.

## Fragen

### Wird mein Bild irgendwohin hochgeladen?

Nein. Ihr eigener Browser dekodiert und skaliert das Bild auf Ihrer eigenen Hardware, und die .ico setzt Code aus diesen Pixeln zusammen, den diese Seite selbst ausliefert. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns.

### Welche Größen sollte eine favicon.ico enthalten?

16, 32 und 48. Das ist keine Geschmacksfrage. 16 zeichnet ein Browser im Tab, 32 nutzt Windows für eine Desktop-Verknüpfung und nutzen mehrere Browser für ein Lesezeichen, und in 48 liest Google ein Seitensymbol. Alles Größere gehört als PNG neben die .ico statt hinein, und genau das erzeugt hier der Website-Satz.

### Welche Größen braucht ein Windows-Anwendungssymbol?

16, 32, 48 und 256, denn das enthält die Standard-app.ico von Visual Studio selbst. 16 ist die Titelleiste und die kleine Explorer-Ansicht, 32 der Desktop und die Taskleiste, 48 die mittleren Symbole des Explorers und 256 das Startmenü und die extragroße Ansicht. Auf einem hochauflösenden Bildschirm verlangt Windows außerdem 20, 24, 40, 64 und 96 und rechnet sie aus der nächstgelegenen vorhandenen Größe hoch, wenn sie fehlen. Die Voreinstellung „jede Skalierung“ legt sie gleich mit hinein.

### Warum ist die Datei größer als das Bild, mit dem ich angefangen habe?

Weil eine .ico nicht ein Bild ist, sondern mehrere, und weil die kleinen unkomprimiert gespeichert werden, damit alles sie lesen kann. Ein ⁦32×32⁩-Eintrag ist exakt 4.264 Byte groß, was auch so darin steht, und ein unkomprimierter ⁦256×256⁩-Eintrag bringt es auf 264 KB. Deshalb werden Größen über 64 standardmäßig als PNG gespeichert. „PNG für jede Größe“ ergibt die kleinstmögliche Datei, unkomprimiert für jede Größe die verträglichste.

### Was ist der Unterschied zwischen PNG- und unkomprimierten Einträgen?

Nur, wie die Pixel in der .ico gespeichert werden. Ein unkomprimierter Eintrag ist die ursprüngliche Windows-Anordnung, also ein Bitmap-Header, die Pixel auf dem Kopf und eine Ein-Bit-Transparenzmaske, und lesen kann ihn jede je erschienene Windows-Version. Ein PNG-Eintrag ist eine ganze PNG-Datei, im Symbol verstaut. Bei den großen Größen ist er drei- bis zehnmal kleiner, verstanden wird er allerdings erst ab Windows Vista. Die Voreinstellung nimmt jeweils das, was gewinnt: unkomprimiert bis 64 Pixel, darüber PNG.

### Kann es ein Symbol größer als 256 Pixel erzeugen?

Nein, und das kann nichts. Das Format speichert jede Seitenlänge in einem einzigen Byte, und die 0 ist bereits vergeben, sie bedeutet 256. Damit ist die Obergrenze erreicht, und eine .ico mit einem 512-Pixel-Bild darin ist kein größeres Symbol, sondern ein kaputtes. Brauchen Sie 512, brauchen Sie ein PNG, und genau das steckt im Website-Satz, für Android und für den Startbildschirm einer Web-App.

### Bleibt die Transparenz erhalten?

Ja, in beiden Eintragsarten. Zusätzlich wird die alte Ein-Bit-Maske neben den Alphakanal geschrieben, damit Software, die zu alt ist, das Alpha zu lesen, das Symbol trotzdem freistellt, statt einen schwarzen Kasten zu zeichnen. Absichtlich undurchsichtig gemacht wird genau eine Datei, nämlich das Apple-Touch-Symbol im Website-Satz. iOS legt es auf seine eigene Kachel und macht aus Transparenz Schwarz, also wird es vorher auf Ihre Hintergrundfarbe heruntergerechnet, standardmäßig auf Weiß.

### Mein Logo ist ein breiter Schriftzug. Was passiert damit?

Irgendetwas muss passieren, denn ein Symbol ist quadratisch. Auffüllen behält das Ganze und macht es klein, und ein in ein 16-Pixel-Quadrat aufgefüllter Schriftzug ist etwa drei Pixel hoch und damit unlesbar. Meist funktioniert es besser, auf die Mitte zuzuschneiden. Nehmen Sie das Zeichen aus der Wort-Bild-Marke heraus und benutzen Sie nur das, so wie es fast jede Marke für ihr Favicon tut. Was davon überlebt, zeigt Ihnen die Vorschau, bevor Sie irgendetwas herunterladen.

### Was ist im Website-Satz, und brauche ich das alles?

Sieben PNGs, ein Web-App-Manifest, eine browserconfig.xml und ein HTML-Block zum Einfügen. Brauchen tun Sie das, weil eine .ico Browser und Windows abdeckt und sonst nichts. Ein iPhone-Startbildschirm liest ein 180-Pixel-PNG unter einem eigenen Namen, Android und jede Installationsaufforderung lesen das Manifest, und eine ans Startmenü geheftete Kachel liest die XML. In eine .ico sieht keines davon hinein. Erzeugt wird alles hier, auf Ihrem Gerät, und im ZIP liegt eine Notiz, die sagt, wofür jede Datei da ist.

### Kann es auch ein macOS-Symbol erzeugen?

Ja. Setzen Sie das Häkchen bei *macOS-Symbol*, und Sie bekommen eine `.icns` neben der `.ico` oder auch an ihrer Stelle. Es ist ein anderer Container für dieselbe Idee, und keines der beiden Systeme liest den des anderen: Windows will .ico, ein Mac-Anwendungspaket will .icns. Die Größen sind dort keine Wahl, denn Apple veröffentlicht genau zehn Plätze, nämlich 16, 32, 64, 128, 256, 512 und 1024 Pixel, drei davon zweimal als Retina-Fassung der Größe darunter. Alle zehn kommen hinein, gezeichnet aus sieben Renderings, und deshalb ist eine .icns die größere Datei.

### Wie benutze ich die .icns-Datei?

Für eine Anwendung gehört sie im Paket nach `IhreApp.app/Contents/Resources/` und wird in `Info.plist` unter `CFBundleIconFile` benannt. Jedes Mac-Paketierwerkzeug hat ein Feld dafür. Für alles andere wählen Sie die Datei im Finder aus, drücken Command-C, öffnen dann „Informationen“ für den Ordner oder das Festplattenabbild, das Sie ändern wollen, klicken oben links auf das kleine Symbol und drücken Command-V.

### Ist die .icns dasselbe wie das, was iconutil erzeugt?

Es sind dieselben zehn Plätze mit denselben Vier-Buchstaben-Typen und PNG in jedem, und genau das erzeugt `iconutil` aus einem `.iconset`-Ordner. Einen Unterschied gibt es mit Absicht. Apples Werkzeug schreibt zusätzlich ein `TOC` -Element, einen Index der folgenden Typen und Längen. Das ist eine Optimierung und kein Teil des Formats, denn ein Leser ohne Index läuft die Elemente von vorn bis hinten ab und kommt zum selben Ergebnis. Ein falscher Index wäre schlimmer als gar keiner, also bleibt er weg.

### Kann ich mehrere Bilder auf einmal umwandeln?

Ja. Jedes Bild auf der Liste wird mit denselben Einstellungen zu seiner eigenen .ico, und der Stapel kommt als ein ZIP mit einem Ordner je Bild herunter. Sonst hießen zwei davon beide favicon.ico, und eines überschriebe das andere. Jede Ausgabe, bei der Sie das Häkchen gesetzt haben, wird für jedes Bild erzeugt. Klicken Sie eine beliebige Zeile an, um jenes Bild in die Vorschau zu holen.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Auch bei Anzahl und Größe der Dateien gibt es keine Grenze, denn es zahlt kein Server dafür. Die Arbeit passiert auf Ihrem eigenen Gerät. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Bilder übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihr Logo zum Umwandeln wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihr Logo hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien landen könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`. Skaliert wird mit einem `drawImage` auf ein Canvas, und jedes Symbol ist ein Header, den `src/ico.js` oder `src/icns.js` auf dieser Seite vor diese Pixel schreibt.
- **Die Datei wird aus ihren eigenen Bytes beschrieben.** Die Liste der Größen neben einem fertigen Symbol ist nicht die Liste der Größen, die Sie verlangt haben. Sie wird aus der eben geschriebenen Datei zurückgelesen, von `readIcoDirectory` beziehungsweise `readIcnsElements`. Wäre ein Schreiber je anderer Meinung als die Einstellungen, sagte die Seite das, statt Sie es erfahren zu lassen, wenn Windows nichts zeichnet und macOS ein leeres Blatt Papier zeigt.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird irgendetwas über Ihr Bild übergeben. Jede Zeile, die eine Datei liest, skaliert oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/ico.js` und `src/icns.js` für die beiden Symbolformate, also das Verzeichnis, die Einträge und die Maske im einen und Apples zehn benannte Plätze im anderen, sowie `src/sizes.js` dafür, woher jede Größe auf der Seite kommt.
