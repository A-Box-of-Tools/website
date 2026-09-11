# SVG zu Bild — einen Vektor in beliebiger Größe als PNG, JPEG oder WebP rastern

Nennen Sie die Größe. Ein Vektor hat keine eigene, die er verlieren könnte.

> Ein SVG im Browser in beliebiger Größe in ein PNG, JPEG oder WebP umwandeln. Nennen Sie die Breite, einen Faktor oder einen Rahmen; @2x- und @3x-Kopien gibt es dazu. Transparenz bleibt, nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/svg-in-png-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre SVG-Dateien werden **nie hochgeladen**. Es gibt keinen Server.

Gerastert wird von derselben Engine, die die Zeichnung eben auf Ihren Bildschirm gebracht hat. Ihre Datei wird von Ihrer Festplatte gelesen, ihr Wurzelelement schreiben hundert Zeilen in `src/svg.js`, die Sie lesen können, auf die von Ihnen verlangte Größe um, und dann landet sie auf einem Canvas, das Ihr Browser ohnehin mitbringt. Netzfunktionen hat dieses Werkzeug keine, weder zum Abrufen noch zum Senden. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Logo gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Funktioniert offline
- ✓ Quelloffen

## So wandeln Sie ein SVG in ein PNG um, ohne es hochzuladen

1. **Wählen Sie das SVG aus.** Ziehen Sie eines auf das Auswahlfeld, oder nehmen Sie einen ganzen Ordner und wandeln Sie alles in einem Durchgang um. Der Browser liest die Datei direkt von Ihrer Festplatte, und dabei geht nichts nach draußen. Jede Zeile sagt, für wie groß die Datei sich selbst hält, und sie sagt es anders, je nachdem, ob diese Größe aus ihrer `viewBox` stammt oder angenommen wurde, weil die Datei keine angibt.
2. **Sagen Sie, wie groß.** Ein Faktor der dateieigenen Größe ist die schnellste Antwort und für einen Stapel die richtige, denn jede Zeichnung wird von ihrem eigenen Ausgangspunkt aus skaliert, und ein Satz Symbole bleibt damit im Verhältnis. Sonst nennen Sie eine Breite, eine Höhe, die längste Seite oder einen Rahmen mit beiden Seiten. Eine große Zahl kostet hier nichts, anders als bei einer Fotografie, denn die Zeichnung wird in dieser Größe neu gezeichnet und nicht darauf gedehnt.
3. **Nehmen Sie die hochauflösenden Kopien dazu, wenn Sie sie brauchen.** Ein Telefon und ein Retina-Notebook zeichnen zwei oder drei Gerätepixel je CSS-Pixel, ein 200 Pixel großes Logo braucht also eine 400- oder 600-Pixel-Datei dahinter. Verlangen Sie `@2x` und `@3x`, kommen sie so benannt heraus, wie Xcode, Androids Werkzeuge und CSS `image-set()` es alle erwarten, und jede ist exakt das Zwei- oder Dreifache der ersten statt getrennt gerundet.
4. **Wählen Sie das Format und entscheiden Sie über die Transparenz.** Nehmen Sie PNG, solange Sie keinen Grund für etwas anderes haben. Es ist verlustfrei, es behält Transparenz, und flache Farbflächen komprimieren sich darin gut. JPEG hat überhaupt keine Transparenz, eine Hintergrundfarbe wird also gemalt, ob Sie eine wählen oder nicht, denn ohne sie käme jedes transparente Pixel schwarz heraus. WebP kann beides und macht die kleinere Datei, dafür lesen es Programme, die alt genug sind, gar nicht.
5. **Sehen Sie sich die Vorschau an, bevor Sie herunterladen.** Sie wird von demselben Code aus Ihrer Datei auf Ihrem Gerät gezeichnet, der auch die Datei schreibt. Zwei Dinge ändern sich, wenn eine Zeichnung zu Pixeln wird, und beide zeigen sich hier. Eine Haarlinie, die ein halbes Pixel breit war, wird grau, und Text wird in einer Schrift gezeichnet, die dieser Computer hat, und nicht in einer aus dem Netz geholten.
6. **Nehmen Sie die Dateien.** Ein Download je Datei, oder der ganze Stapel als ein einziges ZIP. Die Namen folgen dem SVG, aus dem sie kamen, mit `@2x` und `@3x` an den Kopien. Zwei Dateien, die denselben Namen bekommen hätten, werden nummeriert, statt dass eine die andere stillschweigend ersetzt.

## Die ausführliche Fassung

[So wandeln Sie ein SVG in der richtigen Größe in ein PNG um](https://abox.tools/de/ratgeber/svg-in-png-umwandeln/): Ein Vektor hat keine eigene Pixelgröße, die Zahl gehört also Ihnen. Woher sie für Bildschirm, App-Symbol und Drucker kommt und was sich ändert, sobald aus einer Zeichnung Pixel werden.

## Auch im Werkzeugkasten

- [Bild zu SVG](https://abox.tools/de/bild-in-svg-umwandeln/): Eine Form, eine Kontur. Zeigen Sie auf das, was nicht hineingehört.
- [Größenvergleich](https://abox.tools/de/groessenvergleich-erstellen/): Größen eintippen, Bild mitnehmen. Zum Zeichnen wird nichts verschickt.
- [Bildkompressor](https://abox.tools/de/bild-komprimieren/): Sie nennen die Größe. Den Rest rechnet es aus.
- [Bildskalierer](https://abox.tools/de/bildgroesse-aendern/): Größe nennen. Rahmen ziehen. Format wählen.

## Fragen

### Wird mein SVG irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest die Datei auf Ihrer eigenen Hardware, zeichnet sie mit derselben Engine auf ein Canvas, die jedes andere Bild rendert, das Sie sehen, und gibt sie als Download zurück. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns.

### In welcher Größe sollte ich ein SVG rastern?

In der, die das lesende Programm verlangt, multipliziert mit dem Pixelverhältnis des Bildschirms, auf dem es zu sehen sein wird. Ein Logo, das 200 CSS-Pixel einnimmt, braucht 400 für ein Retina-Notebook und 600 für ein neueres Telefon, und genau das sind hier die `@2x`- und `@3x`-Kopien. Für ein App-Symbol oder einen Store-Eintrag nennt der Store eine exakte Zahl, und die gilt. Hat Ihnen niemand etwas gesagt, sind 1024 auf der längsten Seite ein nützlicher Standard: groß genug für fast jeden Zweck und klein genug zum Verschicken.

### Verliert es Qualität, wenn ich es größer mache?

Nein, und das ist die eine Stelle, an der diese Antwort ehrlich nein lautet. Ein Vektor besteht aus Anweisungen statt aus Pixeln, der Browser zeichnet die Kurven also in jeder verlangten Größe neu. 4000 Pixel aus einem 24-Pixel-Symbol sind genauso scharf wie 24. Was nicht geht, ist der Weg zurück. Sobald es ein PNG ist, sind es Pixel wie überall sonst. Rastern Sie also gleich in der Größe, die Sie brauchen, statt das Ergebnis später zu skalieren.

### Mein SVG hat weder Breite noch Höhe. Welche Größe bekomme ich?

Die der `viewBox`, falls es eine gibt. Ihre Breite und Höhe sind zwar Benutzereinheiten und keine Pixel, aber sie sind die einzigen Zahlen in der Datei, und ein Browser behandelt sie als natürliche Größe der Zeichnung. Gibt es auch keine viewBox, schreibt die Seite *angenommen* neben die Zeile und nimmt ⁦300 × 150⁩, also das, womit ein `<img>` sie gezeichnet hätte. So oder so können Sie die gewünschte Größe nennen, und die Datei wird in dieser gezeichnet.

### Warum sieht der Text im PNG anders aus?

Weil die Schrift nicht im SVG steckt. Ein SVG, das Text zeichnet, nennt eine Schrift und überlässt es dem Gerät, sie zu finden. Eine Datei, die sich mit einem `@import` eine von Google Fonts holt, bekommt hier nichts, denn ein durch ein `<img>` gezeichnetes SVG darf nichts abrufen. Das ist dieselbe Regel, die es daran hindert, mit Ihrer Datei nach Hause zu telefonieren. Die Lösung kennt jeder Gestalter ohnehin: Wandeln Sie den Text im Zeichenprogramm vor dem Export in Pfade um. Dann ist es Geometrie und sieht überall gleich aus.

### Kann es mehrere Dateien auf einmal umwandeln?

Ja. Jedes SVG auf der Liste wird mit denselben Einstellungen gerendert, und der Stapel kommt als ein ZIP herunter. Für einen Stapel ist meist ein Faktor die richtige Einstellung, also „4× die Größe, die die Datei verlangt“, weil jede Zeichnung von ihrer eigenen Größe aus skaliert wird, statt dass alle auf dieselbe Pixelzahl gezwungen werden. Klicken Sie eine beliebige Zeile an, um jene in die Vorschau zu holen.

### Gibt es eine Größengrenze?

Die des Browsers, nicht unsere. Ein Canvas gibt irgendwo jenseits von 16.384 Pixeln Seitenlänge auf, und Safari auf einem iPhone oder iPad hört bei etwa 16,7 Megapixeln Fläche auf, also bei ⁦4096 × 4096⁩. Darüber warnt die Seite, statt Ihnen ein leeres Bild zurückzugeben, und genau das tut ein Browser, wenn ihm die Luft ausgeht: `toBlob` gibt überhaupt nichts zurück, ohne eine Fehlermeldung, die sich erklärte. Jenseits von 100 Megapixeln weigert sich das Werkzeug ganz, denn das wären 400 MB Canvas, bevor ein einziges Byte kodiert ist.

### Was passiert mit der Transparenz?

Sie bleibt, in PNG und in WebP. JPEG hat überhaupt keinen Alphakanal, also wird eine Farbe hinter das ganze Bild gemalt, ob Sie darum bitten oder nicht. Ohne sie käme alles Transparente schwarz heraus, und das sieht nach einem Fehler aus statt nach JPEG. Bei PNG eine Hintergrundfarbe zu wählen ist ebenfalls ein völlig gewöhnlicher Wunsch, denn dann wird die Zeichnung auf diese Farbe heruntergerechnet, statt ein Loch zu lassen.

### Kann es ein SVG lesen, das ein Skript oder ein externes Bild enthält?

Lesen kann es eines, und es zeichnet genau die Teile, die ein Browser zu zeichnen bereit ist. Ein über ein `<img>` geladenes SVG steht im *secure static mode*. Skripte laufen nicht, externe Verweise werden nicht abgerufen, und Animation spielt nicht, Sie bekommen also das erste Einzelbild. Eine Datei mit einem entfernten `<image>` darin kommt daher ohne diesen Teil heraus. Da weigert sich der Browser an Ihrer Stelle, und deshalb kann diese Seite gefahrlos eine nie gesehene Datei öffnen.

### Worin unterscheidet sich das vom Bildskalierer?

In der Quelle. Der [Bildskalierer](https://abox.tools/de/bildgroesse-aendern/) beginnt bei Pixeln, also bei einem JPEG oder einem PNG, und muss beim Vergrößern Detail erfinden, das nie da war. Dieses hier beginnt bei einer Zeichnung, es gibt also nichts zu erfinden und keine erwähnenswerte Obergrenze. Haben Sie ein SVG, bringt Ihnen dieses Werkzeug ein scharfes Ergebnis. Haben Sie eine Fotografie, ist das andere zuständig.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Auch bei Anzahl und Größe der Dateien gibt es keine Grenze, denn es zahlt kein Server dafür. Die Arbeit passiert auf Ihrem eigenen Gerät. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Dateien übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Grafik zum Rendern wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Grafik hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien landen könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`. Der ganze Rasterer besteht aus einem `<img>`, das einen Blob Ihrer eigenen Datei hält, einem `drawImage` auf ein Canvas und einem `canvas.toBlob`.
- **Ein SVG ist ein Dokument, und hier steht es in dem Modus, in dem es nicht handeln kann.** Ein SVG kann ein `<script>`, ein entferntes `<image href="https://…">`, ein Stylesheet und eine Webschrift enthalten. Durch ein `<img>` gezeichnet, befindet es sich in dem, was die Spezifikation *secure static mode* nennt. Das Skript läuft nicht, und keine einzige dieser Adressen wird abgerufen. Das sichert der Browser zu, wir versprechen es nicht bloß, und deshalb kann diese Seite eine nie gesehene Datei öffnen, ohne dass die Datei nach Hause telefonieren könnte.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird irgendetwas über Ihre Zeichnung übergeben. Jede Zeile, die eine Datei liest, bemisst oder zeichnet, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/svg.js` dafür, wie die eigene Größe einer Datei gelesen und ihr Wurzelelement umgeschrieben wird, und `src/render.js` für die acht Zeilen, die das Rastern erledigen: ein <img>, ein `drawImage` und ein `toBlob`, und dazwischen nichts.
