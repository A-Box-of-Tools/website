# Den Ton aus einem Video extrahieren

Wählen Sie ein Video und speichern Sie die dekodierte Tonspur im Browser als WAV. Die Ausgabe enthält nur Audio; Größe und Präzision hängen von Bittiefe und Kanälen ab.

[Ton aus Video extrahieren öffnen](https://abox.tools/de/ton-aus-video-extrahieren/): Ziehen Sie ein Video hinein und nehmen Sie den Ton heraus. Das Bild wird nie dekodiert, und hochgeladen wird nichts.

Zuletzt aktualisiert 13. Oktober 2026

## Video wählen und Ergebnis anhören

Öffnen Sie den Extraktor und wählen Sie ein Video oder legen Sie es ab. Der Browser dekodiert den Ton und erzeugt automatisch eine WAV-Datei. Hören Sie das Ergebnis vor dem Herunterladen an. Ein stummes Video hat keine Tonspur; ein im Browser nicht dekodierbarer Codec braucht einen anderen Decoder.

Die Umwandlung läuft auf Ihrem Gerät, ohne Upload zum Dekodieren. Große Videos brauchen dennoch Speicher für Eingabe, dekodierte Samples und Ausgabe; lokale Verarbeitung macht den Speicher nicht unbegrenzt.

![WAV-Bittiefe und Kanalwahl neben dem Player des extrahierten Tons.](https://abox.tools/screens/extract-audio-from-a-video/output.webp)

Der Player nutzt die zum Download angebotene WAV-Datei. Änderungen von Bittiefe oder Kanälen erzeugen ein neues Ergebnis.

## Ein Vortrag zum Hören oder eine Spur zum Bearbeiten

Behalten Sie für eine Vorlesung, Präsentationsaufnahme oder ein Interview zum Hören ohne Bildschirm zunächst die Quellkanäle und das voreingestellte 16-Bit-PCM. Hören Sie Anfang und Ende an und übernehmen Sie die WAV-Datei in den [Audioschneider](https://abox.tools/de/audio-schneiden/), wenn nur ein Abschnitt wichtig ist. WAV kann viel größer als die komprimierte Tonspur sein. Prüfen Sie vor dem Übertragen, was Ihre Hör-App annimmt.

Wählen Sie für Voiceover- oder Podcastbearbeitung Float32 mit unveränderten Kanälen und behalten Sie diese WAV-Datei als Arbeitskopie. Extrahieren übernimmt die vorhandene gemischte Tonspur. Es trennt keine Stimme von Musik, entfernt kein Hintergrundrauschen und transkribiert keine Wörter. Testen Sie Mono erst nach dem Anhören beider Kanäle. Es spart bei Sprache Platz, aber zwei Mikrofone können verschiedene Stimmen tragen oder sich beim Mitteln teilweise auslöschen.

## 16 Bit oder Float32 wählen

16-Bit-PCM ist die Vorgabe für breite Wiedergabekompatibilität. Beim Schreiben werden die dekodierten Samples gerundet und begrenzt. Float32 behält bei unveränderten Kanälen deren Werte, auch oberhalb der Vollaussteuerung, und eignet sich für weitere Bearbeitung. Bereits durch Kompression verlorene Details stellt es nicht wieder her.

WAV speichert unkomprimiertes Audio und kann deutlich größer als die komprimierte Tonspur des Videos sein. Der Extraktor erzeugt kein MP3, da dieses Werkzeug keinen MP3-Encoder mitliefert. Ein lokaler Encoder in einer anderen Anwendung kann MP3 ohne Upload schreiben.

## Kanäle behalten oder zu Mono mischen

Behalten Sie die Quellkanäle, um ihre Trennung zu erhalten. Mono mittelt sie zu einem Kanal. Das kann die Datei verkleinern, entfernt aber die Stereoposition und kann gegenphasige Töne auslöschen. Hören Sie nach jeder Änderung dieser Option hinein.

Das Werkzeug liest die Quellabtastrate, wenn der Header sie angibt, und dekodiert bei dieser Rate. Muss es eine Rate annehmen, nennt die Ausgabe diese Annahme. Prüfen Sie die Angaben, wenn Zeitverlauf oder Abtastrate für die nächste Anwendung wichtig sind.

## Speichern, abbrechen oder erneut versuchen

Eine Änderung von Bittiefe oder Kanälen ersetzt automatisch das vorherige Ergebnis. Laden Sie die Version herunter, die Sie angehört haben. Abbrechen verwirft den aktuellen Auftrag; eine laufende Browserdekodierung kann intern enden, ihr spätes Ergebnis ersetzt aber keine neuere Auswahl. Nach einem Schreibfehler nutzen Sie WAV erstellen erneut mit der aktuellen Quelle.

Für eine kürzere Tonspur geht es im [Audio-Trimmer](https://abox.tools/de/audio-schneiden/) weiter. Überblendungen, Pegel und Umkehren bietet der [Audio-Editor](https://abox.tools/de/audio-bearbeiten/).
