# Bild zu SVG — ein Logo, eine Schablone oder eine Silhouette in Kurven nachzeichnen

Eine Form, eine Kontur. Zeigen Sie auf das, was nicht hineingehört.

> Ein Schwarz-Weiß-Bild im Browser in eine echte SVG-Kontur nachzeichnen. Logos, Schablonen, Unterschriften, Strichzeichnungen und Silhouetten werden zu Kurven, die sich in jede Größe skalieren lassen. Ein Klick entfernt, was der Tracer falsch verstanden hat. Nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/bild-in-svg-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Ihr Browser liest das Bild von Ihrer Festplatte, `src/mask.js` macht daraus ein Bit je Pixel, `src/contour.js` läuft am Rand der Form entlang und `src/fit.js` legt Kurven an sie an. Das sind rund sechshundert Zeilen, die Sie lesen können, ohne Engine dahinter und ohne dass etwas heruntergeladen würde, um sie auszuführen. Dieses Werkzeug hat keinerlei Netzwerkfunktion: nichts abzurufen, nichts zu senden, und hinter dieser Seite steht auch kein Server, an den eine Zeichnung gehen könnte, selbst wenn es eine solche Funktion gäbe.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Funktioniert offline
- ✓ Quelloffen

## So zeichnen Sie ein Bild als SVG nach, ohne es hochzuladen

1. **Wählen Sie das Bild aus.** Ein Logo, eine Schablone, eine Unterschrift, ein Stempel, eine eingescannte Zeichnung, eine Silhouette. Alles mit einer klaren Form darin lässt sich gut nachzeichnen; ein Foto von einem Zimmer nicht, und weiter unten steht dazu eine klare Warnung statt einer Überraschung am Ende. Die Datei wird direkt von Ihrer Festplatte gelesen, und währenddessen wird nichts irgendwohin gesendet.
2. **Sagen Sie, was die Form ist.** Eine Zeichnung auf Papier trennt sich nach **Hell und Dunkel**, und die Schwelle wird für Sie ermittelt. Ein Foto von einem einzelnen Gegenstand tut das nicht: Eine dunkelrote Figur auf dunkelgrauem Stein ist dunkel auf dunkel, und keine Helligkeit trennt die beiden. Dafür ist **das Motiv** da: Es lernt aus einem Streifen am Rand des Bildes, was der Hintergrund ist, und behält alles, was nicht dazugehört.
3. **Schauen Sie auf die rote Linie, nicht auf die Einstellungen.** Die Kontur wird über die Pixel gezeichnet, aus denen sie stammt, denn nur dort lässt sich die Frage entscheiden: Eine Kontur ist relativ zu genau diesen Pixeln richtig oder falsch und zu nichts sonst. Ziehen Sie eines der beiden Bilder, um beide zu verschieben, und zoomen Sie mit dem Mausrad so weit hinein, dass Sie sehen, was die Linie wirklich tut.
4. **Klicken Sie weg, was nicht hineingehört.** Ein Fleck, eine Heftklammer, ein Stempel, eine Bildunterschrift, ein Schatten. Ein Klick nimmt die ganze Fläche dieser Farbe und nicht ein einzelnes Pixel, Sie zeigen also auf eine Form; ein zweiter Klick holt sie zurück. Ein Klick auf ein eingeschlossenes Stück Hintergrund füllt es stattdessen, und so schließt sich ein Loch, das keines sein sollte.
5. **Ändern Sie die Glättung nur, wenn es nötig ist.** *Detail* ist, wie weit sich die Linie beim Vereinfachen von den Pixeln entfernen darf, und wird je Form ermittelt, solange Sie nichts anderes sagen. *Eckenschärfe* entscheidet, wie stark die Kontur abknicken muss, damit der Knick als Ecke bleibt, statt zur Kurve gerundet zu werden. Bei den meisten Bildern muss keines von beiden angefasst werden.
6. **Nehmen Sie das SVG.** Eine Datei, ein einziger `<path>`, keine Füllregel, um die Sie sich kümmern müssten: Die Außenlinien sind in die eine Richtung gewunden und die Löcher in die andere, und genau das macht aus einer Form mit vierzig Löchern ein einziges Element. Es öffnet sich in Illustrator, Inkscape, Figma, einem Browser und einem Schneidplotter.

## Die ausführliche Fassung

[So zeichnen Sie ein Bild als SVG nach](https://abox.tools/de/ratgeber/bild-in-svg-umwandeln/): Ein Logo, eine Schablone, eine Unterschrift oder eine Silhouette im Browser in eine echte Vektorkontur verwandeln. Welche Bilder sich gut nachzeichnen lassen, welche nie, und wie Sie korrigieren, was der Tracer falsch versteht.

## Auch im Werkzeugkasten

- [Größenvergleich](https://abox.tools/de/groessenvergleich-erstellen/): Größen eintippen, Bild mitnehmen. Zum Zeichnen wird nichts verschickt.
- [Bildkompressor](https://abox.tools/de/bild-komprimieren/): Sie nennen die Größe. Den Rest rechnet es aus.
- [Bildskalierer](https://abox.tools/de/bildgroesse-aendern/): Größe nennen. Rahmen ziehen. Format wählen.
- [HEIC zu JPG](https://abox.tools/de/heic-in-jpg-umwandeln/): Die Fotos, die ein iPhone macht, in einem Format, das jedes Programm öffnet.

## Fragen

### Wird mein Bild irgendwohin hochgeladen?

Nein. Die Datei wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, von ein paar hundert Zeilen JavaScript von diesem Ursprung nachgezeichnet und als Download zurückgegeben. Dieses Werkzeug hat keinerlei Netzwerkfunktion, es ruft nie etwas ab und sendet nie etwas, und die `Content-Security-Policy` der Seite nennt jede Adresse, die sie kontaktieren darf; keine davon gehört dieser Website.

### Macht das aus meinem Foto ein SVG?

Nicht auf brauchbare Weise, und die Seite sagt es Ihnen, statt Sie es nach dem Herunterladen entdecken zu lassen. Nachzeichnen macht aus jeder Fläche ähnlicher Farbe eine eigene Form, ein Foto kommt also als Tausende überlappender Kleckse zurück und als Datei, die um ein Vielfaches größer ist als das JPEG, sich langsam öffnet und nicht wie das Foto aussieht. Was sich gut nachzeichnen lässt, ist ein Bild mit einer *Form* darin: ein Logo, eine Schablone, eine Unterschrift, eine Strichzeichnung, eine Silhouette. Bei einem Foto von einem einzelnen Gegenstand schneidet die Einstellung *das Motiv* ihn als eine einzige Silhouette aus, und das ist etwas anderes und wirklich nützlich.

### Was unterscheidet die beiden Arten, die Form zu finden?

Die Frage, die sie stellen. **Hell und Dunkel** fragt für jedes Pixel, ob es dunkler ist als ein Schwellwert, und das ist genau richtig für Tinte auf Papier und nutzlos, wenn Motiv und Hintergrund gleich dunkel sind. **Das Motiv** fragt, was der Hintergrund ist: Es lernt das aus einem Streifen am Rand des Bildes, misst jedes Pixel daran und behält das größte Stück, das nicht dazu gehört. Das funktioniert bei einem Foto von einem Gegenstand auf einigermaßen ruhigem Hintergrund und scheitert an einem so eng beschnittenen Bild, dass das Motiv über drei Seiten hinausläuft, denn dann sind die Ränder, aus denen es lernt, selbst das Motiv. In dem Fall können Sie stattdessen selbst auf den Hintergrund zeigen.

### Warum hat die nachgezeichnete Form Löcher oder verliert dünne Teile?

Weil das Bild sie schon hatte, sobald es ein Bit je Pixel war. Schalten Sie *was der Tracer bekommen hat* ein und sehen Sie es sich an: Unter etwa zwölf Pixeln ist die Punze eines Buchstabens bereits zugelaufen und seine Stämme sind bereits verschmolzen, und kein Nachzeichnen der Welt holt ein Loch zurück, das nicht da ist. Die Abhilfe liegt weiter vorn: den Schwellwert verschieben oder von einem größeren Scan ausgehen. Im Modus *das Motiv* schließt *Lücken schließen bis* kleine Löcher, und *ganz ausfüllen* schließt jedes Loch, das der Hintergrund vom Bildrand aus nicht erreicht.

### Kann ich korrigieren, was es falsch verstanden hat?

Ja, und dafür ist der dritte Schritt zum größten Teil da. Klicken Sie auf alles, was nicht in die Zeichnung gehört, und es verschwindet; ein zweiter Klick holt es zurück. Ein Klick nimmt die ganze Fläche dieser Farbe, ein Klick entfernt also einen ganzen Fleck oder einen ganzen Stempel und nicht ein Pixel. Ein Klick auf ein eingeschlossenes Stück Hintergrund füllt es. Korrekturen werden getrennt vom Schwellwert aufbewahrt, ein späteres Verschieben des Reglers wirft sie also nicht weg.

### Wie groß wird das SVG?

Bei einer Form kleiner als das Bild: Eine nachgezeichnete Silhouette hat meist ein bis fünf Kilobyte, ein Logo ein paar mehr. Die Seite nennt die genaue Zahl neben dem Download. Bei einem Foto wird es riesig, und das ist das deutlichste Zeichen dafür, dass dies für diese Datei das falsche Werkzeug ist; ab etwa tausend einzelnen Formen hört die Seite auf zu zeichnen und sagt es.

### Zeichnet es in Farbe nach?

Nein. Hier entsteht eine Form in einer Farbe, denn das ist der Fall, der am Ende wie eine Zeichnung aussieht und nicht wie eine schlechte Fotokopie. Farbiges Nachzeichnen heißt, auf ein paar Farben zu reduzieren und jede als eigene Ebene nachzuzeichnen, und das Ergebnis enttäuscht die meisten, die danach fragen. Wenn Sie Farbe brauchen, zeichnen Sie die Form hier nach und füllen Sie sie in Ihrem Zeichenprogramm.

### Was kann ich hinterher mit dem SVG anfangen?

Es in jede Größe skalieren, ohne dass es weich wird, es mit einem einzigen Attribut umfärben, animieren, drucken oder an einen Schneidplotter oder einen Laser schicken. Es ist ein einziger `<path>` ohne Füllregel, die man falsch setzen könnte, Illustrator, Inkscape, Figma, ein Browser und die meiste CNC-Software lesen es also alle gleich.

### Gibt es eine Grenze für die Größe des Bildes?

Die Ihres Geräts, nicht unsere. Eine mit 300 dpi gescannte A4-Seite, etwa neun Megapixel, ist in einem Bruchteil einer Sekunde nachgezeichnet. Größere Bilder gehen auch; sie dauern nur länger, und die Arbeit geschieht auf Ihrem eigenen Prozessor statt in einer Warteschlange irgendwo.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Auch die Zahl und die Größe der Dateien sind nicht begrenzt, weil kein Server dafür bezahlt: Die Arbeit geschieht auf Ihrem eigenen Gerät. Die Website trägt Werbung, und die bezahlt sie; den Anzeigen wird nichts über Ihre Dateien mitgegeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist auch der einfachste Beweis dafür, dass nichts hochgeladen wird: Ein Werkzeug, das Ihr Bild zum Nachzeichnen wegschickte, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihr Bild hat keinen Weg nach draußen.** Die Content-Security-Policy nennt jede Adresse, die diese Seite kontaktieren darf, und keine davon gehört dieser Website. Es gibt hier keine Stelle, an der Ihre Dateien gesammelt werden könnten, und nichts im Code, das sie dorthin schicken würde, wenn es sie gäbe.
- **Nichts hier ruft etwas ab.** Nirgends in `src/` steht ein `fetch`, ein `XMLHttpRequest` oder ein `sendBeacon`. Das ganze Werkzeug ist Arithmetik über die Pixel eines einzigen Bildes: ein Schwellwert, ein Lauf am Rand dessen entlang, was es gefunden hat, und etwas Kurvenanpassung.
- **Es gibt keine Engine zum Herunterladen.** Nachzeichnen ist sonst das Programm von jemand anderem, und im Web heißt das: mehrere Megabyte kompilierter Code, die vor dem ersten Klick eintreffen. Hier gibt es das nicht. Das Ganze sind ein paar hundert Zeilen gewöhnliches JavaScript von diesem Ursprung, und deshalb funktioniert die Seite in dem Moment, in dem sie sich öffnet, statt nach einer Wartezeit.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spendenknopf von Buy Me a Coffee. Keines davon bekommt irgendetwas über Ihr Bild in die Hand. Jede Zeile, die es liest, schwellt oder nachzeichnet, wird von diesem Ursprung ausgeliefert und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzwerkverbindung, und das Werkzeug ist unverändert, weil es nie einen Netzwerkschritt darin gab. Das ist der einfachste Beweis von allen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/mask.js` dafür, wie aus einem Bild ein Bit je Pixel wird, `src/contour.js` für den Lauf am Rand der Form entlang, `src/fit.js` dafür, wie aus einer Treppe Kurven werden, und `src/subject.js` dafür, wie der Hintergrund bestimmt wird, wenn es kein Hell und Dunkel gibt, nach dem sich trennen ließe.
