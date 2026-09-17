/**
 * Minimal app-shell cache. The trainer makes no network calls at runtime
 * regardless, so this only exists to support "Add to Home Screen" /
 * installed offline launches. Bump CACHE_NAME when shipping a new
 * version so old caches get cleaned up on activate.
 */

const CACHE_NAME = 'hiragana-trainer-v1';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './kana-data.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});
