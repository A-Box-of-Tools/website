# Extraire l'audio d'une vidéo — le son seul, en WAV

Déposez une vidéo et repartez avec le son. L'image n'est jamais décodée, et rien n'est envoyé.

> Récupérez le son d'un MP4, MOV ou WebM et enregistrez-le en WAV. La vidéo ne quitte pas votre machine et son image n'est jamais décodée : tout le travail se fait dans votre propre navigateur.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/extraire-l-audio-d-une-video/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos vidéos. Il n'y a pas de serveur.

Le décodeur du navigateur ne lit que la piste audio. Le WAV est écrit localement en PCM 16 bits ou en flottant 32 bits. Cet outil ne contient ni encodeur MP3, ni téléversement, ni fonction réseau.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans limite de taille
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment extraire l'audio d'une vidéo sans l'envoyer

1. **Déposez la vidéo.** Un MP4, MOV, M4V ou WebM, venant d'un téléphone, d'un appareil photo, d'un enregistreur d'écran ou d'un téléchargement. C'est votre propre navigateur qui le lit ; il n'y a pas d'étape d'envoi à omettre.
2. **Lisez ce qui a été trouvé.** La durée, le nombre de canaux et la fréquence d'échantillonnage, directement tirés du fichier. Si le fichier n'a pas déclaré sa fréquence, la page le dit, plutôt que de rééchantillonner en silence en prétendant n'avoir rien touché.
3. **Choisissez le format et les canaux.** Le PCM 16 bits est le choix compatible par défaut. Choisissez le flottant 32 bits pour conserver les échantillons décodés sans arrondi ni écrêtage. Gardez les canaux inchangés pour les conserver ; le mono en fait la moyenne et divise les données stéréo par deux.
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

Cette page écrit du WAV plutôt que du MP3. Le MP3 exige un encodeur que cet outil ne fournit pas. Choisissez le PCM 16 bits compatible ou le flottant 32 bits ; aucun ne demande de téléversement. Le WAV est plus volumineux parce que son audio est non compressé ; un autre éditeur peut le compresser ensuite.

### L'image est-elle regardée à un moment ?

Non, et il n'y a rien ici qui pourrait la regarder. On remet le fichier au décodeur du navigateur en lui demandant sa piste audio ; la piste vidéo n'est jamais décodée, jamais dessinée et n'atteint même pas le code de cette page. Il n'y a dans `src/` aucun décodeur vidéo à exécuter. Le fichier qui sort contient du son et rien d'autre.

### Il dit qu'aucun son n'a pu être lu, mais la vidéo se lit très bien.

Alors la vidéo n'a presque certainement aucune piste audio. Un enregistrement d'écran fait sans micro sélectionné est muet, et un extrait exporté par un logiciel de montage avec le son coupé l'est aussi ; les deux se lisent parfaitement, parce qu'il y a une image à afficher. Le message nomme ce cas en premier parce que c'est le plus probable des deux ; l'autre est un format que ce navigateur ne lira pas. Ouvrez le fichier dans un lecteur et cherchez un réglage de volume qui ne fait rien : c'est le moyen le plus rapide de savoir lequel des deux vous avez.

### Quels formats vidéo puis-je ouvrir ?

Tout ce que votre navigateur décode, ce qui en pratique veut dire MP4, M4V, MOV et WebM, et tous les formats audio par ailleurs. Ce qui reste dehors est la même courte liste que partout ailleurs sur ce site : AVI, WMV et la plupart des MKV. Un fichier que votre navigateur ne lira pas est refusé avec un message qui le dit, plutôt que d'échouer à mi-chemin.

### Y a-t-il une perte de qualité ?

Le PCM 16 bits arrondit les échantillons décodés et écrête les valeurs au-delà de la pleine échelle. Choisissez le flottant 32 bits et gardez les canaux inchangés pour conserver les échantillons du décodeur, y compris ces valeurs. Le mono fait la moyenne des canaux. Le flottant ne répare pas les pertes déjà présentes dans la vidéo. La fréquence détectée dans le fichier est utilisée ; sinon la page indique la fréquence supposée.

### Pourquoi le WAV est-il tellement plus lourd que la vidéo ?

Le WAV est non compressé. À 44,1 kHz, le stéréo 16 bits prend environ dix mégaoctets par minute. Le flottant double les données des échantillons ; le mono divise les données stéréo par deux. La taille de sortie est affichée avant la fin du fichier.

### Quelle durée de vidéo peut-il traiter ?

Le fichier est lu et décodé en mémoire, où le WAV complet est aussi assemblé. Les longues prises peuvent dépasser la mémoire disponible ; les sorties dépassant la limite WAV de 4 Go sont refusées avant l’écriture des échantillons. Annuler abandonne une lecture en attente ou arrête le mixage et l’écriture par blocs. Le décodeur du navigateur peut continuer jusqu’à son retour, mais son résultat annulé est écarté.

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
- **Le format WAV précise sa fidélité.** Le PCM 16 bits arrondit et écrête les échantillons décodés pour favoriser la compatibilité. Le flottant 32 bits les conserve si les canaux restent inchangés. Le mono fait la moyenne des canaux. Les deux formats sont écrits sur cet appareil sans téléversement.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit quoi que ce soit sur votre vidéo : ni un fichier, ni un échantillon, ni un nom, une taille ou une durée.
- **Cela fonctionne hors ligne.** Débranchez le réseau et l'outil est inchangé, parce qu'il n'y a jamais eu d'étape réseau dedans. C'est la preuve la plus simple qui soit.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/audio-decode.js` pour l'unique décodeur qui existe ici et pourquoi l'image n'est jamais demandée, et `src/shared/samplerate.js` pour la lecture d'en-tête qui empêche votre enregistrement d'être rééchantillonné en silence.
