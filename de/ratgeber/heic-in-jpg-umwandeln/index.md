# Das Foto, das Ihr Handy gespeichert hat, und das Format, das niemand öffnet

Ein iPhone speichert Fotos als HEIC. Das ist kleiner und besser als JPEG, und erstaunlich viel Software verweigert es bis heute. Hier steht, was hinter dem Format steckt, was die Umwandlung das Bild kostet und warum beinahe jeder Konverter die Fotos erst einmal hochgeladen haben will.

[HEIC zu JPG öffnen](https://abox.tools/de/heic-in-jpg-umwandeln/): Die Fotos, die ein iPhone macht, in einem Format, das jedes Programm öffnet.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [HEIC-zu-JPG-Umwandler](https://abox.tools/de/heic-in-jpg-umwandeln/), ziehen Sie die Fotos hinein und klicken Sie auf „Umwandeln“. Den Qualitätsregler lassen Sie stehen, und das Häkchen bei „Datum, Kamera und Einstellungen behalten“ lassen Sie gesetzt, solange nichts dagegen spricht. Zurück kommen JPEGs, jedes mit einer eigenen Schaltfläche, oder als ZIP, wenn es mehrere sind.

Hochgeladen wird dabei nichts. Für ausgerechnet diese Aufgabe ist das ungewöhnlich, und warum das so ist, macht die interessantere Hälfte dieser Seite aus.

![Die Optionen-Karte: ein Format-Menü auf JPEG, ein Qualitätsregler auf 85 und ein Schalter dafür, ob Datum, Kamera und Aufnahmeort mit übernommen werden.](https://abox.tools/screens/convert-heic-to-jpg/options.webp)

Die ganze Umwandlung sind diese drei. Beim Metadaten-Schalter lohnt das Innehalten, und der Abschnitt weiter unten sagt, warum.

## Was HEIC überhaupt ist

HEIC ist kein Bildformat in dem Sinne, in dem JPEG eines ist. Es ist ein Container mit derselben Box-Struktur, aus der auch ein MP4 gebaut ist, und darin steckt ein Einzelbild aus **HEVC**-Video. HEVC, auch H.265 genannt, ist der Nachfolger des Codecs aus Ihrem alten Camcorder, und er ist ausgesprochen gut. Ein iPhone-Foto im HEIC ist bei gleicher Qualität ungefähr halb so groß wie dasselbe Foto als JPEG.

Apple hat 2017 mit iOS 11 umgestellt und HEIC zur Voreinstellung gemacht. Solange also niemand in den Einstellungen auf „Maximale Kompatibilität“ gewechselt hat, liegt jedes Foto aus gut einem Jahrzehnt in einem Format, das

- Windows ohne eine Erweiterung aus dem Store nicht in der Vorschau anzeigt,
- die meisten Upload-Formulare rundheraus ablehnen,
- von dem eine Menge älterer Programme noch nie gehört hat,
- und das außer Safari kein Browser darstellt.

Mit dem Foto selbst ist alles in Ordnung. Es ist die bessere Datei, als das JPEG geworden wäre. Sie ist nur in einer Sprache geschrieben, die der größte Teil der Welt nie gelernt hat.

## Warum nur Safari eines aufbekommt

Dieser Abschnitt erklärt jeden Konverter, den Sie je benutzt haben, und ist die paar Zeilen deshalb wert.

Wer HEVC dekodieren will, braucht einen HEVC-Decoder, und HEVC ist patentiert. Die Lizenzen verwaltet mehr als ein Patentpool, und einen Decoder auszuliefern heißt, jemanden zu bezahlen. Browser umgehen das, indem sie sich auf das Betriebssystem stützen: Chrome spielt HEVC-*Video* auf Geräten ab, deren Hardware ohnehin einen lizenzierten Decoder mitbringt. Nur ist dieser Weg für die Videowiedergabe verdrahtet und nicht für Standbilder. Ein HEIC, das an `<img>` gereicht wird, fällt deshalb durch, in Chrome, Firefox und Edge gleichermaßen und auf jedem Betriebssystem.

Die Ausnahme ist Safari auf Apple-Hardware, weil macOS und iOS den Decoder haben und Safari ihn fragen darf. Überall sonst ist das Bild für den Browser schlicht nicht zu dekodieren.

Damit bleiben einem Konverter genau zwei Möglichkeiten, und in der Wahl zwischen ihnen steckt die ganze Geschichte dieser Werkzeuggattung.

## Warum beinahe jeder HEIC-Konverter einen Upload verlangt

Möglichkeit eins: den Decoder auf einen Server legen. Das Foto wird hochgeladen, auf einer Maschine dekodiert, die Sie nie zu Gesicht bekommen, als JPEG neu kodiert und zurückgeschickt. So arbeitet praktisch jeder „kostenlose Online-HEIC-Konverter“, und deshalb brauchen sie alle Ihre Dateien. Bequemlichkeit ist das nicht, denn ohne Hilfe kann der Browser es tatsächlich nicht.

Was das kostet, sollte man unverblümt sagen. Fotos vom Handy sind die persönlichsten Dateien, die die meisten überhaupt besitzen, und ein HEIC direkt aus dem iPhone trägt in aller Regel die Koordinaten des Aufnahmeorts auf wenige Meter genau mit sich, dazu das Datum auf die Sekunde und eine Kamerakennung. Wer einen ganzen Ordner davon zu einem Gratisdienst hochlädt, gibt beides aus der Hand: die Bilder und all das. Was danach damit geschieht, regelt eine Datenschutzerklärung, die Sie nie gelesen haben, auf einem Server, in den Sie nicht hineinsehen können, in einem Land, das Sie nicht ausgesucht haben.

Möglichkeit zwei: den Decoder auf die Seite legen. Genau das tut [dieser hier](https://abox.tools/de/heic-in-jpg-umwandeln/). Er bringt `libheif` mit, nach WebAssembly übersetzt, als Datei von dieser Seite: rund 1,4 MB, einmal geladen und danach zwischengespeichert. Ausgeführt wird sie von Ihrem Browser, auf Ihrem eigenen Gerät, und das Foto bleibt, wo es ist. Laden Sie die Seite einmal, dann können Sie die Internetverbindung vollständig kappen, und sie arbeitet weiter. Das bringt kein hochladender Konverter fertig, und einen einfacheren Beweis gibt es nicht.

Diese 1,4 MB sind der ganze Preis. An einer Verbindung mit Datenvolumen sind sie ein echter Posten und deshalb der Rede wert. Genau darum sagt die Seite es laut, statt sie klammheimlich zu laden.

## Was die Umwandlung das Bild kostet

HEIC und JPEG sind verschiedene Codecs. Es führt also kein Weg hinüber, der nicht darin bestünde, das Bild zu dekodieren und neu zu kodieren, und dieses zweite Kodieren ist verlustbehaftet. In der Praxis fällt das allerdings sehr viel weniger ins Gewicht, als es klingt:

- **Bei Qualität 92**, und damit fängt der Konverter an, ist eine Fotografie in jeder normalen Betrachtungsgröße kaum vom Original zu unterscheiden. Suchen müssten Sie in weichen Verläufen, etwa in einem klaren Himmel, und finden werden Sie dort in der Regel nichts.
- **Das JPEG wird größer.** Meist um ein Drittel bis auf das Doppelte, denn JPEG ist ein Codec von 1992 und HEVC nicht. So sieht der Handel aus: eine größere Datei, dafür eine, die überall aufgeht.
- **Zweimal umzuwandeln ist das, was Sie sich sparen sollten.** Jede verlustbehaftete Kodierung kostet ein wenig. Gehen Sie vom ursprünglichen HEIC aus und nicht von einem JPEG, das Ihnen schon jemand gemacht hat, und tun Sie es genau einmal.

Wollen Sie überhaupt keinen Verlust, steht PNG im Formatmenü. Rechnen Sie dann aber mit der Dateigröße. Eine Fotografie als PNG ist üblicherweise fünf- bis zehnmal so groß wie das JPEG, weil die PNG-Kompression für einfarbige Flächen und Strichzeichnungen gedacht war und nicht für Gras und Haut.

## Datum, Kamera und Koordinaten

Die häufigste Klage über HEIC-Konverter lautet, dass die Fotos ohne ihr Aufnahmedatum zurückkommen, und ein ganzer Urlaub sortiert sich dann unter dem heutigen Datum ans Ende der Mediathek. Das liegt daran, dass eine Umwandlung über das Canvas nur Pixel liefert und sonst nichts, denn ein Canvas trägt keine Tags. Holt ein Konverter die Metadaten nicht eigens nach, sind sie schlicht weg.

Das Werkzeug hier liest den EXIF-Block aus dem HEIC heraus und schreibt ihn ins JPEG, das Datum überlebt also. Dafür gibt es ein Häkchen, und es ist von vornherein gesetzt. Nehmen Sie es heraus, kommt das JPEG mit dem Bild heraus und mit sonst gar nichts.

Bevor Sie sich entscheiden, sehen Sie in die Liste. In der Zeile jedes Fotos steht, ob die Datei GPS-Koordinaten trägt, und zwar bevor irgendetwas umgewandelt wird. Gehen die Fotos an einen öffentlichen Ort, kommt es genau auf diese Zeile an. Wandern sie in Ihre eigene Mediathek, wollen Sie die Metadaten mit ziemlicher Sicherheit behalten.

Ein Tag wird in jedem Fall geändert, und der Grund ist eine Erklärung wert. Ein HEIC hält seine Drehung an zwei Stellen fest: im Container und im EXIF-Block. Der Decoder wendet die Drehung des Containers schon beim Dekodieren an, die herausgereichten Pixel liegen also bereits richtig herum. Stünde im EXIF weiterhin „um 90 Grad drehen“, würde jeder Betrachter das ein zweites Mal tun, und jedes Hochformatfoto käme quer heraus. Das Orientierungs-Tag wird deshalb auf aufrecht gesetzt. Alles andere wird genau so übernommen, wie das Handy es geschrieben hat.

Wollen Sie die Tags im Einzelnen durchgehen oder sie aus Fotos entfernen, die längst JPEGs sind, ist das eine andere Aufgabe, und dafür gibt es einen [eigenen Ratgeber](https://abox.tools/de/ratgeber/exif-und-gps-daten-entfernen/).

## Worüber man dabei stolpert

- **Ein HEIC, das „.jpg“ heißt.** Kommt ständig vor. Irgendetwas hat die Datei unterwegs umbenannt, ohne sie umzuwandeln, und deshalb geht sie nach wie vor nicht auf. Jede Datei, die Sie auf den Konverter ziehen, wird an ihren ersten Bytes erkannt und nicht an ihrem Namen, eine solche funktioniert also anstandslos. Aus demselben Grund bekommt eine Datei, die wirklich ein JPEG ist, das gesagt, statt in eine Kopie ihrer selbst verwandelt zu werden.
- **Eine Datei, mehrere Bilder.** Eine Serienaufnahme oder ein Live Photo kann mehr als ein Einzelbild enthalten. Umgewandelt werden alle, die zusätzlichen durchnummeriert nach dem ursprünglichen Namen. Die Videohälfte eines Live Photos liegt als eigene Datei neben dem HEIC, sie steckt also gar nicht darin.
- **AVIF ist nicht HEIC.** Die beiden sehen sich ähnlich, derselbe Container mit einem anderen Codec darin, aber ein AVIF öffnet jeder aktuelle Browser von Haus aus. Da ist nichts umzuwandeln, und das Werkzeug sagt Ihnen das, statt Arbeit vorzutäuschen.
- **Das Übel an der Wurzel packen.** Am Handy: Einstellungen → Kamera → Formate → Maximale Kompatibilität. Von da an sind neue Fotos JPEGs. Das kostet Speicherplatz und ändert nichts an den Fotos, die Sie schon haben, dafür müssen Sie das hier nie wieder tun.
- **Teilen wandelt manchmal von selbst um.** Wer ein Foto per AirDrop oder E-Mail an ein Gerät ohne Apple-Logo schickt, gibt oft schon ein JPEG heraus, weil iOS auf dem Weg nach draußen umwandelt. Kam ein Foto trotzdem als HEIC an, hat es einen Weg genommen, auf dem das nicht passiert.

## Woran Sie merken, ob ein Konverter hochlädt

Das gilt für jedes Werkzeug und nicht nur für dieses, und es dauert eine Viertelminute.

1. Seite öffnen, dann die Entwicklerwerkzeuge des Browsers aufrufen und auf den Tab „Netzwerk“ wechseln.
2. Ein Foto umwandeln und zusehen. Ein Werkzeug, das auf Ihrem Gerät dekodiert, stellt in diesem Moment überhaupt keine Anfrage. Eines, das hochlädt, stellt eine in der Größe Ihres Fotos, und diese Größe steht da.
3. Oder noch einfacher: Seite laden, Internetverbindung trennen und trotzdem etwas umwandeln wollen. Ein Werkzeug, das Ihr Foto zum Dekodieren weggeschickt hat, bleibt stehen. Eines, das den Decoder selbst mitbringt, nicht.

Der Konverter hier ist so gebaut, dass er beide Proben besteht. Ausführlich steht dieselbe Überlegung in [Ist es sicher, Dateien hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)
