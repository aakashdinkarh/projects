const CACHE_NAME = 'my-projects-cache-v2';
const CACHE_EXPIRATION_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

const urlsToCache = [
    '/projects/',
    '/projects/bundle.js'
];

// Helper function to store data with a timestamp
async function cacheWithTimestamp(request, response) {
    const cache = await caches.open(CACHE_NAME);
    const timestampedResponse = new Response(response.body, response);
    timestampedResponse.headers.append('sw-timestamp', Date.now());
    await cache.put(request, timestampedResponse);
}

// Helper function to check if a cached item is expired
function isCacheExpired(response) {
    const cachedTime = response.headers.get('sw-timestamp');
    return (Date.now() - cachedTime) > CACHE_EXPIRATION_TIME;
}

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            try {
                await cache.addAll(urlsToCache);
            } catch {}
        })
    );
});


// Fetch event with cache expiration logic
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(async response => {
            if (response && !isCacheExpired(response)) {
                return response;
            } else {
                const fetchPromise = fetch(event.request).then(async newResponse => {
                    await cacheWithTimestamp(event.request, newResponse.clone());
                    return newResponse;
                });
                return fetchPromise;
            }
        })
    );
});

// Activate event to clean up old caches
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
