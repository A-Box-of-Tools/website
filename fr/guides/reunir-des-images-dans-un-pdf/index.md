# Comment réunir des images dans un seul PDF

On vous a demandé « un seul PDF » et vous avez onze photographies de papier. Voici les choix qui changent vraiment le résultat, à savoir le format de page, l'ordre, la qualité et ce que le document dit de vous, ainsi que ceux que vous pouvez ignorer.

[Ouvrir Images en PDF](https://abox.tools/fr/images-en-pdf/): Réunir vos images dans un seul document.

Dernière mise à jour 13 octobre 2026

## La réponse courte

Ouvrez [Images en PDF](https://abox.tools/fr/images-en-pdf/), déposez les images, faites glisser les vignettes dans le bon ordre et créez le document. Le réglage par défaut adapte chaque page à son image et conserve les JPEG admissibles sans réencodage. Choisissez explicitement A4 ou Letter si le destinataire attend un format papier standard.

Les quatre choses qui méritent réflexion sont l'ordre, le format de page, le réglage de qualité, et ce que le document fini raconte sur vous. Dans cet ordre de fréquence des erreurs.

![Un aperçu de la première page du PDF, avec un récapitulatif à côté : quatre pages, un format de page calé sur chaque image et quatre images sur quatre reprises telles quelles.](https://abox.tools/screens/combine-images-into-a-pdf/preview.webp)

L'aperçu est la vérification qui compte : c'est la page finie, au format de la page finie.

## Un dossier de candidature ou une trace d'une réparation

Pour une inscription scolaire, un remboursement ou des justificatifs, ajoutez uniquement les images demandées et classez-les selon la liste du destinataire. Choisissez A4 ou Letter si un format papier est imposé, et *Ajuster dans les marges* pour ne pas couper un numéro de référence au bord. Faites pivoter les pages de côté, créez le PDF, puis ouvrez le fichier téléchargé pour contrôler le nombre de pages et les plus petits caractères. Ajoutez ensuite les pages PDF existantes avec l'[outil de fusion](https://abox.tools/fr/guides/fusionner-et-diviser-des-pdf/).

Le même outil crée un dossier de garantie utile : le reçu d'abord, puis l'étiquette du numéro de série et les photos du défaut. Utilisez *Adapter la page à chaque image* pour des photos de formes différentes et le stockage sans perte pour les captures dont le petit texte doit rester net. Chaque image devient une page distincte ; cela ne crée ni planche-contact ni texte consultable par recherche. Gardez les images originales avec le PDF.

## Réglez l'ordre avant tout le reste

L'ordre des pages est de loin ce qu'on rate le plus, parce que les noms de fichiers se trient d'une façon à laquelle personne ne s'attend. `IMG_2.jpg` vient après `IMG_10.jpg` dans un tri alphabétique, puisque la comparaison se fait caractère par caractère et que `1` précède `2`. Un dossier de scans nommés `page1` à `page12` arrivera dans le mauvais ordre dans à peu près n'importe quel outil.

Trier par date de prise de vue est en général plus fiable pour des photographies, parce que vous avez photographié les pages dans l'ordre où elles étaient. Dans un cas comme dans l'autre, vérifiez les tuiles avant d'appuyer sur le bouton, plutôt que de vérifier le PDF après.

## La qualité : ce que la plupart des outils ratent en silence

Un PDF sait transporter des données JPEG directement. C'est une propriété du format : les octets compressés d'un JPEG peuvent être déposés tels quels dans le document, et le lecteur les décode comme le ferait un navigateur.

Cela compte, parce que cela veut dire qu'une photographie n'a rien à perdre en entrant dans un PDF. Elle n'est jamais décodée et jamais recompressée ; l'image du document est bit pour bit l'image de votre fichier. Beaucoup d'outils réencodent quand même, parce qu'il est plus simple de tout rendre sur un canvas et d'encoder uniformément, et le résultat est une génération de qualité perdue pour rien.

Les autres formats ne peuvent pas être repris ainsi. PNG, WebP, AVIF et les autres n'ont pas de filtre correspondant dans PDF et doivent être convertis. Vous pouvez choisir comment :

- **Réencoder en JPEG** (le réglage par défaut). Fichier le plus léger, petit coût en qualité, et la bonne réponse pour des photographies.
- **Sans perte.** Stocke les pixels exacts au prix d'un document bien plus lourd. La bonne réponse pour les captures d'écran, les schémas, et tout ce qui contient du texte ou des bords francs, où les artefacts du JPEG sautent aux yeux.

## Le format de page, et quand « ajuster à l'image » vaut mieux

Un format de page standard, qu'il s'agisse d'A4, de Letter, de Legal, d'A3, d'A5 ou de Tabloid, pose chaque image sur une page de ce format, mise à l'échelle pour tenir dans votre marge. Prenez-en un quand le document sera imprimé, ou quand quelqu'un d'officiel va le classer.

« Exactement à la taille de chaque image » fait correspondre chaque page à son image : il n'y a alors ni espace blanc ni mise à l'échelle. Prenez-le quand le PDF est un contenant à images plutôt qu'un document : un portfolio, un jeu de captures, une bande dessinée. Cela a l'air faux à l'impression, parce que chaque page a une taille différente.

Une marge vaut la peine sur tout ce qui sera imprimé. Les imprimantes domestiques ne savent pas imprimer jusqu'au bord du papier, et une photographie posée bord à bord ressort rognée.

### Des pages verticales à partir de photographies horizontales

Si vous avez photographié des feuilles de papier avec un téléphone tenu en travers, chaque image sera horizontale et se posera toute petite au milieu d'une page verticale. Faire pivoter chacune d'un quart de tour avant de construire le document est ce qui corrige cela, et c'est un choix par image plutôt que global, parce qu'en général quelques-unes étaient dans le bon sens.

![Les réglages de page : format, orientation, façon dont l'image rencontre la page, marge et couleur de fond.](https://abox.tools/screens/combine-images-into-a-pdf/layout.webp)

Le format et l'ajustement décident ensemble si une photo est montrée entière ou rognée au papier. L'option qui reprend le format de chaque image évite complètement la question.

## Ce que le PDF fini raconte sur vous

Un PDF porte un bloc d'informations de document : auteur, producteur, date de création, parfois le titre. Selon ce qui l'a écrit, cela peut comprendre votre nom de compte, le nom de votre machine, et l'heure exacte à laquelle vous l'avez fabriqué.

Cela mérite réflexion, parce qu'un PDF est une chose que les gens envoient à d'autres gens : une candidature, une réclamation, un document pour un propriétaire. Les métadonnées voyagent avec, et n'importe quel lecteur peut les afficher.

L'outil d'ici laisse ce bloc vide, à l'exception de son propre nom : pas de noms de fichiers, pas de nom de machine, pas de nom d'utilisateur, et pas de date de création à moins que vous ne cochiez la case qui en demande une. Si vous utilisez un autre outil, cela vaut la peine d'ouvrir une fois les propriétés du résultat pour voir ce qu'il a écrit.

À part cela : les images elles-mêmes. Si vos photographies portent des étiquettes EXIF et GPS, leur sort dépend du chemin. Un JPEG recopié sans réencodage garde ce qu'il avait ; une image réencodée perd les étiquettes par effet de bord. Si cela compte, nettoyez les photos d'abord avec le [lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/), dont [le guide](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/) explique ce qu'il y a dedans.

## Si le PDF ressort trop gros

Les photographies de téléphone sont lourdes, et vingt d'entre elles font un document qu'un courriel refusera. Trois choses à essayer, dans l'ordre :

**Réduisez le plus grand côté.** Une photographie de 4000 pixels d'une feuille de papier transporte bien plus de détail qu'aucun lecteur ni aucune imprimante n'en utilisera. Ramener le grand côté à quelque chose comme 2000 pixels divise typiquement le fichier par quatre et ne change rien que quiconque puisse voir sur une page.

**Prenez le JPEG plutôt que le sans perte** pour tout ce qui est photographique. Le sans perte est la bonne réponse pour les schémas et la mauvaise pour la photo d'une page.

**Compressez le document fini.** Le [compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/) travaille par rapport à la taille à laquelle chaque image est dessinée sur la page plutôt que par rapport à son nombre de pixels, et c'est la mesure qui compte ; [son guide](https://abox.tools/fr/guides/reduire-la-taille-d-un-pdf/) traite de ce que cela coûte.

Aucune limite n'est intégrée à l'outil quant au nombre d'images. Le plafond pratique est la mémoire de votre propre machine, parce que le document fini y est assemblé avant que vous le téléchargiez : quelques centaines de photos de téléphone en pleine résolution commencent à s'y faire sentir, et réduire le plus grand côté repousse ce plafond bien plus loin.

## Ce que cela ne vous donnera pas

Un PDF fait de photographies est un PDF plein d'images. Les mots qui y figurent ne sont pas du texte : vous ne pouvez ni y chercher un mot, ni le copier, ni le faire lire par un lecteur d'écran. C'est une propriété de ce dont vous êtes parti, pas de la conversion.

S'il vous faut du texte où l'on puisse chercher, il vous faut de l'OCR, qui est un autre métier. Et si le document d'origine existe encore quelque part comme document, l'exporter directement en PDF battra toujours le fait de le photographier : plus léger, plus net, et interrogeable.

## Pourquoi cela n'a pas besoin d'un envoi

Écrire un PDF, c'est écrire un fichier structuré : un en-tête, un jeu d'objets, une table de références croisées. Il n'y a rien là-dedans qu'un navigateur ne sache faire, et rien dans ce travail qui exige que les images voyagent où que ce soit.

Ce qui mérite attention ici, à cause de ce que les gens mettent dans ces documents. Pièces d'identité, relevés bancaires, courriers médicaux, contrats signés : toute la raison pour laquelle quelqu'un fabrique un PDF est en général qu'il l'envoie à une institution. L'outil d'ici n'a aucune fonction réseau, et la `Content-Security-Policy` de la page énumère toutes les adresses qu'elle peut contacter, dont aucune n'appartient à ce site.

[Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) expose comment le vérifier vous-même, ici comme ailleurs.
