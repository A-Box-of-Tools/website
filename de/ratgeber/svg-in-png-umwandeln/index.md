# So wandeln Sie ein SVG in der richtigen Größe in ein PNG um

Das Umwandeln ist die leichte Hälfte. Über den Nutzen des Ergebnisses entscheidet die Frage, auf die Ihnen niemand die Antwort mitliefert: wie viele Pixel? Hier steht, woher diese Zahl kommt und was eine Zeichnung verliert, sobald sie zu Pixeln wird.

[SVG zu Bild öffnen](https://abox.tools/de/svg-in-png-umwandeln/): Nennen Sie die Größe. Ein Vektor hat keine eigene, die er verlieren könnte.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie [SVG zu Bild](https://abox.tools/de/svg-in-png-umwandeln/), ziehen Sie die Datei hinein und nennen Sie eine Größe. Hat Ihnen niemand eine vorgegeben, fahren Sie mit **1024 Pixeln auf der längeren Seite** gut: groß genug für fast jeden Zweck und klein genug für den Mailanhang. Format auf PNG lassen, Hintergrund auf transparent lassen, Datei mitnehmen.

Der Rest dieser Seite ist für die Fälle, in denen das nicht reicht: wenn Ihnen eine Zahl vorgeschrieben wurde, wenn es in den Druck geht oder wenn das Ergebnis seltsam aussieht.

![Die Vorschau-Karte: die Zeichnung in der gewünschten Größe gerendert, darunter ihre Pixelmaße.](https://abox.tools/screens/convert-an-svg-to-png/preview.webp)

Das Werkzeug zeichnet die Datei, bevor es sie speichert, und zwar in der Größe, in der sie gespeichert wird. Was am Export nicht stimmt, sieht man zuerst hier.

## Warum die Größe Ihre Sache ist und nicht die der Datei

Bei einem JPEG hat die Frage nach der Größe eine Antwort: Es ist ein Raster aus abgemessenen Pixeln. Ein SVG dagegen ist gar kein Bild, sondern eine Sammlung von Anweisungen: hier ein Kreis, dort dieser Pfad in jener Farbe. Anweisungen haben keine Größe. Ein Browser führt sie bei 16 Pixeln genauso aus wie bei 4000, und in beiden Fällen ist das Ergebnis gleich scharf, denn skaliert wird dabei nichts. Es wird neu gezeichnet.

Deshalb kann Ihnen die Umwandlung die Zahl nicht abnehmen, und deshalb kostet eine große Zahl auch nichts. Das ist die eine Bildaufgabe, bei der „dann eben größer“ gratis ist.

Die meisten SVG-Dateien tragen zwar ein `width`- und ein `height`-Attribut, und ein Werkzeug zeigt Ihnen das an. Es ist aber eine Voreinstellung und keine Grenze. Ein Symbol mit `width="24"` sagt nur, dass beim Zeichnen eine 24 Pixel hohe Werkzeugleiste im Kopf war.

## Woher die Zahl wirklich kommt

**Für eine Website.** Nehmen Sie den Platz, den das Bild auf der Seite in CSS-Pixeln einnimmt, und multiplizieren Sie ihn mit der Pixeldichte der Bildschirme, die Ihnen wichtig sind. Ein Logo in einer 200 Pixel breiten Lücke braucht 400 Pixel für ein Retina-Notebook und 600 für ein neueres Handy. Mehr steckt hinter `@2x` und `@3x` nicht, und deshalb erspart Ihnen ein Werkzeug, das sie gleich mitschreibt, dieselbe Rechnung dreimal.

**Für ein App-Symbol, einen Store-Eintrag oder ein Favicon.** Da ist nichts zu rechnen. Die Zahl steht veröffentlicht in den Vorgaben, und Sie nehmen genau die. Bei einem Favicon rastern Sie am besten gar nicht erst, sondern [erzeugen eine .ico](https://abox.tools/de/ratgeber/favicon-selbst-erstellen/). Die hält mehrere Größen in einer Datei, und Browser-Tab, Lesezeichen und Windows-Verknüpfung verlangen jeweils eine andere.

**Für den Druck.** Physische Größe in Zoll mal Auflösung des Druckers. Ein Logo, das auf einer Visitenkarte zwei Zoll breit wird, ergibt bei 300 dpi 600 Pixel; dasselbe Logo über die ganze A4-Breite, also 8,3 Zoll, rund 2500. Druckereien setzen 300 dpi als selbstverständlich voraus, und für ein großes Banner, das man aus einigen Metern Entfernung sieht, genügen 150 locker.

**Für eine Social-Vorschau oder ein OG-Bild.** Die Plattform gibt einen Rahmen vor, bei den meisten Link-Vorschauen ⁦1200 × 630⁩, und der hat ein anderes Seitenverhältnis als Ihr Logo. Dafür gibt es die Einstellung „Auffüllen“: Die Zeichnung bleibt in ihren Proportionen und sitzt mittig, den Rest übernimmt eine Hintergrundfarbe. Alles besser als ein verzerrtes Logo, das jedem sofort verrät, dass niemand nachgesehen hat.

Treffen zwei Fälle zu, nehmen Sie die größere Zahl. Ein PNG, das größer ist als nötig, ist ein etwas längerer Download. Eines, das zu klein geraten ist, lässt sich hinterher nicht mehr retten, und warum, steht im nächsten Abschnitt.

![Die Größen-Karte: ein Menü der Arten, die Größe anzugeben, auf Breite gestellt, mit 1024 eingetragen und Voreinstellungen daneben.](https://abox.tools/screens/convert-an-svg-to-png/size.webp)

Fünf Arten, dasselbe zu sagen. Welche richtig ist, hängt davon ab, ob Ihnen eine Zahl genannt wurde oder ein Platz, an den es soll.

## Zurück führt kein Weg

Rastern ist eine Einbahnstraße. Ist die Zeichnung erst ein PNG, sind es Pixel wie in jedem anderen Bild, und wer sie später vergrößert, muss Detail erfinden, das nie gemessen wurde. Heraus kommt dasselbe weiche, verschmierte Ergebnis wie beim Aufblasen einer Fotografie.

Heben Sie das SVG also auf. Es ist die Vorlage, es ist fast immer die kleinere Datei, und jede künftige Größe fällt daraus tadellos heraus. Das PNG ist ein Export für einen bestimmten Zweck. Brauchen Sie eine andere Größe, exportieren Sie neu, statt am Exportierten herumzuskalieren.

Es gibt Programme, die versprechen, ein PNG zurück in ein SVG zu verwandeln. Was sie tun, heißt Nachzeichnen: Sie raten, welche Kurven ein Pixelraster erklären könnten. Bei flacher zweifarbiger Grafik geht das passabel, bei allem anderen kommt teurer Unsinn heraus. Und was die ursprüngliche Zeichnung hatte, holt es nie zurück.

## Drei Dinge ändern sich, sobald daraus Pixel werden

Wenn ein gerastertes SVG falsch aussieht, liegt es fast immer an einem dieser drei Punkte. Alle drei sollte man vor dem Export kennen und nicht danach.

**Text erscheint in der Schrift, die das Gerät gerade hergibt.** Ein SVG mit Text enthält die Schrift nicht. Es nennt nur eine und überlässt es dem Renderer, sie zu finden. Fehlt sie, springt ein Ersatz ein, und der hat andere Buchstabenformen und andere Laufweiten, der Text bricht dann um oder läuft über. Noch schlechter ergeht es einer Datei, die ihre Schrift von einer Webadresse nachladen will. Ein SVG, das über ein `<img>` gerastert wird, darf überhaupt nichts abrufen, es kommt also nichts an.

Die Abhilfe kennt jede Gestalterin ohnehin: **Text vor dem Export in Pfade umwandeln** (Illustrator: „In Pfade umwandeln“, Figma: „Flatten“, Inkscape: „Objekt in Pfad“). Aus den Buchstaben wird Geometrie, die Schrift spielt keine Rolle mehr, und das Bild sieht auf jedem Gerät gleich aus. Machen Sie das an einer Kopie, denn in Pfade umgewandelter Text lässt sich nicht mehr als Text bearbeiten.

**Haarlinien werden grau oder verschwinden ganz.** Eine Linie, die bei der gewählten Größe rechnerisch schmaler als ein Pixel wird, lässt sich nicht durchgezogen zeichnen, also wird sie blass gezeichnet. Genau deshalb wirkt ein filigranes Logo bei 64 Pixeln ausgewaschen, während dieselbe Datei bei 512 tadellos aussieht. Ist die kleine Größe Vorgabe, hilft keine andere Exporteinstellung, sondern nur eine vereinfachte Zeichnung mit kräftigeren Linien. Aus demselben Grund ist ein Favicon ein Zeichen und kein Schriftzug.

**Animationen bleiben stehen.** Ein animiertes SVG rastert zu einem einzigen Standbild, nämlich zum ersten Einzelbild. Daran ändert keine Exporteinstellung etwas. Brauchen Sie die Bewegung, brauchen Sie ein GIF oder ein Video, und dorthin führt ein anderer Weg.

## Transparenz, und welches Format es sein sollte

**PNG**, solange nichts dagegen spricht. Verlustfrei, behält Transparenz, und einfarbige Flächen mit harten Kanten komprimiert es gut, woraus eine Zeichnung zum größten Teil besteht. Ein gerastertes Logo wird als PNG meist *kleiner* als dieselbe Grafik im JPEG, und obendrein sauberer.

**JPEG** kennt keine Transparenz. Jedes transparente Pixel muss irgendeine Farbe annehmen, und wählt niemand eine, wird es schwarz. Daher rührt das Logo im schwarzen Kasten, das viele für einen Programmfehler halten. Dazu kommt, dass JPEG genau auf die Art verlustbehaftet ist, die sich bei solchen Bildern am hässlichsten zeigt, nämlich als Kranz aus Sprenkeln um jede harte Kante. Nehmen Sie es nur, wenn etwas darauf besteht.

**WebP** kann alles, was PNG kann, in einer kleineren Datei, und jeder aktuelle Browser liest es. Der Grund, es trotzdem nicht zu nehmen, liegt hinter dem Browser: ältere Software, manche Druckereien und eine ganze Reihe von Upload-Formularen öffnen keines.

Und eine Hintergrundfarbe auch beim PNG zu wählen ist ein völlig normaler Wunsch. Transparenz nützt nur, solange Sie nicht wissen, auf welcher Farbe das Bild landet. Steht schon fest, dass es eine weiße Seite ist, erspart Ihnen der Export gleich auf Weiß eine ganze Kategorie von Überraschungen.

## Wenn der Export leer oder falsch herauskommt

**Nur leere Fläche.** Meist fehlt das `xmlns`-Attribut am Wurzelelement. Ohne das ist die Datei für ein Bild-Element kein SVG, und sie zeichnet sich als nichts. Der schnelle Test geht so: die Datei im Browser öffnen. Zeigt auch der nichts, liegt es an der Datei und nicht am Konverter.

**Die Zeichnung sitzt winzig in der linken oberen Ecke.** Dann hat die Datei zwar `width` und `height`, aber keine `viewBox`. Damit fehlt das Koordinatensystem, an dem sich skalieren ließe, und die Grafik behält ihre ursprünglichen Einheiten auf einem größeren Canvas. Ein guter Konverter ergänzt die viewBox von sich aus. Hat Ihrer das nicht getan, tragen Sie `viewBox="0 0 *Breite* *Höhe*"` von Hand am Wurzelelement nach. Die Datei ist reiner Text, das können Sie also selbst.

**Ein Teil des Bildes fehlt.** Dann verwies etwas in der Datei auf eine Adresse, statt die Grafik selbst zu enthalten: ein eingebettetes Foto, das nur verlinkt ist, ein Stylesheet, eine Schrift. Ein Rasterer, der sich weigert, so etwas nachzuladen, tut genau das Richtige, denn es ist dieselbe Weigerung, die verhindert, dass ein irgendwo heruntergeladenes SVG seinem Urheber Meldung macht. Exportieren Sie im Zeichenprogramm neu, diesmal mit eingebetteten Bildern.

**Eine sehr große Größe wird abgelehnt.** Browser begrenzen, wie groß ein Canvas werden darf, und einig sind sie sich dabei nicht. Jenseits von rund 16.000 Pixeln Kantenlänge kommt nichts mehr zurück, und Safari auf iPhone und iPad gibt viel früher auf, bei etwa ⁦4096 × 4096⁩. Ein Werkzeug, das Sie vorher warnt, bewahrt Sie vor einer leeren Datei, denn genau die liefert ein Browser, wenn ihm die Luft ausgeht, und eben keine Fehlermeldung.

## Nichts davon braucht einen Upload

Ein SVG zu rastern tut jeder Browser tausendmal am Tag, mit derselben Maschinerie, die ein Symbol auf einer Webseite zeichnet. Es gibt keinen technischen Grund, warum Ihre Grafik zu einem Server und wieder zurück reisen sollte, um als PNG herauszukommen, und das Werkzeug hier schickt sie nirgendwohin. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns.

Bei SVG wiegt das schwerer als sonst, denn ein SVG ist ein Dokument und kein Bild. Es kann ein Skript und eine entfernte Adresse enthalten, und das Logo, das Ihnen eine Agentur geschickt hat, ist eine Datei, die Sie nicht selbst geschrieben haben. Über ein Bild-Element gezeichnet, landet es in dem, was die Spezifikation *secure static mode* nennt. Das Skript kann nicht laufen, und die Adresse wird nie kontaktiert. Dafür sorgt der Browser und nicht die Website.

Wer lieber prüft als glaubt, lädt die Seite, trennt die Internetverbindung und wandelt trotzdem etwas um. Drei weitere Proben, die Sie an jedem Werkzeug durchführen können, stehen in [Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)
