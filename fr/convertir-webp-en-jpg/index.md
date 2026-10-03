# WebP en JPG — convertir sans envoi

Les images que le Web enregistre, dans le format que tout accepte encore.

> Convertissez WebP en JPG dans votre navigateur, sans envoi ni compte, même hors ligne. Choisissez le fond des zones transparentes.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/convertir-webp-en-jpg/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

La conversion se fait dans votre navigateur, sur votre appareil. Aucun décodeur à télécharger ni moteur à attendre : votre navigateur lit WebP depuis 2020 et écrit JPEG depuis toujours. Aucune fonction réseau ni serveur auquel envoyer une image.

- ✗ Aucun envoi
- ✗ Aucun compte
- ✗ Aucune limite de taille
- ✓ Fonctionne hors ligne
- ✓ Code ouvert

## Comment convertir un WebP en JPG

1. **Choisissez vos fichiers WebP.** Déposez-les ou choisissez-les. Les premiers octets identifient le format : un WebP nommé « .jpg » fonctionne, un vrai PNG est refusé avec son format réel.
2. **Lisez les informations de chaque ligne.** La liste indique le poids et les dimensions, puis si le WebP est sans perte, transparent ou animé. Chaque mention apparaît seulement si elle concerne le fichier.
3. **Réglez la qualité et le fond transparent.** 92 ressemble beaucoup à la photo d’origine. Le réglage du fond apparaît uniquement pour un fichier transparent, car JPEG doit le remplir.
4. **Appuyez sur « Convertir » et téléchargez.** Chaque résultat indique sa provenance, son poids et la différence, ainsi que le remplissage de la transparence ou la conservation de la première image d’une animation. Plusieurs fichiers offrent aussi un ZIP.

## La version longue

[L’image enregistrée par le web, et le format encore accepté partout](https://abox.tools/fr/guides/convertir-webp-en-jpg/): Une image enregistrée sur le web arrive en .webp et aucun logiciel ne l’ouvre ? Ce qu’est WebP, pourquoi la conversion augmente la taille, ce que devient la transparence et comment convertir sans rien envoyer.

## Aussi dans la boîte

- [PNG en WebP](https://abox.tools/fr/convertir-png-en-webp/): La même image, souvent un tiers plus légère, avec sa transparence intacte.
- [AVIF en JPG](https://abox.tools/fr/convertir-avif-en-jpg/): Le format que les sites enregistrent aujourd’hui, dans celui que tout accepte depuis toujours.
- [Photo d'identité](https://abox.tools/fr/photo-d-identite/): Choisissez le pays. L'outil applique sa règle, exactement.
- [Empileur d'images](https://abox.tools/fr/empiler-des-images/): Vingt prises n'en font plus qu'une, sans vingt envois et sans dérawtiseur.

## Questions

### Mon image est-elle envoyée quelque part ?

Non. Votre navigateur lit, décode et écrit le fichier sur votre appareil. Cet outil n’a aucune fonction réseau : il ne récupère ni n’envoie de contenu. La `Content-Security-Policy` énumère les adresses autorisées, dont aucune n’appartient à ce site. Le décodeur se trouve déjà dans votre navigateur.

### Pourquoi convertir un WebP en JPG ?

Votre logiciel ne le prend peut-être pas en charge. WebP est léger et courant sur le Web, mais d’anciennes versions d’Office et Photoshop, des imprimeurs, formulaires, liseuses ou logiciels de caméra le refusent encore. JPG reste accepté presque partout.

### Que deviennent les zones transparentes ?

Elles prennent la couleur que vous choisissez, blanche par défaut pour un logo dans un document. JPEG n’a pas de canal alpha, il ne peut pas conserver la transparence. Gardez le WebP ou créez un PNG avec le [compresseur d’images](https://abox.tools/fr/compresser-une-image/), qui écrit aussi PNG et WebP.

### Peut-il convertir un WebP animé ?

Il écrit la première image, avec une mention avant et après la conversion : JPEG ne contient qu’une image. Pour extraire chaque image ou créer une vidéo, utilisez [décomposer un GIF](https://abox.tools/fr/decouper-un-gif-en-images/) et [GIF en MP4](https://abox.tools/fr/gif-en-mp4/) après avoir obtenu un GIF.

### L’image est-elle recomprimée ?

Oui. WebP et JPEG sont des codecs différents, toute conversion nécessite décodage et réencodage. 92 par défaut ressemble beaucoup à l’original. Si le WebP était sans perte, ce JPEG est sa première copie avec perte : la liste vous avertit.

### Le JPG sera-t-il plus gros que le WebP ?

Souvent, et le résultat indique de combien. À qualité égale, WebP compresse mieux. Vous échangez du poids contre la compatibilité. Le [compresseur d’images](https://abox.tools/fr/compresser-une-image/) peut ensuite atteindre un poids choisi.

### Conserve-t-il la date, l’appareil et la localisation ?

Non. Un canevas ne contient que les pixels : EXIF, GPS, profils colorimétriques et XMP sont abandonnés. Pour lire ou modifier ces données sans recomprimer l’image, utilisez le [lecteur et éditeur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/).

### Peut-il traiter tout un dossier ?

Oui. Déposez autant de fichiers que vous voulez, sans limite de nombre ni de taille imposée par un serveur. Chacun a sa ligne et son téléchargement ; à partir de deux, une archive ZIP rassemble le tout. Les noms identiques reçoivent un numéro avant l’extension, pour éviter tout remplacement dans l’archive.

### Est-ce gratuit, et faut-il un compte ?

Oui, c’est gratuit, sans compte, connexion, essai limité ni filigrane. La publicité finance le site et ne reçoit aucune information sur vos images.

### Fonctionne-t-il hors ligne ?

Oui. Chargez la page une fois puis déconnectez Internet : elle continue de fonctionner. Un convertisseur qui envoyait les fichiers à un serveur s’arrêterait dès la déconnexion.

## Comment cette promesse se vérifie

- **Vos images ne peuvent être envoyées nulle part.** La Content-Security-Policy énumère les adresses que cette page peut contacter, dont aucune n’appartient à ce site. Aucun point de collecte ne reçoit vos fichiers et aucun code ne les enverrait s’il existait.
- **Aucun décodeur à fournir, donc aucun serveur nécessaire.** Tous les navigateurs publiés depuis 2020 décodent WebP et savent écrire JPEG depuis longtemps. Aucun moteur ni téléchargement à la première utilisation. Le [convertisseur HEIC](https://abox.tools/fr/convertir-heic-en-jpg/) fournit un codec, car seul Safari ouvre ce format nativement, et l’explique sur sa page.
- **Les zones transparentes et leur fond.** WebP accepte la transparence, JPEG non. Vous choisissez une couleur, blanche par défaut, seulement si les pixels montrent de la transparence. Le format seul ne suffit pas à le savoir. Un convertisseur qui ne demande rien choisit le fond pour vous, souvent noir, d’où les logos sur fond noir.
- **Ce qu’un canevas ne conserve pas.** Le canevas contient les pixels seuls : EXIF, profils ICC, XMP et blocs de droits ne sont pas conservés. C’est utile pour certains et une perte pour d’autres. Le [lecteur et éditeur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) lit et modifie ces données sans recomprimer l’image.
- **Ce que Google charge, et ce qu’il ne reçoit pas.** Les scripts publicitaires et de mesure viennent de Google, le bouton de don de Buy Me a Coffee. Aucun ne reçoit vos images. Tout le code qui lit, décode ou écrit un fichier vient de ce site et figure dans le dépôt.
- **Fonctionne hors ligne.** Chargez la page une fois, puis déconnectez le réseau : l’outil fonctionne de la même façon. Un convertisseur qui envoyait vos images ailleurs ne pourrait pas le faire.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, et `src/shared/image-convert.js` pour la conversion : identification réelle du format, décodage et canevas qui écrit le JPEG. Le même fichier d’environ trois cents lignes sert aux deux autres convertisseurs, sans codec intégré.
