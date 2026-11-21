/* Ascension official site — service worker v0.19.3-r3
   Cache First for game assets; Network First for HTML; never cache ./downloads/ */
'use strict';
var CACHE_NAME = 'ascension-v0.19.3-r3';
var PRECACHE = [
  "./.nojekyll",
  "./DEPLOY.md",
  "./css/site.css",
  "./fonts/OFL.txt",
  "./fonts/PressStart2P-Regular.ttf",
  "./img/apple-touch-icon.png",
  "./img/char-basque-boy.webp",
  "./img/char-basque-girl.webp",
  "./img/char-boy.webp",
  "./img/char-girl.webp",
  "./img/char-trail-boy.webp",
  "./img/char-trail-girl.webp",
  "./img/chars-sheet.webp",
  "./img/gal-career.webp",
  "./img/gal-colombier.webp",
  "./img/gal-dole.webp",
  "./img/gal-dome.webp",
  "./img/gal-map.webp",
  "./img/gal-neige.webp",
  "./img/gal-reculet.webp",
  "./img/gal-rhune.webp",
  "./img/gal-sancy.webp",
  "./img/gal-vache.webp",
  "./img/gal-van.webp",
  "./img/hero-desktop.webp",
  "./img/hero-phone.webp",
  "./img/icon-192-maskable.png",
  "./img/icon-192.png",
  "./img/icon-512-maskable.png",
  "./img/icon-512.png",
  "./img/og-cover.png",
  "./img/og-cover.webp",
  "./img/pc-w1.webp",
  "./img/pc-w2.webp",
  "./img/pc-w3.webp",
  "./img/world1-shot.webp",
  "./img/world2-shot.webp",
  "./img/world3-shot.webp",
  "./index.html",
  "./js/site.js",
  "./manifest.webmanifest",
  "./play/SOUND-LICENSES.txt",
  "./play/assets/fonts/OFL.txt",
  "./play/assets/fonts/PressStart2P-Regular.ttf",
  "./play/assets/icon-512.png",
  "./play/assets/map/cine-w2-basque.webp",
  "./play/assets/map/cine-w2-bresse.webp",
  "./play/assets/map/cine-w2-jura-approche.webp",
  "./play/assets/map/cine-w2-landes.webp",
  "./play/assets/map/cine-w2-massif.webp",
  "./play/assets/map/cine-w2-merin-land.webp",
  "./play/assets/map/cine-w2-merin-port.webp",
  "./play/assets/map/cine-w2-soon.webp",
  "./play/assets/map/ending-aizkorri-land.webp",
  "./play/assets/map/ending-aizkorri-port.webp",
  "./play/assets/map/ending-artzamendi-land.webp",
  "./play/assets/map/ending-artzamendi-port.webp",
  "./play/assets/map/ending-atxuria-land.webp",
  "./play/assets/map/ending-atxuria-port.webp",
  "./play/assets/map/ending-colombier-land.webp",
  "./play/assets/map/ending-colombier-port.webp",
  "./play/assets/map/ending-colomby-land.webp",
  "./play/assets/map/ending-colomby-port.webp",
  "./play/assets/map/ending-dole-land.webp",
  "./play/assets/map/ending-dole-port.webp",
  "./play/assets/map/ending-dome-chevres-land.webp",
  "./play/assets/map/ending-dome-chevres-port.webp",
  "./play/assets/map/ending-dome-muletiers-land.webp",
  "./play/assets/map/ending-dome-muletiers-port.webp",
  "./play/assets/map/ending-dor-land.webp",
  "./play/assets/map/ending-dor-port.webp",
  "./play/assets/map/ending-mary-land.webp",
  "./play/assets/map/ending-mary-port.webp",
  "./play/assets/map/ending-neige-land.webp",
  "./play/assets/map/ending-neige-port.webp",
  "./play/assets/map/ending-orhy-land.webp",
  "./play/assets/map/ending-orhy-port.webp",
  "./play/assets/map/ending-pariou-land.webp",
  "./play/assets/map/ending-pariou-port.webp",
  "./play/assets/map/ending-poupet-land.webp",
  "./play/assets/map/ending-poupet-port.webp",
  "./play/assets/map/ending-reculet-land.webp",
  "./play/assets/map/ending-reculet-port.webp",
  "./play/assets/map/ending-rhune-land.webp",
  "./play/assets/map/ending-rhune-port.webp",
  "./play/assets/map/ending-sancy-land.webp",
  "./play/assets/map/ending-sancy-port.webp",
  "./play/assets/map/ending-txindoki-land.webp",
  "./play/assets/map/ending-txindoki-port.webp",
  "./play/assets/map/ending-ursuya-land.webp",
  "./play/assets/map/ending-ursuya-port.webp",
  "./play/assets/map/ending-vache-land.webp",
  "./play/assets/map/ending-vache-port.webp",
  "./play/assets/map/ending-van-land.webp",
  "./play/assets/map/ending-van-port.webp",
  "./play/assets/map/monde1.webp",
  "./play/assets/map/monde2.webp",
  "./play/assets/map/monde3.webp",
  "./play/assets/map/niveau7.webp",
  "./play/assets/map/original/cine-w2-basque.jpg",
  "./play/assets/map/original/cine-w2-bresse.jpg",
  "./play/assets/map/original/cine-w2-jura-approche.jpg",
  "./play/assets/map/original/cine-w2-landes.jpg",
  "./play/assets/map/original/cine-w2-massif.jpg",
  "./play/assets/map/original/cine-w2-merin-land.jpg",
  "./play/assets/map/original/cine-w2-merin-port.jpg",
  "./play/assets/map/original/cine-w2-soon.jpg",
  "./play/assets/map/original/ending-atxuria-land.jpg",
  "./play/assets/map/original/ending-atxuria-port.jpg",
  "./play/assets/map/original/ending-dome-chevres-land.jpg",
  "./play/assets/map/original/ending-dome-chevres-port.jpg",
  "./play/assets/map/original/ending-dome-muletiers-land.jpg",
  "./play/assets/map/original/ending-dome-muletiers-port.jpg",
  "./play/assets/map/original/ending-mary-land.jpg",
  "./play/assets/map/original/ending-mary-port.jpg",
  "./play/assets/map/original/ending-orhy-land-v080.jpg",
  "./play/assets/map/original/ending-orhy-land-v090.jpg",
  "./play/assets/map/original/ending-orhy-land.jpg",
  "./play/assets/map/original/ending-orhy-port-v080.jpg",
  "./play/assets/map/original/ending-orhy-port.jpg",
  "./play/assets/map/original/ending-pariou-land.jpg",
  "./play/assets/map/original/ending-pariou-port.jpg",
  "./play/assets/map/original/ending-sancy-land.jpg",
  "./play/assets/map/original/ending-sancy-port.jpg",
  "./play/assets/map/original/ending-ursuya-land.jpg",
  "./play/assets/map/original/ending-ursuya-port.jpg",
  "./play/assets/map/original/ending-vache-land.jpg",
  "./play/assets/map/original/ending-vache-port.jpg",
  "./play/assets/map/original/monde1-original.webp",
  "./play/assets/map/original/monde2-emilien.jpg",
  "./play/assets/map/original/monde2-original.jpg",
  "./play/assets/map/original/monde2-original.png",
  "./play/assets/map/original/monde3-v0140.webp",
  "./play/assets/map/original/monde3-v0176-sunset.webp",
  "./play/assets/map/original/niveau7-original.jpg",
  "./play/assets/map/original/orhy-clouds-aerial-v1.jpg",
  "./play/assets/map/original/orhy-clouds-ridge-v1.jpg",
  "./play/assets/map/original/orhy-clouds-v090.webp",
  "./play/assets/map/original/orhy-clouds-v091r1.webp",
  "./play/assets/map/original/orhy-clouds.webp",
  "./play/assets/map/original/orhy-far-v090.webp",
  "./play/assets/map/original/orhy-far-v091r1.webp",
  "./play/assets/map/original/orhy-far.webp",
  "./play/assets/map/original/orhy-iraty-v1.jpg",
  "./play/assets/map/original/orhy-mid-v090.webp",
  "./play/assets/map/original/orhy-mid-v091r1.webp",
  "./play/assets/map/original/orhy-mid.webp",
  "./play/assets/map/original/orhy-pyrenees-v1.jpg",
  "./play/assets/randonneur.png",
  "./play/css/site-bridge.css",
  "./play/css/style.css",
  "./play/index.html",
  "./play/js/alpine.js",
  "./play/js/alpine_themes.js",
  "./play/js/art.js",
  "./play/js/basque.js",
  "./play/js/basque_w3.js",
  "./play/js/cine.js",
  "./play/js/cine_w2.js",
  "./play/js/data.js",
  "./play/js/fauna.js",
  "./play/js/files.js",
  "./play/js/game.js",
  "./play/js/info.js",
  "./play/js/input.js",
  "./play/js/jura_themes.js",
  "./play/js/levels2.js",
  "./play/js/levels_jura.js",
  "./play/js/levels_w2.js",
  "./play/js/levels_w3.js",
  "./play/js/main.js",
  "./play/js/map.js",
  "./play/js/mech.js",
  "./play/js/pariou.js",
  "./play/js/postcard.js",
  "./play/js/profile.js",
  "./play/js/save.js",
  "./play/js/scenery.js",
  "./play/js/sfx.js",
  "./play/js/site-bridge.js",
  "./play/js/ui.js",
  "./play/js/vista.js",
  "./play/js/vista_w2.js",
  "./privacy.html",
  "./sw.js"
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isDownload(url) {
  return url.pathname.indexOf('/downloads/') !== -1 || /\/downloads\/?$/.test(url.pathname);
}
function isHtml(url) {
  var p = url.pathname;
  return p === '/' || p.charAt(p.length - 1) === '/' || /\.html?$/.test(p);
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;
  if (isDownload(url)) return; /* never cache APK / offline HTML / SHA256SUMS */

  if (isHtml(url)) {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          if (hit) return hit;
          return caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* Cache First for the rest (game assets, CSS, fonts, images, JS) */
  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
