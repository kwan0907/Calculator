const CACHE_VERSION = 'calculator-offline-v1-20260903-static';
const APP_CACHE = `${CACHE_VERSION}-app`;

const APP_SHELL = [
  './offline.html',
  './index.html',
  './manifest.json',
  './IMG_4289.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== APP_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, fallback) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(APP_CACHE);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (_) {
    return fallback || Promise.reject(_);
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Page navigation: use the latest page when online; fall back to the cached calculator when offline.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cachedRequested = await caches.match(request);
      const cachedIndex = await caches.match('./index.html');
      const fallback = cachedRequested || cachedIndex;
      return networkFirst(request, fallback).catch(() =>
        fallback || new Response(
          '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="font-family:sans-serif;padding:24px">App 尚未完成第一次離線儲存，請連線後開啟一次。</body>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        )
      );
    })());
    return;
  }

  // This calculator is a static app. Cache its own files so it can keep working without a network.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request).catch(() => new Response('', { status: 503 })));
  }
});
