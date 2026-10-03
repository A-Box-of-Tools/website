# Confidentialité & cookies

La version courte : vos fichiers ne sont jamais envoyés, parce qu'il n'y a nulle part où les envoyer. Tout le reste de cette page concerne la publicité, le compteur de visites et l'hébergement, c'est-à-dire les parties qui, elles, font intervenir d'autres entreprises.

Dernière mise à jour 3 septembre 2026

## Vos fichiers

Chaque outil de ce site fait son travail à l'intérieur de votre propre navigateur, sur votre propre matériel. Quand vous choisissez un fichier, il est lu par la page que vous avez déjà ouverte. Il ne nous est pas envoyé, faute de serveur à nous vers lequel l'envoyer : ce site est un ensemble de fichiers statiques, sans backend, sans base de données et sans stockage.

Cela veut dire que nous ne recevons, ne voyons, ne stockons, ne journalisons et ne traitons jamais :

- vos fichiers, en tout ou en partie
- leurs vignettes ou leurs aperçus
- leurs noms, tailles, dimensions ou formats
- combien vous en avez choisi, ni ce que vous en avez fait
- quoi que ce soit qui en est lu, données EXIF et GPS comprises

Ce n'est pas une promesse sur nos intentions. Chaque page porte une `Content-Security-Policy` qui énumère toutes les adresses que la page a le droit de contacter, et c'est le navigateur qui l'applique. Aucune de ces adresses ne nous appartient. Vous pouvez lire la politique en tête du code source de n'importe quelle page, ou ouvrir l'onglet « Réseau » de votre navigateur et regarder : aucune requête ne transporte votre fichier.

Les fichiers que vous produisez avec un outil sont remis au mécanisme de téléchargement de votre propre navigateur et enregistrés là où vous le lui dites. Nous ne sommes pas non plus impliqués dans cette étape.

## La seule exception, et où elle s'applique

L'outil [Images en vidéo](https://abox.tools/fr/images-en-video/) a une fonction « ajouter depuis une adresse web ». Si vous y collez une adresse, votre navigateur récupère cette image sur le serveur que vous avez nommé, et **ce serveur voit votre adresse IP** ainsi que le fichier que vous avez demandé. C'est incontournable, et c'est la nature même de la fonction.

Cela n'arrive jamais que pour des adresses que vous tapez vous-même, c'est construit de sorte que les images puissent entrer mais que les données ne puissent pas sortir, et la page de cet outil l'explique plus en détail. Aucun autre outil de ce site ne peut émettre une requête sortante avec quoi que ce soit de vous dedans.

## Ce qui est collecté, et par qui

Ce site est gratuit et il est payé par la publicité. Cela veut dire que deux produits Google tournent sur ces pages, et qu'un bouton de don tourne sur la plupart d'entre elles. Voici la liste entière.

### Google AdSense — les annonces

Google sert les annonces et décide de celles que vous voyez. Pour cela, il peut poser et lire des cookies ou des identifiants similaires dans votre navigateur, et il reçoit votre adresse IP, une localisation approximative qui en découle, votre agent utilisateur, et la page sur laquelle vous étiez. Selon vos réglages et l'endroit où vous vous trouvez, les annonces peuvent être personnalisées à partir d'un profil que Google détient sur vous, bâti pour l'essentiel sur votre activité sur d'autres sites.

Nous ne recevons rien de tout cela, nous ne pouvons pas le voir, et nous n'envoyons jamais à Google quoi que ce soit sur vos fichiers. L'exposé de Google sur la façon dont il utilise les données des sites qui affichent ses annonces se trouve sur [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — le compteur de visites

Nous utilisons Google Analytics 4 pour compter les visites de pages, afin de savoir quels outils méritent qu'on y travaille. Il enregistre la page consultée, à peu près quand, un identifiant tiré au hasard et stocké dans votre navigateur, une localisation approximative, le type de votre appareil et de votre navigateur, et le site qui vous a envoyé ici.

Il est configuré pour ne rien faire d'autre, et cette configuration est un fichier que vous pouvez lire : `analytics.js`, à côté de chaque page, met en place un compteur de pages vues et ne contient aucun événement personnalisé. Rien sur ce site ne lui passe un fichier, un nom de fichier, une dimension ou un nombre, aucun code d'ici ne pouvant le faire.

### Buy Me a Coffee — le bouton de don

La page d'accueil et les pages d'outils portent un bouton de don, qui se charge depuis les serveurs de Buy Me a Coffee. Le charger implique que leur CDN voie votre adresse IP et sache que vous étiez sur ce site, et le lettrage du bouton est récupéré sur Google Fonts, qui voit lui aussi votre adresse IP. Rien d'autre n'est transmis, et rien de plus ne se passe tant que vous ne cliquez pas réellement dessus ; à ce moment-là, vous êtes sur leur site, sous leurs conditions. Cette page et la [page des conditions](https://abox.tools/fr/conditions-d-utilisation/) ne dessinent pas le bouton.

### Hébergement

Le site est servi par GitHub Pages, derrière Cloudflare. Comme tout hébergeur web, ils traitent les requêtes que fait votre navigateur, ce qui comprend votre adresse IP, la page demandée et votre agent utilisateur, afin de livrer la page et de garder le service debout et sûr. Nous n'avons accès aux journaux par visiteur d'aucun des deux.

### L'entremetteur de l'outil de partage

Un outil, [Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/), fait passer du texte et des fichiers directement d'un navigateur à l'autre, et une connexion directe demande une présentation. Cette page, seule sur ce site, ouvre donc un WebSocket vers un petit serveur à nous, qui réunit les deux bouts d'un nom de lien et relaie entre eux l'établissement de la connexion. Il ne voit jamais le texte ni les fichiers ; ils voyagent par la connexion chiffrée qu'il a présentée. Il voit le nom de lien, quand chaque côté se connecte et repart, et les adresses IP, et Cloudflare, qui le fait tourner, garde un journal de chaque connexion pendant sept jours. C'est le seul journal par visiteur de ce site que nous puissions lire. La page de l'outil le décrit en entier, et son code complet est dans le dépôt.

## Cookies

Nous ne posons aucun cookie à nous. Nous n'avons ni connexion ni session, et il n'y a qu'une seule préférence que nous retenions.

**La langue que vous choisissez.** Si vous prenez une langue dans le sélecteur, ce choix est écrit dans le stockage local de votre navigateur, sous le nom `abox-lang`, pour que la page suivante s'ouvre dans la langue demandée. Ce n'est pas un cookie : il ne nous est jamais transmis, ni à personne d'autre, il reste sur l'appareil depuis lequel vous lisez ceci, et effacer les données de site de votre navigateur le supprime. Si vous ne choisissez jamais de langue, rien n'est écrit du tout : une page affichée dans la langue de votre navigateur a été appariée sur le moment, puis oubliée.

Tout cookie ou identifiant similaire que vous pourriez trouver ici appartient à Google et est posé par les scripts publicitaires et d'analytique décrits ci-dessus. Ils servent à mesurer les visites, et à choisir et plafonner les annonces.

### Comment tout désactiver

- La personnalisation des annonces peut être désactivée, pour tous les sites d'un coup, dans [Mon centre de préférences pour les annonces](https://myadcenter.google.com/).
- Google Analytics peut être bloqué partout avec le [module de désactivation pour navigateur](https://tools.google.com/dlpage/gaoptout) de Google.
- Les réglages de votre propre navigateur peuvent bloquer ou effacer les cookies tiers, et n'importe quel bloqueur de contenu empêchera ces scripts de se charger tout court.

Tout bloquer nous convient très bien. **Chaque outil de ce site fonctionne avec les scripts bloqués, et fonctionne avec le réseau entièrement débranché.** Rien ici n'est retenu derrière une annonce.

## Vos droits sur les données

Nous ne détenons aucune donnée personnelle sur vous : il n'y a donc rien que nous puissions vous montrer, corriger, exporter ou supprimer, et une demande qui nous serait adressée reviendrait honnêtement vide.

Les données décrites ci-dessus sont détenues par Google, qui en est son propre responsable de traitement. Les demandes à leur sujet doivent lui être adressées, via [votre compte Google](https://myaccount.google.com/) ou ses contacts en matière de confidentialité.

## Les enfants

Ce site ne s'adresse pas aux enfants et ne demande son âge à personne, parce qu'il ne demande rien à personne. Nous ne collectons sciemment aucune donnée personnelle, de qui que ce soit, à tout âge.

## Modifications, et comment nous joindre

Si cette page change, la date en haut change avec elle, et la modification figure dans l'historique public des commits, comme tout le reste.

Les questions sur tout cela peuvent aller à [hi@abox.tools](mailto:hi@abox.tools), ou être posées comme ticket sur [le dépôt](https://github.com/A-Box-of-Tools/website), où la réponse est visible par tous ceux qui se posent la même question.
