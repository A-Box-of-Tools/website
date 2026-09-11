# Bild komprimieren — auf eine exakte Größe

Sie nennen die Größe. Den Rest rechnet es aus.

> JPEG, PNG oder WebP auf eine exakte Größe komprimieren, ob 100 KB oder 2 MB. Läuft komplett im Browser: kein Upload, kein Konto, auch offline.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/bild-komprimieren/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Die Kompression läuft in Ihrem eigenen Browser, auf Ihrer eigenen Hardware, mit den Encodern, die er ohnehin mitbringt. Netzfunktionen hat dieses Werkzeug keine, weder zum Abrufen noch zum Senden. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Bild gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Größenlimit
- ✓ Funktioniert offline
- ✓ Quelloffen

## So komprimieren Sie ein Bild auf eine bestimmte Größe

1. **Wählen Sie Ihre Bilder aus.** Ziehen Sie sie auf das Auswahlfeld oder suchen Sie sie von Hand heraus. Der Browser liest sie direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Tippen Sie die geforderte Größe ein.** 100 KB für das Upload-Formular, das Ihr Foto immer wieder ablehnt, 500 KB für das Bewerbungsportal, 2 MB für eine Seite, die schnell laden muss. Die vier häufigsten Werte liegen als Schaltflächen bereit.
3. **Klicken Sie auf „Auf Zielgröße komprimieren“.** Jedes Bild wird mehrfach kodiert, während sich das Werkzeug an die höchste Qualität herantastet, die noch hineinpasst. Was schon unter der Zielgröße liegt, bleibt unverändert.
4. **Prüfen Sie, was es gekostet hat, und laden Sie herunter.** Jedes Ergebnis nennt das Format, in dem es geschrieben wurde, die Qualität, ob sich die Abmessungen geändert haben und wie genau es dem Original entspricht. Mit „Vergleichen“ stehen beide Bilder nebeneinander.

## Die ausführliche Fassung

[So komprimieren Sie ein Bild auf eine exakte Dateigröße](https://abox.tools/de/ratgeber/bild-auf-groesse-komprimieren/): Das Upload-Formular will 500 KB, Ihr Foto hat 4 MB. Was so eine Grenze an Bildqualität kostet, an welcher Einstellung Sie zuerst drehen und warum ein PNG nicht schrumpft wie ein JPEG.

## Auch im Werkzeugkasten

- [Bildskalierer](https://abox.tools/de/bildgroesse-aendern/): Größe nennen. Rahmen ziehen. Format wählen.
- [HEIC zu JPG](https://abox.tools/de/heic-in-jpg-umwandeln/): Die Fotos, die ein iPhone macht, in einem Format, das jedes Programm öffnet.
- [Passbild-Ersteller](https://abox.tools/de/biometrisches-passbild/): Land auswählen. Es wendet genau die Vorschrift dieses Landes an.
- [Bild-Stacker](https://abox.tools/de/bilder-stacken/): Zwanzig Aufnahmen werden eine, ohne zwanzig Uploads und ohne RAW-Konverter.

## Fragen

### Wird mein Bild irgendwohin hochgeladen?

Nein. Ihr eigener Browser dekodiert, komprimiert und misst die Datei auf Ihrer eigenen Hardware, mit den JPEG-, PNG- und WebP-Encodern, die er ohnehin mitbringt. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns.

### Wie kommt es auf eine exakte Größe?

Durch Ausprobieren. Eine Formel, die eine Qualitätseinstellung in eine Byte-Zahl umrechnet, gibt es nicht, denn das hängt vollständig vom Bild ab. Also kodiert das Werkzeug das Bild mehrfach und sucht die Antwort. Es beginnt am oberen Ende des Qualitätsbereichs und halbiert sich heran, sodass es die höchste passende Qualität in etwa acht Durchgängen findet. Jede Größe, die Sie auf der Seite sehen, gehört zu einer echten kodierten Datei und ist keine Schätzung.

### Was heißt hier eigentlich „minimaler Verlust“?

Drei konkrete Dinge. Erstens wird ein Bild, das bereits unter Ihrer Zielgröße liegt, Byte für Byte durchgereicht statt neu kodiert. Zweitens gibt das Werkzeug Qualität aus, bevor es an die Auflösung geht, und nur bis zu der Grenze, ab der Kompressionsartefakte sichtbar werden. Darunter verkleinert es lieber das Bild und dreht die Qualität wieder hoch, denn weniger gute Pixel sehen besser aus als mehr ruinierte. Drittens tastet sich die Suche wieder nach oben, sobald ein passendes Ergebnis gefunden ist, bis das Budget aufgebraucht ist. Sie bekommen also keine 300-KB-Datei, wenn Sie 500 KB verlangt haben.

### Was sind die SSIM- und PSNR-Werte an jedem Ergebnis?

Sie messen, was die Kompression gekostet hat. Dafür wird das Ergebnis dekodiert und mit dem Originalbild verglichen. SSIM vergleicht lokale Helligkeit, Kontrast und Struktur und kommt damit dem, woran sich ein Auge stört, deutlich näher als das Zählen veränderter Pixel. Ab etwa 0,98 sind beide Bilder nebeneinander kaum zu unterscheiden. PSNR ist der klassische Dezibelwert. Beides rechnet Ihr Gerät aus, und beides steht auf der Seite, damit die Rede vom geringen Verlust nachprüfbar bleibt und nicht bloß behauptet.

### Welche Formate kann es lesen und schreiben?

Es liest alles, was Ihr Browser dekodieren kann, in der Praxis also JPEG, PNG, WebP, GIF, BMP und, in den meisten aktuellen Browsern, AVIF. Geschrieben werden JPEG, PNG und WebP, denn das sind die Encoder, die Browser mitbringen. Auf „automatisch“ behält es das Format bei, in dem Ihre Datei angekommen ist, und wechselt nur dann zu WebP, wenn das Beibehalten eine Verkleinerung oder einen sichtbaren Qualitätsverlust bedeutet hätte.

### Warum lässt sich ein PNG nicht weit komprimieren?

Weil PNG verlustfrei arbeitet und deshalb gar keinen Qualitätsregler hat. Ein PNG kleiner zu bekommen geht nur über weniger Pixel oder weniger Farben, und mit ausgewähltem PNG erreicht das Werkzeug eine Zielgröße daher allein über die Größenänderung. Bei einer Fotografie kommen JPEG oder WebP Ihrer Zielgröße in sichtbar unbedenklicher Qualität weit näher. Bei einem Logo oder einem Screenshot mit Transparenz behält WebP die Transparenz, die JPEG mit Weiß auffüllen würde.

### Entfernt das Komprimieren die EXIF- und GPS-Daten eines Bildes?

Ja, als Nebenwirkung. Komprimieren heißt, das Bild zu Pixeln zu dekodieren und diese Pixel erneut zu kodieren, und ein Canvas voller Pixel trägt keine Tags. Ort, Kameramodell, Zeitstempel und alles Weitere werden also schlicht nicht in die neue Datei geschrieben. Sollen die Metadaten weg, das Bild aber unangetastet bleiben, nehmen Sie besser den [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/). Der schreibt nur den Container neu und komprimiert nichts.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Auch bei Anzahl und Größe der Dateien gibt es keine Grenze, denn es zahlt kein Server dafür. Die Arbeit passiert auf Ihrem eigenen Gerät. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Bilder übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Bilder zum Komprimieren wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Bilder haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien landen könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`. Die Kompression erledigt `canvas.toBlob`, also der Encoder, der in Ihrem Browser ohnehin steckt.
- **Die Zahlen werden gemessen, nicht gemeldet.** Die Größen, der Qualitätswert und der SSIM-Vergleich entstehen alle auf dieser Seite und werden Ihnen angezeigt. In diesem Repository gibt es kein eigenes Analytics-Ereignis, das einen Dateinamen, eine Größe, eine Anzahl oder ein Ergebnis mitführt.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird irgendetwas über Ihre Bilder übergeben. Jede Zeile, die eine Datei liest, komprimiert oder misst, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Ein einfacherer Beweis lässt sich kaum führen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/compress.js` für die Suche, die entscheidet, wie viel Qualität ausgegeben wird, und `src/measure.js` für den Vergleich hinter dem Wert „visuelle Übereinstimmung“.
