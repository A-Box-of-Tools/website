# So kürzen Sie ein Video, ohne es neu zu kodieren

Durch Kopieren lässt sich ein Video kürzen, ohne seine kodierten Frames zu verändern. Dieser Leitfaden erklärt die Grenzen durch Keyframes, wann sich zuverlässig kopieren lässt und wann Sie eine Neukodierung wählen sollten.

[Video-Schneider öffnen](https://abox.tools/de/video-schneiden/): Beim Abspielen markieren, was bleiben soll. Und alles davon als ein Video zurückbekommen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [Video-Schneider](https://abox.tools/de/video-schneiden/), legen Sie den Clip ab und markieren Sie mit `I` und `O` jeden gewünschten Teil. Wählen Sie dann das Exportverfahren. Bei MP4, MOV oder M4V übernimmt „Jedes Byte behalten“ die behaltenen Frames und den Ton unverändert in die neue Datei. Das ist für einen Abschnitt möglich oder für mehrere, wenn jeder spätere Abschnitt auf einem Keyframe beginnt. Andere Auswahlen benötigen das ausdrücklich als Neukodierung bezeichnete Verfahren.

Kopieren kostet keine Qualität und geht schnell: Eine Minute aus einer vier Gigabyte großen Aufnahme herauszuschneiden dauert ungefähr so lange, wie diese Minute auf den Datenträger zu schreiben. Die Frames werden über Verweise übernommen statt geladen. Die Wahl hängt davon ab, wo jeder behaltene Abschnitt beginnt. Darum geht es auf dieser Seite.

## Warum ein Schnitt überhaupt keine Qualität kosten muss

Bei einer Auswahl, die sich kopieren lässt, kann jeder behaltene Frame exakt in seiner ursprünglichen Kodierung bleiben. Die vorhandenen Bytes zu übernehmen vermeidet das Dekodieren und erneute Kodieren. So wird das Video gekürzt, ohne einen weiteren verlustbehafteten Kodierungsschritt hinzuzufügen.

Wenn Kopieren die gewünschten Schnittzeiten erhalten kann, liest das Werkzeug den Dateiindex, ermittelt die benötigten kodierten Frames und schreibt deren Bytes mit einem neuen Index in einen neuen Container. Auf diesem Weg wird nichts dekodiert.

Eine Neukodierung ist sinnvoll, wenn sich die gewünschten Schnittzeiten durch Kopieren nicht zuverlässig erhalten lassen. Sie dauert meist länger, weil der Browser jedes behaltene Bild dekodieren und kodieren muss. Beim Kopieren begrenzt vor allem die Schreibgeschwindigkeit die Dauer.

## Keyframes, und warum Ihr Schnitt früher sitzen kann

Aus dieser einen Beschränkung folgt alles Übrige.

Video wird nicht als Folge vollständiger Bilder gespeichert, das wäre gewaltig. Die meisten Einzelbilder halten nur fest, worin sie sich von ihren Nachbarn unterscheiden, und lassen sich deshalb nicht für sich allein dekodieren, man braucht die Bilder ringsherum. Nur ein **Keyframe** steht als vollständiges Bild für sich, und Keyframes liegen typischerweise eine bis zehn Sekunden auseinander.

Setzen Sie Ihre Marke also zwei Sekunden hinter den letzten Keyframe, kann ein Werkzeug, das Einzelbilder kopiert, dort nicht anfangen. Die Bilder an Ihrer Marke sind ohne den Anlauf davor nicht lesbar, und deshalb muss es den ganzen Abschnitt ab dem Keyframe vor Ihrer Marke mitnehmen.

Für den ersten behaltenen Abschnitt kann das Dateiformat angeben: *ab hier abspielen*. Die zusätzlichen Frames bleiben in der Datei, und eine Schnittmarke weist den Player an, sie zu überspringen. Player, die diese Anweisung befolgen, beginnen an der Markierung. Ein Player, der sie ignoriert, kann auch die früheren Frames zeigen.

Nicht abgespielte Frames an einer späteren Schnittstelle können dazu führen, dass Browser einen Abschnitt zu früh zeigen, selbst wenn die Schnittliste korrekt ist. Deshalb lässt das Werkzeug Kopieren nicht zu, wenn ein Abschnitt nach dem ersten zwischen Keyframes beginnt. Es erklärt den Grund und überlässt Ihnen die ausdrückliche Wahl des Verfahrens mit Neukodierung.

## Wann eine Neukodierung die bessere Wahl ist

„Genau hier schneiden“ dekodiert ab dem vorherigen Keyframe, verwirft Frames außerhalb der markierten Abschnitte und kodiert jeden behaltenen Videoframe neu. Das betrifft nicht nur den Anfangsabschnitt. Es dauert länger als Kopieren und kann die Bildqualität im gesamten behaltenen Video verringern. Der Ton wird kopiert, wenn sein Format dies erlaubt.

Wählen Sie dieses Verfahren, wenn Kopieren für Ihre Auswahl nicht verfügbar ist oder wenn die Ausgabe mit den behaltenen Frames beginnen soll, ohne sich auf eine anfängliche Schnittmarke zu verlassen. Kopieren bleibt für einen Abschnitt oder für mehrere mit späteren Anfängen auf Keyframes sinnvoll, sofern der empfangende Player die anfängliche Schnittmarke korrekt verarbeitet.

Sie können den Anfang eines Abschnitts auch auf einen Keyframe verschieben, der auf der Zeitleiste angezeigt wird. Dadurch kann Kopieren für einen späteren Abschnitt ohne Neukodierung möglich werden. Das ändert jedoch, welches Material Sie behalten. Richten Sie die Entscheidung deshalb nach dem benötigten Inhalt.

![Die Export-Karte: das Verfahren, ein Qualitätsregler, ein Schalter für den Ton und eine Übersicht über Stücke, Länge und Größe.](https://abox.tools/screens/trim-a-video/summary.webp)

In der Übersicht fällt die Entscheidung dieses Abschnitts: was die Kopie kostet und was stattdessen die Neukodierung kosten würde.

## Ein Stück aus der Mitte herausnehmen

Einen Abschnitt herauszuschneiden ist etwas anderes, als einen zu behalten, und dass es überhaupt geht, ist erwähnenswert, weil viele Werkzeuge nur das Zweite können. Markieren Sie den Teil, den Sie nicht wollen, wählen Sie „herausschneiden“, und was links und rechts übrig bleibt, wird zu einem Clip zusammengefügt, mit dem Ton im Takt.

Kopieren kann die übrigen Teile verbinden, wenn jeder Teil nach dem ersten auf einem Keyframe wieder einsetzt. Benötigt ein späterer Teil nicht abgespielte Frames vor seinem Anfang, wählen Sie stattdessen „Genau hier schneiden“. Die unten beschriebene Aufzeichnung kann keine getrennten Teile verbinden, weil sie einen ununterbrochenen Durchlauf von einem Abspielkopf aufzeichnet.

![Die Zeitleiste mit zwei markierten Abschnitten und darunter eine Tabelle mit Anfang, Ende und Länge jedes Abschnitts sowie der behaltenen Gesamtzeit.](https://abox.tools/screens/trim-a-video/marks.webp)

Zwei Stücke aus einem Clip behalten. Die Tabelle ist änderbar, eine um eine Fünftelsekunde zu spät gesetzte Marke lässt sich also eintippen statt neu setzen.

## Formate, und der Weg über die Aufzeichnung

**MP4, M4V und MOV** werden direkt gelesen, gleich welcher Codec darin steckt, ob H.264, HEVC, AV1 oder VP9. Einzelbilder zu kopieren heißt nicht, sie zu dekodieren, dieser Weg funktioniert also selbst bei einem Codec, für den Ihr Browser gar keinen Decoder besitzt. Eine angenehme Folge davon, sich die Bilder erst gar nicht anzusehen.

**Alles Übrige, was Ihr Browser abspielen kann**, allen voran WebM, wird gekürzt, indem es abgespielt und das Ergebnis dabei aufgezeichnet wird. Das klappt, hat aber zwei Kosten. Es dauert genau so lange, wie der Abschnitt lang ist, und Bild und Ton werden neu kodiert.

**AVI, WMV, FLV und die meisten MKVs** kann der Browser weder lesen noch abspielen, und das Werkzeug sagt Ihnen das, statt auf halber Strecke steckenzubleiben. Wandeln Sie die vorher mit etwas nach MP4 um, das damit zurechtkommt.

## Zwei Dinge, die anderswo klammheimlich schiefgehen

**Die Drehung.** Ein Handy filmt im Querformat und schreibt eine Drehanweisung in die Datei, statt die Pixel zu drehen. Ein Werkzeug, das Einzelbilder kopiert, muss diese Anweisung mitnehmen, sonst kommt Ihr Hochformat-Clip quer heraus, und das ist die klassische Art, ein geschnittenes Video zu ruinieren. Der exakte Weg dreht die Bilder hier beim Neukodieren gleich mit und schreibt eine Datei, die gar keine Drehung mehr braucht.

**Die Ton-Synchronität.** Ton und Bild liegen als getrennte Ströme mit eigenem Timing in der Datei, und sie werden nicht an denselben Stellen zerteilt. Bringt man beide am Schnitt nicht bewusst in Deckung, läuft der Ton davon. Auf dem Kopierweg wird der Ton hier Sample für Sample übernommen, ohne dekodiert zu werden, und ist damit Byte für Byte das, was in der Datei stand. Eine Edit-Markierung hält ihn auf eine Tausendstelsekunde genau am Bild.

## Kürzen ist nicht Zuschneiden

Zwei Wörter, die ständig füreinander einspringen. Kürzen ändert die Länge des Clips, Zuschneiden die Form des Bildes. Wollen Sie eine quadratische Fassung eines Querformatvideos oder die schwarzen Balken an den Seiten los, ist der [Video-Zuschneider](https://abox.tools/de/video-zuschneiden/) zuständig. Anders als beim Kürzen muss dabei neu kodiert werden, aus dem Grund, den [sein Ratgeber](https://abox.tools/de/ratgeber/video-bildausschnitt-aendern/) erklärt.

## Warum das keinen Upload braucht, hier erst recht nicht

Video ist der Dateityp, bei dem am ehesten alle mit einem Upload rechnen. Die Dateien sind groß, die Arbeit klingt schwer. Beim Kürzen trifft das am wenigsten zu, denn auf dem Kopierweg wird die Datei kaum gelesen. Das Werkzeug läuft den Index ab, ermittelt, welche Byte-Bereiche bleiben sollen, und schreibt sie heraus. Vier Gigabyte auf einen Server zu schieben, damit der das erledigt, wäre die langsamste Anordnung, die sich denken lässt.

Es ist zugleich der Dateityp, bei dem ein Upload am meisten kostet, wenn man ihn lieber vermieden hätte, denn Video trägt Gesichter, Stimmen, Wohnungen und Orte auf eine Weise, wie es ein Dokument nie tut. Netzfunktionen hat das Werkzeug hier keine, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns.

Wer lieber prüft als glaubt, trennt die Internetverbindung und schneidet trotzdem einen Clip. Drei weitere Proben dieser Art stehen in [Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)
