# La Compagnie de l'Aube — fiche publique

App d'habitudes façon jeu de rôle, à deux, installable sur le téléphone : https://theoperion.github.io/01_Compagnie_de_l_Aube/

**Ce dépôt est public.** La vraie fiche de travail est **privée** : `compagnie-de-l-aube/CLAUDE.md` du dépôt `app_scripts` (moteur, règles, secrets de saison, état, dates clés). La lire en entier avant toute modification.

## Règles non négociables
- Tout en français, ton simple ; Théo ne fait rien de technique.
- **Jamais** le prénom du compagnon d'armes, l'e-mail de Théo, une clé ou un identifiant privé dans ce dépôt.
- **Jamais** rien de la saison à venir (noms, dessins, objets) avant sa date de sortie : avant chaque publication, le test secret-public du dépôt privé doit passer (bloquant).
- Publier l'app : modifier `index.html` / `carnet.html`, monter la version dans `config.js`, commiter, puis **uniquement** par `outils/publier-app.sh` du dépôt privé (contrôles bloquants, puis push sur `main`). **Gel des fêtes : rien du 20/12 au 02/01 sans le « oui » de Théo.**

## Agents (`.claude/agents/`)
5 agents en lecture seule : `maitre-du-jeu`, `gardien-du-code`, `ergonome`, `avocat-du-diable` (définis avec Théo le 24/11) et `directeur-artistique` (25/11, passe avant l'avocat sur les visuels). Qui relit quoi et règles détaillées : fiche privée, §3.
