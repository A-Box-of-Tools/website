# Comment faire pivoter une vidéo sans perdre de qualité

Une vidéo qui apparaît de côté n’a jamais été tournée : le téléphone a écrit une instruction dans l’en-tête, et un logiciel l’ignore. Voici ce qu’elle indique, pourquoi sa correction devrait prendre quelques secondes sans rien perdre et quand l’autre méthode vaut son coût.

[Ouvrir Rotation vidéo](https://abox.tools/fr/faire-pivoter-une-video/): Un quart de tour, un demi-tour, dans l’autre sens. Inscrit dans l’en-tête sans décoder une image ni perdre de qualité.

Dernière mise à jour 13 septembre 2026

## La réponse rapide

Ouvrez l’outil de [rotation vidéo](https://abox.tools/fr/faire-pivoter-une-video/), déposez la vidéo, choisissez la rotation qui remet l’aperçu dans le bon sens et appuyez sur le bouton. La rotation est inscrite dans l’en-tête du fichier et toutes les images sont copiées telles quelles : cela prend quelques secondes et ne perd rien. Le résultat est rouvert pour vérifier l’instruction demandée, puis lu dans le bon sens sous le téléchargement. Rien n’est envoyé.

La suite explique pourquoi cela suffit. La plupart des outils et des conseils traitent une rotation comme un réencodage, alors qu’elle n’en demande pas.

## Pourquoi la vidéo apparaît de côté

Le capteur d’un téléphone est en orientation paysage. Quand vous filmez en tenant le téléphone debout, le capteur voit toujours une image en paysage couchée sur le côté, et le téléphone enregistre exactement cela pour chaque image. Il ajoute une instruction dans l’en-tête — une matrice d’affichage de neuf nombres — indiquant « afficher avec un quart de tour à droite ». Téléphones, navigateurs, lecteurs et éditeurs modernes lisent cette instruction et tournent l’image pour l’écran. Voilà pourquoi elle paraît correcte sur votre téléphone.

Une vidéo qui apparaît de côté est une vidéo dont l’instruction est ignorée ou incorrecte : l’appareil a mal deviné son orientation, un convertisseur a supprimé l’en-tête ou un vieux lecteur ne le lit pas. Le problème vient de l’instruction, pas des images.

## La correction consiste donc à modifier neuf nombres

Faire pivoter la vidéo consiste à écrire une instruction différente. Les images restent exactement les mêmes — sans décodage, sans réencodage, sans modification — et le fichier garde presque la même taille, dans le temps nécessaire pour le lire une fois. C’est ce que l’outil de [rotation vidéo](https://abox.tools/fr/faire-pivoter-une-video/) fait par défaut : il combine la rotation choisie avec celle déjà indiquée, écrit la matrice résultante et copie chaque image et chaque paquet audio octet pour octet.

La plupart des outils en ligne décodent la vidéo, tournent les pixels et réencodent tout. Cela coûte une génération de qualité, prend le temps d’un encodage et produit des images toutes différentes des originales, pour une opération qui demandait neuf nombres. Ils procèdent ainsi parce qu’une seule méthode qui réencode toujours est plus simple à écrire que deux, pas parce que la vidéo l’exige.

## Quand inscrire la rotation dans les pixels est utile

Quelques vieux lecteurs de bureau ignorent la matrice d’affichage et montrent les images telles qu’elles sont enregistrées, de côté. Si la vidéo leur est destinée, ou si vous ne pouvez pas vérifier sa destination, l’en-tête ne suffit pas : il faut tourner les pixels. L’outil propose une case « inscrire la rotation dans l’image » et fait alors comme les outils en ligne : il dessine chaque image tournée et la réencode en H.264, avec un débit un peu supérieur à celui de la source pour laisser à cette deuxième génération assez de marge. Cela coûte une génération de qualité et le temps d’un encodage ; c’est pourquoi la page présente cette méthode comme un second choix.

Pour un WebM ou MKV dont l’image n’est pas en H.264, la rotation est inscrite dans les pixels même sans cocher la case : l’outil ne peut construire un en-tête MP4 qu’autour d’images H.264. La page le signale dans ce cas.

## Quel sens choisir ?

Un quart de tour à droite suit les aiguilles d’une montre, comme le haut de l’image quand vous tournez le téléphone à droite. L’outil montre la première image tournée avec les mêmes calculs que ceux de l’en-tête : choisissez le bouton qui rend l’aperçu correct. Une vidéo à l’envers demande un demi-tour ; une orientation mal devinée par l’appareil demande souvent un quart de tour dans le sens opposé à celui attendu.

## Pourquoi l’envoi du fichier est la partie étrange

Chaque outil de rotation en ligne demande d’abord le fichier. Tout passe par votre connexion — un gigaoctet de vacances, de cours ou de match — pour qu’une copie tournée revienne. L’envoi prend plus de temps que toute l’opération, avant même la question de la conservation du fichier. C’est étrange, car rien ici n’exige un serveur : lire et écrire un en-tête représente quelques kilo-octets de travail, et même la rotation des pixels utilise les codecs déjà présents dans votre navigateur.

L’outil de [rotation vidéo](https://abox.tools/fr/faire-pivoter-une-video/) travaille dans le navigateur. Il lit le fichier par morceaux depuis votre disque, écrit un nouvel en-tête et produit le résultat en mémoire. La politique de sécurité de la page énumère toutes les adresses qu’elle peut contacter, et aucune n’est celle de ce site. Déconnectez le réseau : il continue à fonctionner. C’est la preuve la plus simple.

## Vérifiez avant d’envoyer

L’outil rouvre son propre résultat avec le lecteur qu’il utilise pour votre fichier et vérifie trois choses : la durée d’origine, la rotation demandée avec les dimensions correspondantes et le son annoncé. Il lit ensuite le résultat en mémoire sous le téléchargement. Regardez un instant — une rotation se voit immédiatement — puis enregistrez. Gardez aussi l’original : la rotation ordinaire ne perd rien, mais l’original reste la seule version qui ne soit pas une copie.
