/* SMILE service worker: offline app shell.
   Bump VERSION whenever you change files so users get the update. */
const VERSION = 'smile-v3.0.0';
const SHELL = [
  './', './index.html', './styles.css', './icons.js', './config.js', './data.js', './app.js', './checkin.js', './market.js', './manifest.webmanifest',
  './vendor/jsQR.min.js',
  './assets/hero.jpg', './assets/hero-sm.jpg', './assets/hero-blur.jpg', './assets/logo-circle.png',
  './assets/cat-landmarks.jpg', './assets/cat-restaurants.jpg', './assets/cat-shops.jpg', './assets/cat-events.jpg', './assets/cat-stays.jpg',
  './icons/icon-32.png', './icons/icon-96.png', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'
];
const NEVER_CACHE = ['script.google.com', 'googleusercontent.com', 'maps.google.com', 'www.google.com', 'maps.gstatic.com', 'maps.googleapis.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (NEVER_CACHE.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) return;   // live data & maps
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) caches.open(VERSION).then(c => c.put('./index.html', r.clone())); return r; })
      .catch(() => caches.match(req).then(m => m || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(cached => {
    const net = fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => cached);
    return cached || net;
  }));
});
