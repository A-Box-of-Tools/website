# PDF entsperren — Passwort und Einschränkungen abnehmen

Die meisten gesperrten PDFs brauchen gar kein Passwort. Dieses Werkzeug sagt Ihnen, welche Sorte Sie haben, bevor es sie anrührt.

> Das Passwort und die Einschränkungen für Drucken, Kopieren und Bearbeiten im Browser von einem PDF abnehmen. Die meisten geschützten Dateien brauchen gar kein Passwort, und dieses Werkzeug sagt Ihnen, welche Sorte Sie haben. Es wird nichts hochgeladen, und ein Passwort wird nie erraten.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/pdf-entsperren/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Dokumente werden **nie hochgeladen**. Es gibt keinen Server.

Das Dokument, das Sie wählen, wird im Arbeitsspeicher dieses Geräts geöffnet, entschlüsselt und wieder hinausgeschrieben, von Code, der von dieser Adresse stammt. Einen Upload kann hier nichts auslösen, und am anderen Ende dieser Seite steht kein Server, der einen entgegennähme. Weder die Datei noch das Passwort, das Sie eintippen, verlässt den Tab.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So entfernen Sie ein Passwort oder die Einschränkungen von einem PDF

1. **Wählen Sie das PDF.** Ein Dokument nach dem anderen. Der Browser liest es direkt von Ihrer Festplatte, und als Erstes wird es mit einem leeren Passwort probiert, denn das öffnet die Mehrheit der geschützten Dateien, weil die Mehrheit von ihnen nie verschlossen war.
2. **Lesen Sie, was die Seite gefunden hat.** Sie sagt, welche der beiden Schutzarten diese Datei trägt, welches Verfahren verwendet wurde und was dieses Verfahren heute wert ist, und sie listet jede Einschränkung auf, um deren Beachtung das Dokument die Leseprogramme bittet: Drucken, Kopieren, Bearbeiten, Kommentieren, das Ausfüllen von Formularen, das Umsortieren von Seiten, sogar das Vorlesen für jemanden, der es nicht sehen kann.
3. **Tippen Sie das Passwort ein, aber nur, wenn Sie danach gefragt werden.** Das Feld erscheint nur, wenn das leere Passwort das Dokument nicht geöffnet hat, und das ist der einzige Moment, in dem ein Passwort überhaupt etwas nützt. Jedes der beiden Passwörter des Dokuments funktioniert, das, das es öffnet, oder das Besitzerpasswort, das seine Einschränkungen aufhebt. Es wird nichts erraten, und was Sie eintippen, bleibt in diesem Tab.
4. **Nehmen Sie ihn ab, und lesen Sie die Zeile, die sagt, dass geprüft wurde.** Das Dokument wird mit seinem eigenen Schlüssel entschlüsselt und ganz ohne Verschlüsselungs-Wörterbuch hinausgeschrieben. Dann wird die fertige Datei hier noch einmal geöffnet, ohne Passwort, von einem Leser, der verschlüsselte Dokumente ablehnt. Öffnet sie sich nicht oder kommt sie mit einer anderen Seitenzahl zurück, bekommen Sie keinen Download und eine Meldung, die das sagt.

## Die ausführliche Fassung

[How to unlock a PDF, and which kind of locked it is](https://abox.tools/de/guides/unlock-a-pdf/): A PDF that will not print and a PDF that will not open are two different problems with one name. What each of them actually is, why one comes off in a click and the other cannot come off at all, and how to tell which you have.

## Auch im Werkzeugkasten

- [PDF-Schutz](https://abox.tools/de/pdf-schuetzen/): Ein Dokument sperren, das Sie zum Sperren lieber keiner Website in die Hand geben.
- [PDF-Wasserzeichen](https://abox.tools/de/pdf-wasserzeichen/): Ein Scan, der sagt, wohin er gegangen ist, kann nicht stillschweigend woandershin gehen.
- [PDF-Schwärzer](https://abox.tools/de/pdf-schwaerzen/): Die Buchstaben werden aus der Datei gelöscht, und danach wird die Datei durchsucht, um es zu belegen.
- [PDF zu CSV](https://abox.tools/de/pdf-in-csv-umwandeln/): Findet jede Tabelle in einem PDF und macht daraus Zeilen, die eine Tabellenkalkulation öffnen kann.

## Fragen

### Brauche ich das Passwort?

Meistens nicht, und die Seite sagt es Ihnen innerhalb einer Sekunde nach der Auswahl der Datei. Die meisten „geschützten“ PDFs, Kontoauszüge, Gehaltsabrechnungen, exportierte Berichte, alles aus dem Kästchen „Bearbeitung einschränken“ einer Office-Suite, öffnen sich für jeden und tragen bloß eine Liste von Dingen, um deren Unterlassung Leseprogramme gebeten werden. Die gehen mit einem Klick und ohne Passwort ab. Ein Dokument, das Sie beim Öffnen tatsächlich nach einem Passwort fragt, ist die andere Sorte, und für die brauchen Sie das Passwort.

### Kann es ein PDF öffnen, dessen Passwort ich nicht habe?

Nein, und es versucht es nicht. Es gibt in diesem Werkzeug kein Wörterbuch, keine Wortliste und nirgends eine Brute-Force-Suche; Sie können `src/shared/pdf-crypt.js` lesen und sehen, dass darin keine Schleife ist. Bei den ältesten Dokumenten, mit 40-Bit-Schlüsseln, würde eine Suche tatsächlich funktionieren, und genau deshalb steht die Weigerung geschrieben, statt dass man sie annehmen muss. Wenn Sie das Passwort zu Ihrem eigenen Dokument verloren haben, kann diese Seite Ihnen nicht helfen, und keine ehrliche kann es.

### Was ist der Unterschied zwischen den beiden Passwörtern?

Ein PDF hat Platz für zwei. Das *Benutzerpasswort* ist das, nach dem ein Leseprogramm Sie fragt; ohne es öffnet sich die Datei nicht. Das *Besitzerpasswort* hebt die Einschränkungen auf, also Drucken, Kopieren, Bearbeiten, und sehr oft hat ein Dokument ein Besitzerpasswort und gar kein Benutzerpasswort, weshalb es sich für jeden öffnet und sich trotzdem nicht drucken lässt. Dieses Werkzeug nimmt beide an und sagt Ihnen, mit welchem von beiden das Dokument es tatsächlich hineingelassen hat.

### Ist es legal, die Einschränkungen zu entfernen?

Das hängt vom Dokument ab und davon, wo Sie sind, und es ist eine Frage nach Ihren Rechten an der Datei, nicht nach der Technik. Was sich klar sagen lässt, ist, was das Format tut: Die Einschränkungen sind ein Feld im Dokument, das Leseprogramme aus Übereinkunft beachten, keine kryptographische Barriere, und Adobe hat sie seit ihrer Einführung so dokumentiert. Dieses Werkzeug ist für Dokumente, die Sie nutzen dürfen: Ihr eigener Kontoauszug, der sich nicht drucken lässt, ein Bericht, den Sie bezahlt haben und der sich nicht kopieren lässt, ein Scan, dessen Seiten Sie umsortieren müssen. Wenn Ihnen die Datei nicht zusteht, ändert nichts hier etwas daran.

### Welche Arten von Verschlüsselung beherrscht es?

Jede veröffentlichte: RC4 mit 40 und 128 Bit (Revisionen 2 und 3), AES-128 (Revision 4) und AES-256 sowohl in der zurückgezogenen Form von 2008 als auch in der aktuellen von PDF 2.0 (Revisionen 5 und 6). Was es nicht beherrscht, ist die zertifikatsbasierte Verschlüsselung, wo der Schlüssel zu einer Smartcard oder einem Schlüsselspeicher gehört statt zu einem Passwort, und die eine unveröffentlichte Variante von Adobe. Beide werden mit einer Meldung abgewiesen, die sagt, welche es sind, statt vage zu scheitern.

### Sieht das Dokument danach anders aus?

Nein. Nichts wird neu gerendert, neu kodiert oder neu umbrochen: Die Zeichenanweisungen jeder Seite, jede eingebettete Schrift und jedes Bild werden genau so übernommen, wie sie ankamen. Text bleibt markierbar, Scans behalten ihre ursprüngliche Auflösung, und nichts verrutscht. Die Datei kann etwas kleiner herauskommen, weil ein Neuschreiben die überholten Kopien von Objekten zurücklässt, die frühere Bearbeitungen darin hinterlassen haben.

### Was passiert mit einem signierten Dokument?

Seine Signatur ist danach nicht mehr gültig, und daran führt kein Weg vorbei. Eine Signatur deckt genau die Bytes der Datei ab, auf die sie angewendet wurde, jede Änderung überhaupt, durch jedes Programm, auch das, das signiert hat, macht sie also ungültig. Das ist der ganze Sinn einer Signatur. Dieses Werkzeug schreibt eine neue Datei, bemerkt, wenn das Original signiert war, und sagt es beim Ergebnis. Heben Sie Ihr Original auf: Es ist weiterhin das signierte.

### Werden meine Dokumente oder Passwörter irgendwohin hochgeladen?

Nein. Die Datei wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, entschlüsselt und geschrieben, und das Passwort geht in eine Schlüsselableitung, die in diesem Tab läuft. Dieses Werkzeug hat keine Serverseite, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört dieser Website. Am einfachsten überzeugen Sie sich, indem Sie die Netzverbindung trennen und die Seite trotzdem benutzen.

### Woher weiß ich, dass der Schutz wirklich weg ist?

Weil das Werkzeug es auf Ihrem Gerät prüft und Ihnen das Ergebnis zeigt. Ist die Datei geschrieben, wird sie demselben Leser übergeben, den die anderen PDF-Werkzeuge dieser Website benutzen, einem, der ein verschlüsseltes Dokument rundheraus ablehnt, und sie muss sich ohne Passwort öffnen und mit derselben Seitenzahl zurückkommen. Tut sie das nicht, gilt der Durchlauf als gescheitert, und es wird nichts zum Herunterladen angeboten. Nachprüfen können Sie es anschließend auch selbst: Öffnen Sie die Datei in einem beliebigen Leseprogramm und sehen Sie in den Dokumenteigenschaften nach, wo jetzt bei jeder Berechtigung „Zulässig“ stehen sollte.

### Gibt es eine Größenbeschränkung, und kostet es etwas?

In das Werkzeug ist keine Grenze geschrieben. Die Grenze ist Ihr eigenes Gerät: Das Dokument liegt während der Bearbeitung im Speicher, ein Laptop nimmt also ein paar hundert Megabyte klaglos hin und kommt irgendwo darüber ins Straucheln. Es ist kostenlos, es gibt kein Konto, keine Anmeldung und keine Testphase. Die Seite trägt Werbung, und die bezahlt sie; die Werbung bekommt nichts über Ihre Dokumente.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie danach die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Weg zu prüfen, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr Dokument zum Entsperren wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Die meisten geschützten PDFs sind gar nicht gesperrt, und diese Seite sagt das, bevor sie irgendetwas tut.** Ein PDF kann zwei recht verschiedene Dinge tragen. Ein *Öffnungspasswort* ist echt: Ohne es lässt sich die Datei nicht lesen, und nichts hier findet eines. *Einschränkungen*, also kein Drucken, kein Kopieren, kein Bearbeiten, sind es nicht. Eine Datei, die nur diese trägt, öffnet sich für jeden, und das heißt, sie muss alles enthalten, was zum Ableiten ihres eigenen Schlüssels nötig ist, denn Ihr Leseprogramm hat ihn abgeleitet. Was das Leseprogramm vom Drucken abhält, ist ein Berechtigungsfeld im Dokument, das sich gut benehmende Programme aus Übereinkunft beachten. Adobe hat das von Anfang an so dokumentiert. Es zu entfernen bricht nichts auf; es ist die Weigerung, sich freiwillig zu melden. Die Seite sagt Ihnen, welche der beiden Sorten Sie haben, und fragt nur dann nach einem Passwort, wenn es wirklich eines zu erfragen gibt.
- **Es errät keine Passwörter, und es gibt darin keine Schleife, die das könnte.** Hat ein Dokument ein Öffnungspasswort, geben Sie es an, oder das Dokument bleibt zu. Hier gibt es kein Wörterbuch, keine Wortliste und keinen Versuch an den 40-Bit-Schlüsseln der 1990er, die einer Suche tatsächlich zum Opfer fielen. Das ist eine bewusst gezogene Linie und keine Lücke, zu der niemand gekommen ist: Eine Seite, die stillschweigend ein paar Millionen Passwörter für Sie probierte, wäre ein anderes Werkzeug mit einem anderen Namen, und es ist nicht dieses. Angenommen werden sowohl das Passwort, das ein Dokument öffnet, als auch das Besitzerpasswort, das seine Einschränkungen aufhebt, denn beides ist ein Passwort, das man Ihnen gegeben hat.
- **Das Passwort wird hier eingetippt und hier verwendet.** Was Sie eintippen, geht in eine Schlüsselableitung, die in diesem Tab läuft, und sonst nirgendwohin. Es wird nicht gespeichert, nicht von einer Datei zur nächsten gemerkt und nicht in die Adressleiste geschrieben, und in der `Content-Security-Policy` der Seite steht jede Adresse, die diese Seite kontaktieren darf; keine davon gehört dieser Website. Ein Werkzeug, das nach einem Dokumentpasswort fragte und dann eine Netzanfrage stellte, täte das Schlimmste, was ein Werkzeug dieser Art tun kann.
- **Die fertige Datei wird hier noch einmal geöffnet, bevor sie Ihnen angeboten wird.** Bis das geschieht, korrigiert dieses Werkzeug mit allem oben nur seine eigene Hausaufgabe. Also werden die Bytes, die gleich Ihr Download werden, demselben Leser übergeben, den [der Kompressor](https://abox.tools/de/pdf-verkleinern/), [das Zusammenfügen](https://abox.tools/de/pdf-zusammenfuegen/) und [der Schwärzer](https://abox.tools/de/pdf-schwaerzen/) benutzen, einem Leser, der ein verschlüsseltes Dokument rundheraus ablehnt, und die Datei muss sich ohne Passwort öffnen und mit derselben Seitenzahl zurückkommen. Eine Datei, auf der noch irgendeine Verschlüsselung läge, könnte das nicht bestehen. Besteht sie es nicht, gilt der Durchlauf als gescheitert, und es gibt keinen Download.
- **Die Seiten selbst werden nicht neu gerendert, neu kodiert oder neu umbrochen.** Was sich ändert, ist die Verschlüsselung um das Dokument herum, nicht das Dokument. Die Zeichenanweisungen jeder Seite, jede eingebettete Schrift und jedes Bild werden genau so hinausgeschrieben, wie sie ankamen. Text bleibt also markierbar und durchsuchbar, Scans behalten die Auflösung, mit der sie gescannt wurden, und auf keiner Seite verrutscht etwas. Das eine, was sich doch ändert, ändert jedes Neuschreiben: Ältere, überholte Kopien von Objekten, die frühere Bearbeitungen zurückgelassen haben, werden nicht übernommen, was die Datei meist ein wenig kleiner macht.
- **Eine digitale Signatur übersteht das nicht, und die Seite sagt es, wenn eine da ist.** Eine Signatur deckt genau die Bytes der Datei ab, auf die sie angewendet wurde, jedes Neuschreiben macht sie also ungültig; genau dafür ist eine Signatur da. Dieses Werkzeug schreibt eine neue Datei, die Kopie, die Sie zurückbekommen, ist also unsigniert, und es sagt das beim Ergebnis, wenn es eine Signatur findet, vor der es warnen muss. Ihr Original ist weiterhin das signierte. Daran führt kein Weg vorbei, und kein Werkzeug hat einen.
- **Es sagt, was der Schutz tatsächlich wert war.** Ein Dokument, das 1998 mit 40-Bit-RC4 gesperrt wurde, und eines, das letztes Jahr mit AES-256 gesperrt wurde, heißen im Leseprogramm beide „passwortgeschützt“, und zwischen ihnen liegen Jahrzehnte. Die Seite nennt das Verfahren, die Schlüssellänge und die Revision und sagt klar, welche davon gebrochen sind, welche bloß überholt und welche aktuell ist. Das ist bei einer Datei, die man Ihnen als sicher beschrieben hat, wissenswert, und kein Leseprogramm zeigt es Ihnen.
- **An ein Zertifikat gebundene Dokumente werden abgewiesen statt halb geöffnet.** Manche Dokumente sind an ein Zertifikat verschlüsselt statt an ein Passwort, die Sorte aus Unternehmen, wo der Schlüssel auf einer Smartcard oder in einem Schlüsselspeicher liegt. Die werden mit einer Meldung abgewiesen, die sagt, was sie sind. Nichts, was man in ein Passwortfeld tippt, kann einen privaten Schlüssel ersetzen, und etwas anderes vorzugeben, würde nur Ihre Zeit verschwenden.
- **Was Google lädt und was es nicht bekommt.** Die Skripte für Werbung und Messung kommen von Google. Keines von beiden bekommt irgendetwas über Ihr Dokument: keine Datei, keine Seite, keinen Namen, keine Größe, keine Seitenzahl, kein Passwort und nicht, womit die Datei geschützt war. Jede Zeile, die ein PDF liest, entschlüsselt oder schreibt, wird von dieser Domain ausgeliefert und steht im Repository.
- **Was der Spenden-Knopf lädt und was er nicht bekommt.** Der Knopf „Buy me a coffee“ im Kopfbereich wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Er ist ein Link und sonst nichts: Er meldet keinen Besuch, und er bekommt nichts über Sie oder Ihre Dokumente. Es passiert nichts, bis Sie ihn anklicken, und dann sind Sie auf einer fremden Seite.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und alles auf dieser Seite arbeitet weiter. Einen einfacheren Beweis gibt es nicht: Ein Werkzeug, das Ihr Dokument zum Entsperren wegschickt, bliebe stehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/shared/pdf-crypt.js` dafür, wie aus einem Passwort der Schlüssel eines Dokuments wird, und dafür, dass darin nirgends eine Schleife steht, und `src/shared/aes.js` und `src/shared/rc4.js` für die beiden Chiffren selbst. Keine dieser Dateien kommt ins Netz, und der Leser und der Schreiber daneben auch nicht.
