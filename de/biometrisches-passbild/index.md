# Passbild erstellen — Pass- und Visumfotos nach Vorschrift

Land auswählen. Es wendet genau die Vorschrift dieses Landes an.

> Ein Pass- oder Visumfoto nach der veröffentlichten Vorschrift Ihres Landes: exakte Millimeter und DPI, eine mitlaufende Kontrolle von Kopfhöhe und Augenlinie, eine Hintergrundprüfung, ein druckfertiger 10x15-Bogen und eine Datei, die in die KB-Grenze des Portals passt. Es wird nichts hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/biometrisches-passbild/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Fotos werden **nie hochgeladen**. Es gibt keinen Server.

Der Zuschnitt, das Messen, das Auslesen des Hintergrunds und der Druck laufen alle in Ihrem eigenen Browser, auf Ihrer eigenen Hardware, mit dem JPEG-Kodierer, den er ohnehin mitbringt. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, weder etwas abzurufen noch etwas zu senden. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Foto Ihres Gesichts gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Funktioniert offline
- ✓ Quelloffen

## So machen Sie ein Passbild, das nicht zurückkommt

1. **Wählen Sie das Foto aus.** Ein Handybild vor einer schlichten Wand, bei Tageslicht, aus etwa anderthalb Metern Abstand. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Wählen Sie Land und Dokument.** Die Tafel zeigt dann Druckgröße, Kopfhöhenband, Augenlinie, Hintergrundfarbe und Upload-Grenzen dieser Vorschrift, jeweils mit der Behörde, aus der die Zahl stammt, und dem Datum, an dem sie abgelesen wurde. Nichts auf dieser Liste ist geraten, und alles, was Sie zugeschickt bekommen haben und was nicht darauf steht, kommt unter „Irgendwo anders“ hinein.
3. **Prüfen Sie die vier Punkte auf Ihrem Gesicht.** Scheitel, Kinn und jede Pupille — an diesen vier Punkten hängt alles, was die Vorschrift misst. Gesetzt werden sie, indem das Bild selbst vermessen wird, und die Zeile darunter sagt, was davon gelang und was errechnet werden musste. Ziehen Sie zurecht, was danebenliegt, oder schalten Sie auf *Ich setze sie selbst* und machen alle vier von Hand. Drücken Sie dann *Rahmen einpassen*, und der Zuschnitt landet dort, wo dieses Land ihn haben will.
4. **Lesen Sie die vier Prüfungen und den Hintergrund.** Kopfhöhe, Augenlinie, Zentrierung und Neigung, jeweils am Rahmen gemessen, wie er gerade steht, und jeweils mit dem Hinweis, in welche Richtung zu ziehen ist, wenn etwas nicht stimmt. Der Hintergrund wird oben und an den Seiten des Zuschnitts ausgelesen und mit der Farbe verglichen, die die Vorschrift verlangt. Die Ungleichmäßigkeit, an der Fotos tatsächlich scheitern, wird getrennt von der Farbe gemessen.
5. **Nehmen Sie die drei Dateien mit.** Den Druck, auf den exakten Millimeter, mit der Auflösung in der Datei, damit ein Laden ihn in der richtigen Größe druckt. Den Bogen, mit so vielen Abzügen, wie auf ein ⁦10 × 15⁩ passen, und Schnittmarken in den Zwischenräumen. Und den Upload, in der Pixelgröße, die das Portal verlangt, und innerhalb des KB-Bandes, das es an beiden Enden durchsetzt.

## Die ausführliche Fassung

[Ein Passbild machen, das nicht zurückkommt](https://abox.tools/de/ratgeber/passbild-selbst-machen/): Woran ein Passbild wirklich gemessen wird — Kopfhöhe, Augenlinie, Hintergrund —, welches Land welche Zahlen verlangt, und wie Sie die Pixel- und KB-Grenzen eines Online-Formulars treffen.

## Auch im Werkzeugkasten

- [Bild-Stacker](https://abox.tools/de/bilder-stacken/): Zwanzig Aufnahmen werden eine, ohne zwanzig Uploads und ohne RAW-Konverter.
- [Bild-Schwärzer](https://abox.tools/de/bild-schwaerzen/): Was Sie abdecken, wird aus der Datei gelöscht und nicht darin versteckt.
- [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/): Sehen, was ein Foto über Sie verrät. Und es dann herausnehmen.
- [DICOM-Viewer](https://abox.tools/de/dicom-viewer/): CT, MRT, Röntgen und Ultraschall, mit Fenster, Header und Messungen.

## Fragen

### Wird mein Foto irgendwohin hochgeladen?

Nein. Ihr eigener Browser dekodiert, schneidet, vermisst und schreibt das Bild auf Ihrer eigenen Hardware, mit dem JPEG-Kodierer, den der Browser ohnehin mitbringt. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, es ruft nie etwas ab und sendet nie etwas, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Das wiegt hier schwerer als bei den meisten Werkzeugen, denn die Datei ist ein Foto Ihres Gesichts.

### Welche Länder sind abgedeckt?

Bisher übertragen sind der ICAO-Standard selbst, die Vereinigten Staaten (Pass und die Bewerbung um die Diversity-Visa-Lotterie, die unterschiedliche Upload-Regeln haben), das Vereinigte Königreich, das Schengen-Visum, Deutschland, Kanada, Australien, Indien (Pass, der Abzug in ⁦35 × 45⁩ mm sowie das Formularfoto und die Unterschrift für SSC und UPSC), China und Japan. Jeder Eintrag nennt die Behörde, aus der er stammt, und das Datum, an dem er abgelesen wurde. Alles andere kommt unter „Irgendwo anders“ hinein, wo Sie jede Zahl selbst eintippen. Da der größte Teil der Welt nach der ICAO-Geometrie ausstellt, beginnt dieser Eintrag auch mit ihr.

### Wie findet es Scheitel, Kinn und Augen ohne Gesichtsmodell?

Indem es etwas voraussetzen darf, was ein allgemeiner Gesichtserkenner nicht voraussetzen darf: Jede dieser Vorschriften verlangt dieselbe Szene — eine Person, frontal zur Kamera, vor einer schlichten, gleichmäßig ausgeleuchteten Wand. Also wird die Farbe der Wand am Rand des Bildes abgelesen, alles, was nicht diese Farbe ist, ist die Person, und deren oberste Stelle ist der Scheitel, Haare eingeschlossen. Die Pupillen sind das beste Paar von Flecken, die dunkler sind als ihre eigene Umgebung, auf gleicher Höhe und beiderseits der Kopfmitte — ein rein örtlicher Vergleich, an dem nichts von der Farbe eines Gesichts abhängt. Das Kinn ist das eine, was sich so nicht finden lässt, denn ein Kiefer vor einem Hals ist eine weiche Kante ohne Farbwechsel; es wird aus den Pupillen errechnet, die etwas unterhalb der Mitte eines Kopfes sitzen, sobald das Haar darüber mitgezählt wird, und dann an der Kontur geprüft. Alles davon ist Rechnerei in `src/detect.js`: keine Gewichte, keine Laufzeitumgebung, nichts Abgerufenes — und dieselbe Rechnerei für jedes Gesicht. Das Letzte ist der Punkt, denn ein mitgeliefertes Modell liegt ungleichmäßig falsch, bei manchen Gesichtern schlechter als bei anderen, und ausgerechnet die Menschen, deren Fotos ohnehin am häufigsten abgelehnt werden, würden im Stich gelassen.

### Wie sehr soll ich den gesetzten Punkten trauen?

Genug, um davon auszugehen; nicht genug, um nicht hinzusehen. Zu jedem der vier gibt es ein Foto, bei dem er danebenliegt: Vor einer gemusterten Wand oder einem Bücherregal gibt es keine Kontur, an der sich ein Kopf abheben ließe, bei einem oben angeschnittenen Kopf ist der Scheitel gar nicht im Bild, und eine Brille, ein dichter Pony oder geschlossene Augen können die Pupillen auf das falsche Merkmal setzen. Deshalb sagt das Werkzeug ausdrücklich, welche der vier es gemessen hat und welche es errechnen musste, verweigert bei einem Bild ohne schlichten Hintergrund lieber die Antwort, als eine zu erfinden, und lässt jeden Punkt verschiebbar. Der Zuschnitt entsteht dort, wo die Punkte am Ende liegen, nie dort, wo sie angefangen haben. Wer alle vier lieber selbst setzt, findet über dem Bild den Schalter *Ich setze sie selbst* — und einen Punkt von Hand zu verschieben schaltet von sich aus dorthin, denn von da an gehören sie Ihnen und nichts verschiebt sie mehr.

### Was ist die Kopfhöhenregel, und warum scheitert meine ständig daran?

Jede dieser Vorschriften sagt, wie viel vom Bild der Kopf ausfüllen muss, gemessen von der Kinnunterkante bis zum obersten Punkt des Kopfes, Haare eingeschlossen. Meist sind es 70 bis 80 Prozent, bei einem 45 mm hohen Foto also 31,5 bis 36 mm. Der übliche Grund fürs Scheitern ist ein Selfie: eine Armlänge sind etwa 60 cm, was das Gesicht verzerrt und den Kopf zu groß ins Bild setzt. Der zweithäufigste Grund ist der Scheitel. Gemeint ist der oberste Punkt der Haare, nicht der Haaransatz, und wer den Haaransatz markiert, bekommt jeden Kopf zu klein.

### Warum muss die Datei mindestens 20 KB haben, und wie kann man sie auffüllen?

Indische Prüfungsportale, das chinesische Visumformular und der britische Pass-Upload nennen neben einer Höchstgröße auch eine Mindestgröße, denn eine Datei darunter ist meist ein versehentlich hochgeladenes Vorschaubild. Ein Foto mit ⁦200 × 230⁩ hat 46.000 Pixel und kann selbst bei der besten Qualität, die ein Browser schreibt, bei 15 KB landen, ohne dass sich durch weniger Kompression etwas machen ließe. Also fügt das Werkzeug ein JPEG-Kommentarsegment voller Leerzeichen an. Das gehört zum JPEG-Standard, jeder Dekoder überspringt es, und das Bild bleibt Bit für Bit dasselbe Bild, nur die Datei ist länger. Genau das steht auch in der Auffüllung, auf Englisch, in der Datei selbst.

### Prüft es den Hintergrund, und kann es einen austauschen?

Es prüft und tauscht nicht aus. Die Farbe wird aus einem Streifen über dem oberen Rand des Zuschnitts und an beiden Seiten oberhalb der Schultern ausgelesen und mit der Farbe der Vorschrift verglichen, und zwar in CIE Lab statt in RGB: Zwei Grautöne, die vierzig RGB-Einheiten auseinanderliegen, sind nicht zu unterscheiden, vierzig Einheiten Blau dagegen sind eine andere Farbe. Die Ungleichmäßigkeit wird getrennt gemessen, denn ein Schatten auf einer weißen Wand ist das, woran Fotos wirklich scheitern, und das ist kein Farbproblem. Einen Hintergrund zu ersetzen hieße, einen Menschen aus einem Bild auszuschneiden, und das ist ein Segmentierungsmodell, das im schlechten Fall Haare frisst. Einen halben Meter weiter von der Wand wegzutreten, behebt mehr davon als jeder Filter.

### Wozu ist der 10-x-15-Bogen da?

Ein Automat nimmt für sechs Fotos ein paar Euro. Ein Fotoschalter druckt ein ⁦10 × 15⁩ für Cents, und das kann jeder. Also legt das Werkzeug so viele Abzüge Ihres Fotos auf das Papier, wie darauf passen, bei ⁦35 × 45⁩ auf ⁦10 × 15⁩ sind das acht, mit Schnittmarken in den Zwischenräumen und ohne dass etwas über ein Bild gedruckt wird. Skaliert wird nichts: Jeder Abzug hat genau die Größe, die die Vorschrift verlangt, denn ein Bogen, der sie um zwei Prozent schrumpfte, um einen mehr unterzubringen, wären acht Fotos in der falschen Größe. Drucken Sie ihn mit 100 Prozent; „an Seite anpassen“ ist das, was einen Bogen falsch herauskommen lässt.

### Warum sind die DPI wichtig, wenn die Pixel dieselben sind?

Weil ein JPEG sagen kann, wie groß es ist, und wenn es das nicht tut, rät das Druckprogramm. Die Auflösung steht im JFIF-Kopf, und eine Browser-Leinwand schreibt diesen Kopf mit dem Einheitenfeld auf „das ist ein Seitenverhältnis, keine Auflösung“. Dieses Werkzeug schreibt diese wenigen Bytes um, sodass die Datei 300 dpi angibt, und erst das macht aus ⁦413 × 531⁩ Pixeln ein Foto von ⁦35 × 45⁩ mm statt eines Bildes ohne bestimmte Größe. Dafür wird nichts dekodiert und keine Qualität ausgegeben.

### Kann es auch die Unterschriftsdatei?

Ja. Die SSC- und UPSC-Formulare wollen eine mit ⁦140 × 60⁩ Pixeln und zwischen 10 und 20 KB, und sie steht als eigene Vorschrift auf der Liste. Die Gesichtsüberlagerung ist dafür abgeschaltet, denn eine Unterschrift hat keine Augenlinie. Geprüft wird stattdessen, dass das Papier hell ist, dass Tinte darauf ist und dass der Zuschnitt keine Linierung und keinen Blattrand mitgenommen hat. Die 10 KB zu erreichen ist bei dieser Regel der schwere Teil, nicht das Unterschreiten von 20.

### Garantiert das, dass mein Antrag angenommen wird?

Nein, und ehrlicherweise kann das kein Werkzeug. Was es tut, ist die veröffentlichten Zahlen exakt anzuwenden und Ihnen jede Messung zu zeigen, die es gemacht hat. So stimmt das, was ein Formular automatisch misst, also Pixelgröße, Dateigröße und Format, und das, was ein Mensch beurteilt, also Kopfhöhe, Augenlinie und Hintergrund, liegt mit Zahlen vor Ihnen. Die Regeln ändern sich außerdem: Jede Vorschrift hier nennt ihre Behörde und ihr Lesedatum, damit Sie sie gegen das Formular vor sich prüfen können, statt einer Tabelle zu vertrauen.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen quer über Ihrem Gesicht. Wie viele Fotos Sie machen, ist ebenfalls nicht begrenzt, denn es zahlt kein Server dafür. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihr Foto übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das Regelwerk ist eine Datei, die mit der Seite kommt, und keine Abfrage. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr Foto zum Zuschneiden wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ein Foto Ihres Gesichts verlässt dieses Gerät nie.** Das wiegt hier schwerer als bei den meisten Werkzeugen: Die Datei, die diese Seite in die Hand nimmt, ist ein Bild Ihres Gesichts, und was Sie damit vorhaben, nennt zugleich das Land, dessen Dokument Sie beantragen. In der `Content-Security-Policy` steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihr Foto eingesammelt werden könnte.
- **Nichts hier ruft etwas ab.** In `src/` gibt es nirgends ein `fetch`, kein `XMLHttpRequest` und kein `sendBeacon`. Das Regelwerk ist eine Tabelle in `src/specs.js`, die mit der Seite ausgeliefert und mit ihr zwischengespeichert wird. Es gibt keine Länderliste nachzuschlagen und nichts, wogegen Ihr Foto aus der Ferne geprüft würde.
- **Das Gesicht wird ohne Gesichtsmodell gefunden.** Es gibt keine Gewichte zum Herunterladen, keine Laufzeitumgebung für sie und nichts, was abgerufen wird: Der Scheitel kommt aus der Kontur Ihres Kopfes vor der Wand dahinter, die Pupillen aus den Stellen des Gesichts, die dunkler sind als ihre Umgebung. Nichts daran liest Hautfarbe, und genau deshalb ist es so geschrieben — ein Modell, das falsch liegt, liegt ungleichmäßig falsch, bei manchen Gesichtern schlechter als bei anderen. Es ist eine Ausgangslage und kein Urteil: Die Seite sagt, welchen der vier Punkte sie nicht messen konnte, jeder Punkt bleibt verschiebbar, und mit *Ich setze sie selbst* ist es ganz abgeschaltet.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird irgendetwas über Ihr Foto, Ihr Gesicht oder die gewählte Vorschrift übergeben. Jede Zeile, die eine Datei liest, zuschneidet, vermisst oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/specs.js` für das Regelwerk, also die veröffentlichten Zahlen jedes Landes samt Behörde und Datum, an dem sie abgelesen wurden, `src/detect.js` dafür, wie die vier Punkte gefunden werden — eine Kontur und zwei dunkle Flecken, ohne jedes Modell —, `src/geometry.js` für die Rechnung, die aus vier gesetzten Punkten einen Zuschnitt macht, und `src/jpeg.js` für die zwei Kopfänderungen, die die Druckauflösung in die Datei schreiben und einen zu kleinen Upload auf die Größe bringen, auf der ein Formular besteht.
