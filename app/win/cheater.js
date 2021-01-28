const applyListeners = require("../util/applylisteners.js"),
  got = require("got"),
  KH = require("kahoot.js-updated"),
  QuizFinder = require("./QuizFinder.js"),
  Messages = require("./messages.js");

class Cheater{
  constructor(socket,req){
    // yes, the ip is stored, but only used for maintainance reasons, to prevent spam.
    this.ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip || null;
    this.wsocket = socket;
    this.kahoot = new KH;
    this.kahoot.parent = this;
    applyListeners(this.kahoot);
    this.pings = 0;
    this.finder = new QuizFinder;
    this.finder.parent = this;
    this.handshakeIssues = false;
    this.options = {
      pin: 0,
      fail: false,
      manual: true,
      brute: false,
      timeout: 0,
      searchTerm: "",
      author: "",
      uuid: "",
      hijack: false,
      hijackPassword: "",
      teamMembers: "",
      challengePoints: 0,
      challengeCorrect: false,
      searchLoosely: 0
    };
    this.correctIndex = 0;
    this.fails = [true];
    this.security = {
      joined: false,
      gotQuestion: false
    };
    this.pinger = setInterval(()=>{
      this.send({message:"ping",type:"Message.Ping"});
    },30*1000);
    this.send({"type":"Message.OK","message":"200 OK"});
  }
  isOffline(){
    try{
      return this.wsocket.readyState === 3;
    }catch(e){
      return true;
    }
  }
  close(){
    if(this.isOffline()){
      return;
    }
    this.wsocket.close();
  }
  send(message){
    if(this.isOffline()){
      return;
    }
    if(typeof(message) != "string"){
      try{message = JSON.stringify(message);}catch(err){message+= "";}
    }
    this.wsocket.send(message);
  }
  message(message){
    let data;
    try{data = JSON.parse(message);}catch(err){return this.send({message:"INVALID_USER_INPUT",type:"Error"});}
    if(typeof(data.type) === "undefined" || typeof(Messages[data.type]) === "undefined" || typeof(data.message) === "undefined"){
      this.send({message:"INVALID_USER_INPUT",type:"Error"});
      return;
    }
    Messages[data.type](this,data.message);
  }
  async generateRandomName(){
    try{
      return (await got("https://apis.kahoot.it/namerator").json()).name;
    }catch(e){
      return "BadHtml";
    }
  }
}
module.exports = Cheater;
