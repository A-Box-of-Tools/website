# Ein Video ohne Qualitätsverlust drehen

Ein seitlich laufender Clip wurde nie wirklich gedreht. Das Handy hat einen Vermerk in den Dateikopf geschrieben, den ein Programm ignoriert. Hier erfahren Sie, was er bedeutet, warum die Korrektur Sekunden ohne Qualitätsverlust dauern sollte und wann die andere Methode sinnvoll ist.

[Video-Rotator öffnen](https://abox.tools/de/video-drehen/): Eine Vierteldrehung, eine halbe Drehung, in die andere Richtung. In den Header der Datei geschrieben, sodass kein einziges Einzelbild dekodiert wird und nichts verloren geht.

Zuletzt aktualisiert 13. September 2026

## Die kurze Antwort

Öffnen Sie das Werkzeug [Video drehen](https://abox.tools/de/video-drehen/), ziehen Sie den Clip hinein und wählen Sie die Drehung, bei der die Vorschau richtig steht. Drücken Sie die Schaltfläche. Die Drehung wird im Dateikopf vermerkt und jedes Bild unverändert kopiert. Das dauert Sekunden und verliert nichts. Das Ergebnis wird erneut geöffnet, um die gewünschte Ausrichtung zu prüfen, und unter dem Download richtig herum abgespielt. Nichts wird hochgeladen.

Der Rest erklärt, warum das reicht. Die meisten Drehwerkzeuge und Anleitungen behandeln eine Drehung als Neukodierung, obwohl sie keine sein muss.

## Warum der Clip überhaupt seitlich steht

Der Kamerasensor eines Handys liegt im Querformat. Halten Sie das Handy beim Filmen aufrecht, sieht der Sensor weiterhin ein seitlich liegendes Querformatbild. Genau das speichert das Handy in jedem Einzelbild. Zusätzlich schreibt es einen Vermerk in den Dateikopf: eine Anzeigematrix aus neun Zahlen mit der Bedeutung „um eine Vierteldrehung nach rechts anzeigen“. Jedes Handy, jeder Browser und jeder moderne Player oder Editor liest diesen Vermerk und dreht das Bild vor der Anzeige. Deshalb sieht der Clip auf Ihrem Handy richtig aus.

Ein irgendwo seitlich abgespielter Clip hat einen ignorierten oder falschen Vermerk. Vielleicht wurde die Kamera anders gehalten als vermutet, ein Konverter hat den Dateikopf verloren oder ein alter Player liest ihn nicht. Die Bilder sind nicht das Problem. Der Vermerk ist es.

## Die Lösung sind neun Zahlen, keine Neukodierung

Das Video zu drehen bedeutet, einen anderen Vermerk zu schreiben. Die Bilder bleiben genau gleich: Sie werden weder dekodiert noch neu kodiert oder verändert. Die Datei bleibt fast gleich groß, und die Arbeit dauert nur so lange, wie sie einmal zu lesen. Das Werkzeug [Video drehen](https://abox.tools/de/video-drehen/) macht das standardmäßig: Es kombiniert die gewählte Drehung mit der bereits vorhandenen, schreibt die Ergebnismatrix und kopiert jedes Bild und jedes Tonpaket Byte für Byte.

Die meisten Onlinewerkzeuge dekodieren den Clip, drehen die Pixel und kodieren alles neu. Das kostet eine Generation Qualität, dauert eine vollständige Kodierung und liefert eine Datei, deren jedes Bild sich vom Original unterscheidet, obwohl nur neun Zahlen geändert werden mussten. Der Grund ist, dass ein immer neu kodierender Verarbeitungspfad einfacher zu schreiben ist als zwei; das Video benötigt es nicht.

## Wann die Drehung in die Pixel eingebaut werden sollte

Einige alte Desktopplayer ignorieren die Anzeigematrix und zeigen die gespeicherten Bilder seitlich an. Soll der Clip dort abgespielt werden oder können Sie den Zielort nicht prüfen, genügt der Dateikopf nicht: Die Pixel selbst müssen gedreht werden. Das Werkzeug bietet dafür ein Kontrollkästchen „Drehung ins Bild einbauen“. Wie die Onlinewerkzeuge zeichnet es dann jedes Bild gedreht und kodiert es als H.264 neu. Die Bitrate liegt etwas über der ursprünglichen, damit die zweite Generation genug Platz für denselben Bildinhalt hat. Das kostet eine Generation Qualität und dauert eine Kodierung. Deshalb ist es die zweite Möglichkeit und ausdrücklich so benannt.

Eine WebM- oder MKV-Datei mit einem anderen Bildcodec als H.264 wird unabhängig vom Kontrollkästchen auf diese Weise verarbeitet, weil der hier geschriebene MP4-Dateikopf nur H.264-Bilder umschließt. Die Seite erklärt das bei einer solchen Datei.

## Welche Richtung stimmt?

Eine Vierteldrehung nach rechts geht im Uhrzeigersinn: so, wie sich die Oberkante des Bildes bewegt, wenn Sie das Handy nach rechts drehen. Das Werkzeug zeigt das erste Bild mit der gewählten Drehung und derselben Berechnung wie später im Dateikopf. Wählen Sie einfach die Schaltfläche, mit der die Vorschau richtig aussieht. Ein kopfstehender Clip benötigt eine halbe Drehung. Hat die Kamera die Ausrichtung falsch eingeschätzt, braucht es oft eine Vierteldrehung in die unerwartete Richtung.

## Warum der Upload der merkwürdige Teil ist

Jedes Onlinewerkzeug verlangt zuerst die Datei. Ein Gigabyte Urlaub, Vorlesung oder Sport muss über Ihre Verbindung hinauf, damit eine gedrehte Kopie zurückkommen kann. Der Upload dauert länger als die gesamte eigentliche Arbeit, noch bevor sich die Frage stellt, wer die Datei behält. Merkwürdig ist das, weil kein Teil der Aufgabe einen Server braucht: Einen Dateikopf zu lesen und neu zu schreiben ist wenig Arbeit. Selbst die in Pixel eingebaute Drehung verwendet Codecs, die bereits im Browser stecken.

Das Werkzeug [Video drehen](https://abox.tools/de/video-drehen/) arbeitet im Browser. Die Datei wird stückweise von Ihrer Festplatte gelesen, mit einem neuen Dateikopf versehen und in den Arbeitsspeicher geschrieben. Die Sicherheitsrichtlinie der Seite nennt jede erlaubte Kontaktadresse; keine gehört zu dieser Website. Ohne Netzwerk funktioniert das Werkzeug weiter. Das ist der einfachste Beweis.

## Prüfen Sie das Ergebnis vor dem Versenden

Das Werkzeug öffnet sein Ergebnis erneut mit demselben Leser wie die Ausgangsdatei und prüft drei Dinge: die ursprüngliche Länge, die gewünschte Drehung mit der dazugehörigen Größe und den angekündigten Ton. Anschließend spielt es das Ergebnis aus dem Arbeitsspeicher unter dem Download ab. Sehen Sie es kurz an — eine Drehung erkennt man auf einen Blick — und speichern Sie dann. Behalten Sie auch das Original. Die gewöhnliche Drehung verliert nichts, aber das Original ist die einzige Datei, die keine weitere Kopie ist.
