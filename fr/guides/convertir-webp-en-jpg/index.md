# L’image enregistrée par le web, et le format encore accepté partout

Un clic droit sur une image de presque n’importe quel site produit aujourd’hui un `.webp`, parfaitement lu par votre navigateur mais encore refusé par beaucoup d’autres logiciels. Voici ce que c’est, ce que la conversion coûte et pourquoi le JPEG est généralement plus gros.

[Ouvrir WebP en JPG](https://abox.tools/fr/convertir-webp-en-jpg/): Les images que le Web enregistre, dans le format que tout accepte encore.

Dernière mise à jour 17 septembre 2026

## La réponse rapide

Ouvrez le [convertisseur WebP en JPG](https://abox.tools/fr/convertir-webp-en-jpg/), déposez les fichiers et appuyez sur « Convertir ». Laissez la qualité à 92 sauf raison particulière. Vous obtenez des JPEG, avec un bouton de téléchargement pour chacun ou une archive zip s’ils sont plusieurs.

Rien n’est envoyé, parce que rien ne doit l’être. C’est aussi la raison de la rapidité de l’opération : le décodeur est déjà dans votre navigateur.

## Pourquoi vous avez un .webp

WebP est le format d’image de Google. Les sites l’utilisent car il est nettement plus petit qu’un JPEG de même qualité visible, couramment d’un quart à un tiers, parfois davantage. Pour des millions d’images, cela réduit réellement la bande passante et le temps de chargement. La plupart des grands sites l’ont donc adopté ces dernières années.

Quand vous enregistrez une image par clic droit, vous recevez le format servi par le site. Vous n’avez pas choisi WebP : vous avez simplement enregistré une image.

Elle ne va ensuite pas là où vous voulez. Les obstacles habituels :

- les formulaires qui vérifient l’extension dans une liste écrite il y a des années ;
- les anciennes versions de Word, PowerPoint et Photoshop ;
- la plupart des liseuses et beaucoup de logiciels d’imprimantes ou d’appareils photo ;
- certains imprimeurs, qui n’acceptent que JPEG ou TIFF.

Votre navigateur, lui, l’ouvre sans problème : tous les navigateurs lisent WebP depuis 2020. L’écart entre leurs capacités et celles des autres logiciels est la raison d’être de cette page.

## Le JPG sera probablement plus gros : c’est normal

Il vaut mieux le dire avant la conversion : un WebP de 300 Ko devient souvent un JPEG de 450 Ko. Rien n’a mal fonctionné.

WebP compresse simplement mieux que JPEG. JPEG date de 1992 ; WebP est arrivé en 2010 avec vingt années de recherches supplémentaires. En passant au format plus ancien, vous demandez à un compresseur moins performant de décrire la même image : il a besoin de plus d’octets. Vous échangez la taille contre la compatibilité. C’est un bon choix si le destinataire refuse WebP, mais c’est un compromis que le convertisseur doit annoncer.

Si la taille compte ensuite, le [compresseur d’images](https://abox.tools/fr/compresser-une-image/) réduit un JPEG à la taille demandée. L’outil le propose sous votre résultat, sans que vous ayez à le chercher.

## La transparence doit être remplacée

C’est ce qui surprend et fait apparaître un rectangle noir derrière les logos dans certains convertisseurs.

Un WebP peut être transparent, un JPEG non : le format n’a pas de canal alpha pour noter « il n’y a rien ici ». Il faut peindre un fond derrière l’image. Un convertisseur qui ne demande rien choisit à votre place ; beaucoup choisissent le noir par défaut.

Le [convertisseur proposé ici](https://abox.tools/fr/convertir-webp-en-jpg/) demande la couleur, propose le blanc et ne pose la question que si un fichier de votre liste est réellement transparent. Il examine l’image décodée plutôt que le format : beaucoup de WebP ont un canal alpha entièrement opaque, et un sélecteur de couleur sans effet n’aiderait pas.

Si vous devez garder la transparence, ne convertissez pas en JPEG. Gardez le WebP ou transformez-le en PNG avec le [compresseur d’images](https://abox.tools/fr/compresser-une-image/), qui lit WebP et écrit PNG.

## Un WebP animé donne une seule image

Un WebP peut contenir une animation, comme un GIF. Un JPEG contient exactement une image ; le convertisseur ne peut rien faire des suivantes dans ce format.

L’outil vous avertit avant toute action — la ligne indique que le fichier est animé — puis dans le résultat. Vous obtenez la première image. Pour conserver une animation lisible, il faut une vidéo plutôt qu’une image fixe : le guide [convertir un GIF en MP4](https://abox.tools/fr/guides/convertir-un-gif-en-mp4/) explique ce que cela implique.

## L’image est recomprimée, sans autre possibilité

WebP et JPEG sont des codecs différents. Aucun réemballage astucieux ne transforme l’un en l’autre : il faut décoder les pixels puis les encoder de nouveau. Tous les convertisseurs WebP en JPG le font, y compris ceux qui demandent un envoi.

Vous choisissez l’ampleur de la perte. La valeur par défaut, 92, rend une photographie très difficile à distinguer de l’original. En dessous d’environ 75, les différences apparaissent autour des contours nets et du texte.

Un cas mérite attention : le WebP **sans perte**, utilisé par les outils de création pour les dessins aux couleurs unies. Le JPEG devient alors la première version avec perte de cette image. L’outil signale les fichiers sans perte dans la liste, pour que ce soit une décision plutôt qu’une surprise.

## Les métadonnées ne suivent pas

Le passage par un canevas de navigateur ne conserve que les pixels. EXIF, coordonnées GPS, profils de couleur et blocs de droits d’auteur sont laissés derrière.

C’est généralement le résultat souhaité pour une image à envoyer. Sinon, ou pour examiner le contenu avant de décider, l’outil de [lecture et suppression EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) lit et écrit ces données sans recomprimer l’image. Le guide [la conversion d’une photo supprime-t-elle ses métadonnées](https://abox.tools/fr/guides/convertir-une-photo-supprime-t-il-ses-metadonnees/) détaille la réponse.

## Pourquoi cet outil ne demande aucun envoi

Presque tous les résultats d’une recherche de convertisseur WebP demandent d’envoyer le fichier à un serveur. Demandez-vous à quoi il sert : dans ce cas, à rien.

Lire un WebP demande un décodeur WebP, que votre navigateur possède depuis 2020 : c’est ainsi qu’il affichait l’image sur le site d’origine. Écrire un JPEG demande un encodeur JPEG, présent dans les navigateurs depuis toujours. Les deux parties sont déjà installées sur votre ordinateur. Un site qui reçoit le fichier utilise sa copie d’un logiciel que vous possédez déjà, tout en gardant votre image.

Ce n’est pas vrai de toutes les conversions. Le [convertisseur HEIC](https://abox.tools/fr/guides/convertir-un-heic-en-jpg/) a réellement besoin d’un décodeur absent de votre navigateur ; sa page en fournit donc un et l’explique. La réponse dépend du format. La bonne question est de savoir dans quel cas vous êtes. Le guide [est-il sûr d’envoyer des fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) développe cette question.
