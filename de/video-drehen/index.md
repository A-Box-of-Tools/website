# Video drehen — für den Clip, der quer gefilmt wurde

Eine Vierteldrehung, eine halbe Drehung, in die andere Richtung. In den Header der Datei geschrieben, sodass kein einziges Einzelbild dekodiert wird und nichts verloren geht.

> Ein quer oder kopfüber gefilmtes Video im Browser um eine Viertel- oder halbe Drehung drehen. Die Drehung wird in den Header der Datei geschrieben, sodass kein Einzelbild neu kodiert wird und nichts verloren geht; oder sie wird für alte Player ins Bild eingebrannt. MP4, MOV, WebM und MKV hinein, MP4 heraus. Nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/video-drehen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Videos werden **nie hochgeladen**. Es gibt keinen Server.

Das Video, das Sie auswählen, wird von Code, der von dieser Adresse ausgeliefert wird, gelesen, mit einem neuen Header versehen und im Arbeitsspeicher dieses Geräts neu geschrieben; soll die Drehung ins Bild eingebrannt werden, zeichnen die Codecs Ihres eigenen Browsers. Einen Upload kann hier nichts auslösen, und am anderen Ende dieser Seite steht kein Server, der einen entgegennehmen könnte. Kein Gigabyte geht hinauf, um gedreht zurückzukommen.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So drehen Sie ein Video

1. **Wählen Sie das Video aus.** Eine Datei auf einmal: MP4, MOV, M4V, WebM oder MKV. Der Browser liest sie direkt von Ihrer Festplatte, und die Seite sagt, was sie ist und in welcher Lage sie derzeit angezeigt wird.
2. **Wählen Sie die Drehung, und sehen Sie sich die Vorschau an.** Eine Vierteldrehung nach rechts, eine Vierteldrehung nach links, oder auf den Kopf. Das erste Einzelbild wird so gedreht gezeichnet, wie gewählt, und zwar mit derselben Rechnung, die auch die Datei tragen wird. Was Sie sehen, ist also das, was ein Player tun wird. Setzen Sie das Häkchen bei „Einbrennen“ nur, wenn ein Player Ihnen den Clip quer gezeigt hat; lassen Sie den Ton weg, wenn der Clip lieber stumm sein soll.
3. **Drehen Sie es, und lesen Sie die Zeile, die sagt, dass es geprüft wurde.** Der Header wird geschrieben und jedes Einzelbild übernommen, das dauert Sekunden; ein Einbrennen dauert so lange wie eine Kodierung, mit einem Balken, der sagt, wo es steht. Dann wird die fertige Datei hier erneut geöffnet und muss so lang sein wie vorher, so angezeigt werden, wie Sie es verlangt haben, und ihren Ton tragen. Sie wird unter dem Download aus dem Arbeitsspeicher abgespielt, damit Sie sie richtig herum sehen.

## Die ausführliche Fassung

[How to rotate a video without losing quality](https://abox.tools/de/guides/rotate-a-video/): Why a phone clip plays sideways, what the nine numbers in its header do, why most rotators re-encode for nothing, when to bake the turn in instead, and how to turn a video in your browser without uploading it.

## Auch im Werkzeugkasten

- [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/): Aus einem Ordner voller Bilder ein Video machen.
- [Video-Schneider](https://abox.tools/de/video-schneiden/): Beim Abspielen markieren, was bleiben soll. Und alles davon als ein Video zurückbekommen.
- [Video-Zuschneider](https://abox.tools/de/video-zuschneiden/): Einen Clip auf den Teil zurechtschneiden, auf den es ankommt.
- [Video-Umkehrer](https://abox.tools/de/video-rueckwaerts-abspielen/): Das letzte Einzelbild zuerst, samt Ton.

## Fragen

### Kostet das Drehen Qualität?

Nein, auf dem normalen Weg nicht. Die Drehung wird in den Header der Datei geschrieben, und jedes Einzelbild wird Byte für Byte übernommen, das Bild ist also genau, was es war, und die Datei fast genau so groß, wie sie war. Nur „Einbrennen“ kodiert neu, und die Seite sagt das, bevor Sie das Häkchen setzen. Ein Rotator, der standardmäßig neu kodiert, und das tun die meisten im Netz, macht eine Neukodierung für eine Aufgabe, die neun Zahlen brauchte.

### Warum sieht die Datei in einem Player immer noch quer aus?

Weil dieser Player die Anzeigematrix ignoriert. Jedes Handy, jeder Browser, jeder moderne Player und jedes Schnittprogramm beachtet sie; ein paar alte Desktop-Player tun es nicht und zeigen die Einzelbilder so, wie sie gespeichert sind. Setzen Sie das Häkchen bei „Die Drehung ins Bild einbrennen“, dann werden die Einzelbilder selbst gedreht und als H.264 neu kodiert, was jeder Player gleich zeigt, um den Preis einer Generation Qualität.

### Welche Richtung ist eine Vierteldrehung nach rechts?

Im Uhrzeigersinn, so, wie sich die Oberkante des Bildes bewegen würde, wenn Sie Ihr Handy nach rechts drehen. Die Vorschau zeigt das erste Einzelbild so gedreht, wie gewählt. Nehmen Sie also die Schaltfläche, mit der es richtig aussieht, und drücken Sie die große.

### Welche Dateien liest es?

MP4, MOV und M4V mit beliebigem Bild darin, weil einer in den Header geschriebenen Drehung egal ist, was die Einzelbilder sind. WebM und MKV, bei denen H.264-Einzelbilder kopiert werden und alles andere eingebrannt wird, da sich um nichts anderes ein MP4-Header bauen lässt. AAC-Ton wird kopiert; Opus, Vorbis, MP3 und FLAC werden als AAC neu kodiert; Ton, den der Browser nicht dekodieren kann, wird benannt und weggelassen. Das Ergebnis ist immer ein MP4.

### Wie lange dauert es?

Sekunden, bei der normalen Drehung: Die Datei wird einmal für ihren Aufbau gelesen und noch einmal, während der Browser das Ergebnis schreibt, und ein Gigabyte geht so schnell wie Ihre Festplatte. Das Einbrennen dauert so lange, wie Ihr Gerät zum Kodieren des Clips braucht: mit Hardware-Encoder, also auf den meisten Laptops und jedem neueren Handy, schneller, als der Clip lang ist; ohne einen langsamer.

### Werden meine Videos irgendwohin hochgeladen?

Nein. Die Datei wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, mit einem neuen Header versehen und neu geschrieben, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört dieser Seite. Am einfachsten überzeugen Sie sich, indem Sie die Netzverbindung trennen und die Seite trotzdem benutzen. Bei einem Werkzeug für Dateien dieser Größe ist das auch der schnellste Weg: Der Upload dauert länger als die ganze Arbeit.

### Funktioniert es auf dem Handy?

Ja. Die normale Drehung dekodiert nichts, ein Handy erledigt sie also so schnell wie ein Laptop; die fertige Datei wird bis zum Speichern im Arbeitsspeicher gehalten, und das ist die einzige Grenze, wobei ein Handy ein paar hundert Megabyte Ergebnis ohne Klagen hält. Das Einbrennen ist eine Kodierung, und der eigene Hardware-Encoder eines Handys ist darin schnell.

### Gibt es eine Größengrenze, und kostet es etwas?

Die Datei wird in Häppchen von Ihrer Festplatte gelesen, eine Datei größer als Ihr Arbeitsspeicher geht also problemlos hinein; die fertige Datei wird bis zum Download im Arbeitsspeicher gehalten, und ein hier geschriebenes MP4 kann nicht größer als 4 GB sein. Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Videos übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist auch der einfachste Beweis dafür, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr Video zum Drehen wegschickt, bliebe in dem Moment stehen, in dem Sie die Verbindung trennen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Eine Drehung sind neun Zahlen im Header, und die Seite ändert nur diese.** Ein Handy, das quer filmt, dreht seine Pixel nicht. Es speichert die Einzelbilder so, wie der Sensor sie gesehen hat, und schreibt eine Vierteldrehung in den Header der Spur, eine Anzeigematrix aus neun Zahlen, die jeder Player auf dem Weg zum Bildschirm anwendet. Ein Video, das quer erscheint, braucht also eine andere Matrix, kein anderes Bild. Diese Seite schreibt die Matrix für die gewählte Drehung und übernimmt jedes Einzelbild und jedes Paket genau so, wie es war, ohne ein einziges zu dekodieren. Deshalb dauert ein Gigabyte Sekunden, deshalb ist das Bild Bit für Bit, was es war, und deshalb kommt die Datei fast genau so groß heraus, wie sie hineinging.
- **Der Upload ist der langsame Teil, und er ist der Teil, der nicht stattfindet.** Jeder Online-Rotator verlangt zuerst die ganze Datei: Das Gigabyte geht über Ihre Verbindung hinauf, damit ein gedrehtes Gigabyte zurückkommen kann, und der Upload dauert meist länger als die Arbeit, die er bezahlt, noch vor jeder Frage danach, wer die Datei behält. Die meisten kodieren sie dann auch noch neu, was eine Generation Qualität kostet, für eine Aufgabe, die neun Zahlen brauchte. Diese Seite liest die Datei mit Code, der von dieser Adresse ausgeliefert wird, und schreibt die neue im Arbeitsspeicher. Die einzigen Bytes, die sich bewegen, gehen also von Ihrer Festplatte in Ihren Arbeitsspeicher und zurück. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine einzige davon gehört dieser Seite. Und sie funktioniert bei getrennter Netzverbindung.
- **Wer den Header beachtet, und was bei den wenigen zu tun ist, die es nicht tun.** Jedes Handy, jeder Browser, jeder moderne Player und jedes Schnittprogramm wendet die Anzeigematrix an; so werden Handyaufnahmen seit 2010 richtig herum gezeigt. Ein paar alte Desktop-Player ignorieren sie und zeigen die gespeicherten Einzelbilder, quer. Für sie, und für einen Clip, der irgendwohin geht, wo Sie es nicht nachprüfen können, bietet die Seite an, die Drehung einzubrennen: Jedes Einzelbild wird gedreht auf ein Canvas gezeichnet und als H.264 neu kodiert. Das kostet eine Generation Qualität und dauert so lange wie eine Kodierung, es ist also die zweite Wahl und heißt auch so.
- **Das Ergebnis wird erneut geöffnet und geprüft.** Ein Rotator, der die falsche Matrix schreibt, oder die richtige bei der falschen Größe, liefert trotzdem eine Datei, die sich öffnen lässt. Deshalb wird die fertige Datei hier erneut geöffnet, von demselben Leser, der auch liest, was Sie mitbringen, und sie muss so lang sein wie vorher, so angezeigt werden, wie Sie es verlangt haben, in der Größe, die daraus folgt, und den Ton tragen, den sie tragen sollte. Sie wird unter dem Download aus dem Arbeitsspeicher abgespielt, damit Sie sie richtig herum sehen, bevor Sie sie speichern.
- **Welche Dateien es liest, und was es schreibt.** MP4, MOV und M4V mit beliebigem Bild darin, ob H.264, HEVC, VP9 oder AV1, denn einer in den Header geschriebenen Drehung ist egal, was die Einzelbilder sind; und WebM und MKV, deren Einzelbilder kopiert werden, wenn sie H.264 sind, und sonst eingebrannt, weil sich um nichts anderes ein MP4-Header bauen lässt. AAC-Ton wird kopiert; Opus, Vorbis, MP3 oder FLAC wird als AAC neu kodiert; ein Ton, den der Browser nicht dekodieren kann, wird benannt und weggelassen. Das Ergebnis ist immer ein MP4, weil das der eine Container ist, den alles abspielt.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Video übergeben, weder eine Datei noch ein Einzelbild, ein Name, eine Größe, eine Länge oder die Richtung, in die Sie es gedreht haben. Jede Zeile, die ein Video liest, dreht oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht: Er meldet keinen Besuch, und über Sie oder Ihre Videos bekommt er nichts. Solange Sie ihn nicht anklicken, passiert nichts, und wohin Sie dann kämen, ist die Seite von jemand anderem.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihr Video zum Drehen wegschickt, bliebe stehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/plan.js` für die neun Zahlen, auf die eine Drehung hinausläuft, `src/rotate.js` für das Kopieren und das Schreiben, und `src/shared/copy-tracks.js` dafür, wie ein Einzelbild hinüberwandert, ohne gelesen zu werden. Keines davon erreicht das Netz, und die Leser und der Schreiber daneben ebenso wenig.
