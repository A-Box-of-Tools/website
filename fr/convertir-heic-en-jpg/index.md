# HEIC vers JPG — convertir les photos d'iPhone

Les photos que fait un iPhone, dans un format que tout ouvre.

> Convertissez vos photos HEIC d'iPhone en JPG dans votre navigateur. Le décodeur tourne sur votre machine : rien n'est envoyé, aucun compte, et la date comme l'appareil peuvent suivre.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/convertir-heic-en-jpg/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos photos. Il n'y a pas de serveur.

Le décodage se fait dans votre propre navigateur, sur votre propre matériel. Le HEIC est le seul format d'image qu'un navigateur n'ouvre pas tout seul, si bien que cette page emporte le décodeur avec elle : environ 1,4 MB, servis depuis ce site et mis en cache après la première visite. Voilà toute la raison pour laquelle les autres convertisseurs HEIC vous demandent d'envoyer vos fichiers, car ils posent le codec sur un serveur et vos photos doivent aller jusqu'à lui. Celui-ci met le codec ici. Cette page ne comporte aucune fonction réseau, et il n'y a à l'autre bout aucun serveur à qui remettre une photo.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans limite de taille
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment convertir des photos HEIC en JPG

1. **Choisissez vos photos HEIC.** Déposez-les sur la zone prévue ou sélectionnez-les à la main, directement depuis une sauvegarde de téléphone ou un dossier du bureau. Le navigateur les lit sur votre disque, sans que rien parte où que ce soit pendant ce temps. La liste dit ce qu'est chacune et ce qu'elle a dedans.
2. **Regardez ce que portent les photos.** Chaque ligne nomme la date de prise de vue, l'appareil, et, en vert parce que c'est la partie qui mérite l'attention, la présence de coordonnées GPS. Tout cela est lu dans le conteneur sans décoder l'image, ce qui ne coûte rien et apparaît immédiatement.
3. **Choisissez un format, et tranchez sur les détails.** JPEG, sauf si vous avez une raison : c'est le format qui s'ouvre partout, ce qui est tout l'intérêt de convertir. Le curseur de qualité est à 92, réglage auquel une photographie est difficile à distinguer de l'original. La case décide si la date, l'appareil et le lieu suivent.
4. **Appuyez sur « Convertir », et téléchargez.** Le décodeur arrive à la première conversion, environ 1,4 MB une seule fois, et chaque photo ensuite est décodée et écrite sur votre propre machine. Un fichier vous donne un bouton de téléchargement ; plusieurs vous donnent aussi un zip.

## La version longue

[La photo qu'a enregistrée votre téléphone, et le format que rien n'ouvre](https://abox.tools/fr/guides/convertir-un-heic-en-jpg/): Les iPhone enregistrent les photos en HEIC, et la moitié d'internet n'en ouvre pas une. Ce qu'est ce format, pourquoi seul Safari le décode, ce que la conversion coûte à l'image, et comment le faire sans envoyer les photos à personne.

## Aussi dans la boîte

- [Photo d'identité](https://abox.tools/fr/photo-d-identite/): Choisissez le pays. L'outil applique sa règle, exactement.
- [Empileur d'images](https://abox.tools/fr/empiler-des-images/): Vingt prises n'en font plus qu'une, sans vingt envois et sans dérawtiseur.
- [Caviardage d'image](https://abox.tools/fr/caviarder-une-image/): Ce que vous recouvrez est supprimé du fichier, pas dissimulé dedans.
- [Lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/): Voyez ce qu'une photo raconte sur vous. Puis retirez-le.

## Questions

### Ma photo est-elle envoyée quelque part ?

Non. Le fichier est lu, décodé et écrit par votre propre navigateur sur votre propre matériel. Cet outil ne comporte aucune fonction réseau, si bien qu'il ne va jamais rien chercher et n'envoie jamais rien. Sa `Content-Security-Policy` énumère par ailleurs toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site. La seule chose qui se charge, c'est le décodeur lui-même, et il vient de ce site, une fois, avant même que votre photo entre en jeu.

### Pourquoi cette page télécharge-t-elle 1,4 MB la première fois ?

Parce que le HEIC est le seul format d'image qu'un navigateur n'ouvre pas. C'est une image HEVC dans un conteneur à boîtes, et seul Safari, sur du matériel Apple, en a un décodeur ; Chrome, Firefox et Edge refusent simplement le fichier. Un convertisseur HEIC a donc besoin d'un décodeur, qui ne peut venir que de deux endroits : un serveur, ou la page. Tous les autres convertisseurs ont choisi le serveur, et c'est exactement pour cela qu'ils exigent tous l'envoi de vos photos. Celui-ci emporte `libheif` compilé en WebAssembly. Il est servi depuis ce site, mis en cache après la première visite, et c'est là tout le prix à payer pour que vos photos n'aillent nulle part.

### Le JPEG garde-t-il la date, l'appareil et le lieu ?

Si vous le voulez, et c'est une case sur la page. Laissée cochée, le bloc EXIF est copié depuis le HEIC et écrit dans le JPEG exactement comme le téléphone l'avait écrit ; la photo convertie se range donc encore au jour de la prise de vue et non au jour de la conversion, ce qui est le reproche habituel fait aux convertisseurs HEIC. Une étiquette est changée, et une seule : l'orientation, remise sur « image à l'endroit », parce que la rotation a déjà été appliquée aux pixels et qu'une visionneuse qui l'appliquerait de nouveau coucherait toutes les photos verticales. Décochez la case et le JPEG sort avec l'image et rien d'autre.

### Retire-t-il les coordonnées GPS ?

Il vous dit qu'elles sont là, puis il fait ce que vous demandez. La ligne de chaque photo indique si le fichier porte des coordonnées avant même toute conversion, ce qui est plus que ne fait le téléphone. Décocher « garder la date, l'appareil et les réglages » les laisse hors du JPEG avec tout le reste ; laisser coché les fait suivre. Si ce que vous voulez, c'est parcourir les étiquettes en détail, ou les retirer de photos qui sont déjà des JPEG, le [lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) est l'outil pour cela, et il le fait sans recompresser l'image.

### L'image est-elle recompressée ?

Oui, et il le faut : le HEIC et le JPEG sont des codecs différents, si bien qu'on ne peut passer de l'un à l'autre sans décoder l'image et la réencoder. Ce que vous pouvez maîtriser, c'est ce que cela coûte. Le curseur de qualité est par défaut à 92, réglage auquel une photographie est très difficile à distinguer de l'original, et le PNG reste au menu pour le cas où vous ne voulez aucune perte et acceptez un fichier cinq à dix fois plus gros.

### Et si le fichier s'appelle .jpg mais est en réalité un HEIC ?

Cela marche quand même. Chaque fichier déposé ici est identifié par ses premiers octets et non par son nom, puisque le nom est celui que la dernière application à avoir touché le fichier a décidé de lui donner. Un HEIC arrivé sous le nom « .jpg » est d'ailleurs l'une des façons les plus courantes de finir par chercher un outil comme celui-ci. Un fichier qui est vraiment un JPEG ou un PNG est refusé avec un message qui le dit, plutôt que converti en une copie de lui-même.

### Peut-il convertir une Live Photo, ou une rafale ?

Les images fixes qui sont dedans, oui. Un HEIC peut contenir plus d'une image, et chacune de celles qu'il contient est convertie et nommée d'après l'original avec un numéro à la fin. La moitié vidéo d'une Live Photo est un fichier séparé que le téléphone garde à côté du HEIC : elle n'est donc pas là pour être convertie. Les cartes de profondeur et les vignettes sont dans le conteneur mais ne sont pas des images que quiconque a demandées, et elles sont laissées tranquilles.

### Pourquoi refuse-t-il mon AVIF ?

Parce qu'il n'y a rien à en faire. L'AVIF est le même conteneur que le HEIC avec de l'AV1 dedans au lieu du HEVC, et tous les navigateurs actuels en décodent un nativement ; un convertisseur livrerait donc un mégaoctet de moteur pour résoudre un problème que vous n'avez pas. S'il vous faut un AVIF en JPEG, le [compresseur d'images](https://abox.tools/fr/compresser-une-image/) et le [redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/) lisent tous deux l'AVIF et écrivent du JPEG avec le décodeur que votre navigateur a déjà.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le nombre et la taille des fichiers ne sont pas limités non plus, parce qu'aucun serveur ne les paie et que tout le travail se fait sur votre propre machine. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos photos.

### Est-ce que cela fonctionne hors ligne ?

Oui, décodeur compris. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler sur vos photos exactement comme avant. C'est aussi la preuve la plus forte qu'on puisse avoir que rien n'est envoyé : un convertisseur qui expédierait vos HEIC ailleurs pour les décoder s'arrêterait à l'instant où vous débranchez, et celui-ci ne s'arrête pas.

## Comment cette promesse se vérifie

- **Vos photos n'ont nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où vos fichiers pourraient aboutir, ni rien dans le code qui les y enverrait s'il en existait un.
- **Le décodeur est venu d'ici, et il ne va nulle part.** Le HEIC, c'est du HEVC dans un format à boîtes, qu'aucun navigateur sauf Safari ne sait décoder ; cette page livre donc `libheif` compilé en WebAssembly, soit environ 1,4 MB, versionnés dans ce dépôt, servis depuis cette origine et mis en cache par le service worker comme tous les autres fichiers d'ici. Il n'est pas récupéré sur un CDN, parce que cela mettrait un tiers sur le chemin de chaque visite et empêcherait l'outil de fonctionner hors ligne. Le binaire est à l'intérieur du script plutôt qu'à côté, précisément pour qu'aucune requête ne soit nécessaire à son démarrage.
- **Rien ici ne va rien chercher.** On ne trouve ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` dans aucun fichier écrit pour cet outil. Le moteur embarqué, comme toute compilation Emscripten, contient les chemins de chargement qui iraient chercher un `.wasm` à une URL ; ils ne sont pas empruntés, puisque le binaire est déjà en main. Et s'ils l'étaient, `connect-src` ne nomme que les points de mesure de Google et rien d'autre, de sorte que le navigateur refuserait. La politique est la preuve, pas la promesse.
- **Les métadonnées sont lues ici et vous sont rapportées.** La liste sur la page dit ce que porte chaque photo, à savoir la date, l'appareil et la présence éventuelle de coordonnées GPS, parce que c'est une chose que vous pourriez vouloir savoir avant de remettre le JPEG à quelqu'un. Elle est lue dans le fichier par `src/boxes.js` dans ce navigateur, montrée sur cette page, puis écrite dans votre JPEG ou laissée de côté, entièrement comme vous le décidez. Aucun événement d'analytique maison, dans tout ce dépôt, ne transporte un nom de fichier, une date, une coordonnée ou un nombre.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit sur vos photos. Chaque ligne qui lit, décode ou écrit un fichier est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Chargez la page une fois puis coupez le réseau : l'outil reste identique, le décodeur étant mis en cache avec lui. C'est la preuve la plus simple de toutes, et elle est ici plus forte que partout ailleurs sur ce site, car un convertisseur qui expédierait vos photos ailleurs pour les décoder n'y arriverait tout simplement pas.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/heif.js` pour la façon dont le décodeur est chargé et ce qu'il a le droit de faire, `src/boxes.js` pour l'analyse du conteneur qui trouve les métadonnées de la photo, et `src/exif.js` pour ce qu'il advient de ces métadonnées en entrant dans un JPEG. Le moteur lui-même est `vendor/libheif.js`, non modifié, avec sa licence à côté.
