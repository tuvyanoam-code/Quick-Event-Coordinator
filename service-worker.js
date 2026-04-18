// Minimal service worker — lets the app qualify for "Install" on Chrome /
// Edge / Android by providing a fetch handler, but does no caching.
// The app is network-first and only works online, which matches the
// current requirement. Can be upgraded to a real cache strategy later
// without changing manifest.json or the registration in app.js.

self.addEventListener('install', function(event) {
  // Skip the "waiting" phase so updates apply on the next load.
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Claim any clients immediately so the first visit uses this SW.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Network-only passthrough. No caching, no offline fallback.
  event.respondWith(fetch(event.request));
});
