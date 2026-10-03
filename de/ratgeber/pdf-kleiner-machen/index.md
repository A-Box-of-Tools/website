# So machen Sie ein PDF kleiner, und warum manche nicht schrumpfen

Ein PDF, das nicht unter das Anhangslimit passt, ist fast immer ein PDF voller Bilder. Hier steht, woran Sie erkennen, ob Ihres dazugehört, was das Komprimieren kostet und warum jedes Werkzeug, das einen festen Prozentsatz verspricht, Ihre Datei gar nicht angesehen hat.

[PDF-Kompressor öffnen](https://abox.tools/de/pdf-verkleinern/): Ein Dokument verkleinern, ohne es irgendwohin zu schicken.

Zuletzt aktualisiert 26. August 2026

## Die kurze Antwort

Öffnen Sie den [PDF-Kompressor](https://abox.tools/de/pdf-verkleinern/), ziehen Sie das Dokument hinein und lesen Sie zuerst, was er Ihnen sagt, bevor Sie irgendetwas verstellen. Er zerlegt die Datei und zeigt, wo die Größe tatsächlich sitzt: in den Bildern, in den Schriften, in Text und Zeichnung, und in allem, worauf im Dokument längst nichts mehr verweist. Dieser eine Bildschirm beantwortet die Frage meistens schon.

Steckt der Löwenanteil in Bildern, ist eine große Ersparnis drin. Sind es Schriften und Text, ist sie es nicht, und zwar bei keinem Werkzeug. Welcher der beiden Fälle vorliegt, ist die ganze Geschichte, und zehn Sekunden Hinsehen sind sie wert.

## Wo bei einem PDF die Größe wirklich sitzt

Ein PDF ist ein Behälter für höchst unterschiedliche Dinge, und die lassen sich nicht gleich gut komprimieren.

- **Bilder.** Fotografien und Scans. Fast immer der Löwenanteil eines großen PDFs, und der einzige Teil mit echtem Spielraum.
- **Eingebettete Schriften.** Eine vollständige Schrift kann einige hundert Kilobyte wiegen. Nimmt man nur die tatsächlich benutzten Zeichen, ist es ein Bruchteil davon. In beiden Fällen hat das Programm, das die Datei erzeugt hat, sie bereits komprimiert.
- **Text und Vektorzeichnung.** Anweisungen statt Pixel: zieh diese Linie, setz dieses Wort hierhin. Ohnehin kompakt und ohnehin komprimiert.
- **Objekte, auf die nichts mehr zeigt.** Davon sammeln PDFs einiges an. Wer ein Dokument bearbeitet, hängt die Änderung oft hinten an, statt die Datei neu zu schreiben, und eine alte Fassung einer Seite kann deshalb unbegrenzt darin liegen bleiben. Beim Neupacken fliegt sie heraus.

Die zwei Dokumente, mit denen Leute zum PDF-Kompressor kommen, haben deshalb völlig verschiedene Aussichten. Ein gescanntes Dokument ist im Kern ein Stapel Fotografien und wird üblicherweise ⁦60–90⁩ % kleiner. Ein Vertrag, eine Abschlussarbeit oder ein exportierter Bericht besteht dagegen aus Text, Zeichnung und Schriften, die die Software, die sie geschrieben hat, längst komprimiert hat. Da bleiben meist ein paar Prozent übrig, aus dem Neupacken und aus dem, was niemand mehr braucht.

Wer „bis zu 90 % kleiner“ verspricht, ohne Ihre Datei gesehen zu haben, nennt Ihnen den besten Fall der ersten Sorte für die zweite.

![Die Bestandskarte: ein Urteil, dass der größte Teil der Datei aus Bildern besteht, ein Balken, der die Größe aufschlüsselt, und eine Liste der Gewichte.](https://abox.tools/screens/make-a-pdf-smaller/inventory.webp)

Wo die Größe wirklich steckt, bevor irgendetwas verändert wird. Fast jede große PDF ist aus dem Grund groß, den dieser Balken zeigt.

## Was dpi damit zu tun hat

Ein PDF speichert nicht nur ein Bild, sondern hält auch fest, wie groß dieses Bild auf der Seite gezeichnet wird. Daraus ergibt sich etwas viel Nützlicheres als die bloße Pixelzahl, nämlich die tatsächliche Auflösung.

Ein 4000 Pixel breiter Scan, über zwanzig Zentimeter Papier gelegt, bringt es auf rund 500 Pixel pro Zoll. Ein Bildschirm zeigt etwa 100. Ein guter Bürodrucker arbeitet mit 300 und kann mit mehr kaum etwas anfangen. Alles darüber ist Detail, das in der Zukunft dieses Dokuments nie irgendwo erscheinen wird, und es macht meist den größten Teil der Datei aus.

Deshalb fragt ein vernünftiger PDF-Kompressor nach einer dpi-Zahl und nicht nach einem Qualitätsprozentsatz. Er wirft zuerst die Pixel oberhalb Ihres Wertes weg, weil die nichts kosten, was irgendjemand zu sehen bekäme, und fängt erst danach an, echte Qualität auszugeben.

Als grobe Richtschnur: **150 dpi** für ein Dokument, das am Bildschirm gelesen wird, **⁦200–300⁩** für etwas, das gedruckt wird, **⁦72–100⁩** für einen Entwurf, den niemand aufhebt. Dass am Zeichenmaß und nicht an der Pixelzahl gemessen wird, ist übrigens auch der Grund, warum ein klein platziertes Logo anders behandelt wird als ein ganzseitiger Scan. Das Logo liegt schon nahe an seiner tatsächlichen Auflösung, da ist nichts zu holen.

![Die Einstellungskarte: Voreinstellungen, eine Auflösung in DPI, ein Qualitätsregler und ein Schalter für das Entfernen der Metadaten, dazu eine Schätzung des Ergebnisses.](https://abox.tools/screens/make-a-pdf-smaller/settings.webp)

Die beiden Regler, auf die es ankommt, sind die Auflösung und die Qualität. Was jeder von beiden mit einer Textseite und mit einer Fotoseite macht, ist das Thema dieses Abschnitts.

## Was das Komprimieren anfassen darf und was nicht

Die Bilder werden neu kodiert, die verlieren also ein wenig. Alles Übrige sollte unangetastet bleiben, und es lohnt sich nachzusehen, ob das Werkzeug, das Sie verwenden, sich daran hält:

- **Text bleibt Text.** Markierbar, durchsuchbar, kopierbar. Ein Kompressor, der Seiten zu Bildern plattwalzt, liefert eine sehr kleine Datei und zerstört dabei das Dokument: nicht mehr durchsuchbar, für Screenreader unlesbar, und rückgängig machen lässt sich das nie.
- **Schriften bleiben vollständig.** Schriften auszutauschen ändert, wie das Dokument auf fremden Geräten aussieht, und genau das zu verhindern ist der einzige Daseinszweck von PDF.
- **Vektorzeichnung wird exakt übernommen.** Sie ist ohnehin klein, und sie zu rastern machte sie zugleich größer und schlechter.
- **Formulare, Links, Lesezeichen, Barrierefreiheitsstruktur und Anhänge kommen mit.** Beim Neuschreiben gehen sie leicht verloren, und auffallen tut es selten, bis jemand eines davon braucht.

Dazu eine Regel, an die sich ein Kompressor halten sollte und viele sich nicht halten: Wird ein neu kodiertes Bild nicht tatsächlich kleiner als das Original, gehören die Originalbytes zurück. Ein Bild zu verschlechtern, ohne dabei etwas zu sparen, ist reiner Verlust, und er tritt häufiger ein, als man denkt, nämlich bei Bildern, die schon gut komprimiert waren.

## Die Bilder, an die niemand herankommt

Manche Bilder in einem PDF werden übersprungen, und ein gutes Werkzeug benennt sie, statt sie stillschweigend aus der Rechnung zu nehmen:

- **JPEG 2000, JBIG2 und faxkodierte (CCITT-)Bilder.** Für keines davon bringt ein Browser einen Decoder mit, sie werden also unangetastet durchgereicht. Die letzten beiden sind Zweiton-Formate, also nur Schwarz und Weiß, und liegen meist ohnehin dicht an ihrem Minimum.
- **CMYK-Bilder.** Bewusst in Ruhe gelassen. Sie neu zu kodieren würde riskieren, die Farben zu verschieben, die am Ende aus dem Drucker kommen. In einem Dokument, das jemand drucken wird, wäre das ein überraschender Eingriff.

## Was Sie vor dem Komprimieren versuchen sollten

Manchmal ist die Datei aus einem Grund groß, auf den Komprimieren die falsche Antwort ist.

**Wurde gescannt, wo es gar nicht nötig war?** Ein ausgedrucktes und dann eingescanntes Dokument ist ein Stapel Fotografien von Text. Existiert das Original irgendwo noch als richtiges Dokument, liefert ein PDF-Export daraus eine Datei, die einen Bruchteil so groß und obendrein durchsuchbar ist.

**Wurde in Druckqualität exportiert?** Textverarbeitungen und Layoutprogramme stellen dafür gern von sich aus auf Druck um. Aus der Quelldatei neu für den Bildschirm zu exportieren schlägt meist jedes Komprimieren des Exports.

**Muss es eine einzige Datei sein?** Ein Anhangslimit gilt pro Nachricht. Ein 200-seitiges Dokument in Kapitel zu zerlegen ist manchmal die ehrlichere Lösung.

## Verschlüsselte Dateien, und warum ein Kompressor sie abweisen sollte

Ein passwortgeschütztes PDF weist das Werkzeug hier ab, und das ist Absicht und keine fehlende Funktion. Es gilt auch dann, wenn das Passwort leer ist, und genau so speichern viele Scanner und Kopierer.

Einem Dokument den Schutz zu nehmen ist eine andere Aufgabe, als es zu komprimieren. Ein Werkzeug, das das stillschweigend täte, würde an einer Datei, die jemand bewusst verschlossen hat, etwas tun, worum niemand gebeten hat, und Ihnen eine Kopie zurückgeben, der genau die Eigenschaft fehlt, die sie haben sollte. Nehmen Sie den Schutz vorher selbst weg, wenn Sie das wollen, und tun Sie es bewusst.

## Das Ergebnis prüfen

Öffnen Sie es. Sehen Sie sich die Bilder in voller Vergrößerung an, prüfen Sie, ob der Text sich noch markieren lässt, und zählen Sie die Seiten nach.

Das Letzte nimmt Ihnen das Werkzeug hier ab, bevor es die Datei herausgibt. Es öffnet das eben geschriebene Dokument noch einmal und zählt die Seiten, auf Ihrem eigenen Gerät. Und es schreibt PDF 1.5, das jeder seit 2003 erschienene Reader versteht. Damit ist „bei mir geht es auf“ ein brauchbarer Ersatz für „bei den anderen auch“.

## Warum das keinen Server braucht

Ein PDF zu komprimieren klingt nach Serverarbeit, und den größten Teil der Web-Geschichte über war es das auch. Tatsächlich besteht die Arbeit darin, die Dateistruktur zu zerlegen, die Bildströme darin zu finden, sie mit den Codecs zu dekodieren und neu zu kodieren, die ein Browser ohnehin mitbringt, und das Dokument wieder herauszuschreiben. Das alles läuft inzwischen im Browser.

Und bei diesem Dateityp wiegt das schwerer als bei den meisten, wegen dessen, was die Leute komprimieren: Verträge, Arztbriefe, Kontoauszüge, Ausweispapiere, Steuererklärungen. Eine Netzfunktion hat das Werkzeug hier überhaupt nicht, und in der `Content-Security-Policy` der Seite steht jede Adresse, die sie kontaktieren darf; keine davon gehört uns. Laden Sie die Seite, ziehen Sie den Stecker, komprimieren Sie trotzdem etwas.

Drei weitere Proben dieser Art stehen in [Ist es sicher, Dateien zu Online-Konvertern hochzuladen?](https://abox.tools/de/ratgeber/ist-das-hochladen-von-dateien-sicher/)
