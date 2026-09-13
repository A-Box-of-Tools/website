# So schwärzen Sie ein PDF, damit der Text wirklich weg ist

Ein schwarzes Rechteck über einem Namen und ein gelöschter Name sehen auf dem Bildschirm gleich aus. Eines von beiden übersteht das Markieren und Kopieren. Hier steht der Unterschied, die Orte, an denen ein Wort steckt und die gar keine Seite sind, und die Prüfung von dreißig Sekunden, die Ihnen sagt, welches der beiden Sie vor sich haben.

[PDF-Schwärzer öffnen](https://abox.tools/de/pdf-schwaerzen/): Die Buchstaben werden aus der Datei gelöscht, und danach wird die Datei durchsucht, um es zu belegen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [PDF-Schwärzer](https://abox.tools/de/pdf-schwaerzen/), ziehen Sie das Dokument hinein, tippen Sie die Wörter, die weg müssen, kreuzen Sie die an, die Sie meinen, und drücken Sie „Entfernen“. Die Buchstaben werden aus den Zeichenanweisungen der Seite gelöscht, dieselben Wörter werden aus Lesezeichen, Kommentaren, Formularfeldern und Dokumenteigenschaften entfernt, und die fertige Datei wird vor Ihren Augen erneut geöffnet und durchsucht, bevor sie Ihnen angeboten wird.

Alles Folgende erklärt, warum der letzte Halbsatz der wichtige ist, und wie Sie erkennen, ob das Werkzeug, das Sie ohnehin benutzen, dasselbe von sich sagen kann.

## Um welches Versagen es hier geht

Zeichnen Sie in einem PDF-Betrachter ein schwarzes Rechteck über einen Namen. Was Sie sehen, ist ein Name mit einem schwarzen Rechteck darüber. Was die meisten Betrachter *speichern*, ist ein Dokument, das den Namen enthält, und daneben ein Rechteck mit Position, Größe und Farbe.

Ein so gezeichnetes Rechteck ist eine **Anmerkung**: ein Objekt, das neben der Seite sitzt und nicht in ihr. Der Text darunter ist genau, wie er war. Markieren Sie den Bereich und drücken Sie Kopieren, öffnen Sie die Datei in einem Programm, das Anmerkungen anders zeichnet, oder lassen Sie irgendeinen Text-Extraktor darüberlaufen, und der Name ist zurück. Nichts auf dem Bildschirm unterscheidet das von einer echten Schwärzung, und genau deshalb passiert es weiterhin Organisationen, die Juristen beschäftigen.

Es hat Gerichtsakten veröffentlicht, nachrichtendienstliche Bewertungen, Verträge und im Dezember 2025 geschwärzte Namen in einer Massenveröffentlichung von Dokumenten des US-Justizministeriums, die binnen Stunden nach Erscheinen lesbar waren. Das Muster ist immer dasselbe. Das Rechteck war die Anmerkung, und die Anmerkung war nie der Text.

## Was eine echte Schwärzung stattdessen tut

Eine Seite in einem PDF ist eine Liste von Anweisungen: setze diese Schrift, führe den Stift hierhin, zeichne diese Glyphen. Die Wörter auf der Seite existieren an genau einer Stelle, als Operanden dieser Zeichenanweisungen:

```
BT /F1 12 Tf 72 700 Td (Sehr geehrter Herr Schmidt) Tj ET
```

Den Namen zu schwärzen heißt, **diese Buchstaben aus dieser Anweisung zu löschen** und die Seite wieder herauszuschreiben. Danach gibt es nichts wiederherzustellen, nicht weil die Datei es gut versteckt, sondern weil die Buchstaben nicht in der Datei sind. Es gibt kein Rechteck mit etwas darunter, weil darunter nichts ist.

Eines muss wieder hinein, sonst ist das Ergebnis sichtbar falsch. Text wird gezeichnet, indem ein Stift über die Seite vorrückt, fünf Buchstaben zu löschen zieht den Rest der Zeile also um fünf Buchstaben nach links: Spalten stehen nicht mehr in einer Flucht, und Summen rutschen unter die falsche Überschrift. Ein Werkzeug, das das richtig macht, misst, wie weit die entfernten Buchstaben den Stift vorgerückt hätten, und setzt diesen Abstand als Anweisung wieder ein, die den Stift bewegt, ohne etwas zu zeichnen.

Der schwarze Kasten wird, wenn es einen gibt, *danach* gezeichnet, über eine bereits leere Lücke. Er ist eine Höflichkeit gegenüber dem, der das Dokument liest, ein Zeichen, dass etwas entfernt wurde, und nicht die Schwärzung. Das ist der ganze Unterschied in einem Satz: Bei einer echten Schwärzung ist der Kasten Verzierung; bei einer falschen *ist* der Kasten die Schwärzung.

![Die Suchkarte: zwei eingetragene Begriffe, dazu die Anzahl der Treffer und eine Liste jeder Fundstelle im Dokument.](https://abox.tools/screens/redact-a-pdf/find.webp)

Sie sagen, was verschwinden muss, und das Werkzeug findet jede Fundstelle — auch die auf Seite drei, an die sich niemand erinnert hat.

## Die vier Orte, an denen ein Wort steckt und die keine Seite sind

Das ist der Teil, der die erwischt, die den ersten Teil richtig gemacht haben. Ein PDF trägt Text an mehreren Stellen gleichzeitig, und ein Betrachter zeigt, durchsucht oder kopiert sie alle. Einen Namen von der Seite zu entfernen und an einer dieser Stellen zu lassen heißt, ihn nicht entfernt zu haben.

- **Die Dokumenteigenschaften.** Titel, Autor und der Name der Datei, aus der diese exportiert wurde. Ein Dokument, aus dessen Seiten ein Name entfernt wurde und dessen Eigenschaften weiterhin `Schmidt Vergleich Entwurf 3.docx` lauten, ist nicht geschwärzt. Meist gibt es eine zweite Kopie derselben Angaben in einem XMP-Paket, das ebenfalls gehen muss.
- **Lesezeichen.** Die Gliederung am Rand eines Betrachters ist eine Liste von Überschriften mit angehängten Seitenzahlen, und eine Überschrift ist eine Textzeile, über die nichts auf der Seite bestimmt.
- **Formularfelder und Kommentare.** Was jemand in ein Formular getippt hat, wird zweimal gespeichert: einmal als Wert des Feldes und einmal als das Aussehen, das der Betrachter zeichnet. Beides muss gehen. Ein Notizzettel trägt seinen Text und den Namen dessen, der ihn geschrieben hat.
- **Der Ersatztext.** Ein PDF darf erklären, dass eine Folge von Glyphen etwas anderes „buchstabiert“, damit eine Ligatur oder eine getrennte Zeile als das Wort kopiert, für das sie steht. Das heißt, ein Dokument kann das eine zeigen und einem Leser bei Strg+C etwas anderes übergeben, und eine Schwärzung, die nur das Gezeichnete entfernt, ließe den Satz für jeden intakt, der den Absatz markiert.

Anhänge sind der fünfte. Ein PDF kann ganze andere Dateien in sich tragen, und nichts, was Sie mit den Seiten tun, berührt sie.

![Die Seitenkarte: der Text einer Seite, ausgelesen und markierbar, mit den gefundenen Begriffen hervorgehoben.](https://abox.tools/screens/redact-a-pdf/page.webp)

Das ist der Teil, der überrascht. Eine PDF ist kein Bild: Ihre Wörter lassen sich von jedem, der sie bekommt, markieren, durchsuchen und kopieren.

## Wie Sie eine Datei prüfen, in dreißig Sekunden

Machen Sie das mit allem, was Sie verschicken wollen, gleich welches Werkzeug es erzeugt hat. Es ist die Prüfung, die jedes einzelne der veröffentlichten Versagen aufgedeckt hätte.

1. **Öffnen Sie die fertige Datei und drücken Sie Strg+F** (Cmd+F auf einem Mac). Suchen Sie nach dem entfernten Wort. Eine echte Schwärzung liefert nichts. Springt der Betrachter zu einem schwarzen Rechteck, ist das Wort noch da und das Rechteck sitzt darauf.
2. **Markieren Sie den geschwärzten Bereich und kopieren Sie ihn.** Ziehen Sie über das Rechteck, drücken Sie Strg+C und fügen Sie es in ein Textfeld ein. Kommt irgendetwas an, haben Sie dasselbe Versagen von der anderen Seite gefunden.
3. **Markieren Sie das ganze Dokument und kopieren Sie das.** Strg+A, dann Strg+C, in einen beliebigen Texteditor einfügen und lesen, was herauskommt. Das ist die nützlichste der drei, weil sie Ihnen das Dokument so zeigt, wie ein Text-Extraktor es sieht, einschließlich Text, von dem Sie nichts wussten, was auf einer eingescannten Seite häufig vorkommt.
4. **Sehen Sie in die Eigenschaften**, in den meisten Betrachtern unter Datei → Eigenschaften, und in die Lesezeichenleiste. Beides sind Orte, an denen ein Name eine auf der Seite perfekte Schwärzung überlebt.

Der [PDF-Schwärzer](https://abox.tools/de/pdf-schwaerzen/) führt die erste und die dritte für Sie aus und zeigt die Zahl, denn ein Werkzeug, das behauptet, es habe etwas entfernt, ist kein Beleg, und eine Suche in der fertigen Datei ist einer.

## Eingescannte Dokumente sind ein anderes Problem

Ein Scan ist ein Foto einer Seite. Die Wörter darauf sind Pixel und kein Text, und keine noch so gründliche Bearbeitung der Textebene berührt sie, weil es keine Textebene gibt oder weil die vorhandene das Bild beschreibt, statt es zu sein.

Die meisten heutigen Scanner und PDF-Werkzeuge legen eine unsichtbare Textebene über das Bild, geschrieben von einer Zeichenerkennung, damit die Seite durchsuchbar ist. Diese Ebene ist echter Text und lässt sich entfernen. Sie zu entfernen lohnt sich: Sie ist das, was eine Suche, ein Kopieren und jedes automatische System, das Dokumente liest, gefunden hätten. Am Bild ändert es nichts, und dort sind die Wörter für jeden, der auf die Seite sieht, weiterhin bestens lesbar.

Für einen Scan ist die ehrliche Reihenfolge also: die Wörter aus der Textebene nehmen und sich dann getrennt um das Bild kümmern, und das heißt Pixel überschreiben. Genau das tut der [Bild-Schwärzer](https://abox.tools/de/ratgeber/bild-unkenntlich-machen/), und der Ratgeber daneben erklärt, warum Weichzeichnen oder ein Mosaik für Text nicht genügen.

## Warum nicht einfach ausdrucken und neu einscannen

Weil es funktioniert und Sie alles andere kostet. Eine geschwärzte Seite auszudrucken und wieder einzuscannen liefert tatsächlich ein Dokument ohne Textebene, die lecken könnte, und ein Dokument, das niemand durchsuchen kann, das kein Screenreader lesen kann, das fünf- bis fünfzigmal so groß ist und dessen Qualität davon abhängt, wozu der Bürokopierer gerade aufgelegt war. Es setzt außerdem voraus, dass die Seite so gedruckt hat, wie sie aussah: Eine Anmerkung kann als „am Bildschirm anzeigen, nicht drucken“ markiert sein, und wenn das Ihr schwarzer Kasten war, steht auf dem Blatt aus dem Drucker der Name.

Dasselbe Argument gilt für „auf ein Bild reduzieren“, das manche Werkzeuge als Schwärzung anbieten. Es macht aus jeder Seite ein Foto ihrer selbst. Waren die Wörter verdeckt statt gelöscht, ist die Verdeckung nun dauerhaft, aber alles andere am Dokument ist mit ihr gegangen, und die Datei, die Sie verschicken, ist eine, mit der niemand arbeiten kann.

## Warum diese Aufgabe einen Upload am wenigsten verträgt

Einem Schwärzungsdienst muss die ungeschwärzte Datei übergeben werden. Das ist der ganze Vorgang: Die private Fassung kommt zuerst an, vollständig, und ist die Fassung, die auf einer fremden Festplatte liegt. Was die Datenschutzerklärung auch sagt, an der Reihenfolge lässt sich nicht rütteln: Das Dokument, mit dem Sie vorsichtig sein wollten, ist das, das Sie herausgegeben haben.

Was Leute schwärzen, macht das schlimmer, als es klingt. Zeugenaussagen, Arztbriefe, Kontoauszüge für den Vermieter, ein Vertrag mit dem Namen eines Mandanten darin, der an einen anderen geht, ein Schriftsatz mit einer Privatadresse. Das sind die Dokumente, und genau deshalb sollte das Werkzeug dafür keinen Server am anderen Ende haben.

Alles am [Schwärzer dieser Seite](https://abox.tools/de/pdf-schwaerzen/) passiert in Ihrem eigenen Browser: Die Datei wird auf Ihrem Gerät gelesen, bearbeitet, geschrieben und geprüft, und die Wörter, nach denen Sie suchen, verlassen den Tab ebenfalls nie. Trennen Sie die Internetverbindung, und es arbeitet weiter, und das ist der einfachste Beleg dafür, dass nichts irgendwohin gesendet wird. Was ein Upload eigentlich bedeutet, steht unter [ist das Hochladen von Dateien sicher](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/).
