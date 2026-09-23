# Comment créer un favicon qui se lise encore à seize pixels

Un favicon n'est pas une petite image de votre logo. C'est un jeu d'images à des tailles fixes, dans un conteneur que presque personne n'ouvre, et la plus petite d'entre elles est celle que tout le monde voit réellement. Voici les tailles qu'il vous faut, les fichiers qui les accompagnent, et quoi faire quand votre logo ne survit pas au voyage.

[Ouvrir Image en ICO](https://abox.tools/fr/creer-un-favicon/): Une image en entrée. Toutes les tailles qu'un navigateur, Windows ou un Mac réclame, en sortie.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez [Image en ICO](https://abox.tools/fr/creer-un-favicon/), déposez-y une image carrée d'au moins 256 pixels, laissez le préréglage sur *Favicon de site*, et téléchargez `favicon.ico`. Posez-le à la racine de votre site, pour qu'il réponde à `https://votresite.com/favicon.ico`. Cette adresse est demandée par tous les navigateurs, que votre HTML la mentionne ou non : il n'y a donc rien d'autre que vous soyez strictement obligé de faire.

Tout ce qui suit est ce qui fait la différence entre une icône techniquement présente et une icône lisible : quelles tailles entrent dedans, ce que réclament plutôt les iPhone et Android, et quoi faire quand votre logo ne survit pas à ses seize pixels de large.

## Pourquoi c'est un jeu de tailles et non une image

Un fichier `.ico` est un conteneur. Dedans se trouvent plusieurs images complètes de la même chose à des tailles différentes, et ce qui lit le fichier prend celle qui est la plus proche de la taille dont il a besoin.

Cela a l'air redondant et ne l'est pas. Un navigateur qui dessine votre icône à seize pixels a deux possibilités : lire une version de seize pixels que vous avez dessinée, ou en réduire une plus grande sur-le-champ. La seconde est pire, et visiblement, car la réduction automatique d'un logo détaillé produit une bouillie, alors qu'une version de seize pixels que vous avez regardée est une chose que vous avez eu l'occasion de simplifier. Toute la raison pour laquelle le format contient plusieurs tailles est de vous donner cette occasion.

Trois tailles sont la convention pour un site web, et chacune a sa raison :

- **⁦16 × 16⁩**, l'onglet du navigateur, la barre d'adresse, le menu des signets. C'est celle que les gens voient. Si vous n'en réussissez qu'une, réussissez celle-là.
- **⁦32 × 32⁩**, une barre de signets, un raccourci Windows vers votre site sur le bureau, et la plupart des navigateurs sur un écran haute densité, qui tirent l'icône de l'onglet du 32 et la réduisent.
- **⁦48 × 48⁩**, la taille à laquelle Google lit l'icône d'un site pour les résultats de recherche, et la vue à icônes moyennes de Windows.

Tout ce qui est plus grand a sa place dans un PNG à côté du `.ico`, pas dedans, pour des raisons qui reviennent plus bas au sujet des fichiers mobiles.

![La liste des préréglages, avec les tailles que chacun contient : seize, trente-deux et quarante-huit pixels pour une icône de site, et un récapitulatif de ce qui ira dans le fichier.](https://abox.tools/screens/make-a-favicon/preset.webp)

Un .ico est un conteneur, et voici la liste de ce qui y entre. Le préréglage est un raccourci vers l'ensemble qu'un navigateur demande réellement.

## Le problème des seize pixels

C'est la partie dont personne ne vous prévient. Seize pixels, c'est environ quatre millimètres sur un écran normal : une grille de 256 points en tout, moins que les lettres de cette phrase. Presque rien de ce qui a été conçu pour fonctionner sur une enseigne, une carte de visite ou un en-tête de site ne survit à une telle réduction.

Ce qui disparaît, dans l'ordre :

- **Le texte.** Un mot réduit dans un carré fait environ trois pixels de haut. Il ne devient pas du petit texte, il devient une barre grise. C'est pourquoi presque toutes les entreprises qui ont un symbole en plus d'un nom se servent du symbole seul comme favicon, et pourquoi celles qui n'ont pas de symbole utilisent une seule lettre.
- **Les traits fins.** Un contour d'un pixel sur un logo de 512 pixels fait un trente-deuxième de pixel à seize. Il se rend en une vague brume grise le long du bord, ou disparaît.
- **Les dégradés et les ombres.** Il n'y a pas la place pour une transition. Une ombre portée douce devient une frange sale.
- **Le détail dans le détail.** L'icône d'un document couvert d'écriture devient un rectangle avec une tache.

Le remède n'est pas un réglage, c'est un autre dessin : une marque simplifiée à une ou deux formes, à fort contraste, et sans texte au-delà d'un seul caractère. Dessinez cette version à 32 ou 48 pixels délibérément, et servez-vous-en comme source.

Ce qu'un outil peut faire, c'est vous montrer le problème avant que vous ne le publiiez. L'aperçu d'[Image en ICO](https://abox.tools/fr/creer-un-favicon/) dessine chaque taille à sa taille réelle à l'écran, seule façon d'en juger : une icône de seize pixels affichée à soixante-quatre a l'air très bien et ne vous apprend rien.

![Une bande d'aperçu montrant la même marque dessinée à seize, trente-deux, quarante-huit, soixante-quatre et cent vingt-huit pixels.](https://abox.tools/screens/make-a-favicon/sizes.webp)

La version de seize pixels, à côté de celle que vous avez dessinée. C'est cette image qui décide si la marque avait besoin d'être simplifiée.

## Votre logo n'est pas carré. Compléter ou recadrer ?

Une icône est toujours carrée, et la plupart des logos ne le sont pas : quelque chose doit donc arriver. Il y a trois réponses et elles ne se valent pas.

**Compléter** garde l'image entière et met de l'espace au-dessus et au-dessous. C'est le choix sûr par défaut et le mauvais choix pour un mot large : faire tenir dans un carré quelque chose de trois fois plus large que haut le laisse occuper un tiers de la hauteur, ce qui fait à seize pixels cinq pixels de logo et onze de rien.

**Recadrer au milieu** prend le plus grand carré du centre. Pour un ensemble fait d'un symbole et du nom de l'entreprise à côté, cela coupe souvent les deux en plein milieu. Mieux vaut recadrer la source vous-même d'abord, jusqu'au symbole seul, puis convertir cela.

**Étirer** écrase l'image pour la faire entrer. Il n'existe pratiquement aucune situation où c'est le bon choix, et il est proposé surtout pour que l'outil ne le fasse pas en silence.

La réponse générale pour un logo large : ne convertissez pas le logo. Convertissez la partie du logo qui tient debout toute seule.

## Transparent ou fond uni ?

Transparent est en général le bon choix pour un site web. Les onglets de navigateur sont gris, blancs ou presque noirs selon le navigateur et le thème, et une icône transparente se pose sur tous. Une icône avec un fond blanc peint dedans est un rectangle blanc dans une barre d'onglets sombre.

Deux exceptions valent d'être connues :

- **Un logo qui n'est que sombre** disparaît en mode sombre. Si votre marque est noire sur blanc par nature, donnez-lui un fond coloré plutôt que transparent, ou un contour clair.
- **L'icône Apple touch doit être opaque.** iOS la dessine sur sa propre tuile arrondie et rend la transparence en noir. Tout outil qui produit ce fichier devrait l'aplatir pour vous ; celui d'ici le fait, sur du blanc par défaut.

## Les fichiers dont un site a besoin en plus du .ico

`favicon.ico` couvre les navigateurs et Windows. Il ne couvre pas les téléphones, et c'est là que la plupart des jeux d'icônes faits maison s'arrêtent trop tôt. Trois autres plateformes réclament leurs propres fichiers, sous leurs propres noms, et aucune n'ira regarder dans un `.ico` :

- **iOS** lit `apple-touch-icon.png` en ⁦180 × 180⁩ quand quelqu'un ajoute votre site à son écran d'accueil. Sans lui, iOS utilise une capture de la page, ce qui a l'air d'une erreur.
- **Android et toutes les invites d'installation** lisent un manifeste d'application web, `site.webmanifest`, qui pointe vers des PNG de 192 et 512 pixels. Le 512 est aussi ce qu'une application web montre sur son écran de démarrage.
- **Une tuile du menu Démarrer de Windows** lit `browserconfig.xml`, qui pointe vers un PNG de ⁦150 × 150⁩. Le moins important des trois, et quatre lignes de XML.

Il y en a une dernière facile à rater : les lanceurs Android rognent une icône adaptative à la forme que le téléphone préfère, cercle, carré arrondi ou « squircle », et seuls les 80 % centraux de l'image sont garantis de survivre. Une icône dessinée bord à bord perd ses coins. C'est cela, une icône *masquable* : la même image dessinée délibérément petite à l'intérieur du carré, déclarée séparément dans le manifeste.

Cocher le jeu pour site web dans [Image en ICO](https://abox.tools/fr/creer-un-favicon/) produit tous ces fichiers, le manifeste, et le bloc de HTML qui pointe vers eux. Une chose que ce bloc omet délibérément, c'est un `<link>` vers `favicon.ico` : les navigateurs demandent cette adresse d'eux-mêmes, et la nommer en plus fait récupérer le même fichier deux fois.

## Une icône d'application Windows est un autre jeu

Si l'icône est pour un programme et non pour un site, les tailles changent. Ce que contient l'`app.ico` livrée par défaut avec Visual Studio, ce sont 16, 32, 48 et 256, c'est-à-dire les trois tailles du shell plus la grande dont se servent le menu Démarrer et la vue très grande de l'Explorateur.

Sur un écran haute densité, Windows réclame aussi 20, 24, 40, 64 et 96, et les rééchantillonne depuis la taille la plus proche dont il dispose quand elles manquent. Que cela compte ou non dépend de votre icône : une forme plate survit au rééchantillonnage, une forme détaillée non. Les ajouter double à peu près le fichier, ce qui pour une application ne représente rien du tout ; le calcul est complètement différent de celui d'un favicon, que chaque visiteur récupère.

Encore une chose au sujet de la taille : c'est l'entrée 256 qui pèse. Stockée sans compression, elle fait 264 KB à elle seule ; stockée en PNG dans l'icône, elle est en général sous les 30. Les entrées PNG sont lisibles depuis Windows Vista : la seule raison de les éviter est donc un logiciel réellement plus ancien que cela, ou un installeur ou un outil embarqué qui analyse les icônes lui-même.

## Un Mac lit un tout autre fichier

Si l'icône est pour une application Mac et non Windows, rien de ce qui précède ne s'applique : macOS ne lit pas du tout le `.ico`. Il lit le `.icns`, qui est la même idée dans un autre emballage, plusieurs tailles dans un conteneur, avec trois différences à connaître.

- **Les tailles sont imposées.** Apple publie dix emplacements et il n'y a rien à choisir : 16, 32, 64, 128, 256, 512 et 1024 pixels, les 32, 256 et 512 apparaissant deux fois parce que chacune est à la fois une taille à part entière et la version Retina de la taille inférieure.
- **Cela monte jusqu'à 1024.** Un `.ico` s'arrête à 256, et c'est pourquoi un fichier d'icône Mac fait plusieurs centaines de kilooctets quand un favicon en fait quinze. Pour une application livrée une fois, ce n'est rien ; il n'y a qu'un favicon à être récupéré par chaque visiteur.
- **1024 pixels, c'est ce à quoi votre dessin doit survivre.** Les deux problèmes sont les deux extrémités de la même image : un favicon doit fonctionner tout petit, et une icône Mac doit tenir debout en très grand. Un logo exporté en 512 et gonflé à 1024 a l'air mou sur un écran Retina, et l'App Store ne le prendra pas.

Pour s'en servir : un bundle d'application le garde dans `VotreApp.app/Contents/Resources/` et le nomme dans `Info.plist`. Pour un dossier ou une image disque, sélectionnez le `.icns` dans le Finder, faites Commande-C, puis Lire les informations sur la chose à changer, cliquez la petite icône en haut à gauche et faites Commande-V.

Cocher *icône macOS* dans [Image en ICO](https://abox.tools/fr/creer-un-favicon/) en écrit un, avec ou sans le fichier Windows à côté. Tout ce qui sort sur les deux plateformes veut les deux, et les deux sont tirés de la même image en une seule passe.

## Vérifier que cela a marché

Les navigateurs mettent les favicons en cache plus durement que presque tout le reste : « je l'ai mis en ligne et rien n'a changé » est donc en général un cache plutôt qu'une erreur. Deux choses à essayer avant de vous remettre à modifier des fichiers :

- Ouvrez directement `https://votresite.com/favicon.ico`. Si le fichier se télécharge, il est là et vous regardez un cache. Si vous obtenez une 404, il n'est pas à la racine.
- Chargez le site dans une fenêtre privée, qui a en général son propre cache d'icônes.

Sous Windows, un `.ico` se vérifie en le mettant dans un dossier et en faisant défiler les tailles d'affichage de l'Explorateur : petites, moyennes, grandes et très grandes icônes tirent des entrées différentes du même fichier, et vous voyez donc chacune telle que le système la verra.

Sur un Mac, un `.icns` s'ouvre dans Aperçu, qui liste chaque emplacement sur le côté, et la même astuce marche dans le Finder : déposez-le dans un dossier et faites glisser le curseur de taille des options d'affichage pour le voir basculer d'une image à l'autre.

## Rien de tout cela ne demande un envoi

Mettre une image à l'échelle est une chose que tous les navigateurs font depuis des années, et un `.ico`, c'est un en-tête de six octets, seize octets par image, puis les images. Il n'y a dans sa fabrication aucune étape qui exige un serveur, et l'outil d'ici n'en utilise pas : la `Content-Security-Policy` de la page énumère toutes les adresses qu'elle peut contacter, et aucune n'appartient à ce site.

Cela mérite plus d'attention ici qu'ailleurs. Un logo confié à un générateur de favicons gratuit est, assez souvent, une marque non encore dévoilée : l'icône est l'une des premières choses fabriquées et l'une des dernières annoncées. Chargez la page, coupez votre connexion, et fabriquez-en une quand même, si vous préférez vérifier plutôt qu'on vous le dise. [Est-il sûr d'envoyer ses fichiers à un convertisseur en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) expose trois autres vérifications applicables à n'importe quel outil.
