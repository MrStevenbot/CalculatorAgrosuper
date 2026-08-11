const CACHE = 'agrocalc-v47';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  // Red primero: con señal, siempre trae la versión más nueva (antes quedaba pegada en
  // caché indefinidamente aunque se subieran versiones nuevas al repositorio). Si no hay
  // red (plantas con señal débil), cae al caché — mantiene el uso offline.
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const resClone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, resClone));
      }
      return res;
    }).catch(() => caches.open(CACHE).then(cache => cache.match(e.request)))
  );
});
