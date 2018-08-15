const staticCacheName = 'rr-static-v2';
const urlsToCache = [
    '/',
    '/data',
    '/js',
    '/img',
    '/css'
];

self.importScripts('/js/dbhelper.js', 'node_modules/idb/lib/idb.js');
const dbPromise = idb.open('rrpwa', 1);

self.addEventListener('install', function (event) {
    // Perform install steps
    console.log('trying to install');
    event.waitUntil(
        caches.open(staticCacheName)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request, {ignoreSearch: true})
            .then(function (response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                let fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function (response) {

                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        let responseToCache = response.clone();

                        caches.open(staticCacheName)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (staticCacheName.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('sync', function (event) {
   if (event.tag == 'commentsSync') {
        DBHelper.uploadReviews();
    }
});

