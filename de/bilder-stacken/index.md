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

1. **Wählen Sie die Aufnahmen.** Eine Serie, eine Intervallaufnahme oder ein Ordner voller RAW-Dateien mit brauchbaren JPEG-Vorschauen. Warten Sie, bis alle Dateien geöffnet sind. Jede Zeile zeigt, was darin gefunden wurde: bei RAW die Kamera und die tatsächlichen Maße der eingebetteten Vorschau. Dateien, die sich nicht öffnen ließen, werden aufgelistet, damit Sie sehen, was fehlt.
2. **Nehmen Sie die Methode, die zu dem passt, was weg soll.** Rauschen: Mittelwert oder Sigma-Clipping, um abweichende Werte zu verwerfen. Leute, Autos oder ein vorbeifliegendes Flugzeug: Median, wenn sie jeden Teil der Szene in weniger als der Hälfte der Aufnahmen verdecken. Sternspuren: Aufhellen. Eine Makroaufnahme entlang des Fokusrings: Focus Stacking. Der Hinweis unter dem Menü erklärt die Methode und ihre Grenzen.
3. **Entscheiden Sie, ob die Aufnahmen ausgerichtet werden müssen.** Beginnen Sie mit Automatisch: Es misst Verschiebung, Drehung und Maßstab und korrigiert dann die Perspektive, wenn zuverlässige Bereiche über das Bild verteilt übereinstimmen. Das ist hilfreich für Sternaufnahmen mit großem Bildfeld. Nur verschieben braucht weniger Messarbeit für eine ruhige Serie. Wählen Sie Nein, wenn die Aufnahmen bereits zusammenpassen, oder für Sternspuren, bei denen die Bewegung des Himmels erhalten bleiben soll. Ein festes Stativ hält die Sterne nicht ausgerichtet. Jede Aufnahme wird gegen die als Bezug markierte gemessen. Das ist zunächst die erste: „Als Bezug nehmen“ versetzt die Markierung und lässt die Reihenfolge der Liste bestehen.
4. **Lesen Sie die vier Zahlen und drücken Sie dann den Knopf.** Vor dem Start zeigt die Seite die geplante Ergebnisgröße, den geschätzten Speicher für den Stack, die geplanten Dekodiervorgänge beim Stacken und die beim Prüfen gelesenen Bytes. Browserinternes und Speicherbereinigung können mehr Speicher brauchen als die modellierten Puffer; die Zahlen sind ein Plan und keine Garantie für den Gesamtverbrauch. Bei einem Stack in Bändern schlägt die Seite eine kleinere Arbeitsauflösung vor. Vergleichen Sie danach Bezug und Ergebnis in tatsächlicher Pixelgröße und prüfen Sie die Ausrichtungsdetails vor dem Download.

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

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL und verwandte Formate werden unterstützt, wenn eine brauchbare JPEG-Vorschau enthalten ist. Das Werkzeug geht die Verzeichnisse durch und nimmt die größte gefundene Vorschau. Sie kann kleiner als das Sensorbild sein oder ganz fehlen. **Die Sensordaten werden nicht dekodiert.** Die Pixel tragen Weißabgleich und Bildstil der Kamera mit acht Bit pro Kanal. Prüfen Sie die Maße in der Zeile. Die Prüfzahl zählt Kopf- und Verzeichnisdaten; beim Dekodieren wird auch der JPEG-Ausschnitt gelesen.

### Warum dann nicht die Sensordaten richtig dekodieren?

Das Dekodieren der Sensordaten bräuchte eine RAW-Engine wie LibRaw oder dcraw mit den Kompressionsverfahren der einzelnen Kameras. Eine eingebettete JPEG-Vorschau hält dieses Werkzeug klein und nutzt den Bilddecoder des Browsers. Dabei werden die Wiedergabe der Kamera und die Vorschauauflösung der Datei übernommen. Für eigene RAW-Entwicklungseinstellungen entwickeln Sie die Aufnahmen zuerst und exportieren JPEG- oder PNG-Dateien zum Stacken.

### Wie viele Aufnahmen schafft er, und wie groß?

Sechs der sieben Methoden verwenden Akkumulatoren, deren Größe nicht mit der Zahl der Aufnahmen wächst. Mittelwert, Aufhellen, Abdunkeln, Addieren und Focus Stacking brauchen einen Durchlauf je Band, Sigma-Clipping zwei. Median hält die Werte jeder Aufnahme für das aktuelle Band und braucht deshalb mit mehr Aufnahmen mehr Speicher. Jede Methode kann in Bänder aufgeteilt werden, wenn ihre Arbeitspuffer das Budget des Werkzeugs überschreiten. Dann werden die Aufnahmen für jedes Band erneut dekodiert. Die Seite schätzt diese Puffer und zeigt die geplanten Dekodiervorgänge beim Stacken. Prüfen und Ausrichten brauchen weitere Arbeit, und die internen Codec- und GPU-Puffer des Browsers können mehr Speicher brauchen als geschätzt.

### Was macht das Ausrichten der Aufnahmen eigentlich?

Das Werkzeug misst die Verschiebung jeder Aufnahme gegenüber dem Bezug und schiebt sie zurück, auf Bruchteile eines Pixels genau. Es verwendet Phasenkorrelation: Verschiebung zeigt sich als Phasenunterschied zwischen den Spektren. Eine Fouriertransformation je Bild findet einen Versatz von zweihundert Pixeln so günstig wie einen von zwei. Drehung und Maßstab werden über dasselbe Verfahren mit dem Spektrum in logarithmisch-polaren Koordinaten bestimmt. Automatisch misst zusätzlich Bereiche über das Bild verteilt und korrigiert die Perspektive, wenn genügend zuverlässige Messungen übereinstimmen. Das hilft, Sterne in einem großen Bildfeld am Rand ebenso wie in der Mitte auszurichten. Lässt sich diese Zusatzkorrektur nicht zuverlässig messen, bleiben Drehung und Maßstab erhalten, und die Ausrichtungsdetails melden die Ausrichtung ohne Perspektivkorrektur. Die Korrektur gilt für das ganze Bild; sie kann weder ein unabhängig bewegtes Motiv noch jede Tiefe einer seitlich versetzten Szene ausrichten. Eine nach links verschobene Aufnahme reicht nicht mehr bis zum rechten Rand. Das Ergebnis wird deshalb auf den gemeinsamen Bereich beschnitten und kann etwas kleiner sein. So werden dunkle Ränder durch nicht abgedeckte Bereiche vermieden.

### Welche Methode soll ich nehmen?

**Mittelwert** gegen Rauschen, wenn sich nichts bewegt hat: unabhängiges zufälliges Rauschen sinkt ungefähr um die Wurzel aus der Zahl der Aufnahmen. **Median** entfernt Dinge, die einen Teil der Szene in weniger als der Hälfte der Aufnahmen verdecken. **Sigma-Clipping** mittelt Werte nahe ihrem Mittelwert und verwirft Werte außerhalb der gewählten Schwelle. In kleinen Serien oder bei häufigem Auftreten können bewegte Objekte bleiben; wenn deren Entfernung Vorrang hat, ist Median die sicherere Wahl. **Aufhellen** für Sternspuren, Feuerwerk und Lichtmalerei. **Abdunkeln** gegen bewegte helle Dinge. **Addieren** mischt die dekodierten Aufnahmen additiv. Es arbeitet mit Acht-Bit-Bildwerten und bildet keine längere Kamerabelichtung nach. **Focus Stacking** für eine Makroaufnahme entlang des Fokusrings.

### Warum hat mein Ergebnis acht Bit, wenn meine RAW-Dateien vierzehn haben?

Aus der RAW-Datei wird die JPEG-Vorschau der Kamera verwendet, und das Ergebnis ist ein Acht-Bit-PNG oder -JPEG. Mittelwert und Sigma-Clipping verwenden breitere Akkumulatoren und runden erst am Ende. So lässt sich aus verrauschten Aufnahmen ein saubererer Wert bestimmen, ohne jeden Zwischenschritt zu runden. Das gespeicherte Bild hat weiterhin acht Bit pro Kanal; Bittiefe und Dynamikumfang linearer Sensordaten gewinnt es nicht.

### Kann ich Aufnahmen unterschiedlicher Größe oder aus verschiedenen Kameras stacken?

Ja, aber prüfen Sie, ob das beabsichtigt ist. Die größte Aufnahme bestimmt die Arbeitsfläche; andere werden eingepasst und zentriert. Das gespeicherte Ergebnis wird auf den gemeinsamen Bereich beschnitten. Verschiedene Bildformen oder die Ausrichtung können es daher kleiner als die geplante Fläche machen. Verschiedene Kameras mischen auch ihre Farbwiedergabe. Halten Sie Belichtung und Bildausschnitt gleich und prüfen Sie das Ergebnis mit dem Bezugsvergleich.

### Er sagt, der Durchlauf werde in Bänder geteilt. Was heißt das?

Die Methode braucht mehr Arbeitsspeicher, als das Werkzeug auf einmal belegen will. Das Bild wird deshalb in waagerechte Streifen geteilt und streifenweise gestackt. Ausrichtungsgeometrie und Stacking-Methode bleiben gleich; die Neuberechnung der Pixel im Browser kann sich im letzten Bit leicht unterscheiden. Für jeden Streifen werden die Aufnahmen erneut gelesen, was länger dauert. Die Seite zeigt die Anzahl der Dekodiervorgänge. Die Arbeitsauflösung eine Stufe zu senken viertelt den Speicher und macht aus einem Durchlauf in Bändern fast immer einen einzigen. Der Hinweis nennt die passende Einstellung.

### Warum verwendet dieses Werkzeug einen Worker und keines der anderen?

Weil es das einzige ist, dessen Arbeit in Minuten gemessen wird. Jedes andere Werkzeug hier tut etwas, das ein bis zwei Sekunden dauert, und dabei wäre es Zeremonie, die Arbeit vom Hauptstrang zu holen. Zwanzig große Aufnahmen zu stacken ist solide Rechnerei über hunderte Megabyte, und auf dem Hauptstrang heißt das eine eingefrorene Seite: ein Fortschrittsbalken, der sich nicht bewegt, ein Abbrechen-Knopf, der nicht antwortet, und irgendwann ein Browser, der anbietet, den Tab zu beenden. Der Worker ist ein zweiter Strang in genau diesem Browser, der eine Datei aus genau diesem Ordner unter genau dieser Policy ausführt. Er ist kein Server und keine Netzfunktion.

### Ist das kostenlos, und brauche ich ein Konto?

Es ist kostenlos, ohne Konto, Anmeldung, Testphase oder Wasserzeichen. Es gibt keine Dienstquote für Zahl oder Größe der Aufnahmen. Die praktischen Grenzen sind der Speicher Ihres Geräts, die Canvas- und Decodergrenzen des Browsers und die Laufzeit. Die Seite trägt Werbung, die sie bezahlt; die Werbung bekommt nichts über Ihre Fotos.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Fotos haben keinen Ort, an den sie gehen könnten.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien gesammelt werden könnten, und keinen Code, der sie senden würde, wenn es ihn gäbe: kein `fetch`, kein `XMLHttpRequest`, kein `sendBeacon`, weder in `src/` noch im Worker.
- **RAW-Vorschauen werden auf diesem Gerät gelesen.** Viele Kamera-RAW-Dateien enthalten eine von der Kamera gerenderte JPEG-Vorschau. Dieses Werkzeug geht die Verzeichnisse der Datei durch und nimmt die größte brauchbare Vorschau als Ausschnitt. Die Zahl für das Prüfen zählt die gelesenen Kopf- und Verzeichnisdaten; beim Dekodieren wird zusätzlich der JPEG-Ausschnitt gelesen. Die Sensordaten werden nie dekodiert, und die Zeile zeigt die tatsächlichen Maße der Vorschau.
- **Die Arbeit passiert in einem Worker auf diesem Gerät, nicht auf einem Server.** Das ist das einzige Werkzeug hier, das einen verwendet, weil Stacken Minuten an Rechnerei ist statt Sekunden und eine eingefrorene Seite weder Fortschritt zeigen noch abgebrochen werden kann. Ein Worker ist ein zweiter Strang in genau diesem Browser, siehe `src/worker.js`. Ihm werden die Dateien selbst übergeben, was nichts kostet, weil ein Dateihandle nicht die Bytes ist, und er hat genau dieselbe Content-Security-Policy wie die Seite, also ebenso wenig einen Ort, an den er sie senden könnte.
- **Über die Serie wird nirgendwohin etwas gemeldet.** Wie viele Aufnahmen Sie gestackt haben, welche Kamera sie geschrieben hat, wie weit jede sich bewegt hatte, welche Methode Sie gewählt haben und wie lange es gedauert hat, liegen im Speicher dieser Seite, bis Sie sie schließen. In diesem Repository gibt es kein Analytics-Ereignis, das irgendetwas davon trüge, und die eine Frage, die diese Seite nach einem Download stellt, sendet einen Daumen hoch oder runter und den Namen des Werkzeugs, sonst nichts.
- **Läuft offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt, wie es ist, weil nie ein Netzschritt darin war. Der Worker und jedes Modul, das er lädt, werden vom Service Worker dieser Seite zwischengespeichert, eine installierte Kopie stackt RAW-Dateien also mit gezogenem Stecker.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/raw.js` dafür, wie eingebettete RAW-Vorschauen ohne Dekodieren der Sensordaten gefunden werden, `src/stack.js` für die Rechnung hinter jeder Methode und `src/plan.js` für den geschätzten Arbeitsspeicher und die geplanten Dekodiervorgänge beim Stacken. Browserinternes und Speicherbereinigung können mehr Speicher brauchen als die modellierten Puffer.
