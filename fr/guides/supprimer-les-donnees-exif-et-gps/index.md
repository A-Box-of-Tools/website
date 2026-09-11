# Ce qu'une photo raconte sur vous, et comment le retirer

Une image sortie tout droit d'un téléphone porte typiquement les coordonnées du lieu où elle a été prise, l'heure à la seconde, et assez de choses sur l'appareil pour la relier à toutes les autres photos du même téléphone. Rien de tout cela n'est visible à l'écran. Voici ce qu'il y a dedans et comment le supprimer.

[Ouvrir Lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/): Voyez ce qu'une photo raconte sur vous. Puis retirez-le.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/), déposez-y les photos, et appuyez sur « Tout supprimer ». Chaque étiquette, les blocs XMP et IPTC, les commentaires et la vignette incorporée partent, sur toutes les photos de la liste d'un coup. L'image elle-même n'est pas touchée : ni recompressée, ni décodée, ni changée d'un seul pixel.

Avant de le faire, cela vaut la peine de regarder ce qu'il y avait dedans. C'est en général plus que ce que les gens imaginent, et cette liste est l'argument même en faveur de l'opération.

## Ce qu'il y a réellement dans une photo

Un JPEG n'est pas seulement une image compressée. C'est un conteneur, et à côté de l'image se trouvent plusieurs blocs d'informations que votre appareil, votre téléphone ou votre logiciel de retouche y ont écrits.

- **L'EXIF.** Le principal. Marque et modèle de l'appareil, objectif, réglages d'exposition, ISO, date et heure à la seconde, orientation dans laquelle l'image doit être montrée, et, sur un téléphone dont la localisation est active pour l'appareil photo, une position GPS précise à quelques mètres. Souvent aussi un numéro de série de boîtier.
- **Le GPS.** Techniquement une partie de l'EXIF, et qui vaut d'être nommée à part parce que c'est celle qui compte le plus. Elle est écrite en degrés, minutes et secondes, format qui réussit très bien à ne pas ressembler à une adresse.
- **Le XMP.** Un paquet de XML qu'écrivent les logiciels de retouche. Il peut porter votre nom, votre logiciel, des notes, des mots-clés, un historique de modifications, et une copie de certains champs EXIF, et c'est pourquoi supprimer l'EXIF seul ne suffit pas.
- **L'IPTC.** Un bloc plus ancien de champs de légende, de signature, de crédit et de copyright, utilisé dans la presse et la photo de stock.
- **La vignette incorporée.** Une petite deuxième copie de l'image. Elle est produite au moment de l'écriture du fichier, et elle n'est pas toujours refaite quand l'image est modifiée : c'est ainsi qu'une photo recadrée peut voyager avec une vignette de ce qui a été coupé.
- **La note de fabricant.** Un bloc de données non documenté. Personne en dehors du fabricant ne sait tout ce qu'il contient.

![L'inspecteur : la vignette d'une photo à côté d'une liste de ce qui a été trouvé dedans, dont la marque et le modèle de l'appareil, la date de prise de vue et des coordonnées GPS.](https://abox.tools/screens/remove-exif-and-gps-data/inside.webp)

Ce qu'une photo de téléphone transporte réellement. La plupart des gens n'ont jamais regardé, et c'est la raison d'être de ce guide.

## Qui le voit réellement

C'est la partie où il vaut la peine d'être exact, parce que la version alarmiste et la version dédaigneuse sont fausses toutes les deux.

**La plupart des grands réseaux sociaux effacent les métadonnées quand vous publiez.** Facebook, Instagram et X réencodent les images envoyées et jettent les étiquettes au passage. Ce n'est pas une gentillesse, puisqu'ils gardent les données de leur côté, mais cela veut bien dire qu'une photo publiée sur ces services ne remet pas ses coordonnées à chaque personne qui la regarde.

**Presque tout le reste les conserve.** Une pièce jointe de courriel. Un fichier envoyé sur la plupart des messageries comme « document » plutôt que comme photo. Une image sur un forum, une annonce de petites annonces, un site personnel, un disque partagé, un rapport de bug, un ticket de support. Dans tous ces cas le fichier arrive intact, et quiconque le télécharge peut en lire les étiquettes avec des outils livrés avec son système d'exploitation.

Les risques réalistes sont banals plutôt que spectaculaires : une annonce photographiée à la maison, une photo d'enfant prise dans son école, un compte apparemment anonyme qui publie des photos partageant toutes le même numéro de série d'appareil, un « pris la semaine dernière » qui a été pris en mars.

## Pourquoi ne pas simplement réenregistrer ?

Réenregistrer une photo dans un logiciel de retouche ou un compresseur supprime bien les métadonnées, puisque l'image est décodée en pixels puis réencodée et qu'un canvas rempli de pixels ne porte aucune étiquette. Cela fonctionne, et cela vous coûte de la qualité, parce que ce réencodage est avec perte.

Supprimer les métadonnées proprement ne coûte rien du tout. Les étiquettes se trouvent dans le conteneur *autour* de l'image compressée, pas dedans : les retirer, c'est effacer des entrées d'une liste et réécrire la liste. Les données d'image compressées sont recopiées octet pour octet et le résultat décode exactement les mêmes pixels. C'est là toute la raison d'utiliser un outil de métadonnées plutôt qu'un convertisseur.

L'exception est le cas où vous alliez réencoder de toute façon. Si vous compressez ou redimensionnez déjà la photo, les étiquettes partent par effet de bord et vous n'avez pas besoin d'une seconde étape.

## La seule chose à garder : l'orientation

Les téléphones ne font pas pivoter l'image quand vous tournez le téléphone. Ils l'enregistrent telle que le capteur l'a vue et ajoutent une étiquette d'orientation qui dit comment la tourner pour l'affichage. Retirez toutes les étiquettes et certaines visionneuses montreront votre photo couchée.

C'est pourquoi l'outil d'ici a une option « garder l'étiquette d'orientation », active par défaut. Elle réécrit un minuscule bloc EXIF contenant cette seule étiquette et rien d'autre, et seulement pour les photos qui en avaient réellement besoin. Le GPS, les horodatages, le numéro de série et le reste ont toujours disparu.

Décochez-la si vous préférez que le fichier ne porte plus le moindre EXIF, et vérifiez alors le résultat avant de l'envoyer, parce qu'une photo couchée est le dénouement habituel.

![La carte de nettoyage : un bouton pour tout retirer, avec des interrupteurs pour garder l'étiquette d'orientation et le profil de couleur.](https://abox.tools/screens/remove-exif-and-gps-data/strip.webp)

Tout retirer, sauf les deux choses qui valent d'être gardées. L'orientation est celle dont le départ couche la moitié d'une série sur le côté.

## Modifier au lieu de supprimer

Tout supprimer est la bonne réponse pour la plupart des gens. Parfois non : un photographe peut vouloir garder la ligne de copyright et les réglages de l'appareil et n'effacer que le lieu ; un archiviste peut avoir besoin de corriger une date fausse parce que l'horloge de l'appareil l'était.

Les deux sont possibles. Le lieu peut être supprimé seul, et les étiquettes de texte, les dates, l'ISO, l'orientation et la résolution peuvent être modifiés sur place.

Une réserve qui vaut pour tous les outils qui font cela, pas seulement pour celui-ci : écrire le fichier reconstruit le bloc EXIF, or une note de fabricant contient des décalages vers le bloc *d'origine*. Une note reconstruite peut donc ne plus être lisible par le logiciel du fabricant. Si cela compte, supprimez la note de fabricant ou laissez le fichier tel quel.

## Les formats, et ceux qui ne se traitent pas ainsi

Le JPEG, le PNG et le WebP peuvent tous être réécrits proprement, et ce sont les trois que prend en charge l'outil d'ici.

Le HEIC, ce qu'un iPhone enregistre par défaut, et l'AVIF sont des formats à boîtes faits d'atomes imbriqués, qui demandent un tout autre analyseur. L'outil les reconnaît et le dit plutôt que de produire un fichier cassé. Si vous avez un HEIC, le convertir en JPEG supprimera les métadonnées par effet de bord de la conversion.

Un TIFF nu n'est pas pris en charge non plus, et pour une raison plus intéressante : dans un TIFF, les métadonnées et les données de pixels sont adressées par les mêmes décalages, si bien que retirer des étiquettes revient à réécrire l'adressage de l'image elle-même. C'est faisable, et c'est un autre travail.

## Une habitude qui vaut la peine

Vérifiez avant de publier plutôt qu'après. Lire les étiquettes prend quelques secondes, et la liste des trouvailles nomme d'abord ce qui vaut d'être su, à savoir la position, les horodatages et les numéros de série, avant le tableau complet de toutes les étiquettes : vous n'avez donc pas besoin de savoir quoi chercher.

La position est d'abord montrée en degrés décimaux, exprès. « 51 degrés, 30 minutes, 26 secondes » ne rend pas évident qu'une photo nomme le bâtiment où elle a été prise. Une paire de décimaux que vous pouvez coller dans une carte, si.

## N'envoyez pas la photo pour savoir ce qu'il y a dedans

Il y a une ironie particulière dans la façon dont ce problème se résout d'habitude : quelqu'un qui s'inquiète de ce que révèle sa photo l'envoie à un site web pour le savoir. Le site a maintenant la photo, les coordonnées, l'horodatage et le numéro de série, plus une copie de l'image sur un disque qui lui appartient.

Il n'y a aucune raison à cela. Lire et réécrire le conteneur autour d'un JPEG représente quelques centaines de lignes d'analyse qu'un navigateur exécute parfaitement, et c'est pourquoi l'outil d'ici n'a aucune fonction réseau : pas de `fetch`, pas de `XMLHttpRequest`, rien qui puisse envoyer un fichier même si quelque chose essayait. Chargez-le une fois, coupez la connexion, et il continue de fonctionner.

[Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) expose comment vérifier cette affirmation, sur ce site comme sur n'importe quel autre, et c'est le type de fichier pour lequel cela vaut le plus la peine de vérifier.
