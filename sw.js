const CACHE = 'agrocalc-v8';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.add('./index.html')).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(function(res) {
        var copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(function() {
        return caches.match(e.request).then(function(cached) {
          return cached || new Response('Sin conexion. Recarga cuando tengas internet.', {
            status: 503,
            headers: {'Content-Type': 'text/plain'}
          });
        });
      })
  );
});
