# Base64-Kodierer & -Dekodierer — und URLs, HTML-Entities, Hex und Escapes

Base64, Prozentkodierung, HTML-Entities, Hex und Backslash-Escapes, in beide Richtungen. Nichts davon wird in den Server eines anderen eingefügt.

> Base64 in beiden Alphabeten kodieren und dekodieren, URLs prozentkodieren, HTML-Entities maskieren und Hex und Backslash-Escapes lesen. Alles läuft in Ihrem Browser, hochgeladen wird nichts - ein Token verlässt Ihr Gerät also nie.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/base64-kodieren/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Texte werden **nie hochgeladen**. Es gibt keinen Server.

Jede Kodierung hier ist Rechnen auf einer Zeichenkette, und zwar hier, auf dieser Seite. Die Codecs sind von Hand geschrieben und liegen in `src/encode.js` — und mehr gibt es nicht. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, weder etwas abzurufen noch etwas zu senden. Das wiegt hier schwerer als fast überall sonst, denn was Menschen in einen Base64-Dekodierer im Netz einfügen, ist ein Token, und ein Token in die Webseite eines anderen einzufügen, heißt, es zu übergeben.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Größengrenze
- ✓ Funktioniert offline
- ✓ Quelloffen

## So kodieren oder dekodieren Sie Base64, ohne es hochzuladen

1. **Wählen Sie die Kodierung.** Base64 in beiden Alphabeten, Prozentkodierung für einen einzelnen Wert oder eine ganze URL, die fünf HTML-Entities, Hex-Bytes und die Backslash-Escapes eines Zeichenketten-Literals. Die Notiz unter dem Menü sagt, wofür jede davon da ist.
2. **Wählen Sie die Richtung.** *Kodieren* nimmt Klartext und erzeugt die kodierte Form; *Dekodieren* führt die kodierte Form zurück zu Klartext. Das Ergebnis folgt Ihrem Tippen, die Richtung zu wechseln ist also ein Klick und kein erneutes Eintippen.
3. **Fügen Sie ihn ein oder ziehen Sie die Datei her.** Alles, was sich markieren und kopieren lässt, funktioniert. Eine auf das Auswahlfeld gezogene Datei liest Ihr eigener Browser und legt sie ins Feld. Einen Upload-Schritt gibt es hier nicht wegzulassen.
4. **Lesen Sie den Fehler, wenn es einen gibt.** Ein Dekodierer, der hier scheitert, sagt, was er gefunden hat — ein Zeichen, das Base64 nicht benutzt, Füllzeichen an der falschen Stelle, Bytes, die kein Text sind — statt etwas Plausibles und Falsches zurückzugeben.
5. **Nehmen Sie das Ergebnis mit.** Kopieren Sie es, oder laden Sie es als Textdatei herunter. Die Zählung unter dem Feld sagt, wie viele Bytes hineingingen und wie viele herauskamen.

## Auch im Werkzeugkasten

- [Text & Dateien teilen](https://abox.tools/de/text-teilen/): Die Freigabe lebt in diesem offenen Tab. Leser holen sie verschlüsselt direkt aus Ihrem Browser, und mit dem Schließen des Tabs endet sie - auf keinem Server ist irgendetwas gespeichert.
- [QR- & Barcode-Generator](https://abox.tools/de/qr-code-erstellen/): Eintippen, und es wird ein Code. Zum Erzeugen wird nichts gesendet.
- [QR- & Barcode-Scanner](https://abox.tools/de/qr-code-scannen/): Halten Sie die Kamera drauf oder legen Sie ein Bild ab. Gelesen wird es hier und nirgendwo sonst.
- [Hash & Prüfsumme](https://abox.tools/de/pruefsumme-berechnen/): Einen Download gegen die Zahl prüfen, die der Anbieter veröffentlicht hat. Ohne sie jemandem zu schicken.

## Fragen

### Wird mein Text irgendwohin hochgeladen?

Nein. Jeder Kodierer und jeder Dekodierer auf dieser Seite sind Funktionen, die in Ihrem eigenen Browser auf Ihrer eigenen Hardware laufen. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, es ruft nie etwas ab und sendet nie etwas, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Genau deshalb sollte man es für ein Zugriffstoken oder ein Sitzungscookie nehmen: So etwas in den Dekodierer eines anderen einzufügen, heißt, es ihm zu geben.

### Ist das hier dasselbe Base64 wie überall sonst?

Ja, es wird gegen die Testvektoren aus RFC 4648 geprüft und nicht gegen sich selbst. Beide Alphabete lassen sich dekodieren, ein JWT mit `-` und `_` liest sich also genauso leicht wie eines mit `+` und `/`, und Eingaben, die auf 64 Zeichen umgebrochen sind, werden für Sie zusammengefügt. Kodiert wird über UTF-8-Bytes, ein Buchstabe mit Akzent oder ein Emoji übersteht die Hin- und Rückrunde also unbeschadet.

### Ist Base64 eine Verschlüsselung?

Nein, und es dafür zu halten, ist der klassische Fehler. Base64 ist eine Schreibweise: dieselben Bytes, geschrieben in einem Alphabet, das eine URL, eine E-Mail oder eine JSON-Zeichenkette übersteht. Jeder kann es zurücklesen — diese Seite tut es in einer Millisekunde —, es verbirgt also nichts und schützt nichts. Wenn das, was Sie haben, geheim ist, braucht es echte Verschlüsselung, bevor es kodiert wird, nicht an ihrer Stelle.

### Warum ist das Dekodieren fehlgeschlagen?

Weil das Eingefügte nicht ganz das ist, was dem Codec gesagt wurde, und der Fehler sagt, woran es liegt: ein Zeichen außerhalb des Base64-Alphabets, Füllzeichen an der falschen Stelle, ein Prozentzeichen ohne zwei Hex-Ziffern dahinter, oder Bytes, die sich zwar aus Base64 dekodieren lassen, aber kein UTF-8-Text sind — was meist bedeutet, dass das Original eine Datei war und keine Zeichenkette. Das browsereigene `atob` hätte stattdessen etwas Plausibles zurückgegeben; gesagt zu bekommen, was los ist, ist der ganze Sinn davon, etwas in einen Dekodierer einzufügen.

### Was ist der Unterschied zwischen den beiden URL-Kodierungen?

Ein einzelner Wert, oder die ganze Adresse. *Einen Wert* zu kodieren maskiert alles, dem eine URL eine Bedeutung gibt — Schrägstriche, Fragezeichen, Und-Zeichen —, und genau das wollen Sie für einen einzelnen Query-Parameter. Eine *ganze URL* zu kodieren lässt die Adresse funktionieren: Die Schrägstriche und das `?` bleiben, und nur die Zeichen, die eine URL gar nicht tragen kann, werden maskiert. Das Erste auf eine ganze Adresse angewandt zerstört die Adresse; das Zweite auf einen Wert angewandt verliert, wo der Wert endet.

### Wie groß darf die Datei sein?

Hier ist keine Grenze gesetzt, denn es zahlt kein Server dafür. Die praktische Obergrenze ist Ihr eigenes Gerät: Ein paar Megabyte Text sind kein Problem, und bei einem sehr langen Dokument wartet die Seite auf eine Pause in Ihrem Tippen, statt mit Ihnen um die Tastatur zu kämpfen.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und keine Grenze dafür, wie viel Sie einfügen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihren Text übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihren Text zum Dekodieren wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Was Sie einfügen, hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem ein eingefügtes Token eingesammelt werden könnte, und im Code steht auch nichts, das es dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** In `src/` gibt es nirgends ein `fetch`, kein `XMLHttpRequest` und kein `sendBeacon`. Jeder Kodierer und jeder Dekodierer sind Funktionen auf dieser Seite, die eine Zeichenkette nehmen und eine Zeichenkette zurückgeben.
- **Der Dekodierer sagt Ihnen, wenn etwas nicht stimmt.** Das browsereigene `atob` nimmt Eingaben an, die es ablehnen sollte, und gibt etwas Plausibles zurück. Das Base64 hier ist von Hand geschrieben und wird gegen die Testvektoren aus RFC 4648 geprüft, und wenn das Eingefügte kein Base64 ist, sagt es das, und sagt warum. Die Tests in `tests/js/text-encode.test.js` prüfen genau das.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird ein Zeichen Ihres Textes übergeben. Jede Zeile, die ihn liest, auswertet oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy und `src/encode.js` für das Base64, das gegen die Testvektoren aus RFC 4648 geprüft wird statt gegen sich selbst, und das schlechte Eingaben ablehnt, statt wie `atob` etwas Plausibles zurückzugeben.
