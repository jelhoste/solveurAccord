// Mise en cache de l'appli pour un usage hors ligne.
// Stratégie : on sert la copie en cache tout de suite et on la met à jour en arrière-plan
// (les modifications apparaissent donc à la visite suivante). Changer CACHE force un nettoyage complet.
const CACHE='accords-v5';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{
      if(res.ok){const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp));}
      return res;
    }).catch(()=>null);
    return hit||net.then(res=>res||(r.mode==='navigate'?caches.match('./index.html'):Response.error()));
  }));
});
