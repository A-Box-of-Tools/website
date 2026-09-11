# Comment transformer un dossier d'images en vidéo

Un diaporama est une chose simple à fabriquer et facile à fabriquer deux fois, parce que deux des réglages ne veulent pas dire ce qu'ils ont l'air de vouloir dire. Voici ce que chacun contrôle et lequel choisir.

[Ouvrir Images en vidéo](https://abox.tools/fr/images-en-video/): Transformer un dossier d'images en vidéo.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez [Images en vidéo](https://abox.tools/fr/images-en-video/), déposez-y les images, mettez-les en ordre, réglez la durée d'affichage de chacune, et créez la vidéo. Vous obtenez un MP4 avec de la vidéo H.264, qui se lit sur à peu près n'importe quoi.

Les deux réglages qui demandent le plus souvent une seconde passe sont la durée et la résolution, et ils valent d'être compris avant le premier rendu plutôt qu'après.

## La cadence et la durée ne sont pas la même chose

C'est la confusion qui coûte un nouveau rendu.

**La durée** est le temps que chaque image reste à l'écran. C'est le réglage qui vous intéresse réellement. Trois secondes est un défaut confortable pour un diaporama que quelqu'un regarde ; une à deux secondes donne un rythme alerte ; au-delà de cinq, cela traîne à moins qu'une voix ne le commente.

**La cadence** est le nombre de fois par seconde où la vidéo répète cette image. Elle ne change rien à l'allure du diaporama, une image fixe tenue trois secondes étant identique à 24 images par seconde et à 60, mais elle change beaucoup le poids du fichier et le temps d'encodage.

Pour un simple diaporama, prenez donc une cadence basse. 24 ou 30 suffit largement. La raison de monter est la présence de mouvement dans la vidéo : un panoramique ou un zoom sur chaque photo, ou un fondu enchaîné entre elles, où une cadence basse se voit comme des saccades.

![Les réglages de résolution et de cadence, avec un récapitulatif comptant les images, la durée totale, le nombre d'images de la vidéo et la taille estimée.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

La cadence et la durée sont deux choses différentes, et le récapitulatif le rend évident : changer l'une déplace le nombre d'images, pas la durée.

## La résolution, et les images qui n'ont pas la bonne forme

Une vidéo a une seule taille d'image sur toute sa durée. Vos photographies n'en partagent presque certainement pas une seule : quelque chose doit donc arriver à celles qui n'entrent pas, et ce quelque chose est le choix qu'il vaut la peine de faire délibérément.

Commencez par choisir la résolution en fonction de la destination de la vidéo :

- **⁦1920 × 1080⁩** pour tout usage général. Prise en charge universellement, se lit partout, et c'est ce que la plupart des gens appellent la HD.
- **⁦1080 × 1920⁩**, les mêmes nombres dans l'autre sens, pour une destination pensée pour le téléphone : stories, reels, shorts.
- **⁦3840 × 2160⁩** seulement si les images ont réellement autant de détail et si la destination le montrera. C'est quatre fois les pixels, quatre fois le temps d'encodage, et à peu près quatre fois le fichier.

Décidez ensuite du sort des images qui ne correspondent pas. Les faire tenir dans le cadre garde tout et laisse des bandes sur les côtés, ce qui est sûr et reste la bonne réponse quand les images comptent plus que la présentation. Remplir le cadre et rogner le débord a plus d'allure et coupera le haut de certaines. Mêler photographies verticales et horizontales dans une même vidéo est le cas où il n'y a pas de bonne réponse ; décider à l'avance de quel côté vous préférez avoir tort épargne un nouveau rendu.

## L'ordre, et le piège des noms de fichiers

Comme pour tout traitement par lots, les noms de fichiers se trient d'une façon qui n'est pas celle à laquelle vous vous attendiez. `photo2.jpg` vient après `photo10.jpg` dans un tri alphabétique, parce que la comparaison se fait caractère par caractère.

Trier par date de prise de vue est en général juste pour des photographies d'un événement, puisque vous les avez prises dans l'ordre où il s'est déroulé. Faire glisser les tuiles est juste pour tout ce dont le récit n'est pas chronologique. Vérifiez avant de lancer le rendu : la vidéo est l'objet où corriger l'ordre veut dire refaire tout le travail.

![Six images dans l'ordre où elles passeront, chacune avec un champ de durée, au-dessus d'une ligne qui règle toutes les durées d'un coup.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

L'ordre, c'est la liste, et la liste se déplace à la souris. Il vient de l'ordre dans lequel vous les avez ajoutées, qui n'est pas celui que suggèrent les noms de fichiers.

## Il n'y a pas de bande-son, et ce n'est pas un détail

Le MP4 qu'écrit cet outil a une seule piste vidéo et aucune piste audio. Si votre diaporama a besoin de musique ou d'une voix, il vous faudra un logiciel de montage pour cette étape.

Il vaut la peine de savoir pourquoi, et pas seulement que : ajouter de l'audio veut dire décoder un fichier de musique, l'encoder en AAC, et l'entrelacer avec la vidéo dans le conteneur. Les trois sont du vrai travail, et les faire mal produit un fichier qui se désynchronise à la lecture. C'est sur la liste plutôt qu'à moitié fait.

Une note pratique si vous ajoutez la musique après : choisissez d'abord le morceau et réglez la durée par image pour que le diaporama ressorte proche de la longueur de la chanson. Rogner la musique pour qu'elle entre dans la vidéo sonne toujours plus mal que d'ajuster la vidéo à la musique.

## Ce qui sort, et que faire si cela refuse de se lire

La cible est du MP4 avec du H.264, la combinaison la plus largement lisible qui soit. Dans un navigateur sans WebCodecs, l'outil se rabat sur un enregistrement WebM, soit les mêmes images dans un conteneur que moins d'éditeurs et de plateformes sociales acceptent.

Si vous vous retrouvez avec un WebM et que quelque chose le refuse, le remède est un navigateur qui prend en charge WebCodecs plutôt qu'une conversion : les versions actuelles de Chrome, Edge et Safari le font toutes. Refaire le rendu vaut mieux que convertir, parce que convertir veut dire une génération de plus d'encodage avec perte.

Aucune limite n'est intégrée à l'outil quant au nombre d'images. Le plafond est la mémoire de votre propre machine, parce que la vidéo finie y est assemblée avant que vous la téléchargiez : un long diaporama en 4K commence à s'y faire sentir le premier.

## Alléger le fichier

Si le résultat est trop lourd pour sa destination, dans l'ordre de ce qui aide réellement :

**Baissez la cadence.** Pour un diaporama d'images fixes, cela ne coûte rien de visible et c'est la plus grosse économie disponible d'un seul coup.

**Baissez la résolution.** Du 1080p au lieu de la 4K, c'est le quart des pixels, et sur un écran de téléphone personne ne le saura.

**Raccourcissez.** Trois secondes par image au lieu de cinq, c'est 40 % de durée en moins et 40 % de fichier en moins, et en général un meilleur diaporama.

Réduire d'abord les photographies source n'aide pas beaucoup. La vidéo est encodée à la résolution que vous avez choisie de toute façon : une photo de 4000 pixels et une de 2000 produisent presque le même nombre d'octets dans une vidéo 1080p. Cela accélère l'encodage, en revanche, et cela repousse ce plafond de mémoire.

## Pourquoi cela ne demande pas de serveur, avec une exception dite

Encoder de la vidéo était naguère le cas le plus clair en faveur de l'envoi : les navigateurs ne savaient pas le faire, et une machine dotée de FFmpeg le savait. WebCodecs a changé cela en exposant l'encodeur matériel qui est déjà dans votre machine, celui-là même que votre téléphone utilise pour enregistrer de la vidéo en temps réel. Composer les images, c'est un canvas. Aucune des deux étapes n'a besoin d'autre chose que de votre propre matériel.

Une exception sur cet outil précis, dite plutôt qu'enterrée : la fonction facultative « ajouter depuis une adresse web » récupère une image à une adresse que vous collez, et le serveur qui se trouve à cette adresse voit votre IP et ce que vous avez demandé. C'est inhérent à la fonction plutôt qu'un défaut, et c'est la seule étape réseau de tout l'outil. Ne vous en servez pas et rien ne quitte votre machine.

[Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) expose quatre vérifications qui vous diront la même chose de n'importe quel outil, celui-ci compris.
