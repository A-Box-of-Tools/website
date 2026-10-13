# Confidentialité & cookies

Les fichiers sont traités localement. Partage volontaire et fonctions réseau facultatives ont leurs limites propres. Cette page explique ces limites, ainsi que publicité, avis, stockage et hébergement.

Dernière mise à jour 12 octobre 2026

## Vos fichiers

Les fichiers choisis sont lus, modifiés et écrits dans le navigateur de votre appareil. abox.tools n’a ni point d’envoi pour traiter vos fichiers ni base de données les conservant. Les téléchargements sont préparés localement. Partager, voir une caméra distante ou transmettre un rapport à une autre application sont des transferts volontaires, décrits ci-dessous.

Le traitement local ne nous transmet pas :

- vos fichiers ni leurs aperçus
- leurs noms, tailles, dimensions ou formats
- leur contenu, y compris EXIF, GPS et texte reconnu

Chaque page porte une `Content-Security-Policy` limitant les ressources et destinations. Certains outils ajoutent le rendez-vous ou l’API de change facultative. La politique n’inspecte pas les données transmises à un hôte autorisé et `connect-src` ne décrit pas le trafic WebRTC entre pairs. Lisez-la avec le code et observez la fonction utilisée ; la liste d’hôtes ne prouve pas chaque contenu envoyé.

Les fichiers que vous produisez avec un outil sont remis au mécanisme de téléchargement de votre propre navigateur et enregistrés là où vous le lui dites. Nous ne sommes pas non plus impliqués dans cette étape.

## Les fonctions qui utilisent volontairement une connexion

[Images en vidéo](https://abox.tools/fr/images-en-video/) peut récupérer une image à l’adresse fournie. Le serveur reçoit votre IP et l’URL demandée, paramètres compris. L’image est placée en mémoire locale puis réencodée pour le traitement. Cette requête n’envoie pas de fichiers choisis sur votre appareil.

L’[extracteur de reçus et factures](https://abox.tools/fr/extraire-recus-factures/) lit les photos et reconnaît le texte localement. Son bouton facultatif de taux historique demande une paire de devises et la date choisie à [Frankfurter](https://frankfurter.dev/). La date peut être celle du reçu. Le prestataire voit votre IP et la requête ; identifiants et référent sont omis, et elle ne contient ni photo, nom, commerçant, montant ni adresse de messagerie. Les taux manuels ne font aucune requête.

Les boutons de messagerie et de partage préparent rapports et copies JPEG localement, puis téléchargent un fichier de message ou les remettent à l’application choisie. Cette page n’envoie pas de courriel. Application, prestataire et destinataire choisis gèrent la suite selon leurs politiques. [Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/) et [Caméra distante](https://abox.tools/fr/remote-camera/) envoient volontairement du contenu à un autre navigateur ; les métadonnées sont décrites ci-dessous.

## Ce qui est collecté, et par qui

Ce site est gratuit et il est payé par la publicité. Cela veut dire que deux produits Google tournent sur ces pages, et qu'un bouton de don tourne sur la plupart d'entre elles. Voici la liste entière.

### Google AdSense — les annonces

Google sert les annonces et décide de celles que vous voyez. Pour cela, il peut poser et lire des cookies ou des identifiants similaires dans votre navigateur, et il reçoit votre adresse IP, une localisation approximative qui en découle, votre agent utilisateur, et la page sur laquelle vous étiez. Selon vos réglages et l'endroit où vous vous trouvez, les annonces peuvent être personnalisées à partir d'un profil que Google détient sur vous, bâti pour l'essentiel sur votre activité sur d'autres sites.

Nous ne recevons rien de tout cela, nous ne pouvons pas le voir, et nous n'envoyons jamais à Google quoi que ce soit sur vos fichiers. L'exposé de Google sur la façon dont il utilise les données des sites qui affichent ses annonces se trouve sur [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — le compteur de visites

Nous utilisons Google Analytics 4 pour compter les visites de pages, afin de savoir quels outils méritent qu'on y travaille. Il enregistre la page consultée, à peu près quand, un identifiant tiré au hasard et stocké dans votre navigateur, une localisation approximative, le type de votre appareil et de votre navigateur, et le site qui vous a envoyé ici.

`analytics.js` configure les vues de pages. Après votre réponse facultative, `feedback.js` envoie aussi un événement `tool_feedback` : identifiant de l’outil, réponse fixe positive ou négative et motif fixe. Aucun texte libre, fichier, nom, taille, dimension, nombre, format ou contenu n’y figure. Nous pouvons consulter des rapports Analytics agrégés. Le blocage laisse le traitement local disponible.

### Buy Me a Coffee — le bouton de don

La page d'accueil et les pages d'outils portent un bouton de don, qui se charge depuis les serveurs de Buy Me a Coffee. Le charger implique que leur CDN voie votre adresse IP et sache que vous étiez sur ce site, et le lettrage du bouton est récupéré sur Google Fonts, qui voit lui aussi votre adresse IP. Rien d'autre n'est transmis, et rien de plus ne se passe tant que vous ne cliquez pas réellement dessus ; à ce moment-là, vous êtes sur leur site, sous leurs conditions. Cette page et la [page des conditions](https://abox.tools/fr/conditions-d-utilisation/) ne dessinent pas le bouton.

### Hébergement

Le site est servi par GitHub Pages, derrière Cloudflare. Comme tout hébergeur web, ils traitent les requêtes que fait votre navigateur, ce qui comprend votre adresse IP, la page demandée et votre agent utilisateur, afin de livrer la page et de garder le service debout et sûr. Nous n'avons accès aux journaux par visiteur d'aucun des deux.

### Caméra distante et présentation des navigateurs

[Caméra distante](https://abox.tools/fr/remote-camera/) ouvre une connexion WebSocket de découverte au chargement de sa page. Démarrer, Connecter ou sélectionner une caméra en ligne ajoute une connexion à notre service de mise en relation pour la salle concernée. Sélectionner un nom dans la liste demande immédiatement une connexion et échange les adresses réseau. Lorsqu’un lien de visionnage est ouvert, la page attend toujours un clic sur Connecter. L’approbation des spectateurs par l’hôte est activée par défaut et contrôle la transmission vidéo, pas l’échange des adresses réseau. Le rendez-vous voit codes, adresses, horaires et messages de configuration, jamais vidéo ni notes. La vidéo utilise une connexion directe chiffrée sans STUN ni TURN configuré, sans microphone ni enregistrement. Internet reste nécessaire pour la présentation. VPN et règles du système peuvent influencer le routage ; le mode local ne prouve pas une frontière physique. La page décrit ces limites et l’accès des scripts à l’adresse complète du lien.

### Partager du texte et des fichiers et le rendez-vous

[Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/) ouvre une connexion de découverte à l’accueil et une autre au partage. Les noms sont regroupés par IPv4 publique ou sous-réseau IPv6 et origine de page ; c’est une aide à la découverte, pas une preuve du même réseau physique. Le rendez-vous voit noms, IP, horaires et négociation, jamais texte ni fichiers partagés. Les noms publiés vivent sur les connexions ouvertes sans stockage durable. Le mode ordinaire utilise les STUN publics de Google et Cloudflare. Un lecteur peut choisir de réessayer par le relais TURN Cloudflare, qui transmet le trafic chiffré sans ses clés. Le mode local omet STUN et TURN mais nécessite toujours le rendez-vous public. Cloudflare conserve sept jours les métadonnées de connexion du partage et de la caméra ; nous pouvons lire ces journaux par visiteur. Les copies déjà faites par le destinataire restent les siennes après fermeture de l’onglet source.

## Cookies

Nous ne définissons aucun cookie de connexion ou session. Les scripts Google peuvent utiliser les cookies et identifiants décrits. Le site utilise également le stockage local pour les préférences et le travail temporaire.

**La langue que vous choisissez.** Si vous prenez une langue dans le sélecteur, ce choix est écrit dans le stockage local de votre navigateur, sous le nom `abox-lang`, pour que la page suivante s'ouvre dans la langue demandée. Ce n'est pas un cookie : il ne nous est jamais transmis, ni à personne d'autre, il reste sur l'appareil depuis lequel vous lisez ceci, et effacer les données de site de votre navigateur le supprime. Si vous ne choisissez jamais de langue, rien n'est écrit du tout : une page affichée dans la langue de votre navigateur a été appariée sur le moment, puis oubliée.

**Autres données locales.** Les avis conservent l’heure d’une réponse ou fermeture pour ne pas redemander. Les outils peuvent garder des réglages ou un brouillon de partage facultatif. Changer de langue ou poursuivre volontairement dans un autre outil peut stocker temporairement fichiers et réglages dans IndexedDB. Ce ne sont pas des cookies et ils ne nous sont pas envoyés ; effacer les données du site les supprime. L’outil concerné explique les brouillons persistants.

Les cookies et identifiants Google mesurent les visites, choisissent les publicités et limitent leur répétition. Ils sont distincts des données locales du site décrites ci-dessus.

### Comment tout désactiver

- La personnalisation des annonces peut être désactivée, pour tous les sites d'un coup, dans [Mon centre de préférences pour les annonces](https://myadcenter.google.com/).
- Google Analytics peut être bloqué partout avec le [module de désactivation pour navigateur](https://tools.google.com/dlpage/gaoptout) de Google.
- Les réglages de votre propre navigateur peuvent bloquer ou effacer les cookies tiers, et n'importe quel bloqueur de contenu empêchera ces scripts de se charger tout court.

Bloquer publicité, Analytics et don laisse le traitement local disponible. Avec le cache hors ligne prêt, il fonctionne déconnecté. Images web, taux en ligne, présentation entre navigateurs et envoi par une autre application nécessitent leurs connexions respectives. Aucune fonction de traitement n’est conditionnée à une publicité.

## Vos droits sur les données

Nous ne conservons pas vos fichiers traités. Les rapports Analytics et métadonnées de connexion sont des données distinctes. Vos questions ou demandes sur leur traitement peuvent aller à [hi@abox.tools](mailto:hi@abox.tools) ; indiquez page et date approximative sans joindre de fichier privé.

Pour les données de votre compte Google, utilisez [les contrôles du compte](https://myaccount.google.com/) ou les contacts de confidentialité Google. Les prestataires facultatifs de change, don et messagerie gèrent leurs propres services et demandes.

## Les enfants

Le site ne s’adresse pas aux enfants et ne demande ni âge ni compte utilisateur. Les informations automatiques de pages et de connexions décrites concernent les visiteurs de tout âge.

## Modifications, et comment nous joindre

Si cette page change, la date en haut change avec elle, et la modification figure dans l'historique public des commits, comme tout le reste.

Les questions sur tout cela peuvent aller à [hi@abox.tools](mailto:hi@abox.tools), ou être posées comme ticket sur [le dépôt](https://github.com/A-Box-of-Tools/website), où la réponse est visible par tous ceux qui se posent la même question.
