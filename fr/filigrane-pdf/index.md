# Filigrane PDF — marquer chaque page avec son destinataire

Un scan qui indique sa destination ne peut pas être réutilisé ailleurs discrètement.

> Ajoutez destinataire, date ou nom à chaque page d’un PDF dans votre navigateur, dans toute langue, avec angle et opacité choisis. Aucun envoi, contenu intact et résultat vérifié avant téléchargement.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/filigrane-pdf/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos documents. Il n'y a pas de serveur.

Votre document est ouvert, marqué puis écrit en mémoire sur votre appareil par le code de ce site. Votre navigateur dessine le texte. Aucun envoi possible ni serveur pour recevoir le document.

- ✗ Sans envoi
- ✗ Sans compte
- ✓ Fonctionne hors ligne
- ✓ Open source
- ✓ Vos fichiers restent chez vous

## Comment ajouter un filigrane à un PDF

1. **Choisissez le PDF.** Un document à la fois, lu depuis votre disque. Un PDF demandant un mot de passe est orienté vers le déverrouilleur. Les autres, scans compris, sont acceptés tels quels.
2. **Saisissez le texte.** Destinataire et date : « Pour la banque Acme uniquement · 12 septembre 2026 » convient. Toute langue et écriture sont possibles grâce au dessin par votre navigateur.
3. **Réglez la disposition et regardez l’aperçu.** Taille, diagonale ou horizontale, au centre ou répété, opacité, couleur, toutes les pages ou la première. L’aperçu est une page blanche aux dimensions de la première page, avec la position finale exacte.
4. **Marquez et lisez la vérification.** L’image est ajoutée une fois au document et chaque page reçoit son instruction de dessin. Le résultat est rouvert : chaque page doit porter le filigrane et leur nombre rester identique. Sinon, une erreur apparaît et aucun téléchargement n’est proposé.

## La version longue

[Comment ajouter un filigrane à un PDF, et à quoi la marque sert réellement](https://abox.tools/fr/guides/ajouter-un-filigrane-a-un-pdf/): Pourquoi les prêteurs et les propriétaires demandent un scan marqué à leur nom, ce que cette marque empêche et n’empêche pas, comment l’ajouter dans votre navigateur sans envoyer le document et quoi écrire dessus.

## Aussi dans la boîte

- [Caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/): Les lettres sont supprimées du fichier, puis le fichier est fouillé pour le prouver.
- [PDF en CSV](https://abox.tools/fr/pdf-en-csv/): Repère tous les tableaux d’un PDF et les transforme en lignes lisibles par un tableur.
- [Images en PDF](https://abox.tools/fr/images-en-pdf/): Réunir vos images dans un seul document.
- [Scanner de documents](https://abox.tools/fr/scanner-un-document/): Photographiez la page. Vous récupérez quelque chose qui a l'air scanné.

## Questions

### Peut-on retirer un filigrane ?

Oui, avec un éditeur PDF. Il indique la destination d’une copie, pas une protection : un scan « pour la banque Acme uniquement » retrouvé chez un autre prêteur porte sa destination d’origine. Pour empêcher une ouverture non autorisée, utilisez un mot de passe avec le [protecteur PDF](https://abox.tools/fr/proteger-un-pdf/).

### Le filigrane peut-il être en chinois, arabe ou autre langue ?

Oui, tout texte que vous pouvez saisir. Le navigateur utilise les polices de votre appareil et place une image par page, sans limite à l’alphabet latin. Les mots ne peuvent ensuite être sélectionnés ni recherchés.

### Pourquoi le document n’apparaît-il pas dans l’aperçu ?

Le site n’a aucun moteur de rendu PDF : dessiner fidèlement une page nécessite un moteur de polices et un modèle graphique comparables à ceux du navigateur. L’aperçu montre donc une page blanche aux dimensions exactes avec la position du filigrane calculée par le code d’écriture. Ouvrez le résultat dans un lecteur pour voir les deux ensemble.

### Le document change-t-il sous le filigrane ?

Non. Instructions, polices et images sont copiées intactes, puis le filigrane est dessiné par-dessus avec l’opacité choisie. Texte sélectionnable et recherchable, résolution des scans conservée, rien ne bouge. Le poids augmente d’une image partagée, généralement quelques dizaines de kilo-octets pour quelques mots.

### Fonctionne-t-il sur les scans et les pages de côté ?

Oui. Le filigrane se dessine sur l’image du scan. Les pages portant une rotation sont marquées selon leur orientation affichée : la diagonale suit ce que le lecteur montre, pas le papier tel que vu par le scanner.

### Que devient un document signé ?

Toute modification invalide la signature, qui couvre les octets exacts. L’outil écrit une nouvelle copie et vous avertit si l’original était signé. Gardez cet original, dont la signature reste valide.

### Puis-je marquer un PDF avec mot de passe ?

Pas directement : aucun champ de mot de passe ici. Retirez d’abord la protection avec le [déverrouilleur PDF](https://abox.tools/fr/deverrouiller-un-pdf/), marquez la copie puis reprotégez-la avec le [protecteur PDF](https://abox.tools/fr/proteger-un-pdf/). Les restrictions seules sont aussi refusées : la réécriture les supprimerait, et la page demande de les retirer explicitement.

### Mes documents ou mon texte sont-ils envoyés ?

Non. Votre navigateur lit, marque et écrit sur votre appareil, et dessine le texte. Aucun serveur : la `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. Déconnectez le réseau et utilisez la page pour le vérifier.

### Comment savoir si toutes les pages portent le filigrane ?

Le résultat est relu sur votre appareil. Chaque page doit référencer le filigrane et finir par son instruction de dessin, avec le même nombre de pages que l’original. Tout échec est annoncé et empêche le téléchargement.

### Y a-t-il une limite de taille, et cela coûte-t-il quelque chose ?

Aucune limite n'est écrite dans l'outil. La limite, c'est votre propre machine : le document est tenu en mémoire pendant le travail, un portable encaissera donc quelques centaines de mégaoctets sans broncher et peinera quelque part au-dessus. C'est gratuit, il n'y a ni compte, ni connexion, ni période d'essai. Le site porte de la publicité, et c'est elle qui le paie ; on ne donne rien aux annonces sur vos documents.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois puis déconnectez Internet : elle continue. Un outil envoyant votre document ailleurs pour le marquer s’arrêterait.

## Comment cette promesse se vérifie

- **Le document à marquer est celui qu’on veut le moins envoyer à un outil.** Scan de passeport pour un propriétaire, relevé pour un courtier, projet de contrat confidentiel : le filigrane accompagne un document qui va quitter vos mains. L’envoyer d’abord au serveur d’un outil ajouterait un destinataire inconnu. Ici, le navigateur lit, dessine et écrit en mémoire. La `Content-Security-Policy` énumère les adresses autorisées, aucune n’appartenant au site. L’outil fonctionne déconnecté.
- **Un filigrane indique une destination. Il n’empêche pas les copies.** « Pour la banque Acme uniquement, 12 septembre 2026 » sur chaque page identifie la destination d’origine si le scan paraît ailleurs. C’est pourquoi banques, avocats et propriétaires le demandent. Ce n’est pas un verrou : un éditeur PDF peut le retirer. Pour contrôler l’ouverture, ajoutez un mot de passe avec le [protecteur PDF](https://abox.tools/fr/proteger-un-pdf/), proposé sous le résultat.
- **Le filigrane est une image, compatible avec toute langue et police.** Un PDF utilise ses polices intégrées ou les quatorze polices latines supposées disponibles. Pour éviter d’intégrer plusieurs mégaoctets de polices et un moteur, le navigateur dessine les mots avec les polices de votre appareil, puis les place comme image avec un masque de transparence. La résolution convient à l’impression. Le texte du filigrane ne peut ensuite être sélectionné ni recherché : il est destiné à être vu.
- **Le contenu des pages n’est ni lu, rendu ni réorganisé.** Trois objets sont ajoutés : image, masque et opacité, puis deux petites instructions par page, avant et après le dessin existant. Le contenu original n’est pas décodé ni changé. Instructions, polices et images restent intacts : texte sélectionnable et recherchable, scans à leur résolution, aucune mise en page déplacée. Les anciennes versions d’objets abandonnées sont retirées à la réécriture.
- **L’aperçu montre la position, pas le document rendu.** Le site n’a volontairement aucun moteur de rendu PDF. L’aperçu est une page blanche aux dimensions exactes de votre première page avec le filigrane à sa place finale. Le calcul est celui qui écrit le fichier. Dessiner fidèlement votre contenu demanderait un moteur comparable à celui d’un navigateur ; un aperçu approximatif serait trompeur.
- **Le résultat est rouvert avant téléchargement.** Les octets du résultat sont remis au lecteur PDF partagé. Chaque page doit référencer le filigrane dans ses ressources et finir par son instruction de dessin, avec le même nombre de pages que l’original. Toute erreur bloque le téléchargement et est annoncée.
- **Une signature numérique ne survit pas à la réécriture.** La signature couvre les octets exacts du fichier. Une réécriture l’invalide : la copie obtenue n’est plus signée et le résultat vous avertit si l’original l’était. Gardez l’original signé.
- **Un document verrouillé doit d’abord être déverrouillé.** La page ne demande aucun mot de passe. Elle refuse le PDF protégé avec un lien vers le [déverrouilleur PDF](https://abox.tools/fr/deverrouiller-un-pdf/). Revenez avec la copie ouverte pour la marquer, puis remettez un mot de passe avec le [protecteur PDF](https://abox.tools/fr/proteger-un-pdf/).
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure de Google ne reçoivent ni document, page, nom, poids, nombre de pages ni texte du filigrane. Tout le code de lecture, marquage et écriture vient du site et figure dans le dépôt.
- **Ce que le bouton de don charge, et ce qu'on ne lui donne pas.** Le bouton « Buy me a coffee » de l'en-tête est dessiné par un script de cdnjs.buymeacoffee.com et va chercher sa police chez Google Fonts. C'est un lien et rien de plus : il ne signale aucune visite, et on ne lui donne rien sur vous ni sur vos documents. Rien ne se produit tant que vous ne cliquez pas, et ce vers quoi vous cliquez alors est le site de quelqu'un d'autre.
- **Cela fonctionne hors ligne.** Déconnectez le réseau : toutes les fonctions restent disponibles. Un outil envoyant votre document ailleurs pour le marquer s’arrêterait.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/stamp.js` pour la position, `src/render.js` pour convertir les mots en image et `src/apply.js` pour les trois objets ajoutés au document et les deux instructions par page. Aucun de ces fichiers, lecteurs ou rédacteurs ne contacte le réseau.
