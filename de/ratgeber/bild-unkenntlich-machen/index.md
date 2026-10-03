# Ein Bild so schwärzen, dass das Verdeckte wirklich weg ist

Etwas abdecken und etwas entfernen sieht auf dem Bildschirm gleich aus und ist zweierlei. Hier steht der Unterschied, dazu die zwei Arten, die mehr übrig lassen als gedacht, und die Prüfungen, mit denen Sie feststellen, welches von beidem Sie gerade getan haben.

[Bild-Schwärzer öffnen](https://abox.tools/de/bild-schwaerzen/): Was Sie abdecken, wird aus der Datei gelöscht und nicht darin versteckt.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [Bild-Schwärzer](https://abox.tools/de/bild-schwaerzen/), ziehen Sie das Bild hinein, ziehen Sie einen Kasten über jede Stelle, die niemand sehen soll, und klicken Sie auf „Schwärzen und speichern“. Nehmen Sie die schwarze Fläche für alles, was sich als Text lesen lässt. Die Datei, die Sie zurückbekommen, hat dort andere Pixelwerte, wo die Kästen lagen. Es gibt darin kein Rechteck, das sich beiseiteschieben ließe, weil darin überhaupt kein Rechteck ist.

Alles Weitere erklärt, warum dieser letzte Satz der eigentliche Punkt ist und woran Sie erkennen, ob ein Programm, das Sie schon benutzen, dasselbe von sich behaupten kann.

## Abdecken und Entfernen sehen auf dem Bildschirm gleich aus

Zeichnen Sie in einem PDF-Betrachter, einer Präsentation, einer Textverarbeitung oder einem Bildeditor mit Ebenen ein schwarzes Rechteck über einen Namen. Zu sehen ist ein Name mit einem schwarzen Rechteck darüber. *Gespeichert* haben Sie in den meisten dieser Programme ein Dokument, das den Namen enthält und, getrennt davon, ein Rechteck mit Position, Größe und Farbe.

Wer diese Datei öffnet, kann das Rechteck verschieben, löschen oder das Dokument in einem Programm öffnen, das die Ebenen in anderer Reihenfolge zeichnet. Der Name steht immer noch darin. Am Bildschirm ist nicht zu erkennen, welcher der beiden Fälle vorliegt, und genau deshalb passiert das immer wieder Organisationen mit eigener Rechtsabteilung.

So sind Gerichtsakten, Behördenberichte, Verträge und mehr als eine eingescannte Zeitungsseite an die Öffentlichkeit geraten. Das Muster ist jedes Mal dasselbe: Das Rechteck war die Anmerkung, und die Anmerkung war nicht das Bild.

## Was eine echte Schwärzung ist

Ein Bild ist ein Raster aus Zahlen, eine pro Pixel. Es zu schwärzen heißt, **andere Zahlen in das Raster zu schreiben** und das Raster dann zu speichern. Danach gibt es nichts wiederherzustellen, nicht weil die Datei es gut versteckt, sondern weil die Werte nicht in der Datei stehen. Nur diese Variante übersteht es, wenn jemand Neugieriges sie öffnet.

Daraus folgen drei Dinge, an denen man eine geschwärzte Datei erkennt:

- **Das Ergebnis ist ein flaches Bild.** Keine Ebenen, keine Objekte, keine Anmerkungsliste, nichts zum Ein- und Ausblenden. Wenn Ihr Programm eine Datei mit einer Ebene darin zurückgibt, hat es abgedeckt statt entfernt.
- **Es ist eine neue Datei, keine bearbeitete alte.** Die Pixel sind durch einen Decoder und einen Encoder gelaufen, geschrieben wird also aus dem geschwärzten Raster.
- **Die Metadaten sind ebenfalls weg**, als Nebenwirkung. Ein Raster aus Pixeln trägt kein Kameramodell, keine GPS-Position und keinen Zeitstempel. Was da sonst gestanden hätte, steht in [Was ein Foto über Sie verrät](https://abox.tools/de/ratgeber/exif-und-gps-daten-entfernen/).

Der letzte Punkt verdient einen eigenen Absatz, denn in ihm steckt eine weitere Falle. Viele Fotos tragen ein **eingebettetes Vorschaubild**: eine kleine zweite Kopie des Bildes, geschrieben beim Erzeugen der Datei und nicht immer neu erzeugt, wenn das Bild bearbeitet wird. Ein Foto, das ein Werkzeug an Ort und Stelle bearbeitet hat, statt es neu zu kodieren, kann also mit einem Vorschaubild des ungeschwärzten Originals unterwegs sein. Es ist ein kleines Bild, und es ist mühelos groß genug, um einen Namen darauf zu lesen.

![Die Speichern-Karte: ein Format-Menü, ein Qualitätsregler und ein Hinweis, dass die abgedeckten Pixel aus der geschriebenen Datei entfernt werden.](https://abox.tools/screens/redact-an-image/save.webp)

Das Speichern ist der Schritt, der es echt macht. Heraus kommt eine neue Datei ohne diese Pixel, nicht das Original mit einem Rechteck darauf.

## Schwarz, verpixeln oder weichzeichnen — und warum das nicht dasselbe ist

Alle drei überschreiben die Pixel. Nur eines davon lässt nichts übrig.

### Schwarze Fläche

Jedes Pixel im Kasten bekommt dieselbe Farbe. Von dem, was dort war, bleibt nichts: keine Kontur, keine mittlere Helligkeit, nicht die Anzahl der Zeichen, nicht die Länge des Wortes. Es ist die einzige der drei Arten, bei der die Frage „könnte man das rückgängig machen?“ ein glattes Nein zur Antwort hat, und die richtige Wahl für einen Namen, eine Adresse, eine Kontonummer, ein Kennzeichen, eine Unterschrift oder einen Barcode.

### Verpixeln

Der Kasten wird in Blöcke zerlegt, und jeder Block bekommt die Durchschnittsfarbe dieses Blocks. Die ursprünglichen Pixel sind wirklich weg. Aber ein Raster aus Mittelwerten ist immer noch eine Messung dessen, was darunter lag, und bei Text kann diese Messung genügen.

Der Angriff ist nicht raffiniert. Text stammt aus einer kleinen Menge von Möglichkeiten: eine Schrift, eine Größe, eine Position, eine Zeichenfolge. Wer ahnt, was für eine Art Angabe dort stand, rendert jede in Frage kommende Zeichenfolge auf dieselbe Weise, verpixelt sie mit demselben Blockraster und vergleicht die Mittelwerte mit Ihren. Meist passt genau eine. Das ist an echten verpixelten Screenshots vorgeführt worden, und es gibt veröffentlichte Software dafür.

Entscheidend ist, **aus wie vielen Blöcken das Raster besteht**. Zwei Blöcke über einem Wort sind zwei Zahlen, und mit zwei Zahlen lässt sich keine Zeichenfolge bestimmen. Vierzig Blöcke über demselben Wort sind vierzig Zahlen, und vierzig reichen reichlich. Deshalb nennt der Bild-Schwärzer die Blockzahl des feinsten Rasters auf dem Bild, statt eine Einstellung „stark“ zu nennen: Die Zahl ist die Tatsache, das Adjektiv nur eine Meinung darüber.

### Weichzeichnen

Jedes Pixel wird zum gewichteten Mittel seiner Nachbarn. Das ist eine Faltung, und Faltungen sind im Prinzip umkehrbar: Aus einer weichgezeichneten Kopie das Original zurückzurechnen ist eine Standardaufgabe mit Standardsoftware, und sie gelingt am besten in genau dem Fall, auf den es hier ankommt, nämlich bei scharfem Text, der mit kleinem Radius weichgezeichnet wurde.

Nutzlos sind Verpixeln und Weichzeichnen deswegen nicht. Ein Gesicht im Hintergrund einer Straßenaufnahme, eine Hausnummer gegenüber, der Bildschirm einer Kollegin hinter Ihnen in einer Videokonferenz: Das ist alles in Ordnung, und das Bild bleibt dabei ein Bild. Die Regel lautet schlicht: **Was sich als Text lesen lässt, wird geschwärzt.**

![Der Editor: ein Foto mit einem deckenden Kasten über einem Teil davon, die Wahl zwischen Schwarz, Verpixeln und Weichzeichnen, ein Stärkeregler und eine Übersicht der markierten Bereiche.](https://abox.tools/screens/redact-an-image/cover.webp)

Drei Arten, etwas abzudecken, und sie sind nicht gleichwertig. Hier geht es darum, welche davon einen Versuch übersteht, sie rückgängig zu machen.

## Vier Prüfungen vor dem Verschicken

Sie dauern zusammen eine Minute und funktionieren am Ergebnis jedes Werkzeugs, auch an diesem. Eine Behauptung, die Sie prüfen können, ist mehr wert als eine, die Sie glauben sollen.

1. **Versuchen Sie, den Text zu markieren.** Öffnen Sie die Datei und ziehen Sie über die abgedeckte Stelle. Wird dabei etwas hervorgehoben, steht der Text noch im Dokument, und Sie sehen eine Form, die darüber gezeichnet wurde.
2. **Öffnen Sie sie in einem Editor und suchen Sie nach Ebenen.** Eine einzige Ebene, meist „Hintergrund“ genannt, ist das, wonach ein geschwärztes Bild aussieht. Ein eigenes Rechteck-Objekt heißt, dass das Original darunter liegt.
3. **Sehen Sie sich das Vorschaubild an.** Manche Dateimanager und Bildbetrachter zeigen das eingebettete Vorschaubild, statt das Bild neu zu lesen. Zeigt die kleine Fassung noch, was Sie abgedeckt haben, wurde die Datei bearbeitet statt neu aufgebaut.
4. **Zoomen Sie ganz an die Ränder des Kastens heran.** Eine Schwärzung, die auf die Pixel angewendet wurde, hat genau an der Grenze eine harte Kante. Ein weicher oder halbdurchsichtiger Rand heißt, dass etwas mit einer Deckkraft über das Bild gezeichnet wurde, und eine Deckkraft unter 100 Prozent ist eine Kopie des Originals mit einem Farbschleier darauf.

## Wo es geht, lieber abschneiden als abdecken

Wenn das, was Sie verbergen wollen, am Rand des Bildes sitzt, etwa eine Kopfzeile mit einem Kontonamen, ein Browser-Tab oder eine Taskleiste mit Ihrem Benutzernamen, dann ist Abschneiden stärker als Abdecken und ergibt außerdem eine sauberere Datei. Es gibt keinen Kasten, über den man nachdenken müsste, weil dort schlicht nichts mehr ist.

Der [Bildskalierer](https://abox.tools/de/bildgroesse-aendern/) schneidet zu, und [sein Ratgeber](https://abox.tools/de/ratgeber/bild-skalieren/) beschreibt, was er sonst noch kann. Für alles in der Bildmitte nehmen Sie den Schwärzer.

## Ein Screenshot ist oft das größere Problem

Meist ist nicht nur das Bild an einem Screenshot verräterisch. Sehen Sie sich vor dem Verschicken an, was um den Ausschnitt herum steht, den Sie zeigen wollten: den Fenstertitel, die Adressleiste samt Vervollständigungsliste, offene Tabs, eine Benachrichtigung, Uhrzeit und Datum, die Taskleiste, ein angemeldetes Profilbild in der Ecke, den Namen des WLANs. Jede einzelne dieser Angaben kann Sie verorten, und keine davon war das, worauf Sie beim Auslösen geschaut haben.

## Dafür braucht es keinen Upload

Ein Bild lesen, einige seiner Pixel überschreiben und es wieder kodieren kann jeder Browser seit Jahren. Es gibt keinen technischen Grund, warum das Foto Ihres Reisepasses, Ihrer Gehaltsabrechnung oder Ihres Kontoauszugs zu einem fremden Server und zurück reisen müsste, nur damit ein schwarzer Kasten daraufkommt. Und genau solche Bilder bekommt ein Schwärzungswerkzeug zu sehen.

Das Werkzeug hier schickt nichts irgendwohin: In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns. Laden Sie die Seite, trennen Sie die Internetverbindung und schwärzen Sie trotzdem etwas, wenn Sie lieber prüfen als glauben. [Ist das Hochladen von Dateien bei Online-Konvertern sicher?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) nennt drei weitere Prüfungen, die Sie an jedem Werkzeug vornehmen können.
