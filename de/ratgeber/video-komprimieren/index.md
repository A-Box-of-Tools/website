# Ein Video auf eine versendbare Größe komprimieren

Ein Clip, der sich nicht versenden lässt, liegt über einer Zahl. Hier erfahren Sie, wohin seine Megabytes gehen, was ihr Verzicht kostet und wie Sie unter die Grenze kommen, ohne zuerst die zu große Datei hochzuladen.

[Videokompressor öffnen](https://abox.tools/de/video-komprimieren/): Sagen Sie, wie groß es sein darf. Den Rest ermittelt das Werkzeug, und es misst das Ergebnis, bevor Sie es bekommen.

Zuletzt aktualisiert 13. Oktober 2026

## Die kurze Antwort

Öffnen Sie den [Videokompressor](https://abox.tools/de/video-komprimieren/), ziehen Sie den Clip hinein und wählen Sie die vorgegebene Grenze — 8 MB, 16, 25, 50 oder 100 — oder geben Sie eine beliebige Zahl ein. Die Zeile unter dem Feld erklärt, was damit möglich ist: die Bildgröße und Bitrate, für die bei der Länge des Clips Platz bleibt. Drücken Sie die Schaltfläche. Der Clip wird auf Ihrem Rechner kodiert, an der Grenze gemessen und noch einmal geöffnet, um seine unveränderte Länge zu prüfen. Nichts wird hochgeladen.

Der Rest erklärt, was Sie dabei eintauschen. Bei einer ZIP-Datei bedeutet „komprimieren“ etwas ohne Verlust; bei einem Video ist das anders.

## Ein Anhang, ein Upload oder ein Fehlerbericht

Prüfen Sie für eine E-Mail das Limit der ganzen Nachricht, ziehen Sie andere Anhänge ab und lassen Sie etwas Spielraum. Persönliche Gmail-Konten erlauben derzeit 25 MB Anhänge. Bei Arbeits- und Schulkonten bestimmt der Administrator das Limit. Die [Gmail-Anleitung zu Anhängen](https://support.google.com/mail/answer/6584?hl=en) erklärt den Unterschied. Eine Voreinstellung ist ein Größenziel und keine Zusage, dass jeder Empfänger so viel annimmt.

Schneiden Sie für einen Fehlerbericht oder eine kurze Demonstration die Wartezeit vor dem Komprimieren ab. Behalten Sie die Klicks, die das Problem erklären, und den Ton, wenn er zur Erklärung gehört. Wählen Sie genug Auflösung für den kleinsten wichtigen Text. Spielen Sie das heruntergeladene Ergebnis in der Ziel-App ab und prüfen Sie tatsächliche Größe und letzte Sekunde. Erhöhen Sie das Ziel oder kürzen Sie den Clip, wenn der Text unleserlich geworden ist.

## Wohin die Megabytes gehen

Eine Videodatei besteht fast vollständig aus dem Bild. Eine Minute in 1080p vom Handy belegt etwa 60 bis 150 MB, davon ungefähr eines für den Ton. Der Rest sind dreißig Bilder pro Sekunde, jeweils beschrieben durch die Änderungen seit dem vorherigen. Die Größe eines Videos ist daher annähernd eine einzige Zahl: die erlaubten Bits pro Sekunde für das Bild — die *Bitrate* — multipliziert mit seiner Laufzeit.

Deshalb wird aus einer Größenbegrenzung unmittelbar eine Bitrate. Von der Obergrenze werden der unverändert kopierte Ton und ein kleiner Anteil für den Container abgezogen. Der Rest wird durch die Länge des Clips geteilt. Eine Grenze von 25 MB für einen Clip von zwei Minuten lässt dem Bild etwa 1,6 Megabit pro Sekunde. Das ist das gesamte Budget, aus dem alles Weitere folgt.

## Warum das Bild kleiner wird, bevor es schlechter wird

Eine Bitrate sagt erst im Verhältnis zur Zahl der darzustellenden Pixel etwas aus. 1,6 Megabit pro Sekunde für 1080p — zwei Millionen Pixel, dreißigmal pro Sekunde — lassen jedem Pixel fast nichts. Der Encoder reagiert darauf mit Verschmieren. Kanten werden weich, flache Bereiche werden zu Blöcken und Bewegungen verschwimmen. Dieselben 1,6 Megabit ergeben bei 720p ein gut anschaubares Bild und bei 480p ein gutes.

Das Werkzeug geht deshalb die Bildgrößen 1080p, 720p, 480p und 360p durch, bis jedem Bild genügend Bits bleiben. Es tut das vor dem Start und erklärt die Entscheidung. Ein kleineres, klares Bild ist auf jedem Bildschirm besser als ein größeres, verschmiertes. Jeder Dienst, der Uploads annimmt, tut genau das stillschweigend mit Ihrem Video. In die andere Richtung geht das Werkzeug nie: Ein Clip wird nicht über seine ursprüngliche Größe vergrößert.

Sie können die Entscheidung ändern. Eine Bildschirmaufnahme mit lesbarem Text muss vielleicht 1080p behalten und dafür ein weicheres Bild hinnehmen. Ein Clip, der nur auf einem Handy angesehen wird, kann auf 480p gehen und die Bits stattdessen für Bewegung nutzen.

## Was verloren geht und wie Sie den Verlust begrenzen

Ein komprimiertes Video ist ein neu kodiertes Video. Das Bild wird dekodiert, kleiner gezeichnet und mit der neuen Bitrate geschrieben. Es liegt damit eine Generation weiter vom Kamerabild entfernt als die Ausgangsdatei. Der Ton bleibt unberührt: Seine Samples werden genau so in die neue Datei kopiert, wie sie waren. Den Bildverlust bestimmt die Zahl. Ein halb so großer Clip verliert wenig; ein Clip von 900 MB, der auf 25 MB sinkt, verliert die meisten Bits, und das sieht man.

- **Wählen Sie die benötigte Grenze und keine kleinere.** Bei einer Grenze von 25 MB sind 25 MB richtig. 8 MB werfen ohne Grund zwei Drittel des Bildbudgets weg.
- **Erst schneiden.** Weniger unnötige Zeit lässt jeder verbleibenden Sekunde mehr Größenbudget. Der [Videoschneider](https://abox.tools/de/ratgeber/video-kuerzen/) kann kompatible Abschnitte ohne Neukodierung kopieren. Exakte Schnitte kodieren das Bild neu. Ein geschnittenes Ergebnis kann Wiedergabebearbeitungen enthalten, auch Audiobearbeitungen nach einem exakten Bildschnitt. Lehnt der Kompressor diese Zeitleiste ab, speichern Sie in einem lokalen Editor ein neues Video mit angewendeten Bearbeitungen. Wählen Sie die beschriftete Methode bewusst.
- **Lassen Sie unwichtigen Ton weg.** Eine Minute Stereo benötigt etwa ein Megabyte. Bei einem kurzen Clip mit enger Grenze entscheidet dieses Megabyte oft zwischen einem klaren und einem verschmierten Bild.
- **Behalten Sie das Original.** Ein komprimiertes Video lässt sich nicht wiederherstellen. Komprimieren und versenden Sie eine Kopie und behalten Sie die Datei aus der Kamera.

## Warum der Upload der merkwürdige Teil ist

Ein Onlinekompressor verlangt, dass Sie die Datei hochladen, die zum Hochladen zu groß war. Die 900 MB müssen über Ihre Verbindung hinauf, damit 25 MB zurückkommen können. Bei den meisten Heimanschlüssen dauert der Upload länger als die Kodierung. Dazu kommt die Frage, die auch die anderen Ratgeber hier stellen: Was wird behalten, wie lange und wer kann es sehen? Bei einem Video Ihrer Kinder oder Ihres Wohnzimmers ist das keine nebensächliche Frage.

All das ist unnötig. Jeder Browser aus den letzten Jahren enthält dieselben Videocodecs wie ein Handy. [Dieses Werkzeug](https://abox.tools/de/video-komprimieren/) verwendet sie: Der Clip wird stückweise von Ihrer Festplatte gelesen, dekodiert, kleiner gezeichnet und auf Ihrem Rechner neu kodiert. Die fertige Datei bleibt bis zum Speichern im Arbeitsspeicher. Die Sicherheitsrichtlinie der Seite nennt jede erlaubte Kontaktadresse; keine gehört zu dieser Website. Das Werkzeug funktioniert auch ohne Netzwerk. Wenn Sie das selbst prüfen möchten, trennen Sie die Verbindung und komprimieren Sie trotzdem.

Die allgemeinere Erklärung dazu steht in [Ist es sicher, Dateien hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/).

## Was das Werkzeug prüft, bevor es die Datei ausgibt

Ein Encoder nähert sich der gewünschten Bitrate, trifft sie aber nicht genau. Deshalb wird etwas unter dem Limit angefragt und anschließend gemessen. Ist die Datei zu groß, wird die Bitrate anhand der Abweichung neu berechnet und der Clip erneut kodiert. Die Seite meldet das. Danach wird die fertige Datei auf Ihrem Gerät wieder geöffnet und ihre Länge mit der Quelle verglichen. Auch ein Ergebnis ohne letzte Sekunde oder Ton wäre kleiner. Erst das erneute Lesen zeigt den Unterschied. Das Ergebnis spielt unter dem Download, sodass Sie es vor dem Senden prüfen können. Meldet die Prüfzeile weiterhin ein verfehltes Ziel, liegt der Download nicht unter dem Limit. Wählen Sie kleinere Bildmaße, einen kürzeren Clip oder ein höheres Limit und versuchen Sie es erneut.

## Was es schreibt und was es liest

Es schreibt MP4 mit H.264-Video und kopiertem Originalton. H.264 in MP4 ist weit verbreitet, aber das Zielprogramm muss auch Audiocodec und Videoprofil unterstützen. Testen Sie die fertige Datei dort. Eingaben sind MP4 und MOV mit im Browser dekodierbaren Codecs; WebM, MKV und AVI liest es nicht. Es schreibt kein WebM, HEVC oder AV1.
