# Comment ouvrir un fichier DICOM, et ce qu'il y a dedans

Un disque hospitalier, c'est un dossier de fichiers sans extension et une visionneuse écrite pour Windows XP. Les fichiers sont du DICOM, et ils n'ont rien d'exotique : un examen est un en-tête plein de champs et un bloc de pixels. Voici comment en regarder un, ce que signifient les commandes, et ce que le fichier transporte d'autre en plus de l'image.

[Ouvrir Visionneuse DICOM](https://abox.tools/fr/visionneuse-dicom/): Scanner, IRM, radio et échographie, avec le fenêtrage, l'en-tête et les mesures.

Dernière mise à jour 26 août 2026

## La réponse courte

Ouvrez la [visionneuse DICOM](https://abox.tools/fr/visionneuse-dicom/) et faites-y glisser le dossier entier. Les fichiers sont lus sur votre propre machine, remis dans les séries dont ils viennent et empilés dans l'ordre où la machine les a pris. Rien n'est envoyé, et rien n'est réécrit dans vos fichiers.

Si l'on vous a remis un disque et que vous vous demandez lequel des fichiers ouvrir : tous, d'un coup. Un scanner ou une IRM, ce n'est pas un fichier. C'est un fichier par coupe, et un examen thoracique en compte trois cents.

## Ce que contient un disque hospitalier

En général quatre choses, dont une seule compte.

- **Un dossier d'examens**, souvent nommé `DICOM`, `IMAGES` ou `ST0001`, contenant des fichiers appelés `IM000001`, `I0000001` ou un long nombre à points. Fréquemment sans aucune extension. C'est l'examen.
- **Un fichier nommé `DICOMDIR`**. Un index du reste, écrit pour qu'une visionneuse puisse lister les examens du disque sans ouvrir chaque fichier. Vous n'en avez pas besoin.
- **Une visionneuse**, sous forme d'exécutable Windows, d'entrée d'autorun ou parfois d'applet Java. Elle a été compilée pour ce qui était courant à la gravure du disque, et c'est pourquoi tant d'entre elles ne se lancent plus.
- **Une page HTML ou un PDF** au logo de l'hôpital, expliquant comment démarrer la visionneuse.

Les examens n'ont pas besoin de la visionneuse. Le format est une norme publiée et les fichiers se lisent seuls ; l'exécutable du disque est un logiciel capable de les lire, pas le seul.

## Pourquoi les fichiers n'ont pas d'extension

Parce que DICOM n'en a pas besoin. Chaque fichier porte sa propre marque : 128 octets de rien, puis les quatre lettres `DICM`, puis un petit bloc de champs décrivant comment le reste du fichier est écrit. Un lecteur cherche ces quatre lettres, et non un nom se terminant par `.dcm`.

C'est aussi pourquoi renommer un fichier en `.dcm` ne change rien, et pourquoi une visionneuse qui exige l'extension se montre inutilement stricte. Les fichiers écrits directement depuis un réseau hospitalier n'ont même pas les 128 octets ni la marque : ce sont les données nues sans rien devant, et un lecteur doit déduire de leur premier champ comment elles sont encodées. C'est un fichier normal, pas un fichier cassé.

## Le fenêtrage, la commande qui compte

C'est la seule chose qui distingue une image médicale d'une photographie, et la raison pour laquelle un logiciel de retouche ne vaut rien pour en regarder une.

Une coupe de scanner contient environ quatre mille valeurs distinctes. Votre écran affiche deux cent cinquante-six gris. Quelque chose doit décider quelles quatre mille valeurs se projettent sur quels deux cent cinquante-six gris, et cette décision est la **fenêtre** : tout ce qui est en dessous est noir, tout ce qui est au-dessus est blanc, et l'intervalle du milieu se répartit sur les gris.

Déplacez la fenêtre et le même fichier ressemble à un autre examen. Ce n'est pas un artefact d'affichage, c'est tout l'intérêt. Le poumon et l'os sont tous deux dans la coupe et ne peuvent pas être vus en même temps : une fenêtre qui montre la texture d'un poumon ventilé met chaque os en blanc pur, et une qui montre le détail trabéculaire d'une côte met le poumon entier en noir pur.

Sur un scanner, les nombres sont des **unités Hounsfield**, et elles sont définies de façon absolue et non machine par machine : l'eau vaut 0 et l'air −1000, par définition, sur tous les scanners du monde. C'est pourquoi une visionneuse peut proposer des fenêtres nommées — poumon, os, cerveau, parties molles — et qu'elles signifient la même chose sur votre fichier que sur la console où l'examen a été interprété. Les usuelles :

- **Parties molles** — centre 40, largeur 400.
- **Poumon** — centre −600, largeur 1500.
- **Os** — centre 300, largeur 1500.
- **Cerveau** — centre 40, largeur 80. Une fenêtre étroite, parce que substance grise et substance blanche ne diffèrent que de quelques unités.

Sur une IRM, une telle échelle n'existe pas. Les valeurs dépendent de la séquence, de l'antenne et de la machine : il n'y a donc rien pour nommer un préréglage, et la fenêtre de départ est celle que demande le fichier lui-même. Chaque examen en porte une suggestion.

![La visionneuse : une coupe en niveaux de gris avec les commandes de fenêtre et de niveau à côté, des préréglages pour les plages de tissus courantes, et les informations de l'examen dans les coins.](https://abox.tools/screens/open-a-dicom-file/viewer.webp)

La fenêtre et le niveau sont les deux commandes qui comptent. Un examen contient plus de nuances qu'un écran ne peut en montrer, et ce sont elles qui décident lesquelles vous regardez.

## Pourquoi les coupes défilent parfois à l'envers

Une visionneuse doit décider dans quel ordre ranger les fichiers, et il y a deux choses dans le fichier qu'elle pourrait employer.

**Instance Number** est un compteur. C'est le choix évident, et il est attribué par ce qui a écrit les fichiers, qui n'a pas à les numéroter dans le sens où le patient est allongé. Un examen reconstruit des pieds vers le haut et numéroté de la tête vers le bas défile à l'envers, et une série assemblée à partir de deux reconstructions peut répéter les numéros purement et simplement.

**Image Position (Patient)** est l'endroit où se trouve physiquement la coupe, en millimètres, dans un repère fixé au patient et non à la machine. Trier là-dessus est juste quoi qu'ait fait la numérotation, et cela a un effet secondaire utile : une fois les coupes en ordre physique, l'écart entre elles est mesurable, si bien qu'une visionneuse peut vous dire que les coupes sont espacées de 5 mm — et remarquer qu'il en manque une, ce que le fichier ne dit jamais.

## Mesurer quelque chose

Un examen, ce sont des données mesurées : une longueur dessus est donc une longueur réelle, si le fichier indique l'écartement de ses pixels. C'est un champ, Pixel Spacing, en millimètres, et il est présent sur pratiquement tous les scanners et toutes les IRM.

Il manque souvent sur les images d'échographie, les documents numérisés et les captures d'écran enregistrées en DICOM. Là où il manque, il n'y a pas de réponse honnête en millimètres, et une visionneuse qui en donne une quand même a inventé une échelle. Un décompte de pixels est la bonne réponse à une question à laquelle le fichier ne peut pas répondre.

Attention aussi aux pixels non carrés, ce qui est normal en dehors du scanner. Mesurer en pixels et multiplier par un seul chiffre d'écartement n'est juste que là où les deux coïncident ; chaque axe doit être mesuré avec le sien.

## Ce qu'un examen transporte en plus de l'image

C'est la partie sur laquelle on se trompe, et la raison d'être prudent avec ces fichiers.

Un fichier DICOM n'est pas une image avec quelques métadonnées accrochées. C'est un dossier médical avec une image dedans. L'en-tête est une liste de champs, et sur un examen clinique ordinaire il contient :

- le nom du patient, son numéro de dossier, sa date de naissance et son sexe ;
- le numéro de demande, qui est la clé vers la prescription dans le système de l'hôpital ;
- le médecin prescripteur, le manipulateur qui l'a réalisé, le radiologue qui l'a interprété ;
- l'établissement, son adresse et le service ;
- le constructeur, le modèle et le numéro de série de la machine ;
- la date et l'heure de l'examen à la seconde ;
- et une série d'identifiants uniques — examen, série, instance — qui sont des clés parfaites vers l'archive dont il provient.

Tout fichier qu'on vous a remis porte tout cela, et cela voyage avec le fichier partout où il va. Supprimer le nom ne suffit pas : une date de naissance, un établissement de la taille d'un code postal et une heure d'examen identifient une personne à peu près aussi bien qu'un nom, et l'UID de l'examen l'identifie exactement pour quiconque a accès à l'archive.

Certaines machines gardent en outre une seconde copie du nom du patient dans un champ privé, c'est-à-dire un champ dont la signification n'est publiée nulle part et que la plupart des outils d'anonymisation laissent tranquille, faute de pouvoir savoir ce qu'il contient.

![Une carte listant ce qui, dans le fichier, identifie le patient : le nom, l'identifiant, la date de naissance et la description de l'examen.](https://abox.tools/screens/open-a-dicom-file/identity.webp)

Ce qu'un examen transporte en plus de l'image. C'est la carte qui explique pourquoi il ne faut pas en envoyer un par courriel.

## N'envoyez pas l'examen pour le regarder

La façon habituelle de régler ce problème, c'est une recherche « dicom viewer online » et un champ d'envoi. Ce qui vient de se passer, c'est qu'un inconnu détient une copie d'un dossier médical : les pixels, le nom, la date de naissance, le numéro de dossier et la clé vers l'archive.

Il n'y a aucune raison à cela. Lire un fichier DICOM, c'est analyser un en-tête et déballer quelques entiers, et un navigateur le fait parfaitement. C'est pourquoi la [visionneuse d'ici](https://abox.tools/fr/visionneuse-dicom/) n'a aucune fonction réseau : pas de `fetch`, pas de `XMLHttpRequest`, rien qui puisse envoyer un fichier même si quelque chose l'essayait. Chargez la page une fois, débranchez-vous d'internet : elle continue d'ouvrir des examens.

[Est-il sûr d'envoyer ses fichiers à des convertisseurs en ligne ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) explique comment vérifier cette affirmation sur ce site comme sur n'importe quel autre. C'est le type de fichier pour lequel la vérification en vaut le plus la peine.

## Ce qu'un navigateur ne peut pas faire

Deux choses, et il vaut mieux les dire franchement.

**Ce n'est pas une visionneuse de diagnostic.** Votre écran n'est pas calibré, le navigateur n'est pas une chaîne de rendu validée, et aucune page web n'a fait l'objet d'une évaluation réglementaire. Lire un examen pour prendre une décision clinique est l'affaire de la console sur laquelle il a été interprété. Vérifier ce qu'il y a sur un disque, extraire une coupe pour un cours, lire un en-tête ou comprendre pourquoi un autre logiciel refuse le fichier sont autant de raisons parfaitement valables d'en ouvrir un dans un navigateur.

**Certains examens compressés ne se décoderont pas.** DICOM autorise plusieurs schémas de compression et les navigateurs en implémentent un. Les fichiers simples, ceux codés en longueurs de plage, le JPEG baseline et le JPEG Lossless — celui qu'emploient la plupart des exports hospitaliers — s'ouvrent tous. JPEG 2000, JPEG-LS et les formats vidéo exigent des codecs qui pèsent plusieurs mégaoctets de bibliothèque compilée. Là où l'image ne peut pas être décodée, l'en-tête reste entièrement lisible, ce qui est de toute façon la moitié pour laquelle vous étiez venu.
