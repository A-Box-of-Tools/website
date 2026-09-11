# Bild als Data-URI — ein Bild für CSS oder HTML base64-kodieren

Das ganze Bild als eine Zeile Text. Direkt in CSS oder HTML einfügen.

> Ein PNG, JPEG, SVG oder WebP in eine Data-URI verwandeln, die Sie in CSS oder HTML einfügen können. SVGs werden prozentkodiert statt base64-kodiert, bleiben also lesbar und kürzer. Läuft im Browser, nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/bild-als-base64/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder werden **nie hochgeladen**. Es gibt keinen Server.

Die Kodierung läuft in Ihrem eigenen Browser, auf Ihrer eigenen Hardware. Sie ist Rechnerei auf Bytes, die die Seite ohnehin hat, ohne Encoder, ohne Server und ohne einen Schritt über das Netz, den man weglassen könnte. Netzfunktionen hat dieses Werkzeug keine, weder zum Abrufen noch zum Senden. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Bild gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Keine Neukodierung
- ✓ Funktioniert offline
- ✓ Quelloffen

## So verwandeln Sie ein Bild in eine Data-URI

1. **Wählen Sie Ihre Bilder aus.** Ziehen Sie sie auf das Auswahlfeld oder suchen Sie sie von Hand heraus. Der Browser liest sie direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Sagen Sie, wohin das Ergebnis geht.** Zur Wahl stehen die URI für sich, eine CSS-Regel, eine Custom Property, ein `<img>`-Element oder Markdown. Jede davon setzt die URI in Anführungszeichen, und genau dieses Detail entscheidet, ob ein eingebettetes SVG funktioniert oder stillschweigend nicht.
3. **Lesen Sie, was es gekostet hat.** Jedes Ergebnis sagt, aus wie vielen Zeichen es geworden ist, um wie viel größer das als die Datei ist und ob sich das Einbetten in dieser Größe überhaupt lohnt. Base64 legt ein Drittel drauf. Ob dieses Drittel eine gesparte Anfrage wert ist, hängt ganz an der Größe, und deshalb sagt Ihnen die Seite, auf welcher Seite der Grenze Sie stehen.
4. **Achten Sie auf die Warnungen.** Trägt das Bild EXIF, ein Farbprofil oder XMP, wird das benannt, samt der Zahl der Bytes Ihres Ergebnisses, die darauf entfallen. Widerspricht die Dateiendung dem tatsächlichen Format, nimmt die Seite das Format und sagt es Ihnen. Kann Ihr Browser das Ergebnis nicht zeichnen, sagt sie auch das.
5. **Kopieren oder herunterladen.** Eine Schaltfläche je Ergebnis und eine für alle auf einmal. Die Custom Properties kommen fertig in einen `:root`-Block gewickelt heraus, bereit zum Einfügen oben in ein Stylesheet.

## Die ausführliche Fassung

[Wann ein Bild in Ihr CSS gehört und wann nicht](https://abox.tools/de/ratgeber/bild-in-css-einbetten/): Was eine Data-URI kostet, warum Base64 ein Drittel drauflegt und gzip es nicht zurückgibt, warum ein SVG nie base64 sein sollte und welcher Anführungszeichen-Fehler eingebettete SVGs klammheimlich zerlegt.

## Auch im Werkzeugkasten

- [SVG zu Bild](https://abox.tools/de/svg-in-png-umwandeln/): Nennen Sie die Größe. Ein Vektor hat keine eigene, die er verlieren könnte.
- [Bild zu SVG](https://abox.tools/de/bild-in-svg-umwandeln/): Eine Form, eine Kontur. Zeigen Sie auf das, was nicht hineingehört.
- [Größenvergleich](https://abox.tools/de/groessenvergleich-erstellen/): Größen eintippen, Bild mitnehmen. Zum Zeichnen wird nichts verschickt.
- [Bildkompressor](https://abox.tools/de/bild-komprimieren/): Sie nennen die Größe. Den Rest rechnet es aus.

## Fragen

### Wird mein Bild irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest und kodiert die Datei auf Ihrer eigenen Hardware, mit zwei Funktionen, die er ohnehin hat. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns.

### Was ist eine Data-URI?

Eine Art, eine ganze Datei dorthin zu schreiben, wo sonst eine Webadresse stünde. Statt `url("logo.png")`, was den Browser losschickt, etwas zu holen, schreiben Sie `url("data:image/png;base64,iVBORw0...")`, worin das Bild selbst steckt. Der Browser dekodiert es an Ort und Stelle. In der Praxis heißt das eine Anfrage weniger, denn das Bild kommt mit dem Stylesheet oder der Seite an statt danach.

### Warum ist mein SVG nicht base64?

Weil Base64 dafür die falsche Kodierung ist. Ein SVG ist Text, und Text kann eine URL ohnehin tragen, maskiert werden muss nur eine Handvoll Zeichen. Genau die prozentzukodieren und den Rest in Ruhe zu lassen ergibt eine URI, die typischerweise ein Fünftel kürzer ausfällt als das Base64 derselben Datei und die Sie in Ihrem Stylesheet noch lesen können. Die Elementnamen, die Farben und die `viewBox` stehen alle noch da und lassen sich bearbeiten. Für die seltene Werkzeugkette, die darauf besteht, gibt es ein Häkchen, das Base64 erzwingt.

### Wie viel größer macht Base64 mein Bild?

Um etwa ein Drittel. Aus drei Bytes Datei werden vier Zeichen Base64, also 33 % noch vor dem `data:image/png;base64,` davor. Das ist die Untergrenze und unvermeidlich, denn so viel kostet es, beliebige Bytes mit nur den Zeichen zu schreiben, die eine URL erlaubt. Deshalb stellt die Seite die Zeichenzahl auch gleich neben die Dateigröße, statt Sie das herausfinden zu lassen, wenn das Stylesheet schon ausgeliefert ist.

### Wann ist es tatsächlich eine gute Idee, ein Bild einzubetten?

Wenn es klein ist und sofort gebraucht wird. Ein 2 KB großes Symbol in einem Stylesheet, das jede Seite lädt, ist ein klarer Gewinn: eine Rundreise weniger, und das Bild ist da, sobald das CSS da ist. Ab etwa 10 KB kippt der Handel. Ein eingebettetes Bild ist keine eigene Datei mehr, kann also nicht für sich zwischengespeichert und nicht parallel zu etwas anderem geholt werden, und es wird jedes Mal vollständig neu geladen, wenn sich die Datei drumherum ändert. Eine 200 KB große Fotografie in einem Stylesheet sind 200 KB zusätzlich auf dem kritischen Pfad jeder Seite der Website. Auf welche Seite dieser Grenze ein Ergebnis fällt, sagt Ihnen die Seite.

### Macht gzip den Base64-Aufschlag wieder wett?

Weniger, als man denkt. Base64 einer bereits komprimierten Datei komprimiert schlecht, weil dem Kompressor kaum noch Redundanz bleibt, und ein PNG, ein JPEG und ein WebP sind alle bereits komprimiert. Zurück bekommen Sie typischerweise etwa ein Zehntel des Drittels, das Base64 hinzugefügt hat, und nicht das Ganze. Ein prozentkodiertes SVG liegt genau andersherum. Es bleibt Text und komprimiert sich damit ungefähr so gut wie vorher, was ein weiterer Grund ist, keines zu base64-kodieren.

### Ändert das mein Bild überhaupt?

Nein, und darin unterscheidet es sich bewusst von den meisten Werkzeugen hier. Es wird nichts zu Pixeln dekodiert und erneut kodiert. Die Bytes, die von Ihrer Festplatte kamen, sind die Bytes, die in die URI gehen. Ein JPEG bleibt exakt das JPEG, das es war, in derselben Qualität und mit denselben Abmessungen. Deshalb lässt sich das Ergebnis als dieselbe Datei beschreiben und nicht bloß als Kopie davon.

### Dann gehen meine EXIF- und GPS-Daten also auch ins Stylesheet?

Ja, und darüber sollten Sie vor dem Einfügen nachdenken. Weil nichts neu kodiert wird, reist alles mit, was die Kamera geschrieben hat: der Ort, der Zeitstempel, die Seriennummer der Kamera. Bei einem Handyfoto können das 30 KB der Datei sein, aus denen 40 KB Base64 auf dem kritischen Pfad Ihrer Seite werden, und obendrein eine Wohnanschrift in etwas, das in ein Repository eingecheckt wird. Wie viele Metadaten in einem JPEG, PNG oder WebP stecken, liest die Seite und sagt es Ihnen. Herausnehmen lassen sie sich vorher mit dem [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/).

### Warum hat es einen anderen Typ genommen als die Endung meiner Datei?

Weil die Endung falsch sein kann und die Bytes nicht. Eine Datei namens `logo.png`, die in Wahrheit als JPEG exportiert wurde, kommt oft genug vor, dass jedes Bildwerkzeug damit umgehen muss. Eine Data-URI mit dem falschen Typ erscheint dagegen schlicht nicht, ohne Rückfalloption und ohne lesenswerte Fehlermeldung. Gelesen wird der Typ deshalb aus den ersten Bytes der Datei, die in jedem Format hier eindeutig sagen, was sie ist, und wenn beides sich widerspricht, sagt es Ihnen die Seite.

### Die Vorschau ist leer. Was ist schiefgegangen?

An der URI vermutlich nichts. HEIC und TIFF ergeben beide vollkommen gültige Data-URIs, die außer Safari kein Browser zeichnet, und damit fehlt das Bild auch überall dort, wo Sie sie einfügen. Wandeln Sie es zuerst mit dem [Bildkompressor](https://abox.tools/de/bild-komprimieren/) oder dem [Bildskalierer](https://abox.tools/de/bildgroesse-aendern/) nach PNG, JPEG oder WebP um. Ist das Format ein ganz gewöhnliches, ist wahrscheinlich die Datei selbst beschädigt. Die Vorschau wird ja aus der URI gezeichnet, die diese Seite gebaut hat, und eine leere heißt deshalb, dass das Bild gar nicht dekodiert hat.

### Gibt es eine Größengrenze für eine Data-URI?

Keine, der Sie in CSS oder in einem `<img>`-Element begegnen, denn moderne Browser setzen dort keine praktische Grenze. Begrenzt wird das Eintippen einer Data-URI in die Adressleiste, was die meisten Browser inzwischen für alles Nichttriviale verweigern, aus Sicherheitsgründen, die mit dieser Verwendung nichts zu tun haben. Die echte Grenze ist die von oben: Lange bevor irgendetwas Technisches bricht, ist die Seite, in der es steckt, langsamer geworden, als sie mit einer gewöhnlichen Bilddatei gewesen wäre.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase und kein Wasserzeichen. Auch bei Anzahl und Größe der Dateien gibt es keine Grenze, denn es zahlt kein Server dafür. Die Arbeit passiert auf Ihrem eigenen Gerät. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Bilder übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Bilder zum Kodieren wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Bilder haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien landen könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`. Kodiert wird mit `btoa` und `encodeURIComponent`, zwei Funktionen, die der Browser seit Anbeginn hat. Beide nehmen Bytes und geben Text zurück, ohne dabei irgendwohin zu gehen.
- **Die Vorschau ist der Beweis.** Das Bild neben jedem Ergebnis wird aus der Data-URI gezeichnet, die diese Seite eben gebaut hat, und nicht aus Ihrer Datei. Es erscheint, weil die URI stimmt, auf Ihrem Gerät und ohne jeden beteiligten Server. Erscheint es nicht, sagt die Seite das, statt Ihnen etwas Kaputtes zu geben.
- **Die Metadaten-Warnung ist auf Ihrer Seite.** Eine Data-URI kopiert die Datei exakt, und damit reist die GPS-Position einer Fotografie mit ihr in Ihr Stylesheet. Diese Seite liest, wie viel davon vorhanden ist, und sagt es Ihnen, denn die Alternative wäre, dass Sie es erfahren, wenn schon eingecheckt ist.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird irgendetwas über Ihre Bilder übergeben. Jede Zeile, die eine Datei liest oder kodiert, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/encode.js` für die beiden Kodierungen und die Begründung für jede, `src/sniff.js` dafür, wie der Medientyp aus der Datei gelesen wird und nicht aus ihrem Namen, und `src/metadata.js` für die Prüfung, die sagt, wie viel von dem, was Sie gleich einfügen, gar nicht das Bild ist.
