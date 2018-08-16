const cacheVersionName = 'restaurants-003';

// cache all main files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheVersionName)
            .then(cache => cache.addAll([
                '/',
                '/restaurant.html',
                '/manifest.json',
                '/css/styles.css',
                '/css/bootstrap-reboot.css',
                '/js/dbhelper.js',
                '/js/main.js',
                '/js/idb.js',
                '/js/register_sw.js',
                '/js/restaurant_info.js'
            ]))
    );
});

// delete the obsolete cache
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.filter(function (cacheName) {
                return cacheName.startsWith('restaurants-') && cacheName != cacheVersionName;
            }).map(function (cacheName) {
                // console.log(`Deleting ${cacheName} cache!`)
                return caches.delete(cacheName);
            })
        ))
    );
});

self.addEventListener('fetch', event => {

    //Skip caching the API responces since we store the data in the IndexedDB
    if ((new URL(event.request.url)).href.startsWith('https://restaurant-reviews-server.herokuapp.com')) {
        return;
    }

    if (!(new URL(event.request.url)).href.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request).then(response => {
                let responseClone = response.clone();
                caches.open(cacheVersionName).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            });
        }).catch(error => {
            console.log(error);
        })
    );
});