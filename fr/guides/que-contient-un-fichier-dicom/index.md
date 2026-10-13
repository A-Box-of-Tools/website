# Que contient un fichier DICOM ?

Plus que l'examen. Un fichier DICOM est un dossier médical avec une image dedans : votre nom, votre date de naissance et votre numéro d'hôpital voyagent dans le même fichier que les pixels — ce qui compte le plus à l'instant précis où l'on vous tend un CD et où vous partez chercher une visionneuse.

Dernière mise à jour 26 août 2026

## La réponse courte

Un fichier DICOM — le `.dcm` du CD qu'un hôpital vous remet — n'est pas un format d'image comme le JPEG. C'est un format de dossier médical avec une image dedans. Avant que les pixels ne commencent, le fichier porte un en-tête de centaines d'étiquettes, et parmi elles, couramment : le nom complet du patient, sa date de naissance, son sexe et son numéro d'hôpital ; la date, l'heure et la description de l'examen ; le médecin prescripteur ; l'établissement et l'appareil, jusqu'au numéro de série ; et un jeu d'identifiants uniques qui font office de clés vers l'archive qui les a produits.

Rien de tout cela ne s'affiche quand l'image est à l'écran, et c'est exactement ainsi qu'on l'oublie. L'examen est le dossier. Traitez le fichier comme le document qu'il est, pas comme l'image qu'il contient.

## Pourquoi ce fichier se téléverse si négligemment

Le piège en pratique : après un examen, on vous remet un disque ou un téléchargement, vous essayez de l'ouvrir, et rien sur la machine ne veut — DICOM n'est pas un format que les logiciels ordinaires parlent. Alors on cherche « ouvrir fichier dcm en ligne », et l'essentiel de ce qu'on trouve est une case de téléversement. Quelques instants plus tard, un dossier médical complet et identifié — nom, date de naissance, numéros d'hôpital, descriptions d'examen à teneur de diagnostic et tout — est sur le serveur de qui s'est bien classé ce jour-là.

Remarquez la silhouette : c'est le problème de la pièce d'identité qui recommence — un fichier sensible, un moment de friction, un moteur de recherche — mais avec un fichier sensible au second degré. Un passeport dit qui vous êtes ; un examen dit qui vous êtes *et ce qu'on cherchait*. L'argument général sur les téléversements a [sa propre page](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) ; voici le fichier pour lequel il n'a besoin d'aucun assaisonnement.

Ouvrir le fichier en local est tout le remède, et c'est à cela que sert la [visionneuse DICOM](https://abox.tools/fr/visionneuse-dicom/) d'ici : l'examen, un vrai réglage de fenêtrage, un dossier rempilé en sa série, des mesures en millimètres, chaque étiquette de l'en-tête lisible — et rien ne quitte votre machine. Le pas à pas est dans [le guide pour l'ouvrir](https://abox.tools/fr/guides/ouvrir-un-fichier-dicom/).

## « J'ai enlevé le nom » n'est pas de la dé-identification

L'erreur suivante est plus fine et mieux intentionnée : partager un examen — avec un service de second avis, un chercheur, un forum — après avoir effacé l'étiquette évidente. Le standard lui-même est brutal sur l'insuffisance de la chose. Le profil de dé-identification propre à DICOM liste les étiquettes à traiter avant qu'un jeu de données puisse se dire dé-identifié, et il court sur des *centaines* d'entrées, parce que l'identité se loge à plus d'endroits que le champ du nom :

- **Des identifiants directs au-delà du nom** — date de naissance, identifiant patient, numéro de dossier, les noms du médecin et de l'établissement.
- **Des clés** — les identifiants uniques estampillés dans chaque fichier : ils ne disent pas qui vous êtes, mais exactement *quel dossier vous êtes*, pour tout système qui a vu l'original.
- **Des quasi-identifiants** — date et heure de l'examen, modèle et numéro de série de l'appareil, région du corps, âge du patient : vagues un à un, étroits ensemble.
- **Les pixels eux-mêmes** — l'échographie et d'autres modalités gravent le nom du patient droit dans l'image, là où aucune retouche d'étiquettes n'atteint. (Pour une image exportée, c'est l'affaire d'un [caviardage au niveau des pixels](https://abox.tools/fr/caviarder-une-image/), pas d'un outil de métadonnées.)

Voilà pourquoi la visionneuse d'ici a un panneau qui liste exactement ce qui, dans votre fichier, identifie le patient, et à quel degré — bâti sur la liste du standard lui-même. Et voilà pourquoi la visionneuse ne fait que *lire* : elle ne contient aucun code qui écrive un fichier DICOM, parce qu'« anonymisé » est une promesse dont la barre est bien plus haute que celle qu'une visionneuse franchit — et un outil qui la tiendrait à moitié serait pire qu'un outil qui ne la fait jamais.

## Manier un examen comme le dossier qu'il est

Les habitudes découlent de tout ce qui précède :

- **Regardez-le en local.** Une visionneuse qui marche wifi coupé — celle-ci le fait — a prouvé où le travail se passe. La visionneuse fournie sur le disque, si elle tourne sur votre machine, convient aussi.
- **Partagez par les canaux médicaux quand le contenu est l'enjeu.** Envoyer une étude à un autre hôpital est un problème résolu, avec une infrastructure qui rend des comptes ; un courriel personnel avec un `.zip` de fichiers `.dcm` est une copie de votre dossier dans des serveurs de messagerie, indéfiniment.
- **Si vous devez partager un fichier, sachez d'abord ce qu'il y a dedans.** Lisez l'en-tête et le panneau d'identité, pour que ce que vous transmettez soit une décision plutôt qu'une surprise — et considérez la dé-identification en règle comme un service que votre centre d'imagerie vous doit sur demande, pas comme une case que vous improvisez.
- **Le disque survit à la démarche.** La copie du dossier de téléchargements et le CD dans le tiroir sont eux aussi des dossiers complets, comme le scan de pièce d'identité que personne ne se souvient d'avoir effacé.

Rien de tout cela ne dit de ne jamais partager un examen — les seconds avis sont la raison d'être des copies. Cela dit : le fichier est un document sur vous, et les deux questions auxquelles tout ce groupe de guides revient sans cesse sont ici aussi les bonnes — à qui le remet-on, et cette remise devait-elle seulement avoir lieu.
