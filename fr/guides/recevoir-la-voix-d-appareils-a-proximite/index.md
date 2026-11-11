# Recevoir la voix en direct des personnes à proximité

Un hôte écoute pendant que plusieurs personnes parlent depuis leur navigateur. L'hôte nomme le récepteur et choisit Direct ou Cloud relay avant de commencer ; les appelants n'ont pas besoin de nom d'affichage. La découverte à proximité aide à le trouver, un mot de passe facultatif contrôle l'admission et l'hôte choisit les voix à entendre. Cloud relay transmet la voix chiffrée via Cloudflare après confirmation de ce choix par les appelants.

[Ouvrir Voice Oncall](https://abox.tools/fr/voice-oncall/): Open a pager and hear live voice from people who connect. Use Direct on your local network or choose Cloud relay over the internet, with a password and individual mute or remove controls.

Dernière mise à jour 14 octobre 2026

## Ouvrez le récepteur vocal

Ouvrez [Voice Oncall](https://abox.tools/fr/voice-oncall/) sur l'appareil qui écoutera. Choisissez « Host a pager », donnez au récepteur un nom reconnaissable et, si nécessaire, un mot de passe. Laissez « Connection » sur « Direct », ou choisissez « Cloud relay » avant le démarrage si l'accès direct est impossible. « Start pager » prépare la lecture sur le haut-parleur et rend le récepteur visible ; cette action ne demande pas l'accès au microphone.

Utilisez l'adresse HTTPS du site. Aucune installation, aucun programme auxiliaire Python ni compte ne sont nécessaires. Gardez la page hôte ouverte et son appareil éveillé pendant que des personnes sont connectées.

Si le téléphone interrompt le son de l'hôte, revenez à la page et choisissez « Restore sound » lorsque la commande apparaît. Le récepteur reste ouvert pendant la pause du son.

## Laissez les personnes à proximité se connecter

Les participants ouvrent le même outil et choisissent « Join » à côté du récepteur dans « Available connections ». Ils saisissent son mot de passe si nécessaire et attendent l'approbation de l'hôte. « Require approval » est activé pour les nouveaux récepteurs et peut être désactivé avant le démarrage. L'hôte peut choisir « Approve » ou « Deny » dans la fenêtre ou la liste d'attente ; « Review later » ferme la fenêtre sans rejeter la demande. L'autorisation du microphone n'est demandée qu'après admission. Les appelants n'ont pas besoin de saisir un nom.

La liste regroupe les pages selon leur adresse internet publique et l'origine de ce site. Cela correspond souvent aux personnes utilisant la même connexion, mais ne scanne pas le Wi-Fi et ne prouve pas la proximité physique. Les VPN et les routes distinctes peuvent masquer un récepteur voisin, tandis qu'une passerelle d'opérateur partagée peut inclure des inconnus. Utilisez l'invitation copiée de l'hôte ou son QR code si la liste ne le trouve pas. Partagez les mots de passe séparément du lien.

## Parlez uniquement quand vous le souhaitez

Après connexion, la transmission du microphone est initialement arrêtée. Maintenez « Talk », ou placez le focus sur le bouton et maintenez la barre d'espace, pour envoyer votre voix en direct. Relâchez pour arrêter. « Start talking » active ou désactive la transmission mains libres ; arrêtez-la quand vous avez terminé.

Seul l'hôte reçoit la voix des participants. Les participants ne s'entendent pas entre eux, et plusieurs voix simultanées peuvent se superposer chez l'hôte. Masquer une page préserve une connexion en bon état. Le bouton « Talk » maintenu est relâché, tandis que la parole mains libres peut continuer si le navigateur le permet. Les téléphones peuvent néanmoins suspendre les microphones, le son ou le réseau lorsqu'ils sont verrouillés.

Une véritable interruption du microphone arrête la parole tout en gardant la connexion ouverte. Au retour, la page essaie de remplacer un microphone terminé ; utilisez « Resume microphone » si nécessaire et recommencez délibérément à parler. Après suspension de la page, la même identité de récepteur ou de participant sert à se reconnecter. « Disconnect » ferme la session du participant et arrête la récupération ; « End pager » empêche le redémarrage par l'hôte.

## Choisissez qui l'hôte entend

La liste de l'hôte affiche chaque appelant avec un identifiant court et son état de parole. « Mute » coupe un participant dans le navigateur de l'hôte, et « Unmute » permet de l'entendre à nouveau. La page de parole normale cesse aussi d'émettre lorsqu'elle est mise en sourdine ; rétablir le son ne démarre pas de lui-même son microphone.

« Remove » coupe localement le participant pendant que le service confirme son retrait, puis ferme sa connexion et bloque son identité de session conservée. Si le service refuse l'action mémorisée, la ligne reste visible et l'hôte peut choisir de nouveau « Unmute ». Les identifiants de session ne sont pas des comptes vérifiés : le retrait ne peut donc pas bannir définitivement une personne qui crée une nouvelle identité. Un mot de passe aide à contrôler l'admission. « End pager » ferme le récepteur actuel ; un nouveau récepteur utilise une nouvelle invitation et remet l'historique de modération à zéro.

## Comprenez la connexion

Le point d'accès d'un téléphone peut fonctionner s'il permet aux appareils participants de se joindre directement. Connectez les appareils au même point d'accès et gardez internet pour la découverte et l'association. Utilisez le lien du récepteur ou son QR code si la liste de proximité ne le montre pas. Certains points d'accès et appareils administrés bloquent le trafic direct : testez vos appareils réels avant de vous y fier.

Internet est nécessaire pour la découverte, l'admission et l'établissement de la connexion. Ce service transporte les noms des récepteurs, les identifiants temporaires des participants, des justificatifs dérivés du mot de passe, les données de modération et les détails réseau, jamais la voix. Les anciennes pages peuvent aussi envoyer des noms d'affichage de participants. L'audio direct passe par des connexions de navigateur chiffrées distinctes, sans STUN ni TURN. L'option « Cloud relay » transmet l'audio chiffré via Cloudflare, qui voit les adresses, les horaires et le volume de trafic, et nécessite internet pendant toute la session. L'invitation contient le mode de connexion de l'hôte ; les participants le voient avant de se connecter. « Direct » ne passe jamais automatiquement par un relais.

Les participants en attente sont prévenus dès que l'hôte revient. Les appareils en veille, les temporisateurs d'arrière-plan et les limites de connexion peuvent retarder la récupération. L'isolation des invités, les pare-feu, les routes VPN ou les autorisations de réseau local du navigateur peuvent empêcher l'audio direct même sur le même Wi-Fi. Essayez les téléphones et ordinateurs que vous comptez réellement utiliser.

Si votre objectif est qu'une personne parle à plusieurs auditeurs, utilisez plutôt le [Talkie-walkie local](https://abox.tools/fr/walkie-talkie/). Voice Oncall reçoit plusieurs voix distinctes chez un seul hôte.
