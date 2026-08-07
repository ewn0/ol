/* Service Worker pour Safeplace (PWA) */
const CACHE_NAME = 'safeplace-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/audio.js',
  './js/sprites.js',
  './js/achievements.js',
  './js/pwahint.js',
  './js/main.js',
  './js/album.js',
  './js/chat.js',
  './js/map.js',
  './js/options.js',
  './js/lock.js',
  './js/levels/level1.js',
  './js/levels/level2.js',
  './js/levels/level3.js',
  './js/levels/level4.js',
  './js/levels/level5.js',
  './js/levels/level_tetris.js',
  './js/levels/level6.js',
  './manifest.json',
  './assets/icon-192.svg',
  './assets/icon-512.svg',
  './fonts/pressstart2p.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Réseau en priorité (pour toujours voir la dernière version du jeu),
// avec repli sur le cache si hors-ligne ou requête échouée.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Laisser passer en direct les appels vers des API externes (Worker, GitHub...)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
