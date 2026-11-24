// Weekend Scout service worker: app shell works offline; city lists and events are network-first.
const VERSION = 'ws-v1.16.0';
const SHELL = ['./', 'index.html', 'es.js', '404.html', 'privacy.html', 'terms.html', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

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
    // Friday morning (8 AM or later) in the city's time zone, once per weekend
    const now = new Date(), tz = prefs.tz || 'America/New_York';
    const day = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now);
    const hour = +new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(now);
    if (day !== 'Fri' || hour < 8 || hour > 20) return;
    const res = await fetch('/' + prefs.file, { cache: 'no-store' }); if (!res.ok) return;
    const data = await res.json();
    const fri = data.weekend && data.weekend.days && data.weekend.days.fri;
    if (!fri || prefs.notified === fri) return;
    prefs.notified = fri; prefs.updated = data.updated; await pc.put('/__prefs', new Response(JSON.stringify(prefs)));
    const evs = (data.events || []).filter(x => !x.featured), free = evs.filter(x => x.price === 'free').length;
    const top = evs.find(x => (x.good || []).includes('date')) || evs[0];
    await self.registration.showNotification(`This weekend in ${prefs.name}`, {
      body: `${data.events.length} picks${free ? `, ${free} free` : ''}.` + (top ? ` Top pick: ${top.title}.` : '') + ' Tap to see them all.',
      icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: 'ws-weekly', data: { url: '/?city=' + prefs.city }
    });
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
