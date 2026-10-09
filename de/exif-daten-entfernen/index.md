# EXIF-Daten entfernen — Metadaten aus Fotos löschen

Sehen, was ein Foto über Sie verrät. Und es dann herausnehmen.

> EXIF- und GPS-Daten ansehen, bearbeiten oder entfernen. JPEG, PNG und WebP behalten ihre Kodierung; AVIF wird zur Bereinigung in ein neues PNG umgewandelt. Kein Upload.

Diese Seite ist ein interaktives Werkzeug, das vollständig in Ihrem Browser läuft, unter https://abox.tools/de/exif-daten-entfernen/ — nichts, was Sie ihm geben, wird hochgeladen. Es folgt alles, was die Seite in Worten über das Werkzeug sagt; um es zu benutzen, öffnen Sie die Adresse.

## Ihre Fotos werden **nie hochgeladen**. Es gibt keinen Server.

Die Datei wird von Ihrem eigenen Browser geöffnet, ausgewertet und neu geschrieben. Netzfunktionen hat dieses Werkzeug keine, weder zum Abrufen noch zum Senden. Und selbst wenn es einen Weg nach draußen gäbe, stünde am anderen Ende dieser Seite kein Server, an den ein Foto gehen könnte.

- ✗ Kein Upload
- ✗ Kein Konto
- ✓ Funktioniert offline
- ✓ Quelloffen
- ✓ AVIF wird zu PNG; JPEG, PNG und WebP behalten ihre Kodierung

## So entfernen Sie die EXIF-Daten aus einem Foto

1. **Wählen Sie Ihre Fotos aus.** Ziehen Sie sie auf das Auswahlfeld oder suchen Sie sie von Hand heraus. Der Browser liest sie direkt von Ihrer Festplatte, und dabei geht nichts nach draußen.
2. **Lesen Sie, was darin steht, wenn Sie mögen.** Die Fundliste nennt zuerst das Wissenswerte, also die GPS-Position, die Zeitstempel und die Seriennummern. Darunter folgt die vollständige Tabelle mit jedem einzelnen Tag. Bei JPEG, PNG und WebP listet das Werkzeug diese Blöcke auf. AVIF zeigt nur verfügbares extrahiertes EXIF; andere AVIF-Metadaten werden nicht inventarisiert.
3. **Klicken Sie auf „Alle Metadaten entfernen“.** Für JPEG, PNG und WebP: Für die meisten Menschen ist das die ganze Aufgabe. Jedes Tag, die XMP- und IPTC-Blöcke, die Kommentare und das eingebettete Vorschaubild verschwinden, und zwar bei allen Fotos auf der Liste auf einmal. AVIF wird vom Browser dekodiert und als neues PNG gespeichert, ohne die ursprünglichen Metadaten zu kopieren. Seine verfügbaren EXIF-Tags lassen sich hier ansehen, aber nicht bearbeiten. Das PNG kann größer sein und die Umwandlung Farben oder HDR verändern. Ihre Originaldatei bleibt unverändert.
4. **Oder bearbeiten statt entfernen.** Für JPEG, PNG und WebP: Ändern Sie ein Datum, korrigieren Sie eine Copyright-Zeile, löschen Sie den Ort und behalten Sie die Kameraeinstellungen. Dieses eine Foto speichern Sie dann einzeln.

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

Für JPEG, PNG und WebP: EXIF ist ein Block von Tags, den eine Kamera neben das Bild schreibt: Hersteller und Modell, die Belichtungseinstellungen, Datum und Uhrzeit auf die Sekunde genau, oft eine GPS-Position und manchmal eine Seriennummer. Häufig tragen Fotos noch mehr mit sich, etwa ein XMP-Paket mit XML aus einem Bildbearbeitungsprogramm, einen IPTC-Block mit Bildunterschrift und Urheberzeile, ein Farbprofil, eine kleine zweite Kopie des Bildes als Vorschaubild und eine Maker Note mit undokumentierten Herstellerdaten. Dieses Werkzeug listet all das auf. Bei JPEG, PNG und WebP listet das Werkzeug diese Blöcke auf. AVIF zeigt nur verfügbares extrahiertes EXIF; andere AVIF-Metadaten werden nicht inventarisiert.

### Verschlechtert das Entfernen der Metadaten die Bildqualität?

Bei JPEG, PNG und WebP wird nur der Container bearbeitet; die komprimierten Bilddaten werden Byte für Byte kopiert, ohne Dekodierung oder erneute Komprimierung. Bei AVIF wird das erste Bild dekodiert und als neues verlustfreies PNG ohne Originalmetadaten geschrieben. Das PNG kann größer sein und die Browser-Dekodierung Farben oder HDR verändern. Die Originaldatei bleibt unverändert.

### Welche Dateiformate kann es verarbeiten?

JPEG, PNG und WebP unterstützen Metadatenansicht, Bearbeitung und Container-Bereinigung. AVIF unterstützt die Vorschau verfügbaren extrahierten EXIFs und Bereinigung zu einem neuen PNG. AVIF-Tags sind schreibgeschützt; andere Metadaten werden nicht inventarisiert. Animiertes AVIF liefert das erste Bild. HEIC und reines TIFF werden erkannt, aber nicht neu geschrieben.

### Erscheint mein Foto nach dem Entfernen gedreht?

Bei JPEG, PNG und WebP schreibt die Option bei Bedarf einen kleinen EXIF-Block mit nur dem Orientierungs-Tag. Schalten Sie sie aus, um das Tag zu entfernen. AVIF wird als aufrecht dekodiertes Bild in PNG umgewandelt. Die Optionen für Orientierung und Farbprofil gelten nur für JPEG, PNG und WebP.

### Entfernt es den GPS-Standort?

Die Bereinigung entfernt die GPS-Daten. Bei JPEG, PNG und WebP lässt sich der Standort auch einzeln löschen und der Rest behalten. AVIF-Tags sind schreibgeschützt; die PNG-Umwandlung kopiert keine Originalmetadaten.

### Kann ich ein Tag ändern, statt es zu löschen?

JPEG, PNG und WebP unterstützen das Bearbeiten und Hinzufügen von Tags. Beim Neuaufbau einer Maker Note können herstellerspezifische Offsets ungültig werden; behalten Sie dann das Original. AVIF-EXIF ist schreibgeschützt. Die Bereinigung erzeugt ein PNG ohne Originalmetadaten, statt den AVIF-Container umzuschreiben.

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
