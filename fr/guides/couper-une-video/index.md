# Comment couper une vidéo sans la réencoder

La copie peut raccourcir une vidéo sans changer ses images encodées. Ce guide explique les limites des images clés, quand la copie convient et quand choisir le réencodage.

[Ouvrir Coupeur de vidéos](https://abox.tools/fr/couper-une-video/): Marquez les passages à garder pendant la lecture. Récupérez-les en une seule vidéo.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [coupeur de vidéos](https://abox.tools/fr/couper-une-video/), déposez-y le clip, appuyez sur `I` et `O` pour marquer chaque partie à garder, puis choisissez l’export. Pour MP4, MOV ou M4V, « Conserver chaque octet » déplace les images et le son sans changement. Ce mode fonctionne pour une section, ou pour plusieurs si chacune après la première commence sur une image clé. Les autres sélections nécessitent le mode de réencodage annoncé.

La copie ne réduit pas la qualité et va vite : retirer une minute d’un fichier de quatre gigaoctets coûte à peu près son écriture sur disque. Les images sont référencées plutôt que chargées. Le choix dépend du début de chaque section conservée, comme l’explique la suite.

## Pourquoi une coupe n'a pas à perdre de qualité

Pour une sélection compatible avec la copie, chaque image conservée garde son encodage exact. Déplacer ces octets évite le décodage et le réencodage : la vidéo est raccourcie sans nouvelle compression avec perte.

Quand la copie préserve le minutage demandé, l’outil lit l’index, choisit les images encodées nécessaires et écrit ces octets dans un nouveau conteneur avec un nouvel index. Rien n’est décodé.

Le réencodage sert lorsque la copie ne peut respecter le minutage de façon fiable. Il prend généralement plus longtemps car chaque image conservée doit être décodée puis encodée ; la copie dépend surtout de la vitesse d’écriture.

## Les images clés, et pourquoi votre coupe peut tomber plus tôt

Voici la contrainte dont découle tout ce qui concerne la coupe.

La vidéo n'est pas stockée comme une suite d'images complètes. Ce serait énorme. La plupart des images sont stockées comme une description de ce qui les différencie de leurs voisines, ce qui veut dire qu'elles ne peuvent pas être décodées seules, puisqu'il vous faut les images autour d'elles. Seule une **image clé** se tient toute seule comme une image complète, et les images clés sont typiquement espacées d'une à dix secondes.

Donc, si vous marquez une coupe deux secondes après la dernière image clé, un coupeur qui recopie les images ne peut pas commencer là. Les images à votre marque sont illisibles sans la suite qui y mène. Il doit emporter toute la portion depuis l'image clé qui précède votre marque.

Pour la première section conservée, le format peut indiquer *commencer la lecture à ce point* : les images supplémentaires restent dans le fichier, avec une marque demandant au lecteur de les sauter. Les lecteurs qui la respectent commencent au repère ; les autres peuvent afficher ces images antérieures.

À une jonction suivante, les images masquées peuvent faire commencer une section trop tôt dans le navigateur, même avec une liste de montage correcte. L’outil refuse donc la copie si une section après la première commence entre deux images clés. Il explique pourquoi et vous laisse choisir explicitement le réencodage.

## Quand accepter un réencodage

« Couper exactement ici » décode depuis l’image clé précédente, écarte les images hors des sections et réencode toutes les images conservées. Cela concerne toute la vidéo gardée, pas seulement le début. C’est plus lent que la copie et peut en réduire la qualité. Le son est copié si son format le permet.

Choisissez-le lorsque la copie n’est pas disponible, ou pour commencer aux images gardées sans dépendre d’une marque initiale. La copie reste utile pour une section ou plusieurs dont les débuts suivants tombent sur des images clés, si le lecteur destinataire respecte la marque initiale.

Vous pouvez aussi déplacer le début d’une section sur une image clé affichée dans la chronologie. Cela peut autoriser la copie sans réencodage pour une section suivante. Ce choix change le contenu conservé : faites-le selon ce dont vous avez besoin.

![La carte d'export : la méthode, un curseur de qualité, un interrupteur pour le son et un récapitulatif comptant les morceaux, la durée et la taille.](https://abox.tools/screens/trim-a-video/summary.webp)

C'est dans le récapitulatif que se prend la décision de cette section : ce que coûtera la copie, et ce que coûterait le réencodage à sa place.

## Retirer un morceau du milieu

Couper un passage est une opération différente d'en garder un, et il vaut la peine de savoir que c'est possible, parce que bien des coupeurs ne font que la seconde. Marquez la partie dont vous ne voulez pas, choisissez de la couper, et ce qui reste de part et d'autre est raccordé en un seul clip, avec le son repris au pas.

La copie peut réunir les parties restantes si chacune après la première recommence sur une image clé. Sinon, choisissez « Couper exactement ici ». L’enregistrement de secours ne peut pas réunir des parties séparées car il enregistre un passage ininterrompu depuis une seule position de lecture.

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
