"use strict";
/* Kabuk onbellegi. Amac cevrimdisi acilis ve Ana Ekran kurulumu, boylece Safari'nin
   bir haftalik depolama temizligi kullanicinin sayilarini silmiyor. */
const CACHE = "sinking-funds-shell-v1";
const SHELL = ["./", "./manifest.webmanifest", "./icons/icon-192.png",
               "./icons/icon-512.png", "./icons/icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match("./")))
  );
});
