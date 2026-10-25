# Partager du texte et des fichiers

Partagez du texte et des fichiers chiffrés depuis votre navigateur ouvert. La connexion directe est choisie par défaut, le relais cloud est facultatif. Vous approuvez chaque lecteur.

> Partagez du texte et des fichiers chiffrés depuis votre navigateur ouvert. La connexion directe est choisie par défaut, le relais cloud est facultatif. Vous approuvez chaque lecteur.

Cette page est un outil interactif de navigateur à l’adresse https://abox.tools/fr/partager-du-texte/. Les fichiers sont traités sur l’appareil qui exécute ce navigateur. Tout partage volontaire ou fonction réseau facultative est expliqué sur la page. Voici son explication écrite ; ouvrez l’adresse pour l’utiliser.

## Vos textes et fichiers partagés sont **traités dans votre navigateur**. Aucun envoi pour traitement.

Le texte et les fichiers sont chiffrés entre votre navigateur et chaque lecteur. La connexion directe est choisie par défaut. Si vous choisissez le relais cloud, les paquets chiffrés passent par Cloudflare, qui ne peut pas lire leur contenu. Le service de mise en relation transporte la préparation et les noms de liens visibles, jamais les textes ou fichiers. Nous ne stockons aucun contenu partagé sur un serveur. Fermer l’onglet termine la source ; les lecteurs effacent leur vue après l’avis de fin ou la détection d’une panne. Les copies déjà enregistrées leur restent.

- ✗ Aucun contenu stocké sur un serveur
- ✗ Pas de compte
- ✓ Chiffré de bout en bout
- ✓ S'arrête avec votre onglet
- ✓ Code ouvert

## Comment partager du texte et des fichiers entre navigateurs

1. **Écrivez le texte, ou joignez les fichiers.** L'éditeur est le partage : ce qu'il contient quand un lecteur se connecte est ce qu'il reçoit, et toute modification atteint ensuite les lecteurs connectés en direct, pendant que vous tapez. Les fichiers voyagent par le même canal, jusqu'à 200 Mo pièce ; les lecteurs voient la liste et ne récupèrent que ce qu'ils demandent — personne ne dépense de bande passante pour un fichier dont il ne voulait pas.
2. **Activez Markdown si le texte mérite une mise en forme.** Un seul interrupteur. Titres, gras, listes, code et liens se rendent en direct à côté de l'éditeur pendant la frappe, et les lecteurs reçoivent la vue mise en forme par défaut, avec un bouton pour revenir à la source. Le moteur de rendu est livré avec cette page et échappe tout : un texte partagé ne peut pas devenir un script sur la machine d'un lecteur, quel qu'en soit l'auteur.
3. **Nommez le lien, ou gardez la suggestion.** Le nom est l’adresse : `brave-otter-42` peut se dire à travers une pièce, au téléphone ou se recopier d’un tableau. Les partages locaux visibles affichent leur nom ; gardez donc Privé activé pour les contenus sensibles. Pour un partage accessible uniquement par lien, un nom difficile à deviner est aussi utile. Un nom déjà utilisé par un partage actif est refusé et se libère dès que vous arrêtez.
4. **Décidez qui entre.** Privé est le réglage par défaut : chaque lecteur est invité à se présenter — un nom, un indice, n'importe quoi que vous reconnaîtriez — et vous voyez le message avec un bouton pour le laisser lire ou l'éconduire. La présentation voyage par le canal direct, si bien que même l'entremetteur ignore qui a frappé. Décochez pour un partage ouvert, lisible par quiconque a le nom.
5. **Lancez le partage, et laissez l'onglet ouvert.** L’onglet est le serveur. Gardez-le ouvert et l’appareil éveillé pour partager sans interruption. Une connexion fonctionnelle reste ouverte lorsque la page est masquée, mais le téléphone ou un ordinateur en veille peut suspendre le navigateur. Au retour, la page tente de retrouver le même partage. Arrêter le partage empêche sa reprise automatique. Copiez le lien ou donnez le nom : le lecteur peut ajouter `#name` à l’adresse de cette page. En mode Réseau local, copiez le lien contenant `?local=1` avant le nom. Un changement de mode de connexion exige le choix du lecteur.
6. **De l'autre côté : consentir, puis frapper.** Qui ouvre le lien apprend que quelqu'un partage, est prévenu qu'une connexion directe montre à chaque bout l'adresse réseau de l'autre, et ne se connecte que par choix. Sur un partage privé, il se présente et vous attend. Ce qu'il reçoit se met à jour en direct pendant que vous écrivez, et disparaît quand vous fermez l'onglet.

## La version longue

[Comment partager du texte et des fichiers sans copie stockée sur un serveur](https://abox.tools/fr/guides/partager-du-texte-entre-appareils/): Partagez du texte et des fichiers entre navigateurs, directement par défaut ou avec un relais chiffré via Cloudflare. Sans compte ni copie stockée sur le serveur ; les destinataires peuvent garder leurs propres copies.

## Aussi dans la boîte

- [Compresseur d'images](https://abox.tools/fr/compresser-une-image/): Vous donnez la taille. Il se charge du reste.
- [Redimensionneur d'images](https://abox.tools/fr/redimensionner-une-image/): Vous dites la taille. Vous tracez le cadre. Vous choisissez le format.
- [HEIC vers JPG](https://abox.tools/fr/convertir-heic-en-jpg/): Les photos que fait un iPhone, dans un format que tout ouvre.
- [WebP en JPG](https://abox.tools/fr/convertir-webp-en-jpg/): Les images que le Web enregistre, dans le format que tout accepte encore.

## Questions

### Quelque chose est-il téléversé, quelque part ?

Le texte et les fichiers sont chiffrés entre votre navigateur et chaque lecteur. La connexion directe est choisie par défaut. Si vous choisissez le relais cloud, les paquets chiffrés passent par Cloudflare, qui ne peut pas lire leur contenu. Le service de mise en relation transporte la préparation et les noms de liens visibles, jamais les textes ou fichiers. Nous ne stockons aucun contenu partagé sur un serveur. Fermer l’onglet termine la source ; les lecteurs effacent leur vue après l’avis de fin ou la détection d’une panne. Les copies déjà enregistrées leur restent. Cloudflare conserve les métadonnées des connexions de mise en relation pendant sept jours ; notre application ne journalise aucun contenu partagé.

### Alors pourquoi cet outil parle-t-il à un serveur, sur ce site précisément ?

Parce que deux navigateurs ne se trouvent pas seuls : l’entremetteur rapproche la personne qui a saisi `brave-otter-42` et celle qui partage sous ce nom, puis transmet la négociation. Il est nommé dans la `Content-Security-Policy` de cette page, et son code est dans le même dépôt. Il liste aussi les noms de lien locaux publiés pour les navigateurs utilisant la même adresse IPv4 publique ou le même sous-réseau IPv6. Il ne détient aucun contenu et ne peut pas lire le canal chiffré entre navigateurs.

### Que peut voir ce serveur, exactement ?

Il voit les noms de lien utilisés, les arrivées et départs des personnes qui partagent et des lecteurs, leurs adresses IP et la négociation. L’annuaire groupe les noms publiés selon l’adresse IPv4 publique ou le sous-réseau IPv6 et l’origine de la page. Il ne voit ni texte, ni fichiers, ni leurs noms ou tailles, ni admissions privées, ni présentations. Tout cela passe par le canal chiffré de bout en bout entre navigateurs. Cloudflare garde les journaux de connexion sept jours : nom de lien, adresse et heure, jamais de contenu.

### Que se passe-t-il quand je ferme l'onglet ?

Le partage prend fin lorsque son unique source disparaît. Les lecteurs effacent la copie affichée lorsqu’ils détectent la fin ou une panne de connexion. Arrêter le partage envoie un avis explicite de fin ; une perte temporaire du réseau peut déclencher un nombre limité de tentatives de reconnexion. Il n’existe aucune copie sur le serveur à supprimer. Ce que les lecteurs ont déjà copié ou téléchargé leur reste acquis.

### Un lecteur peut-il garder ce que j'ai partagé ?

Tant que le partage est ouvert, oui — c'est cela, partager. Un lecteur peut copier le texte ou télécharger un fichier, et ce qu'il a pris est à lui, exactement comme si vous le lui aviez remis par n'importe quel autre moyen. Ce que garantit l'arrêt, c'est l'avenir : personne de nouveau n'y accède, et les pages ouvertes cessent de l'afficher. Aucun outil ne peut rappeler ce qui est déjà arrivé, et cette page ne prétend pas le contraire.

### Qu'est-ce que le mode privé ?

Le réglage par défaut. Chaque lecteur qui arrive apprend que le partage est privé et est invité à se présenter ; vous voyez le message — « c'est Alice, du stand-up » — avec des boutons pour le laisser lire ou l'éconduire, et rien n'est envoyé avant votre décision. La présentation voyage par le canal direct déjà chiffré, si bien que le serveur ne sait jamais qui a frappé ni ce que vous avez décidé. Décoché avant le partage, cela donne un partage ouvert.

### Pourquoi le lecteur verra-t-il mon adresse IP ?

La connexion directe échange les adresses réseau nécessaires pour joindre les appareils. Le relais cloud utilise des adresses de relais ; Cloudflare voit les adresses des deux appareils et les métadonnées du trafic. Ce n’est pas une garantie d’anonymat. Vérifiez le type de connexion indiqué. Choisissez Rejoindre dans la liste ou Se connecter après avoir ouvert une invitation ordinaire.

### Quelle taille pour les fichiers, et quelle vitesse ?

Jusqu’à 200 Mo par fichier. La vitesse dépend des deux appareils et du chemin réseau. La connexion directe peut atteindre la vitesse du réseau local ; le relais cloud dépend aussi du débit internet et des limites du service. Les lecteurs récupèrent les fichiers à la demande.

### Cela fonctionne-t-il hors ligne ?

Une fois la page enregistrée, l’éditeur permet d’écrire, d’afficher le Markdown et de conserver un brouillon sans internet. Pour partager, les deux appareils ont besoin d’internet afin que le service de mise en relation connecte les navigateurs. Enregistrer la page ne permet pas l’appairage hors ligne. Le mode réseau local a lui aussi besoin de cette mise en relation, même si le contenu passe directement entre les navigateurs.

### Et si nous n'arrivons pas à nous connecter ?

Vérifiez internet sur les deux appareils. Pour Réseau local, le Wi-Fi ou Ethernet doit autoriser les communications entre appareils. Si la connexion directe échoue, l’hôte peut arrêter, choisir le relais cloud, redémarrer et envoyer la nouvelle invitation. Le lecteur vérifie ce choix avant de se connecter. Un partage direct en cours ne change jamais automatiquement. Les appareils gérés ou les réseaux restrictifs peuvent aussi bloquer le relais.

### Le rendu Markdown est-il sûr, si n'importe qui peut partager n'importe quoi ?

Cette question est la raison pour laquelle le moteur de rendu tient en quatre-vingts lignes dans le code de cette page plutôt que dans une bibliothèque. Chaque caractère est échappé avant qu'aucune balise ne soit émise, seul un jeu fixe de balises inoffensives peut être produit, et les liens n'acceptent que `http`, `https` et `mailto` — un lien `javascript:` reste du texte inerte. Un texte partagé ne peut pas devenir un script sur votre machine, quel qu'en soit l'auteur, et les quatre-vingts lignes se lisent.

### Deux personnes peuvent-elles partager sous le même nom ?

Pas en même temps. Un partage vivant par nom, imposé chez l'entremetteur : qui arrive en second est refusé et invité à choisir un autre nom. Dès qu'un partage s'arrête, son nom redevient libre — ce qui veut aussi dire qu'un lien conservé ne vaut que ce que vaut le partage derrière : le même nom, la semaine prochaine, peut appartenir à quelqu'un d'autre. Traitez un lien comme appartenant à un moment, pas à une personne.

### Est-ce gratuit, et faut-il un compte ?

Gratuit, sans compte, sans inscription, et sans limite digne d'être mentionnée — seize lecteurs simultanés par partage. Le site porte de la publicité, qui le finance ; les annonces ne reçoivent rien de ce que cette page partage, et l'entremetteur tient largement dans une offre gratuite, précisément parce qu'il ne stocke rien et ne fait presque rien.

### Puis-je partager des fichiers sur mon réseau local ?

Oui. Avant de commencer, choisissez Réseau local — sans relais internet, connectez les deux appareils au même réseau Wi-Fi ou Ethernet et copiez le lien pour le lecteur. Le lien inclut le mode ; un lecteur utilisant un autre mode doit choisir explicitement avant de réessayer avec celui de la personne qui partage. Internet reste nécessaire pour mettre les navigateurs en relation. Ce mode n’utilise pas de découverte publique d’adresses et ne passe jamais à un relais internet. Un VPN ou les règles réseau du navigateur peuvent modifier le trajet ou empêcher la connexion ; ce réglage ne prouve pas que les données restent dans un bâtiment. L’approbation privée reste activée par défaut et les fichiers restent limités à 200 Mo chacun. Un partage peut contenir jusqu’à 256 fichiers. Visible est activé par défaut dans ce mode : l’autre navigateur peut ouvrir la page d’accueil et choisir votre nom dans la liste de cette connexion. Décochez Visible pour partager uniquement par lien. Gardez Privé activé sur les réseaux partagés.

### Comment la liste trouve-t-elle les partages locaux ?

La liste regroupe les partages par adresse IPv4 publique ou sous-réseau IPv6 et origine du site, pas par proximité physique. Les passerelles partagées ou VPN peuvent inclure des inconnus ou masquer des appareils. Internet est nécessaire. Seuls les partages directs locaux ou par relais cloud ayant activé leur visibilité apparaissent. Découvrable est coché par défaut lorsqu’il est disponible ; décochez-le pour partager uniquement par lien et gardez Privé sur les réseaux partagés. Rejoindre envoie la demande avec le type de connexion indiqué dans un nouvel onglet de lecture. Consulter la liste ne connecte pas. Les partages privés attendent une approbation ; la demande apparaît dans une boîte de dialogue et reste dans la liste après Examiner plus tard.

## Comment cette promesse se vérifie

- **Vous choisissez le chemin de la connexion chiffrée.** La connexion directe transmet le contenu entre navigateurs sans relais. Le mode direct ordinaire utilise la découverte publique d’adresses ; Réseau local le limite aux candidats hôtes. Le relais cloud transmet des paquets chiffrés via Cloudflare TURN et peut relier des appareils sur des réseaux différents. L’hôte choisit avant de démarrer ; l’invitation porte ce choix et les lecteurs le vérifient avant de se connecter. La connexion directe ne change jamais automatiquement. Le réseau ou le navigateur peut bloquer les deux chemins.
- **Ce qu'est l'entremetteur, et tout ce qu'il voit.** Une connexion directe a besoin d’une présentation. Cette page d’accueil ouvre automatiquement un WebSocket vers l’entremetteur pour les noms de lien locaux visibles ; commencer un partage en ouvre un autre pour le partage lui-même. Un lecteur utilise une seule connexion de présentation. Le serveur rapproche le lecteur et la personne qui partage sous ce nom et transmet quelques kilooctets de négociation. Il n’écrit aucun stockage ; les salles et les entrées de l’annuaire s’arrêtent avec leurs connexions ouvertes. Il voit les noms, les heures de connexion, les adresses IP et la négociation, mais pas le texte, les fichiers, les décisions d’admission ou les présentations privées. L’annuaire affiche les noms des personnes connectées utilisant la même adresse IPv4 publique ou le même sous-réseau IPv6. Un VPN ou une adresse partagée par le fournisseur peut inclure d’autres réseaux ; des appareils voisins utilisant IPv4 et IPv6 ou des routes différentes peuvent manquer. Tout le code est dans le dépôt. Cloudflare garde les journaux de connexion sept jours : adresse, nom de lien et heure, jamais de contenu.
- **Le contenu partagé n’est pas stocké sur un serveur.** Le partage n'existe que tant que votre onglet est ouvert. Fermez-le : les nouveaux lecteurs ne trouvent plus rien, et ceux qui lisaient voient leur copie disparaître — ce que quelqu'un avait copié ou téléchargé avant reste à lui, comme tout ce que vous lui auriez remis en main propre. Le brouillon que vous tapez reste dans le stockage de votre propre navigateur, pour être encore là la prochaine fois, et seulement là ; marqué éphémère, il n'est nulle part. Séparément, le navigateur du lecteur conserve une preuve d’approbation aléatoire pour se déconnecter puis rejoindre cette session sans nouvelle approbation. Arrêter l’hôte réinitialise l’approbation. Le mode éphémère désactive le stockage du brouillon, pas de cette preuve. Effacer ou bloquer les données du site peut imposer une nouvelle approbation ; les scripts ordinaires de ce site peuvent lire la preuve.
- **Le nom de lien est une adresse, et Privé est le verrou.** Toute personne qui connaît ou devine un nom peut ouvrir le partage correspondant. Les partages locaux visibles affichent leur nom aux autres navigateurs utilisant la même adresse IPv4 publique ou le même sous-réseau IPv6. Le nom est alors public au sein de ce groupe. Gardez Privé activé pour tout contenu sensible. Il est activé par défaut : chaque lecteur se présente par le canal chiffré entre navigateurs, et rien n’est envoyé avant votre approbation.
- **Une connexion directe montre à chaque bout l'adresse de l'autre.** La connexion directe échange les adresses réseau nécessaires pour joindre les appareils. Le relais cloud utilise des adresses de relais ; Cloudflare voit les adresses des deux appareils et les métadonnées du trafic. Ce n’est pas une garantie d’anonymat. Vérifiez le choix de connexion ci-dessus avant de choisir explicitement Se connecter.
- **Ce que Google charge, et ce qu'il ne reçoit pas.** Les scripts de publicité et de mesure viennent de Google, le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit le texte, les fichiers, leurs noms ou tailles, ni qui s'est connecté. L'exception est l'adresse de cette page elle-même : le lien d'un lecteur porte le nom du lien, et le script publicitaire lit l'adresse. Un partage qui doit rester entre vous veut l'interrupteur privé. Chaque ligne qui touche au contenu est servie depuis cette origine et figure dans le dépôt.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/main.js` pour les deux moitiés de l'échange — l'onglet de qui partage et celui du lecteur sont le même fichier — et `src/markdown.js` pour le moteur de rendu qui traite du texte venu de l'autre bout du fil, et qui échappe donc tout avant d'émettre quoi que ce soit. Le code complet du serveur est `workers/rendezvous/worker.js`, dans le même dépôt : une salle par nom de lien, qui ne tient rien d'autre que les connexions ouvertes. L’annuaire supplémentaire ne conserve que les noms de lien publiés dans les connexions ouvertes, jamais le texte ou les fichiers.
