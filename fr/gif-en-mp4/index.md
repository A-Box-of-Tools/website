# GIF en MP4 — la même animation dix fois plus légère

Chaque image, avec la durée que le GIF lui donne, en H.264 dans un MP4. Converti sur votre machine ; le fichier n’est jamais envoyé.

> Transformez un GIF animé en MP4 dans votre navigateur, pour une fraction de sa taille. Chaque image conserve sa durée d’origine ; aucun rééchantillonnage. Du H.264 dans un MP4, accepté partout. Aucun fichier n’est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/gif-en-mp4/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos GIF. Il n'y a pas de serveur.

Le GIF choisi est décodé, dessiné image par image, encodé et écrit en MP4 dans la mémoire de cette machine, avec l’encodeur de votre navigateur et le code servi depuis cette adresse. Rien ici ne peut envoyer de fichier, et aucun serveur ne peut en recevoir à l’autre bout de cette page.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment convertir un GIF en MP4

1. **Choisissez le GIF.** Un fichier à la fois. Le navigateur le lit directement sur votre disque et affiche sa taille, son nombre d’images, sa durée et ses dimensions en pixels.
2. **Lisez ce qui sera écrit.** Une ligne indique les dimensions, les images et leurs durées, la durée totale et le débit. Rien à régler sauf si le GIF contient des zones transparentes : un champ de couleur apparaît alors pour leur fond.
3. **Convertissez, puis lisez la confirmation de vérification.** Chaque image est dessinée et encodée, avec une barre de progression. Le fichier terminé est ensuite rouvert ici et doit contenir toutes les images pour la même durée que le GIF. Il se lit depuis la mémoire sous le téléchargement, en boucle, pour voir le raccord.

## La version longue

[Comment convertir un GIF en MP4, et pourquoi il devient beaucoup plus petit](https://abox.tools/fr/guides/convertir-un-gif-en-mp4/): Pourquoi la même animation en MP4 pèse dix fois moins qu’en GIF, ce qu’une vidéo ne peut pas conserver, pourquoi les délais entre les images comptent et comment convertir dans votre navigateur sans envoyer le fichier.

## Aussi dans la boîte

- [Vidéo en GIF](https://abox.tools/fr/video-en-gif/): Choisissez le passage, la taille et la cadence.
- [Créateur de GIF](https://abox.tools/fr/creer-un-gif/): Transformer une série d'images en une seule animation.
- [Découpeur de GIF](https://abox.tools/fr/decouper-un-gif-en-images/): Chaque image du GIF ressort en PNG.
- [Analyseur de GIF](https://abox.tools/fr/analyser-un-gif/): Images, durées, palettes, et où est passé chaque octet.

## Questions

### Pourquoi le MP4 est-il beaucoup plus petit ?

Un GIF stocke chaque image avec au plus 256 couleurs, sans mémoire de la précédente ; un codec vidéo stocke seulement les changements. H.264 a trente ans de pratique. La même animation occupe généralement dix fois moins de place, parfois moins, avec un meilleur rendu sans la limite de 256 couleurs. Un GIF minuscule ou presque immobile peut grossir ; la page l’indique.

### La durée sera-t-elle identique ?

Oui, image par image. Le GIF n’a que le délai propre à chaque image ; la vidéo le conserve exactement. Aucune image n’est rééchantillonnée, doublée ou supprimée. La seule convention est celle des navigateurs : un délai inférieur à deux centièmes de seconde est lu comme dix centièmes, pour la même durée qu’en navigateur. Le résultat est rouvert pour vérifier ces deux points.

### La vidéo tournera-t-elle en boucle ?

Le lecteur décide. Un GIF contient une instruction de répétition ; un MP4 n’en contient pas. La plupart des fils et messageries répètent une courte vidéo. L’aperçu ici boucle pour montrer le raccord. Un lecteur sur ordinateur la joue généralement une seule fois.

### Que deviennent les parties transparentes ?

Elles reçoivent une couleur, car une vidéo est un rectangle opaque. Le champ de couleur apparaît seulement pour les GIF qui ont des zones transparentes ; il est blanc par défaut, comme la plupart des pages. La couleur est dessinée derrière les images avant l’encodage et fait donc partie de la vidéo.

### Les dimensions de l’image changent-elles ?

D’un pixel seulement, si nécessaire. H.264 exige deux dimensions paires : une ligne de couleur de fond est ajoutée à une largeur ou hauteur impaire, sans rééchantillonnage. Un GIF plus large que 3840 pixels est ramené à cette largeur, acceptée par les encodeurs. La page affiche les dimensions prévues avant de commencer.

### Combien de temps faut-il ?

Quelques secondes pour un GIF ordinaire sur une machine avec encodeur matériel, comme la plupart des portables et téléphones récents ; plus longtemps sans lui. Le GIF est d’abord décodé en mémoire, et un très long GIF peut dépasser la limite d’un demi-gigaoctet d’images. La page l’indique. La barre montre l’image traitée ; Annuler arrête immédiatement sans écrire de fichier.

### Mes GIF sont-ils envoyés quelque part ?

Non. Votre navigateur lit, décode, encode et écrit le GIF sur votre matériel. La `Content-Security-Policy` nomme toutes les adresses joignables — aucune n’appartient à ce site. Déconnectez le réseau et utilisez la page pour le vérifier.

### Est-ce que cela marche sur téléphone ?

Oui, si le navigateur du téléphone peut encoder une vidéo ; l’encodeur matériel est rapide. La mémoire reste la limite : les images du GIF sont décodées d’abord, et un très long GIF peut dépasser la capacité du téléphone.

### Y a-t-il une limite de taille, et cela coûte-t-il quelque chose ?

La page arrête la lecture à un demi-gigaoctet d’images décodées, ce qui représente beaucoup d’images, et l’explique. C’est gratuit, sans compte, connexion ou essai. La publicité finance le site ; elle ne reçoit rien sur vos GIF.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois puis déconnectez Internet : elle continue de fonctionner. Cela prouve aussi qu’aucun fichier n’est envoyé ; un convertisseur distant s’arrêterait aussitôt.

## Comment cette promesse se vérifie

- **Pourquoi un MP4 est dix fois plus léger, et pourquoi les plateformes le préfèrent.** Un GIF stocke chaque image avec au plus 256 couleurs, sans tenir compte de la précédente. Un codec vidéo stocke les changements, en couleurs complètes, et H.264 a trente ans de pratique : la même animation occupe généralement dix fois moins de place, parfois moins, et paraît meilleure. C’est pourquoi les réseaux sociaux, messageries et systèmes de contenu refusent les gros GIF ou les transforment discrètement en MP4 à l’envoi — lorsqu’ils indiquent “GIF trop gros”, c’est un MP4 qu’ils attendent.
- **L’envoi est l’étape lente, et c’est celle qui disparaît.** Tout convertisseur en ligne demande d’abord le fichier : 30 Mo montent par votre connexion pour que 3 Mo reviennent, avant même de savoir qui garde le fichier. Cette page lit le GIF avec le code servi depuis cette adresse et écrit le MP4 avec l’encodeur du navigateur. Les octets ne vont que du disque à la mémoire, puis au disque. La `Content-Security-Policy` nomme chaque adresse joignable — aucune n’appartient à ce site — et la page fonctionne déconnectée.
- **La durée est conservée image par image, ce que beaucoup de convertisseurs ratent.** Un GIF n’a pas de cadence fixe. Chaque image précise sa durée, qui varie : un diaporama peut garder une photo deux secondes puis faire défiler dix images. Un convertisseur qui choisit une cadence et rééchantillonne double certaines images et en supprime d’autres ; le résultat saccade ou raccourcit. Ici, chaque image du GIF devient une image vidéo avec exactement son délai — avec la seule convention des navigateurs, qui lisent un délai inférieur à deux centièmes de seconde comme dix centièmes — puis le fichier est rouvert pour vérifier toutes les images et sa durée.
- **Deux choses qu’un GIF peut faire et qu’une vidéo ne peut pas, annoncées dès le départ.** Un GIF peut laisser voir ce qui se trouve dessous ; une vidéo est un rectangle opaque. Une couleur remplace donc les zones transparentes. La page la demande uniquement si le GIF en comporte, avec du blanc par défaut comme la plupart des pages. Un GIF indique aussi sa propre répétition ; un MP4 ne le fait pas, et le lecteur décide. La plupart des fils et messageries répètent les courtes vidéos. L’aperçu ici tourne en boucle pour montrer le raccord.
- **Ce que cela coûte à votre machine, clairement.** L’encodage dépend de votre machine : avec un encodeur matériel — la plupart des portables et des téléphones de la dernière décennie — quelques secondes pour un GIF ordinaire ; davantage sans lui. Toutes les images sont d’abord décodées en mémoire. Quelques mégaoctets de GIF deviennent un octet par pixel et par image. La page s’arrête à un demi-gigaoctet et l’explique, au lieu de faire planter l’onglet. Annuler reste toujours disponible.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts de publicité et de mesure proviennent de Google. Ils ne reçoivent rien sur votre GIF : ni fichier, ni image, ni nom, ni taille, ni durée. Chaque ligne qui le lit, l’encode ou l’écrit est servie depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l’en-tête est dessiné par un script de cdnjs.buymeacoffee.com et utilise Google Fonts. C’est un simple lien : il ne signale aucune visite et ne reçoit rien sur vous ou vos GIF. Rien ne se passe sans un clic, qui mène au site de quelqu’un d’autre.
- **Cela fonctionne hors ligne.** Déconnectez le réseau : tout sur cette page fonctionne encore. C’est la preuve la plus simple ; un outil qui envoyait votre GIF pour le convertir s’arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/plan.js` pour la conversion des délais du GIF en durées vidéo, `src/encode.js` pour le dessin et l’encodage, et `src/shared/gif-decode.js` pour la lecture. Aucun de ces fichiers n’accède au réseau, pas plus que le module d’écriture voisin.
