# Formateur JSON — mettre en forme, compacter ou convertir

JSON, XML, HTML, CSS et YAML, mis en forme ou convertis. Rien n'est collé dans le serveur de quelqu'un d'autre.

> Formatez et compactez du JSON, du XML, du HTML, du CSS et du YAML, et convertissez du JSON en YAML ou en XML et inversement. Les analyseurs tournent dans votre navigateur, rien n'est envoyé - un jeton ou un fichier de configuration ne quitte donc jamais votre machine.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/formater-du-json/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos textes et codes. Il n'y a pas de serveur.

Formater et convertir sont de l'arithmétique sur une chaîne de caractères, faite ici, dans cette page. Les analyseurs sont écrits à la main et se trouvent dans `src/` : `shared/parse-json.js`, `shared/parse-xml.js`, `css.js`, `shared/parse-yaml.js` ; et il n'y a rien d'autre. Cet outil n'a aucune fonction réseau : rien à aller chercher, rien à envoyer. Cela compte ici plus que presque partout ailleurs sur ce site : ce que les gens collent dans un formateur, ce sont des jetons d'accès, des cookies de session, des fiches clients et du code non publié.

- ✗ Sans envoi
- ✗ Sans compte
- ✗ Sans limite de taille
- ✓ Fonctionne hors ligne
- ✓ Open source

## Comment formater ou convertir du JSON sans l'envoyer

1. **Choisissez le travail.** Deux onglets, une même zone : *Formater* met en forme ou compacte du JSON, du XML, du HTML, du CSS et du YAML ; *Convertir* transforme du JSON en YAML ou en XML et inversement. Le texte que vous venez de formater est celui que vous convertissez, sans le coller deux fois.
2. **Collez-le, ou déposez le fichier.** Tout ce que vous pouvez sélectionner et copier fonctionne. Un fichier déposé sur le sélecteur est lu par votre propre navigateur et mis dans la zone : il n'y a pas d'étape d'envoi à éviter.
3. **Laissez-le deviner le langage, ou dites-le-lui.** Le menu indique ce qu'il a lu, et le corriger prend un clic. Une supposition n'est qu'un point de départ, c'est pourquoi elle est affichée plutôt qu'appliquée en silence.
4. **Choisissez l'indentation, ou compactez tout.** Deux espaces, quatre, ou une tabulation. Compacter, c'est le même document dont on a retiré chaque espace qui n'était là que pour la lecture, et le résultat indique combien d'octets cela a fait gagner.
5. **Lisez l'erreur là où elle est.** Un analyseur qui échoue ici dit ce qu'il a trouvé, et à quelle ligne et quelle colonne, plutôt que « jeton inattendu à la position 4193 ». Cela suffit généralement à réparer un fichier de configuration sans rien ouvrir d'autre.
6. **Emportez le résultat.** Copiez-le, ou téléchargez-le comme fichier, nommé d'après le langage dans lequel il est sorti.

## La version longue

[Comment formater du JSON sans le confier à personne](https://abox.tools/fr/guides/formater-du-json/): Mettre en forme, vérifier et minifier du JSON dans son propre navigateur : ce qu'un formateur ne doit jamais changer dans votre fichier, comment lire le message d'erreur, et pourquoi le site où vous collez compte.

## Aussi dans la boîte

- [Convertisseur YAML vers JSON](https://abox.tools/fr/convertir-du-yaml-en-json/): Les deux sens, et il dit ce que chacun coûte. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.
- [Formateur XML](https://abox.tools/fr/formater-du-xml/): Du XML mis en forme pour être lu ou compacté pour être livré, et converti en JSON dans les deux sens. Rien de tout cela n'est collé dans le serveur de quelqu'un d'autre.
- [Comparateur de textes](https://abox.tools/fr/comparer-des-textes/): Deux textes en entrée, chaque différence marquée, ligne à ligne et mot à mot. Rien n'est collé dans le serveur de quelqu'un d'autre.
- [Encodeur & décodeur Base64](https://abox.tools/fr/encoder-base64/): Base64, encodage pourcent, entités HTML, hexadécimal et échappements antislash, dans les deux sens. Rien n'est collé dans le serveur de quelqu'un d'autre.

## Questions

### Mon texte est-il envoyé quelque part ?

Non. Chaque analyseur et chaque scripteur de cette page sont des fonctions qui s'exécutent dans votre propre navigateur, sur votre propre matériel. Cet outil n'a aucune fonction réseau : il ne va jamais rien chercher et n'envoie jamais rien, et la `Content-Security-Policy` de la page nomme chaque adresse qu'elle a le droit de contacter, dont aucune ne nous appartient. C'est la raison de s'en servir pour un jeton d'accès, un cookie de session ou une fiche client : coller l'un de ceux-là dans le formateur de quelqu'un d'autre, c'est le lui donner.

### Formater du JSON change-t-il autre chose que la mise en forme ?

Non, et c'est plus difficile qu'il n'y paraît. Les clés gardent l'ordre dans lequel vous les avez écrites : un formateur bâti sur `JSON.parse` déplace silencieusement en tête les clés ressemblant à des entiers, si bien que `{"10":a,"2":b}` revient en `{"2":b,"10":a}`. Les nombres gardent les chiffres que vous avez tapés : un identifiant de vingt chiffres ne perd pas ses trois derniers au profit d'un double, et `1e999` ne devient pas `null`. Les clés en double sont toutes les deux conservées, parce que la norme ne dit pas laquelle l'emporte et qu'en supprimer une reviendrait à choisir à votre place.

### Quels langages sait-il formater ?

JSON, XML, HTML, CSS et YAML. JSON, XML, HTML et CSS peuvent aussi être compactés ; YAML non, car sa forme courte est le style de flux, qui est illisible, et l'illisible est l'inverse de la raison qui pousse à garder un fichier en YAML. JavaScript n'est délibérément pas sur la liste : voyez la question à ce sujet plus bas.

### Pourquoi ne formate-t-il pas JavaScript, Python ou SQL ?

Parce que mettre en forme un langage de programmation suppose de l'analyser correctement, et qu'un formateur qui y arrive presque est pire que rien : il produit du code qui a l'air correct et qui fait autre chose. JSON, XML, CSS et YAML ont des grammaires assez petites pour être lues à la main et vérifiées par des tests que vous pouvez lancer. Un formateur JavaScript, c'est Prettier, soit un mégaoctet d'analyseur, et sa place est dans votre éditeur, pas sur une page web.

### Mon YAML dit no et le JSON est ressorti en chaîne. Pourquoi ?

Parce que c'est une chaîne, et que ceci lit le YAML 1.2 et non le 1.1. En YAML 1.1, `yes`, `no`, `on` et `off` étaient des booléens, ce qui est le fameux bogue qui transforme le code pays de la Norvège en `false`. YAML 1.2 a supprimé cela, et cet outil aussi : seuls `true`, `false`, `null` et `~` sont lus comme autre chose que du texte. Dans l'autre sens, ces mots sont réécrits *entre guillemets*, alors même que cet outil les lirait comme du texte sans les guillemets — parce que ce qui ouvrira le fichier ensuite, peut-être pas. PyYAML est toujours en 1.1 par défaut. Lire strictement et écrire prudemment est la seule combinaison juste dans les deux sens.

### Que perd-on en convertissant du YAML en JSON ?

Les commentaires, parce que JSON n'a nulle part où en mettre. Les ancres, les alias et les balises sont refusés d'emblée plutôt que devinés : chacun dit quelque chose que JSON ne sait pas dire, et un convertisseur qui choisirait discrètement une interprétation vous rendrait un document qui n'est pas ce que disait le fichier. Dans l'autre sens, on ne perd rien : tout document JSON est déjà un document YAML.

### Que perd-on en convertissant du JSON en XML ?

La différence entre un objet vide, un tableau vide et une chaîne vide, qui deviennent tous un élément vide, et le type de chaque valeur, puisque XML n'a pas de types — c'est pourquoi la conversion inverse laisse tout en chaîne plutôt que de décider que `8080` était un nombre. Un tableau devient un élément répété, seule forme qui se relit, et une clé qu'un nom d'élément ne peut pas porter voit ses caractères gênants remplacés, plutôt que de produire un document qu'aucun analyseur ne lira.

### Réindenter du HTML change-t-il l'apparence de la page ?

Cela peut arriver, et c'est dit honnêtement ici. Un blanc entre deux éléments en ligne est une espace entre deux mots : le déplacer n'est donc pas gratuit. Deux choses tiennent cela en bride : `<pre>` et `<textarea>` sont recopiés exactement tels quels, et un élément qui ne contient que du texte reste sur une seule ligne. Tout le reste est mis en forme.

### Quelle taille de fichier peut-il traiter ?

Aucune limite n'est fixée ici, puisqu'aucun serveur ne la paie. Le plafond réel est votre machine : quelques mégaoctets de JSON ne posent pas de problème, et sur un très long document la page attend une pause dans votre frappe avant de reformater, plutôt que de vous disputer le clavier.

### Est-ce gratuit, et faut-il un compte ?

C'est gratuit, et il n'y a ni compte, ni identification, ni période d'essai, ni limite sur ce que vous collez. Le site affiche de la publicité, et c'est elle qui le finance ; les annonces ne reçoivent rien sur votre texte.

### Est-ce que cela fonctionne hors ligne ?

Oui. Chargez la page une fois, coupez ensuite votre connexion et elle continue de travailler. C'est aussi la façon la plus simple de prouver que rien n'est envoyé, car un outil qui expédierait votre texte ailleurs pour le formater s'arrêterait à l'instant où vous débranchez.

## Comment cette promesse se vérifie

- **Ce que vous collez n'a nulle part où aller.** La Content-Security-Policy nomme chaque adresse que cette page a le droit de contacter, et pas une seule ne nous appartient. Il n'existe ici aucun point de collecte où un jeton collé pourrait atterrir, ni rien dans le code qui l'y enverrait s'il en existait un.
- **Rien ici ne va chercher quoi que ce soit.** Il n'y a nulle part dans `src/` ni `fetch`, ni `XMLHttpRequest`, ni `sendBeacon`. Chaque analyseur et chaque scripteur sont des fonctions de cette page qui prennent une chaîne et renvoient une chaîne.
- **Les formateurs gardent ce qu'on leur a donné.** Un objet JSON revient avec ses clés dans l'ordre où vous les avez écrites et ses nombres écrits comme vous les avez écrits, parce que `src/shared/parse-json.js` est un analyseur et non un appel à `JSON.parse`, qui réordonne les clés ressemblant à des entiers et transforme un identifiant de vingt chiffres en le double le plus proche. Les tests de `tests/js/text-format.test.js` vérifient exactement cela.
- **Ce que Google charge, et ce qu'on ne lui donne pas.** Les scripts publicitaires et de mesure viennent de Google, et le bouton de don de Buy Me a Coffee. Aucun d'eux ne reçoit un caractère de votre texte. Chaque ligne qui le lit, l'analyse ou l'écrit est servie depuis cette origine et figure dans le dépôt.
- **Tout fonctionne hors ligne.** Coupez le réseau : l'outil reste identique, puisqu'il n'a jamais comporté la moindre étape réseau. C'est la preuve la plus simple de toutes.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/shared/parse-json.js` pour l'analyseur qui garde vos clés dans l'ordre où vous les avez écrites, et `src/convert.js` pour comprendre pourquoi une conversion est un analyseur et un scripteur, sans rien entre les deux qui connaisse les deux formats à la fois.
