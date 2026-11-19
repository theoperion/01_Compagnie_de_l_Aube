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
- **Note finale sur 10 donnée par le critique, l'Avocat du diable** (sur capture réelle : beauté, lisibilité, utilité, sobriété, niveau d'une app grand public soignée) : **8 minimum** pour publier (Théo, 19/11 : « 8 ou 8,5 est acceptable »). En dessous, il dit précisément quoi changer, on reprend et on lui resoumet.
- Un seul « non » = on reprend avant de publier. Les captures validées sont montrées à Théo avec leur verdict.
- **Claude applique les verdicts du critique** (demande de Théo, 19/11/2026) : ce que l'Avocat du diable dit de garder, simplifier ou retirer est fait, sauf si Théo a explicitement décidé autrement.
