# Lecteur de QR codes et codes-barres — scanner un QR code depuis une image ou la caméra

Visez un code, ou déposez-en une photo. La lecture se fait ici, et nulle part ailleurs.

> Lisez un QR code depuis une photo, une capture d'écran ou votre caméra, et voyez exactement où mène le lien avant de l'ouvrir. Codes-barres EAN, UPC, Code 128, Code 39 et ITF aussi. Rien n'est envoyé.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/lecteur-de-qr-code/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images et les codes qu'elles contiennent. Il n'y a pas de serveur.

Lire un code, c'est de l'arithmétique sur des pixels, et les pixels sont déjà là. Trouver le symbole, corriger l'angle de la prise de vue, défaire le masque, réparer les dégâts avec Reed-Solomon et relire les bits : tout cela se passe dans environ deux mille lignes de JavaScript que vous pouvez lire, dans cette page. **La caméra, c'est la même promesse, pas une exception :** une image arrive sous forme de pixels dans cet onglet, elle est examinée, elle disparaît. Rien n'est enregistré, rien n'est conservé, et cette page n'a aucune fonction réseau qui permettrait d'envoyer quoi que ce soit.

- ✗ Rien n'est envoyé
- ✗ Pas de compte
- ✗ Rien n'est enregistré
- ✓ Fonctionne hors ligne
- ✓ Code source ouvert

## Comment lire un QR code sans envoyer l'image

1. **Donnez-lui l'image.** Déposez une photo ou une capture d'écran sur la boîte, collez-en une directement, ou appuyez sur le bouton de la caméra. Plusieurs à la fois, c'est très bien : chacune est lue séparément et chacune a sa propre réponse. Une capture d'un code déjà affiché à l'écran est la voie la plus rapide et la plus fiable, parce qu'il n'y a là ni objectif, ni angle, ni lumière en jeu.
2. **Faites entrer le symbole entier, marge comprise.** Le blanc autour d'un code fait partie du code : c'est comme cela qu'un lecteur sait où le symbole s'arrête. Une photo rognée au bord des carrés est de loin la raison la plus fréquente pour laquelle un code ne se lit pas. Remplir à peu près la moitié du cadre avec le code, c'est à peu près juste ; plus près, et les coins sortent de l'image.
3. **Lisez l'adresse avant de décider quoi que ce soit.** Scanner un code sur une affiche, un horodateur ou une lettre, c'est pour savoir où il mène — et c'est justement la seule chose qu'un appareil photo de téléphone ne vous laisse pas vraiment faire. Ici l'hôte est écrit sur sa propre ligne. Si ce n'est pas un nom auquel vous vous attendiez, vous avez déjà ce que vous étiez venu chercher et il n'y a plus rien à ouvrir.
4. **Prenez les avertissements au sérieux, surtout les discrets.** Une adresse en `http://` tout court, un nom écrit dans un alphabet qui n'est pas celui qu'il semble être, un raccourcisseur de liens, ou quoi que ce soit devant un `@` dans l'adresse : chacun est nommé là où il apparaît. Aucun ne prouve quoi que ce soit à lui seul. Tous méritent dix secondes avant d'y aller.
5. **Si cela ne se lit pas, changez la lumière avant tout le reste.** Presque tous les échecs sont un problème de seuil : un reflet en travers du milieu, une ombre sur un coin, ou un écran photographié sous un angle qui attrape le rétroéclairage. Déplacez-vous pour que le reflet ne tombe pas sur le code, ou allumez la lumière de la caméra. Si cela ne suffit pas, prenez une seule photo à plat et de face, et déposez celle-là : une image fixe a droit à une recherche bien plus poussée qu'une image en direct.
6. **Si la réponse vous semble bizarre, regardez l'image échantillonnée.** Ouvrez « comment celui-ci a été lu » et regardez la petite grille. C'est ce que cette page a cru que le code était, redessiné à partir des modules échantillonnés. Un lecteur qui a mal lu un symbole et l'a réparé jusqu'à en faire quelque chose de plausible le montre là, et nulle part ailleurs.

## La version longue

[Comment créer un code QR et prouver qu'il se scanne](https://abox.tools/fr/guides/creer-un-code-qr-et-prouver-qu-il-se-scanne/): Générer le code, puis le vérifier avec le lecteur du même site - la charge exacte, le vrai lien, à la taille d'impression et depuis une photo - avant le tirage. Tout dans le navigateur, rien d'envoyé.

## Aussi dans la boîte

- [Hachage & somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/): Vérifier un téléchargement face au nombre publié par son auteur, sans l’envoyer à personne.
- [Générateur de mot de passe & de phrase secrète](https://abox.tools/fr/generateur-de-mot-de-passe/): Fabriqué ici, par votre propre navigateur, et envoyé nulle part. Rien n'est enregistré et il n'y a pas d'historique.
- [Formateur JSON](https://abox.tools/fr/formater-du-json/): JSON, XML, HTML, CSS et YAML, mis en forme ou convertis. Rien n'est collé dans le serveur de quelqu'un d'autre.
- [Convertisseur YAML vers JSON](https://abox.tools/fr/convertir-du-yaml-en-json/): Les deux sens, et il dit ce que chacun coûte. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.

## Questions

### L'image est-elle envoyée quelque part ?

Non, et ce qui en est lu non plus. L'image est décodée sur un canvas de cette page et lue là, par du JavaScript servi depuis ce site. Cet outil n'a aucune fonction réseau — il ne va jamais rien chercher et n'envoie jamais rien — et la `Content-Security-Policy` de la page nomme toutes les adresses qu'elle peut contacter, dont aucune ne nous appartient. La preuve la plus simple : coupez la connexion, cela continue de marcher.

### La caméra enregistre-t-elle quelque chose ?

Non. Une image de la caméra arrive sous forme de pixels dans cet onglet, est dessinée sur un canvas, est examinée, et se fait écraser par la suivante un dixième de seconde plus tard. Rien n'est écrit sur le disque et rien n'est conservé. Le flux s'arrête dès que vous appuyez sur arrêter, quand l'onglet passe en arrière-plan et quand vous quittez la page — et le voyant de votre caméra est l'indicateur auquel vous fier, parce qu'aucune page ne peut l'éteindre.

### Pourquoi me montre-t-elle le lien au lieu de l'ouvrir ?

Parce que c'est la partie utile. Un QR code est une adresse que vous ne pouvez pas lire, et c'est bien pour cela qu'un autocollant sur le code d'un horodateur fonctionne : quand vous savez où il menait, vous y êtes déjà. Ici la chaîne est affichée en entier, l'hôte est sorti sur sa propre ligne, et l'ouvrir est un bouton séparé sur lequel vous appuyez après l'avoir lue. C'est un clic de plus, et c'est le clic dont ce format a toujours eu besoin.

### Que sait-il lire ?

Les QR codes de toutes les versions, de 1 à 40, aux quatre niveaux de correction d'erreurs, en mode numérique, alphanumérique, octet et kanji, avec les jeux de caractères ECI et les symboles d'un ensemble chaîné signalés plutôt qu'abandonnés en silence. Côté barres : EAN-13, EAN-8, UPC-A, UPC-E, ITF-14, Interleaved 2 of 5, Code 128 et Code 39. Il ne lit ni Data Matrix, ni PDF417, ni Aztec, ni MaxiCode.

### Il ne lit pas mon code. Qu'est-ce qui ne va pas ?

Neuf fois sur dix, c'est l'une de trois choses. La marge blanche est rognée, et un lecteur s'en sert pour savoir où le symbole s'arrête. Un reflet ou une ombre traverse une partie du code, si bien qu'aucun seuil ne sépare les carrés sombres des clairs. Ou le code est si petit dans le cadre que ses modules ne font qu'un ou deux pixels. Changez la lumière, remplissez à peu près la moitié du cadre, et prenez la photo de face plutôt que de biais.

### Peut-il lire un code abîmé ou partiellement recouvert ?

Souvent oui, et c'est le format qui fonctionne comme prévu, pas une habileté d'ici. Tout QR code porte des données de contrôle Reed-Solomon, et un symbole fait au niveau H peut perdre environ 30 % de ses modules et être quand même reconstruit à l'identique. La page indique combien de mots de code elle a dû réparer, sous « comment celui-ci a été lu », pour que vous voyiez à quel point c'était juste. Ce qu'elle ne fait pas, c'est deviner : un symbole abîmé au-delà de ce que le contrôle peut porter est signalé illisible plutôt que répondu de travers.

### Pourquoi dit-il qu'il ne peut pas savoir où mène un lien bit.ly ?

Parce que le savoir voudrait dire demander à bit.ly, et c'est une requête réseau. Tout le reste de ce que cette page affirme repose sur le fait qu'aucun code ici ne contacte quoi que ce soit, et faire discrètement une exception vaudrait moins que la réponse. Alors le raccourcisseur est nommé, et ce qu'il cache est honnêtement laissé inconnu. Si vous voulez le résoudre, collez-le dans quelque chose qui accepte, lui, de demander.

### Est-ce risqué de scanner un QR code ?

Le scanner ne l'est pas. Y donner suite, si, et le risque est réel : les codes collés par-dessus le vrai, sur les horodateurs, les tables de restaurant et les avis de passage des livreurs, sont désormais assez courants pour avoir un nom. Ce qui les fait marcher, c'est que personne ne peut lire un code en le regardant. Le lire sans l'ouvrir — ce que fait cette page — supprime tout cet avantage, et les dix secondes passées à regarder l'hôte sont toute la défense.

### C'est quoi, la petite grille sous chaque résultat ?

Les modules que cette page a réellement échantillonnés sur votre image, redessinés à un carré par module. Elle est là pour que la lecture se vérifie à l'œil plutôt que se croie : si cette grille ressemble au code que vous avez photographié, la réponse au-dessus vient des bons pixels. Presque aucun lecteur ne vous montre cela, et c'est la différence entre un outil qu'on peut vérifier et un outil qu'il faut croire.

### Lit-il plusieurs codes sur une même image ?

Un par image, pour l'instant. Déposez plusieurs images à la fois et chacune est lue séparément, et la caméra lit code après code à mesure que vous la déplacez, gardant chaque nouveau qu'elle n'a pas déjà vu. Une seule photo contenant une page entière de codes, c'est un travail de recadrage — ou de caméra pointée sur l'un après l'autre.

### Pourquoi appelle-t-il mon code-barres autrement que ce que j'avais demandé ?

Parce qu'un code-barres ne porte pas son propre nom. UPC-A est un EAN-13 dont le premier chiffre est un zéro, ITF-14 est de l'Interleaved 2 of 5 à quatorze chiffres avec une clé de contrôle valide, et le Code 128 dans son mode numérique ne ressemble à rien d'autre. Ce que cette page annonce, c'est ce que disent les barres plus ce que confirme la clé de contrôle : c'est tout ce que le symbole lui-même sait.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez la connexion, et elle continue de fonctionner, caméra comprise. C'est aussi la façon la plus simple de prouver que rien n'est envoyé : un lecteur qui expédierait votre image pour la faire décoder s'arrêterait à la seconde où vous débranchez.

## Comment cette promesse se vérifie

- **L'image n'est jamais envoyée, et la caméra ne fait pas exception.** Une photo que vous déposez ici est décodée sur un canvas de cette page et lue là. Une image de la caméra, c'est la même chose trente fois par seconde : elle est dessinée sur ce canvas, examinée, puis écrasée par la suivante. Aucune n'est enregistrée, aucune n'est conservée, et le voyant de la caméra qui s'éteint quand vous appuyez sur arrêter, c'est tout ce qu'il y a.
- **Rien ici ne va chercher quoi que ce soit.** Il n'y a ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` nulle part dans `src/`, et la `Content-Security-Policy` de la page ne laisse aucune adresse vers laquelle cette origine pourrait envoyer quelque chose, même s'il y en avait. C'est pour cela que cette page ne peut pas vous dire où aboutit un lien raccourci : le savoir voudrait dire demander, et elle ne demande rien.
- **Elle vous montre l'adresse. Elle ne l'ouvre jamais.** Un QR code imprimé est une adresse que personne ne peut lire, et c'est exactement ce qui rend un autocollant collé par-dessus rentable pour quelqu'un. Rien n'est ouvert ici. La chaîne entière est affichée pour que vous la regardiez, l'hôte que vous atteindriez vraiment est sorti sur sa propre ligne, et les astuces qui font qu'une adresse en imite une autre — un nom d'utilisateur devant un `@`, un nom écrit dans un alphabet dont les lettres ont la forme des nôtres, une redirection — sont nommées là où elles apparaissent.
- **Elle vous montre aussi ce qu'elle a échantillonné.** Sous chaque résultat de QR code se trouve une image des modules que cette page a réellement lus sur votre photo. Si cela ressemble au code que vous avez scanné, la réponse au-dessus tient ; si cela ressemble à du bruit, non. Un lecteur qui vous rend une chaîne et rien d'autre ne se vérifie pas comme cela.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit une image, une prise de vue, ni quoi que ce soit lu dedans. Chaque ligne qui transforme des pixels en chaîne est servie depuis cette origine et figure dans le dépôt.
- **Cela fonctionne hors ligne.** Coupez le réseau et l'outil ne change pas, caméra comprise, parce qu'il n'y a jamais eu d'étape réseau dedans. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/binarize.js` et `src/detect.js` pour trouver un symbole dans une photo — le seuil, les motifs de repérage et la correction de perspective —, `src/qr-decode.js` pour le relire, `src/reed-solomon.js` pour réparer ce qui a été mal lu, `src/linear.js` pour ceux à barres, et `src/camera.js`, qui est chaque ligne de cette page qui touche à une caméra.
