# YAML vers JSON — et JSON de nouveau en YAML

Les deux sens, et il dit ce que chacun coûte. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.

> Convertissez YAML en JSON et JSON en YAML dans votre navigateur. Il lit le YAML 1.2, donc yes et no restent des chaînes, et il dit exactement ce que chaque sens perd. Rien n'est envoyé : un fichier de configuration ne quitte jamais votre machine.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/convertir-du-yaml-en-json/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos fichiers YAML et JSON. Il n'y a pas de serveur.

Convertir, c'est de l'arithmétique sur une chaîne de caractères, faite ici, dans cette page. Les deux analyseurs sont écrits à la main et se trouvent dans `src/` — `shared/parse-yaml.js` et `shared/parse-json.js` — et il n'y a rien d'autre. Cet outil n'a aucune fonction réseau d'aucune sorte — rien à récupérer, rien à envoyer — et cela compte ici plus que presque partout ailleurs sur ce site : un fichier YAML est le plus souvent une configuration de déploiement, et une configuration de déploiement est le plus souvent pleine de noms d'hôtes, de noms de buckets et de secrets.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans limite de taille
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment convertir du YAML en JSON sans l'envoyer

1. **Choisissez le sens.** *YAML vers JSON* ou *JSON vers YAML*. La note sous le menu dit ce que ce sens perd avant que vous ne colliez quoi que ce soit, et non après.
2. **Collez-le, ou déposez le fichier.** Tout ce que vous pouvez sélectionner et copier convient. Un fichier déposé sur le sélecteur est lu par votre propre navigateur et placé dans la boîte — il n'y a pas d'étape d'envoi à omettre — et une extension `.json` ou `.yaml` choisit le sens pour vous.
3. **Choisissez l'indentation.** Deux espaces, quatre, ou une tabulation. La tabulation n'est proposée que pour le JSON : le YAML est défini en termes d'espaces, et une tabulation n'y est pas une indentation légale.
4. **Lisez l'erreur là où elle est.** Un analyseur qui échoue ici dit ce qu'il a trouvé et à quelle ligne et quelle colonne, plutôt que « jeton inattendu à la position 4193 ». Cela suffit d'ordinaire à réparer un fichier de configuration sans rien ouvrir d'autre.
5. **Emportez le résultat.** Copiez-le, ou téléchargez-le sous forme de fichier, nommé d'après le format dans lequel il est sorti.

## Aussi dans la boîte

- [Formateur XML](https://abox.tools/fr/formater-du-xml/): Du XML mis en forme pour être lu ou compacté pour être livré, et converti en JSON dans les deux sens. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.
- [Comparateur de textes](https://abox.tools/fr/comparer-des-textes/): Deux textes en entrée, chaque différence marquée, ligne à ligne et mot à mot. Rien n'est collé dans le serveur de quelqu'un d'autre.
- [Encodeur & décodeur Base64](https://abox.tools/fr/encoder-base64/): Base64, encodage pourcent, entités HTML, hexadécimal et échappements antislash, dans les deux sens. Rien n'est collé dans le serveur de quelqu'un d'autre.
- [Partager du texte et des fichiers](https://abox.tools/fr/partager-du-texte/): Le partage vit dans cet onglet ouvert. Les lecteurs le reçoivent chiffré, directement depuis votre navigateur, et fermer l'onglet y met fin - aucun serveur ne conserve quoi que ce soit.

## Questions

### Mon YAML est-il envoyé quelque part ?

Non. Les deux analyseurs et les deux imprimeurs de cette page sont des fonctions qui tournent dans votre propre navigateur, sur votre propre matériel. Cet outil n'a aucune fonction réseau d'aucune sorte — il ne récupère jamais rien et n'envoie jamais rien — et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle peut contacter, dont aucune ne nous appartient. C'est précisément la raison de l'utiliser pour une configuration de déploiement : elles sont pleines de noms d'hôtes, de noms de buckets et parfois d'un secret que quelqu'un comptait déplacer, et en coller une dans le convertisseur de quelqu'un d'autre, c'est la lui donner.

### Que perd-on en convertissant du YAML en JSON ?

Les commentaires, parce que le JSON n'a nulle part où en mettre. Les ancres, les alias et les étiquettes sont refusés d'emblée plutôt que devinés — chacun dit quelque chose que le JSON ne sait pas dire, et un convertisseur qui choisirait discrètement une interprétation vous rendrait un document qui n'est pas ce que disait le fichier. L'autre sens ne perd rien : tout document JSON est déjà un document YAML.

### Mon YAML dit no et le JSON est sorti en chaîne. Pourquoi ?

Parce que c'en est une, et que ceci lit le YAML 1.2 plutôt que le 1.1. En YAML 1.1, `yes`, `no`, `on` et `off` étaient des booléens, ce qui est le fameux bogue qui transforme le code pays de la Norvège en `false`. Le YAML 1.2 a abandonné cela, et ceci aussi : seuls `true`, `false`, `null` et `~` sont lus comme autre chose que du texte. Dans l'autre sens, ces mots sont réécrits *entre guillemets*, alors même que ceci les lirait comme du texte sans eux — parce que ce qui ouvrira le fichier ensuite ne le fera peut-être pas. PyYAML utilise toujours la 1.1 par défaut. Lire strictement et écrire prudemment est la seule combinaison qui soit juste dans les deux sens.

### Garde-t-il l'ordre de mes clés ?

Oui, dans les deux sens, et c'est plus difficile qu'il n'y paraît. Un convertisseur bâti sur `JSON.parse` ramène discrètement en tête les clés qui ressemblent à des entiers, si bien que `{"10":a,"2":b}` revient en `{"2":b,"10":a}`. Les nombres gardent les chiffres que vous avez tapés, donc un identifiant de compte à vingt chiffres ne perd pas ses trois derniers au profit d'un double. Si vous *voulez* les trier, il y a une case pour cela, et elle trie selon la façon dont les clés se lisent plutôt que selon leurs points de code.

### Peut-il convertir plusieurs documents YAML à la fois ?

Non, et il le dit plutôt que d'en choisir un. Un fichier avec des séparateurs `---` contient plus d'un document, et le JSON n'a aucune forme qui veuille dire « plusieurs documents » — un tableau serait une affirmation que le fichier n'a jamais faite. Convertissez-les un par un.

### Pourquoi n'y a-t-il pas de formateur YAML ici ?

Parce que le YAML n'a pas de forme compactée qui vaille la peine d'être écrite — la courte est le style de flux, qui est illisible, et l'illisible est le contraire de la raison de garder un fichier en YAML. Mettre en forme du JSON, du XML, du HTML et du CSS est le travail du [formateur JSON](https://abox.tools/fr/formater-du-json/), et il met aussi le YAML en forme.

### Quelle taille de fichier peut-il traiter ?

Aucune limite n'est inscrite ici, parce qu'aucun serveur ne la paie. Le plafond réel est votre propre machine : quelques mégaoctets de YAML passent bien, et pour un document très long la page attend une pause dans votre frappe avant de convertir, plutôt que de vous disputer le clavier.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni limite à ce que vous collez. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre texte.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, puis débranchez internet et elle continue de fonctionner. C'est aussi la façon la plus simple de prouver que rien n'est envoyé : un outil qui expédierait votre configuration pour la convertir s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Ce que vous collez n'a nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page peut contacter, et aucune ne nous appartient. Il n'y a ici aucun point de collecte où une configuration collée pourrait aboutir, et rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne récupère quoi que ce soit.** Il n'y a aucun `fetch`, aucun `XMLHttpRequest` et aucun `sendBeacon` nulle part dans `src/`. Les deux analyseurs et les deux imprimeurs sont des fonctions de cette page qui prennent une chaîne et renvoient une chaîne.
- **Il lit le YAML 1.2, donc la Norvège reste la Norvège.** En YAML 1.1, `no` était un booléen, ce qui est le fameux bogue qui transforme le code pays de la Norvège en `false`. Ceci lit la 1.2, où c'est la chaîne qu'il paraît être. Dans l'autre sens, ces mots sont réécrits *entre guillemets*, parce que ce qui ouvrira le fichier ensuite peut encore être un lecteur 1.1. `tests/js/text-convert.test.js` vérifie les deux moitiés.
- **Une conversion qui ne peut pas être honnête s'arrête.** Une ancre, un alias ou une étiquette dans le YAML met fin à la conversion avec un message indiquant à quelle ligne elle se trouve, plutôt qu'un document JSON qui voudrait discrètement dire autre chose. Le JSON n'a aucun moyen de dire « le même nœud deux fois », et choisir une interprétation reviendrait à choisir à votre place.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit un caractère de votre texte. Chaque ligne qui le lit, l'analyse ou l'écrit est servie depuis cette origine et figure dans le dépôt.
- **Cela fonctionne hors ligne.** Débranchez le réseau et l'outil est inchangé, parce qu'il n'y a jamais eu d'étape réseau dedans. C'est la preuve la plus simple qui soit.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/parse-yaml.js` pour le lecteur qui refuse une ancre plutôt que de deviner ce qu'elle voulait dire, et `src/convert.js` pour comprendre pourquoi une conversion est un analyseur et un imprimeur, sans rien entre les deux qui connaisse les deux formats à la fois.
