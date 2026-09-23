# Bild-Stacker — eine Serie zusammenrechnen, RAW eingeschlossen

Zwanzig Aufnahmen werden eine, ohne zwanzig Uploads und ohne RAW-Konverter.

> Eine Serie von Fotos zu einem Bild zusammenrechnen: mitteln gegen das Rauschen, den Median nehmen, um Passanten aus einer Szene zu entfernen, aufhellen für Sternspuren oder eine Makroaufnahme fokusstacken. Liest CR2, NEF, ARW, DNG, RAF und CR3, indem es die Vorschau der Kamera selbst herausholt. Läuft komplett im Browser.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/bilder-stacken/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Fotos werden **nie hochgeladen**. Es gibt keinen Server.

Jede Aufnahme wird von Ihrem eigenen Browser auf Ihrem eigenen Gerät geöffnet, dekodiert, ausgerichtet, zusammengerechnet und geschrieben. Ein Stapel aus zwanzig 60 MB großen RAW-Dateien ist rund ein Gigabyte Fotos, und kein einziges Byte davon bewegt sich: Netzfunktionen hat dieses Werkzeug keine, und die Dateien werden direkt von Ihrer Festplatte gelesen, von einem Worker, der nirgendwohin etwas senden könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Liest RAW
- ✓ Läuft offline
- ✓ Quelloffen

## So stacken Sie eine Reihe von Fotos im Browser

1. **Wählen Sie die Aufnahmen.** Eine Serie, eine Belichtungsreihe, eine Intervallaufnahme oder ein Ordner voller RAW-Dateien. Jede wird beim Ankommen geöffnet, und die Zeile sagt Ihnen, was herauskam: bei einer RAW-Datei die Kamera, die Größe der darin gefundenen Vorschau und wie wenig von der Datei gelesen werden musste, um sie zu finden.
2. **Nehmen Sie die Methode, die zu dem passt, was weg soll.** Rauschen: Mittelwert, oder Sigma-Clipping, wenn sich etwas bewegt hat. Leute, Autos oder ein vorbeifliegendes Flugzeug: Median. Ein dunkler Himmel, der zu Sternspuren werden soll: Aufhellen. Eine Makroaufnahme entlang des Fokusrings: Focus Stacking. Der Hinweis unter dem Menü sagt, was jede Methode mit genau Ihrer Anzahl Aufnahmen macht.
3. **Entscheiden Sie, ob die Aufnahmen ausgerichtet werden müssen.** Aus der Hand: ja, nur verschieben. Aus der Hand und dabei gedreht: verschieben, drehen und skalieren. Festes Stativ oder Intervallauslöser: nein, und es geht schneller. Jede Aufnahme wird gegen die als Bezug markierte vermessen, und das ist die erste, solange Sie nichts anderes sagen: „Als Bezug nehmen“ versetzt die Markierung und lässt die Liste in der Reihenfolge, in die Sie sie gebracht haben.
4. **Lesen Sie die vier Zahlen und drücken Sie dann den Knopf.** Bevor irgendetwas läuft, sagt die Seite, wie groß das Ergebnis wird, wie viel Speicher es ungefähr braucht, wie oft die Aufnahmen dekodiert werden und wie viel von Ihren Dateien gelesen wurde. Passt die Serie nicht am Stück in den Speicher, sagt sie das und nennt die Arbeitsauflösung, die es beheben würde.

## Die ausführliche Fassung

[So stacken Sie Fotos gegen Bildrauschen oder um Leute zu entfernen](https://abox.tools/de/ratgeber/fotos-stacken-gegen-bildrauschen/): Stacken rechnet eine Serie von Aufnahmen zu einem Bild zusammen. Welche Methode Sie brauchen, hängt davon ab, was weg soll: das Rauschen, die Passanten oder die geringe Schärfentiefe einer Makroaufnahme. Wie jede funktioniert, was sie kostet und wo RAW-Dateien hineinpassen.

## Auch im Werkzeugkasten

- [Bild-Schwärzer](https://abox.tools/de/bild-schwaerzen/): Was Sie abdecken, wird aus der Datei gelöscht und nicht darin versteckt.
- [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/): Sehen, was ein Foto über Sie verrät. Und es dann herausnehmen.
- [DICOM-Viewer](https://abox.tools/de/dicom-viewer/): CT, MRT, Röntgen und Ultraschall, mit Fenster, Header und Messungen.
- [Bild zu ICO](https://abox.tools/de/favicon-erstellen/): Ein Bild hinein. Jede Größe, die ein Browser, Windows oder ein Mac verlangt, heraus.

## Fragen

### Werden meine Fotos irgendwohin hochgeladen?

Nein. Jede Aufnahme wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware geöffnet, dekodiert, ausgerichtet, gestackt und geschrieben. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf. Keine davon gehört uns. Laden Sie die Seite einmal, trennen Sie die Internetverbindung, und sie arbeitet weiter. Das zählt hier schwerer als bei den meisten Werkzeugen, schlicht wegen der Menge: Ein Stapel aus zwanzig RAW-Aufnahmen ist rund ein Gigabyte, und ein Gigabyte Fotos hochzuladen, damit jemand den Mittelwert daraus bildet, ist genau das, wozu es dieses Werkzeug gibt.

### Welche RAW-Formate kann er lesen, und wie?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL und ein paar mehr, also das meiste, was Kameras schreiben. Gelesen wird daraus das JPEG in voller Größe, das die Kamera beim Auslösen selbst gerendert hat: das Bild auf dem Kameradisplay und das, was Ihr Betriebssystem als Vorschaubild zeichnet. Gefunden wird es, indem die Verzeichnisstruktur der Datei abgelaufen wird, was ein paar Lesevorgänge von je ein paar Kilobyte kostet, und dann ein Ausschnitt genommen wird. **Es ist kein Demosaicing der Sensordaten.** Das Ergebnis trägt den Weißabgleich und den Bildstil der Kamera mit acht Bit pro Kanal und nicht die zwölf oder vierzehn Bit linearer Sensordaten, die ein RAW-Konverter Ihnen gäbe.

### Warum dann nicht die Sensordaten richtig dekodieren?

Weil das hieße, LibRaw oder dcraw mitzuliefern, also eine zweite Engine von zig Megabyte für eine einzige Formatfamilie, und der größte Teil davon sind herstellereigene Kompressionsverfahren. Diese Abwägung wird in `docs/what-can-be-built-here.md` im Quelltext dieser Seite ausgetragen, wo Kamera-RAW schon auf der Ausschlussliste stand, bevor es dieses Werkzeug gab. Geändert hat sich nicht die Antwort auf diese Frage, sondern die Erkenntnis, dass Stacken sie nicht braucht: Die Vorschauen haben volle Auflösung, sie sind das, was die Kamera Ihnen ohnehin als JPEG gegeben hätte, und sie zu lesen ist rund hundertmal schneller als Demosaicing. Wenn Sie die Sensordaten wollen, entwickeln Sie die Aufnahmen zuerst in einem RAW-Konverter und stacken Sie die TIFFs oder JPEGs, die er ausgibt. Die nimmt dieses Werkzeug auch.

### Wie viele Aufnahmen schafft er, und wie groß?

Sechs der sieben Methoden strömen: Sie halten einen Akkumulator und lesen jede Aufnahme genau einmal, hundert Aufnahmen kosten also so viel Speicher wie zwei, und größer wird allein die Zeit. Der Median ist die Ausnahme, weil sich der mittlere Wert einer Menge nicht kennen lässt, bevor man sie ganz hat, und er deshalb jede Aufnahme gleichzeitig hält. Zwanzig Aufnahmen mit 24 Megapixeln sind rund 1,4 GB, und so viel gibt kein Browser heraus. Dann wird das Bild in waagerechte Bänder geschnitten und Band für Band gestackt, was das erneute Lesen der Aufnahmen für jedes Band kostet. Die Seite rechnet das alles aus, bevor Sie den Knopf drücken, und zeigt Ihnen die Zahl, ein langsamer Durchlauf ist also nie eine Überraschung.

### Was macht das Ausrichten der Aufnahmen eigentlich?

Es findet heraus, wie weit jede Aufnahme sich gegenüber der Bezugsaufnahme bewegt hat, und schiebt sie zurück, auf Bruchteile eines Pixels genau. Die Methode ist Phasenkorrelation: Die Verschiebung zwischen zwei Bildern zeigt sich als Phasenunterschied zwischen ihren Spektren, eine Fouriertransformation je Bild findet einen Versatz von zweihundert Pixeln also so billig wie einen von zwei. Die zweite Einstellung holt zusätzlich Drehung und Maßstab zurück, mit demselben Kniff, angewandt auf das Spektrum in logarithmisch-polaren Koordinaten. Das alles ist global, eine Verschiebung, ein Winkel, ein Maßstab für das ganze Bild, und es korrigiert deshalb eine Kamera, die sich bewegt hat, und kein Motiv, das sich bewegt hat, und kein Foto, das einen Schritt weiter links aufgenommen wurde. Eine sichtbare Folge: Eine um zwanzig Pixel nach links geschobene Aufnahme reicht nicht mehr bis an den rechten Rand, deshalb wird das Ergebnis auf den Teil beschnitten, den jede Aufnahme abdeckt. Darum kommt ein ausgerichteter Stapel ein wenig kleiner heraus als die Aufnahmen, die hineingingen, und das ist die einzige Alternative zu einem dunklen Rand aus den Aufnahmen, die dort nicht waren.

### Welche Methode soll ich nehmen?

**Mittelwert** gegen Rauschen, auf einer Serie, in der sich nichts bewegt hat: Er senkt zufälliges Rauschen um rund die Wurzel aus der Anzahl der Aufnahmen. **Median**, um Dinge zu entfernen, die nur zeitweise da waren; der klassische Fall ist, einen belebten Platz ein Dutzend Mal zu fotografieren und ihn leer zu bekommen. **Sigma-Clipping**, wenn Sie beides wollen: Es lernt, was jedes Pixel üblicherweise ist, und mittelt nur die Werte, die dazu passen, hat also die Unempfindlichkeit des Medians gegen ein vorbeifahrendes Auto und die Rauschminderung des Mittelwerts. **Aufhellen** für Sternspuren, Feuerwerk und Lichtmalerei. **Abdunkeln**, um alles Helle zu entfernen, das sich bewegt hat. **Addieren**, um eine einzelne lange Belichtung nachzubilden. **Focus Stacking** für eine Makroaufnahme entlang des Fokusrings.

### Warum hat mein Ergebnis acht Bit, wenn meine RAW-Dateien vierzehn haben?

Weil gestackt wird, was die Kamera selbst als Vorschau abgelegt hat, und das ist ein JPEG. Dazu gehört gesagt, dass Stacken einen Teil davon zurückholt: Sechzehn Acht-Bit-Aufnahmen zu mitteln ergibt ein Bild mit tatsächlich feineren Abstufungen, als eine einzelne von ihnen hatte, weil genau das Rauschen, das jede Aufnahme anders runden ließ, den Mittelwert zwischen den Stufen landen lässt. Gerechnet wird hier in Fließkomma und erst ganz am Ende einmal gerundet, dazwischen geht davon also nichts verloren. Dasselbe wie lineare Sensordaten zu stacken ist es trotzdem nicht, und dieses Werkzeug tut nicht so.

### Kann ich Aufnahmen unterschiedlicher Größe oder aus verschiedenen Kameras stacken?

Ja, auch wenn es meist ein Versehen ist und einen prüfenden Blick lohnt. Das Ergebnis hat die Größe der größten Aufnahme, und jede andere wird eingepasst und mittig gesetzt. Kameras zu mischen mischt auch die Farbwiedergabe, ein Mittelwert aus beiden ist also ein Mittelwert aus zwei verschiedenen Deutungen desselben Lichts. Wirklich hilfreich ist es bei einer Serie, die in zwei Auflösungen aufgenommen wurde, oder bei einer RAW-Datei und einem JPEG derselben Aufnahme.

### Er sagt, der Durchlauf werde in Bänder geteilt. Was heißt das?

Dass der Arbeitsspeicher, den die Methode braucht, mehr ist, als das Werkzeug am Stück belegen will, und das Bild deshalb in waagerechte Streifen geschnitten und Streifen für Streifen gestackt wird. Das Ergebnis ist genau dasselbe; es liest die Aufnahmen nur für jeden Streifen erneut, dauert also länger, und die Seite sagt Ihnen, wie viele Dekodiervorgänge das werden. Die Arbeitsauflösung eine Stufe zu senken viertelt den Speicher und macht aus einem gebänderten Durchlauf fast immer einen einzigen; der Hinweis nennt die Einstellung, die das täte.

### Warum verwendet dieses Werkzeug einen Worker und keines der anderen?

Weil es das einzige ist, dessen Arbeit in Minuten gemessen wird. Jedes andere Werkzeug hier tut etwas, das ein bis zwei Sekunden dauert, und dabei wäre es Zeremonie, die Arbeit vom Hauptstrang zu holen. Zwanzig große Aufnahmen zu stacken ist solide Rechnerei über hunderte Megabyte, und auf dem Hauptstrang heißt das eine eingefrorene Seite: ein Fortschrittsbalken, der sich nicht bewegt, ein Abbrechen-Knopf, der nicht antwortet, und irgendwann ein Browser, der anbietet, den Tab zu beenden. Der Worker ist ein zweiter Strang in genau diesem Browser, der eine Datei aus genau diesem Ordner unter genau dieser Policy ausführt. Er ist kein Server und keine Netzfunktion.

### Ist das kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Es gibt auch keine Grenze dafür, wie viele Aufnahmen Sie stacken oder wie groß sie sind, weil kein Server dafür bezahlt: Die Arbeit passiert auf Ihrem eigenen Gerät, und die einzige Decke ist Ihr eigener Speicher. Die Seite trägt Werbung, und die bezahlt sie; die Werbung bekommt nichts über Ihre Fotos.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Fotos haben keinen Ort, an den sie gehen könnten.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien gesammelt werden könnten, und keinen Code, der sie senden würde, wenn es ihn gäbe: kein `fetch`, kein `XMLHttpRequest`, kein `sendBeacon`, weder in `src/` noch im Worker.
- **Die RAW-Dateien werden gelesen, nicht hochgeladen, und kaum gelesen.** Eine RAW-Datei aus einer Kamera enthält bereits ein JPEG in voller Größe, das die Kamera beim Auslösen gerendert hat. Dieses Werkzeug findet es, indem es ein paar Verzeichniseinträge abläuft und dann um genau einen Ausschnitt bittet, was bei einer 60 MB großen Datei meist unter hundert Kilobyte sind. Die Seite zeigt Ihnen diese Zahl neben der Größe Ihrer Dateien, während Sie arbeiten. Die Sensordaten werden überhaupt nicht gelesen.
- **Die Arbeit passiert in einem Worker auf diesem Gerät, nicht auf einem Server.** Das ist das einzige Werkzeug hier, das einen verwendet, weil Stacken Minuten an Rechnerei ist statt Sekunden und eine eingefrorene Seite weder Fortschritt zeigen noch abgebrochen werden kann. Ein Worker ist ein zweiter Strang in genau diesem Browser, siehe `src/worker.js`. Ihm werden die Dateien selbst übergeben, was nichts kostet, weil ein Dateihandle nicht die Bytes ist, und er hat genau dieselbe Content-Security-Policy wie die Seite, also ebenso wenig einen Ort, an den er sie senden könnte.
- **Über die Serie wird nirgendwohin etwas gemeldet.** Wie viele Aufnahmen Sie gestackt haben, welche Kamera sie geschrieben hat, wie weit jede sich bewegt hatte, welche Methode Sie gewählt haben und wie lange es gedauert hat, liegen im Speicher dieser Seite, bis Sie sie schließen. In diesem Repository gibt es kein Analytics-Ereignis, das irgendetwas davon trüge, und die eine Frage, die diese Seite nach einem Download stellt, sendet einen Daumen hoch oder runter und den Namen des Werkzeugs, sonst nichts.
- **Läuft offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt, wie es ist, weil nie ein Netzschritt darin war. Der Worker und jedes Modul, das er lädt, werden vom Service Worker dieser Seite zwischengespeichert, eine installierte Kopie stackt RAW-Dateien also mit gezogenem Stecker.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/raw.js` dafür, wie eine RAW-Datei geöffnet wird, indem Kilobyte statt Megabyte gelesen werden, `src/stack.js` für die Rechnung hinter jeder Methode und `src/plan.js` dafür, woher die Speicher- und Dekodierzahlen auf der Seite kommen: Sie sind die Antworten dieser Datei und keine Schätzungen.
