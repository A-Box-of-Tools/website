# Peut-on récupérer un texte caviardé ?

Désagréablement souvent, oui — avec l'outil de sélection de texte, pas avec un laboratoire. La plupart des rectangles noirs sont dessinés *par-dessus* les mots et enregistrés à côté d'eux, et les mots voyagent dessous. Cette page est le catalogue des façons dont cela arrive, et de ce que retirer doit vouloir dire à la place.

Dernière mise à jour 26 août 2026

## La réponse courte

Désagréablement souvent, oui. Pas par des moyens d'expert : en sélectionnant la zone noircie et en appuyant sur copier. La plupart des outils vers lesquels on se tourne quand quelque chose doit être caché dessinent un rectangle *par-dessus* le contenu et l'enregistrent *à côté* de lui, et tout ce qui est dessous voyage dans le fichier, patiemment, jusqu'à ce que quelqu'un regarde.

Ce n'est pas une erreur rare commise par des gens négligents. Elle a publié des noms tirés de dossiers judiciaires, des chiffres non caviardés de rapports officiels — et, dans une publication massive de pièces de dossier en décembre 2025, des noms noircis qui se lisaient au bout de quelques heures. Les gens derrière ces erreurs avaient des avocats et des procédures. Ce qu'ils n'avaient pas, c'est la distinction dont parle cette page : la différence entre couvrir et retirer.

## Le rectangle qui est un objet

Dans un lecteur PDF, un traitement de texte, un logiciel de présentation ou un éditeur d'images à calques, un rectangle noir dessiné n'est pas de la peinture. C'est un *objet* — une forme avec une position, une taille et une couleur, rangée dans le fichier comme une chose à part, devant un texte toujours entièrement présent. Le document ne dit pas « ce mot a disparu » ; il dit « ce mot est là, et un rectangle est devant ».

Tout découle de là. Sélectionnez la zone et copiez, et le presse-papiers reçoit le texte, parce que copier lit la couche de texte et ignore la décoration devant. Ouvrez le fichier dans un éditeur et le rectangle se déplace, tout simplement. Exportez vers un autre format et les couches peuvent être aplaties dans un autre ordre. À l'écran, la boîte est identique à un vrai caviardage, et c'est exactement pourquoi l'erreur survit aux relectures : l'œil vérifie la page, et la page a l'air correcte.

Le PDF ajoute une variante plus discrète. Un PDF peut déclarer qu'une suite de glyphes « épelle » autre chose que ce qui est dessiné — une fonction d'accessibilité nommée `/ActualText` — et copier lit la déclaration plutôt que l'encre. Un document peut donc laisser fuir un mot qui n'est même pas visible sur la page.

## Le flou qui est de l'arithmétique

La pixellisation paraît plus sûre qu'elle ne l'est. Une mosaïque est une grille de moyennes, et une moyenne est une *mesure* de ce qu'il y avait dessous — petite et avec perte, mais une mesure quand même. Pour du texte dans une police connue à une taille prévisible, cela a suffi à le relire : prendre chaque chaîne plausible, la rendre, la pixelliser de la même façon, et garder la candidate dont la mosaïque correspond. Rien là-dedans n'exige un laboratoire ; c'est une boucle et une comparaison.

Le flou est pire en principe. Un flou est une convolution — chaque pixel de sortie, une moyenne pondérée de ses voisins — et les convolutions se remontent assez bien, assez souvent, pour que la déconvolution soit un outil standard de la photographie plutôt qu'une attaque exotique. Les deux effets partagent aussi un défaut qui n'a rien de mathématique : ils annoncent que quelque chose est caché, et à peu près sa longueur — ce qui, pour un mot de passe de six caractères, est déjà un indice.

Un aplat n'a aucune de ces propriétés. Une seule couleur, bord à bord, ne transporte la mesure de rien. C'est pourquoi c'est le réglage par défaut de l'outil pour [caviarder une image](https://abox.tools/fr/caviarder-une-image/) ici, pourquoi ses options pixelliser et flouter disent sur leur propre étiquette ce qu'elles ne promettent pas, et pourquoi son réglage de force annonce un nombre plutôt qu'un adjectif.

## Les copies qu'un fichier garde de son passé

La troisième famille d'échecs n'a rien à voir avec le recouvrement. Les fichiers se souviennent, de façons que rien à l'écran ne montre :

- **Les métadonnées d'une photo incluent souvent une miniature** de l'image telle qu'elle était avant la retouche. Recadrez votre adresse hors d'une photo, et le bloc EXIF peut encore contenir l'original non recadré en réduction. Le [lecteur-suppresseur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) montre ce bloc et le retire ; il y a [un guide](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/).
- **Certains éditeurs enregistrent sur place sans tronquer.** Une célèbre paire de bogues de 2023 — dans l'outil d'annotation de captures d'un téléphone et l'outil de capture d'un système de bureau — laissait les octets de l'image d'origine dans le fichier après recadrage, si bien que la partie « coupée » se reconstruisait à partir des restes.
- **Les PDF peuvent transporter leur propre histoire.** Un PDF modifié par enregistrements incrémentaux ajoute ses changements à la fin du fichier et y laisse la version antérieure intacte, suppressions comprises.

Le fil conducteur : ce qu'un lecteur affiche et ce qu'un fichier contient sont deux questions différentes, et un caviardage vérifié seulement à l'œil n'a répondu qu'à la première.

## Ce que retirer exige vraiment

Un vrai caviardage change les données, pas l'affichage, et il se vérifie par le chemin même par lequel il peut échouer : en interrogeant le fichier, pas l'écran.

Pour une image, cela veut dire que les pixels sous la boîte cessent d'exister avant qu'un fichier soit écrit. C'est exactement ce que fait l'outil pour [caviarder une image](https://abox.tools/fr/caviarder-une-image/) — les valeurs couvertes sont réécrites en mémoire et seulement ensuite confiées à l'encodeur, si bien que la sortie contient des pixels noirs là où était le contenu, pas de l'encre noire devant. La version pas à pas est dans [le guide du caviardage d'image](https://abox.tools/fr/guides/caviarder-une-image/).

Pour un PDF, cela veut dire que les glyphes sont supprimés des instructions qui dessinent la page, avec les porteurs cachés — déclarations `/ActualText`, signets, commentaires, champs de formulaire. C'est ce que fait l'outil pour [caviarder un PDF](https://abox.tools/fr/caviarder-un-pdf/), qui fait ensuite la chose la plus importante : il rouvre sa propre sortie et y cherche les mots retirés, et **si quoi que ce soit a survécu, il n'y a pas de téléchargement**. La visite guidée est dans [le guide du caviardage de PDF](https://abox.tools/fr/guides/caviarder-un-pdf/).

Et quel que soit l'outil, où que ce soit, le test de réception vous appartient : sélectionnez par-dessus la zone caviardée et copiez ; cherchez le mot retiré dans le fichier ; ouvrez-le dans un autre lecteur. Si le contenu a été retiré, rien ne peut le trouver — et savoir si un outil fait cela dans votre navigateur, sans que votre fichier quitte la machine, est aussi une affirmation qui se vérifie au lieu de se croire : [le guide sur l'envoi de fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) montre comment. Le caviardage est le seul travail où le fichier est sensible par définition, ce qui en fait le dernier qui devrait transiter par le serveur d'un inconnu.
