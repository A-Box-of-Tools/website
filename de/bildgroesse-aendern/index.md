# Bildgröße ändern — skalieren, zuschneiden, umwandeln

Größe nennen. Rahmen ziehen. Format wählen.

> JPEG-, PNG- und WebP-Bilder im Browser skalieren, zuschneiden und umwandeln. Exakte Pixel, ein Prozentwert oder die lange Kante, für ein Bild oder einen ganzen Ordner. Nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/bildgroesse-aendern/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Das Skalieren, das Zuschneiden und der Formatwechsel laufen alle in Ihrem eigenen Browser, auf Ihrer eigenen Hardware, mit den Bild-Encodern, die er ohnehin mitbringt. Netzfunktionen hat dieses Werkzeug keine, weder zum Abrufen noch zum Senden. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Bild gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Funktioniert offline
- ✓ Quelloffen

## So skalieren Sie ein Bild, ohne es hochzuladen

1. **Wählen Sie Ihre Bilder aus.** Ziehen Sie sie auf das Auswahlfeld oder suchen Sie sie von Hand heraus. Der Browser liest sie direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Schneiden Sie zu, wenn Sie möchten.** Der Rahmen beginnt auf dem ganzen Bild, ihn in Ruhe zu lassen schneidet also nichts ab. Ziehen Sie ihn, oder legen Sie ihn auf ein Format fest, etwa 1:1 für ein Profilbild, 9:16 für eine Story oder 16:9 für ein Vorschaubild, und klicken Sie auf „Größtmöglich“ für den größten Rahmen, der hineinpasst. Jedes Bild behält seinen eigenen Rahmen. Klicken Sie eine beliebige Zeile in der Liste an, um stattdessen auf jenem zu zeichnen. Sollen alle gleich gerahmt sein, erledigt das ebenfalls eine Schaltfläche.
3. **Sagen Sie, wie groß es herauskommen soll.** Eine Breite, eine Höhe oder beides. Eine lange Kante, die Hoch- und Querformataufnahmen gleich groß hält. Oder schlicht einen Prozentwert. Lassen Sie eines der beiden Felder leer, behält das Bild sein eigenes Seitenverhältnis.
4. **Wählen Sie das Format und klicken Sie auf die Schaltfläche.** Behalten Sie, womit jede Datei ankam, oder schreiben Sie alles als JPEG, PNG oder WebP. Jedes Ergebnis nennt, was daraus geworden ist und wie viel kleiner es wurde. Klicken Sie eines an, öffnet es sich in voller Größe, mit allen Zahlen dahinter und dem Original daneben zum Vergleich. Ein Stapel kommt als ein ZIP herunter.

## Die ausführliche Fassung

[So skalieren Sie ein Bild, ohne es zu ruinieren](https://abox.tools/de/ratgeber/bild-skalieren/): Was mit einem Bild geschieht, wenn Sie seine Pixelmaße ändern: warum Verkleinern harmlos ist und Vergrößern nicht, was zu tun ist, wenn der Rahmen das falsche Format hat, und wann Zuschneiden die bessere Antwort ist.

## Auch im Werkzeugkasten

- [HEIC zu JPG](https://abox.tools/de/heic-in-jpg-umwandeln/): Die Fotos, die ein iPhone macht, in einem Format, das jedes Programm öffnet.
- [Passbild-Ersteller](https://abox.tools/de/biometrisches-passbild/): Land auswählen. Es wendet genau die Vorschrift dieses Landes an.
- [Bild-Stacker](https://abox.tools/de/bilder-stacken/): Zwanzig Aufnahmen werden eine, ohne zwanzig Uploads und ohne RAW-Konverter.
- [Bild-Schwärzer](https://abox.tools/de/bild-schwaerzen/): Was Sie abdecken, wird aus der Datei gelöscht und nicht darin versteckt.

## Fragen

### Wird mein Bild irgendwohin hochgeladen?

Nein. Ihr eigener Browser dekodiert, schneidet, skaliert und schreibt die Datei auf Ihrer eigenen Hardware, mit den JPEG-, PNG- und WebP-Encodern, die er ohnehin mitbringt. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns.

### Was passiert, wenn ich eine Breite angebe, aber keine Höhe?

Die Höhe ergibt sich aus dem Seitenverhältnis des Bildes, und das ist fast immer das Gewollte. „1920 breit“ heißt „1920 breit und so hoch, wie das eben wird“. Füllen Sie beide aus, können die zwei dem Seitenverhältnis des Bildes widersprechen, und nur dann erscheint die Wahl „wenn die Verhältnisse nicht zusammenpassen“: hineinpassen, ausfüllen und den Überstand abschneiden, mit einem Hintergrund auffüllen, oder verzerren und die Verzerrung hinnehmen.

### Verliert ein Bild beim Skalieren an Qualität?

Kleiner machen kostet nichts Sichtbares. Es gehen mehr Pixel hinein als heraus, was bleibt, ist also echtes Detail. Größer machen kann dagegen nicht hinzufügen, was nie fotografiert wurde, und heraus kommt eine weichere Kopie desselben Bildes und keine schärfere. Genau deshalb ist „ein Bild nie größer machen, als es angefangen hat“ standardmäßig aktiv. Etwas kostet dann noch die Neukodierung, wenn das Format JPEG oder WebP ist, und der Qualitätsregler bestimmt, wie viel Sie dort ausgeben.

### Kann ich jedes Bild anders zuschneiden?

Ja, und das ist die Voreinstellung. Jedes Bild auf der Liste trägt seinen eigenen Rahmen, in seinen eigenen Pixeln, und ein Klick auf eine Zeile holt jenes Bild mit seinem eigenen Rahmen und seinem eigenen festgelegten Seitenverhältnis in die Vorschau zurück. Nichts, was Sie an einem tun, wirkt sich auf ein anderes aus. Jeder Rahmen beginnt außerdem auf dem ganzen Bild, ein Bild, auf dem Sie nie zeichnen, wird also überhaupt nicht zugeschnitten.

### Kann es einen ganzen Stapel auf einmal gleich zuschneiden?

Ja, mit der Schaltfläche unter der Vorschau. Sie gibt jedem anderen Bild denselben relativen Ausschnitt, also dieselben Anteile seiner eigenen Breite und Höhe. Bei einer Reihe gleich großer Screenshots oder Exporte ist das exakt derselbe Rahmen, und die Seite sagt das auch. Mit einem festgelegten Seitenverhältnis gibt sie jedem stattdessen den größten Rahmen dieses Verhältnisses innerhalb jenes Ausschnitts. Wer also 1:1 wählt und dann diese Schaltfläche drückt, bekommt aus einem Ordner mit gemischten Hoch- und Querformaten lauter Quadrate. Bearbeiten lässt sich danach jeder Rahmen weiterhin.

### Welche Formate kann es lesen und schreiben?

Es liest alles, was Ihr Browser dekodieren kann, in der Praxis also JPEG, PNG, WebP, GIF, BMP und, in den meisten aktuellen Browsern, AVIF. Geschrieben werden JPEG, PNG und WebP, denn das sind die Encoder, die Browser mitbringen. Bei „Format behalten“ bleibt ein JPEG ein JPEG und ein PNG ein PNG. Alles, was der Browser nicht schreiben kann, etwa ein GIF oder ein BMP, kommt als PNG heraus, also in dem Format, das Transparenz und flache Farbflächen unversehrt lässt.

### Was passiert mit der Transparenz, wenn ich als JPEG speichere?

Sie wird mit der Hintergrundfarbe aufgefüllt, denn JPEG hat keinen Alphakanal, in dem sie sich speichern ließe. Die Farbe wählen Sie selbst, und sie beginnt bei Weiß, was die meisten wollen und was fast jedes andere Werkzeug tut, ohne es Ihnen zu sagen. Dieselbe Farbe steht auch hinter einem aufgefüllten Rahmen. Speichern Sie stattdessen als PNG oder WebP, kommt die Transparenz unangetastet durch.

### Entfernt es EXIF- und GPS-Daten?

Bei allem, was es tatsächlich verarbeitet, ja, und zwar als Nebenwirkung. Zuschneiden oder Skalieren heißt, das Bild zu Pixeln zu dekodieren und diese Pixel erneut zu kodieren, und ein Canvas voller Pixel trägt keine Tags. Ort, Kameramodell und Zeitstempel werden also schlicht nicht in die neue Datei geschrieben. Bei einer Datei, die Sie überhaupt nicht ändern, liegt der Fall anders, denn die wird Byte für Byte zurückgereicht, samt Tags. Sollen die Metadaten weg, das Bild aber unangetastet bleiben, nehmen Sie den [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/). Der schreibt nur den Container neu und komprimiert nichts.

### Worin unterscheidet sich das vom Bildkompressor?

Hier geht es um Abmessungen. Sie sagen, wie viele Pixel Sie wollen, und bekommen genau die. Beim [Bildkompressor](https://abox.tools/de/bild-komprimieren/) geht es um die Dateigröße. Sie sagen, wie viele Kilobyte erlaubt sind, und er sucht die höchste Qualität, die hineinpasst, und verkleinert nur dann, wenn Qualität allein nicht reicht. Hieß es „1200 Pixel breit“, sind Sie hier richtig. Hieß es „unter 500 KB“, bringt Sie das andere näher ans Ziel.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Auch bei Anzahl und Größe der Dateien gibt es keine Grenze, denn es zahlt kein Server dafür. Die Arbeit passiert auf Ihrem eigenen Gerät. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Bilder übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Bilder zum Skalieren wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Bilder haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien landen könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`. Skaliert wird mit einem `drawImage` auf ein Canvas und einem `canvas.toBlob`, also mit dem Skalierer und dem Encoder, die in Ihrem Browser ohnehin stecken.
- **Eine Datei, um deren Änderung niemand gebeten hat, wird nicht geändert.** Ohne Zuschnitt, ohne Skalierung und ohne Formatwechsel wird die von Ihnen gewählte Datei Byte für Byte zurückgereicht statt neu gespeichert. Das ist nicht bloß Höflichkeit, sondern der Grund, warum dieses Werkzeug ein Bild gar nicht stillschweigend neu kodieren kann. Und warum es auch nicht stillschweigend die Metadaten eines Bildes wegwirft, das Sie nur ansehen wollten.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird irgendetwas über Ihre Bilder übergeben. Jede Zeile, die eine Datei liest, zuschneidet, skaliert oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/geometry.js` für die Rechnung, die entscheidet, was behalten wird und wie groß es herauskommt, und `src/codecs.js` für den einen `drawImage`-Aufruf, der Zuschnitt und Skalierung in einem erledigt.
