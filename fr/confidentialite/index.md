# Confidentialité & cookies

Les fichiers sont traités localement. Partage volontaire et fonctions réseau facultatives ont leurs limites propres. Cette page explique ces limites, ainsi que publicité, mesure d’utilisation, avis facultatifs, stockage et hébergement.

Dernière mise à jour 23 octobre 2026

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

Les boutons de messagerie et de partage préparent rapports et copies JPEG localement, puis téléchargent un fichier de message ou les remettent à l’application choisie. Cette page n’envoie pas de courriel. Application, prestataire et destinataire choisis gèrent la suite selon leurs politiques. [Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/), [Partager un onglet du navigateur](https://abox.tools/fr/share-tab/) et [Caméra distante](https://abox.tools/fr/remote-camera/) envoient volontairement du contenu à un autre navigateur ; les métadonnées sont décrites ci-dessous.

## Ce qui est collecté, et par qui

Ce site est gratuit et il est payé par la publicité. Cela veut dire que deux produits Google tournent sur ces pages, et qu'un bouton de don tourne sur la plupart d'entre elles. Voici la liste entière.

### Google AdSense — les annonces

Google sert les annonces et décide de celles que vous voyez. Pour cela, il peut poser et lire des cookies ou des identifiants similaires dans votre navigateur, et il reçoit votre adresse IP, une localisation approximative qui en découle, votre agent utilisateur, et la page sur laquelle vous étiez. Selon vos réglages et l'endroit où vous vous trouvez, les annonces peuvent être personnalisées à partir d'un profil que Google détient sur vous, bâti pour l'essentiel sur votre activité sur d'autres sites.

Nous ne recevons rien de tout cela, nous ne pouvons pas le voir, et nous n'envoyons jamais à Google quoi que ce soit sur vos fichiers. L'exposé de Google sur la façon dont il utilise les données des sites qui affichent ses annonces se trouve sur [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — visites et utilisations réussies

Nous utilisons Google Analytics 4 pour compter les visites de pages et les utilisations réussies, afin de savoir quels outils méritent qu’on y travaille. Il enregistre la page consultée, le moment approximatif, un identifiant aléatoire stocké dans votre navigateur, une localisation approximative, le type de votre appareil et de votre navigateur ainsi que les paramètres habituels d’attribution des campagnes.

L’adresse transmise à Analytics utilise l’URL canonique de la page et uniquement les paramètres habituels de campagne. Les autres paramètres de requête et les fragments d’adresse sont omis. Le titre de la page est fixe et le site référent est réduit à son origine, sans chemin ni requête.

Nous comptons la première utilisation réussie par chargement de page, par exemple demander un téléchargement prêt, terminer une copie ou afficher une analyse ou une vue exploitable dans un outil d’inspection. La seule donnée propre à l’outil ajoutée à cet événement est son identifiant fixe. Cela ne confirme pas que votre système d’exploitation a enregistré un téléchargement.

Nous comptons aussi les ouvertures de pages d’outils. Pour Images to Video, Image Stacker, GIF Analyzer et GIF Splitter, des événements fixes signalent un apport de données, le début du traitement, un résultat prêt, un problème ou une annulation, au maximum une fois par étape et par chargement de page. Les exemples intégrés sont exclus de ces étapes. Certains liens de continuation transmettent uniquement les identifiants fixes des pages de départ et d’arrivée, jamais l’adresse ni le texte du lien. Ces compteurs aident à repérer où une visite s’arrête ; ils n’identifient pas des tâches individuelles et ne confirment pas l’arrivée sur la page suivante.

Les avis facultatifs enregistrent l’identifiant fixe de l’outil, une réponse fixe positive ou négative et un motif fixe après votre choix. Aucun champ de texte libre n’est proposé. Les outils ne joignent à aucun des deux enregistrements de fichiers, noms, contenus, textes saisis, nombres, tailles, dimensions, formats, réglages, messages d’erreur ou autres détails d’entrée ou de sortie. Nous pouvons consulter des rapports Analytics agrégés. Bloquer Analytics laisse le traitement local disponible, y compris hors ligne une fois le cache de l’outil prêt.

### Buy Me a Coffee — le bouton de don

La page d'accueil et les pages d'outils portent un bouton de don, qui se charge depuis les serveurs de Buy Me a Coffee. Le charger implique que leur CDN voie votre adresse IP et sache que vous étiez sur ce site, et le lettrage du bouton est récupéré sur Google Fonts, qui voit lui aussi votre adresse IP. Rien d'autre n'est transmis, et rien de plus ne se passe tant que vous ne cliquez pas réellement dessus ; à ce moment-là, vous êtes sur leur site, sous leurs conditions. Cette page et la [page des conditions](https://abox.tools/fr/conditions-d-utilisation/) ne dessinent pas le bouton.

### Hébergement

Le site est servi par GitHub Pages, derrière Cloudflare. Comme tout hébergeur web, ils traitent les requêtes que fait votre navigateur, ce qui comprend votre adresse IP, la page demandée et votre agent utilisateur, afin de livrer la page et de garder le service debout et sûr. Nous n'avons accès aux journaux par visiteur d'aucun des deux.

### Choix de connexion des outils appairés

Les cinq outils d’appairage démarrent en Direct. L’hôte peut choisir Cloud relay avant de commencer ; l’invitation porte ce choix et l’autre personne le voit avant de se connecter. Direct ne bascule jamais automatiquement vers un relais. Cloudflare TURN transmet les textes, fichiers, vidéos, sons et messages de contrôle chiffrés sans leurs clés de déchiffrement, mais voit les adresses, horaires et volumes de trafic. Les deux appareils ont besoin d’internet pendant toute la session. Les identifiants temporaires restent en mémoire du navigateur et sont renouvelés par le service de mise en relation, sans être publiés dans les liens ou listes. Une liste peut afficher le mode choisi. Approbation, mot de passe et commandes du microphone restent en vigueur.

Les cinq outils proposent les connexions disponibles dans le réseau local ou dans un groupe privé. Un même code de groupe généré aléatoirement permet de trouver des sessions depuis des réseaux différents. Chaque outil possède sa propre liste, et les sessions du groupe ne sont pas aussi publiées dans la liste du réseau local. Le code permet la recherche, pas l’accès : les mots de passe, l’approbation de l’hôte et le mode de connexion choisi restent applicables. Le service reçoit le code dans une connexion chiffrée pour vérifier l’appartenance au groupe, puis ne conserve qu’un identifiant dérivé et le résultat sur les connexions ouvertes. Les adresses des requêtes et leurs journaux de métadonnées conservés sept jours contiennent cet identifiant, jamais le code. La page garde le code uniquement en mémoire, l’exclut des invitations et rapports de connexion, puis l’oublie au rechargement. Les scripts normaux de la page peuvent lire ses champs ; un groupe privé ne les isole pas. Toute personne ayant le code peut trouver les sessions proposées au groupe : ne le partagez qu’avec les personnes prévues.

### Partager un onglet du navigateur

[Partager un onglet du navigateur](https://abox.tools/fr/share-tab/) utilise le sélecteur d’un navigateur de bureau pour capturer un onglet et transmettre sa vidéo en direct à un spectateur approuvé. Le spectateur demande l’accès, l’hôte l’approuve et le spectateur le confirme avant l’envoi de vidéo. Il n’y a ni capture de son, de caméra ou de microphone. Les informations visibles dans l’onglet choisi sont partagées ; le spectateur peut enregistrer ce qu’il reçoit.

La découverte à proximité en ligne est désactivée par défaut. L’hôte peut activer Show in nearby shared tabs avant de démarrer ; le spectateur choisit expressément Find nearby tabs pour ouvrir la liste. La connexion de découverte n’affiche que le code d’invitation aléatoire, jamais le titre, l’adresse ou l’image de l’onglet capturé, ni la note du spectateur. Join à côté d’un résultat envoie la demande par le mode indiqué. Sans preuve d’approbation valide, l’approbation reste nécessaire. Un lien copié attend toujours Request to watch. Le service regroupe les pages de cet outil par adresse IPv4 publique ou sous-réseau IPv6 /64 et origine du site, pas par emplacement physique. Une passerelle partagée ou un VPN peut inclure des inconnus ou masquer des appareils proches. Les entrées existent sur les connexions ouvertes sans historique enregistré, et l’arrêt retire celle de l’hôte.

En mode Direct, la vidéo utilise une connexion directe chiffrée sur un réseau local joignable, sans STUN public ni TURN. Les deux appareils ont besoin d’internet pour la découverte et l’appairage. Le rendez-vous voit les codes de salle, adresses IP, horaires, descriptions WebRTC et candidats de connexion, mais pas la vidéo, les notes du spectateur ni les décisions d’approbation. Cloudflare conserve les journaux de métadonnées de connexion pendant sept jours.

Les scripts habituels de la page peuvent lire son adresse et son état, dont un code d’invitation ; un lien seul ne donne jamais accès à la vidéo. Le spectateur ne peut ni contrôler l’hôte ni sélectionner du texte de la page. L’outil ne propose pas d’enregistrement, mais le contenu visible d’une session connectée fait partie de l’image et le spectateur peut le capturer ou l’enregistrer lui-même. La page explique les limites du réseau ; des adresses locales ne prouvent pas une frontière physique du réseau.

### Caméra distante et présentation des navigateurs

[Caméra distante](https://abox.tools/fr/remote-camera/) ouvre une connexion WebSocket de découverte au chargement de sa page. Démarrer ou Connecter ajoute une connexion à notre service de mise en relation pour la salle concernée. Join à côté d’une caméra demande la connexion et échange les adresses réseau par le mode indiqué. Lorsqu’un lien de visionnage est ouvert, la page attend toujours un clic sur Connecter. L’approbation des spectateurs par l’hôte est activée par défaut et contrôle la transmission vidéo et audio, pas l’échange des adresses réseau. Le rendez-vous voit codes, adresses, horaires et messages de configuration, jamais vidéo, audio ni notes. En mode Direct, la vidéo et l’audio activé utilisent une connexion directe chiffrée sans STUN ni TURN configuré et sans enregistrement. L’audio est désactivé par défaut ; l’hôte ne demande l’accès au microphone qu’après avoir choisi de partager l’audio. Internet reste nécessaire pour la présentation. VPN et règles du système peuvent influencer le routage ; le mode local ne prouve pas une frontière physique. La page décrit ces limites et l’accès des scripts à l’adresse complète du lien.

Les alertes facultatives analysent de petites images vidéo et l’audio reçu sur l’appareil du spectateur, sans enregistrement ni envoi. Leur activation demande l’autorisation des notifications du navigateur. Le navigateur et le système affichent des avis génériques sans image, audio, nom du lien ni note du spectateur. La déconnexion arrête l’analyse et ferme les notifications de cette session. La page doit rester ouverte ; le navigateur peut suspendre l’analyse en arrière-plan ou pendant la veille.

### Partager du texte et des fichiers et le rendez-vous

[Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/) ouvre une connexion de découverte à l’accueil et une autre au partage. Les noms sont regroupés par IPv4 publique ou sous-réseau IPv6 et origine de page ; c’est une aide à la découverte, pas une preuve du même réseau physique. Le rendez-vous voit noms, IP, horaires et négociation, jamais texte ni fichiers partagés. Les noms publiés vivent sur les connexions ouvertes sans stockage durable. Direct ordinaire utilise les STUN publics de Google et Cloudflare, qui voient l’adresse de la requête. Réseau local limite Direct aux adresses hôtes sans STUN ni TURN. Cloud relay est un choix distinct fait par l’hôte avant le partage et accepté par le lecteur avant la connexion. Tous les modes nécessitent le service public de mise en relation pour établir la connexion. Cloudflare conserve sept jours les métadonnées de connexion du partage et de la caméra ; nous pouvons lire ces journaux par visiteur. Les copies déjà faites par le destinataire restent les siennes après fermeture de l’onglet source.

## Cookies

Nous ne définissons aucun cookie de connexion ou session. Les scripts Google peuvent utiliser les cookies et identifiants décrits. Le site utilise également le stockage local pour les préférences et le travail temporaire.

**Approbations de connexion.** Les cinq outils conservent des identifiants de reconnexion aléatoires dans le stockage local pour un nombre limité de combinaisons récentes d’outil, de salle et de mode de connexion. Ils ne contiennent ni contenu partagé, ni noms, ni adresses IP. Partager du texte, Partager un onglet et Caméra distante présentent leurs preuves d’approbation uniquement par la connexion chiffrée entre navigateurs ; les outils vocaux envoient leur clé personnelle au service de mise en relation lors de la connexion. L’approbation vaut pour la session actuelle de l’hôte : une déconnexion la conserve, une exclusion la révoque et l’arrêt ou une nouvelle session la réinitialise. Effacer ou bloquer le stockage peut imposer une nouvelle approbation. Les scripts de toute page de cette origine web, y compris ceux de tiers, peuvent accéder à ces identifiants. Ils ne sont pas isolés des scripts et ne figurent ni dans les invitations ni dans les listes de découverte.

**La langue que vous choisissez.** Si vous prenez une langue dans le sélecteur, ce choix est écrit dans le stockage local de votre navigateur, sous le nom `abox-lang`, pour que la page suivante s'ouvre dans la langue demandée. Ce n'est pas un cookie : il ne nous est jamais transmis, ni à personne d'autre, il reste sur l'appareil depuis lequel vous lisez ceci, et effacer les données de site de votre navigateur le supprime. Si vous ne choisissez jamais de langue, rien n'est écrit du tout : une page affichée dans la langue de votre navigateur a été appariée sur le moment, puis oubliée.

**Autres données locales.** Les avis conservent l’heure d’une réponse ou fermeture pour ne pas redemander. Les outils peuvent garder des réglages ou un brouillon de partage facultatif. Changer de langue ou poursuivre volontairement dans un autre outil peut stocker temporairement fichiers et réglages dans IndexedDB. Ce ne sont pas des cookies et ils ne nous sont pas envoyés ; effacer les données du site les supprime. L’outil concerné explique les brouillons persistants.

Les cookies et identifiants Google mesurent les visites et l’utilisation des outils, choisissent les publicités et limitent leur répétition. Ils sont distincts des données locales du site décrites ci-dessus.

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
