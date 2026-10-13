# Est-il sûr de coller du texte dans un outil en ligne ?

Coller ne ressemble pas à envoyer, et c'est là le piège : les mêmes octets quittent votre machine dans les deux cas si la page les expédie. Cette page dit ce qu'une config ou un journal collé transporte vraiment — et comment savoir si l'outil devant vous a seulement un endroit où l'envoyer.

Dernière mise à jour 26 août 2026

## La réponse courte

Coller du texte dans une page web peut porter à conséquence exactement autant qu'y téléverser un fichier. Si cela ne se sent pas, c'est que le geste vient d'un endroit sûr : entre deux de vos fenêtres, coller déplace du texte d'un lieu que vous contrôlez vers un autre lieu que vous contrôlez. Sur une page web, le second lieu est une zone de texte qu'un script peut lire — et la suite dépend entièrement de la page, pas du geste.

Bien des outils à zone de collage font leur travail sur un serveur : la page expédie votre texte, le serveur formate, valide ou compare, le résultat revient. Rien à l'écran ne dit laquelle des deux espèces vous utilisez. La zone de texte est la même dans les deux cas ; le bouton « Formater » aussi. La différence est une requête réseau, invisible tant qu'on ne la cherche pas.

## Ce qu'un collage transporte vraiment

Ce qui atterrit dans les outils en ligne est rarement de la prose. C'est le texte de travail du métier de quelqu'un, et le genre compte, parce que certaines des chaînes les plus sensibles de l'informatique sont précisément celles qu'on colle dans des formateurs à minuit :

- **Les fichiers de configuration** existent pour tenir ce qu'un programme ne doit pas coder en dur, et ces choses sont des mots de passe de bases de données, des clés d'API et des secrets de signature. Une config collée entière les transporte tous.
- **Les journaux et les traces d'erreur** transportent des jetons de session dans des URL, des adresses de courriel, des noms d'hôtes internes, et parfois un corps de requête avec les données personnelles de quelqu'un dedans.
- **Les réponses d'API** sont des instantanés de données de production — vrais clients, vrais soldes — collés quelque part de commode pour être lus.
- **Tout ce qui a la forme du base64** et finit dans un décodeur a généralement été encodé parce que cela comptait : un jeton en cours de débogage, un certificat, un en-tête d'authentification.

Une clé qui a transité par le serveur d'un inconnu doit être tenue pour exposée dès l'instant où l'on s'en aperçoit — révoquée et réémise, ce qui, sur un système en production, est un après-midi que personne n'avait prévu. Le propos n'est pas que les sites de formatage moissonnent des identifiants. C'est que vous ne pouvez pas savoir ce qu'un serveur journalise, et qu'un secret dont vous ne pouvez pas exclure l'exposition est un secret qu'il faut changer.

## Pourquoi l'outil n'a pas besoin que votre texte parte

Voici le fait technique qui tranche la question : formater, valider, convertir et comparer du texte comptent parmi les travaux les plus faciles de l'informatique. Analyser du JSON, indenter du XML, comparer deux fichiers, encoder du base64 — un navigateur fait cela en quelques millisecondes, localement, et en est capable depuis des années. Un serveur n'apporte rien au travail. Quand un outil à collage téléverse votre texte, c'est un vestige d'architecture ou une commodité pour l'exploitant, jamais une nécessité du travail.

C'est ce dont les outils de texte de ce site sont le contre-exemple. Le [formateur JSON](https://abox.tools/fr/formater-du-json/) analyse, formate et convertit JSON, XML, HTML, CSS et YAML ; le [comparateur de textes](https://abox.tools/fr/comparer-des-textes/) marque chaque différence entre deux textes, ligne par ligne et mot par mot ; l' [encodeur-décodeur base64](https://abox.tools/fr/encoder-base64/) fait les deux sens entre un texte et ses encodages. Tous trois tournent sur votre machine, et ce que vous collez n'a nulle part où aller — ces pages ne portent aucun chemin de code qui pourrait l'expédier.

Deux d'entre eux ont déjà leur guide : [formater du JSON sans l'envoyer](https://abox.tools/fr/guides/formater-du-json/) et [comparer deux fichiers JSON](https://abox.tools/fr/guides/comparer-deux-fichiers-json/).

## Savoir laquelle des deux espèces vous utilisez

Les vérifications sont les mêmes que pour un outil à fichiers, et elles sont écrites en entier dans [le guide sur l'envoi de fichiers](https://abox.tools/fr/guides/est-il-sur-d-envoyer-ses-fichiers/). La version courte, façon collage :

- **Débranchez.** Chargez la page, coupez la connexion, collez, appuyez sur le bouton. Un outil local continue ; un outil serveur s'arrête. Trente secondes, aucune expertise, infalsifiable.
- **Regardez l'onglet Réseau pendant que vous appuyez sur Formater.** Une requête qui part à cet instant, à peu près de la taille de votre collage, c'est votre collage qui part. Pas de requête, pas d'envoi.
- **Méfiez-vous des extras serviables.** Un bouton « partager cet extrait », un historique de vos collages synchronisé entre appareils, un lien à envoyer à un collègue — chacun n'est possible que si le texte a été stocké sur un serveur. Les fonctionnalités sont des aveux : une page qui peut montrer votre collage à quelqu'un d'autre l'a gardé.

Et une habitude vaut mieux que les trois vérifications : coller moins. Un validateur n'a pas besoin du vrai mot de passe pour valider la forme d'une config — `"REDACTED"` s'analyse à l'identique. Quant au collage qui est lui-même le secret, la règle se réduit à plus simple encore : la seule page qui devrait jamais recevoir un mot de passe est la page de connexion à laquelle il appartient.
