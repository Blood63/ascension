# Mettre le site Ascension en ligne (5 minutes)

Le dossier est **100 % statique**. Chemins relatifs partout + fichier `.nojekyll`. Adresse publique actuelle : `https://blood63.github.io/ascension/`.

Aucun compte n’est créé ici : tu déploies toi-même.

## Avant d’envoyer les fichiers

1. Les balises Open Graph / Twitter (`og:url`, `og:image`, `twitter:image`) et le lien canonique pointent vers `https://blood63.github.io/ascension/`. Si le site change d’adresse, mets-les à jour (ces balises ont besoin d’une adresse absolue).
2. Vérifie une dernière fois `downloads/SHA256SUMS.txt` : il doit correspondre aux fichiers `Ascension-v0.19.0.apk` et `Ascension-v0.19.0-offline.html` livrés.

## GitHub Pages

1. Crée un dépôt (public ou privé) et envoie **le contenu** de `ascension-site/` à la racine du dépôt (le `index.html` du site doit être à la racine, pas dans un sous-dossier supplémentaire).
2. Dans le dépôt : **Settings → Pages**.
   - Source : *Deploy from a branch*.
   - Branche : `main` (ou `master`), dossier `/ (root)`.
3. Enregistre. L’adresse sera du type `https://<compte>.github.io/<depot>/`.
4. (Optionnel) Dans **Pages → Custom domain**, tu pourras plus tard rattacher un nom de domaine personnalisé et suivre les instructions DNS, puis mettre à jour les balises Open Graph en conséquence.
5. Attends 1 à 2 minutes, puis ouvre le site, clique sur **Jouer maintenant**, et installe l’application (PWA) une fois pour vérifier le mode hors-ligne.

Le fichier `.nojekyll` évite que GitHub Pages passe le site dans Jekyll (ce qui casserait des fichiers commençant par `_` ou certains chemins).

## Cloudflare Pages

1. Sur [Cloudflare Pages](https://pages.cloudflare.com/), crée un projet.
2. Soit tu branches le même dépôt Git et tu laisses **Build command** vide, **Output directory** vide (ou `/`) — le site n’a rien à compiler.
3. Soit tu envoies simplement le dossier via *Direct Upload* : sélectionne le contenu de `ascension-site/`.
4. Une fois le déploiement vert, l’adresse est `https://blood63.github.io/ascension/`. Un domaine personnalisé peut être ajouté plus tard dans **Custom domains**.

## Contrôles rapides après mise en ligne

- L’accueil, `privacy.html` et `./play/` s’affichent.
- `./downloads/Ascension-v0.19.0.apk`, `./downloads/Ascension-v0.19.0-offline.html` et `./downloads/SHA256SUMS.txt` répondent en 200, avec les tailles 13 986 304, 15 012 397 et le fichier de sommes.
- Après une visite, le mode avion lance encore `./play/`.
- L’APK n’a **pas** à être mis dans un bundle Play (`.aab`) pour ce site.

## Mise à jour future

Remplace les fichiers du dossier (jeu dans `play/`, APK / HTML dans `downloads/`, `SHA256SUMS.txt`) et réenvoie. Le service worker porte le nom de cache `ascension-v0.19.0` : quand tu passeras à une version suivante, change cette constante dans `sw.js` (et la pastille de version du site) pour que les navigateurs abandonnent l’ancien cache.
