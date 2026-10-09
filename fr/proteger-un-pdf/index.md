# Protéger un PDF — mot de passe et restrictions à votre choix

Verrouillez un document sans le confier à un site pour le protéger.

> Ajoutez un mot de passe à un PDF ou limitez l’impression et la copie dans votre navigateur. AES-256 par défaut, aucun envoi, résultat rouvert ici pour vérifier le mot de passe avant téléchargement.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/proteger-un-pdf/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos documents. Il n'y a pas de serveur.

Votre document est ouvert, chiffré puis écrit en mémoire sur votre appareil par le code de ce site. Aucun envoi possible ni serveur pour le recevoir. Ni le fichier ni le mot de passe ne quittent l’onglet.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment protéger un PDF par mot de passe ou restrictions

1. **Choisissez le PDF.** Un document à la fois, lu directement depuis votre disque. Un mot de passe existant conduit au déverrouilleur ; des restrictions seules sont acceptées et remplacées par vos réglages.
2. **Définissez le mot de passe et confirmez-le.** C’est le vrai verrou. Sans ce mot de passe, le document ne s’ouvre pas et aucun outil ici ne le récupère. Les deux champs doivent correspondre. Laissez-les vides pour limiter uniquement les permissions d’un document ouvert à tous.
3. **Cochez les restrictions souhaitées.** Impression, copie de texte et d’images, modification : ce sont des demandes, pas un verrou. Un mot de passe propriétaire les lève. Vide, le mot de passe d’ouverture sert aux deux rôles. Sans mot de passe défini, une valeur aléatoire oubliée empêche leur levée par un champ vide.
4. **Protégez et lisez la vérification.** Le document est chiffré sous une nouvelle clé puis rouvert sans mot de passe, où il doit être refusé, et avec le vôtre, où il doit garder le même nombre de pages. Un échec empêche le téléchargement et affiche un message.

## La version longue

[Comment protéger un PDF par mot de passe, et ce que cette protection vaut réellement](https://abox.tools/fr/guides/proteger-un-pdf/): Un mot de passe sur un PDF est un véritable verrou. Une restriction d’impression est une demande. Ce que chacun fait, quel chiffrement choisir, pourquoi l’envoi du document est la partie étrange des outils en ligne et ce qui arrive si vous oubliez le mot de passe.

## Aussi dans la boîte

- [Filigrane PDF](https://abox.tools/fr/filigrane-pdf/): Un scan qui indique sa destination ne peut pas être réutilisé ailleurs discrètement.
- [Caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/): Les lettres sont supprimées du fichier, puis le fichier est fouillé pour le prouver.
- [PDF en CSV](https://abox.tools/fr/pdf-en-csv/): Repère tous les tableaux d’un PDF et les transforme en lignes lisibles par un tableur.
- [Extracteur de reçus et factures](https://abox.tools/fr/extraire-recus-factures/): Lisez les photos, vérifiez les champs et les recadrages, puis envoyez les images compressées avec chaque montant et les totaux.

## Questions

### Un PDF avec mot de passe est-il vraiment sûr ?

Avec AES-256 et le hachage PDF 2.0 par défaut, sa sécurité dépend du mot de passe, sans raccourci connu. Les cinq générations PDF ne se valent pas : une clé de 40 bits de 1994 est explorable par un ordinateur portable, mais les lecteurs utilisent le même libellé. Cette page écrit le mode actuel et explique le mode ancien.

### Quelle différence entre mot de passe et restrictions ?

Le mot de passe *utilisateur* bloque réellement l’ouverture. Le mot de passe *propriétaire* lève les *restrictions* d’impression, copie et édition. Un PDF ouvert sans mot de passe contient de quoi dériver sa clé : les lecteurs choisissent de respecter les permissions. Le [déverrouilleur PDF](https://abox.tools/fr/deverrouiller-un-pdf/) les ignore. Les restrictions expriment vos souhaits ; le mot de passe les fait respecter pour l’ouverture.

### Que faire si j’oublie le mot de passe ?

Le document est perdu. `src/shared/pdf-crypt.js` ne comporte aucune boucle de recherche de mots de passe, et le mode actuel ne se récupère pas honnêtement sans le connaître. Les deux saisies préviennent les erreurs. Gardez votre original, non modifié.

### Faut-il choisir AES-256 ou AES-128 ?

AES-256, sauf si un lecteur antérieur à 2010 doit ouvrir le fichier. PDF 2.0 est lu par Acrobat X et suivants, navigateurs, téléphones et lecteurs actuels. AES-128 est le mode de 2005, affaibli par sa dérivation de clé de 1994 plutôt que par AES lui-même. En cas de doute, choisissez 256.

### Puis-je protéger un PDF déjà protégé ?

Oui s’il s’ouvre sans mot de passe : vos restrictions remplacent les anciennes. Sinon, utilisez d’abord le [déverrouilleur PDF](https://abox.tools/fr/deverrouiller-un-pdf/), puis revenez avec la copie. Le format ne peut pas empiler deux verrous : changer un mot de passe exige de retirer puis remettre la protection.

### L’aspect du document change-t-il ?

Non. Dessins, polices et images sont conservés exactement puis chiffrés. Avec le mot de passe, le texte reste sélectionnable, les scans gardent leur résolution et rien ne bouge. Le poids peut diminuer en supprimant les anciens objets, ou augmenter de seize octets par flux chiffré.

### Que devient un document signé ?

Sa signature est invalidée, comme toute modification des octets couverts, même par le logiciel signataire. Cet outil écrit une nouvelle copie et vous avertit. Pour les deux protections, chiffrez d’abord, puis signez le résultat.

### Mes documents ou mots de passe sont-ils envoyés ?

Non. Votre navigateur lit, chiffre et écrit sur votre appareil. Le mot de passe sert à dériver une clé dans cet onglet. Aucun serveur : la `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. Déconnectez le réseau et utilisez la page pour le vérifier.

### Comment savoir si la protection est active ?

Le fichier est relu deux fois sur votre appareil. Sans mot de passe, il doit être refusé ; avec le vôtre, il doit retrouver pages et permissions. Un échec empêche le téléchargement. Vérifiez aussi dans un lecteur : demande de mot de passe et permissions dans les propriétés.

### Y a-t-il une limite de taille, et cela coûte-t-il quelque chose ?

Aucune limite n'est écrite dans l'outil. La limite, c'est votre propre machine : le document est tenu en mémoire pendant le travail, un portable encaissera donc quelques centaines de mégaoctets sans broncher et peinera quelque part au-dessus. C'est gratuit, il n'y a ni compte, ni connexion, ni période d'essai. Le site porte de la publicité, et c'est elle qui le paie ; on ne donne rien aux annonces sur vos documents.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois puis déconnectez Internet : elle continue. Un outil envoyant votre document ailleurs pour le chiffrer s’arrêterait.

## Comment cette promesse se vérifie

- **L’outil pour lequel un envoi irait contre le but.** Un document à protéger est précisément celui qu’on ne veut pas confier à d’autres. Les outils en ligne demandent souvent l’original ouvert puis votre mot de passe, sans visibilité sur la conservation. Ici, le navigateur lit le fichier, dérive la clé dans l’onglet et écrit la copie en mémoire. La `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. L’outil fonctionne déconnecté.
- **Un mot de passe verrouille. Une restriction demande.** Un *mot de passe d’ouverture* chiffre vraiment le contenu avec une clé dérivée, sans stocker le mot de passe dans le fichier. Les *restrictions* d’impression, copie et édition sont différentes : un document ouvert à tous contient nécessairement de quoi dériver sa clé. Le lecteur respecte volontairement un champ de permissions et peut l’ignorer, comme Adobe le documente et comme le fait le [déverrouilleur PDF](https://abox.tools/fr/deverrouiller-un-pdf/). Elles expriment vos souhaits et la plupart des lecteurs les suivent, sans être un verrou.
- **AES-256 actuel, sauf demande explicite du mode ancien.** Le chiffrement PDF a connu cinq générations, toutes affichées comme protection par mot de passe. Le défaut est AES-256 avec le hachage coûteux de PDF 2.0, seul mode encore considéré robuste. Sa sécurité dépend du mot de passe. AES-128 avec dérivation de 1994 sert uniquement à un lecteur antérieur à 2010 et est présenté comme plus faible.
- **Le mot de passe est demandé deux fois, car aucun retour n’est possible.** Un document chiffré solidement avec un mot de passe oublié est perdu. Cet outil ne devine aucun mot de passe. Les deux saisies doivent correspondre et la page avertit clairement. Gardez l’original, qui reste intact.
- **Le résultat est rouvert avant téléchargement.** Les octets du téléchargement passent deux fois au lecteur PDF partagé : sans mot de passe, il doit refuser ; avec le vôtre, il doit ouvrir, retrouver le nombre de pages et les restrictions. Tout échec empêche le téléchargement et affiche une erreur.
- **Les pages ne sont ni rendues, réencodées ni réorganisées.** Seul le chiffrement autour du document change. Instructions de dessin, polices et images sont conservées puis chiffrées : le texte reste sélectionnable et recherchable avec le mot de passe, les scans gardent leur résolution et rien ne bouge. Les anciennes versions d’objets abandonnées par des modifications précédentes ne sont pas reprises.
- **Une signature numérique ne peut pas survivre à la réécriture.** Une signature couvre les octets exacts du fichier. Toute réécriture l’invalide : la copie obtenue n’est plus signée et le résultat vous avertit. L’original reste signé. Protégez d’abord, puis signez la copie protégée.
- **Un document déjà verrouillé doit d’abord être déverrouillé.** Un PDF demandant un mot de passe est refusé avec un lien vers le [déverrouilleur PDF](https://abox.tools/fr/deverrouiller-un-pdf/). Retirez sa protection dans le même navigateur puis revenez avec la copie. Un document ouvert à tous avec seulement des restrictions est accepté : vos réglages remplacent les anciens.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure de Google ne reçoivent ni document, page, nom, taille, nombre de pages, mot de passe ni mécanisme de protection. Tout le code de lecture, chiffrement et écriture vient du site et figure dans son dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et va chercher sa police chez Google Fonts. C'est un lien et rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur vos documents. Rien ne se produit tant que vous ne cliquez pas, et ce vers quoi vous cliquez alors est le site de quelqu'un d'autre.
- **Cela fonctionne hors ligne.** Déconnectez le réseau : toutes les fonctions restent disponibles. Un outil envoyant votre document ailleurs pour le chiffrer s’arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/pdf-crypt.js` pour la dérivation de clé et le dictionnaire /Encrypt, et `src/shared/aes.js` pour le chiffrement. Aucun de ces fichiers ni les lecteurs et rédacteurs voisins ne contacte le réseau.
