# Datenschutz & Cookies

Dateien werden lokal verarbeitet. Bewusstes Teilen und optionale Netzwerkfunktionen haben eigene Grenzen. Hier werden sie sowie Werbung, Nutzungsstatistik, freiwilliges Feedback, Speicher und Hosting erklärt.

Zuletzt aktualisiert 23. Oktober 2026

## Ihre Dateien

Ausgewählte Dateien werden im Browser auf Ihrem Gerät gelesen, bearbeitet und geschrieben. abox.tools hat keinen Upload-Endpunkt für Dateiverarbeitung und keine Datenbank dieser Dateien. Downloads entstehen lokal. Teilen, Remote-Kamera und die Übergabe eines Belegberichts an eine andere App sind bewusste Übertragungen, die unten erklärt werden.

Lokale Verarbeitung übergibt uns nicht:

- Ihre Dateien oder Vorschaubilder
- Dateinamen, Größen, Abmessungen oder Formate
- Inhalte einschließlich EXIF, GPS und erkanntem Dokumenttext

Die `Content-Security-Policy` jeder Seite begrenzt Ressourcen und Ziele. Einige Werkzeuge ergänzen die Vermittlungsstelle oder die optionale Kurs-API. Die Richtlinie prüft keine Daten an erlaubten Hosts, und `connect-src` beschreibt keinen WebRTC-Peer-Verkehr. Lesen Sie sie mit dem Quelltext und beobachten Sie die verwendete Funktion; die Hostliste ist kein Beweis für sämtliche Nutzdaten.

Dateien, die Sie mit einem Werkzeug erzeugen, werden an den Download-Mechanismus Ihres eigenen Browsers übergeben und dort gespeichert, wo Sie es ihm sagen. Auch an diesem Schritt sind wir nicht beteiligt.

## Funktionen, die bewusst eine Verbindung nutzen

[Bilder zu Video](https://abox.tools/de/bilder-in-video-umwandeln/) kann ein Bild von einer angegebenen Webadresse abrufen. Der Server erhält Ihre IP und die angefragte URL einschließlich Abfrageparametern. Das Bild wird lokal gespeichert und für die Verarbeitung neu codiert. Dateien von Ihrem Gerät werden dabei nicht gesendet.

Der [Beleg- und Rechnungsextraktor](https://abox.tools/de/belege-rechnungen-auslesen/) liest Bilder und erkennt Text lokal. Der freiwillige historische Kursabruf fragt Währungspaar und gewähltes Datum bei [Frankfurter](https://frankfurter.dev/) ab. Das Datum kann vom Beleg stammen. Der Anbieter sieht IP und Anfrage; Zugangsdaten und Referrer werden weggelassen. Bild, Dateiname, Händler, Betrag oder E-Mail-Adresse sind nicht enthalten. Manuelle Kurse brauchen keine Anfrage.

Die E-Mail- und Teilen-Schaltflächen bereiten Berichte und JPEG-Kopien lokal vor, laden dann eine E-Mail-Datei herunter oder übergeben sie an Ihre gewählte App. Die Seite sendet keine E-Mail. App, Anbieter und Empfänger übernehmen den nächsten Schritt nach ihren Richtlinien. [Text und Dateien teilen](https://abox.tools/de/text-teilen/), [Browser-Tab teilen](https://abox.tools/de/share-tab/) und [Remote-Kamera](https://abox.tools/de/remote-camera/) senden bewusst Inhalte an einen anderen Browser; Verbindungsmetadaten werden unten erklärt.

## Was erhoben wird, und von wem

Diese Seite ist kostenlos und wird durch Werbung bezahlt. Das heißt, auf diesen Seiten laufen zwei Google-Produkte, und auf den meisten davon ein Spenden-Button. Hier ist die vollständige Liste.

### Google AdSense: die Werbung

Google liefert die Anzeigen aus und entscheidet, welche Sie sehen. Dazu kann Google Cookies oder ähnliche Kennungen in Ihrem Browser setzen und lesen, und es erhält Ihre IP-Adresse, einen daraus abgeleiteten ungefähren Standort, Ihren User-Agent und die Angabe, auf welcher Seite Sie waren. Je nach Ihren Einstellungen und Ihrem Aufenthaltsort können die Anzeigen anhand eines Profils personalisiert werden, das Google über Sie führt und das größtenteils aus Ihrer Aktivität auf anderen Websites stammt.

Nichts davon erreicht uns, wir können es nicht einsehen, und wir senden Google nie irgendetwas über Ihre Dateien. Googles eigene Darstellung, wie es Daten von Seiten nutzt, die seine Werbung ausspielen, finden Sie unter [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics: Besuche und erfolgreiche Werkzeugnutzung

Wir nutzen Google Analytics 4, um Seitenaufrufe und erfolgreiche Werkzeugnutzung zu zählen. So wissen wir, an welchen Werkzeugen zu arbeiten sich lohnt. Erfasst werden die aufgerufene Seite, der ungefähre Zeitpunkt, eine zufällig erzeugte und im Browser gespeicherte Kennung, ein ungefährer Standort, Ihr Geräte- und Browsertyp sowie übliche Angaben zur Kampagnenzuordnung.

Die an Analytics gesendete Seitenadresse besteht aus der kanonischen URL und nur den üblichen Kampagnenparametern. Andere Abfrageparameter und Adressfragmente entfallen. Der Seitentitel ist fest vorgegeben. Von der verweisenden Website wird nur die Herkunft ohne Pfad oder Abfrage übermittelt.

Wir zählen die erste erfolgreiche Werkzeugnutzung pro Seitenaufruf, zum Beispiel einen angeforderten, fertig vorbereiteten Download, erfolgreiches Kopieren oder eine nutzbare Analyse beziehungsweise Ansicht in einem Prüfwerkzeug. Die einzige werkzeugspezifische Angabe in diesem Ereignis ist die feste Werkzeugkennung. Es bestätigt nicht, dass Ihr Betriebssystem einen Download gespeichert hat.

Wir zählen auch das Öffnen von Werkzeugseiten. Bei Images to Video, Image Stacker, GIF Analyzer und GIF Splitter erfassen feste Ereignisse die Eingabe, den Verarbeitungsstart, ein fertiges Ergebnis, ein Problem oder einen Abbruch, je Schritt höchstens einmal pro Seitenaufruf. Eingebaute Beispiele sind davon ausgenommen. Ausgewählte Weiterführungslinks melden nur feste Kennungen der Ausgangs- und Zielseite, niemals Linkadresse oder Linktext. Diese Zähler zeigen, wo ein Besuch endet; sie kennzeichnen keine einzelnen Aufträge und bestätigen nicht die Ankunft auf der nächsten Seite.

Freiwilliges Feedback erfasst nach Ihrer Antwort die feste Werkzeugkennung, eine feste positive oder negative Antwort und einen festen Grund. Es gibt kein Freitextfeld. Die Werkzeuge fügen keinem dieser Datensätze Dateien, Dateinamen, Inhalte, eingegebenen Text, Anzahlen, Größen, Abmessungen, Formate, Einstellungen, Fehlermeldungen oder andere Eingabe- oder Ergebnisdetails hinzu. Wir können zusammengefasste Analytics-Berichte sehen. Auch mit blockiertem Analytics bleibt lokale Verarbeitung verfügbar, nach vorbereitetem Offline-Cache auch ohne Verbindung.

### Buy Me a Coffee: der Spenden-Button

Die Startseite und die Werkzeugseiten tragen einen Spenden-Button, der von den Servern von Buy Me a Coffee geladen wird. Ihn zu laden bedeutet, dass deren CDN Ihre IP-Adresse sieht und weiß, dass Sie auf dieser Seite waren. Die Schrift des Buttons wird von Google Fonts geholt, das Ihre IP-Adresse ebenfalls sieht. Mehr wird nicht gesendet, und solange Sie ihn nicht tatsächlich anklicken, passiert auch sonst nichts. Ab da sind Sie auf deren Seite und unter deren Richtlinien. Diese Seite und die [Nutzungsbedingungen](https://abox.tools/de/nutzungsbedingungen/) zeichnen den Button nicht.

### Hosting

Die Seite wird von GitHub Pages ausgeliefert, hinter Cloudflare. Wie jeder Webhoster verarbeiten die beiden die Anfragen, die Ihr Browser stellt, darunter Ihre IP-Adresse, die angeforderte Seite und Ihren User-Agent, um die Seite auszuliefern und den Dienst verfügbar und sicher zu halten. Auf besucherbezogene Protokolle haben wir bei keinem der beiden Zugriff.

### Verbindungswahl für gekoppelte Werkzeuge

Alle fünf Kopplungswerkzeuge beginnen mit Direct. Der Host kann vor dem Start Cloud relay wählen; die Einladung trägt diese Wahl, und die andere Person sieht sie vor dem Verbinden. Direct wechselt nie automatisch zum Relay. Cloudflare TURN leitet dabei verschlüsselten Text, Dateien, Video, Audio und Steuernachrichten ohne deren Entschlüsselungsschlüssel weiter, sieht aber Adressen, Zeitpunkte und Datenvolumen. Beide Geräte brauchen durchgehend Internet. Kurzlebige Zugangsdaten bleiben im Browserspeicher und werden über die Vermittlung erneuert, nicht in Links oder Listen veröffentlicht. Eine Liste kann die gewählte Verbindung zeigen. Zustimmung, Passwort und Mikrofonsteuerung bleiben wirksam.

Alle fünf Werkzeuge bieten verfügbare Verbindungen entweder im lokalen Netzwerk oder in einer privaten Gruppe an. Mit demselben zufällig erzeugten Gruppencode können Geräte in unterschiedlichen Netzwerken Sitzungen finden. Jedes Werkzeug hat eine eigene Liste; Gruppensitzungen erscheinen nicht zusätzlich im lokalen Netzwerk. Der Code erlaubt die Suche, nicht den Zugriff: Passwörter, die Zustimmung des Hosts und der gewählte Verbindungsweg gelten weiterhin. Die Vermittlung erhält den Code über eine verschlüsselte Verbindung zur Prüfung der Gruppenzugehörigkeit und behält danach nur eine abgeleitete Kennung und das Ergebnis auf offenen Verbindungen. Anfrageadressen und ihre sieben Tage aufbewahrten Metadatenprotokolle enthalten diese Kennung, nie den Code. Die Seite hält den Code nur im Arbeitsspeicher, nimmt ihn nicht in Einladungen oder Verbindungsberichte auf und vergisst ihn beim Neuladen. Normale Seitenskripte können die Eingabefelder lesen; eine private Gruppe schottet sie nicht ab. Jeder mit dem Code kann die für die Gruppe angebotenen Sitzungen finden. Geben Sie ihn daher nur an die gewünschten Personen weiter.

### Browser-Tab teilen

[Browser-Tab teilen](https://abox.tools/de/share-tab/) verwendet die Auswahl eines Desktop-Browsers, um einen Tab aufzunehmen und dessen Livebild an einen zugelassenen Betrachter zu senden. Der Betrachter fragt an, der Host stimmt zu und der Betrachter bestätigt, bevor Video übertragen wird. Es gibt keine Audio-, Kamera- oder Mikrofonaufnahme. Sichtbare Informationen im gewählten Tab werden geteilt; der Betrachter kann das empfangene Bild aufzeichnen.

Die Online-Suche nach Freigaben in der Nähe ist standardmäßig aus. Der Host kann vor dem Start Show in nearby shared tabs aktivieren; der Betrachter öffnet die Liste ausdrücklich mit Find nearby tabs. Die Suchverbindung zeigt nur den zufälligen Einladungscode, niemals Titel, Adresse oder Bild des aufgenommenen Tabs oder die Nachricht des Betrachters. Join neben einem Eintrag sendet die Anfrage über den angezeigten Verbindungsweg. Ohne gültigen Freigabenachweis bleibt die Zustimmung erforderlich. Ein kopierter Einladungslink wartet weiterhin auf Request to watch. Der Dienst gruppiert Seiten dieses Tools nach öffentlicher IPv4-Adresse oder IPv6-/64-Subnetz und Website-Origin, nicht nach dem physischen Standort. Gemeinsame Gateways oder VPNs können Fremde einschließen oder nahe Geräte verbergen. Einträge bestehen ohne gespeicherte Historie auf offenen Verbindungen; Stoppen entfernt den Eintrag des Hosts.

Im Modus Direct verwendet Video eine verschlüsselte Direktverbindung in einem erreichbaren lokalen Netz, ohne öffentliches STUN oder TURN. Beide Geräte benötigen Internet für die Suche und Kopplung. Die Vermittlungsstelle sieht Raumcodes, IP-Adressen, Zeiten, WebRTC-Beschreibungen und Verbindungskandidaten, aber keine Videos, Betrachternotizen oder Zulassungsentscheidungen. Cloudflare bewahrt Verbindungsmetadaten sieben Tage lang auf.

Die üblichen Seitenskripte können Seitenadresse und Zustand einschließlich eines Einladungscodes lesen; ein Link allein gewährt keinen Videozugang. Der Betrachter kann den Host nicht steuern oder Webseitentext auswählen. Das Tool hat keine Aufnahmefunktion, doch sichtbare angemeldete Inhalte gehören zum Bild und der Betrachter kann es selbst aufnehmen. Die Werkzeugseite erklärt Netzwerkgrenzen; lokale Adresseinstellungen beweisen keine physische Netzwerkgrenze.

### Remote-Kamera und Browser-Vermittlung

[Remote-Kamera](https://abox.tools/de/remote-camera/) öffnet beim Laden der Seite eine WebSocket-Verbindung zur Erkennung von Kameras. Starten oder Verbinden öffnet zusätzlich eine Raumverbindung zu unserem Vermittlungsdienst. Join neben einer Kamera fordert über den angezeigten Verbindungsweg eine Verbindung an und tauscht Netzwerkadressen aus. Beim Öffnen eines Links zum Ansehen wartet die Seite weiterhin auf Verbinden. Die Zustimmung des Kamerahosts ist standardmäßig erforderlich und steuert die Übertragung von Video und Audio, nicht den Austausch von Netzwerkadressen. Die Vermittlungsstelle sieht Codes, Adressen, Zeiten und Einrichtungsmeldungen, niemals Video, Audio oder Viewer-Notizen. Im Modus Direct laufen Video und aktiviertes Audio über eine verschlüsselte Direktverbindung ohne konfigurierte STUN-Server oder TURN-Relays und ohne Aufnahmefunktion. Audio ist standardmäßig aus; erst wenn der Host Audio teilen wählt, fragt die Seite nach Mikrofonzugriff. Internet bleibt für die Vermittlung erforderlich. VPN und Betriebssystem können das Routing beeinflussen; lokaler Modus beweist keine physische Netzwerkgrenze. Die Werkzeugseite erklärt diese Grenzen und dass Seitenskripte die vollständige Viewer-Link-Adresse lesen können.

Optionale Benachrichtigungen analysieren kleine Videobilder und empfangenes Audio auf dem Gerät des Viewers, ohne Aufnahmen oder Uploads. Beim Aktivieren wird die Erlaubnis für Browser-Benachrichtigungen angefragt. Browser und Betriebssystem zeigen allgemeine Aktivitätsmeldungen ohne Kamerabild, Audio, Linknamen oder Viewer-Notiz. Trennen beendet die Analyse und schließt die Benachrichtigungen dieser Sitzung. Die Viewer-Seite muss offen bleiben; der Browser kann die Analyse im Hintergrund oder im Ruhezustand pausieren.

### Text und Dateien teilen und die Vermittlungsstelle

[Text und Dateien teilen](https://abox.tools/de/text-teilen/) öffnet eine Suchverbindung auf der Startseite und eine weitere beim Teilen. Namen werden nach öffentlicher IPv4-Adresse oder IPv6-Subnetz und Seitenursprung gruppiert; das ist eine Suchhilfe, kein Beweis für dasselbe physische Netz. Die Vermittlungsstelle sieht Namen, IPs, Zeiten und Verhandlungsmeldungen, nie geteilten Text oder Dateien. Veröffentlichte Namen leben nur auf offenen Verbindungen ohne dauerhaften Speicher. Normales Direct nutzt öffentliche STUN-Server von Google und Cloudflare, die die Anfrageadresse sehen. Lokales Netzwerk beschränkt Direct auf Hostadressen ohne STUN oder TURN. Cloud relay ist eine eigene Wahl des Hosts vor dem Start, die der Leser vor dem Verbinden bestätigt. Alle Varianten brauchen die öffentliche Vermittlung für den Verbindungsaufbau. Cloudflare speichert sieben Tage Verbindungsmetadaten für Teilen und Kamera; diese Besucherprotokolle können wir lesen. Empfänger behalten bereits kopierte oder heruntergeladene Inhalte auch nach Schließen des Quell-Tabs.

## Cookies

Wir setzen keine Login- oder Sitzungscookies. Google-Skripte können die oben beschriebenen Cookies und Kennungen setzen. Die Seite nutzt außerdem lokalen Browserspeicher für Einstellungen und vorübergehende Arbeit.

**Freigaben beim Verbinden.** Die fünf Verbindungswerkzeuge speichern zufällige Zugangsdaten für eine begrenzte Zahl zuletzt verwendeter Kombinationen aus Werkzeug, Raum und Verbindungsweg lokal im Browser. Sie enthalten keine geteilten Inhalte, Namen oder IP-Adressen. Text teilen, Browser-Tab teilen und Remote-Kamera übermitteln Freigabenachweise nur über die verschlüsselte Verbindung zwischen den Browsern; Sprachwerkzeuge senden ihren persönlichen Schlüssel beim Beitreten an den Vermittlungsdienst. Die Freigabe gilt für die aktuelle Hostsitzung: Trennen erhält sie, Entfernen durch den Host widerruft sie und Beenden oder ein Neustart setzt sie zurück. Gelöschter oder blockierter Speicher kann eine neue Freigabe nötig machen. Skripte auf jeder Seite dieses Website-Origins, auch von Drittanbietern, können die gespeicherten Zugangsdaten lesen. Sie sind nicht vor Seitenskripten geschützt und stehen weder in Einladungen noch in Suchlisten.

**Die Sprache, die Sie wählen.** Wenn Sie im Umschalter eine Sprache auswählen, wird diese Wahl im lokalen Speicher Ihres Browsers abgelegt, unter dem Namen `abox-lang`, damit die nächste Seite in der gewünschten Sprache erscheint. Ein Cookie ist das nicht. Es wird weder an uns noch an sonst jemanden gesendet, es bleibt auf dem Gerät, auf dem Sie dies lesen, und das Löschen der Websitedaten Ihres Browsers entfernt es. Wählen Sie nie eine Sprache, wird auch nichts gespeichert. Eine Seite, die in der Sprache Ihres Browsers erscheint, wurde im Moment des Aufrufs zugeordnet und danach wieder vergessen.

**Weiterer lokaler Speicher.** Feedback merkt sich den Zeitpunkt einer Antwort oder Ablehnung. Werkzeuge können Einstellungen oder einen optionalen Teilen-Entwurf lokal behalten. Sprachwechsel und eine bewusste Weitergabe an ein anderes Werkzeug können Dateien und Einstellungen vorübergehend in IndexedDB ablegen. Das sind keine Cookies und keine Übertragungen an uns; das Löschen der Websitedaten entfernt sie. Das jeweilige Werkzeug erklärt dauerhafte Entwürfe.

Googles Cookies und Kennungen messen Besuche und Werkzeugnutzung und wählen oder begrenzen Anzeigen. Sie sind von den oben beschriebenen lokalen Aufzeichnungen der Seite zu unterscheiden.

### Wie Sie es abschalten

- Die Personalisierung von Werbung lässt sich für alle Seiten auf einmal abschalten, unter [My Ad Center](https://myadcenter.google.com/).
- Google Analytics lässt sich überall blockieren, mit Googles [Browser-Add-on zur Deaktivierung](https://tools.google.com/dlpage/gaoptout).
- Die Einstellungen Ihres Browsers können Cookies von Drittanbietern blockieren oder löschen, und jeder Inhaltsblocker verhindert, dass diese Skripte überhaupt geladen werden.

Werbung, Analytics und Spendenknopf zu blockieren lässt lokale Verarbeitung verfügbar. Mit fertigem Offline-Cache funktioniert sie ohne Verbindung. Webbildimport, Onlinekurse, Browser-Vermittlung und Versand durch eine andere App brauchen ihre jeweiligen Verbindungen. Keine Verarbeitungsfunktion wird hinter Werbung zurückgehalten.

## Ihre Rechte an den Daten

Wir halten keine verarbeiteten Dateien. Analytics-Berichte und die oben beschriebenen Verbindungsmetadaten sind andere Daten. Fragen oder Anfragen dazu können an [hi@abox.tools](mailto:hi@abox.tools) gehen. Nennen Sie Seite und ungefähres Datum, ohne eine private Datei anzuhängen.

Für Daten in Ihrem Google-Konto nutzen Sie [die Kontoeinstellungen](https://myaccount.google.com/) oder Googles Datenschutzkontakte. Optionale Kurs-, Spenden- und E-Mail-Anbieter bearbeiten ihre eigenen Dienste und Anfragen.

## Kinder

Die Seite richtet sich nicht an Kinder und fragt weder Alter noch Benutzerkonto ab. Die oben beschriebenen automatischen Seiten- und Verbindungsdaten gelten für Besucher jeden Alters.

## Änderungen, und wie Sie uns erreichen

Ändert sich diese Seite, ändert sich das Datum oben mit ihr, und die Änderung steht wie alles andere in der öffentlichen Commit-Historie.

Fragen dazu können an [hi@abox.tools](mailto:hi@abox.tools) gehen oder als Issue im [Repository](https://github.com/A-Box-of-Tools/website) gestellt werden, wo die Antwort für alle anderen sichtbar ist, die sich dasselbe fragen.
