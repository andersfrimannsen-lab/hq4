const CACHE_NAME = 'hopeful-quotes-v6';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/music/01.mp3',
    '/music/02.mp3',
    '/music/03.mp3',
    '/music/04.mp3',
    '/music/05.mp3',
    '/music/06.mp3',
    '/music/07.mp3',
    '/music/08.mp3',
    '/music/09.mp3',
    '/music/10.mp3',
    '/music/11.mp3',
    '/music/12.mp3',
    '/music/13.mp3',
    '/music/14.mp3',
    '/music/15.mp3',
    '/music/16.mp3',
    '/music/17.mp3',
    '/music/18.mp3',
    '/music/19.mp3',
    '/music/20.mp3',
    '/music/21.mp3',
    '/music/22.mp3',
    '/music/23.mp3',
    '/music/24.mp3',
    '/music/25.mp3',
    '/music/26.mp3',
    '/music/27.mp3',
    '/music/28.mp3',
    '/music/29.mp3',
    '/music/30.mp3',
    '/music/31.mp3',
    '/music/32.mp3',
    '/music/33.mp3'
];

// On install, cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// On fetch, serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;

    // All requests follow a cache-first strategy for performance and offline capability.
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            // Return cached response if found
            if (cachedResponse) {
                return cachedResponse;
            }
            // Fetch from network, then cache the new response
            return fetch(request).then(networkResponse => {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, responseToCache);
                });
                return networkResponse;
            });
        })
    );
});