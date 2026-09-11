# So schneiden Sie ein Video auf ein anderes Format zu

Zuschneiden ändert die Form des Bildes, und dafür müssen neue Einzelbilder geschrieben werden. Daran führt kein Weg vorbei, und wer etwas anderes verspricht, tut etwas anderes. Hier steht, was das kostet und wie Sie es sinnvoll ausgeben.

[Video-Zuschneider öffnen](https://abox.tools/de/video-zuschneiden/): Einen Clip auf den Teil zurechtschneiden, auf den es ankommt.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [Video-Zuschneider](https://abox.tools/de/video-zuschneiden/), ziehen Sie den Clip hinein, legen Sie den Rahmen über den Teil, den Sie behalten wollen, oder rasten Sie ihn auf ein vorgegebenes Seitenverhältnis ein, und exportieren Sie. Heraus kommt ein Clip, der genauso lang ist wie der hineingegangene, mit unversehrtem Timing und unversehrtem Ton.

Anders als beim Kürzen müssen hier neue Einzelbilder geschrieben werden. Das ist kein Mangel eines bestimmten Werkzeugs, sondern das Wesen des Zuschneidens. Der Rest dieser Seite handelt davon, was das kostet und wie Sie den Preis klein halten.

## Warum Zuschneiden ohne Neukodierung nicht geht

Beim Kürzen bleiben ganze Einzelbilder erhalten; ein gutes Werkzeug schiebt sie unangetastet hinüber und dekodiert überhaupt nichts. Beim Zuschneiden bleibt von jedem Einzelbild nur ein Ausschnitt übrig, und ein Ausschnitt ist ein anderes Bild. Ein anderes Bild lässt sich nicht speichern, ohne die Pixel neu zu schreiben.

Es gibt eine sehr enge Ausnahme, die man kennen sollte, um sie zu erkennen, wenn jemand sich darauf beruft. Video wird in Blöcken kodiert, und läge ein Zuschnitt auf allen vier Seiten exakt auf Blockgrenzen, ließe sich ein Teil der Daten im Prinzip weiterverwenden. In der Praxis müssen die Abmessungen des Einzelbildes, die Bewegungsvektoren und die Prädiktion ohnehin allesamt neu geschrieben werden, und so gebaut ist nichts Ernsthaftes. Rechnen Sie damit, dass ein Zuschnitt eine Neukodierung bedeutet.

Ein anständiges Werkzeug erkennen Sie daran, dass es für denselben Ausschnitt nicht *mehr* ausgibt, als das Original dafür ausgegeben hat. Einen Ausschnitt mit höherer Bitrate zu kodieren als seine Quelle macht die Datei bloß größer. Detail, das im Original nie war, holt es nicht zurück.

![Die Export-Karte: ein Format-Menü, ein Qualitätsregler, ein Schalter für den Ton und eine Übersicht über Ausgabegröße, erhaltenen Bildausschnitt und Länge.](https://abox.tools/screens/crop-a-video/export.webp)

Weil das Bild neu kodiert werden muss, gibt es diese Karte überhaupt. Die Übersicht sagt vorher, was das kosten wird.

## Die Formate, nach denen tatsächlich gefragt wird

Zugeschnitten wird meist deshalb, weil irgendwo ein Seitenverhältnis vorgeschrieben ist. Die kurze Liste:

- **9:16, hochkant.** Stories, Reels, Shorts, TikTok. Bildschirmfüllend auf einem normal gehaltenen Handy, und der häufigste Grund, ein Video überhaupt zuzuschneiden.
- **1:1, quadratisch.** Feed-Beiträge auf mehreren Plattformen. Es funktioniert, egal wie herum das Gegenüber sein Handy hält, und genau deshalb hält es sich so hartnäckig.
- **4:5, leicht hochkant.** Das größte Format, das manche Feeds zulassen. Es nimmt mehr Bildschirm ein als ein Quadrat, ohne gleich ein volles Hochkantvideo zu sein.
- **16:9, breit.** Der Standard für Video schlechthin. *Darauf* schneiden Sie meist nur zu, um schwarze Balken loszuwerden, und *davon* weg, um bei einem der anderen Formate zu landen.

Rasten Sie den Rahmen auf das Verhältnis ein, statt nach Augenmaß zu ziehen. Ein paar Pixel daneben heißt, dass die Plattform Ihren Zuschnitt noch einmal zuschneidet, und wo, fragt sie Sie nicht.

![Die Zuschnitt-Karte: ein Videobild mit einem quadratischen Rahmen in der Mitte und Zahlenfeldern für Links, Oben, Breite und Höhe.](https://abox.tools/screens/crop-a-video/box.webp)

Der Rahmen wird gezogen oder eingetippt, und die Zahlen sagen genau, was erhalten bleibt. Ein Quadrat aus einem Breitbildclip ist der häufigste Wunsch.

## Aus einem Querformat-Clip ein Hochformat machen

Das ist der schwierigste der üblichen Fälle, und man sollte es offen sagen: Zuschneiden ist hier ein Kompromiss und keine Lösung.

Von einem 16:9-Video bleiben bei einem Zuschnitt auf 9:16 rund 32 % der Bildbreite übrig. Was an den Rändern war, ist fort, und in einer Querformataufnahme steckt an den Rändern meist der Zusammenhang. Reden zwei Personen an gegenüberliegenden Bildkanten, behält kein einziger Zuschnitt beide.

Sehen Sie sich den Clip deshalb einmal an und fragen Sie sich, wo das Motiv die meiste Zeit über wirklich steckt. Lautet die Antwort „es wandert herum“, ist ein starrer Zuschnitt das falsche Werkzeug; dann brauchen Sie ein Schnittprogramm, das den Ausschnitt über die Zeit mitführen kann. Lautet sie „überwiegend in der Mitte“, genügt ein zentrierter Zuschnitt, und der ist in zehn Sekunden gemacht.

Und die Alternative, an die zu selten jemand denkt: Viele Plattformen nehmen ein Querformatvideo an und legen die Balken selbst darum. Zuschneiden brauchen Sie, wenn Sie den ganzen Bildschirm wollen, und nicht, damit das Video überhaupt angenommen wird.

## Warum Breite und Höhe nur in Zweierschritten laufen

Wenn der Zuschnittrahmen ungerade Zahlen verweigert, stellt sich nicht die Oberfläche an, sondern der Codec.

H.264, der Codec in einem MP4, speichert Farbe waagerecht wie senkrecht nur in halber Auflösung, weil das Auge für Farbdetails weit weniger empfindlich ist als für Helligkeit. Das Bild wird damit in Zwei-Pixel-Einheiten verarbeitet, und ein Einzelbild mit einer ungeraden Pixelzahl auf einer Seite lässt sich schlicht nicht beschreiben.

Werkzeuge lösen das entweder, indem sie Ihren Zuschnitt hinterher runden und den Rahmen dabei stillschweigend um ein Pixel verschieben, oder indem sie von vornherein nur gerade Zahlen zulassen. Hier passiert das Zweite.

## Was mit dem Ton geschieht

Auf dem MP4-Weg: nichts. Zuschneiden betrifft das Bild und hat keinen Anlass, den Ton anzurühren. Der wird Sample für Sample übernommen, ohne je dekodiert zu werden, Byte für Byte so, wie er in der Datei stand.

Auf dem weiter unten beschriebenen Aufzeichnungsweg wird der Ton bei der Wiedergabe abgegriffen und neu kodiert, was ein wenig Qualität kostet. In beiden Fällen gibt es ein Häkchen, um ihn ganz wegzulassen. Das ist sinnvoll, wenn der Clip ohnehin dorthin geht, wo stumm abgespielt wird, und Sie die kleinstmögliche Datei wollen.

## Formate, und wie lange es dauert

**MP4, M4V und MOV** werden direkt gelesen, gleich was darin steckt, also H.264, HEVC, AV1 oder VP9, sofern Ihr Browser diesen Codec dekodieren kann. Anders als beim Kürzen muss beim Zuschneiden dekodiert werden. Der Codec spielt hier also eine Rolle, die er dort nicht spielt.

**Alles Übrige, was Ihr Browser abspielen kann**, allen voran WebM, wird zugeschnitten, indem es abgespielt und das Ergebnis dabei aufgezeichnet wird. Das klappt, dauert aber genau so lange, wie der Clip lang ist.

**AVI, WMV, FLV und die meisten MKVs** kann der Browser weder lesen noch abspielen. Das Werkzeug weist sie mit einer Meldung ab, statt auf halber Strecke steckenzubleiben.

Rechnen Sie bei einem langen Clip mit echter Wartezeit, denn jedes einzelne Bild wird dekodiert und neu kodiert. Eine Grenze ist im Werkzeug nicht eingebaut, und die Datei wird in Häppchen von wenigen Megabyte durchlaufen statt vollständig geladen. Die praktische Obergrenze setzt das fertige Video, das vor dem Download im Arbeitsspeicher zusammengesetzt wird.

## Erst kürzen, dann zuschneiden, und beides so früh wie möglich

Muss ein Clip gekürzt und zugeschnitten werden, kürzen Sie zuerst. Das ist umsonst zu haben, und jede Sekunde, die dabei wegfällt, ist eine Sekunde, die niemand mehr neu kodieren muss. Erst danach schneiden Sie den kürzeren Clip ein einziges Mal zu.

Andersherum schneiden Sie Material zu, das Sie gleich darauf wegwerfen, und zahlen Zeit und Qualität für nichts. Der [Video-Schneider](https://abox.tools/de/video-schneiden/) steht gleich nebenan, und [sein Ratgeber](https://abox.tools/de/ratgeber/video-kuerzen/) erklärt, warum dieser Schritt Sie überhaupt nichts kosten muss.

Ganz allgemein summiert sich jeder verlustbehaftete Schritt. Der Zuschnitt eines Originals ist eine Generation. Ein Zuschnitt, der auf einem Schnitt sitzt, der auf einem Export sitzt, der auf einem Download sitzt, sind vier, und das sieht man.

## Warum dafür kein Upload nötig ist

Video im Browser zu dekodieren und neu zu kodieren ist eine junge Möglichkeit, und sie ist echt: WebCodecs macht denselben Hardware-Encoder zugänglich, mit dem Ihr Handy Video aufnimmt, und ist aus demselben Grund schnell. Gearbeitet wird auf dem Gerät, das die Datei ohnehin schon hat, und bei einem Video von mehreren Gigabyte ist das auch die einzige Anordnung, die Sinn ergibt. Hochladen und Ergebnis wieder herunterladen dauert länger als das Kodieren selbst.

Netzfunktionen hat das Werkzeug hier keine, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Wer lieber prüft als glaubt, trennt die Internetverbindung und schneidet trotzdem einen Clip zu.

Drei weitere Proben, die Sie an jedem Werkzeug durchführen können, stehen in [Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)
