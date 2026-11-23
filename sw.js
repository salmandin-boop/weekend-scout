// Weekend Scout service worker: app shell works offline; city lists and events are network-first.
const VERSION = 'ws-v1.9.0';
const SHELL = ['./', 'index.html', '404.html', 'privacy.html', 'terms.html', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'ws-prefs').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// The app itself lives at / ; city pages (/austin/) and share pages (/e/...) are their own documents.
const isApp = url => url.pathname === '/' || url.pathname === '/index.html';
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Events and pages: try the network first so the weekly list shows up right away, fall back to cache offline.
  if (url.origin === location.origin && (url.pathname.endsWith('.json') || req.mode === 'navigate')) {
    const key = req.mode === 'navigate' ? (isApp(url) ? 'index.html' : url.pathname) : req;
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(key, copy)); }
      return res;
    }).catch(() => caches.match(key, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
    return;
  }
  // Everything else (icons, fonts, images): cache first, then network.
  if (url.origin === location.origin || url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});

// Wednesday reminder: when the phone wakes the app in the background, check whether a new list is out.
self.addEventListener('periodicsync', e => {
  if (e.tag !== 'ws-weekly') return;
  e.waitUntil((async () => {
    const pc = await caches.open('ws-prefs'); const hit = await pc.match('/__prefs'); if (!hit) return;
    const prefs = await hit.json();
    const res = await fetch('/' + prefs.file, { cache: 'no-store' }); if (!res.ok) return;
    const data = await res.json();
    if (data.updated && data.updated !== prefs.updated) {
      prefs.updated = data.updated; await pc.put('/__prefs', new Response(JSON.stringify(prefs)));
      await self.registration.showNotification(`New weekend list for ${prefs.name}`, {
        body: `${data.events.length} things to do, ${data.weekend.label}. Tap to see what's on.`,
        icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: 'ws-weekly', data: { url: '/?city=' + prefs.city }
      });
    }
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) { c.navigate(target); return c.focus(); }
    return self.clients.openWindow(target);
  }));
});
