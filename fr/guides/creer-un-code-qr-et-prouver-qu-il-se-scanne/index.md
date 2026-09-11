# Comment créer un code QR et prouver qu'il se scanne

L'erreur QR qui coûte cher n'est pas de faire le code — c'est de découvrir sur place que les affiches se scannent vers une faute de frappe. Générer et vérifier sont deux outils ici, et lancer le second avant le tirage coûte une minute et attrape presque tout ce que le tirage aurait expédié.

[Ouvrir Lecteur de QR codes et de codes-barres](https://abox.tools/fr/lecteur-de-qr-code/): Visez un code, ou déposez-en une photo. La lecture se fait ici, et nulle part ailleurs.

Dernière mise à jour 26 août 2026

## La réponse courte

1. **Créez-le.** Ouvrez le [Générateur de QR & codes-barres](https://abox.tools/fr/generateur-de-qr-code/), choisissez la tâche — un lien, un réseau Wi-Fi, une carte de contact — et vérifiez la chaîne exacte que le code contiendra, que la page montre au lieu de la cacher. Exportez le SVG pour l'impression, le PNG pour les écrans.
2. **Imprimez-en un.** À la vraie taille, sur le vrai papier, avant le tirage de deux cents.
3. **Prouvez-le.** Photographiez le tirage d'essai avec un téléphone — de biais, dans la lumière du lieu — et déposez la photo sur le [Lecteur de QR & codes-barres](https://abox.tools/fr/lecteur-de-qr-code/). Il montre la charge décodée et, pour un lien, l'hôte qu'il atteint vraiment. Si cela correspond à ce que vous vouliez, le tirage ne risque rien.

Les deux outils tournent dans votre navigateur et n'envoient rien nulle part — ce qui, pour un code Wi-Fi, veut dire que le mot de passe qu'il contient n'a jamais été tapé dans le site de quelqu'un d'autre.

![Le générateur de QR avec une adresse saisie, montrant le code fini et ses caractéristiques : sa version, son niveau de correction d'erreurs et la place qu'il lui reste.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

Le code, fabriqué.

## Ce que la vérification attrape vraiment

- **La faute de frappe.** L'échec le plus courant n'est pas le code — c'est l'URL dedans. Le relire est la seule vérification qui teste ce qui est réellement encodé plutôt que ce que vous pensiez coller.
- **La taille et la distance.** Un code scanné à travers une salle demande de plus gros modules qu'un code sur une carte de visite. Photographier le tirage d'essai depuis l'endroit où les gens se tiendront est le test honnête ; les niveaux de correction d'erreur du générateur disent tout haut ce que chacun coûte en densité.
- **Les couleurs.** Les codes imprimés clair sur foncé se scannent ; les palettes de marque à faible contraste, souvent pas. Le lecteur encaisse plus que la plupart des téléphones — si *lui* peine sur la photo, le plus vieux téléphone du hall n'a aucune chance.
- **Le pli et le reflet.** La correction de Reed-Solomon fait qu'un code en partie couvert se lit encore — jusqu'au niveau que vous avez choisi. Une affiche promise aux intempéries mérite le niveau supérieur et le code un peu plus dense qu'il coûte.

![Le lecteur, à qui la même image a été donnée : il indique l'adresse contenue dans le code, la symbologie, et l'endroit de l'image où il l'a trouvé.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

Et la même image relue par un autre outil, seul essai qui attrape un code mal sorti. Le lecteur montre ce qu'il a trouvé, et ne l'ouvre pas.

## Le même lecteur, pour les codes qui ne sont pas les vôtres

Vérifier est aussi la façon sûre d'ouvrir le code QR imprimé par quelqu'un d'autre. Le lecteur montre l'adresse entière et l'hôte qu'elle atteint vraiment *avant que rien ne s'ouvre*, et il nomme les ruses qui déguisent un lien — un nom d'utilisateur devant le @, un alphabet sosie, une redirection. L'autocollant sur l'horodateur mérite cette inspection ; le badge de conférence aussi. Rien ne s'ouvre à votre place, et rien de ce que vous scannez n'est envoyé nulle part.

## Si vous faites cela chaque semaine

Créer et vérifier vivent sur deux pages à dessein — chacune fait un travail, et chacune peut prouver seule que rien ne quitte votre machine. Mais les deux sont libres : licence MIT, des modules ES sans dépendances — l'encodeur du générateur et le décodeur Reed-Solomon du lecteur, chacun avec un README qui l'explique.

Si des codes partent chaque semaine de votre bureau, pointez un agent de code vers le [dépôt](https://github.com/A-Box-of-Tools/website) et demandez-lui une page qui génère et fait aussitôt repasser le code rendu par le décodeur — un autotest à chaque export. Les modules ont été écrits pour être lus, et les emporter est exactement ce à quoi sert la licence.
