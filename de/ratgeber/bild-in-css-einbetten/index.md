# Wann ein Bild in Ihr CSS gehört und wann nicht

Ein Bild, das im Stylesheet steht, kommt mit ihm an: keine zweite Anfrage, kein Warten. Dafür ist es keine Datei mehr. Es lässt sich nicht mehr für sich zwischenspeichern und wird jedes Mal neu geladen, wenn sich ringsherum irgendetwas ändert. Hier steht, wo sich dieser Handel lohnt und wo er klammheimlich schadet.

[Bild als Data-URI öffnen](https://abox.tools/de/bild-als-base64/): Das ganze Bild als eine Zeile Text. Direkt in CSS oder HTML einfügen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie [Bild als Data-URI](https://abox.tools/de/bild-als-base64/), ziehen Sie das Bild hinein, wählen Sie *Eine CSS-Custom-Property* und setzen Sie die Zeile oben in Ihr Stylesheet. Verwenden Sie sie dann als `background-image: var(--logo)`, wo immer Sie sie brauchen.

Machen Sie das bei kleinen Bildern, die auf jeder Seite gebraucht werden: ein Symbol, ein Aufzählungszeichen, ein Pfeil, ein Muster. Machen Sie es nicht mit einer Fotografie. Alles Weitere erklärt, warum diese beiden Sätze auseinandergehen und woran Sie erkennen, welchen Fall Sie vor sich haben.

## Was eine Data-URI überhaupt ist

Eine Adresse, die die Sache selbst enthält, statt auf sie zu zeigen. Wo in einem Stylesheet normalerweise

```
background-image: url("logo.png");
```

steht und der Browser losgeht und `logo.png` holt, steht bei einer Data-URI

```
background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...");
```

und es gibt nichts mehr zu holen: Das Bild ist bereits da, in Zeichen ausgeschrieben. Drei Teile stecken darin. `data:` ist das Schema. `image/png` ist der Medientyp, und den glaubt der Browser aufs Wort, wovon weiter unten noch die Rede sein wird. Alles hinter dem Komma ist die Datei.

Mehr ist es nicht, kein Trick und kein Kniff. Das steht seit 1998 in den Standards und funktioniert in jedem Browser, der seither erschienen ist.

## Was es bringt: eine Rundreise weniger

Gespart wird nicht die Bandbreite, sondern die Anfrage.

Ein Browser kann `logo.png` nicht anfordern, bevor er das Stylesheet gelesen hat, in dem es steht, und er kann das Stylesheet nicht lesen, bevor er es geholt hat. Ein gewöhnliches Hintergrundbild liegt damit mindestens zwei Rundreisen tief im Seitenaufbau, und auf einem Handy in einem schwachen Netz dauert eine Rundreise schnell ein paar hundert Millisekunden, ganz gleich, wie klein die Datei ist. Ein Pfeil von 600 Byte kostet an Übertragung so gut wie nichts und braucht trotzdem womöglich eine Viertelsekunde, bis er da ist.

Eingebettet kommt er zusammen mit dem Stylesheet an. Das ist der ganze Nutzen, und für ein kleines Symbol im sofort sichtbaren Bereich ist er echt.

## Was es kostet: ein Drittel, und dann der Cache

**Base64 legt rund ein Drittel drauf.** Aus drei Bytes Datei werden vier Zeichen, denn so viel braucht es, um beliebige Bytes mit den Zeichen zu schreiben, die eine URL zulässt. Kein noch so schlauer Encoder kommt darum herum. Aus einem PNG von 9 KB werden 12 KB Stylesheet.

**Die Kompression holt das nicht zurück.** Diesen Punkt setzen die meisten stillschweigend voraus, und er stimmt nicht. Gzip und Brotli leben davon, Wiederholungen zu finden. Ein PNG, ein JPEG oder ein WebP ist aber bereits komprimiert, da stecken kaum noch Wiederholungen drin, und Base64 fügt keine hinzu. In der Praxis kommt etwa ein Zehntel dieses Drittels zurück, nicht das Ganze. (Beim SVG liegt der Fall genau umgekehrt, davon handelt der nächste Abschnitt.)

**Es ist keine Datei mehr.** Dieser Preis taucht in keiner Messung auf, die Sie vermutlich vornehmen, und auf ihn kommt es an, sobald das Bild eine gewisse Größe hat:

- **Es lässt sich nicht für sich zwischenspeichern.** Ein gewöhnliches Bild wird einmal geholt und dann ein Jahr lang wiederverwendet. Ein eingebettetes gehört zum Stylesheet und lebt und stirbt mit dessen Cache-Eintrag.
- **Eine Änderung lädt alles neu.** Sie korrigieren einen Abstand, das Stylesheet geht neu heraus, und jeder Besucher lädt das eingebettete Bild gleich mit, ein Bild, das sich seit zwei Jahren nicht verändert hat.
- **Es liegt auf dem kritischen Pfad.** Ein Stylesheet blockiert das Rendern, ein Bild nicht. Einbetten verschiebt das Bild von der zweiten Kategorie in die erste, und die Seite kann dann nichts zeichnen, bevor das Ganze samt Bild angekommen ist.
- **Es lässt sich nicht parallel holen.** Browser laden vieles gleichzeitig. Ein eingebettetes Bild ist keine eigene Sache und hat davon nichts.

Ein paar grobe Schwellen, die markieren, wo der Rat kippt, und nicht, wo ein Browser etwas anderes tut. Unter etwa 2 KB ist es ein klarer Gewinn. Bis etwa 10 KB lohnt es sich meist noch für etwas, das auf jeder Seite auftaucht. Jenseits von 50 KB ist es ein Fehler, der keine Fehlermeldung erzeugt. [Das Werkzeug](https://abox.tools/de/bild-als-base64/) nennt Ihnen zu jedem Ergebnis das passende Band und die Zeichenzahl daneben.

![Die Ausgabe-Karte: eine CSS-Regel mit einer base64-Daten-URI, daneben die ursprüngliche und die kodierte Dateigröße.](https://abox.tools/screens/embed-an-image-in-css/output.webp)

Die kodierte Kopie ist etwa ein Drittel größer als die Datei, aus der sie stammt. Das sind die Kosten, um die es hier geht, und sie stehen da, statt entdeckt werden zu müssen.

## Ein SVG gehört nie in Base64

Das ist mit Abstand der häufigste Fehler bei eingebetteten Bildern, und Exportfunktionen und Build-Plugins machen ihn genauso oft wie Menschen.

Ein SVG ist Text, und Text trägt eine URL ohnehin. Maskiert werden muss nur eine Handvoll Zeichen, nämlich `%`, `#`, `<`, `>` und das Anführungszeichen, in das Sie das Ganze gesetzt haben. Alles Übrige darf genau so bleiben, wie es ist. So kodiert bekommen Sie eine URI, die typischerweise rund ein Fünftel kürzer ausfällt als das Base64 derselben Datei und die sich danach wie Text komprimiert und nicht wie Rauschen.

Lesbar bleibt sie obendrein:

```
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E...");
```

Sie sehen die `viewBox`. Sie können die Füllfarbe im Editor ändern, ohne irgendetwas zu dekodieren. Base64-kodieren Sie dieselbe Datei, wird daraus eine Wand aus Buchstaben, die nie wieder jemand anrührt. [Bild als Data-URI](https://abox.tools/de/bild-als-base64/) erledigt das von selbst für alles, was sich als SVG entpuppt, und hält für die seltene Werkzeugkette, die auf `;base64` besteht, ein Häkchen bereit.

## Der Anführungszeichen-Fehler, der nur SVGs zerlegt

CSS erlaubt `url()` auch ohne Anführungszeichen, und bei einem gewöhnlichen Dateinamen geht das in Ordnung:

```
background-image: url(logo.png);
```

Bei einem prozentkodierten SVG geht es schief. Ein `url()`-Token ohne Anführungszeichen endet am ersten Leerzeichen, an der ersten Klammer, am ersten Anführungszeichen oder Steuerzeichen, und ein SVG ist voller Leerzeichen, zwischen jedem Attribut und jeder Zahl in einem Pfad. Damit ist die Deklaration ungültig, und ungültige Deklarationen wirft CSS wortlos weg: kein Hintergrund, keine Fehlermeldung.

Die Abhilfe sind Anführungszeichen, und zwar immer:

```
background-image: url("data:image/svg+xml,%3Csvg ... %3E");
```

Deshalb muss ein Encoder die Leerzeichen auch nicht maskieren. Innerhalb einer URL in Anführungszeichen sind sie völlig zulässig, und jedes einzelne als `%20` zu schreiben kostete drei Zeichen pro Leerzeichen in der Datei. Die beiden Entscheidungen hängen zusammen: URI in Anführungszeichen setzen, dann dürfen die Leerzeichen bleiben. Genau darum steht jede Form, die das Werkzeug ausgibt, in Anführungszeichen.

## Der Medientyp muss stimmen

Eine Data-URI gibt ihren eigenen Typ an, und der Browser nimmt sie beim Wort. Anders als bei einer geholten Datei gibt es kein Nachschnüffeln als Rückfallebene. Schreiben Sie `image/png` über etwas, das in Wahrheit ein JPEG ist, erscheint das Bild einfach nicht, und nirgends steht eine Meldung, die weiterhilft.

Das zählt, weil Dateiendungen lügen. Ein als JPEG exportiertes und in `logo.png` umbenanntes Foto ist auf jeder Festplatte etwas ganz Gewöhnliches. Die ersten Bytes einer Bilddatei dagegen sagen eindeutig, was sie ist, denn jedes Format hat seine Signatur. Ein Werkzeug sollte also die Datei lesen und nicht ihren Namen. Dieses hier tut das und meldet sich, wenn beide sich widersprechen.

Zwei Formate sollte man kennen, weil sie auf verwirrende Weise scheitern. **HEIC**, worin ein iPhone fotografiert, und **TIFF**, was aus Scannern kommt, ergeben beide vollkommen gültige Data-URIs, die außer Safari kein Browser zeichnet. Kaputt ist nicht die URI, sondern das Format ist keines, das das Web unterstützt. Wandeln Sie vorher um.

## Die Metadaten, die Sie nicht veröffentlichen wollten

Eine Data-URI ist eine Kopie der Datei, Byte für Byte. Dekodiert und neu kodiert wird nichts, und meistens ist das gerade der Sinn, denn so geht keine Qualität verloren. Es heißt aber eben auch, dass alles andere in der Datei mitfährt.

Ein Foto direkt aus dem Handy trägt EXIF mit sich: die GPS-Koordinaten des Aufnahmeorts, den Zeitstempel, das Kameramodell und oft dessen Seriennummer. Das können 30 KB der Datei sein. Eingebettet werden daraus 40 KB Base64 in Ihrem Stylesheet, auf dem kritischen Pfad jeder einzelnen Seite. Und obendrein eine Wohnanschrift, die ins Repository eingecheckt wird, in einer Form, in der nie jemand nachsehen wird.

Entfernen Sie sie vorher mit dem [EXIF-Betrachter & -Entferner](https://abox.tools/de/exif-daten-entfernen/), der den Container neu schreibt, ohne das Bild anzurühren. Auch dazu gibt es einen [eigenen Ratgeber](https://abox.tools/de/ratgeber/exif-und-gps-daten-entfernen/). Bild als Data-URI liest aus, wie viele Metadaten in einem JPEG, PNG oder WebP stecken, und sagt es Ihnen, bevor Sie irgendetwas kopieren.

## Wohin damit, wenn Sie sie haben

Taucht das Bild in einer einzigen Regel auf, gehört die URI in diese Regel. Taucht es in mehreren auf, und bei Symbolen ist das meist so, sobald man Hover-Zustand und dunkles Farbschema mitzählt, deklarieren Sie es einmal als Custom Property:

```
:root {
  --icon-search: url("data:image/svg+xml,%3Csvg ... %3E");
}

.search-field { background-image: var(--icon-search); }
.search-button::before { content: var(--icon-search); }
```

Eine URI von 3 KB, in vier Regeln eingesetzt, ergibt 12 KB Stylesheet und vier Stellen, die Sie beim nächsten Symbolwechsel anfassen müssen. Bei der Custom Property ist es je eine. Sie ist zugleich die Form, mit der Theming funktioniert. Definieren Sie `--icon-search` in einer Media Query neu, und jede Verwendung zieht mit.

Für ein `<img>`-Element statt CSS geben Sie `width` und `height` an. Ein eingebettetes Bild ist sofort da, eine fehlende Größe erzeugt also einen Layout-Sprung, der zu schnell passiert, um gesehen zu werden, und der trotzdem gegen Sie gerechnet wird. Die Ausnahme ist SVG. Eines, das nur eine `viewBox` trägt, hat keine eigene Pixelgröße, und die Standardgröße ⁦300×150⁩ des Browsers ins Element zu schreiben nagelt ein skalierbares Bild auf ein Maß fest, das niemand gewählt hat.

Lassen Sie `alt` leer, solange Sie nichts Zutreffendes hineinzuschreiben haben. Nur Sie wissen, ob das Bild etwas bedeutet oder bloß schmückt, und eine aus dem Dateinamen erratene Beschreibung ist für jemanden am Screenreader schlechter als gar keine.

![Die Form-Karte: Schaltflächen für das, was herauskommen soll — eine CSS-Hintergrundregel, ein img-Element oder die nackte URI — und ein Schalter für base64 oder reines SVG.](https://abox.tools/screens/embed-an-image-in-css/shape.webp)

Wohin es geht, entscheidet, was herauskommt, also wird zuerst danach gefragt, statt es zur Kopierübung zu machen.

## Wann die Antwort „lieber nicht“ lautet

Ist das Bild kodiert größer als etwa 50 KB, ist Einbetten das falsche Werkzeug, und keine noch so sorgfältige Kodierung repariert das. Die Alternativen, in der Reihenfolge, in der sie einen Versuch wert sind:

- **Machen Sie es kleiner.** Die meisten Bilder, die zum Einbetten zu groß sind, sind schlicht zu groß. Der [Bildkompressor](https://abox.tools/de/bild-komprimieren/) bringt eine Fotografie auf eine Größe, die Sie nennen, und der [Bildskalierer](https://abox.tools/de/bildgroesse-aendern/) stutzt die Pixelmaße auf das, was das Layout tatsächlich nutzt. Genau darin steckt sehr oft das eigentliche Problem.
- **Zeichnen Sie es als SVG neu.** Ein Symbol, das als PNG mit 40 KB exportiert wurde, ist als SVG oft 900 Byte groß. Das ist kein Unterschied in der Kompression, sondern einer im Format, und es löst nebenbei das Retina-Problem.
- **Lassen Sie es eine Datei und laden Sie sie vor.** `<link rel="preload" as="image">` stößt den Abruf sofort an, ohne die Bytes auf den kritischen Pfad zu schieben. Damit haben Sie fast den ganzen Nutzen des Einbettens und keine der Cache-Kosten.

## Nichts davon braucht einen Upload

Eine Datei nach Base64 zu kodieren ist Rechnerei. Dahinter stecken zwei Funktionen, die der Browser seit jeher mitbringt, `btoa` und `encodeURIComponent`, und es gibt nicht den geringsten technischen Grund, warum ein Bild dafür zu einem Server und zurück reisen sollte, nur um anders aufgeschrieben zu werden. Wer Ihre Datei dafür hochlädt, tut das aus eigenen Gründen und nicht aus Ihren.

[Das Werkzeug hier](https://abox.tools/de/bild-als-base64/) schickt sie nirgendwohin. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns. Wer lieber prüft als glaubt, lädt die Seite, trennt die Internetverbindung und kodiert trotzdem etwas. Drei weitere Proben, die Sie an jedem Werkzeug durchführen können, stehen in [Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)
