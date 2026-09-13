# PDF zu CSV — jede Tabelle darin, Kontoauszüge eingeschlossen

Findet jede Tabelle in einem PDF und macht daraus Zeilen, die eine Tabellenkalkulation öffnen kann.

> Die Tabellen in einem PDF in eine CSV verwandeln: Konto- und Kreditkartenauszüge, Rechnungen, Preislisten, Berichte. Jede Tabelle auf jeder Seite wird daran gefunden, wo ihr Text sitzt, und ein laufender Saldo wird Zeile für Zeile geprüft, wo es einen gibt. Es wird nichts hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/pdf-in-csv-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Dokumente werden **nie hochgeladen**. Es gibt keinen Server.

Das PDF, das Sie wählen, wird auf diesem Gerät im Arbeitsspeicher geöffnet und gelesen, von Code, der von dieser Adresse kommt, und die CSV wird auf demselben Weg geschrieben. Nichts hier kann etwas hochladen, und am anderen Ende dieser Seite steht kein Server, der es annehmen könnte. Was in den Tabellen steht, eine Kontonummer, ein Saldo, eine Liste von Zahlungsempfängern, die Preise eines Kunden, bleibt im Tab.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So verwandeln Sie die Tabellen in einem PDF in eine CSV

1. **Wählen Sie das PDF aus.** Eines nach dem anderen. Der Browser liest es direkt von Ihrer Festplatte, und zwar jede Seite davon, bevor irgendetwas entschieden wird, denn ob ein Dokument 1.240,00 oder 1,240.00 schreibt und in welcher Reihenfolge seine Daten stehen, sind Tatsachen über das Dokument und nicht über eine einzelne Seite.
2. **Sehen Sie sich die Tabellen an, die es gefunden hat.** Jede Tabelle auf jeder Seite, jede mit ihren eigenen Spalten und ihren eigenen Überschriften, wo die Seite welche gedruckt hat. Eine Tabelle, die unter denselben Überschriften über zwei Abschnitte oder zwei Seiten läuft, ist eine Tabelle, und die Überschriften werden mittendrin nicht wiederholt. Eine Zelle, die in eine zweite Zeile umgebrochen ist, wird in ihre Zeile zurückgefaltet. Summen, Zwischensummen und Beschriftungen kommen als die Zeilen durch, die sie auf der Seite sind.
3. **Nehmen Sie eine, oder nehmen Sie alle.** Gibt es mehr als eine Tabelle, wählt das Feld über ihnen, welche in die CSV kommt: alle nacheinander oder nur die, wegen der Sie gekommen sind. Führt eine Tabelle einen laufenden Saldo, sagt die Zeile über den Tabellen, ob jede Zeile aufgegangen ist. Daten mit Jahr kommen als YYYY-MM-DD heraus und Beträge als schlichte Zahlen mit Vorzeichen; ein Datum ohne Jahr bleibt genau so, wie es gedruckt war, denn das Jahr, zu dem es gehört, wäre geraten.
4. **Nehmen Sie die CSV mit.** Sie wird nach RFC 4180 geschrieben, mit korrekten Anführungszeichen und CRLF-Zeilenenden, als UTF-8 mit Byte-Order-Mark, damit Excel sie mit unversehrten Währungszeichen öffnet, statt Buchstaben daraus zu machen. Stehen alle Tabellen in einer Datei, behält jede ihre eigene Überschriftenzeile, und zwischen ihnen steht eine Leerzeile. Um sie zu erzeugen, wurde nichts hochgeladen.

## Die ausführliche Fassung

[Is it safe to upload a bank statement?](https://abox.tools/de/guides/is-it-safe-to-upload-a-bank-statement/): A statement is every payee, every amount and your balance in one file. Here is what a converter receives, what the careful ones do with it, and how to tell whether the upload needed to happen at all.

## Auch im Werkzeugkasten

- [Bilder in PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/): Ihre Bilder in ein einziges Dokument packen.
- [Dokumentenscanner](https://abox.tools/de/dokumente-scannen/): Fotografieren Sie die Seite. Zurück kommt etwas, das wie gescannt aussieht.
- [Ton aus Video extrahieren](https://abox.tools/de/ton-aus-video-extrahieren/): Ziehen Sie ein Video hinein und nehmen Sie den Ton heraus. Das Bild wird nie dekodiert, und hochgeladen wird nichts.
- [Audio-Schneider](https://abox.tools/de/audio-schneiden/): Markieren Sie beim Abspielen, was bleiben soll. Zurück kommt eine Datei, geschnitten genau dort, wo Sie es gesagt haben.

## Fragen

### Wie findet es Tabellen, wenn im PDF gar keine Tabelle steckt?

Daran, wo der Text sitzt. Eine Seite wird zuerst überall dort geteilt, wo eine Spalte Kleingedrucktes neben dem eigentlichen Inhalt läuft; von einer Spalte der Tabelle unterscheidet sie sich dadurch, dass die Zellen der Tabelle exakt eine Grundlinie teilen und das Kleingedruckte nur zufällig daneben sitzt. Dann wird jeder Teil von oben nach unten durchlaufen und an Überschriften und Lücken in Blöcke geschnitten, und die Spalten jedes Blocks sind die Stellen, an denen mehrere Zeilen sich einig sind, dass dort eine Zelle beginnt oder endet. Blöcke mit denselben Spalten werden wieder zu einer Tabelle zusammengefügt. Es gibt keine Vorlage je Bank oder Formular, und darum auch kein Layout, das ihm nie beigebracht wurde.

### Funktioniert es nur bei Kontoauszügen?

Nein. Es begann als Umwandler für Kontoauszüge und wurde so umgebaut, dass es jede Tabelle in einem Dokument findet, denn der erste echte Auszug, der hindurchging, hatte zwei Buchungen und fünf andere Tabellen, und ein Werkzeug, das nur die Buchungen wollte, fand gar nichts. Rechnungen, Preislisten, Fahrpläne, Ergebnisse und Berichte sind auf dieselbe Weise Tabellen. Was ein Kontoauszug hinzufügt, ist ein laufender Saldo, und wo einer da ist, prüft das Werkzeug jede Zeile daran.

### Was passiert mit einem Buchungstext, der zu lang für seine Spalte ist?

Er wird in seine Zeile zurückgefaltet, und genau daran scheitert die meiste PDF-zu-CSV-Ausgabe. Eine Zeile mit einer einzigen Zelle voller Wörter, dicht an einer Tabellenzeile gesetzt, ist die Fortsetzung der Zelle dieser Tabellenzeile; sie wird in die Zeile darunter statt in die darüber gefaltet, wenn sie näher an jener sitzt, denn so wird eine lange Beschriftung über ihrem Wert gedruckt. Eine Zeile mit mehr als einer Zelle oder mit einer Zahl darin ist eine eigene Zeile.

### Wie kann es überhaupt wissen, ob es meinen Kontoauszug richtig gelesen hat?

Weil die meisten Kontoauszüge einen laufenden Saldo führen, und ein laufender Saldo ist ein Beweis und keine Zierde. Wenn der auf jeder Zeile gedruckte Saldo wirklich der Saldo der Zeile darüber plus der Betrag dieser Zeile ist, dann wurden die Beträge richtig gelesen, die Zeilen richtig getrennt und keine weggelassen oder doppelt gezählt; jeder dieser Fehler reißt die Kette an der Zeile, an der er passiert ist. Das Werkzeug macht diese Subtraktion auf jeder Zeile und sagt Ihnen das Ergebnis. Es findet auf diese Weise auch die Saldospalte, statt eine Überschrift zu lesen, eine Tabelle, die besteht, hat ihre Spalten also zwangsläufig richtig erkannt bekommen. Eine Tabelle ohne Saldo lässt sich so nicht prüfen, und die Seite tut nicht so, als wäre sie es.

### Meine Daten sind falsch herausgekommen. 03/04 ist der vierte März, nicht der dritte April.

Ändern Sie das Feld über den Tabellen, und alles wird sofort neu gemacht. Ein numerisches Datum ist wirklich mehrdeutig, und das Werkzeug entscheidet es aus dem Dokument und nicht aus Ihrem Standort: Hat irgendein Datum irgendwo darin einen Tag über dem Zwölften, entscheidet diese eine Zeile die Reihenfolge für alle, und die Seite sagt das. Fällt jedes Datum auf den Zwölften oder davor, steht nichts in der Datei, was sie auseinanderhalten könnte, also sagt sie *das* und nimmt den Tag zuerst, bis Sie es anders sagen. Ein Datum, das ohne Jahr gedruckt ist, wie Kreditkartenabrechnungen es tun, bleibt genau so, wie es geschrieben war.

### Funktioniert es bei einem gescannten PDF?

Nein, und es sagt das, statt Ihnen eine leere Datei zu geben. Ein Scan ist ein Foto: Die Zeilen sind Pixel, und es gibt keinen Text, der sich ausrichten ließe. Die Seite zeigt Ihnen dann, was Sie stattdessen tun können, und bei einem Kontoauszug ist der erste Vorschlag der, den die meisten übersehen: Fast jede Online-Bank gibt Ihnen denselben Auszug direkt als CSV, OFX oder QIF, und das braucht keine Umwandlung und ist genauer, als jedes Lesen aus einem Bild sein könnte.

### Kann es ein passwortgeschütztes PDF öffnen?

Nein, und das ist Absicht. Banken sperren viele Auszüge, meist mit einem Geburtsdatum oder den letzten Ziffern einer Kontonummer. Diesen Schutz zu entfernen ist eine andere Aufgabe, als eine Tabelle zu lesen, also weigert sich dieses Werkzeug und zeigt Ihnen die Wege, es zu tun, ohne dass die Datei Ihr Gerät verlässt. Der beste davon ist der [PDF-Entsperrer](https://abox.tools/de/pdf-entsperren/) auf dieser Seite: Er entfernt das Passwort in Ihrem eigenen Browser und ändert nichts auf den Seiten, der Text kommt hier also genau dort an, wo er gedruckt war. Das Dokument aus Chrome oder Edge zurück in ein PDF zu drucken oder es auf einem Mac aus der Vorschau zu exportieren funktioniert ebenfalls. Benutzen Sie keine andere Website, die anbietet, es zu entsperren; das wäre der Upload genau des Dokuments, das diese Seite vom Internet fernhalten soll.

### Wird mein PDF irgendwohin hochgeladen?

Nein. Die Datei wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, und die CSV wird dort geschrieben. Eine Serverseite hat dieses Werkzeug nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Der einfachste Beweis ist, die Internetverbindung zu trennen und trotzdem ein PDF umzuwandeln.

### Warum steht am Anfang der CSV ein seltsames Zeichen?

Das ist eine Byte-Order-Mark, und sie steht dort mit Absicht. Excel unter Windows liest eine CSV ohne sie mit der alten Codepage des Systems, eine Tabelle in Pfund oder Euro kommt also mit einem Buchstaben anstelle des Währungszeichens an. Die Marke sagt ihm, dass die Datei UTF-8 ist. Jeder Leser, der zählt, überspringt sie stillschweigend; ein Parser, der streng genug ist, sie zu zeigen, gibt eine erste Spaltenüberschrift mit einem unsichtbaren Zeichen davor zurück, und das ist der Preis dieses Tauschs.

### Gibt es eine Größengrenze, und kostet es etwas?

Eine Grenze ist im Werkzeug nicht festgeschrieben. Die Grenze ist Ihr eigenes Gerät: Das Dokument liegt im Arbeitsspeicher, während es gelesen wird, und das schafft ein Laptop bei mehreren hundert Seiten ohne Klagen. Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Dokumente übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr Dokument zum Umwandeln wegschickt, bliebe in dem Moment stehen, in dem Sie die Verbindung trennen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Die PDFs, die Menschen umwandeln, sind genau die, die einen Upload am wenigsten vertragen.** Für eine Tabelle, die man abtippen könnte, braucht niemand einen Umwandler. Was hierher kommt, sind Kontoauszüge, Rechnungen, Gehaltsabrechnungen und Berichte: eine Liste aller, an die jemand gezahlt hat, und was danach übrig war, die Preise eines Kunden, die Zahlen eines Unternehmens. Das dem Server eines Fremden zu geben, damit er eine Tabellenkalkulation daraus macht, heißt, dass er es hat, es behält und deswegen nun ein lohnendes Ziel für einen Angriff ist. Diese Seite hat keine andere Hälfte: Es gibt nichts, an das man es schicken könnte.
- **Wo eine Tabelle einen laufenden Saldo führt, wird jede Zeile daran geprüft.** Eine Tabelle in einem PDF zu finden ist Schließen, nicht Lesen: welche Zeilen zusammengehören, wo eine Spalte endet, ob eine Zeile eine neue Tabellenzeile ist oder der Rest der darüber. Bei einem Layout, das hier noch niemand gesehen hat, kann jeder dieser Schlüsse falsch sein. Der laufende Saldo eines Kontoauszugs ist ein Beweis dagegen: Der Saldo auf jeder Zeile muss der Saldo darüber plus der Betrag dieser Zeile sein, und eine einzige falsch gelesene Ziffer, eine weggefallene oder eine doppelte Zeile reißt die Kette genau an der Zeile, an der es passiert ist. Die Seite sagt, wie viele Zeilen standgehalten haben. Die meisten Tabellen haben keinen Saldo, und zu denen sagt die Seite nichts: Die Zeilen sind das, was auf den Seiten steht, und mehr behauptet hier nichts.
- **Die Tabellen kommen vom Papier, nicht aus einer Vorlage je Bank oder Formular.** In diesem Werkzeug gibt es keine Liste von Banken oder Layouts, und also auch kein Layout, das darin fehlen könnte. Eine Seite wird dort geteilt, wo eine Spalte Kleingedrucktes neben dem eigentlichen Inhalt läuft, und jeder Teil wird nach Folgen von Zeilen durchsucht, deren Zellen in einer Flucht stehen. Deshalb funktioniert es bei einem Auszug von einer Bank, von der niemand je gehört hat, oder bei einem Bericht, den niemand je gesehen hat, und deshalb kann es an einer Tabelle scheitern, deren Spalten wirklich ineinanderlaufen.
- **Passwörter werden hier nicht entfernt, und die Seite sagt, wo sie es werden können.** Ein PDF mit Passwort wird abgewiesen statt geöffnet. Den Schutz eines Dokuments zu entfernen ist eine andere Aufgabe, als seine Tabellen zu lesen, und es stillschweigend zu tun wäre eine überraschende Sache für ein Werkzeug, das in Ihrem Namen handelt. Stattdessen nennt die Seite die Wege, die eine entsperrte Kopie ergeben, ohne dass die Datei Ihr Gerät verlässt: den [PDF-Entsperrer](https://abox.tools/de/pdf-entsperren/) auf dieser Seite, der das Passwort in Ihrem eigenen Browser entfernt und auf der Seite nichts neu schreibt, oder den Druck zurück in ein PDF aus einem Browser oder aus der Vorschau. Und sie sagt nach wie vor ausdrücklich, das Dokument keiner anderen Website zu geben, die anbietet, es zu entsperren; das wäre genau der Upload, den es mit dieser Seite zu vermeiden gilt.
- **Das Foto einer Seite kann es nicht lesen, und es tut auch nicht so.** Ein Scan ist ein Bild: Die Zeilen sind Pixel, und in der Datei gibt es keinen Text, der sich zu Spalten ausrichten ließe. Das wird als das gemeldet, was es ist, samt den Auswegen, bei denen nichts hochgeladen wird. Bei einem Kontoauszug beginnt das mit dem einen, den die meisten haben und an den sie nicht denken: Die Bank gibt Ihnen denselben Auszug fast sicher direkt als CSV. Buchstaben aus einem Bild zu lesen ist OCR, und das ist ein anderes Werkzeug als dieses.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihr Dokument übergeben: keine Datei, keine Tabelle, keine Zeile, keine Zahl, kein Dateiname und keine Seitenzahl. Jede Zeile, die ein PDF liest oder eine CSV schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht: Er meldet keinen Besuch, und über Sie oder Ihre Dokumente bekommt er nichts. Es passiert nichts, solange Sie ihn nicht anklicken, und wohin Sie dann kämen, ist die Seite eines anderen.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihr Dokument zum Umwandeln wegschickt, bliebe stehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/layout.js` dafür, wie eine Seite ohne eine einzige gezogene Linie in Bereiche geteilt wird, `src/tables.js` dafür, wie die Tabellen und ihre Spalten gefunden werden, `src/rows.js` dafür, wie aus Textzeilen Tabellenzeilen werden, und `src/check.js` für die Rechnung, die einen Kontoauszug beweist. Keines davon kann das Netz erreichen, und der Leser darunter auch nicht.
