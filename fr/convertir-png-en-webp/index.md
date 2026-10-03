# PNG en WebP — convertir sans envoi

La même image, souvent un tiers plus légère, avec sa transparence intacte.

> Convertissez PNG en WebP dans votre navigateur, sans perte ou avec une compression plus forte. Transparence conservée, aucun envoi ni compte, fonctionnement hors ligne.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/convertir-png-en-webp/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

La conversion se fait dans votre navigateur, sur votre appareil. Les navigateurs savent écrire WebP depuis 2020 : l’encodeur était déjà là avant votre arrivée. Aucun téléchargement ni attente, aucune fonction réseau ni serveur auquel envoyer une image.

- ✗ Aucun envoi
- ✗ Aucun compte
- ✗ Aucune limite de taille
- ✓ Fonctionne hors ligne
- ✓ Code ouvert

## Comment convertir un PNG en WebP

1. **Choisissez vos fichiers PNG.** Déposez-les ou choisissez-les. Les premiers octets identifient le format : un JPEG est refusé plutôt que reconverti en copie. La ligne indique la transparence avant conversion.
2. **Choisissez sans perte, ou plus petit.** Sans perte préserve chaque pixel opaque et réduit généralement le poids : adapté aux captures, schémas, logos et textes. Plus petit active la qualité réglable, utile aux photographies où le gain est bien plus grand.
3. **Appuyez sur « Convertir » et lisez le résultat.** Chaque ligne indique le nouveau poids, le gain et le codage réellement écrit par le navigateur, lu dans le fichier final et non recopié depuis le réglage.
4. **Téléchargez un fichier ou tout le lot.** Un fichier offre un bouton, plusieurs offrent aussi un ZIP. Les noms identiques reçoivent un numéro pour éviter tout remplacement.

## La version longue

[La même image, un tiers plus petite, avec sa transparence intacte](https://abox.tools/fr/guides/convertir-png-en-webp/): WebP est plus petit que PNG même sans perte, et beaucoup plus petit si vous en acceptez. Le mode adapté dépend de l’image. Ce que chaque mode conserve, ce qu’il économise et comment convertir sans envoyer le fichier.

## Aussi dans la boîte

- [AVIF en JPG](https://abox.tools/fr/convertir-avif-en-jpg/): Le format que les sites enregistrent aujourd’hui, dans celui que tout accepte depuis toujours.
- [Photo d'identité](https://abox.tools/fr/photo-d-identite/): Choisissez le pays. L'outil applique sa règle, exactement.
- [Empileur d'images](https://abox.tools/fr/empiler-des-images/): Vingt prises n'en font plus qu'une, sans vingt envois et sans dérawtiseur.
- [Caviardage d'image](https://abox.tools/fr/caviarder-une-image/): Ce que vous recouvrez est supprimé du fichier, pas dissimulé dedans.

## Questions

### Mon image est-elle envoyée quelque part ?

Non. Votre navigateur lit, décode et écrit le fichier sur votre appareil. Cet outil n’a aucune fonction réseau : il ne récupère ni n’envoie de contenu. La `Content-Security-Policy` énumère les adresses autorisées, dont aucune n’appartient à ce site.

### La transparence est-elle conservée ?

Oui, dans les deux modes. WebP possède un vrai canal alpha : aucune couleur de fond n’est choisie et aucune zone n’est aplatie. La liste signale la transparence avant conversion et le résultat confirme sa conservation.

### Quelle différence entre sans perte et plus petit ?

Sans perte conserve chaque pixel opaque, avec généralement un cinquième à un tiers de poids en moins. Les pixels semi-transparents ont une nuance expliquée ci-dessous. Plus petit utilise le codage avec perte de WebP et peut réduire une photo au dixième. Texte, aplats et contours nets préfèrent le sans perte ; photos, le second mode.

### Et les pixels semi-transparents ?

Ils peuvent changer très légèrement à cause du canevas, pas de WebP. Le navigateur multiplie la couleur par la transparence et l’opération inverse n’est pas exacte.\
\
Les pixels opaques et totalement invisibles restent inchangés. La couleur sous les autres peut varier, ici jusqu’à 63 sur 255 pour une opacité inférieure au quart, et jusqu’à 4 pour le reste. Ces variations sont invisibles car les pixels les plus touchés contribuent le moins à l’image. Les contours lissés d’un logo gardent leur aspect.\
\
Pour une archive absolument exacte, gardez le PNG. Pour un aspect identique dans un fichier plus léger, cette conversion convient.

### Comment vérifier que le fichier est sans perte ?

Le fichier terminé est relu. WebP contient `VP8L` pour le codage sans perte, `VP8` pour le codage avec perte. La page lit le bloc présent et l’annonce. Un canevas n’ayant pas de drapeau sans perte, la qualité maximale ne suffit pas à garantir le comportement : même si tous les navigateurs actuels le respectent, la page vérifie.

### WebP s’ouvre-t-il partout ?

Sur le Web, oui : Chrome, Edge, Firefox et Safari l’affichent depuis 2020. Windows et macOS le prévisualisent, mais des logiciels anciens, formulaires ou liseuses peuvent le refuser. Utilisez alors le convertisseur [WebP en JPG](https://abox.tools/fr/convertir-webp-en-jpg/).

### Pourquoi mon PNG est-il si gros ?

PNG est sans perte : il compresse bien les zones répétées des captures et logos, mais mal les photographies. Une photo en PNG pèse souvent dix fois le JPEG. Le mode avec perte est adapté à ce cas. Le [compresseur d’images](https://abox.tools/fr/compresser-une-image/) accepte directement un poids cible.

### Conserve-t-il la date, l’appareil et la localisation ?

Non. Un canevas ne contient que les pixels : EXIF, GPS, profils colorimétriques et XMP sont abandonnés. Pour lire ou modifier ces données sans recomprimer l’image, utilisez le [lecteur et éditeur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/).

### Peut-il traiter tout un dossier ?

Oui. Déposez autant de fichiers que vous voulez, sans limite de nombre ni de taille imposée par un serveur. Chacun a sa ligne et son téléchargement ; à partir de deux, une archive ZIP rassemble le tout. Le résultat indique également le gain total.

### Est-ce gratuit, et faut-il un compte ?

Oui, c’est gratuit, sans compte, connexion, essai limité ni filigrane. La publicité finance le site et ne reçoit aucune information sur vos images.

### Fonctionne-t-il hors ligne ?

Oui. Chargez la page une fois puis déconnectez Internet : elle continue de fonctionner. Un convertisseur qui envoyait les fichiers à un serveur s’arrêterait dès la déconnexion.

## Comment cette promesse se vérifie

- **Vos images ne peuvent être envoyées nulle part.** La Content-Security-Policy énumère les adresses que cette page peut contacter, dont aucune n’appartient à ce site. Aucun point de collecte ne reçoit vos fichiers et aucun code ne les enverrait s’il existait.
- **La transparence est préservée.** WebP possède un canal alpha comme PNG. Le fond transparent d’un logo reste transparent, sans couleur à choisir ni aplatissement. Le convertisseur [WebP en JPG](https://abox.tools/fr/convertir-webp-en-jpg/) doit vous demander un fond, car JPEG n’a pas de canal alpha.
- **Le mode sans perte est vérifié.** Le canevas n’a pas de bouton sans perte pour WebP. Le navigateur choisit le codage selon la qualité, et les versions actuelles produisent du sans perte au maximum. Ce comportement n’est pas garanti par la spécification : chaque fichier est relu et son codage annoncé. Si le navigateur change, vous le saurez immédiatement.
- **Ce qu’un canevas ne conserve pas.** Le canevas ne contient que les pixels : blocs de texte, profils ICC et XMP sont abandonnés. Sans perte décrit les pixels, pas les métadonnées. Le [lecteur et éditeur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) permet de les lire et de les modifier.
- **Ce que Google charge, et ce qu’il ne reçoit pas.** Les scripts publicitaires et de mesure viennent de Google, le bouton de don de Buy Me a Coffee. Aucun ne reçoit vos images. Tout le code qui lit, décode ou écrit un fichier vient de ce site et figure dans le dépôt.
- **Fonctionne hors ligne.** Chargez la page une fois, puis déconnectez le réseau : l’outil fonctionne de la même façon. Un convertisseur qui envoyait vos images ailleurs ne pourrait pas le faire.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, et `src/shared/image-convert.js` pour la conversion, notamment `encodeWebp`, qui écrit le fichier puis relit ses blocs RIFF afin de vérifier si le navigateur a bien produit le codage sans perte demandé.
