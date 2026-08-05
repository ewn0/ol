/* Service Worker pour Opération Lille (PWA) */
const CACHE_NAME = 'operation-lille-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/audio.js',
  './js/sprites.js',
  './js/main.js',
  './js/album.js',
  './js/chat.js',
  './js/map.js',
  './js/levels/level1.js',
  './js/levels/level2.js',
  './js/levels/level3.js',
  './js/levels/level4.js',
  './js/levels/level5.js',
  './js/levels/level_tetris.js',
  './js/levels/level6.js',
  './manifest.json',
  './assets/icon-192.svg',
  './assets/icon-512.svg'
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

self.addEventListener('fetch', event => {
  // Toujours laisser passer en direct les appels API REST GitHub
  if (event.request.url.includes('api.github.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
