# Encodeur & décodeur Base64 — et URL, entités HTML, hexadécimal et échappements

Base64, encodage pourcent, entités HTML, hexadécimal et échappements antislash, dans les deux sens. Rien n'est collé dans le serveur de quelqu'un d'autre.

> Encodez et décodez du Base64 dans les deux alphabets, encodez des URL en pourcent, échappez les entités HTML et lisez l'hexadécimal et les échappements antislash. Tout tourne dans votre navigateur, rien n'est envoyé - un jeton ne quitte donc jamais votre machine.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/encoder-base64/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos textes. Il n'y a pas de serveur.

Chaque encodage ici est de l'arithmétique sur une chaîne de caractères, faite ici, dans cette page. Les codecs sont écrits à la main et se trouvent dans `src/encode.js` ; et il n'y a rien d'autre. Cet outil n'a aucune fonction réseau : rien à aller chercher, rien à envoyer. Cela compte ici plus que presque partout ailleurs : ce que les gens collent dans un décodeur Base64 en ligne, c'est un jeton, et coller un jeton dans le site de quelqu'un d'autre, c'est le lui remettre.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans limite de taille
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment encoder ou décoder du Base64 sans l'envoyer

1. **Choisissez l'encodage.** Base64 dans les deux alphabets, encodage pourcent pour une valeur seule ou une URL entière, les cinq entités HTML, les octets en hexadécimal et les échappements antislash d'un littéral de chaîne. La note sous le menu dit à quoi sert chacun.
2. **Choisissez le sens.** *Encoder* prend du texte en clair et produit la forme encodée ; *Décoder* ramène la forme encodée au texte en clair. Le résultat suit votre frappe : changer de sens est un clic, sans rien retaper.
3. **Collez-le, ou déposez le fichier.** Tout ce que vous pouvez sélectionner et copier fonctionne. Un fichier déposé sur le sélecteur est lu par votre propre navigateur et mis dans la zone : il n'y a pas d'étape d'envoi à éviter.
4. **Lisez l'erreur, s'il y en a une.** Un décodeur qui échoue ici dit ce qu'il a trouvé — un caractère que le Base64 n'utilise pas, un remplissage au mauvais endroit, des octets qui ne sont pas du texte — plutôt que de renvoyer quelque chose de plausible et de faux.
5. **Emportez le résultat.** Copiez-le, ou téléchargez-le comme fichier texte. Les compteurs sous la zone disent combien d'octets sont entrés et combien sont sortis.

## Aussi dans la boîte

- [Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/): Le partage vit dans cet onglet ouvert. Les lecteurs le reçoivent chiffré, directement depuis votre navigateur, et fermer l'onglet y met fin - aucun serveur ne conserve quoi que ce soit.
- [Générateur de QR codes et de codes-barres](https://abox.tools/fr/generateur-de-qr-code/): Vous le tapez, cela devient un code. Rien n'est envoyé pour en fabriquer un.
- [Lecteur de QR codes et de codes-barres](https://abox.tools/fr/lecteur-de-qr-code/): Visez un code, ou déposez-en une photo. La lecture se fait ici, et nulle part ailleurs.
- [Hachage & somme de contrôle](https://abox.tools/fr/verifier-une-somme-de-controle/): Vérifier un téléchargement face au nombre publié par son auteur, sans l’envoyer à personne.

## Questions

### Mon texte est-il envoyé quelque part ?

Non. Chaque encodeur et chaque décodeur de cette page sont des fonctions qui s'exécutent dans votre propre navigateur, sur votre propre matériel. Cet outil n'a aucune fonction réseau : il ne va jamais rien chercher et n'envoie jamais rien, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter, dont aucune ne nous appartient. C'est la raison de s'en servir pour un jeton d'accès ou un cookie de session : coller l'un de ceux-là dans le décodeur de quelqu'un d'autre, c'est le lui donner.

### Le Base64 d'ici est-il le même Base64 que partout ailleurs ?

Oui — il est vérifié par rapport aux vecteurs de test du RFC 4648 plutôt que par rapport à lui-même. Les deux alphabets se décodent, si bien qu'un JWT écrit avec `-` et `_` se lit aussi facilement qu'un autre écrit avec `+` et `/`, et une entrée coupée à 64 caractères est recollée pour vous. L'encodage passe par les octets UTF-8, si bien qu'une lettre accentuée ou un émoji survit à l'aller-retour.

### Le Base64 est-il un chiffrement ?

Non, et le prendre pour tel est l'erreur classique. Le Base64 est une orthographe : les mêmes octets, écrits dans un alphabet qui survit à une URL, à un courriel ou à une chaîne JSON. N'importe qui peut le relire — cette page le fait en une milliseconde —, il ne cache donc rien et ne protège rien. Si ce que vous avez est secret, il lui faut un vrai chiffrement avant d'être encodé, pas à la place.

### Pourquoi le décodage a-t-il échoué ?

Parce que ce qui a été collé n'est pas tout à fait ce que le codec croyait recevoir, et l'erreur dit en quoi : un caractère hors de l'alphabet Base64, un remplissage au mauvais endroit, un signe pourcent sans deux chiffres hexadécimaux derrière, ou des octets qui se décodent bien depuis le Base64 mais ne sont pas du texte UTF-8 — ce qui veut généralement dire que l'original était un fichier et non une chaîne. Le `atob` du navigateur aurait renvoyé quelque chose de plausible à la place ; être prévenu est tout l'intérêt de coller quelque chose dans un décodeur.

### Quelle est la différence entre les deux encodages d'adresse web ?

Une valeur seule, ou l'adresse entière. Encoder *une valeur* échappe tout ce à quoi une URL donne un sens — les barres obliques, les points d'interrogation, les esperluettes —, ce que vous voulez pour un seul paramètre de requête. Encoder une *URL entière* laisse l'adresse fonctionner : les barres obliques et le `?` restent, et seuls les caractères qu'une URL ne peut pas porter du tout sont échappés. Le premier appliqué à une adresse entière casse l'adresse ; le second appliqué à une valeur perd l'endroit où la valeur s'arrête.

### Quelle taille de fichier peut-il traiter ?

Aucune limite n'est fixée ici, puisqu'aucun serveur ne la paie. Le plafond réel est votre machine : quelques mégaoctets de texte ne posent pas de problème, et sur un très long document la page attend une pause dans votre frappe avant de réencoder, plutôt que de vous disputer le clavier.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni limite sur ce que vous collez. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre texte.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait votre texte ailleurs pour le décoder s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Ce que vous collez n'a nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Il n'existe ici aucun point de collecte où un jeton collé pourrait atterrir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va chercher quoi que ce soit.** Il n'y a nulle part dans `src/` ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon`. Chaque encodeur et chaque décodeur sont des fonctions de cette page qui prennent une chaîne et renvoient une chaîne.
- **Le décodeur vous dit quand quelque chose ne va pas.** Le `atob` du navigateur accepte des entrées qu'il devrait refuser et renvoie quelque chose de plausible. Le Base64 d'ici est écrit à la main et vérifié contre les vecteurs de test de la RFC 4648, et quand ce que vous avez collé n'est pas du Base64, il le dit, et dit pourquoi. Les tests dans `tests/js/text-encode.test.js` vérifient exactement cela.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit un caractère de votre texte. Chaque ligne qui le lit, l'analyse ou l'écrit est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy et `src/encode.js` pour le Base64 vérifié contre les vecteurs de test de la RFC 4648 plutôt que contre lui-même, et qui refuse les mauvaises entrées au lieu de renvoyer quelque chose de plausible comme le fait `atob`.
