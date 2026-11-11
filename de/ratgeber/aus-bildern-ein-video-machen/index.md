# Eine Bildsequenz oder Fotodiashow in MP4 umwandeln

Eine Rendersequenz braucht ein Bild pro Videoframe; eine Diashow braucht Zeit zum Betrachten jedes Fotos. Treffen Sie zuerst diese Wahl und prüfen Sie dann Reihenfolge, Maße und Dauer, bevor Sie auf Ihrem eigenen Gerät kodieren.

[Bilder in Video öffnen](https://abox.tools/de/bilder-in-video-umwandeln/): Aus einer Render-Sequenz, Zeitrafferfotos oder einer Diashow ein MP4 machen.

Zuletzt aktualisiert 23. Oktober 2026

## Die kurze Antwort

Öffnen Sie [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/), ordnen die eingelegten Bilder und wählen Sekunden für Diashows oder Frames für Bildfolgen. Stellen Sie die Haltezeit ein und erstellen das Video. MP4 mit H.264 ist empfohlen. Prüfen Sie es vor dem Teilen in der Ziel-App.

Die beiden Einstellungen, die am häufigsten einen zweiten Durchgang nötig machen, sind die Standzeit und die Auflösung, und es zahlt sich aus, sie vor dem ersten Rendern zu verstehen statt danach.

## Eine nummerierte Rendersequenz als MP4

1. Fügen Sie in [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/) die Einzelbilder hinzu, die Blender, After Effects oder ein anderes Renderprogramm exportiert hat. Verwenden Sie ein Bildformat, das Ihr Browser dekodieren kann, etwa PNG oder JPG.
2. Wählen Sie Nach Name sortieren. Die Sortierung erkennt Zahlen, sodass frame_2 vor frame_10 steht. Prüfen Sie die Liste auf fehlende Bilder oder einen unerwünschten Neustart der Nummerierung.
3. Lassen Sie „Jedes Bild halten für“ auf einem Einzelbild und stellen Sie die Bildrate des Renderings ein. Eine Folge von 240 Bildern bei 24 fps dauert zehn Sekunden.
4. Wählen Sie die Ausgabegröße und „Hineinpassen (Letterbox)“, um das gesamte Bild zu erhalten. Transparente Bereiche erhalten den gewählten Hintergrund: H.264-MP4 bewahrt keinen Alphakanal.
5. Erstellen Sie das Video und sehen Sie sich Anfang und Ende an. Laden Sie es dann herunter und öffnen Sie es in der Zielanwendung.

Für einen Ordner mit Zeitrafferfotos gelten dieselben Schritte. Die Bildrate bestimmt die Wiedergabegeschwindigkeit. Nach Datum sortieren verwendet die Änderungszeit der Dateien; prüfen Sie daher die Reihenfolge, wenn die Fotos kopiert oder bearbeitet wurden. Für einen vorhandenen Videoclip verwenden Sie stattdessen den [Zeitraffer-Ersteller](https://abox.tools/de/zeitraffer-erstellen/).

## Diashow, Stop-Motion oder Fortschrittsnachweis

Wählen Sie für Urlaub, Eventrückblick oder Produktkatalog bei „Jedes Bild halten für“ Sekunden, geben etwa drei ein und drücken Auf alle anwenden. Ordnen Sie die Geschichte, wählen 1080p oder die vertikale Zielform und „Hineinpassen (Letterbox)“, wenn alle Bildteile wichtig sind. Prüfen Sie Gesamtlänge vor dem Rendern und erste, mittlere und letzte Bilder im Ergebnis.

Nutzen Sie für Stop-Motion, Renderfolgen oder regelmäßig aufgenommene Fortschrittsfotos Framehaltezeiten. Ein Bild für einen Frame bei 24 fps zeigt 24 Bilder pro Sekunde. Sortieren Sie nach Namen und prüfen die Reihenfolge. Das Werkzeug schreibt harte Schnitte ohne Zoom, Überblendung oder Ton. Erzählte Präsentationen brauchen einen anderen Audioeditor. Stumme visuelle Fortschritte können hier vollständig entstehen.

## Bildrate und Standzeit sind zweierlei

An dieser Verwechslung scheitert der erste Durchgang am häufigsten.

**Dauer in Sekunden** bestimmt, wie lange ein Bild sichtbar bleibt. Das ist die entscheidende Einstellung. Drei Sekunden passen bequem zur Diashow, ein bis zwei wirken zügig, über fünf zieht sich ohne Erzählung.

**Bildrate bei gewählten Sekunden** ist die Zahl der Wiederholungen pro Sekunde. Sie ändert das Aussehen der Diashow nicht. Drei Sekunden Standbild sehen bei 24 und 60 fps gleich aus, Dateigröße und Kodierzeit ändern sich aber stark.

Das Werkzeug beginnt mit einem Frame pro Bild. In dieser Einheit ändert die Bildrate die Dauer. 24 Bilder bei 24 fps dauern eine Sekunde, bei 12 fps zwei. Wählen Sie für normale Diashows Sekunden, 24 oder 30 fps reichen. Ohne Schwenks, Zooms und Überblendungen erzeugt höhere Bildrate keine Bewegung.

![Die Einstellungen für Auflösung und Bildrate, dazu eine Übersicht über Anzahl der Bilder, Gesamtdauer, Bildanzahl und geschätzte Größe.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

Bei Sekunden ändert die Bildrate die Framezahl, während jedes Bild seine Dauer behält. Bei Framehaltezeiten ändert sie auch die Länge.

## Auflösung, und was mit Bildern im falschen Format geschieht

Ein Video hat über seine ganze Länge genau eine Bildgröße. Ihre Fotos teilen sich mit Sicherheit nicht alle dieselbe, mit denen, die nicht hineinpassen, muss also etwas geschehen. Und dieses Etwas ist die Entscheidung, die man bewusst treffen sollte.

Wählen Sie die Auflösung zuerst danach, wohin das Video geht:

- **⁦1920×1080⁩** für alles Allgemeine. Universell unterstützt, spielt überall, und ist das, was die meisten mit HD meinen.
- **⁦1080×1920⁩**, dieselben Zahlen andersherum, für ein Ziel, das zuerst aufs Handy schaut: Stories, Reels, Shorts.
- **⁦3840×2160⁩** nur dann, wenn die Bilder wirklich so viel Detail hergeben und das Ziel es auch zeigt. Es sind viermal so viele Pixel, viermal die Kodierzeit und ungefähr die vierfache Datei.

Danach entscheiden Sie, was mit den Abweichlern passiert. Jedes Bild in den Rahmen einzupassen behält es vollständig und lässt Balken an den Seiten. Das ist die sichere und die richtige Antwort, wenn die Bilder wichtiger sind als die Wirkung. Den Rahmen auszufüllen und den Überstand abzuschneiden sieht besser aus und köpft manche Aufnahme. Hoch- und Querformat in einem Video zu mischen ist der Fall, für den es keine gute Antwort gibt, und vorher zu entscheiden, in welche Richtung Sie lieber falsch liegen, erspart Ihnen den zweiten Durchgang.

## Die Reihenfolge, und die Falle mit den Dateinamen

Wie bei jeder Stapelverarbeitung sortieren sich Dateinamen anders, als Sie gezählt haben. `photo2.jpg` kommt alphabetisch nach `photo10.jpg`, weil Zeichen für Zeichen verglichen wird.

Namenssortierung zählt numerisch natürlich, also photo2 vor photo10. Datumssortierung nutzt Dateiänderungsdaten, keine garantierten Kameraaufnahmedaten. Kopierte oder bearbeitete Fotos brauchen daher womöglich manuelle Ordnung. Ziehen passt für nicht chronologische Geschichten. Prüfen Sie vor dem Rendern, denn eine Reihenfolgekorrektur verlangt bei Video den ganzen Job erneut.

![Sechs Bilder in der Reihenfolge ihres Ablaufs, jedes mit einem Feld für die Dauer, darüber eine Zeile, die alle Dauern auf einmal setzt.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

Die Reihenfolge ist die Liste, und die Liste lässt sich ziehen. Sie stammt aus der Reihenfolge, in der Sie sie hinzugefügt haben, und die ist nicht die, die die Dateinamen nahelegen.

## Es gibt keine Tonspur, und das ist keine Kleinigkeit

Das MP4, das dieses Werkzeug schreibt, hat eine einzige Videospur und überhaupt keine Tonspur. Braucht Ihre Diashow Musik oder eine Erzählstimme, brauchen Sie für diesen Schritt ein Schnittprogramm.

Warum das so ist, lohnt die Erklärung. Ton hinzuzufügen heißt, eine Musikdatei zu dekodieren, sie nach AAC zu kodieren und sie im Container mit dem Video zu verschachteln. Alle drei Schritte sind echte Arbeit, und schlecht gemacht ergeben sie eine Datei, die beim Abspielen aus dem Takt läuft. Deshalb steht es auf der Liste, statt halbfertig herumzustehen.

Ein praktischer Hinweis, falls Sie die Musik hinterher hinzufügen. Suchen Sie erst das Stück aus und stellen Sie die Standzeit je Bild so ein, dass die Diashow ungefähr auf die Länge des Liedes kommt. Die Musik auf das Video zu kürzen klingt immer schlechter, als das Video auf die Musik zu legen.

## Was herauskommt, und was zu tun ist, wenn es nicht abspielt

Das Ziel ist MP4 mit H.264, die am breitesten abspielbare Kombination. Der Ausweichweg zeichnet in Echtzeit auf, meist als WebM, das weniger Schnittprogramme und soziale Plattformen annehmen. Halten Sie den Tab bei dieser Aufzeichnung sichtbar. Das Timing ist nur ungefähr, und Bilder können übersprungen werden, wenn die Dekodierung nicht nachkommt. Für eine exakte nummerierte Sequenz verwenden Sie den MP4-Encoder, sofern Ihr Browser ihn unterstützt.

Erhalten Sie ein WebM, das eine Anwendung nicht annimmt, rendern Sie die Originale erneut mit ausgewähltem MP4 in einem Browser, dessen WebCodecs-Encoder H.264 in der gewählten Größe unterstützt. Erneutes Rendern vermeidet die zusätzliche Generation verlustbehafteter Kodierung, die beim Umwandeln eines bereits komprimierten Videos entstehen würde.

Es gibt keine feste Grenze für die Bildanzahl. Das fertige Video wird vor dem Herunterladen im Arbeitsspeicher zusammengesetzt. MP4-Exporte müssen unter 4 GiB (etwa 4,3 GB) bleiben, und der Arbeitsspeicher kann schon weit vor dieser Grenze ausgehen. Die gewählte Größe muss außerdem vom Encoder Ihres Browsers unterstützt werden. Eine lange 4K-Diashow kann diese Grenzen erreichen, bevor die Anzahl der Quellbilder besonders groß erscheint.

## Das Ergebnis vor der Weitergabe prüfen

Wenn die Diashow zu schnell vorbeizieht, prüfen Sie, ob die Halteeinheit Sekunden ist, und wählen Sie Auf alle anwenden. Läuft eine Rendersequenz zu langsam, prüfen Sie sowohl die Bildrate als auch die Framehaltezeit pro Bild. Balken erhalten das ganze Bild; fehlende Ränder bedeuten meist, dass „Bild ausfüllen (schneidet Ränder ab)“ gewählt wurde. Exportieren Sie bei Änderungen dieser Einstellungen erneut aus den ursprünglichen Einzelbildern.

Für eine Animation, die ein GIF bleiben soll, verwenden Sie den [GIF-Ersteller](https://abox.tools/de/gif-erstellen/). Um ein vorhandenes GIF in Video umzuwandeln, verwenden Sie direkt [GIF zu MP4](https://abox.tools/de/gif-in-mp4-umwandeln/). Dabei bleibt das Timing der abgespielten GIF-Frames erhalten. Wenn Sie zuerst PNGs extrahieren, müssen Sie das Timing manuell festlegen. Der [Ratgeber zur GIF-Extraktion](https://abox.tools/de/ratgeber/gif-in-einzelbilder-zerlegen/) erklärt, wann dieser zusätzliche Schritt sinnvoll ist.

## Die Datei kleiner machen

Ist das Ergebnis zu groß für sein Ziel, hier die Hebel in der Reihenfolge, in der sie wirklich etwas bringen:

**Die Bildrate senken.** Bei einer Diashow aus Standbildern kostet das nichts Sichtbares und ist die größte Einzelersparnis, die zu haben ist.

**Die Auflösung senken.** 1080p statt 4K ist ein Viertel der Pixel, und auf einem Handybildschirm merkt es niemand.

**Es kürzen.** Drei Sekunden je Bild statt fünf sind 40 % weniger Laufzeit und 40 % weniger Datei, und meist die bessere Diashow.

Die Ausgangsfotos vorher zu verkleinern hilft dagegen kaum. Kodiert wird das Video ohnehin in der Auflösung, die Sie gewählt haben, und ein Foto mit 4000 Pixeln und eines mit 2000 ergeben in einem 1080p-Video fast dieselbe Byte-Zahl. Schneller wird das Kodieren dadurch schon, und die Speichergrenze von oben rückt weiter weg.

## Warum das keinen Server braucht, mit einer offen genannten Ausnahme

Video zu kodieren war einmal der klarste Fall fürs Hochladen. Browser konnten es nicht, eine Maschine mit FFmpeg schon. WebCodecs hat das geändert, indem es den Hardware-Encoder zugänglich macht, der ohnehin in Ihrem Gerät steckt, denselben, mit dem Ihr Handy Video in Echtzeit aufnimmt. Die Einzelbilder zusammenzusetzen ist Sache eines Canvas. Keiner der beiden Schritte braucht mehr als Ihre eigene Hardware.

Eine Ausnahme gibt es bei genau diesem Werkzeug, und sie gehört ausgesprochen statt vergraben. Die Funktion „von einer Webadresse hinzufügen“ holt ein Bild von einer Adresse, die Sie einfügen, und der Server dahinter sieht Ihre IP und was Sie angefordert haben. Das gehört zur Funktion und ist kein Fehler darin, und es ist der einzige Schritt im ganzen Werkzeug, der überhaupt ans Netz geht. Benutzen Sie sie nicht, verlässt überhaupt nichts Ihr Gerät.

Vier Proben, die Ihnen dasselbe über jedes andere Werkzeug verraten, dieses eingeschlossen, stehen in [Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)
