# QR-Code & Barcode — offline erzeugen

Eintippen, und es wird ein Code. Zum Erzeugen wird nichts gesendet.

> Einen QR-Code für einen Link, ein WLAN oder eine Kontaktkarte erzeugen, oder einen EAN-13-, UPC-A-, Code-128- oder Code-39-Barcode. Als SVG oder PNG herunterladen. Alles passiert in Ihrem Browser.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/qr-code-erstellen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Codes und der Text darin werden **nie hochgeladen**. Es gibt keinen Server.

Ein QR-Code ist Rechnerei über einer Zeichenkette. Es gibt hier nichts zu senden und niemanden zu fragen. Die Wahl des Modus, die Version, die Reed-Solomon-Fehlerkorrektur, die Maske, die Balken eines Barcodes und die Prüfziffer darunter, all das passiert in rund tausend Zeilen JavaScript auf dieser Seite, die Sie lesen können. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht, und das wiegt hier schwerer als anderswo, denn kodiert wird hier oft ein WLAN-Passwort.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Ablaufdatum
- ✓ Funktioniert offline
- ✓ Quelloffen

## So erzeugen Sie einen QR-Code, ohne etwas hochzuladen

1. **Wählen Sie die Art des Codes.** Ein QR-Code fasst alles und ist das, wonach eine Telefonkamera sucht, also die Antwort, solange Ihnen niemand etwas anderes gesagt hat. Ein Barcode fasst eine Zahl, und welcher es sein muss, entscheidet die Person, die ihn scannen wird. Ein Geschäft will einen EAN-13 oder einen UPC-A, ein Versandkarton einen ITF-14, und alles Interne ist meist Code 128.
2. **Sagen Sie, was hineinkommt.** Ein Link ist der häufige Fall, und die Felder darüber bauen die anderen Formate, die Telefone kennen: ein WLAN, das anbietet, sich selbst beizutreten, eine Kontaktkarte, die anbietet, gespeichert zu werden, eine E-Mail, eine SMS, eine Telefonnummer, ein Ort auf einer Karte. Was Sie auch wählen, die fertige Zeichenkette steht auf der Seite, denn mehr als sie enthält ein QR-Code nie.
3. **Entscheiden Sie, wie viel Schaden er aushalten darf.** Die vier Stufen legen mehr oder weniger Fehlerkorrektur hinein, und mehr Korrektur heißt ein größerer, dichterer Code. L reicht für einen Bildschirm, M für gewöhnliches Papier und H für etwas, das angefasst, klein gedruckt oder in der Sonne an ein Fenster geklebt wird. Ein Code auf einer Speisekarte, die täglich abgewischt wird, ist Q oder H wert.
4. **Setzen Sie Größe, Rand und Farben.** Der Rand gehört zum Code. Die Spezifikation verlangt ringsherum vier Module ruhige Fläche, und ihn zu beschneiden ist der mit Abstand häufigste Grund, warum ein gedruckter Code nicht scannt. Dunkel auf Hell, mit echtem Kontrast. Ein Scanner liest den Unterschied zwischen beiden, blasses Grau auf Weiß genügt also nicht, und Hell auf Dunkel scheitert bei etlichen Lesegeräten rundweg.
5. **Prüfen Sie ihn mit dem Telefon, das Sie haben.** Bevor Sie tausend davon drucken, scannen Sie den auf Ihrem Bildschirm. Das dauert zehn Sekunden und fängt die ganze Sorte Fehler ab, die eine Vorschau nicht zeigen kann: ein WLAN-Passwort mit einem Zeichen, das maskiert werden musste, ein Link, dem das `https://` fehlte, eine Barcode-Nummer mit einer Ziffer zu wenig.
6. **Nehmen Sie das SVG.** Darin steht der Code als Anweisungen statt als Pixel, es druckt also in jeder Größe, ohne weich zu werden, und eine weiche Kante ist genau das, was ein Scanner nicht auflösen kann. Nehmen Sie zusätzlich das PNG, falls das, wohin Sie es einfügen, kein SVG annimmt. Es wird mit einer ganzen Pixelzahl je Modul gezeichnet und hat deshalb ebenfalls keine verwaschenen Kanten.

## Die ausführliche Fassung

[So erzeugen Sie einen QR-Code, der sich auch mit fremden Handys scannen lässt](https://abox.tools/de/ratgeber/qr-code-selbst-erstellen/): Welche Fehlerkorrekturstufe die richtige ist, warum der weiße Rand zum Code gehört, wie groß Sie ihn drucken müssen und was Sie der „dynamische“ Code eines Gratis-Generators ein Jahr später kostet.

## Auch im Werkzeugkasten

- [QR- & Barcode-Scanner](https://abox.tools/de/qr-code-scannen/): Halten Sie die Kamera drauf oder legen Sie ein Bild ab. Gelesen wird es hier und nirgendwo sonst.
- [Hash & Prüfsumme](https://abox.tools/de/pruefsumme-berechnen/): Einen Download gegen die Zahl prüfen, die der Anbieter veröffentlicht hat. Ohne sie jemandem zu schicken.
- [Passwort- & Passphrasen-Generator](https://abox.tools/de/passwort-generator/): Hier erzeugt, von Ihrem eigenen Browser, und nirgendwohin gesendet. Nichts wird gespeichert, es gibt keinen Verlauf.
- [JSON-Formatierer](https://abox.tools/de/json-formatieren/): JSON, XML, HTML, CSS und YAML, formatiert oder umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.

## Fragen

### Wird irgendetwas, was ich eintippe, irgendwohin gesendet?

Nein. Ein QR-Code ist Rechnerei über einer Zeichenkette, und diese Rechnerei läuft in Ihrem eigenen Browser auf Ihrem eigenen Gerät. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns. Das wiegt hier schwerer als anderswo, denn was Menschen am häufigsten in einen QR-Code legen, ist das Passwort ihres WLANs.

### Laufen diese Codes ab oder hören sie später auf zu funktionieren?

Nein, und sie können es gar nicht. Was Sie eintippen, ist das, was der Code enthält, ihn zu scannen gibt also für immer genau diese Zeichenkette zurück. Ablaufen können die Codes, in denen die Adresse eines anderen steht. In einem „dynamischen“ QR-Code steckt ein Link auf den Server des Generators, der auf Ihren weiterleitet, und damit kann jener jeden Scan zählen, das Ziel ändern oder es abschalten, wenn eine Testphase endet. Hier leitet nichts irgendwohin weiter.

### Ist es kostenlos, und darf ich es gewerblich nutzen?

Es ist kostenlos, es gibt kein Konto, kein Wasserzeichen und keine Grenze dafür, wie viele Sie erzeugen, und Sie dürfen das Ergebnis auf ein Produkt, ein Plakat oder eine Ladenfront setzen. QR Code ist eine eingetragene Marke von Denso Wave, und Denso Wave hat erklärt, sie nicht gegen Menschen durchzusetzen, die die Codes verwenden. Die Spezifikation ist als ISO/IEC 18004 veröffentlicht und frei umzusetzen, und genau das tut diese Seite. Bezahlt wird sie über Werbung.

### Welche Fehlerkorrekturstufe soll ich nehmen?

M, solange Sie keinen Grund für etwas anderes haben. L ergibt den kleinsten Code und reicht auf einem Bildschirm. M übersteht gewöhnliche Behandlung. Q und H sind für einen Code, der klein gedruckt, laminiert, an ein Fenster geklebt oder teilweise von einem Logo verdeckt wird. Jede Stufe legt mehr Prüfdaten hinein und braucht bei gleicher Textmenge ein größeres Symbol. Von L auf H zu gehen verdoppelt die Modulzahl für dieselbe Zeichenkette ungefähr.

### Wie viel fasst ein QR-Code?

In der größten Größe, 177 Module im Quadrat, bis zu 7.089 Ziffern, 4.296 Großbuchstaben und Ziffern oder 2.953 Byte von allem anderen, und das bei der schwächsten Fehlerkorrektur. Bei der stärksten ist es etwa ein Drittel davon. In der Praxis setzt allerdings nicht das Format die Grenze, sondern der Scanner. Jenseits einiger hundert Zeichen werden die Module so klein, dass eine gewöhnliche Telefonkamera sie auf Armlänge nicht mehr auflöst. Ein langer Code ist meist ein Zeichen dafür, dass ein kurzer Link hineingehört.

### Warum ist mein Code größer, wenn ich den Link klein schreibe?

Weil ein QR-Code einen Modus für Großbuchstaben und Ziffern hat, der zwei Zeichen in elf Bit packt, und keinen solchen für Kleinbuchstaben, die je acht Bit kosten. Eine als `HTTPS://EXAMPLE.COM/SEITE` geschriebene URL kann ein Drittel kleiner ausfallen als dieselbe URL in Kleinbuchstaben. Schema und Host sind unabhängig von der Groß- und Kleinschreibung, sie zu schreien ändert also nichts außer der Größe. Für den Pfad nach dem Host gilt das nicht, den lassen Sie besser in Ruhe.

### Kann es einen QR-Code auch lesen und nicht nur erzeugen?

Diese Seite nicht, die daneben schon: [der Scanner](https://abox.tools/de/qr-code-scannen/) nimmt ein Foto, einen Screenshot oder Ihre Kamera und gibt die Zeichenkette zurück. Das ist eine erheblich größere Aufgabe, als einen zu zeichnen — das Symbol in einem Bild finden, den Aufnahmewinkel herausrechnen und den Schaden reparieren sind drei Probleme, die diese Seite nicht hat —, und deshalb ist es ein eigenes Werkzeug und kein Knopf hier. Es läuft zu denselben Bedingungen wie alles andere: nichts hochgeladen, und kein Kamerabild aufgehoben.

### Wofür ist der Rand, und kann ich ihn kleiner machen?

Der weiße Raum um einen QR-Code gehört zum Code. Ein Lesegerät findet daran, wo das Symbol endet, und die Spezifikation verlangt vier Module auf jeder Seite; ein Barcode will etwa zehn. Sie können ihn hier auf null setzen. Das Bild sieht dann aufgeräumter aus, und eine ganze Reihe Scanner sieht es daraufhin gar nicht mehr, besonders vor einem unruhigen Hintergrund. Ist der Platz das Problem, machen Sie lieber den Code kleiner, statt seinen Rand zu beschneiden.

### Welchen Barcode brauche ich?

Den, nach dem die Person fragt, die ihn scannt. EAN-13 ist der Handels-Barcode außerhalb Nordamerikas, UPC-A der nordamerikanische, und beide brauchen eine Nummer, die Ihnen GS1 zuteilt, denn die Nummer identifiziert Ihr Unternehmen und nicht nur das Produkt. EAN-8 ist die Kurzfassung für kleine Verpackungen. ITF-14 kommt auf den Versandkarton. Code 128 und Code 39 fassen neben Ziffern auch Text und brauchen überhaupt keine Registrierung, was sie zur richtigen Antwort für alles Interne macht: Anlagen, Regale, Auftragszettel.

### Was ist eine Prüfziffer, und warum hat das Werkzeug eine ergänzt?

Sie ist die letzte Ziffer eines Handels-Barcodes, aus den vorherigen ausgerechnet, damit ein Scanner einen Lesefehler von einem Treffer unterscheiden kann. EAN-13 will zwölf Ziffern und berechnet die dreizehnte, UPC-A will elf und berechnet die zwölfte. Tippen Sie die kurze Nummer, ergänzt diese Seite sie. Tippen Sie die volle Nummer, prüft sie die, die Sie gegeben haben, und weigert sich lieber, als stillschweigend zu korrigieren. Eine leise reparierte falsche Ziffer wäre ein Etikett, das als fremdes Produkt scannt.

### Kann ich ein Logo in die Mitte eines QR-Codes setzen?

Hier nicht, aber es lohnt sich zu wissen, warum es anderswo funktioniert: Möglich macht es die Fehlerkorrektur. Auf Stufe H lassen sich rund 30 % der Module zerstören, und der Code ist noch lesbar. Ein Logo, das deutlich weniger als das in der Mitte verdeckt, wo kein Suchmuster sitzt, ist damit reparabler Schaden. Schicken Sie den Code auf Stufe H durch Ihr Bildbearbeitungsprogramm, halten Sie das Logo unter etwa einem Fünftel der Fläche, und testen Sie ihn mit einem echten Telefon, statt ihm zu vertrauen.

### Warum ist das SVG besser als das PNG?

Weil ein Code aus Kanten besteht und ein PNG eine feste Pixelzahl hat, aus der es sie machen muss. Vergrößern Sie eines, wird jede Kante weich, und mit einer weichen Kante hat ein Scanner Mühe. Ein Drucker mit 1200 dpi, dem man ein 512-Pixel-PNG gibt, soll den Unterschied erfinden. In einem SVG stehen die Quadrate als Anweisungen, es druckt also scharf auf einer Visitenkarte wie auf einer Plakatwand. Das PNG hier wird mit einer ganzen Pixelzahl je Modul gezeichnet, und mehr kann ein PNG nicht leisten.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihren Text wegschickt, um anderswo einen Code zeichnen zu lassen, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Für das, was Sie eintippen, gibt es keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem ein WLAN-Passwort landen könnte, und im Code steht auch nichts, das es dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`. Der Code wird aus der Zeichenkette errechnet und als SVG gezeichnet, auf dieser Seite und auf Ihrem Gerät.
- **Der Code zeigt nicht auf uns.** Was Sie eintippen, ist das, was der Code enthält. Mehrere kostenlose Generatoren geben Ihnen einen Code zurück, in dem ein Link auf ihre eigene Seite steht, die dann auf Ihre weiterleitet. Damit zählen sie jeden Scan, und der Code hört an dem Tag auf zu funktionieren, an dem sie die Domain nicht mehr bezahlen oder befinden, die kostenlose Stufe sei abgelaufen. Hier wird nichts gekürzt, weitergeleitet oder gezählt. Die Zeichenkette auf der Seite ist die Zeichenkette im Bild.
- **Das PNG entsteht aus dem SVG, das auf dem Schirm steht.** Der Download ist keine zweite Zeichnung, die von der Vorschau abweichen könnte. Dasselbe Markup geht an den Browser und wird auf ein Canvas gemalt. Genau deshalb geht das, ohne irgendetwas zu kontaktieren, denn darin gibt es weder eine Schrift zu holen noch ein Bild zu laden.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird irgendetwas übergeben, was Sie eintippen. Jede Zeile, die aus einer Zeichenkette einen Code macht, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/qr-encode.js` und `src/qr.js` für den QR-Code selbst, also die Modi, die Version und die Blöcke im einen und die Muster, die Maske und die Formatbits im anderen, dazu `src/gf256.js` für die Fehlerkorrektur und `src/barcode.js` für die gestreiften.
