# PDF en CSV — tous ses tableaux, relevés bancaires compris

Repère tous les tableaux d’un PDF et les transforme en lignes lisibles par un tableur.

> Transformez les tableaux d’un PDF en CSV : relevés bancaires et de carte, factures, tarifs, rapports. Chaque tableau de chaque page est repéré grâce à la position du texte ; les soldes courants imprimés sont comparés lorsque c’est possible. Aucun envoi.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/pdf-en-csv/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos documents. Il n'y a pas de serveur.

Le PDF choisi est ouvert et lu dans la mémoire de cette machine avec le code servi depuis cette adresse ; le CSV est écrit de la même manière. Rien ici ne peut envoyer de fichier, et aucun serveur ne peut en recevoir. Le contenu des tableaux — numéro de compte, solde, bénéficiaires, prix d’un client — reste dans l’onglet.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment transformer les tableaux d’un PDF en CSV

1. **Choisissez le PDF.** Un fichier à la fois. Le navigateur lit directement toutes ses pages sur votre disque avant de décider : l’écriture 1.240,00 ou 1,240.00 et l’ordre des dates concernent le document entier, pas une page isolée.
2. **Regardez les tableaux repérés.** Chaque tableau de chaque page conserve ses colonnes et ses en-têtes, si la page en possède. Un tableau continuant dans deux sections ou sur deux pages avec les mêmes en-têtes est réuni sans répéter ceux-ci au milieu. Les cellules sur plusieurs lignes sont rassemblées. Totaux, sous-totaux et libellés restent des lignes à part entière.
3. **Choisissez-en un ou prenez-les tous.** S’il y a plusieurs tableaux, la commande au-dessus choisit lesquels mettre dans le CSV : tous à la suite ou un seul. Pour un solde courant, la ligne indique les comparaisons concordantes et les lignes non vérifiées. Les dates avec année deviennent YYYY-MM-DD et les montants des nombres signés simples ; une date sans année reste telle qu’imprimée, car son année serait une supposition.
4. **Récupérez le CSV.** Le fichier respecte RFC 4180 — guillemets corrects et fins de ligne CRLF — en UTF-8 avec marque d’ordre des octets, pour qu’Excel conserve les symboles monétaires. Si tous les tableaux sont réunis, chacun garde son en-tête et une ligne vide les sépare. Aucun fichier n’a été envoyé pour le produire.

## La version longue

[Peut-on envoyer un relevé bancaire sans risque ?](https://abox.tools/fr/guides/envoyer-un-releve-bancaire-est-il-sur/): Un relevé rassemble tous les bénéficiaires, tous les montants et votre solde dans un seul fichier. Voici ce qu’un convertisseur reçoit, ce que les services attentifs en font et comment déterminer si l’envoi était nécessaire.

## Aussi dans la boîte

- [Images en PDF](https://abox.tools/fr/images-en-pdf/): Réunir vos images dans un seul document.
- [Scanner de documents](https://abox.tools/fr/scanner-un-document/): Photographiez la page. Vous récupérez quelque chose qui a l'air scanné.
- [Extraire l'audio d'une vidéo](https://abox.tools/fr/extraire-l-audio-d-une-video/): Déposez une vidéo et repartez avec le son. L'image n'est jamais décodée, et rien n'est envoyé.
- [Découpeur audio](https://abox.tools/fr/couper-un-audio/): Marquez au vol les passages à garder. Ils vous reviennent en un seul fichier, coupé là où vous l'avez dit.

## Questions

### Comment repère-t-il les tableaux alors qu’un PDF n’en contient pas ?

Grâce à la position du texte. Une colonne de petits caractères à côté du contenu est d’abord séparée : les cellules d’un tableau partagent exactement une ligne de base, contrairement aux annotations voisines. Chaque zone est parcourue de haut en bas, puis découpée aux titres et espaces. Les colonnes correspondent aux positions où plusieurs cellules commencent ou finissent ensemble. Les blocs ayant les mêmes colonnes sont réunis. Aucun modèle par banque ou formulaire n’est nécessaire.

### Fonctionne-t-il uniquement avec les relevés bancaires ?

Non. Le convertisseur a été reconstruit pour repérer tous les tableaux : son premier vrai relevé contenait deux opérations et cinq autres tableaux, et une recherche limitée aux opérations ne trouvait rien. Factures, tarifs, horaires, résultats et rapports comportent les mêmes tableaux. Un relevé ajoute un solde courant ; lorsqu’il est lisible, l’outil compare les variations nettes entre soldes.

### Que devient une description trop longue pour sa colonne ?

Elle est réunie à sa ligne, ce qui corrige un défaut courant des conversions PDF en CSV. Une ligne contenant une seule cellule de texte, proche d’une autre ligne, prolonge cette cellule. Elle rejoint celle du dessous si elle en est plus proche, comme un long libellé imprimé au-dessus de sa valeur. Une ligne à plusieurs cellules, ou contenant un nombre, reste indépendante.

### Que m’indique le contrôle du solde courant ?

Il compare la somme des montants entre deux soldes lisibles à leur différence, puis compte les concordances. Les mêmes calculs repèrent les colonnes probables de solde et montant sans dépendre des en-têtes. La page liste les lignes non vérifiées : avant le premier solde, après le dernier ou dans des intervalles incomplets ou illisibles. Une cellule débit ou crédit inutilisée et vide vaut zéro ; une valeur illisible ne vaut pas zéro. Des soldes concordants n’excluent pas les erreurs compensées et ne vérifient ni descriptions ni dates. Comparez le CSV au PDF avant de vous y fier.

### Mes dates sont inversées : 03/04 signifie le 4 mars, pas le 3 avril.

Changez la commande au-dessus des tableaux : tout est recalculé immédiatement. L’outil résout les dates numériques ambiguës depuis le document, pas votre localisation. Un jour supérieur à douze suffit à établir l’ordre de toutes les dates, et la page l’indique. Si tous les jours sont inférieurs ou égaux à douze, elle explique *cette ambiguïté* et choisit le jour d’abord jusqu’à votre modification. Une date sans année, courante sur les relevés de carte, reste telle qu’imprimée.

### Fonctionne-t-il sur un PDF numérisé ?

Non ; il l’explique au lieu de fournir un fichier vide. Un scan est une photographie, sans texte à aligner. La page propose alors d’autres méthodes. Pour un relevé, la première est souvent négligée : presque toutes les banques en ligne fournissent directement le même relevé en CSV, OFX ou QIF, sans conversion et plus précisément qu’une lecture d’image.

### Peut-il ouvrir un PDF protégé par mot de passe ?

Non, volontairement. Les banques verrouillent souvent les relevés avec une date de naissance ou des chiffres de compte. Retirer cette protection est un autre travail. L’outil refuse donc le fichier et propose des méthodes locales. La meilleure est le [déverrouilleur PDF](https://abox.tools/fr/deverrouiller-un-pdf/) du site : il retire le mot de passe dans votre navigateur sans modifier les pages, et préserve la position du texte. Imprimer depuis Chrome ou Edge en PDF ou exporter depuis Aperçu sur Mac fonctionne aussi. N’utilisez aucun autre site de déverrouillage — il recevrait exactement le document que cette page garde hors d’Internet.

### Mon PDF est-il envoyé quelque part ?

Non. Votre navigateur lit le fichier et écrit le CSV sur votre matériel. L’outil n’a pas de serveur, et la `Content-Security-Policy` nomme chaque adresse joignable — aucune n’appartient à ce site. Déconnectez Internet puis convertissez un PDF pour le vérifier.

### Pourquoi un caractère étrange apparaît-il au début du CSV ?

C’est une marque d’ordre des octets, volontaire. Sans elle, Excel sur Windows utilise l’ancienne page de codes du système et peut remplacer les symboles euro ou livre par des lettres. La marque indique UTF-8. Les lecteurs usuels l’ignorent ; un analyseur très strict peut rendre le premier en-tête précédé d’un caractère invisible. C’est le compromis choisi.

### Y a-t-il une limite de taille, et cela coûte-t-il quelque chose ?

L’outil n’impose aucune limite. Votre machine fixe la capacité : le document est gardé en mémoire pendant sa lecture, et un portable traite généralement plusieurs centaines de pages. C’est gratuit, sans compte, connexion ou essai. La publicité finance le site et ne reçoit rien sur vos documents.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez une fois la page, puis déconnectez Internet : elle continue de fonctionner. C’est aussi une preuve simple qu’aucun fichier n’est envoyé ; un convertisseur distant s’arrêterait aussitôt.

## Comment cette promesse se vérifie

- **Les PDF à convertir sont ceux qu’on peut le moins se permettre d’envoyer.** Personne n’a besoin de convertir un tableau facile à retaper. Ici arrivent relevés, factures, fiches de paie et rapports : tous les bénéficiaires d’un paiement et ce qui restait après, les prix d’un client, les chiffres d’une entreprise. Confier cela à un serveur inconnu pour obtenir un tableur lui donne ces données, qu’il peut garder et qui en font une cible. Cette page n’a pas d’autre moitié : il n’y a nulle part où les envoyer.
- **Un solde courant contrôle les variations nettes, avec des limites explicites.** Repérer un tableau dans un PDF repose sur des déductions : les limites des colonnes et le regroupement des lignes peuvent être erronés. L’outil compare les montants entre deux soldes lisibles à leur différence. Il indique les comparaisons concordantes et les lignes non vérifiées, y compris avant le premier solde, après le dernier ou dans un intervalle illisible. Une concordance est un indice utile, pas la preuve que chaque valeur est correcte : des erreurs compensées peuvent passer. Sans solde reconnu, aucun contrôle n’est effectué.
- **Les tableaux sont déduits de la page, sans modèle par banque ou formulaire.** L’outil n’a aucune liste de banques ou de mises en page, donc aucun modèle absent. Une colonne de petits caractères à côté du contenu principal est séparée, puis chaque zone est examinée pour trouver des cellules alignées. Cela fonctionne pour un relevé d’une banque inconnue ou un rapport inédit, mais peut échouer si les colonnes se chevauchent réellement.
- **Les mots de passe ne sont pas retirés ici ; la page indique où le faire.** Un PDF protégé est refusé. Retirer sa protection est un autre travail que lire ses tableaux ; le faire silencieusement serait surprenant. La page propose des méthodes qui gardent le fichier sur votre machine : le [déverrouilleur PDF](https://abox.tools/fr/deverrouiller-un-pdf/) du site, qui retire le mot de passe dans votre navigateur sans réécrire les pages, ou une impression en PDF depuis le navigateur ou Aperçu. Elle indique aussi de ne confier le document à aucun autre site de déverrouillage — c’est précisément l’envoi qu’elle évite.
- **Il ne peut pas lire une photographie de page et ne prétend pas le faire.** Un scan est une image : ses lignes sont des pixels, sans texte à aligner. L’outil l’indique et propose des solutions sans envoi. Pour un relevé, la première est souvent oubliée : la banque fournit presque toujours directement le même document en CSV. Reconnaître les lettres d’une image relève de l’OCR, un autre outil.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts de publicité et de mesure proviennent de Google. Ils ne reçoivent rien sur votre document : ni fichier, ni tableau, ni ligne, ni nombre, ni nom, ni nombre de pages. Tout le code lisant un PDF ou écrivant un CSV est servi depuis cette origine et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et va chercher sa police chez Google Fonts. C'est un lien et rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur vos documents. Rien ne se produit tant que vous ne cliquez pas, et ce vers quoi vous cliquez alors est le site de quelqu'un d'autre.
- **Cela fonctionne hors ligne.** Déconnectez le réseau : tout sur cette page fonctionne encore. C’est la preuve la plus simple ; un outil qui envoyait votre document pour le convertir s’arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/layout.js` pour la séparation de la page en zones sans lignes tracées, `src/tables.js` pour le repérage des tableaux et colonnes, `src/rows.js` pour l’assemblage des lignes, et `src/check.js` pour les calculs comparant les soldes. Aucun de ces modules n’accède au réseau, pas plus que leur lecteur sous-jacent.
