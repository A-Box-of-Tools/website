# Comment nettoyer un mémo vocal avant de l'envoyer

Un mémo vocal arrive avec trente secondes de bruit de poche, deux faux départs, et un niveau réglé par la distance du téléphone. Le rendre envoyable tient en deux pas — couper, puis remonter — et les deux tournent dans votre navigateur, qui est l'endroit où doit rester un enregistrement de votre propre voix disant des choses privées.

[Ouvrir Éditeur audio](https://abox.tools/fr/modifier-un-audio/): La passer à l'envers, changer la vitesse, relever un enregistrement trop faible : tout cela ici, sur votre machine.

Dernière mise à jour 26 août 2026

## La réponse courte

1. **Coupez.** Ouvrez le [Découpeur audio](https://abox.tools/fr/couper-un-audio/), déposez le mémo, et marquez les parties à garder avec `I` et `O` pendant la lecture. La forme d'onde montre les silences et les faux départs comme des tronçons plats, l'essentiel de la coupe se fait donc à l'œil. Exportez un seul fichier.
2. **Remontez.** Portez ce fichier à l'[Éditeur audio](https://abox.tools/fr/modifier-un-audio/) et normalisez — le niveau monte juste sous la pleine échelle, le plus fort qu'un enregistrement puisse être sans saturer. Exportez, et envoyez cela.

Le trajet entre les deux ne demande aucun téléchargement : une fois la coupe exportée, une ligne sous le bouton de téléchargement propose de poursuivre avec le résultat dans l'éditeur, et le mémo y arrive déjà chargé.

Les deux pas tournent sur votre propre machine. Un mémo vocal est à peu près ce qu'un fichier a de plus personnel, et les sites habituels d'« amélioration audio en ligne » en prennent une copie comme prix du curseur.

![L'éditeur audio avec un enregistrement chargé : sa durée, son format, sa fréquence d'échantillonnage et un niveau crête d'environ moins six décibels.](https://abox.tools/screens/clean-up-a-voice-memo/source.webp)

Ce que l'outil établit avant que vous ne touchiez à quoi que ce soit. Le niveau crête est le chiffre qui décide s'il est prudent de monter le volume.

## Pourquoi couper avant de remonter

Parce que normaliser lit le fichier entier pour trouver son moment le plus fort, et dans un mémo brut le moment le plus fort est souvent la chose que vous alliez supprimer — le choc du téléphone posé, la toux avant la deuxième prise. Normalisez d'abord et cette pointe fixe le plafond, si bien que la voix ressort aussi basse qu'elle est entrée. Coupez le rebut, et le plus fort qui reste est la voix elle-même, qui est ce à quoi la marge doit servir.

Le découpeur coupe à l'échantillon exact et fond chaque raccord sur quelques millisecondes, si bien qu'une coupe au milieu du bruit de la pièce ne peut pas cliquer. Les raccords seulement — l'audio intact entre eux est copié, pas réencodé.

## Ce que l'éditeur répare, et ce qu'il ne répare pas

Normaliser répare le *trop bas*. Cela ne répare pas le bruyant : le niveau de la climatisation monte avec celui de la voix, parce que c'est un seul enregistrement et qu'ils y sont ensemble. Ce qui garde un mémo intelligible, c'est surtout la coupe — les blancs sont l'endroit où le bruit s'entend tout seul — plus le réglage de vitesse pour l'auditeur : 1,25× en gardant la hauteur est l'astuce des podcasts, et elle marche aussi bien sur un mémo qui s'étale.

L'éditeur écrit du WAV — des échantillons exacts, aucun encodeur dans la boucle — le fichier est donc plus gros que l'original compressé. Pour un mémo qui se compte en minutes, c'est un prix honnête pour ne jamais empiler un second encodage avec perte sur le premier fait par le téléphone ; la messagerie qui l'enverra le compressera de toute façon une fois de plus, et ce devrait être la seule.

![L'éditeur : un réglage de vitesse à 1,25, un réglage de volume à plus quatre décibels et un récapitulatif de la durée, de la vitesse et de la crête qui en découlent.](https://abox.tools/screens/clean-up-a-voice-memo/edit.webp)

La vitesse et le volume, avec en dessous le récapitulatif de ce qu'ils vont faire. Rien n'est appliqué avant l'export, les deux peuvent donc être bougés puis remis.

## La même chaîne, des enregistrements plus longs

Un entretien, un cours, une réunion — la chaîne est la même, la coupe rapporte simplement davantage. Marquez les questions qui comptent, laissez tomber le reste, et les marques elles-mêmes se sauvegardent en simple fichier texte et se rechargent, ce qui fait d'un long nettoyage quelque chose qu'on peut poser et reprendre. Pour l'audio logé dans une vidéo, l'éditeur sort aussi la piste d'un MP4 ou d'un MOV sans toucher à l'image — le premier pas pour faire d'un appel enregistré quelque chose d'écoutable dans les transports.

## Si vous faites cela chaque semaine

Couper et remonter vivent sur deux pages à dessein — chacune fait un travail, et chacune peut prouver seule que l'enregistrement n'a jamais quitté votre machine. Mais les deux sont libres : licence MIT, un dossier par outil, des modules ES sans dépendances dont les README expliquent les coupes à l'échantillon près et l'écriture du WAV.

Si des mémos vous tombent dessus chaque jour, pointez un agent de code vers le [dépôt](https://github.com/A-Box-of-Tools/website) et demandez-lui la version en une page : forme d'onde, marques, normalisation à l'export. Les modules ont été écrits pour être lus, et les emporter est exactement ce à quoi sert la licence.
