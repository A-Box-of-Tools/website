# Textvergleich — zwei Texte nebeneinander vergleichen

Zwei Texte hinein, jeder Unterschied markiert, Zeile für Zeile und Wort für Wort. Nichts davon wird in den Server eines anderen eingefügt.

> Zwei Texte vergleichen und jeden Unterschied sehen, Zeile für Zeile und Wort für Wort, nebeneinander oder in einer Spalte. Der Vergleich läuft in Ihrem Browser, hochgeladen wird nichts - unveröffentlichter Code verlässt Ihr Gerät also nie.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/text-vergleichen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Texte werden **nie hochgeladen**. Es gibt keinen Server.

Ein Vergleich ist Rechnen auf zwei Zeichenketten, und zwar hier, auf dieser Seite. Der Algorithmus ist der von Myers — derselbe, den `git diff` benutzt —, von Hand geschrieben in `src/diff.js`, wo Sie ihn lesen können. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, weder etwas abzurufen noch etwas zu senden. Das zählt hier, denn was Menschen vergleichen, sind Verträge, Konfigurationsdateien und unveröffentlichter Code, und zwar paarweise.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Größengrenze
- ✓ Funktioniert offline
- ✓ Quelloffen

## So vergleichen Sie zwei Texte, ohne sie hochzuladen

1. **Fügen Sie beide Texte ein, oder ziehen Sie die beiden Dateien her.** Das Original links, die geänderte Fassung rechts. Zwei zugleich auf das Auswahlfeld gezogene Dateien landen je eine auf jeder Seite, in der Reihenfolge, in der Sie sie fallen gelassen haben; tauschen Sie die Seiten, wenn es andersherum war.
2. **Wählen Sie, wie Sie es lesen.** Nebeneinander oder in einer Spalte. Ein Telefon beginnt mit einer Spalte, denn nebeneinander braucht zwei Textspalten, und ein Telefon hat Platz für ungefähr eine; das Menü ist so oder so gleich daneben.
3. **Ignorieren Sie, was keine Rolle spielt.** Leerraum, Groß- und Kleinschreibung, leere Zeilen — jedes davon lässt sich ignorieren, damit eine neu formatierte Datei nicht wie hundert Änderungen aussieht. Standardmäßig wird die unveränderte Mitte zu einer Zahl zusammengeklappt, mit drei Zeilen zu beiden Seiten jeder Änderung.
4. **Lesen Sie, was sich geändert hat.** Entfernte Zeilen sind links markiert, hinzugekommene rechts, und innerhalb einer geänderten Zeile sind die Wörter hervorgehoben, die sich unterscheiden — ein Vergleich zweier Absätze zeigt also das verschobene Wort und nicht zwei ganze Absätze.
5. **Nehmen Sie den Patch mit.** Der Download ist ein `.patch` im Unified-Format, und genau das erwarten ein Code-Review, `git apply` und jeder Diff-Betrachter. Kopieren legt dasselbe in Ihre Zwischenablage.

## Die ausführliche Fassung

[So vergleichen Sie zwei JSON-Dateien](https://abox.tools/de/ratgeber/zwei-json-dateien-vergleichen/): Beide Dateien gleich formatieren, die Schlüssel sortieren, dann vergleichen. Warum ein roher JSON-Vergleich fast nur Rauschen ist, wie Sie beide Seiten im Browser in Normalform bringen, und was davon in die Patch-Datei gelangt.

## Auch im Werkzeugkasten

- [Base64-Kodierer & -Dekodierer](https://abox.tools/de/base64-kodieren/): Base64, Prozentkodierung, HTML-Entities, Hex und Backslash-Escapes, in beide Richtungen. Nichts davon wird in den Server eines anderen eingefügt.
- [Text & Dateien teilen](https://abox.tools/de/text-teilen/): Die Freigabe lebt in diesem offenen Tab. Leser holen sie verschlüsselt direkt aus Ihrem Browser, und mit dem Schließen des Tabs endet sie - auf keinem Server ist irgendetwas gespeichert.
- [QR- & Barcode-Generator](https://abox.tools/de/qr-code-erstellen/): Eintippen, und es wird ein Code. Zum Erzeugen wird nichts gesendet.
- [QR- & Barcode-Scanner](https://abox.tools/de/qr-code-scannen/): Halten Sie die Kamera drauf oder legen Sie ein Bild ab. Gelesen wird es hier und nirgendwo sonst.

## Fragen

### Werden meine Texte irgendwohin hochgeladen?

Nein. Der Vergleich ist eine Funktion, die in Ihrem eigenen Browser auf Ihrer eigenen Hardware läuft. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, es ruft nie etwas ab und sendet nie etwas, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Genau deshalb sollte man es für einen Vertrag, eine Konfigurationsdatei oder unveröffentlichten Code nehmen: So etwas in den Diff-Checker eines anderen einzufügen, heißt, beide Fassungen auf einmal herzugeben.

### Was macht der Vergleich eigentlich?

Er findet die kürzeste Folge von Änderungen, die den linken Text in den rechten verwandelt, mit dem Myers-Algorithmus, demselben, den `git diff` benutzt. Am kürzesten ist das, was einen Vergleich lesbar macht: Eine in der Mitte eingefügte Zeile sollte als eine Einfügung erscheinen und nicht so, als hätte sich jede Zeile danach geändert. Innerhalb einer geänderten Zeile werden auch die Wörter markiert, die sich unterscheiden, ein Vergleich zweier Absätze zeigt also das verschobene Wort und nicht zwei ganze Absätze.

### Kann es zwei Dateien statt zweier Einfügungen vergleichen?

Ja. Ziehen Sie beide zugleich auf das Auswahlfeld, dann landen sie je auf einer Seite, in der Reihenfolge, in der Sie sie fallen gelassen haben. Ihr Browser liest sie in diese Seite hinein, und weiter kommen sie nicht. Wenn Sie sie falsch herum abgelegt haben, tauschen Sie die Seiten.

### Was kommt bei einem Vergleich heraus, und kann ich es anwenden?

Der Download ist ein Unified Diff, also das Format mit `@@ -3,5 +3,5 @@`, das `git apply`, `patch` und jedes Code-Review-Werkzeug lesen. Kopieren legt dasselbe in Ihre Zwischenablage. Was auf dem Bildschirm steht, ist eine Ansicht davon: nebeneinander oder in einer Spalte, wobei die unveränderten Teile zu einer Zahl zusammengeklappt sind, sofern Sie nicht alle sehen wollen.

### Kann es Leerraum, Groß- und Kleinschreibung oder leere Zeilen ignorieren?

Ja, jedes für sich. Leerraum zu ignorieren lässt eine neu formatierte Datei als unverändert vergleichen; Groß- und Kleinschreibung zu ignorieren behandelt `Error` und `error` als dasselbe Wort; leere Zeilen zu ignorieren überspringt die Zeilen, die nichts enthalten. Die Zählung über dem Ergebnis sagt dann, dass die beiden gleich sind, sobald die Unterschiede ignoriert sind, die Sie ignorieren wollten — was nicht dieselbe Aussage ist wie identisch, und die Seite hält die beiden Aussagen auseinander.

### Wie groß darf der Vergleich sein?

Hier ist keine Grenze gesetzt, denn es zahlt kein Server dafür. Zwei Texte von zwanzigtausend Zeilen mit einer Handvoll Änderungen vergleichen sich sofort, denn der gemeinsame Anfang und das gemeinsame Ende werden abgeschnitten, bevor die eigentliche Arbeit beginnt. Ein Vergleich zweier Texte, die überhaupt nichts gemeinsam haben, hört früh auf und sagt das, statt eine Minute damit zu verbringen, das Offensichtliche zu beweisen, und ein sehr langer Vergleich zeichnet die ersten paar tausend Zeilen und überlässt den Rest dem heruntergeladenen Patch.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und keine Grenze dafür, wie viel Sie einfügen. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihren Text übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Texte zum Vergleichen wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Was Sie einfügen, hat keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem ein eingefügtes Token eingesammelt werden könnte, und im Code steht auch nichts, das es dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** In `src/` gibt es nirgends ein `fetch`, kein `XMLHttpRequest` und kein `sendBeacon`. Der Vergleich ist eine Funktion auf dieser Seite, die zwei Zeichenketten nimmt und zurückgibt, was sich geändert hat.
- **Der Algorithmus ist der übliche, vollständig lesbar.** Der Myers-Algorithmus für das kürzeste Änderungsskript, derselbe, den `git diff` benutzt, von Hand geschrieben in `src/diff.js`, mit den Entscheidungen kommentiert. Die Tests in `tests/js/text-diff.test.js` beweisen, dass die Löschungen den linken Text wieder aufbauen und die Einfügungen den rechten, und genau das heißt bei einem Diff korrekt.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird ein Zeichen Ihres Textes übergeben. Jede Zeile, die ihn liest, auswertet oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy und `src/diff.js` für den Myers-Algorithmus, den Wortvergleich innerhalb jeder geänderten Zeile und die drei Sicherungen, die verhindern, dass ein pathologischer Vergleich die Seite einfriert.
