# Contexte commun du Conseil de la Compagnie (lu par chaque agent)

- Projet : « La Compagnie de l'Aube », app d'habitudes façon jeu de rôle pour deux héros (Théo, Kevin). Tout en **français**.
- Code : app dans `/home/user/01_Compagnie_de_l_Aube` (`index.html` = toute l'app, `carnet.html`, `config.js`, `sw.js`) ;
  moteur dans `/home/user/app_scripts/compagnie-de-l-aube` (`Code.js`, `Boss.js`, `Armurerie.js`, `tests/`).
  Lire d'abord `app_scripts/compagnie-de-l-aube/REPRISE.md` (architecture, règles du jeu, pièges connus).
- Le Conseil **ne modifie rien** : il lit, teste, simule, et rend un avis argumenté. Les corrections sont faites ensuite, avec l'accord de Théo.
- Chaque constat : où (fichier:ligne), quoi, scénario concret qui casse, gravité (bloquant / important / mineur), correction suggérée.
- La Saison 1 et ses boss sont **secrets** jusqu'au 1er janvier : ne rien proposer qui les dévoile.
- Mode aperçu pour tester l'app : `python3 -m http.server 8765` dans le dossier de l'app, puis Playwright (Chromium préinstallé)
  en remplaçant `config.js` par `globalThis.COMPAGNIE={API_URL:''};` et en mettant `localStorage.annonceBoss2026 = annonceAventure1 = 'ouverture|pre' = '1'`.
