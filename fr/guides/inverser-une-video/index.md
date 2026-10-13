# Comment inverser une vidéo

Lire un clip à l'envers passe pour le montage le plus simple qui soit, et c'est celui pour lequel un fichier vidéo est le plus mal fait. Voici ce qui doit réellement se produire, ce que cela coûte, et la seule étape qui vaut la peine d'être faite avant.

[Ouvrir Inverseur de vidéo](https://abox.tools/fr/inverser-une-video/): La dernière image en premier, le son avec.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez l'[Inverseur de vidéo](https://abox.tools/fr/inverser-une-video/), déposez-y le clip, décidez si vous voulez le son inversé lui aussi, puis exportez. Ce qui ressort est le même clip avec sa dernière image en premier, exactement aussi long que celui qui est entré.

Contrairement au découpage, cela oblige à réécrire chaque image, et le son avec. Ce n'est pas le défaut d'un outil particulier : c'est ce qu'est une inversion. Le reste de cette page explique pourquoi, et ce que cela signifie pour votre temps d'attente.

## Pourquoi une vidéo ne peut pas simplement être lue à l'envers

Un fichier vidéo n'est pas une pile de photos. Environ une image sur cinquante est une image entière — une *image clé* — et tout ce qui se trouve entre elles est une description de ce qui a changé par rapport aux images voisines. C'est pour cela qu'une heure de vidéo tient dans un téléphone.

Cela veut dire aussi qu'un décodeur ne sait aller que vers l'avant. Pour vous montrer la dernière image d'un clip, il doit trouver l'image clé qui la précède et décoder tout ce qui les sépare. Demandez l'avant-dernière, il refait le même travail.

L'inversion se fait donc par groupes : décoder un groupe vers l'avant, garder les images, les donner à l'encodeur dans l'autre ordre, passer au groupe précédent. La solution évidente — décoder tout le clip dans une liste et parcourir la liste à rebours — demande environ 3 Mo de mémoire par image en 1080p, soit 5 Go la minute, et c'est pour cela que les outils qui procèdent ainsi s'écroulent sur tout ce qui dépasse quelques secondes.

![La carte source : le nom du plan, sa taille, la taille de son image, sa durée et son codec.](https://abox.tools/screens/reverse-a-video/source.webp)

Ce que l'outil a établi sur le fichier. L'inversion est la seule opération qui ne peut pas se faire au fil de l'eau, et ces chiffres décident donc si cela tiendra en mémoire.

## Ce qui arrive au son

C'est ici que les outils d'inversion diffèrent le plus, et là où il vaut la peine de vérifier ce que vous avez réellement obtenu.

Le son est compressé en paquets de quelques dizaines de millisecondes, chacun codé par rapport au précédent. Écrire ces paquets à l'envers ne lit *pas* une piste à rebours : cela joue de courts morceaux à l'endroit dans le mauvais ordre, ce qui sonne comme un bégaiement ou une panne, pas comme une inversion. La seule manière d'inverser correctement du son est de décoder toute la piste, de remettre les échantillons dans l'autre sens et de la réencoder.

C'est ce qui se passe ici, et c'est pourquoi le son est réencodé alors que le [Découpeur de vidéo](https://abox.tools/fr/couper-une-video/) et le [Recadreur de vidéo](https://abox.tools/fr/recadrer-une-video/) n'y touchent jamais : ces travaux-là ne changent pas *quand* les choses se produisent, et celui-ci ne change rien d'autre.

Si vous voulez l'image à l'envers et pas de son du tout — le choix habituel pour tout ce qui part dans un fil qui lit en sourdine — décochez la case. C'est plus rapide, et le fichier est plus léger.

![La carte d'export : un curseur de qualité, un interrupteur pour garder le son et un récapitulatif de la taille de sortie, de la durée et du nombre d'images.](https://abox.tools/screens/reverse-a-video/export.webp)

L'interrupteur du son est là parce qu'une parole à l'envers n'est presque jamais ce que l'on voulait, et qu'il est plus simple de trancher avant l'export qu'après.

## Ce que cela coûte à l'image

Un réencodage. Les images ressortent dans un ordre pour lequel rien dans le fichier d'origine n'avait été codé : chacune doit donc être réécrite.

Ce qu'un outil bien élevé ne fera pas, c'est dépenser *plus* que l'original. Un clip inversé contient exactement les mêmes images que celui qui est arrivé : un débit plus élevé n'a donc rien de neuf à décrire, il grossit le fichier sans améliorer l'image. Le réglage de qualité se déplace ici sous ce plafond, pas au-dessus.

Comme toujours, les étapes avec perte s'additionnent. Inverser un original, c'est une génération. Inverser l'export d'un téléchargement d'un enregistrement d'écran, c'est quatre, et cela se voit.

## Découpez d'abord, inversez ensuite

Si le clip a besoin des deux, coupez-le d'abord. Le découpage est gratuit — un bon découpeur déplace des images entières sans les décoder — et chaque seconde retirée est une seconde que personne n'aura à décoder puis réencoder.

Dans l'autre sens, vous inversez des images que vous êtes sur le point de jeter. Sur un long clip, c'est la différence entre quelques secondes de travail et plusieurs minutes. Le [guide du découpage](https://abox.tools/fr/guides/couper-une-video/) explique pourquoi cette première étape peut ne rien vous coûter en qualité.

Le même ordre vaut pour le recadrage : couper, recadrer, inverser, et vous payez un seul réencodage du clip le plus court possible.

## À quoi cela sert vraiment

- **Le gag du rembobinage.** Quelque chose tombe, se casse ou éclabousse, et l'inversion le remet en place. Cela se lit comme une blague parce qu'un vrai plan joué à l'envers est immanquable : la fumée se rassemble, l'eau remonte.
- **Des boomerangs faits à la main.** Inversez un court clip et collez-le à l'original avec le [Découpeur de vidéo](https://abox.tools/fr/couper-une-video/) : vous obtenez la boucle aller-retour sans l'application qui la fabrique d'habitude, et à votre durée plutôt qu'à la sienne.
- **Les révélations.** Filmez l'état final bien rangé et inversez-le : une assiette terminée redevient des ingrédients, un objet assemblé se démonte. C'est plus facile à filmer que la version à l'endroit, et c'est bien l'intérêt.
- **La parole à l'envers.** Qui n'a d'intérêt que si le son est vraiment inversé — voir plus haut.

## Formats, et durée

**MP4, M4V et MOV** sont lus directement, quoi qu'ils contiennent — H.264, HEVC, AV1 ou VP9 — tant que votre navigateur sait décoder ce codec. C'est la voie rapide : le fichier est parcouru à rebours, un groupe d'images à la fois, aussi vite que va votre machine.

**Tout ce que votre navigateur sait lire par ailleurs**, WebM en tête, est inversé en faisant reculer pas à pas le lecteur du navigateur dans le clip, un instant après l'autre. Cela marche, et c'est plus lent, parce que chacun de ces sauts oblige le navigateur à décoder depuis l'image clé qui précède. La page indique laquelle des deux voies elle emprunte, et pourquoi, avant que vous ne commenciez.

**AVI, WMV, FLV et la plupart des MKV**, le navigateur ne sait ni les lire ni les jouer, et l'outil les refuse avec un message plutôt que d'échouer à mi-parcours.

Dans les deux cas, c'est l'un des travaux les plus lents de ce site, puisque chaque image est décodée puis encodée et que certaines sont décodées plus d'une fois. Un clip court, ce sont des secondes ; un long clip en 4K, c'est de ceux qu'on lance et qu'on laisse tranquilles.

## Pourquoi cela n'a pas besoin d'un envoi

Décoder et réencoder de la vidéo dans un navigateur est récent, et c'est réel : WebCodecs expose le même encodeur matériel que votre téléphone utilise pour filmer, et il est rapide pour la même raison. Le travail se fait sur la machine qui a déjà le fichier, ce qui, pour une grosse vidéo, est de toute façon la seule organisation sensée : l'envoyer et retélécharger le résultat coûte plus de temps que l'encodage lui-même.

L'outil ici n'a aucune fonction réseau, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter, dont aucune ne nous appartient. Coupez la connexion et inversez un clip quand même, si vous préférez vérifier plutôt qu'être cru sur parole.

[Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) propose trois autres vérifications à faire sur n'importe quel outil.
