# Ein GIF in Einzelbilder zerlegen

Die Bilder herauszubekommen kostet einen Drop und einen Klick. Verstehen lohnt sich, was ein „Einzelbild“ in einem GIF überhaupt ist, denn das Format speichert etwas anderes als das, was Sie sehen — und genau daran liegt es, dass Ihr vierzehntes Bild ein Rechteck mit einem Mund darin ist.

[GIF-Zerleger öffnen](https://abox.tools/de/gif-in-einzelbilder-zerlegen/): Jedes Einzelbild einzeln als PNG heraus.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Den [GIF-Zerleger](https://abox.tools/de/gif-in-einzelbilder-zerlegen/) öffnen, das GIF hineinziehen, und jedes Einzelbild erscheint als PNG zum Herunterladen — einzeln oder alle zusammen als eine ZIP-Datei. Wenn Sie die Einstellungen in Ruhe lassen, bekommen Sie genau das, was die meisten meinen: jedes Bild als vollständiges Bild, so wie es in diesem Moment der Animation aussieht.

Der Rest dieser Seite handelt von den drei Dingen, die danach überraschen: ein Bild, das nur ein kleiner Ausschnitt ist; Transparenz, die anderswo schwarz wird; und Zeiten, die es nicht mehr gibt, sobald die Bilder einzelne Dateien sind.

## Was ein GIF-Einzelbild wirklich ist

Ein GIF ist kein Stapel Bilder. Es ist *ein* Bild, gefolgt von einer Reihe von Flicken.

Jedes Bild nach dem ersten speichert nur das Rechteck, das sich geändert hat, dazu eine Regel, was danach mit der Leinwand geschehen soll. Alles andere auf dem Schirm ist schlicht das, was die früheren Bilder dort hinterlassen haben. Eine Person, die vor einer stillen Wand redet, kostet ein Rechteck Gesicht pro Bild statt eines ganzen Bildes pro Bild, und genau das ist der Grund, warum ein Format ohne Bewegungsschätzung und ohne verlustbehafteten Schritt nicht völlig unbrauchbar ist.

Es gibt also zwei verschiedene, gleichermaßen ehrliche Antworten auf „gib mir Bild 14“, und das Werkzeug bietet beide an:

**Das Bild, wie es erscheint.** Das vollständige Bild in diesem Moment: Bild 14, gezeichnet über alles, was davor war. Das ist die Voreinstellung, und das wollen Sie für eine Übersicht, ein Vorschaubild, ein Standbild zum Posten oder für Bilder, die in einen Videoschnitt gehen.

**Nur die Pixel, die dieses Bild speichert.** Der Flicken selbst, in seiner eigenen Größe, an seiner eigenen Stelle, und alles, was er nicht trägt, bleibt transparent. Bild 14 sind dann vielleicht ⁦60 × 40⁩ Pixel Mund. Das ist die Ansicht, die erklärt, wohin die Bytes eines GIFs gegangen sind, und die Sie wollen, wenn Sie die Animation bearbeiten und nicht Bilder daraus ernten.

An Ihrer Datei ist nichts falsch, wenn ein gespeichertes Bild wie ein Fetzen aussieht. Das ist die Datei.

![Zwölf nummerierte Einzelbilder einer Animation, jedes als Bild mit der Zeit, die es stehen bleibt.](https://abox.tools/screens/split-a-gif-into-frames/frames.webp)

Jedes Einzelbild als ganzes Bild, was nicht das ist, was in der Datei steht: um diesen Unterschied geht es hier.

## Die Aufräumregel, und warum manche Bilder Löcher hinterlassen

Jedes Bild trägt außerdem eine von vier Anweisungen dazu, was mit seinem Rechteck geschieht, bevor das nächste gezeichnet wird. Das Werkzeug zeigt sie in der gespeicherten Ansicht unter jedem Bild an:

**Bleibt stehen.** Der Normalfall. Der Flicken bleibt, wo er gelandet ist, und das nächste Bild zeichnet darüber.

**Räumt seine Fläche danach.** Das Rechteck wird gelöscht, bevor das nächste Bild landet. So arbeitet eine Animation mit einem bewegten transparenten Objekt, und das ist auch die klassische Ursache flackernder GIFs.

**Stellt wieder her, was darunter war.** Die Leinwand geht zurück auf das, was sie vor diesem Bild zeigte — ein Stempel, dann ein Rückgängig. Selten, und die Regel, die selbstgebaute GIF-Leser am häufigsten falsch machen.

Eine Einzelheit, die zählt, wenn Sie Werkzeuge vergleichen: Die Spezifikation sagt, „räumt seine Fläche“ solle die *Hintergrundfarbe* wiederherstellen, aber jeder Browser seit den 1990ern räumt stattdessen auf *transparent*, weil die Animationen jener Zeit genau das annahmen. Dieses Werkzeug folgt bewusst den Browsern, damit die Bilder, die Sie bekommen, die Bilder sind, die Sie gesehen haben.

![Die Einstellungskarte: die Wahl zwischen dem Einzelbild, wie es erscheint, und dem rohen Ausschnitt aus der Datei, dazu eine Hintergrundfarbe für die durchsichtigen Stellen.](https://abox.tools/screens/split-a-gif-into-frames/settings.webp)

„Wie es erscheint“ spielt die Entsorgungsregeln nach und gibt Ihnen Bilder. Der andere Modus gibt Ihnen, was wirklich in der Datei steht, Löcher inbegriffen.

## Was mit der Transparenz passiert

GIF-Transparenz ist ein Bit. Ein Pixel ist entweder gemalt oder unsichtbar, und dazwischen gibt es nichts — keine weichen Kanten, keine halben Schatten. Deshalb hat ein GIF mit transparentem Hintergrund diesen harten, leicht ausgefransten Umriss.

PNG speichert genau das, verlustfrei, sodass die Bilder mit unversehrter Transparenz herauskommen und nichts erfunden wird. Behalten Sie sie, wenn die Bilder irgendwohin gehen, das Transparenz versteht.

Füllen Sie sie stattdessen mit einer Farbe, wenn nicht. Software, die einen Alphakanal ignoriert, zeigt ihn meist schwarz an, sodass ein Bild, das im Browser gut aussah, mit schwarzem Hintergrund ankommt — und ein gespeicherter Flicken, der fast überall transparent ist, kommt als schwarzes Rechteck mit einem Mund darin an. Die Farbe vorher zu wählen ist der Ausweg. Sie wird in das PNG geschrieben und lässt sich nachträglich nicht mehr entfernen, was der einzige Grund ist, warum das nicht die Voreinstellung ist.

## Die Zeiten, die die Bilder nicht tragen können

Ein PNG hat keinen Platz, um festzuhalten, wie lange es zu sehen war. Zerlegen Sie eine Animation in PNGs, sind die Zeiten weg — und das zählt in dem Moment, in dem Sie sie wieder zusammensetzen wollen.

Dafür ist die `frames.txt` im ZIP da. Sie führt Verzögerung, Position und Größe jedes Bildes auf, sodass die Animation im [GIF-Ersteller](https://abox.tools/de/gif-erstellen/) oder anderswo wieder aufgebaut werden kann. Sie kostet ein paar Kilobyte, und es gibt keine Möglichkeit, sie später zu rekonstruieren.

Zwei Dinge über GIF-Verzögerungen, die alle erwischen:

**Die Einheit sind Hundertstelsekunden**, der feinste Schritt des Formats ist also 0,01 s. Ein exakt 30 fps schnelles GIF gibt es nicht; 0,03 s pro Bild sind 33,3 fps und 0,04 s sind 25.

**Alles unter 0,02 s wird mit 0,10 s abgespielt.** Browser deckeln das seit den 1990ern — eine Regel, geschrieben für die rotierenden Globen jener Zeit und nie wieder entfernt. Ein GIF, dessen Datei 0,01 s pro Bild sagt, behauptet 100 fps und läuft mit 10. Das Werkzeug zeigt die Verzögerung so an, wie sie wirklich abgespielt wird, und nennt daneben, was in der Datei steht, wenn beides auseinandergeht — denn diese Lücke ist der Grund, warum ein zerlegtes und wieder zusammengesetztes GIF langsamer sein kann als das Original.

## Bildnummern, und warum sie aufgefüllt sind

Die Bilder kommen als `name-001.png`, `name-002.png` heraus, ab eins gezählt und auf die Breite der letzten Zahl aufgefüllt. Das ist keine Verzierung: `bild9.png` sortiert in jedem Dateimanager und in den meisten Programmen, die eine Sequenz importieren, *hinter* `bild10.png`, weil sie Text sortieren und nicht Zahlen. Aufgefüllte Namen sortieren überall richtig, und jedes Schnittprogramm, das eine Bildsequenz importiert, erwartet sie.

Eine lange Animation mit „jedes zweite Bild behalten“ auszudünnen, nummeriert nichts um. Bild 42 heißt weiter Bild 42, sodass sich die Dateien am Original und an der Zeitenliste ausrichten lassen.

## Warum das keinen Server braucht

Ein GIF zu lesen sind zwei Aufgaben: durch die Blöcke der Datei laufen und die LZW-Kompression rückgängig machen, in die ihre Pixel eingepackt sind. Zusammen sind das ein paar hundert Zeilen, sie stehen ausgeschrieben im Repository, und sie laufen auf Ihrem eigenen Rechner — weshalb die Seite auch mit gezogenem Netzstecker weiterarbeitet.

Ihr Browser kann ein GIF längst abspielen, nur rückt er die Teile nicht heraus: Ein `<img>` gibt Ihnen eine Animation, das Zeichnen auf eine Leinwand gibt Ihnen für immer das erste Bild, und die eine Schnittstelle, die mehr kann, fehlt in Safari. Also wird das Format hier selbst gelesen, in jedem Browser auf dieselbe Weise — und dass es selbst gelesen wird, ist überhaupt erst der Grund, warum die Flicken und die Aufräumregeln gezeigt werden können.

[Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/) nennt vier Prüfungen, die Ihnen dasselbe über jedes Werkzeug sagen, dieses eingeschlossen.
