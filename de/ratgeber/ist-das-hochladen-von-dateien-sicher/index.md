# Ist es sicher, Dateien zu Online-Konvertern hochzuladen?

Ehrlich beantwortet lautet sie meist: „Vermutlich schon, nachprüfen können Sie es allerdings nicht.“ Hier steht, was beim Hochladen wirklich mit Ihrer Datei passiert, warum die meisten Werkzeuge trotzdem darauf bestehen und mit welchen vier Proben Sie herausfinden, ob das Werkzeug vor Ihnen den Upload überhaupt braucht.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Bei den meisten Dateien ist Hochladen meistens unbedenklich. Seriöse Konverter löschen, was Sie schicken, binnen weniger Stunden und haben an Ihren Urlaubsfotos nicht das geringste Interesse.

Das Problem ist nicht, dass sie lügen könnten, sondern dass **Sie es nicht feststellen können**. Sobald eine Datei Ihr Gerät verlässt, gilt jede Zusage über das, was danach kommt, auf Treu und Glauben: wie lange sie liegen bleibt, wer an sie herankommt, ob sie in einem Backup gelandet ist, das die Löschfrist überdauert, was mit ihr geschieht, wenn die Firma verkauft oder gehackt wird. Von außen ist davon nichts zu sehen.

Die brauchbare Frage lautet deshalb nicht „Vertraue ich dieser Seite?“, sondern: **„Muss meine Datei für diese Aufgabe überhaupt außer Haus?“** Bei immer mehr Aufgaben lautet die Antwort nein, und dann stellt sich die Vertrauensfrage gar nicht mehr.

## Was beim Hochladen tatsächlich passiert

Wenn ein Konverter Sie eine Datei auswählen lässt und dann einen Fortschrittsbalken zeigt, kopiert Ihr Browser die ganze Datei Byte für Byte übers Internet auf einen Rechner, der jemand anderem gehört. Der schreibt sie auf eine Festplatte, führt die Umwandlung aus, legt das Ergebnis auf dieselbe Festplatte und reicht Ihnen einen Link.

In diesem Moment liegt Ihre Datei an mindestens drei Orten, die Sie sich nicht ausgesucht haben: auf der Festplatte des Servers, in den Protokollen, die die Anfrage festgehalten haben, und häufig in einem Content Delivery Network, das das Ergebnis für einen schnellen Download zwischengespeichert hat. Eine Löschregel muss alle drei erreichen. Die meisten Anbieter versichern, dass sie das tut. Nachsehen können Sie an keinem der drei Orte.

Und die Datei ist nicht das Einzige, was ankommt. Der Dateiname reist mit, und mit ihm alles, was in der Datei steckt, ohne dass Sie es sehen. Ein Foto direkt aus dem Handy trägt in aller Regel die genauen GPS-Koordinaten des Aufnahmeorts mit sich, die Uhrzeit, die Seriennummer der Kamera und mitunter ein eingebettetes Vorschaubild, das noch den Zustand vor Ihrem Zuschnitt zeigt. Wer aufs Bild achtet, achtet darauf meist nicht, denn auf dem Bildschirm ist nichts davon zu sehen.

## Warum die meisten Werkzeuge trotzdem hochladen

Nicht, weil sie es auf Ihre Dateien abgesehen hätten, sondern weil es den größten Teil der Web-Geschichte über keine Alternative gab. Ein Browser konnte kein Video dekodieren, kein Bild in einer gewünschten Qualität neu kodieren und kein Dateiformat zerlegen; ein Server mit FFmpeg und ImageMagick konnte das alles. Hochladen war kein Geschäftsmodell, es war schlicht der einzige Ort, an dem die Arbeit stattfinden konnte.

Das hat vor Kurzem und ziemlich unbemerkt aufgehört zu stimmen. Browser bringen heute WebAssembly mit, das dieselben kompilierten Codecs beinahe in nativer Geschwindigkeit ausführt, dazu WebCodecs, das den Hardware-Video-Encoder zugänglich macht, der ohnehin in Ihrem Gerät sitzt, und eine Canvas-API, die Bilder direkt dekodieren und neu kodieren kann. Die Arbeit, für die früher ein Server nötig war, läuft heute auf dem Gerät, das die Datei ohnehin hat.

Viele Werkzeuge laden dennoch hoch, und dafür gibt es ehrliche Gründe: eine gewachsene Verarbeitungskette, die niemand neu schreiben will, ein Format, für das es im Browser keinen Decoder gibt, eine Aufgabe, die einem Handy tatsächlich zu schwer ist. Es gibt auch einen weniger ehrlichen Grund. Auf dem Server wohnen Konten, Kontingente und Bezahlstufen, und ein Werkzeug, das vollständig in Ihrem Browser läuft, lässt sich schlecht abrechnen.

## Vier Proben, die Sie selbst machen können

Sie funktionieren bei jedem Werkzeug, dieses eingeschlossen. Für keine davon müssen Sie irgendjemandem etwas glauben, und die erste ist in zehn Sekunden erledigt.

### 1. Ziehen Sie den Stecker

Laden Sie die Seite, schalten Sie dann das WLAN ab oder ziehen Sie das Kabel, und versuchen Sie, das Werkzeug zu benutzen. Eines, das seine Arbeit in Ihrem Browser erledigt, macht genauso weiter wie zuvor. Eines, das hochlädt, bleibt auf der Stelle stehen, weil das, was die Arbeit tut, nicht mehr erreichbar ist.

Das ist die stärkste Probe, die es gibt, und die am schwersten zu fälschende, weil sich mit Formulierungen nichts daran drehen lässt. Entweder läuft die Umwandlung ohne Netz durch, oder sie tut es nicht.

### 2. Beobachten Sie den Netzwerk-Tab

Entwicklerwerkzeuge des Browsers öffnen, auf „Netzwerk“ wechseln, dann das Werkzeug benutzen. Jede Anfrage, die die Seite stellt, steht dort mit ihrer Größe. Wurde Ihr 4 MB großes Foto hochgeladen, finden Sie in dieser Liste eine Anfrage über 4 MB. Ist das Größte, was die Seite verlässt, ein paar Kilobyte Werbung, wurde es das nicht.

Sortieren Sie nach Größe und schauen Sie sich nur die obersten Zeilen an. Verstehen müssen Sie die Anfragen nicht, Sie müssen bloß merken, ob eine davon so groß ist wie Ihre Datei.

### 3. Lesen Sie die Content-Security-Policy

Quelltext der Seite ansehen und weiter oben nach `Content-Security-Policy` suchen. Dort steht, welche Adressen diese Seite überhaupt kontaktieren darf, und durchgesetzt wird das von Ihrem Browser und nicht von den guten Absichten des Anbieters. Eine Anfrage an etwas, das nicht auf der Liste steht, wird abgewiesen, was der Code auch versuchen mag.

Entscheidend ist die Direktive `connect-src`; sie regelt, wohin die Seite Daten senden darf. Steht dort eine Adresse, die zu der Seite gehört, auf der Sie gerade sind, kann die Seite Ihre Datei dorthin schicken. Steht dort gar nichts oder nur Dritte wie ein Werbenetzwerk, kann sie es nicht.

Eine Seite ganz ohne Content-Security-Policy ist noch kein Hinweis auf etwas Schlechtes. Sie heißt nur, dass ausgerechnet diese Probe Ihnen nichts verrät.

### 4. Lesen Sie den Code

Am unbequemsten, dafür am eindeutigsten. Veröffentlicht ein Werkzeug seinen Quelltext und liefert ihn ohne Build-Schritt aus, sind die Dateien, die Ihr Browser geholt hat, genau die Dateien, die Sie lesen können. Suchen Sie darin nach `fetch`, `XMLHttpRequest` und `sendBeacon`, denn das sind die drei Wege, auf denen eine Seite überhaupt etwas hinausschicken kann, und sehen Sie nach, was ihnen übergeben wird.

Die wenigsten werden sich diese Mühe machen. Dass es möglich ist, zählt trotzdem, denn eine Behauptung, die niemand nachprüfen kann, ist keine richtige Behauptung.

## Was „läuft in Ihrem Browser“ nicht bedeutet

Hier lohnt sich Genauigkeit, weil die Formulierung reichlich lose verwendet wird und weil diese Seite sich an denselben Maßstab halten muss, den sie anlegt.

- **Es heißt nicht: überhaupt keine Anfragen.** Die Seite selbst kam übers Netz, und die meisten kostenlosen Werkzeuge tragen Werbung oder Messung, die mit irgendjemandem spricht. Die Zusage betrifft Ihre *Datei* und nicht den Datenverkehr im Allgemeinen.
- **Es verbirgt Ihre IP-Adresse nicht.** Die sieht jede Seite, die Sie besuchen, diese eingeschlossen. Bei lokaler Verarbeitung geht es um den Inhalt Ihrer Dateien, nicht um Anonymität.
- **Eine Funktion, die etwas abruft, hebt es auf.** Ein Werkzeug, in das Sie eine Webadresse einfügen können, muss diese Adresse kontaktieren, und der Server dahinter erfährt Ihre IP und was Sie angefordert haben. Das gehört zur Funktion und ist kein Fehler darin. Eine echte Ausnahme bleibt es trotzdem, und ein Werkzeug sollte sie deutlich aussprechen, statt sie unter den Tisch fallen zu lassen.
- **Es ist nicht dasselbe wie „wir löschen Ihre Dateien“.** Der zweite Satz handelt davon, wozu eine Firma sich entschließt. Der erste davon, was technisch überhaupt möglich ist. Nachprüfbar ist nur einer von beiden.

## Wann Hochladen völlig in Ordnung ist

Das hier ist kein Plädoyer dafür, dass jeder Upload ein Fehler wäre. Schicken Sie die Datei ruhig, wenn der Inhalt nicht heikel ist und die Aufgabe so leichter geht, wenn die Arbeit Ihrem Gerät wirklich zu schwer ist, wenn es für das Format im Browser keinen Decoder gibt, oder wenn Sie einen Dienst nutzen, zu dem Sie ohnehin eine Beziehung haben und dessen Bedingungen Sie tatsächlich gelesen haben.

Vorsichtiger sollten Sie werden, sobald in der Datei etwas steckt, das Sie nicht öffentlich posten würden: Ausweispapiere, medizinische Aufnahmen, Verträge, alles mit einer Anschrift oder einem Gesicht, das Sie nicht herzeigen wollten, oder ein Foto, in dessen Ortsdaten Sie nie hineingesehen haben. In solchen Fällen ist ein Werkzeug, das Sie prüfen können, einem vorzuziehen, dem Sie vertrauen müssen. Nicht, weil das vertrauenswürdige Sie wahrscheinlich hinterginge, sondern weil sich beim nachprüfbaren die Frage gar nicht erst stellt.

## Wie diese Seite die vier Proben besteht

Es wäre ein merkwürdiger Ratgeber, der Ihnen zum Prüfen rät und dann um eine Ausnahme für sich selbst bittet. Also der Reihe nach:

- **Stecker ziehen.** Öffnen Sie hier irgendein Werkzeug und trennen Sie die Verbindung, es arbeitet weiter. Jede Werkzeugseite hat eine Anzeige, die laufend meldet, ob Sie gerade online sind, Sie können also zusehen, wie sie umspringt.
- **Netzwerk-Tab.** Wandeln Sie etwas um und lesen Sie die Liste. Nichts darin trägt Ihre Datei, ein Vorschaubild davon, ihren Namen, ihre Größe oder irgendetwas, was daraus gelesen wurde. Auf dieser Seite gibt es kein eigenes Analytics-Ereignis, das davon etwas zu senden hätte.
- **Content-Security-Policy.** Sie steht oben im Quelltext jeder Seite. `connect-src` nennt Googles Werbe- und Messendpunkte sowie den Spenden-Button, und sonst nichts. **Keine einzige Adresse auf dieser Liste gehört uns**, denn diese Seite hat keinen Server, sondern besteht aus statischen Dateien. Es gibt schlicht keinen Ort, an den eine Datei gehen könnte, selbst wenn etwas es versuchte.
- **Code.** Jede Zeile ist [öffentlich](https://github.com/A-Box-of-Tools/website). Der Build entfernt Kommentare und Leerraum und sonst nichts. Sie können ihn selbst ausführen und das Ergebnis mit dem vergleichen, was hier ausgeliefert wird.

Die Ausnahmen, ausgesprochen statt vergraben: Diese Seite trägt Google-Werbung und einen Besuchszähler; beide sprechen mit Google, und beiden wird nichts über Ihre Dateien übergeben. Und das Werkzeug [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/) kann ein Bild von einer Adresse holen, die Sie einfügen, und der Server dahinter sieht dabei Ihre IP. Die [Datenschutzseite](https://abox.tools/de/datenschutz/) legt beides vollständig offen.

Nach demselben Muster arbeitet jedes Werkzeug hier: der [Bildkompressor](https://abox.tools/de/bild-komprimieren/), der eine von Ihnen genannte Größe trifft, der [Video-Zuschneider](https://abox.tools/de/video-zuschneiden/), der [EXIF-Betrachter und -Entferner](https://abox.tools/de/exif-daten-entfernen/) für die weiter oben beschriebenen versteckten Daten, [Bilder in Video](https://abox.tools/de/bilder-in-video-umwandeln/) und [Bilder in PDF](https://abox.tools/de/bilder-in-pdf-umwandeln/). Alles kostenlos und ohne Konto, und keines davon hat einen Ort, an den es Ihre Dateien überhaupt schicken könnte.

![Das Feld auf einer Werkzeugseite: eine Zeile, dass die Dateien den Browser nie verlassen, die Belege dafür und eine Live-Prüfung, die meldet, dass die Seite keine Anfragen gestellt hat.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

Die letzte der vier Prüfungen, auf der Seite beantwortet statt in einem Absatz: Die Zählung stellt die Seite über sich selbst an, und Sie können dieselbe Zählung in Ihrem eigenen Browser machen.
