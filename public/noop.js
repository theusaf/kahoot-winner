const CACHE_NAME = "kahoot-win-cache-v5.2.0";
const CONST_NAME = "kahoot-win-cache-consts-v5.1.0";
const URLCONSTS = [
  "/resource/img/game/theme/duck/logo.svg",
  "/resource/img/game/theme/duck/red.svg",
  "/resource/img/game/theme/duck/blue.svg",
  "/resource/img/game/theme/duck/green.svg",
  "/resource/img/game/theme/duck/yellow.svg",
  "/resource/img/game/theme/kahoot/logo-xmas.svg",
  "/resource/img/game/theme/konosuba/logo.svg",
  "/resource/img/game/theme/konosuba/red.svg",
  "/resource/img/game/theme/konosuba/blue.svg",
  "/resource/img/game/theme/konosuba/yellow.svg",
  "/resource/img/game/theme/konosuba/green.svg",
  "/resource/img/game/theme/franxx/red.svg",
  "/resource/img/game/theme/franxx/blue.svg",
  "/resource/img/game/theme/franxx/yellow.svg",
  "/resource/img/game/theme/franxx/green.svg",
  "/resource/img/game/theme/rezero/logo.svg",
  "/resource/img/game/theme/rezero/red.svg",
  "/resource/img/game/theme/rezero/blue.svg",
  "/resource/img/game/theme/rezero/yellow.svg",
  "/resource/img/game/theme/rezero/green.svg",
  "/resource/img/game/theme/minecraft/red.svg",
  "/resource/img/game/theme/minecraft/blue.svg",
  "/resource/img/game/theme/minecraft/yellow.svg",
  "/resource/img/game/theme/minecraft/green.svg",
  "/resource/img/game/theme/kahoot/blue.svg",
  "/resource/img/game/theme/kahoot/red.svg",
  "/resource/img/game/theme/kahoot/green.svg",
  "/resource/img/game/theme/kahoot/yellow.svg",
  "/resource/img/game/theme/kahoot/logo.svg",
  "/resource/img/game/medal/bronze.svg",
  "/resource/img/game/medal/gold.svg",
  "/resource/img/game/medal/silver.svg",
  "/resource/img/site/icon-gear.svg",
  "/resource/img/game/icon/load-hole.svg",
  "/resource/img/game/icon/load-large.svg",
  "/resource/img/game/icon/fire.svg",
  "/resource/img/game/icon/cross.svg",
  "/resource/img/game/icon/check.svg",
  "/resource/img/game/icon/reset.svg",
  "/resource/img/site/logo-twitter.svg",
  "/resource/img/site/logo-discord.svg",
  "/resource/img/site/logo-fbook.svg",
  "/resource/img/site/logo-paypal.svg",
  "/resource/img/site/icon-blog.svg",
  "/resource/img/site/icon-about.svg",
  "/resource/img/site/icon-api.svg",
  "/resource/img/site/icon-kahoot.svg",
  "/resource/img/site/icon512.png",
  "/resource/img/misc/notice-2020-07-03.png",
  "/resource/img/site/language.svg",
  "/resource/img/game/feedback/happy.svg",
  "/resource/img/game/feedback/sad.svg",
  "/resource/img/game/feedback/meh.svg",
  "/resource/img/game/feedback/star.svg",
  "/resource/img/game/feedback/star_blank.svg",
  "/resource/img/game/feedback/upvote.svg",
  "/resource/img/game/feedback/upvote-filled.svg",
  "/resource/img/game/feedback/downvote.svg",
  "/resource/img/game/feedback/downvote-filled.svg",
  "/resource/img/game/type/quiz.svg",
  "/resource/img/game/type/content.svg",
  "/resource/img/game/type/survey.svg",
  "/resource/img/game/type/true_false.svg",
  "/resource/img/game/type/jumble.svg",
  "/resource/img/game/type/open_ended.svg",
  "/resource/img/game/type/word_cloud.svg"
];
const URLCACHE = [
  "/",
  "/index.js",
  "/index.css",
  "/ext/https://fonts.googleapis.com/css?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  "/ext/https://www.google.com/recaptcha/api.js?render=6LcyeLEZAAAAAGlTegNXayibatWwSysprt2Fb22n"
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
