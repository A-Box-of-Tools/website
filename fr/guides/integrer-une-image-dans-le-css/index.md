# Quand mettre une image dans votre CSS, et quand s'abstenir

Une image écrite dans une feuille de style arrive avec elle : pas de seconde requête, pas d'attente. Elle cesse aussi d'être un fichier, si bien qu'elle ne peut plus être mise en cache pour elle-même et qu'elle est retéléchargée dès que quoi que ce soit autour d'elle change. Voici où ce marché vaut la peine, et où il ne la vaut discrètement pas.

[Ouvrir Image en data URI](https://abox.tools/fr/image-en-base64/): L'image entière en une ligne de texte. À coller directement dans du CSS ou du HTML.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez [Image en data URI](https://abox.tools/fr/image-en-base64/), déposez-y l'image, choisissez *Une propriété personnalisée CSS*, et collez la ligne en tête de votre feuille de style. Servez-vous-en ensuite comme `background-image: var(--logo)` partout où il vous la faut.

Faites-le quand l'image est petite, qu'il s'agisse d'une icône, d'une puce, d'un chevron ou d'un motif, et qu'elle est nécessaire sur toutes les pages. Ne le faites pas avec une photographie. Tout ce qui suit explique pourquoi ces deux phrases diffèrent, et comment savoir dans quel cas vous êtes.

## Ce qu'est réellement un data URI

Une adresse qui contient la chose au lieu de pointer vers elle. Là où une feuille de style dirait normalement

```
background-image: url("logo.png");
```

et où le navigateur va chercher `logo.png`, un data URI dit

```
background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...");
```

et il n'y a rien à aller chercher : l'image est déjà là, écrite en caractères. Il y a trois parties. `data:` est le schéma. `image/png` est le type de média, et le navigateur le croit sur parole, point sur lequel on revient plus bas. Tout ce qui suit la virgule est le fichier.

C'est toute l'idée. Ce n'est ni une astuce ni un bricolage ; c'est dans les standards depuis 1998 et cela fonctionne dans tous les navigateurs sortis depuis.

## Ce que cela vous rapporte : un aller-retour de moins

L'économie n'est pas la bande passante. C'est la requête.

Un navigateur ne peut pas demander `logo.png` avant d'avoir lu la feuille de style qui le mentionne, et il ne peut pas lire cette feuille de style avant de l'avoir récupérée. Une image de fond ordinaire est donc à au moins deux allers-retours de profondeur dans le chargement de la page, et sur un téléphone en réseau lent un aller-retour peut représenter deux cents millisecondes quelle que soit la petitesse du fichier. Un chevron de 600 octets ne coûte presque rien à transférer et peut quand même coûter un quart de seconde à arriver.

Intégré, il arrive avec la feuille de style. C'est là tout le bénéfice, et pour une petite icône visible d'emblée, il est réel.

## Ce que cela coûte : un tiers, puis la mise en cache

**Le base64 ajoute environ un tiers.** Trois octets de fichier deviennent quatre caractères, parce que c'est ce qu'il faut pour écrire des octets quelconques avec les seuls caractères qu'une URL autorise. Il n'existe aucun encodeur malin qui l'évite. Un PNG de 9 KB fait 12 KB de feuille de style.

**La compression ne le rend pas.** C'est la partie que les gens balaient d'un revers de main. Le gzip et le Brotli travaillent en trouvant de la redondance, or un PNG, un JPEG et un WebP ont déjà été compressés : il ne leur reste presque aucune redondance, et le base64 n'en ajoute pas. En pratique, vous en récupérez quelque chose comme un dixième du tiers, pas la totalité. (Un SVG est le cas inverse, et la section suivante en parle.)

**Cela cesse d'être un fichier.** C'est le coût qui n'apparaîtra dans aucune mesure que vous êtes susceptible de prendre, et c'est celui qui compte quand la taille monte :

- **Cela ne peut plus être mis en cache pour soi-même.** Une image ordinaire est récupérée une fois et réutilisée un an. Une image intégrée fait partie de la feuille de style : elle vit et meurt avec l'entrée de cache de celle-ci.
- **Changer quoi que ce soit fait tout retélécharger.** Corrigez une marge, livrez une nouvelle feuille de style, et chaque visiteur retélécharge l'image intégrée avec elle, une image qui n'a pas changé depuis deux ans.
- **C'est sur le chemin critique.** Une feuille de style bloque le rendu. Une image non. L'intégrer la fait passer de la seconde catégorie à la première : la page ne peut pas se peindre avant que le tout, image comprise, soit arrivé.
- **Cela ne peut plus être récupéré en parallèle.** Les navigateurs téléchargent beaucoup de choses à la fois. Une image intégrée n'est plus une chose à part, elle ne bénéficie donc de rien de tout cela.

Des seuils approximatifs, qui marquent l'endroit où le conseil change plutôt que celui où un navigateur fait quoi que ce soit de différent : sous 2 KB environ, c'est un gain net ; jusqu'à 10 KB environ, cela vaut encore le coup pour quelque chose présent sur toutes les pages ; passé 50 KB, c'est une erreur sans message d'erreur. [L'outil](https://abox.tools/fr/image-en-base64/) vous dit dans quelle plage tombe chaque résultat, avec le nombre de caractères à côté.

![La carte de sortie : une règle CSS contenant une URI de données en base64, avec à côté la taille du fichier d'origine et celle de l'encodage.](https://abox.tools/screens/embed-an-image-in-css/output.webp)

La copie encodée est environ un tiers plus grosse que le fichier dont elle vient. C'est le coût dont parle cette section, et il est imprimé plutôt que laissé à découvrir.

## Ne passez jamais un SVG en base64

C'est de loin l'erreur la plus courante en matière d'images intégrées, et elle est commise par les exporteurs et les greffons de compilation aussi souvent que par des humains.

Un SVG est du texte. Une URL transporte déjà du texte. Seule une poignée de caractères doit être échappée, à savoir `%`, `#`, `<`, `>` et le guillemet dans lequel vous l'avez enveloppé, tout le reste pouvant rester exactement tel quel. L'encoder ainsi vous donne un URI typiquement un cinquième plus court que le base64 du même fichier, et qui se compresse ensuite comme du texte plutôt que comme du bruit.

Il reste en outre lisible :

```
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E...");
```

Vous voyez le `viewBox`. Vous pouvez changer la couleur de remplissage dans votre éditeur sans rien décoder. Passez le même fichier en base64 et cela devient un mur de lettres que plus personne ne touchera jamais. [Image en data URI](https://abox.tools/fr/image-en-base64/) le fait automatiquement pour tout ce qui s'avère être un SVG, et propose une case pour la rare chaîne d'outils qui exige `;base64`.

## L'erreur de guillemets qui ne casse que les SVG

Le CSS permet d'écrire `url()` sans guillemets, et pour un nom de fichier ordinaire cela va très bien :

```
background-image: url(logo.png);
```

Faites la même chose avec un SVG encodé en pourcents et cela casse. Un jeton `url()` sans guillemets se termine au premier espace, parenthèse, guillemet ou caractère de contrôle, or un SVG est plein d'espaces, entre chaque attribut et chaque nombre d'un tracé. La déclaration est alors invalide, le CSS jette les déclarations invalides en silence, et vous n'obtenez ni fond ni erreur.

Le remède, ce sont les guillemets, à chaque fois :

```
background-image: url("data:image/svg+xml,%3Csvg ... %3E");
```

C'est aussi pourquoi un encodeur n'a pas besoin d'échapper les espaces, puisqu'ils sont parfaitement légaux à l'intérieur d'une URL entre guillemets et qu'échapper chacun en `%20` coûterait trois caractères par espace du fichier. Les deux décisions vont ensemble : mettez l'URI entre guillemets, et vous pouvez laisser les espaces tranquilles. Toutes les formes que produit l'outil sont entre guillemets pour exactement cette raison.

## Le type de média doit être juste

Un data URI déclare son propre type, et le navigateur le prend au mot. Il n'y a pas de repli par reniflage comme pour un fichier récupéré : dites `image/png` à propos de quelque chose qui est en réalité un JPEG et l'image ne s'affiche pas, sans message nulle part où cela servirait.

Ce qui compte, parce que les extensions mentent. Une photo exportée en JPEG et renommée `logo.png` est une chose ordinaire à trouver sur un disque. Les premiers octets d'un fichier image, en revanche, disent sans ambiguïté ce qu'il est, chaque format ayant sa signature ; un outil devrait donc lire le fichier plutôt que son nom. Celui d'ici le fait, et vous prévient quand les deux se contredisent.

Deux formats valent d'être connus parce qu'ils échouent de façon déroutante. Le **HEIC**, qui est ce dans quoi photographie un iPhone, et le **TIFF**, qui est ce que produisent les scanners, font tous deux des data URI parfaitement valides qu'aucun navigateur sauf Safari ne dessinera. L'URI n'est pas cassé ; le format n'est simplement pas un format que le web prend en charge. Convertissez d'abord.

## Les métadonnées que vous ne vouliez pas publier

Un data URI est une copie du fichier, octet pour octet. Rien n'est décodé puis réencodé, ce qui est en général tout l'intérêt puisque aucune qualité n'est perdue, mais cela veut dire aussi que tout le reste du fichier suit.

Une photographie sortie tout droit d'un téléphone porte de l'EXIF : les coordonnées GPS du lieu de la prise de vue, l'horodatage, le modèle d'appareil et souvent son numéro de série. Cela peut représenter 30 KB du fichier. Intégré, cela devient 40 KB de base64 dans votre feuille de style, sur le chemin critique de chaque page, et une adresse personnelle versionnée dans un dépôt, sous une forme que personne ne pensera jamais à regarder.

Retirez-les d'abord avec le [lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/), qui réécrit le conteneur sans toucher à l'image ; il y a aussi [un guide pour cela](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/). Image en data URI lit la quantité de métadonnées présentes dans un JPEG, un PNG ou un WebP et le dit avant que vous ne copiiez quoi que ce soit.

## Où le mettre, une fois que vous l'avez

Si l'image apparaît dans une seule règle, mettez l'URI dans cette règle. Si elle apparaît dans plusieurs, ce que font en général les icônes une fois comptés l'état de survol et le thème sombre, déclarez-la une fois comme propriété personnalisée :

```
:root {
  --icon-search: url("data:image/svg+xml,%3Csvg ... %3E");
}

.search-field { background-image: var(--icon-search); }
.search-button::before { content: var(--icon-search); }
```

Un URI de 3 KB collé dans quatre règles, ce sont 12 KB de feuille de style et quatre endroits à modifier quand l'icône change. La propriété personnalisée, c'est un seul de chaque. C'est aussi la forme qui fait fonctionner les thèmes : redéfinissez `--icon-search` dans une media query et chacun de ses usages suit.

Pour une balise `<img>` plutôt que du CSS, mettez `width` et `height`. Une image intégrée se charge instantanément : une taille manquante est donc un décalage de mise en page trop rapide pour être vu et qui compte quand même contre vous. L'exception est le SVG : celui qui ne porte qu'un `viewBox` n'a pas de taille en pixels à lui, et écrire le défaut de ⁦300 × 150⁩ du navigateur sur la balise fige une image extensible à une taille que personne n'a choisie.

Laissez l'`alt` vide, sauf si vous avez quelque chose de vrai à y mettre. Vous seul savez si l'image porte du sens ou n'est que décorative, et une description devinée à partir d'un nom de fichier est pire, pour qui utilise un lecteur d'écran, que pas de description du tout.

![La carte de forme : des boutons choisissant ce qui doit sortir, une règle de fond CSS, une balise img ou l'URI seule, et un interrupteur base64 ou SVG en clair.](https://abox.tools/screens/embed-an-image-in-css/shape.webp)

La destination décide de ce qui sort, la question est donc posée d'abord plutôt que laissée en exercice de copier-coller.

## Quand la réponse est « ne le faites pas »

Si l'image dépasse les 50 KB une fois encodée, l'intégration est le mauvais outil et aucun soin apporté à l'encodage n'y changera rien. Les solutions de rechange, dans l'ordre où il vaut la peine de les essayer :

- **Alléger l'image.** La plupart des images trop grosses pour être intégrées sont trop grosses tout court. Le [compresseur d'images](https://abox.tools/fr/compresser-une-image/) amènera une photographie à une taille que vous nommez, et le [redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/) ramènera les dimensions en pixels à ce que la mise en page utilise réellement, ce qui est très souvent le vrai problème.
- **La redessiner en SVG.** Une icône exportée en PNG de 40 KB est fréquemment un SVG de 900 octets. Ce n'est pas une différence de compression, c'est une différence de format, et cela règle aussi le problème du Retina.
- **La laisser en fichier et la précharger.** `<link rel="preload" as="image">` lance la récupération immédiatement sans déplacer les octets sur le chemin critique. Cela rapporte l'essentiel du bénéfice de l'intégration sans son coût de mise en cache.

## Rien de tout cela ne demande un envoi

Encoder un fichier en base64 est de l'arithmétique. Ce sont deux fonctions que le navigateur possède depuis le début, `btoa` et `encodeURIComponent`, et il n'y a absolument aucune raison technique pour qu'une image voyage jusqu'à un serveur et en revienne pour être écrite autrement. Tout convertisseur qui envoie votre fichier pour faire cela l'envoie pour ses propres raisons, pas pour les vôtres.

[L'outil d'ici](https://abox.tools/fr/image-en-base64/) ne l'envoie nulle part : la `Content-Security-Policy` de la page énumère toutes les adresses qu'elle peut contacter, et aucune n'appartient à ce site. Chargez la page, coupez votre connexion, et encodez quelque chose quand même, si vous préférez vérifier plutôt qu'on vous le dise. [Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) expose trois autres vérifications applicables à n'importe quel outil.
