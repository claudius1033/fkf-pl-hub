// Service worker: installable app + push notifications + fast image loading.
// Fixtures, results and scores are NEVER cached, so they are always fresh.
var IMG = 'kpl-img-v1', STATIC = 'kpl-static-v1', MAXIMG = 400;

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== IMG && k !== STATIC; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function trim(cache) {
  return cache.keys().then(function (keys) {
    if (keys.length <= MAXIMG) return;
    return Promise.all(keys.slice(0, keys.length - MAXIMG).map(function (k) { return cache.delete(k); }));
  });
}
// Show the saved copy instantly, refresh it quietly in the background.
function swr(e, cacheName, req, tryCors) {
  e.respondWith(caches.open(cacheName).then(function (cache) {
    return cache.match(req).then(function (hit) {
      var fresh = (tryCors ? fetch(new Request(req.url, { mode: 'cors', credentials: 'omit' })).catch(function () { return fetch(req); }) : fetch(req))
        .then(function (r) {
          if (r && r.ok && r.type !== 'opaque') { cache.put(req, r.clone()).then(function () { return trim(cache); }); }
          return r;
        }).catch(function () { return hit; });
      if (hit) { e.waitUntil(fresh); return hit; }
      return fresh;
    });
  }));
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url; try { url = new URL(req.url); } catch (err) { return; }
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') return;
  if (req.destination === 'image') { swr(e, IMG, req, true); return; }
  if (url.origin === location.origin && /\.(?:woff2?|ttf|ico)$/i.test(url.pathname)) { swr(e, STATIC, req, false); return; }
  // everything else (pages, scripts, data) goes straight to the network, always fresh
});

// ---- Push notifications ----
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'KPL Hub', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'KPL Hub', {
    body: d.body || '',
    icon: '/icon-192.png',
    badge: '/favicon-32.png',
    tag: d.tag || undefined,
    data: { url: d.url || '/' }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if ('focus' in list[i]) { list[i].navigate(url); return list[i].focus(); }
    }
    return self.clients.openWindow(url);
  }));
});