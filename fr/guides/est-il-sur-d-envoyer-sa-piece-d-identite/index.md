# Est-il sûr d'envoyer une photo de sa pièce d'identité ?

Vers le formulaire officiel auquel elle est destinée : oui — c'est à cela que sert le document. Le risque loge une étape plus tôt, chez le convertisseur ou le compresseur où l'on passe parce que le formulaire a exigé « moins de 300 Ko, JPEG » — et cette étape-là n'a jamais besoin d'exister.

Dernière mise à jour 26 août 2026

## La réponse courte

Envoyer sa pièce d'identité à l'organisme qui l'a demandée est normal et le plus souvent inévitable : une demande de visa, la vérification d'identité d'une banque, une inscription à un examen. Cet envoi-là est la raison d'être du document, il va vers une partie que vous pouvez nommer, et il n'existe généralement pas d'autre façon de faire la démarche.

L'envoi qui mérite l'inquiétude est un autre, et il arrive une étape plus tôt. Le formulaire dit que la photo doit faire 35 sur 45 millimètres, ou moins de 300 Ko, ou exactement 200 sur 230 pixels — et votre scan n'est rien de tout cela. Alors, cinq minutes avant une échéance, avec en main le fichier le plus sensible que vous possédiez, vous cherchez « redimensionner photo en ligne » et tendez votre passeport au premier résultat : un site que vous ne connaissiez pas dix secondes plus tôt et où vous ne reviendrez jamais. C'est de cette étape que parle cette page — et c'est l'étape qui n'a jamais besoin d'exister.

## Pourquoi une pièce d'identité n'est pas un fichier comme les autres

La plupart des fichiers sont embarrassants à voir fuir. Une pièce d'identité est *utile* à voir fuir, ce qui est autre chose, et pire. Une seule image porte, dans un seul rectangle, à peu près tout ce qu'il faut à un inconnu pour ouvrir un compte à votre nom : nom complet, date et lieu de naissance, numéro du document, date d'expiration, une photo de votre visage, et sur beaucoup de documents une bande lisible par machine qui répète le tout dans un format conçu pour être analysé.

C'est aussi une fuite singulièrement difficile à rattraper. Un mot de passe divulgué se change en une minute ; une carte divulguée se remplace en une semaine. Une date de naissance est à vous pour la vie, et remplacer un numéro de passeport, c'est remplacer le passeport. Cette asymétrie est tout l'argument de la prudence : le coût d'une fuite est élevé et permanent, et le coût de l'éviter, il se trouve, est nul.

Une chose de plus voyage sans y avoir été invitée. Une photo prise au téléphone porte des métadonnées EXIF — typiquement les coordonnées GPS exactes de la prise de vue, ce qui, pour un document photographié sur la table de la cuisine, est votre adresse personnelle, agrafée au seul fichier qui contient déjà votre nom et votre date de naissance. Le cas général de ce problème a [un guide à lui](https://abox.tools/fr/guides/supprimer-les-donnees-exif-et-gps/).

## Le piège, c'est l'exigence, pas le formulaire

Regardez la mécanique du moment risqué. Le formulaire lui-même est en général la partie la plus responsable de toute l'histoire — un portail public ou une banque régulée, avec une adresse et des contrôleurs. Ce qui pousse les gens vers pire, ce sont les *exigences* du formulaire : une dimension en millimètres, un nombre de pixels, un plafond en kilooctets, parfois aussi un plancher. Le document doit être transformé, le formulaire ne s'en charge pas, et les outils du système d'exploitation ne parlent ni le millimètre ni le kilooctet.

Le détour se produit donc dans les pires conditions possibles : pressé, sans le temps d'évaluer quoi que ce soit, avec le fichier où l'enjeu est le plus haut. Un convertisseur qui serait un choix parfaitement raisonnable pour une photo de vacances hérite de votre passeport à la place. Personne ne choisit cela délibérément ; l'échéance le choisit à sa place.

La question générale — ce que fait réellement l'envoi vers n'importe quel convertisseur, et comment savoir si un outil envoie quoi que ce soit — a [sa propre page](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/). La version courte : un outil vérifiable vaut mieux qu'un outil digne de confiance, parce qu'avec le vérifiable la question de la confiance ne se pose jamais. Pour une pièce d'identité, cette préférence cesse d'être un raffinement et devient tout l'enjeu.

## Tout le travail, sans que le document parte

Tout ce que l'exigence demande, votre propre navigateur peut le faire sur votre propre machine, sans rien envoyer nulle part. Ce site a un outil pour chaque forme que prend l'exigence :

- **« ⁦35 × 45⁩ mm, tête entre 70 et 80% du cadre »** — la [photo d'identité](https://abox.tools/fr/photo-d-identite/) connaît la règle publiée de chaque pays : format d'impression, hauteur de tête, ligne des yeux, fond, et les limites en pixels et en kilooctets que ses formulaires web imposent, planchers compris. Choisissez le pays et le document ; la règle est appliquée exactement.
- **« un scan, pas une photo »** — le [scanner de documents](https://abox.tools/fr/scanner-un-document/) trouve les coins de la page dans une photo de téléphone, redresse la perspective et égalise la lumière, si bien qu'un document photographié sur une table ressort avec l'air d'un scan.
- **« moins de 300 Ko »** — le [compresseur d'images](https://abox.tools/fr/compresser-une-image/) prend la limite comme un nombre et trouve la moindre compression qui passe dessous, au lieu de vous faire deviner avec un curseur de qualité.
- **Partager une copie qui n'en dit pas plus que nécessaire** — quand un hôtel ou un propriétaire veut une preuve d'identité mais n'a que faire de votre numéro de document, l'outil pour [caviarder une image](https://abox.tools/fr/caviarder-une-image/) réécrit les pixels eux-mêmes au lieu de poser un cadre par-dessus, et le [lecteur-suppresseur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) retire les métadonnées, position comprise.

Chacun de ces outils continue de fonctionner une fois le Wi-Fi coupé, et c'est moins un confort qu'une preuve : une page qui ne peut pas atteindre le réseau ne peut envoyer un passeport nulle part. Ce test — et trois autres du même genre — sont détaillés dans [le guide sur l'envoi de fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/), et ils marchent sur n'importe quel site, celui-ci compris.

## Pour l'envoi auquel vous ne couperez pas

La démarche elle-même se termine tout de même par un envoi. Mettez le soin là où il rapporte :

- Tapez vous-même l'adresse du portail, ou suivez le lien imprimé sur un courrier officiel, plutôt que de la chercher. Les portails de démarches sont massivement imités, et une imitation convainc d'autant mieux qu'on est pressé.
- Envoyez les documents par le formulaire, pas par courriel. Le courriel est stocké en plus d'endroits que l'expéditeur et le destinataire ne sauraient en citer, indéfiniment.
- Si une entreprise exige une copie intégrale, demander pourquoi est légitime. Dans bien des pays, vous pouvez rayer ce dont une partie privée n'a pas besoin — plusieurs administrations recommandent explicitement d'annoter une copie de son motif et de sa date. Avec l'outil de caviardage ci-dessus, c'est l'affaire de deux minutes.
- Gardez les copies de travail hors des machines partagées, et effacez les restes : l'original trop lourd dans le dossier de téléchargements survit à la démarche pendant des années, et c'est la copie dont personne ne se souvient.

Rien de tout cela n'est une raison de renoncer au passeport. C'est une raison de faire du seul envoi qui compte le seul qui ait lieu.
