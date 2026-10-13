# So prüfen Sie einen Download gegen seine Prüfsumme

Die Zeile Hexzeichen unter einem Downloadlink steht dort, damit Sie nachweisen können, dass die Datei unversehrt angekommen ist. Der Vergleich dauert etwa eine Minute. Zu wissen, was er wert ist, und welche Gewohnheit ihn wertlos macht, kostet den Rest dieser Seite.

[Hash & Prüfsumme öffnen](https://abox.tools/de/pruefsumme-berechnen/): Einen Download gegen die Zahl prüfen, die der Anbieter veröffentlicht hat. Ohne sie jemandem zu schicken.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie [Hash & Prüfsumme](https://abox.tools/de/pruefsumme-berechnen/), ziehen Sie die heruntergeladene Datei darauf und fügen Sie die Prüfsumme von der Downloadseite in das Feld unten ein. Die Seite erkennt an der Länge, welches Verfahren die Zahl ist, und antwortet in einem Satz.

Passt sie, sind die Bytes auf Ihrer Festplatte die, die der Anbieter gemessen hat. Passt sie nicht, laden Sie die Datei noch einmal herunter, bevor Sie sie öffnen. Alles Weitere ist das, was dieser Satz auslässt.

## Was die Zahl unter dem Downloadlink ist

Das Ergebnis einer Hashfunktion, also einer Rechnung, die jedes Byte einer Datei liest und daraus eine kurze Antwort fester Länge macht. Dieselbe Datei ergibt immer dieselbe Antwort, und eine Datei, die sich um ein einziges Bit unterscheidet, ergibt eine völlig andere. Nicht eine fast gleiche, sondern eine ohne jeden Zusammenhang. Auf dieser Eigenschaft beruht die ganze Sache.

Weil die Antwort kurz ist und die Datei nicht, wirft die Rechnung Information weg, und es gibt zwangsläufig viele Dateien mit derselben Antwort. Eine davon absichtlich zu finden, ist der schwierige Teil, und wie schwierig das ist, unterscheidet die Verfahren weiter unten voneinander.

An einer Prüfsumme ist nichts geheim, und umkehren lässt sie sich nicht. Sie ist ein Fingerabdruck, veröffentlicht, damit zwei Leute sich einig sein können, dasselbe in der Hand zu halten.

## Welches Verfahren Sie vor sich haben

Sie müssen nicht wählen. Der Anbieter hat das getan, und Ihre Aufgabe ist, dasselbe zu rechnen. Woran Sie es erkennen, ist allein die Länge:

- **32 Hexzeichen** — MD5.
- **40** — SHA-1.
- **64** — SHA-256, und das sehen Sie am häufigsten.
- **96** — SHA-384.
- **128** — SHA-512.

Keine zwei davon sind gleich lang, und deshalb kann das Werkzeug einen eingefügten Wert erkennen, ohne gefragt zu haben. Eine Zeichenkette mit 63 Zeichen ist die Prüfsumme von gar nichts. Sie ist eine SHA-256, der auf dem Weg in die Zwischenablage ein Zeichen abhandengekommen ist.

![Die Ergebniskarte: MD5-, SHA-1-, SHA-256- und SHA-512-Prüfsummen einer Datei, jede mit einer Kopieren-Schaltfläche.](https://abox.tools/screens/verify-a-file-checksum/digests.webp)

Alle auf einmal, denn welche zu verwenden ist, entscheidet die Stelle, die die Datei veröffentlicht hat, und nicht Sie.

## Auf dem eigenen Gerät, ohne Browser

Jedes Betriebssystem bringt etwas mit, das das kann, und den Befehl zu kennen lohnt sich auch dann, wenn Sie eine Webseite dafür benutzen. Auf die Frage „woher weiß ich, dass Ihre Seite ehrlich gerechnet hat“ gibt es keine bessere Antwort, als dieselbe Datei durch das Werkzeug zu schicken, das mit Ihrem Rechner geliefert wurde.

**Windows**, in der PowerShell:

```
Get-FileHash .\disk.iso -Algorithm SHA256
```

Ältere Rechner haben stattdessen `certutil -hashfile disk.iso SHA256`, das in Großbuchstaben und mit Leerzeichen schreibt. Groß- und Kleinschreibung spielt bei einer Prüfsumme nie eine Rolle; die Buchstaben sind Ziffern, keine Wörter.

**macOS**:

```
shasum -a 256 disk.iso
```

**Linux**:

```
sha256sum disk.iso
```

Alle drei geben für dieselbe Datei dieselbe Zeichenkette aus, und diese Seite ebenfalls. Es sind exakte Spezifikationen mit veröffentlichten Testvektoren, da bleibt einer Implementierung kein Spielraum für eine eigene Meinung.

## Vergleichen, ohne sich die Augen zu verderben

Lesen Sie nicht vierundsechzig Zeichen von zwei Bildschirmen ab und entscheiden Sie dann, dass sie gleich aussehen. Leute prüfen die ersten vier und die letzten vier und hören auf, und genau diesen Vergleich würde ein Angreifer bestehen wollen. Auch ein ehrlicher Fehler rutscht so durch.

Fügen Sie beides in etwas ein, das für Sie vergleicht. Auf der Kommandozeile ist dafür der Schalter `-c` da:

```
sha256sum -c SHA256SUMS
```

Im Browser ist es das Vergleichsfeld auf [Hash & Prüfsumme](https://abox.tools/de/pruefsumme-berechnen/), das den Wert in jeder Form annimmt, in der ein Anbieter ihn schreibt: als bloße Hexzeichen, als Zeile aus `sha256sum`, als ganze `SHA256SUMS`-Datei, in der Form `SHA256 (disk.iso) = …` oder als `integrity="sha384-…"` aus einem Script-Tag. Die Antwort kommt als Satz.

![Die Vergleichskarte: eine eingefügte Prüfsumme und ein Urteil, dass sie zur Datei passt.](https://abox.tools/screens/verify-a-file-checksum/compare.webp)

Fügen Sie ein, was auf der Downloadseite stand, und lassen Sie das Werkzeug vergleichen. Vierundsechzig Zeichen vom Bildschirm abzulesen ist der Schritt, den es abschafft.

## Was ein Treffer genau beweist

Dass die Bytes auf Ihrer Festplatte die sind, die jemand vor sich hatte, als er diese Zahl aufschrieb. Das ist wirklich nützlich zu wissen und enger, als die meisten annehmen, deshalb lohnt sich eine Aufzählung.

**Ein Treffer schließt aus:**

- einen Download, der zu früh abbrach und eine vollständig wirkende Datei hinterließ;
- eine Verfälschung unterwegs, auf einer sterbenden Platte oder durch ein schlechtes USB-Kabel;
- die falsche Datei, also den ARM- statt des x86-Builds oder das Release vom Vormonat;
- einen Spiegelserver, der etwas anderes ausliefert, als er behauptet.

**Ein Treffer schließt nicht aus:**

- **dass die Datei bösartig ist.** Ein Anbieter kann Schadsoftware genauso genau messen wie alles andere. Eine Prüfsumme sagt „das ist, was ausgeliefert wurde“, nie „das ist ungefährlich“;
- **dass der Anbieter kompromittiert wurde.** Wer die Datei auf dem Server ersetzt hat, hat in derselben Minute die Zeile darunter ersetzt. Womit wir beim nächsten Abschnitt wären.

## Der Fehler, der die ganze Übung wertlos macht

Die Prüfsumme von derselben Seite über dieselbe Verbindung zu nehmen wie die Datei.

Überlegen Sie, wogegen Sie sich absichern. Geht es um einen kaputten Download, darf die Prüfsumme von überall kommen, und die Prüfung funktioniert. Geht es darum, dass jemand die Datei manipuliert hat, dann konnte derselbe Jemand auch die Zeile Hexzeichen darunter ändern, denn beides kam vom selben Server über dieselbe Verbindung. Sie würden den Fälscher bitten, die Unterschrift zu bestätigen.

Am meisten wert ist eine Prüfsumme, wenn sie Sie auf einem Weg erreicht, den die Datei nicht genommen hat:

- als `SHA256SUMS`-Datei mit abgetrennter GPG-Signatur, geprüft gegen einen Schlüssel, den Sie schon hatten. So machen es die Distributionen, und das ist die eigentliche Antwort;
- über die Release-Ankündigung auf einer Mailingliste oder ein Tag im Quellcode-Repository statt über die Downloadseite;
- über einen zweiten Spiegelserver auf einer anderen Domain, und die beiden dann miteinander verglichen;
- über eine Paketverwaltung, die genau das für Sie erledigt, gegen Schlüssel, die mit dem Betriebssystem geliefert wurden.

Nichts davon macht die Prüfung gegen eine Prüfsumme von derselben Seite nutzlos. Sie fängt den kaputten Download ab, und das ist der Fall, der den Leuten tatsächlich passiert. Reden Sie sich nur nicht ein, sie hätte mehr abgefangen.

## MD5 und SHA-1 sind gebrochen. Nehmen Sie sie trotzdem, manchmal

Beide sind in dem stärksten Sinn gebrochen, auf den es hier ankommt: *Kollisionen* lassen sich absichtlich bauen. Zwei verschiedene Dateien mit derselben MD5 sind seit 2004 auf gewöhnlicher Hardware herstellbar, und 2017 hat ein Team zwei verschiedene PDF-Dateien mit derselben SHA-1 vorgelegt. 2020 kostete die Variante mit frei wählbarem Anfang nur noch einige zehntausend Dollar gemietete Rechenzeit.

Praktisch heißt das: Eine passende MD5 sagt Ihnen nicht mehr, dass niemand an der Datei war, denn wer wollte, hätte eine andere Datei mit derselben Zahl bauen können. Sie sagt Ihnen weiterhin, dass der Download nicht abgeschnitten oder verfälscht wurde, denn ein zufälliges Missgeschick trifft keine Kollision. Diese Wahrscheinlichkeit hatte noch kein Unfall.

Hat der Anbieter also nur eine MD5 veröffentlicht, prüfen Sie sie. Das ist mehr wert als nicht zu prüfen. Und wenn Sie selbst veröffentlichen, drucken Sie eine SHA-256.

## Sie passt nicht. Was jetzt?

1. **Noch einmal herunterladen**, von derselben Stelle. Eine abgebrochene oder fortgesetzte Übertragung ist mit weitem Abstand die häufigste Ursache, und die zweite Kopie klärt es meistens.
2. **Prüfen, ob es die richtige Zeile ist.** Auf Releaseseiten stehen mehrere Dateien. Die Prüfsumme des Installers passt nie zu der des Archivs, und die des ARM-Builds nie zu der des x86-Builds.
3. **Die Version prüfen.** Gemerkte Prüfsummenseiten sind an dem Tag veraltet, an dem ein Wartungsrelease erscheint.
4. **Einen anderen Spiegelserver versuchen** und die Prüfsummen der beiden Dateien miteinander vergleichen. Zwei Spiegel, die untereinander übereinstimmen und von der veröffentlichten Zahl abweichen, sind ein anderes Problem als ein Spiegel, der von beiden abweicht.
5. **Die Datei bis dahin nicht öffnen.** Eine Datei, die ihre Prüfsumme verfehlt, ist im besten Fall beschädigt und im schlechtesten nicht die, die Sie wollten.

## Warum überhaupt im Browser

Weil die Kommandozeile nicht der Ort ist, an dem die meisten Leute sind, und weil die naheliegende Alternative seltsam ist: eine Webseite, die Sie bittet, die Datei hochzuladen. Eine Datei irgendwohin zu schicken, um herauszufinden, ob unterwegs an ihr manipuliert wurde, fügt genau eine weitere Stelle hinzu, an der manipuliert werden kann.

[Hash & Prüfsumme](https://abox.tools/de/pruefsumme-berechnen/) liest die Datei in Stücken von vier Megabyte auf Ihrem eigenen Gerät. Es gibt also keinen Upload, keine Größengrenze und nichts, dem Sie vertrauen müssten außer der Seite selbst, die Sie lesen können und die auch mit gezogenem Netzstecker weiterarbeitet. Vertrauen Sie lieber Ihrem eigenen Betriebssystem, nehmen Sie den Befehl aus dem Abschnitt weiter oben und vergleichen Sie die beiden Antworten. Sie werden übereinstimmen.
