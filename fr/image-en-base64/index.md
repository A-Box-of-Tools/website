# Image en data URI — encoder une image en base64 pour le CSS ou le HTML

L'image entière en une ligne de texte. À coller directement dans du CSS ou du HTML.

> Transformez un PNG, un JPEG, un SVG ou un WebP en data URI à coller dans du CSS ou du HTML. Les SVG sont encodés en pourcents plutôt qu'en base64 : ils restent lisibles et plus courts. Rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/image-en-base64/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

L'encodage se fait dans votre propre navigateur, sur votre propre matériel. C'est de l'arithmétique sur des octets que la page a déjà : pas d'encodeur, pas de serveur, et aucune étape réseau à omettre. Cet outil ne comporte aucune fonction réseau, si bien qu'il n'a rien à aller chercher et rien à envoyer. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une image.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans réencodage
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment transformer une image en data URI

1. **Choisissez vos images.** Déposez-les sur la zone prévue ou sélectionnez-les à la main. Le navigateur les lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Dites où va le résultat.** L'URI seul, une règle CSS, une propriété personnalisée, une balise `<img>` ou du Markdown. Chacun met l'URI entre guillemets, et c'est le détail qui décide si un SVG intégré fonctionne ou échoue en silence.
3. **Lisez ce que cela a coûté.** Chaque résultat dit en combien de caractères il s'est transformé, de combien c'est plus lourd que le fichier, et s'il est raisonnable d'intégrer quelque chose de cette taille. Le base64 ajoute un tiers ; que ce tiers vaille une requête économisée dépend entièrement de la taille, aussi la page dit-elle de quel côté de la ligne vous vous trouvez.
4. **Regardez les avertissements.** Si l'image porte de l'EXIF, un profil colorimétrique ou du XMP, ils sont nommés avec le nombre d'octets de votre résultat qu'ils représentent. Si l'extension contredit le format réel, la page suit le format et vous le dit. Si votre navigateur ne sait pas dessiner le résultat, elle le dit aussi.
5. **Copiez, ou téléchargez.** Un bouton par résultat, et un pour tous d'un coup. Les propriétés personnalisées ressortent enveloppées dans un bloc `:root`, prêtes à coller en tête d'une feuille de style.

## La version longue

[Quand mettre une image dans votre CSS, et quand s'abstenir](https://abox.tools/fr/guides/integrer-une-image-dans-le-css/): Ce que coûte un data URI, pourquoi le base64 ajoute un tiers que le gzip ne rend pas, pourquoi un SVG ne devrait jamais être en base64, et l'erreur de guillemets qui casse les SVG intégrés sans rien dire.

## Aussi dans la boîte

- [SVG en image](https://abox.tools/fr/convertir-svg-en-png/): Vous donnez la taille. Un vectoriel n'en a aucune à perdre.
- [Image en SVG](https://abox.tools/fr/convertir-image-en-svg/): Une forme, un contour. Pointez ce qui ne devrait pas y être.
- [Comparateur de tailles](https://abox.tools/fr/comparer-des-tailles/): Tapez les tailles, emportez l'image. Rien n'est envoyé pour la dessiner.
- [Compresseur d'images](https://abox.tools/fr/compresser-une-image/): Vous donnez la taille. Il se charge du reste.

## Questions

### Mon image est-elle envoyée quelque part ?

Non. Le fichier est lu et encodé par votre propre navigateur sur votre propre matériel, avec deux fonctions qu'il possède déjà. Cet outil ne comporte aucune fonction réseau, si bien qu'il ne va jamais rien chercher et n'envoie jamais rien. Sa `Content-Security-Policy` énumère par ailleurs toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site.

### Qu'est-ce qu'un data URI ?

Une façon d'écrire un fichier entier là où irait normalement une adresse web. Au lieu de `url("logo.png")`, qui dit au navigateur d'aller chercher quelque chose, vous écrivez `url("data:image/png;base64,iVBORw0...")`, qui contient l'image elle-même. Le navigateur la décode sur place. L'effet pratique est une requête de moins : l'image arrive avec la feuille de style ou la page plutôt qu'après elle.

### Pourquoi mon SVG n'est-il pas en base64 ?

Parce que le base64 est le mauvais encodage pour lui. Un SVG est du texte, et une URL sait déjà transporter du texte, puisque seule une poignée de caractères doit y être échappée. Les encoder en pourcents et laisser le reste tranquille produit un URI typiquement un cinquième plus court que le base64 du même fichier, et que vous pouvez encore lire dans votre feuille de style : les noms d'éléments, les couleurs et le `viewBox` sont tous encore là, modifiables. Une case permet de forcer le base64 pour la rare chaîne d'outils qui l'exige.

### De combien le base64 alourdit-il mon image ?

D'environ un tiers. Trois octets de fichier deviennent quatre caractères de base64, soit 33 % avant même le `data:image/png;base64,` de tête. C'est le plancher, et il est incontournable : c'est ce que coûte l'écriture d'octets quelconques avec les seuls caractères qu'une URL autorise. C'est aussi pourquoi la page affiche le nombre de caractères à côté de la taille du fichier, plutôt que de vous laisser le découvrir une fois la feuille de style déployée.

### Quand intégrer une image est-il vraiment une bonne idée ?

Quand elle est petite et qu'elle est nécessaire tout de suite. Une icône de 2 KB dans une feuille de style que toutes les pages chargent est un gain clair : un aller-retour de moins, et l'image est là dès que le CSS l'est. Passé une dizaine de kilooctets, le marché s'inverse. Une image intégrée n'est plus un fichier séparé : elle ne peut plus être mise en cache pour elle-même, ni récupérée en parallèle d'autre chose, et elle est retéléchargée en entier chaque fois que le fichier qui l'entoure change. Une photographie de 200 KB dans une feuille de style, ce sont 200 KB ajoutés au chemin critique de toutes les pages du site. La page vous dit de quel côté de cette ligne tombe chaque résultat.

### Le gzip annule-t-il le surcoût du base64 ?

Moins qu'on ne le croit. Le base64 d'un fichier déjà compressé, ce que sont un PNG, un JPEG et un WebP, se compresse mal, parce qu'il ne reste presque aucune redondance à trouver pour le compresseur ; vous en récupérez typiquement quelque chose comme un dixième du tiers ajouté par le base64, et non la totalité. Un SVG encodé en pourcents est le cas inverse : c'est toujours du texte, il se compresse donc à peu près aussi bien qu'avant, ce qui est une raison de plus de ne pas en passer un en base64.

### Cela modifie-t-il mon image ?

Non, et c'est une différence délibérée avec la plupart des outils d'ici. Rien n'est décodé en pixels puis réencodé : les octets qui sont sortis de votre disque sont les octets qui entrent dans l'URI. Un JPEG reste exactement le JPEG qu'il était, à la même qualité, aux mêmes dimensions. C'est la raison pour laquelle le résultat peut être décrit comme le même fichier plutôt que comme une copie.

### Mes données EXIF et GPS partent donc aussi dans la feuille de style ?

Oui, et c'est la partie qui mérite réflexion avant de coller. Comme rien n'est réencodé, tout ce que l'appareil a écrit voyage avec l'image : le lieu, l'horodatage, le numéro de série de l'appareil. Sur une photographie de téléphone, cela peut représenter 30 KB du fichier, ce qui devient 40 KB de base64 sur le chemin critique de votre page, et une adresse personnelle dans quelque chose qui sera versionné dans un dépôt. La page lit la quantité de métadonnées présentes dans un JPEG, un PNG ou un WebP et le dit. Pour les retirer d'abord, prenez le [lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/).

### Pourquoi a-t-il utilisé un type différent de l'extension de mon fichier ?

Parce que l'extension peut se tromper et les octets non. Un fichier nommé `logo.png` qui a en réalité été exporté en JPEG est assez courant pour que tout outil d'image doive s'en accommoder, et un data URI qui déclare le mauvais type ne s'affiche tout simplement pas, sans repli ni message d'erreur digne d'être lu. Le type est donc lu dans les premiers octets du fichier, qui disent sans ambiguïté ce qu'il est dans tous les formats d'ici, et la page vous prévient quand les deux se contredisent.

### L'aperçu est vide. Qu'est-ce qui a échoué ?

Sans doute rien du côté de l'URI. Le HEIC et le TIFF font tous deux des data URI parfaitement valides qu'aucun navigateur sauf Safari ne dessinera, si bien que l'image manquera aussi là où vous la collerez. Convertissez-la d'abord en PNG, JPEG ou WebP avec le [compresseur d'images](https://abox.tools/fr/compresser-une-image/) ou le [redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/). Si le format est ordinaire, c'est probablement le fichier lui-même qui est endommagé : l'aperçu étant dessiné à partir de l'URI construit par cette page, un aperçu vide veut dire que l'image n'a pas décodé.

### Y a-t-il une limite de taille à un data URI ?

Aucune que vous rencontrerez en CSS ou dans une balise `<img>` ; les navigateurs modernes n'y imposent aucun plafond pratique. Ce qu'ils limitent, c'est la saisie d'un data URI dans la barre d'adresse, que la plupart refusent désormais dès que ce n'est pas trivial, pour des raisons de sécurité qui n'ont rien à voir avec cet usage. La vraie limite est celle ci-dessus : bien avant que quoi que ce soit de technique ne casse, la page qui le contient est devenue plus lente qu'elle ne l'aurait été avec un fichier image ordinaire.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le nombre et la taille des fichiers ne sont pas limités non plus, parce qu'aucun serveur ne les paie et que tout le travail se fait sur votre propre machine. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos images.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait vos images ailleurs pour les encoder s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Vos images n'ont nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où vos fichiers pourraient aboutir, ni rien dans le code qui les y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** On ne trouve ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`. L'encodage, ce sont `btoa` et `encodeURIComponent`, deux fonctions que le navigateur possède depuis le début et qui prennent toutes deux des octets pour rendre du texte, sans aller nulle part.
- **L'aperçu est la preuve.** L'image à côté de chaque résultat est dessinée à partir du data URI que cette page vient de construire, et non à partir de votre fichier. Elle s'affiche parce que l'URI est correct, sur votre machine, sans aucun serveur dans l'affaire ; et si elle ne s'affiche pas, la page le dit au lieu de vous remettre quelque chose de cassé.
- **L'avertissement sur les métadonnées est de votre côté.** Un data URI copie le fichier exactement : la position GPS d'une photographie voyage donc avec lui jusque dans votre feuille de style. Cette page lit combien il y en a et vous le dit, faute de quoi vous l'apprendriez une fois le commit fait.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit sur vos images. Chaque ligne qui lit ou encode un fichier est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/encode.js` pour les deux encodages et le raisonnement derrière chacun, `src/sniff.js` pour la façon dont le type de média est lu dans le fichier plutôt que dans son nom, et `src/metadata.js` pour la vérification qui dit quelle part de ce que vous vous apprêtez à coller n'est pas l'image.
