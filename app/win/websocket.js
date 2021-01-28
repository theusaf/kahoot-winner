const Cheater = require("./cheater.js"),
  clearMemory = require("../util/clearMemory.js"),
  ws = require("ws");
module.exports = (server) => {
  const wss = new ws.Server({server: server});
  wss.on("connection",(c,request)=>{
    const a = new Cheater(c,request),
      msgl = m=>{a.message(m);};
    c.on("message",msgl);
    const cl = ()=>{
      c.removeListener("message",msgl);
      c.removeListener("close",cl);
      if(a.handshakeIssues){
        try {
          a.kahoot.socket.close();
        } catch (e) {
          a.kahoot.leave();
        }
      }else{
        a.kahoot.leave();
      }
      a.finder.hax.stop = true;
      clearMemory(a);
    };
    c.on("close",cl);
  });
};
