# Einen Browser-Tab ohne Erweiterung live teilen

Zeigen Sie jemandem die Website, die Sie benutzen, und behalten Sie die Kontrolle. Ihr Browser erfasst einen gewählten Tab und sendet sein sich änderndes Bild an den Zuschauer. Direct verwendet ein erreichbares lokales Netzwerk; Cloud relay ist eine ausdrückliche Option, die verschlüsseltes Video über Cloudflare weiterleitet. Laden Sie per Link oder Umgebungssuche ein und genehmigen Sie den Zuschauer vor der Videoübertragung.

[Share a Browser Tab öffnen](https://abox.tools/de/share-tab/): Choose a tab on your computer and let one approved viewer watch it using Direct or Cloud relay. Invite by link, network discovery or a private group. No extension, sound or remote control.

Zuletzt aktualisiert 3. November 2026

## Die Geräte verbinden und den Tab auswählen

Öffnen Sie auf Ihrem Computer die Website in einem Tab und [Browser-Tab teilen](https://abox.tools/de/share-tab/) in einem anderen. Beide Geräte benötigen Internetzugang zum Koppeln. Die voreingestellte Option „Direct“ braucht außerdem ein Netzwerk, in dem sich die Geräte gegenseitig erreichen können. Das heimische WLAN oder Ethernet ist ein guter Ausgangspunkt. Wählen Sie vor dem Start „Cloud relay“, wenn „Direct“ das andere Gerät nicht erreicht. Diese Wahl steht in der Einladung. Klicken Sie dann auf *Choose a tab to share* und wählen Sie den Website-Tab im Auswahldialog Ihres Browsers. Wählen Sie einen Browser-Tab statt eines Fensters oder des gesamten Bildschirms. Das Werkzeug lehnt diese umfassenderen Quellen ab. Prüfen Sie die lokale Vorschau, bevor Sie den Link senden.

Wählen Sie *Copy viewer link* und senden Sie den Link an die andere Person. Diese öffnet ihn, liest den Verbindungshinweis, ergänzt gegebenenfalls eine kurze Vorstellung und wählt *Request to watch*. Kehren Sie zur Freigabeseite zurück und genehmigen Sie die erwartete Anfrage. Zunächst überträgt die Verbindung nur verschlüsselte Steuernachrichten. Video beginnt erst nach Ihrer Genehmigung und der Bestätigung durch den Zuschauer. Eine Person kann gleichzeitig zusehen, während bis zu vier Anfragen warten.

Arbeiten Sie im ausgewählten Website-Tab und lassen Sie die Freigabeseite geöffnet. Als Host ist ein aktueller Desktop-Browser Chrome oder Edge vorgesehen. Der Zuschauer benötigt einen Browser mit WebRTC-Videowiedergabe, aber keine Erweiterung und kein Konto auf der gezeigten Website. Die Vermittlung beim Koppeln braucht Internet. Direktes Video verwendet Host-Adressen ohne öffentliches STUN oder TURN. „Cloud relay“ leitet stattdessen verschlüsseltes Video über Cloudflare und benötigt durchgehend Internet.

## Einen Tab in der Nähe ohne kopierten Link finden

Der Host kann *Show in Available connections* aktivieren, bevor er den freizugebenden Tab auswählt. Die Option ist standardmäßig aus und lässt sich während einer Sitzung nicht ändern. Die Liste zeigt den zufälligen Einladungscode und den gewählten Verbindungsweg, niemals Titel, Adresse oder Bild des erfassten Tabs.

Wählen Sie auf dem Empfangsgerät *Find connections*, prüfen Sie das Symbol für den Verbindungsweg und wählen Sie neben dem Code des Hosts *Join*, um eine Ansicht anzufragen. Der Host muss weiterhin zustimmen, und Ihr Browser bestätigt diese Zustimmung, bevor Video eintrifft. Das Beenden der Freigabe entfernt den Host aus der Liste.

Die Suche in der Nähe benötigt Internet. Der Dienst gruppiert die Seiten dieses Werkzeugs nach öffentlicher IPv4-Adresse oder IPv6-/64-Subnetz und Website-Origin. Er scannt kein WLAN und beweist keine räumliche Nähe. Ein gemeinsam genutztes Mobilfunk-Gateway oder VPN kann Fremde einschließen, während verschiedene Verbindungswege ein Gerät neben Ihnen verbergen können. Gleichen Sie den Code mit dem Host ab und verwenden Sie den kopierten Zuschauerlink, falls er fehlt.

## Für das Koppeln Internet verfügbar halten

Beide Geräte benötigen den Vermittlungsdienst, um eine neue Sitzung aufzubauen. Eine gespeicherte Kopie der Seite ersetzt ihn nicht. Eine bestehende Ansicht kann eine kurze Internetunterbrechung überstehen, solange ihre direkte Verbindung bestehen bleibt. Garantiert ist das jedoch nicht. Neue Zuschauer und Wiederverbindungen benötigen erneut Internetzugang.

Verwenden Sie ein Netzwerk, das direkte Kommunikation zwischen den Geräten erlaubt. Ein Telefon-Hotspot ist eine mögliche Verbindung ohne Funktionsgarantie. Er braucht Internet zum Koppeln und muss Datenverkehr zwischen den Geräten zulassen. Manche Hotspots und Gastnetze isolieren Geräte voneinander. Diese Seite kann weder einen Hotspot aktivieren noch eine Verbindung über Wi-Fi Direct oder Bluetooth herstellen.

## Was der Zuschauer sehen und tun kann

Der Zuschauer sieht ein Live-Videobild. Ihr Scrollen, Seitenwechsel, Menüs und sichtbare Kontoinhalte in diesem Tab werden Teil des Bildes. Einfach zu einem anderen Browser-Tab zu wechseln wählt keine neue Aufnahmequelle aus. Alles, was Sie innerhalb des ausgewählten Tabs sichtbar machen, wird jedoch geteilt. Prüfen Sie die Aufnahmeanzeige des Browsers und stoppen Sie, bevor Sie dort private Informationen öffnen.

Klicks und Tastatureingaben des Zuschauers können Ihren Browser nicht bedienen. Er erhält weder Ihre Anmelde-Cookies noch eine funktionsfähige Kopie der Website. Text in einem Video lässt sich nicht markieren. Diese Fassung kann deshalb kein Kopieren von Webseiteninhalten anbieten. Verwenden Sie daneben [Text und Dateien teilen](https://abox.tools/de/text-teilen/), wenn die andere Person einen kopierbaren Link, eine Notiz oder eine Datei benötigt. Manche geschützten Inhalte können in einer Aufnahme schwarz erscheinen oder nicht verfügbar sein.

Es wird kein Ton angefordert oder gesendet, auch kein Tab-Ton. Das Werkzeug fordert weder Kamera- noch Mikrofonzugriff an und erstellt keine Aufzeichnung. Ein Zuschauer kann seine eigene Ansicht dennoch aufzeichnen oder Bildschirmfotos erstellen. Das Beenden der Verbindung stoppt zukünftiges Video, kann aber bereits gespeicherte Inhalte nicht löschen.

## Die Einladung erlaubt eine Anfrage, Ihre Zustimmung das Video

Sitzungen haben neue zufällige Links. Ein Host kann seinen Einladungscode in der Umgebungsliste veröffentlichen; standardmäßig ist das aus. Jeder mit einer Einladung kann einen Verbindungsversuch einschließlich des Austauschs von Netzwerkadressen starten. Für Video ist weiterhin Ihre Zustimmung nötig. Der eingegebene Name oder Hinweis ist keine geprüfte Identität. Erkennen Sie die Person anhand Ihrer bereits bestehenden Unterhaltung und genehmigen Sie nur die erwartete Anfrage.

Ein URL-Fragment versteckt einen Linkcode nicht vor Skripten derselben Seite, und ein Browser kann seinen Verlauf behalten. Die Werkzeugseite enthält die üblichen Werbe- und Messskripte der Website. Das Werkzeug sendet ihnen nicht absichtlich Video oder Notizen, doch Skripte derselben Seite können deren Adresse und Zustand lesen. Die verpflichtende Genehmigung bleibt der Zulassungsschritt.

## Wie das Video den anderen Browser erreicht

Ein kleiner Vermittlungsdienst im Internet bringt die Browser über den Zufallscode zusammen und leitet Nachrichten zum WebRTC-Verbindungsaufbau weiter. Er sieht den Code, Adressen, Verbindungszeiten, Beschreibungen und Verbindungskandidaten. Der Aufbau ist vor diesem Dienst nicht verborgen. Die optionale Suche in der Nähe veröffentlicht auch den Raumcode in der Netzwerkgruppe des Dienstes, jedoch weder Tab-Titel noch Adresse oder Bild. Video, Zuschauernotiz und Genehmigungsentscheidungen laufen nicht darüber. Cloudflare bewahrt Metadaten von Verbindungsanfragen sieben Tage auf. Der Dienst schreibt keine Rauminhalte in einen Speicher.

Direktes Video nutzt eine verschlüsselte WebRTC-Verbindung ohne STUN-Server oder TURN-Relay. Beim Aufbau werden nur Host-Verbindungsadressen der Browser akzeptiert. Jeder Browser erfährt bereits vor der Videogenehmigung Adressen des anderen. Host-Adressen können öffentliche Schnittstellen enthalten oder einer VPN-Route folgen. Diese Regel beweist nicht, dass der Datenverkehr innerhalb eines Gebäudes bleibt.

Isolation in Gastnetzen oder Hotspots, Firewalls, VPN-Routen und lokale Netzwerkberechtigungen des Browsers können die Verbindung blockieren. Derselbe WLAN-Name allein belegt keine gegenseitige Erreichbarkeit. Testen Sie das tatsächliche Netzwerk vor einer Vorführung oder einem Supportgespräch. „Direct“ wechselt niemals automatisch zu einer anderen Verbindungsart. Beenden Sie für „Cloud relay“ die Sitzung und starten Sie eine neue mit dieser Auswahl. Cloudflare leitet verschlüsselte Video- und Steuernachrichten ohne deren Entschlüsselungsschlüssel weiter, sieht aber Adressen, Zeitpunkte und Datenvolumen. Die Kopplung verspricht keinen Fortbestand, wenn die Internetverbindung wegfällt.

Kann der Vermittlungsdienst keine Verbindung herstellen, prüfen Sie den Internetzugang beider Geräte und versuchen Sie es erneut. Ist die Sitzung beendet, beginnen Sie neu, wählen Sie den Tab und senden Sie den neuen Zuschauerlink. Eine neue Erfassung erfordert immer Ihre Handlung und den Auswahldialog des Browsers.

## Beide Host-Tabs offen halten und bewusst beenden

Das Ausblenden der Freigabeseite erhält eine funktionierende Erfassung, soweit der Browser es erlaubt. So können Sie den ausgewählten Website-Tab normal nutzen. Lassen Sie beide Tabs geöffnet und das Gerät wach. Ruhezustand, ein zugeklappter Laptop oder die Aussetzung durch den Browser können die Übertragung unterbrechen oder beenden. Diese Seite kann solche Regeln nicht außer Kraft setzen.

Wählen Sie zum Abschluss auf der Werkzeugseite *Stop sharing* oder verwenden Sie die Aufnahmesteuerung des Browsers. Auch das Schließen der Freigabeseite oder das Beenden des erfassten Tabs beendet die Quelle. Endet die Erfassung, beginnt bei der Rückkehr zur Seite niemals unbemerkt eine neue. Starten Sie erneut, wählen Sie wieder einen Tab und senden Sie die neue Einladung. Ein neuer Zuschauer benötigt immer eine neue Genehmigung.
