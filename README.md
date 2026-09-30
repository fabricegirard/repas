# Mon carnet de repas

Page statique prête pour GitHub Pages. Le fichier d'entrée est `index.html`.

<<<<<<< HEAD
La liste des repas est lue depuis une feuille Google Sheets publiée au format CSV. Les colonnes attendues sont `Nom`, `Emoji` et `Ingrédients`. Les ingrédients d'une cellule peuvent être séparés par des virgules ou des points-virgules. **Ajouter un repas** ouvre la feuille pour la modifier ; après modification, utilisez **Actualiser la liste** pour recharger son contenu. Le fichier `repas-de-depart.csv` contient les 40 repas initiaux à importer dans la feuille.
=======
La liste des repas est lue depuis une feuille Google Sheets publiée au format CSV. Les colonnes attendues sont `Nom`, `Emoji` et `Ingrédients`. Les ingrédients d'une cellule peuvent être séparés par des virgules ou des points-virgules. Pour modifier la liste partagée, éditez la feuille Google Sheets ; le bouton **Actualiser la liste** recharge son contenu. Le fichier `repas-de-depart.csv` contient les 40 repas initiaux à importer dans la feuille.
>>>>>>> cc0a0cf667e67b360fa9d0387eca696d822e9931

La feuille est publiée sur le Web pour permettre à la page GitHub Pages de la lire sans connexion Google. Son contenu est donc consultable publiquement. Si la feuille ne contient aucune recette, le carnet affiche une liste vide.

## Publier sur GitHub Pages

1. Créez un dépôt GitHub et ajoutez-y `index.html`, `manifest.webmanifest`, `sw.js` et `icon.svg` (ce README peut aussi être ajouté).
2. Dans le dépôt, ouvrez **Settings → Pages**.
3. Dans **Build and deployment**, choisissez **Deploy from a branch**, la branche `main` et le dossier `/ (root)`, puis enregistrez.
4. Une fois le déploiement terminé, ouvrez l'adresse Pages fournie par GitHub sur l'iPhone ou l'iPad.
5. Dans Safari, touchez **Partager → Sur l’écran d’accueil**.

Le site publié est accessible à toute personne disposant de son adresse. La feuille fournit la liste partagée entre les appareils ; une connexion Internet est nécessaire pour charger les dernières modifications. La dernière liste récupérée reste disponible hors ligne sur chaque appareil.
