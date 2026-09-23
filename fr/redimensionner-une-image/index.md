# Redimensionner une image — redimensionner, recadrer et convertir

Vous dites la taille. Vous tracez le cadre. Vous choisissez le format.

> Redimensionnez, recadrez et convertissez des images JPEG, PNG et WebP dans votre navigateur. Pixels exacts, pourcentage, ou plus grand côté - une image ou un dossier entier. Rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/redimensionner-une-image/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

Le redimensionnement, le recadrage et le changement de format se font tous dans votre propre navigateur, sur votre propre matériel, avec les encodeurs d'images qu'il embarque déjà. Cet outil ne comporte aucune fonction réseau, si bien qu'il n'a rien à aller chercher et rien à envoyer. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une image.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment redimensionner une image sans l'envoyer

1. **Choisissez vos images.** Déposez-les sur la zone prévue ou sélectionnez-les à la main. Le navigateur les lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Recadrez, si vous voulez.** Le cadre part sur l'image entière, si bien que le laisser tranquille ne recadre rien. Faites-le glisser, ou verrouillez-le sur une forme, 1:1 pour une photo de profil, 9:16 pour une story, 16:9 pour une vignette, et appuyez sur « Le plus grand » pour le plus grand qui tienne. Chaque image garde son propre cadre : cliquez sur une ligne de la liste pour dessiner sur celle-là. Si elles doivent toutes être cadrées de la même façon, un bouton le fait aussi.
3. **Dites la taille de sortie.** Une largeur, une hauteur, ou les deux ; un plus grand côté, qui met les prises verticales et horizontales à la même taille ; ou un simple pourcentage. Laissez l'un des deux champs vide et l'image garde sa propre forme.
4. **Choisissez le format, puis appuyez sur le bouton.** Gardez le format d'arrivée de chaque fichier, ou écrivez tout en JPEG, en PNG ou en WebP. Chaque résultat dit ce qu'il est devenu et de combien il a maigri ; cliquez dessus pour l'ouvrir en grand avec tous les chiffres derrière, et l'original à côté pour comparer. Un lot arrive en un seul zip.

## La version longue

[Comment redimensionner une image sans l'abîmer](https://abox.tools/fr/guides/redimensionner-une-image/): Ce qui arrive à une image quand on change ses dimensions en pixels : pourquoi réduire est sans danger et agrandir ne l'est pas, que faire quand le cadre n'a pas la bonne forme, et quand recadrer plutôt.

## Aussi dans la boîte

- [HEIC vers JPG](https://abox.tools/fr/convertir-heic-en-jpg/): Les photos que fait un iPhone, dans un format que tout ouvre.
- [Photo d'identité](https://abox.tools/fr/photo-d-identite/): Choisissez le pays. L'outil applique sa règle, exactement.
- [Empileur d'images](https://abox.tools/fr/empiler-des-images/): Vingt prises n'en font plus qu'une, sans vingt envois et sans dérawtiseur.
- [Caviardage d'image](https://abox.tools/fr/caviarder-une-image/): Ce que vous recouvrez est supprimé du fichier, pas dissimulé dedans.

## Questions

### Mon image est-elle envoyée quelque part ?

Non. Le fichier est décodé, recadré, mis à l'échelle et écrit par votre propre navigateur sur votre propre matériel, avec les encodeurs JPEG, PNG et WebP qu'il embarque déjà. Cet outil ne comporte aucune fonction réseau, si bien qu'il ne va jamais rien chercher et n'envoie jamais rien. Sa `Content-Security-Policy` énumère par ailleurs toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site.

### Que se passe-t-il si je donne une largeur mais pas de hauteur ?

La hauteur découle de la forme même de l'image, ce qui est presque toujours ce que l'on voulait : « 1920 de large » veut dire « 1920 de large et la hauteur que cela donne ». Remplissez les deux et ils peuvent contredire la forme de l'image ; c'est le seul moment où apparaît le choix « si les formes se contredisent », qui propose de tenir dans le cadre, de le remplir en coupant ce qui dépasse, de compléter avec un fond, ou d'étirer en acceptant la déformation.

### Redimensionner une image fait-il perdre de la qualité ?

Réduire une image, non, d'aucune façon visible : il entre plus de pixels qu'il n'en sort, et le détail conservé est du vrai détail. Agrandir, en revanche, ne peut pas ajouter ce qui n'a jamais été photographié, et le résultat est une copie plus molle de la même image plutôt qu'une plus nette. C'est pourquoi « ne jamais agrandir une image au-delà de sa taille de départ » est actif par défaut. Ce qui coûte un peu, c'est le réencodage qui suit, si le format est du JPEG ou du WebP, et le curseur de qualité est ce que vous y dépensez.

### Puis-je recadrer chaque image différemment ?

Oui, c'est même le comportement par défaut. Chaque image de la liste porte son propre cadre, dans ses propres pixels, et cliquer sur une ligne met cette image dans l'aperçu avec son cadre et sa forme verrouillée à elle. Ce que vous faites à l'une n'affecte pas les autres. Chaque cadre part aussi de l'image entière : une image sur laquelle vous ne dessinez jamais n'est pas recadrée du tout.

### Peut-il recadrer tout un lot de la même façon d'un coup ?

Oui, avec le bouton sous l'aperçu. Il donne à toutes les autres images la même zone relative, autrement dit les mêmes fractions de leur propre largeur et de leur propre hauteur, ce qui, pour un jeu de captures ou d'exports tous de la même taille, revient exactement au même cadre, et la page le dit. Avec une forme verrouillée, il donne à chacune le plus grand cadre de cette forme à l'intérieur de cette zone : appuyer sur 1:1 puis sur ce bouton vous sort donc des carrés d'un dossier mêlant portraits et paysages. Chaque cadre reste modifiable ensuite.

### Quels formats sait-il lire et écrire ?

Il lit tout ce que votre navigateur sait décoder, ce qui revient en pratique au JPEG, au PNG, au WebP, au GIF, au BMP, ainsi qu'à l'AVIF sur la plupart des navigateurs actuels. Il écrit du JPEG, du PNG et du WebP, parce que ce sont là les encodeurs que les navigateurs embarquent. Avec « garder le format », un JPEG reste un JPEG et un PNG reste un PNG ; tout ce que le navigateur ne sait pas écrire, comme un GIF ou un BMP, ressort en PNG, celui qui garde la transparence et les aplats intacts.

### Qu'arrive-t-il à la transparence quand j'enregistre en JPEG ?

Elle est remplie avec la couleur de fond, parce que le JPEG n'a pas de canal alpha où la stocker. La couleur est à vous de la choisir et part du blanc, ce que la plupart des gens veulent et ce que fait presque tout autre outil sans vous le dire. La même couleur est utilisée derrière un cadre complété. Enregistrez plutôt en PNG ou en WebP et la transparence passe intacte.

### Supprime-t-il les données EXIF et GPS ?

Pour tout ce qu'il traite réellement, oui, par effet de bord : recadrer ou redimensionner revient à décoder l'image en pixels puis à réencoder ces pixels, or un canvas rempli de pixels ne porte aucune étiquette, si bien que le lieu, le modèle d'appareil et les horodatages ne sont tout simplement pas écrits dans le nouveau fichier. Un fichier que vous ne changez pas du tout relève d'un autre cas, puisqu'il vous est rendu octet pour octet, étiquettes comprises. Si vous voulez faire disparaître les métadonnées en laissant l'image intacte, prenez le [lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/), qui réécrit le conteneur sans rien recompresser.

### En quoi est-ce différent du compresseur d'images ?

Celui-ci parle de dimensions : vous dites combien de pixels vous voulez et il vous les donne. Le [compresseur d'images](https://abox.tools/fr/compresser-une-image/) parle de taille de fichier : vous dites combien de kilooctets vous avez le droit d'occuper et il cherche la meilleure qualité qui tienne, en ne redimensionnant que si la qualité seule n'y suffit pas. Si on vous a dit « 1200 pixels de large », vous êtes au bon endroit. Si on vous a dit « sous 500 KB », l'autre vous en approchera davantage.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le nombre et la taille des fichiers ne sont pas limités non plus, parce qu'aucun serveur ne les paie et que tout le travail se fait sur votre propre machine. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos images.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait vos images ailleurs pour les redimensionner s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Vos images n'ont nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où vos fichiers pourraient aboutir, ni rien dans le code qui les y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** On ne trouve ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`. Le redimensionnement, c'est un `drawImage` sur un canvas suivi d'un `canvas.toBlob`, c'est-à-dire le rééchantillonneur et l'encodeur déjà installés dans votre navigateur.
- **Un fichier que personne n'a demandé de changer n'est pas changé.** Sans recadrage, sans redimensionnement et sans changement de format, le fichier que vous avez choisi vous est rendu octet pour octet plutôt que réenregistré. Ce n'est pas une question de politesse, mais bien ce qui empêche cet outil de réencoder discrètement une image, ou d'en jeter tout aussi discrètement les métadonnées, alors que vous vouliez seulement la regarder.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit sur vos images. Chaque ligne qui lit, recadre, met à l'échelle ou écrit un fichier est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/geometry.js` pour l'arithmétique qui décide de ce qui est gardé et de la taille de sortie, et `src/codecs.js` pour l'unique appel à `drawImage` qui fait le recadrage et le redimensionnement ensemble.
