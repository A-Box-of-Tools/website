# Est-il sûr d'envoyer ses fichiers à une IA ?

La question que le premier guide de ce site posait sur les convertisseurs, tournée vers l'endroit où les fichiers partent réellement aujourd'hui. La réponse honnête a la même forme : la plupart du temps il ne se passe rien de grave, et vous ne pouvez rien en vérifier — plus une différence qui compte. Un convertisseur transforme votre fichier sans se soucier de ce qu'il contient. À une IA, on envoie le fichier précisément pour que quelque chose le lise.

Dernière mise à jour 27 août 2026

## La réponse courte

Joindre un fichier à un chat d'IA, c'est un envoi. Y coller du texte aussi. La fenêtre ne ressemble pas à un formulaire d'envoi — pas de barre de progression, pas de « votre fichier est en cours de transfert » — mais les octets traversent l'internet vers les serveurs d'un fournisseur tout de même, et tout ce que [le premier guide de ce groupe](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/) disait des envois s'applique dès cet instant : combien de temps il est gardé, qui peut l'atteindre, quelles sauvegardes survivent au minuteur de suppression — chaque réponse est une promesse que vous croyez sur parole, invérifiable pour quiconque hors de l'entreprise.

Pour la plupart des fichiers, la plupart du temps, il ne se passe rien de grave ; les fournisseurs d'IA sérieux publient des règles de conservation et s'y tiennent pour l'essentiel. Si la question mérite sa propre page, c'est qu'une IA n'est pas un convertisseur sous un autre nom. Trois différences changent ce que fait une personne prudente — et aucune ne signifie « jamais ». Elles signifient : envoyer moins, et l'envoyer propre.

## Où va vraiment le fichier

Vers les ordinateurs du fournisseur, où plusieurs choses peuvent légalement lui arriver selon les conditions que vous avez acceptées. Il est conservé un certain temps — parfois des heures, parfois des années, souvent selon la formule et des réglages que vous n'avez peut-être jamais ouverts. Il peut être montré à des relecteurs humains, le plus souvent quand un système automatique signale la conversation. Selon le fournisseur, la formule et un réglage dont la valeur par défaut varie, il peut servir à entraîner les modèles futurs. Et il repose dans votre propre historique de conversations, c'est-à-dire derrière votre mot de passe, sur chaque appareil qui peut ouvrir votre compte.

Rien de tout cela n'est caché ; c'est écrit dans les politiques. Le point que ce groupe de guides ne cesse de faire est plus étroit : **vous ne pouvez rien en vérifier**. Un outil qui tourne dans votre navigateur peut prouver ses affirmations Wi-Fi coupé. Un service dont toute la valeur est un modèle tournant sur le matériel de quelqu'un d'autre ne peut, par nature, vous offrir cette preuve. La confiance est peut-être méritée. Cela reste de la confiance.

## Trois raisons pour lesquelles une IA n'est pas un convertisseur

### 1. Le fichier est envoyé pour être lu

Un convertisseur réencode votre fichier sans se soucier de ce qu'il contient ; aucune pièce de la machinerie ne s'intéresse au contenu. Une IA est l'inverse : lire le contenu, c'est le produit. Rien de sinistre — c'est ce que vous avez demandé — mais cela change ce que « sensible » veut dire. Le détail compromettant d'une photo traverse un redimensionnement intact et ignoré ; la clause compromettante d'un contrat est précisément ce dont le résumé sera fait.

### 2. Un agent peut le faire suivre

Le serveur d'un convertisseur est un cul-de-sac : fichier entrant, fichier sortant. Un assistant IA moderne est de plus en plus un agent doté de ses propres outils — recherche web, exécution de code, services tiers qu'il peut appeler. Le contenu que vous lui confiez peut être cité dans une requête de recherche, écrit dans un bac à sable, ou envoyé à l'outil que l'agent juge utile, chaque saut ajoutant une partie que vous n'avez jamais choisie. Les bons agents sont prudents là-dessus ; le point est que le public de votre fichier n'est plus forcément une seule entreprise.

### 3. La chose sensible, vous la collez exprès

Personne n'envoie son contrat de travail à un redimensionneur d'images. Dans un chatbot, les gens le collent tous les jours, parce que « explique-moi cette clause » est exactement le travail qu'une IA fait bien. Les fichiers dont il est vraiment question ici — contrats, résultats médicaux, journaux avec des clés dedans, données d'autrui — sont ceux pour lesquels une IA est la plus utile. C'est pourquoi le conseil de cette page n'est pas « abstenez-vous ». Le conseil, c'est la section suivante.

## Envoyer moins, et l'envoyer propre

Les quatre vérifications du premier guide se traduisent mal ici — un chatbot échoue au débranchage par construction, et l'onglet Réseau confirme simplement que tout part. Quand « est-ce que ça part ? » est répondu avant de commencer, la question utile devient : **qu'est-ce qui doit partir, et dans quel état ?** En pratique :

- **Envoyez le passage, pas l'archive.** Une question sur une clause demande une clause, pas le dossier de contrats. Moins il en part, moins il y a à conserver, à relire ou à faire suivre — et la réponse y gagne généralement, elle n'y perd pas.
- **Retirez ce dont la question n'a pas besoin.** Une photo sortie du téléphone porte des coordonnées GPS, des horodatages et un numéro de série d'appareil qu'aucune question sur l'image ne requiert. Le [visualiseur et suppresseur EXIF](https://abox.tools/fr/supprimer-les-donnees-exif/) montre ce qui voyage avec et l'enlève, dans votre navigateur, avant que quoi que ce soit ne soit joint.
- **Caviardez en supprimant, pas en recouvrant.** Si un document part vers une IA avec des noms, des numéros ou des identifiants dont elle n'a pas besoin, retirez-les d'abord avec le [caviardeur de PDF](https://abox.tools/fr/caviarder-un-pdf/) ou le [caviardeur d'images](https://abox.tools/fr/caviarder-une-image/) — tous deux suppriment ce que vous marquez au lieu de dessiner par-dessus, et la différence a [son propre guide](https://abox.tools/fr/guides/peut-on-recuperer-un-texte-caviarde/). Un modèle lit le fichier plus à fond que n'importe quel survol humain ; un secret à moitié couvert n'est pas à moitié sûr.
- **Les identifiants restent dehors, entièrement.** Des journaux et des fichiers de configuration partent dans les chats avec leurs clés d'API et leurs jetons encore dedans, et un secret collé doit être tenu pour grillé — la règle même à laquelle arrive le guide sur [le collage dans les outils en ligne](https://abox.tools/fr/guides/est-il-sur-de-coller-du-texte-dans-un-outil-en-ligne/). Faites tourner tout ce qui a filé.

## Quand envoyer est très bien, et quand rien n'a besoin de partir

Envoyez le fichier quand le contenu n'est pas sensible et que l'aide est réelle ; quand vous êtes sous des conditions que vous avez réellement lues, avec des réglages de conservation et d'entraînement que vous avez réellement fixés ; ou quand votre organisation a un accord qui fige ces réponses par écrit. C'est l'usage courant, et cette page ne plaide pas contre.

Et remarquez combien souvent la réponse à « faut-il que quelque chose parte ? » est non. Les corvées que les gens confient aux chats d'IA — compresse ceci, convertis cela, retire ces données, fais tenir ça sous la limite d'un formulaire — sont des travaux qu'un navigateur fait sur votre propre machine, et chaque outil de ce site les fait sans que le fichier parte. Un agent IA peut même piloter ces outils pour vous, et quand il tourne en local, la délégation ne coûte rien — c'est [le guide précédent](https://abox.tools/fr/guides/un-agent-ia-peut-il-utiliser-ces-outils/). La division du travail propre : les outils de ce site sont l'endroit où un fichier devient plus petit, plus net et délesté de ce que personne d'autre n'a besoin de voir — sur votre machine — et ce que vous choisissez d'envoyer ensuite part exprès, dans l'état que vous avez décidé.
