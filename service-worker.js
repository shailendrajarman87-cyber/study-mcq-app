const CACHE_NAME = "study-mcq-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(response => {

          if (response.ok || response.type === "opaque") {
            const responseClone = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          return caches.match("./index.html");
        });

    })
  );
});
