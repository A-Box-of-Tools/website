# Comment scanner un document avec son téléphone

On vous a demandé de renvoyer un formulaire « scanné », et vous avez un téléphone et pas de scanner. L'écart entre la photo d'une page et un scan de cette page est plus petit qu'il n'y paraît, et il ne tient pas surtout à l'inclinaison : voici ce qui les sépare réellement, et quoi faire de chaque morceau.

[Ouvrir Scanner de documents](https://abox.tools/fr/scanner-un-document/): Photographiez la page. Vous récupérez quelque chose qui a l'air scanné.

Dernière mise à jour 26 août 2026

## La réponse courte

Posez la page sur quelque chose qui n'est pas de la même couleur qu'elle, tenez-vous au-dessus, remplissez le cadre et prenez une photo. Ouvrez ensuite le [scanner de documents](https://abox.tools/fr/scanner-un-document/), vérifiez les quatre coins trouvés, choisissez « Couleur, égalisée » ou « Noir et blanc » et enregistrez le PDF.

C'est tout le travail. Le reste explique ce que corrige chacune de ces étapes, car savoir quelle partie fait quoi est ce qui permet de voir, en trois secondes, si ce que vous vous apprêtez à envoyer sera accepté.

## Ce qui sépare réellement une photo d'un scan

Trois choses, et elles n'ont pas la même importance.

- **L'inclinaison.** Une photo est prise d'où vous vous trouviez : la page est donc un quadrilatère et non un rectangle. C'est ce que tout le monde remarque et le plus facile à défaire.
- **La lumière.** Un scanner promène une lumière uniforme sur la page. Une pièce, non : il y a une zone claire sous la lampe, un coin sombre à l'écart, et très souvent votre propre ombre en travers d'un côté. C'est cela qui fait réellement qu'une photo ressemble à une photo, et c'est cela qu'on essaie de corriger avec le « contraste automatique », ce qui l'aggrave.
- **La taille.** La photo d'une page à douze mégapixels fait trois à cinq mégaoctets. Vingt d'entre elles font un document que la moitié des serveurs de messagerie renverront.

## Prendre la photo

Cinq choses, par ordre d'importance :

- **Remplissez le cadre.** C'est la seule qui ne se corrige pas après. Le détail qui n'était pas dans la photo n'est pas dans le fichier, et une page photographiée depuis l'autre bout de la pièce est une page que personne ne peut lire à aucune résolution. Approchez-vous plutôt que de zoomer : à moins que le téléphone ne bascule sur un second objectif plus long, zoomer est un recadrage du même capteur et jette précisément les pixels que vous cherchez à garder.
- **Posez-la sur quelque chose d'une autre couleur.** Une page blanche sur un bureau blanc n'a presque aucun bord à trouver — ni pour un logiciel, ni pour vous non plus quand il faudra tirer les coins à la main. Une table sombre, un livre, un manteau : n'importe quoi.
- **Ne vous mettez pas entre la page et la lumière.** Votre propre ombre en travers de la page est la raison la plus fréquente pour laquelle un scan fait au téléphone est mauvais. Tournez de quatre-vingt-dix degrés et elle disparaît.
- **Laissez la mise au point se faire, puis ne bougez plus.** Le bougé n'est récupérable par aucun outil, et une mise au point ratée non plus. Touchez la page à l'écran, attendez que cela se stabilise, puis déclenchez.
- **Prenez la page entière, coins compris.** Non que les coins soient précieux, mais parce que c'est sur eux que se mesure le redressement. Une page qui déborde du cadre fonctionne encore — le bord de la photo tient lieu de bord de page — mais une page avec trois coins dans le cadre et un quatrième deviné est une page qui sortira légèrement de travers.

## Redresser : la forme compte plus que l'angle

Défaire l'inclinaison est un calcul bien compris. Quatre coins d'un rectangle vus de n'importe où déterminent la transformation qui les remet en place, et l'appliquer à chaque pixel donne une page plate. Tout outil qui prétend redresser une page fait cela.

Ce qui tourne mal en silence, c'est *quelle taille* doit avoir la page plate. La méthode évidente est de mesurer les bords du quadrilatère et d'en prendre le rapport ; or une photo prise de biais raccourcit le bord lointain, si bien qu'une feuille A4 sort visiblement trapue. Cela ressemble toujours à un scan. Simplement, chaque ligne de texte y a la mauvaise hauteur, et rien à l'écran ne le dit.

La meilleure réponse, c'est que la perspective elle-même porte l'information : pourvu que ce soit un appareil ordinaire, la photo d'un rectangle suffit à récupérer à la fois les vraies proportions du rectangle et la focale de l'appareil. Le [scanner de documents](https://abox.tools/fr/scanner-un-document/) d'ici le fait, puis vous dit quelle forme la page a prise et si c'est un format normalisé — une page qui annonce « 1:1,41, la forme de l'A4 ou de l'A5 » est une page à laquelle vous pouvez cesser de penser.

![La photo d'une feuille posée sur un bureau, prise de biais, avec un quadrilatère détecté tracé sur ses coins et des poignées pour les ajuster.](https://abox.tools/screens/scan-a-document-with-your-phone/corners.webp)

Les coins, trouvés puis déplacés s'ils ont été mal trouvés. Les placer correctement est ce qui transforme une photo en numérisation.

## La lumière : diviser, pas étirer

Monter le contraste d'une page inégalement éclairée rend la partie claire blanche et la partie sombre noire, et l'écriture de la partie sombre disparaît avec. Le problème n'a jamais été que le contraste fût trop faible. C'est que le papier n'a pas la même clarté dans un coin et dans l'autre : aucun réglage unique n'est donc juste pour toute la page.

Ce qui marche, c'est d'estimer la clarté du papier *en chaque point* et de diviser par elle. Le papier est la majorité claire de tout petit morceau d'une page : mesurer la clarté sur une grille de petites tuiles et prendre une valeur haute dans chacune donne donc la forme de la lumière, le texte étant trop sombre et trop clairsemé pour la déplacer. Divisez par cela et ce qui reste est l'encre, uniformément éclairée, sans l'ombre et avec le papier redevenu blanc.

C'est ce que font « Couleur, égalisée » et « Niveaux de gris ». Choisissez la couleur quand la couleur fait partie du document : un tampon, une signature à l'encre bleue, une ligne surlignée, tout ce dont on pourrait plus tard demander si c'était l'original.

![La carte de nettoyage : la page redressée, un choix de modes et un curseur d'intensité.](https://abox.tools/screens/scan-a-document-with-your-phone/clean.webp)

La lumière divisée plutôt qu'étirée. Les modes vont d'un éclaircissement doux au noir et blanc complet, et la section du dessous dit lequel employer et quand.

## Noir et blanc, et pourquoi le fichier devient soudain petit

Une page enregistrée en photographie, ce sont des millions de pixels ayant chacun seize millions de couleurs possibles, et le codec dépense son effort sur des dégradés subtils qu'une page de texte n'a pas. Une page enregistrée en noir et blanc, c'est un bit par pixel — encre ou papier — et cela compresse comme la chose massivement répétitive que c'est.

L'écart n'est pas mince : sur les mêmes pages, c'est environ dix-huit fois. Un contrat de vingt pages qui pèse quinze mégaoctets en photographies passe sous le mégaoctet en pages d'un bit, ce qui fait la différence entre un document qu'on peut envoyer par courriel et un document qu'on ne peut pas. C'est pourquoi tous les scanners de bureau l'ont par défaut.

Le hic, c'est qu'il n'y a pas de demi-teintes : une photographie sur la page devient une bouillie de points. Employez-le pour les pages imprimées et manuscrites, ce que sont la plupart des documents, et employez les niveaux de gris pour tout ce qui porte une image.

Un détail qui vaut la peine d'être connu, parce qu'il explique pourquoi un bon outil réussit là où un mauvais produit une page à coin noir : la décision encre ou papier doit se prendre *localement*. Un seuil unique pour toute la page ne peut pas fonctionner quand le papier dans l'ombre est plus sombre que l'encre en pleine lumière — et sur une page photographiée, il l'est très souvent. Décider chaque pixel face à la moyenne de son propre petit voisinage est ce qui garde lisible l'écriture prise dans une ombre.

## Plusieurs pages, un seul document

Photographiez les pages dans l'ordre, ajoutez-les toutes d'un coup et elles deviennent les pages d'un même PDF, dans l'ordre où elles ont été ajoutées. Deux choses à surveiller :

- **Les noms de fichiers ne se trient pas comme vous le pensez.** `page2.jpg` vient après `page10.jpg` dans un tri alphabétique, parce que la comparaison se fait caractère par caractère. Vérifiez l'ordre dans la bande avant d'enregistrer, plutôt que dans le PDF après coup.
- **Le nettoyage est un réglage pour tout le document**, et c'est délibéré. Des pages nettoyées différemment ressemblent à deux documents agrafés ensemble, ce qui est exactement l'impression qu'un scan doit éviter. Prenez le mode qui convient à la pire page.

## Avant de l'envoyer

- **Ouvrez le PDF.** Pas l'aperçu : le fichier. Chaque page, dans le bon sens, rien de coupé sur un bord.
- **Lisez la plus petite chose de la page.** Un numéro de dossier, une date, un numéro de compte. Si vous ne pouvez pas le lire à l'écran à 100 %, votre destinataire non plus.
- **Vérifiez que les coins n'ont pas été rognés.** Ce qui se trouve au bord d'un formulaire, c'est un numéro de page, une ligne de signature, ou la case dont on dira plus tard qu'elle manquait.
- **Vérifiez ce que le document dit de vous.** Un PDF a des champs pour l'auteur, le producteur et la date de création, et la plupart des outils les remplissent. Que cela compte dépend du destinataire, mais il vaut la peine de savoir que c'est là.

## Pourquoi rien de tout cela n'a besoin d'un envoi

Chaque étape ci-dessus est du calcul sur une image que votre propre machine a déjà décodée : quatre coins, une transformation, une division, un seuil et un conteneur écrit octet par octet. Rien là-dedans qu'un serveur puisse faire et qu'un navigateur ne puisse pas, et rien qui exige de télécharger un modèle pour le faire.

Cela mérite qu'on s'y arrête, à cause de ce que sont ces fichiers. On ne photographie pas des pages au hasard. On photographie un passeport, une fiche de paie, un bail, un formulaire médical, un contrat — des documents portant un nom, une adresse et un numéro de compte, numérisés précisément parce qu'une institution les a réclamés. En envoyer un à un site web pour qu'on lui redresse les coins revient à remettre le document entier à un inconnu. Voir [comment savoir si un outil a vraiment besoin de vos fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) pour les quatre vérifications qui séparent les outils qui doivent voir votre fichier de ceux qui se contentent de le voir.
