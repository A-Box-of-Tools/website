# So erstellen Sie ein Boomerang-Video

Ein Boomerang ist ein Clip, der vorwärts läuft, dann rückwärts, und das in Schleife. Kein Werkzeug hier hat einen Boomerang-Knopf; er ergibt sich aus dreien, die je eine Sache tun: schneiden, umkehren, zusammenfügen. Die ganze Kette läuft auf Ihrem eigenen Gerät.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

1. **Den Moment schneiden.** Öffnen Sie den [Videoschneider](https://abox.tools/de/video-schneiden/), markieren Sie die ein, zwei Sekunden, die hin- und herschwingen sollen, und exportieren Sie sie als eigenen Clip.
2. **Eine Kopie umkehren.** Ziehen Sie diesen Clip in den [Video-Umkehrer](https://abox.tools/de/video-rueckwaerts-abspielen/), lassen Sie den Ton weg und exportieren Sie. Jetzt haben Sie denselben Moment zweimal, einmal in jede Richtung.
3. **Beide zusammenfügen.** Zurück im Videoschneider ziehen Sie beide Dateien hinein, markieren jede ganz, stellen die Vorwärtsfassung nach vorn und exportieren eine Datei.

Keiner der Sprünge braucht zwischendurch einen Download: Nach jedem Export bietet eine Zeile unter dem Download-Knopf an, das Ergebnis direkt an das nächste Werkzeug weiterzureichen — an den Umkehrer nach dem ersten Schnitt, wieder an den Schneider nach der Umkehr — und die Datei liegt dort schon bereit.

Diese Datei ist der Boomerang. Posten Sie sie unverändert überall dort, wo stumme Videos in Schleife laufen, oder schicken Sie sie durch den [Video-zu-GIF-Konverter](https://abox.tools/de/video-in-gif-umwandeln/), wenn das Ziel nur GIFs animiert. Jeder Schritt passiert in Ihrem Browser; nichts in dieser Kette wird hochgeladen, an keiner Stelle, an niemanden.

## Warum zuerst geschnitten wird

Umkehren muss jedes Bild dekodieren und neu kodieren, das es anfasst; der [Ratgeber zum Umkehren](https://abox.tools/de/ratgeber/video-rueckwaerts-abspielen/) erklärt, warum es keinen billigeren Weg gibt. Schneiden dagegen ist fast umsonst: Der Schneider reicht ganze Bilder durch, ohne sie neu zu kodieren.

Die Reihenfolge ist also der ganze Trick. Kehren Sie einen Zwei-Sekunden-Clip um, arbeitet der teure Schritt an zwei Sekunden; kehren Sie das Original um, arbeitet er an allem, wovon Sie das meiste gleich wegwerfen. Bei einer Handyaufnahme beliebiger Länge ist Schneiden zuerst der Unterschied zwischen einem Boomerang in unter einer Minute und einem Fortschrittsbalken, hinter dem Sie sitzen.

Schneiden Sie knapp. Ein Boomerang liest sich am besten, wenn er über eine einzige Bewegung schwingt, einen Sprung, einen Platscher, eine Drehung, und jedes behaltene Bild wird zweimal bezahlt, einmal je Richtung.

![Der Video-Schneider mit einem Abschnitt zwischen drei und fünf Komma sechs Sekunden, darunter eine Tabelle mit Anfang, Ende und Länge.](https://abox.tools/screens/make-a-boomerang-video/section.webp)

Ein, zwei Sekunden sind ein Bumerang schon. Zuerst zu schneiden hält das Umkehren billig, und in der Tabelle wird die Länge entschieden.

## Was mit dem Ton geschehen soll

Lassen Sie ihn weg, und zwar beim Umkehren: Der Umkehrer hat genau dafür ein Kästchen. Der Ton eines Boomerangs liefe vorwärts und dann rückwärts; umgekehrter Ton klingt unverkennbar seltsam, und fast überall, wo ein Boomerang landet, läuft er ohnehin stumm. Ohne Ton geht das Umkehren außerdem schneller, und beide Dateien werden kleiner.

Behalten Sie ihn doch, fügt der Schneider die beiden Clips trotzdem zusammen. Aber die Naht, die das Auge verzeiht, verzeiht das Ohr nicht.

## Das Zusammenfügen, und was der Schneider Ihnen sagt

Die beiden Dateien sind nahe Verwandte, die eine wurde aus der anderen gemacht, aber sie sind durch verschiedene Encoder gelaufen und müssen sich über ihr Format nicht Byte für Byte einig sein. Der Schneider prüft das. Wo beide übereinstimmen, kopiert er die Bilder direkt; wo nicht, kodiert er einmal neu und sagt es auf dem Export-Panel, statt Sie raten zu lassen.

Ordnen Sie die Teile vor dem Export: vorwärts zuerst, umgekehrt danach. Ein Boomerang, der mit dem Rückschwung beginnt, liest sich wie ein Versehen.

Eine Verfeinerung, die die zehn Sekunden wert ist: Schneiden Sie vor dem Zusammenfügen ein einzelnes Bild vom Anfang der umgekehrten Fassung ab. Das letzte Bild der Vorwärtsfassung und das erste der umgekehrten sind dasselbe Bild, und es zweimal zu zeigen lässt die Wende einen Augenblick hängen.

![Das Umkehr-Werkzeug: eine Übersicht mit Ausgabegröße, Länge und Bildanzahl, dazu ein Schalter für den Ton.](https://abox.tools/screens/make-a-boomerang-video/reverse.webp)

Die zweite Hälfte. Der Ton-Schalter zählt hier mehr als sonst irgendwo, aus dem Grund, den der Abschnitt darüber nennt.

## Am Ende Video oder GIF

Behalten Sie das MP4, wenn das Ziel Video abspielt: Es ist viel kleiner, viel schärfer und schleift genauso gut. Wandeln Sie nur in ein GIF um, wenn der Ort eines verlangt, und behalten Sie dann den Zähler im Blick: Ein GIF bezahlt jedes Bild, und ein Boomerang ist sein Clip zweimal. Der [Ratgeber zum Teil-GIF](https://abox.tools/de/ratgeber/gif-aus-videoausschnitt/) behandelt die Hebel Breite und Bildrate, die es unter einem Größenlimit halten.

## Wenn Sie das jede Woche tun

Drei Seiten für einen Effekt sind Absicht: Jedes Werkzeug macht eine Aufgabe, und jede Seite kann für sich beweisen, dass Ihr Material das Gerät nie verlässt. Aber alle drei sind quelloffen: MIT-lizenziert, ein Ordner je Werkzeug, abhängigkeitsfreie ES-Module unter `src/` mit READMEs, die sie erklären.

Wenn Boomerangs regelmäßig zu Ihrer Arbeit gehören, setzen Sie einen Coding-Agenten auf das [Repository](https://github.com/A-Box-of-Tools/website) an und lassen Sie ihn den Bilderdurchlauf des Umkehrers und das Zusammenfügen des Schneiders in eine Seite mit einem Knopf falten. Die Module sind zum Lesen geschrieben, und sie herauszuheben ist genau das, wofür die Lizenz da ist.
