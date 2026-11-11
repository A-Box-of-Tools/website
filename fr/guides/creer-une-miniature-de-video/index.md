# Comment créer une miniature de vidéo depuis l'image exacte

La différence entre une miniature et une capture d'écran tient à un quart de seconde — l'image où les yeux sont ouverts et où le ballon est encore en l'air. Obtenir cette image, à la taille de la plateforme, sous sa limite d'octets, est une chaîne de trois pas qui tourne entièrement dans votre navigateur.

Dernière mise à jour 13 octobre 2026

## La réponse courte

1. **Prendre l'image.** Ouvrez l'[Extracteur d'images](https://abox.tools/fr/extraire-une-image-d-une-video/), déposez la vidéo, et avancez dans la liste d'images du fichier lui-même jusqu'à l'instant exact. Enregistrez en PNG — la copie sans perte, pour que rien ne soit encore décidé.
2. **Cadrez l'image.** Passez le PNG au [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/) : recadrez à la forme de la plateforme et choisissez des dimensions adaptées. YouTube recommande actuellement 16:9 pour les vidéos et 9:16 pour Shorts ; les détails ci-dessous les distinguent.
3. **Respectez le plafond.** Terminez dans le [Compresseur d'images](https://abox.tools/fr/compresser-une-image/) avec la limite actuelle et une marge dessous. Choisissez JPEG pour une miniature photographique YouTube ; ne laissez pas Auto si JPG ou PNG est exigé.

Rien dans la chaîne n'envoie quoi que ce soit — ce qui compte quand la vidéo n'est pas publiée, et une miniature se fabrique précisément parce que la vidéo n'est pas encore publique.

## Une couverture lisible à sa taille réelle

Choisissez un cadre qui annonce le contenu : objet fini, personne qui relève les yeux ou instant avant l'action. Gardez les légendes source lisibles en petit aperçu. Ces outils capturent, recadrent et compressent ; ajouter un titre ou une illustration exige un éditeur d'image entre capture PNG et compression finale.

Pour une vidéo web, la même image peut servir d'affiche avant lecture. Adaptez forme et taille au lecteur et vérifiez qu'elle explique encore le clip sur téléphone. Une couverture de présentation est aussi utile : testez le vrai layout de diapositive plutôt que de supposer que le public voit le PNG en grand.

## Pourquoi avancer image par image bat la pause

Mettre un lecteur en pause et capturer l'écran perd deux fois. La pause tombe là où le lecteur a pu s'arrêter — l'endroit le plus proche, pas l'image que vous vouliez — et la capture est une photo du lecteur : sa résolution, son habillage, son traitement des couleurs, pas ceux du fichier.

L'extracteur parcourt au contraire la liste d'images du fichier lui-même, une image à la fois dans les deux sens, et vous tend l'image décodée elle-même, à la pleine résolution de la vidéo. Un quart de seconde de recherche de part et d'autre du moment est en général là où vit la miniature — l'image *entre* les deux évidentes, où le mouvement se lit sans que rien soit flou.

Enregistrez la capture en PNG même si la miniature finale sera JPEG. Le PNG garde l'image dessinée sans autre encodage avec perte ; la décision de compression se fait une seule fois à la fin, dans un budget d'octets, plutôt que deux fois avec pertes cumulées.

![Une image fixe tirée d'une vidéo avec le code temporel visible, à côté des commandes pas à pas et de défilement et de l'instant exact d'où elle vient.](https://abox.tools/screens/make-a-video-thumbnail/frame.webp)

Avancer jusqu'à l'image plutôt que mettre en pause et faire une capture. La section du dessus dit en quoi consiste vraiment la différence.

## L'arithmétique de la plateforme

Recadrez avant compression comme l'explique le [guide photo](https://abox.tools/fr/guides/preparer-des-photos-pour-le-web/) : les pixels sont le budget. Un export 16:9 de ⁦1280×720⁩ est un petit exemple utile, pas la recommandation actuelle de YouTube. Ses [instructions de miniature](https://support.google.com/youtube/answer/72431?hl=en) recommandent maintenant ⁦3840×2160⁩ pour vidéos et ⁦2160×3840⁩ pour Shorts, avec JPG ou PNG comme exemples acceptés. Les envois sur ordinateur permettent 50 Mo ; les miniatures vidéo mobiles doivent rester sous 2 Mo. Vérifiez votre mode d'envoi et n'agrandissez pas une petite source pour atteindre un nombre recommandé. Les envois personnalisés exigent un compte vérifié ; ceux de Shorts utilisent actuellement YouTube Studio sur ordinateur.

Le cadre verrouille 16:9 ou 9:16 : on déplace au lieu de calculer. Placez texte et visages dans les deux tiers centraux, car les fils arrondissent les angles et superposent la durée en bas à droite.

![Le redimensionneur avec une largeur de 1280 et une hauteur de 720 saisies, et un récapitulatif de ce que donnera l'image.](https://abox.tools/screens/make-a-video-thumbnail/size.webp)

Un exemple d'export de 1280 par 720. Choisissez selon les exigences actuelles de la destination et les détails réellement présents dans la source.

## Une planche-contact, quand le moment se dérobe

Quand le bon instant se cache quelque part dans dix minutes d'images, l'autre mode de l'extracteur enregistre une image toutes les N secondes et rend le tout en ZIP. Parcourez les images comme une planche-contact, notez l'heure de la plus proche, et avancez à partir de là. C'est plus rapide que de frotter la barre, et il en reste un dossier de candidates pour le jour où la plateforme demandera un autre format.

## Si vous faites cela chaque semaine

Les étapes vivent ici sur trois pages, à dessein — chaque page fait un travail, et chacune peut prouver seule que rien ne quitte votre machine. Mais chaque étape est libre : licence MIT, un dossier par outil, des modules ES sans dépendances, avec des README qui expliquent le décodeur, le rééchantillonnage et la recherche de la cible d'octets.

Si les miniatures sont un livrable hebdomadaire, pointez un agent de code vers le [dépôt](https://github.com/A-Box-of-Tools/website) et demandez-lui la version en une page : avancer, recadrer au gabarit de votre plateforme, compresser à son plafond, un bouton. Les modules ont été écrits pour être lus, et les emporter est exactement ce à quoi sert la licence.
