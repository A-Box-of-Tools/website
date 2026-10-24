# Comment transformer un dossier d'images en vidéo

Un diaporama est une chose simple à fabriquer et facile à fabriquer deux fois, parce que deux des réglages ne veulent pas dire ce qu'ils ont l'air de vouloir dire. Voici ce que chacun contrôle et lequel choisir.

[Ouvrir Images en vidéo](https://abox.tools/fr/images-en-video/): Transformer un dossier d'images en vidéo.

Dernière mise à jour 13 octobre 2026

## La réponse courte

Ouvrez [Images en vidéo](https://abox.tools/fr/images-en-video/), déposez et ordonnez les images, choisissez secondes pour un diaporama ou images pour une séquence, réglez les durées et créez la vidéo. MP4 H.264 est recommandé ; testez-le dans l'application destinataire avant partage.

Les deux réglages qui demandent le plus souvent une seconde passe sont la durée et la résolution, et ils valent d'être compris avant le premier rendu plutôt qu'après.

## Diaporama, stop motion ou trace de progression

Pour vacances, événement ou catalogue, passez Maintenir chaque image en secondes, entrez par exemple trois et Appliquer à toutes. Arrangez l'histoire, choisissez 1080p ou la forme verticale cible et Ajuster à l'intérieur pour garder toute la photo. Vérifiez la durée avant rendu, puis premières, centrales et dernières images du résultat.

Pour stop motion, rendu ou photos de progression régulières, utilisez des durées en images : une photo tenue une image à 24 fps donne 24 photos par seconde. Triez par nom et vérifiez l'ordre. L'outil fait des coupes nettes sans zoom, fondu ni son. Une narration demande un autre éditeur ; une progression visuelle muette peut être complète ici.

## La cadence et la durée ne sont pas la même chose

C'est la confusion qui coûte un nouveau rendu.

La **durée en secondes** détermine combien de temps chaque photo reste. C'est le réglage essentiel. Trois secondes sont confortables, une ou deux rapides, plus de cinq lentes sans narration.

La **cadence avec secondes sélectionnées** détermine les répétitions par seconde. Elle ne change pas l'apparence : une photo trois secondes est identique à 24 ou 60 fps, mais taille et temps d'encodage changent beaucoup.

L'outil commence à une image vidéo par photo. Dans cette unité, la cadence change la durée : 24 photos à 24 fps font une seconde, à 12 fps deux. Passez en secondes pour un diaporama ordinaire ; 24 ou 30 fps suffisent. Sans panoramique, zoom ni fondu, une cadence supérieure n'ajoute aucun mouvement.

![Les réglages de résolution et de cadence, avec un récapitulatif comptant les images, la durée totale, le nombre d'images de la vidéo et la taille estimée.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

En secondes, la cadence change le nombre d'images vidéo sans changer la durée de chaque photo. En durées par images, elle change aussi la longueur.

## La résolution, et les images qui n'ont pas la bonne forme

Une vidéo a une seule taille d'image sur toute sa durée. Vos photographies n'en partagent presque certainement pas une seule : quelque chose doit donc arriver à celles qui n'entrent pas, et ce quelque chose est le choix qu'il vaut la peine de faire délibérément.

Commencez par choisir la résolution en fonction de la destination de la vidéo :

- **⁦1920 × 1080⁩** pour tout usage général. Prise en charge universellement, se lit partout, et c'est ce que la plupart des gens appellent la HD.
- **⁦1080 × 1920⁩**, les mêmes nombres dans l'autre sens, pour une destination pensée pour le téléphone : stories, reels, shorts.
- **⁦3840 × 2160⁩** seulement si les images ont réellement autant de détail et si la destination le montrera. C'est quatre fois les pixels, quatre fois le temps d'encodage, et à peu près quatre fois le fichier.

Décidez ensuite du sort des images qui ne correspondent pas. Les faire tenir dans le cadre garde tout et laisse des bandes sur les côtés, ce qui est sûr et reste la bonne réponse quand les images comptent plus que la présentation. Remplir le cadre et rogner le débord a plus d'allure et coupera le haut de certaines. Mêler photographies verticales et horizontales dans une même vidéo est le cas où il n'y a pas de bonne réponse ; décider à l'avance de quel côté vous préférez avoir tort épargne un nouveau rendu.

## L'ordre, et le piège des noms de fichiers

Comme pour tout traitement par lots, les noms de fichiers se trient d'une façon qui n'est pas celle à laquelle vous vous attendiez. `photo2.jpg` vient après `photo10.jpg` dans un tri alphabétique, parce que la comparaison se fait caractère par caractère.

Le tri naturel place photo2 avant photo10. La date utilise la modification du fichier, pas forcément la prise de vue ; copies ou retouches peuvent exiger un ordre manuel. Déplacer les vignettes convient aux histoires non chronologiques. Vérifiez avant rendu : corriger l'ordre d'une vidéo oblige à refaire le travail.

![Six images dans l'ordre où elles passeront, chacune avec un champ de durée, au-dessus d'une ligne qui règle toutes les durées d'un coup.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

L'ordre, c'est la liste, et la liste se déplace à la souris. Il vient de l'ordre dans lequel vous les avez ajoutées, qui n'est pas celui que suggèrent les noms de fichiers.

## Il n'y a pas de bande-son, et ce n'est pas un détail

Le MP4 qu'écrit cet outil a une seule piste vidéo et aucune piste audio. Si votre diaporama a besoin de musique ou d'une voix, il vous faudra un logiciel de montage pour cette étape.

Il vaut la peine de savoir pourquoi, et pas seulement que : ajouter de l'audio veut dire décoder un fichier de musique, l'encoder en AAC, et l'entrelacer avec la vidéo dans le conteneur. Les trois sont du vrai travail, et les faire mal produit un fichier qui se désynchronise à la lecture. C'est sur la liste plutôt qu'à moitié fait.

Une note pratique si vous ajoutez la musique après : choisissez d'abord le morceau et réglez la durée par image pour que le diaporama ressorte proche de la longueur de la chanson. Rogner la musique pour qu'elle entre dans la vidéo sonne toujours plus mal que d'ajuster la vidéo à la musique.

## Ce qui sort, et que faire si cela refuse de se lire

La cible est du MP4 avec du H.264, la combinaison la plus largement lisible qui soit. Dans un navigateur sans WebCodecs, l'outil se rabat sur un enregistrement WebM, soit les mêmes images dans un conteneur que moins d'éditeurs et de plateformes sociales acceptent.

Si vous vous retrouvez avec un WebM et que quelque chose le refuse, le remède est un navigateur qui prend en charge WebCodecs plutôt qu'une conversion : les versions actuelles de Chrome, Edge et Safari le font toutes. Refaire le rendu vaut mieux que convertir, parce que convertir veut dire une génération de plus d'encodage avec perte.

Il n'y a pas de limite fixe de photos. La vidéo est assemblée en mémoire avant téléchargement et ne peut dépasser 4 Go ; ses dimensions doivent être compatibles avec l'encodeur du navigateur. Un long diaporama 4K peut atteindre ces limites avant que le nombre de sources semble grand.

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
