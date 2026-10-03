# So erstellen Sie ein Favicon, das bei sechzehn Pixeln noch lesbar ist

Ein Favicon ist kein kleines Bild Ihres Logos. Es ist ein ganzer Satz Bilder in festen Größen, verpackt in einen Behälter, den kaum jemand je öffnet, und ausgerechnet das kleinste davon bekommen alle zu sehen. Hier steht, welche Größen Sie brauchen, welche Dateien danebengehören und was zu tun ist, wenn Ihr Logo den Weg nach unten nicht übersteht.

[Bild zu ICO öffnen](https://abox.tools/de/favicon-erstellen/): Ein Bild hinein. Jede Größe, die ein Browser, Windows oder ein Mac verlangt, heraus.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie [Bild zu ICO](https://abox.tools/de/favicon-erstellen/), ziehen Sie ein quadratisches Bild von mindestens 256 Pixeln hinein, lassen Sie die Voreinstellung auf *Website-Favicon* und laden Sie `favicon.ico` herunter. Die Datei gehört in die Wurzel Ihrer Seite, damit sie unter `https://ihreseite.de/favicon.ico` antwortet. Nach genau dieser Adresse fragt jeder Browser von sich aus, ganz gleich, ob Ihr HTML sie erwähnt. Streng genommen sind Sie damit fertig.

Alles Weitere macht den Unterschied zwischen einem Symbol, das technisch vorhanden ist, und einem, das man auch lesen kann: welche Größen hineingehören, was iPhone und Android stattdessen verlangen und was zu tun ist, wenn Ihr Logo sechzehn Pixel Breite nicht übersteht.

## Warum es ein Satz Größen ist und kein einzelnes Bild

Eine `.ico`-Datei ist ein Behälter. Darin liegen mehrere vollständige Bilder derselben Sache in verschiedenen Größen, und wer immer die Datei liest, greift sich das Bild, das der benötigten Größe am nächsten kommt.

Das klingt nach Doppelarbeit, ist aber keine. Ein Browser, der Ihr Symbol mit sechzehn Pixeln zeichnet, hat zwei Möglichkeiten: eine Sechzehn-Pixel-Fassung nehmen, die Sie gezeichnet haben, oder eine größere an Ort und Stelle herunterrechnen. Die zweite ist schlechter, und zwar sichtbar. Automatisch verkleinert ergibt ein detailreiches Logo Brei, während eine Sechzehn-Pixel-Fassung, die Sie selbst angesehen haben, eine ist, die Sie vereinfachen konnten. Genau dafür hält das Format mehrere Größen bereit: um Ihnen diese Gelegenheit zu geben.

Für eine Website sind drei Größen üblich, und jede hat ihren Grund:

- **⁦16×16⁩**: Browser-Tab, Adressleiste, Lesezeichenmenü. Das ist die Größe, die die Leute wirklich sehen. Wenn nur eine gelingen soll, dann diese.
- **⁦32×32⁩**: die Lesezeichenleiste, eine Windows-Verknüpfung auf dem Desktop und die meisten Browser auf einem hochauflösenden Bildschirm, die das Tab-Symbol aus der 32er zeichnen und herunterskalieren.
- **⁦48×48⁩**: die Größe, in der Google ein Seitensymbol für die Suchergebnisse liest, und die Ansicht „Mittelgroße Symbole“ im Windows-Explorer.

Alles Größere gehört als PNG neben die `.ico` und nicht hinein. Warum, steht weiter unten bei den Dateien fürs Handy.

![Die Liste der Voreinstellungen mit den enthaltenen Größen: sechzehn, zweiunddreißig und achtundvierzig Pixel für ein Website-Symbol, darunter eine Übersicht des Dateiinhalts.](https://abox.tools/screens/make-a-favicon/preset.webp)

Eine .ico ist ein Behälter, und dies ist die Liste dessen, was hineinkommt. Die Voreinstellung ist eine Abkürzung für den Satz, den ein Browser tatsächlich anfragt.

## Das Sechzehn-Pixel-Problem

Davor warnt niemand. Sechzehn Pixel sind auf einem normalen Bildschirm etwa vier Millimeter: ein Raster aus 16 mal 16 Punkten, 256 Stück insgesamt. Fast nichts, was für ein Schild, eine Visitenkarte oder eine Website-Kopfzeile gezeichnet wurde, übersteht die Reise dorthin.

Was der Reihe nach verschwindet:

- **Text.** Ein Schriftzug, in ein Quadrat gestaucht, ist noch rund drei Pixel hoch. Daraus wird keine kleine Schrift, daraus wird ein grauer Balken. Deshalb nimmt fast jede Firma, die neben dem Namen auch ein Zeichen hat, fürs Favicon das Zeichen allein, und deshalb nehmen die ohne Zeichen einen einzelnen Buchstaben.
- **Dünne Linien.** Ein ein Pixel breiter Rahmen an einem 512-Pixel-Logo ist bei sechzehn Pixeln ein Zweiunddreißigstel Pixel breit. Er kommt als blasser grauer Schleier entlang der Kante heraus, oder gar nicht.
- **Verläufe und Schatten.** Für einen Übergang ist kein Platz. Aus einem weichen Schlagschatten wird ein schmutziger Saum.
- **Detail im Detail.** Aus dem Symbol eines beschriebenen Dokuments wird ein Rechteck mit einem Fleck darin.

Abhilfe schafft keine Einstellung, sondern eine andere Zeichnung: ein vereinfachtes Zeichen mit ein, zwei Formen, hohem Kontrast und keinem Text über einen einzelnen Buchstaben hinaus. Zeichnen Sie diese Fassung bewusst bei 32 oder 48 Pixeln und nehmen Sie sie als Vorlage.

Was ein Werkzeug tun kann, ist, Ihnen das Problem vor der Veröffentlichung zu zeigen. Die Vorschau in [Bild zu ICO](https://abox.tools/de/favicon-erstellen/) zeichnet jede Größe in ihrer echten Größe auf den Bildschirm, und nur so lässt sich das beurteilen. Ein Sechzehn-Pixel-Symbol, mit vierundsechzig dargestellt, sieht prima aus und sagt Ihnen nichts.

![Ein Vorschaustreifen mit derselben Marke bei sechzehn, zweiunddreißig, achtundvierzig, vierundsechzig und einhundertachtundzwanzig Pixeln.](https://abox.tools/screens/make-a-favicon/sizes.webp)

Die Sechzehn-Pixel-Fassung, neben der, die Sie entworfen haben. Dieses Bild entscheidet, ob die Marke vereinfacht werden musste.

## Ihr Logo ist nicht quadratisch: auffüllen oder zuschneiden?

Ein Symbol ist immer quadratisch, die meisten Logos sind es nicht, also muss etwas geschehen. Es gibt drei Antworten, und sie taugen nicht gleich viel.

**Auffüllen** behält das ganze Bild und setzt Platz darüber und darunter. Das ist die sichere Voreinstellung und die falsche Wahl für einen breiten Schriftzug. Was dreimal so breit wie hoch ist, nimmt in einem Quadrat ein Drittel der Höhe ein, bei sechzehn Pixeln also fünf Pixel Logo und elf Pixel nichts.

**Auf die Mitte zuschneiden** nimmt das größte Quadrat aus der Bildmitte. Bei einer Wort-Bild-Marke, also einem Zeichen mit dem Firmennamen daneben, geht der Schnitt gern quer durch beides. Besser, Sie schneiden die Vorlage vorher selbst auf das Zeichen allein zu und wandeln dann das um.

**Dehnen** staucht das Bild, bis es passt. Kaum eine Lage gibt es, in der das richtig wäre. Angeboten wird es vor allem deshalb, damit das Werkzeug es nicht klammheimlich von sich aus tut.

Die allgemeine Antwort für ein breites Logo lautet: Wandeln Sie nicht das Logo um, sondern den Teil davon, der für sich allein funktioniert.

## Transparent oder mit Volltonhintergrund?

Für eine Website ist transparent meist richtig. Browser-Tabs sind grau, weiß oder fast schwarz, je nach Browser und Farbschema, und ein transparentes Symbol sitzt auf allen dreien. Ein Symbol mit hineingemaltem weißem Hintergrund ist in einer dunklen Tableiste schlicht ein weißes Rechteck.

Zwei Ausnahmen sollten Sie kennen:

- **Ein Logo, das nur dunkel ist**, verschwindet im dunklen Modus. Ist Ihr Zeichen von Haus aus schwarz auf weiß, geben Sie ihm einen farbigen Hintergrund statt eines transparenten, oder eine helle Kontur.
- **Das Apple-Touch-Symbol muss deckend sein.** iOS zeichnet es auf seine eigene abgerundete Kachel und macht aus Transparenz Schwarz. Jedes Werkzeug, das diese Datei erzeugt, sollte sie für Sie auf einen Untergrund reduzieren. Dieses hier tut es, standardmäßig auf Weiß.

## Die Dateien, die eine Website neben der .ico braucht

`favicon.ico` deckt Browser und Windows ab. Handys deckt sie nicht ab, und genau hier hören die meisten selbst gebauten Symbolsätze zu früh auf. Drei weitere Plattformen verlangen eigene Dateien unter eigenen Namen, und keine davon sieht in eine `.ico` hinein:

- **iOS** liest `apple-touch-icon.png` mit ⁦180×180⁩, sobald jemand Ihre Seite auf den Home-Bildschirm legt. Fehlt sie, nimmt iOS einen Bildschirmausschnitt der Seite, und das sieht nach Versehen aus.
- **Android und jede Installationsaufforderung** lesen ein Web-App-Manifest, `site.webmanifest`, das auf PNGs mit 192 und 512 Pixeln zeigt. Die 512er ist zugleich das Bild, das eine Web-App auf ihrem Splashscreen zeigt.
- **Eine Kachel im Windows-Startmenü** liest `browserconfig.xml`, die auf ein PNG mit ⁦150×150⁩ zeigt. Von den dreien die unwichtigste, und vier Zeilen XML.

Eine Sache geht dabei besonders leicht schief: Android-Launcher schneiden ein adaptives Symbol auf die Form zu, die dem Handy gefällt, also auf einen Kreis, ein Squircle oder ein abgerundetes Quadrat, und garantiert überleben nur die mittleren 80 % des Bildes. Ein Symbol, das bis an die Kanten gezeichnet ist, verliert seine Ecken. Genau darum geht es bei einem *maskierbaren* Symbol: dasselbe Bild, bewusst klein ins Quadrat gesetzt und im Manifest gesondert deklariert.

Das Häkchen beim Website-Satz in [Bild zu ICO](https://abox.tools/de/favicon-erstellen/) erzeugt all das, dazu das Manifest und den HTML-Block, der darauf verweist. Was dieser Block absichtlich weglässt, ist ein `<link>` auf `favicon.ico`. Diese Adresse fragen Browser ohnehin von selbst ab, und sie zusätzlich zu nennen führt nur dazu, dass dieselbe Datei zweimal geholt wird.

## Ein Windows-Programmsymbol ist ein anderer Satz

Geht es um ein Programm statt um eine Website, ändern sich die Größen. In der Standard-`app.ico` von Visual Studio stecken 16, 32, 48 und 256, also die drei Shell-Größen plus die große, aus der sich das Startmenü und die Explorer-Ansicht „Extra große Symbole“ bedienen.

Auf einem hochauflösenden Bildschirm verlangt Windows zusätzlich 20, 24, 40, 64 und 96 und rechnet sie, wenn sie fehlen, aus der nächstliegenden vorhandenen Größe hoch. Ob das auffällt, hängt an Ihrem Symbol. Eine flache Form übersteht das Hochrechnen, eine detailreiche nicht. Alle fünf mitzunehmen verdoppelt die Datei ungefähr, und bei einem Programm ist das vollkommen belanglos. Beim Favicon, das jeder einzelne Besucher lädt, sieht die Rechnung ganz anders aus.

Noch ein Wort zur Größe: Im 256er-Eintrag stecken die Bytes. Unkomprimiert gespeichert ist er allein 264 KB groß, als PNG im Symbol abgelegt meist unter 30. PNG-Einträge sind seit Windows Vista lesbar. Sie zu meiden lohnt also nur wegen Software, die tatsächlich älter ist, oder wegen eines Installers oder eingebetteten Werkzeugs, das Symbole selbst zerlegt.

## Ein Mac liest eine ganz andere Datei

Geht es um ein Mac-Programm statt um ein Windows-Programm, gilt nichts vom Vorstehenden. Eine `.ico` liest macOS überhaupt nicht, es liest `.icns`, also dieselbe Idee in anderer Verpackung, mehrere Größen in einem Behälter, mit drei bemerkenswerten Unterschieden.

- **Die Größen liegen fest.** Apple veröffentlicht zehn Plätze, und zu wählen gibt es nichts. Es sind 16, 32, 64, 128, 256, 512 und 1024 Pixel, wobei 32, 256 und 512 zweimal vorkommen, weil jede zugleich eine eigene Größe und die Retina-Fassung der Größe darunter ist.
- **Es geht bis 1024.** Eine `.ico` hört bei 256 auf, und deshalb ist eine Mac-Symboldatei mehrere hundert Kilobyte groß und ein Favicon fünfzehn. Bei einem Programm, das einmal ausgeliefert wird, spielt das keine Rolle. Nur das Favicon holt sich jeder Besucher.
- **1024 Pixel muss Ihre Grafik aushalten.** Die beiden Probleme sind die entgegengesetzten Enden desselben Bildes. Ein Favicon muss winzig funktionieren, ein Mac-Symbol riesig standhalten. Ein bei 512 exportiertes und auf 1024 aufgeblasenes Logo wirkt auf einem Retina-Bildschirm weich, und der App Store nimmt es nicht.

Zur Verwendung: Ein Programmpaket bewahrt die Datei unter `IhreApp.app/Contents/Resources/` auf und benennt sie in `Info.plist`. Für einen Ordner oder ein Festplattenabbild markieren Sie die `.icns` im Finder, drücken Command-C, rufen dann für das gewünschte Objekt „Informationen“ auf, klicken oben links auf das kleine Symbol und drücken Command-V.

Das Häkchen bei *macOS-Symbol* in [Bild zu ICO](https://abox.tools/de/favicon-erstellen/) schreibt eine solche Datei, mit oder ohne die Windows-Datei daneben. Was auf beiden Plattformen erscheint, braucht beide, und beide entstehen im selben Durchgang aus demselben Bild.

## Nachsehen, ob es geklappt hat

Favicons halten Browser hartnäckiger im Zwischenspeicher als fast alles andere. „Ich habe es hochgeladen, und nichts hat sich geändert“ ist deshalb meistens ein Cache und kein Fehler. Zwei Dinge, bevor Sie wieder anfangen, Dateien zu bearbeiten:

- Rufen Sie `https://ihreseite.de/favicon.ico` direkt auf. Lädt die Datei herunter, ist sie da und Sie sehen einen Cache. Kommt ein 404, liegt sie nicht in der Wurzel.
- Öffnen Sie die Seite in einem privaten Fenster; das hat meist seinen eigenen Symbol-Cache.

Unter Windows prüfen Sie eine `.ico`, indem Sie sie in einen Ordner legen und den Explorer durch seine Ansichten schalten. Kleine, Mittelgroße, Große und Extra große Symbole zeichnen jeweils einen anderen Eintrag aus derselben Datei, Sie sehen also jeden so, wie das System ihn sieht.

Auf dem Mac öffnet sich eine `.icns` in der Vorschau, die jeden Platz seitlich auflistet. Derselbe Trick geht im Finder: Datei in einen Ordner legen und in den Darstellungsoptionen den Größenregler ziehen, um zu sehen, wie zwischen den Bildern darin gewechselt wird.

## Nichts davon braucht einen Upload

Ein Bild zu skalieren tut jeder Browser seit Jahren, und eine `.ico` besteht aus einem Header von sechs Byte, sechzehn Byte je Bild und dann den Bildern. In ihrer Herstellung gibt es keinen Schritt, der nach einem Server verlangte, und das Werkzeug hier benutzt keinen. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns.

Hier lohnt es sich, darauf zu achten, mehr noch als sonst. Was jemand einem kostenlosen Favicon-Generator übergibt, ist ziemlich oft eine Marke, die noch gar nicht vorgestellt wurde. Das Symbol gehört zum Ersten, was gemacht wird, und zum Letzten, was angekündigt wird. Wer lieber prüft als glaubt, lädt die Seite, trennt die Internetverbindung und erzeugt trotzdem eines. Drei weitere Proben, die Sie an jedem Werkzeug durchführen können, stehen in [Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)
