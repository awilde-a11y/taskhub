/* sw.js — TaskHub (safe caching) */
const CACHE_NAME = "taskhub-cache-v9"; // <- bei Updates Zahl erhöhen
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ✅ Externe Requests (Tailwind CDN, Google Fonts etc.) NIE cachen -> immer Netz
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(req));
    return;
  }

  // ✅ Navigations (Seitenaufruf) -> erst Netz, fallback Cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // ✅ Eigene Dateien -> Cache first, fallback Netz
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).then((res) => {
        // optional: neu geladene Dateien nachcachen
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
