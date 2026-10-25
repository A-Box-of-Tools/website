# Diffuser la voix sur un réseau local

Une personne parle et les autres écoutent dans leur navigateur. Lancez le canal sur ce site, partagez son lien ou rendez-le visible à proximité. La connexion directe utilise un réseau local accessible. Si l’hôte choisit le relais cloud, les auditeurs confirment avant la transmission de la voix chiffrée via Cloudflare.

[Ouvrir Local Walkie-Talkie](https://abox.tools/fr/walkie-talkie/): Start a named channel, then hold to talk or speak hands-free. Connect directly on your local network, or choose Cloud relay for listeners over the internet.

Dernière mise à jour 14 octobre 2026

## Commencez sur l’appareil depuis lequel vous allez parler

Direct est le choix par défaut. Les indications de joignabilité directe ci-dessous concernent ce mode. Pour utiliser Cloud relay, l’hôte le choisit avant de démarrer et partage la nouvelle invitation. L’autre personne voit ce choix et le confirme avant la connexion ; une invitation Walkie-Talkie avec relais attend aussi Join. Direct ne bascule jamais automatiquement. Cloudflare transmet le contenu chiffré et voit les adresses, les horaires et le volume de trafic. Les deux appareils ont besoin d’internet pendant toute la session. Approbation, mot de passe et commandes du microphone restent nécessaires.

Ouvrez Local Walkie-Talkie sur ce site, laissez Require my approval activé pour les nouvelles demandes, choisissez Start channel et autorisez l’accès au microphone. Un téléphone ou un ordinateur compatible peut héberger le canal depuis la page HTTPS. Aucun programme auxiliaire Python, téléchargement ou compte n’est nécessaire. Pour une connexion plus fiable, gardez si possible la page de l’émetteur visible et son appareil éveillé.

## Invitez les auditeurs

Partagez le lien ou le code QR destiné aux auditeurs avec des appareils qui peuvent utiliser le mode choisi. L’ouverture d’une invitation Direct envoie automatiquement une demande de participation. Une invitation Cloud relay affiche d’abord le type de connexion et attend Join. Les nouveaux canaux exigent l’approbation de l’hôte par défaut. La demande s’affiche dans une boîte de dialogue : Approve autorise la participation, Deny la refuse et Review later la garde dans la liste. Aucun son n’est envoyé avant l’approbation, sauf si l’hôte l’a désactivée. L’accès au microphone n’est jamais demandé. Si le navigateur bloque le son, Unmute l’active. Une fois connectés, les auditeurs utilisent Mute/Unmute et Leave.

Les deux côtés ont besoin d’un accès à Internet pour l’appairage. Le service transmet les informations de connexion et les messages d’état ; en mode Direct, la voix en direct emprunte un chemin distinct, direct et chiffré entre l’émetteur et chaque auditeur. Le relais cloud exige un choix explicite et ne s’active jamais automatiquement.

Sur l'appareil qui diffuse, saisissez dans **Channel name** un nom que les auditeurs reconnaîtront. Si **Make this channel discoverable** est cochée, le bouton **Start channel** publie le canal dans le périmètre de recherche choisi. Décochez cette option pour partager les invitations uniquement par lien.

La liste **Available connections**, en haut de la page, se met à jour automatiquement. Les auditeurs vérifient l'icône du type de connexion, puis choisissent **Join** à côté du canal souhaité. Consulter la liste ne lance pas la connexion. Rejoindre un canal sert uniquement à recevoir du son et ne demande jamais l'accès au microphone. Si le canal n'apparaît pas, le lien d'écoute et le QR code restent utilisables. Une fois connectés, les auditeurs disposent de Mute/Unmute et Leave.

La recherche regroupe les navigateurs selon leur adresse IPv4 publique ou leur préfixe IPv6 /64 et l'origine de ce site ; elle n'analyse pas le réseau Wi-Fi. Une connexion internet partagée peut inclure des inconnus, tandis qu'un VPN ou un autre itinéraire réseau peut masquer des appareils pourtant proches. Publier un canal partage son nom et sa clé d'invitation d'écoute avec ce groupe. Toute personne qui le trouve et peut joindre l’hôte peut demander à participer. L’écoute attend l’approbation, sauf si l’hôte l’a désactivée. Le canal reste dans la liste tant que la connexion de l'hôte reste active. End broadcast ou la perte de cette connexion le retire.

## Maintenez le bouton enfoncé pour parler

Maintenez le bouton Talk enfoncé avec le doigt ou la souris, ou placez le focus dessus et maintenez la barre d’espace enfoncée. Relâchez pour arrêter d’envoyer votre voix. Pour parler les mains libres, choisissez Start talking : la voix reste transmise jusqu’à ce que vous choisissiez Stop talking. Vérifiez l’état de transmission affiché avant de poser l’appareil. La coupure du microphone est prioritaire sur ces deux modes. Jusqu’à dix auditeurs peuvent se connecter, connexions en attente comprises ; commencez avec un petit groupe et vérifiez les appareils et le réseau que vous comptez utiliser.

## Rétablissez la connexion avec l’émetteur

Les récepteurs en attente vérifient sur la même page si l’émetteur est disponible, avec un intervalle visé d’une seconde au premier plan, et conservent leur choix de couper ou d’activer le son. Une connexion vocale directe qui fonctionne déjà peut continuer pendant une brève interruption du service d’appairage. Les navigateurs en arrière-plan, les limites de connexion du service et les appareils en veille peuvent retarder le rétablissement.

Masquer la page conserve une connexion qui fonctionne. Le bouton de parole maintenu enfoncé est relâché ; la transmission mains libres lancée avec Start talking peut continuer si le navigateur le permet. Le téléphone peut toutefois suspendre le microphone, le son ou le réseau lorsque l’écran est verrouillé. Une interruption réelle du microphone arrête la transmission tout en gardant le canal ouvert. Au retour, la page tente de remplacer un microphone arrêté ; choisissez Resume microphone si nécessaire. Après une suspension de la page, elle tente de retrouver le même canal ; utilisez Resume channel si le navigateur exige une action. Après une interruption, la transmission reste désactivée jusqu’à ce que vous la relanciez.

Un stockage temporaire du navigateur, propre à chaque onglet, permet également de conserver le canal lors d’un rechargement. Si ce stockage est indisponible, recharger la page de l’émetteur crée une nouvelle invitation. End broadcast retire le canal de la liste, termine la session et empêche sa reprise automatique. Le prochain démarrage crée une nouvelle invitation. Leave déconnecte un auditeur et arrête ses nouvelles tentatives de connexion.

## Partagez les invitations avec précaution

Une personne qui possède une invitation et peut joindre l’émetteur peut demander à participer. L’invitation ne donne pas accès au son sans approbation, sauf si l’hôte l’a désactivée. La clé distincte de l’émetteur reste dans son onglet de navigateur et n’est pas partagée. Les clés des auditeurs sont transmises dans le fragment du lien situé après le caractère #, puis dans des messages d’appairage sécurisés. Le service conserve temporairement l’état du salon dans les connexions ouvertes ; Cloudflare conserve pendant sept jours des journaux de métadonnées d’invocation, jamais le son du microphone.

Les scripts habituels du site pour la publicité, la mesure et le bouton de don s’exécutent aussi sur cette page. L’outil ne leur transmet aucun son, mais les scripts de la page peuvent lire l’adresse et le stockage du navigateur. Supprimer le fragment d’invitation lorsque le stockage est disponible réduit son exposition ultérieure ; cela n’isole pas ces scripts. Assurez-vous de faire confiance à la page avant d’autoriser l’accès au microphone. Les destinataires peuvent enregistrer de leur côté ce qu’ils entendent.

## Vérifiez que les appareils peuvent se joindre

Le point d’accès d’un téléphone peut fonctionner s’il permet aux appareils de se joindre directement. Connectez les appareils au même point d’accès et conservez l’accès à Internet pour la recherche et l’appairage. Si le canal n’apparaît pas dans la liste, utilisez le lien d’écoute ou le QR code. Certains points d’accès et appareils administrés bloquent les connexions directes ; testez les appareils que vous utiliserez réellement.

Un réseau Wi-Fi invité peut isoler les appareils les uns des autres. Les pare-feu, les autorisations d’accès au réseau local du navigateur, les VPN et les routes du système d’exploitation peuvent affecter la connexion directe, même lorsque deux appareils semblent partager le même Wi-Fi. Direct utilise uniquement des candidats de type host et aucun serveur STUN ou TURN ; cela limite le chemin emprunté sans prouver l’existence d’une frontière physique du réseau. Essayez les téléphones et ordinateurs que vous utiliserez avant de compter sur le canal.
