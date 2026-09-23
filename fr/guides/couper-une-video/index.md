# Comment couper une vidéo sans la réencoder

Couper ne change l'aspect d'aucune image : un bon coupeur n'y touche donc pas, il les déplace dans un nouveau fichier exactement telles qu'elles étaient. Voici ce que cela vous rapporte, et le seul endroit où cela se voit.

[Ouvrir Coupeur de vidéos](https://abox.tools/fr/couper-une-video/): Marquez les passages à garder pendant la lecture. Récupérez-les en une seule vidéo.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [coupeur de vidéos](https://abox.tools/fr/couper-une-video/), déposez-y le clip, appuyez sur `I` et `O` pour marquer chaque passage voulu, autant de fois que vous le souhaitez, et exportez. Sur un MP4, un MOV ou un M4V, les images que vous gardez sont déplacées dans le nouveau fichier exactement telles qu'elles étaient, mêmes octets, mêmes réglages d'encodeur, même tout, et le son est recopié échantillon par échantillon sans être décodé.

Cela veut dire qu'une coupe ne vous coûte rien en qualité, et qu'elle est rapide : sortir une minute d'un enregistrement de quatre gigaoctets coûte à peu près ce que coûte l'écriture de cette minute sur le disque, parce que les images sont pointées plutôt que chargées. Le seul endroit où cela se voit, c'est là où votre coupe tombe réellement, et c'est le reste de cette page.

## Pourquoi une coupe n'a pas à perdre de qualité

Couper ne change l'aspect d'aucune image. Chaque image que vous gardez est censée ressortir identique à ce qu'elle était en entrant : il n'y a donc aucune raison de la décoder et de la réencoder, et toutes les raisons de ne pas le faire, puisqu'un réencodage est avec perte et dégraderait légèrement tout le clip dans le seul but de le raccourcir.

Un bon coupeur ne réencode donc pas. Il lit l'index du fichier, détermine quelles images encodées tombent dans votre intervalle, et écrit ces octets dans un nouveau conteneur avec un nouvel index devant. Rien n'est décodé du tout sur ce chemin.

Bien des outils réencodent quand même, parce que décoder et réencoder est bien plus simple à implémenter que d'analyser le format du conteneur. On reconnaît en général lequel des deux on utilise à la durée : une copie est limitée par la vitesse d'écriture de votre disque, et un réencodage par la vitesse à laquelle votre machine encode de la vidéo, ce qui est cent fois plus lent.

## Les images clés, et pourquoi votre coupe peut tomber plus tôt

Voici la contrainte dont découle tout ce qui concerne la coupe.

La vidéo n'est pas stockée comme une suite d'images complètes. Ce serait énorme. La plupart des images sont stockées comme une description de ce qui les différencie de leurs voisines, ce qui veut dire qu'elles ne peuvent pas être décodées seules, puisqu'il vous faut les images autour d'elles. Seule une **image clé** se tient toute seule comme une image complète, et les images clés sont typiquement espacées d'une à dix secondes.

Donc, si vous marquez une coupe deux secondes après la dernière image clé, un coupeur qui recopie les images ne peut pas commencer là. Les images à votre marque sont illisibles sans la suite qui y mène. Il doit emporter toute la portion depuis l'image clé qui précède votre marque.

Ce qu'il en fait est la partie intéressante. Le format de fichier a une façon standard de dire *commencer la lecture à ce point* : les images supplémentaires sont dans le fichier, mais le conteneur ordonne au lecteur de les sauter. Tout lecteur grand public le respecte, et le clip commence exactement là où vous l'avez dit. Un lecteur qui l'ignore démarrera plus tôt, de l'écart entre images clés au maximum.

L'outil d'ici vous dit dans quel cas vous êtes et de combien avant l'export : c'est donc une décision plutôt qu'une surprise.

## Quand accepter un réencodage

Il existe une coupe exacte, et elle fonctionne en réencodant la portion d'ouverture : elle décode depuis l'image clé et écrit une nouvelle suite d'images qui commence réellement là où vous avez marqué. Elle est plus lente, et elle coûte un peu de qualité sur cette portion d'ouverture seulement.

Choisissez-la quand le clip part quelque part qui ne respectera pas l'instruction du conteneur, ou quand vous ne maîtrisez pas le lecteur : certains logiciels de montage, certains systèmes de diffusion et de visioconférence, certains lecteurs matériels plus anciens. Choisissez la copie pour tout le reste, c'est-à-dire pour presque tout, qu'il s'agisse d'un navigateur, d'un téléphone, d'une plateforme sociale ou d'un lecteur multimédia.

Une troisième option qui ne coûte rien : déplacez votre marque. Si l'outil vous montre où sont les images clés, pousser la coupe jusqu'à la plus proche vous donne une coupe exacte sans le moindre réencodage. Il est rare qu'une seconde d'écart vaille qu'on renonce à une copie.

![La carte d'export : la méthode, un curseur de qualité, un interrupteur pour le son et un récapitulatif comptant les morceaux, la durée et la taille.](https://abox.tools/screens/trim-a-video/summary.webp)

C'est dans le récapitulatif que se prend la décision de cette section : ce que coûtera la copie, et ce que coûterait le réencodage à sa place.

## Retirer un morceau du milieu

Couper un passage est une opération différente d'en garder un, et il vaut la peine de savoir que c'est possible, parce que bien des coupeurs ne font que la seconde. Marquez la partie dont vous ne voulez pas, choisissez de la couper, et ce qui reste de part et d'autre est raccordé en un seul clip, avec le son repris au pas.

Le raccord subit la même contrainte d'image clé à l'endroit où la seconde moitié reprend, pour la même raison. Cela fonctionne sur les deux chemins MP4 d'ici. C'est la seule chose que le repli par enregistrement, plus bas, ne sait pas faire, parce qu'un enregistrement se fait en une passe depuis une seule tête de lecture.

![La ligne de temps avec deux segments marqués, et en dessous un tableau donnant le début, la fin et la durée de chacun, ainsi que le total gardé.](https://abox.tools/screens/trim-a-video/marks.webp)

Deux morceaux gardés dans un même plan. Le tableau est modifiable : une marque tombée un cinquième de seconde trop tard se saisit au clavier au lieu d'être refaite.

## Les formats, et le repli

**Le MP4, le M4V et le MOV** sont lus directement, quel que soit le codec à l'intérieur, qu'il s'agisse de H.264, de HEVC, d'AV1 ou de VP9. Recopier des images n'implique pas de les décoder : ce chemin fonctionne donc même pour un codec dont votre navigateur n'a aucun décodeur, agréable conséquence du fait de ne pas regarder les images.

**Tout le reste que votre navigateur sait lire**, le WebM au premier chef, est coupé en le jouant et en enregistrant le résultat. Cela marche, et cela coûte deux choses : cela prend le temps que dure le passage, et l'image et le son sont réencodés.

**L'AVI, le WMV, le FLV et la plupart des MKV**, le navigateur ne sait ni les lire ni les jouer, et l'outil le dit plutôt que d'échouer à mi-course. Convertissez-les d'abord en MP4 avec quelque chose qui les prend en charge.

## Deux choses qui tournent mal en silence ailleurs

**La rotation.** Un téléphone filme à l'horizontale et écrit une instruction de rotation dans le fichier plutôt que de tourner les pixels. Un coupeur qui recopie les images doit reporter cette instruction, sinon votre clip vertical ressort couché, et c'est la façon classique dont une vidéo coupée est gâchée. Le chemin exact d'ici tourne les images en les réencodant et écrit un fichier qui n'a besoin d'aucune rotation.

**La synchronisation du son.** L'audio et la vidéo sont stockés comme des flux séparés avec leur propre rythme, et ils ne sont pas découpés aux mêmes points. Si les deux ne sont pas alignés délibérément à la coupe, le son dérive. Sur le chemin par copie d'ici, l'audio est recopié échantillon par échantillon sans être décodé : il est donc octet pour octet ce qu'il y avait dans le fichier, et une marque de montage le garde au pas de l'image au millième de seconde près.

## Couper n'est pas recadrer

Deux mots qu'on emploie l'un pour l'autre. Couper change la durée du clip ; recadrer change la forme de l'image. Si ce que vous voulez est une version carrée d'une vidéo horizontale, ou les bandes noires enlevées sur les côtés, c'est le [recadreur de vidéos](https://abox.tools/fr/recadrer-une-video/) qu'il vous faut ; contrairement à la coupe, lui doit réencoder, pour la raison qu'[expose son guide](https://abox.tools/fr/guides/recadrer-une-video/).

## Pourquoi cela ne demande pas d'envoi, et celui-ci moins que tout

La vidéo est le type de fichier pour lequel les gens s'attendent le plus à devoir faire un envoi, parce que les fichiers sont gros et que le travail a l'air lourd. La coupe est le cas où c'est le moins vrai : sur le chemin par copie, le fichier est à peine lu. L'outil parcourt l'index, détermine quelles plages d'octets garder, et les écrit. Envoyer un fichier de quatre gigaoctets à un serveur pour qu'il fasse cela serait la façon la plus lente possible de s'y prendre.

C'est aussi le type de fichier où l'envoi coûte le plus cher si vous préférez l'éviter : la vidéo porte des visages, des voix, des logements et des lieux d'une façon qu'un document ne connaît pas. L'outil d'ici n'a aucune fonction réseau, et la `Content-Security-Policy` de la page énumère toutes les adresses qu'elle peut contacter, dont aucune n'appartient à ce site.

Coupez votre connexion et coupez un clip quand même, si vous préférez vérifier plutôt qu'on vous le dise. [Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) expose trois autres vérifications du même genre.
