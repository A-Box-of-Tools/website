# Was in einer DICOM-Datei steckt

Mehr als der Scan. Eine DICOM-Datei ist eine Patientenakte mit einem Bild darin: Ihr Name, Ihr Geburtsdatum und Ihre Kliniknummer reisen in derselben Datei wie die Pixel — was genau in dem Moment am meisten zählt, in dem man Ihnen eine CD in die Hand drückt und Sie einen Betrachter suchen gehen.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Eine DICOM-Datei — das `.dcm` auf der CD, die ein Krankenhaus Ihnen mitgibt — ist kein Bildformat wie JPEG. Sie ist ein Format für Patientenakten mit einem Bild darin. Bevor die Pixel beginnen, trägt die Datei einen Header aus Hunderten von Einträgen, darunter routinemäßig: der volle Name des Patienten, Geburtsdatum, Geschlecht und Kliniknummer; Datum, Uhrzeit und Beschreibung der Untersuchung; der überweisende Arzt; die Einrichtung und das Gerät bis zur Seriennummer; und ein Satz eindeutiger Kennungen, die als Schlüssel zurück in das Archiv wirken, das sie erzeugt hat.

Nichts davon ist zu sehen, wenn das Bild auf dem Schirm steht, und genau so gerät es in Vergessenheit. Der Scan ist die Akte. Behandeln Sie die Datei wie das Dokument, das sie ist, nicht wie das Bild, das sie enthält.

## Warum gerade diese Datei so beiläufig hochgeladen wird

Die Falle in der Praxis: Nach einer Untersuchung bekommt jemand eine CD oder einen Download, versucht sie zu öffnen — und nichts auf dem Rechner will. DICOM ist kein Format, das gewöhnliche Software spricht. Also wird „dcm datei öffnen online“ gesucht, und das meiste, was sich findet, ist ein Upload-Feld. Augenblicke später liegt eine vollständige, identifizierte Patientenakte — Name, Geburtsdatum, Kliniknummern, diagnostisch gefärbte Untersuchungsbeschreibungen und alles — auf dem Server von wem auch immer an dem Tag gut rankte.

Beachten Sie die Gestalt: Es ist wieder das Ausweisfoto-Problem — eine heikle Datei, ein Moment Reibung, eine Suchmaschine —, nur mit einer Datei, die im zweiten Grad heikel ist. Ein Pass verrät, wer Sie sind; ein Scan verrät, wer Sie sind *und was untersucht wurde*. Das allgemeine Argument über Uploads hat [eine eigene Seite](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/); dies ist die Datei, für die es keinerlei Würze braucht.

Die Datei lokal zu öffnen ist die ganze Kur, und dafür ist der [DICOM-Viewer](https://abox.tools/de/dicom-viewer/) hier da: der Scan, eine echte Fenster/Level-Regelung, ein Ordner zurück zu seiner Serie gestapelt, Messungen in Millimetern, jeder Header-Eintrag lesbar — und nichts verlässt Ihre Maschine. Die Schritt-für- Schritt-Fassung steht im [Ratgeber zum Öffnen](https://abox.tools/de/ratgeber/dicom-datei-oeffnen/).

## „Ich habe den Namen entfernt“ ist keine Anonymisierung

Der nächste Fehler ist feiner und besser gemeint: einen Scan zu teilen — mit einem Zweitmeinungsdienst, einem Forscher, einem Forum —, nachdem der offensichtliche Eintrag gelöscht wurde. Der Standard selbst ist unmissverständlich, wie wenig das ist. DICOMs eigenes De-Identifizierungsprofil listet die Einträge, die behandelt sein müssen, bevor ein Datensatz de-identifiziert heißen darf, und es sind *Hunderte*, weil Identität an mehr Orten wohnt als im Namensfeld:

- **Direkte Kennungen jenseits des Namens** — Geburtsdatum, Patienten-ID, Vorgangsnummer, die Namen von Arzt und Einrichtung.
- **Schlüssel** — die eindeutigen Kennungen, die in jede Datei gestempelt sind: Sie sagen nicht, wer Sie sind, aber exakt, *welche Akte Sie sind*, für jedes System, das das Original je gesehen hat.
- **Beinahe-Kennungen** — Untersuchungsdatum und -zeit, Gerätemodell und Seriennummer, Körperregion, Patientenalter: einzeln vage, zusammen eng.
- **Die Pixel selbst** — Ultraschall und manche andere Modalitäten brennen den Patientennamen direkt ins Bild, wo keine Tag-Bearbeitung hinreicht. (Für ein exportiertes Bild ist das ein Fall für [Schwärzung auf Pixel-Ebene](https://abox.tools/de/bild-schwaerzen/), nicht für ein Metadaten-Werkzeug.)

Darum hat der Viewer hier eine Tafel, die genau auflistet, was in Ihrer Datei den Patienten identifiziert und wie direkt — gebaut aus der Liste des Standards selbst. Und darum kann der Viewer nur *lesen*: Er enthält keinen Code, der eine DICOM-Datei schreibt, denn „anonymisiert“ ist ein Versprechen mit einer weit höheren Latte, als ein Betrachter sie nimmt — und ein Werkzeug, das es halb hielte, wäre schlimmer als eines, das es nie gibt.

## Einen Scan wie die Akte behandeln, die er ist

Die Gewohnheiten fallen aus allem Obigen heraus:

- **Lokal ansehen.** Ein Betrachter, der mit abgeschaltetem WLAN arbeitet — dieser hier tut es —, hat bewiesen, wo die Arbeit passiert. Der mitgelieferte Betrachter der CD, wenn er auf Ihrer Maschine läuft, ist ebenfalls in Ordnung.
- **Über medizinische Kanäle teilen, wenn es um den Inhalt geht.** Eine Untersuchung an ein anderes Krankenhaus zu schicken ist ein gelöstes Problem mit rechenschaftspflichtiger Infrastruktur dahinter; eine private E-Mail mit einem `.zip` voller `.dcm`-Dateien ist eine Kopie Ihrer Akte in Mailservern, unbefristet.
- **Wenn Sie eine Datei teilen müssen, wissen Sie erst, was darin ist.** Lesen Sie den Header und die Identitäts-Tafel, damit Weitergegebenes eine Entscheidung ist statt einer Überraschung — und behandeln Sie „sauber de-identifiziert“ als Dienstleistung, die Ihr Bildgebungsanbieter Ihnen auf Anfrage schuldet, nicht als Häkchen, das Sie improvisieren.
- **Die CD überlebt den Anlass.** Die Kopie im Download-Ordner und die Scheibe in der Schublade sind ebenfalls vollständige Akten — wie der Ausweis-Scan, an dessen Löschen sich niemand erinnert.

Nichts davon heißt, niemals einen Scan zu teilen — Zweitmeinungen sind, wofür die Kopien da sind. Es heißt: Die Datei ist ein Dokument über Sie, und die zwei Fragen, bei denen diese ganze Ratgeber-Gruppe immer wieder ankommt, sind auch hier die richtigen — wem wird sie ausgehändigt, und musste die Aushändigung überhaupt sein.
