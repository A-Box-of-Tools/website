# HEIC zu JPG — iPhone-Fotos umwandeln

Die Fotos, die ein iPhone macht, in einem Format, das jedes Programm öffnet.

> HEIC-Fotos vom iPhone im Browser in JPG umwandeln. Der Decoder läuft auf Ihrem eigenen Gerät: nichts wird hochgeladen, kein Konto, auch offline, und Datum und Kameradaten dürfen mitkommen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/heic-in-jpg-umwandeln/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Fotos werden **nie hochgeladen**. Es gibt keinen Server.

Das Dekodieren läuft in Ihrem eigenen Browser, auf Ihrer eigenen Hardware. HEIC ist das eine Bildformat, das ein Browser nicht von sich aus öffnet, also trägt diese Seite den Decoder mit sich: rund 1,4 MB, von hier ausgeliefert und nach dem ersten Besuch im Zwischenspeicher. Genau daran liegt es, dass jeder andere HEIC-Umwandler Sie zum Hochladen auffordert. Wer den Codec auf einen Server legt, muss Ihre Fotos zu ihm holen. Dieser hier legt den Codec stattdessen hierher. Eine Netzfunktion gibt es auf dieser Seite überhaupt nicht, und am anderen Ende stünde auch kein Server, an den ein Foto gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Größengrenze
- ✓ Funktioniert offline
- ✓ Quelloffen

## So wandeln Sie HEIC-Fotos in JPG um

1. **Wählen Sie Ihre HEIC-Fotos aus.** Ziehen Sie sie auf das Auswahlfeld oder suchen Sie sie von Hand heraus, direkt aus einem Telefon-Backup oder einem Ordner auf dem Schreibtisch. Der Browser liest sie von Ihrer Festplatte, und dabei geht nichts nach draußen. Die Liste sagt Ihnen, was jedes davon ist und was darin steckt.
2. **Sehen Sie nach, was die Fotos mit sich tragen.** Jede Zeile nennt das Aufnahmedatum, die Kamera und, in Grün, weil das der bemerkenswerte Teil ist, ob die Datei GPS-Koordinaten enthält. Gelesen wird das aus dem Container, ohne das Bild zu dekodieren, es kostet also nichts und erscheint sofort.
3. **Wählen Sie ein Format und entscheiden Sie über die Details.** Nehmen Sie JPEG, solange Sie keinen Grund für etwas anderes haben, denn es ist das Format, das überall aufgeht, und genau darum geht es beim Umwandeln. Der Qualitätsregler steht auf 92, also dort, wo eine Fotografie vom Original kaum zu unterscheiden ist. Das Häkchen entscheidet, ob Datum, Kamera und Ort mitkommen.
4. **Klicken Sie auf „Umwandeln“ und laden Sie herunter.** Bei der ersten Umwandlung trifft der Decoder ein, rund 1,4 MB und nur dieses eine Mal. Jedes Foto danach wird auf Ihrem eigenen Gerät dekodiert und geschrieben. Bei einer Datei bekommen Sie eine Download-Schaltfläche, bei mehreren zusätzlich ein ZIP.

## Die ausführliche Fassung

[Das Foto, das Ihr Handy gespeichert hat, und das Format, das niemand öffnet](https://abox.tools/de/ratgeber/heic-in-jpg-umwandeln/): iPhones speichern Fotos als HEIC, und das halbe Internet bekommt keines auf. Was hinter dem Format steckt, warum nur Safari es dekodiert, was die Umwandlung das Bild kostet und wie sie ohne Upload gelingt.

## Auch im Werkzeugkasten

- [Passbild-Ersteller](https://abox.tools/de/biometrisches-passbild/): Land auswählen. Es wendet genau die Vorschrift dieses Landes an.
- [Bild-Stacker](https://abox.tools/de/bilder-stacken/): Zwanzig Aufnahmen werden eine, ohne zwanzig Uploads und ohne RAW-Konverter.
- [Bild-Schwärzer](https://abox.tools/de/bild-schwaerzen/): Was Sie abdecken, wird aus der Datei gelöscht und nicht darin versteckt.
- [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/): Sehen, was ein Foto über Sie verrät. Und es dann herausnehmen.

## Fragen

### Wird mein Foto irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, dekodiert und schreibt die Datei auf Ihrer eigenen Hardware. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns. Das eine, was tatsächlich lädt, ist der Decoder selbst, und der kommt von dieser Seite, einmal, bevor Ihr Foto überhaupt beteiligt ist.

### Warum lädt diese Seite beim ersten Mal 1,4 MB herunter?

Weil HEIC das eine Bildformat ist, das ein Browser nicht öffnet. Es ist ein HEVC-Einzelbild in einem Box-Container, und nur Safari hat auf Apple-Hardware einen Decoder dafür. Chrome, Firefox und Edge weisen die Datei schlicht ab. Ein HEIC-Umwandler braucht seinen Decoder also irgendwoher, und dafür kommen zwei Orte in Frage: ein Server oder die Seite. Alle anderen Umwandler haben den Server gewählt, und deshalb brauchen sie Ihre Fotos hochgeladen. Dieser trägt stattdessen `libheif` mit sich, nach WebAssembly kompiliert. Es kommt von dieser Seite, liegt nach dem ersten Besuch im Zwischenspeicher, und es ist der ganze Preis dafür, dass Ihre Fotos nirgendwohin gehen.

### Behält das JPEG Datum, Kamera und Ort?

Wenn Sie wollen, es ist ein Häkchen auf der Seite. Bleibt es gesetzt, wird der EXIF-Block aus dem HEIC herauskopiert und genau so ins JPEG geschrieben, wie das Telefon ihn geschrieben hat. Das umgewandelte Foto sortiert sich damit weiter nach dem Aufnahmetag statt nach dem Tag der Umwandlung, und genau darüber wird bei HEIC-Umwandlern am häufigsten geklagt. Geändert wird genau ein Tag, nämlich die Orientierung, die auf „aufrecht“ gesetzt wird. Die Drehung steckt bereits in den Pixeln, und ein Betrachter, der sie noch einmal anwendete, legte jedes Hochformatfoto auf die Seite. Nehmen Sie das Häkchen heraus, kommt das JPEG mit dem Bild und sonst nichts heraus.

### Entfernt es GPS-Koordinaten?

Es sagt Ihnen, dass sie da sind, und tut dann, worum Sie bitten. Schon bevor irgendetwas umgewandelt wird, verrät die Zeile zu jedem Foto, ob die Datei Koordinaten trägt, und das ist mehr, als das Telefon tut. Nehmen Sie das Häkchen bei „Datum, Kamera und Einstellungen behalten“ heraus, bleiben sie samt allem anderen aus dem JPEG, lassen Sie es gesetzt, kommen sie mit. Wollen Sie die Tags im Detail durchsehen oder sie aus Fotos entfernen, die schon JPEGs sind, ist der [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/) das Werkzeug dafür, und der schafft es sogar, ohne das Bild neu zu komprimieren.

### Wird das Bild neu komprimiert?

Ja, und das muss es auch. HEIC und JPEG sind verschiedene Codecs, es gibt also keinen Weg vom einen zum anderen, ohne das Bild zu dekodieren und erneut zu kodieren. Was das kostet, steuern Sie selbst. Der Qualitätsregler steht standardmäßig auf 92, wo eine Fotografie vom Original sehr schwer zu unterscheiden ist, und PNG steht für den Fall im Menü, dass Sie überhaupt keinen Verlust wollen und Ihnen eine fünf- bis zehnmal so große Datei nichts ausmacht.

### Was, wenn die Datei .jpg heißt, aber in Wahrheit ein HEIC ist?

Dann geht es trotzdem. Jede hier abgelegte Datei wird an ihren ersten Bytes erkannt und nicht an ihrem Namen, denn der Name ist bloß das, wofür sich die zuletzt beteiligte App entschieden hat. Ein HEIC, das als „.jpg“ ankam, ist ohnehin einer der häufigsten Gründe, warum Menschen nach einem Werkzeug wie diesem suchen. Eine Datei, die wirklich ein JPEG oder ein PNG ist, wird mit einer entsprechenden Meldung abgelehnt, statt in eine Kopie ihrer selbst umgewandelt zu werden.

### Kann es ein Live Photo oder eine Serienaufnahme umwandeln?

Die Standbilder darin, ja. Ein HEIC kann mehr als ein Bild halten, und jedes davon wird umgewandelt und nach dem Original mit einer angehängten Nummer benannt. Die Videohälfte eines Live Photos ist eine eigene Datei, die das Telefon neben dem HEIC aufbewahrt, sie liegt hier also gar nicht zum Umwandeln vor. Tiefenkarten und Vorschaubilder stecken zwar im Container, sind aber keine Bilder, um die jemand gebeten hätte, und bleiben unangetastet.

### Warum nimmt es mein AVIF nicht?

Weil es damit nichts zu tun gäbe. AVIF ist derselbe Container wie HEIC, nur mit AV1 statt HEVC darin, und jeder aktuelle Browser dekodiert eines von Haus aus. Ein Umwandler lieferte also ein Megabyte Engine aus, um ein Problem zu lösen, das Sie gar nicht haben. Brauchen Sie ein AVIF als JPEG, lesen der [Bildkompressor](https://abox.tools/de/bild-komprimieren/) und der [Bildskalierer](https://abox.tools/de/bildgroesse-aendern/) beide AVIF und schreiben JPEG, und zwar mit dem Decoder, den Ihr Browser ohnehin hat.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Auch bei Anzahl und Größe der Dateien gibt es keine Grenze, denn es zahlt kein Server dafür. Die Arbeit passiert auf Ihrem eigenen Gerät. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Fotos übergeben.

### Funktioniert es offline?

Ja, Decoder inklusive. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet an Ihren Fotos genau wie vorher weiter. Das ist zugleich der stärkste Beweis, der sich dafür führen lässt, dass nichts hochgeladen wird. Ein Umwandler, der Ihre HEICs zum Dekodieren wegschickte, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen. Dieser bleibt es nicht.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Fotos haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien landen könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Der Decoder kam von hier, und er geht nirgendwohin.** HEIC ist HEVC in einem Box-Format, und außer Safari dekodiert es kein Browser. Deshalb liefert diese Seite `libheif` mit aus, nach WebAssembly kompiliert: rund 1,4 MB, in dieses Repository eingecheckt, von dieser Domain ausgeliefert und vom Service Worker zwischengespeichert wie jede andere Datei hier. Von einem CDN wird nichts geholt, denn das setzte einen Dritten in den Weg jedes Besuchs und nähme dem Werkzeug die Offline-Fähigkeit. Dass die Binärdatei im Skript steckt statt daneben, hat genau einen Grund: So braucht es zum Starten keinen einzigen Abruf.
- **Nichts hier ruft etwas ab.** Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` in irgendeiner Datei, die für dieses Werkzeug geschrieben wurde. Die mitgelieferte Engine enthält, wie jeder Emscripten-Build, die Ladepfade, die eine `.wasm` von einer URL holen würden. Genommen wird keiner davon, weil die Binärdatei schon zur Hand ist. Und würde doch einer genommen, nennt `connect-src` Googles Messendpunkte und sonst nichts, der Browser wiese ihn also ab. Die Richtlinie ist der Beweis, nicht das Versprechen.
- **Die Metadaten werden hier gelesen und Ihnen gezeigt.** Die Liste auf der Seite sagt, was jedes Foto mit sich trägt, also das Datum, die Kamera und ob GPS-Koordinaten darin stehen. Das wollen Sie vielleicht wissen, bevor Sie das JPEG jemandem geben. Gelesen wird es von `src/boxes.js` in diesem Browser aus der Datei, auf dieser Seite angezeigt und in Ihr JPEG geschrieben oder weggelassen, ganz wie Sie es wählen. In diesem Repository gibt es kein eigenes Analytics-Ereignis, das einen Dateinamen, ein Datum, eine Koordinate oder eine Anzahl mitführt.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird irgendetwas über Ihre Fotos übergeben. Jede Zeile, die eine Datei liest, dekodiert oder schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Laden Sie die Seite einmal und trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, denn der Decoder liegt mit ihr im Zwischenspeicher. Das ist der einfachste Beweis von allen und hier ein stärkerer als irgendwo sonst auf dieser Seite: Ein Umwandler, der Ihre Fotos zum Dekodieren wegschickte, brächte das unmöglich fertig.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/heif.js` dafür, wie der Decoder geladen wird und was er darf, `src/boxes.js` für das Zerlegen des Containers, das die Metadaten des Fotos findet, und `src/exif.js` dafür, was mit diesen Metadaten auf dem Weg in ein JPEG geschieht. Die Engine selbst ist `vendor/libheif.js`, unverändert, mit ihrer Lizenz daneben.
