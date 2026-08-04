# Opération Lille

Petit jeu rétro en 6 niveaux. HTML/CSS/JS vanilla, aucune dépendance, aucun build.

## Lancer en local

```bash
python -m http.server 8000
```

Puis ouvrir <http://localhost:8000>.

## Où éditer quoi

| Fichier | Contenu |
|---|---|
| `js/levels/level6.js` | **Le message final** (`finalMessage`, en haut du fichier) et l'image optionnelle (`finalPhoto`) |
| `js/levels/level1.js` … `level5.js` | Les textes de chaque niveau : bloc `const T = { ... }` en haut de fichier |
| `js/main.js` | Textes généraux : titre, accroche, encouragements (`const TEXTES`) |
| `js/sprites.js` | Le pixel art, dessiné en texte (1 caractère = 1 pixel) |
| `css/style.css` | Palette de couleurs (variables `--pink`, `--yellow`…) |

## Réglages de difficulté

Chaque niveau expose ses constantes en haut de son fichier (durée, objectif, vitesse).
