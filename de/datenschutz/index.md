# Datenschutz & Cookies

Dateien werden lokal verarbeitet. Bewusstes Teilen und optionale Netzwerkfunktionen haben eigene Grenzen. Hier werden sie sowie Werbung, Feedback, Speicher und Hosting erklärt.

Zuletzt aktualisiert 12. Oktober 2026

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

Die E-Mail- und Teilen-Schaltflächen bereiten Berichte und JPEG-Kopien lokal vor, laden dann eine E-Mail-Datei herunter oder übergeben sie an Ihre gewählte App. Die Seite sendet keine E-Mail. App, Anbieter und Empfänger übernehmen den nächsten Schritt nach ihren Richtlinien. [Text und Dateien teilen](https://abox.tools/de/text-teilen/) und [Remote-Kamera](https://abox.tools/de/remote-camera/) senden bewusst Inhalte an einen anderen Browser; Verbindungsmetadaten werden unten erklärt.

## Was erhoben wird, und von wem

Diese Seite ist kostenlos und wird durch Werbung bezahlt. Das heißt, auf diesen Seiten laufen zwei Google-Produkte, und auf den meisten davon ein Spenden-Button. Hier ist die vollständige Liste.

### Google AdSense: die Werbung

Google liefert die Anzeigen aus und entscheidet, welche Sie sehen. Dazu kann Google Cookies oder ähnliche Kennungen in Ihrem Browser setzen und lesen, und es erhält Ihre IP-Adresse, einen daraus abgeleiteten ungefähren Standort, Ihren User-Agent und die Angabe, auf welcher Seite Sie waren. Je nach Ihren Einstellungen und Ihrem Aufenthaltsort können die Anzeigen anhand eines Profils personalisiert werden, das Google über Sie führt und das größtenteils aus Ihrer Aktivität auf anderen Websites stammt.

Nichts davon erreicht uns, wir können es nicht einsehen, und wir senden Google nie irgendetwas über Ihre Dateien. Googles eigene Darstellung, wie es Daten von Seiten nutzt, die seine Werbung ausspielen, finden Sie unter [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics: der Besuchszähler

Wir nutzen Google Analytics 4, um Seitenaufrufe zu zählen, damit wir wissen, an welchen Werkzeugen zu arbeiten sich lohnt. Erfasst werden die aufgerufene Seite, ungefähr wann, eine zufällig erzeugte Kennung, die in Ihrem Browser gespeichert wird, ein ungefährer Standort, Ihr Geräte- und Browsertyp sowie die Seite, die Sie verwiesen hat.

`analytics.js` richtet Seitenaufrufe ein. Nach Ihrer freiwilligen Antwort sendet `feedback.js` außerdem ein `tool_feedback`-Ereignis: Werkzeugkennung, feste Ja- oder Nein-Antwort und fester Grund. Es gibt kein Freitextfeld; Datei, Name, Größe, Abmessungen, Anzahl, Format und Inhalt gehören nicht dazu. Wir können zusammengefasste Analytics-Berichte sehen. Blockieren lässt lokale Verarbeitung verfügbar.

### Buy Me a Coffee: der Spenden-Button

Die Startseite und die Werkzeugseiten tragen einen Spenden-Button, der von den Servern von Buy Me a Coffee geladen wird. Ihn zu laden bedeutet, dass deren CDN Ihre IP-Adresse sieht und weiß, dass Sie auf dieser Seite waren. Die Schrift des Buttons wird von Google Fonts geholt, das Ihre IP-Adresse ebenfalls sieht. Mehr wird nicht gesendet, und solange Sie ihn nicht tatsächlich anklicken, passiert auch sonst nichts. Ab da sind Sie auf deren Seite und unter deren Richtlinien. Diese Seite und die [Nutzungsbedingungen](https://abox.tools/de/nutzungsbedingungen/) zeichnen den Button nicht.

### Hosting

Die Seite wird von GitHub Pages ausgeliefert, hinter Cloudflare. Wie jeder Webhoster verarbeiten die beiden die Anfragen, die Ihr Browser stellt, darunter Ihre IP-Adresse, die angeforderte Seite und Ihren User-Agent, um die Seite auszuliefern und den Dienst verfügbar und sicher zu halten. Auf besucherbezogene Protokolle haben wir bei keinem der beiden Zugriff.

### Remote-Kamera und Browser-Vermittlung

[Remote-Kamera](https://abox.tools/de/remote-camera/) öffnet beim Laden der Seite eine WebSocket-Verbindung zur Erkennung von Kameras. Starten, Verbinden oder die Auswahl einer Kamera, die online ist, öffnet zusätzlich eine Raumverbindung zu unserem Vermittlungsdienst. Die Auswahl eines aufgelisteten Namens fordert sofort eine Verbindung an und tauscht Netzwerkadressen aus. Beim Öffnen eines Links zum Ansehen wartet die Seite weiterhin auf Verbinden. Die Zustimmung des Kamerahosts ist standardmäßig erforderlich und steuert die Videoübertragung, nicht den Austausch von Netzwerkadressen. Die Vermittlungsstelle sieht Codes, Adressen, Zeiten und Einrichtungsmeldungen, niemals Video oder Viewer-Notizen. Video läuft über eine verschlüsselte Direktverbindung ohne konfigurierte STUN-Server oder TURN-Relays, ohne Mikrofon und ohne Aufnahmefunktion. Internet bleibt für die Vermittlung erforderlich. VPN und Betriebssystem können das Routing beeinflussen; lokaler Modus beweist keine physische Netzwerkgrenze. Die Werkzeugseite erklärt diese Grenzen und dass Seitenskripte die vollständige Viewer-Link-Adresse lesen können.

### Text und Dateien teilen und die Vermittlungsstelle

[Text und Dateien teilen](https://abox.tools/de/text-teilen/) öffnet eine Suchverbindung auf der Startseite und eine weitere beim Teilen. Namen werden nach öffentlicher IPv4-Adresse oder IPv6-Subnetz und Seitenursprung gruppiert; das ist eine Suchhilfe, kein Beweis für dasselbe physische Netz. Die Vermittlungsstelle sieht Namen, IPs, Zeiten und Verhandlungsmeldungen, nie geteilten Text oder Dateien. Veröffentlichte Namen leben nur auf offenen Verbindungen ohne dauerhaften Speicher. Der normale Modus nutzt öffentliche STUN-Server von Google und Cloudflare. Ein Leser kann bewusst über Cloudflares TURN-Relay erneut versuchen; es leitet verschlüsselte Daten ohne deren Schlüssel weiter. Lokaler Modus nutzt weder STUN noch TURN, benötigt aber die öffentliche Vermittlung. Cloudflare speichert sieben Tage Verbindungsmetadaten für Teilen und Kamera; diese Besucherprotokolle können wir lesen. Empfänger behalten bereits kopierte oder heruntergeladene Inhalte auch nach Schließen des Quell-Tabs.

## Cookies

Wir setzen keine Login- oder Sitzungscookies. Google-Skripte können die oben beschriebenen Cookies und Kennungen setzen. Die Seite nutzt außerdem lokalen Browserspeicher für Einstellungen und vorübergehende Arbeit.

**Die Sprache, die Sie wählen.** Wenn Sie im Umschalter eine Sprache auswählen, wird diese Wahl im lokalen Speicher Ihres Browsers abgelegt, unter dem Namen `abox-lang`, damit die nächste Seite in der gewünschten Sprache erscheint. Ein Cookie ist das nicht. Es wird weder an uns noch an sonst jemanden gesendet, es bleibt auf dem Gerät, auf dem Sie dies lesen, und das Löschen der Websitedaten Ihres Browsers entfernt es. Wählen Sie nie eine Sprache, wird auch nichts gespeichert. Eine Seite, die in der Sprache Ihres Browsers erscheint, wurde im Moment des Aufrufs zugeordnet und danach wieder vergessen.

**Weiterer lokaler Speicher.** Feedback merkt sich den Zeitpunkt einer Antwort oder Ablehnung. Werkzeuge können Einstellungen oder einen optionalen Teilen-Entwurf lokal behalten. Sprachwechsel und eine bewusste Weitergabe an ein anderes Werkzeug können Dateien und Einstellungen vorübergehend in IndexedDB ablegen. Das sind keine Cookies und keine Übertragungen an uns; das Löschen der Websitedaten entfernt sie. Das jeweilige Werkzeug erklärt dauerhafte Entwürfe.

Googles Cookies und Kennungen messen Besuche und wählen oder begrenzen Anzeigen. Sie sind von den oben beschriebenen lokalen Aufzeichnungen der Seite zu unterscheiden.

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
