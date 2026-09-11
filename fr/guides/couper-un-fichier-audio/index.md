# Comment couper un audio sans perdre en qualité

Une coupe audio tombe sur l'instant exact que vous avez marqué, dans tous les lecteurs, toujours — ce qui n'est pas vrai de la vidéo. Voici pourquoi, quel est le seul vrai piège, et quoi y faire.

[Ouvrir Découpeur audio](https://abox.tools/fr/couper-un-audio/): Marquez au vol les passages à garder. Ils vous reviennent en un seul fichier, coupé là où vous l'avez dit.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez le [Découpeur audio](https://abox.tools/fr/couper-un-audio/), déposez l'enregistrement, appuyez sur `I` et `O` pour marquer chaque passage que vous gardez — autant que vous voulez — puis exportez. Chaque coupe tombe sur l'échantillon exact que vous avez marqué, les échantillons gardés ressortent tels qu'ils sont entrés, et les raccords reçoivent un fondu de cinq millisecondes pour qu'ils ne puissent pas claquer.

C'est tout le travail. Le reste de cette page explique pourquoi cette exactitude est réelle et non un argument commercial, et quelle est la seule chose qui, elle, se passe mal quand on met bout à bout deux morceaux de son.

## Pourquoi une coupe audio peut être exacte quand une coupe vidéo ne l'est pas

La vidéo n'est pas enregistrée comme une suite d'images complètes — ce serait énorme. La plupart des images sont enregistrées comme une description de ce qui les distingue de leurs voisines : elles ne peuvent donc pas être décodées seules. Seule une **image clé** tient debout toute seule, et les images clés sont d'ordinaire espacées d'une à dix secondes. Un découpeur qui recopie les images ne peut donc pas démarrer où bon vous semble : il doit commencer sur une image clé, d'où les vidéos coupées qui commencent parfois une ou deux secondes avant votre repère. [Le guide vidéo](https://abox.tools/fr/guides/couper-une-video/) parle surtout de cela.

Le son n'a pas d'équivalent. Une fois décodé, un enregistrement est une suite de nombres — un par canal, des dizaines de milliers de fois par seconde — et chacun d'eux tient entièrement tout seul. L'échantillon 1 234 567 n'a pas besoin du 1 234 566 pour avoir un sens. La coupe peut donc se faire sur n'importe quel échantillon, et « exactement là où vous avez marqué » veut dire exactement cela : votre repère en secondes, multiplié par la fréquence d'échantillonnage, arrondi à l'échantillon entier le plus proche. À 48 kHz, cet arrondi vaut au plus dix microsecondes.

Il n'y a pas non plus de comportement dépendant du lecteur. Une vidéo coupée s'appuie sur une marque de montage que la plupart des lecteurs respectent et que certains ignorent ; un WAV coupé, ce sont les échantillons et rien d'autre, il ne reste donc plus rien sur quoi un lecteur puisse diverger.

## Le piège : un raccord est une discontinuité

Voici ce qui se passe réellement mal quand on coupe du son, et la raison pour laquelle un bon découpeur a un réglage pour cela.

Le son est une onde. Quand vous coupez au milieu d'un mot pour enchaîner au milieu d'un autre, l'échantillon de fin du premier morceau et celui de début du second n'ont aucun rapport : la forme d'onde peut sauter du haut de sa plage au bas en un seul échantillon. Une membrane de haut-parleur à qui l'on demande ce saut produit le son le plus sec dont elle est capable, et vous l'entendez comme un **clic** au raccord.

Cela n'a rien à voir avec une perte de qualité ni avec le format. Cela arrive avec une coupe parfaitement sans perte d'un enregistrement parfaitement propre. C'est simplement le son que fait une discontinuité. Un découpeur qui coupe sur l'échantillon exact et ne fait rien d'autre claquera sur certains raccords et pas sur d'autres, uniquement selon l'endroit de la forme d'onde où les deux bouts sont tombés.

## Ce que fait réellement un fondu de cinq millisecondes

Le remède consiste à ramener le niveau au silence juste avant la coupe et à le remonter juste après, pour qu'il n'y ait plus de saut à faire. C'est tout ce qu'est un « fondu » ici : une rampe appliquée à quelques centaines d'échantillons de chaque côté.

La durée est la partie intéressante. Cinq millisecondes, cela fait environ deux cent quarante échantillons à 48 kHz. C'est assez long pour que la membrane fasse le trajet — le clic disparaît complètement — et bien trop court pour s'entendre comme un fondu : cinq millisecondes, c'est à peu près le cinquième du temps qu'il faut pour prononcer une seule consonne. Vous ne percevrez pas le niveau bouger. Vous percevrez seulement que le raccord est propre.

Des fondus plus longs sont proposés parce que certaines matières les réclament. Vingt ou cinquante millisecondes valent le détour pour raccorder de la musique, où ce qu'on interrompt est une note tenue et non une syllabe, et où la rampe la plus courte peut encore laisser un pop audible. La parole n'a presque jamais besoin de plus de cinq.

Un fondu n'a sa place que sur un bord qui est *vraiment* une coupe. Si un passage commence tout au début de l'enregistrement, rien n'a été retiré devant lui — le fichier commençait déjà là avant qu'on ne coupe quoi que ce soit — et le faire apparaître en fondu serait une modification que personne n'a demandée. L'outil d'ici ne pose des fondus que là où un raccord existe ; c'est pourquoi ne rien couper du tout laisse chaque échantillon intact.

![La carte d'export : un menu de profondeur en bits, une longueur de fondu en millisecondes et un récapitulatif comptant les parties, les raccords et la durée.](https://abox.tools/screens/trim-an-audio-file/export.webp)

Le fondu n'est appliqué qu'à un raccord, et c'est le détail qui compte : un fondu au début d'un enregistrement serait une modification que personne n'a demandée.

## Couper un MP3, et pourquoi il en ressort un WAV

Vous pouvez ouvrir un MP3, un M4A, un Ogg ou un fichier Opus et le couper. Ce qui revient est un WAV, et il vaut mieux nommer clairement le compromis que cela représente plutôt que de le présenter comme une qualité.

Il y a deux façons de couper de l'audio compressé. La première consiste à découper directement les données compressées, en déplaçant des trames encodées entières dans un nouveau fichier sans les décoder. Le fichier reste petit et rien n'est perdu en qualité — mais une trame MP3 dure environ vingt-six millisecondes, donc chaque coupe est arrondie à la frontière de trame la plus proche, ce qui est la version sonore du problème des images clés. C'est aussi un travail lié au format : un lecteur MP3 ne coupe aucun fichier Opus.

L'autre façon consiste à décoder, couper sur l'échantillon exact, et réécrire les échantillons. Rien n'est arrondi, tous les formats que le navigateur sait lire fonctionnent pareil, et les fondus deviennent tout simplement possibles — on ne peut pas appliquer une rampe à un niveau qu'on n'a pas décodé. Le prix, c'est qu'il faut réécrire les échantillons dans un format, et qu'aucun navigateur ne fournit d'encodeur MP3 ou AAC utilisable ici. Un WAV n'a besoin d'aucun encodeur : ce sont les échantillons précédés d'un court en-tête, et cette étape-là ne peut rien perdre.

Les conséquences pratiques : ce qui sort est bien plus lourd que ce qui est entré — environ dix mégaoctets par minute en stéréo — et ce n'est pas *meilleur* que le MP3 d'origine, puisque la compression déjà subie ne se défait pas. Un WAV s'ouvre partout, et tout ce qui réclame un MP3 peut en fabriquer un à partir de là en une étape.

## Marquer plusieurs passages d'un coup

La plupart des découpeurs en ligne vous donnent une paire de poignées et demandent quel unique morceau garder. Pour de vrais enregistrements, c'est répondre à la mauvaise question. Une heure d'entretien n'a pas un bon passage ; elle en a six, éparpillés, et on les trouve en l'écoutant une fois.

Marquez donc en écoutant : `I` où un passage commence, `O` où il finit, autant de fois que vous voulez. Chaque paire devient une ligne que vous pouvez recaler ou réordonner, et une bande dessinée sur la forme d'onde. Le fichier fini, ce sont ces lignes mises bout à bout.

La même liste de repères répond aussi à la question inverse. Si ce que vous voulez faire disparaître, ce sont les « euh », le téléphone qui sonne et les faux départs, marquez *ceux-là* et basculez sur « les enlever » — c'est alors tout ce que vous n'avez pas marqué qui est raccordé. Ce sont les mêmes repères dans les deux sens : vous pouvez passer de l'un à l'autre et regarder la durée finale changer sans rien marquer deux fois.

Marquer est un travail soigneux, et un onglet fermé ne devrait pas le coûter : les repères s'enregistrent donc dans un simple fichier texte et se rechargent. La disposition est celle qu'écrit le [Coupeur de vidéos](https://abox.tools/fr/couper-une-video/), ce qui veut dire que des repères posés sur une vidéo peuvent être déposés sur son audio extrait, et inversement.

## Regardez la forme d'onde

Marquer du son en le faisant défiler, c'est deviner ; le marquer à l'œil ne l'est pas. Le silence ressemble à du silence, une toux ressemble à une toux, et les quatre secondes d'ambiance avant que quelqu'un ne se mette à parler se voient immédiatement au lieu de devoir être cherchées.

Cela compte surtout pour les repères que tout le monde place un peu de travers : le début d'une phrase veut d'ordinaire se poser dans le silence *avant* la respiration, et non après, et la fin veut d'ordinaire un temps d'ambiance plutôt qu'une coupe sur la dernière consonne. Les deux sautent aux yeux sur l'image et sont presque impossibles à viser à l'oreille seule. Tirez les extrémités d'un passage marqué le long de la forme d'onde pour les ajuster.

![Une forme d'onde avec deux sections marquées, les silences entre les phrases bien visibles, et un tableau donnant le début, la fin et la durée de chaque section.](https://abox.tools/screens/trim-an-audio-file/marks.webp)

Les silences sont là où quelqu'un s'est arrêté de parler. C'est ce qui rend une forme d'onde utile à regarder, contrairement à un chronomètre.

## Couper n'est pas fondre, et ce n'est pas monter

Trois mots qu'on prend l'un pour l'autre. Couper change quelles parties de l'enregistrement survivent. Un fondu — celui des musiciens, sur plusieurs secondes — est un effet volontaire sur le niveau, et les quelques millisecondes décrites plus haut n'en sont pas un : c'est de la suppression de clic, qui se trouve utiliser le même calcul.

Si ce que vous voulez, c'est l'enregistrement à l'envers, accéléré, ralenti sans que la hauteur bouge, ou remonté parce qu'il a été enregistré trop bas, c'est l'[Éditeur audio](https://abox.tools/fr/modifier-un-audio/). C'est le même décodeur et le même écrivain de WAV ; seul le calcul entre les deux change.

## Pourquoi cela n'a pas besoin d'un envoi

Couper, c'est de l'arithmétique sur un tableau de nombres. Le navigateur a déjà le décodeur — c'est celui-là même qui joue le fichier dans un élément `<audio>` — et une fois les échantillons décodés, en garder certains et laisser tomber les autres est une copie. Il n'y a dans cette description aucune étape qu'un serveur ferait mieux, et l'aller-retour jusqu'à lui serait la partie la plus lente de tout le travail.

C'est aussi un type de fichier pour lequel l'envoi coûte plus cher qu'on ne le croit. Les enregistrements, ce sont des voix : entretiens, cours, appels, mémos vocaux, séances de thérapie, un enfant qui dit quelque chose qu'on veut garder. L'outil d'ici n'a aucune fonction réseau, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter ; aucune n'appartient à ce site.

Débranchez internet et coupez un enregistrement quand même, si vous préférez vérifier plutôt qu'être rassuré. [Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) propose trois autres vérifications du même genre.
