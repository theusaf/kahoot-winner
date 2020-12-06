const CACHE_NAME = "kahoot-win-cache-v4.0.2";
const CONST_NAME = "kahoot-win-cache-consts-v4.0.0";
const URLCONSTS = [
  "/resource/logo-xmas.svg",
  // As of 3.2.0, theme objects are cached at the start as well.
  // Reasoning: People like themes, it doesn't take too much space. (up to 20mb)
  "/resource/logo-rezero.svg",
  "/resource/red-konosuba.svg",
  "/resource/blue-konosuba.svg",
  "/resource/yellow-konosuba.svg",
  "/resource/green-konosuba.svg",
  "/resource/red-franxx.svg",
  "/resource/blue-franxx.svg",
  "/resource/yellow-franxx.svg",
  "/resource/green-franxx.svg",
  "/resource/red-rezero.svg",
  "/resource/blue-rezero.svg",
  "/resource/yellow-rezero.svg",
  "/resource/green-rezero.svg",
  "/resource/red-mc.svg",
  "/resource/blue-mc.svg",
  "/resource/yellow-mc.svg",
  "/resource/green-mc.svg",
  "/resource/blue.svg",
  "/resource/red.svg",
  "/resource/green.svg",
  "/resource/yellow.svg",
  "/resource/logo.svg",
  "/resource/bronze.svg",
  "/resource/gold.svg",
  "/resource/silver.svg",
  "/resource/icon-gear.svg",
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
  "/resource/misc/notice-2020-07-03.png",
  "/resource/language.svg",
  "/resource/happy.svg",
  "/resource/sad.svg",
  "/resource/meh.svg",
  "/resource/star.svg",
  "/resource/star_blank.svg",
  "/resource/upvote.svg",
  "/resource/upvote-filled.svg",
  "/resource/downvote.svg",
  "/resource/downvote-filled.svg",
  "/resource/type/quiz.svg",
  "/resource/type/content.svg",
  "/resource/type/survey.svg",
  "/resource/type/true_false.svg",
  "/resource/type/jumble.svg",
  "/resource/type/open_ended.svg",
  "/resource/type/word_cloud.svg"
];
const URLCACHE = [
  "/",
  "/index.js",
  "/index.css"
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
    ).catch(function(err){
      return fetch(event.request);
    })
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
