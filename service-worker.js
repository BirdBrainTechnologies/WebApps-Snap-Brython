/*
 *
 */
'use strict';

// Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/bootstrap.min.css',
  '/css/custom.css',
  '/fontawesome/css/all.min.css',
  '/fontawesome/webfonts/', //todo:figure out what we need here
  '/img/birdbrain-technologies-logo.svg',
  '/img/icon_128x128.png',
  '/img/icon_152x152.png',
  '/img/icon_192x192.png',
  '/img/icon_256x256.png',
  '/img/icon_512x512.png',
  '/img/img-bit.svg',
  '/img/img-finch.svg',
  '/img/img-hummingbird-bit.svg',
  '/img/logo-snap.svg',
  '/img/pattern-blue-circuitry.svg',
  '/js/ble.js',
  '/js/fancyNames.js',
  '/js/gui.js',
  '/js/jquery.js',
  '/js/messages.js',
  '/js/robot.js',
  '/js/translations.js'
];

//The install event is called once per service worker.
//Changes to the service worker script count as a new service worker
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  //Precache static resources
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

//The activate event is called each time the app starts up.
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  //Remove previous cached data from disk.
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});
self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  //Response for robot requests
  if (evt.request.url.includes('/robot/')) {
    console.log('[Service Worker] Fetch (robot)', evt.request.url);
    evt.respondWith(

      //Start here. we don't want to cache data, what do we do?

        caches.open(DATA_CACHE_NAME).then((cache) => {
          return fetch(evt.request)
              .then((response) => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
                return response;
              }).catch((err) => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          }));
      return;
  }
  //Response for all other requests
  evt.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(evt.request)
            .then((response) => {
              console.log("responding with ");
              console.log(response);
              //return the cached page if possible otherwise get from network
              return response || fetch(evt.request);
            });
      })
  );
});
