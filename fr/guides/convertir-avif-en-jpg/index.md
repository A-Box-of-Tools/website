# Le fichier que rien n’ouvre, sauf le navigateur dans lequel vous lisez ceci

Une image enregistrée depuis un site arrive en `.avif` et votre visionneuse la refuse, alors que le navigateur l’affiche sans problème. Cet écart explique tout, et aussi pourquoi la conversion n’a jamais besoin de quitter votre ordinateur.

[Ouvrir AVIF en JPG](https://abox.tools/fr/convertir-avif-en-jpg/): Le format que les sites enregistrent aujourd’hui, dans celui que tout accepte depuis toujours.

Dernière mise à jour 17 septembre 2026

## La réponse rapide

Ouvrez le [convertisseur AVIF en JPG](https://abox.tools/fr/convertir-avif-en-jpg/), déposez les fichiers et appuyez sur « Convertir ». Laissez la qualité à 92. Vous obtenez des JPEG, avec un bouton de téléchargement pour chacun ou une archive zip s’ils sont plusieurs.

Rien n’est envoyé, et vous n’avez rien à télécharger au préalable. Le décodeur est déjà dans le navigateur où vous lisez ceci. C’est le point qui mérite le plus d’explications ; une section lui est consacrée ci-dessous.

## Ce qu’est AVIF, et pourquoi vous en avez un

AVIF stocke une image fixe comme une image vidéo moderne : une seule image clé du codec vidéo **AV1**, dans le même conteneur à boîtes qu’un MP4. Cette façon de concevoir un format d’image paraît étrange, mais fonctionne très bien. AV1 a reçu bien plus de travail d’ingénierie que n’importe quel codec d’image fixe, car c’est dans la vidéo que se trouve l’argent.

Le résultat est nettement plus petit qu’un JPEG de même qualité visible, souvent trois à cinq fois plus petit. Les sites ont donc commencé à le distribuer. Quand vous enregistrez une image, vous recevez le format utilisé par le site. Vous n’avez pas choisi AVIF.

Et ensuite, rien sur votre ordinateur ne l’ouvre :

- Windows demande une extension du Store pour l’afficher dans Photos ;
- beaucoup de logiciels de retouche de bureau le refusent encore ;
- la plupart des formulaires qui vérifient les extensions ne le connaissent pas ;
- les imprimantes, liseuses et logiciels d’appareils photo ont des années de retard.

## Votre navigateur le lit : tout est là

Glissez le fichier dans une fenêtre de navigateur : il s’affiche parfaitement. Chrome et Firefox décodent AVIF depuis 2021, Safari depuis 2023.

Ce n’est pas une curiosité : c’est pourquoi cette conversion n’exige aucun serveur. Un convertisseur doit lire un AVIF et écrire un JPEG. Votre navigateur fait déjà les deux. L’[outil proposé ici](https://abox.tools/fr/convertir-avif-en-jpg/) ajoute un bouton d’enregistrement à ce décodeur : il ouvre le fichier avec le navigateur, le dessine et demande un JPEG en retour.

Quand un convertisseur demande l’envoi d’un AVIF, il utilise donc sa propre copie d’un logiciel que vous possédez déjà, et garde votre image pendant l’opération.

## La comparaison qui explique quels convertisseurs ont besoin d’un serveur

AVIF a un quasi-jumeau : **HEIC**, le format utilisé par l’iPhone. Leur conception est presque identique : même conteneur à boîtes, une image fixe d’un codec vidéo à l’intérieur, HEVC au lieu d’AV1. Mais la situation des logiciels est exactement inverse.

|  | HEIC | AVIF |
| --- | --- | --- |
| Navigateurs qui le décodent | Safari uniquement | tous |
| Navigateurs qui l’encodent | aucun | aucun |
| Ce que le convertisseur doit fournir | un décodeur, environ 1,4 Mo | rien du tout |

C’est pourquoi notre [convertisseur HEIC](https://abox.tools/fr/convertir-heic-en-jpg/) télécharge un codec à la première utilisation et consacre une grande partie de sa page à l’expliquer, tandis que celui-ci ne télécharge rien et le dit. Même entreprise, même promesse, réponse différente : les formats sont réellement différents.

Cela donne aussi une question à poser à tout convertisseur : *mon navigateur sait-il déjà faire cela ?* Si oui, l’envoi du fichier est un choix du site, pas une exigence de l’opération.

## Le JPG sera plusieurs fois plus gros

Attendez-vous à cela ; ce n’est pas un échec. Une image de 40 Ko en AVIF peut facilement peser 200 Ko en JPEG à qualité visible équivalente. L’exemple de la page de l’outil devient environ cinq fois plus gros, et la ligne de résultat vous le signale.

AVIF est l’un des meilleurs codecs d’image fixe et JPEG l’un des plus anciens. Vous échangez des octets contre de la compatibilité. C’est le bon choix quand le destinataire refuse AVIF, mais cela reste un compromis.

Si la taille compte ensuite, le [compresseur d’images](https://abox.tools/fr/compresser-une-image/) réduit un JPEG à la taille demandée. L’outil le propose sous votre résultat.

## Ce qu’un JPEG ne peut pas conserver

Deux choses, qui ne concernent pas la plupart des images :

**La transparence.** AVIF peut avoir un fond transparent, JPEG non : il faut donc ajouter un fond. L’outil demande sa couleur et propose le blanc, uniquement lorsqu’un fichier de votre liste contient réellement de la transparence. La plupart des AVIF enregistrés sur le web sont des photographies opaques ; la question n’apparaît généralement pas. Pour garder la transparence, convertissez plutôt en PNG ou WebP avec le [compresseur d’images](https://abox.tools/fr/compresser-une-image/), qui lit AVIF et écrit ces deux formats.

**Le HDR et les couleurs profondes.** AVIF peut stocker dix ou douze bits par canal et décrire des hautes lumières plus brillantes que celles d’un écran ordinaire. JPEG utilise huit bits et ne connaît pas le HDR : ces images sont ramenées à la plage ordinaire. Presque aucune image enregistrée depuis une page web habituelle n’utilise ces fonctions. Si la vôtre ne les utilise pas, ce qui est très probable, vous ne perdez rien sur ce point.

## La conversion inverse est un autre problème

Il n’y a pas d’outil JPG en AVIF ici, pour une raison qui mérite d’être dite : **aucun navigateur ne sait écrire un AVIF**. Si vous en demandez un au canevas du navigateur, il renvoie discrètement un PNG avec une mauvaise étiquette.

Une page qui prétend créer des AVIF dans le navigateur se trompe donc, ou envoie l’image à un serveur pour l’encoder. Le faire correctement sans serveur demande de construire l’encodeur : c’est un vrai travail, inscrit sur [la feuille de route](https://abox.tools/fr/feuille-de-route/), plutôt qu’une fonction simulée.

## Les métadonnées ne suivent pas

L’image est décodée et redessinée : seuls les pixels arrivent. EXIF, GPS, profils de couleur et XMP restent derrière. Une image enregistrée depuis une page web ne contient généralement rien de tout cela au départ.

Pour examiner les données avant de décider, l’outil de [lecture et suppression EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) les montre sans recomprimer l’image. Le guide [la conversion d’une photo supprime-t-elle ses métadonnées](https://abox.tools/fr/guides/convertir-une-photo-supprime-t-il-ses-metadonnees/) donne une réponse plus détaillée.
