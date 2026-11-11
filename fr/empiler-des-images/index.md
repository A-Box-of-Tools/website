# Empileur d'images

Faites la moyenne d’une rafale stable, prenez la médiane pour un arrière-plan dégagé ou éclaircissez une séquence de ciel nocturne.

> Empilez des photos pour réduire le bruit, retirer les passants ou créer des filés d’étoiles. Alignez les prises et enregistrez en PNG ou JPEG dans le navigateur. Les fichiers RAW utilisent leurs aperçus JPEG intégrés.

Cette page est un outil interactif de navigateur à l’adresse https://abox.tools/fr/empiler-des-images/. Les fichiers sont traités sur l’appareil qui exécute ce navigateur. Tout partage volontaire ou fonction réseau facultative est expliqué sur la page. Voici son explication écrite ; ouvrez l’adresse pour l’utiliser.

## Vos photographies sont **traités dans votre navigateur**. Aucun envoi pour traitement.

Chaque prise est ouverte, décodée, alignée, combinée et écrite par votre propre navigateur, sur votre propre machine. Une pile de vingt fichiers RAW de 60 Mo, c'est environ un gigaoctet de photographies, et pas un octet ne bouge : l'outil n'a aucune fonction réseau, et les fichiers sont lus directement sur votre disque par un worker qui les traite localement sans les envoyer.

- ✗ Aucun envoi
- ✗ Aucun compte
- ✗ Aucun filigrane
- ✓ Lit le RAW
- ✓ Fonctionne hors ligne
- ✓ Code ouvert

## Comment empiler une série de photographies dans votre navigateur

1. **Choisissez les prises.** Une rafale, une série à l'intervallomètre ou un dossier de RAW avec des aperçus JPEG utilisables. Attendez la fin de l'ouverture des fichiers. Chaque ligne indique ce qui a été trouvé : pour un RAW, l'appareil et la taille réelle de l'aperçu intégré. Les fichiers impossibles à ouvrir sont listés pour vérifier lesquels ont été écartés.
2. **Prenez la méthode qui correspond à ce que vous cherchez à perdre.** Bruit : moyenne, ou écrêtage sigma pour rejeter les valeurs qui diffèrent des autres. Personnes, voitures ou avion : médiane, s'ils occupent chaque partie de la scène dans moins de la moitié des prises. Filés d'étoiles : éclaircir. Macro prise le long de la bague de mise au point : empilement de mise au point. La note sous le menu explique la méthode et ses limites.
3. **Décidez si les prises ont besoin d'être alignées.** Commencez avec Auto : il mesure décalage, rotation et échelle, puis corrige la perspective si des zones fiables réparties sur l'image concordent. Il est utile pour les étoiles à grand champ. Décalage seul demande moins de mesures pour une rafale stable. Choisissez Non si les prises sont déjà alignées, ou pour les filés d'étoiles qui doivent garder le mouvement du ciel. Un trépied fixe ne maintient pas les étoiles alignées. Chaque prise est mesurée par rapport à celle marquée comme référence, la première tant que vous n'en choisissez pas une autre. « Prendre comme référence » déplace la marque sans réordonner la liste.
4. **Lisez les quatre chiffres, puis appuyez sur le bouton.** Avant de commencer, la page affiche la taille prévue du résultat, la mémoire estimée de l'empilement, les décodages prévus pour empiler et les octets lus pendant l'inspection. Le fonctionnement interne du navigateur et la récupération de mémoire peuvent dépasser les tampons modélisés : ces chiffres sont un plan, pas une garantie d'usage total. Si des bandes sont nécessaires, la page suggère une résolution de travail plus petite. Ensuite, comparez la référence au résultat à la taille réelle des pixels et vérifiez les détails d'alignement avant de télécharger. Utilisez les liens à côté du téléchargement pour redimensionner ou compresser l’image terminée sans choisir à nouveau le fichier.

## La version longue

[Empiler des photos pour réduire le bruit, retirer des passants ou créer des filés d’étoiles](https://abox.tools/fr/guides/empiler-des-photos-contre-le-bruit/): Choisissez Moyenne pour une rafale plus propre, Médiane pour les passants ou Éclaircir pour les filés d’étoiles. Préparez des prises cohérentes, alignez, comparez et enregistrez, en comprenant les limites des aperçus RAW.

## Aussi dans la boîte

- [Caviardage d'image](https://abox.tools/fr/caviarder-une-image/): Ce que vous recouvrez est supprimé du fichier, pas dissimulé dedans.
- [Lecteur et effaceur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/): Voyez ce qu'une photo raconte sur vous. Puis retirez-le.
- [Visionneuse DICOM](https://abox.tools/fr/visionneuse-dicom/): Scanner, IRM, radio et échographie, avec le fenêtrage, l'en-tête et les mesures.
- [Image en ICO](https://abox.tools/fr/creer-un-favicon/): Une image en entrée. Toutes les tailles qu'un navigateur, Windows ou un Mac réclame, en sortie.

## Questions

### Mes photographies sont-elles envoyées quelque part ?

Non. Chaque prise est ouverte, décodée, alignée, empilée et écrite par votre propre navigateur, sur votre propre matériel. Cet outil n'a aucune fonction réseau, il ne va jamais rien chercher et n'envoie jamais rien, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, dont aucune ne nous appartient. Chargez la page une fois, débranchez-vous d'internet : elle continue de fonctionner. Cela compte ici plus que sur la plupart des outils, simplement à cause du volume : une pile de vingt prises RAW fait environ un gigaoctet, et envoyer un gigaoctet de photographies pour qu'on en fasse la moyenne est précisément ce que cet outil existe pour éviter.

### Quels formats RAW peut-il lire, et comment ?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL et les formats proches sont pris en charge si le fichier contient un aperçu JPEG utilisable. L'outil parcourt les répertoires et utilise le plus grand aperçu trouvé. Il peut être plus petit que l'image du capteur ou absent. **Les données du capteur ne sont pas décodées.** Les pixels gardent la balance des blancs et le style d'image de l'appareil, sur huit bits par canal. Vérifiez les dimensions dans la ligne. Le compteur d'inspection couvre les en-têtes et les répertoires ; le décodage lit aussi la tranche JPEG.

### Alors pourquoi ne pas décoder correctement les données du capteur ?

Le décodage du capteur demanderait un moteur RAW comme LibRaw ou dcraw et les compressions propres à chaque appareil. Un JPEG intégré garde cet outil petit et utilise le décodeur du navigateur. Cela impose aussi le rendu de l'appareil et la résolution de l'aperçu présent dans le fichier. Pour choisir vos réglages de développement RAW, développez d'abord les prises et exportez des JPEG ou PNG à empiler ici.

### Combien de prises peut-il traiter, et de quelle taille ?

Six des sept méthodes ont des accumulateurs dont la taille ne dépend pas du nombre de prises. Moyenne, éclaircir, assombrir, additionner et empilement de mise au point demandent une passe par bande ; l'écrêtage sigma en demande deux. La médiane garde les valeurs de chaque prise pour la bande actuelle, donc sa mémoire augmente avec le nombre de prises. Toute méthode peut être divisée en bandes si ses tampons dépassent le budget de l'outil, ce qui demande de décoder à nouveau les prises pour chaque bande. La page estime ces tampons et affiche les décodages prévus pour l'empilement. L'inspection et l'alignement ajoutent du travail, et les mécanismes internes des codecs et du GPU du navigateur peuvent demander plus de mémoire que l'estimation.

### Que fait réellement l'alignement des prises ?

L'outil mesure le décalage de chaque prise par rapport à la référence et la remet en place avec une précision inférieure au pixel. Il utilise la corrélation de phase : le décalage apparaît comme une différence de phase entre les spectres, donc une transformée de Fourier par image trouve un décalage de deux cents pixels aussi facilement qu'un de deux. Rotation et échelle sont retrouvées par le même procédé sur le spectre en coordonnées logarithmiques polaires. Auto mesure aussi des zones réparties sur l'image et corrige la perspective si suffisamment de mesures fiables concordent. Cela aide à aligner les étoiles d'un grand champ sur les bords comme au centre. Si cette correction supplémentaire ne peut pas être mesurée avec confiance, Auto garde rotation et échelle et indique cette correction sans perspective dans Détails d'alignement. La correction concerne toute l'image ; elle ne peut aligner ni un sujet mobile indépendant ni toutes les profondeurs d'une scène prise un pas plus loin sur le côté. Une prise décalée à gauche ne couvre plus le bord droit. Le résultat est donc recadré à la zone commune et peut être un peu plus petit, ce qui évite les bordures sombres des zones non couvertes.

### Quelle méthode dois-je utiliser ?

**Moyenne** contre le bruit si rien n'a bougé : le bruit aléatoire indépendant diminue environ de la racine carrée du nombre de prises. **Médiane** pour retirer ce qui occupe une partie de la scène dans moins de la moitié des prises. **Écrêtage sigma** fait la moyenne des valeurs proches de leur moyenne et rejette celles hors du seuil choisi. Il peut garder des objets mobiles dans une petite série ou s'ils apparaissent souvent ; la médiane est plus sûre si les retirer est la priorité. **Éclaircir** pour les filés d'étoiles, les feux d'artifice et le light painting. **Assombrir** contre les éléments clairs qui ont bougé. **Additionner** mélange de façon additive les prises décodées. Il agit sur des valeurs d'image de huit bits et ne reproduit pas une pose plus longue de l'appareil. **Empilement de mise au point** pour une macro prise le long de la bague de mise au point.

### Pourquoi mon résultat fait-il huit bits alors que mes RAW en font quatorze ?

L'entrée RAW est l'aperçu JPEG de l'appareil, et la sortie est un PNG ou JPEG de huit bits. Moyenne et écrêtage sigma utilisent des accumulateurs plus larges et arrondissent à la fin, pour estimer une valeur plus propre à partir de prises bruitées sans arrondir chaque étape. L'image enregistrée garde huit bits par canal ; elle ne gagne ni la profondeur ni la dynamique des données linéaires du capteur.

### Puis-je empiler des prises de tailles différentes, ou de plusieurs appareils ?

Oui, mais vérifiez que c'est voulu. La plus grande prise définit le cadre de travail ; les autres sont ajustées et centrées. Le résultat enregistré est recadré à la zone commune. Des formes différentes ou l'alignement peuvent donc le rendre plus petit que le cadre prévu. Mélanger des appareils mélange aussi leur rendu des couleurs. Gardez une exposition et un cadrage constants et utilisez la comparaison avec la référence pour examiner le résultat.

### Il dit que le passage se fera en bandes. Qu'est-ce que cela veut dire ?

La mémoire de travail nécessaire dépasse ce que l'outil veut réserver d'un coup. L'image est divisée en bandes horizontales, empilées une par une. La géométrie d'alignement et la méthode restent les mêmes ; le rééchantillonnage du navigateur peut varier légèrement au dernier bit. Les prises sont lues à nouveau pour chaque bande, donc le calcul prend plus de temps. La page indique combien de décodages cela demande. Baisser la résolution de travail d'un niveau divise la mémoire par quatre et permet presque toujours une seule passe. La note indique le réglage adapté.

### Pourquoi l’empilement s’exécute-t-il dans un Worker ?

Combiner de grandes images peut prendre plusieurs minutes. Un Worker se charge des calculs pendant que la page reste assez réactive pour mettre à jour la progression et répondre à Annuler. C’est un autre fil d’exécution de ce navigateur, qui exécute un fichier local sous la politique de la page. Vos photos restent sur cet appareil pendant qu’il travaille.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, sans compte, connexion, essai ni filigrane. Le service n'impose aucun quota de nombre ou de taille des prises. Les limites pratiques sont la mémoire de votre appareil, les limites du canevas et du décodeur du navigateur, et le temps nécessaire. La publicité finance la page et ne reçoit rien concernant vos photos.

## Comment cette promesse se vérifie

- **Le traitement se fait dans ce navigateur.** L’outil traite entrées et résultats dans le navigateur. Son code ne les envoie pas pour traitement. Content-Security-Policy limite ressources et destinations, mais les hôtes autorisés peuvent recevoir des requêtes : elle n’inspecte pas les données et ne prouve pas seule une absence d’envoi. Comparez code et requêtes de l’opération ou terminez l’opération locale déconnecté.
- **Les aperçus RAW sont lus sur cet appareil.** De nombreux RAW contiennent un aperçu JPEG rendu par l'appareil. Cet outil parcourt les répertoires du fichier et extrait le plus grand aperçu utilisable. Le chiffre de lecture pour inspection compte les en-têtes et répertoires lus pour le trouver et le décrire. Le décodage lit aussi la tranche JPEG. Les données du capteur ne sont jamais décodées, et la ligne indique les dimensions réelles de l'aperçu.
- **Le travail se fait dans un Worker sur cette machine, pas sur un serveur.** L’empilement peut durer des minutes ; un Worker calcule pendant que la page répond, affiche la progression et permet l’annulation. C’est un autre fil du navigateur : `src/worker.js`. Les références sont transmises localement sans envoyer les octets. Le Worker lit et combine les fichiers sur cet appareil. Examinez ce code sans prendre la politique de la page pour preuve de ses chemins de données.
- **Les événements de parcours comptent des étapes fixes.** Les événements de parcours du site peuvent compter des étapes fixes, comme l’ajout d’entrées, le lancement d’un empilement, un résultat prêt, un problème, une annulation ou l’enregistrement. Ils utilisent le nom de l’outil et des libellés d’étape fixes ; les événements de navigation utilisent des noms fixes de pages d’origine et de destination. Ils ne contiennent ni photos, ni noms de fichiers, ni données d’appareil photo, ni nombre d’images, ni dimensions, ni méthodes choisies, ni réglages, ni durées de traitement, ni contenu du résultat. La question facultative après un téléchargement envoie un pouce levé ou baissé et une raison fixe.
- **Il fonctionne hors ligne.** Débranchez-vous du réseau et l'outil ne change pas, parce qu'il n'y a jamais eu d'étape réseau dedans. Le worker et chaque module qu'il charge sont mis en cache par le service worker de cette page : une copie installée empile donc des fichiers RAW la prise débranchée.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/raw.js` explique comment trouver les aperçus RAW intégrés sans décoder le capteur, `src/stack.js` donne le calcul de chaque méthode et `src/plan.js` explique la mémoire de travail estimée et les décodages prévus de l'empilement. Le fonctionnement interne du navigateur et la récupération de mémoire peuvent ajouter de la mémoire au-delà des tampons modélisés.
