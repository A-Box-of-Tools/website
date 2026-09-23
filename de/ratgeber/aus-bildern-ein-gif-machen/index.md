# Aus Bildern ein animiertes GIF machen

Das GIF zu machen ist der leichte Teil. Eines zu bekommen, das klein genug ist, um es wirklich zu posten, ist der Teil, über den zu lesen sich lohnt, denn ein GIF hat keinen Qualitätsregler, und nur drei Dinge bewegen seine Größe überhaupt.

[GIF-Ersteller öffnen](https://abox.tools/de/gif-erstellen/): Aus einer Reihe von Bildern eine Animation machen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Den [GIF-Ersteller](https://abox.tools/de/gif-erstellen/) öffnen, die Bilder hineinziehen, sie in die Reihenfolge bringen, in der sie laufen sollen, einstellen, wie lange jedes Bild steht, und das GIF machen. Es läuft auf der Seite, bevor Sie es speichern.

Alles Weitere handelt von den zwei Dingen, die danach schiefgehen: Die Datei ist weit größer als erwartet, oder die Animation läuft langsamer, als die Zahlen versprochen haben. Beides hat bestimmte Ursachen, und keines davon ist ein Fehler des Werkzeugs.

## Warum ein GIF so viel größer ist, als man denkt

Ein GIF mit 20 Bildern bei 640 Pixeln liegt regelmäßig bei 8 bis 15 MB. Dieselbe Animation als MP4 sind ein paar hundert Kilobyte. Das ist kein schlecht gemachtes GIF; das ist das Format.

Jedes andere Bewegtbildformat, das Sie benutzt haben, speichert *Unterschiede*. Ein Video-Codec schreibt ein vollständiges Bild und danach nur noch, was sich bewegt hat und wohin — weshalb ein Video einer sprechenden Person vor ruhigem Hintergrund pro Bild fast nichts kostet. Ein GIF kann das nicht. Jedes Bild wird als ganze Pixel gespeichert, durch einen verlustfreien Packer geschickt, und das ist der gesamte Werkzeugkasten.

Es gibt auch keine Qualitätseinstellung, weil es keinen verlustbehafteten Schritt gibt, den man herunterdrehen könnte. Ein JPEG mit 60 % Qualität ist eine echte Wahl mit einem echten Regler dahinter; ein GIF hat nichts Vergleichbares. Die Größe ist also grob **Fläche × Anzahl der Bilder**, und der einzige Weg, sie zu bewegen, ist, eine dieser beiden Zahlen zu bewegen.

## Die drei Dinge, die es tatsächlich kleiner machen

In der Reihenfolge, in der sie helfen:

**1. Machen Sie es kleiner.** Das ist nicht eine von mehreren Möglichkeiten, das ist die Möglichkeit. Größe ist Fläche, also viertelt das Halbieren der langen Kante die Datei: von 640 px auf 320 px macht aus 12 MB etwa 3 MB. Ein GIF auf einer Webseite oder in einem Chatfenster wird ohnehin mit ein paar hundert Pixeln betrachtet. 480 px sind im Werkzeug genau deshalb die Voreinstellung, und 320 px sind eine völlig respektable Antwort.

**2. Nehmen Sie weniger Bilder.** Zehn Bilder, jedes eine Fünftelsekunde gehalten, sind dieselben zwei Sekunden Animation wie zwanzig Bilder zu einer Zehntelsekunde — und die halbe Datei. Flüssigkeit kostet Bytes im direkten Verhältnis, geben Sie sie also nur dort aus, wo die Bewegung sie braucht.

**3. Dithering aus, und die Farben herunter.** Das ist der unintuitive Punkt. Dithering streut ein feines Muster wechselnder Pixel, um Farben vorzutäuschen, die die Palette nicht hat — und dieses Muster ist *Rauschen*, also genau das, was ein verlustfreier Packer nicht packen kann. Bei flachen Grafiken, Bildschirmfotos und Strichzeichnungen kann Ausschalten ein Drittel der Datei sparen und obendrein besser aussehen. Bei Fotografien tauscht es sichtbare Streifenbildung gegen die Ersparnis, also probieren Sie beides und sehen Sie hin.

Von 256 auf 64 Farben herunterzugehen hilft ebenfalls, wenn auch weniger als erhofft: Es verkürzt die Codewörter, statt Pixel zu entfernen.

Wenn nichts davon es klein genug bekommt, lautet die ehrliche Antwort, dass Sie ein Video machen. [Dieselben Bilder in ein MP4 zu verwandeln](https://abox.tools/de/ratgeber/aus-bildern-ein-video-machen/) ergibt vielleicht ein Zehntel der Größe — und überall, wo ein GIF für etwas anderes als ein `<img>`-Element angenommen wird, jedes soziale Netzwerk eingeschlossen, wird es beim Hochladen ohnehin in ein Video verwandelt.

## Wie schnell ein GIF wirklich laufen kann

Das Format speichert die Verzögerung jedes Bildes in Hundertstelsekunden, was nahelegt, Sie könnten 0,01 s verlangen und hundert Bilder pro Sekunde bekommen. Können Sie nicht.

Jeder Browser hebt eine Verzögerung unter zwei Hundertstelsekunden auf eine Zehntelsekunde an. Die Regel stammt aus den 1990ern, als Seiten voller Animationen waren, die so schnell wie möglich laufen sollten, und die Maschinen jener Zeit das nicht überlebten — und sie hat jeden Grund überdauert, aus dem sie eingeführt wurde. Entfernt wurde sie nie, und sie gilt heute für Ihr GIF.

Der praktische Bereich ist also:

- **0,02 s** (50 Bilder pro Sekunde) — das Schnellste, was ein GIF sein darf, und schneller, als es meist sein muss.
- **0,05 s** (20 Bilder pro Sekunde) — flüssige Animation, und der Ausgangspunkt, wenn Sie Bewegung animieren.
- **0,1 s** (10 Bilder pro Sekunde) — der klassische GIF-Look. Halb so viele Bilder, halb so große Datei, und es wirkt gewollt.
- **0,5 s und mehr** — eine Diaschau. Jedes Bild wird angeschaut, nicht animiert.

Alles unter 0,02 s wird nicht angeboten, denn es ist eine Zahl, die in jedem existierenden Browser still zu 0,1 s würde.

## Die Palette, und was sie tatsächlich auswählt

Ein GIF-Bild hält höchstens 256 Farben. Eine Fotografie hat Zehntausende. Irgendetwas muss 256 davon auswählen, und diese Wahl ist es, wie das Ergebnis aussieht — mehr als jede andere Einstellung.

Das Werkzeug bietet zwei Wege, sie zu treffen:

**Beste Farben für jedes Bild** gibt jedem Bild seine eigenen 256. Das sieht am schärfsten aus und ist richtig für eine Reihe unzusammenhängender Fotografien, bei denen jede ohnehin einen völlig anderen Satz will.

**Eine Palette für das ganze GIF** baut eine einzige Tabelle aus allen Bildern zugleich. Nehmen Sie sie, wenn die Bilder eine *Folge* sind — dieselbe Szene, ein paar Augenblicke auseinander. Mit einer Palette je Bild ändert jede Änderung im Bild, welche 256 Farben gewählt werden, und der ganze Hintergrund verschiebt bei jedem Bild leicht seine Farbe. Genau dieses Flimmern lässt ein selbstgemachtes GIF selbstgemacht aussehen. Eine gemeinsame Palette nimmt es weg und macht obendrein die Datei kleiner, weil die Tabelle einmal statt in jedem Bild geschrieben wird.

Weniger Farben — 128, 64, 32 — lohnt sich bei allem Flachen zu probieren. Eine Logo-Animation mit acht Farben verliert bei 32 nichts, und bei einer Fotografie sehen Sie den Unterschied sofort.

![Die Farbeinstellungen: eine Palette mit 128 Farben, die Wahl zwischen einer gemeinsamen Palette und einer je Einzelbild, Dithering aus, dazu eine Übersicht über Bilder, Dauer und geschätzte Größe.](https://abox.tools/screens/make-a-gif-from-images/colours.webp)

Die Palette hat den größten Einfluss auf die Größe und wird von den meisten Werkzeugen versteckt. Die Übersicht darunter bewegt sich mit jeder Änderung.

## Transparenz ist ein Bit, und das ist die ganze Geschichte

Ein GIF-Pixel ist entweder voll gemalt oder ganz unsichtbar. Dazwischen gibt es nichts: kein 50-prozentiger Schatten, keine weiche Kante, kein Verlauf.

Haben Ihre Ausgangsbilder also Transparenz, hält das Einschalten die durchsichtigen Flächen durchsichtig — aber jede kantengeglättete Kante, die ein Übergang von der Form ins Nichts ist, wird auf halbem Weg zu einer harten, sichtbar ausgefransten geschnitten. Runde Formen und Text leiden am meisten.

Wenn Sie wissen, auf welcher Farbe das GIF liegen wird, sieht es jedes Mal besser aus, es auf diese Farbe zu legen. Behalten Sie die Transparenz nur, wenn der Hintergrund, auf dem es landet, wirklich unbekannt ist — und lautet die Antwort „es braucht auf jedem Hintergrund eine weiche Kante“, ist das Format dafür animiertes PNG oder WebP, nicht GIF.

## Reihenfolge, Zeiten, und wie die Schleife sitzt

Ein paar Dinge, die zu wissen schneller geht, als sie herauszufinden:

**Nach Namen sortieren zählt richtig.** Eine Render- oder Exportfolge sortiert so, wie Sie es meinten, also landet `frame_2` vor `frame_10` und nicht dahinter. Nach Datum sortieren bringt eine Kamerarolle zurück in die Reihenfolge der Aufnahme, und das wollen Sie, wenn die Dateinamen wieder bei 0001 begonnen haben.

**Geben Sie dem letzten Bild mehr Zeit.** Eine Schleife, in der jedes Bild gleich lang steht, wirkt unerbittlich. Das letzte Bild etwa eine halbe Sekunde zu halten gibt dem Auge einen Ruhepunkt und lässt das Ganze absichtlich aussehen. Jedes Bild hat dafür seine eigene Standzeit.

**Eine Schleife sollte nicht springen.** Auf das letzte Bild folgt unmittelbar das erste, sind die beiden also sehr verschieden, schnappt die Schleife. Machen Sie sie entweder ähnlich, oder lehnen Sie sich in den Schnitt, indem Sie das letzte Bild halten.

**Einmal abspielen heißt einmal abspielen.** Manche Werkzeuge schreiben eine Schleifenzahl von eins, worüber sich die Dekoder nie ganz einig waren — ein paar spielen es zweimal. „Einmal abspielen“ schreibt hier gar keine Schleifeninformation, und damit geht jeder je gebaute Dekoder gleich um.

![Fünf Einzelbilder in Reihenfolge, jedes mit einem eigenen Feld für die Anzeigedauer, darüber eine Zeile, die alle Dauern auf einmal setzt.](https://abox.tools/screens/make-a-gif-from-images/frames.webp)

Reihenfolge und Timing, beides je Einzelbild änderbar. Alle auf einmal zu setzen ist die Zeile darüber, und genau das will jeder mit mehr als drei Einzelbildern.

## Warum das keinen Server braucht

Ein GIF zu machen sind zwei Aufgaben, die der Browser nicht anbietet: die Palette wählen und die Pixel mit LZW packen. Keine davon ist groß. Zusammen sind es vielleicht vierhundert Zeilen, sie stehen ausgeschrieben im Repository, und sie laufen auf Ihrem eigenen Rechner wie alles andere hier — weshalb die Seite auch mit gezogenem Netzstecker weiterarbeitet.

Dass so viele GIF-Ersteller hochladen, liegt nicht daran, dass die Aufgabe schwer wäre. Es liegt daran, dass ein Server der Ort ist, an dem die Werbung und die Benutzerkonten sind. Nichts daran, eine Reihe Fotografien in eine Animation zu verwandeln, verlangt, dass Ihre Fotografien den Raum verlassen, in dem sie sind.

[Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) nennt vier Prüfungen, die Ihnen dasselbe über jedes Werkzeug sagen, dieses eingeschlossen.
