// Network-first: bei Verbindung immer die neueste Version, sonst Cache (offline spielbar).
// Die Seite selbst wird mit einem wechselnden ?v=... geholt: so kommt sie garantiert frisch vom Server
// und nicht aus einem Zwischenspeicher (GitHub Pages haelt Seiten sonst bis zu 10 Minuten vor).
const C='pokerrunde-v4';
const FILES=['peerjs.min.js','./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const u=new URL(req.url);
  const page=req.mode==='navigate'||(u.origin===location.origin&&/\/(index\.html)?$/.test(u.pathname));
  // im Cache nur eine Kopie der Seite ablegen, egal mit welchem ?u=/?v= sie geholt wurde
  const key=page?u.origin+u.pathname:req;
  let net;
  if(page){const f=new URL(u.origin+u.pathname);f.searchParams.set('v',Date.now());net=fetch(f.href,{cache:'no-store',credentials:'same-origin'});}
  else net=fetch(req,{cache:'no-cache'});
  e.respondWith(net.then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(key,cp)).catch(()=>{});}return r})
    .catch(()=>caches.match(key).then(m=>m||caches.match('index.html'))));
});
