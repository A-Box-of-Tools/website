# Ist es sicher, Dateien zu Online-Konvertern hochzuladen?

Ehrlich beantwortet lautet sie meist: „Vermutlich schon, nachprüfen können Sie es allerdings nicht.“ Hier steht, was beim Hochladen wirklich mit Ihrer Datei passiert, warum die meisten Werkzeuge trotzdem darauf bestehen und mit welchen vier Proben Sie herausfinden, ob das Werkzeug vor Ihnen den Upload überhaupt braucht.

Zuletzt aktualisiert 12. Oktober 2026

## Die kurze Antwort

Für eine nicht sensible Datei und passende Bedingungen kann ein Upload angemessen sein. Aufbewahrung und Zugriff unterscheiden sich nach Anbieter und Funktion; ein Löschzeitgeber erklärt nicht allein den Weg jeder Kopie.

Das Problem ist nicht, dass sie lügen könnten, sondern dass **Sie es nicht feststellen können**. Sobald eine Datei Ihr Gerät verlässt, gilt jede Zusage über das, was danach kommt, auf Treu und Glauben: wie lange sie liegen bleibt, wer an sie herankommt, ob sie in einem Backup gelandet ist, das die Löschfrist überdauert, was mit ihr geschieht, wenn die Firma verkauft oder gehackt wird. Von außen ist davon nichts zu sehen.

Die brauchbare Frage lautet deshalb nicht „Vertraue ich dieser Seite?“, sondern: **„Muss meine Datei für diese Aufgabe überhaupt außer Haus?“** Bei immer mehr Aufgaben lautet die Antwort nein, und dann stellt sich die Vertrauensfrage gar nicht mehr.

## Was beim Hochladen tatsächlich passiert

Ein Upload sendet Dateidaten vom Browser an einen anderen Computer. Das können Originalbytes oder eine veränderte Kopie sein. Eine Datei auszuwählen ist noch kein Upload: ein lokales Werkzeug kann sie ohne Übertragung lesen.

Serververarbeitung kann Arbeitsdateien, anfragebezogene Protokolle, zwischengespeicherte Ergebnisse und Backups erzeugen. Das sind Möglichkeiten für die Prüfung der Bedingungen, nicht drei Kopien, die jeder Dienst zwangsläufig erstellt. Ein externer Browsertest kann interne Löschung nicht belegen.

Dateiname und eingebettete Metadaten können mitgesendet werden. Fotos können Ort, Zeit, Kamera- oder Softwareangaben und Vorschaubilder enthalten. Die Felder hängen von Gerät, Einstellungen und Bearbeitung ab. Prüfen Sie die Datei, statt all diese Angaben in jedem Handyfoto vorauszusetzen.

## Warum die meisten Werkzeuge trotzdem hochladen

Nicht, weil sie es auf Ihre Dateien abgesehen hätten, sondern weil es den größten Teil der Web-Geschichte über keine Alternative gab. Ein Browser konnte kein Video dekodieren, kein Bild in einer gewünschten Qualität neu kodieren und kein Dateiformat zerlegen; ein Server mit FFmpeg und ImageMagick konnte das alles. Hochladen war kein Geschäftsmodell, es war schlicht der einzige Ort, an dem die Arbeit stattfinden konnte.

Das hat vor Kurzem und ziemlich unbemerkt aufgehört zu stimmen. Browser bringen heute WebAssembly mit, das dieselben kompilierten Codecs beinahe in nativer Geschwindigkeit ausführt, dazu WebCodecs, das den Hardware-Video-Encoder zugänglich macht, der ohnehin in Ihrem Gerät sitzt, und eine Canvas-API, die Bilder direkt dekodieren und neu kodieren kann. Die Arbeit, für die früher ein Server nötig war, läuft heute auf dem Gerät, das die Datei ohnehin hat.

Viele Werkzeuge laden dennoch hoch, und dafür gibt es ehrliche Gründe: eine gewachsene Verarbeitungskette, die niemand neu schreiben will, ein Format, für das es im Browser keinen Decoder gibt, eine Aufgabe, die einem Handy tatsächlich zu schwer ist. Es gibt auch einen weniger ehrlichen Grund. Auf dem Server wohnen Konten, Kontingente und Bezahlstufen, und ein Werkzeug, das vollständig in Ihrem Browser läuft, lässt sich schlecht abrechnen.

## Vier Proben, die Sie selbst machen können

Prüfen Sie die konkrete Operation und Eingabe. Jede Prüfung beantwortet einen Teil; zusammen sind sie stärker als eine allein.

### 1. Für die lokale Operation trennen

Laden Sie das Werkzeug vollständig und warten Sie gegebenenfalls auf die bereite Offline-Anzeige. Trennen Sie die Verbindung und verarbeiten Sie eine Datei vom Gerät. Fertigstellung belegt, dass diese Operation ohne erreichbaren Server lief. Ein Fehlschlag kann auch fehlende Ressourcen oder Browserunterstützung bedeuten und beweist keinen Upload. Ein Erfolg erklärt nicht das Verhalten nach Wiederverbindung; der [Offline-Ratgeber](https://abox.tools/de/ratgeber/wie-kann-eine-webseite-offline-funktionieren/) erklärt diese Grenze.

### 2. Die Anfragen prüfen

Öffnen Sie vorher DevTools, leeren Sie die Liste und erhalten Sie das Protokoll. Prüfen Sie Ziele, URL-Parameter, Anfrageinhalte und WebSocket-Nachrichten. Größenangaben beschreiben oft Antworten; kleine Anfragen können ausgelesene oder komprimierte Daten enthalten. Gleiche Dateigröße ist kein ausreichender Test. Gewöhnliche Listen zeigen keine WebRTC-Peer-Nutzdaten; dafür lesen Sie Transportcode und nutzen die WebRTC-Diagnose des Browsers.

### 3. Content-Security-Policy lesen

Die [connect-src-Direktive](https://www.w3.org/TR/CSP3/#directive-connect-src) begrenzt Ziele für APIs wie fetch und WebSocket. Erlaubte Drittanbieter können trotzdem Daten empfangen. Andere Direktiven betreffen Bilder, Formulare und Ressourcen; WebRTC-Peer-Verkehr wird von dieser Hostliste nicht beschrieben. CSP ist eine Einschränkung, keine Nutzdatenprüfung oder alleiniger Beweis gegen Uploads.

### 4. Daten im Quelltext verfolgen

Vergleichen Sie veröffentlichten Quelltext und generierten Code. Verfolgen Sie Dateien durch fetch, XMLHttpRequest, sendBeacon, WebSocket und RTCPeerConnection; prüfen Sie auch Formulare, Ressourcen-URLs und App-Übergaben. Das sind Beispiele, keine vollständige Liste. Entscheidend sind die übergebenen Daten, auch in Plattform- und Feedbackskripten.

## Was „läuft in Ihrem Browser“ nicht bedeutet

Hier lohnt sich Genauigkeit, weil die Formulierung reichlich lose verwendet wird und weil diese Seite sich an denselben Maßstab halten muss, den sie anlegt.

- **Es heißt nicht: überhaupt keine Anfragen.** Die Seite selbst kam übers Netz, und die meisten kostenlosen Werkzeuge tragen Werbung oder Messung, die mit irgendjemandem spricht. Die Zusage betrifft Ihre *Datei* und nicht den Datenverkehr im Allgemeinen.
- **Es verbirgt Ihre IP-Adresse nicht.** Die sieht jede Seite, die Sie besuchen, diese eingeschlossen. Bei lokaler Verarbeitung geht es um den Inhalt Ihrer Dateien, nicht um Anonymität.
- **Eine Funktion, die etwas abruft, hebt es auf.** Ein Werkzeug, in das Sie eine Webadresse einfügen können, muss diese Adresse kontaktieren, und der Server dahinter erfährt Ihre IP und was Sie angefordert haben. Das gehört zur Funktion und ist kein Fehler darin. Eine echte Ausnahme bleibt es trotzdem, und ein Werkzeug sollte sie deutlich aussprechen, statt sie unter den Tisch fallen zu lassen.
- **Es ist nicht dasselbe wie „wir löschen Ihre Dateien“.** Lokale Verarbeitung beschreibt den Ort einer konkreten Operation. Aufbewahrung beschreibt dagegen das Handeln eines Anbieters nach Empfang von Daten. Prüfen Sie Umsetzung und Netzwerkgrenzen, bevor Sie einen Satz als Datenschutzgarantie behandeln.

## Wann Hochladen völlig in Ordnung ist

Das hier ist kein Plädoyer dafür, dass jeder Upload ein Fehler wäre. Schicken Sie die Datei ruhig, wenn der Inhalt nicht heikel ist und die Aufgabe so leichter geht, wenn die Arbeit Ihrem Gerät wirklich zu schwer ist, wenn es für das Format im Browser keinen Decoder gibt, oder wenn Sie einen Dienst nutzen, zu dem Sie ohnehin eine Beziehung haben und dessen Bedingungen Sie tatsächlich gelesen haben.

Vorsichtiger sollten Sie werden, sobald in der Datei etwas steckt, das Sie nicht öffentlich posten würden: Ausweispapiere, medizinische Aufnahmen, Verträge, alles mit einer Anschrift oder einem Gesicht, das Sie nicht herzeigen wollten, oder ein Foto, in dessen Ortsdaten Sie nie hineingesehen haben. In solchen Fällen ist ein Werkzeug, das Sie prüfen können, einem vorzuziehen, dem Sie vertrauen müssen. Nicht, weil das vertrauenswürdige Sie wahrscheinlich hinterginge, sondern weil sich beim nachprüfbaren die Frage gar nicht erst stellt.

## Wie diese Seite die vier Proben besteht

Es wäre ein merkwürdiger Ratgeber, der Ihnen zum Prüfen rät und dann um eine Ausnahme für sich selbst bittet. Also der Reihe nach:

- **Offline.** Lokale Verarbeitung funktioniert mit geladenen Ressourcen und fertigem Cache. Bild-URLs, Onlinekurse und Browser-Vermittlung benötigen Verbindungen.
- **Anfragen.** Verarbeitungscode lädt ausgewählte Dateien nicht hoch. Seitenaufrufe und freiwillige feste Feedback-Antworten sind andere Anfragen. Kursabfragen enthalten Währungspaar und Datum; bewusste Peer-Funktionen senden Inhalte an den gewählten Browser.
- **Richtlinie.** Die meisten Werkzeuge übernehmen Plattformziele. Belege ergänzen Frankfurter, Teilen und Kamera die Vermittlung. Die Richtlinie begrenzt Ziele und beweist keine Nutzdaten.
- **Quelltext.** Der [Quelltext ist öffentlich](https://github.com/A-Box-of-Tools/website). Bauen und vergleichen Sie die Ausgabe. Gemeinsame Module und mitgelieferte Engines sind ebenfalls lesbar.

Die [Datenschutzseite](https://abox.tools/de/datenschutz/) erklärt die Grenzen: [Bild-URL-Import](https://abox.tools/de/bilder-in-video-umwandeln/), optionale [Belegkurse und App-Übergabe](https://abox.tools/de/belege-rechnungen-auslesen/), [Teilen zwischen Browsern](https://abox.tools/de/text-teilen/) und [Remote-Kamera](https://abox.tools/de/remote-camera/), dazu Werbung, Analytics und festes Feedback. Bewusstes Übertragen ist von einem Verarbeitungsupload zu unterscheiden.

Lokale Beispiele sind [Komprimieren auf eine Zielgröße hin](https://abox.tools/de/bild-komprimieren/), [Videos zuschneiden](https://abox.tools/de/video-zuschneiden/), [EXIF und GPS entfernen](https://abox.tools/de/exif-daten-entfernen/) und [Bilder zu PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/). Prüfen Sie Formatunterstützung und Ergebnis. Diese Aufgaben brauchen weder Verarbeitungsupload noch Konto.

![Ein Datenschutzbereich mit lokaler Verarbeitung, Quelltextverweisen und einer aktuellen Zusammenfassung geladener Ressourcen.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

Der Bereich zeigt Aussage und zugehörigen Quelltext. Seine Ressourcenliste hilft bei der eigenen Anfrageprüfung, untersucht aber nicht selbst die Nutzdaten.
