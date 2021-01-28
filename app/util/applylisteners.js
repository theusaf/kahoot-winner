const Listeners = require("../win/listeners.js");
module.exports = function applyListeners(kahoot){
  kahoot.list = {};
  for(const i in Listeners){
    const l = info=>{
      Listeners[i](kahoot,info);
    };
    kahoot.on(i,l);
    kahoot.list[i] = l;
  }
};
