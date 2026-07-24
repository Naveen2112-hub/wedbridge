/**
 * WedBridge Service Worker — v3
 *
 * Strategy summary:
 *   - Shell pages   → CacheFirst (offline-first)
 *   - API calls     → NetworkFirst with 5 s timeout, then cache fallback
 *   - Static assets → CacheFirst (immutable Next.js chunks)
 *   - Images        → StaleWhileRevalidate + cache for 7 days
 *   - Everything else → NetworkOnly (auth, payments — never cache)
 */

const CACHE_SHELL  = "wb-shell-v3";
const CACHE_PAGES  = "wb-pages-v3";
const CACHE_ASSETS = "wb-assets-v3";
const CACHE_IMAGES = "wb-images-v3";

const SHELL_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

// Paths that should NEVER be cached (auth, payment, admin)
const NO_CACHE_PATTERNS = [
  /\/api\/(razorpay|membership|ai\/chat|telegram\/notify)/,
  /\/login/,
  /\/register/,
  /\/admin\//,
  /\/complete-profile/,
];

// Static Next.js chunks are fingerprinted — cache forever
const STATIC_CHUNK = /\/_next\/static\//;

// Images from any origin
const IMAGE_PATTERN = /\.(jpe?g|png|webp|avif|gif|svg)(\?|$)/;

// ── Install ────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => {})
  );
  // Take control immediately
  self.skipWaiting();
});

// ── Activate ───────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const CURRENT_CACHES = new Set([CACHE_SHELL, CACHE_PAGES, CACHE_ASSETS, CACHE_IMAGES]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !CURRENT_CACHES.has(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch ──────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const path = url.pathname;

  // Skip cross-origin requests we don't control
  const isOwn = url.origin === self.location.origin;

  // Never cache: auth, payments, admin, streaming APIs
  if (isOwn && NO_CACHE_PATTERNS.some((p) => p.test(path))) return;

  // Immutable Next.js static chunks → CacheFirst
  if (isOwn && STATIC_CHUNK.test(path)) {
    event.respondWith(cacheFirst(req, CACHE_ASSETS));
    return;
  }

  // Images (any origin) → StaleWhileRevalidate, 7-day TTL
  if (IMAGE_PATTERN.test(path) || IMAGE_PATTERN.test(url.href)) {
    event.respondWith(staleWhileRevalidate(req, CACHE_IMAGES, 7 * 86400));
    return;
  }

  // API routes (own origin) → NetworkFirst with 5 s timeout
  if (isOwn && path.startsWith("/api/")) {
    event.respondWith(networkFirst(req, CACHE_PAGES, 5000));
    return;
  }

  // HTML pages (navigation) → NetworkFirst, fallback to cached
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, CACHE_PAGES, 4000));
    return;
  }

  // Default → NetworkFirst
  if (isOwn) {
    event.respondWith(networkFirst(req, CACHE_PAGES, 4000));
  }
});

// ── Strategies ─────────────────────────────────────────────────

function cacheFirst(req, cacheName) {
  return caches.match(req).then((cached) => {
    if (cached) return cached;
    return fetch(req).then((res) => {
      if (res.ok) cachePut(cacheName, req, res.clone());
      return res;
    });
  });
}

function networkFirst(req, cacheName, timeoutMs) {
  const networkPromise = fetchWithTimeout(req, timeoutMs).then((res) => {
    if (res.ok) cachePut(cacheName, req, res.clone());
    return res;
  });
  return networkPromise.catch(() => caches.match(req).then((cached) => cached || offlineFallback(req)));
}

function staleWhileRevalidate(req, cacheName, maxAgeSeconds) {
  return caches.open(cacheName).then((cache) =>
    cache.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        if (res.ok) {
          const headers = new Headers(res.headers);
          headers.set("sw-cache-date", Date.now().toString());
          const copy = new Response(res.body, { status: res.status, statusText: res.statusText, headers });
          cache.put(req, copy);
        }
        return res;
      }).catch(() => null);

      // Return cached if fresh enough
      if (cached) {
        const cachedDate = parseInt(cached.headers.get("sw-cache-date") || "0", 10);
        if (Date.now() - cachedDate < maxAgeSeconds * 1000) return cached;
      }
      return fetchPromise.then((res) => res || cached || offlineFallback(req));
    })
  );
}

function fetchWithTimeout(req, ms) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(req).then((res) => { clearTimeout(timeout); resolve(res); }).catch((e) => { clearTimeout(timeout); reject(e); });
  });
}

function cachePut(cacheName, req, res) {
  caches.open(cacheName).then((cache) => cache.put(req, res)).catch(() => {});
}

function offlineFallback(req) {
  if (req.mode === "navigate") {
    return caches.match("/").then((r) => r || new Response("Offline", { status: 503 }));
  }
  return new Response("Offline", { status: 503 });
}

// ── Background sync (optional) ─────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "GET_VERSION")  event.ports?.[0]?.postMessage({ version: CACHE_SHELL });
});
