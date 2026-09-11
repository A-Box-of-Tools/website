# Comment faire une vidéo boomerang

Un boomerang est un clip qui joue en avant, puis en arrière, et qui boucle. Aucun outil ici n'a de bouton boomerang ; il naît de trois outils qui font chacun leur travail — couper, inverser, joindre — et toute la chaîne tourne sur votre propre machine.

Dernière mise à jour 26 août 2026

## La réponse courte

1. **Coupez le moment.** Ouvrez le [Découpeur vidéo](https://abox.tools/fr/couper-une-video/), marquez la seconde ou les deux secondes qui doivent balancer, et exportez-les comme clip à part.
2. **Inversez une copie.** Déposez ce clip dans l'[Inverseur vidéo](https://abox.tools/fr/inverser-une-video/), laissez le son de côté, et exportez. Vous avez maintenant le même moment deux fois, une fois dans chaque sens.
3. **Joignez les deux.** De retour dans le Découpeur vidéo, déposez les deux fichiers, marquez chacun en entier, placez la version à l'endroit en premier, et exportez un seul fichier.

Aucune étape n'exige de téléchargement intermédiaire : après chaque export, une ligne sous le bouton de téléchargement propose de poursuivre avec le résultat dans l'outil suivant — l'inverseur après la première coupe, le découpeur à nouveau après l'inversion — et le fichier y arrive déjà chargé.

Ce fichier est le boomerang. Postez-le tel quel partout où la vidéo muette boucle, ou passez-le par le convertisseur [Vidéo en GIF](https://abox.tools/fr/video-en-gif/) si la destination n'anime que des GIF. Chaque étape se déroule dans votre navigateur ; rien de cette chaîne n'est envoyé, à aucun moment, à personne.

## Pourquoi couper d'abord

Inverser doit décoder et réencoder chaque image touchée — le [guide de l'inversion](https://abox.tools/fr/guides/inverser-une-video/) explique pourquoi il n'y a pas moins cher. Couper, en revanche, est presque gratuit : le découpeur fait passer les images entières sans les réencoder.

L'ordre est donc tout le secret. Inversez un clip de deux secondes et l'étape coûteuse travaille sur deux secondes ; inversez l'original et elle travaille sur tout, dont vous allez jeter presque tout. Sur un enregistrement de téléphone d'une longueur quelconque, couper d'abord fait la différence entre un boomerang en moins d'une minute et une barre de progression derrière laquelle vous attendez.

Coupez serré. Un boomerang se lit le mieux quand il balance sur un seul mouvement — un saut, une éclaboussure, un demi-tour — et chaque image gardée se paie deux fois, une par sens.

![Le découpeur vidéo avec un segment marqué entre trois et cinq virgule six secondes, et un tableau donnant le début, la fin et la durée.](https://abox.tools/screens/make-a-boomerang-video/section.webp)

Une seconde ou deux, c'est tout ce qu'est un boomerang. Découper d'abord est ce qui garde l'inversion peu coûteuse, et c'est dans le tableau que la durée se décide.

## Quoi faire du son

Laissez-le de côté, et faites-le à l'étape de l'inversion — l'inverseur a une case exactement pour cela. Le son d'un boomerang jouerait à l'endroit, puis à l'envers ; un son inversé est étrange sans équivoque, et presque tous les endroits où finit un boomerang le jouent muet de toute façon. Sans le son, l'inversion va aussi plus vite et les deux fichiers sont plus petits.

Si vous le gardez, le découpeur joindra quand même les deux clips — mais la couture que l'œil pardonne, l'oreille ne la pardonne pas.

## La jonction, et ce que le découpeur vous dira

Les deux fichiers joints sont proches parents — l'un a été fait de l'autre — mais ils sont passés par des encodeurs différents et peuvent ne pas s'accorder octet pour octet sur leur format. Le découpeur vérifie. Là où les deux s'accordent, il copie les images telles quelles ; là où ils diffèrent, il réencode, une fois, et le dit sur le panneau d'export plutôt que de vous laisser deviner.

Ordonnez les parties avant d'exporter : l'endroit d'abord, l'envers ensuite. Un boomerang qui commence par le retour se lit comme une erreur.

Un raffinement qui vaut ses dix secondes : rognez une image au début du clip inversé avant la jonction. La dernière image de l'aller et la première du retour sont la même, et la montrer deux fois fait hésiter le virage un instant.

![L'outil d'inversion : un récapitulatif donnant la taille de sortie, la durée et le nombre d'images, avec un interrupteur pour garder le son.](https://abox.tools/screens/make-a-boomerang-video/reverse.webp)

La seconde moitié. L'interrupteur du son compte ici plus que partout ailleurs, pour la raison que donne la section du dessus.

## Vidéo ou GIF à la fin

Gardez le MP4 si la destination joue la vidéo — il est bien plus petit, bien plus net, et boucle tout aussi bien. Ne convertissez en GIF que si l'endroit l'exige, et surveillez alors le compteur : un GIF paie chaque image, et un boomerang est son clip en double. Le [guide du GIF partiel](https://abox.tools/fr/guides/gif-a-partir-d-un-extrait-video/) couvre les leviers de largeur et de cadence qui le gardent sous une limite de taille.

## Si vous faites cela chaque semaine

Trois pages pour un effet, c'est voulu — chaque outil fait un travail, et chaque page peut prouver seule que vos images ne quittent jamais la machine. Mais les trois sont libres : licence MIT, un dossier par outil, des modules ES sans dépendances sous `src/`, avec des README qui les expliquent.

Si les boomerangs font régulièrement partie de votre travail, pointez un agent de code vers le [dépôt](https://github.com/A-Box-of-Tools/website) et demandez-lui de plier la marche des images de l'inverseur et la jonction du découpeur en une page à un seul bouton. Les modules ont été écrits pour être lus, et les emporter est exactement ce à quoi sert la licence.
