# So stacken Sie Fotos gegen Bildrauschen oder um Leute zu entfernen

Eine Serie von Aufnahmen trägt mehr Information als jede einzelne davon. Sie zu mitteln hebt das Rauschen auf; den mittleren Wert jedes Pixels zu nehmen löscht alles, was nur zeitweise da war. Welches von beidem Sie wollen, hängt ganz davon ab, was sich bewegt hat.

[Bild-Stacker öffnen](https://abox.tools/de/bilder-stacken/): Zwanzig Aufnahmen werden eine, ohne zwanzig Uploads und ohne RAW-Konverter.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [Bild-Stacker](https://abox.tools/de/bilder-stacken/), ziehen Sie die ganze Serie hinein und wählen Sie die Methode danach, was weg soll:

- **Rauschen**, und nichts hat sich bewegt — Mittelwert.
- **Rauschen**, und etwas hat sich bewegt — Sigma-Clipping.
- **Leute, Autos, ein Flugzeug** — Median.
- **Ein dunkler Himmel, der Sternspuren werden soll** — Aufhellen.
- **Eine Makroaufnahme mit fast keiner Schärfentiefe** — Focus Stacking.

Lassen Sie das Ausrichten an, wenn die Kamera in Ihren Händen war, und schalten Sie es ab, wenn sie auf einem Stativ stand. RAW-Dateien können direkt hinein; sie müssen vorher nicht entwickelt werden.

Alles Folgende erklärt, warum diese fünf Zeilen so lauten, wie sie lauten.

## Warum eine Serie mehr trägt als eine Aufnahme

Ein bei schlechtem Licht aufgenommenes Foto ist das Bild plus Rauschen, und das Rauschen ist jedes Mal ein anderes. Genau dieser letzte Teil lässt Stacken funktionieren. Machen Sie dieselbe Aufnahme sechzehnmal, und das Bild ist in allen sechzehn dasselbe, während das Rauschen es nicht ist; sie zu mitteln lässt das Bild stehen und hebt das meiste Rauschen auf.

Die Verbesserung ist die Wurzel aus der Anzahl der Aufnahmen. Vier Aufnahmen halbieren das Rauschen. Sechzehn vierteln es. Hundert senken es auf ein Zehntel. Das ist eine unbarmherzige Kurve, auf der man sitzt: Von sechzehn auf vierundsechzig Aufnahmen zu gehen bringt dieselbe Verbesserung noch einmal, für die vierfache Fotografiererei. Deshalb liegt fast jeder praktische Stapel zwischen acht und dreißig Aufnahmen.

Es gibt einen zweiten, leiseren Gewinn. Sechzehn Acht-Bit-Aufnahmen zu mitteln ergibt ein Bild mit feineren Abstufungen, als eine einzelne von ihnen hatte, weil genau das Rauschen, das jede Aufnahme anders runden ließ, den Mittelwert zwischen den Stufen landen lässt. Eine verrauschte Serie zu stacken entfernt nicht nur Rauschen; es holt Tonwerte zurück, die eine einzelne Aufnahme wegquantisiert hat.

## Die Frage, die die Methode wählt

Nicht „was will ich behalten“, sondern **was war zwischen den Aufnahmen verschieden**. Alles andere folgt daraus.

### Nichts hat sich bewegt: Mittelwert

Das schlichte arithmetische Mittel. Es ist die wirksamste Rauschminderung, die es für eine Serie gibt, in der sich die Aufnahmen nur im Rauschen unterscheiden, und die am leichtesten zu ruinierende: Eine Aufnahme mit einem Vogel darin legt einen blassen Vogel über den ganzen Stapel, weil ein Mittelwert keine Meinung zu einem Wert hat, der den anderen widerspricht. Er nimmt ihn einfach mit.

### Etwas ist durchs Bild gelaufen: Median

Legen Sie ein Dutzend Fotos eines belebten Platzes übereinander und sehen Sie sich ein Pixel an. In den meisten ist es Pflaster; in ein, zwei ist es der Mantel von jemandem. Sortieren Sie diese zwölf Werte und nehmen Sie den mittleren, und Sie bekommen Pflaster, weil der Mantel nie in der Mehrheit war.

Tun Sie das für jedes Pixel, und der Platz kommt leer heraus. Das ist der Kniff hinter jedem Artikel über „Touristen aus dem Urlaubsfoto entfernen“, und er braucht nichts Klügeres als eine Serie und Geduld. Das Einzige, was er verlangt, ist, dass **kein Teil der Szene mehr als die Hälfte der Zeit besetzt ist**. Eine Person, die in acht Ihrer zwölf Aufnahmen stillsteht, ist an diesen Pixeln die Mehrheit, und der Median behält sie.

### Beides: Sigma-Clipping

Der Median wirft den größten Teil der Information weg, um seine Unempfindlichkeit zu bekommen: Elf Ihrer zwölf Werte werden an jedem Pixel verworfen, er senkt das Rauschen also weit weniger, als ein Mittelwert derselben Serie es täte.

Sigma-Clipping ist der Kompromiss, und er ist für jede Serie aus der wirklichen Welt meist die richtige Voreinstellung. Er sieht sich jedes Pixel über alle Aufnahmen hinweg an, ermittelt, was es üblicherweise ist und wie stark es schwankt, und mittelt dann nur die Werte, die dazu passen. Ein Auto, das durch eine Aufnahme gefahren ist, wird an diesen Pixeln ausgeschlossen; jede andere Aufnahme zählt überall weiter. Sie bekommen die Unempfindlichkeit des Medians gegenüber Bewegtem und den größten Teil der Rauschminderung des Mittelwerts.

Die Schwelle steht in Standardabweichungen, und zwei sind der übliche Ausgangspunkt. Niedriger verwirft mehr und fängt an, echte Details mitzuverwerfen.

### Nur das Helle zählt: Aufhellen

Den hellsten Wert behalten, den jedes Pixel je hatte. Fotografieren Sie den Nachthimmel als zweihundert Dreißigsekunden-Belichtungen und hellen Sie sie zusammen auf, und jeder Stern zeichnet seinen eigenen Bogen über das Ergebnis: eine Sternspur, zusammengesetzt aus kurzen Belichtungen, die für sich nie ausgefressen sind. Dieselbe Methode setzt ein Feuerwerk aus den Aufnahmen seiner eigenen Explosion zusammen und eine Lichtmalerei aus einem Gang mit der Taschenlampe durch einen dunklen Raum.

Das Gegenstück, Abdunkeln, ist das stille der beiden: Ein Pixel bleibt nur hell, wenn es in *jeder* Aufnahme hell war, also verschwinden Spiegelungen in einer Scheibe, vorbeifahrende Scheinwerfer und vom Blitz angeleuchtete Regentropfen.

### Das Motiv ist tiefer als die Schärfe: Focus Stacking

Eine Makroaufnahme bei f/8 hat vielleicht einen Millimeter in der Schärfe, und das genügt für ein Insekt nicht. Die Antwort ist, zwanzig Aufnahmen entlang des Fokusrings zu machen und von jeder nur den Teil zu behalten, der darin scharf war. Das Werkzeug misst, wie stark sich jedes Pixel von seinen Nachbarn unterscheidet, groß an einer Kante, nahe null in einer Unschärfe, und nimmt den Sieger.

Diese Methode will ein Stativ mehr als jede andere, weil der Fokusring von Hand die Kamera bewegt, und eine Aufnahme aus etwas größerer Entfernung ist nicht dasselbe Bild bei anderer Schärfe.

![Die Liste der Verfahren — Mittelwert, Median, hellstes, dunkelstes — mit einem Plan darunter, der Ausgabegröße, Speicherbedarf und die zu lesende Datenmenge nennt.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

Das Verfahren ist die Frage dieses Abschnitts. Der Plan darunter ist das Werkzeug, das vor dem Start sagt, was der Lauf kosten wird.

## Die Aufnahmen ausrichten

Stacken ist Rechnen Pixel für Pixel, es setzt also voraus, dass ein bestimmtes Pixel in jeder Aufnahme derselbe Teil der Szene ist. Aus der Hand ist es das nicht: Eine Serie driftet um Dutzende Pixel, und das zu mitteln ergibt eine Unschärfe statt eines sauberen Bildes. Das ist der häufigste einzelne Grund, warum ein erster Versuch mit Stacken enttäuscht.

Also werden die Aufnahmen gegen eine von ihnen vermessen und zuerst an ihren Platz zurückgeschoben, auf Bruchteile eines Pixels genau. Drei Einstellungen:

- **Nur verschieben** ist für fast alles aus der Hand richtig. Es korrigiert die Drift und das Wackeln.
- **Verschieben, drehen und skalieren** für eine Serie, bei der Sie sich zusätzlich leicht gedreht haben oder bei der ein Zoom gewandert ist. Es kostet eine Messung mehr je Aufnahme und gar nichts, wenn die Aufnahmen sich als gerade erweisen.
- **Gar nicht** für ein festes Stativ oder eine Intervallserie, wo die Aufnahmen bereits ausgerichtet sind und sie zu vermessen verlorene Zeit ist.

Was kein Ausrichten beheben kann, ist ein Motiv, das sich bewegt hat, statt einer Kamera, die sich bewegt hat, und ein Foto, das einen Schritt weiter links aufgenommen wurde, ebenso wenig. Sich seitwärts zu bewegen ändert, wie stark das Nahe sich gegenüber dem Fernen verschiebt, und keine einzelne Korrektur beschreibt beides zugleich. Sich auf der Stelle zu drehen ist in Ordnung; zu gehen nicht.

![Das Ergebnis: das gestapelte Bild, dazu eine Angabe, wie weit jedes Einzelbild verschoben werden musste, um zum ersten zu passen.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

Die Ausrichtungszahlen sind das Lesen wert. Eine freihändige Serie wandert um ein paar Pixel je Bild, und genau das macht der Ausrichter stillschweigend rückgängig.

## Wo RAW-Dateien hineinpassen

Sie können CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF und den Rest direkt hineinziehen, und es lohnt sich, genau zu sagen, was mit ihnen geschieht, denn es ist nicht das, was ein RAW-Konverter tut.

Jede RAW-Datei enthält bereits ein **JPEG in voller Größe, das die Kamera beim Auslösen gerendert hat**. Es ist das, was das Kameradisplay Ihnen zeigt, und das, was Ihr Betriebssystem als Vorschaubild zeichnet. Der Stacker findet dieses Bild und verwendet es. Er dekodiert die Sensordaten nicht.

Zwei Folgen, eine gute und eine, die man kennen sollte:

- **Es ist schnell.** Die Vorschau zu finden heißt, ein paar Kilobyte Verzeichnis und dann einen Ausschnitt zu lesen, eine 60 MB große Aufnahme öffnet also ungefähr so schnell wie ein JPEG. Zwanzig davon öffnen in der Zeit, die ein RAW-Konverter für eine bräuchte. Die Seite zeigt Ihnen, wie wenig von Ihren Dateien sie tatsächlich gelesen hat.
- **Es ist die Interpretation der Kamera, nicht Ihre.** Acht Bit pro Kanal, mit dem Weißabgleich und dem Bildstil, auf die die Kamera eingestellt war, und nicht die zwölf oder vierzehn Bit linearer Sensordaten, die Sie aus einem Konverter bekämen.

Für Rauschminderung, Sternspuren, das Entfernen von Passanten und Focus Stacking lohnt sich dieser Tausch fast immer: Die Vorschauen haben volle Auflösung, und sie sind das, was Sie ohnehin als JPEG bekommen hätten. Wenn Sie die Schatten stark anheben oder für Astrofotografie stacken, wo das letzte bisschen Dynamikumfang der ganze Punkt ist, entwickeln Sie die Aufnahmen zuerst in einem RAW-Konverter und stacken Sie die TIFFs oder JPEGs, die er ausgibt. Die gehen genauso hinein.

## Was es zur Laufzeit kostet

Das ist der Unterschied zwischen einem Stapel, der acht Sekunden dauert, und einem, der zwei Minuten braucht.

Sechs der sieben Methoden müssen sich immer nur eines merken. Ein laufendes Maximum kümmert sich nicht um die Aufnahmen, die es schon gesehen hat, und eine laufende Summe ebenso wenig, diese Methoden lesen jede Aufnahme also genau einmal und brauchen für hundert Aufnahmen so viel Speicher wie für zwei.

Der Median kann so nicht arbeiten, weil sich der mittlere Wert einer Menge nicht kennen lässt, bevor man sie ganz hat. Zwanzig Aufnahmen mit 24 Megapixeln sind rund 1,4 GB Pixel, gleichzeitig gehalten, und so viel gibt kein Browser heraus. Also wird das Bild in waagerechte Bänder geschnitten und Band für Band gestackt: richtig, und langsamer, weil die Aufnahmen für jedes Band erneut gelesen werden.

Das Werkzeug rechnet das alles aus, bevor Sie den Knopf drücken, und sagt es Ihnen: wie groß das Ergebnis wird, wie viel Speicher es ungefähr braucht und wie oft Ihre Aufnahmen dekodiert werden. Sagt es, der Durchlauf werde in Bänder geteilt, viertelt eine Stufe weniger Arbeitsauflösung den Speicher und macht daraus fast immer wieder einen einzigen Durchlauf. Und wenn Sie gegen Rauschen stacken, hätte halbe Auflösung ohnehin sauberer ausgesehen als volle.

## Dafür fotografieren

Der größte Teil der Qualität eines Stapels entscheidet sich, bevor irgendeine Software ihn sieht.

- **Machen Sie mehr Aufnahmen, als Sie zu brauchen glauben.** Die Wurzelkurve ist am unteren Ende unbarmherzig und am oberen gnädig: Von vier auf neun Aufnahmen zu gehen ist eine sichtbar größere Veränderung als von zwanzig auf vierzig.
- **Ändern Sie die Belichtung zwischen den Aufnahmen nicht.** Stacken setzt voraus, dass die Aufnahmen dieselbe Szene in derselben Helligkeit zeigen. Fixieren Sie die Belichtung, sonst mittelt das Werkzeug zwei verschiedene Bilder.
- **Warten Sie zwischen den Aufnahmen, wenn Leute weg sollen.** Eine Serie in zwei Sekunden erwischt dieselbe Person in jeder Aufnahme an derselben Stelle, und der Median behält sie. Zehn Aufnahmen im Abstand einiger Sekunden wirken weit besser als fünfzig in einer Serie.
- **Halten Sie die Lücken kurz, wenn es Sternspuren werden sollen.** Aufhellen zeichnet genau das, was die Aufnahmen festgehalten haben, eine Pause zwischen den Belichtungen wird also in jeder Spur zu einem sichtbaren Strich.

## Nichts davon verlässt Ihr Gerät

Ein Stapel aus zwanzig RAW-Aufnahmen ist rund ein Gigabyte Fotos, und das ist viel, um es einer Website zu übergeben, damit sie den Mittelwert daraus bildet. Der [Bild-Stacker](https://abox.tools/de/bilder-stacken/) liest die Dateien von Ihrer eigenen Festplatte und rechnet in Ihrem eigenen Browser. Es gibt keinen Upload-Schritt, kein Konto und keine Warteschlange, und Sie können diese Behauptung so prüfen, wie Sie jede fremde prüfen würden: Öffnen Sie die Netzwerkanzeige Ihres Browsers, während es läuft, oder trennen Sie einfach die Internetverbindung und stacken Sie trotzdem.

Die verwandte Frage, wie sich bei einem beliebigen Werkzeug erkennen lässt, ob es Ihre Datei überhaupt braucht, hat [einen eigenen Ratgeber](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/).
