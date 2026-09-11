# Image en SVG — vectoriser un logo, un pochoir ou une silhouette en courbes

Une forme, un contour. Pointez ce qui ne devrait pas y être.

> Vectorisez une image en noir et blanc en un vrai contour SVG, dans votre navigateur. Logos, pochoirs, signatures, dessins au trait et silhouettes deviennent des courbes qui se redimensionnent à toute taille. Un clic retire ce que le tracé a pris à tort. Rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/convertir-image-en-svg/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

L'image est lue sur votre disque par votre propre navigateur, ramenée à un bit par pixel par `src/mask.js`, parcourue le long de son bord par `src/contour.js` et habillée de courbes par `src/fit.js` — six cents lignes environ, que vous pouvez lire, sans moteur derrière et sans rien à télécharger pour les exécuter. Cet outil n'a aucune fonction réseau : rien à aller chercher, rien à envoyer, et pas de serveur au bout de cette page à qui envoyer un dessin quand bien même il y en aurait une.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment vectoriser une image en SVG sans l'envoyer nulle part

1. **Choisissez l'image.** Un logo, un pochoir, une signature, un tampon, un dessin numérisé, une silhouette. Tout ce qui contient une forme nette se vectorise bien ; la photo d'une pièce, non, et un avertissement clair vous attend plus bas plutôt qu'une surprise à la fin. Le fichier est lu directement sur votre disque et rien n'est envoyé nulle part pendant ce temps.
2. **Dites ce qu'est la forme.** Un dessin sur papier se sépare par **clair et sombre**, et le seuil est calculé pour vous. La photo d'un objet, non — une silhouette rouge sombre sur une pierre gris sombre, c'est du sombre sur du sombre, et aucune luminosité ne les sépare. Celle-là veut **le sujet**, qui apprend ce qu'est l'arrière-plan sur une bande le long du bord de l'image et garde tout ce qui n'en fait pas partie.
3. **Regardez la ligne rouge, pas les réglages.** Le contour est dessiné par-dessus les pixels dont il vient, parce que c'est le seul endroit où la question peut se trancher : un contour est juste ou faux par rapport à ces pixels et à rien d'autre. Faites glisser l'une ou l'autre image pour déplacer les deux, et zoomez à la molette assez loin pour voir ce que la ligne fait vraiment.
4. **Retirez d'un clic ce qui ne devrait pas y être.** Une tache, une agrafe, un tampon, une légende, une ombre. Un clic prend toute la plage de cette couleur plutôt qu'un pixel, vous pointez donc une forme ; cliquez-la encore pour la remettre. Cliquer un morceau d'arrière-plan enclavé le remplit à la place, et c'est ainsi qu'un trou qui ne devrait pas en être un se referme.
5. **Ne touchez au lissage que s'il le faut.** *Détail* est la distance dont la ligne peut s'écarter des pixels en se simplifiant, et il est calculé par forme sauf indication contraire. *Netteté des angles* décide de combien le contour doit tourner pour que ce virage reste un angle plutôt que d'être arrondi. La plupart des images n'ont besoin ni de l'un ni de l'autre.
6. **Prenez le SVG.** Un fichier, un seul `<path>`, aucune règle de remplissage dont se soucier : les contours tournent dans un sens et les trous dans l'autre, et c'est ce qui fait d'une forme percée de quarante trous un seul élément. Il s'ouvre dans Illustrator, Inkscape, Figma, un navigateur et une machine de découpe.

## La version longue

[Comment vectoriser une image en SVG](https://abox.tools/fr/guides/convertir-une-image-en-svg/): Transformez un logo, un pochoir, une signature ou une silhouette en un vrai contour vectoriel dans votre navigateur. Quelles images se vectorisent bien, lesquelles ne le feront jamais, et comment corriger ce que le traceur prend à tort.

## Aussi dans la boîte

- [Comparateur de tailles](https://abox.tools/fr/comparer-des-tailles/): Tapez les tailles, emportez l'image. Rien n'est envoyé pour la dessiner.
- [Compresseur d'images](https://abox.tools/fr/compresser-une-image/): Vous donnez la taille. Il se charge du reste.
- [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/): Vous dites la taille. Vous tracez le cadre. Vous choisissez le format.
- [HEIC vers JPG](https://abox.tools/fr/convertir-heic-en-jpg/): Les photos que fait un iPhone, dans un format que tout ouvre.

## Questions

### Mon image est-elle envoyée quelque part ?

Non. Le fichier est lu par votre propre navigateur sur votre propre matériel, vectorisé par quelques centaines de lignes de JavaScript servies depuis cette origine, et rendu sous forme de téléchargement. Cet outil n'a aucune fonction réseau — il ne va jamais rien chercher et n'envoie jamais rien — et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, dont aucune n'appartient à ce site.

### Cela transformera-t-il ma photo en SVG ?

Pas utilement, et la page vous le dira plutôt que de vous le laisser découvrir après le téléchargement. La vectorisation fait de chaque plage de couleur voisine une forme à part, si bien qu'une photo revient en milliers de taches superposées et en un fichier bien plus lourd que le JPEG, qui s'ouvre lentement et ne ressemble pas à la photo. Ce qui se vectorise bien, c'est une image avec une *forme* dedans : un logo, un pochoir, une signature, un dessin au trait, une silhouette. Pour la photo d'un seul objet, le réglage *le sujet* le découpera en une silhouette pleine, ce qui est autre chose et sincèrement utile.

### Quelle différence entre les deux façons de trouver la forme ?

La question qu'elles posent. **Clair et sombre** demande si chaque pixel est plus sombre qu'un seuil, ce qui est exactement juste pour de l'encre sur du papier et inutile quand le sujet et l'arrière-plan sont aussi sombres l'un que l'autre. **Le sujet** demande ce qu'est l'arrière-plan — il l'apprend sur une bande le long du bord de l'image, mesure chaque pixel par rapport à lui, et garde la plus grande chose qui n'en fait pas partie. Cela marche sur la photo d'un objet posé sur un fond à peu près uni, et échoue sur une image cadrée si serré que le sujet déborde de trois côtés, puisque les bords dont il apprend sont alors le sujet lui-même. Vous pouvez alors pointer l'arrière-plan vous-même à la place.

### Pourquoi la forme vectorisée a-t-elle des trous, ou perd-elle ses parties fines ?

Parce que l'image les avait déjà, une fois ramenée à un bit par pixel. Activez *ce que le traceur a reçu* pour le voir : sous environ douze pixels, la contre-forme d'une lettre est déjà bouchée et ses fûts déjà fondus, et aucune vectorisation ne rend un trou qui n'est pas là. Les remèdes sont en amont — déplacez le seuil, ou partez d'un scan plus grand. En mode *le sujet*, *refermer les écarts jusqu'à* scelle les petits trous et *remplir en plein* ferme tout trou que l'arrière-plan ne peut pas atteindre depuis le bord de l'image.

### Puis-je corriger ce qu'il a pris à tort ?

Oui, et c'est à cela que sert l'essentiel de la troisième étape. Cliquez tout ce qui ne devrait pas être dans le dessin et cela disparaît ; cliquez-le encore et cela revient. Un clic prend toute la plage de cette couleur, si bien qu'un clic retire une tache entière ou un tampon entier plutôt qu'un pixel. Cliquer un morceau d'arrière-plan enclavé le remplit. Les corrections sont conservées à part du seuil, si bien que déplacer le curseur ensuite ne les jette pas.

### Quelle taille fera le SVG ?

Pour une forme, moins que l'image : une silhouette vectorisée fait d'ordinaire un à cinq kilo-octets, et un logo quelques-uns de plus. La page vous le dit exactement, à côté du téléchargement. Pour une photo il sera énorme, ce qui est le signe le plus clair que ce n'est pas le bon outil pour ce fichier — et la page cesse de dessiner et le dit passé un millier de formes distinctes environ.

### Vectorise-t-il en couleur ?

Non. Ceci fait une forme d'une seule couleur, ce qui est le cas qui ressort comme un dessin plutôt que comme une mauvaise photocopie. Vectoriser en couleur, c'est quantifier en quelques couleurs et vectoriser chacune comme son propre calque, et le résultat déçoit la plupart de ceux qui le demandent. S'il vous faut de la couleur, vectorisez la forme ici et remplissez-la dans votre logiciel de dessin.

### Que puis-je faire du SVG ensuite ?

Le redimensionner à toute taille sans qu'il devienne flou, le recolorer avec un seul attribut, l'animer, l'imprimer, ou l'envoyer à une machine de découpe ou à un laser. C'est un seul `<path>` sans règle de remplissage à se tromper, donc Illustrator, Inkscape, Figma, un navigateur et la plupart des logiciels de CNC le lisent tous de la même façon.

### Y a-t-il une limite à la taille de l'image ?

Celle de votre machine, pas la nôtre. Une page A4 numérisée à 300 ppp — neuf mégapixels environ — se vectorise en une fraction de seconde. Les images plus grandes fonctionnent ; elles prennent seulement plus de temps, et le travail se fait sur votre propre processeur plutôt que dans une file d'attente quelque part.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni connexion, ni période d'essai, ni filigrane. Il n'y a pas non plus de limite au nombre ni à la taille des fichiers, parce qu'aucun serveur ne les paie — le travail se fait sur votre propre machine. Le site porte de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos fichiers.

### Fonctionne-t-il hors ligne ?

Oui. Chargez la page une fois, puis coupez la connexion, et elle continue de fonctionner. C'est aussi la façon la plus simple de prouver que rien n'est envoyé : un outil qui expédierait votre image pour la vectoriser s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Votre image n'a nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page peut contacter, et aucune n'appartient à ce site. Il n'y a ici aucun point de collecte où vos fichiers pourraient atterrir, et rien dans le code qui les y enverrait s'il y en avait un.
- **Rien ici ne va rien chercher.** Il n'y a ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`. L'outil entier est de l'arithmétique sur les pixels d'une seule image : un seuil, un parcours le long du bord de ce qu'il a trouvé, et un peu d'ajustement de courbes.
- **Il n'y a aucun moteur à télécharger.** Vectoriser, c'est d'ordinaire le programme de quelqu'un d'autre, et sur le web cela veut dire plusieurs mégaoctets de code compilé qui arrivent avant le premier clic. Il n'y a rien de tel ici. Le tout tient en quelques centaines de lignes de JavaScript ordinaire servies depuis cette origine, et c'est aussi pour cela que la page fonctionne dès qu'elle s'ouvre plutôt qu'après une attente.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts de publicité et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit sur votre image. Chaque ligne qui la lit, la seuille ou la vectorise est servie depuis cette origine et figure dans le dépôt.
- **Il fonctionne hors ligne.** Coupez le réseau et l'outil est inchangé, parce qu'il n'y a jamais eu d'étape réseau dedans. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/mask.js` pour la façon dont une image devient un bit par pixel, `src/contour.js` pour le parcours le long du bord de la forme, `src/fit.js` pour la façon dont un escalier devient des courbes, et `src/subject.js` pour la façon dont l'arrière-plan est déterminé quand il n'y a ni clair ni sombre pour séparer.
