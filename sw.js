const CACHE = 'bl-admin-v1';
const ASSETS = ['./','./index.html','./manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  // Firebase y CDN: siempre red primero
  const url = e.request.url;
  if(url.includes('firebase') || url.includes('googleapis') || url.includes('gstatic')) {
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
    const rc=r.clone();
    caches.open(CACHE).then(cache=>cache.put(e.request,rc));
    return r;
  })));
});
