# Comment enregistrer une image d'une vidéo en photo

Mettre le lecteur en pause et appuyer sur la touche de capture donne une image d'une fenêtre. Parfois cela suffit. Voici en quoi c'est différent, et comment obtenir l'image elle-même quand cela compte.

[Ouvrir Extracteur d'image](https://abox.tools/fr/extraire-une-image-d-une-video/): Un arrêt sur image en pleine qualité, à n'importe quel instant.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez l'[Extracteur d'image](https://abox.tools/fr/extraire-une-image-d-une-video/), déposez la vidéo, trouvez le moment et appuyez sur *Extraire cette image*. Ce qui arrive dans vos téléchargements, c'est l'image à la résolution de la vidéo elle-même — ⁦3840 × 2160⁩ pour une vidéo 4K, quelle qu'ait été la taille de l'aperçu sur la page.

Laissez le format sur PNG tant que le poids du fichier n'est pas un problème. Le reste de cette page explique pourquoi ces deux phrases ne décrivent pas une capture d'écran, et quand la différence mérite qu'on s'y arrête.

## Pourquoi une capture d'un lecteur en pause est une autre image

Tout le monde a déjà une méthode pour cela : pause, touche de capture, on rogne les commandes. Cela marche, et pour un partage rapide c'est exactement l'effort qu'il faut. Mais entre-temps quatre choses sont arrivées à l'image, et aucune n'est réversible :

- **Elle fait la taille de la fenêtre, pas celle de la vidéo.** Une vidéo 4K dans un lecteur en demi-écran donne une image d'un lecteur en demi-écran. Tous les pixels qui étaient dans le fichier et pas à l'écran ont disparu.
- **Elle a été mise à l'échelle.** Ce que le lecteur a fait pour faire entrer l'image dans cette fenêtre — lissage, accentuation ou simple rééchantillonnage — y est cuit.
- **Elle est passée par la chaîne d'affichage.** Gestion des couleurs, et sur une vidéo HDR un mappage de tons choisi pour votre écran plutôt que pour le fichier.
- **Elle embarque en général du mobilier.** Commandes, barre de progression, piste de sous-titres, curseur.

Un extracteur d'image saute les quatre : il décode l'image que le fichier contient réellement et écrit ces pixels-là. La photo fait la taille de la vidéo, et personne n'a dessiné dessus.

## Tomber sur l'image visée

C'est la partie que la plupart des outils ratent en silence, et il vaut la peine de savoir ce qu'il faut regarder, chez n'importe lequel d'entre eux.

Une vidéo n'est pas une bande d'images rangées dans l'ordre où vous les regardez. La plupart des images sont stockées comme une description de ce qui les distingue d'autres images, et dans tout fichier avec des images B, l'ordre de stockage n'est pas l'ordre d'affichage. Un outil qui envoie un lecteur sur un horodatage et prend ce qui s'affiche dépend de la façon dont ce lecteur arrondit ; et un outil qui avance « d'une image » en ajoutant un trentième de seconde se trompe sur toute vidéo qui n'est pas exactement à 30 i/s — c'est-à-dire presque toutes les vidéos de téléphone, puisqu'elles font varier leur cadence quand la lumière change.

La solution est de lire la liste d'images du fichier lui-même et de désigner les images par leur place dedans. Sur un MP4, l'outil d'ici le fait : le curseur avance d'une image par cran, les flèches d'une image, et il peut vous dire que vous êtes sur l'image 812 sur 3 540 parce qu'il les a comptées. Sur les formats qu'il ne sait pas lire directement, il le dit, et avance d'à peu près une image au lieu de faire semblant.

Un test rapide, valable pour n'importe quel extracteur : avancez de quelques images sur un passage très animé. Si l'image ne change parfois pas, ou saute de deux, l'outil devine à partir d'horodatages.

![Le chercheur d'image : une image fixe avec un code temporel incrusté, une barre de défilement, des boutons pas à pas et des champs donnant l'instant exact et le numéro d'image.](https://abox.tools/screens/grab-a-frame-from-a-video/find.webp)

Avancer image par image, c'est ainsi qu'on tombe sur celle qu'on visait. L'instant et le numéro d'image la désignent tous les deux, et les deux se saisissent.

## Dans quel format l'enregistrer

Il n'y a vraiment que trois réponses, et le choix dépend de ce qui arrive ensuite à l'image.

- **PNG** — le format par défaut, et le seul qui enregistre l'image telle quelle. Choisissez-le si la photo va être retouchée, imprimée, comparée à une autre image, ou conservée. C'est aussi le plus lourd : comptez quelques mégaoctets en 1080p et autour de huit en 4K, parce qu'une image photographique n'est pas ce que la compression de PNG sait bien faire.
- **JPEG** — un dixième du poids, et accepté partout. Choisissez-le pour une vignette, un aperçu, ou tout ce qui part directement dans un document ou une conversation. C'est un second passage avec perte par-dessus celui de la vidéo, donc un mauvais point de départ pour retoucher ensuite.
- **WebP** — encore plus léger à qualité visible égale, et pris en charge partout où cela compte désormais. La seule réserve concerne les vieux logiciels : certaines applications de bureau refusent toujours de l'ouvrir.

Une chose mérite d'être dite clairement : une image tirée d'une vidéo est déjà une image compressée. L'enregistrer en PNG n'annule pas cela et ne récupère pas le détail que le codec a jeté au moment du tournage. Ce que le PNG vous apporte, c'est que rien n'est jeté *deux fois*. Si vous comptez étalonner ou recadrer la photo ensuite, cela compte ; si vous l'envoyez à quelqu'un, non.

## En extraire beaucoup d'un coup

Une image toutes les quelques secondes est un tout autre travail qu'une image à un instant, et cela arrive plus souvent qu'il n'y paraît : une planche-contact d'un long enregistrement, des vignettes parmi lesquelles choisir une couverture, un échantillon régulier des rushes pour vérifier la mise au point ou l'exposition sur un tournage.

Réglez un intervalle, appuyez sur le bouton de série, et l'outil parcourt la vidéo une fois en prenant une image à chaque repère. Deux remarques pratiques. Restez généreux sur l'intervalle pour une longue vidéo — une image par seconde sur une heure de rushes fait 3 600 photos, et c'est pour cela que l'outil plafonne une série à 500. Et choisissez le JPEG pour cet usage sauf raison contraire : cent PNG en 4K, c'est presque un gigaoctet retenu dans la page avant même que vous en ayez téléchargé un.

Elles reviennent dans une seule archive ZIP, nommées par leur timecode, de sorte qu'elles se classent dans l'ordre où elles se sont produites et que chacune se retrouve dans la vidéo.

![Trois images fixes tirées du même plan, en vignettes avec leurs instants, et un bouton pour les enregistrer toutes d'un coup.](https://abox.tools/screens/grab-a-frame-from-a-video/shots.webp)

Prenez-en plusieurs et choisissez après. Elles restent dans la page tant que vous ne les enregistrez pas, et les enregistrer tient en un bouton.

## Les vidéos verticales, et la fameuse image couchée

Si vous avez déjà tiré une image d'une vidéo de téléphone et qu'elle est sortie couchée, voici pourquoi. Un téléphone filme en paysage et écrit un quart de tour dans le fichier plutôt que de tourner les pixels. Les lecteurs lisent ce quart de tour et l'appliquent ; un outil qui ne lit que les pixels ne le fait pas, et le résultat est une photo parfaitement correcte du bon moment, pivotée de 90 degrés.

Rien ne cloche dans le fichier, et repivoter la photo ensuite ne coûte que l'agacement. L'outil d'ici lit la rotation sur la piste et l'applique avant de dessiner, si bien qu'une vidéo verticale donne une photo verticale.

## Ce qu'on ne récupère pas

Une image ne peut être que ce que vaut l'image dont elle sort, et deux choses la limitent quel que soit l'outil.

**Le flou de bougé est dans l'image.** Si le sujet bougeait pendant l'exposition, chacune des images de ce mouvement est floue, et il n'y a pas d'image nette à y trouver. Filmer avec une vitesse d'obturation plus élevée est le seul remède, et cela doit se décider avant le tournage.

**La compression aussi est dans l'image.** La vidéo est compressée bien plus fort qu'une photographie, et plus fort encore sur les images situées entre les images clés. Si une photo paraît en pâtés, essayez d'avancer ou de reculer d'une image ou deux : une image clé est stockée en entier et paraît souvent nettement plus propre que ses voisines.

Et si la photo doit ensuite changer de taille ou de forme, faites-en une étape à part : le [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/) redimensionne, recadre et convertit, et [son guide](https://abox.tools/fr/guides/redimensionner-une-image/) détaille ce que chacune de ces opérations coûte.

## Pourquoi cela n'a pas besoin d'un envoi

Décoder de la vidéo dans un navigateur est récent, et c'est réel : WebCodecs expose le décodeur matériel que votre téléphone utilise déjà pour lire des vidéos. Le travail se fait sur la machine qui a déjà le fichier, ce qui, pour une vidéo de plusieurs gigaoctets, est aussi le seul arrangement raisonnable — envoyer une heure de 4K pour récupérer une photo de 8 Mo est un mauvais calcul dans tous les sens.

L'outil d'ici n'a aucune fonction réseau, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter ; aucune n'appartient à ce site. Débranchez internet et extrayez une image quand même, si vous préférez vérifier plutôt qu'être rassuré.

[Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) propose trois autres vérifications applicables à n'importe quel outil.
