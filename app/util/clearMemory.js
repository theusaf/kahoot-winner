const Listeners = require("../win/listeners.js");
module.exports = function clearMemory(c){
  if(!c.finishedProcessing){
    setTimeout(()=>{
      clearMemory(c);
    },1000);
    return;
  }
  for(const i in Listeners){
    c.kahoot.removeListener(i,c.kahoot.list[i]);
  }
  c.finder.parent = null;
  c.finder = null;
  c.kahoot.parent = null;
  c.kahoot = null;
  c.wsocket = null;
  clearInterval(c.pinger);
};
