# Couper un audio — découper un enregistrement en ligne

Marquez au vol les passages à garder. Ils vous reviennent en un seul fichier, coupé là où vous l'avez dit.

> Écoutez un enregistrement et marquez au passage chaque morceau qui mérite d'être gardé, puis enregistrez ces morceaux en un seul fichier. Coupes à l'échantillon près, aucun clic aux raccords, rien d'envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/couper-un-audio/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos enregistrements. Il n'y a pas de serveur.

Votre enregistrement est lu, marqué, coupé et écrit par votre propre navigateur, sur votre propre matériel. Rien ici ne peut aller chercher ou envoyer quoi que ce soit : cet outil ne comporte aucune fonction réseau. Et même s'il en avait une, il n'y a, à l'autre bout de cette page, aucun serveur à qui envoyer un enregistrement.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Autant de passages que voulu
- ✓ Coupe exactement où vous avez marqué
- ✓ Fonctionne hors ligne

## Comment couper un fichier audio

1. **Choisissez un enregistrement.** Déposez un fichier MP3, WAV, FLAC, M4A, Ogg ou Opus sur le sélecteur, ou une vidéo si c'est un morceau de son que vous voulez. Le navigateur le lit directement sur votre disque et le dessine sous forme d'onde ; rien ne part nulle part pendant ce temps.
2. **Écoutez, et marquez les passages voulus.** Appuyez sur `I` là où un passage doit commencer et sur `O` là où il doit finir. Faites-le autant de fois que vous voulez : chaque paire devient une ligne dans le tableau du dessous et une bande sur l'onde. `U` annule la dernière, `Espace` lit et met en pause, les flèches sautent cinq secondes, et avec `Maj` elles avancent de dix millisecondes. Ralentissez la lecture si le moment est difficile à attraper.
3. **Retouchez les repères.** Chaque ligne peut être écoutée seule, recalée en tapant une durée exacte, montée ou descendue dans l'ordre, ou supprimée. Les deux extrémités du passage sélectionné peuvent aussi être glissées le long de l'onde, ce qui est la façon la plus rapide de poser un repère sur le silence plutôt que sur la respiration qui le précède. Le total en haut correspond à la durée de l'enregistrement fini.
4. **Les garder, ou les retirer.** Garder est le sens habituel : l'enregistrement fini, ce sont les passages marqués, mis bout à bout dans l'ordre. Les retirer est l'autre besoin, fréquent et rarement satisfait : marquez les « euh », le téléphone qui sonne ou les faux départs, et ce qui reste est recollé sans eux.
5. **Coupez, puis téléchargez.** Chaque coupe tombe sur l'échantillon que vous avez marqué ; il n'y a ici aucun arrondi à une image clé, puisque le son n'en a pas. La seule chose à choisir est la longueur du fondu à poser sur chaque raccord : cinq millisecondes suffisent à supprimer un clic et sont bien trop courtes pour s'entendre comme un fondu. Ce qui ressort est un WAV, d'abord lu dans la page, puis remis directement aux téléchargements de votre navigateur.

## La version longue

[Comment couper un audio sans perdre en qualité](https://abox.tools/fr/guides/couper-un-fichier-audio/): Où tombe vraiment une coupe audio, pourquoi elle peut être exacte alors qu'une coupe vidéo ne le peut pas, pourquoi un raccord claque parfois, et ce que fait réellement un fondu de cinq millisecondes.

## Aussi dans la boîte

- [Éditeur audio](https://abox.tools/fr/modifier-un-audio/): La passer à l'envers, changer la vitesse, relever un enregistrement trop faible : tout cela ici, sur votre machine.
- [Fusion et division de PDF](https://abox.tools/fr/fusionner-des-pdf/): Des pages déplacées sans aller-retour vers un serveur.
- [Compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/): Alléger un document sans l'envoyer où que ce soit.
- [Caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/): Les lettres sont supprimées du fichier, puis le fichier est fouillé pour le prouver.

## Questions

### Mon audio est-il envoyé quelque part ?

Non. Il est lu, marqué, coupé et écrit par votre propre navigateur sur votre propre matériel. Cet outil n'a aucune partie serveur, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter : aucune ne nous appartient. Si vous préférez vérifier plutôt qu'être cru sur parole, coupez la connexion et découpez un enregistrement quand même.

### Puis-je garder plusieurs passages du même enregistrement ?

C'est fait pour cela. Appuyez sur `I` et `O` autant de fois que vous voulez pendant la lecture ; chaque paire devient une ligne, et le fichier fini est l'ensemble des lignes mises bout à bout, tout le reste ayant disparu. La plupart des découpeurs en ligne vous donnent une seule paire de poignées et demandent quel unique segment garder : parfait pour ébarber un jingle, et totalement inutile pour écouter une heure d'entretien une fois et garder les six réponses qui valent quelque chose.

### La coupe tombe-t-elle exactement là où je l'ai marquée ?

Oui, sur chaque passage et dans tous les lecteurs. C'est le seul endroit où l'audio est plus simple que la vidéo : un enregistrement décodé est une suite de nombres et chacun se suffit à lui-même, il n'existe donc aucun équivalent d'image clé sur lequel arrondir, ni aucune raison qu'une coupe démarre en avance. La page affiche le numéro d'échantillon auquel le résultat commence, c'est-à-dire votre repère multiplié par la fréquence d'échantillonnage et arrondi à l'échantillon entier le plus proche.

### Pourquoi un raccord claquerait-il, et à quoi sert le fondu ?

Parce que couper du milieu d'un mot au milieu d'un autre met côte à côte deux formes d'onde sans rapport, et un haut-parleur à qui l'on demande de sauter de l'une à l'autre produit un clic. Ce n'est pas un défaut de la coupe : c'est le bruit que fait une discontinuité. Le remède est un fondu de quelques millisecondes de part et d'autre de chaque raccord : assez long pour que la membrane suive, bien trop court pour être perçu comme un fondu. Cinq millisecondes par défaut, et cela se désactive. Un fondu n'est posé que sur un bord qui est réellement une coupe : un bord tout au début ou tout à la fin de l'enregistrement reste donc exactement tel quel.

### Puis-je plutôt retirer les mauvais passages ?

Oui. Marquez-les, puis choisissez « Les retirer » : tout ce que vous n'avez *pas* marqué est recollé à la place, dans l'ordre. La même liste de repères répond aux deux questions, vous pouvez donc passer de l'une à l'autre et voir la durée changer sans rien marquer deux fois.

### Puis-je enregistrer mes repères et y revenir ?

Oui. « Enregistrer les repères » écrit un fichier texte — une ligne par passage, un début et une fin séparés par une virgule — et « Charger des repères » en relit un. Deux formats sont proposés, les secondes brutes et `HH:MM:SS.mmm`, et tous deux sont la mise en forme qu'écrit le découpeur vidéo de ce site : un fichier fait sur la vidéo peut donc être déposé sur son audio, et inversement. Le marquage est un travail minutieux, et personne ne devrait avoir à le refaire.

### Quels formats puis-je ouvrir ?

Tout ce que votre navigateur décode, ce qui en pratique veut dire MP3, WAV, FLAC, M4A et AAC, Ogg Vorbis et Opus, ainsi que l'audio contenu dans les vidéos MP4, M4V, MOV et WebM. Ce qui reste dehors est la même courte liste que partout ailleurs : AVI, WMA et la plupart des MKV. Un fichier que ce navigateur ne saura pas lire est refusé avec un message qui le dit, plutôt que d'échouer à mi-parcours.

### Pourquoi enregistre-t-il un WAV plutôt qu'un MP3 ?

Parce qu'aucun navigateur ne livre d'encodeur MP3, et que cet outil refuse d'envoyer votre enregistrement à un serveur qui en aurait un. Un WAV n'a besoin d'aucun encodeur — ce sont les échantillons avec un court en-tête devant — c'est donc à la fois l'option honnête et la seule qui ne puisse pas coûter de qualité à la sortie. Il est plus lourd : environ dix mégaoctets par minute en stéréo. Tous les lecteurs, téléphones et logiciels de montage l'ouvrent, et ce qui réclame un MP3 peut en fabriquer un à partir de lui. Découper un MP3 en recopiant ses trames garderait le fichier léger, mais déplacerait chaque coupe à la limite de trame la plus proche : exactement l'arrondi que cet outil existe pour éviter.

### Y a-t-il une limite à la durée de l'enregistrement ?

Aucune limite n'est inscrite dans l'outil. Le plafond réel est la mémoire : l'enregistrement entier est décodé d'un coup dans cette page, et le WAV est assemblé en mémoire avant le téléchargement, si bien qu'une heure de stéréo demande un peu moins d'un gigaoctet pour travailler. Un WAV de quatre gigaoctets est refusé d'emblée, parce que le champ de taille du format lui-même ne peut pas en décrire un.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre enregistrement.

## Comment cette promesse se vérifie

- **Vos enregistrements n'ont nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Il n'existe ici aucun point de collecte où votre fichier pourrait atterrir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va chercher quoi que ce soit.** Cet outil n'a aucune fonction réseau : pas d'adresse à coller, rien à télécharger, aucun moteur chargé à la première utilisation. Chaque octet qui touche votre audio est venu de cette origine au chargement de la page.
- **Le décodeur est celui que votre navigateur possède déjà.** Le fichier est confié à `decodeAudioData`, le même code qui lit une piste dans un élément `<audio>`. Rien n'est livré ici pour lire votre format, et rien n'est demandé non plus à quoi que ce soit d'extérieur à cette page pour le lire.
- **L'image d'une vidéo n'est jamais décodée.** Quand vous déposez une vidéo, seule sa piste audio est demandée. Les images ne sont pas lues, pas décodées, pas dessinées et pas regardées : il n'existe sur cette page aucun code qui le pourrait, et le fichier qui ressort ne contient que du son.
- **La coupe est une copie, en mémoire, sur cette machine.** Couper, c'est un `set` par passage et par canal : les échantillons que vous avez gardés sont déplacés dans un nouveau tableau, dans l'ordre où vous les avez mis. Les seuls échantillons multipliés par quoi que ce soit sont les quelques centaines de chaque fondu, et la page vous dit combien avant que vous n'appuyiez sur le bouton.
- **Les échantillons sont écrits, pas réencodés.** Un WAV, ce sont les échantillons que cette page détient, avec un en-tête devant. Il n'y a aucun encodeur dans la boucle pour prendre des décisions sur votre enregistrement, ni rien qu'on puisse appeler un envoi pendant lequel cela arriverait.
- **Le fichier de repères est fabriqué dans la page.** Enregistrer vos repères écrit un fichier texte à partir des nombres déjà affichés à l'écran, directement dans vos téléchargements. En charger un le lit ici. Ni l'un ni l'autre n'approche d'un réseau, et ni l'un ni l'autre ne transporte autre chose que des durées.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Aucun des deux ne reçoit quoi que ce soit sur votre enregistrement : ni un fichier, ni un échantillon, ni un nom, une taille, une durée, ni l'endroit où vous avez coupé. Chaque ligne qui lit, coupe et écrit est servie depuis cette origine et figure dans le dépôt.
- **Ce que charge le bouton de don, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et prend sa typographie sur Google Fonts. Ce n'est rien de plus qu'un lien : il ne signale aucune visite et ne reçoit rien sur vous ni sur votre enregistrement.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout sur cette page continue de marcher. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/segments.js` pour les repères et le fichier dans lequel ils sont enregistrés, `src/shared/audio-decode.js` pour les vingt lignes qui confient votre fichier au décodeur du navigateur, `src/trim.js` pour le calcul qui transforme un repère en une plage d'échantillons et la boucle qui les copie, et `src/shared/wav.js` pour l'en-tête qui se place devant. Aucun d'eux n'importe quoi que ce soit capable de faire une requête.
