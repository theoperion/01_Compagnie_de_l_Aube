# La Compagnie de l'Aube

*Ce que l'on tient chaque jour forge ce que l'on devient.*

Une app de bonnes habitudes façon jeu de rôle, à deux, installable sur le téléphone.
Adresse de l'app : https://theoperion.github.io/01_Compagnie_de_l_Aube/

## Comment c'est organisé

```
Téléphone                                        Google
┌──────────────────────────────┐                 ┌──────────────────────────────┐
│ index.html   l'app Compagnie │  ── envoie ──▶  │ moteur/Code.js (Apps Script) │
│ carnet.html  le Carnet       │  ◀─ l'état ───  │   lit et écrit dans          │
│ config.js    réglages communs│                 │   la Google Sheet            │
│ sw.js        copie hors ligne│                 └──────────────────────────────┘
└──────────────────────────────┘
```

| Fichier | Rôle |
| --- | --- |
| `index.html` | L'app principale : quêtes du jour, personnage, boss, Compagnie, profil, réglages. |
| `carnet.html` | Le Carnet de quêtes : anglais avec Claude, plan de course 10 km, renfo, montre Garmin. Ouvert dans l'app (onglet Carnet). |
| `config.js` | **Les réglages communs, à un seul endroit** : adresse du moteur et numéros de version de l'app et du Carnet. |
| `sw.js` | Garde une copie de l'app sur le téléphone pour l'ouvrir sans réseau. |
| `manifest.webmanifest`, `icon-*.png` | Nom, couleurs et icônes de l'app installée. |
| `moteur/Code.js` | Le moteur (Google Apps Script) relié à la Google Sheet : règles du jeu, sauvegardes, appels à Claude et à intervals.icu. |
| `moteur/appsscript.json`, `moteur/.clasp.json` | Réglages du projet Apps Script, pour l'outil clasp. |

Les clés secrètes (Claude, intervals.icu) et l'e-mail du rappel ne sont **jamais** dans ce dépôt :
ils sont dans Apps Script → Paramètres du projet → Propriétés du script.

## Mettre à jour

### L'app ou le Carnet

1. Modifier `index.html` et/ou `carnet.html`.
2. Dans `config.js`, changer la version de ce qui a changé (`VERSION_APP` + `NUMERO_APP`, ou `VERSION_CARNET` + `NUMERO_CARNET`).
   Changer la version force les téléphones à recharger, et renouvelle la copie hors ligne.
3. Mettre sur la branche `main` : GitHub Pages publie l'app en une minute ou deux.

### Le moteur (avec clasp)

Depuis le dossier `moteur/`, une fois connecté (`clasp login --no-localhost`) :

```bash
clasp push --force
```

```bash
clasp deploy -i AKfycbxFI9eEgrFJLsMuQo-TXD2m2REmXnyWEcTmxK1LTydm4f5fJdepE_qB93W6j2cqepSX -d "moteur X.Y : ce qui change"
```

Le déploiement garde la même adresse : rien à changer dans l'app.
Avant chaque livraison, monter `VERSION_MOTEUR` et `NUMERO_MOTEUR` en haut de `Code.js` (affichés en bas des réglages de l'app).

**Revenir en arrière** : `clasp list-deployments` montre le numéro de version en service (ex. `@59`).
Pour remettre l'ancienne : `clasp deploy -i <même identifiant> -V <ancien numéro>`.

## Suivi du chantier

Le mode d'emploi, les checklists et le journal des modifications sont dans le document Claude
« Compagnie de l'Aube — Mode d'emploi du chantier ».
