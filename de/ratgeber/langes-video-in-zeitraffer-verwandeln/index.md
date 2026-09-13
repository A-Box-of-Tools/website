# So verwandeln Sie ein langes Video in einen Zeitraffer

Eine Stunde Sonnenuntergang, ein Tag Baustelle, die Pendelstrecke durch die Windschutzscheibe: Material, das sich lohnt, in einem Tempo, das sich niemand ansieht. Die Aufgabe ist eine Entscheidung über die Zeit und eine über das Ziel, und das Ganze läuft in Ihrem Browser, mit einer Datei, die Ihr Gerät nie verlässt.

[Zeitraffer-Generator öffnen](https://abox.tools/de/zeitraffer-erstellen/): Eine Stunde Aufnahme in zwanzig Sekunden.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [Zeitraffer-Macher](https://abox.tools/de/zeitraffer-erstellen/), ziehen Sie die Aufnahme hinein und setzen Sie entweder eine Geschwindigkeit, irgendwo zwischen 1,1× und 1000×, oder sparen Sie sich das Rechnen und sagen Sie, wie lang das Ergebnis sein soll. Sechzig Sekunden sind ein guter Ausgangswert für alles, was in einen Feed geht. Bildrate wählen, bei 4K herunterskalieren, exportieren.

Wenn das Ziel nur GIFs animiert, schicken Sie den exportierten Clip danach durch den [Video-zu-GIF-Konverter](https://abox.tools/de/video-in-gif-umwandeln/), aber lesen Sie vorher den letzten Abschnitt: Ein Zeitraffer ist das Teuerste, was man einem GIF zumuten kann.

Dieser Weg ist eingebaut: Nach dem Export bietet eine Zeile unter dem Download-Knopf an, das Ergebnis direkt an den Konverter weiterzureichen, und der Clip liegt dort schon bereit.

## Sagen Sie die Länge, nicht die Geschwindigkeit

„Wie schnell“ ist die falsche Frage, denn die ehrliche Antwort ist eine Division, die Sie nicht rechnen sollten: neunzig Minuten Material in eine Minute Ergebnis sind 90×, ein Tag Baustelle in dreißig Sekunden liegt näher an 3000× als an allem, was ein Regler nahelegt. Das Werkzeug nimmt die Ziellänge direkt entgegen und rechnet den Faktor selbst aus, womit die Antwort auch dann noch stimmt, wenn Sie eine längere Aufnahme einwechseln.

Wofür ein Geschwindigkeitsfaktor weiterhin gut ist, sind kleine Zahlen. Zwischen 1,1× und 2× bleibt ein Video *als Video anschaubar*, eine Vorlesung etwa, eine Vorführung; oberhalb von ungefähr 8× hört es auf, schnelles Abspielen zu sein, und wird ein Zeitraffer, bei dem jedes Ausgabebild eine aus dem Zeitfluss gepflückte Probe ist und alles zwischen den Proben schlicht fehlt.

Dieses Herauspicken ist auch der Grund, warum die Arbeit schnell geht. Das Werkzeug liest nur die Augenblicke, die die Ausgabe braucht, bei 100× also rund ein Hundertstel der Datei, statt eine Stunde zu dekodieren, um eine Minute zu behalten.

![Die Geschwindigkeitskarte: zwanzigfache Geschwindigkeit, die daraus folgende Länge, der Abstand zwischen den behaltenen Einzelbildern und eine Bildrate.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/speed.webp)

Nennen Sie die gewünschte Länge, und die Geschwindigkeit folgt, oder umgekehrt. Der Abstand ist die Zahl, die sagt, wie viel vom Original übersprungen wird.

## Bildrate und Größe, in Kürze

- **Bildrate.** 30 Bilder pro Sekunde lesen sich für fast alles als flüssige Bewegung; 60 verdient seine doppelte Größe nur, wenn die Bewegung selbst das Thema ist, und 24 gibt Wolken und Menschenmengen ein angenehm filmisches Ticken.
- **Größe.** Ein Zeitraffer wird meist klein angesehen. 4K auf 1080p herunterzuskalieren viertelt die Pixel, die der Encoder beschreiben muss, und auf einem Telefonbildschirm merkt es niemand.

![Die Übersicht der Export-Karte: Anzahl der Einzelbilder, Abstand, fertige Länge, geschätzte Größe und die zu lesende Datenmenge.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/summary.webp)

Die letzte Zeile ist die bemerkenswerte: Ein Zeitraffer liest nur einen Bruchteil der Datei, und deshalb geht das schnell bei einem Clip, dessen Neukodierung eine Stunde dauern würde.

## Wann der Zeitraffer ein GIF sein will

Meistens will er nicht. Ein Zeitraffer ist ständige Ganzbild-Veränderung, genau das, worin GIF-Kompression am schlechtesten ist; selbst ein kurzer landet bei Dutzenden Megabyte, während das MP4 bei einem Zehntel davon sitzt, schärfer. Posten Sie das Video überall dort, wo Video abgespielt wird.

Verlangt das Ziel wirklich nur GIFs, schneiden Sie die Sequenz auf wenige schleifentaugliche Sekunden in der [Zeitleiste des Konverters](https://abox.tools/de/video-in-gif-umwandeln/), halten Sie die Breite bescheiden und lassen Sie die Bildrate auf 10 bis 12 fallen. Der [Ratgeber zum Teil-GIF](https://abox.tools/de/ratgeber/gif-aus-videoausschnitt/) ist die lange Fassung dieses Budgets.

## Wenn Sie das jede Woche tun

Dass die zwei Schritte hier auf zwei Seiten leben, ist Absicht: Jede Seite macht eine Aufgabe, und jede kann für sich beweisen, dass nichts Ihr Gerät verlässt. Aber alles, was beide Seiten ausführen, ist quelloffen: MIT-lizenziert, ein Ordner je Werkzeug, abhängigkeitsfreie ES-Module mit einem README, das jedes benennt.

Wenn eine Kamera auf dem Stativ zu Ihrer Routine gehört, setzen Sie einen Coding-Agenten auf das [Repository](https://github.com/A-Box-of-Tools/website) an und lassen Sie sich den Abtaster und den GIF-Encoder zu einer Seite zusammensetzen, auf der Ihre Geschwindigkeit und Größe schon eingestellt sind. Die Module sind zum Lesen geschrieben, und sie herauszuheben ist genau das, wofür die Lizenz da ist.
