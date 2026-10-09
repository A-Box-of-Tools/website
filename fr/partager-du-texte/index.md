# Partager texte & fichiers — de votre navigateur au leur, sans rien téléverser

Le partage vit dans cet onglet ouvert. Les lecteurs le reçoivent chiffré, directement depuis votre navigateur, et fermer l'onglet y met fin - aucun serveur ne conserve quoi que ce soit.

> Envoyez du texte ou des fichiers d'un navigateur à un autre par une connexion directe et chiffrée. Un nom de lien prononçable, mise à jour en direct pendant la frappe, approbation lecteur par lecteur - et jamais rien sur aucun serveur. Gratuit, sans inscription.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/partager-du-texte/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos textes et fichiers partagés. Il n'y a pas de serveur.

Ce que vous partagez ici voyage de votre navigateur à celui de chaque lecteur par un canal WebRTC chiffré de bout en bout, et nulle part ailleurs. Le seul serveur impliqué — nommé dans la `Content-Security-Policy` de cette page, code dans le dépôt — présente les navigateurs et liste les noms de lien locaux visibles. Il ne conserve aucun texte ou fichier partagé, et le contenu ne transite jamais par lui. Les noms visibles restent seulement tant que la personne qui partage est connectée. Il n’y a ni historique du contenu ni compte. Fermez cet onglet et le partage s’arrête partout à la fois, y compris sur les pages ouvertes des lecteurs.

- ✗ Rien de stocké
- ✗ Pas de compte
- ✓ Chiffré de bout en bout
- ✓ S'arrête avec votre onglet
- ✓ Code ouvert

## Comment partager du texte et des fichiers sans les téléverser nulle part

1. **Écrivez le texte, ou joignez les fichiers.** L'éditeur est le partage : ce qu'il contient quand un lecteur se connecte est ce qu'il reçoit, et toute modification atteint ensuite les lecteurs connectés en direct, pendant que vous tapez. Les fichiers voyagent par le même canal, jusqu'à 200 Mo pièce ; les lecteurs voient la liste et ne récupèrent que ce qu'ils demandent — personne ne dépense de bande passante pour un fichier dont il ne voulait pas.
2. **Activez Markdown si le texte mérite une mise en forme.** Un seul interrupteur. Titres, gras, listes, code et liens se rendent en direct à côté de l'éditeur pendant la frappe, et les lecteurs reçoivent la vue mise en forme par défaut, avec un bouton pour revenir à la source. Le moteur de rendu est livré avec cette page et échappe tout : un texte partagé ne peut pas devenir un script sur la machine d'un lecteur, quel qu'en soit l'auteur.
3. **Nommez le lien, ou gardez la suggestion.** Le nom est l’adresse : `brave-otter-42` peut se dire à travers une pièce, au téléphone ou se recopier d’un tableau. Les partages locaux visibles affichent leur nom ; gardez donc Privé activé pour les contenus sensibles. Pour un partage accessible uniquement par lien, un nom difficile à deviner est aussi utile. Un nom déjà utilisé par un partage actif est refusé et se libère dès que vous arrêtez.
4. **Décidez qui entre.** Privé est le réglage par défaut : chaque lecteur est invité à se présenter — un nom, un indice, n'importe quoi que vous reconnaîtriez — et vous voyez le message avec un bouton pour le laisser lire ou l'éconduire. La présentation voyage par le canal direct, si bien que même l'entremetteur ignore qui a frappé. Décochez pour un partage ouvert, lisible par quiconque a le nom.
5. **Lancez le partage, et laissez l'onglet ouvert.** L'onglet est le serveur : le partage est joignable tant qu'il est ouvert et éveillé, et pas un instant de plus. Un portable qu'on referme y met fin aussi. Copiez le lien, ou dites simplement le nom — un lecteur peut le taper en `#name` au bout de l'adresse de cette page. Pour le mode Réseau local, copiez le lien : il contient `?local=1` avant le nom. Un lecteur utilisant un autre mode est invité à choisir avant de réessayer avec le vôtre.
6. **De l'autre côté : consentir, puis frapper.** Qui ouvre le lien apprend que quelqu'un partage, est prévenu qu'une connexion directe montre à chaque bout l'adresse réseau de l'autre, et ne se connecte que par choix. Sur un partage privé, il se présente et vous attend. Ce qu'il reçoit se met à jour en direct pendant que vous écrivez, et disparaît quand vous fermez l'onglet.

## La version longue

[Comment partager du texte et des fichiers entre appareils sans les téléverser](https://abox.tools/fr/guides/partager-du-texte-entre-appareils/): Faire passer du texte ou des fichiers d'un navigateur à un autre par une connexion directe et chiffrée - sans s'envoyer de courriel, sans historique de discussion, sans compte, et sans qu'un serveur garde une copie.

## Aussi dans la boîte

- [Générateur de QR codes et de codes-barres](https://abox.tools/fr/generateur-de-qr-code/): Vous le tapez, cela devient un code. Rien n'est envoyé pour en fabriquer un.
- [Lecteur de QR codes et de codes-barres](https://abox.tools/fr/lecteur-de-qr-code/): Visez un code, ou déposez-en une photo. La lecture se fait ici, et nulle part ailleurs.
- [Hachage & somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/): Vérifier un téléchargement face au nombre publié par son auteur, sans l’envoyer à personne.
- [Générateur de mot de passe & de phrase secrète](https://abox.tools/fr/generateur-de-mot-de-passe/): Fabriqué ici, par votre propre navigateur, et envoyé nulle part. Rien n'est enregistré et il n'y a pas d'historique.

## Questions

### Quelque chose est-il téléversé, quelque part ?

Aucun texte ou fichier n’est téléversé. Ils vont directement de votre navigateur à celui de chaque lecteur par un canal WebRTC chiffré. Le serveur transporte la présentation et les noms de lien locaux publiés, jamais le contenu. Les salles et les entrées de l’annuaire s’arrêtent avec leurs connexions ouvertes. Les journaux de connexion de Cloudflare conservés sept jours contiennent des métadonnées, jamais de contenu.

### Alors pourquoi cet outil parle-t-il à un serveur, sur ce site précisément ?

Parce que deux navigateurs ne se trouvent pas seuls : l’entremetteur rapproche la personne qui a saisi `brave-otter-42` et celle qui partage sous ce nom, puis transmet la négociation. Il est nommé dans la `Content-Security-Policy` de cette page, et son code est dans le même dépôt. Il liste aussi les noms de lien locaux publiés pour les navigateurs utilisant la même adresse IPv4 publique ou le même sous-réseau IPv6. Il ne détient aucun contenu et ne peut pas lire le canal chiffré entre navigateurs.

### Que peut voir ce serveur, exactement ?

Il voit les noms de lien utilisés, les arrivées et départs des personnes qui partagent et des lecteurs, leurs adresses IP et la négociation. L’annuaire groupe les noms publiés selon l’adresse IPv4 publique ou le sous-réseau IPv6 et l’origine de la page. Il ne voit ni texte, ni fichiers, ni leurs noms ou tailles, ni admissions privées, ni présentations. Tout cela passe par le canal chiffré de bout en bout entre navigateurs. Cloudflare garde les journaux de connexion sept jours : nom de lien, adresse et heure, jamais de contenu.

### Que se passe-t-il quand je ferme l'onglet ?

Le partage s'arrête partout à la fois. Le lien cesse de fonctionner en une seconde ou deux, et les lecteurs qui ont encore la page ouverte voient leur copie disparaître, avec un mot disant que le partage est terminé. Ce n'est pas une demande d'effacement adressée à un serveur — il n'y a pas de copie serveur à effacer. L'onglet était le seul endroit où le partage existait, et le fermer est tout le ménage qu'il y a à faire.

### Un lecteur peut-il garder ce que j'ai partagé ?

Tant que le partage est ouvert, oui — c'est cela, partager. Un lecteur peut copier le texte ou télécharger un fichier, et ce qu'il a pris est à lui, exactement comme si vous le lui aviez remis par n'importe quel autre moyen. Ce que garantit l'arrêt, c'est l'avenir : personne de nouveau n'y accède, et les pages ouvertes cessent de l'afficher. Aucun outil ne peut rappeler ce qui est déjà arrivé, et cette page ne prétend pas le contraire.

### Qu'est-ce que le mode privé ?

Le réglage par défaut. Chaque lecteur qui arrive apprend que le partage est privé et est invité à se présenter ; vous voyez le message — « c'est Alice, du stand-up » — avec des boutons pour le laisser lire ou l'éconduire, et rien n'est envoyé avant votre décision. La présentation voyage par le canal direct déjà chiffré, si bien que le serveur ne sait jamais qui a frappé ni ce que vous avez décidé. Décoché avant le partage, cela donne un partage ouvert.

### Pourquoi le lecteur verra-t-il mon adresse IP ?

Parce que la connexion est réellement directe, et qu'une connexion directe relie deux adresses : chaque bout apprend nécessairement celle de l'autre, comme lors d'un appel téléphonique. Le lecteur est prévenu avant qu'aucune connexion n'existe et ne se connecte que par choix ; jusque-là, vous ne savez même pas qu'il a ouvert le lien. Si cet échange ne convient pas à un partage donné, un service qui relaie par un serveur est l'alternative — avec l'échange inverse.

### Quelle taille pour les fichiers, et quelle vitesse ?

Jusqu'à 200 Mo par fichier, de tout type, et aussi vite que la plus lente des deux connexions — aucun serveur au milieu pour freiner ou compter. Deux machines disposant d'une connexion locale qui fonctionne transfèrent à la vitesse de ce réseau ; les VPN et le routage du navigateur peuvent modifier le trajet. Les lecteurs récupèrent chaque fichier à la demande : joindre quelque chose de gros ne coûte rien tant que personne ne le demande vraiment.

### Cela fonctionne-t-il hors ligne ?

À moitié, honnêtement : l'éditeur, oui — la page se charge, votre brouillon est là, le Markdown se rend, écrire et enregistrer se passent de tout réseau. Partager, non, et c'est impossible : atteindre le navigateur de quelqu'un d'autre est un acte réseau, et la présentation exige l'entremetteur. C'est le seul outil de ce site dont la tâche est impossible hors ligne, et laisser entendre autre chose serait malhonnête.

### Et si nous n'arrivons pas à nous connecter ?

L'offre de relais décrite ci-dessous concerne seulement le mode de connexion habituel. La plupart des paires de navigateurs s'atteignent directement une fois présentées ; une minorité non, typiquement quand l'un des bouts est sur le réseau à adresses partagées d'un opérateur mobile ou derrière un réseau d'entreprise strict. Cette page ne passe jamais à un relais en douce — cela changerait ce qu'est cet outil sans le dire — : au bout de vingt secondes, elle dit clairement qu'aucune connexion directe n'a abouti, et en propose un au lecteur : un relais exploité par Cloudflare, qui fait suivre les octets chiffrés entre les deux navigateurs sans pouvoir les lire, puisque la clé ne quitte jamais les deux bouts. Le lecteur le choisit en connaissance de cause, sur sa propre page, après avoir appris ce que le relais voit — les deux adresses, comme la connexion directe —, et rien n'y est stocké non plus. Votre côté du partage ne change pas : votre navigateur n'envoie toujours qu'à ce lecteur-là, comme il le ferait s'il était derrière un VPN. Le mode Réseau local ne propose jamais de relais. Vérifiez que les deux appareils utilisent le même réseau Wi-Fi ou Ethernet et que l'isolation du réseau invité, un pare-feu ou un VPN ne bloque pas la connexion.

### Le rendu Markdown est-il sûr, si n'importe qui peut partager n'importe quoi ?

Cette question est la raison pour laquelle le moteur de rendu tient en quatre-vingts lignes dans le code de cette page plutôt que dans une bibliothèque. Chaque caractère est échappé avant qu'aucune balise ne soit émise, seul un jeu fixe de balises inoffensives peut être produit, et les liens n'acceptent que `http`, `https` et `mailto` — un lien `javascript:` reste du texte inerte. Un texte partagé ne peut pas devenir un script sur votre machine, quel qu'en soit l'auteur, et les quatre-vingts lignes se lisent.

### Deux personnes peuvent-elles partager sous le même nom ?

Pas en même temps. Un partage vivant par nom, imposé chez l'entremetteur : qui arrive en second est refusé et invité à choisir un autre nom. Dès qu'un partage s'arrête, son nom redevient libre — ce qui veut aussi dire qu'un lien conservé ne vaut que ce que vaut le partage derrière : le même nom, la semaine prochaine, peut appartenir à quelqu'un d'autre. Traitez un lien comme appartenant à un moment, pas à une personne.

### Est-ce gratuit, et faut-il un compte ?

Gratuit, sans compte, sans inscription, et sans limite digne d'être mentionnée — seize lecteurs simultanés par partage. Le site porte de la publicité, qui le finance ; les annonces ne reçoivent rien de ce que cette page partage, et l'entremetteur tient largement dans une offre gratuite, précisément parce qu'il ne stocke rien et ne fait presque rien.

### Puis-je partager des fichiers sur mon réseau local ?

Oui. Avant de commencer, choisissez Réseau local — sans relais internet, connectez les deux appareils au même réseau Wi-Fi ou Ethernet et copiez le lien pour le lecteur. Le lien inclut le mode ; un lecteur utilisant un autre mode doit choisir explicitement avant de réessayer avec celui de la personne qui partage. Internet reste nécessaire pour mettre les navigateurs en relation. Ce mode n’utilise pas de découverte publique d’adresses et ne passe jamais à un relais internet. Un VPN ou les règles réseau du navigateur peuvent modifier le trajet ou empêcher la connexion ; ce réglage ne prouve pas que les données restent dans un bâtiment. L’approbation privée reste activée par défaut et les fichiers restent limités à 200 Mo chacun. Un partage peut contenir jusqu’à 256 fichiers. Visible est activé par défaut dans ce mode : l’autre navigateur peut ouvrir la page d’accueil et choisir votre nom dans la liste de cette connexion. Décochez Visible pour partager uniquement par lien. Gardez Privé activé sur les réseaux partagés.

### Comment la liste trouve-t-elle les partages locaux ?

Cette liste affiche les noms de lien des navigateurs utilisant la même adresse IPv4 publique ou le même sous-réseau IPv6 que vous. Cela correspond généralement au même routeur ; un VPN partagé ou une adresse partagée par le fournisseur d’accès peut inclure d’autres réseaux. Des connexions IPv4 et IPv6 ou des routes différentes peuvent masquer des appareils voisins. Internet est nécessaire. Ouvrir un partage demande toujours votre accord avant la connexion, et les partages privés exigent encore l’approbation de la personne qui partage. Les partages locaux sont publiés par défaut ; décochez Visible pour partager uniquement par lien. Choisir un nom ouvre la page de consentement, sans connexion automatique ni contournement de l’approbation privée. L’annuaire ne conserve que les noms de lien tant que la personne qui partage est connectée, jamais le texte, les noms de fichier ou leur contenu. Si la recherche est indisponible, le lien de partage fonctionne toujours. Seuls les partages en mode Réseau local apparaissent ; choisissez ce mode avant de commencer, car il est désactivé par défaut.

## Comment cette promesse se vérifie

- **Le contenu va à votre lecteur, et nulle part ailleurs.** Le texte et les fichiers voyagent par un canal de données WebRTC : une connexion directe, chiffrée en DTLS, entre votre navigateur et celui de chaque lecteur. Aucun serveur ne se trouve sur ce chemin. Le mode Réseau local utilise les adresses réseau propres aux navigateurs, sans découverte publique d'adresses ni relais internet. Un VPN ou les règles réseau du navigateur peuvent modifier le trajet de ces adresses ; cela ne garantit pas que les données restent dans un bâtiment. En mode habituel, un lecteur dont le réseau ne peut pas être atteint directement peut choisir, sur sa propre page, un relais chiffré : il fait suivre le même texte chiffré et ne peut pas le lire.
- **Ce qu'est l'entremetteur, et tout ce qu'il voit.** Une connexion directe a besoin d’une présentation. Cette page d’accueil ouvre automatiquement un WebSocket vers l’entremetteur pour les noms de lien locaux visibles ; commencer un partage en ouvre un autre pour le partage lui-même. Un lecteur utilise une seule connexion de présentation. Le serveur rapproche le lecteur et la personne qui partage sous ce nom et transmet quelques kilooctets de négociation. Il n’écrit aucun stockage ; les salles et les entrées de l’annuaire s’arrêtent avec leurs connexions ouvertes. Il voit les noms, les heures de connexion, les adresses IP et la négociation, mais pas le texte, les fichiers, les décisions d’admission ou les présentations privées. L’annuaire affiche les noms des personnes connectées utilisant la même adresse IPv4 publique ou le même sous-réseau IPv6. Un VPN ou une adresse partagée par le fournisseur peut inclure d’autres réseaux ; des appareils voisins utilisant IPv4 et IPv6 ou des routes différentes peuvent manquer. Tout le code est dans le dépôt. Cloudflare garde les journaux de connexion sept jours : adresse, nom de lien et heure, jamais de contenu.
- **Rien n'est stocké : fermer l'onglet, c'est l'effacement.** Le partage n'existe que tant que votre onglet est ouvert. Fermez-le : les nouveaux lecteurs ne trouvent plus rien, et ceux qui lisaient voient leur copie disparaître — ce que quelqu'un avait copié ou téléchargé avant reste à lui, comme tout ce que vous lui auriez remis en main propre. Le brouillon que vous tapez reste dans le stockage de votre propre navigateur, pour être encore là la prochaine fois, et seulement là ; marqué éphémère, il n'est nulle part.
- **Le nom de lien est une adresse, et Privé est le verrou.** Toute personne qui connaît ou devine un nom peut ouvrir le partage correspondant. Les partages locaux visibles affichent leur nom aux autres navigateurs utilisant la même adresse IPv4 publique ou le même sous-réseau IPv6. Le nom est alors public au sein de ce groupe. Gardez Privé activé pour tout contenu sensible. Il est activé par défaut : chaque lecteur se présente par le canal chiffré entre navigateurs, et rien n’est envoyé avant votre approbation.
- **Une connexion directe montre à chaque bout l'adresse de l'autre.** C'est cela, le pair à pair, et le lecteur le sait avant que cela n'arrive : ouvrir un lien de partage ne fait que demander à l'entremetteur si quelqu'un partage ; la page dit ensuite clairement que se connecter révèle à chaque bout l'adresse IP de l'autre, et attend un clic. Jusqu'à ce clic, qui partage ne sait même pas que le lecteur existe.
- **Ce que Google charge, et ce qu'il ne reçoit pas.** Les scripts de publicité et de mesure viennent de Google, le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit le texte, les fichiers, leurs noms ou tailles, ni qui s'est connecté. L'exception est l'adresse de cette page elle-même : le lien d'un lecteur porte le nom du lien, et le script publicitaire lit l'adresse. Un partage qui doit rester entre vous veut l'interrupteur privé. Chaque ligne qui touche au contenu est servie depuis cette origine et figure dans le dépôt.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/main.js` pour les deux moitiés de l'échange — l'onglet de qui partage et celui du lecteur sont le même fichier — et `src/markdown.js` pour le moteur de rendu qui traite du texte venu de l'autre bout du fil, et qui échappe donc tout avant d'émettre quoi que ce soit. Le code complet du serveur est `workers/rendezvous/worker.js`, dans le même dépôt : une salle par nom de lien, qui ne tient rien d'autre que les connexions ouvertes. L’annuaire supplémentaire ne conserve que les noms de lien publiés dans les connexions ouvertes, jamais le texte ou les fichiers.
