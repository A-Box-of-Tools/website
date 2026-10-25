# Voir une caméra depuis un autre appareil

Réutilisez un téléphone pour voir un animal, l’entrée ou un endroit difficile à inspecter. Ouvrez la caméra dans un navigateur et approuvez le spectateur. La connexion directe utilise un réseau local accessible ; le relais cloud transmet la vidéo chiffrée via Cloudflare.

[Ouvrir Remote Camera](https://abox.tools/fr/remote-camera/): Open a camera on one device and watch it in another browser, with optional viewer approval. Choose Direct or Cloud relay for encrypted live video.

Dernière mise à jour 15 octobre 2026

## Ce qu’il vous faut

Direct est le choix par défaut. Les indications de joignabilité directe ci-dessous concernent ce mode. Pour utiliser Cloud relay, l’hôte le choisit avant de démarrer et partage la nouvelle invitation. L’autre personne voit ce choix et le confirme avant la connexion. Direct ne bascule jamais automatiquement. Cloudflare transmet le contenu chiffré et voit les adresses, les horaires et le volume de trafic. Les deux appareils ont besoin d’internet pendant toute la session. Approbation, mot de passe et commandes du microphone restent nécessaires.

Utilisez deux appareils dont les navigateurs prennent en charge l’accès à la caméra et WebRTC. Tous deux ont besoin d’internet pour la mise en relation et d’un réseau qui leur permet de se joindre. Un téléphone en Wi-Fi et un ordinateur en Ethernet peuvent fonctionner si le réseau autorise leur communication. Un point d’accès partagé par un téléphone peut aussi fonctionner si les deux appareils ont accès à internet pour la mise en relation et si le point d’accès permet leur communication.

Ouvrez l’adresse HTTPS de confiance de ce site. Une adresse HTTP ordinaire sur une IP du réseau local ne peut pas demander la caméra. Si le navigateur ou le système demande l’accès au réseau local, autorisez-le pour cette session.

## Réutiliser un ancien téléphone à la maison

Un téléphone inutilisé peut montrer une autre pièce ou un endroit difficile à voir. Ces usages nécessitent la même connexion directe que toute session de caméra : internet pour l’association des deux appareils et un réseau domestique qui leur permet de communiquer.

- **Un regard sur la chambre d’enfant.** Pendant que vous êtes à la maison, utilisez le direct comme vérification visuelle supplémentaire depuis une autre pièce. Posez le téléphone sur un support stable, hors de portée de l’enfant. Le son facultatif et les alertes d’activité peuvent manquer ou être suspendus par le navigateur ; cet outil n’est pas un dispositif de sécurité.
- **Les animaux dans une autre pièce.** Pendant que vous travaillez ailleurs dans la maison, voyez si le chien s’est installé dans son panier ou ce que fait le chat dans son coin préféré.
- **Une entrée intérieure.** Gardez un œil sur la porte depuis une autre pièce. Il s’agit d’un direct pendant que vous regardez, sans enregistrement. Les navigateurs compatibles peuvent vous signaler un mouvement ou un son détecté tant que la page du spectateur peut fonctionner.
- **Une inspection de bricolage.** Orientez le téléphone vers un raccord sous l’évier, une vis tombée derrière un meuble ou un passage de câbles. Le portable permet de voir là où votre tête ne passe pas.

Pour une image plus fiable, gardez la page de caméra visible et le téléphone éveillé. La page conserve une connexion fonctionnelle lorsqu’elle est masquée, mais le navigateur du téléphone peut suspendre la capture ou la page lors d’un changement d’application ou du verrouillage de l’écran. Direct nécessite un réseau local accessible. Le relais cloud est une autre option à choisir explicitement, avec internet pendant toute la session.

## Installer une vue pour une inspection

1. Démarrez la caméra, connectez le portable et approuvez sa demande avec les étapes ci-dessous. Associez les appareils tant que le téléphone reste facile à atteindre.
2. Choisissez la caméra orientée vers l’endroit à inspecter. Posez le téléphone sur un support stable et vérifiez le cadrage sur le portable. Ajoutez une lampe ou une lampe de poche si l’endroit est sombre.
3. Regardez le direct en cherchant la vis, en vérifiant le raccord ou en passant le câble. Repositionnez le téléphone si le détail nécessaire est hors du cadre.
4. Laissez la page de caméra visible et l’écran éveillé jusqu’à la fin, puis choisissez Stop camera and end the link.

## Commencer sur l’appareil caméra

1. Choisissez un nom pour le lien de consultation ou gardez le nom aléatoire proposé. Laissez Require my approval activé pour approuver les spectateurs, ou désactivez-le pour une consultation automatique. Choisissez ensuite Start camera. Le navigateur sélectionne la caméra initiale.
2. Autorisez l’accès à la caméra. Le son est désactivé par défaut ; choisissez Enable microphone avant de démarrer si vous souhaitez aussi demander l’accès au microphone. Arrêtez avant de modifier ce choix.

L’aperçu local apparaît avec le lien, le code choisi et un code QR. Aucune vidéo ni aucun son n’est envoyé avant qu’un spectateur soit accepté. Gardez la page visible et l’appareil éveillé pour une capture fiable. Arrêtez avant de modifier le nom du lien. Désactivez la publication dans la liste avant de commencer si vous souhaitez inviter uniquement par lien. Si plusieurs caméras sont proposées, le sélecteur Camera apparaît après l’autorisation. Un changement conserve le lien et les connexions des spectateurs ; une courte pause est possible si l’appareil doit d’abord libérer l’ancienne caméra.

## Connecter le spectateur et l’approuver

1. Sur l’autre appareil, saisissez si vous le souhaitez une note reconnaissable par le propriétaire dans Watch a camera. Dans Available connections, vérifiez l’icône du type de connexion, puis choisissez Join à côté de la caméra pour envoyer la demande.
2. Vous pouvez aussi ouvrir le lien, scanner son code QR ou entrer le code dans Watch a camera. Ces méthodes attendent que vous choisissiez Connect to camera.
3. Si Require my approval est activé, approuvez chaque demande attendue sur l’appareil caméra. Sinon, les spectateurs reçoivent automatiquement la vidéo tant qu’une place reste disponible.

La note n’est pas une identité vérifiée. Reconnaissez chaque personne et la demande attendue avant d’approuver. L’association échange des adresses réseau même avant l’approbation ; le réglage décide si une action du propriétaire est requise avant la vidéo. Sans approbation, toute personne qui connaît le lien ou trouve la caméra dans la liste peut regarder tant qu’une place reste disponible. Une modification du réglage concerne les nouvelles demandes ; les spectateurs acceptés restent connectés. Si la lecture est en pause, choisissez Play live video. Le son partagé démarre automatiquement si le navigateur le permet ; sinon, choisissez Unmute audio. Les commandes de mise en sourdine et Full screen se trouvent dans le cadre vidéo. Couper le son de la lecture n’arrête pas les alertes sonores.

## Partager avec plusieurs spectateurs

Jusqu’à huit spectateurs acceptés peuvent regarder la même caméra par des connexions directes distinctes. La source les répertorie sous Connected viewers. Disconnect this viewer termine uniquement la vue de cette personne ; Stop camera termine toutes les vues.

Choisissez Shared video bandwidth sur la source pour laisser de la place aux autres échanges sur le Wi-Fi. La valeur par défaut est de 6 Mbps ; les choix sont 1, 2, 4, 6 et 10 Mbps. Le plafond vidéo est réparti entre les spectateurs, et chaque navigateur peut encore réduire son débit en cas de congestion. À 1 Mbps, les nouveaux spectateurs ne sont acceptés que si moins de quatre spectateurs sont déjà acceptés au total ; les valeurs supérieures utilisent une limite de huit au total. Le son et le surcoût réseau s’y ajoutent. Vous pouvez modifier cette limite pendant le partage. La réduire ne déconnecte pas les spectateurs déjà présents, même si leur nombre dépasse le nouveau seuil d’admission.

Le navigateur ne peut pas mesurer la capacité totale partagée de votre Wi-Fi. Si la vidéo ralentit, réduisez le plafond choisi ou déconnectez certains spectateurs. Les performances de l’appareil peuvent aussi limiter le partage. Un navigateur qui ne peut pas appliquer les limites vidéo l’indique sur la source ; son adaptation habituelle à la connexion continue.

## Activer les alertes des spectateurs lorsque c’est possible

Les spectateurs connectés peuvent choisir des notifications de mouvement ou de son dans les navigateurs compatibles. Activez une alerte et autorisez la demande de notification du navigateur. La détection sonore nécessite que l’hôte partage le son ; elle fonctionne même lorsque la lecture est en sourdine. Les images et le son sont analysés localement, sans enregistrement ni envoi, et les notifications contiennent seulement un texte général sur l’activité.

Gardez la page du spectateur ouverte. Les navigateurs peuvent suspendre l’analyse en arrière-plan ou lorsque l’appareil est en veille, et les changements de lumière peuvent déclencher des notifications de mouvement. Des alertes peuvent manquer ; elles ne constituent pas un dispositif de sécurité. Sur iPhone ou iPad, les notifications peuvent nécessiter l’ajout du site à l’écran d’accueil. Les options de notification non prises en charge sont masquées.

## Revenir après un verrouillage ou une interruption

À votre retour, la page essaie de continuer avec le même lien et la caméra choisie. Si elle n’y parvient pas, choisissez Resume camera ; le navigateur peut demander à nouveau l’accès à la caméra. Le spectateur reste approuvé tant que la connexion directe d’origine subsiste. Si cette connexion directe a été perdue, il doit se reconnecter et recevoir une nouvelle approbation lorsque Require my approval est activé. La capture en arrière-plan sur un téléphone verrouillé n’est pas garantie.

## Arrêter à la fin

Stop camera and end the link libère la capture et ferme l’invitation. Revenir à la page après Stop ne la redémarre pas. Fermer la page source termine la session ; la masquer seule conserve une connexion fonctionnelle. Disconnect côté spectateur efface le direct, tandis que la source conserve un aperçu local pour une autre demande.

Une autorisation de caméra accordée après Stop est immédiatement libérée. Redémarrer utilise le nom du champ de lien ; New random name crée une nouvelle invitation. Terminer la session arrête les vidéos futures, mais un spectateur peut conserver ce qu’il a lui-même capturé sur son écran.

## Si les appareils ne se connectent pas

Un même nom de Wi-Fi ne garantit pas qu’ils puissent se joindre. Isolation des invités, pare-feu, découverte locale bloquée, permissions réseau du navigateur ou du système et routage VPN peuvent empêcher la connexion directe. Arrêtez des deux côtés, vérifiez les permissions et le réseau, puis essayez un nouveau lien.

Connection details affiche les types de candidats sélectionnés et le nombre d’images décodées côté spectateur. Direct utilise uniquement des candidats hôtes, sans serveur STUN, relais TURN ni solution de repli par relais. Un VPN, une interface publique ou une route du système peut influencer le trajet ; les candidats hôtes ne prouvent pas que le trafic reste dans un bâtiment.

## Ce que voit le service de mise en relation

Ouvrir la page crée un WebSocket de découverte vers le rendezvous. Démarrer ou connecter ajoute un WebSocket de salle. Il reste ouvert pour les invitations, mais une vue directe déjà acceptée continue si cette connexion de mise en relation se ferme. La caméra renouvelle son invitation sans répéter la capture ni l’approbation du spectateur. Si le service de mise en relation ne se rétablit pas, la vue existante continue ; arrêtez et redémarrez avant d’inviter un autre spectateur. Le service voit le code, les adresses IP, les horaires ainsi que les descriptions et candidats WebRTC. Les messages de configuration lui sont visibles ; la vidéo, le son activé et la note du spectateur passent par la connexion chiffrée entre appareils.

La découverte regroupe les noms des caméras volontairement publiées selon l’adresse IPv4 publique ou le préfixe IPv6 /64 vu par le service et l’adresse du site. Cela peut inclure des inconnus derrière des VPN ou réseaux d’opérateurs partagés, et omettre des caméras proches. Join à côté d’une caméra demande la connexion avec le type indiqué et échange les adresses réseau. Consulter la liste ne connecte pas. La source peut exiger l’approbation du propriétaire ou accepter automatiquement. Ouvrir un lien attend toujours Connect. Les salles et listes existent seulement sur des connexions ouvertes. Cloudflare conserve sept jours de journaux de connexion contenant des métadonnées, jamais le contenu des messages. Les scripts publicitaires habituels peuvent lire l’adresse de la page, y compris le code caméra dans son fragment. Un code autorise une demande ; l’approbation côté source reste donc essentielle.

C’est une vue de caméra dans le navigateur : le son du microphone est facultatif, elle n’a pas de fonction d’enregistrement et n’installe pas de webcam système pour les autres applications.
