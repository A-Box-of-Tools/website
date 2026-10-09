# So erstellen Sie einen QR-Code und beweisen, dass er scannt

Der teure QR-Fehler ist nicht, den Code zu machen. Er ist, am Veranstaltungsort festzustellen, dass die Plakate in einen Tippfehler scannen. Erzeugen und Prüfen sind hier zwei Werkzeuge, und das zweite vor der Auflage laufen zu lassen kostet eine Minute und fängt fast alles ab, was die Auflage sonst ausgeliefert hätte.

[QR- & Barcode-Scanner öffnen](https://abox.tools/de/qr-code-scannen/): Halten Sie die Kamera drauf oder legen Sie ein Bild ab. Gelesen wird es hier und nirgendwo sonst.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

1. **Erzeugen.** Öffnen Sie den [QR- & Barcode-Generator](https://abox.tools/de/qr-code-erstellen/), wählen Sie die Aufgabe, einen Link, ein WLAN, eine Kontaktkarte, und prüfen Sie die genaue Zeichenkette, die der Code enthalten wird; die Seite zeigt sie, statt sie zu verstecken. Exportieren Sie das SVG für den Druck, das PNG für Bildschirme.
2. **Einen drucken.** In der echten Größe, auf dem echten Papier, vor der Auflage von zweihundert.
3. **Beweisen.** Fotografieren Sie den Testdruck mit einem Telefon, schräg, im Licht des Ortes, und ziehen Sie das Foto auf den [QR- & Barcode-Leser](https://abox.tools/de/qr-code-scannen/). Er zeigt die dekodierte Nutzlast und, bei einem Link, den Host, den er wirklich erreicht. Stimmt das mit dem überein, was Sie meinten, ist die Auflage sicher.

Beide Werkzeuge laufen in Ihrem Browser und senden nichts irgendwohin, was bei einem WLAN-Code heißt: Das Passwort darin wurde nie in jemandes Website getippt.

![Der QR-Ersteller mit eingetragener Adresse: der fertige Code und die Angaben dazu, seine Version, seine Fehlerkorrekturstufe und der verbleibende Platz.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

Der Code, erstellt.

## Was die Prüfung wirklich abfängt

- **Den Tippfehler.** Der häufigste Fehler ist nicht der Code, sondern die URL darin. Ihn zurückzulesen ist die einzige Prüfung, die testet, was tatsächlich kodiert ist, statt dessen, was Sie einfügen wollten.
- **Größe und Abstand.** Ein Code, der quer durch einen Raum gescannt wird, braucht größere Module als einer auf einer Visitenkarte. Den Testdruck von dort zu fotografieren, wo die Leser stehen werden, ist der ehrliche Test; die Fehlerkorrektur-Stufen des Generators sagen laut, was jede an Dichte kostet.
- **Die Farben.** Hell auf dunkel gedruckte Codes scannen, kontrastarme Markenpaletten oft nicht. Der Leser verkraftet mehr als die meisten Telefone; wenn also *er* sich mit dem Foto schwertut, hat das älteste Telefon in der Lobby keine Chance.
- **Knick und Blendung.** Reed-Solomon-Korrektur heißt, dass ein teils verdeckter Code noch liest, bis zu der Stufe, die Sie gewählt haben. Ein Plakat, das Wetter erwartet, verdient die höhere Stufe und den etwas dichteren Code, den sie kostet.

![Der Leser, dem dasselbe Bild übergeben wurde: er meldet die enthaltene Adresse, die Symbologie und die Fundstelle im Bild.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

Und dasselbe Bild, von einem anderen Werkzeug zurückgelesen — die einzige Probe, die einen misslungenen Code auffliegen lässt. Der Leser zeigt, was er gefunden hat, und öffnet es nicht.

## Derselbe Leser, für fremde Codes

Prüfen ist auch der sichere Weg, den QR-Code eines anderen zu öffnen. Der Leser zeigt die ganze Adresse und den Host, den sie wirklich erreicht, *bevor irgendetwas öffnet*, und er benennt die Tricks, die einen Link verkleiden: einen Benutzernamen vor dem @, ein Doppelgänger-Alphabet, eine Weiterleitung. Der Aufkleber am Parkautomaten verdient diese Inspektion; das Konferenz-Namensschild auch. Nichts wird für Sie geöffnet, und nichts, was Sie scannen, wird irgendwohin gesendet.

## Wenn Sie das jede Woche tun

Erzeugen und Prüfen leben mit Absicht auf zwei Seiten: Jede macht eine Aufgabe, und jede kann für sich beweisen, dass nichts Ihr Gerät verlässt. Aber beide sind quelloffen: MIT-lizenziert, abhängigkeitsfreie ES-Module, der Encoder des Generators und der Reed-Solomon-Decoder des Lesers, jedes mit einem README, das es erklärt.

Verlassen Codes wöchentlich Ihren Schreibtisch, setzen Sie einen Coding-Agenten auf das [Repository](https://github.com/A-Box-of-Tools/website) an und lassen Sie sich eine Seite bauen, die erzeugt und den gerenderten Code sofort durch den Decoder zurückschickt: ein Selbsttest bei jedem Export. Die Module sind zum Lesen geschrieben, und sie herauszuheben ist genau das, wofür die Lizenz da ist.
