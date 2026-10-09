# So zeichnen Sie ein Bild als SVG nach

Ein vergrößertes PNG ist eine Treppe. Ein SVG ist eine Zeichenanweisung und deshalb in jeder Größe scharf, und das eine in das andere zu verwandeln heißt Nachzeichnen. Bei Formen gelingt das wunderbar und bei Fotos schlecht, und den Unterschied sollte man kennen, bevor man anfängt.

[Bild zu SVG öffnen](https://abox.tools/de/bild-in-svg-umwandeln/): Eine Form, eine Kontur. Zeigen Sie auf das, was nicht hineingehört.

Zuletzt aktualisiert 31. August 2026

## Die kurze Antwort

Öffnen Sie [Bild zu SVG](https://abox.tools/de/bild-in-svg-umwandeln/), ziehen Sie das Bild hinein und schauen Sie auf die rote Linie. Diese Linie ist die Kontur, wie sie jetzt steht, gezeichnet über die Pixel, aus denen sie stammt. Folgt sie der Form, nehmen Sie die Datei. Steckt etwas darin, das nicht hineingehört — ein Fleck, eine Heftklammer, eine Bildunterschrift, ein Schatten —, klicken Sie darauf, und es verschwindet.

Alles Weitere sind die zwei Fragen, die darüber entscheiden, ob das überhaupt funktioniert: **Ist Ihr Bild eine Form oder ein Foto**, und **welche der beiden Arten, die Form zu finden, braucht es**.

![Die zwei Flächen: links das Bild mit der roten nachgezeichneten Kontur darüber, rechts das fertige SVG.](https://abox.tools/screens/trace-an-image-into-an-svg/outline.webp)

Die Kontur wird über das Bild gezeichnet und nicht nur daneben. Nur dort lässt sich die Frage entscheiden: Eine Kontur ist relativ zu genau diesen Pixeln richtig oder falsch und zu nichts sonst.

## Nachzeichnen ist keine Umwandlung, und Fotos lassen sich nicht nachzeichnen

Ein JPEG in ein PNG umzuwandeln ist eine Umwandlung: dasselbe Bild, anders beschrieben, und unterwegs wird nichts entschieden. Nachzeichnen ist etwas anderes. Es wirft fast alles weg und behält eine einzige Sache, den Rand einer Form, und beschreibt diesen Rand dann als Kurven. Hat Ihr Bild eine klare Form, ist das genau das, was Sie wollten. Ist es das Foto eines Zimmers, gibt es keine Form, die man behalten könnte, und zurück kommt jede Fläche ähnlicher Farbe als eigener Klecks.

Das ist keine Einschränkung, die darauf wartet, weggebaut zu werden, deshalb lohnt es sich, die Zahlen offen zu nennen. Eine A4-Seite Strichzeichnung wird zu drei Formen und sechs Kilobyte. Eine Seite Handschrift zu fünfzig Formen und hundertfünfzig Kilobyte. Ein einziges Megapixel Foto wird zu **viertausend Formen und anderthalb Megabyte** — größer als das JPEG, langsamer zu öffnen, und es sieht nicht wie das Foto aus. An diesem Punkt hört das Werkzeug auf zu zeichnen und sagt es, statt Sie es nach dem Herunterladen entdecken zu lassen.

![Die Warnung, die beim Nachzeichnen eines Fotos erscheint: Tausende getrennter Formen und eine sehr große Datei.](https://abox.tools/screens/trace-an-image-into-an-svg/photograph.webp)

Worauf ein als Strichzeichnung nachgezeichnetes Foto hinausläuft. Die Datei gehört trotzdem Ihnen zum Herunterladen; die Seite weigert sich nur, so zu tun, als wäre es eine Zeichnung.

Was sich gut nachzeichnen lässt:

- Logos, Marken und Monogramme;
- Schablonen, Stempel und Schneidedateien;
- Unterschriften und Handlettering;
- Strichzeichnungen, Schraffuren und Comic-Tusche;
- Silhouetten und alles, was schon schwarz auf weiß ist.

Eine fotografische Aufgabe funktioniert doch, und sie ist eine andere Aufgabe: einen Gegenstand als volle Silhouette aus seinem Hintergrund auszuschneiden. Dafür ist die zweite Einstellung da.

## Die zwei Arten, die Form zu finden

Nachzeichnen braucht ein Bit je Pixel, drinnen oder draußen, und das lässt sich auf zwei Arten entscheiden.

**Hell und Dunkel** fragt für jedes Pixel, ob es dunkler ist als ein Schwellwert, und der Schwellwert wird für Sie ermittelt. Das ist genau richtig für Tinte auf Papier, und es ist, was Sie für jedes Logo, jeden Scan und jede Schablone wollen. Wenn es danebenliegt, liegt es meist sichtbar daneben: Verschieben Sie den Schwellwert, bis die dünnen Striche überleben, ohne dass das Papier dabei grau wird.

**Das Motiv** stellt eine andere Frage, denn bei einem Foto hat die erste keine Antwort. Eine dunkelrote Figur auf dunkelgrauem Stein ist dunkel auf dunkel: Keine Helligkeit trennt die beiden, also kann es kein Schwellwert. Stattdessen lernt diese Einstellung aus einem Streifen am Rand des Bildes, was der *Hintergrund* ist, misst jedes Pixel daran und behält das größte Stück, das nicht dazugehört. Eine Bildunterschrift in der Ecke ist nicht das größte Stück, also fällt sie weg, statt nachgezeichnet zu werden.

Einen Fehlschlag sollte man vorher kennen: ein Foto, das so eng beschnitten ist, dass das Motiv über zwei oder drei Seiten hinausläuft. Der Rand besteht dann überwiegend aus Motiv, das Modell lernt also die Farben des Motivs selbst, und die Antwort kommt verkehrt herum heraus. Daran lässt sich mit keinem Regler etwas rütteln, denn die Annahme war falsch, nicht die Arithmetik. Schalten Sie *den Hintergrund aus den Rändern lernen* aus, setzen Sie den Haken bei *Klick sagt stattdessen „das ist Hintergrund“*, und klicken Sie stattdessen zwei- oder dreimal auf den Hintergrund.

## Korrigieren, was es falsch verstanden hat, indem Sie darauf zeigen

Ein Schwellwert ist eine Zahl für ein ganzes Bild, und irgendwo liegt er immer daneben: Ein Schatten wird zu Tinte, eine Heftklammer überlebt, die Mitte eines O läuft zu. Jeder dieser Fehler ist örtlich und hat eine offensichtliche örtliche Abhilfe, und die ist kein weiterer Regler, sondern das Zeigen auf die Stelle.

Klicken Sie auf alles, was nicht in die Zeichnung gehört, und es verschwindet; ein zweiter Klick holt es zurück. Ein Klick nimmt die **ganze Fläche dieser Farbe**, ein Klick entfernt also einen ganzen Fleck oder einen ganzen Stempel und nicht ein Pixel. Ein Klick auf ein eingeschlossenes Stück Hintergrund füllt es stattdessen, und so schließt sich ein Loch, das keines sein sollte. Die Zeile unter den Bildern sagt vor dem Klick, um welches von beidem es sich handelt und wie groß es ist, ein Klick, der den Großteil des Bildes mitnähme, kommt also nie überraschend.

Korrekturen werden getrennt vom Schwellwert aufbewahrt, ein späteres Verschieben des Reglers wirft sie also nicht weg, und das Umkehren des Bildes kehrt sie mit um: Ein gelöschter Fleck bleibt gelöscht, statt als Loch im Hintergrund wieder aufzutauchen.

## Die zwei Glättungszahlen, und wann man sie anfasst

**Detail** ist, wie weit sich die Linie beim Vereinfachen von den Pixeln entfernen darf. Unter etwa eins bewirkt es gar nichts: Eine Treppenstufe steht ein ganzes Pixel neben der Linie, zu der sie gehört, eine kleinere Toleranz behält also jede Stufe, und es bleibt nichts zu vereinfachen. Über etwa zwei beginnt es, echte Kurven aufzufressen. Es wird je Form ermittelt, solange Sie nichts anderes sagen, denn eine Zahl kann nicht zugleich einer ganzen Figur und einem zwei Pixel breiten Buchstabenstamm dienen.

**Eckenschärfe** ist, wie stark die Kontur abknicken muss, damit der Knick als Ecke bleibt, statt zur Kurve gerundet zu werden. Das ist nur die halbe Entscheidung: Ein Punkt bleibt auch dann eine Ecke, wenn er weit genug neben seinen Nachbarn steht, und das erfasst jede offensichtliche Ecke von allein, diese Zahl entscheidet also nur über die flachen Knicke. Unter etwa zwanzig Grad wird alles zur Ecke, und ein Kreis kommt als Vieleck zurück.

Bei den meisten Bildern muss keine von beiden angefasst werden. Kennen sollte man sie wegen der zwei Fälle, in denen es doch nötig ist: ein Scan sehr kleiner Schrift, der mehr Detail will, und eine Form, die Sie auf einer Maschine schneiden werden, die meist weniger will.

## Was Sie bekommen, und was Sie damit anfangen

Eine Datei mit einem einzigen `<path>` darin. Die Außenlinien sind in die eine Richtung gewunden und die Löcher darin in die andere, und genau das lässt eine Form mit vierzig Löchern ein einziges Element sein, ohne dass eine Füllregel zu setzen wäre. Deshalb lesen Illustrator, Inkscape, Figma, ein Browser und die meiste Schneidesoftware es alle gleich.

![Der letzte Schritt: wie viele Formen und Punkte die Zeichnung hat, ihre Größe und der Download-Knopf.](https://abox.tools/screens/trace-an-image-into-an-svg/save.webp)

Ein Blick auf die Zahl lohnt sich vor dem Herunterladen. Eine Zeichnung hat Dutzende oder Hunderte Punkte; Tausende heißt, das Bild war ein Foto.

Der umgekehrte Weg — ein SVG, das Sie schon haben, und ein PNG, das Sie brauchen — ist [eine andere Aufgabe mit eigenem Ratgeber](https://abox.tools/de/ratgeber/svg-in-png-umwandeln/). Nichts am Nachzeichnen lässt sich umkehren: Das SVG, das hier herauskommt, ist eine neue Zeichnung der Form, nicht das Bild, aus dem es gemacht wurde.
