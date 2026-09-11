# Was wirklich in einem GIF steckt

Ein GIF ist ein Stapel Rechtecke, jedes mit einer Uhr und einer Farbtabelle, und fast jede Klage über das Format kommt von einem dieser drei Dinge. Hier steht, was jeder Teil tut — und wie Sie herausfinden, welcher davon die Größe Ihrer Datei verbraucht.

[GIF-Analyse öffnen](https://abox.tools/de/gif-analysieren/): Einzelbilder, Anzeigedauern, Farbtabellen und wohin jedes Byte gegangen ist.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Ein GIF ist eine Leinwand, eine Liste von Rechtecken, die darauf gemalt werden, und eine Farbtabelle, die sagt, was die Zahlen in diesen Rechtecken bedeuten. Jedes Rechteck trägt drei Dinge mit sich: wie lange es stehen bleiben soll, was danach mit ihm geschieht, und wahlweise eine eigene Farbtabelle.

Fast alles, was Leute an diesem Format überrascht, kommt aus dieser Liste. Ist Ihr GIF riesig, dann sind die Rechtecke jedes Mal die ganze Leinwand, oder es stecken dreihundert Farbtabellen darin. Läuft es zu langsam, liegen die Verzögerungen unter einer Untergrenze, die kein Browser unterschreitet. Verschmiert es, ist es das Feld namens *Aufräumen*.

Um zu sehen, welches davon es bei einer bestimmten Datei ist, öffnen Sie die [GIF-Analyse](https://abox.tools/de/gif-analysieren/) und ziehen sie hinein. Der Rest dieser Seite erklärt, was die Zahlen bedeuten.

![Die Übersichtskarte einer GIF-Datei: ihre Version, Leinwandgröße, Dateigröße, Anzahl der Einzelbilder, Wiederholungen und Farben.](https://abox.tools/screens/whats-inside-a-gif/facts.webp)

Alles, was ein Abspielprogramm nie zeigt, aus einer Datei gelesen.

## Einzelbilder sind Rechtecke, keine Bilder

Das ist der Teil, der alle überrascht, die GIFs bisher nur abgespielt gesehen haben. Ein Einzelbild ist kein Bild der Animation in diesem Moment. Es ist ein Rechteck mit eigener Position und eigener Größe, gemalt auf das, was die vorherigen Bilder hinterlassen haben.

Dieses Rechteck kann die ganze Leinwand sein, und in einer schlecht gemachten Datei ist es das immer. Ein GIF darf aber nur den Teil des Bildes speichern, der sich seit dem letzten Mal geändert hat — und wo der größte Teil des Bildes stillsteht, ist das der Unterschied zwischen einer Datei von 12 MB und einer von 900 KB. Deshalb kann eine Bildschirmaufnahme eines weitgehend ruhenden Fensters klein sein, und dieselbe Aufnahme aus einem schludrigen Konverter eben nicht.

Beim Zusehen erkennen Sie nicht, was Sie haben. Beides sieht gleich aus. Der einzige Weg ist, sich anzusehen, was jedes Einzelbild speichert — genau dafür hat die Analyse eine eigene Ansicht: Stellen Sie sie auf *nur was jedes Bild speichert*, und Sie sehen entweder eine Reihe kleiner Formen auf transparentem Grund, dann hat der Encoder seine Arbeit gemacht, oder immer wieder das ganze Bild, dann hat er es nicht.

Bewegungsschätzung gibt es in diesem Format nirgends. Nichts wird je als „wie eben, nur vier Pixel weiter links“ gespeichert, so wie ein Video-Codec das täte. Der Trick mit dem geänderten Rechteck ist die einzige Ersparnis, die GIF hat, und er ist eine Menge wert.

## Verzögerungen und die Untergrenze, die jeder Browser durchsetzt

Jedes Einzelbild speichert in Hundertstelsekunden, wie lange es zu halten ist. Eine andere Einheit hat das Format nicht, also ist das Schnellste, was eine Datei verlangen kann, 0,01 Sekunden — hundert Bilder pro Sekunde — und das Längste sind etwa 655 Sekunden.

Hundert Bilder pro Sekunde wird sie nicht bekommen. **Jeder Browser rundet eine Verzögerung unter 0,02 Sekunden auf 0,10 auf.** Die Regel wurde 1996 in Netscape Navigator geschrieben, für die rotierenden Globen und animierten Baustellenschilder jener Zeit, und jeder Browser seither hat sie übernommen. Entfernt hat sie nie jemand, und niemand wird es tun.

Ein GIF, dessen Bilder alle 0,01 s sagen, läuft also mit zehn Bildern pro Sekunde, nicht mit hundert. Es läuft zehnmal langsamer, als das erzeugende Programm es meinte, und die Datei gibt darauf keinen Hinweis: Die Verzögerungen darin sind genau die, die verlangt wurden. Das ist die mit Abstand häufigste Überraschung des Formats, und deshalb meldet die Analyse zwei Laufzeiten — was die Datei sagt, und was ein Browser wirklich daraus macht.

Der Ausweg ist, wo auch immer die Datei entsteht, 0,02 statt 0,01 zu schreiben. Das ergibt 50 Bilder pro Sekunde, was die wirkliche Obergrenze ist und schneller, als irgendetwas sein muss. In der Praxis sind 0,05 s — zwanzig Bilder pro Sekunde — etwa so flott, wie zu verlangen sich lohnt.

Noch etwas verraten die Verzögerungen. Sind sie alle gleich, wurde die Datei aus Bildern mit fester Rate gebaut. Streuen sie — hier 0,04, dort 0,11 —, dann hat etwas ein Video umgewandelt und Bilder weggelassen und die Nachbarn gedehnt, um die Lücken zu decken. Und ist die letzte deutlich länger als der Rest, ist das Absicht: So lässt man eine Animation vor dem nächsten Durchlauf innehalten.

## Aufräumen: das Feld, das über das Verschmieren entscheidet

Jedes Einzelbild sagt, was auf dem Schirm bleiben soll, wenn seine Zeit um ist. Es gibt vier mögliche Antworten, und sie zu kennen lohnt sich, denn drei der vier Arten, wie eine Animation falsch aussehen kann, sind ein falscher Wert in diesem Feld.

- **Stehen lassen.** Das nächste Bild malt direkt darüber. Richtig, wenn die Bilder deckend sind und einander vollständig verdecken, und die billigste Möglichkeit, weil nichts geräumt werden muss.
- **Auf den Hintergrund zurückräumen.** Das Rechteck des Bildes wird gelöscht, bevor das nächste zeichnet. Das braucht Transparenz: Ohne sie zeigen die durchsichtigen Teile des nächsten Bildes das vorherige darunter, und eine Animation aus einzelnen Bildern wird zu einem Stapel davon.
- **Wiederherstellen, was darunter war.** Was vor diesem Bild auf der Leinwand stand, kommt zurück. So wird ein kleines Objekt gespeichert, das sich über einen ruhenden Hintergrund bewegt — jedes Bild malt das Objekt, dann kommt der Hintergrund wieder, und geschrieben wird immer nur das Rechteck des Objekts.
- **Nicht angegeben.** Die Datei hat nichts gesagt. Jeder Betrachter behandelt das als „stehen lassen“, was meist richtig ist und gelegentlich der Grund, warum ein transparentes GIF verschmiert.

Eine Einzelheit, an der Spezifikation und Wirklichkeit auseinandergehen: „Auf den Hintergrund zurückräumen“ nennt eine Hintergrundfarbe im Kopf der Datei, und jeder Browser ignoriert sie und räumt stattdessen auf transparent. Das tun sie seit fünfundzwanzig Jahren. Eine Datei, die darauf baut, dass diese Hintergrundfarbe erscheint, sieht für den, der sie gemacht hat, im Programm, in dem er sie gemacht hat, richtig aus — und überall sonst falsch.

## Farbtabellen und die 768 Bytes, die sie kosten

Ein GIF-Pixel ist keine Farbe. Es ist eine Zahl, die in eine Tabelle von höchstens 256 Farben zeigt, jede zu drei Bytes gespeichert. Eine volle Tabelle sind also 768 Bytes, und eine Datei kann eine haben, die sich alle teilen, oder eine pro Bild, oder beides.

Beide Anordnungen sind zulässig, und sie tauschen unterschiedlich:

- **Eine gemeinsame Tabelle** kostet 768 Bytes für die ganze Datei und hält die Farben zwischen den Bildern ruhig. GIF-Flimmern — dieses unangenehme Schimmern auf einer aus Video gemachten Datei — ist sehr oft nur die Palette, die von Bild zu Bild springt.
- **Eine Tabelle pro Bild** erlaubt jedem Bild Farben, die die gemeinsame nicht hat, was zählt, wenn die Szene komplett wechselt. Sie kostet jedes Mal 768 Bytes. Bei einer Animation mit 300 Bildern sind das 230 KB Farbtabellen, bevor auch nur ein Pixel gespeichert ist.

Es gibt einen zweiten, leiseren Preis. Die Länge einer Farbtabelle muss eine Zweierpotenz sein, also bekommt ein Bild mit neun Farben trotzdem eine Tabelle mit sechzehn, und eines mit 130 trotzdem 256. Etwas Aufrunden lässt sich nicht vermeiden. Eine Datei, deren Tabellen fünftausend Farben angeben, auf die ihre Pixel nie verweisen, ist etwas anderes: Paletten, die für ein anderes Bild gebaut wurden als das, welches im Einzelbild gelandet ist. Die Analyse markiert die ungenutzten Einträge, damit das auf einen Blick zu sehen ist.

## Wohin die Bytes tatsächlich gehen

Jedes Byte eines GIFs liegt an einer von wenigen Stellen, und es lohnt sich zu wissen, welche das sind, bevor man eine Datei für zu groß erklärt.

- **Komprimierte Pixel.** Bei einer gesunden Datei fast alles. Das Bild selbst, durch LZW gedreht — ein Kompressionsverfahren von 1984, entworfen für Bildschirmfotos von Tabellenkalkulationen, weshalb es bei flachen Farben gut und bei Fotografien schlecht abschneidet.
- **Farbtabellen.** 768 Bytes pro voller Tabelle, wie oben.
- **Kopfdaten je Bild.** Acht Bytes Zeitangabe und elf Bytes Beschreibung für jedes Bild. Bei einer normalen Datei nichts; bei einer Animation aus zweitausend winzigen Bildern 38 KB.
- **Blockrahmen.** Die komprimierten Daten werden in Stücke von höchstens 255 Bytes geschnitten, jedes mit einem Längenbyte davor. Etwa ein Byte von 256, unvermeidlich, und sehenswert, weil es sonst unsichtbar bleibt.
- **Metadaten.** Kommentare, Farbprofile und XMP-Pakete. Das ist das, was die wirklich absurden Ergebnisse hervorbringt: Ein Bildbearbeitungsprogramm kann 40 KB XML hinterlassen, die eine Bearbeitung von vor Jahren beschreiben, und bei einem kleinen GIF ist das der größte Teil der Datei. Kein Betrachter zeichnet davon irgendetwas.

Sich das als Tabelle anzusehen statt zu raten, lohnt sich, weil die Antwort bei verschiedenen Dateien verschieden ausfällt und der Ausweg aus der Antwort folgt. Eine Datei, die zu 95 % aus komprimierten Pixeln besteht, ist schlicht viel Bild, und da helfen nur weniger Bilder, eine kleinere Größe oder weniger Farben. Eine Datei, die zu 30 % aus Farbtabellen oder zu 40 % aus XMP besteht, hat ein viel billigeres Problem.

![Ein Balken, der eine GIF-Datei danach aufschlüsselt, wohin ihre Bytes gegangen sind, mit einer Zeile je Einzelbild samt Größe und Anteil.](https://abox.tools/screens/whats-inside-a-gif/budget.webp)

Wohin die Bytes wirklich gegangen sind, Einzelbild für Einzelbild. Eine zu große GIF-Datei ist fast immer aus einem Grund zu groß, den das hier offenlegt.

## Die Schleife ist nicht Teil des Formats

In der GIF-Spezifikation gibt es kein Feld, das sagt, dass eine Animation sich wiederholt. Die Schleife kommt aus einem Block, den Netscape 1995 erfunden hat — eine „Anwendungserweiterung“ mit der Zeichenkette `NETSCAPE2.0` darin —, den trotzdem alle umgesetzt haben und der heute in jedem animierten GIF im Internet steckt.

Das heißt: Eine Datei ohne diesen Block läuft in jedem Browser genau einmal und hört auf, und wirkt für den, der sie gemacht hat, kaputt. Wenn eine Animation nur einmal durchläuft, fehlt dieser Block; das gehört zum Ersten, was zu prüfen sich lohnt, und in keinem Betrachter ist es zu sehen.

Der Block kann auch eine Anzahl nennen — fünfmal abspielen und aufhören. Null heißt für immer, und das steht in fast jeder Datei.

## Was ein GIF sonst noch mit sich trägt

Drei Blöcke, die kein Bild enthalten und die jeder Betrachter überspringt:

- **Kommentare.** Freier Text, meist der Name dessen, was die Datei geschrieben hat, gelegentlich etwas, das der Autor nicht zur Veröffentlichung gewählt hätte. Nichts zeigt ihn an, und jede Kopie der Datei trägt ihn mit.
- **XMP.** Adobes XML-Metadaten: was die Datei bearbeitet hat, wann, manchmal wer. Es kommt mit einem 258 Byte langen magischen Anhängsel am Ende — ein Trick, damit die Blocklängen aufgehen, weshalb naives Auslesen einen Bildschirm voll Binärzeug ergibt.
- **Klartext.** Ein Block aus der Spezifikation von 1989, der den Betrachter bittet, Text in einem Raster von Zellen über das Bild zu zeichnen. Umgesetzt hat ihn nie irgendetwas. Hat eine Datei so einen Block, erscheint nicht, was darin steht.

Von allen dreien sollte man wissen, bevor man eine Datei irgendwohin schickt: Es sind die Teile eines GIFs, die etwas über Sie sagen können, und sie überstehen jede Kopie und jedes erneute Hochladen, solange sie nicht etwas absichtlich entfernt.

## Eine beschädigte Datei lesen

GIFs werden abgeschnitten — ein Download, der stehen blieb, eine Datei von einer sterbenden Platte, etwas, wovon ein Programm nur die Hälfte geschrieben hat. Weil das Format ein Strom von Blöcken ist und keine indizierte Struktur, ist ein abgeschnittenes GIF meist bis zu der Stelle, an der es aufhört, noch lesbar: Jedes Bild vor dem Bruch ist unversehrt und vollständig.

Das ist gut zu wissen, weil die meiste Software die Datei einfach abweist. Eine Analyse, die so weit liest, wie sie kann, und sagt, wo sie stehen blieb, sagt Ihnen wenigstens, wie viel überlebt hat und ob der fehlende Teil ein Bild ist oder die letzten zweihundert.

Das umgekehrte Problem gibt es auch: Bytes, die *hinter* der Endmarke der Datei liegen. Jeder Dekoder hört an dieser Marke auf, also werden sie nie gelesen und nie gezeichnet, und meist sind sie eine zweite Datei, die irgendetwas fälschlich angehängt hat. Sie sind reines Gewicht, und sie abzuschneiden verliert nichts.

## Nichts davon braucht ein Hochladen

Die Struktur eines GIFs zu lesen ist keine anspruchsvolle Aufgabe — es ist ein Gang durch eine Liste von Blöcken und ein kleiner Entpacker —, und es gab nie einen technischen Grund, die Datei dafür an einen Server zu schicken. Die [GIF-Analyse](https://abox.tools/de/gif-analysieren/) hier erledigt das Ganze auf der Seite: den Gang durch die Blöcke, das LZW, die auf dem Schirm gezeichneten Bilder und die Byte-Abrechnung.

Das zählt bei dieser Aufgabe mehr als bei den meisten, denn ausgerechnet die Dateien, die man auseinandernehmen will, sind oft die, bei denen man sich am unsichersten ist, ob man sie teilen möchte — etwas Wiederhergestelltes, etwas, das jemand geschickt hat, etwas mit einem Kommentarblock darin, den man noch nicht gelesen hat. Die [längere Erörterung zum Hochladen von Dateien](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) gilt hier so stark wie irgendwo sonst auf dieser Site.
