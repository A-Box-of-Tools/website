# Contact

Une seule personne lit tout cela, et le lit en entier. Vous trouverez ci-dessous à quoi sert le mieux chacune des deux voies, quoi mettre dans un signalement pour qu’un bogue puisse vraiment être retrouvé, et ce qui se passe une fois le message parti.

Dernière mise à jour 27 août 2026

## Les deux voies

**L’e-mail : [hi@abox.tools](mailto:hi@abox.tools).** Il arrive directement à la personne qui écrit les outils. C’est le meilleur canal pour tout ce que vous préféreriez ne pas dire en public : une inquiétude sur la confidentialité, une réclamation de droit d’auteur ou de marque, un problème de sécurité, ou un bogue que vous ne pouvez décrire qu’en joignant un fichier qui ne regarde personne d’autre.

**Le gestionnaire de tickets : [github.com/A-Box-of-Tools/website/issues](https://github.com/A-Box-of-Tools/website/issues).** C’est la même personne qui le lit. C’est le meilleur canal pour tout ce dont les autres profiteraient aussi : un outil qui traite mal un certain type de fichier, une traduction qui sonne faux dans votre langue, une demande de fonctionnalité, ou une question dont la réponse a sa place là où la personne suivante la trouvera. Il faut un compte GitHub ; l’e-mail, non.

Il n’y a ni numéro de téléphone ni messagerie instantanée. C’est un projet d’une seule personne, et une ligne d’assistance où personne n’est assis vaut moins que de le dire franchement.

## Ce qui se passe quand vous écrivez

Un être humain le lit, en général sous quelques jours. Les réponses sont en anglais.

Un bogue reproductible dans un outil est normalement corrigé en une ou deux semaines, et la correction apparaît dans l’historique public des modifications, avec votre signalement rattaché si vous l’avez déposé comme ticket. Une demande de fonctionnalité reçoit une réponse honnête, qui est parfois non : [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md) garde un paragraphe sur chaque idée écartée et sur son motif, donc un non arrive ici avec son raisonnement.

Ce qui n’arrivera pas : vous ne serez inscrit sur aucune liste de diffusion, et votre adresse ne sera communiquée à personne. Elle sert à vous répondre et à rien d’autre.

## Signaler un bogue de façon qu’on puisse le retrouver

Ces outils tournent sur votre machine et non sur un serveur, ce qui veut dire qu’il n’y a ici aucun journal à consulter. Tout ce qui s’est produit s’est produit à un endroit que vous seul pouviez voir. Un signalement qui dit quelle page et ce qui a mal tourné vaut donc ici plus que presque partout ailleurs. Les détails utiles :

- **Quel outil**, par son adresse : il y en a trente-six, et plusieurs font des travaux voisins.
- **Le navigateur et sa version**, et s’il s’agit d’un téléphone. Une part surprenante de ces bogues tient à l’idée qu’un navigateur donné se fait d’un conteneur vidéo ou d’un encodeur d’image, plutôt qu’à l’outil lui-même.
- **Ce qu’était le fichier** : le format, sa taille approximative, et d’où il venait, par exemple tel appareil photo ou tel téléphone. Vous n’avez pas besoin d’envoyer le fichier. S’il existe un petit exemple qui montre le problème et qui n’est pas privé, cela aide énormément ; sinon, le décrire suffit le plus souvent.
- **Ce que vous attendiez et ce que vous avez obtenu.** « Ça n’a pas marché » et « l’export était muet » sont deux bogues différents avec des causes différentes.
- **Tout ce qui s’affiche en rouge dans la console du navigateur**, si vous savez l’ouvrir. Copiez la première erreur plutôt que de toutes les photographier.

## Signalements de sécurité et de confidentialité

Ceux-là par e-mail plutôt qu’en public : [hi@abox.tools](mailto:hi@abox.tools). Tout ce qui permettrait à une page d’ici d’atteindre un fichier qui ne la regarde pas, d’en envoyer un quelque part, ou d’exécuter du code qu’on ne lui a pas servi, est pris au sérieux et examiné dans la semaine. Il en va de même pour toute façon dont le site collecterait quelque chose que la [page de confidentialité](https://abox.tools/fr/confidentialite/) dit ne pas collecter.

Il n’y a ni programme de primes ni argent, et il vaut mieux le dire d’emblée que de le laisser découvrir après coup. Une mention dans le commit et dans la note de version est proposée, et refusée tout aussi volontiers.

## Droit d’auteur, marques et retraits

Rien sur ce site n’est envoyé par des utilisateurs, et il n’y a nulle part ici où qui que ce soit puisse publier quoi que ce soit : les outils traitent les fichiers dans le navigateur de la personne qui visite la page, et rien de ce qu’elle ouvre ou produit n’atteint ce site. Il n’y a donc aucun contenu hébergé à retirer, ni aucun compte à suspendre.

Si quelque chose écrit ou dessiné *par ce site* — une page, une illustration, un morceau de code — porte atteinte à un de vos droits, écrivez à [hi@abox.tools](mailto:hi@abox.tools) en indiquant l’adresse de la page et ce qui pose problème ; ce sera traité directement.

## Publicité et demandes commerciales

Le site porte de la publicité via Google, et c’est là tout l’arrangement. Les emplacements négociés en direct, les articles sponsorisés, les liens payants, les articles invités et les échanges de liens sont tous refusés, et la raison n’est pas la pudeur : une page qui porte discrètement le texte de quelqu’un d’autre est une page dont le lecteur ne peut plus soupeser les affirmations, et chacune de celles de ce site est une invitation à vérifier. Épargnez-vous l’e-mail.

Utiliser les outils à des fins commerciales ne demande ni autorisation ni licence : ils sont libres pour tout usage, y compris en entreprise. La réutilisation du [code](https://github.com/A-Box-of-Tools/website) relève de la licence du dépôt, qui est permissive, et en extraire un module est exactement ce à quoi cette licence sert.

## À qui vous écrivez

abox.tools est un projet indépendant et autofinancé, mené par une seule personne depuis l’Ontario, au Canada. Ce n’est pas une entreprise, et il n’y a pas de service d’assistance derrière l’adresse ci-dessus — c’est pourquoi la réponse est plus lente que celle d’une société, et pourquoi elle est écrite par quelqu’un qui a lu le code. La [page à propos](https://abox.tools/fr/a-propos/) explique qui construit tout cela, pourquoi les outils fonctionnent ainsi, et comment le site se finance.
