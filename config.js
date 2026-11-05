/* La Compagnie de l'Aube : LES réglages communs, à un seul endroit.
 * Lu par index.html (l'app), carnet.html (le Carnet) et sw.js (la copie hors connexion).
 * À chaque livraison : changer ici la version de ce qui a changé, et rien d'autre.
 */
globalThis.COMPAGNIE = {
  /* Adresse du moteur (Apps Script → Déployer → Gérer les déploiements → URL /exec). Mise à jour par clasp, même adresse. */
  API_URL: 'https://script.google.com/macros/s/AKfycbxFI9eEgrFJLsMuQo-TXD2m2REmXnyWEcTmxK1LTydm4f5fJdepE_qB93W6j2cqepSX/exec',
  /* App Compagnie (index.html) */
  VERSION_APP: '2026-11-05-7',
  NUMERO_APP: '3.9',      // +0.1 à chaque livraison
  /* Carnet de quêtes (carnet.html). Changer VERSION_CARNET force le téléphone à recharger le Carnet. */
  VERSION_CARNET: '2026-11-05-6',
  NUMERO_CARNET: '2.7'    // +0.1 à chaque livraison
};
globalThis.API_URL = globalThis.COMPAGNIE.API_URL;
