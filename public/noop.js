const CACHE_NAME = "kahoot-win-cache-v2.18.4";
const CONST_NAME = "kahoot-win-cache-consts-v2.18.0";
const URLCONSTS = [
  "/resource/blue.svg",
  "/resource/red.svg",
  "/resource/green.svg",
  "/resource/yellow.svg",
  "/resource/logo.svg",
  "/resource/red.png",
  "/resource/green.png",
  "/resource/bronze.svg",
  "/resource/gold.svg",
  "/resource/silver.svg",
  "/resource/icon-gear.svg",
  "/resource/load.gif",
  "/resource/load-hole.svg",
  "/resource/load-large.svg",
  "/resource/fire.svg",
  "/resource/cross.svg",
  "/resource/check.svg",
  "/resource/reset.svg",
  "/resource/logo-twitter.svg",
  "/resource/logo-discord.svg",
  "/resource/logo-fbook.svg",
  "/resource/logo-paypal.svg",
  "/resource/icon-blog.svg",
  "/resource/icon-about.svg",
  "/resource/icon-api.svg",
  "/resource/icon-kahoot.svg",
  "/resource/icon512.png",
  "/resource/misc/notice-2020-07-03.png"
];
const URLCACHE = [
  "/",
  "/index.js",
  "/UI.js",
  "/index.css",
  "/tutorial.js"
];
self.addEventListener("install",evt=>{
  evt.waitUntil(
    caches.open(CACHE_NAME).then(c=>{
      return c.addAll(URLCACHE);
    })
  );
  evt.waitUntil(
    caches.open(CONST_NAME).then(c=>{
      return c.addAll(URLCONSTS);
    })
  );
});

self.addEventListener("fetch", function(event) {

  if(event.request.url.match("^.*(/creator/).*$")){
    return false;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
      )
  );
});

self.addEventListener("activate", function(event) {
  var cacheWhitelist = [CACHE_NAME,CONST_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
