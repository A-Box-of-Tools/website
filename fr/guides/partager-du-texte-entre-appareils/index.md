# Comment partager du texte et des fichiers sans copie stockée sur un serveur

Déplacez une note ou un fichier sans laisser de copie dans une messagerie, un historique de discussion ou un serveur de partage. Les navigateurs se connectent directement par défaut. Si cela échoue, l’hôte peut créer un nouveau partage avec le relais cloud : Cloudflare transmet le contenu chiffré. Les destinataires peuvent toujours enregistrer ce qu’ils reçoivent.

[Ouvrir Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/): Partagez du texte et des fichiers chiffrés depuis votre navigateur ouvert. La connexion directe est choisie par défaut, le relais cloud est facultatif. Vous approuvez chaque lecteur.

Dernière mise à jour 13 octobre 2026

## La réponse courte

Direct est le choix par défaut. Les indications de joignabilité directe ci-dessous concernent ce mode. Pour utiliser Cloud relay, l’hôte le choisit avant de démarrer et partage la nouvelle invitation. L’autre personne voit ce choix et le confirme avant la connexion. Direct ne bascule jamais automatiquement. Cloudflare transmet le contenu chiffré et voit les adresses, les horaires et le volume de trafic. Les deux appareils ont besoin d’internet pendant toute la session. Approbation, mot de passe et commandes du microphone restent nécessaires.

Ouvrez [Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/) sur la machine qui détient la chose, écrivez ou joignez, et appuyez sur *Commencer le partage*. La page donne au partage un nom comme `brave-otter-42` ; sur l'autre appareil, ouvrez la même page et ajoutez `#brave-otter-42` au bout de l'adresse — ou suivez simplement le lien copié. L'autre appareil demande avant de se connecter, vous l'admettez, et le texte ou le fichier traverse chiffré, directement d'un navigateur à l'autre. Fermez l'onglet qui partage, et c'est terminé, partout.

Aucun texte ni fichier partagé n'a été envoyé à un serveur. C'est la forme du système. La suite explique pourquoi cela compte et ses limites réelles.

![La première carte de l'outil de partage : une zone de texte contenant quelques lignes de notes de réunion, surmontée d'un interrupteur Markdown et d'un bouton pour joindre un fichier.](https://abox.tools/screens/share-text-between-devices/write.webp)

Ce qui est remis. La même zone accueille une liste de courses ou un document, et Markdown est un interrupteur plutôt qu'un mode à part.

## Transférer une note au téléphone ou un fichier d'atelier

**D'un ordinateur au téléphone.** Placez adresse longue, instructions ou fichier sur la page de partage. Gardez Privé actif, ouvrez le lien copié sur le téléphone, approuvez le lecteur attendu et copiez ou téléchargez. Gardez l'onglet visible et éveillé jusqu'à réception, puis terminez. La copie enregistrée reste après la fin du lien.

**Un atelier ou appel d'assistance en direct.** Partagez exercice, configuration fictive ou extrait de diagnostic pendant que les deux personnes sont présentes. Préférez des données fictives et approuvez chacun. En mode Réseau local visible, la liste ne prouve pas la présence dans la pièce. Respectez 200 Mo par fichier.

Testez sur le réseau réel avant le rendez-vous. Convenez d'un secours si la liaison directe est bloquée. C'est un transfert en direct ; une livraison nocturne sans présence exige un service qui stocke volontairement le contenu.

## Là où les chemins habituels laissent une copie

Envoyez-vous une note par courriel : elle existe désormais dans un dossier d'envoyés et une boîte de réception, tous deux synchronisés, tous deux sauvegardés, tous deux cherchables dans des années. Collez un mot de passe dans une messagerie : il reste dans l'historique de cette conversation — et dans la sauvegarde en nuage de l'application — aussi longtemps que la conversation existe. Prenez un pastebin ou un site de dépôt de fichiers : le contenu repose sur leur serveur, derrière un réglage d'expiration et un bouton de suppression dont vous ne pouvez vérifier que la couleur. Chacun de ces chemins est un service de stockage qui porte le partage en fonctionnalité.

Parfois c'est exactement ce qu'il faut — une copie qui attend que l'autre soit prêt. Mais la plupart des partages rapides sont le contraire : l'autre appareil est juste là, le contenu est momentané, et chaque copie stockée n'est que du passif. Le mot de passe du Wi-Fi pour un invité, une adresse lue au téléphone, un message d'erreur qui demande une seconde paire d'yeux, un bout de configuration en route vers la machine à laquelle il appartient. Rien de tout cela ne veut d'archive.

## Ce que « direct » veut vraiment dire

L'outil utilise WebRTC, comme les appels vidéo : deux navigateurs ouvrent un canal chiffré et échangent sans serveur sur le trajet. Une connexion locale fonctionnelle permet la vitesse de ce réseau ; le trajet dépend aussi des VPN, politiques du navigateur et réglages des appareils.

Un avertissement honnête figure aussi sur l'outil : deux navigateurs ne se trouvent pas seuls. Un petit serveur rendez-vous associe les noms et transporte quelques kilo-octets de préparation. Il ne garde aucun contenu partagé, qui ne le traverse jamais ; son code est publié. Il fait les présentations, pas la conversation. Il liste aussi les noms locaux volontaires pour trouver un partage à l'accueil. Ce service est utilisé ici et par Remote Camera. Récupération d'images facultative, taux de reçus et scripts de plateforme ont leurs frontières réseau sur la [page Confidentialité](https://abox.tools/fr/confidentialite/). Le partage détaille ce que voit son service de mise en relation.

Direct veut aussi dire mutuel : chaque navigateur apprend l'adresse réseau de l'autre, comme lors d'un appel. Le côté qui lit le sait avant qu'aucune connexion n'existe, et ne se connecte que par choix.

## Partager sur le même Wi-Fi ou Ethernet

Réseau local est désactivé par défaut. Avant le partage, choisissez *Réseau local — aucun relais Internet*, joignez le fichier et gardez Privé pour approuver chacun. Visible est coché par défaut : sur l’autre appareil, vérifiez le type de connexion sous *Connexions disponibles* et choisissez Rejoindre à côté du nom. Un onglet de lecture s’ouvre et envoie la demande. Les partages privés attendent votre approbation. Décochez Visible avant de commencer pour partager par lien seulement. Les deux utilisent le même Wi-Fi ou Ethernet. La limite reste 200 Mo par fichier et les lecteurs choisissent leurs téléchargements.

La liste groupe selon l'IPv4 publique ou le sous-réseau IPv6 vu par le serveur. C'est souvent un routeur, mais VPN partagé ou adresse opérateur commune peuvent inclure d'autres réseaux. IPv4/IPv6 mixtes ou routes différentes peuvent cacher un voisin. Gardez Privé sur les réseaux partagés : le nom est visible au groupe sans prouver la même pièce ou bâtiment. Internet est nécessaire. Sans découverte, le lien copié marche encore.

Le lien porte le réglage sous `?local=1#brave-otter-42`. À voix haute, précisez aussi Réseau local ; `#brave-otter-42` seul demande le mode ordinaire. Si les modes diffèrent, la page l'explique et demande un choix avant d'essayer celui du partageur.

Le mode local n'utilise aucun serveur public de découverte d'adresse ni relais Internet. Le rendez-vous exige encore Internet. Wi-Fi invité, pare-feu, VPN et politiques peuvent bloquer ou changer le trajet. Ce mode contrôle la recherche du chemin direct, sans prouver qu'il reste dans le bâtiment.

## Le nom est l'adresse ; Privé décide de l'accès

Un lien de partage se distingue de tous les autres sur un point pratique : il survit à être dit à voix haute. `brave-otter-42` se lance à travers une pièce, se lit au téléphone, se recopie d'un tableau, et se retape à l'autre bout sans que les pouces de personne ne rendent l'âme. C'est exactement pour cela que les noms ont cette allure.

Qui connaît ou devine le nom actif peut ouvrir le partage. Un partage local visible liste ce nom pour les navigateurs de même IPv4 publique ou sous-réseau IPv6 ; il est public dans ce groupe. Pour du sensible, gardez le défaut : *privé* tant que la case reste cochée. Chaque lecteur se présente et vous décidez individuellement. La présentation passe par le canal direct chiffré ; même le rendez-vous ne connaît pas le demandeur.

![La carte du nom de lien affiche thursday-notes et les options privé et usage unique.](https://abox.tools/screens/share-text-between-devices/name.webp)

Le nom est toute l'adresse. Privé veut dire que chaque lecteur doit demander et que vous le laissez entrer ; usage unique veut dire que le brouillon ne reste pas non plus sur cet appareil.

## Ce que fermer l'onglet arrête vraiment

Le partage vit dans l'onglet qui partage et nulle part ailleurs : fermer cet onglet est l'effacement — pas une demande d'effacement. Le lien meurt en une seconde ou deux, et les lecteurs encore en train de regarder voient leur page se vider. Il n'y a pas de copie serveur avec son propre cycle de vie, pas de corbeille, pas de rétention de trente jours. Le brouillon que vous avez tapé reste dans votre propre navigateur pour la prochaine fois, et même cela se désactive avec le réglage éphémère.

Ce que cela n'arrête pas, c'est la possession. Un lecteur qui a copié le texte ou téléchargé le fichier pendant que le partage était ouvert l'a, exactement comme si vous le lui aviez remis par n'importe quel autre moyen. Aucun outil ne peut rappeler un envoi, et un outil qui le prétendrait vous mentirait sur l'ordinateur de quelqu'un d'autre. Arrêter gouverne l'avenir — personne de nouveau, rien de plus — et c'est la part qu'un service à copie stockée ne peut pas vous donner.

## L'entretien en ligne est le cas idéal

Un outil de passage de main veut les deux bouts présents, et l'entretien est le seul rendez-vous où la présence est garantie : vous vous regardez déjà. C'est aussi le moment où les voies à copie stockée coûtent le plus. Ce qui traverse le chat de la réunion atterrit dans la transcription de la plateforme, attachée à l'enregistrement et à quiconque le recevra ensuite ; et ouvrir une boîte mail ou une messagerie pour aller chercher un lien pendant que votre écran est partagé dépose votre correspondance sur l'enregistrement de quelqu'un d'autre. La page de partage montre la chose partagée, et rien d'autre.

En pratique : le lien du portfolio, le dépôt, le PDF de l'exercice, l'extrait de code qui ne survivrait pas aux guillemets typographiques de la fenêtre de chat — lancez le partage avant l'appel, et quand le moment vient, dites le nom à voix haute. `brave-otter-42` traverse un appel vocal intact, c'est exactement pour cela que les noms ont cette forme, et l'autre bout a le fichier avant la fin de la phrase. Laissé privé, le partage fait aussi de l'arrivée de votre interlocuteur quelque chose que vous approuvez en pleine conversation plutôt qu'une porte laissée ouverte ; et quand l'appel se termine, fermer l'onglet termine le partage avec lui — rien n'attend dans une transcription d'être relu hors contexte plus tard.

Une préparation honnête : les recruteurs sont plus souvent que la plupart des lecteurs sur des réseaux d'entreprise stricts, et c'est là que vit la rare paire sans chemin direct. Leur réseau ne se teste pas depuis chez vous — mais l'outil annonce l'échec en moins de vingt secondes au lieu de rester suspendu, et le plan de repli vous coûte alors quelques instants, pas l'entretien.

## Quand ce n'est pas le bon outil

Les deux côtés doivent être présents en même temps et l’onglet de partage doit rester ouvert. Le partage exige une connexion ; seul l’éditeur fonctionne hors ligne. Si Direct échoue sur un réseau mobile ou d’entreprise, l’hôte peut arrêter le partage et en créer un nouveau avec Cloud relay. Il envoie alors la nouvelle invitation, dont le lecteur accepte le mode avant de se connecter. Direct local n’utilise pas de relais. La suspension du navigateur et les règles de l’entreprise peuvent aussi interrompre une connexion avec relais.

Pour tout le reste — la note, le mot de passe, le fichier de configuration, la vidéo de 100 Mo à un saut de Wi-Fi — la version directe est plus rapide, plus simple, et laisse le monde exactement comme elle l'a trouvé.
