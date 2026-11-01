/* La Compagnie de l'Aube : copie de l'app sur le téléphone pour l'ouvrir sans réseau.
 * Pages (index, carnet) : réseau d'abord (les mises à jour arrivent tout de suite), copie locale si le réseau
 * manque ou traîne plus de 4 s. Icônes et polices : copie locale d'abord.
 * Les échanges avec le Sheet (POST vers Apps Script) ne passent jamais par ici.
 */
const CACHE = 'compagnie-2026-11-01';
const COQUILLE = ['./', 'index.html', 'carnet.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(COQUILLE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function avecDelai(p, ms) {
  return new Promise((ok, ko) => { const t = setTimeout(() => ko(new Error('lent')), ms); p.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); ko(e); }); });
}
/* Clé de copie : la page sans « ?v=… » (le carnet est demandé avec un numéro de version) */
function cleCopie(url) { const u = new URL(url); u.search = ''; return u.href; }

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const memeSite = url.origin === self.location.origin;
  const police = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!memeSite && !police) return;

  if (police || /\.(png|webmanifest)$/.test(url.pathname)) {
    // copie locale d'abord, mise à jour en arrière-plan
    e.respondWith(caches.open(CACHE).then(async c => {
      const copie = await c.match(cleCopie(req.url));
      const reseau = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(cleCopie(req.url), r.clone()); return r; }).catch(() => null);
      return copie || (await reseau) || Response.error();
    }));
    return;
  }

  // pages et scripts du site : réseau d'abord, copie si hors connexion
  e.respondWith(caches.open(CACHE).then(async c => {
    const reseau = fetch(req).then(r => { if (r && r.ok) c.put(cleCopie(req.url), r.clone()); return r; });
    try { return await avecDelai(reseau, 4000); }
    catch (err) {
      const copie = await c.match(cleCopie(req.url)) || (req.mode === 'navigate' ? (await c.match(new URL('index.html', self.location).href) || await c.match(new URL('./', self.location).href)) : null);
      if (copie) return copie;
      try { return await reseau; } catch (e2) { return new Response('Hors connexion : ouvre l\'app une fois avec du réseau pour qu\'elle se garde sur ce téléphone.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
    }
  }));
});
