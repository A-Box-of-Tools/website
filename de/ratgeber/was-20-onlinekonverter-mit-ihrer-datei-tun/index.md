# Was 20 Onlinekonverter mit Ihrer Datei tun

Wir gaben dasselbe Bild von 542 KB an zwanzig kostenlose Onlinekonverter und maßen die Größen der Request-Bodys, die den Browser verließen. Neunzehn schickten es an einen Server, dreizehn vor jedem weiteren Klick. Alle später geprüften Ergebnisdateien waren öffentlich abrufbar.

Zuletzt aktualisiert 13. Oktober 2026

## Die kurze Antwort

Am 17. September 2026 gaben wir dieselbe Datei an zwanzig kostenlose Onlinekonverter und zeichneten mit den unten beschriebenen Hooks die Größen der Request-Bodys auf. **Neunzehn der zwanzig luden sie hoch.** Einer nicht.

Das war ungefähr zu erwarten. Drei Ergebnisse waren weniger offensichtlich: **Dreizehn der neunzehn versendeten die Datei sofort bei der Auswahl**, vor dem Klick auf „Umwandeln“ und jeder Möglichkeit zum Umdenken. **Jede später erneut abgerufene Ergebnisdatei blieb über eine gewöhnliche Webadresse lesbar**, ohne Cookie, Anmeldung oder Sitzung. **Zwei Dienste schrieben den Dateinamen in diese Adresse**.

Das beweist kein Fehlverhalten. Die meisten Werkzeuge arbeiten seit jeher mit Uploads, ihre Aufbewahrungsfristen sind meist kurz und konkret. Eine für zwei Stunden über eine nicht erratene Adresse verfügbare Datei ist kein Skandal. Gemessen wird etwas Nüchterneres: Der Unterschied zwischen „*Die Website verspricht, meine Datei zu löschen*“ und „*Ich kann nachprüfen, was mit meiner Datei geschah*“ ist größer als gedacht und lässt sich an einem Nachmittag untersuchen.

## Den Vergleich für eine eigene Prüfung nutzen

**Einen Konverter für Dokumentarbeit wählen.** Die datierte Tabelle ist Anlass, genau die geplante Funktion zu prüfen, keine aktuelle Sicherheitsrangliste. Erstellen Sie ein erfundenes Muster im erforderlichen Format, beobachten Auswahl und Konvertierung und prüfen den Download. Ein PNG-Test beweist nichts über Bank-PDFs oder andere Werkzeuge derselben Domain.

**Eine Werkzeugauswahlnotiz fürs Team.** Notieren Sie URL, Datum, Browser, Handlungen, beobachtete Übertragung und veröffentlichte Aufbewahrungsbedingungen. Behalten Sie Testdatei und unten beschriebene Aufzeichnung zur Wiederholung durch andere. Trennen Sie beobachteten Upload von Richtlinienzusage und unfertigen Test von Bestehen.

Auch nach Funktionsänderungen hilft das. Wiederholen Sie dieselbe harmlose Aufgabe und vergleichen Belege. Verwenden Sie historische Zahlen nicht als neue Messung.

## Wie gemessen wurde

Die Methode ist bewusst unspektakulär und wiederholbar. Es geht um Zahlen, nicht um die Meinung dazu.

### Die Datei

Ein PNG mit ⁦450 x 350⁩ zufälligen Pixeln, etwa 542 KB groß, namens `abox-probe-9471.png`. Zufälliges Rauschen ist schwer zu komprimieren. Eine ähnlich große Nutzlast ist ein Hinweis; was gesendet wurde, lässt sich aber erst durch Prüfung des Request-Bodys feststellen. Der auffällige Dateiname machte die Datei später in URLs auffindbar.

### Die Messung

Vor der Übergabe der Datei wurden diese Request-APIs instrumentiert: Sie zeichneten die Größe der übergebenen Daten auf und führten dann ihre normale Funktion aus. Das waren `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `WebSocket.send` und, besonders wichtig, `HTMLFormElement.submit`. Danach wurde die Datei in die Dateiauswahl der Seite gelegt, zehn Sekunden gewartet und die Aufzeichnung ausgelesen.

Die Formularüberwachung ist entscheidend. Mehrere Dienste versenden über gewöhnliche HTML-Formulare statt Skripte. Das sehen die zuerst verwendeten Überwachungen für `fetch` und `XMLHttpRequest` nicht. PicResize zeigt währenddessen das Bild lokal über `blob:` an. Das wirkt wie lokale Verarbeitung, bis die Formularübertragung erfasst wird.

### Die anschließende Prüfung

Gab ein Dienst einen Link zur Ergebnisdatei aus, wurde dieser per Kommandozeile erneut abgerufen. Ein anderes Programm ohne Cookies, Sitzung oder aus dem Browser übernommene Daten. Eine unter diesen Bedingungen abrufbare Datei kann jeder lesen, der ihre Adresse besitzt.

Zwanzig bedeutet zwanzig bedienbare Websites, nicht die zwanzig größten. Neun weitere Versuche ließen sich nicht messen und stehen unten. Ein Dienst, der die Automatisierung abwehrt, hat den Test nicht bestanden; der Test lief dort nicht.

## Die Tabelle

Die Bytezahlen sind die am 17. September 2026 berichteten Größen der Request-Bodys; fehlende Werte bleiben fehlend. Die letzte Spalte bewahrt die damals berichteten Richtlinienzusammenfassungen. Ihre Links führen zu aktuellen Referenzseiten, geprüft am 12. Oktober 2026, nicht zu archivierten Belegen des damaligen Wortlauts.

| Konverter | Wurde die Datei versendet? | Gemessene Bytes | Ziel | Aufbewahrung laut Richtlinie |
| --- | --- | --- | --- | --- |
| Squoosh | Nein | 0 | — | nichts aufzubewahren |
| TinyPNG | Ja, bei der Auswahl | 542,566 | `tinypng.com/backend/opt/store` | 48 Stunden |
| iLoveIMG | Ja, bei der Auswahl | 542,816 | `api9.iloveimg.com/v1/upload` | 2 Stunden |
| iLovePDF | Ja, bei der Auswahl | 542,801 | `api4.ilovepdf.com/v1/upload` | 2 Stunden |
| Sejda | Ja, bei der Auswahl | 542,537 | `sejda.com/api/files/upload` | nach der Verarbeitung; geteilte Links 7 Tage |
| PDF24 | Ja, bei der Auswahl | 542,531 | `filetools24.pdf24.org/client.php` | „normalerweise“ 1 Stunde |
| PDF Candy | Ja, bei der Auswahl | 542,522 | `s35.api.pdfcandy.com/uploadcbc/…` | 2 Stunden |
| jpg2pdf.com | Ja, bei der Auswahl | 542,570 | `jpg2pdf.com/api/upload` | 1 Stunde laut Nutzungsbedingungen |
| Img2Go | Ja, bei der Auswahl | 542,589 | `www21.img2go.com/v2/dl/web7/…` | 72 Stunden |
| Online-Convert | Ja, bei der Auswahl | 542,423 | `www8.online-convert.com/v2/dl/web7/…` | 72 Stunden |
| PDF2Go | Ja, bei der Auswahl | 542,542 | `www15.pdf2go.com/v2/dl/web7/…` | 72 Stunden |
| Compress2Go | Ja, bei der Auswahl | 542,492 | `www6.compress2go.com/v2/dl/web7/…` | 72 Stunden |
| PicResize | Ja, bei der Auswahl | 542,568 | `picresize.com/en/edit`, Formularübertragung | 20 Minuten |
| ResizePixel | Ja, bei der Auswahl | Formularübertragung | `resizepixel.com/` | innerhalb 1 Stunde |
| CloudConvert | Ja, beim Umwandeln | 543,218 | `eu-central.storage.cloudconvert.com/…` | 24 Stunden |
| Convertio | Ja, beim Umwandeln | nicht erfasst | `convertio.co/process/…` | 24 Stunden |
| Ezgif | Ja, beim Umwandeln | 542,483 | `ezgif.com/optimize`, Formularübertragung | 1 Stunde nach der letzten Nutzung |
| Aconvert | Ja, beim Umwandeln | Formularübertragung | `aconvert.com/results.php` | 2 Stunden |
| Online2PDF | Ja, beim Umwandeln | 547,330 | `online2pdf.com/conversion/frame` | „sofort“ |
| IMGonline | Ja, beim Umwandeln | 542,633 | `imgonline.com.ua/eng/…-result.php` | keine Richtlinie gefunden |

Zwanzig Konverter, eine Datei von 542 KB, 17. September 2026. „Bei der Auswahl“ bedeutet Upload ab Dateiauswahl; „beim Umwandeln“ bedeutet Warten auf die Schaltfläche. Convertios Upload verließ die Seite vor dem Auslesen der Bytezahl. Deshalb steht dort „nicht erfasst“ statt einer Schätzung.

## Beobachtungen und ihre Grenzen

Die veröffentlichte Tabelle ist als [JSON mit Herkunft und Einschränkungen](https://abox.tools/data/converter-observations-2026-09-17.json) und als [CSV-Zeilen](https://abox.tools/data/converter-observations-2026-09-17.csv) verfügbar. Diese Dateien übertragen den Artikel, sie sind kein neuer Test. Die Tabelle zählt dreizehn Uploads bei der Auswahl und korrigiert damit die zuvor im Text genannten elf.

Die ursprünglichen Request-Logs, Browserversion, genaue Zufallsdatei und historischen Richtlinienkopien wurden nicht mit dem Artikel aufbewahrt. Die Zahlen sind deshalb berichtete Beobachtungen, kein anhand von Rohdaten unabhängig prüfbarer Datensatz. Die Hooks erfassen nicht jeden Übertragungsweg: Formularnavigation, andere Frames, Worker und WebRTC brauchen eigene Prüfungen. Eine Null bedeutet, dass dieser Test keinen Upload aufzeichnete, nicht dass keine Übertragung möglich ist.

Erstellen Sie für eine Wiederholung eine neue synthetische Datei, halten Sie ihre genaue Bytezahl und SHA-256 fest und verwenden Sie ein neues Browserprofil. Speichern Sie eine Netzwerkaufzeichnung mit Request-Bodys und erhaltenen Navigationen; prüfen Sie Auswahl und Umwandlung getrennt. Notieren Sie Browserversion, URL, Zeit, Aktion, Ziel, Bodygröße und ob der Body die Testdatei enthält. Entfernen Sie Zugangsdaten und private Ergebnislinks vor der Weitergabe. Bewahren Sie Richtlinientext, URL und Datum auf und führen Sie unvollständige Tests separat.

Ein Datei-URL, der ohne Sitzung ein Ergebnis liefert, belegt den Zugriff für jemanden mit diesem URL zum Prüfzeitpunkt. Prüfen Sie nach Ablauf der angegebenen Aufbewahrungsfrist erneut, bevor Sie eine fehlgeschlagene Löschung behaupten. Weder dieser Abruf noch eine Netzwerkaufzeichnung belegt, was in internen Logs oder Sicherungen verbleibt.

## Dreizehn versenden vor jedem weiteren Klick

Dieses deutliche Verhältnis überraschte uns. Bei dreizehn der neunzehn war die Datei schon zum Server unterwegs, während „Umwandeln“ noch unberührt auf der Seite stand.

iLoveIMG zeigte weiterhin *Compress IMAGES* und wartete auf den Start, obwohl 542,816 Bytes bereits an `api9.iloveimg.com` gegangen waren. Dasselbe geschah bei iLovePDF, PDF24, PDF Candy, Sejda, TinyPNG, jpg2pdf und den vier unten beschriebenen Plattform-Websites.

Dafür gibt es einen guten technischen Grund: Ein Upload während der Einstellungswahl lässt die Umwandlung nach dem Start sofort erscheinen. Diese Verbesserung entfernt jedoch unbemerkt einen Schritt, den viele Menschen erwarten. Dateiauswahl fühlt sich wie Öffnen an, „Umwandeln“ wie Versenden. Bei dreizehn von zwanzig Diensten ist beides derselbe frühere Moment.

Die konkrete Folge: Bei diesen dreizehn bemerken Sie eine falsch gewählte Datei — einen ungeschwärzten Entwurf, eine Gehaltsabrechnung oder ein noch zuzuschneidendes Foto — erst nach dem Versand.

## Die Ergebnisdatei liegt an einer öffentlichen Adresse

Vier Dienste geben einen gewöhnlichen Ergebnislink aus. Wir riefen alle vier per Kommandozeile erneut ab, ohne Cookies oder Sitzung, mit einem völlig anderen Programm. Alle vier lieferten die Datei.

- **Ezgif**: `s1.ezgif.com/tmp/…` lieferte 542,483 Bytes, unsere Testdatei Byte für Byte.
- **Aconvert**: `s6.aconvert.com/convert/…` lieferte ein PDF von 474,856 Bytes.
- **ResizePixel**: `resizepixel.com/Image/…` lieferte 432,111 Bytes.
- **IMGonline**: `srv2.imgonline.com.ua/result_img/…` lieferte ein JPEG von 128,179 Bytes.

Die geprüften Adressen enthielten schwer zu erratende Bestandteile. Wer eine davon kannte, konnte das Ergebnis zum Prüfzeitpunkt abrufen. Links können über Browserverlauf, Screenshots oder Nachrichten und, soweit die Seitenrichtlinie es erlaubt, über Referrer weitergegeben werden. HTTPS verbirgt den Pfad vor gewöhnlichen Netzwerkzwischenstellen; die Referrer-Richtlinie bestimmt, was eine spätere Website erhält. Die Beobachtung betrifft diese vier Links, nicht jede Downloadmethode eines Konverters.

Aconvert erklärt auf der Ergebnisseite ausdrücklich, dass Dateien höchstens zwei Stunden bleiben und nicht von anderen Websites verlinkt werden sollen. Das ist der passende Hinweis am richtigen Ort und Zeitpunkt. Von diesen vier Diensten gibt ihn nur Aconvert.

## Auch der Dateiname wird übertragen

Menschen denken bei Dateien an ihren Inhalt. Ein Konverter erhält mehr. Zwei der zwanzig machen diese zusätzlichen Angaben leicht sichtbar.

PDF Candy lud unsere Datei an eine Adresse mit dem Ende `/uploadcbc/1789652849416-abox-probe-9471.png`: Zeitstempel und ursprünglicher Dateiname direkt in der URL. ResizePixel lieferte die Vorschau ebenfalls über `/Image/<id>/Preview/abox-probe-9471.png`.

Unser Name `abox-probe-9471.png` verriet nichts. Echte Dateien heißen etwa `passport-scan.jpg`, `contract-signed-final.pdf` oder `scan-12wk.png`. Der Dateiname ist oft die aussagekräftigste einzelne Metadatenzeile. Die Adresse einer Anfrage wird zudem besonders lange protokolliert, zwischengespeichert und aufbewahrt, meist von mehr Stellen als die Datei selbst.

Dasselbe gilt für unsichtbare Informationen in der Datei. Ein Handyfoto enthält meist Aufnahmeort, Zeit, Kameraseriennummer und manchmal eine Vorschau des Bildes *vor* dem Zuschneiden. Unabhängig von der späteren Verarbeitung erhält der Konverter alles.

## Vier Namen, eine Plattform

Img2Go, Online-Convert, PDF2Go und Compress2Go wirken unabhängig. Unsere Datei ging an vier Hostnamen: `www21.img2go.com`, `www8.online-convert.com`, `www15.pdf2go.com` und `www6.compress2go.com`. Alle empfingen sie am gleichen Pfad:

```
/v2/dl/web7/upload-file/<uuid>
```

Gleicher Endpunkt, gleiches Uploadverhalten, gleiche Richtlinientexte und dieselben 72 Stunden Aufbewahrung. Es sind vier Eingänge zu einer Plattform. Die Richtlinien legen das offen, wenn man sie weit genug liest.

Das ist keine Kritik. Mehrere Marken auf einem Backend sind üblich und effizient. Es zählt nur, wenn Sie wegen Misstrauen zu einem anderen Konverter wechseln: Vielleicht haben Sie die Plattform nicht gewechselt. Eine andere Website ist nur dann eine Vorsichtsmaßnahme, wenn sie wirklich eine andere ist.

Ein kleiner verwandter Punkt: CloudConvert versendete unsere Datei an `eu-central.storage.cloudconvert.com`. Der Hostname nennt die Zielregion. Das ist mehr Information, als viele der übrigen Dienste irgendwo geben.

## Was die Richtlinien sagen und wie viel das beweist

Die Aufbewahrungsversprechen sind meist kurz, konkret und besser als der Ruf dieser Branche. Sie reichen von sofortiger Löschung nach der Umwandlung bei Online2PDF und zwanzig Minuten bei PicResize über zwei Stunden bei iLovePDF, iLoveIMG, PDF Candy und Aconvert bis zu 72 Stunden bei der vierteiligen Plattform.

Zwei fallen anders auf. **jpg2pdf.com** hat keine Datenschutzerklärung an der üblichen Adresse. Der einzige rechtliche Link auf der Startseite führt zu `/terms`. Dort steht unter „Terms and Privacy“ die Frist von einer Stunde. Ein ordentliches Versprechen an ungewohntem Ort. Bei **IMGonline** fanden wir gar keine Datenschutzerklärung: keinen Link auf der englischen Startseite, nichts an zwei üblichen Adressen und keine Angaben zu Speicherung oder Löschung auf der Werkzeugseite. Seine Ergebnisse sind dennoch wie oben beschrieben für jeden mit dem Link abrufbar.

Die Stundenzahl ist nicht die ganze Frage. **Liefert ein öffentlicher Ergebnislink die Datei nach Ablauf der genannten Frist weiterhin, kann das eine versäumte Löschung zeigen.** Ein abgelaufener Link beweist aber nicht, dass jede interne Kopie entfernt wurde. Sie sehen nicht, ob Sicherungen, Protokolle, Fehlerberichte mit dem Request-Body oder das zwischenspeichernde Inhaltsnetzwerk ebenfalls gelöscht wurden. Auch nach Verkauf oder Sicherheitsvorfall bleibt der Verbleib interner Kopien unsichtbar. Eine Aufbewahrungsrichtlinie beschreibt Absichten über Systeme, die Sie nicht prüfen können; ehrliche und unehrliche Versprechen können dieselben Wörter verwenden.

Deshalb ist ein Werkzeug sinnvoll, das die Datei gar nicht versenden kann. Es geht nicht um den Vorwurf, diese Unternehmen lügen. Ohne Upload gibt es in diesem Punkt nichts zu verheimlichen und kein Versprechen, auf das Sie angewiesen sind.

## Der Konverter ohne Upload

Squoosh, Googles Bildkompressor, nahm die Datei an, zeigte und komprimierte sie. **Dieser Test zeichnete keinen Datei-Upload auf.** Es wurden null Upload-Bytes berichtet, mit derselben Messung, die eine Minute vorher 542,566 versendete Bytes bei TinyPNG erfasste.

Dieser Eintrag ist die Kontrollprobe. Er zeigt, dass die Messung negativ ausfallen kann. Die neunzehn positiven Ergebnisse sind also kein unvermeidliches Artefakt der Methode. Er zeigt außerdem, dass dieselbe Aufgabe mit denselben Formaten im Browser ohne Server möglich ist. Die Annahme, Umwandlung müsse wegen ihrer Schwierigkeit einen Upload benötigen, stimmt hier nicht.

Viele Dienste laden Dateien hoch, weil sie so entwickelt wurden, als es nötig war, und weil Server Konten, Kontingente und Bezahltarife verwalten. Eine vollständig lokale Verarbeitung lässt sich schwer abrechnen.

## Was sich nicht messen ließ

Neun weitere versuchte Websites fehlen in der Tabelle: FreeConvert, Smallpdf, Zamzar, Optimizilla, Photopea, media.io, Bulk Resize Photos, png2jpg.com und SimpleImageResizer.

In acht Fällen lag die Grenze bei unserer Methode. Die Dateiauswahl reagierte nur auf echte Klicks und nahm keine per Skript gesetzte Datei an. Ohne Upload gab es nichts zu messen. **Das ist kein Ergebnis und darf nicht als eines gelesen werden**. Es beweist besonders nicht, dass diese acht Dateien lokal behalten. Der Test lief nicht.

SimpleImageResizer zeigt eine wichtige Methodenfalle. Sein Formular hat eine Dateiauswahl, aber `enctype="application/x-www-form-urlencoded"`. Der Browser sendet damit *nur den Dateinamen*, nicht die Bytes. Eine naive Messung, zunächst auch unsere, addiert den Formularinhalt und meldet einen nie erfolgten Upload von 1,085,210 Bytes. Wir entfernten den Eintrag, statt ihn zu veröffentlichen. Wer den Versuch wiederholt, sollte vor Formularmessungen das `enctype` prüfen.

## Prüfen Sie die Ergebnisse selbst

Die ursprünglichen Aufzeichnungen sind nicht verfügbar. Die historische Tabelle lässt sich daher nicht anhand der Rohrequests prüfen. Die Methode oben ermöglicht einen neuen Vergleich. Die schnellste Variante braucht keine besonderen Werkzeuge:

- **Trennen Sie die Verbindung.** Laden Sie das Werkzeug, schalten Sie WLAN aus und verwenden Sie es. Lokale Verarbeitung läuft weiter, Serververarbeitung stoppt. Keine Formulierung kann diesen Test ersetzen.
- **Netzwerk-Tab beobachten.** Öffnen Sie die Entwicklerwerkzeuge, wählen Sie Netzwerk, sortieren Sie nach Größe und benutzen Sie das Werkzeug. Prüfen Sie die Request-Nutzlasten, nicht nur die Spalte der übertragenen Größe, die häufig Antworten beschreibt. Vorschaubilder, Teiluploads und kodierte Dateien können anders groß sein. Sehen Sie auch *vor* dem Klick auf Umwandeln hin.
- **Lesen Sie `connect-src`.** Die `Content-Security-Policy` im Seitenquelltext listet erlaubte Kontaktadressen. Der Browser erzwingt sie unabhängig vom Code. Steht dort eine Adresse dieser Website, kann die Seite Ihre Datei dorthin schicken.

Die ausführliche Erklärung dieser drei Prüfungen und einer sinnvollen vierten steht in [Ist es sicher, Dateien an Onlinekonverter hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)

## Wie diese Website dieselbe Frage beantwortet

Der Quelltext dieser Seite ist eine andere Belegart als die historischen Messungen oben. Die aktuelle Umsetzung macht folgende Aussagen; prüfen Sie die verwendete Funktion mit den [vier Prüfungen](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/).

- **Offline.** Lokale Verarbeitung funktioniert mit geladenen Ressourcen und fertigem Cache. Bild-URLs, Onlinekurse und Browser-Vermittlung benötigen Verbindungen.
- **Anfragen.** Verarbeitungscode lädt ausgewählte Dateien nicht hoch. Seitenaufrufe und freiwillige feste Feedback-Antworten sind andere Anfragen. Kursabfragen enthalten Währungspaar und Datum; bewusste Peer-Funktionen senden Inhalte an den gewählten Browser. **Richtlinie.** Die meisten Werkzeuge übernehmen Plattformziele. Belege ergänzen Frankfurter, Teilen und Kamera die Vermittlung. Die Richtlinie begrenzt Ziele und beweist keine Nutzdaten.
- **Aufbewahrung.** abox.tools empfängt keine Dateien zur Verarbeitung und hat dafür keine Serverkopie zu löschen. Lokale Browserdaten, siebentägige Vermittlungsprotokolle und von Teilen- oder E-Mail-Empfängern behaltene Inhalte sind andere, auf der Datenschutzseite erklärte Wege.
- **Quelltext.** Der [Quelltext ist öffentlich](https://github.com/A-Box-of-Tools/website). Bauen und vergleichen Sie die Ausgabe. Gemeinsame Module und mitgelieferte Engines sind ebenfalls lesbar.

Die [Datenschutzseite](https://abox.tools/de/datenschutz/) erklärt die Grenzen: [Bild-URL-Import](https://abox.tools/de/bilder-in-video-umwandeln/), optionale [Belegkurse und App-Übergabe](https://abox.tools/de/belege-rechnungen-auslesen/), [Teilen zwischen Browsern](https://abox.tools/de/text-teilen/) und [Remote-Kamera](https://abox.tools/de/remote-camera/), dazu Werbung, Analytics und festes Feedback. Bewusstes Übertragen ist von einem Verarbeitungsupload zu unterscheiden.

Lokale Beispiele sind [Komprimieren auf eine Zielgröße hin](https://abox.tools/de/bild-komprimieren/), [Videos zuschneiden](https://abox.tools/de/video-zuschneiden/), [EXIF und GPS entfernen](https://abox.tools/de/exif-daten-entfernen/) und [Bilder zu PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/). Prüfen Sie Formatunterstützung und Ergebnis. Diese Aufgaben brauchen weder Verarbeitungsupload noch Konto.

## Diese Zahlen verwenden

Sie dürfen die Messungen zitieren und wiederholen. Die wesentlichen Angaben sind: zwanzig kostenlose Onlinekonverter, gemessen am 17. September 2026; neunzehn luden die Datei hoch; dreizehn davon vor dem Klick auf „Umwandeln“; vier von vier geprüften Ergebnisdateien waren ohne Sitzung über öffentliche Adressen abrufbar.

Ein Link zu dieser Seite ist willkommen, aber nicht erforderlich. Liefert eine Wiederholung andere Ergebnisse, hören wir das gern. Websites ändern sich; dies ist die Aufnahme eines Nachmittags. Über die [Kontaktseite](https://abox.tools/de/kontakt/) erreichen Sie uns. Korrekturen mit Bytezahlen werden hier veröffentlicht.
