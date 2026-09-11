# PDF komprimieren — ein PDF verkleinern

Ein Dokument verkleinern, ohne es irgendwohin zu schicken.

> Ein PDF verkleinern, ohne es hochzuladen. Ihr eigener Browser liest die Datei, komprimiert sie neu und schreibt sie neu, und vorher zeigt Ihnen das Werkzeug, wo die Größe tatsächlich steckt.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/pdf-verkleinern/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Dokumente werden **nie hochgeladen**. Es gibt keinen Server.

Das Dokument wird auf diesem Gerät im Arbeitsspeicher geöffnet, zerlegt und wieder geschrieben, und zwar von Code, den diese Adresse selbst ausliefert. Einen Upload kann hier nichts durchführen, und am anderen Ende dieser Seite stünde auch kein Server, der einen entgegennehmen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So verkleinern Sie ein PDF

1. **Wählen Sie ein PDF aus.** Ziehen Sie es auf das Auswahlfeld oder suchen Sie es von Hand heraus. Der Browser liest es direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Sehen Sie nach, wo die Größe steckt.** Die Aufschlüsselung ist der eigentliche Sinn des zweiten Schritts. Besteht der Balken überwiegend aus Bildern, hat dieses Werkzeug etwas zu tun. Besteht er überwiegend aus Schriften und Seiteninhalt, sagt es das, und die ehrliche Ersparnis liegt dann bei wenigen Prozent. Das sollten Sie wissen, bevor Sie eine Minute dafür aufwenden.
3. **Sagen Sie, wie stark gepresst werden soll.** Hinter den benannten Einstellungen stehen Auflösungen und keine vagen Stufen: 96 dpi zum Lesen am Bildschirm, 130 zum Verschicken per E-Mail, 220 für etwas, das noch gedruckt werden muss. Gemessen wird jede daran, wie groß das Bild auf der Seite tatsächlich erscheint. Ein als Miniatur platziertes Foto wird also anders behandelt als ein ganzseitiger Scan.
4. **Komprimieren Sie, und achten Sie auf die Zeile, die die Prüfung meldet.** Ist das Neuschreiben fertig, öffnet derselbe Leser auf dieser Seite die fertige Datei noch einmal und zählt ihre Seiten. Weicht das vom Original ab, gilt der Durchlauf als gescheitert, und ein Download wird gar nicht erst angeboten.

## Die ausführliche Fassung

[So machen Sie ein PDF kleiner, und warum manche nicht schrumpfen](https://abox.tools/de/ratgeber/pdf-kleiner-machen/): Wo bei einem PDF die Größe wirklich sitzt, warum ein Scan um 80 Prozent schrumpft und ein Vertrag sich kaum rührt, was dpi hier bedeutet und was ein Kompressor mit Ihrem Dokument niemals anstellen darf.

## Auch im Werkzeugkasten

- [PDF-Schwärzer](https://abox.tools/de/pdf-schwaerzen/): Die Buchstaben werden aus der Datei gelöscht, und danach wird die Datei durchsucht, um es zu belegen.
- [Bilder in PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/): Ihre Bilder in ein einziges Dokument packen.
- [Dokumentenscanner](https://abox.tools/de/dokumente-scannen/): Fotografieren Sie die Seite. Zurück kommt etwas, das wie gescannt aussieht.
- [Ton aus Video extrahieren](https://abox.tools/de/ton-aus-video-extrahieren/): Ziehen Sie ein Video hinein und nehmen Sie den Ton heraus. Das Bild wird nie dekodiert, und hochgeladen wird nichts.

## Fragen

### Wird mein PDF irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest die Datei auf Ihrer eigenen Hardware, komprimiert sie neu und schreibt sie neu. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Eine optionale Netzfunktion gibt es hier ebenfalls nicht.

### Wie viel kleiner wird mein PDF?

Das hängt vollständig davon ab, was darin steckt, und genau deshalb misst das Werkzeug es und zeigt es Ihnen, bevor es irgendetwas komprimiert. Ein gescanntes Dokument besteht fast nur aus Fotografien und wird üblicherweise ⁦60–90⁩ % kleiner. Ein Vertrag oder eine Abschlussarbeit besteht dagegen aus Text, Vektorzeichnung und eingebetteten Schriften, die das erzeugende Programm alle längst komprimiert hat. Dort liegt die Ersparnis meist bei wenigen Prozent und stammt aus dem Neupacken der Datei und aus allem, worauf nichts mehr verweist. Wer Ihnen ohne einen Blick in Ihre Datei einen festen Prozentsatz verspricht, rät.

### Verliert ein PDF beim Komprimieren an Qualität?

Die Bilder darin werden neu kodiert, für die also ja. Sonst wird nichts angefasst. Text bleibt Text, markierbar und durchsuchbar, die Schriften bleiben vollständig, und die Vektorzeichnung wird exakt übernommen. Ein Bild umsonst zu verschlechtern weigert sich das Werkzeug außerdem: Wird eine Neukodierung nicht kleiner als das Original, wandern die Originalbytes unangetastet zurück ins Dokument.

### Was ist hier dpi, und warum wird danach gefragt?

Ein PDF hält fest, wie groß jedes Bild auf der Seite dargestellt wird, und daraus kann das Werkzeug die tatsächliche Auflösung ausrechnen. Ein Scan mit 4000 Pixeln, über zwanzig Zentimeter Papier gelegt, bringt es auf rund 500 Pixel pro Zoll. Damit kann kein Bildschirm und kaum ein Drucker etwas anfangen, also fallen die Pixel oberhalb Ihrer Einstellung zuerst weg. Sie kosten nur Platz für Qualität, die niemand sehen kann. Diese Messung ist auch der Grund, warum ein klein platziertes Logo anders behandelt wird als ein ganzseitiger Scan.

### Kann es ein passwortgeschütztes PDF öffnen?

Nein, und das ist Absicht. Ein verschlüsseltes Dokument wird mit einer entsprechenden Meldung abgelehnt, selbst wenn das Passwort leer ist, und genau so speichern viele Scanner und Kopierer. Einer Datei den Schutz zu nehmen ist eine andere Aufgabe, als sie zu komprimieren. Ein Werkzeug, das das stillschweigend täte, täte etwas, worum Sie nie gebeten haben.

### Gibt es PDFs, die es nicht komprimieren kann?

Einzelne Bilder darin, ja. Für JPEG 2000, JBIG2 und faxkodierte (CCITT-)Bilder bringt kein Browser einen Decoder mit, also werden sie unangetastet durchgereicht und als solche gemeldet. Die letzten beiden sind ohnehin Zweiton-Codecs und meist schon nahe an ihrem Minimum. CMYK-Bilder bleiben ebenfalls unberührt, weil eine Neukodierung die Farben verschieben könnte, die am Ende aus dem Drucker kommen. Alles, was das Werkzeug auslässt, steht mit Begründung bei den Ergebnissen.

### Lässt sich die komprimierte Datei überall noch öffnen?

Ja. Die Ausgabe wird als PDF 1.5 geschrieben, und das versteht jeder Reader, der seit 2003 ausgeliefert wurde. Belegt wird das auf Ihrem eigenen Gerät, denn das Werkzeug öffnet die fertige Datei noch einmal und zählt ihre Seiten, bevor es sie Ihnen anbietet. Formulare, Links, Lesezeichen, die Barrierefreiheitsstruktur und eingebettete Anhänge kommen mit. Zurück bleibt nur das Material, auf das im Dokument nichts mehr verwiesen hat.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und keine Grenze für die Dateigröße außer der, die der Arbeitsspeicher Ihres Geräts vorgibt. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihr Dokument übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihr Dokument zum Komprimieren wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihr Dokument hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Dieses Werkzeug fügt der Liste auch nichts hinzu, denn es hat gar keine eigene Netzfunktion, nicht einmal eine optionale. Es gibt hier keinen Endpunkt, an dem Ihre Datei landen könnte, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Das ganze Format liegt in diesem Repository.** Ein PDF ist eine Liste von Objekten und eine Tabelle, wo jedes beginnt. `src/objects.js` liest diese Syntax, `src/reader.js` folgt der Tabelle, `src/writer.js` schreibt eine neue, und keines der drei importiert irgendetwas, das eine Anfrage stellen könnte. Es wird keine Bibliothek nachgeladen und nichts auf einem Server gerendert.
- **Verschlüsselte Dateien werden abgewiesen statt geöffnet.** Ein PDF mit Passwort wird abgelehnt, auch die Sorte, die Scanner mit leerem Passwort erzeugen und die sich technisch öffnen ließe. Einem Dokument den Schutz zu nehmen ist eine andere Aufgabe, als es zu verkleinern, und stillschweigend erledigt wäre sie ein reichlich überraschender Übergriff für ein Werkzeug.
- **Es nimmt heraus, statt hineinzuschreiben.** Die fertige Datei trägt kein Erstellungsdatum, keine Producer-Zeile und keinen Namen des Werkzeugs, das sie gemacht hat. Mit gesetztem Häkchen verliert sie außerdem das XMP-Paket und die privaten Blöcke, die Layout-Programme hinterlassen. Das ist dasselbe Argument, das auch das EXIF-Werkzeug vorbringt, nur auf einen anderen Container angewendet.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Dokument übergeben, weder eine Datei noch eine Seite, ein Name, eine Größe oder eine Seitenzahl. Jede Zeile, die ein PDF liest, dekodiert oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihr Dokument bekommt er nichts. Solange Sie ihn nicht anklicken, passiert nichts, und was Sie damit ansteuern, ist die Seite von jemand anderem.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht, denn ein Werkzeug, das Ihr Dokument zum Komprimieren wegschickt, bliebe an dieser Stelle stehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, sowie `src/reader.js` und `src/writer.js` für das gesamte Lesen und Neuschreiben, wovon keines ans Netz kommt.
