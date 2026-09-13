# Caviarder un PDF — les mots sortent, on ne les recouvre pas

Les lettres sont supprimées du fichier, puis le fichier est fouillé pour le prouver.

> Retirez des mots d'un PDF au lieu de peindre un rectangle noir par-dessus. Les lettres sont supprimées des instructions de dessin de la page, le fichier terminé est rouvert et fouillé pour prouver qu'elles ont disparu, et rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/caviarder-un-pdf/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos documents. Il n'y a pas de serveur.

Le document que vous choisissez est ouvert, lu, modifié et réécrit en mémoire sur cette machine, par du code servi depuis cette adresse. Rien ici ne peut faire d'envoi, et il n'y a au bout de cette page aucun serveur pour le recevoir. Ni le fichier ni les mots que vous avez cherchés ne quittent l'onglet.

- ✗ Aucun envoi
- ✗ Aucun compte
- ✓ Fonctionne hors ligne
- ✓ Code ouvert
- ✓ Vos fichiers restent sur votre appareil

## Comment caviarder un PDF pour que les mots aient vraiment disparu

1. **Choisissez le PDF.** Un document à la fois, et c'est volontaire : le caviardage est un travail qu'il faut regarder page par page, et un outil qui vous laisserait cocher des mots dans un fichier pour les appliquer en silence à un autre est exactement la façon dont on finit par envoyer ce qu'il ne fallait pas. Le navigateur le lit directement sur votre disque.
2. **Dites ce qui doit disparaître.** Tapez les mots — un nom, une adresse, une référence — et chaque endroit où ils apparaissent est listé avec la ligne sur laquelle il se trouve et une case à cocher. Les détecteurs d'à côté cherchent les adresses e-mail, les numéros de carte, les IBAN, les numéros de sécurité sociale et les numéros de téléphone. Ils sont proposés, jamais cochés pour vous : un motif ne distingue pas un numéro de téléphone d'un numéro de dossier.
3. **Lisez la page et piochez-y des mots.** Le panneau montre le texte du document tel qu'il est réellement stocké, dans l'ordre où un lecteur le copierait. Cliquez sur un mot pour le retirer, cliquez de nouveau pour le garder. Tout ce qui est barré est ce qui va disparaître, ce qui fait de cette étape la relecture autant que la sélection : elle vaut la peine sur chaque page avant d'appuyer sur le bouton.
4. **Retirez-les, et lisez la ligne qui dit que c'est vérifié.** Les lettres sont supprimées, le vide qu'elles laissent est maintenu ouvert, un cadre noir est peint dessus si vous en avez demandé un, et les mêmes mots sont retirés des signets, des commentaires, des champs de formulaire et des propriétés du document. Puis le fichier terminé est rouvert ici et fouillé. Si un mot que vous avez retiré s'y trouve encore, vous n'avez pas de téléchargement mais un message qui le dit.

## La version longue

[Comment caviarder un PDF pour que le texte disparaisse vraiment](https://abox.tools/fr/guides/caviarder-un-pdf/): Un cadre noir dessiné dans une visionneuse PDF laisse le plus souvent les mots dessous, et un copier-coller les récupère aussitôt. Ce qu'une vraie suppression retire, les quatre endroits où un mot se cache hors de la page, et comment vérifier un fichier avant de l'envoyer.

## Aussi dans la boîte

- [Images en PDF](https://abox.tools/fr/images-en-pdf/): Réunir vos images dans un seul document.
- [Scanner de documents](https://abox.tools/fr/scanner-un-document/): Photographiez la page. Vous récupérez quelque chose qui a l'air scanné.
- [Extraire l'audio d'une vidéo](https://abox.tools/fr/extraire-l-audio-d-une-video/): Déposez une vidéo et repartez avec le son. L'image n'est jamais décodée, et rien n'est envoyé.
- [Découpeur audio](https://abox.tools/fr/couper-un-audio/): Marquez au vol les passages à garder. Ils vous reviennent en un seul fichier, coupé là où vous l'avez dit.

## Questions

### En quoi est-ce différent d'un cadre noir dessiné dans une visionneuse PDF ?

Un rectangle dessiné dans une visionneuse est une annotation : un objet doté d'une position, enregistré à côté de la page. Le texte dessous est intact. Quiconque sélectionne cette zone et copie, ou ouvre le fichier dans un autre logiciel, ou y passe n'importe quel extracteur de texte, récupère les mots. Certaines visionneuses proposent une commande « caviarder » qui applique réellement la suppression, et plusieurs ne proposent que le dessin. Cet outil n'a aucun rectangle à écarter : les lettres sont découpées des instructions de dessin de la page, et le cadre noir, si vous le laissez activé, est peint ensuite sur un vide déjà vide.

### Comment puis-je savoir que les mots ont vraiment disparu ?

Parce que l'outil le vérifie, sur votre machine, et vous montre le décompte. Une fois le fichier écrit, il est rouvert par le lecteur même de cette page, chaque page est lue, chaque signet, commentaire, champ de formulaire et propriété est collecté, et chaque mot retiré est cherché. La ligne de résultat indique combien il y en avait et combien il en reste. Si la réponse n'est pas celle attendue, le passage échoue et rien n'est proposé au téléchargement. Vous pouvez aussi le vérifier ensuite vous-même dans n'importe quelle visionneuse : Ctrl+F, et cherchez le mot.

### Le reste de la page bouge-t-il quand un mot est retiré ?

Non. Le texte est dessiné en faisant avancer une plume sur la page : supprimer cinq lettres tirerait donc normalement le reste de la ligne de cinq lettres vers la gauche. La largeur exacte de ce qui a été retiré est mesurée sur les métriques de la police elle-même et remise sous forme d'instruction d'espacement, qui déplace la plume sans rien dessiner. Les colonnes restent alignées et les totaux restent sous leur titre.

### Peut-il caviarder un document numérisé ?

Pas l'image, et il le dit au lieu de faire semblant. Un scan est la photo d'une page : les mots sont des pixels et il n'y a pas de texte à retirer. Ce qu'un scan porte souvent, en revanche, c'est une couche de texte invisible que l'OCR du scanner a écrite par-dessus l'image pour rendre la page consultable ; cet outil trouve cette couche, en retire ce que vous choisissez, et vous dit sur la page que l'image est inchangée. Une recherche et un copier cessent donc de trouver le mot, et qui regarde la page le lit toujours. Pour une image, le [caviardeur d'images](https://abox.tools/fr/caviarder-une-image/) écrase les pixels eux-mêmes.

### Et les parties d'un document qui ne sont pas sur une page ?

Elles sont traitées, car c'est là qu'un caviardage fuit d'ordinaire. Les mêmes mots sont retirés des signets, des commentaires et des pense-bêtes, de ce qui a été saisi dans les champs de formulaire, du texte remis à un lecteur d'écran, et du texte de remplacement qu'une visionneuse copie *à la place* des lettres de la page. Ce dernier existe pour que les ligatures et les mots coupés se copient correctement, et il peut contenir une phrase entière. Les propriétés du document et le paquet XMP sont supprimés purement et simplement. Les pièces jointes et tout ce qui s'exécute à l'ouverture du fichier sont écartés, car on ne peut chercher dans ni l'un ni l'autre les mots que vous retirez.

### Mes documents sont-ils envoyés quelque part ?

Non. Le fichier est lu, modifié et écrit par votre propre navigateur, sur votre propre matériel. Cet outil n'a pas de partie serveur, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, dont aucune ne nous appartient. Ce que vous tapez dans le champ de recherche est comparé à du texte présent dans la mémoire de cet onglet et ne va nulle part non plus.

### Pourquoi ne puis-je pas tracer un cadre sur la page comme dans d'autres outils ?

Parce que dessiner une page suppose un moteur PDF complet — polices, dégradés, transparence, modes de fusion —, soit un mégaoctet ou plus de moteur à télécharger et à exécuter, et ce site n'en embarque aucun. Cela se trouve convenir au travail : tracer un rectangle sélectionne une *surface de papier*, et une surface de papier n'est pas la même chose que le texte qui se trouve dessous, ce par quoi l'échec du cadre noir commence. Ce que vous obtenez à la place, c'est le texte du document, dans l'ordre de lecture, chaque mot cliquable. C'est aussi la seule vue capable de vous dire ce qu'une image de la page ne peut pas : si les mots devant vous sont seulement du texte.

### Le fichier terminé s'ouvrira-t-il partout ?

Oui. La sortie est écrite en PDF 1.5, ou dans la version la plus élevée qu'exigeait le fichier que vous avez fourni, et la 1.5 est comprise par toute visionneuse parue depuis 2003. Rien sur la page n'est réencodé : les polices, les images et le dessin vectoriel passent octet pour octet, et ce qui reste du texte demeure sélectionnable et consultable comme avant.

### Peut-il ouvrir un PDF protégé par mot de passe ?

Non, et c'est délibéré. Un document chiffré est refusé avec un message qui le dit, même lorsque le mot de passe est vide, ce qui est la façon dont enregistrent beaucoup de scanners et de photocopieurs. Retirer sa protection à un fichier est un autre travail que d'en retirer des mots, et un outil qui le ferait en silence ferait quelque chose que vous n'avez pas demandé.

### Y a-t-il une limite de taille, et cela coûte-t-il quelque chose ?

Aucune limite n'est écrite dans l'outil. La limite, c'est votre propre machine : le document est tenu en mémoire pendant le travail, un portable encaissera donc quelques centaines de mégaoctets sans broncher et peinera quelque part au-dessus. C'est gratuit, il n'y a ni compte, ni connexion, ni période d'essai. Le site porte de la publicité, et c'est elle qui le paie ; on ne donne rien aux annonces sur vos documents.

### Fonctionne-t-il hors ligne ?

Oui. Chargez la page une fois, débranchez-vous ensuite d'internet : elle continue de fonctionner. C'est aussi la façon la plus simple de prouver que rien n'est envoyé : un outil qui expédierait votre document ailleurs pour le caviarder s'arrêterait à l'instant où vous tirez la prise.

## Comment cette promesse se vérifie

- **Un rectangle noir n'est pas un caviardage, et ici on n'en peint aucun sur quoi que ce soit.** Dans presque tous les logiciels qui proposent de caviarder une page — une visionneuse PDF, un traitement de texte, un outil de mise en page — le rectangle est un objet enregistré à côté du texte et non dedans. Le texte est toujours là, dans le même fichier, au même endroit, et sélectionner la zone puis copier vous le rend. Cet échec a publié des dossiers judiciaires, des rapports de renseignement et, en décembre 2025, des noms caviardés dans une publication massive de documents du ministère de la Justice américain, lisibles en quelques heures. Cet outil supprime les lettres des instructions qui dessinent la page. Il n'y a pas de rectangle avec quelque chose dessous, parce qu'il n'y a rien dessous.
- **Le fichier terminé est rouvert et fouillé, ici, avant de vous être proposé.** Tant que cela n'a pas eu lieu, tout ce qui précède n'est que cet outil corrigeant sa propre copie. Les octets qui vont devenir votre téléchargement sont donc rendus au même lecteur comme si un inconnu les avait envoyés, chaque page est relue, chaque signet, commentaire, champ de formulaire et propriété du document est collecté, et les mots que vous avez retirés sont cherchés. Le décompte figure dans les résultats. Si quelque chose a survécu, le passage est déclaré en échec et il n'y a pas de téléchargement.
- **Les mots ne quittent jamais l'onglet, la recherche non plus.** La Content-Security-Policy nomme chaque adresse que cette page peut contacter, et aucune ne nous appartient. Cet outil n'ajoute rien à cette liste : il n'a aucune fonction réseau propre, pas même facultative. Ce que vous tapez dans le champ de recherche est une chaîne comparée à du texte présent dans la mémoire de cet onglet, et ni l'une ni l'autre n'a nulle part où aller.
- **Le caviardage est le travail qui survit le plus mal à un envoi.** Ce que les gens caviardent est la raison même pour laquelle cela ne doit pas être envoyé. Un témoignage, un courrier médical, un relevé bancaire destiné à un propriétaire, un contrat portant le nom d'un client et destiné à un autre. Confier cela au serveur d'un inconnu pour qu'il en retire la partie privée signifie que la partie privée arrive d'abord, entière, et que c'est la version qu'il conserve. Cette page n'a pas d'autre moitié.
- **Ce qui reste est recopié sans être touché.** Les seuls octets qui changent sur une page sont les instructions d'affichage de texte dont les lettres retirées faisaient partie. Toute autre instruction, et chaque police, image et trait auxquels la page se réfère, sont recopiés exactement tels qu'ils sont arrivés : rien n'est redessiné, réencodé ni remis en page. La largeur de ce qui a été retiré est mesurée et remise sous forme d'instruction d'espacement, pour que le reste de la ligne demeure là où le document l'avait posé.
- **Il ne peut pas retirer de mots d'une photographie, et il dit de quelles pages il s'agit.** Une page numérisée est une image. Les mots qu'elle porte sont des pixels et non du texte, et rien ici ne peut y toucher. Si le scan porte la couche de texte invisible que produit l'OCR d'un scanner, cet outil retire cette couche — c'est-à-dire ce qu'une recherche et un copier auraient trouvé — et dit clairement sur la page que l'image montre toujours les mots. Recouvrir cette image est un autre travail ; le [caviardeur d'images](https://abox.tools/fr/caviarder-une-image/) est l'outil qui écrase des pixels.
- **Le document cesse de dire d'où il vient.** Les propriétés et le paquet XMP disparaissent à chaque passage : pas de ligne de producteur, pas de date de création, pas d'auteur, pas de titre, et aucun des blocs privés qu'un logiciel de mise en page laisse derrière lui. Un fichier dont on a retiré un nom des pages et dont les propriétés annoncent toujours `Accord Martin brouillon 3.docx` n'est pas caviardé, et ce n'est pas quelque chose à laisser à une case à cocher.
- **Les fichiers chiffrés sont refusés plutôt qu'ouverts.** Un PDF protégé par mot de passe est refusé, y compris celui, produit par les scanners, dont le mot de passe est vide et qui s'ouvrirait techniquement. Retirer sa protection à un document est un autre travail que d'en retirer des mots, et le faire en silence serait une chose surprenante à faire en votre nom.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts de publicité et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur votre document : ni un fichier, ni une page, ni un nom, ni une taille, ni un nombre de pages, ni un mot que vous auriez cherché. Chaque ligne qui lit, modifie ou écrit un PDF est servie depuis cette origine et figure dans le dépôt.
- **Ce que charge le bouton de don, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et va chercher sa police chez Google Fonts. C'est un lien et rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur vos documents. Rien ne se produit tant que vous ne cliquez pas, et ce vers quoi vous cliquez alors est le site de quelqu'un d'autre.
- **Il fonctionne hors ligne.** Débranchez-vous du réseau et tout sur cette page continue de fonctionner. C'est la preuve la plus simple de toutes : un outil qui enverrait votre document ailleurs pour le caviarder s'arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/pdf-text.js` pour la façon dont chaque mot d'une page est trouvé et situé, et `src/edit.js` pour la suppression elle-même : ce qui est découpé dans les instructions de la page et ce qui y est remis pour que le reste de la ligne ne bouge pas. Aucun des deux ne peut atteindre le réseau, et le lecteur et l'écrivain d'à côté non plus.
