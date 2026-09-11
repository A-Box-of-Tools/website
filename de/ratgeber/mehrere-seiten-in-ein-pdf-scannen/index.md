# So scannen Sie mehrere Seiten in ein kleines PDF

Der Botengang ist selten eine Seite. Es ist ein Vertrag samt Unterschriftenseite, oder ein Jahr Belege, und am Ende ein Postfach, das nichts über ein paar Megabyte annimmt. Drei Werkzeuge decken den ganzen Weg ab, und die Unterlagen bleiben dabei durchgehend auf Ihrem eigenen Gerät.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Fotografieren Sie jede Seite und ziehen Sie dann alle Fotos auf einmal auf den [Dokumentenscanner](https://abox.tools/de/dokumente-scannen/). Er findet die Ecken jeder Seite, richtet jedes Foto gerade und schreibt *ein PDF mit einer Seite je Foto*. Ein eigener Schritt zum Zusammenfügen entfällt, und die Seiten sitzen in der Reihenfolge, in der Sie sie hinzugefügt haben.

Zwei Werkzeuge übernehmen dort, wo der Scanner aufhört. Ist ein Teil des Dokuments bereits ein PDF, etwa der Vertrag, den man Ihnen gemailt hat, um Ihre gescannte Unterschriftenseite herum, dann verschachteln Sie beides mit dem [PDF-Zusammenführer](https://abox.tools/de/pdf-zusammenfuegen/). Und ist die fertige Datei immer noch größer, als das Postfach erlaubt, bringt der [PDF-Verkleinerer](https://abox.tools/de/pdf-verkleinern/) sie unter das Limit.

Beide Anschlüsse sind einen Klick entfernt: Sobald der Scanner sein PDF geschrieben hat, bietet eine Zeile unter dem Download-Knopf an, das Ergebnis direkt an den Zusammenführer oder den Verkleinerer weiterzureichen, schon geladen — und der Zusammenführer reicht sein eigenes Ergebnis auf demselben Weg an den Verkleinerer weiter.

Nichts in der Kette lädt irgendetwas hoch. Das zählt hier mehr als fast überall sonst: Gescannt werden Verträge, Ausweise und Krankenunterlagen, und die üblichen Apps dafür schicken jede Seite über ihre Server.

## Die Fotos richtig machen

Der Scanner rettet erstaunlich viel, schräge Aufnahmen, ungleichmäßiges Lampenlicht, einen Schatten quer über der Seite, aber er kann nicht retten, was die Kamera nie erfasst hat. Drei Gewohnheiten decken das meiste ab:

- **Den Rahmen füllen**, mit einem sichtbaren Rand Tisch um jede Kante. Die Ecken werden gefunden, indem die Seite gegen den Hintergrund gesucht wird; eine Seite, die aus dem Foto läuft, hat keine Ecke, die sich finden ließe.
- **Von oben fotografieren**, ungefähr senkrecht. Die Perspektive wird korrigiert, aber die ferne Kante einer flachen Aufnahme hat weniger Pixel, und die Korrektur kann keine erfinden.
- **Eine Seite je Foto**, in Lesereihenfolge. Umsortieren geht auch hinterher, aber die Reihenfolge des Fotografierens ist die Reihenfolge, die Sie bekommen, und in Ordnung zu fotografieren ist umsonst.

Der [Scan-Ratgeber](https://abox.tools/de/ratgeber/dokument-mit-handy-scannen/) behandelt den Rest: wie die Ecken gefunden werden, wann Sie sie selbst ziehen sollten und was der Schwarzweißmodus mit der Dateigröße macht.

![Der Scanner mit drei fotografierten Seiten in einem Streifen, die erste davon geöffnet und mit markierten Ecken.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/pages.webp)

Drei Seiten, gemeinsam fotografiert und begradigt. Jede behält ihre eigenen Ecken, sodass ein misslungenes Foto nicht den ganzen Satz verdirbt.

## Wann der Zusammenführer seinen Platz verdient

Der Scanner kombiniert *Fotos*. Der Zusammenführer kombiniert *PDFs*, und die Mitte eines echten Botengangs ist oft beides: eine eben fotografierte unterschriebene Seite in einem Dokument, das als Datei ankam. Scannen Sie erst Ihre Seiten, ziehen Sie dann den Scan und das Original-PDF zusammen in den Zusammenführer, schieben Sie die Seiten an ihren Platz und exportieren Sie ein Dokument. Lesezeichen und interne Verweise des Originals werden gegen die überlebenden Seiten neu aufgebaut, und ausgefüllte Formularfelder kommen mit.

Dasselbe gilt für Scans von verschiedenen Tagen: Das PDF jeder Sitzung fällt als Seitenblock hinein, und der Zusammenführer ist der Ort, an dem die Blöcke eine Datei werden.

![Der PDF-Ersteller mit den drei gereinigten Seiten in der Liste, darüber Seitengröße, Ausrichtung und Rand.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/document.webp)

Und dann dieselben drei Seiten als ein Dokument, der Schritt, für den sich der Zusammenführer lohnt.

## Unter das Größenlimit kommen

Probieren Sie zuerst den billigen Hebel, und der sitzt im Scanner: Für Seiten, die Tinte auf Papier sind, Text, Formulare, Belege, speichert der Schwarzweißmodus jede Seite mit einem Bit je Pixel, und das PDF landet meist deutlich unter einem Megabyte je Seite, ganz ohne Verkleinern. Farbe ist ihre Kosten nur wert, wo die Farbe etwas bedeutet.

Wenn die Datei trotzdem nicht abgeschickt werden will, bei farbigen Seiten, oder nach einem Zusammenführen, das den Scan eines anderen hereingeholt hat, zeigt der Verkleinerer zuerst, wo die Größe wirklich sitzt, und kodiert dann die Seitenbilder gegen die Auflösung neu, mit der sie gezeigt werden. Er prüft außerdem, dass sich das Ergebnis öffnen lässt, bevor er es anbietet, was man zu schätzen weiß, wenn die Datei ein Vertrag mit Frist ist.

## Wenn Sie das jede Woche tun

Dass die Schritte hier auf drei Seiten leben, ist Absicht: Jede Seite macht eine Aufgabe, und jede beweist für sich, dass die Unterlagen Ihr Gerät nie verlassen haben. Aber alles davon ist quelloffen: MIT-lizenziert, ein Ordner je Werkzeug, abhängigkeitsfreie ES-Module mit READMEs, die den Eckenfinder, das Seitenkopieren des Zusammenführers und das Budget des Verkleinerers erklären.

Wenn derselbe Botengang jede Woche auf Ihrem Tisch landet, setzen Sie einen Coding-Agenten auf das [Repository](https://github.com/A-Box-of-Tools/website) an und lassen Sie ihn diese Module zu einer Seite dafür zusammensetzen: scannen, direkt hinein in ein zusammengeführtes, verkleinertes Dokument mit Ihrem Deckblatt schon an Ort und Stelle. Die Module sind zum Lesen geschrieben, und sie herauszuheben ist genau das, wofür die Lizenz da ist.
