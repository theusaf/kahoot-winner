const appInformation = require("../../package.json"),
  bodyParser = require("body-parser"),
  compression = require("compression"),
  cookieParser = require("cookie-parser"),
  express = require("express"),
  globals = require("./globals.js"),
  got = require("got"),
  path = require("path"),
  Search = require("kahoot-search"),
  ua = require("user-agents"),
  {URL} = require("url");
// Kahoot Winner Router
module.exports = function(app) {
  app.enable("trust proxy");
  // cors
  app.use((req,res,next)=>{
    const origins = ["theusaf.github.io","kahoot.it","play.kahoot.it","create.kahoot.it","code.org","studio.code.org","kahoot-win.com","tooooooo-fast.herokuapp.com","kashoot-this.herokuapp.com","kahoot-win.herokuapp.com"];
    if(req.get("origin") && origins.includes(req.get("origin").split("://")[1])){
      res.header("Access-Control-Allow-Origin",req.get("origin"));
    }
    next();
  });
  // compression
  app.use(compression({
    filter: (req,res)=>{
      const types = {
          svg: "image/svg+xml",
          js: "text/javascript",
          css: "text/css",
          json: "application/json",
          txt: "text/plain",
          html: "text/html",
          xml: "application/xml"
        },
        t = req.url.split(".")[1],
        a = types[t];
      if(res.statusCode === 404){
        return compression.filter(req,res);
      }
      if(req.url.search(/noop.js/gmi) != -1){
        return compression.filter(req,res);
      }
      if(a){
        res.header("Content-Type",a);
      }
      if(t === undefined){
        // res.header("Content-Type","text/html");
      }
      return compression.filter(req,res);
    }
  }));
  // cookies
  app.use(cookieParser());
  // json
  app.use(bodyParser.json());
  // url encoded
  app.use(bodyParser.urlencoded({extended: true}));
  // x-xss-protection, strict transport security
  app.use((req,res,next)=>{
    if(req.protocol === "https"){
      res.setHeader("Strict-Transport-Security","max-age=31104000");
    }
    res.setHeader("X-XSS-Protection","0");
    next();
  });
  // static
  app.use(express.static(path.join(__dirname,"../../public"),{
    maxAge:"1y",
    setHeaders: (res)=>{
      const d = new Date;
      d.setYear(d.getFullYear() + 1);
      res.setHeader("Expires", d.toUTCString());
    }
  }));
  app.use(express.static(path.join(__dirname,"../../locales"),{
    maxAge:"1y",
    setHeaders: (res)=>{
      const d = new Date;
      d.setYear(d.getFullYear() + 1);
      res.setHeader("Expires", d.toUTCString());
    }
  }));
  // external caching
  app.get(/ext\/?https?:\/\/.*\.(google|gstatic|facebook|fb).*\.(com|net)\/.*/i,async (req,res)=>{
    try{
      const url = req.url.split("/ext/").slice(1).join("/ext/"),
        {body,statusCode,headers} = await got(url);
      res.status(statusCode);
      res.setHeader("Cache-Control","public, max-age=31622400");
      const d = new Date;
      d.setYear(d.getFullYear() + 1);
      res.setHeader("Expires", d.toUTCString());
      res.setHeader("Content-Type",headers["content-type"] || "text/html");
      res.send(body);
    }catch(e){
      res.status(400);
      res.end();
    }
  });
  // uptime
  app.get("/up",(req,res)=>{
    res.setHeader("Cache-Control","no-cache");
    res.setHeader("Content-Type","text/plain");
    const start = globals.startupDate,
      minutes = ((Date.now() - start) / 60e3).toFixed(1);
    let message = "";
    if(minutes < 60){
      message = minutes + " minutes online.";
    }else{
      message = Math.round(minutes / 60) + " hours online.";
    }
    message += " : v" + appInformation.version;
    res.send(message);
  });
  // searching
  app.get("/search",async (req,res)=>{
    res.setHeader("Cache-Control","public, max-age=86400");
    const params = req.query;
    if(params.q === undefined){
      return res.status(400).json({error:"INVALID_USER_INPUT",message:"Missing Query"});
    }
    const opts = {
      cursor: params.c === undefined ? 0 : params.c,
      limit: 25,
      includeCard: !!params.card
    };
    if(+params.u){
      try{
        const data = await got(`https://create.kahoot.it/rest/kahoots/${params.q}`).json();
        if(data.error){
          res.status(404);
          return res.json({error:"INVALID_USER_INPUT",message:"INVALID_UUID"});
        }else{
          res.json(data);
        }
      }catch(e){
        res.status(404);
        res.json({error:"INVALID_USER_INPUT",message:"INVALID_UUID"});
      }
    }else{
      const a = new Search(params.q,opts);
      a.search().then(o=>{
        res.send(o);
      });
    }
  });
  // kahoot externals
  app.get("/kahoot/*",async(req,res,next)=>{
    const kahootPath = req.url.substr(7);
    if(/^\/reserve\/session\/\d+\/?\?\d+$/.test(kahootPath)){
      // Getting kahoot live challenge.
      const url = new URL(`https://kahoot.it${kahootPath}`),
        options = {
          protocol: url.protocol,
          host: url.host,
          path: url.pathname + url.search
        };
      options.headers = {
        "User-Agent": (new ua).toString(),
        "Origin": "kahoot.it",
        "Referer": "https://kahoot.it/",
        "Accept-Language": "en-US,en;q=0.8",
        "Accept": "*/*"
      };
      const request = got(options);
      res.header("Cache-Control", "no-cache");
      if(options.timeout){
        setTimeout(() => {
          request.cancel();
        },options.timeout);
      }
      try{
        const response = await request,
          token = response.headers["x-kahoot-session-token"];
        if(token){
          res.header("x-kahoot-session-token",token);
        }
        res.send(response.body);
      }catch(e){
        const {response} = e;
        if(typeof response === "undefined"){
          res.status(500);
          res.send("Request Timed Out");
        }else{
          res.status(response.statusCode);
          res.send(response.body);
        }
      }
    }else if(/^\/rest\/challenges\/.*/.test(kahootPath)){
      // Getting challenge data
      const url = new URL(`https://kahoot.it${kahootPath}`),
        options = {
          protocol: url.protocol,
          host: url.host,
          pathname: url.pathname,
          search: url.search
        };
      options.headers = {
        "User-Agent": (new ua).toString(),
        "Origin": "kahoot.it",
        "Referer": "https://kahoot.it/",
        "Accept-Language": "en-US,en;q=0.8",
        "Accept": "*/*"
      };
      const request = got(options);
      res.header("Cache-Control", "no-cache");
      if(options.timeout){
        setTimeout(() => {
          request.cancel();
        },options.timeout*2);
      }
      try{
        const response = await request;
        res.send(response.body);
      }catch(e){
        const {response} = e;
        if(typeof response === "undefined"){
          res.status(500);
          res.send("Request Timed Out");
        }else{
          res.status(response.statusCode);
          res.send(response.body);
        }
      }
    }else if(/^\/weekly(-previous)?\/?$/.test(kahootPath)){
      let url = "https://kahoot.com/kahoot-of-the-week";
      if(kahootPath.indexOf("previous") !== -1){
        url = "https://kahoot.com/kahoot-of-the-week-previous";
      }
      got.stream(url).pipe(res);
    }else{
      next();
    }
  });
  // kahoot challenge posting
  app.post("/kahoot/rest/challenges/*",async(req,res)=>{
    const kahootPath = req.url.substr(7),
      body = Object.keys(req.body).length ? req.body : undefined,
      url = new URL(`https://kahoot.it${kahootPath}`),
      options = {
        protocol: url.protocol,
        host: url.host,
        path: url.pathname + url.search
      };
    options.method = "POST";
    options.headers = {
      "User-Agent": (new ua).toString(),
      "Origin": "kahoot.it",
      "Referer": "https://kahoot.it/",
      "Accept-Language": "en-US,en;q=0.8",
      "Accept": "*/*"
    };
    if(body){
      options.json = body;
    }
    const request = got(options);
    res.header("Cache-Control", "no-cache");
    if(options.timeout){
      setTimeout(() => {
        request.cancel();
      },options.timeout*2);
    }
    try{
      const response = await request;
      res.send(response.body);
    }catch(e){
      const {response} = e;
      if(typeof response === "undefined"){
        res.status(500);
        res.send("Request Timed Out");
      }else{
        res.status(response.statusCode);
        res.send(response.body);
      }
    }
  });
};
