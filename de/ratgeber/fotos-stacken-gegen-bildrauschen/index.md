# So stacken Sie Fotos gegen Bildrauschen oder um Leute zu entfernen

Eine Serie enthält mehr Information als jede einzelne Aufnahme. Ihr Mittelwert senkt unabhängiges zufälliges Rauschen; der mittlere Wert jedes Pixels kann Dinge entfernen, die in weniger als der Hälfte der Aufnahmen vorkamen. Welche Methode passt, hängt davon ab, was sich bewegt hat.

[Bild-Stacker öffnen](https://abox.tools/de/bilder-stacken/): Zwanzig Aufnahmen werden eine, ohne zwanzig Uploads und ohne RAW-Konverter.

Zuletzt aktualisiert 8. Oktober 2026

## Die kurze Antwort

Öffnen Sie den [Bild-Stacker](https://abox.tools/de/bilder-stacken/), ziehen Sie die ganze Serie hinein und wählen Sie die Methode danach, was weg soll:

- **Rauschen**, und nichts hat sich bewegt — Mittelwert.
- **Rauschen**, und etwas hat sich bewegt — Sigma-Clipping.
- **Leute, Autos, ein Flugzeug** — Median.
- **Ein dunkler Himmel, der Sternspuren werden soll** — Aufhellen.
- **Eine Makroaufnahme mit fast keiner Schärfentiefe** — Focus Stacking.

Beginnen Sie zur Rauschminderung mit **Automatisch mit Perspektivkorrektur**, auch bei Nachtaufnahmen vom Stativ: Die Sterne bewegen sich, selbst wenn die Kamera stillsteht. Wählen Sie **Nein** für beabsichtigte Sternspuren oder Aufnahmen, die bereits zusammenpassen. RAW-Dateien können direkt hinein, wenn eine brauchbare JPEG-Vorschau enthalten ist. Die Zeile zeigt die tatsächliche Bildgröße.

Alles Folgende erklärt, warum diese fünf Zeilen so lauten, wie sie lauten.

## Warum eine Serie mehr trägt als eine Aufnahme

Ein bei schlechtem Licht aufgenommenes Foto ist das Bild plus Rauschen, und das Rauschen ist jedes Mal ein anderes. Genau dieser letzte Teil lässt Stacken funktionieren. Machen Sie dieselbe Aufnahme sechzehnmal, und das Bild ist in allen sechzehn dasselbe, während das Rauschen es nicht ist; sie zu mitteln lässt das Bild stehen und hebt das meiste Rauschen auf.

Die Verbesserung ist die Wurzel aus der Anzahl der Aufnahmen. Vier Aufnahmen halbieren das Rauschen. Sechzehn vierteln es. Hundert senken es auf ein Zehntel. Das ist eine unbarmherzige Kurve, auf der man sitzt: Von sechzehn auf vierundsechzig Aufnahmen zu gehen bringt dieselbe Verbesserung noch einmal, für die vierfache Fotografiererei. Deshalb liegt fast jeder praktische Stapel zwischen acht und dreißig Aufnahmen.

Das Mitteln macht auch Tonwertschätzungen stabiler, weil jede verrauschte Aufnahme etwas anders gerundet wurde. Das Werkzeug verwendet breitere Akkumulatoren und rundet den kombinierten Wert erst am Ende. Das gespeicherte PNG oder JPEG hat weiterhin acht Bit pro Kanal: Der sauberere Mittelwert erhöht die Bittiefe der Ausgabe nicht.

## Die Frage, die die Methode wählt

Nicht „was will ich behalten“, sondern **was war zwischen den Aufnahmen verschieden**. Alles andere folgt daraus.

### Nichts hat sich bewegt: Mittelwert

Das schlichte arithmetische Mittel. Es ist die wirksamste Rauschminderung, die es für eine Serie gibt, in der sich die Aufnahmen nur im Rauschen unterscheiden, und die am leichtesten zu ruinierende: Eine Aufnahme mit einem Vogel darin legt einen blassen Vogel über den ganzen Stapel, weil ein Mittelwert keine Meinung zu einem Wert hat, der den anderen widerspricht. Er nimmt ihn einfach mit.

### Etwas ist durchs Bild gelaufen: Median

Legen Sie ein Dutzend Fotos eines belebten Platzes übereinander und sehen Sie sich ein Pixel an. In den meisten ist es Pflaster; in ein, zwei ist es der Mantel von jemandem. Sortieren Sie diese zwölf Werte und nehmen Sie den mittleren, und Sie bekommen Pflaster, weil der Mantel nie in der Mehrheit war.

Tun Sie das für jedes Pixel, und der Platz kommt leer heraus. Das ist der Kniff hinter jedem Artikel über „Touristen aus dem Urlaubsfoto entfernen“, und er braucht nichts Klügeres als eine Serie und Geduld. Das Einzige, was er verlangt, ist, dass **kein Teil der Szene mehr als die Hälfte der Zeit besetzt ist**. Eine Person, die in acht Ihrer zwölf Aufnahmen stillsteht, ist an diesen Pixeln die Mehrheit, und der Median behält sie.

### Beides: Sigma-Clipping

Der Median senkt unabhängiges zufälliges Rauschen weniger wirksam als der Mittelwert. Das Ergebnis stammt aus dem mittleren Wert oder dem mittleren Paar statt aus dem Mittel aller Werte. Dafür beeinflussen einzelne stark abweichende Werte das Ergebnis weniger.

Sigma-Clipping schätzt zuerst Mittelwert und Streuung jedes Kanals und mittelt danach nur Werte innerhalb der gewählten Schwelle. Ein Objekt, das nur wenige Aufnahmen durchquert hat, kann verworfen werden, während der übrige Hintergrund gemittelt wird. Bei kleinen Serien oder häufigem Auftreten ist das weniger zuverlässig. Mit der Standardschwelle kann ein abweichender Wert neben vier identischen Werten noch akzeptiert werden. Nehmen Sie Median, wenn die Entfernung des Objekts wichtiger ist als die stärkste Rauschminderung.

Die Schwelle wird in Standardabweichungen angegeben; zwei ist der Ausgangspunkt. Niedrigere Werte verwerfen mehr, auch echte Details. Werden für einen Kanal alle Werte verworfen, bleibt dessen ursprünglicher Mittelwert erhalten, damit keine Lücke entsteht.

### Nur das Helle zählt: Aufhellen

Den hellsten Wert behalten, den jedes Pixel je hatte. Fotografieren Sie den Nachthimmel als zweihundert Dreißigsekunden-Belichtungen und hellen Sie sie zusammen auf, und jeder Stern zeichnet seinen eigenen Bogen über das Ergebnis: eine Sternspur, zusammengesetzt aus kurzen Belichtungen, die für sich nie ausgefressen sind. Dieselbe Methode setzt ein Feuerwerk aus den Aufnahmen seiner eigenen Explosion zusammen und eine Lichtmalerei aus einem Gang mit der Taschenlampe durch einen dunklen Raum.

Das Gegenstück, Abdunkeln, ist das stille der beiden: Ein Pixel bleibt nur hell, wenn es in *jeder* Aufnahme hell war, also verschwinden Spiegelungen in einer Scheibe, vorbeifahrende Scheinwerfer und vom Blitz angeleuchtete Regentropfen.

### Das Motiv ist tiefer als die Schärfe: Focus Stacking

Eine Makroaufnahme bei f/8 hat vielleicht einen Millimeter in der Schärfe, und das genügt für ein Insekt nicht. Die Antwort ist, zwanzig Aufnahmen entlang des Fokusrings zu machen und von jeder nur den Teil zu behalten, der darin scharf war. Das Werkzeug misst, wie stark sich jedes Pixel von seinen Nachbarn unterscheidet, groß an einer Kante, nahe null in einer Unschärfe, und nimmt den Sieger.

Diese Methode will ein Stativ mehr als jede andere, weil der Fokusring von Hand die Kamera bewegt, und eine Aufnahme aus etwas größerer Entfernung ist nicht dasselbe Bild bei anderer Schärfe.

### Ein helleres Gemisch: Addieren

Addieren summiert die dekodierten Bildwerte, bevor der Belichtungsmultiplikator angewendet wird. Das sind Acht-Bit-Bildwerte; das Ergebnis ist deshalb ein additives Gemisch und keine längere Kamerabelichtung. Helle Bereiche können abgeschnitten werden. **Helligkeit normalisieren** setzt den Multiplikator auf eins geteilt durch die Zahl der Aufnahmen. Sie können auch direkt einen kleineren Wert eingeben.

![Stacking-Methoden und Einstellungen mit geplanter Ausgabegröße, geschätztem Arbeitsspeicher, geplanten Dekodiervorgängen beim Stacken und Prüflesevorgängen.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

Das Verfahren ist die Frage dieses Abschnitts. Der Plan darunter ist das Werkzeug, das vor dem Start sagt, was der Lauf kosten wird.

## Die Aufnahmen ausrichten

Stacken ist Rechnen Pixel für Pixel, es setzt also voraus, dass ein bestimmtes Pixel in jeder Aufnahme derselbe Teil der Szene ist. Aus der Hand ist es das nicht: Eine Serie driftet um Dutzende Pixel, und das zu mitteln ergibt eine Unschärfe statt eines sauberen Bildes. Das ist der häufigste einzelne Grund, warum ein erster Versuch mit Stacken enttäuscht.

Jede Aufnahme wird gegen die als **Bezug** markierte gemessen und zurückgeschoben, wenn eine zuverlässige Korrektur gefunden wird. Standardmäßig ist es die erste. **Als Bezug nehmen** verschiebt die Markierung, ohne die Liste umzusortieren. Wählen Sie eine scharfe Aufnahme mit klaren, unbewegten Details. Es gibt vier Ausrichtungseinstellungen:

- **Automatisch mit Perspektivkorrektur** ist die Voreinstellung. Es korrigiert Drift, Drehung und Maßstab und korrigiert zusätzlich die Perspektive, wenn zuverlässige Messungen über das Bild verteilt dies stützen. Das hilft bei Nachtserien mit großem Bildfeld, deren Mitte ausgerichtet ist, während Sterne am Rand noch Spuren ziehen. Lässt sich keine stabile Perspektive bestimmen, wird die einfachere Korrektur verwendet.
- **Nur verschieben** für eine Serie, die ohne Drehung oder Perspektivänderung verrutscht ist. Es korrigiert ausschließlich die Verschiebung.
- **Verschieben, drehen und skalieren** für eine Serie, in der Sie sich auch leicht gedreht haben oder der Zoom verrutscht ist. Dafür sind zusätzliche Messungen je Aufnahme nötig, auch wenn die Aufnahmen gerade sind.
- **Nein**, wenn statische Aufnahmen bereits zusammenpassen oder bewegte Sterne zu Spuren werden sollen. Ein Stativ hält die Sterne während einer Nachtserie nicht in denselben Pixeln.

Was kein Ausrichten beheben kann, ist ein Motiv, das sich bewegt hat, statt einer Kamera, die sich bewegt hat, und ein Foto, das einen Schritt weiter links aufgenommen wurde, ebenso wenig. Sich seitwärts zu bewegen ändert, wie stark das Nahe sich gegenüber dem Fernen verschiebt, und keine einzelne Korrektur beschreibt beides zugleich. Sich auf der Stelle zu drehen ist in Ordnung; zu gehen nicht.

Öffnen Sie nach dem Stacken die **Ausrichtungsdetails**, um Status und Korrektur jeder Aufnahme zu sehen. Eine nicht ausrichtbare Aufnahme bleibt an ihrer ursprünglichen Stelle enthalten. Entfernen Sie sie und starten Sie erneut, wenn sie das Ergebnis unscharf macht. Das Ergebnis öffnet sich mit dem Bezug links und dem Stack rechts. Ziehen Sie die Trennlinie mit der Maus oder dem Finger, oder fokussieren Sie sie und verwenden Sie die linke und rechte Pfeiltaste. Schieben Sie sie an einen Rand, um ein ganzes Bild zu sehen. Die Trennlinie ist in **An Fenster anpassen** verfügbar. **100% — tatsächliche Pixel** zeigt das gesamte gestackte Ergebnis und entfernt die Vergleichsoption. Ziehen Sie bei 100% das Bild, um den Bildausschnitt zu verschieben, oder fokussieren Sie die Vorschau und verwenden Sie die Pfeiltasten. Unter **Anzeigen** prüfen Sie Bezug und Stack einzeln. Kehren Sie zu An Fenster anpassen zurück, um wieder mit der Trennlinie zu vergleichen.

![Ein geteilter Vergleich mit der Bezugsaufnahme links, dem gestackten Ergebnis rechts und einer beweglichen Trennlinie.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

Bewegen Sie die Trennlinie über Rauschen und feine Kanten, um denselben Bereich beider Bilder zu vergleichen. Prüfen Sie die Ausrichtungsdetails, wenn der Stack unscharf wirkt.

## Wo RAW-Dateien hineinpassen

CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF und verwandte Dateien lassen sich öffnen, wenn eine brauchbare JPEG-Vorschau enthalten ist. Dabei lohnt Genauigkeit, denn es ist etwas anderes als die Entwicklung der RAW-Sensordaten.

Viele RAW-Dateien enthalten eine **von der Kamera gerenderte JPEG-Vorschau**. Der Stacker findet die größte brauchbare und dekodiert sie mit dem Bilddecoder des Browsers. Sie kann kleiner als das Sensorbild sein, und manche Dateien haben keine. Prüfen Sie die Maße jeder Aufnahme.

Zwei Folgen, eine gute und eine, die man kennen sollte:

- **Es erspart das Dekodieren des Sensors.** Das Finden der Vorschau braucht meist kleine Verzeichnis- und Kopfdatenlesevorgänge. Danach liest der Browser den JPEG-Ausschnitt zum Dekodieren. Die Prüfzahl auf der Seite zählt diese Verzeichnis- und Kopfdaten, nicht alle Bytes, die der Bilddecoder liest.
- **Es ist die Interpretation der Kamera, nicht Ihre.** Acht Bit pro Kanal, mit dem Weißabgleich und dem Bildstil, auf die die Kamera eingestellt war, und nicht die zwölf oder vierzehn Bit linearer Sensordaten, die Sie aus einem Konverter bekämen.

Eine brauchbare Vorschau kann für Rauschminderung, Sternspuren, das Entfernen von Passanten und Focus Stacking reichen. Ihre Maße und die Wiedergabe der Kamera setzen die Grenzen. Für eigenen Weißabgleich, Tonwertanpassungen oder die Wiederherstellung von RAW-Schatten entwickeln Sie zuerst und exportieren JPEG- oder PNG-Dateien zum Stacken. Das gespeicherte Ergebnis bleibt ein Acht-Bit-Bild.

## Was es zur Laufzeit kostet

Das ist der Unterschied zwischen einem Stapel, der acht Sekunden dauert, und einem, der zwei Minuten braucht.

Bei sechs Methoden wächst die Größe der Akkumulatoren nicht mit der Zahl der Aufnahmen. Mittelwert, Aufhellen, Abdunkeln, Addieren und Focus Stacking brauchen einen Durchlauf je Band. Sigma-Clipping braucht zwei: einen für Mittelwert und Streuung, einen für den Mittelwert der behaltenen Werte. Prüfen und Ausrichten dekodieren die Dateien ebenfalls; ein Durchlauf beim Stacken bedeutet also nicht nur einen Lesevorgang insgesamt.

Median muss die Werte jeder Aufnahme für das aktuelle Band behalten. Zwanzig 24-Megapixel-Aufnahmen bräuchten allein für diese Werte rund 1,4 GB. Bänder verringern die Zahl der gleichzeitig verarbeiteten Zeilen, verlangen aber ein erneutes Dekodieren jeder Aufnahme für jedes Band. Auch die anderen Methoden können in Bänder geteilt werden, wenn ihre Arbeitspuffer das Budget überschreiten.

Vor dem Start zeigt das Werkzeug die geplante Ergebnisgröße, den geschätzten Arbeitsspeicher, die geplanten Dekodiervorgänge beim Stacken und die beim Prüfen gelesenen Bytes. Die Speicherschätzung enthält die modellierten Arbeitspuffer; Browserinternes und Speicherbereinigung können den Gesamtbedarf erhöhen. Eine kleinere Arbeitsauflösung viertelt die Bildfläche je Stufe und kann wiederholtes Dekodieren reduzieren. Der Beschnitt durch die Ausrichtung kann weniger Bänder nötig machen als ursprünglich geplant.

## Dafür fotografieren

Der größte Teil der Qualität eines Stapels entscheidet sich, bevor irgendeine Software ihn sieht.

- **Machen Sie mehr Aufnahmen, als Sie zu brauchen glauben.** Die Wurzelkurve ist am unteren Ende unbarmherzig und am oberen gnädig: Von vier auf neun Aufnahmen zu gehen ist eine sichtbar größere Veränderung als von zwanzig auf vierzig.
- **Ändern Sie die Belichtung zwischen den Aufnahmen nicht.** Stacken setzt voraus, dass die Aufnahmen dieselbe Szene in derselben Helligkeit zeigen. Fixieren Sie die Belichtung, sonst mittelt das Werkzeug zwei verschiedene Bilder.
- **Warten Sie zwischen den Aufnahmen, wenn Leute weg sollen.** Eine Serie in zwei Sekunden erwischt dieselbe Person in jeder Aufnahme an derselben Stelle, und der Median behält sie. Zehn Aufnahmen im Abstand einiger Sekunden wirken weit besser als fünfzig in einer Serie.
- **Halten Sie die Lücken kurz, wenn es Sternspuren werden sollen.** Aufhellen zeichnet genau das, was die Aufnahmen festgehalten haben, eine Pause zwischen den Belichtungen wird also in jeder Spur zu einem sichtbaren Strich.

## Nichts davon verlässt Ihr Gerät

Ein Stapel aus zwanzig RAW-Aufnahmen ist rund ein Gigabyte Fotos, und das ist viel, um es einer Website zu übergeben, damit sie den Mittelwert daraus bildet. Der [Bild-Stacker](https://abox.tools/de/bilder-stacken/) liest die Dateien von Ihrer eigenen Festplatte und rechnet in Ihrem eigenen Browser. Es gibt keinen Upload-Schritt, kein Konto und keine Warteschlange, und Sie können diese Behauptung so prüfen, wie Sie jede fremde prüfen würden: Öffnen Sie die Netzwerkanzeige Ihres Browsers, während es läuft, oder trennen Sie einfach die Internetverbindung und stacken Sie trotzdem.

Die verwandte Frage, wie sich bei einem beliebigen Werkzeug erkennen lässt, ob es Ihre Datei überhaupt braucht, hat [einen eigenen Ratgeber](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/).
