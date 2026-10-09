# Déverrouiller un PDF — retirer le mot de passe et les restrictions

La plupart des PDF protégés n’exigent aucun mot de passe. Cet outil vous indique leur type avant de les modifier.

> Retirez mot de passe et restrictions d’impression, copie et édition dans votre navigateur. La plupart des fichiers protégés s’ouvrent sans mot de passe : la page distingue les deux cas. Aucun envoi ni tentative de deviner un mot de passe.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/deverrouiller-un-pdf/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos documents. Il n'y a pas de serveur.

Votre document est ouvert, déchiffré puis réécrit en mémoire sur votre appareil par le code de ce site. Aucun envoi possible ni serveur pour le recevoir. Ni fichier ni mot de passe ne quittent l’onglet.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment retirer mot de passe ou restrictions d’un PDF

1. **Choisissez le PDF.** Un document à la fois, lu depuis votre disque. L’outil essaie d’abord un mot de passe vide, suffisant pour la plupart des PDF protégés uniquement par des permissions.
2. **Lisez ce que la page a trouvé.** Elle indique le type de protection, le mécanisme et sa valeur actuelle, puis toutes les permissions : impression, copie, édition, commentaires, formulaires, réorganisation et même lecture à voix haute.
3. **Saisissez le mot de passe seulement si demandé.** Le champ apparaît si le mot de passe vide n’a pas ouvert le document. Celui d’ouverture ou celui du propriétaire convient. Rien n’est deviné, votre saisie reste dans l’onglet.
4. **Retirez la protection et lisez la vérification.** Le document est déchiffré avec sa clé puis réécrit sans dictionnaire de chiffrement. Le lecteur qui refuse les documents chiffrés le rouvre sans mot de passe. S’il échoue ou si le nombre de pages change, aucun téléchargement n’est proposé.

## La version longue

[Comment déverrouiller un PDF, et reconnaître son type de verrouillage](https://abox.tools/fr/guides/deverrouiller-un-pdf/): Un PDF qui refuse l’impression et un PDF qui refuse de s’ouvrir sont deux problèmes différents portant le même nom. Ce que chacun signifie, pourquoi l’un se retire en un clic tandis que l’autre ne peut pas être retiré sans son mot de passe, et comment les distinguer.

## Aussi dans la boîte

- [Protection PDF](https://abox.tools/fr/proteger-un-pdf/): Verrouillez un document sans le confier à un site pour le protéger.
- [Filigrane PDF](https://abox.tools/fr/filigrane-pdf/): Un scan qui indique sa destination ne peut pas être réutilisé ailleurs discrètement.
- [Caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/): Les lettres sont supprimées du fichier, puis le fichier est fouillé pour le prouver.
- [PDF en CSV](https://abox.tools/fr/pdf-en-csv/): Repère tous les tableaux d’un PDF et les transforme en lignes lisibles par un tableur.

## Questions

### Ai-je besoin du mot de passe ?

Souvent non : relevés, fiches de paie, rapports et PDF avec restrictions d’édition s’ouvrent à tous et portent seulement des permissions, retirables en un clic. La page l’indique dès le choix. Un document qui demande réellement un mot de passe à l’ouverture exige que vous le fournissiez.

### Peut-il ouvrir un PDF dont je n’ai pas le mot de passe ?

Non, il n’essaie pas. `src/shared/pdf-crypt.js` ne contient ni dictionnaire, liste de mots ni boucle de recherche par force brute. Même les anciennes clés de 40 bits, explorables, ne sont pas recherchées. Si le mot de passe est perdu, cette page ne le récupère pas.

### Quelle différence entre les deux mots de passe ?

Le mot de passe *utilisateur* ouvre le fichier. Celui du *propriétaire* lève les permissions d’impression, copie et édition. Un propriétaire peut en définir un sans mot de passe utilisateur : le PDF s’ouvre mais refuse l’impression. Cet outil accepte les deux et indique lequel l’a ouvert.

### Retirer les restrictions est-il légal ?

Cela dépend du document, de vos droits et de votre lieu. Le format les définit comme des permissions respectées par accord, pas une barrière cryptographique. Cet outil est destiné aux documents que vous avez le droit d’utiliser : votre relevé qui refuse l’impression, un rapport acquis, un scan à réorganiser. Retirer une restriction ne crée aucun droit sur le contenu.

### Quels chiffrements sont pris en charge ?

Tous les publiés : RC4 40 et 128 bits, révisions 2 et 3 ; AES-128, révision 4 ; AES-256 ancien de 2008 et PDF 2.0, révisions 5 et 6. Les certificats et une variante Adobe non publiée sont refusés avec un message précis.

### L’aspect du document change-t-il ?

Non. Instructions de dessin, polices et images sont copiées exactement. Le texte reste sélectionnable, les scans gardent leur résolution et rien ne bouge. Le poids peut diminuer car la réécriture abandonne les anciennes versions d’objets.

### Que devient un document signé ?

Toute modification invalide sa signature, qui couvre les octets exacts. L’outil écrit une nouvelle copie et vous avertit si l’original était signé. Gardez cet original signé.

### Mes documents ou mots de passe sont-ils envoyés ?

Non. Votre navigateur lit, déchiffre et écrit sur votre appareil. Le mot de passe sert à dériver la clé dans cet onglet. Aucun serveur : la `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. Déconnectez Internet et utilisez la page pour le vérifier.

### Comment savoir si la protection a disparu ?

Le résultat est relu sur votre appareil par le lecteur partagé, qui refuse les PDF chiffrés. Il doit s’ouvrir sans mot de passe avec le même nombre de pages. Un échec empêche le téléchargement. Vérifiez aussi les propriétés dans un autre lecteur : toutes les permissions doivent être autorisées.

### Y a-t-il une limite de taille, et cela coûte-t-il quelque chose ?

Aucune limite n'est écrite dans l'outil. La limite, c'est votre propre machine : le document est tenu en mémoire pendant le travail, un portable encaissera donc quelques centaines de mégaoctets sans broncher et peinera quelque part au-dessus. C'est gratuit, il n'y a ni compte, ni connexion, ni période d'essai. Le site porte de la publicité, et c'est elle qui le paie ; on ne donne rien aux annonces sur vos documents.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois puis déconnectez Internet : elle continue. Un outil envoyant votre document ailleurs pour le déverrouiller s’arrêterait.

## Comment cette promesse se vérifie

- **La plupart des PDF protégés ne sont pas réellement verrouillés.** Un *mot de passe d’ouverture* empêche vraiment la lecture : sans lui, cet outil n’ouvre rien. Les *restrictions* d’impression, copie et édition n’empêchent pas l’ouverture. Le fichier contient donc de quoi dériver sa clé, comme le fait votre lecteur. Les permissions sont un champ respecté par accord entre logiciels, documenté ainsi par Adobe. Les retirer ne casse pas un verrou : l’outil choisit de ne pas les appliquer. Il distingue les deux et ne demande un mot de passe que si nécessaire.
- **Aucun mot de passe n’est deviné.** Vous fournissez le mot de passe d’ouverture ou le document reste fermé. Aucun dictionnaire, liste de mots ni recherche sur les anciennes clés de 40 bits. C’est un choix explicite : tester des millions de mots de passe serait un autre outil. Le mot de passe d’ouverture comme celui du propriétaire sont acceptés.
- **Le mot de passe est saisi et utilisé ici.** Il sert à dériver une clé dans cet onglet seul. Il n’est ni stocké, conservé entre fichiers ni placé dans l’adresse. La `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. Un outil qui envoyait une requête après avoir reçu votre mot de passe exposerait ce que vous lui confiez.
- **Le résultat est rouvert avant téléchargement.** Les octets passent au lecteur partagé par [le compresseur](https://abox.tools/fr/compresser-un-pdf/), [la fusion](https://abox.tools/fr/fusionner-des-pdf/) et [le caviardage](https://abox.tools/fr/caviarder-un-pdf/), qui refuse les documents chiffrés. Il doit ouvrir sans mot de passe et retrouver le même nombre de pages. Tout chiffrement résiduel ou échec empêche le téléchargement.
- **Les pages ne sont ni rendues, réencodées ni réorganisées.** Seul le chiffrement est retiré. Instructions, polices et images sont conservées exactement : texte sélectionnable et recherchable, scans à leur résolution, aucune mise en page déplacée. Les anciennes versions d’objets abandonnées ne sont pas reprises, ce qui réduit souvent le poids.
- **Une signature numérique ne survit pas à la réécriture.** Une signature couvre les octets exacts du fichier. Toute réécriture l’invalide. La copie obtenue n’est plus signée et le résultat vous avertit si l’original l’était. Gardez l’original signé. Aucun outil ne peut contourner cette propriété.
- **La page indique la valeur réelle de la protection.** Un PDF en RC4 40 bits de 1998 et un PDF en AES-256 actuel affichent le même libellé de protection. La page nomme mécanisme, longueur de clé et révision, puis indique les modes cassés, dépassés ou actuels, information rarement visible dans un lecteur.
- **Les documents protégés par certificat sont refusés clairement.** Certaines clés résident dans une carte à puce ou un magasin de clés, pas dans un mot de passe. Ces documents sont refusés avec une explication. Un champ de mot de passe ne peut pas remplacer une clé privée.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure de Google ne reçoivent ni document, page, nom, poids, nombre de pages, mot de passe ni protection. Tout le code qui lit, déchiffre et écrit vient du site et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et va chercher sa police chez Google Fonts. C'est un lien et rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur vos documents. Rien ne se produit tant que vous ne cliquez pas, et ce vers quoi vous cliquez alors est le site de quelqu'un d'autre.
- **Cela fonctionne hors ligne.** Déconnectez le réseau : toutes les fonctions restent disponibles. Un outil envoyant le document ailleurs pour le déverrouiller s’arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/pdf-crypt.js` pour dériver la clé du document, sans boucle de recherche de mots de passe, et `src/shared/aes.js` et `src/shared/rc4.js` pour les deux chiffrements. Aucun de ces fichiers ni les lecteurs et rédacteurs ne contacte le réseau.
