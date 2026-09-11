# So erzeugen Sie einen QR-Code, der sich auch mit fremden Handys scannen lässt

Einen QR-Code zu erzeugen dauert eine Sekunde. Einen zu erzeugen, der auf einer feuchten Speisekarte funktioniert, am Buswartehäuschen und auf einem bei schlechtem Licht auf Armlänge gehaltenen Handy, kostet vier Entscheidungen, und alle vier fallen, bevor irgendetwas gedruckt wird. Hier steht, was jede davon bewirkt.

[QR- & Barcode-Generator öffnen](https://abox.tools/de/qr-code-erstellen/): Eintippen, und es wird ein Code. Zum Erzeugen wird nichts gesendet.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [QR- & Barcode-Generator](https://abox.tools/de/qr-code-erstellen/), fügen Sie Ihren Link ein, lassen Sie die Stufe auf **M** und den Rand auf **4** und laden Sie das SVG herunter. Drucken Sie ihn mindestens zwei Zentimeter breit, auf etwas Mattem, dunkel auf hell. Und scannen Sie den Andruck dann mit einem Handy, das nicht Ihres ist, bevor Sie tausend Stück bestellen.

Damit ist fast jeder Fall abgedeckt. Der Rest dieser Seite handelt von allem anderen: von einem Code, der etwas aushalten muss, von einem Code mit Logo, von einem Code auf etwas sehr Kleinem, und von der einen Entscheidung, die sich so falsch treffen lässt, dass Sie es erst ein Jahr später merken.

## Was in einem QR-Code tatsächlich steckt

Eine Zeichenkette. Mehr nicht. Beim Scannen bekommt das Handy ein Stück Text gereicht, und alles Weitere macht das Handy selbst: Es erkennt die Form dieses Textes und bietet Ihnen an, eine Seite zu öffnen, einem Netz beizutreten oder einen Kontakt zu speichern.

Eine eigene Sorte „WLAN-QR-Code“ gibt es deshalb gar nicht. Es gibt einen QR-Code, in dem `WIFI:T:WPA;S:Mein Netz;P:das Passwort;;` steht, und den liest jedes Handy der letzten zehn Jahre. Genau dafür zeigt Ihnen der Generator die fertige Zeichenkette. Tut ein Code nicht das, was Sie erwartet haben, lohnt es sich nur, sie anzusehen.

Daraus folgt auch, dass sich ein QR-Code nach dem Druck nicht mehr ändern lässt, dass er nicht nach Hause funken kann und dass er auch nicht ablaufen kann. Es sei denn, jemand hat einen Link auf seinen eigenen Server hineingelegt, und davon handelt der letzte Abschnitt.

![Ein fertiger QR-Code mit seinen Angaben darunter: die Symbologie, die Version, die Fehlerkorrekturstufe und die Anzahl der Zeichen.](https://abox.tools/screens/make-a-qr-code/result.webp)

Was im Code steckt, in den Begriffen des übrigen Ratgebers. Die Version wächst mit dem Inhalt, weshalb die beiden Einstellungen darunter zählen.

## Entscheidung eins: die Fehlerkorrekturstufe

Neben den Daten trägt ein QR-Code einen Satz Prüfwörter, berechnet so, dass ein Lesegerät wieder aufbauen kann, was es nicht zu sehen bekam. Deshalb lässt sich ein Code mit abgerissener Ecke noch scannen. Wie viele dieser Prüfwörter mitfahren, ist die Stufe, und davon gibt es vier:

- **L**: rund 7 % des Codes dürfen verloren gehen.
- **M**: rund 15 %.
- **Q**: rund 25 %.
- **H**: rund 30 %.

Mehr Korrektur gibt es nicht umsonst. Die Prüfdaten müssen in dasselbe Quadrat, derselbe Text braucht bei H also einen größeren und dichteren Code als bei L. Grob gerechnet verdoppelt der Weg von L nach H die Zahl der Module, und je dichter die Module, desto schwerer tut sich eine Kamera. Hier steckt ein echter Handel, und wie er ausgeht, hängt daran, wo der Code hinkommt.

**L** ist für den Bildschirm: ein Code auf einer Folie, in einer E-Mail, auf einer Webseite. Beschädigen wird ihn nichts, und jedes zusätzliche Modul macht ihn aus der Entfernung schwerer lesbar.

**M** ist die Voreinstellung und für die meisten Drucksachen die richtige Wahl: für Papier, das ein wenig angefasst wird, für einen Flyer, für eine Visitenkarte.

**Q und H** sind für Codes, denen übel mitgespielt wird: die täglich abgewischte Speisekarte, der Aufkleber an einer Maschine in der Werkstatt, das Etikett auf einer Kiste, der Code im Schaufenster mit direkter Sonne. H ist außerdem das, was ein Logo in der Mitte überhaupt möglich macht, wovon gleich noch die Rede sein wird.

![Die QR-Optionen: ein Menü für die Fehlerkorrekturstufe auf Mittel und eine Ruhezone von vier Modulen.](https://abox.tools/screens/make-a-qr-code/options.webp)

Beide sorgen dafür, dass der Code die wirkliche Welt übersteht — einen Knick, ein Logo, einen schlechten Druck —, und beide werden vor dem Zeichnen gesetzt.

## Entscheidung zwei: der Rand, der zum Code gehört

Der weiße Bereich um einen QR-Code ist kein Abstand und keine Gestaltungsfrage. Ein Lesegerät findet daran, wo das Symbol endet. Die Spezifikation verlangt auf jeder Seite vier Module ruhige Fläche, und ein bis an die Kante beschnittener Code ist mit Abstand der häufigste Grund, warum ein gedruckter Code nicht funktioniert.

Das muss man deutlich sagen, denn Beschneiden ist eine so naheliegende Handlung. Der Code sieht aus, als habe er zu viel Weiß um sich, also wird er im Layout beschnitten, auf eine farbige Fläche gesetzt, die bis an die Quadrate heranläuft, oder gleich auf ein Foto gelegt. Jedes Mal verschwindet die Grenze, an der sich das Lesegerät orientieren wollte.

Wirkt der Code mit seinem Rand zu groß, machen Sie den Code kleiner. Nur den Rand nicht.

## Entscheidung drei: wie groß gedruckt wird

Die Faustregel, die den Kontakt mit der Wirklichkeit überstanden hat, heißt **eins zu zehn**: Ein Code muss etwa ein Zehntel so breit sein wie die Entfernung, aus der gescannt wird.

- Visitenkarte oder Speisekarte, gelesen aus 30 cm: rund 2 cm breit.
- Plakat, gelesen aus zwei Metern: rund 20 cm.
- Buswartehäuschen oder Schaufenster, gelesen aus fünf Metern: rund 50 cm.

Zwei Zentimeter sind eine Untergrenze und kein Ziel. Unterhalb von etwa 1,5 cm kommt ein gewöhnliches Handy ins Straucheln, wie gut der Druck auch sein mag. Die einzelnen Module nähern sich dann der Größe eines Pixels in seiner Kamera.

Weniger Text heißt weniger Module heißt ein Code, der sich bei gleicher Druckgröße aus größerer Entfernung lesen lässt. Ein guter Grund, einen Code auf `example.com/x` zeigen zu lassen statt auf eine URL mit hundert Zeichen Tracking-Parametern am Ende.

Und drucken Sie aus dem **SVG**. Ein QR-Code besteht aus Kanten, und ein PNG hat eine feste Zahl Pixel, aus denen es sie bauen muss. Vergrößern Sie eines, wird jede Kante weich, und genau damit tut sich ein Scanner schwer. In einem SVG stehen die Quadrate als Anweisungen, es kommt also auf der Visitenkarte so scharf heraus wie auf der Plakatwand.

## Farbe, Kontrast und die zwei üblichen Fehler

Ein Lesegerät misst den Unterschied zwischen dunklen und hellen Modulen, alles hängt also am Kontrast. Zwei Dinge gehen regelmäßig schief:

**Heller Code auf dunklem Grund.** Sieht auffällig aus, und eine ganze Reihe Lesegeräte weist es rundheraus ab. Sie suchen dunkel auf hell und probieren die Umkehrung gar nicht erst. Manche tun es doch. Welche Ihre Kundschaft im Handy hat, werden Sie nie erfahren.

**Zu wenig Unterschied.** Mittelgrau auf Weiß oder zwei Hausfarben von ähnlicher Tiefe können sich am Bildschirm tadellos messen lassen und auf Papier scheitern, sobald Tonwertzuwachs und die automatische Belichtung eines Handys mitspielen. Wenn Sie einen Code einfärben, halten Sie den dunklen Teil wirklich dunkel.

Matt schlägt glänzend bei allem, was unter einer Lampe gescannt wird, und beides schlägt den Druck auf ein Foto. Transparente Hintergründe sind praktisch, um einen Code auf eine farbige Fläche zu setzen. Sehen Sie aber nach, was am Ende wirklich dahinter landet, denn ein transparenter Code auf dunkler Fläche ist der erste Fehler von oben, nur auf Umwegen.

## Ein Logo in der Mitte

Das funktioniert, und zwar wegen der Fehlerkorrektur und nicht ihr zum Trotz. Auf Stufe H dürfen rund 30 % der Module zerstört sein, ohne dass der Code unlesbar wird. Ein Logo, das deutlich weniger verdeckt und obendrein in der Mitte sitzt, wo kein Suchmuster liegt, ist also ein Schaden, den das Lesegerät repariert.

Drei Regeln dazu. Nehmen Sie Stufe H. Halten Sie das Logo unter etwa einem Fünftel der Fläche, also mit deutlichem Abstand zur theoretischen Grenze, denn der Druck ist nicht das Einzige, was an Ihrer Reserve knabbert. Und verdecken Sie niemals die drei großen Quadrate in den Ecken oder die kleineren daneben. Daran findet ein Lesegerät das Symbol überhaupt erst und richtet es aus, und die baut keine Fehlerkorrektur der Welt wieder auf.

Danach probieren Sie es an echten Handys aus. Ein Logo bringt einen Code von „funktioniert immer“ auf „funktioniert mit so viel Reserve“, und wie viel Reserve übrig ist, verrät nur der Versuch.

## Die Entscheidung, die später bereut wird: statisch oder „dynamisch“

Suchen Sie nach einem QR-Generator, wollen die meisten Treffer, dass Sie ein Konto anlegen, denn sie verkaufen *dynamische* Codes. In einem dynamischen Code steht nicht Ihr Link, sondern ein Kurzlink auf den Server des Generators, der von dort auf Ihren weiterleitet.

Was Sie dafür bekommen, ist echt: Sie können nach dem Druck ändern, wohin der Code führt, und Sie bekommen jeden Scan gezählt. Bei einer Kampagne mit sechsstelliger Auflage ist das sein Geld wert.

Was es kostet, ist ebenso echt, und man sollte es vorher wissen und nicht hinterher:

- **Der Code hört auf zu funktionieren, wenn die anderen aufhören.** Macht der Dienst zu, läuft die Domain aus oder endet die kostenlose Stufe, ist jeder gedruckte Code tot, und bis dahin klebt er auf zehntausend Speisekarten.
- **Jeder Scan sind Daten, die jemand anderem zufließen.** Die Weiterleitung sieht IP-Adresse, Uhrzeit und Gerät jedes Menschen, der Ihren Code scannt.
- **Der Link gehört denen und nicht Ihnen.** Wer scannt, sieht eine fremde Domain vorbeihuschen, und genau davor wird allen geraten, misstrauisch zu sein.

Der Mittelweg kostet nichts: einen statischen QR-Code um eine kurze URL *auf Ihrer eigenen Domain* legen und diese selbst weiterleiten. Sie können das Ziel weiterhin ändern und behalten die Auswertung, und nichts an dem Code hängt daran, ob es eine Firma, die Sie nie getroffen haben, nächstes Jahr noch gibt.

Der [Generator hier](https://abox.tools/de/qr-code-erstellen/) erzeugt nur statische Codes, und ein Konto gibt es nicht anzulegen. Was Sie eintippen, ist das, was im Code steht.

## Bevor Sie tausend Stück drucken

Scannen Sie den Code. Nicht den auf Ihrem Bildschirm, sondern den gedruckten Andruck, an dem Ort, an den er kommt, mit einem Handy, das nicht das ist, auf dem Sie ihn gemacht haben. Das dauert eine Minute und fängt die ganze Sorte Probleme ab, von der diese Seite handelt: einen Rand, den das Layout gefressen hat, einen Link ohne sein `https://`, eine Farbe, die sich auf Papier anders misst, eine Größe, die auf dem Schreibtisch funktioniert und an der Wand nicht.

Und sehen Sie nach, was nach dem Scan passiert. Ein Code, der eine Seite öffnet, die auf einem Handy unlesbar ist, ist ein gescheiterter Code, auch wenn das Scannen selbst geklappt hat.

## Nichts davon verlangt einen Upload

Ein QR-Code ist Rechnerei über einer Zeichenkette. Es gibt keine Datei zu schicken und nichts, was ein Server könnte und ein Browser nicht. Deshalb erledigt das [Werkzeug hier](https://abox.tools/de/qr-code-erstellen/) alles davon auf Ihrem eigenen Gerät und arbeitet auch mit gekappter Netzverbindung.

Das wiegt schwerer, als es klingt, wegen dessen, was die Leute in QR-Codes legen. Am häufigsten steht im WLAN-Format das tatsächliche Passwort eines Netzes, getippt in eine Webseite. Ob diese Seite überhaupt einen Ort hatte, an den sie es hätte schicken können, ist dann durchaus wissenswert.
