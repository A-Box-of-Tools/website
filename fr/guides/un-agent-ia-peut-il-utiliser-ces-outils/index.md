# Un agent IA peut-il utiliser ces outils ?

Oui. Ce sont des pages web ordinaires, sans compte, sans captcha, aux commandes toutes étiquetées, et un agent les pilote comme il pilote le reste. La question qui mérite une page est celle d'en dessous : quand vous confiez une corvée de fichier à un agent, où va le fichier ? La réponse tient tout entière à l'endroit où tourne le navigateur de l'agent.

Dernière mise à jour 6 septembre 2026

## La réponse courte

Oui. Chaque outil ici est une page web ordinaire : un sélecteur de fichier, quelques commandes étiquetées, un bouton de téléchargement. Il n'y a aucun compte où se connecter, aucun captcha à résoudre, aucune étape qui exige un humain en particulier. Un agent IA muni d'un navigateur pilote ces pages comme il pilote n'importe quelle autre — et plusieurs choses que ce site fait déjà pour les personnes servent aux agents par surcroît ; la dernière section en fait la liste.

Mais « peut-il appuyer sur les boutons » est la petite question. Celle qui mérite une page : que devient la promesse de ce site — *votre fichier ne quitte jamais votre machine* — quand la machine qui appuie sur les boutons n'est pas vous ? La réponse est que la promesse survit parfaitement à la délégation, ou pas du tout, selon une seule chose : **l'endroit où tourne le navigateur de l'agent.**

## Deux sortes d'agents, une distinction

Les agents qui se servent d'outils viennent en deux formes, et la différence entre elles pèse plus que tout le reste de cette page.

**Un agent local** tourne sur votre machine : un assistant installé sur votre ordinateur, ou un agent qui conduit le navigateur que vous avez sous les yeux. Quand un agent de cette sorte ouvre un outil ici et lui tend votre fichier, le travail se fait là où il se fait toujours avec ces pages — dans un navigateur, sur votre matériel. Le fichier est lu depuis votre disque, traité dans la mémoire de votre navigateur, réécrit sur votre disque. La délégation n'a rien changé au chemin des octets. Une IA a choisi les réglages ; le fichier, lui, n'est jamais parti.

**Un agent en nuage** fait tourner un navigateur sur l'ordinateur de son fournisseur. Vous joignez un fichier à une conversation, l'agent travaille dans une machine virtuelle quelque part ailleurs, et tout ce qu'il fait avec ces outils se passe là-bas. Les outils tiennent encore exactement leur promesse — le fichier ne va pas plus loin que le navigateur où il se trouve — mais ce navigateur n'est pas le vôtre, et l'envoi a déjà eu lieu à l'instant où vous avez joint le fichier, avant qu'aucun outil ne soit ouvert. Aucune page ne peut défaire un envoi qui l'a précédée.

La question que ce site pose sans cesse — ce travail exige-t-il que mon fichier parte ? — ne disparaît donc pas quand un agent fait le travail. Elle recule d'un cran, vers le choix de l'agent. Un agent local pilotant un outil qui tient tout entier dans le navigateur est l'arrangement rare où déléguer ne coûte aucune vie privée : l'IA fait le travail, et le fichier reste à la maison.

## Comment confier une tâche à un agent

Les agents travaillent mieux avec le même brief qu'un collègue : l'outil, le fichier, et à quoi ressemble le travail fini. Quelques schémas qui marchent :

- **Nommez le résultat, pas seulement l'outil.** « Ouvre abox.tools/compresser-une-image/ et fais passer cette photo sous 200 Ko » donne à l'agent le chiffre que la page demandera. Le [compresseur d'images](https://abox.tools/fr/compresser-une-image/) prend une taille cible par son nom — exactement le genre de consigne qu'un agent peut porter fidèlement.
- **Montrez-lui la carte.** Ce site publie [llms.txt](https://abox.tools/llms.txt) — chaque outil et chaque guide, avec une ligne de description chacun, en texte brut et en une seule requête. Un agent qui le lit sait ce qui existe ici sans rien parcourir. Et chaque page a un jumeau à sa propre adresse, avec `index.md` à la fin : la page en Markdown, sans l'interface autour, pour un agent qui veut ce que dit la page d'un outil plutôt que ce à quoi elle ressemble.
- **Laissez-le lire la page où il se trouve.** Chaque outil porte ses questions et ses réponses dans la page même, et chaque outil a son guide à un lien de distance. À un agent qui semble hésiter sur un réglage, on peut dire de lire d'abord le guide — le conseil qu'on donnerait à une personne.
- **Les chaînes fonctionnent.** Les travaux que les guides d'enchaînement de ce site décrivent aux personnes — numériser puis assembler en [PDF](https://abox.tools/fr/images-en-pdf/) ; retirer les données [EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) puis redimensionner — sont ceux où les agents excellent, parce que la sortie de chaque étape est l'entrée de la suivante et que rien entre les deux ne demande de jugement.

## Ce qu'il ne faut pas déléguer

Un agent peut piloter chaque outil d'ici. À deux endroits, piloter n'est pas tout le travail, et le reste devrait demeurer chez vous.

**Décider ce qui ne doit pas être vu.** Les outils de caviardage suppriment ce que vous couvrez — mais choisir quoi couvrir, c'est cela, le travail, et un agent qui manque une ligne a produit un fichier qui a l'air fini et ne l'est pas. Laissez un agent manœuvrer le caviardeur si vous voulez ; regardez le résultat vous-même avant qu'il n'aille où que ce soit — la règle même que les guides de ces outils donnent à l'opérateur humain.

**Ouvrir ce qui a été lu.** Le lecteur de QR codes de ce site refuse d'ouvrir ce qu'il décode, parce que lire et suivre sont deux actes différents. La même séparation vaut d'être imposée à un agent : un agent qui lit un code, un lien ou une adresse dans un fichier doit la rapporter, pas la visiter. Et un agent qui conduit votre propre navigateur tient tout ce à quoi ce navigateur est connecté — une raison de le regarder avec le même œil critique que n'importe quel outil, ce qui est l'objet de la section suivante.

## Un agent aussi peut vérifier la promesse

Les quatre vérifications que le guide sur [l'envoi de fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) enseigne — débrancher, regarder l'onglet Réseau, lire la Content-Security-Policy, lire le code — sont toutes à la portée d'un agent, et elles lui sont même plus faciles qu'à une personne : lire un en-tête CSP ou chercher les appels à `fetch` dans le source servi est un travail mécanique. Si vous faites vérifier les outils par un agent avant de leur faire confiance, ce site s'attend à être vérifié de la même façon — et le comportement hors ligne sur lequel reposent ces vérifications a [sa propre page](https://abox.tools/fr/guides/comment-une-page-web-peut-elle-fonctionner-hors-ligne/).

Ce que ce site fait pour un agent, il le fait exprès et pour tout le monde : chaque commande est étiquetée, parce que les lecteurs d'écran ont besoin de noms et qu'un agent lit les mêmes noms ; les pages n'ont ni comptes, ni fenêtres surgissantes, ni murs de consentement à contourner ; le source est public et servi sans étape de compilation, si bien que le code qu'un agent audite est le code qui tourne ; et [llms.txt](https://abox.tools/llms.txt) est toute la boîte en une requête. Rien de tout cela n'a été ajouté pour les machines. Une page lisible pour une personne équipée d'un lecteur d'écran se révèle lisible pour tout le reste aussi.

Une limite honnête : cette page parle des agents qui utilisent ces outils, pas des agents eux-mêmes. Ce que voit le fournisseur d'un agent — vos consignes, vos captures d'écran, parfois vos fichiers — est une question à part, et l'habitude à laquelle ce groupe de guides revient sans cesse est le bon prisme pour elle aussi : demandez-vous ce qui doit réellement quitter votre machine, et dans quel état.
