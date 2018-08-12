let cacheVersionName = 'restaurants-001';

// cache all main files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheVersionName)
            .then(cache => cache.addAll([
                '/',
                '/restaurant.html',
                '/css/styles.css',
                '/css/bootstrap-reboot.css',
                '/js/dbhelper.js',
                '/js/main.js',
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
        )
        )
    );
});

self.addEventListener('fetch', event => {

    event.respondWith(async function () {

        // having restaurant.html and restaurants data in the database 
        // we can recreate all /restaurant.html?id=# pages
        if ((new URL(event.request.url)).pathname.startsWith('/restaurant.html')) {

            const cachedRestaurant = await caches.match('/restaurant.html');

            if (cachedRestaurant) {

                // console.log(cachedRestaurant);

                // console.log(`Responsing to ${event.request.url} with restaurant.html from the cache`);
                return cachedRestaurant
            }
        }


        return caches.open(cacheVersionName).then(caches =>

            //respond from the cache if available 
            caches.match(event.request).then(response => {

                // console.log(event.request);

                if (response) {
                    // console.log('Responding from cache!', response);
                    return response;
                }

                //fetch from internet, store into the cache and respond
                return fetch(event.request)
                    .then(networkResponse => {
                        // console.log('Fetching from the internet!');

                        caches.put(event.request, networkResponse.clone());

                        // console.log('Storing into cache and responding with the response!', networkResponse);

                        return networkResponse;
                    })
                    .catch(error => {
                        // console.log('Fetch failed!', error);
                    });
            })
        )
    }());

});