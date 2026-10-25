# Stimme im lokalen Netzwerk übertragen

Eine Person spricht, die anderen hören im Browser zu. Starten Sie den Kanal auf dieser Website und teilen Sie den Link oder zeigen Sie ihn in der Umgebungssuche an. Direkt nutzt ein erreichbares lokales Netz. Wählt der Host Cloud-Relay, bestätigen die Zuhörer zuerst die verschlüsselte Übertragung über Cloudflare.

[Local Walkie-Talkie öffnen](https://abox.tools/de/walkie-talkie/): Start a named channel, then hold to talk or speak hands-free. Connect directly on your local network, or choose Cloud relay for listeners over the internet.

Zuletzt aktualisiert 14. Oktober 2026

## Auf dem sendenden Gerät starten

Direct ist voreingestellt. Die folgenden Hinweise zur direkten Erreichbarkeit gelten für diesen Modus. Soll die Verbindung über Cloud relay laufen, wählt der Host dies vor dem Start und teilt die neue Einladung. Die andere Person sieht die Wahl und bestätigt sie vor dem Verbinden; auch eine Walkie-Talkie-Relay-Einladung wartet auf Join. Direct wechselt niemals automatisch. Cloudflare leitet verschlüsselte Inhalte weiter und sieht Adressen, Zeitpunkte und Datenvolumen. Beide Geräte brauchen dabei durchgehend Internet. Zustimmung, Passwort und Mikrofonsteuerung gelten unverändert.

Öffnen Sie Local Walkie-Talkie auf dieser Website, lassen Sie Require my approval für neue Anfragen aktiviert, wählen Sie Start channel und erlauben Sie den Mikrofonzugriff. Ein unterstütztes Smartphone oder ein Computer kann den Kanal über die HTTPS-Seite bereitstellen. Dafür sind weder ein Python-Helfer noch ein Download oder ein Konto erforderlich. Für eine zuverlässige Verbindung lassen Sie die Sendeseite möglichst sichtbar und das Gerät wach.

## Zuhörer einladen

Teilen Sie den Zuhörer-Link oder QR-Code mit Geräten, die den gewählten Verbindungsweg nutzen können. Beim Öffnen einer Direct-Einladung wird die Beitrittsanfrage automatisch gesendet. Eine Cloud-relay-Einladung zeigt zuerst die Verbindungsart und wartet auf Join. Neue Kanäle verlangen standardmäßig die Zustimmung des Hosts. Die Anfrage erscheint im Dialog; Approve erlaubt den Beitritt, Deny lehnt ihn ab, und Review later behält sie in der Liste. Vor der Zustimmung wird kein Audio gesendet, sofern der Host die Freigabe nicht deaktiviert hat. Mikrofonzugriff wird dabei niemals angefordert. Falls der Browser den Ton blockiert, schaltet Unmute ihn ein. Nach dem Beitritt sind Mute/Unmute und Leave die Bedienelemente für Zuhörer.

Beide Seiten benötigen Internetzugang für die Vermittlung. Der Dienst überträgt Verbindungsdetails und Statusmeldungen; in Direct nimmt die Live-Stimme einen separaten, direkten und verschlüsselten Weg vom sendenden Gerät zu jedem Zuhörer. Cloud-Relay wird nur nach ausdrücklicher Wahl verwendet, nie automatisch.

Auf dem sendenden Gerät unter **Channel name** einen Namen eingeben, den die Zuhörenden erkennen. Ist **Make this channel discoverable** aktiviert, wird der Kanal beim Start mit **Start channel** im gewählten Suchbereich veröffentlicht. Die Option deaktivieren, wenn Einladungen nur per Link geteilt werden sollen.

Die Liste **Available connections** oben auf der Seite wird automatisch aktualisiert. Zuhörende prüfen das Symbol für die Verbindungsart und wählen beim gewünschten Kanal **Join**. Das bloße Ansehen der Liste stellt keine Verbindung her. Der Beitritt dient nur zum Empfang und fragt nie nach Mikrofonzugriff. Wird der Kanal nicht angezeigt, funktionieren der Zuhörerlink und der QR-Code weiterhin. Nach dem Verbinden stehen Mute/Unmute und Leave zur Verfügung.

Die Umgebungssuche gruppiert Browser nach ihrer öffentlichen IPv4-Adresse oder ihrem IPv6-/64-Präfix und dem Origin dieser Website; sie durchsucht kein WLAN. Gemeinsame Internetzugänge können auch Fremde einschließen, während VPNs oder andere Routen Geräte direkt daneben verbergen können. Ein veröffentlichter Kanal teilt seinen Namen und den Einladungsschlüssel für Zuhörende mit dieser Gruppe. Wer ihn findet und den Host erreichen kann, kann den Beitritt anfordern. Zuhören ist erst nach der Zustimmung möglich, sofern der Host diese nicht deaktiviert hat. Der Eintrag bleibt bestehen, solange die Verbindung des Hosts besteht. End broadcast oder der Verlust dieser Verbindung entfernt ihn.

## Zum Sprechen gedrückt halten

Halten Sie die Schaltfläche Talk mit dem Finger oder der Maus gedrückt, oder fokussieren Sie sie und halten Sie die Leertaste gedrückt. Lassen Sie los, um die Sprachübertragung zu stoppen. Für freihändiges Sprechen wählen Sie Start talking: Die Stimme wird weiter übertragen, bis Sie Stop talking wählen. Prüfen Sie vor dem Ablegen des Geräts den angezeigten Übertragungsstatus. Die Mikrofon-Stummschaltung hat Vorrang vor beiden Möglichkeiten. Bis zu zehn Zuhörer können verbunden sein, wobei wartende Verbindungen mitzählen. Beginnen Sie mit einer kleinen Gruppe und prüfen Sie die Geräte und das Netzwerk, die Sie verwenden möchten.

## Die Verbindung zum sendenden Gerät wiederherstellen

Wartende Empfänger prüfen auf derselben Seite, ob das sendende Gerät wieder verfügbar ist. Im Vordergrund wird dabei ein Intervall von einer Sekunde angestrebt; die gewählte Stummschaltung bleibt erhalten. Eine funktionierende direkte Sprachverbindung kann während eines kurzen Ausfalls des Vermittlungsdienstes bestehen bleiben. Browser im Hintergrund, Verbindungslimits des Dienstes und Geräte im Ruhezustand können die Wiederherstellung verzögern.

Beim Ausblenden der Seite bleibt eine funktionierende Verbindung bestehen. Eine gehaltene Sprechtaste wird losgelassen; mit Start talking gestartetes freihändiges Sprechen kann weiterlaufen, solange der Browser es erlaubt. Das Telefon kann Mikrofon, Ton oder Netzwerk bei gesperrtem Bildschirm trotzdem anhalten. Eine tatsächliche Mikrofonunterbrechung schaltet das Sprechen aus und lässt den Kanal offen. Nach der Rückkehr versucht die Seite ein beendetes Mikrofon zu ersetzen; falls nötig, wählen Sie Resume microphone. Nach einer Seitensuspendierung versucht sie, denselben Kanal wiederherzustellen; Resume channel hilft, wenn der Browser eine Aktion verlangt. Nach einer Unterbrechung bleibt das Sprechen aus, bis Sie es erneut starten.

Ein temporärer Browserspeicher pro Tab erhält den Kanal auch beim Neuladen. Ist dieser Speicher nicht verfügbar, erzeugt das Neuladen der Sendeseite eine neue Einladung. End broadcast entfernt den Listeneintrag, beendet die Sitzung und verhindert eine automatische Wiederaufnahme. Beim nächsten Start entsteht eine neue Einladung. Leave beendet die Verbindung und die Wiederholungsversuche eines einzelnen Zuhörers.

## Einladungen mit Bedacht teilen

Wer eine Zuhörer-Einladung besitzt und das sendende Gerät erreichen kann, darf eine Beitrittsanfrage senden. Sie gewährt keinen Audiozugriff ohne Zustimmung, sofern der Host die Freigabe nicht deaktiviert hat. Der separate Schlüssel des sendenden Geräts bleibt in dessen Browser-Tab und wird nicht geteilt. Zuhörerschlüssel werden im Linkfragment nach dem Zeichen # und anschließend in sicheren Vermittlungsnachrichten übertragen. Der Dienst hält den vorübergehenden Raumzustand in offenen Verbindungen; Cloudflare bewahrt Protokolle mit Metadaten zu Aufrufen sieben Tage lang auf, niemals jedoch Mikrofonaudio.

Die üblichen Skripte der Website für Werbung, Messungen und die Spendenschaltfläche laufen auch auf dieser Seite. Das Tool übergibt ihnen keine Audiodaten, doch Seitenskripte können die Adresse und den Browserspeicher lesen. Wenn Speicher verfügbar ist, verringert das Entfernen des Einladungsfragments dessen spätere Offenlegung; es schirmt diese Skripte jedoch nicht ab. Vertrauen Sie der Seite, bevor Sie den Mikrofonzugriff erlauben. Empfänger können unabhängig davon aufzeichnen, was sie hören.

## Die Erreichbarkeit prüfen

Ein Smartphone-Hotspot kann funktionieren, wenn die beteiligten Geräte einander direkt erreichen dürfen. Verbinden Sie die Geräte mit demselben Hotspot und behalten Sie den Internetzugang für Suche und Vermittlung bei. Wenn der Kanal nicht in der Liste erscheint, verwenden Sie den Zuhörerlink oder QR-Code. Manche Hotspots und verwaltete Geräte blockieren direkte Verbindungen. Testen Sie deshalb die Geräte, die Sie tatsächlich verwenden möchten.

Ein Gäste-WLAN kann Geräte voneinander isolieren. Firewalls, Browserberechtigungen für das lokale Netzwerk, VPNs und die Routen des Betriebssystems können direkte Verbindungen beeinflussen, selbst wenn zwei Geräte scheinbar dasselbe WLAN nutzen. Direct verwendet ausschließlich Host-Kandidaten und keinen STUN- oder TURN-Server. Das schränkt die möglichen Verbindungswege ein, beweist aber keine physische Netzwerkgrenze. Testen Sie die tatsächlich verwendeten Smartphones und Computer, bevor Sie sich auf den Kanal verlassen.
