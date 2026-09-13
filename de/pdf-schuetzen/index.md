# PDF schützen — mit einem Passwort, und mit Einschränkungen, wenn Sie möchten

Ein Dokument sperren, das Sie zum Sperren lieber keiner Website in die Hand geben.

> Ein PDF mit einem Passwort versehen oder Drucken und Kopieren einschränken, im eigenen Browser. AES-256 als Voreinstellung, es wird nichts hochgeladen, und die fertige Datei wird hier noch einmal geöffnet, um zu belegen, dass das Passwort hält, bevor sie Ihnen angeboten wird.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/pdf-schuetzen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Dokumente werden **nie hochgeladen**. Es gibt keinen Server.

Das Dokument, das Sie wählen, wird im Arbeitsspeicher dieses Geräts geöffnet, verschlüsselt und wieder hinausgeschrieben, von Code, der von dieser Adresse stammt. Einen Upload kann hier nichts auslösen, und am anderen Ende dieser Seite steht kein Server, der einen entgegennähme. Weder die Datei noch das Passwort, das Sie eintippen, verlässt den Tab.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So versehen Sie ein PDF mit einem Passwort oder schränken es ein

1. **Wählen Sie das PDF.** Ein Dokument nach dem anderen. Der Browser liest es direkt von Ihrer Festplatte, und es wird hier geöffnet. Ein Dokument, das schon ein Passwort braucht, wird mit einem Link zum Entsperrer abgewiesen; eines, das nur Einschränkungen trägt, wird angenommen, und was Sie unten setzen, ersetzt sie.
2. **Setzen Sie das Passwort zum Öffnen, und tippen Sie es noch einmal.** Das ist die eigentliche Sperre. Wer dieses Passwort hat, liest das Dokument; sonst niemand, und nichts hier oder sonst irgendwo Ehrliches stellt es wieder her, wenn es vergessen ist. Die beiden Felder müssen übereinstimmen, bevor der Knopf freigegeben wird. Lassen Sie beide leer, wenn Sie nur Einschränkungen für ein Dokument möchten, das sich weiterhin für jeden öffnet.
3. **Haken Sie die Einschränkungen an, wenn Sie welche möchten.** Drucken, Text und Bilder herauskopieren und das Dokument verändern. Das sind Bitten, die sich gut benehmende Leseprogramme beachten, keine Verschlüsselung, und die Seite sagt das neben den Kästchen. Ein Besitzerpasswort hebt sie auf; lassen Sie dieses Feld leer, übernimmt das Öffnungspasswort beide Aufgaben, und setzen Sie gar kein Passwort, wird ein zufälliges verwendet und weggeworfen, damit sich die Einschränkungen nicht aufheben lassen, indem man einfach nichts eingibt.
4. **Schützen Sie es, und lesen Sie die Zeile, die sagt, dass geprüft wurde.** Das Dokument wird unter einem frischen Schlüssel chiffriert hinausgeschrieben. Dann wird die fertige Datei hier zweimal noch einmal geöffnet, einmal ohne Passwort, wo sie abgelehnt werden muss, und einmal mit Ihrem, wo sie sich mit derselben Seitenzahl öffnen muss. Schlägt eine der beiden Prüfungen fehl, bekommen Sie keinen Download und eine Meldung, die das sagt.

## Die ausführliche Fassung

[How to password-protect a PDF, and what it is actually worth](https://abox.tools/de/guides/protect-a-pdf/): A password on a PDF is a real lock. A restriction on printing is a request. What each one does, which encryption to choose, why the upload is the strange part of every online tool, and what happens if you forget the password.

## Auch im Werkzeugkasten

- [PDF-Wasserzeichen](https://abox.tools/de/pdf-wasserzeichen/): Ein Scan, der sagt, wohin er gegangen ist, kann nicht stillschweigend woandershin gehen.
- [PDF-Schwärzer](https://abox.tools/de/pdf-schwaerzen/): Die Buchstaben werden aus der Datei gelöscht, und danach wird die Datei durchsucht, um es zu belegen.
- [PDF zu CSV](https://abox.tools/de/pdf-in-csv-umwandeln/): Findet jede Tabelle in einem PDF und macht daraus Zeilen, die eine Tabellenkalkulation öffnen kann.
- [Bilder in PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/): Ihre Bilder in ein einziges Dokument packen.

## Fragen

### Ist ein passwortgeschütztes PDF wirklich sicher?

Mit der Voreinstellung hier ja, genau so sicher wie das Passwort: AES-256 mit dem Passwort-Hash von PDF 2.0 ist das aktuelle Verfahren, und es gibt keine Abkürzung hindurch. Wissenswert ist, dass nicht jedes „passwortgeschützte“ PDF so entstanden ist. Das Format hat fünf Generationen hinter sich, von einem 40-Bit-Schlüssel aus dem Jahr 1994, den ein Laptop schlicht durchsuchen kann, bis zu diesem hier, und Leseprogramme melden sie alle mit denselben Worten. Diese Seite schreibt das stärkste und nennt das andere, das sie schreiben kann, beim Namen.

### Was ist der Unterschied zwischen dem Passwort und den Einschränkungen?

Ein PDF hat Platz für zwei Passwörter. Das *Benutzerpasswort* ist das, nach dem ein Leseprogramm fragt; ohne es öffnet sich die Datei nicht, und das ist echt. Das *Besitzerpasswort* hebt die *Einschränkungen* auf, also Drucken, Kopieren, Bearbeiten, und die sind eine Bitte. Ein Dokument, das sich ohne Passwort öffnet, muss alles enthalten, was zum Ableiten seines eigenen Schlüssels nötig ist. Das Einzige, was ein Leseprogramm also vom Drucken abhält, ist ein Feld, das es zu beachten versprochen hat, und jedes Leseprogramm darf das ablehnen. Der [PDF-Entsperrer](https://abox.tools/de/pdf-entsperren/) auf dieser Website ist eines, das ablehnt. Setzen Sie Einschränkungen, um zu sagen, was Sie sich wünschen; setzen Sie ein Passwort, um sicherzugehen.

### Was ist, wenn ich das Passwort vergesse?

Dann ist das Dokument verloren, und das hören Sie besser hier als von einer Website zur „Passwort-Wiederherstellung“, die zuerst Ihre Datei nimmt. Nichts auf dieser Website errät Passwörter, Sie können `src/shared/pdf-crypt.js` lesen und sehen, dass darin keine Schleife ist, und bei einem Dokument, das mit dem voreingestellten Verfahren gesperrt ist, hätte nichts Ehrliches irgendwo Erfolg. Deshalb verlangt die Seite das Passwort zweimal. Heben Sie Ihr Original auf: Es wird hierdurch nicht verändert, und es ist die Kopie, die Sie brauchen, falls das Passwort je verloren geht.

### Soll ich AES-256 oder AES-128 wählen?

AES-256, es sei denn, ein Leseprogramm von vor 2010 muss die Datei öffnen. Die 256-Bit-Option ist das Verfahren von PDF 2.0, das Acrobat X und neuer, jeder Browser, jedes Telefon und jedes aktuelle Leseprogramm verstehen. Die 128-Bit-Option ist das Verfahren von 2005, das diese älteren Leseprogramme kennen, und sie ist schwächer, nicht wegen der Chiffre, sondern wegen der Schlüsselableitung von 1994 davor, die das Erraten eines Passworts weit billiger macht, als die Chiffre vermuten lässt. Wenn Sie nicht wissen, welches Leseprogramm die Datei öffnen wird, wählen Sie 256.

### Kann ich ein PDF schützen, das schon geschützt ist?

Wenn es sich ohne Passwort öffnet und nur Einschränkungen trägt, ja: Legen Sie es ab, und was Sie setzen, ersetzt das Vorhandene. Wenn es zum Öffnen ein Passwort verlangt, weist diese Seite es ab und zeigt auf den [PDF-Entsperrer](https://abox.tools/de/pdf-entsperren/), der den alten Schutz im selben Browser abnimmt; bringen Sie die entsperrte Kopie für den neuen hierher zurück. Zwei Sperren auf einem Dokument kann das Format nicht ausdrücken, ein Passwort zu ändern heißt also immer: erst abnehmen, dann neu setzen.

### Sieht das Dokument danach anders aus?

Nein. Nichts wird neu gerendert, neu kodiert oder neu umbrochen: Die Zeichenanweisungen jeder Seite, jede eingebettete Schrift und jedes Bild werden genau so übernommen, wie sie ankamen, nur chiffriert. Für alle, die das Passwort haben, bleibt Text markierbar, Scans behalten ihre ursprüngliche Auflösung, und nichts verrutscht. Die Datei kann etwas kleiner herauskommen, weil ein Neuschreiben die überholten Kopien von Objekten zurücklässt, die frühere Bearbeitungen darin hinterlassen haben, und etwas größer, wo die Verschlüsselung jedem Stream sechzehn Bytes hinzufügt.

### Was passiert mit einem signierten Dokument?

Seine Signatur ist danach nicht mehr gültig, und daran führt kein Weg vorbei. Eine Signatur deckt genau die Bytes der Datei ab, auf die sie angewendet wurde, jede Änderung überhaupt, durch jedes Programm, auch das, das signiert hat, macht sie also ungültig. Dieses Werkzeug schreibt eine neue Datei, bemerkt, wenn das Original signiert war, und sagt es beim Ergebnis. Wenn Sie ein Dokument brauchen, das signiert und geschützt ist, schützen Sie es zuerst und signieren Sie die geschützte Kopie.

### Werden meine Dokumente oder Passwörter irgendwohin hochgeladen?

Nein. Die Datei wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, verschlüsselt und geschrieben, und das Passwort geht in eine Schlüsselableitung, die in diesem Tab läuft. Dieses Werkzeug hat keine Serverseite, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört dieser Website. Am einfachsten überzeugen Sie sich, indem Sie die Netzverbindung trennen und die Seite trotzdem benutzen. Bei diesem Werkzeug von allen ist das der Punkt: Ein Dokument, das Sie sperren, ist eines, das Sie vorher lieber nicht herumreichen.

### Woher weiß ich, dass der Schutz wirklich drauf ist?

Weil das Werkzeug es auf Ihrem Gerät prüft und Ihnen das Ergebnis zeigt. Ist die Datei geschrieben, wird sie demselben Leser übergeben, den die anderen PDF-Werkzeuge dieser Website benutzen, und zwar zweimal. Ohne Passwort muss er sie rundheraus ablehnen; mit dem Passwort, das Sie gesetzt haben, muss sie sich öffnen, mit derselben Seitenzahl zurückkommen und die Einschränkungen melden, die Sie angehakt haben. Schlägt eine der beiden Prüfungen fehl, gilt der Durchlauf als gescheitert, und es wird nichts zum Herunterladen angeboten. Nachprüfen können Sie es anschließend auch selbst: Öffnen Sie die Datei in einem beliebigen Leseprogramm, das nach dem Passwort fragen wird, und sehen Sie in den Dokumenteigenschaften nach den Berechtigungen.

### Gibt es eine Größenbeschränkung, und kostet es etwas?

In das Werkzeug ist keine Grenze geschrieben. Die Grenze ist Ihr eigenes Gerät: Das Dokument liegt während der Bearbeitung im Speicher, ein Laptop nimmt also ein paar hundert Megabyte klaglos hin und kommt irgendwo darüber ins Straucheln. Es ist kostenlos, es gibt kein Konto, keine Anmeldung und keine Testphase. Die Seite trägt Werbung, und die bezahlt sie; die Werbung bekommt nichts über Ihre Dokumente.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie danach die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Weg zu prüfen, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr Dokument zum Verschlüsseln wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Das eine Werkzeug, bei dem ein Upload den Zweck zunichtemachte.** Ein Dokument, das ein Passwort verdient, ist per Definition eines, das Sie nicht in fremden Händen sehen möchten. Jedes Online-Werkzeug, das anbietet, es zu schützen, verlangt zuerst, dass Sie es abgeben, erst das ungeschützte Original und dann das Passwort, das Sie gewählt haben, an einen Server, dessen Aufbewahrung Sie nicht einsehen können. Diese Seite kann das nicht. Die Datei wird von Ihrem eigenen Browser gelesen, der Schlüssel wird in diesem Tab abgeleitet, die verschlüsselte Kopie wird im Arbeitsspeicher geschrieben, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört dieser Website. Trennen Sie die Netzverbindung, und es arbeitet weiter, und einen einfacheren Beweis gibt es nicht.
- **Ein Passwort ist echt. Eine Einschränkung ist eine Bitte. Die Seite hält beides auseinander.** Ein *Öffnungspasswort* sperrt das Dokument wirklich: Der Inhalt wird mit einem daraus abgeleiteten Schlüssel chiffriert, das Passwort steht nirgends in der Datei, und wer es nicht hat, liest kein Wort. *Einschränkungen*, also kein Drucken, kein Kopieren, kein Bearbeiten, sind etwas anderes. Ein Dokument, das sich ohne Passwort öffnet, muss alles enthalten, was zum Ableiten seines eigenen Schlüssels nötig ist. Was ein Leseprogramm also vom Drucken abhält, ist ein Berechtigungsfeld, das es zu beachten verspricht, und jedes Leseprogramm darf das ablehnen. Adobe hat das von Anfang an so dokumentiert, und der [PDF-Entsperrer](https://abox.tools/de/pdf-entsperren/) auf dieser Website ist eines der Programme, die ablehnen. Einschränkungen lohnen sich trotzdem: Mit ihnen sagen Sie, was Sie sich wünschen, und die meisten Leseprogramme hören darauf. Sie sind nur keine Sperre, und diese Seite behauptet das auch nicht.
- **AES-256, das aktuelle Verfahren, es sei denn, Sie wählen das ältere.** Die PDF-Verschlüsselung hat fünf Generationen hinter sich, und Leseprogramme melden sie alle als „passwortgeschützt“. Die Voreinstellung hier ist die neueste: AES-256 mit dem Passwort-Hash von PDF 2.0, der absichtlich teuer zu berechnen ist, und das einzige Verfahren der Familie, das noch als stark gilt. Ein so gesperrtes Dokument ist so gut wie das Passwort darauf. Der eine Grund, die andere Option zu wählen, AES-128 mit der Schlüsselableitung von 1994, ist ein Leseprogramm von vor 2010, das die Datei öffnen muss, und die Seite sagt das neben der Auswahl, statt das schwächere Verfahren als gleichwertig neben das stärkere zu stellen.
- **Das Passwort wird zweimal verlangt, weil es keinen Weg zurück gibt.** Nichts auf dieser Website errät Passwörter, und nichts Ehrliches anderswo tut es: Ein Dokument, das mit einem starken Verfahren und einem Passwort gesperrt ist, an das sich niemand erinnert, ist ein Dokument, das niemand mehr lesen wird. Deshalb wird das Öffnungspasswort zweimal eingetippt, die beiden müssen übereinstimmen, und die Seite sagt einmal in klaren Worten, dass ein vergessenes Passwort eine verlorene Datei bedeutet. Heben Sie Ihr Original auf. Daran ändert sich hier nichts.
- **Die fertige Datei wird hier noch einmal geöffnet, bevor sie Ihnen angeboten wird.** Bis das geschieht, korrigiert dieses Werkzeug mit allem oben nur seine eigene Hausaufgabe. Also werden die Bytes, die gleich Ihr Download werden, demselben Leser übergeben, den jedes PDF-Werkzeug dieser Website benutzt, und zwar zweimal: einmal ohne Passwort, wo er ablehnen muss, und einmal mit dem Passwort, das Sie gesetzt haben, wo er öffnen und mit derselben Seitenzahl und den gewünschten Einschränkungen zurückkommen muss. Eine Datei, die eine der beiden Prüfungen nicht besteht, wird als gescheitert gemeldet, ohne Download.
- **Die Seiten selbst werden nicht neu gerendert, neu kodiert oder neu umbrochen.** Was sich ändert, ist die Verschlüsselung um das Dokument herum, nicht das Dokument. Die Zeichenanweisungen jeder Seite, jede eingebettete Schrift und jedes Bild werden genau so hinausgeschrieben, wie sie ankamen, nur chiffriert. Text bleibt also markierbar und durchsuchbar für alle, die das Passwort haben, Scans behalten die Auflösung, mit der sie gescannt wurden, und auf keiner Seite verrutscht etwas. Das eine, was sich doch ändert, ändert jedes Neuschreiben: Ältere, überholte Kopien von Objekten, die frühere Bearbeitungen zurückgelassen haben, werden nicht übernommen.
- **Eine digitale Signatur übersteht das nicht, und die Seite sagt es, wenn eine da ist.** Eine Signatur deckt genau die Bytes der Datei ab, auf die sie angewendet wurde, jedes Neuschreiben macht sie also ungültig; genau dafür ist eine Signatur da. Dieses Werkzeug schreibt eine neue Datei, die Kopie, die Sie zurückbekommen, ist also unsigniert, und es sagt das beim Ergebnis, wenn es eine Signatur findet, vor der es warnen muss. Ihr Original ist weiterhin das signierte. Wenn Sie beides brauchen, signieren Sie nach dem Schützen, nicht davor.
- **Ein Dokument, das schon gesperrt ist, wird erst nebenan geschickt.** Eine Datei, die zum Öffnen ein Passwort braucht, wird hier nicht mit einem Passwort über dem Passwort noch einmal gesperrt. Sie wird abgewiesen, mit einem Link zum [PDF-Entsperrer](https://abox.tools/de/pdf-entsperren/), der den alten Schutz im selben Browser abnimmt, und die entsperrte Kopie kommt für den neuen hierher zurück. Eine Datei, die sich für jeden öffnet und nur Einschränkungen trägt, wird angenommen, und Sie erfahren klar, dass das, was Sie setzen, das Vorhandene ersetzt.
- **Was Google lädt und was es nicht bekommt.** Die Skripte für Werbung und Messung kommen von Google. Keines von beiden bekommt irgendetwas über Ihr Dokument: keine Datei, keine Seite, keinen Namen, keine Größe, keine Seitenzahl, kein Passwort und nicht, womit die Datei geschützt war. Jede Zeile, die ein PDF liest, verschlüsselt oder schreibt, wird von dieser Domain ausgeliefert und steht im Repository.
- **Was der Spenden-Knopf lädt und was er nicht bekommt.** Der Knopf „Buy me a coffee“ im Kopfbereich wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Er ist ein Link und sonst nichts: Er meldet keinen Besuch, und er bekommt nichts über Sie oder Ihre Dokumente. Es passiert nichts, bis Sie ihn anklicken, und dann sind Sie auf einer fremden Seite.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihr Dokument zum Verschlüsseln wegschickt, bliebe stehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/shared/pdf-crypt.js` dafür, wie aus einem Passwort der Schlüssel eines Dokuments wird und wie daraus das /Encrypt-Wörterbuch entsteht, und `src/shared/aes.js` für die Chiffre selbst. Keine dieser Dateien kommt ins Netz, und der Leser und der Schreiber daneben auch nicht.
