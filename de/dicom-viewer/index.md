# DICOM-Viewer — eine .dcm-Aufnahme im Browser öffnen

CT, MRT, Röntgen und Ultraschall, mit Fenster, Header und Messungen.

> Öffnen Sie CT-, MRT-, Röntgen- und Ultraschallaufnahmen im Browser. Fenster und Zentrum, eine ganze Serie durchblättern, in Millimetern messen, jeden DICOM-Tag lesen und genau sehen, was in der Datei die Patientin oder den Patienten benennt. Nichts wird hochgeladen.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/dicom-viewer/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Aufnahmen werden **nie hochgeladen**. Es gibt keinen Server.

Die Aufnahme wird von Ihrem eigenen Browser geöffnet und dekodiert: der Header, die Pixel, das Fenster, die Messungen. Am anderen Ende dieser Seite steht kein Server, an den sich geschützte Gesundheitsdaten senden ließen, selbst wenn hier etwas das wollte, und nichts über die Datei wird irgendwem mitgeteilt, weder der Name der Patientin noch die Studie noch der Dateiname.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Läuft offline
- ✓ Quelloffen
- ✓ Dateien bleiben auf Ihrem Gerät

## So öffnen Sie eine DICOM-Datei

1. **Wählen Sie die Dateien.** Eine einzelne `.dcm`-Datei oder gleich den ganzen Ordner von der CD. Ein CT oder ein MRT ist eine Datei pro Schicht, und erst wenn Sie alle auf einmal hineinziehen, setzt sich die Serie wieder zusammen. Der Browser liest sie direkt von Ihrer Festplatte, dabei geht nichts irgendwohin.
2. **Wählen Sie die Serie.** Eine Studie enthält meist mehrere: die Übersichtsaufnahme und dann jede Akquisition. Jede wird in der Reihenfolge gestapelt, in der das Gerät sie aufgenommen hat, ermittelt aus der Lage jeder Schicht im Körper und nicht aus der Nummerierung, die nicht immer in dieselbe Richtung läuft.
3. **Stellen Sie das Fenster ein.** Das ist der Regler, der eine Aufnahme lesbar macht, und der, den ein Bildbearbeitungsprogramm nicht hat. Ziehen Sie quer über das Bild, um das Fenster zu weiten, und nach oben oder unten, um sein Zentrum zu verschieben. Oder nehmen Sie bei einem CT eines der benannten Fenster: Lunge, Knochen, Hirn, Weichteile. Dort bedeuten die Werte auf jedem Gerät der Welt dasselbe.
4. **Blättern Sie durch den Stapel.** Der Regler unter dem Bild geht durch die Schichten, und sobald Sie das Bild angeklickt haben, tun das die Pfeiltasten auch. Eine Mehrbild-Datei, eine Ultraschallschleife oder ein Angiogramm, läuft über den Knopf daneben als Film.
5. **Messen Sie etwas.** Wechseln Sie auf Messen und ziehen Sie eine Linie. Wo die Datei sagt, wie weit ihre Pixel auseinanderliegen, steht das Ergebnis in Millimetern und rechnet nicht quadratische Pixel mit ein. Wo sie es nicht sagt, steht es in Pixeln und sagt das auch, statt einen Maßstab zu erfinden.
6. **Lesen Sie den Header.** Jedes Element der Datei, mit seiner Nummer, seinem Namen aus dem Standard und seinem Inhalt, durchsuchbar. Darüber die Liste dessen, was in genau dieser Datei die Patientin oder den Patienten benennt, und das ist erheblich mehr als der Name.
7. **Nehmen Sie mit, was Sie brauchen.** Das Bild auf dem Schirm als PNG, mit dem Fenster, das Sie eingestellt haben, und ohne eingebrannte Beschriftung. Oder den ganzen Header als Text. Beides entsteht in der Seite aus dem, was ohnehin schon da ist.

## Die ausführliche Fassung

[Wie Sie eine DICOM-Datei öffnen, und was in einer steckt](https://abox.tools/de/ratgeber/dicom-datei-oeffnen/): Was auf einer Klinik-CD liegt, warum die Dateien keine Endung haben, wie sich eine .dcm-Aufnahme im Browser öffnen lässt, was Fenster und Zentrum wirklich tun und was eine Aufnahme außer dem Bild noch über die Patientin trägt.

## Auch im Werkzeugkasten

- [Bild zu ICO](https://abox.tools/de/favicon-erstellen/): Ein Bild hinein. Jede Größe, die ein Browser, Windows oder ein Mac verlangt, heraus.
- [Bild als Data-URI](https://abox.tools/de/bild-als-base64/): Das ganze Bild als eine Zeile Text. Direkt in CSS oder HTML einfügen.
- [SVG zu Bild](https://abox.tools/de/svg-in-png-umwandeln/): Nennen Sie die Größe. Ein Vektor hat keine eigene, die er verlieren könnte.
- [Bild zu SVG](https://abox.tools/de/bild-in-svg-umwandeln/): Eine Form, eine Kontur. Zeigen Sie auf das, was nicht hineingehört.

## Fragen

### Wird meine Aufnahme irgendwohin hochgeladen?

Nein. Die Datei wird von Ihrem eigenen Browser auf Ihrer eigenen Hardware gelesen, dekodiert und gezeichnet. Dieses Werkzeug hat keine Serverseite, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf. Keine davon gehört uns. Trennen Sie die Netzverbindung, und sie öffnet weiter Aufnahmen. \
\
Das wiegt hier schwerer als auf jeder anderen Seite dieser Website. Eine DICOM-Datei trägt Name, Geburtsdatum und Patientennummer im Header. Wer sie in einen Online-Viewer lädt, übergibt einem Fremden eine Krankenakte, kein Bild.

### Welche DICOM-Dateien kann er öffnen?

Unkomprimierte Dateien in allen drei Basis-Transfersyntaxen, also implicit und explicit little endian sowie die zurückgezogene big-endian-Variante, dazu deflated, RLE Lossless, Baseline JPEG und JPEG Lossless. Letzteres ist das, womit die meisten CT- und MRT-Studien auf einer Klinik-CD komprimiert sind. \
\
Nicht dekodieren kann er JPEG 2000, JPEG-LS und die MPEG- und HEVC-Syntaxen für Video. Dafür bräuchte es Codecs, die als kompilierte Bibliothek mehrere Megabyte wiegen, und eine Seite, die so etwas bei Bedarf nachlädt, wäre keine Seite, die offline arbeitet. Eine Datei in einem dieser Formate öffnet trotzdem: Der ganze Header wird gelesen und angezeigt, und an die Stelle des Bildes tritt eine Zeile, die den Codec benennt, statt eines Platzhaltersymbols, das Ihnen nichts sagt.

### Was ist „Fenster und Zentrum“, und wozu brauche ich das?

Eine CT-Schicht enthält rund viertausend unterscheidbare Werte, Ihr Bildschirm zeigt zweihundertsechsundfünfzig Graustufen. Das Fenster ist die Entscheidung, welcher Ausschnitt dieses Bereichs alle davon bekommt: Alles darunter ist schwarz, alles darüber weiß, und was dazwischen liegt, verteilt sich auf die Graustufen. \
\
Deshalb sieht dieselbe Datei unter zwei Einstellungen aus wie zwei verschiedene Aufnahmen, und deshalb lassen sich Lunge und Knochen nicht gleichzeitig sehen. Bei einem CT sind die Zahlen Hounsfield-Einheiten, und die sind absolut festgelegt: Wasser ist 0 und Luft ist −1000. Die benannten Fenster auf dieser Seite tragen deshalb genau die Werte, die eine Radiologin an ihrer Befundungsstation verwendet. Bei einem MRT oder einem Ultraschall gibt es keine solche Skala, und das Fenster, mit dem geöffnet wird, ist das, um das die Datei selbst bittet.

### Warum steht meine Messung in Pixeln?

Weil diese Datei nicht sagt, wie groß ein Pixel ist. Das trägt Pixel Spacing (0028,0030), in Millimetern, und sehr vielen Ultraschallbildern, eingescannten Dokumenten und Secondary Captures fehlt es schlicht. \
\
Wo es da ist, steht die Messung in Millimetern, und jede Achse wird mit ihrem eigenen Abstand gerechnet, was bei den Bildern zählt, deren Pixel nicht quadratisch sind. Wo es fehlt, ist eine Anzahl Pixel die ehrliche Antwort, und die steht dann da, statt dass ein Maßstab gewählt und das Ergebnis als Länge ausgegeben würde.

### Er hat meinen Ordner als mehrere Serien geöffnet. Warum?

Weil das drinsteht. Eine Studie besteht aus Serien, der Übersichtsaufnahme und dann jeder Akquisition oder Rekonstruktion, und jede Datei sagt in Series Instance UID (0020,000E), zu welcher sie gehört. Die Auswahlliste wird daraus gebaut und nicht aus dem Ordner, in dem meist alles durcheinander in einer Namensliste liegt. \
\
Innerhalb einer Serie werden die Schichten nach ihrer Lage im Körper sortiert, ermittelt aus Image Position und Image Orientation. Instance Number wäre der naheliegende Schlüssel und ist hier nur der Rückfall: Sie wird von dem vergeben, was die Dateien geschrieben hat, und muss nicht in dieselbe Richtung laufen wie die Patientin auf dem Tisch.

### Was bedeutet die Liste „was in dieser Datei die Patientin benennt“?

Sie enthält jedes Feld Ihrer Datei, das die abgebildete Person benennt oder eingrenzt, wer sie sein könnte, ausgelesen aus dieser Datei auf Ihrem Gerät. Die Liste stammt aus PS3.15 des DICOM-Standards, also aus dem Teil, der festlegt, was weg muss, bevor ein Datensatz anonymisiert heißen darf. \
\
Sie steht da, weil das, was Leute falsch einschätzen, nicht die Tatsache ist, dass ein Name in einer Aufnahme steht. Es ist, wie viel sonst noch darin steht: Geburtsdatum, Auftragsnummer, überweisende Ärztin, Einrichtung, Seriennummer des Geräts und die Studien-UIDs, die perfekte Schlüssel zurück in das Archiv sind, aus dem die Datei stammt. Eine Aufnahme, bei der nur der Name geleert wurde, ist nicht anonym. \
\
Dieses Werkzeug zeigt Ihnen das nur. Es schreibt nichts und ändert nichts, also kann es auch nichts davon entfernen.

### Kann er eine Aufnahme anonymisieren?

Nein, und er tut auch nicht so. Diese Seite liest; sie hat keinen Code, der eine DICOM-Datei schreibt. Was sie tut, ist Ihnen genau zu sagen, was in Ihrer drinsteht, und das ist der Teil, der schwer herauszufinden ist und bei dem sich Leute irren. \
\
Ein Werkzeug, das die Identifikatoren entfernt, ist eine eigene Aufgabe mit deutlich höherer Messlatte: Es muss die Datei neu schreiben, ohne die Pixel anzufassen, die UIDs über eine ganze Studie hinweg konsistent ersetzen und bei den privaten Elementen richtig liegen, in denen manche Geräte eine zweite Kopie des Namens verstecken. Es steht auf der Roadmap dieser Seite und wird nicht an einen Viewer angeflanscht.

### Kann er eine Datei ohne .dcm-Endung öffnen, oder eine beschädigte?

Beides ja. Die Endung wird nicht angesehen, geprüft wird die Datei selbst. Ein Datensatz ohne die üblichen 128 Byte Vorspann, und so sieht eine Aufnahme aus, die direkt aus dem Netz gezogen wurde, wird gelesen, indem seine Kodierung aus dem ersten Element erschlossen wird, und die Seite sagt Ihnen, dass sie das getan hat. \
\
Eine Datei, die mittendrin endet, wird so weit gelesen, wie sie reicht. Alles vor dem Bruch wird angezeigt, mit einem Hinweis, bei welchem Byte Schluss war. Genau dafür will man einen Viewer am dringendsten, und die ganze Datei wegen ihrer letzten zwölf Byte wegzuwerfen wäre das falsche Verhalten.

### Ist das ein Befundungs-Viewer?

Nein. Er ist kein Medizinprodukt, hat kein Zulassungsverfahren durchlaufen, und nichts hier gehört zur Grundlage einer klinischen Entscheidung. Ihr Bildschirm ist nicht kalibriert, der Browser ist keine validierte Rendering-Kette, und beides lässt sich aus einer Webseite heraus nicht beheben. \
\
Gut ist er für alles andere, wofür Leute eine Aufnahme öffnen: nachsehen, was auf einer CD ist, eine Schicht für eine Lehrveranstaltung oder ein Paper herausziehen, einen Header lesen, herausfinden, warum ein anderes Programm die Datei verweigert, und sehen, was eine Aufnahme über die abgebildete Person mit sich trägt.

### Verändert er meine Datei?

Nein. Dieses Werkzeug liest nur. Es gibt keine Ausgabedatei, keine Neukodierung und keinen Knopf, der ein DICOM schreibt. Herunterladen können Sie ein PNG des Bildes auf dem Schirm und eine Textfassung des Headers. Ihr Original liegt unberührt auf Ihrer Festplatte.

### Ist das kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Es gibt auch keine Grenze für die Dateigröße oder die Anzahl der Dateien außer dem Speicher Ihres eigenen Geräts. Die Seite trägt Werbung, und die bezahlt sie; die Werbung bekommt nichts über Ihre Datei.

### Läuft er offline?

Ja. Laden Sie die Seite einmal, trennen Sie danach die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Weg zu prüfen, dass nichts hochgeladen wird: Ein Werkzeug, das Ihre Aufnahme zum Rendern wegschickt, hört in dem Moment auf, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Aufnahme hat keinen Ort, an den sie gehen könnte.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Datei gesammelt werden könnte, und keinen Code, der sie senden würde, wenn es ihn gäbe. Früher stand hier `connect-src 'none'`, und das war absolut. Die Werbung hat das gekostet, und das gehört dazugesagt.
- **Hier wiegt das schwerer als auf den anderen Seiten.** Eine DICOM-Datei ist kein Bild mit ein paar Metadaten daran. Sie ist eine Krankenakte mit einem Bild darin: Name, Geburtsdatum, Patientennummer, Auftragsnummer, überweisende Ärztin, Einrichtung und die Seriennummer des Geräts stehen alle als Felder im Header und reisen mit der Datei, wohin sie auch geht. Wer so eine Datei auf eine Website hochlädt, um sie anzusehen, übergibt all das an die Leute, die diese Website betreiben. Genau das tut diese Seite nicht.
- **Der Leser besteht aus vierzehn Dateien in diesem Repository.** Nichts hier verwendet eine Bibliothek, die von irgendwoher geladen wird. `src/dicom.js` läuft durch die Datei, `src/dictionary.js` weiß, wie die Tags heißen, `src/pixels.js` macht aus den Bytes wieder Messwerte, `src/rle.js` und `src/jpeg-lossless.js` packen die zwei komprimierten Formen aus, die diese Seite dekodieren kann, und `src/window.js` bildet das Gemessene auf die Grauwerte Ihres Bildschirms ab.
- **Die Identifikatoren werden für Sie aufgelistet, und für sonst niemanden.** Die Seite zeigt jedes Feld Ihrer Datei an, das die abgebildete Person benennt oder eingrenzt. Das ist die Frage, die jemand beantwortet haben möchte, bevor er eine Schicht weitergibt, und kein Viewer beantwortet sie. Sie steht auf dem Bildschirm vor Ihnen und geht nirgendwo sonst hin: In diesem Repository gibt es kein Analytics-Ereignis, das irgendetwas davon trüge, und die Seite könnte es auch nicht senden, wenn es eines gäbe.
- **Sie liest. Sie schreibt nicht.** Es gibt hier keinen Knopf, der Ihre Datei verändert, und keinen Code, der das könnte. Mitnehmen können Sie ein PNG des Bildes auf dem Schirm und eine Textfassung des Headers, beide in der Seite aus dem gebaut, was ohnehin schon da ist. Ihr Original liegt unberührt auf Ihrer Festplatte, was zugleich die ehrliche Antwort darauf ist, was passiert, wenn Sie den Tab schließen.
- **Was Google lädt und was es nicht bekommt.** Die Skripte für Werbung und Messung kommen von Google. Keines von beiden bekommt irgendetwas über Ihre Datei: nicht die Pixel, kein Vorschaubild, keinen Namen, keinen Tag, keine Patientin, keinen Dateinamen. Jede Zeile, die eine Aufnahme liest, dekodiert oder zeichnet, wird von dieser Domain ausgeliefert und steht im Repository.
- **Was der Spenden-Knopf lädt und was er nicht bekommt.** Der Knopf „Buy me a coffee“ im Kopfbereich wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Er ist ein Link und sonst nichts: Er meldet keinen Besuch, und er bekommt nichts über Sie oder Ihre Dateien. Es passiert nichts, bis Sie ihn anklicken, und dann sind Sie auf einer fremden Seite.
- **Läuft offline.** Trennen Sie die Netzverbindung, und jeder Teil dieser Seite arbeitet weiter. Das ist der einfachste Beweis von allen: Ein Werkzeug, das Ihre Aufnahme zum Rendern wegschickt, hört in dem Moment auf, in dem Sie den Stecker ziehen.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/dicom.js` für den Parser, der durch die Datei läuft, `src/pixels.js` für das Dekodieren der Pixel, `src/jpeg-lossless.js` für den Codec, den die meisten Klinik-Exporte verwenden, und `src/window.js` für Fenster und Zentrum. In keiner dieser Dateien steht eine Zeile, die ins Netz käme.
