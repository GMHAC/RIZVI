const CACHE='rizvi-v1';
const ASSETS=['./','./index.html','./firebase-config.js','./firebase-app.js','./rizvi-data.js','./rizvi-app.js','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
