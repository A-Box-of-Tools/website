# EXIF-Daten entfernen — Metadaten aus Fotos löschen

Sehen, was ein Foto über Sie verrät. Und es dann herausnehmen.

> Die EXIF- und GPS-Daten in einem Foto sehen, bearbeiten oder mit einem Klick vollständig entfernen. Im Browser: kein Upload, und das Bild wird nie neu kodiert.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/exif-daten-entfernen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Fotos werden **nie hochgeladen**. Es gibt keinen Server.

Die Datei wird von Ihrem eigenen Browser geöffnet, ausgewertet und neu geschrieben. Netzfunktionen hat dieses Werkzeug keine, weder zum Abrufen noch zum Senden. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Foto gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ Kodiert das Bild nie neu

## So entfernen Sie die EXIF-Daten aus einem Foto

1. **Wählen Sie Ihre Fotos aus.** Ziehen Sie sie auf das Auswahlfeld oder suchen Sie sie von Hand heraus. Der Browser liest sie direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Lesen Sie, was darin steht, wenn Sie mögen.** Die Fundliste nennt zuerst das Wissenswerte, also die GPS-Position, die Zeitstempel und die Seriennummern. Darunter folgt die vollständige Tabelle mit jedem einzelnen Tag.
3. **Klicken Sie auf „Alle Metadaten entfernen“.** Für die meisten Menschen ist das die ganze Aufgabe. Jedes Tag, die XMP- und IPTC-Blöcke, die Kommentare und das eingebettete Vorschaubild verschwinden, und zwar bei allen Fotos auf der Liste auf einmal.
4. **Oder bearbeiten statt entfernen.** Ändern Sie ein Datum, korrigieren Sie eine Copyright-Zeile, löschen Sie den Ort und behalten Sie die Kameraeinstellungen. Dieses eine Foto speichern Sie dann einzeln.

## Die ausführliche Fassung

[Was ein Foto über Sie verrät, und wie Sie es herausbekommen](https://abox.tools/de/ratgeber/exif-und-gps-daten-entfernen/): Ein Foto vom Handy trägt meist den genauen Aufnahmeort mit sich, die Uhrzeit auf die Sekunde und die Seriennummer der Kamera. Was da alles drinsteckt, wer es lesen kann und wie Sie es loswerden, ohne das Bild anzurühren.

## Auch im Werkzeugkasten

- [DICOM-Viewer](https://abox.tools/de/dicom-viewer/): CT, MRT, Röntgen und Ultraschall, mit Fenster, Header und Messungen.
- [Bild zu ICO](https://abox.tools/de/favicon-erstellen/): Ein Bild hinein. Jede Größe, die ein Browser, Windows oder ein Mac verlangt, heraus.
- [Bild als Data-URI](https://abox.tools/de/bild-als-base64/): Das ganze Bild als eine Zeile Text. Direkt in CSS oder HTML einfügen.
- [SVG zu Bild](https://abox.tools/de/svg-in-png-umwandeln/): Nennen Sie die Größe. Ein Vektor hat keine eigene, die er verlieren könnte.

## Fragen

### Wird mein Foto irgendwohin hochgeladen?

Nein. Ihr eigener Browser liest, wertet aus und schreibt neu, auf Ihrer eigenen Hardware. Netzfunktionen hat dieses Werkzeug keine, es ruft nie etwas ab und sendet nie etwas. In der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf, und keine davon gehört uns.

### Was ist EXIF, und was steckt sonst noch in einem Foto?

EXIF ist ein Block von Tags, den eine Kamera neben das Bild schreibt: Hersteller und Modell, die Belichtungseinstellungen, Datum und Uhrzeit auf die Sekunde genau, oft eine GPS-Position und manchmal eine Seriennummer. Häufig tragen Fotos noch mehr mit sich, etwa ein XMP-Paket mit XML aus einem Bildbearbeitungsprogramm, einen IPTC-Block mit Bildunterschrift und Urheberzeile, ein Farbprofil, eine kleine zweite Kopie des Bildes als Vorschaubild und eine Maker Note mit undokumentierten Herstellerdaten. Dieses Werkzeug listet all das auf.

### Verschlechtert das Entfernen der Metadaten die Bildqualität?

Nein, und das ist der wichtigste Grund, ein solches Werkzeug zu benutzen, statt das Foto neu zu speichern. Metadaten liegen im Container um das komprimierte Bild herum, nicht darin. Sie zu entfernen heißt, Einträge aus einer Liste zu löschen und die Liste wieder herauszuschreiben. Die komprimierten Bilddaten werden Byte für Byte übernommen, und das Ergebnis dekodiert daher zu exakt denselben Pixeln. Dekodiert wird nichts, und neu komprimiert erst recht nicht.

### Welche Dateiformate kann es verarbeiten?

JPEG, PNG und WebP. HEIC und AVIF werden zwar erkannt, aber nicht neu geschrieben. Es sind Box-Formate aus verschachtelten Atomen und bräuchten einen anderen Parser, also sagt das Werkzeug das lieber, statt eine kaputte Datei zu erzeugen. Ein reines TIFF bleibt ebenfalls draußen, weil in einem TIFF die Metadaten und die Pixel über dieselben Offsets adressiert werden.

### Erscheint mein Foto nach dem Entfernen gedreht?

Das kann passieren, und dafür gibt es eine Einstellung. Telefone nehmen das Bild meist so auf, wie der Sensor es gesehen hat, und ergänzen ein Orientation-Tag, das sagt, wie es zu drehen ist. Fällt dieses Tag weg, zeigen manche Betrachter das Foto quer. Die Option „das Orientierungs-Tag behalten“ ist deshalb standardmäßig aktiv und schreibt einen winzigen EXIF-Block zurück, in dem nichts als dieses eine Tag steht, und auch das nur, wenn das Foto es tatsächlich gebraucht hat. Schalten Sie sie ab, wenn die Datei lieber gar kein EXIF tragen soll.

### Entfernt es den GPS-Standort?

Ja. Beim Entfernen aller Daten verschwindet das gesamte GPS-Verzeichnis, und Sie können den Standort auch einzeln löschen und den Rest behalten. Angezeigt wird die Position zuerst in Dezimalgrad, denn bei „51 Grad, 30 Minuten, 26 Sekunden“ fällt nicht auf den ersten Blick auf, dass ein Foto das Gebäude benennt, in dem es aufgenommen wurde.

### Kann ich ein Tag ändern, statt es zu löschen?

Ja. Text-Tags, Datumsangaben, der ISO-Wert, die Orientierung und die Auflösung lassen sich alle bearbeiten, und ein paar gängige Tags können Sie einem Foto hinzufügen, das keine hat. Einen Vorbehalt gibt es. Beim Schreiben der Datei wird der EXIF-Block neu aufgebaut, und eine Maker Note enthält Offsets in den ursprünglichen Block. Neu aufgebaut ist sie für die Software des Herstellers womöglich nicht mehr lesbar. Löschen Sie sie in dem Fall, oder lassen Sie die Datei ganz unbearbeitet, wenn Ihnen daran liegt.

### Ist es kostenlos, und brauche ich ein Konto?

Es ist kostenlos, und es gibt kein Konto, keine Anmeldung und keine Testphase. Bezahlt wird die Seite über Werbung, und den Anzeigen wird nichts über Ihre Fotos übergeben.

### Funktioniert es offline?

Ja. Laden Sie die Seite einmal, trennen Sie dann die Internetverbindung, und sie arbeitet weiter. Das ist zugleich der einfachste Beweis dafür, dass nichts hochgeladen wird. Ein Werkzeug, das Ihre Fotos zum Verarbeiten wegschickt, bliebe in dem Moment stehen, in dem Sie den Stecker ziehen.

## So lässt sich das Datenschutzversprechen nachprüfen

- **Ihre Fotos haben keinen Weg nach draußen.** In der Content-Security-Policy steht jede Adresse, die diese Seite kontaktieren darf, und keine einzige davon gehört uns. Es gibt hier keinen Endpunkt, an dem Ihre Dateien landen könnten, und im Code steht auch nichts, das sie dorthin schicken würde, gäbe es einen.
- **Nichts hier ruft etwas ab.** Anders als die übrigen Werkzeuge in diesem Kasten hat dieses keine Funktion „von einer Webadresse laden“ und überhaupt keinen optionalen Schritt über das Netz. Es gibt weder `fetch` noch `XMLHttpRequest` noch `sendBeacon` irgendwo in `src/`.
- **Gelesen wird alles, weitergesagt nichts.** Ihre GPS-Position steht auf dieser Seite und sonst nirgends. In diesem Repository gibt es kein eigenes Analytics-Ereignis, das ein Tag, einen Dateinamen, eine Größe oder eine Anzahl mitführt.
- **Was Google lädt und was Google nicht bekommt.** Die Werbe- und Messskripte kommen von Google. Keinem von beiden wird irgendetwas über Ihre Fotos übergeben. Jede Zeile, die eine Datei liest, auswertet oder neu schreibt, kommt von dieser Domain selbst und steht im Repository.
- **Was der Spenden-Button lädt und was er nicht bekommt.** Der Button „Buy me a coffee“ in der Kopfzeile wird von einem Skript von cdnjs.buymeacoffee.com gezeichnet und holt seine Schrift von Google Fonts. Mehr als ein Link ist er nicht. Er meldet keinen Besuch, und über Sie oder Ihre Dateien bekommt er nichts. Solange Sie ihn nicht anklicken, passiert nichts, und was Sie damit ansteuern, ist die Seite von jemand anderem.
- **Es funktioniert offline.** Trennen Sie die Netzverbindung, und das Werkzeug bleibt unverändert, weil darin nie ein Schritt über das Netz vorgesehen war. Einen einfacheren Beweis gibt es nicht.

**Prüfen Sie es selbst.** Nichts davon müssen Sie uns glauben. Ein Build-Skript erzeugt diese Seite aus den Vorlagen und der Konfiguration im Repository, und dieses Skript können Sie lesen und selbst ausführen. Das Ergebnis liegt im Branch `dist`. Vergleichen Sie also, was ausgeliefert wird, mit dem, was ein Build der Quellen hervorbringt: https://github.com/A-Box-of-Tools/website

Zuerst lesenswert sind `config/site.toml` für die Content-Security-Policy, `src/tiff.js` für den EXIF-Parser und `src/jpeg.js` als Beleg dafür, dass das Bild selbst immer nur kopiert wird.
