# Comment une page web peut-elle marcher sans le wifi ?

Parce que le navigateur en a gardé une copie complète, et qu'un petit programme livré avec la page sert cette copie chaque fois que le réseau ne peut pas. La mécanique est standard et vaut d'être comprise, parce qu'un outil qui travaille débranché vous montre quelque chose qu'aucune politique de confidentialité ne peut montrer.

Dernière mise à jour 26 août 2026

## La réponse courte

Une page web vit et meurt d'ordinaire avec sa connexion, parce que chaque visite la va rechercher. Mais une page peut livrer avec elle un petit programme appelé *service worker*, que le navigateur installe à côté d'elle et met aux commandes de son trafic réseau. À la première visite, ce worker range une copie complète de tout ce qui compose la page — balisage, styles, scripts — dans un cache sur votre machine. Dès lors, les requêtes trouvent réponse dans cette copie. Quand le wifi meurt, rien ne change, puisque rien n'était recherché de toute façon.

Il n'y a là ni magie ni permission spéciale : c'est de la mécanique standard du navigateur, livrée dans tous les grands navigateurs depuis une dizaine d'années. Ce qui est inhabituel, c'est un site qui s'y appuie aussi fort que celui-ci — parce que pour un site dont toute la promesse est que vos fichiers ne partent jamais, le hors-ligne n'est pas un confort. C'est la preuve.

## Ce que prouve la survie au débranchage

La vérification la plus forte du guide sur l'envoi est [débrancher](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) : charger l'outil, couper la connexion, s'en servir. Il vaut la peine d'être précis sur la raison pour laquelle cela marche. Un outil qui convertit votre fichier sur un serveur a besoin du réseau à l'instant exact où il travaille — coupez le fil et le travail s'arrête. Un outil qui continue a démontré, et non affirmé, que le travail se passe sur votre machine ; et une page qui ne peut pas atteindre le réseau ne peut envoyer votre fichier nulle part, quoi que son code puisse souhaiter.

Aucune politique de confidentialité ne peut offrir cela. Une politique décrit des intentions et peut changer ; une page qui fait son travail en mode avion, c'est de la physique. C'est pourquoi chaque outil de ce site fonctionne hors ligne et porte un indicateur en direct qui dit si vous l'êtes en ce moment — pour que vous puissiez le regarder basculer en coupant la connexion, et dérouler la plus forte vérification qui soit en une dizaine de secondes.

## Comment la copie reste honnête

Deux questions décident si une copie gardée pour toujours est un cadeau ou un piège, et la mécanique répond aux deux :

- **La copie vieillit-elle ?** Le worker guette une version plus récente quand une connexion existe et l'échange en bloc. Les versions vont en bloc parce que la copie doit toujours être cohérente — moitié vieille, moitié neuve est le seul état qui ne doit jamais être servi.
- **Qu'est-ce qui a été copié, exactement ?** Tout ce dont la page a besoin et rien d'autre — et chaque outil d'ici garde sa copie dans son propre casier. Le cache d'un outil contient cet outil ; en installer un n'en installe pas dix en silence. La copie est de plus inspectable : les outils de développement de votre navigateur listent chaque fichier en cache, et la liste est la même que la page a été chercher au grand jour.

Le résultat est une page qui se comporte comme une application que vous auriez installée en la visitant — ce qui est aussi, littéralement, proposé : la barre d'adresse du navigateur installe n'importe quel outil d'ici comme une application, avec l'icône propre de l'outil, s'ouvrant droit sur l'outil, sans bouton sur la page et sans script qui quémande. La même mécanique, en habit de raccourci.

## Ce que le hors-ligne ne prouve pas

La vérification est forte, pas magique, et ses limites méritent d'être dites aussi nettement que sa force :

- **Elle prouve l'instant, pas l'avenir.** Le travail fait hors ligne est resté sur votre machine, point. Une page pourrait en principe retenir des données et les envoyer au retour de la connexion — pour les fichiers les plus délicats, fermez donc l'onglet avant de vous reconnecter, ou vérifiez aussi l'autre sens : regardez l'onglet Réseau au moment où la connexion revient.
- **Elle prouve cette page, pas le site.** Chaque page répond pour elle-même. Celle d'ici qui utilise le réseau le dit sur sa propre page : l'outil de [partage de texte](https://abox.tools/fr/partager-du-texte/), dont tout le métier est de déplacer quelque chose entre deux appareils, et qui explique exactement ce que transporte sa seule connexion.
- **Il ne vous cache pas.** Charger la page a d'emblée donné votre adresse au site, comme tout chargement de page sur le web. Le hors-ligne concerne la destination de vos fichiers, pas l'anonymat.

Ces limites sont la raison pour laquelle le guide sur l'envoi enseigne quatre vérifications plutôt qu'une — l'onglet Réseau, la politique de sécurité dans la source de la page et le code lisible couvrent ce que le débranchage ne peut pas. Mais comme premier filtre, aucun n'est plus rapide : si un outil ne peut pas faire son travail réseau coupé, vous avez appris où le travail se passe, et aucune lecture supplémentaire n'est requise.
