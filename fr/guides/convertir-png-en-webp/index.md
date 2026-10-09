# La même image, un tiers plus petite, avec sa transparence intacte

Le mode sans perte de WebP garde tous les pixels du PNG tout en réduisant la taille. Son mode avec perte peut diviser par dix la taille d’une photographie. Le bon choix dépend entièrement du contenu de l’image ; voici comment le reconnaître.

[Ouvrir PNG en WebP](https://abox.tools/fr/convertir-png-en-webp/): La même image, souvent un tiers plus légère, avec sa transparence intacte.

Dernière mise à jour 4 octobre 2026

AVIF est aussi accepté si votre navigateur sait le décoder. La sortie reste WebP. Une séquence AVIF ne donne que la première image décodée. Le canvas du navigateur crée une copie SDR sur 8 bits : les couleurs ou le HDR peuvent changer, les métadonnées sont omises et le fichier peut être plus gros. Votre original reste inchangé.

## La réponse rapide

Ouvrez le [convertisseur PNG en WebP](https://abox.tools/fr/convertir-png-en-webp/), déposez les fichiers et choisissez l’un des deux modes :

- **Sans perte** pour une image avec du texte, des aplats ou des contours nets : capture d’écran, schéma, logo, graphique, tout ce qui est dessiné plutôt que photographié. Chaque pixel opaque reste exactement identique et le fichier devient plus petit.
- **Plus petit** pour une photographie. Le gain est énorme et la différence invisible.

Rien n’est envoyé dans les deux cas. Votre navigateur sait écrire WebP depuis 2020 : l’encodeur est déjà sur votre ordinateur.

## Pourquoi un PNG est si gros

PNG est sans perte : il ne supprime jamais rien. Il cherche les répétitions — suites de pixels identiques, lignes ressemblant à la précédente — et les décrit de façon compacte.

Cela fonctionne très bien pour les images auxquelles PNG était destiné. Une capture d’écran comporte surtout des panneaux unis et du texte répété ; un logo, quelques couleurs unies. Les deux se compressent énormément.

Cela fonctionne mal pour une photographie, où presque rien ne se répète. Chaque brin d’herbe, chaque dégradé de ciel, chaque grain de bruit du capteur diffère légèrement de son voisin, et PNG les enregistre tous. Une photo de téléphone en PNG pèse couramment dix fois le JPEG correspondant. Vous demandez simplement à un format sans perte de stocker une image qui n’a pas besoin de l’être ainsi.

Voilà pourquoi le bon choix ci-dessous dépend de l’image.

## WebP sans perte : le remplacement direct

WebP dispose d’un mode sans perte qui compresse mieux que PNG : il est plus récent et utilise davantage de techniques. Sur les images adaptées au PNG, il retire généralement encore un cinquième à un tiers de la taille sans rien sacrifier.

C’est le mode pour le texte et les contours nets : captures de documentation, maquettes d’interface, schémas, dessins au trait, logos, graphiques, pixel art. Le résultat est la même image, plus petite. La seule réserve est un logiciel qui ne sait pas lire WebP.

L’affirmation « sans perte » mérite aussi d’être vérifiée, ce que fait l’outil. WebP stocke ses pixels dans l’un de deux blocs, et le convertisseur relit le fichier terminé pour voir lequel a été produit. Si un navigateur cessait de respecter la demande, la ligne le signalerait plutôt que de présenter un fichier avec perte comme sans perte. Tous les navigateurs actuels respectent la demande.

## WebP avec perte : pour les photographies

L’autre mode retire des détails que vous remarqueriez peu, comme JPEG mais beaucoup mieux. Sur une photographie, il peut couramment réduire un PNG de 2 Mo à moins de 200 Ko, sans différence visible côte à côte.

Le curseur commence à 80, la valeur par défaut de WebP, généralement convaincante pour une photo. En dessous d’environ 60, la différence commence à se voir.

Ce mode ne convient *pas* aux aplats décrits plus haut. La compression avec perte lisse l’image, ce qui nuit au texte et aux contours nets : un halo apparaît autour des lettres, comme sur une mauvaise numérisation. Si l’image contient des mots, choisissez le mode sans perte.

## La transparence reste dans les deux cas

WebP possède un vrai canal alpha, comme PNG : un logo sur fond transparent reste transparent. Aucune couleur à choisir, aucun fond ajouté.

La conversion inverse est différente. Convertir *vers* JPEG détruit la transparence, car JPEG ne possède aucun canal alpha. Une section complète l’explique dans le guide [convertir WebP en JPG](https://abox.tools/fr/guides/convertir-webp-en-jpg/). WebP n’a pas ce problème : c’est l’une des raisons de le préférer quand vous avez le choix.

Une précision mesurée : un pixel *partiellement* transparent peut voir sa couleur enregistrée varier très légèrement. C’est une propriété du passage par un canevas de navigateur : il stocke la couleur multipliée par la transparence et ne peut pas inverser exactement cette multiplication. Cela ne vient pas de WebP. C’est invisible, car les pixels dont la couleur varie le plus sont ceux qui en montrent le moins. Les pixels opaques restent identiques bit pour bit.

## Un WebP s’ouvre-t-il partout ?

Sur le web, oui. Chrome, Edge, Firefox et Safari affichent tous WebP depuis 2020. Pour un site web, il n’est donc plus nécessaire de prévoir un autre format. C’est l’intérêt principal de cette conversion : des pages plus légères avec la même image.

Hors du navigateur, c’est moins uniforme. Windows et macOS les prévisualisent désormais, mais certains anciens logiciels, formulaires et la plupart des liseuses les refusent encore. Dans ce cas, il vous faut l’outil inverse, [WebP en JPG](https://abox.tools/fr/convertir-webp-en-jpg/), et son [guide](https://abox.tools/fr/guides/convertir-webp-en-jpg/).

## Ce qui ne suit pas

Les pixels restent ; les données autour, non. Le passage par un canevas laisse derrière les blocs de texte, profils de couleur ICC et blocs XMP du PNG.

C’est généralement sans conséquence pour un PNG : il contient rarement des données d’appareil photo, et une capture d’écran n’en contient pas. Pour examiner un fichier, l’outil de [lecture et suppression EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) lit et écrit ces données sans recomprimer l’image.

## Pourquoi il n’y a aucun envoi

Les deux parties du travail sont déjà sur votre ordinateur. Votre navigateur décode PNG et encode WebP depuis 2020. Cette même capacité a permis aux sites de servir des WebP.

Un convertisseur qui envoie les fichiers à un serveur utilise donc sa propre copie d’un logiciel que vous possédez déjà, et garde vos images pendant l’opération. L’[outil proposé ici](https://abox.tools/fr/convertir-png-en-webp/) travaille dans la page et fonctionne avec le réseau débranché : c’est la preuve la plus simple que rien n’est parti. Le guide [est-il sûr d’envoyer des fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) développe cette question.
