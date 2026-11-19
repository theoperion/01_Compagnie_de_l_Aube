# Contexte commun du Conseil de la Compagnie (lu par chaque agent)

- Projet : « La Compagnie de l'Aube », app d'habitudes façon jeu de rôle pour deux héros (Théo et son compagnon d'armes ; ne jamais écrire le vrai prénom du compagnon dans ce dépôt public). Tout en **français**.
- Code : app dans `/home/user/01_Compagnie_de_l_Aube` (`index.html` = toute l'app, `carnet.html`, `config.js`, `sw.js`) ;
  moteur dans `/home/user/app_scripts/compagnie-de-l-aube` (`Code.js`, `Boss.js`, `Armurerie.js`, `tests/`).
  Lire d'abord `app_scripts/compagnie-de-l-aube/REPRISE.md` (architecture, règles du jeu, pièges connus).
- Le Conseil **ne modifie rien** : il lit, teste, simule, et rend un avis argumenté. Les corrections sont faites ensuite, avec l'accord de Théo.
- Chaque constat : où (fichier:ligne), quoi, scénario concret qui casse, gravité (bloquant / important / mineur), correction suggérée.
- La Saison 1 et ses boss sont **secrets** jusqu'au 1er janvier : ne rien proposer qui les dévoile.
- Mode aperçu pour tester l'app : `python3 -m http.server 8765` dans le dossier de l'app, puis Playwright (Chromium préinstallé)
  en remplaçant `config.js` par `globalThis.COMPAGNIE={API_URL:''};` et en mettant `localStorage.annonceBoss2026 = annonceAventure1 = 'ouverture|pre' = '1'`.

## Règle de validation visuelle (demandée par Théo le 19/11/2026)
- **Aucune nouveauté visuelle n'est mise en ligne sans double validation sur capture réelle** (mode aperçu, téléphone 390 px) :
  1. **l'Enlumineur** juge la qualité du dessin et de l'ambiance (« est-ce beau, au niveau du reste de l'app ? ») ;
  2. **l'Avocat du diable** conteste (« est-ce utile, lisible, pas ridicule, pas chargé ? »).
- **Note finale sur 10 donnée par le critique, l'Avocat du diable** (sur capture réelle : beauté, lisibilité, utilité, sobriété, niveau d'une app grand public soignée) : **7,5 minimum** pour publier (Théo, 19/11 : « 7,5 est acceptable, sinon on n'avance jamais » ; avant : 8). En dessous, il dit précisément quoi changer, on reprend et on lui resoumet.
- **Mise en ligne (Théo, 19/11)** : « dès que tous les agents valident les idées entre eux, mets en ligne » : quand le gardien du code (moteur) et le critique (visuel, ≥ 8) ont validé, Claude publie sans redemander à Théo, puis le prévient avec les captures et les notes.
- Un seul « non » = on reprend avant de publier. Les captures validées sont montrées à Théo avec leur verdict.
- **Claude applique les verdicts du critique** (demande de Théo, 19/11/2026) : ce que l'Avocat du diable dit de garder, simplifier ou retirer est fait, sauf si Théo a explicitement décidé autrement.
- **Tout est animé (Théo, 19/11/2026)** : chaque monstre, animal (familier, monture) et cosmétique créé ou retouché a son animation (mouvement de base + au moins une partie vivante : yeux, ailes, queue, flamme, tissu, lueur…). Un dessin statique n'est pas soumis au critique. Animations en transform/opacity seulement, coupées par le mode calme et `prefers-reduced-motion`. Le critique vérifie l'animation (pas seulement l'image arrêtée).
- **Le gardien du code relit AVANT CHAQUE publication** (Théo, 19/11/2026), appli comme moteur, même pour un petit correctif : diff relu, tests lancés (secret-public BLOQUANT, tirage-sync, débordement à 360/412 px, 0 erreur JS dans les 4 thèmes), régressions cherchées sur les écrans touchés. Pas de « OK » du gardien = pas de mise en ligne.

## Nouveau fonctionnement du Conseil (Théo, 19/11/2026 : « on part sur ça ») — remplace les boucles de notes
1. **Liste de contrôle AVANT de rendre** : le créateur (Enlumineur, ou tout agent qui produit un visuel) vérifie lui-même `.claude/agents/checklist-visuel.md` et le dit dans son rapport.
2. **Tri au lieu de boucles** : le critique classe chaque point en **BLOQUANT** (seul cas de nouveau passage devant lui) / **À CORRIGER** (le créateur ou Claude corrige, Claude vérifie sur capture, on publie sans 2e passage) / **PLUS TARD** (liste de finition, ne bloque rien). Il garde une note indicative (seuil 7,5).
3. **Relectures en parallèle** : critique et gardien relisent le même lot en même temps.
4. **Coup d'œil sur esquisse** pour les grosses nouveautés : une capture rapide au critique avant de tout dessiner.
5. **Contrôle proportionné** : petit correctif / texte → gardien seul ; nouveau visuel → critique + gardien ; règle de jeu → maître du jeu + gardien.
6. **Publication groupée** (environ une par demi-journée) avec une seule relecture du gardien.
7. **Mêmes agents sur un même sujet** (on les relance avec leur contexte plutôt que d'en créer de nouveaux).
Restent non négociables : gardien avant chaque publication, test secret-public BLOQUANT, contrôle de débordement 360/412 px, 0 erreur JS dans les 4 thèmes.
