# Aperçu de fiche d’établissement — voir votre fiche Google avant publication

Saisissez vos informations, elles deviennent la carte que Google afficherait. Aucun envoi pour la dessiner.

> Prévisualisez panneau d’informations, carte téléphone et résultat de recherche depuis nom, catégorie, horaires, note et photo. Collez une fiche existante pour l’importer. Téléchargez en PNG ou SVG. Tout reste dans votre navigateur.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/apercu-fiche-etablissement/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos profils et leurs images. Il n'y a pas de serveur.

Chaque champ devient une image grâce à environ mille lignes de JavaScript lisibles sur cette page, sans contacter qui que ce soit : ni recherche de votre entreprise, vérification d’adresse ni dessin d’étoile. Aucune fonction réseau, d’autant plus utile quand une fiche contient une adresse de domicile et un téléphone personnel.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment prévisualiser une fiche Google avant publication

1. **Commencez par votre fiche existante si vous en avez une.** Ouvrez la fiche Google, copiez toute la carte avec nom, étoiles et lignes, puis collez-la dans le panneau du haut. Nom, catégorie, note, avis, adresse, téléphone, site et semaine d’horaires sont reconnus. Chaque champ rempli est signalé pour vérifier les erreurs. Un export JSON de l’API Business Profile peut aussi être ouvert.
2. **Vérifiez d’abord le nom et la catégorie.** Le nom est tronqué sur les trois surfaces, surtout dans les résultats. Ajouter ville et métier à la fin peut ne laisser que des points de suspension. La catégorie est parfois la seule ligne visible du résultat local et celle que la recherche utilise.
3. **Remplissez la semaine et regardez le statut.** *Ouvert · Ferme à 21 h* devient *Fermé · Ouvre mardi à 9 h* automatiquement. La page calcule depuis vos horaires et votre horloge. Un horaire 22:00 à 02:00 passe minuit, comme pour un bar. Fermer un jour montre aussitôt ce que verrait un visiteur ce soir-là. Activez *Prévisualiser une date et une heure choisies* pour vérifier un soir précis ou le lendemain matin dans le fuseau horaire de cet appareil. Désactivez l’option pour suivre à nouveau l’horloge. Ce choix n’est pas enregistré dans le JSON du profil.
4. **Vérifiez les boutons disponibles.** Sans adresse, pas d’*Itinéraire*. Sans site, pas de *Site web*. Sans téléphone, pas d’*Appeler*. Ces champs produisent les boutons sous le nom. Sans eux, un visiteur doit chercher ailleurs pour agir. C’est rapide à vérifier et souvent incomplet sur une fiche réelle.
5. **Examinez les trois surfaces.** Le panneau est généreux et vu par ceux qui connaissent déjà votre nom. La carte téléphone concerne beaucoup de visiteurs. Le résultat local est étroit et aide à choisir entre vous et deux concurrents. Une description lisible dans le premier peut être invisible dans le troisième.
6. **Emportez l’image.** Le PNG utilise la taille de la surface, son double ou son triple, agrandissements qui gardent les retours à la ligne. Le SVG autonome intègre la photo et imprime nettement sans lien externe. Le troisième export est le profil enregistré, à garder pour revenir.

## La version longue

[Comment prévisualiser une fiche Google Business Profile avant sa publication](https://abox.tools/fr/guides/apercu-fiche-google-business/): Votre fiche Google dans une recherche sur ordinateur, sur téléphone et dans les résultats locaux : la longueur de nom visible, pourquoi la catégorie compte davantage que la description, les champs qui deviennent des boutons et ce qu’indique la ligne Ouvert ou Fermé quand personne ne regarde.

## Aussi dans la boîte

- [Compresseur d'images](https://abox.tools/fr/compresser-une-image/): Vous donnez la taille. Il se charge du reste.
- [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/): Vous dites la taille. Vous tracez le cadre. Vous choisissez le format.
- [HEIC vers JPG](https://abox.tools/fr/convertir-heic-en-jpg/): Les photos que fait un iPhone, dans un format que tout ouvre.
- [WebP en JPG](https://abox.tools/fr/convertir-webp-en-jpg/): Les images que le Web enregistre, dans le format que tout accepte encore.

## Questions

### Cet outil est-il créé par Google ?

Non. Aucun lien, affiliation ni approbation de Google. Google Business Profile est sa marque, citée pour décrire l’aperçu. C’est un dessin produit localement depuis votre saisie, pas une capture ni une vue de votre compte. Rien ici ne modifie votre vraie fiche : faites-le chez Google.

### Peut-il importer automatiquement ma fiche ?

Non. Récupérer votre fiche nécessiterait de contacter un serveur et permettrait aussi d’y envoyer vos champs, capacité absente de cet outil. Vous copiez et collez la fiche : l’outil lit le texte et indique les champs remplis. Un export JSON de l’API peut être ouvert directement.

### Ce que je tape est-il envoyé quelque part ?

Non. Aucun `fetch`, `XMLHttpRequest` ni `sendBeacon` dans le code. La `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. Une fiche peut contenir votre domicile et votre téléphone personnel : ces données restent sur l’appareil.

### Quelle précision offre la maquette ?

Précise sur le texte qui tient, approximative sur l’apparence. Google Sans n’est pas installée sur votre appareil et Search comme Maps changent leur espacement. L’aperçu montre surtout la portion de nom conservée, la catégorie dans le format étroit et les boutons disponibles.

### Pourquoi ma nouvelle fiche n’affiche-t-elle aucune étoile ?

Google affiche « Aucun avis », car cinq étoiles vides peuvent ressembler à une étoile au premier regard. Laissez note et nombre d’avis vides. Remplissez les deux pour dessiner les étoiles proportionnellement : 4,6 remplit quatre étoiles et trois cinquièmes de la cinquième.

### De quoi dépend la ligne Ouvert ou Fermé ?

La semaine renseignée et, par défaut, l’horloge locale de cet appareil. Le statut se met à jour chaque minute. Vous pouvez aussi choisir une date et une heure locales pour examiner un moment précis de la semaine. La prévisualisation utilise le fuseau horaire de cet appareil, sans conversion vers celui de l’entreprise ni horaires spéciaux pour les jours fériés. Si l’entreprise se trouve ailleurs, saisissez l’heure locale à examiner. Ce choix ne fait pas partie du JSON enregistré du profil.

### Puis-je utiliser l’image dans une proposition ou un rapport ?

Oui, sans filigrane, compte, limite de créations ni lien vers le site. Vos champs sont dessinés sur votre appareil. Précisez au destinataire qu’il s’agit d’une maquette : elle peut facilement être prise pour une capture d’une fiche déjà publiée.

### Quelle différence entre les trois aperçus ?

Leur largeur détermine le texte conservé. Le **panneau d’informations** est la carte à droite d’une recherche de votre nom sur ordinateur. La carte **téléphone** est celle de nombreux visiteurs. Le **résultat de recherche** est une des trois entrées locales sous une carte, le format le plus étroit, où de nouveaux clients choisissent entre vous et vos concurrents.

### La photo ajoutée est-elle envoyée ?

Non. Elle est décodée ici, redessinée à la taille utile et intégrée à l’image sous forme de données. Le fichier reste sur votre appareil et ses métadonnées de lieu et de date disparaissent. Gardez votre original : la maquette utilise une copie.

### Puis-je enregistrer le profil et revenir ?

Oui. *Enregistrer le profil* écrit un JSON sur votre disque avec les champs et la photo. Rouvrez-le ici pour tout retrouver. Aucun stockage entre visites ni compte : adresse, téléphone et horaires ne sont pas conservés par le site.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page puis déconnectez Internet : champs, dessin et PNG fonctionnent. Un outil envoyant vos informations ailleurs pour dessiner la carte s’arrêterait.

## Comment cette promesse se vérifie

- **Ce que vous tapez n'a nulle part où aller.** La Content-Security-Policy énumère les adresses autorisées, dont aucune n’appartient au site. Aucun point de collecte ne reçoit adresse ou téléphone, et aucun code ne les enverrait s’il existait.
- **Rien ici ne récupère quoi que ce soit.** Aucun `fetch`, `XMLHttpRequest` ni `sendBeacon` dans `src/`. L’outil ne peut donc pas chercher votre fiche : vous la collez. Pouvoir la récupérer signifierait aussi pouvoir envoyer vos champs.
- **La photo est lue et débarrassée de ses métadonnées ici.** La couverture est décodée dans la page puis redessinée sur un canevas qui limite sa taille et retire date et lieu enregistrés. La maquette contient une image, pas votre fichier original.
- **Le téléchargement correspond à l’aperçu.** Le PNG n’est pas un second rendu susceptible de différer : le même balisage est peint par le navigateur sur un canevas. Aucune police à récupérer ni image liée : le fichier est autonome et l’export fonctionne hors ligne.
- **Un profil enregistré est un fichier, pas un compte.** Le JSON va sur votre disque seul. Le rouvrir est le seul moyen pour l’outil de retrouver le profil. Rien n’est stocké entre visites dans le navigateur : adresse et horaires ne nous appartiennent pas.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, le bouton de don de Buy Me a Coffee. Aucun ne reçoit votre saisie. Tout le code qui dessine vos champs vient du site et figure dans le dépôt.
- **Cela fonctionne hors ligne.** Débranchez le réseau et l'outil est inchangé, parce qu'il n'y a jamais eu d'étape réseau dedans. C'est la preuve la plus simple qui soit.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/surfaces.js` pour les trois cartes et leurs coordonnées explicites, `src/profile.js` pour le calcul d’ouverture actuelle, et `src/parse-listing.js` pour lire la fiche collée.
