const CACHE_VERSION = 'calculator-offline-v1-20260903';
const APP_CACHE = `${CACHE_VERSION}-app`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

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
          .filter((key) => key !== APP_CACHE && key !== DATA_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, cacheName, timeoutMs, fallbackResponse = null) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: false });

  const networkPromise = fetch(request).then(async (response) => {
    if (response && (response.ok || response.type === 'opaque')) {
      try {
        await cache.put(request, response.clone());
      } catch (_) {}
    }
    return response;
  });

  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('network timeout')), timeoutMs);
  });

  try {
    const response = await Promise.race([networkPromise, timeoutPromise]);
    clearTimeout(timer);
    return response;
  } catch (_) {
    clearTimeout(timer);
    if (cached) return cached;
    if (fallbackResponse) return fallbackResponse;
    throw _;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    fetch(request).then((response) => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone()).catch(() => {});
      }
    }).catch(() => {});
    return cached;
  }

  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSupabase = /(^|\.)supabase\.co$/i.test(url.hostname);
  const isSupabaseRest = isSupabase && url.pathname.startsWith('/rest/v1/');
  const isSupabasePublicStorage = isSupabase && url.pathname.startsWith('/storage/v1/object/public/');

  // Supabase table reads: online first, then use the last successful response saved on this device.
  if (isSupabaseRest) {
    const emptyJsonFallback = new Response('[]', {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Calculator-Offline-Fallback': 'empty'
      }
    });
    event.respondWith(networkFirst(request, DATA_CACHE, 4500, emptyJsonFallback));
    return;
  }

  // Public Supabase images/files can be reused offline.
  if (isSupabasePublicStorage) {
    event.respondWith(cacheFirst(request, DATA_CACHE).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Page navigation: try the latest Netlify page, otherwise open the cached app shell.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cachedIndex = await caches.match('./index.html');
      try {
        return await networkFirst(request, APP_CACHE, 3500, cachedIndex);
      } catch (_) {
        return cachedIndex || new Response(
          '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="font-family:sans-serif;padding:24px">App 尚未完成第一次離線儲存，請連線後開啟一次。</body>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    })());
    return;
  }

  // Same-origin static files: load cached copy immediately and refresh it quietly in the background.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, APP_CACHE).catch(() => fetch(request)));
  }
});
