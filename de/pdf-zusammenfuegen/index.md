# PDF zusammenfügen — und Seiten teilen und neu ordnen

Seiten umsortieren, ohne den Umweg über einen Server.

> PDFs zusammenfügen, eines in mehrere teilen und Seiten in die gewünschte Reihenfolge ziehen, alles im eigenen Browser. Es wird nichts hochgeladen, ein Konto brauchen Sie nicht, und die fertige Datei wird noch einmal geöffnet und nachgezählt, bevor sie Ihnen angeboten wird.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/pdf-zusammenfuegen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Dokumente werden **nie hochgeladen**. Es gibt keinen Server.

Jedes Dokument, das Sie auswählen, wird im Arbeitsspeicher dieses Geräts geöffnet, auseinandergenommen und wieder hinausgeschrieben, von Code, der von dieser Adresse stammt. Einen Upload kann hier nichts auslösen, und am anderen Ende dieser Seite steht auch kein Server, der einen entgegennähme.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So fügen Sie ein PDF zusammen, teilen es oder ordnen es neu

1. **Wählen Sie Ihre PDFs aus.** Ziehen Sie sie auf das Auswahlfeld oder suchen Sie sie von Hand heraus, und legen Sie später ruhig noch welche nach. Die Seiten jeder Datei hängen sich hinten an die laufende Reihenfolge an, und genau deshalb lassen sich zwei Ordner nacheinander zusammenfügen. Gelesen werden sie vom Browser direkt von Ihrer Festplatte.
2. **Bringen Sie die Seiten in die gewünschte Reihenfolge.** Ziehen Sie eine Seite am Griff, oder schubsen Sie sie mit den Pfeilen. Drehen Sie eine, die quer eingescannt wurde, nehmen Sie eine heraus, oder tippen Sie `1-3, 8, 12-` in das Feld, um gleich eine ganze Folge zu behalten, zu entfernen oder zu drehen. Die Nummern werden dabei laufend neu vergeben, was Sie sehen, ist also immer das, was in der fertigen Datei steht.
3. **Sagen Sie, ob ein Dokument herauskommt oder mehrere.** Eines ist die übliche Antwort. Der Rest sind Arten zu schneiden: alle so und so viele Seiten, an von Ihnen genannten Seitenzahlen, eine Datei je Seite, oder zurück in die Dateien, aus denen die Seiten kamen. Mehr als eine Datei wird als ein einziges ZIP übergeben, damit es einmal Speichern gibt statt fünfzigmal.
4. **Bauen Sie es, und lesen Sie die Zeile, die sagt, dass geprüft wurde.** Wenn die Dokumente geschrieben sind, wird jedes davon vom selben Leser auf dieser Seite noch einmal geöffnet und seine Seiten werden gezählt. Weicht das von dem ab, was Sie verlangt haben, gilt der Durchlauf als fehlgeschlagen und es wird kein Download angeboten.

## Die ausführliche Fassung

[PDF-Seiten zusammenfügen, teilen und umsortieren](https://abox.tools/de/ratgeber/pdf-zusammenfuegen-und-teilen/): PDFs verbinden, eines in mehrere zerlegen und Seiten umstellen: was die Umsortierung übersteht, was kein Werkzeug mitnehmen kann, und warum dafür nichts hochgeladen werden muss.

## Auch im Werkzeugkasten

- [PDF-Kompressor](https://abox.tools/de/pdf-verkleinern/): Ein Dokument verkleinern, ohne es irgendwohin zu schicken.
- [PDF-Schwärzer](https://abox.tools/de/pdf-schwaerzen/): Die Buchstaben werden aus der Datei gelöscht, und danach wird die Datei durchsucht, um es zu belegen.
- [Bilder in PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/): Ihre Bilder in ein einziges Dokument packen.
- [Dokumentenscanner](https://abox.tools/de/dokumente-scannen/): Fotografieren Sie die Seite. Zurück kommt etwas, das wie gescannt aussieht.

## Fragen

### Werden meine PDFs irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, kopiert und schreibt sie auf Ihrer eigenen Hardware. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Eine wahlweise Netzfunktion gibt es hier überhaupt nicht.

### Wie viele Dateien kann ich zusammenfügen, und wie groß dürfen sie sein?

Im Werkzeug steht keine Grenze. Die Grenze ist Ihr eigenes Gerät: Die Dokumente liegen während der Arbeit im Arbeitsspeicher, ein Laptop fügt also ein paar hundert Megabyte klaglos zusammen und tut sich irgendwo darüber schwer. Es wird nichts berechnet, gedrosselt, mit einem Wasserzeichen versehen oder in eine Warteschlange gestellt, denn am anderen Ende ist niemand, der so etwas täte.

### Kostet Zusammenfügen oder Teilen Qualität?

Nein. Auf einer Seite wird nichts neu kodiert, neu gezeichnet oder neu komprimiert. Der Inhaltsstrom jeder Seite und jede Schrift, jedes Bild und jede Vektorgrafik, auf die er verweist, werden Byte für Byte übernommen. Text bleibt also markierbar und durchsuchbar, und ein Foto ist dasselbe Foto. Was sich ändert, ist einzig die Reihenfolge der Seiten und die Struktur darum herum.

### Was passiert mit Lesezeichen und Links?

Beide werden neu aufgebaut statt weggeworfen. Ein Lesezeichen, dessen Seite noch in der Ausgabe steht, zeigt dorthin, wohin diese Seite gewandert ist; eines, dessen Seite Sie entfernt haben, fällt weg, es sei denn, darunter hängen noch Einträge, dann bleibt es als Überschrift stehen. Beim Zusammenfügen mehrerer Dateien landen die Lesezeichen jeder Datei unter einer nach ihr benannten Überschrift. Links zwischen Seiten werden genauso nachgeführt, samt der benannten Ziele, die Word und LaTeX schreiben, und ein Link, dessen Ziel nicht mitgekommen ist, bleibt lieber ohne Wirkung zurück, als den Lesenden irgendwohin Falsches zu schicken. Links auf Webadressen bleiben, wie sie sind.

### Was wird nicht mit übernommen?

Vier Dinge, und das Werkzeug sagt es beim Ergebnis und nicht im Kleingedruckten. Der Baum der getaggten Lesereihenfolge, den Screenreader benutzen, die Seitenbezeichnungen (die Nummerierung „iii, iv, 1, 2“), eingebettete Dateianhänge, und jede Aktion, die weder „gehe zu einer Seite“ noch „öffne eine Webadresse“ ist, das JavaScript eines Dokuments eingeschlossen. Die ersten beiden beschreiben eine Reihenfolge, die es nach dem Verschieben von Seiten nicht mehr gibt; das letzte ist nichts, worum Sie gebeten haben. Wenn Ihnen die Barrierefreiheit eines Dokuments wichtig ist, heben Sie das Original mit auf.

### Bleiben ausgefüllte Formulare erhalten?

Ja. Formularfelder und was darin steht, kommen mit ihren Seiten mit, und das neue Dokument wird als Formular angemeldet, damit Leseprogramme es auch als eines behandeln. Eines sollten Sie beim Zusammenfügen wissen: Zwei Felder mit demselben Namen sind für jedes Leseprogramm ein einziges Feld. Fügen Sie also zwei Kopien desselben Formulars zusammen, füllt ein Eintrag auf der einen Seite dasselbe Feld auf der anderen mit aus. Das Werkzeug erkennt diesen Fall und sagt es.

### Öffnet es ein passwortgeschütztes PDF?

Nein, und das mit Absicht. Ein verschlüsseltes Dokument wird mit einer entsprechenden Meldung abgelehnt, auch wenn das Passwort leer ist, und genau so speichern viele Scanner und Kopierer. Einer Datei den Schutz zu nehmen, ist eine andere Aufgabe als ihre Seiten zu verschieben, und ein Werkzeug, das es stillschweigend täte, täte etwas, worum Sie nicht gebeten haben.

### Warum gibt es keine Seitenvorschauen?

Weil eine Seite zu zeichnen einen vollständigen PDF-Renderer bedeutet, mit Schriften, Verläufen, Transparenzgruppen und Mischmodi, also ein Megabyte Engine oder mehr, das für ein paar Vorschaubilder geladen und ausgeführt werden müsste. Die Kacheln zeigen stattdessen das, worauf das Umsortieren tatsächlich beruht: die Seitenzahl, Form und Größe des Papiers, die Drehung, mit der sie geschrieben wird, und aus welcher Datei sie stammt. Ein querer Scan in einem Stapel hochkanter Seiten fällt so trotzdem sofort auf.

### Lässt sich die fertige Datei überall öffnen?

Ja. Die Ausgabe wird als PDF 1.5 geschrieben, oder in der höchsten Version, die eine der übergebenen Dateien gebraucht hat, und 1.5 versteht jedes Leseprogramm, das seit 2003 ausgeliefert wurde. Das Werkzeug belegt das auch auf Ihrem eigenen Gerät: Es öffnet jede fertige Datei noch einmal und zählt ihre Seiten, indem es den Seitenbaum durchgeht, bevor es sie Ihnen anbietet.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und keine Größengrenze außer dem, was der Arbeitsspeicher Ihres Geräts hergibt. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Dokumente übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Dokumente zum Zusammenfügen wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Dokumente haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Dieses Werkzeug fügt der Liste nichts hinzu, denn es hat gar keine eigene Netzfunktion, nicht einmal eine wahlweise. Es gibt hier keinen Endpunkt, an dem Ihre Dateien eingesammelt werden könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Zusammenfügen ist die Aufgabe, bei der ein Upload am meisten wehtut.** Die Dokumente, die Menschen zusammenlegen, sind gerade die, die irgendwoher stammen: ein Vertrag und seine Unterschriftsseite, ein Passscan und ein Kontoauszug, ein Arztbrief und ein Antragsformular. Ein Online-Dienst hat sie dann alle beisammen, an einer Stelle, schon sortiert. Dieses Werkzeug hat eine Seite in Ihrem Browser und keine zweite Hälfte.
- **Das ganze Format steht in diesem Repository.** Ein PDF ist eine Liste von Objekten und eine Tabelle, wo jedes davon anfängt. `src/objects.js` liest diese Syntax, `src/reader.js` folgt der Tabelle, `src/assemble.js` kopiert Seiten zwischen Dokumenten und `src/writer.js` schreibt das Ergebnis. Keine der vier Dateien importiert etwas, das eine Anfrage stellen könnte. Es wird keine Bibliothek nachgeladen und nichts auf einem Server gezeichnet.
- **Verschlüsselte Dateien werden abgewiesen statt geöffnet.** Ein PDF mit Passwort wird abgelehnt, auch die Sorte, die Scanner mit leerem Passwort erzeugen und die sich technisch öffnen ließe. Einem Dokument den Schutz zu nehmen, ist eine andere Aufgabe als seine Seiten umzusortieren, und es stillschweigend zu tun, wäre eine überraschende Eigenmächtigkeit.
- **Die fertige Datei sagt nicht, wo sie entstanden ist.** Keine Erzeugerzeile, kein Erstellungsdatum, kein Name des Werkzeugs. Sie trägt auch nicht das XMP-Paket oder die privaten Blöcke mit, die ein Layoutprogramm hinterlässt. Die gehören zu dem Dokument, das es einmal gab, und nicht zu dem, das Sie gerade gebaut haben. Was auf den Seiten selbst steht, wird exakt kopiert: Dieses Werkzeug verschiebt Seiten und schreibt nicht um, was darauf steht.
- **Aktionen, die nicht „gehe zu einer Seite“ heißen, werden nicht mitkopiert.** Ein PDF kann Anweisungen enthalten, die beim Öffnen laufen: Spiele dies, sende dieses Formular an jene Adresse, führe dieses JavaScript aus. Seiten, die durch dieses Werkzeug gehen, behalten ihre Links auf andere Seiten und auf Webadressen und verlieren den Rest. Dass Sie fremde Seiten umsortieren, ist kein Grund, das Skriptwerk eines fremden Dokuments in Ihre neue Datei zu tragen.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihre Dokumente übergeben, weder eine Datei noch eine Seite, ein Name, eine Größe oder eine Seitenzahl. Jede Zeile, die ein PDF liest, kopiert oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihre Dokumente bekommt er nichts. Es passiert nichts, solange Sie nicht klicken, und was Sie dann öffnen, ist die Seite von jemand anderem.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihre Dokumente zum Zusammenfügen wegschickt, bliebe stehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy und `src/assemble.js` für das gesamte Kopieren, also dafür, wie eine Seite aus einem Dokument gehoben und in ein anderes gelegt wird und was dabei mit Absicht zurückbleibt. Ans Netz kommt diese Datei nicht, und der Leser und der Schreiber daneben auch nicht.
