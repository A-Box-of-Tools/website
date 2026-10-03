# Dokumenten­scanner — ein Foto einer Seite, geradegerückt

Fotografieren Sie die Seite. Zurück kommt etwas, das wie gescannt aussieht.

> Machen Sie aus einem Handyfoto einer Seite ein geradegerücktes, gleichmäßig ausgeleuchtetes PDF. Die Ecken werden für Sie gefunden, die Perspektive herausgerechnet, der Schatten herausgeteilt. Läuft komplett im Browser: nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/dokumente-scannen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Dokumente werden **nie hochgeladen**. Es gibt keinen Server.

Das Foto wird von Ihrem eigenen Browser dekodiert, geradegerückt, aufgeräumt und in ein PDF geschrieben, mit nichts als Rechnen und den Codecs, die er ohnehin mitbringt. Netzfunktionen hat dieses Werkzeug keine, weder zum Abrufen noch zum Senden, und warum das hier zählt, sagt die Liste dessen, wovon Leute Seiten abfotografieren: ein Reisepass, eine Gehaltsabrechnung, ein Mietvertrag, ein Formular, das ein Amt „eingescannt zurück“ haben will.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Kein Wasserzeichen
- ✓ Läuft offline
- ✓ Quelloffen

## So scannen Sie ein Dokument mit der Handykamera

1. **Fotografieren Sie die Seite.** Von oben, mit der ganzen Seite im Bild und den vier Ecken sichtbar oder beinahe. Sie muss nicht im rechten Winkel aufgenommen und nicht gleichmäßig ausgeleuchtet sein: Die Schräglage und der Schatten sind der Zweck dieses Werkzeugs. Worauf es ankommt, ist das Bild zu füllen. Eine Seite, die vom anderen Ende des Zimmers aufgenommen wurde, hat keine Details mehr, die sich zurückholen ließen.
2. **Prüfen Sie die vier Ecken.** Sie werden beim Einlesen des Fotos für Sie gefunden, und die Seite sagt es, wenn sie sich nicht sicher ist. Bei einer Seite auf einem Tisch derselben Farbe ist die Kante wirklich schwer zu sehen. Tippen Sie irgendwo auf das Foto, und die nächste Ecke kommt zu Ihrem Finger, oder gehen Sie mit `Tab` zu einer und bewegen Sie sie mit den Pfeiltasten.
3. **Entscheiden Sie über das Licht.** „Farbe, ausgeglichen“ misst das Papier über die Seite hinweg und teilt es heraus, sodass der Schatten verschwindet und ein Stempel oder eine Unterschrift ihre Farbe behält. „Schwarzweiß“ geht weiter und ist das, was einen Scan klein genug für eine E-Mail macht. Was Sie auf dem Bildschirm sehen, ist das echte Ergebnis, erzeugt von demselben Code, der die Datei schreibt.
4. **Fügen Sie die anderen Seiten hinzu.** Jedes Foto, das Sie hinzufügen, wird eine weitere Seite desselben Dokuments, in der Reihenfolge der Liste, und jede behält ihre eigenen Ecken. Die Pfeile an einer Seite im Streifen schieben sie nach vorn oder nach hinten.
5. **Speichern Sie das PDF und öffnen Sie es, bevor Sie es verschicken.** Das Dokument entsteht hier, im Speicher dieser Seite. Nichts wurde dafür hochgeladen, und nichts darüber wurde irgendwohin gemeldet.

## Die ausführliche Fassung

[So scannen Sie ein Dokument mit dem Handy](https://abox.tools/de/ratgeber/dokument-mit-handy-scannen/): Was ein Foto einer Seite von einem Scan derselben Seite unterscheidet: die Schräglage, das ungleichmäßige Licht und die Dateigröße. Wie Sie das Foto machen, was sich danach beheben lässt und warum nichts davon einen Server braucht.

## Auch im Werkzeugkasten

- [Ton aus Video extrahieren](https://abox.tools/de/ton-aus-video-extrahieren/): Ziehen Sie ein Video hinein und nehmen Sie den Ton heraus. Das Bild wird nie dekodiert, und hochgeladen wird nichts.
- [Audio-Schneider](https://abox.tools/de/audio-schneiden/): Markieren Sie beim Abspielen, was bleiben soll. Zurück kommt eine Datei, geschnitten genau dort, wo Sie es gesagt haben.
- [Audio-Editor](https://abox.tools/de/audio-bearbeiten/): Rückwärts abspielen, das Tempo ändern, eine leise Aufnahme anheben. Alles hier, auf Ihrem Gerät.
- [PDF-Zusammenfügen & Teilen](https://abox.tools/de/pdf-zusammenfuegen/): Seiten umsortieren, ohne den Umweg über einen Server.

## Fragen

### Wird mein Dokument irgendwohin hochgeladen?

Nein. Das Foto wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware dekodiert, geradegerückt, aufgeräumt und in ein PDF geschrieben. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf. Keine davon gehört uns. Laden Sie die Seite einmal, trennen Sie die Internetverbindung, und sie arbeitet weiter.

### Wie findet er die Ecken der Seite ohne ein Modell?

Indem er nach den vier langen geraden Kanten sucht, aus denen ein Rechteck besteht. Das Foto wird verkleinert, der Gradient gebildet, also wo sich das Bild ändert und in welche Richtung, und jedes Pixel, das auf einer Kante liegt, stimmt für die Gerade ab, auf der es läge. Die starken Geraden werden zu Rechteck-Kandidaten gepaart, und jeder Kandidat wird bewertet, indem seine vier Seiten abgelaufen werden: Wie viel von jeder hat wirklich eine Kante unter sich, und sind die vier zusammen der Rand ein und derselben Sache? Eine Seite ist heller als ihre Umgebung, oder dunkler, aber auf allen vier Seiten dasselbe, und das ist es, was verhindert, dass eine Textzeile für den unteren Seitenrand gehalten wird. Es gibt keine Gewichte, es wird nichts heruntergeladen, und die Rechnung ist für jedes Dokument dieselbe.

### Die gefundenen Ecken stimmen nicht. Was jetzt?

Ziehen Sie sie. Die Ecken sind eine Ausgangslage und nie eine Entscheidung: Der Scan wird von dort genommen, wo die vier am Ende stehen. Tippen Sie irgendwo auf das Foto, und die nächste Ecke springt zu Ihrem Finger, was leichter ist als einen kleinen Griff zu treffen, und die Pfeiltasten bewegen die fokussierte Ecke pixelweise. Die Seite sagt Ihnen außerdem, wenn die Ecken geraten statt gefunden sind, und markiert diese Seite im Streifen. Der übliche Grund ist eine Seite auf einem Tisch von ungefähr ihrer eigenen Farbe, weil da wirklich fast keine Kante zu finden ist.

### Warum kommt die geradegerückte Seite in der richtigen Form heraus und nicht gestaucht?

Weil die Form aus der Perspektive zurückgerechnet und nicht an den Kanten gemessen wird. Bei einer schräg fotografierten Seite ist die entfernte Kante verkürzt, deshalb liefert die naheliegende Methode, das längste Paar gegenüberliegender Kanten zu nehmen und das Verhältnis zu nennen, ein sichtbar gedrungenes A4. Das ist es, was die meisten Web-Scanner Ihnen geben. Tatsächlich trägt das Foto eines Rechtecks genug Information, um sowohl das Seitenverhältnis des Rechtecks als auch die Brennweite der Kamera zurückzugewinnen, sofern es eine gewöhnliche Kamera ist. Das ist ein Ergebnis von Zhang und He aus dem Jahr 2003, und genau das tut `src/geometry.js`. Wo das Foto im rechten Winkel aufgenommen wurde, gibt es keine Perspektive, aus der sich rechnen ließe, und es braucht auch keine, weil die Kanten dann exakt sind. Dann fällt er auf sie zurück, und die Seite sagt, welche der beiden geantwortet hat.

### Was macht „aufgeräumt“ eigentlich mit dem Bild?

Es teilt das Licht heraus. Die Helligkeit des Papiers selbst wird über die Seite hinweg gemessen, in einem Raster aus Kacheln und in jeder Kachel als hohes Perzentil der Helligkeit, das Text zu dunkel und zu spärlich ist, um es zu verschieben, und jedes Pixel wird durch das an dieser Stelle geschätzte Papier geteilt. Übrig bleibt die Tinte, gleichmäßig ausgeleuchtet, ohne Schatten und ohne Abfall zum Rand hin. Das ist nicht dasselbe wie den Kontrast anzuheben: Den Kontrast einer fotografierten Seite anzuheben macht den hellen Teil weiß, den dunklen schwarz und die Schrift im dunklen Teil unlesbar. Deshalb macht „Auto-Tonwert“ solche Bilder schlechter statt besser.

### Warum ist der Schwarzweiß-Modus so viel kleiner?

Weil ein Bild mit zwei Farben tatsächlich ein Bruchteil der Daten eines Bildes mit sechzehn Millionen ist, und weil es hier auch so gespeichert wird: ein Bit pro Pixel, zu acht in ein Byte gepackt und exakt komprimiert, statt als JPEG eines schwarzweißen Bildes. Auf denselben Seiten kommt es rund achtzehnmal kleiner heraus als der Farbmodus, sodass ein zwanzigseitiger Vertrag unter einem Megabyte landet statt bei etwa fünfzehn. Der Schwellwert ist der von Sauvola, der jedes Pixel gegen den Mittelwert und die Streuung seiner eigenen Nachbarschaft entscheidet statt gegen eine Zahl für die ganze Seite, und genau das hält die Schrift innerhalb eines Schattens lesbar. Halbtöne kennt er nicht, also sollte eine Seite mit einem Foto darauf einen der anderen Modi nehmen.

### Kann ich mehrere Seiten in ein PDF legen?

Ja. Jedes Foto, das Sie hinzufügen, wird eine weitere Seite, in der Reihenfolge der Liste, und jede Seite behält ihre eigenen Ecken. Ein Stapel nacheinander fotografierter Seiten wird so zu einem Dokument. Die Pfeile an jeder Seite im Streifen schieben sie nach vorn oder nach hinten. Die Aufräum-Einstellung gilt absichtlich für alle: Seiten in einem Dokument, die unterschiedlich aufgeräumt wurden, sehen aus wie zwei Dokumente.

### Liest er den Text, damit ich das PDF durchsuchen kann?

Nein. Es gibt keine Textebene und keine Zeichenerkennung: Heraus kommt ein Bild der Seite auf einer Seite. Es richtig zu machen hieße, eine OCR-Engine mitzuliefern, also zig Megabyte Modell zum Herunterladen, und ein Dokumentenscanner, der ein Modell holt, bevor er Ihre Gehaltsabrechnung lesen kann, wäre ein Dokumentenscanner mit einem Grund, wegen Gehaltsabrechnungen nach Hause zu telefonieren. Wenn Sie den Text brauchen, liefert der Schwarzweiß-Modus genau die Art von Datei, mit der OCR-Software auf Ihrem eigenen Gerät am besten zurechtkommt.

### Es ist unscharf geworden. Warum?

Fast immer, weil die Seite im Foto klein war. Die Leiste unter der Vorschau sagt, wie viel des Bildes die Seite gefüllt hat und wie viele Punkte pro Zoll das auf einem Blatt dieser Größe ungefähr ergibt. Unterhalb von etwa 150 DPI sieht ein gedruckter Scan weich aus, und gegen Details, die nie in der Datei waren, kann kein Werkzeug etwas ausrichten. Gehen Sie näher heran, statt zu zoomen, halten Sie still, und lassen Sie die Kamera auf die Seite scharfstellen, bevor Sie auslösen. Verwackeln ist die andere Ursache, und die lässt sich ebenso wenig zurückholen.

### Ist das kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung, keine Testphase, kein Seitenlimit und kein Wasserzeichen. Es gibt auch keine Grenze für die Größe der Fotos, weil kein Server dafür bezahlt: Die Arbeit passiert auf Ihrem eigenen Gerät. Die Seite trägt Werbung, und die bezahlt sie; die Werbung bekommt nichts über Ihre Dokumente.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Dokumente haben keinen Ort, an den sie gehen könnten.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Fotos gesammelt werden könnten, und keinen Code, der sie senden würde, wenn es ihn gäbe.
- **Es gibt kein Modell, also nichts herunterzuladen und nichts zu fragen.** Die vier Ecken einer Seite zu finden ist Rechnen: der Gradient des Bildes, eine Abstimmung über die geraden Linien darin und eine Prüfung, was unter jeder Seite des siegreichen Rechtecks tatsächlich liegt. Keine Gewichte, keine Inferenz-Laufzeit, nichts, was beim ersten Gebrauch nachgeladen wird, und nichts, was sich beim Dokument einer anderen Person anders verhält als bei Ihrem. Siehe `src/detect.js`.
- **Das Dokument trägt kein Datum, keinen Autor und keinen Rechnernamen.** Ein Scan ist etwas, das Leute anderen Leuten schicken, meist weil ein Amt darum gebeten hat. Das Einzige, was außer den Seiten selbst in das PDF geschrieben wird, ist der Name dieses Werkzeugs, und ein Titel, wenn Sie einen eintippen. Kein Erstellungsdatum, kein Autor, keine Seriennummer und nichts, was aus Ihrer Uhr, Ihren Dateinamen oder Ihrem Rechner abgeleitet wäre. Siehe `src/document.js`.
- **Hier ruft nichts irgendetwas ab.** Es gibt kein `fetch`, kein `XMLHttpRequest` und kein `sendBeacon`, nirgends in `src/`. Die Arbeit ist ein `getImageData`, ein paar Schleifen über die Bytes und der JPEG-Encoder des Browsers, und all das ist längst auf Ihrem Gerät installiert.
- **Läuft offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt, wie es ist, weil nie ein Netzschritt darin war. Das ist der einfachste Beweis von allen, und der, den man führen sollte, bevor man einen Reisepass scannt.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/detect.js` dafür, wie die Ecken ohne jedes Modell gefunden werden, `src/warp.js` für das Geraderücken und `src/clean.js` dafür, wie das ungleichmäßige Licht herausgeteilt wird.
