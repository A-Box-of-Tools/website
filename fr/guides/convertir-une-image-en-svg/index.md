# Comment vectoriser une image en SVG

Un PNG agrandi est un escalier. Un SVG est une instruction de dessin, donc net à toute taille — et transformer l'un en l'autre s'appelle vectoriser. Cela marche à merveille sur les formes et mal sur les photographies, et la différence vaut d'être comprise avant de commencer.

[Ouvrir Image en SVG](https://abox.tools/fr/convertir-image-en-svg/): Une forme, un contour. Pointez ce qui ne devrait pas y être.

Dernière mise à jour 31 août 2026

## La réponse courte

Ouvrez [Image en SVG](https://abox.tools/fr/convertir-image-en-svg/), déposez l'image et regardez la ligne rouge. Cette ligne est le contour tel qu'il est, dessiné par-dessus les pixels dont il vient. Si elle suit la forme, prenez le fichier. Si quelque chose s'y trouve qui ne devrait pas y être — une tache, une agrafe, une légende, une ombre —, cliquez dessus et cela disparaît.

Tout ce qui suit tient aux deux questions qui décident si cela marche tout court : **votre image est-elle une forme ou une photographie**, et **laquelle des deux façons de trouver la forme lui faut-il**.

![Les deux volets : à gauche l'image avec le contour rouge vectorisé par-dessus, à droite le SVG terminé.](https://abox.tools/screens/trace-an-image-into-an-svg/outline.webp)

Le contour est dessiné par-dessus l'image plutôt que seulement à côté. C'est le seul endroit où la question peut se trancher — un contour est juste ou faux par rapport à ces pixels et à rien d'autre.

## Vectoriser n'est pas convertir, et les photographies ne se vectorisent pas

Convertir un JPEG en PNG est une conversion : la même image, décrite autrement, et rien n'est décidé en chemin. Vectoriser n'est pas cela. Cela jette presque tout et garde une seule chose — la frontière d'une forme — puis décrit cette frontière en courbes. Si votre image contient une forme nette, c'est exactement ce que vous vouliez. Si c'est la photo d'une pièce, il n'y a aucune forme à garder, et ce qui revient, c'est chaque plage de couleur voisine changée en tache.

Ce n'est pas une limite en attente d'être levée par l'ingénierie, aussi vaut-il la peine de dire clairement à quoi ressemblent les chiffres. Une page A4 de dessin au trait se vectorise en trois formes et six kilo-octets. Une page d'écriture manuscrite, en cinquante formes et cent cinquante. Un seul mégapixel de photographie se vectorise en **quatre mille formes et un mégaoctet et demi** — plus lourd que le JPEG, plus lent à ouvrir, et cela ne ressemble pas à la photo. L'outil cesse de dessiner à ce point et le dit, plutôt que de vous le laisser découvrir après le téléchargement.

![L'avertissement affiché quand une photographie est vectorisée : des milliers de formes distinctes et un fichier très lourd.](https://abox.tools/screens/trace-an-image-into-an-svg/photograph.webp)

Ce à quoi aboutit une photographie vectorisée comme un dessin au trait. Le fichier reste à vous à télécharger ; la page refuse seulement de faire semblant que c'est un dessin.

Ce qui se vectorise bien :

- les logos, marques et monogrammes ;
- les pochoirs, tampons et fichiers de découpe ;
- les signatures et le lettrage à la main ;
- les dessins au trait, les hachures et l'encrage de bande dessinée ;
- les silhouettes, et tout ce qui est déjà noir sur blanc.

Une tâche photographique fonctionne bel et bien, et c'est une autre tâche : découper un objet de son arrière-plan en silhouette pleine. C'est à cela que sert le second réglage.

## Les deux façons de trouver la forme

Vectoriser demande un bit par pixel — dedans, ou dehors — et il y a deux façons d'en décider.

**Clair et sombre** demande si chaque pixel est plus sombre qu'un seuil, et le seuil est calculé pour vous. C'est exactement juste pour de l'encre sur du papier, et c'est ce que vous voulez pour chaque logo, scan et pochoir. Quand il se trompe, il se trompe d'ordinaire de façon visible : déplacez le seuil jusqu'à ce que les traits fins survivent sans que le papier vire au gris avec eux.

**Le sujet** pose une autre question, parce que sur une photographie la première n'a pas de réponse. Une silhouette rouge sombre debout sur une pierre gris sombre, c'est du sombre sur du sombre : aucune luminosité ne les sépare, donc aucun seuil ne le peut. À la place, ce réglage apprend ce qu'est l'*arrière-plan* sur une bande le long du bord de l'image, mesure chaque pixel par rapport à lui, et garde la plus grande chose qui n'en fait pas partie. Une légende dans un coin n'est pas la plus grande chose, elle est donc écartée plutôt que vectorisée.

Il a un échec qu'il vaut mieux connaître d'avance : une photographie cadrée si serré que le sujet déborde de deux ou trois côtés. La bordure est alors surtout du sujet, le modèle apprend donc les couleurs du sujet lui-même, et la réponse sort à l'envers. Rien de cela ne se règle en poussant un curseur — c'est l'hypothèse qui était fausse, pas l'arithmétique. Désactivez *apprendre l'arrière-plan sur les bords*, cochez *un clic dit plutôt « ceci est l'arrière-plan »*, et cliquez l'arrière-plan deux ou trois fois à la place.

## Corriger ce qu'il a pris à tort, en le pointant

Un seuil est un seul nombre pour toute une image, et il est toujours faux quelque part : une ombre devient de l'encre, une agrafe survit, le centre d'un O se bouche. Chacune de ces erreurs est locale avec un remède local évident, et ce remède n'est pas un curseur de plus — c'est de pointer la chose.

Cliquez tout ce qui ne devrait pas être dans le dessin et cela disparaît ; cliquez-le encore et cela revient. Un clic prend **toute la plage de cette couleur**, si bien qu'un clic retire une tache entière ou un tampon entier plutôt qu'un pixel. Cliquer un morceau d'arrière-plan enclavé le remplit à la place, et c'est ainsi qu'un trou qui ne devrait pas en être un se referme. La ligne sous les images dit lequel des deux c'est et quelle taille cela fait avant que vous cliquiez, si bien qu'un clic qui emporterait la plus grande partie de l'image n'est jamais une surprise.

Les corrections sont conservées à part du seuil, donc déplacer le curseur ensuite ne les jette pas, et inverser l'image les retourne avec elle — une tache que vous avez supprimée reste supprimée plutôt que de réapparaître en trou percé dans l'arrière-plan.

## Les deux nombres du lissage, et quand y toucher

**Détail** est la distance dont la ligne peut s'écarter des pixels en se simplifiant. Sous un environ, cela ne fait rien du tout — une marche d'escalier se tient à un pixel entier de la ligne à laquelle elle appartient, une tolérance plus petite garde donc chaque marche et il ne reste rien à simplifier. Au-dessus de deux environ, cela commence à manger de vraies courbes. Il est calculé par forme sauf indication contraire, parce qu'un seul nombre ne peut pas servir à la fois une silhouette entière et le fût de deux pixels d'une lettre.

**Netteté des angles** est de combien le contour doit tourner pour que ce virage reste un angle plutôt que d'être arrondi en courbe. Ce n'est que la moitié de la décision — un sommet est aussi gardé en angle s'il se tient assez loin de ses voisins, ce qui attrape de lui-même chaque angle évident —, si bien que ce nombre ne décide jamais que des virages peu marqués. Sous vingt degrés environ, tout devient un angle et un cercle revient en polygone.

La plupart des images n'ont besoin ni de l'un ni de l'autre. Ils valent d'être connus pour les deux cas où il le faut : le scan d'un texte très petit, qui veut plus de détail, et une forme que vous allez découper sur une machine, qui en veut d'ordinaire moins.

## Ce que vous obtenez, et ce qu'on en fait

Un fichier avec un seul `<path>` dedans. Les contours tournent dans un sens et les trous qu'ils enferment dans l'autre, et c'est ce qui permet à une forme percée de quarante trous d'être un seul élément sans règle de remplissage à régler — si bien qu'Illustrator, Inkscape, Figma, un navigateur et la plupart des logiciels de découpe le lisent tous de la même façon.

![La dernière étape : combien de formes et de points le dessin contient, sa taille, et le bouton de téléchargement.](https://abox.tools/screens/trace-an-image-into-an-svg/save.webp)

Le compte vaut un coup d'œil avant de télécharger. Un dessin fait des dizaines ou des centaines de points ; des milliers veulent dire que l'image était une photographie.

Faire le chemin inverse — un SVG que vous avez déjà, et un PNG dont vous avez besoin — est [une autre tâche, avec son propre guide](https://abox.tools/fr/guides/convertir-un-svg-en-png/). Rien dans la vectorisation n'est réversible : le SVG qui sort d'ici est un nouveau dessin de la forme, pas l'image dont il a été fait.
