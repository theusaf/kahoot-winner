module.exports = function(app){
  app.get("/api",(req,res)=>{
    res.setHeader("Cache-Control","public, max-age=31622400");
    res.redirect("https://kahoot.js.org");
  });
  app.get("/creator",(req,res)=>{
    res.redirect("https://kahoot-win.com/creator");
  });
  app.get("/how-it-works",(req,res)=>{
    res.redirect("https://kahoot-win.com/how-it-works");
  });
  app.get(/\/blog\/?.*?/i,(req,res)=>{
    res.redirect("https://kahoot-win.com" + req.url);
  });
};
