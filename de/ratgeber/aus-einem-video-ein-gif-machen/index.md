# So machen Sie aus einem Video ein GIF

GIF ist ein Format von 1987, das ganze Bilder speichert und keine Bewegung. Eines aus einem Video wird deshalb immer groß. Hier steht, an welcher der drei Einstellungen Sie drehen sollten, wenn es zu groß gerät, und wie viel jede davon bringt.

[Video zu GIF öffnen](https://abox.tools/de/video-in-gif-umwandeln/): Abschnitt, Größe und Bildrate selbst wählen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [Video-zu-GIF-Umwandler](https://abox.tools/de/video-in-gif-umwandeln/), ziehen Sie den Clip hinein, markieren Sie die Sekunden, die Sie wollen, und lassen Sie die Breite bei 480 und die Rate bei 12 Bildern pro Sekunde. Das ist die Einstellung, mit der die allermeisten GIFs gut fahren. Gerät die Datei zu groß, nehmen Sie die Breite herunter, bevor Sie irgendetwas anderes anfassen, denn die zahlt sich doppelt aus.

Der Rest dieser Seite handelt vom Warum. Denn „mein GIF hat 14 MB“ ist das Problem, das tatsächlich alle haben, und an welchem Regler dann zu drehen ist, liegt keineswegs auf der Hand.

## Warum ein GIF aus einem Video so gewaltig wird

Ein Video-Codec speichert *Bewegung*. Er schreibt alle paar Sekunden ein volles Bild und für jedes Einzelbild dazwischen nur die Beschreibung, wie sich dieses Bild verändert hat: Dieser Pixelblock ist vier nach links gerutscht, jener Bereich ist etwas dunkler geworden. Ein fünf Sekunden langer Clip kommt so mit ein paar hundert Kilobyte aus, weil das meiste darin Anweisungen zu einem Bild sind, das Sie längst haben.

GIF kennt davon nichts. Es war 1989 fertig, bevor es all das gab. Jedes Einzelbild ist ein eigenes Bild, für sich komprimiert, und zwar mit einem Verfahren, das für Bildschirmfotos von Tabellenkalkulationen entworfen wurde. Eine Bewegungsschätzung gibt es im Format nirgends, und nachrüsten lässt sie sich auch nicht.

Rechnen Sie deshalb mit dem **Zehnfachen der Videogröße**, da redet Sie kein Umwandler heraus. Was ein guter tun kann, ist, obendrauf nichts zu verschwenden und Ihnen die drei Einstellungen zu geben, an denen es wirklich hängt.

![Die Abschnitt-Karte: ein Videobild mit Zeitcode und ein Balken, der ein vier Sekunden langes Stück aus einem zwanzig Sekunden langen Clip zeigt.](https://abox.tools/screens/turn-a-video-into-a-gif/section.webp)

Zuerst der Abschnitt, denn jede Einstellung darunter wird mit der Anzahl der behaltenen Sekunden multipliziert.

## Die drei Einstellungen, und was jede kostet

Die Größe eines GIFs läuft am Ende immer darauf hinaus, wie viele Pixel darin stecken, also auf Länge mal Bildrate mal Fläche eines Einzelbildes.

- **Der Abschnitt, linear.** Doppelt so lang sind doppelt so viele Einzelbilder und ungefähr die doppelte Datei. Das verstehen die meisten schon, und man darf ruhig rücksichtslos damit sein. Ein GIF, das seinen Witz in drei Sekunden erzählt, ist das bessere GIF und obendrein das kleinere.
- **Die Breite, quadratisch.** Wer die Breite halbiert, halbiert die Höhe gleich mit und landet damit bei einem *Viertel* der Pixel. Von 640 auf 320 spart also nicht knapp die Hälfte, sondern rund drei Viertel. Das ist die Einstellung, an die niemand zuerst denkt, und die, die am meisten bringt.
- **Die Bildrate, linear.** Zehn Bilder pro Sekunde sind zwei Drittel der Größe von fünfzehn. Hier fällt der Verlust allerdings am ehesten auf, denn zu langsame Bewegung liest sich als kaputt und nicht als sparsam.

Einmal durchgerechnet. Sechs Sekunden Handy-Clip in seinen eigenen ⁦1080×1920⁩ bei 30 fps sind 180 Einzelbilder zu zwei Millionen Pixeln, zusammen also rund 350 Millionen Pixel. Das ist kein GIF mehr, das ist eine Zumutung. Dieselben sechs Sekunden mit 480 Pixeln Breite und 12 fps sind 72 Einzelbilder zu 400.000 Pixeln, also 30 Millionen und damit etwa ein Zwölftel. Und es sieht nach dem aus, was man landläufig unter einem GIF versteht.

![Die Export-Karte: eine Breite von 480, eine Bildrate, eine Dithering-Wahl und eine Schätzung von Einzelbildern und Größe.](https://abox.tools/screens/turn-a-video-into-a-gif/size.webp)

Drei Einstellungen und eine Schätzung, die sich mit ihnen bewegt. Welche zuerst auszugeben ist, darum geht es in diesem Abschnitt.

## Welche Bildrate es sein sollte

Zwölf ist hier die Voreinstellung und überraschend oft die richtige Antwort. Mit dieser Rate arbeitet handgezeichneter Trickfilm seit einem Jahrhundert: schnell genug, dass das Auge zusammenhängende Bewegung sieht, langsam genug, dass Sie nicht für Einzelbilder zahlen, die niemand wahrnimmt.

- **⁦5–8⁩**: wirkt wie eine Diashow. Taugt für einen langsamen Schwenk oder eine Bildschirmaufnahme, in der sich nichts Schnelles tut.
- **⁦10–15⁩**: normal. Liest sich als Bewegung. Hier liegt praktisch jedes GIF, das die Mühe wert ist.
- **⁦20–25⁩**: flüssig, und rund doppelt so groß wie 12 für einen Unterschied, den die meisten nicht benennen könnten. Lohnt sich bei schneller Bewegung, einem Sportclip, allem mit einem Reißschwenk darin.

Eine harte Obergrenze gibt es auch, und die dürfen Sie ruhig kennen: GIF speichert die Standzeit jedes Einzelbildes in Hundertstelsekunden, und jeder Browser behandelt eine Verzögerung unter zwei Hundertsteln als zehn. Das echte Maximum liegt damit bei 50 Bildern pro Sekunde, und eine Datei, die 100 verlangt, spielt klammheimlich mit 10. Wer Ihnen 60 fps anbietet, ignoriert das entweder, oder er wird Sie gleich überraschen.

## 256 Farben, und wofür Dithering gut ist

Die andere Hälfte des Formatalters: Ein GIF führt eine einzige Tabelle mit höchstens 256 Farben mit sich, und jedes Pixel ist nur eine Nummer, die darauf zeigt. Ein Videobild hat bis zu sechzehn Millionen. Fast alles davon fliegt raus, und wie es rausfliegt, macht den größten Teil davon aus, wie ein GIF am Ende aussieht.

Ein guter Umwandler zählt die Farben in *Ihrem* Clip und wählt 256 aus, die dazu passen, statt einen festen Satz zu nehmen. Eine Waldaufnahme bekommt 256 Grüntöne, ein Sonnenuntergang 256 Orangetöne. Genau das tut das Werkzeug hier, und zwar über alle Einzelbilder des Abschnitts hinweg statt nur über das erste, damit auch eine Farbe, die erst am Ende auftaucht, noch einen Platz bekommt.

**Dithering** springt dort ein, wo die gebrauchte Farbe trotzdem fehlt. Eine ganze Fläche auf die nächstgelegene verfügbare Farbe zu runden macht aus einem weichen Himmel vier flache Bänder mit sichtbaren Stufen dazwischen. Stattdessen wechselt das Dithering die beiden nächstgelegenen Farben in einem feinen Muster ab, und aus normalem Abstand mischt Ihr Auge daraus die Farbe, die es gar nicht gibt.

- **Lassen Sie es an** bei allem Fotografischen, also bei Himmel, Haut, Verläufen, Schatten und Film.
- **Schalten Sie es ab** bei einfarbigen Flächen: Bildschirmaufnahmen, Strichzeichnungen, Logos, Zeichentrick, alles mit großen Flächen eines Tons. Da gibt es keinen Verlauf zu retten, und die Datei wird ohne kleiner und sauberer.

Ein Detail, das beim Vergleichen von Umwandlern hilft. Bei der naheliegenden Art zu dithern, der Fehlerverteilung, mit der die meisten Bildbearbeitungsprogramme arbeiten, hängt das Ergebnis jedes Pixels von seinen Nachbarn ab. In einer Animation dithert ein unbewegter Hintergrund dadurch in jedem Einzelbild anders und fängt sichtbar an zu kribbeln, und jedes Einzelbild muss vollständig gespeichert werden, weil sich technisch gesehen jedes Pixel geändert hat. Die Alternative, ein geordnetes Dithering, hängt nur davon ab, wo ein Pixel liegt, und ein stehender Hintergrund bleibt damit vollkommen ruhig. Das benutzt dieses Werkzeug, und deshalb werden seine Dateien zugleich kleiner und ruhiger.

## Wann Sie besser gar kein GIF machen

Die Frage lohnt sich, denn ehrlicherweise lautet die Antwort oft „lieber nicht“. Ein stummes MP4 oder WebM in Endlosschleife ist etwa ein Zehntel so groß wie dieselbe Animation als GIF und spielt genauso ab. Und es ist ohnehin das, worin jede soziale Plattform Ihr GIF nach dem Hochladen umwandelt.

Beim GIF bleiben Sie, wo das Ziel wirklich eines verlangt:

- überall dort, wo nur ein Bild angenommen wird, also in einer Menge Chat-, Foren-, Wiki- und E-Mail-Software;
- in einer README oder auf einer Dokumentationsseite, wo ein GIF direkt losläuft und ein Video einen Player braucht;
- in einer Präsentation oder einem Dokument, das auch offline in Bewegung bleiben muss;
- als Emoji, Sticker oder Reaktion, klein genug, dass die ganze Rechnerei von oben keine Rolle spielt.

Wo der Ton zählt, beantwortet sich die Frage von selbst, denn GIF hatte nie Ton und wird nie welchen bekommen. Schneiden Sie dann lieber das Video. Der [Video-Schneider](https://abox.tools/de/video-schneiden/) nimmt einen Abschnitt heraus, ohne auch nur ein Einzelbild neu zu kodieren.

## Unter eine Größengrenze kommen

Der häufigste Anlass, überhaupt an einem GIF zu schrauben, ist eine Grenze am anderen Ende. Grob danach geordnet, wie hart sie zubeißen:

- **E-Mail**: 10 bis 25 MB für die ganze Nachricht, und ein Anhang nahe an dieser Grenze wird unterwegs von irgendetwas entfernt oder zurückgewiesen. Zielen Sie deutlich darunter.
- **Chat und Foren**: üblicherweise 8 bis 10 MB, manchmal deutlich weniger, wenn es statt eines Downloads eine eingebettete Vorschau geben soll.
- **Eine GitHub-README**: 10 MB je Datei, und alles jenseits von ein paar Megabyte lässt die Seite auf einem Handy kaputt wirken.
- **Sticker- und Emoji-Plätze**: oft nur ein paar hundert Kilobyte. Das heißt kleine Breite und kurzer Abschnitt, nicht niedrigere Bildrate.

Liegen Sie darüber, probieren Sie es in dieser Reihenfolge: Abschnitt kürzen, Breite halbieren, Rate senken, Dithering abschalten. Die ersten beiden bringen mehr als die letzten beiden zusammen.

## Nichts davon braucht einen Upload

Ein Video in ein GIF zu verwandeln heißt: dekodieren, skalieren, Farben zählen, komprimieren. Das sind vier Dinge, die ein Browser seit Jahren aus eigener Kraft kann. Das oben verlinkte Werkzeug erledigt sie alle auf Ihrem Gerät. Die Datei wird von Ihrer Festplatte gelesen, die Einzelbilder dekodiert Ihr Browser, und das GIF entsteht im Arbeitsspeicher und wandert von dort in Ihre Downloads.

Und darauf zu achten lohnt sich hier mehr als sonst. Die Clips, aus denen GIFs werden, sind persönliche: ein Moment aus einem Familienvideo, eine Bildschirmaufnahme von etwas aus der Arbeit, ein paar Sekunden aus einem Gespräch. Ein Umwandler, der die hochgeladen haben will, bittet um eine Kopie davon, und einen technischen Grund, Ja zu sagen, gibt es längst nicht mehr.
