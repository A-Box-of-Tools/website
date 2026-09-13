# Extraire l'audio d'une vidéo — le son seul, en WAV

Déposez une vidéo et repartez avec le son. L'image n'est jamais décodée, et rien n'est envoyé.

> Récupérez le son d'un MP4, MOV ou WebM et enregistrez-le en WAV. La vidéo ne quitte pas votre machine et son image n'est jamais décodée : tout le travail se fait dans votre propre navigateur.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/extraire-l-audio-d-une-video/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos vidéos. Il n'y a pas de serveur.

Le décodeur est celui que votre navigateur possède déjà, le même chemin de code qui lit un fichier dans un élément `<video>`, et on lui demande la piste audio et rien d'autre. Écrire un WAV consiste à poser un en-tête de quarante-quatre octets devant les échantillons, dans `src/shared/wav.js`. Il n'y a aucun encodeur dans la boucle, aucune étape d'envoi, et cette page n'a aucune fonction réseau d'aucune sorte.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans limite de taille
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment extraire l'audio d'une vidéo sans l'envoyer

1. **Déposez la vidéo.** Un MP4, MOV, M4V ou WebM, venant d'un téléphone, d'un appareil photo, d'un enregistreur d'écran ou d'un téléchargement. C'est votre propre navigateur qui le lit ; il n'y a pas d'étape d'envoi à omettre.
2. **Lisez ce qui a été trouvé.** La durée, le nombre de canaux et la fréquence d'échantillonnage, directement tirés du fichier. Si le fichier n'a pas déclaré sa fréquence, la page le dit, plutôt que de rééchantillonner en silence en prétendant n'avoir rien touché.
3. **Choisissez le mono si vous le voulez plus léger.** Laisser les canaux tels quels garde l'enregistrement exactement comme il était. Le mixage en mono divise le fichier par deux et c'est ce que veut une transcription ou un enregistrement de voix ; il fait la moyenne des canaux plutôt que d'en jeter un.
4. **Écoutez-le avant de l'enregistrer.** Le lecteur joue le fichier qui est sur le point d'être téléchargé, pas la vidéo : si cela sonne juste, le téléchargement est juste.
5. **Emportez-le, ou passez-le à la suite.** Téléchargez le WAV, ou envoyez-le directement au découpeur ou à l'éditeur sans l'enregistrer d'abord.

## Aussi dans la boîte

- [Découpeur audio](https://abox.tools/fr/couper-un-audio/): Marquez au vol les passages à garder. Ils vous reviennent en un seul fichier, coupé là où vous l'avez dit.
- [Éditeur audio](https://abox.tools/fr/modifier-un-audio/): La passer à l'envers, changer la vitesse, relever un enregistrement trop faible : tout cela ici, sur votre machine.
- [Fusion et division de PDF](https://abox.tools/fr/fusionner-des-pdf/): Des pages déplacées sans aller-retour vers un serveur.
- [Compresseur de PDF](https://abox.tools/fr/compresser-un-pdf/): Alléger un document sans l'envoyer où que ce soit.

## Questions

### Ma vidéo est-elle envoyée quelque part ?

Non. Le décodage et l'écriture se font tous deux dans votre propre navigateur, sur votre propre matériel. Cet outil n'a aucune fonction réseau d'aucune sorte — il ne récupère jamais rien et n'envoie jamais rien — et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, dont aucune ne nous appartient. Si vous préférez vérifier qu'on vous le dise, débranchez internet et récupérez le son quand même.

### Peut-il me donner un MP3 ?

Non, et il ne fera pas semblant. Aucun navigateur ne livre d'encodeur MP3, et le seul moyen d'en atteindre un est d'envoyer votre vidéo à un serveur qui en possède un — ce qui est précisément la seule chose que ce site existe pour ne pas faire. Ce que vous obtenez est un WAV : les échantillons avec un en-tête de quarante-quatre octets devant, ce qui ne demande aucun encodeur et ne peut coûter aucune qualité. Il est plus lourd, environ dix mégaoctets la minute en stéréo, et tout lecteur, téléphone ou éditeur l'ouvre. Ce qui veut un MP3 peut en faire un à partir de là en une seconde.

### L'image est-elle regardée à un moment ?

Non, et il n'y a rien ici qui pourrait la regarder. On remet le fichier au décodeur du navigateur en lui demandant sa piste audio ; la piste vidéo n'est jamais décodée, jamais dessinée et n'atteint même pas le code de cette page. Il n'y a dans `src/` aucun décodeur vidéo à exécuter. Le fichier qui sort contient du son et rien d'autre.

### Il dit qu'aucun son n'a pu être lu, mais la vidéo se lit très bien.

Alors la vidéo n'a presque certainement aucune piste audio. Un enregistrement d'écran fait sans micro sélectionné est muet, et un extrait exporté par un logiciel de montage avec le son coupé l'est aussi ; les deux se lisent parfaitement, parce qu'il y a une image à afficher. Le message nomme ce cas en premier parce que c'est le plus probable des deux ; l'autre est un format que ce navigateur ne lira pas. Ouvrez le fichier dans un lecteur et cherchez un réglage de volume qui ne fait rien : c'est le moyen le plus rapide de savoir lequel des deux vous avez.

### Quels formats vidéo puis-je ouvrir ?

Tout ce que votre navigateur décode, ce qui en pratique veut dire MP4, M4V, MOV et WebM, et tous les formats audio par ailleurs. Ce qui reste dehors est la même courte liste que partout ailleurs sur ce site : AVI, WMV et la plupart des MKV. Un fichier que votre navigateur ne lira pas est refusé avec un message qui le dit, plutôt que d'échouer à mi-chemin.

### Y a-t-il une perte de qualité ?

Rien au-delà de ce que la vidéo avait déjà fait subir à son propre audio au moment de sa création. Les échantillons rendus par le décodeur sont écrits tels quels : il n'y a pas de second encodage, donc pas de seconde génération de perte. La seule chose à savoir est la fréquence d'échantillonnage : celle du fichier est lue d'abord dans son en-tête et le décodage se fait à cette fréquence, si bien que votre enregistrement n'est pas rééchantillonné en silence. Si un fichier n'en déclare aucune, la page dit quelle fréquence elle a supposée.

### Pourquoi le WAV est-il tellement plus lourd que la vidéo ?

Parce qu'un WAV n'est pas compressé et que la piste audio de la vidéo l'était. Du son de qualité CD pèse environ dix mégaoctets la minute en stéréo, quel qu'en soit le contenu ; la piste AAC d'un MP4 en fait peut-être un dixième. Le mixage en mono divise cela par deux. C'est le prix de ne pas réencoder, et il se paie une fois : ce avec quoi vous ouvrirez le fichier ensuite pourra le compresser.

### Quelle durée de vidéo peut-il traiter ?

Aucune limite n'est inscrite ici, parce qu'aucun serveur ne la paie. Le plafond réel est la mémoire de votre propre machine : le fichier est lu en entier et toute la piste audio est conservée sous forme d'échantillons, si bien qu'un enregistrement très long sur une petite machine peut manquer de place. Quelques heures de vidéo passent ordinairement bien, et un téléphone en supportera moins qu'un portable.

### Puis-je le raccourcir ou monter le volume ?

Oui, mais pas ici : cette page fait un seul travail. Dès qu'il y a un résultat, une rangée de liens à côté du téléchargement l'emporte directement vers le [découpeur audio](https://abox.tools/fr/couper-un-audio/) ou l'[éditeur audio](https://abox.tools/fr/modifier-un-audio/) sans l'enregistrer d'abord, et sans que l'un ou l'autre ne l'envoie non plus.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni limite au nombre de vidéos que vous ouvrez. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre fichier.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, puis débranchez internet et elle continue de fonctionner. C'est aussi la façon la plus simple de prouver que rien n'est envoyé : un outil qui expédierait votre vidéo pour la traiter s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Votre vidéo n'a nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page peut contacter, et aucune ne nous appartient. Il n'y a ici aucun point de collecte où un fichier pourrait aboutir, et rien dans le code qui l'y enverrait s'il en existait un.
- **L'image n'est jamais décodée du tout.** Seule la piste audio est demandée. Les images ne sont ni lues, ni décodées, ni dessinées, ni regardées — il n'y a sur cette page aucun code qui le pourrait — et le fichier qui sort contient du son et rien d'autre. Ce n'est pas une promesse de retenue : on remet les octets à `decodeAudioData`, qui renvoie du son, et il n'y a dans `src/` aucun décodeur vidéo à exécuter.
- **Le décodeur est celui que votre navigateur possède déjà.** Rien n'est livré ici pour lire votre format, et rien hors de cette page n'est sollicité pour le lire non plus. Les fichiers qui fonctionnent sont donc exactement ceux que votre navigateur sait déjà lire.
- **Les échantillons sont écrits tels quels, pas réencodés.** Un WAV, ce sont les échantillons rendus par le décodeur avec un en-tête devant. Aucun encodeur ne prend de décision sur votre enregistrement, et il n'y a rien qu'on puisse appeler un envoi sur lequel cela se produirait.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit sur votre vidéo : ni un fichier, ni un échantillon, ni un nom, une taille ou une durée.
- **Cela fonctionne hors ligne.** Débranchez le réseau et l'outil est inchangé, parce qu'il n'y a jamais eu d'étape réseau dedans. C'est la preuve la plus simple qui soit.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/audio-decode.js` pour l'unique décodeur qui existe ici et pourquoi l'image n'est jamais demandée, et `src/shared/samplerate.js` pour la lecture d'en-tête qui empêche votre enregistrement d'être rééchantillonné en silence.
