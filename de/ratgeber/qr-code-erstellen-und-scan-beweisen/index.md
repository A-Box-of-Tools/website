# So erstellen Sie einen QR-Code und beweisen, dass er scannt

Der teure QR-Fehler ist nicht, den Code zu machen. Er ist, am Veranstaltungsort festzustellen, dass die Plakate in einen Tippfehler scannen. Erzeugen und Prüfen sind hier zwei Werkzeuge, und das zweite vor der Auflage laufen zu lassen kostet eine Minute und fängt fast alles ab, was die Auflage sonst ausgeliefert hätte.

[QR- & Barcode-Scanner öffnen](https://abox.tools/de/qr-code-scannen/): Halten Sie die Kamera drauf oder legen Sie ein Bild ab. Gelesen wird es hier und nirgendwo sonst.

Zuletzt aktualisiert 13. Oktober 2026

## Die kurze Antwort

1. **Erzeugen.** Öffnen Sie den [QR- & Barcode-Generator](https://abox.tools/de/qr-code-erstellen/), wählen Sie die Aufgabe, einen Link, ein WLAN, eine Kontaktkarte, und prüfen Sie die genaue Zeichenkette, die der Code enthalten wird; die Seite zeigt sie, statt sie zu verstecken. Exportieren Sie das SVG für den Druck, das PNG für Bildschirme.
2. **Einen drucken.** In der echten Größe, auf dem echten Papier, vor der Auflage von zweihundert.
3. **Beweisen.** Fotografieren Sie den Probedruck mit einem Telefon schräg und im Licht des Einsatzorts und legen das Foto in den [QR- und Barcodeleser](https://abox.tools/de/qr-code-scannen/). Er zeigt Inhalt und bei Links den Host dieser kodierten Adresse. Stimmt das mit dem Ziel überein, testen Sie die später verwendeten Telefone und das Ziel getrennt.

Beide Werkzeuge laufen im Browser und senden nichts weg. Bei einem WLAN-Code bedeutet das, dass die Verarbeitung das Passwort weder zum Erstellen noch zum Dekodieren überträgt.

![Der QR-Ersteller mit eingetragener Adresse: der fertige Code und die Angaben dazu, seine Version, seine Fehlerkorrekturstufe und der verbleibende Platz.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

Der Code, erstellt.

## Ziel und Druck getrennt prüfen

Fügen Sie für Menü, Eventanmeldung oder Geräteanleitung die vollständige HTTPS-URL in den Generator ein, behalten Sie vier Randmodule und setzen SVG ins fertige Layout. Drucken und montieren Sie in geplanter Größe auf der Zieloberfläche und scannen vom Besucherstandort. Lesen Sie die dekodierte Adresse, öffnen Sie bewusst am Telefon und erledigen die Aufgabe. Eine korrekte Adresse kann zu einer fehlenden Seite oder unerwarteten Anmeldung führen.

Kontaktkarten brauchen einen zusätzlichen Test. Speichern Sie nach dem Lesen am Telefon den Kontakt und prüfen Name, Nummer und E-Mail. Fotografieren Sie auf einem Etikettenbogen jeden Code getrennt, denn der Leser findet einen pro Bild. Wiederholen Sie nach URL-, Farb-, Größen- oder Layoutänderungen und testen mehrere Telefone vor großen Druckauflagen.

## Was die Prüfung wirklich abfängt

- **Den Tippfehler.** Der häufigste Fehler ist nicht der Code, sondern die URL darin. Ihn zurückzulesen ist die einzige Prüfung, die testet, was tatsächlich kodiert ist, statt dessen, was Sie einfügen wollten.
- **Größe und Abstand.** Ein Code, der quer durch einen Raum gescannt wird, braucht größere Module als einer auf einer Visitenkarte. Den Testdruck von dort zu fotografieren, wo die Leser stehen werden, ist der ehrliche Test; die Fehlerkorrektur-Stufen des Generators sagen laut, was jede an Dichte kostet.
- **Die Farben.** Dieser Leser versteht invertierte Codes, aber nicht zwangsläufig jedes Telefon. Beginnen Sie dunkel auf hell und prüfen die echten Markenfarben nach dem Druck.
- **Knick und Spiegelung.** Reed–Solomon-Korrektur repariert einige Datenschäden. Ihr Prozentsatz ist aber keine garantiert abdeckbare Fläche. Erkennungsmuster müssen lesbar bleiben. Für Wetterposter lohnt sich die höhere Stufe samt etwas dichterem Code.

![Der Leser, dem dasselbe Bild übergeben wurde: er meldet die enthaltene Adresse, die Symbologie und die Fundstelle im Bild.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

Und dasselbe Bild, von einem anderen Werkzeug zurückgelesen — die einzige Probe, die einen misslungenen Code auffliegen lässt. Der Leser zeigt, was er gefunden hat, und öffnet es nicht.

## Derselbe Leser, für fremde Codes

Prüfen ist auch der sichere Weg für fremde QR-Codes. *Vor jedem Öffnen* zeigt der Leser die ganze kodierte Adresse samt Host und nennt prüfenswerte Anzeichen wie Benutzernamen vor @, ähnliche Alphabete oder bekannte Linkverkürzer. Er folgt keinen Weiterleitungen und ermittelt kein Endziel hinter Kurzlinks. Ein Parkautomatenaufkleber verdient diese Prüfung ebenso wie ein Konferenzband. Nichts wird für Sie geöffnet und nichts Gescanntes gesendet.

## Wenn Sie das jede Woche tun

Erzeugen und Prüfen leben mit Absicht auf zwei Seiten: Jede macht eine Aufgabe, und jede kann für sich beweisen, dass nichts Ihr Gerät verlässt. Aber beide sind quelloffen: MIT-lizenziert, abhängigkeitsfreie ES-Module, der Encoder des Generators und der Reed-Solomon-Decoder des Lesers, jedes mit einem README, das es erklärt.

Verlassen Codes wöchentlich Ihren Schreibtisch, setzen Sie einen Coding-Agenten auf das [Repository](https://github.com/A-Box-of-Tools/website) an und lassen Sie sich eine Seite bauen, die erzeugt und den gerenderten Code sofort durch den Decoder zurückschickt: ein Selbsttest bei jedem Export. Die Module sind zum Lesen geschrieben, und sie herauszuheben ist genau das, wofür die Lizenz da ist.
