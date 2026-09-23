# À propos d’abox.tools

Une personne seule, en Ontario, qui fabrique les outils dont elle avait sans cesse besoin et auxquels elle ne se fiait pas. Tout ici tourne sur votre propre appareil, le code est public, et cette page réunit les raisons de l’un et de l’autre.

Dernière mise à jour 27 août 2026

## Ce que c’est

abox.tools est un ensemble de petits outils qui font chacun une seule chose : redimensionner une photo, couper une vidéo, fusionner deux PDF, lire ce que contient réellement un code QR. Il y en a 44 à ce jour, accompagnés d’une [bibliothèque de guides](https://abox.tools/fr/guides/) sur les tâches auxquelles ils servent.

L’inhabituel n’est pas ce qu’ils font, mais où ils le font. Chacun d’eux tourne entièrement dans le navigateur, sur la machine de la personne qui l’utilise, avec les décodeurs et les encodeurs que ce navigateur embarque déjà. Rien de ce que vous ouvrez n’est transmis nulle part. Il n’y a d’ailleurs aucun serveur derrière ces pages pour le recevoir : le site entier est fait de fichiers statiques, et les outils sont de simples modules JavaScript servis à côté d’eux.

Voilà le produit. Tout le reste de cette page explique pourquoi cela vaut la peine d’être construit ainsi, et par qui.

## Qui le fabrique

Une personne, seule, en Ontario, au Canada. Ce n’est pas une entreprise. Il n’y a ni équipe, ni investisseur, ni maison mère, ni projet de rachat. Le courrier arrive à [hi@abox.tools](mailto:hi@abox.tools) et il est lu par la personne qui a écrit le code ; la [page de contact](https://abox.tools/fr/contact/) précise à quoi cette adresse sert et à quoi elle ne sert pas.

Le site est publié sans signature personnelle, et c’est délibéré. C’est un petit projet plutôt qu’une marque personnelle, et ce qui mérite ici d’être cru n’est pas un nom au bas d’une page, c’est [le code](https://github.com/A-Box-of-Tools/website), que tout le monde peut lire, et le comportement des pages elles-mêmes, que tout le monde peut vérifier en une trentaine de secondes avec les outils de développement ouverts. Ces deux choses se vérifient. Une signature, non.

## Pourquoi il est construit ainsi

La façon ordinaire de bâtir ces outils consiste à envoyer le fichier, à faire le travail sur un serveur et à renvoyer le résultat. C’est plus simple, cela fonctionne sur n’importe quel appareil, et c’est ce que fait presque tout « convertisseur en ligne gratuit ».

Cela revient aussi à confier son fichier à un inconnu. Peu importe pour un mème. Cela importe beaucoup pour le scan d’un passeport, une image médicale, un contrat signé, ou une photo dont les métadonnées portent votre adresse. Une fois le fichier sur la machine de quelqu’un d’autre, son sort dépend des règles et du sérieux de cette personne, et vous n’avez aucun moyen de vérifier ni l’un ni l’autre. La politique de confidentialité d’un tel site est une promesse, pas une contrainte.

Les navigateurs sont devenus assez bons pour rendre cette promesse inutile. Ils savent lire et écrire du JPEG, du PNG et du WebP ; démultiplexer et décoder de la vidéo ; calculer l’empreinte d’un fichier, lire un code QR et écrire un PDF. Si le travail peut se faire sur votre propre machine, alors « vont-ils garder mon fichier ? » cesse d’être une question sur les intentions de quiconque et devient une question sur ce que le code peut faire techniquement. Et à celle-là, vous pouvez répondre vous-même.

C’est tout l’argument, et un guide le développe comme il faut : [est-il sûr d’envoyer ses fichiers sur un site ?](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/)

## Vérifier, plutôt que faire confiance

Tout ce qui précède est fait pour être mis à l’épreuve. Quatre moyens, par ordre d’effort croissant :

- **Débranchez internet.** Chargez la page d’un outil, déconnectez-vous, et servez-vous-en quand même. Elle continue de fonctionner, parce qu’il n’y a jamais eu d’étape réseau dedans. Un outil qui enverrait votre fichier ailleurs pour le traiter s’arrêterait net.
- **Regardez le réseau.** Ouvrez les outils de développement, allez dans l’onglet Réseau, et traitez un fichier. Pas une seule requête ne transporte votre fichier, une vignette de celui-ci, son nom ou un octet de son contenu. Ce que vous verrez, c’est la page, ses scripts, la publicité et le compteur de visites.
- **Lisez la règle que la page s’impose.** Chaque page porte une `Content-Security-Policy` qui nomme toutes les adresses qu’elle a le droit de contacter, et aucune n’appartient à ce site. Même une erreur dans le code ne pourrait pas envoyer un fichier quelque part, car le navigateur refuserait la connexion.
- **Lisez le code.** Il est [entièrement public](https://github.com/A-Box-of-Tools/website), sans étape de compilation ni empaqueteur : ce qui est dans le dépôt est, octet pour octet, ce que votre navigateur exécute. Chaque outil a un README qui explique son fonctionnement, et chaque page d’outil nomme les fichiers à lire en premier.

Il existe exactement une exception délibérée au « sans réseau », et elle est exposée longuement sur sa propre page : [Partager du texte](https://abox.tools/fr/partager-du-texte/) déplace du texte entre deux de vos appareils, ce qui ne peut se faire sans réseau. Une seule connexion est ouverte vers un relais qui ne stocke rien et à qui l’on dit uniquement que deux navigateurs souhaitent être mis en relation.

## Comment les outils sont faits et vérifiés

Un outil sort quand il fonctionne sur de vrais fichiers, pas quand il fonctionne sur le fichier contre lequel il a été écrit. En pratique, cela veut dire le manipuler à la main dans un navigateur avec des entrées difficiles : la vidéo sans image clé là où l’on veut couper, le HEIC d’un téléphone qui écrit son conteneur de travers, le PDF avec une police incorporée en partie seulement. C’est ce que les gens ont vraiment, et c’est justement ce qu’un test écrit par la même personne que le bogue ne trouvera pas.

En dessous, une suite de tests automatiques couvre les deux moitiés : le générateur qui construit le site, et les modules que le navigateur exécute. Elle tourne à chaque modification, et rien n’est publié après un échec. Là où le même travail se retrouve dans plusieurs outils (plusieurs d’entre eux lisent des fichiers MP4), un test vérifie que les copies concordent toujours, de sorte qu’une correction apportée à l’une ne laisse pas les autres silencieusement fausses.

Les guides suivent la même règle. Leurs captures d’écran sont prises sur le site construit par un script, et non dessinées ou simulées : une image dans un guide montre donc la page telle qu’elle est aujourd’hui.

## Comment tout cela est financé

Par la publicité et par les dons de gens qui trouvent les outils utiles. C’est tout le modèle économique, et il vaut la peine de préciser ce qu’il implique et ce qu’il n’implique pas.

**Il n’y a rien à acheter.** Pas de compte, pas d’inscription, pas d’offre gratuite avec une offre payante au-dessus, pas de filigrane à faire retirer, pas de limite de taille, pas de quota journalier, aucune fonction gardée en réserve. Ce qui est sur le site, c’est tout.

**Vos fichiers ne font pas partie du marché.** La publicité est celle de Google et le comptage des visites est Google Analytics, et ni l’un ni l’autre n’apprend ce que vous ouvrez, ce que vous produisez, comment cela s’appelait ou quelle taille cela faisait : aucun de ces scripts ne le reçoit jamais, et la politique de sécurité de la page refuserait l’envoi si l’un d’eux essayait. Ce que ces deux-là collectent réellement, et comment désactiver chacun, est exposé sur la [page de confidentialité](https://abox.tools/fr/confidentialite/). Tous les outils continuent de fonctionner avec les deux bloqués.

**Les outils ne sont pas écrits pour la publicité.** Aucun outil ici n’existe parce qu’un mot-clé valait de l’argent, et aucun n’a été rendu plus lent, plus laborieux ou plus gourmand en pages pour vendre davantage d’affichages. Ce qui sera construit ensuite se discute au grand jour, dans [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), un paragraphe par idée, y compris les raisons pour lesquelles plusieurs propositions d’apparence évidente ont été écartées.

## Les langues

Le site est publié en quinze langues. Chacune est une véritable traduction et non une passe automatique laissée en l’état : les noms des outils, les explications, les guides et les adresses elles-mêmes sont traduits, et une page n’est répertoriée dans une langue que lorsqu’elle y a réellement été écrite. Une langue encore en chantier reste lisible mais est tenue à l’écart du plan du site et du sélecteur de langue, pour que personne ne soit invité sur une page à moitié en anglais.

Le courrier reçoit une réponse en anglais, ce qui est la seule chose honnête à dire d’un projet de cette taille.

## Ce que ce site ne fera pas

- Vous demander de créer un compte, ni votre adresse e-mail.
- Envoyer, stocker, inspecter ou conserver un fichier que vous ouvrez ici.
- Apposer un filigrane sur un résultat, ni réserver une fonction à une offre payante.
- Ajouter une étape réseau à un outil qui n’en a pas besoin.
- Affirmer sur la page d’un outil quelque chose que le code du dépôt ne fait pas.

Si vous constatez l’une de ces choses, c’est à la fois un bogue et une promesse rompue, et cela vaut la peine de le signaler. La [page de contact](https://abox.tools/fr/contact/) est le chemin le plus court.
