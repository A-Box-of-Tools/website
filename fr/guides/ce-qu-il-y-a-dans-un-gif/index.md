# Ce qu'il y a vraiment dans un GIF

Un GIF est une pile de rectangles, chacun avec un minuteur et une table de couleurs, et presque tous les reproches faits au format viennent de l'une de ces trois choses. Voici ce que fait chaque partie, et comment découvrir dans laquelle votre fichier dépense son poids.

[Ouvrir Analyseur de GIF](https://abox.tools/fr/analyser-un-gif/): Images, durées, palettes, et où est passé chaque octet.

Dernière mise à jour 26 août 2026

## La réponse courte

Un GIF, c'est une toile, une liste de rectangles à peindre dessus, et une table de couleurs qui dit ce que signifient les nombres contenus dans ces rectangles. Chaque rectangle porte trois choses : combien de temps le laisser, ce qu'il faut en faire ensuite, et éventuellement une table de couleurs à lui.

Presque tout ce qui surprend dans ce format sort de cette liste. Si votre GIF est énorme, c'est que les rectangles font toute la toile à chaque fois, ou qu'il contient trois cents tables de couleurs. S'il joue trop lentement, c'est que les délais passent sous un plancher qu'aucun navigateur ne franchit. S'il bave, c'est le champ qu'on appelle *l'effacement*.

Pour voir de quoi il retourne sur un fichier donné, ouvrez l'[Analyseur de GIF](https://abox.tools/fr/analyser-un-gif/) et déposez-le. Le reste de cette page explique ce que veulent dire les chiffres.

![La carte de synthèse d'un GIF : sa version, la taille de sa toile, la taille du fichier, le nombre d'images, le nombre de répétitions et le nombre de couleurs.](https://abox.tools/screens/whats-inside-a-gif/facts.webp)

Tout ce qu'un lecteur ne montre jamais, tiré d'un seul fichier.

## Les images sont des rectangles, pas des photos

C'est la partie qui surprend ceux qui n'ont jamais vu de GIF autrement qu'en lecture. Une image n'est pas une photo de l'animation à cet instant. C'est un rectangle, avec sa position et sa taille, peint par-dessus ce que les images précédentes ont laissé.

Ce rectangle peut faire toute la toile, et dans un fichier mal fabriqué c'est toujours le cas. Mais un GIF a le droit de n'enregistrer que la partie de l'image qui a changé depuis la précédente — et là où l'essentiel de l'image ne bouge pas, c'est la différence entre un fichier de 12 Mo et un de 900 Ko. C'est pourquoi la capture d'écran d'une fenêtre presque immobile peut être légère, et pourquoi la même capture sortie d'un convertisseur négligent ne l'est pas.

En regardant l'animation, impossible de savoir lequel vous avez. Les deux se ressemblent trait pour trait. La seule façon de le voir est de regarder ce que chaque image enregistre, et l'analyseur a une vue faite exactement pour cela : basculez-la sur *uniquement ce que chaque image enregistre*, et soit vous voyez une rangée de petites formes sur fond transparent, ce qui veut dire que l'encodeur a fait son travail, soit vous revoyez l'image entière encore et encore, ce qui veut dire que non.

Il n'y a nulle part de compensation de mouvement dans ce format. Rien n'est jamais enregistré comme « pareil que la fois d'avant mais décalé de quatre pixels », comme le ferait un codec vidéo. L'astuce du rectangle qui change est la seule économie dont dispose le GIF, et elle vaut très cher.

## Les délais, et le plancher que tout navigateur impose

Chaque image enregistre en centièmes de seconde combien de temps la tenir. C'est la seule unité du format, donc le plus rapide qu'un fichier puisse demander est 0,01 seconde — cent images par seconde — et le plus long tourne autour de 655 secondes.

Il n'aura pas cent images par seconde. **Tous les navigateurs arrondissent un délai inférieur à 0,02 seconde à 0,10.** La règle a été écrite dans Netscape Navigator en 1996, pour les globes tournants et les panneaux « en travaux » animés de l'époque, et tous les navigateurs depuis l'ont recopiée. Personne ne l'a jamais retirée, et personne ne le fera.

Un GIF dont toutes les images disent 0,01 s joue donc à dix images par seconde, pas à cent. Il tourne dix fois plus lentement que ce que voulait l'outil qui l'a fabriqué, et le fichier n'en laisse rien paraître : les délais qu'il contient sont exactement ceux qui ont été demandés. C'est la surprise la plus fréquente du format, et c'est pourquoi l'analyseur affiche deux durées — celle que dit le fichier, et celle qu'un navigateur en fera réellement.

Le remède, dans le logiciel qui fabrique le fichier, est d'écrire 0,02 plutôt que 0,01. Cela donne 50 images par seconde, qui est le vrai plafond, et c'est plus rapide que ce dont quoi que ce soit a besoin. En pratique, 0,05 s — vingt images par seconde — est à peu près la cadence maximale qu'il vaut la peine de demander.

Les délais vous disent encore une chose. S'ils sont tous identiques, le fichier a été fait à partir d'images à cadence fixe. S'ils se dispersent — 0,04 ici, 0,11 là —, quelque chose a converti une vidéo en supprimant des images et en étirant les voisines pour combler les trous. Et si la dernière est bien plus longue que les autres, c'est voulu : c'est ainsi qu'on fait marquer une pause à une animation avant qu'elle ne reparte.

## L'effacement : le champ qui décide si ça bave

Chaque image indique ce qui doit rester à l'écran quand son temps est écoulé. Il y a quatre réponses possibles et elles valent la peine d'être connues, car trois des quatre façons dont une animation peut mal se comporter tiennent à ce champ mal rempli.

- **Laisser en place.** L'image suivante peint directement par-dessus. Correct quand les images sont opaques et se recouvrent entièrement, et c'est l'option la moins chère, puisqu'il n'y a rien à effacer.
- **Revenir au fond.** Le rectangle de l'image est nettoyé avant que la suivante ne dessine. C'est ce qu'exige la transparence : sans cela, les parties transparentes de l'image suivante laissent voir la précédente en dessous, et une animation faite d'images séparées se transforme en tas d'images.
- **Restaurer ce qu'il y avait dessous.** Ce qui était sur la toile avant que cette image ne dessine est remis en place. C'est ainsi qu'on enregistre un petit objet qui se déplace sur un fond immobile — chaque image peint l'objet, puis le fond revient, et seul le rectangle de l'objet est jamais écrit.
- **Non précisé.** Le fichier n'a rien dit. Toutes les visionneuses le traitent comme « laisser en place », ce qui est en général juste et parfois la raison pour laquelle un GIF transparent bave.

Un détail où la spécification et la réalité se séparent. « Revenir au fond » désigne une couleur de fond inscrite dans l'en-tête du fichier, et tous les navigateurs l'ignorent et effacent vers le transparent. Ils font cela depuis vingt-cinq ans. Un fichier qui compte sur l'apparition de cette couleur de fond aura l'air correct pour celui qui l'a fait, dans le logiciel qui l'a fait, et faux partout ailleurs.

## Les tables de couleurs, et les 768 octets qu'elles coûtent

Un pixel de GIF n'est pas une couleur. C'est un nombre qui pointe dans une table d'au plus 256 couleurs, chacune stockée sur trois octets. Une table complète fait donc 768 octets, et un fichier peut en avoir une partagée par tout le monde, ou une par image, ou les deux.

Les deux arrangements sont légitimes et n'échangent pas la même chose :

- **Une table partagée**, ce sont 768 octets pour tout le fichier, et elle garde les couleurs stables d'une image à l'autre. Le scintillement des GIF — ce miroitement désagréable sur un fichier tiré d'une vidéo — n'est très souvent que la palette qui tressaute d'une image à l'autre.
- **Une table par image** permet à chaque image d'utiliser des couleurs que la table partagée n'a pas, ce qui compte quand la scène change entièrement. Cela coûte 768 octets à chaque fois. Sur une animation de 300 images, cela fait 230 Ko de tables de couleurs avant même qu'un seul pixel ne soit enregistré.

Il y a un second coût, plus discret. La longueur d'une table de couleurs doit être une puissance de deux : une image qui utilise neuf couleurs reçoit donc une table de seize, et une qui en utilise 130 en reçoit 256. Un peu d'arrondi est inévitable. Un fichier dont les tables déclarent cinq mille couleurs auxquelles ses pixels ne se réfèrent jamais, c'est autre chose : des palettes construites pour une image autre que celle qui a fini dans le cadre. L'analyseur signale les entrées inutilisées pour que cela se voie d'un coup d'œil.

## Où passent réellement les octets

Chaque octet d'un GIF se trouve à l'un d'un petit nombre d'endroits, et il vaut la peine de savoir lesquels avant de décréter qu'un fichier est trop lourd.

- **Les pixels compressés.** Sur un fichier sain, presque tout. L'image elle-même, passée par LZW — un procédé de compression de 1984 conçu pour des captures d'écran de tableurs, ce qui explique qu'il se débrouille bien sur les aplats et mal sur les photographies.
- **Les tables de couleurs.** 768 octets par table complète, comme ci-dessus.
- **Les en-têtes par image.** Huit octets de minutage et onze de descripteur pour chaque image. Rien du tout sur un fichier normal ; sur une animation de deux mille images minuscules, 38 Ko.
- **Le découpage en blocs.** Les données compressées sont coupées en tronçons d'au plus 255 octets, chacun précédé d'un octet de longueur. Environ un octet sur 256, inévitable, et bon à voir puisqu'il est invisible autrement.
- **Les métadonnées.** Commentaires, profils de couleur et paquets XMP. C'est celle qui produit les résultats franchement absurdes : un logiciel de retouche peut laisser 40 Ko de XML décrivant une modification faite il y a des années, et sur un petit GIF cela représente l'essentiel du fichier. Aucune visionneuse n'en dessine quoi que ce soit.

Si l'on regarde cela sous forme de tableau plutôt que de deviner, c'est parce que la réponse change d'un fichier à l'autre, et que le remède découle de la réponse. Un fichier fait à 95 % de pixels compressés, c'est simplement beaucoup d'image, et seuls moins d'images, une taille plus petite ou moins de couleurs y changeront quelque chose. Un fichier fait à 30 % de tables de couleurs ou à 40 % de XMP a un problème bien moins coûteux.

![Une barre détaillant un GIF selon la destination de ses octets, avec une ligne par image donnant sa taille et sa part du fichier.](https://abox.tools/screens/whats-inside-a-gif/budget.webp)

Où sont réellement passés les octets, image par image. Un GIF trop gros l'est presque toujours pour une raison que cela rend évidente.

## La boucle ne fait pas partie du format

Aucun champ de la spécification GIF ne dit qu'une animation se répète. La boucle vient d'un bloc que Netscape a inventé en 1995 — une « extension applicative » contenant la chaîne `NETSCAPE2.0` — que tout le monde a implémenté malgré tout et qui figure aujourd'hui dans tous les GIF animés d'internet.

Autrement dit, un fichier dépourvu de ce bloc se joue exactement une fois puis s'arrête, dans tous les navigateurs, et paraît cassé à celui qui l'a fait. Si une animation ne passe qu'une fois, c'est ce bloc qui manque ; c'est l'une des premières choses à vérifier, et elle est invisible dans toutes les visionneuses.

Le bloc peut aussi indiquer un nombre — jouer cinq fois puis s'arrêter. Zéro veut dire indéfiniment, et c'est ce que dit presque tout fichier.

## Les autres choses qu'un GIF peut transporter

Trois blocs qui ne contiennent aucune image et que toutes les visionneuses sautent :

- **Les commentaires.** Du texte libre, en général le nom du logiciel qui a écrit le fichier, parfois quelque chose que l'auteur n'aurait pas choisi de publier. Rien ne l'affiche, et chaque copie du fichier le transporte.
- **XMP.** Les métadonnées XML d'Adobe : quel logiciel a modifié le fichier, quand, parfois qui. Cela arrive avec une queue magique de 258 octets à la fin, une astuce pour que les longueurs de blocs tombent juste, et c'est pourquoi le lire naïvement remplit l'écran de binaire.
- **Le texte simple.** Un bloc de la spécification de 1989 qui demande à la visionneuse de dessiner du texte par-dessus l'image dans une grille de cellules. Rien ne l'a jamais implémenté. Si un fichier en contient un, ce qu'il dit n'apparaîtra pas.

Il vaut la peine de connaître les trois avant d'envoyer un fichier quelque part : ce sont les parties d'un GIF qui peuvent dire quelque chose sur vous, et elles survivent à chaque copie et à chaque réenvoi, sauf si quelque chose les retire volontairement.

## Lire un fichier abîmé

Les GIF se font tronquer — un téléchargement interrompu, un fichier récupéré sur un disque mourant, quelque chose dont une application n'a écrit que la moitié. Comme le format est un flux de blocs et non une structure indexée, un GIF tronqué reste généralement lisible jusqu'à l'endroit où il s'arrête : toutes les images antérieures à la coupure sont intactes et complètes.

C'est bon à savoir, parce que la plupart des logiciels se contentent de refuser le fichier. Un analyseur qui lit aussi loin qu'il le peut et dit où il s'est arrêté vous apprendra au moins combien il en reste, et si la partie manquante est une image ou les deux cents dernières.

Le problème inverse existe aussi : des octets posés *après* la marque de fin du fichier. Tout décodeur s'arrête à cette marque ; ils ne sont donc jamais lus ni dessinés, et ce sont d'ordinaire les restes d'un second fichier accolé au premier par quelque chose qui a mal tourné. C'est du poids pur, et les couper ne fait rien perdre.

## Rien de tout cela n'a besoin d'un envoi

Lire la structure d'un GIF n'est pas un travail exigeant — c'est une promenade dans une liste de blocs et un petit décompresseur — et il n'y a jamais eu de raison technique d'envoyer le fichier à un serveur pour cela. L'[Analyseur de GIF](https://abox.tools/fr/analyser-un-gif/) fait ici tout dans la page : le parcours des blocs, le LZW, les images dessinées à l'écran et la comptabilité des octets.

Cela compte davantage pour cette tâche que pour la plupart, car les fichiers qu'on a le plus envie de démonter sont souvent ceux qu'on est le moins sûr de vouloir partager — quelque chose de récupéré, quelque chose que quelqu'un vous a envoyé, quelque chose contenant un bloc de commentaire que vous n'avez pas encore lu. L'[argument détaillé sur l'envoi de fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) vaut ici autant que partout ailleurs sur ce site.
