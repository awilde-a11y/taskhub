self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // löscht ALLE alten Caches
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Wichtig: nicht cachen, nicht intercepten – einfach Netzwerk
self.addEventListener("fetch", () => {});
