# Photo d'identité — passeport et visa aux normes

Choisissez le pays. L'outil applique sa règle, exactement.

> Faites une photo de passeport ou de visa selon la règle publiée de votre pays : millimètres et DPI exacts, repères en direct pour la hauteur de tête et la ligne des yeux, contrôle du fond, une planche 10x15 prête à imprimer et un fichier calibré sur la limite en Ko du portail. Rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/photo-d-identite/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos photos. Il n'y a pas de serveur.

Le recadrage, les mesures, la lecture du fond et l'impression se font tous dans votre propre navigateur, sur votre propre matériel, avec l'encodeur JPEG qu'il embarque déjà. Cet outil ne comporte aucune fonction réseau : rien à aller chercher, rien à envoyer. Et même s'il en avait une, il n'y a, à l'autre bout de cette page, aucun serveur à qui envoyer une photographie de votre visage.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment faire une photo d'identité qui ne revienne pas

1. **Choisissez la photographie.** Une photo de téléphone devant un mur uni, à la lumière du jour, prise à un mètre cinquante environ. Le navigateur la lit directement sur votre disque, et rien ne part nulle part pendant ce temps.
2. **Choisissez le pays et le document.** Le panneau affiche alors la taille d'impression, la fourchette de hauteur de tête, la ligne des yeux, la couleur de fond et les limites d'envoi de cette règle, avec pour chaque chiffre l'autorité dont il vient et la date à laquelle il a été relevé. Rien dans cette liste n'est deviné, et tout ce qu'on vous a envoyé et qui n'y figure pas se saisit sous « Ailleurs dans le monde ».
3. **Vérifiez les quatre points sur votre visage.** Sommet du crâne, menton et chaque pupille : ces quatre points constituent la totalité de ce que la règle mesure. Ils sont posés en mesurant la photo elle-même, et la ligne au-dessous dit lesquels ont été mesurés et lesquels ont dû être déduits. Déplacez ceux qui sont tombés à côté, ou passez à *Je les place moi-même* et posez les quatre vous-même. Appuyez ensuite sur *Ajuster le cadre* et le recadrage tombe là où ce pays le veut.
4. **Lisez les quatre contrôles, et le fond.** Hauteur de tête, ligne des yeux, centrage et inclinaison, chacun mesuré sur le cadre tel qu'il est et chacun indiquant dans quel sens tirer s'il est hors norme. Le fond est lu en haut et sur les côtés du recadrage puis comparé à la couleur exigée par la règle ; l'irrégularité, qui est ce qui fait réellement refuser les photos, est mesurée séparément de la couleur.
5. **Prenez les trois fichiers.** L'impression, au millimètre exact, avec la résolution inscrite dans le fichier pour qu'un magasin l'imprime à la bonne taille. La planche, avec autant de copies qu'un ⁦10 × 15⁩ en contient et des repères de coupe dans les intervalles. Et le fichier d'envoi, à la taille en pixels que le portail impose et dans la fourchette en Ko qu'il fait respecter aux deux extrémités.

## La version longue

[Comment faire une photo d'identité qui ne revient pas](https://abox.tools/fr/guides/faire-une-photo-d-identite/): Ce qu'on mesure vraiment sur une photo d'identité — hauteur du visage, ligne des yeux, fond —, quel pays demande quels chiffres, et comment respecter les limites en pixels et en Ko d'un formulaire en ligne.

## Aussi dans la boîte

- [Empileur d'images](https://abox.tools/fr/empiler-des-images/): Vingt prises n'en font plus qu'une, sans vingt envois et sans dérawtiseur.
- [Caviardage d'image](https://abox.tools/fr/caviarder-une-image/): Ce que vous recouvrez est supprimé du fichier, pas dissimulé dedans.
- [Lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/): Voyez ce qu'une photo raconte sur vous. Puis retirez-le.
- [Visionneuse DICOM](https://abox.tools/fr/visionneuse-dicom/): Scanner, IRM, radio et échographie, avec le fenêtrage, l'en-tête et les mesures.

## Questions

### Ma photo est-elle envoyée quelque part ?

Non. L'image est décodée, recadrée, mesurée et écrite par votre propre navigateur sur votre propre matériel, avec l'encodeur JPEG que le navigateur embarque déjà. Cet outil n'a aucune fonction réseau : il ne va jamais rien chercher et n'envoie jamais rien, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter, dont aucune ne nous appartient. Cela vaut ici plus que sur la plupart des outils : le fichier est une photographie de votre visage.

### Quels pays sont couverts ?

Les spécifications transcrites à ce jour sont la norme de l'OACI elle-même, les États-Unis (passeport et inscription à la loterie des visas, qui ont des règles d'envoi différentes), le Royaume-Uni, le visa Schengen, l'Allemagne, le Canada, l'Australie, l'Inde (passeport, tirage ⁦35 × 45⁩ mm, ainsi que la photo de formulaire et la signature SSC/UPSC), la Chine et le Japon. Chaque entrée nomme l'autorité dont elle vient et la date à laquelle elle a été relevée. Tout le reste se saisit sous « Ailleurs dans le monde », où chaque chiffre est à vous ; et comme la plus grande partie du monde délivre selon la géométrie de l'OACI, cette entrée démarre dessus.

### Comment trouve-t-il le sommet du crâne, le menton et les yeux sans modèle de visage ?

En supposant ce qu’un détecteur de visage généraliste n’a pas le droit de supposer et que cet outil, lui, peut supposer : chacune de ces règles exige la même scène — une personne, face à l’objectif, devant un mur uni et régulièrement éclairé. La couleur du mur est donc relevée sur le bord de la photo, tout ce qui n’est pas cette couleur est la personne, et le haut de celle-ci est le sommet du crâne, cheveux compris. Les pupilles sont cherchées comme la meilleure paire de taches plus sombres que leur propre entourage, à la même hauteur et de part et d’autre du milieu de la tête : une comparaison purement locale, donc rien n’y dépend de la couleur d’un visage. Le menton est le seul qui ne se trouve pas ainsi, car une mâchoire devant un cou est un bord doux sans changement de couleur ; il est déduit des pupilles, qui se situent un peu en dessous du milieu d’une tête, une fois comptés les cheveux qui la surmontent, puis confronté au contour. Tout cela est du calcul, dans `src/detect.js` : pas de poids, pas de moteur d’inférence, rien de récupéré, et le même calcul pour chaque visage. C’est ce dernier point qui compte, car un détecteur livré avec l’outil se trompe inégalement — plus sur certains visages que sur d’autres — et les personnes dont les photos sont déjà le plus souvent refusées sont précisément celles qu’il laisserait tomber.

### Quelle confiance accorder aux points qu’il place ?

Assez pour partir de là, pas assez pour ne pas les regarder. Chacun des quatre a une photo sur laquelle il se trompe : un mur à motifs ou une bibliothèque ne laisse aucun contour sur lequel détourer une tête, une tête coupée en haut n’a pas de sommet du crâne dans la photo, et des lunettes, une frange épaisse ou des yeux fermés peuvent poser les pupilles sur le mauvais trait. L’outil dit donc explicitement lesquels des quatre il a mesurés et lesquels il a dû déduire, refuse net une photo sans fond uni plutôt que d’inventer une réponse, et laisse chaque point déplaçable. Le recadrage est pris là où les points finissent, jamais là où ils ont commencé. Si vous préférez poser les quatre vous-même, l’interrupteur au-dessus de la photo indique *Je les place moi-même*, et déplacer un point à la main y bascule tout seul : à partir de là ils sont les vôtres et rien ne les déplacera.

### C'est quoi la règle de hauteur de tête, et pourquoi la mienne échoue toujours ?

Chacune de ces spécifications indique quelle part du cadre la tête doit remplir, mesurée du bas du menton au sommet du crâne, cheveux compris : en général 70 à 80 pour cent, soit 31,5 à 36 mm pour une photo de 45 mm. La raison habituelle de l'échec est le selfie : un bras fait environ 60 cm, ce qui déforme le visage et met la tête trop grande dans le cadre. La deuxième raison habituelle est le sommet du crâne : c'est le haut des cheveux, pas la naissance des cheveux, et marquer la naissance fait sortir toutes les têtes trop petites.

### Pourquoi le fichier doit-il faire au moins 20 Ko, et comment le remplir ?

Les portails d'examen indiens, le formulaire de visa chinois et l'envoi du passeport britannique indiquent une taille minimale en plus d'une taille maximale, parce qu'un fichier en dessous est le plus souvent une vignette envoyée par erreur. Une photographie de ⁦200 × 230⁩ fait 46 000 pixels et, à la meilleure qualité qu'un navigateur écrira, peut encore tomber à 15 Ko, sans aucun moyen de l'agrandir en compressant moins. L'outil ajoute donc un segment de commentaire JPEG rempli d'espaces. Cela fait partie de la norme JPEG, tous les décodeurs le sautent, et l'image est bit pour bit la même image : seul le fichier est plus long. Le remplissage dit exactement cela, en anglais, à l'intérieur du fichier.

### Vérifie-t-il le fond, et peut-il en remplacer un ?

Il vérifie et ne remplace pas. La couleur est lue sur une bande en haut du recadrage et le long de chaque côté, au-dessus des épaules, puis comparée à la couleur de la règle en CIE Lab plutôt qu'en RVB : deux gris distants de quarante unités RVB sont indiscernables, alors que quarante unités de bleu font une autre couleur. L'irrégularité est mesurée à part, parce qu'une ombre sur un mur blanc est ce qui fait réellement refuser les photographies, et que ce n'est pas un problème de couleur. Remplacer un fond suppose de découper une personne dans une image, donc un modèle de segmentation ; un mauvais mange les cheveux. Se reculer de trente centimètres du mur règle davantage de ces cas que n'importe quel filtre.

### À quoi sert la planche ⁦10 x 15⁩ ?

Une cabine facture plusieurs euros six photographies. Un comptoir photo imprime un ⁦10 × 15⁩ pour quelques centimes, et tous savent le faire. L'outil dispose donc sur la feuille autant de copies de votre photo qu'elle en contient — huit, pour un ⁦35 × 45⁩ sur un ⁦10 × 15⁩ — avec des repères de coupe dans les intervalles et rien d'imprimé par-dessus une image. Rien n'est mis à l'échelle : chaque copie fait exactement la taille exigée par la règle, car une planche qui les réduirait de deux pour cent pour en caser une de plus donnerait huit photographies toutes à la mauvaise taille. Imprimez-la à 100 pour cent ; c'est « ajuster à la page » qui fait sortir une planche fausse.

### Pourquoi les DPI comptent-ils si les pixels sont les mêmes ?

Parce qu'un JPEG peut dire quelle taille il fait, et s'il ne le dit pas, ce qui l'imprime devine. La résolution vit dans l'en-tête JFIF, et un canevas de navigateur écrit cet en-tête avec le champ d'unités réglé sur « ceci est un rapport d'aspect, pas une résolution ». Cet outil réécrit ces quelques octets pour que le fichier annonce 300 dpi, ce qui transforme ⁦413 × 531⁩ pixels en une photographie de ⁦35 × 45⁩ mm plutôt qu'en une image sans taille particulière. Rien n'est décodé pour cela et aucune qualité n'est dépensée.

### Peut-il faire aussi le fichier de signature ?

Oui : les formulaires SSC et UPSC en veulent une à ⁦140 × 60⁩ pixels et entre 10 et 20 Ko, et elle figure dans la liste comme spécification à part entière. Les repères de visage sont coupés pour elle, puisqu'une signature n'a pas de ligne des yeux ; ce qui est vérifié à la place, c'est que le papier est clair, qu'il y a de l'encre dessus et que le recadrage n'a pas emporté une ligne réglée ou le bord de la page. Atteindre 10 Ko est la partie difficile de cette règle, pas rester sous 20.

### Cela garantit-il que ma demande sera acceptée ?

Non, et aucun outil ne peut honnêtement le garantir. Ce qu'il fait, c'est appliquer exactement les chiffres publiés et vous montrer chaque mesure qu'il a prise, pour que ce qu'un formulaire mesure automatiquement — taille en pixels, poids du fichier, format — soit juste, et que ce qu'un examinateur humain mesure — hauteur de tête, ligne des yeux, fond — soit devant vous, chiffres à l'appui. Les règles changent aussi : chaque spécification indique de quelle autorité elle vient et quand elle a été relevée, pour que vous puissiez la comparer au formulaire que vous avez sous les yeux plutôt que de faire confiance à un tableau.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane imprimé en travers de votre visage. Le nombre de photographies n'est pas limité non plus, puisqu'aucun serveur ne les paie. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre photographie.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler : le recueil de règles est un fichier servi avec la page, pas une consultation. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait votre photographie ailleurs pour la recadrer s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Une photographie de votre visage ne quitte jamais cette machine.** Cela pèse plus lourd ici que sur la plupart des outils : le fichier que cette page manipule est une image de votre visage, et ce que vous vous apprêtez à en faire nomme aussi le pays dont vous demandez le document. La `Content-Security-Policy` nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Il n'existe ici aucun point de collecte où votre photographie pourrait atterrir.
- **Rien ici ne va chercher quoi que ce soit.** Il n'y a nulle part dans `src/` ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon`. Le recueil de règles est une table dans `src/specs.js`, servie avec la page et mise en cache avec elle : il n'y a aucune liste de pays à consulter et rien à quoi comparer votre photo à distance.
- **Le visage est trouvé sans modèle de visage.** Aucun poids à télécharger, aucun moteur d’inférence pour les exécuter et rien qui soit récupéré : le sommet du crâne vient du contour de votre tête sur le mur derrière vous, les pupilles des zones du visage plus sombres que ce qui les entoure. Rien là-dedans ne lit la couleur de peau, et c’est précisément pour cela que c’est écrit ainsi — un modèle qui se trompe se trompe inégalement, plus sur certains visages que sur d’autres. C’est une position de départ plutôt qu’un verdict : la page dit lequel des quatre points elle n’a pas pu mesurer, chaque point reste déplaçable, et *Je les place moi-même* désactive tout cela.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit sur votre photographie, votre visage ou le pays dont vous avez choisi la règle. Chaque ligne qui lit, recadre, mesure ou écrit un fichier est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/specs.js` pour le recueil de règles — les chiffres publiés de chaque pays, avec l'autorité et la date de relevé de chacun — `src/detect.js` pour la façon dont les quatre points sont trouvés — un contour et deux taches sombres, sans le moindre modèle —, `src/geometry.js` pour le calcul qui transforme quatre points posés en un recadrage, et `src/jpeg.js` pour les deux retouches d'en-tête qui inscrivent la résolution d'impression dans le fichier et amènent un envoi trop léger à la taille qu'un formulaire exige.
