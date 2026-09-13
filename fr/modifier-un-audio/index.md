# Éditeur audio — inverser, accélérer ou amplifier une piste

La passer à l'envers, changer la vitesse, relever un enregistrement trop faible : tout cela ici, sur votre machine.

> Passez une piste à l'envers, accélérez-la ou ralentissez-la, et relevez un enregistrement trop faible. Récupère aussi le son d'une vidéo. Tout se passe dans votre navigateur, sans le moindre envoi.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/modifier-un-audio/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos enregistrements. Il n'y a pas de serveur.

Votre fichier est lu, modifié et écrit par votre propre navigateur, sur votre propre matériel. Cet outil ne comporte aucune fonction réseau, si bien que rien ici ne sait aller chercher ni envoyer quoi que ce soit. Et quand bien même il en aurait une, il n'y a à l'autre bout de cette page aucun serveur à qui remettre un enregistrement.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans filigrane
- ✓ Vidéo en entrée, audio en sortie
- ✓ Fonctionne hors ligne

## Comment modifier un fichier audio

1. **Choisissez un fichier.** Déposez un MP3, un WAV, un FLAC, un M4A, un Ogg ou un Opus sur la zone prévue, ou bien une vidéo si ce que vous voulez, c'est le son qui est dedans. Le navigateur le lit directement sur votre disque, sans que rien parte où que ce soit pendant ce temps.
2. **Passez-la à l'envers, si c'est pour cela que vous êtes venu.** Une seule case. Les échantillons sont écrits du dernier au premier, ce qui est exactement réversible : faites-le deux fois et vous retrouvez le fichier de départ, échantillon pour échantillon.
3. **Réglez la vitesse.** Faites glisser le curseur, tapez un multiple, ou appuyez sur l'un des préréglages. Choisissez ensuite ce qui arrive à la hauteur : la tenir où elle est, ce que vous voulez pour un cours à 1,5×, ou la laisser suivre la vitesse, ce que fait une bande et ce qui fait monter ou descendre une voix.
4. **Réglez le niveau.** Indiquez un écart en décibels, ou demandez que l'enregistrement soit remonté jusqu'à ce que son moment le plus fort se pose juste sous le plafond. La page dit où ce moment atterrira avant que vous appuyiez sur quoi que ce soit, et vous prévient si le réglage choisi le pousserait au-delà de la pleine échelle.
5. **Enregistrez.** Le travail se fait sur votre propre matériel : la durée dépend donc de votre machine et non d'une file d'attente. Ce qui sort est un WAV, c'est-à-dire les échantillons eux-mêmes avec un en-tête devant, rejoué d'abord sur la page, puis remis directement aux téléchargements de votre navigateur.

## La version longue

[Comment nettoyer un mémo vocal avant de l'envoyer](https://abox.tools/fr/guides/nettoyer-un-memo-vocal/): Couper les blancs et les faux départs, puis remonter le niveau presque à pleine échelle. Deux outils du navigateur à la suite, dans l'ordre qui préserve la qualité, et l'enregistrement ne quitte jamais votre machine.

## Aussi dans la boîte

- [Fusion et division de PDF](https://abox.tools/fr/fusionner-des-pdf/): Des pages déplacées sans aller-retour vers un serveur.
- [Compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/): Alléger un document sans l'envoyer où que ce soit.
- [Caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/): Les lettres sont supprimées du fichier, puis le fichier est fouillé pour le prouver.
- [Images en PDF](https://abox.tools/fr/images-en-pdf/): Réunir vos images dans un seul document.

## Questions

### Mon audio est-il envoyé quelque part ?

Non. Il est lu, modifié et écrit par votre propre navigateur sur votre propre matériel. Cet outil n'a pas de côté serveur, et sa `Content-Security-Policy` énumère toutes les adresses que la page peut contacter, dont aucune n'appartient à ce site. Coupez votre connexion et inversez une piste quand même, si vous préférez vérifier plutôt qu'on vous le dise.

### Puis-je récupérer le son d'une vidéo ?

Oui, et c'est ici le même travail qu'ouvrir un MP3. Déposez un MP4, un MOV ou un WebM et seule sa piste audio est décodée : l'image n'est jamais lue, et ce qui sort est un fichier son sans vidéo dedans. Si c'est tout ce que vous voulez — le son, inchangé —, alors [Extraire l'audio d'une vidéo](https://abox.tools/fr/extraire-l-audio-d-une-video/) fait le même travail sur une page qui ne contient rien d'autre. Revenez ici quand le son doit aussi être modifié.

### Changer la vitesse change-t-il la hauteur ?

Seulement si vous le demandez. « Garder la hauteur » découpe l'enregistrement en fenêtres qui se chevauchent, d'une cinquantaine de millisecondes, et les repose plus serrées ou plus espacées, en choisissant chaque position pour que les ondes se rejoignent au croisement ; une voix reste ainsi la même voix à 1,5×. « La laisser suivre » rééchantillonne à la place, ce que fait une bande jouée plus vite : deux fois la vitesse, c'est exactement une octave au-dessus.

### Pourquoi enregistre-t-il un WAV plutôt qu'un MP3 ?

Parce qu'aucun navigateur n'embarque d'encodeur MP3, et que cet outil refuse d'envoyer votre enregistrement à un serveur qui en aurait un. Un WAV ne demande aucun encodeur, n'étant que les échantillons précédés d'un en-tête de quarante-quatre octets ; c'est donc à la fois l'option honnête et la seule qui ne puisse pas coûter de qualité. Il est plus gros, environ dix mégaoctets la minute en stéréo. Tous les lecteurs, téléphones et éditeurs en ouvrent un, et tout ce qui veut un MP3 peut en fabriquer un à partir de là.

### Quels formats puis-je ouvrir ?

Tout ce que votre navigateur décode, ce qui en pratique veut dire le MP3, le WAV, le FLAC, le M4A et l'AAC, l'Ogg Vorbis et l'Opus, et l'audio contenu dans les vidéos MP4, M4V, MOV et WebM. Ce qui reste dehors, c'est la même courte liste que partout ailleurs : l'AVI, le WMA et la plupart des MKV. Un fichier que ce navigateur refuse de lire est écarté avec un message qui le dit, plutôt que d'échouer à mi-course.

### Le monter plus fort va-t-il le distordre ?

Seulement si vous le poussez au-delà de la pleine échelle, et la page vous le dit avant. L'audio numérique a un plafond absolu : un échantillon ne peut pas être plus fort que la pleine échelle, si bien que tout ce qui dépasse est écrêté contre ce plafond, et c'est à cela que ressemble la distorsion. « Aussi fort que possible » est justement le réglage qui ne peut pas faire cela, puisqu'il calcule la marge qui reste à l'enregistrement et utilise exactement celle-là. En dessous du plafond, tout n'est que multiplication : montez de 6 dB, redescendez de 6 dB, et les échantillons sont là où ils étaient.

### Inverser une piste ou changer sa vitesse fait-il perdre de la qualité ?

Inverser, non : ce sont les mêmes échantillons qui ressortent dans l'autre ordre, ce qui est exact. Changer la vitesse déplace chaque échantillon, et relève donc de l'arithmétique plutôt que de la copie. Le rééchantillonneur filtre correctement en chemin, si bien qu'accélérer ne replie pas les aigus en un sifflement métallique, et les fenêtres de l'étireur sont posées là où les ondes se rejoignent plutôt que là où le calcul les aurait laissées. Aucun des deux chemins ne réencode quoi que ce soit, faute d'encodeur ici avec quoi réencoder.

### Y a-t-il une limite à la durée du fichier ?

Aucune limite n'est intégrée à l'outil. Le plafond pratique, c'est la mémoire : tout l'enregistrement est décodé d'un coup dans cette page, et un WAV est assemblé en mémoire avant que vous le téléchargiez ; une heure de stéréo demande donc un peu moins d'un gigaoctet pour travailler. Un WAV de quatre gigaoctets est refusé d'emblée, parce que le champ de taille du format lui-même ne sait pas en décrire un.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni filigrane. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre enregistrement.

## Comment cette promesse se vérifie

- **Vos enregistrements n'ont nulle part où aller.** La Content-Security-Policy énumère toutes les adresses que cette page peut contacter, et aucune n'appartient à ce site. Il n'existe ici aucun point de collecte où votre fichier pourrait aboutir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va rien chercher.** Cet outil n'a aucune fonction réseau : pas d'adresse à coller, rien à télécharger, aucun moteur récupéré à la première utilisation. Chaque octet qui touche à votre audio vient de cette origine, au chargement de la page.
- **Le décodeur est celui qui se trouve déjà dans votre navigateur.** Le fichier est remis à `decodeAudioData`, le code même qui joue une piste dans un élément `<audio>`. Rien n'est livré ici pour lire votre format, et rien n'est demandé non plus à quoi que ce soit en dehors de cette page pour le lire.
- **L'image d'une vidéo n'est jamais décodée.** Quand vous déposez une vidéo, seule sa piste audio est demandée. Les images ne sont ni lues, ni décodées, ni dessinées, ni regardées : aucun code de cette page ne le pourrait, et le fichier qui en sort contient du son et rien d'autre.
- **Les échantillons sont écrits, pas réencodés.** Un WAV, ce sont les échantillons que cette page a calculés avec un en-tête devant. Il n'y a dans la boucle aucun encodeur qui prendrait des décisions sur votre enregistrement, ni rien qu'on puisse décrire comme un envoi pour qu'il s'en produise un.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google. Ni l'un ni l'autre ne reçoit quoi que ce soit sur votre enregistrement : ni un fichier, ni un échantillon, ni un nom, une taille, une durée ou son niveau sonore. Chaque ligne qui lit, modifie et écrit est servie depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » dans l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et se compose avec Google Fonts. C'est un lien, rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur votre fichier.
- **Tout fonctionne hors ligne.** Coupez le réseau et tout, sur cette page, continue de fonctionner. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/audio-decode.js` pour les vingt lignes qui remettent votre fichier au décodeur du navigateur, `src/stretch.js` pour l'étirement temporel, `src/speed.js` pour le rééchantillonneur, et `src/shared/wav.js` pour l'en-tête posé devant les échantillons. Aucun d'eux n'importe la moindre chose capable d'émettre une requête.
