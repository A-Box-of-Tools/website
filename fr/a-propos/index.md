# À propos d’abox.tools

Une personne seule, en Ontario, qui fabrique les outils dont elle avait sans cesse besoin et auxquels elle ne se fiait pas. Tout ici tourne sur votre propre appareil, le code est public, et cette page réunit les raisons de l’un et de l’autre.

Dernière mise à jour 12 octobre 2026

## Ce que c’est

abox.tools est un ensemble de petits outils qui font chacun une seule chose : redimensionner une photo, couper une vidéo, fusionner deux PDF, lire ce que contient réellement un code QR. Il y en a 56 à ce jour, accompagnés d’une [bibliothèque de guides](https://abox.tools/fr/guides/) sur les tâches auxquelles ils servent.

Chaque outil traite les fichiers dans le navigateur qui l’exécute, avec le matériel de cet appareil. La plupart utilisent les codecs natifs ; d’autres incluent des moteurs locaux JavaScript ou WebAssembly, comme le décodeur HEIC et l’OCR des reçus. Les fichiers ne sont pas envoyés pour traitement. Le site fournit des pages et du code statiques ; le partage volontaire et les fonctions en ligne facultatives ont leurs propres limites, décrites plus bas.

Voilà le produit. Tout le reste de cette page explique pourquoi cela vaut la peine d’être construit ainsi, et par qui.

## Qui le fabrique

Une personne, seule, en Ontario, au Canada. Ce n’est pas une entreprise. Il n’y a ni équipe, ni investisseur, ni maison mère, ni projet de rachat. Le courrier arrive à [hi@abox.tools](mailto:hi@abox.tools) et il est lu par la personne qui a écrit le code ; la [page de contact](https://abox.tools/fr/contact/) précise à quoi cette adresse sert et à quoi elle ne sert pas.

Le site est publié sans signature personnelle, et c’est délibéré. C’est un petit projet plutôt qu’une marque personnelle, et ce qui mérite ici d’être cru n’est pas un nom au bas d’une page, c’est [le code](https://github.com/A-Box-of-Tools/website), que tout le monde peut lire, et le comportement des pages elles-mêmes, que tout le monde peut vérifier en une trentaine de secondes avec les outils de développement ouverts. Ces deux choses se vérifient. Une signature, non.

## Pourquoi il est construit ainsi

De nombreux convertisseurs envoient le fichier à un serveur, le traitent puis renvoient le résultat. D’autres travaillent localement. La distinction utile est l’endroit où le travail a lieu et la nécessité de faire sortir le fichier du navigateur.

Le traitement serveur remet une copie au prestataire. Pour un passeport, une image médicale, un contrat signé ou une photo avec localisation, cette décision mérite vérification. Politiques publiques, documentation de sécurité, audits et comportement observable apportent des preuves. La page seule ne montre pas chaque copie interne, sauvegarde ou accès après l’envoi. Une politique décrit le traitement du prestataire ; ce n’est pas la même contrainte qu’une opération locale terminée déconnecté.

Les navigateurs sont devenus assez bons pour rendre cette promesse inutile. Ils savent lire et écrire du JPEG, du PNG et du WebP ; démultiplexer et décoder de la vidéo ; calculer l’empreinte d’un fichier, lire un code QR et écrire un PDF. Si le travail peut se faire sur votre propre machine, alors « vont-ils garder mon fichier ? » cesse d’être une question sur les intentions de quiconque et devient une question sur ce que le code peut faire techniquement. Et à celle-là, vous pouvez répondre vous-même.

C’est tout l’argument, et un guide le développe comme il faut : [est-il sûr d’envoyer ses fichiers sur un site ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/)

## Vérifier, plutôt que faire confiance

Quatre vérifications apportent des preuves différentes. Combinez-les et vérifiez la fonction que vous comptez utiliser :

- **Déconnectez-vous pour une opération locale.** Laissez l’outil charger et attendez que son indicateur hors ligne soit prêt. Traitez un fichier de votre appareil. Un résultat terminé prouve que cette opération était locale pendant la déconnexion, mais pas ce qui pourrait partir après reconnexion.
- **Examinez les requêtes réseau.** Vérifiez URL, corps des requêtes et messages WebSocket, plutôt que la seule taille. Le traitement local n’envoie pas vos fichiers. Ressources, scripts de plateforme, recherches facultatives et partages volontaires sont des trafics distincts expliqués sur leurs pages.
- **Lisez la Content-Security-Policy.** Elle limite les ressources et destinations de connexion. Elle n’inspecte pas les données, n’empêche pas leur envoi aux hôtes autorisés et ne décrit pas le trafic WebRTC entre pairs. Comparez-la au code et au comportement observé.
- **Lisez le code et le résultat compilé.** Le [dépôt](https://github.com/A-Box-of-Tools/website) contient modèles, modules, composants partagés et moteurs inclus. La compilation génère les pages et minifie le code du site. Chaque outil indique les fichiers à lire d’abord ; vous pouvez compiler et comparer avec la publication.

Les fonctions réseau sont volontaires. [Images en vidéo](https://abox.tools/fr/images-en-video/) peut récupérer une URL d’image. L’[extracteur de reçus et factures](https://abox.tools/fr/extraire-recus-factures/) peut demander une paire de devises et une date à Frankfurter et remettre un rapport à l’application de messagerie ou de partage choisie. [Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/) et [Caméra distante](https://abox.tools/fr/remote-camera/) transfèrent le contenu entre navigateurs. Le rendez-vous transporte des métadonnées de découverte et de connexion, jamais les fichiers partagés ni la vidéo. Ces fonctions nécessitent une connexion ; leurs pages et la [page de confidentialité](https://abox.tools/fr/confidentialite/) expliquent ce que voit chaque participant.

## Comment les outils sont faits et vérifiés

Un outil sort quand il fonctionne sur de vrais fichiers, pas quand il fonctionne sur le fichier contre lequel il a été écrit. En pratique, cela veut dire le manipuler à la main dans un navigateur avec des entrées difficiles : la vidéo sans image clé là où l’on veut couper, le HEIC d’un téléphone qui écrit son conteneur de travers, le PDF avec une police incorporée en partie seulement. C’est ce que les gens ont vraiment, et c’est justement ce qu’un test écrit par la même personne que le bogue ne trouvera pas.

Une suite automatisée couvre le générateur et les modules du navigateur. Elle s’exécute en CI et une erreur bloque la publication. Les analyseurs et générateurs communs, comme le lecteur MP4, se trouvent dans des modules partagés copiés dans chaque outil compilé. Un contrôle des doublons empêche des copies indépendantes de diverger.

Les guides suivent la même règle. Leurs captures d’écran sont prises sur le site construit par un script, et non dessinées ou simulées : une image dans un guide montre donc la page telle qu’elle est aujourd’hui.

## Comment tout cela est financé

Par la publicité et par les dons de gens qui trouvent les outils utiles. C’est tout le modèle économique, et il vaut la peine de préciser ce qu’il implique et ce qu’il n’implique pas.

**Il n’y a rien à acheter.** Aucun compte, formule payante, filigrane à retirer contre paiement ou fonction réservée. Formats pris en charge, mémoire du navigateur et limites volontaires restent importants ; chaque outil les explique.

**Vos fichiers ne font pas partie du modèle économique.** Publicité et comptage des visites utilisent les services Google. L’avis facultatif envoie le nom de l’outil, une réponse fixe positive ou négative et un motif fixe, jamais fichier, nom, taille ou contenu. Le code ne transmet pas de données de fichiers à ces services. Les destinations autorisées restent des destinations réseau ; la politique seule ne garantit pas les données envoyées. La [page de confidentialité](https://abox.tools/fr/confidentialite/) décrit collecte et blocage. Le traitement local fonctionne avec ces scripts bloqués.

**Les outils ne sont pas écrits pour la publicité.** Aucun outil ici n’existe parce qu’un mot-clé valait de l’argent, et aucun n’a été rendu plus lent, plus laborieux ou plus gourmand en pages pour vendre davantage d’affichages. Ce qui sera construit ensuite se discute au grand jour, dans [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), un paragraphe par idée, y compris les raisons pour lesquelles plusieurs propositions d’apparence évidente ont été écartées.

## Les langues

L’anglais, le chinois simplifié, l’allemand, l’espagnol, le portugais brésilien, le français et le japonais sont maintenus ici. Huit traductions antérieures restent lisibles sous forme de pages archivées sans recevoir les modifications actuelles. Les pages maintenues n’entrent dans le sitemap et le sélecteur qu’une fois traduites ; les pages inachevées restent lisibles sans être présentées comme traductions terminées.

Le courrier reçoit une réponse en anglais, ce qui est la seule chose honnête à dire d’un projet de cette taille.

## Ce que ce site ne fera pas

- Exiger un compte ou une adresse de messagerie pour traiter un fichier.
- Recevoir ou conserver des fichiers sur un serveur pour les traiter.
- Apposer un filigrane sur un résultat, ni réserver une fonction à une offre payante.
- Ajouter une étape réseau à un outil qui n’en a pas besoin.
- Affirmer sur la page d’un outil quelque chose que le code du dépôt ne fait pas.

Si vous constatez l’une de ces choses, c’est à la fois un bogue et une promesse rompue, et cela vaut la peine de le signaler. La [page de contact](https://abox.tools/fr/contact/) est le chemin le plus court.
