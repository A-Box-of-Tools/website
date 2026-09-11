# So bearbeiten Sie ein GIF Bild für Bild

Einen GIF-Editor gibt es hier nicht, und es braucht auch keinen: Ein Zerleger, der die Animation in Einzelbilder auseinandernimmt, und ein Macher, der aus Einzelbildern eines baut, sind ein Editor mit einem Ordner in der Mitte. Und der Ordner ist der Teil, in dem Sie bearbeiten, mit dem, was Sie für Bilder ohnehin benutzen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

1. **Auseinandernehmen.** Öffnen Sie den [GIF-Zerleger](https://abox.tools/de/gif-in-einzelbilder-zerlegen/) und ziehen Sie das GIF hinein. Jedes Einzelbild wird sein eigenes PNG, so, wie es auf dem Bildschirm erscheint, mit erhaltener Transparenz, und im Zip liegt eine Timing-Liste: die Haltezeiten je Bild, aufgeschrieben für den Wiederaufbau.
2. **Den Ordner bearbeiten.** Löschen Sie die Bilder, die gehen sollen, retuschieren Sie in irgendeinem Bildeditor, was sich ändern soll, benennen Sie um, um umzusortieren. Ein Ordner voller PNGs ist ein Format, das alles versteht.
3. **Wieder zusammensetzen.** Ziehen Sie den Ordner auf den [GIF-Macher](https://abox.tools/de/gif-erstellen/), setzen Sie die Haltezeiten, oder stützen Sie sich auf die Timing-Liste, wählen Sie die Palette und exportieren Sie.

Alle drei Schritte laufen in Ihrem Browser. Nichts wird an irgendeiner Stelle hochgeladen, was hier mehr zählt als sonst: Die GIFs, die Menschen reparieren, sind so oft Bildschirmaufnahmen, in denen etwas Heikles halb zu sehen ist.

## Was der Zerleger Ihnen vor dem Bearbeiten sagen kann

Der Zerleger zeigt zu jedem Bild Haltezeit, Position, Größe und Entsorgung, und dieses Panel lohnt einen Blick, bevor Sie irgendetwas anfassen, denn es erklärt die zwei Überraschungen in den meisten GIFs.

Erstens: Nicht alle Bilder sind ganze Bilder. Viele GIFs speichern nur die Pixel, die sich geändert haben, über das vorige Bild geflickt. Der Zerleger bietet jedes Bild *wie es erscheint* oder *wie es gespeichert ist* an, und zum Bearbeiten wollen Sie fast immer *wie es erscheint*, damit jedes PNG für sich steht. Zweitens: Haltezeiten gelten je Bild, nicht als eine Zahl. Die Pause auf der Pointe ist eine echte Haltezeit auf einem echten Bild, und die Timing-Liste ist, was sie über die Rundreise trägt.

Für die üblichen Kürzungen ist der Ordner-Schritt sogar optional: Jedes zweite oder fünfte Bild behalten, oder die gewünschten ankreuzen, kann der Zerleger selbst, und die Bilder zu halbieren ist die wirksamste Abmagerung, die ein GIF bekommen kann.

![Der Zerleger mit zwölf nummerierten Einzelbildern einer Animation, jedes mit der Zeit, die es stehen bleibt.](https://abox.tools/screens/edit-a-gif-frame-by-frame/apart.webp)

Jedes Einzelbild, nummeriert, mit seiner eigenen Anzeigedauer. Diese Hälfte sagt Ihnen, was Sie bearbeiten, bevor Sie es bearbeiten.

## Was der Neubau kostet, ehrlich

Ein GIF hält höchstens 256 Farben, gewählt beim Bauen. Der Neubau quantisiert die Bilder erneut, eine gemeinsame Palette oder die besten Farben je Bild, und auf fotografischem Material kann diese zweite Quantisierung sichtbar werden. Auf Bildschirmaufnahmen und Zeichnungen, der üblichen Fracht, wird sie es nicht: Die haben nie 256 Farben benutzt.

Die übrigen Hebel des Machers sind die aus dem [GIF-Budget-Ratgeber](https://abox.tools/de/ratgeber/gif-aus-videoausschnitt/): weniger Farben, Floyd-Steinberg-Dithering für Verläufe, und das Schleifenverhalten, für immer, einmal oder eine Anzahl.

Ob die Operation gelungen ist, und wo die Bytes wirklich wohnen, zeigt der [GIF-Analysierer](https://abox.tools/de/gif-analysieren/): Er trägt Bilder gegen Bytes auf, und das schwere Bild ist meist ein voller Neuanstrich, den jemand hätte zuschneiden können.

Den Weg dorthin bietet der Ersteller selbst an: Nach dem Export reicht eine Zeile unter seinem Download-Knopf das frische GIF direkt an den Analysierer weiter, schon geladen.

![Der GIF-Ersteller mit sechs Einzelbildern in Reihenfolge, jedes mit einem Feld für die Anzeigedauer, und einer Zeile, die alle Dauern auf einmal setzt.](https://abox.tools/screens/edit-a-gif-frame-by-frame/together.webp)

Und wieder zurück. Die Anzeigedauern müssen von Hand gesetzt werden, und das ist der Teil des Hin und Her, den man vorher kennen sollte.

## Wenn Sie das jede Woche tun

Zerlegen, Ordner, Neubau: Die Schritte leben auf getrennten Seiten, weil jede eine Aufgabe macht und jede für sich beweisen kann, dass nichts Ihr Gerät verlässt. Aber alles davon ist quelloffen: MIT-lizenziert, ein Ordner je Werkzeug, abhängigkeitsfreie ES-Module, deren READMEs den Decoder, die Entsorgungsregeln und den Quantisierer erklären.

Ist GIF-Chirurgie eine wiederkehrende Pflicht, setzen Sie einen Coding-Agenten auf das [Repository](https://github.com/A-Box-of-Tools/website) an und lassen Sie sich die Bildtabelle des Zerlegers und den Encoder des Machers in eine Seite falten, auf der ein Bild zu löschen ein Klick ist. Die Module sind zum Lesen geschrieben, und sie herauszuheben ist genau das, wofür die Lizenz da ist.
