# QR-Code & Barcode scannen — aus einem Bild oder mit der Kamera

Halten Sie die Kamera drauf oder legen Sie ein Bild ab. Gelesen wird es hier und nirgendwo sonst.

> Einen QR-Code aus einem Foto, einem Screenshot oder mit der Kamera scannen und sehen, wohin der Link wirklich führt, bevor Sie ihn öffnen. Auch EAN, UPC, Code 128, Code 39 und ITF. Nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/qr-code-scannen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Bilder und die Codes darin werden **nie hochgeladen**. Es gibt keinen Server.

Einen Code zu lesen ist Rechnerei über Pixeln, und die Pixel sind schon hier. Das Symbol finden, den Blickwinkel herausrechnen, die Maske rückgängig machen, das Beschädigte per Reed-Solomon reparieren und die Bits wieder auslesen — das alles passiert in rund zweitausend Zeilen JavaScript auf dieser Seite, die Sie lesen können. **Die Kamera ist dasselbe Versprechen, keine Ausnahme davon:** ein Bild kommt als Pixel in diesem Tab an, wird untersucht und ist weg. Nichts wird aufgezeichnet, nichts aufgehoben, und diese Seite hat überhaupt keine Netzfunktion, mit der sich etwas verschicken ließe.

- ✗ Kein Upload
- ✗ Kein Konto
- ✗ Nichts wird aufgezeichnet
- ✓ Funktioniert offline
- ✓ Quelloffen

## So lesen Sie einen QR-Code, ohne das Bild hochzuladen

1. **Geben Sie ihm das Bild.** Legen Sie ein Foto oder einen Screenshot auf dem Feld ab, fügen Sie eines direkt ein oder drücken Sie auf den Kamera-Knopf. Mehrere auf einmal sind in Ordnung — jedes wird für sich gelesen und jedes bekommt seine eigene Antwort. Ein Screenshot eines Codes, der schon auf Ihrem Bildschirm steht, ist der schnellste und zuverlässigste Weg, denn da sind weder Objektiv noch Winkel noch Licht im Spiel.
2. **Das ganze Symbol muss ins Bild, samt Rand.** Der weiße Rand um einen Code gehört zum Code: daran erkennt ein Leseprogramm, wo das Symbol aufhört. Ein bis an die Quadrate beschnittenes Foto ist der mit Abstand häufigste Grund, warum einer nicht gelesen wird. Etwa die Hälfte des Bildes mit dem Code zu füllen ist ungefähr richtig — näher dran fallen die Ecken aus dem Bild.
3. **Lesen Sie die Adresse, bevor Sie irgendetwas entscheiden.** Der Sinn, einen Code auf einem Plakat, einem Parkautomaten oder einem Brief zu scannen, ist herauszufinden, wohin er führt — und genau das lässt eine Telefonkamera Sie eigentlich nicht tun. Der Host steht hier in einer eigenen Zeile. Ist es kein Name, den Sie erwartet haben, dann haben Sie schon bekommen, wofür Sie gekommen sind, und es gibt nichts mehr zu öffnen.
4. **Nehmen Sie die Hinweise ernst, gerade die leisen.** Eine reine `http://`-Adresse, ein Name in einem Alphabet, das nicht das zu sein scheint, das es ist, ein Link-Kürzer oder irgendetwas vor einem `@` in der Adresse — jedes davon wird dort benannt, wo es auftaucht. Keines davon beweist für sich genommen etwas. Alle sind zehn Sekunden wert, bevor Sie hingehen.
5. **Wenn nichts gelesen wird, ändern Sie zuerst das Licht.** Fast jeder Fehlschlag ist ein Schwellwertproblem: eine Spiegelung quer über die Mitte, ein Schatten über einer Ecke oder ein Bildschirm, der so schräg fotografiert wurde, dass die Hintergrundbeleuchtung hineinsticht. Stellen Sie sich so, dass der Glanz nicht auf dem Code liegt, oder schalten Sie das Kameralicht ein. Hilft das nicht, machen Sie ein flaches, gerades Foto und legen Sie dieses ab — ein Standbild bekommt eine weit gründlichere Suche, als ein Livebild sie haben kann.
6. **Sieht die Antwort seltsam aus, prüfen Sie das abgetastete Bild.** Klappen Sie „Wie das hier gelesen wurde“ auf und sehen Sie sich das kleine Raster an. Das ist, wofür diese Seite den Code gehalten hat, aus den abgetasteten Modulen zurückgezeichnet. Ein Leseprogramm, das ein Symbol falsch gelesen und in etwas Plausibles hineinrepariert hat, zeigt das dort und sonst nirgends.

## Die ausführliche Fassung

[So erstellen Sie einen QR-Code und beweisen, dass er scannt](https://abox.tools/de/ratgeber/qr-code-erstellen-und-scan-beweisen/): Den Code erzeugen, dann mit dem Leser derselben Seite prüfen: die genaue Nutzlast, den echten Link, in Druckgröße und vom Foto, vor der Auflage. Alles im Browser, nichts hochgeladen.

## Auch im Werkzeugkasten

- [Hash & Prüfsumme](https://abox.tools/de/pruefsumme-berechnen/): Einen Download gegen die Zahl prüfen, die der Anbieter veröffentlicht hat. Ohne sie jemandem zu schicken.
- [Passwort- & Passphrasen-Generator](https://abox.tools/de/passwort-generator/): Hier erzeugt, von Ihrem eigenen Browser, und nirgendwohin gesendet. Nichts wird gespeichert, es gibt keinen Verlauf.
- [JSON-Formatierer](https://abox.tools/de/json-formatieren/): JSON, XML, HTML, CSS und YAML, formatiert oder umgewandelt. Nichts davon wird in den Server eines anderen eingefügt.
- [YAML-zu-JSON-Umwandler](https://abox.tools/de/yaml-in-json-umwandeln/): Beide Richtungen, und es sagt Ihnen, was jede davon kostet. Nichts davon wird in den Server eines anderen eingefügt.

## Fragen

### Wird das Bild irgendwohin hochgeladen?

Nein, und was daraus gelesen wird, auch nicht. Das Bild wird auf dieser Seite auf ein Canvas dekodiert und dort gelesen, von JavaScript, das von dieser Domain kommt. Eine Netzfunktion hat dieses Werkzeug überhaupt nicht — es ruft nie etwas ab und sendet nie etwas — und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns. Der einfachste Beweis: trennen Sie die Internetverbindung, es läuft weiter.

### Zeichnet die Kamera irgendetwas auf?

Nein. Ein Kamerabild kommt als Pixel in diesem Tab an, wird auf ein Canvas gemalt, untersucht und rund eine Zehntelsekunde später vom nächsten Bild überschrieben. Nichts wird auf die Festplatte geschrieben und nichts aufgehoben. Der Stream endet, sobald Sie auf Stopp drücken, wenn der Tab in den Hintergrund geht und wenn Sie die Seite verlassen — und die Leuchte an Ihrer Kamera ist die Anzeige, der Sie trauen sollten, weil keine Webseite sie ausschalten kann.

### Warum zeigt sie mir den Link, statt ihn zu öffnen?

Weil das der nützliche Teil ist. Ein QR-Code ist eine Adresse, die Sie nicht lesen können, und genau deshalb funktioniert ein Aufkleber über dem Code am Parkautomaten: bis Sie wissen, wohin er ging, sind Sie schon dort. Hier steht die Zeichenkette vollständig da, der Host steht eigens in einer eigenen Zeile, und das Öffnen ist ein eigener Knopf, den Sie danach drücken. Das ist ein Klick mehr, und es ist der Klick, den dieses Format immer gebraucht hat.

### Was kann sie lesen?

QR-Codes in allen Versionen von 1 bis 40, auf allen vier Fehlerkorrekturstufen, in numerischem, alphanumerischem, Byte- und Kanji-Modus, wobei ECI-Zeichensätze und Symbole aus einem Structured-Append-Satz gemeldet statt stillschweigend verworfen werden. Auf der gestreiften Seite: EAN-13, EAN-8, UPC-A, UPC-E, ITF-14, Interleaved 2 of 5, Code 128 und Code 39. Data Matrix, PDF417, Aztec und MaxiCode liest sie nicht.

### Mein Code wird nicht gelesen. Woran liegt das?

In neun von zehn Fällen an einem von drei Dingen. Der weiße Rand ist abgeschnitten, und daran erkennt ein Leseprogramm, wo das Symbol aufhört. Eine Spiegelung oder ein Schatten liegt über einem Teil des Codes, sodass kein Schwellwert die dunklen von den hellen Feldern trennt. Oder der Code ist im Bild so klein, dass seine Module nur ein, zwei Pixel breit sind. Ändern Sie das Licht, füllen Sie etwa die Hälfte des Bildes und fotografieren Sie gerade von vorn statt schräg.

### Kann sie einen beschädigten oder teilweise verdeckten Code lesen?

Oft ja, und das ist das Format, das wie geplant funktioniert, nicht irgendein Kunststück von uns. Jeder QR-Code trägt Reed-Solomon-Prüfdaten, und ein auf Stufe H erzeugtes Symbol kann rund 30 % seiner Module verlieren und wird trotzdem exakt wiederhergestellt. Unter „Wie das hier gelesen wurde“ steht, wie viele Codewörter repariert werden mussten, sodass Sie sehen, wie knapp es war. Was sie nicht tut, ist raten: ein Symbol, das über das hinaus beschädigt ist, was die Prüfdaten tragen können, wird als unlesbar gemeldet und nicht falsch beantwortet.

### Warum sagt sie, sie könne mir nicht verraten, wohin ein bit.ly-Link führt?

Weil das hieße, bit.ly zu fragen, und das wäre eine Netzanfrage. Jede andere Aussage auf dieser Seite beruht darauf, dass es hier keinen Code gibt, der irgendetwas kontaktiert, und dafür stillschweigend eine Ausnahme zu machen wäre weniger wert als die Antwort. Also wird der Kürzungsdienst benannt und das, was er verbirgt, ehrlich unbekannt gelassen. Wollen Sie ihn auflösen, fügen Sie ihn in etwas ein, das bereit ist zu fragen.

### Ist es überhaupt sicher, einen QR-Code zu scannen?

Einen zu scannen ist sicher. Auf einen zu reagieren ist das Risiko, und es ist ein echtes: Codes, die über den echten geklebt werden, gibt es an Parkautomaten, auf Restauranttischen und auf Benachrichtigungskarten von Paketdiensten inzwischen so oft, dass sie einen Namen haben. Sie funktionieren, weil niemand einen Code durch Hinsehen lesen kann. Ihn zu lesen, ohne ihn zu öffnen — genau das tut diese Seite — nimmt diesen Vorteil vollständig weg, und die zehn Sekunden Blick auf den Host sind die ganze Verteidigung.

### Was ist das kleine Raster unter jedem Ergebnis?

Die Module, die diese Seite tatsächlich aus Ihrem Bild abgetastet hat, zurückgezeichnet mit einem Quadrat je Modul. Es ist da, damit sich das Gelesene mit dem Auge prüfen statt glauben lässt: sieht das Raster aus wie der Code, den Sie fotografiert haben, dann kam die Antwort darüber aus den richtigen Pixeln. Fast kein Leseprogramm zeigt Ihnen das, und es ist der Unterschied zwischen einem Werkzeug, das man prüfen kann, und einem, das man glauben muss.

### Liest sie mehrere Codes in einem Bild?

Vorerst einen je Bild. Legen Sie mehrere Bilder auf einmal ab, wird jedes für sich gelesen, und die Kamera liest Code um Code, während Sie sie bewegen, und behält jeden neuen, den sie noch nicht gesehen hat. Ein einzelnes Foto mit einem ganzen Blatt voller Codes ist ein Fall fürs Zuschneiden — oder dafür, die Kamera nacheinander daraufzuhalten.

### Warum nennt sie meinen Barcode anders, als ich ihn angefordert habe?

Weil ein Barcode seinen eigenen Namen nicht mit sich trägt. UPC-A ist ein EAN-13, dessen erste Ziffer eine Null ist, ITF-14 ist Interleaved 2 of 5 mit vierzehn Ziffern und einer gültigen Prüfziffer, und Code 128 sieht in seinem Zifferndmodus aus wie nichts sonst. Diese Seite meldet, was die Balken sagen, plus das, was die Prüfziffer bestätigt — mehr weiß das Symbol selbst auch nicht.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie funktioniert weiter, Kamera inklusive. Das ist zugleich der einfachste Beweis, dass nichts hochgeladen wird: ein Leseprogramm, das Ihr Bild zum Dekodieren wegschickt, würde in dem Moment stehenbleiben, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Das Bild wird nie hochgeladen, und die Kamera ist keine Ausnahme.** Ein Foto, das Sie hier ablegen, wird auf dieser Seite auf ein Canvas dekodiert und dort gelesen. Ein Kamerabild ist dasselbe, nur dreißigmal pro Sekunde: es wird auf dieses Canvas gemalt, untersucht und vom nächsten überschrieben. Kein Bild wird aufgezeichnet, keines aufgehoben, und dass die Kameraleuchte ausgeht, wenn Sie auf Stopp drücken, ist die ganze Geschichte.
- **Nichts hier ruft etwas ab.** Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`, und die `Content-Security-Policy` der Seite lässt keine Adresse übrig, an die diese Domain überhaupt senden könnte. Genau deshalb kann Ihnen diese Seite nicht sagen, wo ein gekürzter Link endet: das herauszufinden hieße zu fragen, und sie fragt nicht.
- **Sie zeigt Ihnen die Adresse. Sie öffnet sie nie.** Ein gedruckter QR-Code ist eine Adresse, die niemand lesen kann, und genau das macht einen Aufkleber darüber für jemanden lohnend. Hier wird nichts geöffnet. Die ganze Zeichenkette steht da, damit Sie sie ansehen können, der Host, bei dem Sie tatsächlich landen würden, steht eigens noch einmal da, und die Tricks, die eine Adresse wie eine andere aussehen lassen — ein Benutzername vor einem `@`, ein Name in einer Schrift, deren Buchstaben wie unsere geformt sind, eine Weiterleitung — werden dort benannt, wo sie auftauchen.
- **Sie zeigt Ihnen auch, was sie abgetastet hat.** Unter jedem QR-Ergebnis steht ein Bild der Module, die diese Seite tatsächlich aus Ihrem Foto gelesen hat. Sieht es aus wie der Code, den Sie gescannt haben, dann stimmt die Antwort darüber; sieht es aus wie Rauschen, dann nicht. Ein Leseprogramm, das Ihnen nur eine Zeichenkette gibt, lässt sich so nicht überprüfen.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google, der Spenden-Button von Buy Me a Coffee. Keinem davon wird ein Bild übergeben, kein Kamerabild und nichts, was daraus gelesen wurde. Jede Zeile, die aus Pixeln eine Zeichenkette macht, kommt von dieser Domain selbst und steht im Repository.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, Kamera inklusive, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/binarize.js` und `src/detect.js` dafür, ein Symbol in einem Foto zu finden — der Schwellwert, die Suchmuster und die perspektivische Entzerrung —, `src/qr-decode.js` fürs Zurücklesen, `src/reed-solomon.js` fürs Reparieren des Falschgelesenen, `src/linear.js` für die gestreiften und `src/camera.js`, das jede Zeile dieser Seite ist, die eine Kamera anfasst.
