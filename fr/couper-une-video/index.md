# Couper une vidéo — couper une vidéo en ligne

Marquez les passages à garder pendant la lecture. Récupérez-les en une seule vidéo.

> Marquez les passages à garder et enregistrez-les dans une vidéo dans votre navigateur. La copie conserve les images encodées ; les coupes exactes et l’enregistrement réencodent. Sans envoi, fonctionne hors ligne.

Cette page est un outil interactif de navigateur à l’adresse https://abox.tools/fr/couper-une-video/. Les fichiers sont traités sur l’appareil qui exécute ce navigateur. Tout partage volontaire ou fonction réseau facultative est expliqué sur la page. Voici son explication écrite ; ouvrez l’adresse pour l’utiliser.

## Vos vidéos sont **traités dans votre navigateur**. Aucun envoi pour traitement.

Votre vidéo est lue, marquée, coupée et écrite par votre propre navigateur, sur votre propre matériel. Cet outil ne comporte aucune fonction réseau, si bien que rien ici ne sait aller chercher ni envoyer quoi que ce soit. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre une vidéo.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Autant de passages que vous voulez
- ✓ Copie sans perte si compatible
- ✓ Fonctionne hors ligne

## Comment couper une vidéo

1. **Choisissez une vidéo.** Déposez un MP4, un MOV, un M4V ou un WebM sur la zone prévue. Le navigateur le lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps. Déposez-en plusieurs et ils sont mis bout à bout, dans l'ordre où vous les avez posés.
2. **Lancez la lecture et marquez les passages voulus.** Appuyez sur `I` là où un passage doit commencer et sur `O` là où il doit finir. Faites-le autant de fois que vous voulez : chaque paire devient une ligne dans le tableau du dessous, et une bande sur la ligne de temps. `U` reprend la dernière, `Espace` lit et met en pause, et les flèches sautent de cinq secondes. Ralentissez la lecture si le moment est difficile à attraper.
3. **Retouchez les marques.** Chaque ligne peut être relue seule, recalée en tapant un temps exact, montée ou descendue dans l'ordre, ou supprimée. Les deux extrémités du passage sélectionné peuvent aussi être tirées le long de la ligne de temps. Le total en haut est la durée que fera la vidéo finie.
4. **Gardez-les, ou coupez-les.** Garder est le sens habituel : la vidéo finie, ce sont les passages que vous avez marqués, mis bout à bout dans l'ordre. Les couper est l'autre travail que les gens veulent et trouvent rarement ; marquez les publicités, les silences ou les faux départs, et ce qui reste est raccordé sans eux.
5. **Coupez, et téléchargez.** « Conserver chaque octet » déplace les images intactes. La première section peut inclure des images masquées depuis l’image clé précédente ; chaque section suivante doit commencer sur une image clé. « Couper exactement ici » décode et réencode toutes les images conservées pour respecter le minutage. La page annonce la méthode et son coût avant le lancement.

## La version longue

[Comment couper une vidéo sans la réencoder](https://abox.tools/fr/guides/couper-une-video/): Couper un clip n'a pas à perdre un seul octet de qualité. Pourquoi une coupe tombe parfois plus tôt que là où vous l'avez marquée, ce qu'une image clé vient y faire, et quand accepter un réencodage.

## Aussi dans la boîte

- [Recadreur de vidéos](https://abox.tools/fr/recadrer-une-video/): Ramener un clip à ce qui compte dedans.
- [Inverseur de vidéo](https://abox.tools/fr/inverser-une-video/): La dernière image en premier, le son avec.
- [Créateur de timelapse](https://abox.tools/fr/faire-un-timelapse/): Une heure de rushes en vingt secondes.
- [Extracteur d'image](https://abox.tools/fr/extraire-une-image-d-une-video/): Un arrêt sur image en pleine qualité, à n'importe quel instant.

## Questions

### Ma vidéo est-elle envoyée quelque part ?

Non. Elle est lue, marquée, coupée et écrite par votre propre navigateur sur votre propre matériel. Cet outil n'a pas de côté serveur, et sa `Content-Security-Policy` énumère toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site. Coupez votre connexion et coupez une vidéo quand même, si vous préférez vérifier plutôt qu'on vous le dise.

### Puis-je garder plusieurs passages d'une même vidéo ?

C'est fait pour cela. Appuyez sur `I` et `O` autant de fois que vous voulez pendant la lecture ; chaque paire devient une ligne, et la vidéo finie est l'ensemble des lignes mises bout à bout, tout le reste ayant disparu. La plupart des coupeurs en ligne vous donnent une seule paire de poignées et vous demandent quel unique passage garder, ce qui convient pour ébarber un clip et ne sert à rien du tout quand il s'agit de regarder une heure de rushes une fois et d'en garder les six moments qui valent la peine.

### Couper fait-il perdre de la qualité ?

« Conserver chaque octet » préserve les images et le son encodés, sans perte de qualité. Ce mode fonctionne pour une section ou pour plusieurs si chaque section suivante commence sur une image clé. « Couper exactement ici » réencode les images conservées et copie le son quand c’est possible. « Enregistrer pendant la lecture » réencode l’image et le son. La méthode choisie annonce ce qui se produira avant l’export.

### Pourquoi un passage commence-t-il plus tôt que là où je l'ai marqué ?

La première section copiée peut conserver des images de l’image clé précédente, nécessaires au décodage. Une marque de montage demande au lecteur de les sauter ; un lecteur qui l’ignore peut commencer trop tôt. Les navigateurs peuvent aussi mal gérer ces images à une jonction interne : la copie est désactivée si une section suivante commence entre deux images clés. Choisissez alors « Couper exactement ici ». Ce mode réencode chaque image conservée ; la page annonce la méthode et la durée initiale masquée avant l’export.

### Puis-je plutôt couper les publicités ?

Oui. Marquez-les, puis choisissez « Les couper » : c'est tout ce que vous n'avez *pas* marqué qui est raccordé, dans l'ordre. La même liste de marques répond aux deux questions : vous pouvez donc passer de l'une à l'autre et voir la durée changer sans rien marquer deux fois.

### Puis-je enregistrer mes marques et y revenir ?

Oui. « Enregistrer les marques » écrit un simple fichier texte, une ligne par passage, un début et une fin séparés par une virgule, et « Charger des marques » en relit un. Deux formats sont proposés, des secondes brutes et `HH:MM:SS.mmm`, et tous deux respectent la disposition qu'utilisent déjà les autres outils qui travaillent ainsi : un fichier écrit ici peut être donné à l'un d'eux, et un fichier écrit là-bas peut être déposé sur cette page. Marquer est un travail minutieux et personne ne devrait avoir à le faire deux fois.

### Quels formats vidéo puis-je couper ?

Le MP4, le M4V et le MOV sont lus directement, quel que soit leur contenu : H.264, HEVC, AV1 ou VP9. Recopier des images n'implique pas de les décoder, si bien que ce chemin fonctionne même pour un codec dont votre navigateur n'a aucun décodeur. Tout le reste que votre navigateur sait lire, à commencer par le WebM, est coupé en le jouant et en enregistrant le résultat, ce qui marche, prend le temps que dure le résultat, et ne peut garder qu'un seul passage. Un fichier que le navigateur ne sait ni lire ni jouer, ce qui en pratique veut dire l'AVI, le WMV, le FLV et la plupart des MKV, est refusé avec un message qui le dit, plutôt que d'échouer à mi-course.

### Y a-t-il une limite de taille ou de durée ?

Aucune limite n'est intégrée à l'outil, et sur le chemin par copie le fichier est à peine lu : les images que vous gardez sont pointées plutôt que chargées, si bien que garder quatre minutes d'un enregistrement de quatre gigaoctets coûte à peu près ce que coûte l'écriture de ces quatre minutes sur le disque. La coupe exacte parcourt le fichier quelques mégaoctets à la fois. Dans les deux cas, le plafond pratique est le fichier fini, assemblé en mémoire avant que vous le téléchargiez.

### Le son survit-il ?

Sur les deux chemins MP4, il est recopié échantillon par échantillon sans jamais être décodé, il est donc octet pour octet ce qu'il y avait dans le fichier, et une marque de montage garde chaque passage aligné sur son image au millième de seconde près. La seule exception est le raccordement de vidéos distinctes dont le son est décrit différemment, avec par exemple des fréquences d'échantillonnage qui diffèrent, car il n'y a alors aucun moyen de mettre les deux dans une seule piste sans les décoder, et la page le dit avant de le faire. Sur le chemin par enregistrement, il est capté à la lecture et réencodé. Dans les deux cas, une case permet de le laisser entièrement de côté.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre vidéo.

## Comment cette promesse se vérifie

- **Le traitement se fait dans ce navigateur.** L’outil traite entrées et résultats dans le navigateur. Son code ne les envoie pas pour traitement. Content-Security-Policy limite ressources et destinations, mais les hôtes autorisés peuvent recevoir des requêtes : elle n’inspecte pas les données et ne prouve pas seule une absence d’envoi. Comparez code et requêtes de l’opération ou terminez l’opération locale déconnecté.
- **Rien ici ne récupère quoi que ce soit.** Cet outil n'a aucune fonction réseau : pas d'adresse à coller, rien à télécharger, aucun moteur récupéré à la première utilisation. Chaque octet qui touche à votre vidéo vient de cette origine, au chargement de la page.
- **Sur le chemin normal, rien n'est même décodé.** En copie, les images encodées compatibles passent inchangées dans la sortie. La page garde des références aux octets originaux plutôt que de les décoder. Les coupes exactes et l’enregistrement décodent et réencodent l’image localement ; les commandes d’exportation indiquent ce choix.
- **Le fichier de marques est fabriqué dans la page.** Enregistrer vos marques écrit un fichier texte à partir des nombres déjà à l'écran, directement dans vos téléchargements. En charger un le lit ici. Ni l'un ni l'autre ne s'approche d'un réseau, et ni l'un ni l'autre ne transporte autre chose que des temps.
- **L’audio compatible est copié.** En copie MP4 et coupe exacte, les échantillons audio compatibles sont copiés inchangés. Joindre des clips au son incompatible peut le décoder, rééchantillonner et réencoder localement ; l’enregistrement réencode aussi le son. La page l’indique avant exportation. Aucun audio n’est envoyé.
- **Là où des images sont décodées, cela se passe ici.** La coupe exacte, et l'aperçu d'un fichier que ce navigateur refuse de jouer, passent par WebCodecs sur votre propre machine. C'est le décodeur même qui vous montrerait la vidéo de toute façon, tournant au même endroit.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur votre vidéo : ni un fichier, ni une image, ni un nom, une taille, une durée ou l'endroit où vous avez coupé. Chaque ligne qui lit, coupe et écrit est servie depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » dans l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et se compose avec Google Fonts. C'est un lien, rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur votre vidéo.
- **Cela fonctionne hors ligne.** Coupez le réseau et tout, sur cette page, continue de fonctionner. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/segments.js` pour les marques et le fichier où elles s'enregistrent, `src/shared/mp4-reader.js` pour le lecteur qui trouve les images dans un MP4, `src/ranges.js` pour l'arithmétique qui transforme une marque en une suite d'échantillons, et `src/copy.js` pour la boucle qui déplace ces échantillons dans le nouveau fichier. Aucun d'eux n'importe la moindre chose capable d'émettre une requête.
