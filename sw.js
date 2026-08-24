/* Skyline Manager — Service Worker
   Hält die App offline lauffähig. Strategie: eigene Dateien beim ersten
   Besuch in den Cache legen, danach zuerst aus dem Netz laden und den Cache
   nachführen; ist kein Netz da, kommt die Antwort aus dem Cache.
   Die Firebase-Aufrufe werden bewusst nicht angefasst — sie brauchen das
   Netz und dürfen niemals aus dem Cache beantwortet werden. */

const CACHE = "skyline-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png"
  // Grafikpaket: hier die Dateien aus assets/planes/ eintragen, damit sie
  // auch offline verfügbar sind, z. B.
  // , "./assets/planes/a20n-base.png", "./assets/planes/a20n-mask.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).catch(() => {/* einzelne fehlende Datei nicht fatal */}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Fremde Hosts (Firebase, Schriften) immer direkt ans Netz
  if (url.origin !== self.location.origin) return;
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});

// Erlaubt der Seite, ein Update sofort zu übernehmen
self.addEventListener("message", e => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
