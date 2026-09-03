const CACHE_NAME = 'calculator-static-v2-20260903';
const APP_SHELL = ['./', './index.html', './manifest.json', './IMG_4289.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
.filter((key) => key.startsWith('calculator-') && key !== CACHE_NAME)
.map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function navigationResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const fallback = (await cache.match(request)) || (await cache.match('./index.html')) || (await cache.match('./'));

  const networkPromise = fetch(request).then(async (response) => {
    if (response && response.ok) {
      await cache.put(request, response.clone()).catch(() => {});
      await cache.put('./index.html', response.clone()).catch(() => {});
    }
    return response;
  });

  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('network timeout')), 3000);
  });

  try {
    const response = await Promise.race([networkPromise, timeout]);
    clearTimeout(timer);
    return response;
  } catch (error) {
    clearTimeout(timer);
    if (fallback) return fallback;
    throw error;
  }
}

async function staticResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    fetch(request).then((response) => {
      if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
    }).catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match('./index.html')) || new Response('', { status: 503 });
    }));
    return;
  }

  event.respondWith(staticResponse(request).catch(() => new Response('', { status: 503 })));
});
