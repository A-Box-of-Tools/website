# So machen Sie aus einem Ordner voller Bilder ein Video

Eine Diashow ist schnell gebaut und ebenso schnell zweimal gerendert, weil zwei der Einstellungen nicht das bedeuten, wonach sie klingen. Hier steht, was jede davon steuert und wofür Sie sich entscheiden sollten.

[Bilder in Video öffnen](https://abox.tools/de/bilder-in-video-umwandeln/): Aus einem Ordner voller Bilder ein Video machen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/), ziehen Sie die Bilder hinein, bringen Sie sie in die richtige Reihenfolge, legen Sie fest, wie lange jedes stehen bleibt, und erzeugen Sie das Video. Heraus kommt ein MP4 mit H.264-Video, das praktisch überall abspielt.

Die beiden Einstellungen, die am häufigsten einen zweiten Durchgang nötig machen, sind die Standzeit und die Auflösung, und es zahlt sich aus, sie vor dem ersten Rendern zu verstehen statt danach.

## Bildrate und Standzeit sind zweierlei

An dieser Verwechslung scheitert der erste Durchgang am häufigsten.

Die **Standzeit** legt fest, wie lange jedes Bild auf dem Bildschirm bleibt. Das ist die Einstellung, um die es Ihnen eigentlich geht. Drei Sekunden sind ein bequemer Standardwert für eine Diashow, die jemand anschaut, ein bis zwei Sekunden wirken flott, und alles jenseits von fünf zieht sich, sofern nicht jemand dazu erzählt.

Die **Bildrate** legt fest, wie oft pro Sekunde das Video dieses eine Bild wiederholt. Am Aussehen der Diashow ändert sie gar nichts, denn ein Standbild, das drei Sekunden steht, sieht bei 24 Bildern pro Sekunde genauso aus wie bei 60. An Dateigröße und Kodierzeit ändert sie dagegen eine ganze Menge.

Für eine schlichte Diashow nehmen Sie deshalb eine niedrige Bildrate, 24 oder 30 sind reichlich. Höher zu gehen lohnt nur, wenn Bewegung im Spiel ist, etwa ein Schwenk oder Zoom über jedes Foto oder eine Überblendung dazwischen. Da zeigt sich eine niedrige Bildrate als sichtbares Ruckeln.

![Die Einstellungen für Auflösung und Bildrate, dazu eine Übersicht über Anzahl der Bilder, Gesamtdauer, Bildanzahl und geschätzte Größe.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

Bildrate und Dauer sind zweierlei, und in der Übersicht wird das offensichtlich: Ändert man das eine, bewegt sich die Bildanzahl, nicht die Länge.

## Auflösung, und was mit Bildern im falschen Format geschieht

Ein Video hat über seine ganze Länge genau eine Bildgröße. Ihre Fotos teilen sich mit Sicherheit nicht alle dieselbe, mit denen, die nicht hineinpassen, muss also etwas geschehen. Und dieses Etwas ist die Entscheidung, die man bewusst treffen sollte.

Wählen Sie die Auflösung zuerst danach, wohin das Video geht:

- **⁦1920×1080⁩** für alles Allgemeine. Universell unterstützt, spielt überall, und ist das, was die meisten mit HD meinen.
- **⁦1080×1920⁩**, dieselben Zahlen andersherum, für ein Ziel, das zuerst aufs Handy schaut: Stories, Reels, Shorts.
- **⁦3840×2160⁩** nur dann, wenn die Bilder wirklich so viel Detail hergeben und das Ziel es auch zeigt. Es sind viermal so viele Pixel, viermal die Kodierzeit und ungefähr die vierfache Datei.

Danach entscheiden Sie, was mit den Abweichlern passiert. Jedes Bild in den Rahmen einzupassen behält es vollständig und lässt Balken an den Seiten. Das ist die sichere und die richtige Antwort, wenn die Bilder wichtiger sind als die Wirkung. Den Rahmen auszufüllen und den Überstand abzuschneiden sieht besser aus und köpft manche Aufnahme. Hoch- und Querformat in einem Video zu mischen ist der Fall, für den es keine gute Antwort gibt, und vorher zu entscheiden, in welche Richtung Sie lieber falsch liegen, erspart Ihnen den zweiten Durchgang.

## Die Reihenfolge, und die Falle mit den Dateinamen

Wie bei jeder Stapelverarbeitung sortieren sich Dateinamen anders, als Sie gezählt haben. `foto2.jpg` kommt alphabetisch nach `foto10.jpg`, weil Zeichen für Zeichen verglichen wird.

Nach Aufnahmedatum zu sortieren ist bei Fotos von einem Ereignis meist richtig, denn Sie haben sie ja in der Reihenfolge aufgenommen, in der es passierte. Die Kacheln von Hand zu ziehen ist richtig für alles, wo die Geschichte nicht chronologisch verläuft. Prüfen Sie es vor dem Rendern. Beim Video bedeutet eine korrigierte Reihenfolge die ganze Arbeit noch einmal.

![Sechs Bilder in der Reihenfolge ihres Ablaufs, jedes mit einem Feld für die Dauer, darüber eine Zeile, die alle Dauern auf einmal setzt.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

Die Reihenfolge ist die Liste, und die Liste lässt sich ziehen. Sie stammt aus der Reihenfolge, in der Sie sie hinzugefügt haben, und die ist nicht die, die die Dateinamen nahelegen.

## Es gibt keine Tonspur, und das ist keine Kleinigkeit

Das MP4, das dieses Werkzeug schreibt, hat eine einzige Videospur und überhaupt keine Tonspur. Braucht Ihre Diashow Musik oder eine Erzählstimme, brauchen Sie für diesen Schritt ein Schnittprogramm.

Warum das so ist, lohnt die Erklärung. Ton hinzuzufügen heißt, eine Musikdatei zu dekodieren, sie nach AAC zu kodieren und sie im Container mit dem Video zu verschachteln. Alle drei Schritte sind echte Arbeit, und schlecht gemacht ergeben sie eine Datei, die beim Abspielen aus dem Takt läuft. Deshalb steht es auf der Liste, statt halbfertig herumzustehen.

Ein praktischer Hinweis, falls Sie die Musik hinterher hinzufügen. Suchen Sie erst das Stück aus und stellen Sie die Standzeit je Bild so ein, dass die Diashow ungefähr auf die Länge des Liedes kommt. Die Musik auf das Video zu kürzen klingt immer schlechter, als das Video auf die Musik zu legen.

## Was herauskommt, und was zu tun ist, wenn es nicht abspielt

Das Ziel ist MP4 mit H.264, die am breitesten abspielbare Kombination, die es gibt. In einem Browser ohne WebCodecs weicht das Werkzeug darauf aus, stattdessen WebM aufzuzeichnen, also dasselbe Material in einem Container, den weniger Schnittprogramme und soziale Plattformen annehmen.

Landen Sie bei einem WebM und irgendetwas weist es zurück, hilft ein Browser mit WebCodecs und keine Umwandlung. Aktuelle Fassungen von Chrome, Edge und Safari können es alle. Neu zu rendern ist besser als umzuwandeln, denn Umwandeln heißt eine weitere Generation verlustbehafteter Kodierung.

Eine Grenze für die Anzahl der Bilder ist im Werkzeug nicht eingebaut. Die Obergrenze setzt der Arbeitsspeicher Ihres Geräts, denn dort wird das fertige Video zusammengesetzt, bevor Sie es herunterladen. Als Erstes bekommt das eine lange 4K-Diashow zu spüren.

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
