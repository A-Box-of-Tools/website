# AVIF en JPG — convertir sans envoi

Le format que les sites enregistrent aujourd’hui, dans celui que tout accepte depuis toujours.

> Convertissez des images AVIF en JPG dans votre navigateur. Aucun envoi, aucun compte, fonctionnement hors ligne. Choisissez la couleur qui remplace la transparence.

Cette page est un outil interactif de navigateur à l’adresse https://abox.tools/fr/convertir-avif-en-jpg/. Les fichiers sont traités sur l’appareil qui exécute ce navigateur. Tout partage volontaire ou fonction réseau facultative est expliqué sur la page. Voici son explication écrite ; ouvrez l’adresse pour l’utiliser.

## Vos images sont **traités dans votre navigateur**. Aucun envoi pour traitement.

La conversion s’effectue dans votre navigateur, sur votre appareil. Aucun décodeur à télécharger ni attente : votre navigateur lit AVIF depuis 2021. Cette page utilise ce décodeur, dessine l’image et écrit un JPEG. Aucune fonction réseau, aucun serveur auquel envoyer une photo.

- ✗ Aucun envoi
- ✗ Aucun compte
- ✗ Aucune limite de taille
- ✓ Fonctionne hors ligne
- ✓ Code ouvert

## Comment convertir un AVIF en JPG

1. **Choisissez vos fichiers AVIF.** Déposez-les ou choisissez-les. Leur contenu est identifié par les premiers octets plutôt que par le nom : un AVIF renommé fonctionne, un PNG est refusé avec une explication.
2. **Réglez la qualité et le fond des zones transparentes.** Le curseur commence à 92, où une photo ressemble beaucoup à l’original. La couleur n’apparaît que pour les fichiers transparents : un JPEG doit les remplir.
3. **Appuyez sur « Convertir » et téléchargez.** Chaque résultat indique sa provenance, son poids et la différence. Il est généralement plus lourd : AVIF compresse mieux, et vous échangez des octets contre la compatibilité. Un fichier a son bouton, plusieurs ont aussi un ZIP.

## La version longue

[Le fichier que rien n’ouvre, sauf le navigateur dans lequel vous lisez ceci](https://abox.tools/fr/guides/convertir-avif-en-jpg/): Une image téléchargée en .avif ne s’ouvre dans aucun logiciel ? Votre navigateur la lit parfaitement. Ce qu’est AVIF, ce qu’un JPEG ne peut pas conserver, pourquoi il devient plus gros et comment convertir sans envoyer le fichier.

## Aussi dans la boîte

- [Photo d'identité](https://abox.tools/fr/photo-d-identite/): Choisissez un pays et un document pris en charge. Exigences et repères sont distingués.
- [Empileur d'images](https://abox.tools/fr/empiler-des-images/): Vingt prises n'en font plus qu'une, sans vingt envois et sans dérawtiseur.
- [Caviardage d'image](https://abox.tools/fr/caviarder-une-image/): Ce que vous recouvrez est supprimé du fichier, pas dissimulé dedans.
- [Lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/): Voyez ce qu'une photo raconte sur vous. Puis retirez-le.

## Questions

### Mon image est-elle envoyée quelque part ?

Non. Votre navigateur lit, décode et écrit le fichier sur votre appareil. Cet outil n’a aucune fonction réseau : il ne récupère ni n’envoie de contenu. La `Content-Security-Policy` énumère les adresses autorisées, dont aucune n’appartient à ce site. Le décodeur se trouve déjà dans votre navigateur.

### Pourquoi aucun logiciel de mon ordinateur n’ouvre-t-il ce fichier ?

Les sites utilisent AVIF car il est bien plus petit qu’un JPEG à qualité égale. Le téléchargement donne alors un `.avif`, mais vos logiciels peuvent être plus anciens : Windows peut nécessiter une extension et beaucoup d’éditeurs, liseuses, imprimantes ou formulaires le refusent. Votre navigateur le lit déjà, d’où l’utilité de cette page.

### Le JPG sera-t-il plus gros que l’AVIF ?

Presque toujours, parfois plusieurs fois. Un AVIF de 40 Ko peut donner un JPEG de 200 Ko à qualité visuelle égale. Vous gagnez en compatibilité. Le [compresseur d’images](https://abox.tools/fr/compresser-une-image/) peut ensuite réduire le JPEG au poids voulu.

### Que devient la transparence ?

Elle est remplacée par la couleur que vous choisissez. JPEG n’a pas de canal alpha. Les photos opaques ne font pas apparaître le réglage. Pour préserver la transparence, utilisez PNG ou WebP avec le [compresseur d’images](https://abox.tools/fr/compresser-une-image/), qui lit AVIF et écrit ces deux formats.

### Et le HDR et les couleurs sur 10 bits ?

Cet outil écrit un JPEG SDR classique de 8 bits depuis le canvas du navigateur. La profondeur supplémentaire et les informations HDR de l’AVIF ne sont pas conservées ; les couleurs ou hautes lumières peuvent changer. Gardez l’original pour l’archivage. Des formats HDR basés sur JPEG existent : [la spécification Ultra HDR d’Android](https://developer.android.com/media/platform/hdr-image-format) décrit une carte de gain que cet outil ne crée pas.

### L’image est-elle recomprimée ?

Oui : AVIF et JPEG sont des codecs différents. Chaque convertisseur doit décoder puis réencoder l’image, y compris ceux qui demandent un envoi. Vous réglez la perte : 92 par défaut ressemble beaucoup à l’original.

### Peut-on convertir dans l’autre sens, JPG en AVIF ?

Pas ici. Cet outil utilise l’encodeur du canvas et n’inclut aucun encodeur AVIF. Un type de sortie non pris en charge revient au PNG ; changer l’extension ne crée pas d’AVIF. D’autres outils peuvent encoder l’AVIF localement avec un encodeur distinct, sans envoi. [Les règles de sortie du canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) expliquent ce repli.

### Conserve-t-il la date, l’appareil et la localisation ?

Non. Un canevas ne contient que les pixels : EXIF, GPS, profils colorimétriques et XMP sont abandonnés. Pour lire ou modifier ces données sans recomprimer l’image, utilisez le [lecteur et éditeur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/).

### Peut-il traiter un dossier entier ?

Oui. Déposez autant de fichiers que vous voulez, sans limite de nombre ni de taille imposée par un serveur. Chacun a sa ligne et son téléchargement ; à partir de deux, une archive ZIP rassemble le tout.

### Est-ce gratuit et utilisable hors ligne ?

Oui, sans compte, connexion, essai limité ni filigrane. La publicité finance le site sans recevoir vos images. Chargez la page une fois puis déconnectez Internet : elle fonctionne toujours, preuve qu’aucun fichier n’est envoyé.

## Comment cette promesse se vérifie

- **Le traitement se fait dans ce navigateur.** L’outil traite entrées et résultats dans le navigateur. Son code ne les envoie pas pour traitement. Content-Security-Policy limite ressources et destinations, mais les hôtes autorisés peuvent recevoir des requêtes : elle n’inspecte pas les données et ne prouve pas seule une absence d’envoi. Comparez code et requêtes de l’opération ou terminez l’opération locale déconnecté.
- **Le décodeur est déjà dans votre navigateur.** Un AVIF refusé par votre visionneuse s’ouvre dans un navigateur : Chrome et Firefox le décodent depuis 2021, Safari depuis 2023. Cette page ajoute un bouton d’enregistrement à ce décodeur : elle ouvre, dessine puis écrit un JPEG. Aucun moteur à télécharger, aucune première conversion à attendre et aucun serveur nécessaire.
- **Les zones transparentes et leur fond.** AVIF peut contenir un canal alpha, JPEG non. Cette page vous demande une couleur, blanche par défaut, seulement si les pixels décodés montrent réellement de la transparence. La plupart des AVIF du Web sont des photos opaques : le réglage reste alors masqué.
- **Ce que cette conversion ne conserve pas.** Cet outil écrit un JPEG SDR classique de 8 bits depuis le canvas du navigateur. La profondeur supplémentaire et les informations HDR de l’AVIF ne sont pas conservées ; les couleurs ou hautes lumières peuvent changer. Gardez l’original pour l’archivage.
- **Ce que Google charge, et ce qu’il ne reçoit pas.** Les scripts publicitaires et de mesure viennent de Google, le bouton de don de Buy Me a Coffee. Aucun ne reçoit vos images. Tout le code qui lit, décode ou écrit un fichier vient de ce site et figure dans le dépôt.
- **Fonctionne hors ligne.** Chargez la page une fois, puis déconnectez le réseau : l’outil fonctionne de la même façon. Un convertisseur qui envoyait vos images ailleurs ne pourrait pas le faire.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, et `src/shared/image-convert.js` pour l’identification du format AVIF, le décodage et le canevas qui écrit le JPEG. Ce fichier est partagé avec les deux autres convertisseurs et ne contient aucun codec.
