# So fügen Sie mehrere Bilder zu einem PDF zusammen

Jemand möchte „ein PDF“, und Sie haben elf Fotos von Papier. Vier Entscheidungen verändern das Ergebnis tatsächlich: die Reihenfolge, das Seitenformat, die Qualität und das, was das Dokument über Sie preisgibt. An allem anderen können Sie getrost vorbeigehen.

[Bilder in PDF öffnen](https://abox.tools/de/bilder-in-pdf-umwandeln/): Ihre Bilder in ein einziges Dokument packen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie [Bilder in PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/), ziehen Sie die Bilder hinein, schieben Sie die Kacheln in die richtige Reihenfolge und erzeugen Sie das Dokument. Mit den Voreinstellungen fahren die meisten genau richtig: A4, ein schmaler Rand, Fotos unverändert übernommen.

Vier Punkte lohnen einen zweiten Blick, hier in der Reihenfolge, in der sie erfahrungsgemäß schiefgehen: die Reihenfolge der Seiten, das Seitenformat, die Qualitätseinstellung und das, was das fertige Dokument über Sie preisgibt.

![Eine Vorschau der ersten PDF-Seite, daneben eine Übersicht: vier Seiten, Seitengröße passend zu jedem Bild, vier von vier Bildern unverändert übernommen.](https://abox.tools/screens/combine-images-into-a-pdf/preview.webp)

Die Vorschau ist die Prüfung, die sich lohnt: Sie zeigt die fertige Seite, im Format der fertigen Seite.

## Zuerst die Reihenfolge

Nichts geht so oft schief wie die Seitenreihenfolge, und schuld ist die Sortierung nach Dateinamen. Alphabetisch wird Zeichen für Zeichen verglichen, und weil `1` vor `2` steht, landet `IMG_10.jpg` vor `IMG_2.jpg`. Ein Ordner mit Scans von `seite1` bis `seite12` kommt deshalb in praktisch jedem Werkzeug durcheinander an.

Bei abfotografierten Seiten ist die Sortierung nach Aufnahmedatum meist die verlässlichere: Sie haben die Blätter ja in der Reihenfolge fotografiert, in der sie lagen. Und in jedem Fall gilt: lieber vorher die Kacheln durchsehen als hinterher das PDF.

## Qualität: der Punkt, an dem die meisten Werkzeuge stillschweigend patzen

Ein PDF kann JPEG-Daten unverändert aufnehmen, denn genau so ist es im Format vorgesehen. Die komprimierten Bytes wandern, wie sie sind, in das Dokument, und der Reader dekodiert sie am Ende genauso wie ein Browser.

Der Gewinn daran: Eine Fotografie muss auf dem Weg ins PDF überhaupt nichts einbüßen. Sie wird weder dekodiert noch neu komprimiert, und das Bild im Dokument ist Bit für Bit dasselbe wie das in Ihrer Datei. Viele Werkzeuge kodieren trotzdem neu, weil es bequemer ist, alles über ein Canvas laufen zu lassen und einheitlich auszugeben, und opfern damit ohne Not eine Generation Qualität.

Andere Formate können so nicht mitfahren. Für PNG, WebP, HEIC und den Rest hält PDF keinen passenden Filter bereit, sie müssen also umgewandelt werden. Wie, das entscheiden Sie:

- **Neu als JPEG kodieren** (die Voreinstellung). Die kleinste Datei bei geringem Qualitätsverlust, und für Fotografien deshalb das Richtige.
- **Verlustfrei.** Die Pixel bleiben exakt erhalten, das Dokument wird dafür deutlich größer. Das Richtige für Screenshots, Diagramme und alles mit Text oder scharfen Kanten, wo JPEG-Artefakte sofort ins Auge fallen.

## Seitenformat, und wann „an das Bild anpassen“ die bessere Wahl ist

Ein Standardformat wie A4, Letter, Legal, A3, A5 oder Tabloid stellt jedes Bild auf eine Seite dieser Größe und passt es innerhalb Ihres Randes ein. Das nehmen Sie, wenn gedruckt wird oder wenn eine Behörde das Dokument zu den Akten legt.

„Genau die Größe des jeweiligen Bildes“ schneidet jede Seite auf ihr Bild zu: kein Weißraum, keine Skalierung. Das passt, solange das PDF eher Behälter als Dokument ist, also bei einem Portfolio, einer Screenshot-Sammlung oder einem Comic. Ausgedruckt sieht es merkwürdig aus, weil dann jede Seite ein anderes Format hat.

Einen Rand sollten Sie stehen lassen, sobald gedruckt wird. Heimdrucker kommen nicht bis an die Papierkante heran, und ein randlos gesetztes Foto kommt beschnitten aus dem Gerät.

### Hochformatseiten aus Querformatfotos

Wer Papier mit quer gehaltenem Handy abfotografiert, bekommt lauter Querformatbilder, die klein in der Mitte einer Hochformatseite sitzen. Abhilfe schafft eine Vierteldrehung vor dem Erzeugen des Dokuments, und zwar pro Bild statt für den ganzen Stapel, weil ein paar Aufnahmen erfahrungsgemäß doch richtig herum geraten sind.

![Die Seiteneinstellungen: Seitengröße, Ausrichtung, wie das Bild auf die Seite trifft, der Rand und die Hintergrundfarbe.](https://abox.tools/screens/combine-images-into-a-pdf/layout.webp)

Seitengröße und Einpassung entscheiden gemeinsam, ob ein Bild ganz zu sehen ist oder auf das Papier beschnitten wird. „Wie das jeweilige Bild“ umgeht die Frage vollständig.

## Was das fertige PDF über Sie verrät

Jedes PDF führt einen Info-Block mit sich: Autor, Producer, Erstellungsdatum, manchmal einen Titel. Je nach erzeugendem Programm stehen dort Ihr Kontoname, der Name Ihres Rechners und die Minute, in der die Datei entstanden ist.

Das ist keine Kleinigkeit, denn ein PDF legt man in aller Regel an, um es jemandem zu schicken: eine Bewerbung, ein Antrag, ein Nachweis für die Hausverwaltung. Die Metadaten reisen mit, und jeder Reader zeigt sie auf Knopfdruck an.

Das Werkzeug hier lässt den Block bis auf seinen eigenen Namen leer: keine Dateinamen, kein Rechnername, kein Benutzername, und ein Erstellungsdatum nur dann, wenn Sie das Häkchen dafür setzen. Arbeiten Sie mit einem anderen Programm, werfen Sie einmal einen Blick in die Dokumenteigenschaften des Ergebnisses.

Davon zu trennen sind die Bilder selbst. Ob deren EXIF- und GPS-Tags erhalten bleiben, hängt am Weg: Ein unverändert übernommenes JPEG behält alles, was darin stand, ein neu kodiertes Bild verliert die Tags nebenbei. Wenn Ihnen daran liegt, säubern Sie die Fotos vorher mit dem [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/). Was da alles zusammenkommt, zeigt [der zugehörige Ratgeber](https://abox.tools/de/ratgeber/exif-und-gps-daten-entfernen/).

## Wenn das PDF zu groß gerät

Handyfotos sind groß, und zwanzig davon ergeben ein Dokument, an dem jeder Mailserver scheitert. Drei Hebel, der Wirkung nach geordnet:

**Die lange Kante verkleinern.** Ein Blatt Papier mit 4000 Pixeln Kantenlänge trägt weit mehr Detail, als Reader oder Drucker je zeigen. Herunter auf rund 2000 Pixel viertelt die Datei üblicherweise, und auf der Seite sieht das niemand.

**Für alles Fotografische JPEG statt verlustfrei.** Verlustfrei gehört zu Diagrammen, nicht zum Foto einer Textseite.

**Das fertige Dokument komprimieren.** Der [PDF-Kompressor](https://abox.tools/de/pdf-verkleinern/) geht nicht über die Pixelzahl, sondern darüber, wie groß ein Bild auf der Seite überhaupt dargestellt wird, und das ist das Maß, auf das es ankommt. Was das kostet, steht in [seinem Ratgeber](https://abox.tools/de/ratgeber/pdf-kleiner-machen/).

Eine Obergrenze für die Anzahl der Bilder gibt es im Werkzeug nicht. Die praktische Grenze zieht der Arbeitsspeicher Ihres Geräts, denn das fertige Dokument entsteht dort, bevor Sie es herunterladen. Als Erstes bekommen das ein paar hundert Handyfotos in voller Auflösung zu spüren, und eine kleinere lange Kante schiebt die Grenze weit nach hinten.

## Was dabei nicht herauskommt

Ein PDF aus Fotografien bleibt ein PDF voller Bilder. Die Wörter darin sind kein Text: nicht durchsuchbar, nicht kopierbar, für einen Screenreader schlicht nicht vorhanden. Das liegt am Ausgangsmaterial und nicht an der Umwandlung.

Durchsuchbaren Text bekommen Sie nur über OCR, und das ist eine ganz andere Aufgabe. Existiert das Original irgendwo noch als richtiges Dokument, schlägt der direkte PDF-Export das Abfotografieren ohnehin um Längen: kleiner, schärfer, durchsuchbar.

## Warum dafür kein Upload nötig ist

Ein PDF zu schreiben heißt, eine strukturierte Datei zu schreiben: Kopfteil, eine Reihe von Objekten, eine Querverweistabelle. Nichts davon übersteigt einen Browser, und nichts an der Aufgabe verlangt, dass die Bilder irgendwohin reisen.

Hier zählt das besonders, wegen dessen, was in solchen Dokumenten landet. Ausweispapiere, Kontoauszüge, Arztbriefe, unterschriebene Verträge: Wer überhaupt ein PDF anlegt, tut es meistens, weil das Dokument an eine Behörde, eine Bank oder eine Versicherung geht. Netzfunktionen hat das Werkzeug hier keine, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns.

Wie Sie das selbst nachprüfen, hier wie anderswo, steht in [Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)
