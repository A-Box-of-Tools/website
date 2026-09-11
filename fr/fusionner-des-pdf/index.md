# Fusionner des PDF — et diviser et réordonner les pages

Des pages déplacées sans aller-retour vers un serveur.

> Réunissez des PDF, divisez-en un en plusieurs et faites glisser les pages dans l'ordre voulu, le tout dans votre propre navigateur. Rien n'est envoyé, il n'y a pas de compte, et le fichier fini est rouvert et recompté avant de vous être proposé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/fusionner-des-pdf/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos documents. Il n'y a pas de serveur.

Chaque document que vous choisissez est ouvert, démonté et réécrit en mémoire sur cette machine, par du code servi depuis cette adresse. Rien ici ne peut déclencher un envoi, et il n'y a, à l'autre bout de cette page, aucun serveur pour le recevoir.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment fusionner, diviser ou réordonner un PDF

1. **Choisissez vos PDF.** Déposez-les sur le sélecteur ou allez les chercher à la main, et ajoutez-en d'autres plus tard : les pages de chaque fichier viennent se mettre au bout de l'ordre en cours, ce qui permet justement de fusionner deux dossiers séparément. Le navigateur les lit directement sur votre disque.
2. **Mettez les pages dans l'ordre voulu.** Faites glisser une page par sa poignée, ou déplacez-la avec les flèches. Tournez-en une qui a été scannée de travers, retirez-en une, ou tapez `1-3, 8, 12-` dans le champ pour garder, retirer ou tourner toute une série d'un coup. Les numéros se renumérotent au fur et à mesure, si bien que ce que vous voyez est toujours ce que sera le fichier fini.
3. **Dites si cela ressort en un document ou en plusieurs.** Un seul est la réponse habituelle. Le reste, ce sont des façons de découper : toutes les tant de pages, aux numéros de page que vous indiquez, un fichier par page, ou de retour dans les fichiers d'où les pages viennent. Plus d'un fichier est remis dans un seul ZIP, ce qui fait un enregistrement au lieu de cinquante.
4. **Construisez, et lisez la ligne qui dit que c'est vérifié.** Une fois les documents écrits, chacun est rouvert par le même lecteur, sur cette page, et ses pages sont comptées. Si cela ne correspond pas à ce que vous avez demandé, l'opération est signalée comme échouée et aucun téléchargement n'est proposé.

## La version longue

[Comment fusionner, diviser et réordonner des pages PDF](https://abox.tools/fr/guides/fusionner-et-diviser-des-pdf/): Réunir des PDF, en couper un en plusieurs et déplacer des pages : ce qui survit au remaniement, ce qu'aucun outil ne peut emporter, et pourquoi rien de tout cela n'exige d'envoyer vos documents quelque part.

## Aussi dans la boîte

- [Compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/): Alléger un document sans l'envoyer où que ce soit.
- [Caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/): Les lettres sont supprimées du fichier, puis le fichier est fouillé pour le prouver.
- [Images en PDF](https://abox.tools/fr/images-en-pdf/): Réunir vos images dans un seul document.
- [Scanner de documents](https://abox.tools/fr/scanner-un-document/): Photographiez la page. Vous récupérez quelque chose qui a l'air scanné.

## Questions

### Mes PDF sont-ils envoyés quelque part ?

Non. Ils sont lus, copiés et écrits par votre propre navigateur sur votre propre matériel. Cet outil n'a aucune partie serveur, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter : aucune ne nous appartient. Cet outil n'a strictement aucune fonction réseau, même optionnelle.

### Combien de fichiers puis-je fusionner, et de quelle taille ?

Aucune limite n'est inscrite dans l'outil. La limite, c'est votre machine : les documents sont gardés en mémoire pendant le travail, si bien qu'un portable fusionnera quelques centaines de mégaoctets sans broncher et peinera quelque part au-dessus. Rien n'est facturé, bridé, filigrané ni mis en file d'attente, parce qu'il n'y a personne à l'autre bout pour faire l'une de ces choses.

### Fusionner ou diviser fait-il perdre de la qualité ?

Non. Rien sur une page n'est réencodé, redessiné ni recompressé. Le flux de contenu de chaque page, ainsi que chaque police, image et dessin vectoriel auquel il renvoie, est copié octet pour octet : le texte reste sélectionnable et cherchable, et une photographie reste la même photographie. Les seules choses qui changent sont l'ordre des pages et la structure autour.

### Qu'advient-il des signets et des liens ?

Les deux sont reconstruits plutôt que supprimés. Un signet dont la page est toujours dans le résultat pointe là où cette page a été déplacée ; celui dont vous avez retiré la page disparaît, sauf s'il lui reste des entrées en dessous, auquel cas il subsiste comme titre. Fusionner plusieurs fichiers place les signets de chacun sous un titre portant son nom. Les liens entre pages sont suivis de la même façon, y compris les destinations nommées qu'écrivent Word et LaTeX, et un lien dont la cible n'a pas suivi reste sans effet plutôt que d'envoyer le lecteur au mauvais endroit. Les liens vers des adresses web sont conservés tels quels.

### Qu'est-ce qui n'est pas repris ?

Quatre choses, et l'outil le dit dans les résultats plutôt qu'en petits caractères. L'arbre d'ordre de lecture balisé qu'utilisent les lecteurs d'écran, les libellés de page (la numérotation « iii, iv, 1, 2 »), les pièces jointes intégrées, et toute action qui n'est ni « aller à une page » ni « ouvrir une adresse web », le JavaScript du document compris. Les deux premières décrivent un ordre qui n'existe plus une fois les pages déplacées ; la dernière n'est pas quelque chose que vous avez demandé d'emporter dans un fichier neuf. Si le balisage d'un document compte pour vous, gardez aussi l'original.

### Les formulaires remplis survivent-ils ?

Oui. Les champs de formulaire et ce qui y a été saisi accompagnent leurs pages, et le nouveau document est déclaré comme formulaire pour que les lecteurs le traitent comme tel. Une chose à savoir en fusionnant : deux champs portant le même nom ne font qu'un seul champ pour n'importe quel lecteur, si bien qu'en fusionnant deux copies du même formulaire, remplir une case sur une page la remplira sur l'autre. L'outil repère ce cas et le signale.

### Peut-il ouvrir un PDF protégé par mot de passe ?

Non, et c'est délibéré. Un document chiffré est refusé avec un message qui le dit, même quand le mot de passe est vide — ce qui est la façon dont beaucoup de scanners et de photocopieurs enregistrent. Retirer la protection d'un fichier est un travail différent du déplacement de ses pages, et un outil qui le ferait en silence ferait quelque chose que vous n'avez pas demandé.

### Pourquoi n'y a-t-il pas d'aperçu des pages ?

Parce que dessiner une page suppose un moteur de rendu PDF complet — polices, dégradés, groupes de transparence, modes de fusion — soit un mégaoctet ou plus de moteur à télécharger et à exécuter pour quelques vignettes. Ce que les tuiles montrent à la place, c'est ce sur quoi le réordonnancement travaille réellement : le numéro de page, la forme et la taille du papier, la rotation avec laquelle elle sera écrite, et le fichier d'où elle vient. Un scan à l'italienne au milieu d'une pile de pages verticales saute quand même aux yeux.

### Le fichier fini s'ouvrira-t-il partout ?

Oui. La sortie est écrite en PDF 1.5, ou dans la version la plus élevée qu'exigeait l'un des fichiers que vous avez donnés, et la 1.5 est comprise par tous les lecteurs livrés depuis 2003. L'outil le démontre d'ailleurs sur votre propre machine : il rouvre chaque fichier fini et compte ses pages en parcourant l'arbre des pages avant de vous le proposer.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni limite de taille au-delà de ce que permet la mémoire de votre machine. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur vos documents.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait vos documents ailleurs pour les fusionner s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Vos documents n'ont nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Cet outil n'ajoute rien à cette liste : il n'a aucune fonction réseau à lui, pas même optionnelle. Il n'existe ici aucun point de collecte où vos fichiers pourraient atterrir, ni rien dans le code qui les y enverrait s'il en existait un.
- **Fusionner est le travail qu'il vaut le plus la peine de ne pas envoyer.** Les documents que les gens réunissent sont précisément ceux qui viennent de quelque part : un contrat et sa page de signature, le scan d'un passeport et un relevé bancaire, un courrier médical et un formulaire de demande. Un service en ligne les a alors tous, au même endroit, déjà rassemblés. Celui-ci a une page dans votre navigateur, et pas d'autre moitié.
- **Le format entier est dans ce dépôt.** Un PDF, c'est une liste d'objets et une table indiquant où chacun commence. `src/objects.js` lit cette syntaxe, `src/reader.js` suit la table, `src/assemble.js` copie les pages d'un document à l'autre et `src/writer.js` écrit le résultat. Aucun des quatre n'importe quoi que ce soit capable de faire une requête. Aucune bibliothèque n'est téléchargée et rien n'est rendu sur un serveur.
- **Les fichiers chiffrés sont écartés plutôt qu'ouverts.** Un PDF protégé par mot de passe est refusé, y compris celui que produisent les scanners avec un mot de passe vide et qui s'ouvrirait techniquement. Retirer la protection d'un document est un travail différent du déplacement de ses pages, et le faire discrètement serait une initiative surprenante de la part d'un outil.
- **Le fichier fini ne dit rien de l'endroit où il a été fait.** Pas de ligne de producteur, pas de date de création, pas de nom d'outil. Il ne transporte pas non plus le paquet XMP ni les blocs privés qu'un logiciel de mise en page laisse derrière lui : ceux-là appartiennent au document qui existait avant, pas à celui que vous venez de construire. Tout ce qui se trouve dans les pages elles-mêmes est copié exactement : cet outil déplace des pages, il ne réécrit pas ce qu'il y a dessus.
- **Les actions qui ne sont pas « aller à une page » ne sont pas copiées.** Un PDF peut contenir des instructions qui s'exécutent à l'ouverture : joue ceci, envoie ce formulaire à telle adresse, exécute ce JavaScript. Les pages qui passent par cet outil gardent leurs liens vers d'autres pages et vers des adresses web, et perdent le reste. Réordonner les pages de quelqu'un n'est pas une raison d'emporter le scripting de son document dans votre nouveau fichier.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Aucun des deux ne reçoit quoi que ce soit sur vos documents : ni un fichier, ni une page, ni un nom, une taille ou un nombre de pages. Chaque ligne qui lit, copie ou écrit un PDF est servie depuis cette origine et figure dans le dépôt.
- **Ce que charge le bouton de don, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et prend sa typographie sur Google Fonts. Ce n'est rien de plus qu'un lien : il ne signale aucune visite et ne reçoit rien sur vous ni sur vos documents. Rien ne se produit tant que vous ne cliquez pas, et ce sur quoi vous cliqueriez alors est le site de quelqu'un d'autre.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout sur cette page continue de fonctionner. C'est la preuve la plus simple de toutes : un outil qui expédierait vos documents ailleurs pour les fusionner s'arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy et `src/assemble.js` pour toute la copie : comment une page est extraite d'un document et posée dans un autre, et ce qui est délibérément laissé de côté. Il ne peut pas atteindre le réseau, et le lecteur et l'écrivain à côté de lui non plus.
