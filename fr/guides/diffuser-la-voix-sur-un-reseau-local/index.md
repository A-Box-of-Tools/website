# Diffuser la voix sur un réseau local

Une personne parle et les autres écoutent dans leur navigateur. Lancez le canal sur ce site, partagez son lien ou rendez-le visible à proximité. La connexion directe utilise un réseau local accessible. Si l’hôte choisit le relais cloud, les auditeurs confirment avant la transmission de la voix chiffrée via Cloudflare.

[Ouvrir Local Walkie-Talkie](https://abox.tools/fr/walkie-talkie/): Start a named channel, then hold to talk or speak hands-free. Connect directly on your local network, or choose Cloud relay for listeners over the internet.

Dernière mise à jour 3 novembre 2026

## Commencez sur l’appareil depuis lequel vous allez parler

Ouvrez Local Walkie-Talkie sur ce site et saisissez dans Channel name un nom que les auditeurs reconnaîtront. Laissez Make this channel discoverable activé pour publier le canal dans la liste, ou désactivez-le pour inviter uniquement par lien. Gardez Connection sur Direct, ou choisissez Cloud relay avant de démarrer si les appareils ne peuvent pas se joindre directement. Choisissez Start channel et autorisez l’accès au microphone. Un téléphone ou un ordinateur compatible peut héberger le canal depuis la page HTTPS. Aucun programme auxiliaire Python, téléchargement ou compte n’est nécessaire. Pour une connexion plus fiable, gardez si possible la page de l’émetteur visible et son appareil éveillé.

## Approuvez les auditeurs

Require approval est activé pour les nouveaux canaux. Chaque nouvel auditeur attend avant de recevoir du son. Choisissez Approve ou Deny dans la fenêtre de demande ou dans la liste ; Review later ferme la fenêtre et laisse la demande en attente. Vous pouvez désactiver l’approbation avant de démarrer. Une identité déjà approuvée peut rétablir sa connexion dans le même salon ; terminer la diffusion empêche ce rétablissement.

## Trouvez un canal ou invitez des auditeurs

Les auditeurs ouvrent Local Walkie-Talkie, vérifient l’icône du mode de connexion d’un canal dans Available connections, puis choisissent Join sur sa ligne. La liste se met à jour automatiquement. La consulter ne lance pas de connexion ; rejoindre un canal sert uniquement à recevoir du son et ne demande jamais l’accès au microphone. Si le canal n’apparaît pas, partagez plutôt le lien d’écoute ou le code QR. Ouvrir une invitation Direct lance automatiquement la connexion. Une invitation Cloud relay affiche d’abord son mode de connexion et attend Join. Si le navigateur bloque le son, Unmute l’active. Une fois connectés, les auditeurs utilisent Mute/Unmute et Leave.

Les deux côtés ont besoin d’un accès à Internet pour la découverte et l’appairage. Le service transmet les noms des canaux, les invitations d’écoute, les informations de connexion et l’état ; la voix en direct emprunte un chemin chiffré distinct entre l’émetteur et chaque auditeur. Direct est le choix par défaut et ne change jamais automatiquement de mode. Cloud relay est une autre option, choisie explicitement, qui transmet le son chiffré via Cloudflare. Ce dernier voit les adresses, les horaires et le volume de trafic ; Internet est nécessaire pendant toute la session. Les deux côtés utilisent le mode choisi par l’hôte.

La découverte à proximité regroupe les navigateurs selon leur adresse IPv4 publique ou leur préfixe IPv6 /64 et l’origine de ce site. Elle n’analyse pas le Wi-Fi et ne prouve pas qu’un canal de la liste appartient à votre réseau physique. Les passerelles partagées peuvent inclure des inconnus ; les VPN et des itinéraires Internet différents peuvent masquer des appareils juste à côté de vous. Utilisez le lien d’écoute si la découverte ne trouve pas un canal.

## Maintenez le bouton enfoncé pour parler

Maintenez le bouton Talk enfoncé avec le doigt ou la souris, ou placez le focus dessus et maintenez la barre d’espace enfoncée. Relâchez pour arrêter d’envoyer votre voix. Pour parler les mains libres, choisissez Start talking : la voix reste transmise jusqu’à ce que vous choisissiez Stop talking. Vérifiez l’état de transmission affiché avant de poser l’appareil. La coupure du microphone est prioritaire sur ces deux modes. Jusqu’à dix auditeurs peuvent se connecter, connexions en attente comprises ; commencez avec un petit groupe et vérifiez les appareils et le réseau que vous comptez utiliser.

## Rétablissez la connexion avec l’émetteur

Les récepteurs en attente restent sur la même page, conservent leur choix de couper ou d’activer le son et sont prévenus dès que l’émetteur est de nouveau disponible. Une connexion vocale directe qui fonctionne déjà peut continuer pendant une brève interruption du service d’appairage. Les navigateurs en arrière-plan, les limites de connexion du service et les appareils en veille peuvent retarder le rétablissement.

Masquer la page conserve une connexion qui fonctionne. Le bouton de parole maintenu enfoncé est relâché ; la transmission mains libres lancée avec Start talking peut continuer si le navigateur le permet. Le téléphone peut toutefois suspendre le microphone, le son ou le réseau lorsque l’écran est verrouillé. Une interruption réelle du microphone arrête la transmission tout en gardant le canal ouvert. Au retour, la page tente de remplacer un microphone arrêté ; choisissez Resume microphone si nécessaire. Après une suspension de la page, elle tente de retrouver le même canal et la même invitation ; utilisez Resume channel si le navigateur exige une action. Après une interruption, la transmission reste désactivée jusqu’à ce que vous la relanciez.

Un stockage temporaire du navigateur, propre à chaque onglet, permet également de conserver le canal lors d’un rechargement. Si ce stockage est indisponible, recharger la page de l’émetteur crée une nouvelle invitation. End broadcast retire le canal de la liste, termine la session et empêche sa reprise automatique. Le prochain démarrage crée une nouvelle invitation. Leave déconnecte un auditeur et arrête ses nouvelles tentatives de connexion.

## Partagez les invitations avec précaution

Une invitation d’écoute permet à son détenteur de demander l’accès avec le mode choisi par l’hôte. Lorsque Require approval est activé, l’hôte doit approuver avant qu’un son soit reçu. Démarrer avec Make this channel discoverable activé partage volontairement le nom du canal et la clé d’invitation d’écoute avec son groupe de découverte. Toute personne qui le trouve peut demander à participer ; l’approbation reste nécessaire. Désactivez cette option avant de démarrer pour partager les invitations uniquement par lien. La clé distincte de l’émetteur reste dans son onglet de navigateur et n’est pas partagée. Dans les liens copiés, les clés des auditeurs passent dans le fragment après le caractère #, puis dans des messages d’appairage sécurisés. Le service conserve temporairement l’état du salon dans les connexions ouvertes ; Cloudflare conserve pendant sept jours des journaux de métadonnées d’invocation, jamais le son du microphone.

Les scripts habituels du site pour la publicité et la mesure s’exécutent aussi sur cette page. L’outil ne leur transmet aucun son, mais les scripts de la page peuvent lire l’adresse et le stockage du navigateur. Supprimer le fragment d’invitation lorsque le stockage est disponible réduit son exposition ultérieure ; cela n’isole pas ces scripts. Assurez-vous de faire confiance à la page avant d’autoriser l’accès au microphone. Les destinataires peuvent enregistrer de leur côté ce qu’ils entendent.

## Vérifiez que les appareils peuvent se joindre

Le point d’accès d’un téléphone peut fonctionner s’il permet aux appareils de se joindre directement. Connectez les appareils au même point d’accès et conservez l’accès à Internet pour la recherche et l’appairage. Si le canal n’apparaît pas dans la liste, utilisez le lien d’écoute ou le QR code. Certains points d’accès et appareils administrés bloquent les connexions directes ; testez les appareils que vous utiliserez réellement.

Un réseau Wi-Fi invité peut isoler les appareils les uns des autres. Les pare-feu, les autorisations d’accès au réseau local du navigateur, les VPN et les routes du système d’exploitation peuvent affecter la connexion directe, même lorsque deux appareils semblent partager le même Wi-Fi. Direct utilise uniquement des candidats de type host et aucun serveur STUN ou TURN ; cela limite le chemin emprunté sans prouver l’existence d’une frontière physique du réseau. Essayez les téléphones et ordinateurs que vous utiliserez avant de compter sur le canal.
