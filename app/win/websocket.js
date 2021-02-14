const QuizSearcher = require("./QuizSearcher.js"),
  ws = require("ws");
module.exports = (server) => {
  const wss = new ws.Server({server: server});
  wss.on("connection",async (c,req)=>{
    // Others
    if(!/^\/search/.test(req.url)){
      c.send(JSON.stringify({
        type: "Message.Maintainance",
        message: "Kahoot Winner is at Version 6! Update your page (clear your cache) to use Kahoot Winner!"
      }));
      c.close();
      return;
    }
    const a = new QuizSearcher(c,req),
      msgl = m=>{a.message(m);};
    c.on("message",msgl);
    const cl = ()=>{
      a.stop = true;
      clearInterval(a.pinger);
      c.removeListener("message",msgl);
      c.removeListener("close",cl);
    };
    c.on("close",cl);
    c.on("error",(e)=>{
      console.log(e);
      try{c.close();}catch(e){/* ignore */}
    });
  });
};
