# Un agent IA peut-il utiliser ces outils ?

Les agents utilisent l’interface. Pour évaluer les données, vérifiez où tourne le navigateur, ce que l’agent transmet et les fonctions réseau.

Dernière mise à jour 12 octobre 2026

## La réponse courte

Un agent contrôlant un navigateur peut utiliser ces pages ordinaires : commandes nommées, choix de fichiers et téléchargements, sans compte du site. Son environnement doit permettre l’accès aux fichiers, API et permissions nécessaires. Caméra ou feuille de partage peuvent exiger votre participation.

Pour traiter les fichiers, la première question est **où le navigateur contrôlé s’exécute**. Vérifiez aussi ce que reçoit le service de l’agent et les récupérations ou partages volontaires. Un navigateur local ne résout pas ces trois questions.

## Deux sortes d'agents, une distinction

Les agents qui se servent d'outils viennent en deux formes, et la différence entre elles pèse plus que tout le reste de cette page.

**Un navigateur contrôlé localement** lit et traite sur cet appareil. L’outil local n’ajoute pas d’envoi pour traitement. L’agent peut néanmoins transmettre instructions, captures ou contexte à son prestataire selon son implémentation et ses réglages.

**Un navigateur cloud** s’exécute chez le prestataire. Un fichier joint pour l’utiliser là a déjà quitté votre appareil. Les outils le traitent dans ce navigateur et n’annulent pas l’envoi antérieur. Partage et remise aux applications sont des actions supplémentaires dans les deux environnements.

Précisez un navigateur local si le traitement doit rester sur l’appareil, vérifiez l’agent et autorisez séparément les transferts volontaires. [Taux et remise à la messagerie](https://abox.tools/fr/extraire-recus-factures/), [imports par URL](https://abox.tools/fr/images-en-video/), [partage](https://abox.tools/fr/partager-du-texte/) et [caméra](https://abox.tools/fr/remote-camera/) documentent leurs limites réseau.

## Comment confier une tâche à un agent

Les agents travaillent mieux avec le même brief qu'un collègue : l'outil, le fichier, et à quoi ressemble le travail fini. Quelques schémas qui marchent :

- **Nommez le résultat, pas seulement l'outil.** « Ouvre abox.tools/compresser-une-image/ et fais passer cette photo sous 200 Ko » donne à l'agent le chiffre que la page demandera. Le [compresseur d'images](https://abox.tools/fr/compresser-une-image/) prend une taille cible par son nom — exactement le genre de consigne qu'un agent peut porter fidèlement.
- **Montrez-lui la carte.** Ce site publie [llms.txt](https://abox.tools/llms.txt) — chaque outil et chaque guide, avec une ligne de description chacun, en texte brut et en une seule requête. Un agent qui le lit sait ce qui existe ici sans rien parcourir. Et chaque page a un jumeau à sa propre adresse, avec `index.md` à la fin : la page en Markdown, sans l'interface autour, pour un agent qui veut ce que dit la page d'un outil plutôt que ce à quoi elle ressemble.
- **Laissez-le lire la page où il se trouve.** Chaque outil porte ses questions et ses réponses dans la page même, et chaque outil a son guide à un lien de distance. À un agent qui semble hésiter sur un réglage, on peut dire de lire d'abord le guide — le conseil qu'on donnerait à une personne.
- **Précisez les contrôles entre étapes.** Pour scanner en PDF ou nettoyer des images, demandez ordre, recadrage, lisibilité et taille. OCR, masquage et choix des données à partager exigent jugement et contrôle du résultat.

## Ce qu'il ne faut pas déléguer

Les commandes ne sont qu’une partie de la tâche. Vérifiez les décisions qui changent ce qu’un autre peut voir ou recevoir. Deux exemples :

**Décider ce qui ne doit pas être vu.** Les outils de caviardage suppriment ce que vous couvrez — mais choisir quoi couvrir, c'est cela, le travail, et un agent qui manque une ligne a produit un fichier qui a l'air fini et ne l'est pas. Laissez un agent manœuvrer le caviardeur si vous voulez ; regardez le résultat vous-même avant qu'il n'aille où que ce soit — la règle même que les guides de ces outils donnent à l'opérateur humain.

**Ouvrir ce qui a été lu.** Le lecteur de QR codes de ce site refuse d'ouvrir ce qu'il décode, parce que lire et suivre sont deux actes différents. La même séparation vaut d'être imposée à un agent : un agent qui lit un code, un lien ou une adresse dans un fichier doit la rapporter, pas la visiter. Et un agent qui conduit votre propre navigateur tient tout ce à quoi ce navigateur est connecté — une raison de le regarder avec le même œil critique que n'importe quel outil, ce qui est l'objet de la section suivante.

## Un agent aussi peut vérifier la promesse

Les quatre vérifications que le guide sur [l'envoi de fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) enseigne — débrancher, regarder l'onglet Réseau, lire la Content-Security-Policy, lire le code — sont toutes à la portée d'un agent, et elles lui sont même plus faciles qu'à une personne : lire un en-tête CSP ou chercher les appels à `fetch` dans le source servi est un travail mécanique. Si vous faites vérifier les outils par un agent avant de leur faire confiance, ce site s'attend à être vérifié de la même façon — et le comportement hors ligne sur lequel reposent ces vérifications a [sa propre page](https://abox.tools/fr/guides/comment-une-page-web-peut-elle-fonctionner-hors-ligne/).

Les commandes sont nommées ; [llms.txt](https://abox.tools/llms.txt) et copies Markdown aident la lecture. Code, composants et moteurs sont publics. La compilation génère et minifie les pages ; comparez-la à la publication pour auditer. DevTools et diagnostics WebRTC dépendent de l’environnement de l’agent.

Ce guide ne garantit pas la confidentialité d’un prestataire d’agent. Instructions, captures et parfois fichiers peuvent partir même avec un navigateur local. Incluez ces chemins et les fonctions réseau dans la tâche ; le lieu du navigateur ne les prouve pas.
