const electron = require("electron");
const compression = require("compression");
const fs = require("fs");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const ip = require("ip");
const http = require("http");
const multer = require("multer");
const upload = multer();
const cookieParser = require("cookie-parser");
const userAgents = require("user-agents");
const startupDate = Date.now();
const EventEmitter = require("events");
const GlobalMessageSender = new EventEmitter();
const {URL} = require("url");
const {edit} = require("./regex.js");
app.enable('trust proxy');
app.use(compression({
  filter: (req,res)=>{
    const types = {
      svg: "image/svg+xml",
      js: "text/javascript",
      css: "text/css",
      json: "application/json",
      txt: "text/plain",
      html: "text/html"
    };
    const t = req.url.split(".")[1];
    const a = types[t];
    if(res.statusCode == 404){
      return compression.filter(req,res);
    }
    if(req.url.search(/noop.js/gmi) != -1){
      return compression.filter(req,res);
    }
    if(a){
      res.header("Content-Type",a);
    }
    if(t === undefined){
      res.header("Content-Type","text/html");
    }
    return compression.filter(req,res);
  }
}));
app.use(cookieParser());
app.use((req,res,next)=>{
  const origins = ["kahoot.it","play.kahoot.it","create.kahoot.it","code.org","studio.code.org"];
  if(req.get("origin") && origins.includes(req.get("origin").split("://")[1])){
    res.header("Access-Control-Allow-Origin",req.get("origin"));
  }
  next();
});
app.use(express.static(path.join(__dirname,"public"),{
  maxAge:"1y",
  setHeaders: (res)=>{
    let d = new Date;
    d.setYear(d.getFullYear() + 1);
    res.setHeader("Expires", d.toUTCString());
  }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const port = process.env.PORT || 2000;
const server = http.createServer(app);
let handshakeVotes = [];
server.once("error",err=>{
  // probably port already in use
  console.log("Port used, assuming kahoot-win already active");
});
server.listen(port);
console.log(ip.address() + ":" + port);
console.log("Using version 2.14.2");
const request = require("request");
const ws = require("ws");
const KH = require("kahoot.js-updated");
const Search = require("kahoot-search");
const wss = new ws.Server({server: server});
wss.on("connection",(c,request)=>{
  const a = new Cheater(c,request);
  c.on("message",m=>{a.message(m);});
  c.on("close",()=>{
    if(a.handshakeIssues){
      try {
        a.kahoot._wsHandler.ws.close();
      } catch (e) {
        a.kahoot.leave();
      }
    }else{
      a.kahoot.leave();
    }
    a.finder.hax.stop = true;
  });
});
function shuffle(array) {
  array = Array.from(array);
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
// Quiz Winner
class Cheater{
  constructor(socket,req){
    // yes, the ip is stored, but only used for maintainance reasons, to prevent spam.
    this.ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip || null;
    this.handshakeIssues = false;
    this.socket = socket;
    this.kahoot = new KH;
    this.kahoot.parent = this;
    applyListeners(this.kahoot);
    this.pings = 0;
    this.finder = new QuizFinder;
    this.finder.parent = this;
    this.options = {
      pin: 0,
      fail: false,
      manual: false,
      brute: false,
      timeout: 0,
      searchTerm: "",
      author: "",
      uuid: "",
      name: "",
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
  }
  isOffline(){
    return this.socket.readyState == 3;
  }
  close(){
    if(this.isOffline()){
      return;
    }
    this.socket.close();
  }
  send(message){
    if(this.isOffline()){
      return;
    }
    if(typeof(message) != "string"){
      try{message = JSON.stringify(message);}catch(err){message=String(message);}
    }
    this.socket.send(message);
  }
  message(message){
    var self = this;
    let data;
    try{data = JSON.parse(message);}catch(err){return this.send({message:"INVALID_USER_INPUT",type:"Error"});}
    if(typeof(data.type) == "undefined" || typeof(Messages[data.type]) == "undefined" || typeof(data.message) == "undefined"){
      this.send({message:"INVALID_USER_INPUT",type:"Error"});
      return;
    }
    Messages[data.type](self,data.message);
  }
  generateRandomName(){
    return new Promise(res=>{
      request("https://apis.kahoot.it/namerator",(e,r,b)=>{
        try{
          res(JSON.parse(b).name);
        }catch(e){
          res("BadHtml");
        }
      });
    });
  }
}
class QuizFinder{
  constructor(){
    this.cursor = 0;
    this.hax = {
      validOptions: [],
      answers: [],
      correctAnswer: 0,
      cursor: 0,
      stop: false
    };
  }
  getAnswers(q){
    var me = this;
    try{
      let ans;
      switch (q.type) {
        case "open_ended":
        case "word_cloud":
          ans = "honestly, i don't know";
          break;
        case "jumble":
          ans = shuffle([0,1,2,3]);
          break;
        case "multiple_select_quiz":
          ans = shuffle([0,1,2,3]).slice(q.quiz.answerCounts[q.index] - Math.floor(Math.random() * (q.quiz.answerCounts[q.index] + 1)));
          break;
        default:
          ans = Math.floor(Math.random() * q.quiz.answerCounts[q.index]);
      } // default values
      this.hax.correctAnswer = ans;
      console.log(`Using quiz id ${me.hax.validOptions[0].uuid}`);
      const choices = me.hax.validOptions[0].questions[q.index].choices;
      if(!choices){
        return [{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""}];
      }
      if(this.hax.validOptions[0].questions[q.index].type != q.type){
        return this.hax.validOptions[0].questions[q.index].choices || [{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""}];
      }
      for(let i = 0;i<choices.length;++i){
        if(choices[i].correct){
          me.hax.correctAnswer = i;
          // open ended support
          if(me.hax.validOptions[0].questions[q.index].type == "open_ended"){
            me.hax.correctAnswer = choices[i].answer;
          }
          break;
        }
      }
      // jumble support
      if(me.hax.validOptions[0].questions[q.index].type == "jumble"){
        // since we cannot actually find out the correct answer as this is a program, we just guess...
        me.hax.correctAnswer = shuffle([0,1,2,3]);
        // if challenge
        if(this.parent.options.isChallenge){
          this.hax.correctAnswer = [0,1,2,3];
        }
      }
      // multiple_select_quiz support
      if(this.hax.validOptions[0].questions[q.index].type == "multiple_select_quiz"){
        const choices = this.hax.validOptions[0].questions[q.index].choices || [];
        let ok = [];
        for(let i = 0;i<choices.length;i++){
          if(choices[i].correct){
            ok.push(i);
          }
        }
        this.hax.correctAnswer = ok;
      }
      return me.hax.validOptions[0].questions[q.index].choices;
    }catch(err){
      return [{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""}];
    }
  }
  async searchKahoot(index){
    // no need to search for challenges
    if(this.parent.options.isChallenge){
      return;
    }
    var self = this;
    if(self.hax.stop){
      return; // stop searching! the quiz ended or the user is disconnected!
    }
    // these filters are to filter out quizzes based on new answers
    const filter = o=>{
      let a = self.hax.answers;
      for(var i = 0;i < a.length;++i){
        try{
          if(!o.questions[a[i].i].choices){
            // if no choices ignore, unless a[i] actually was something
            if(a[i].n){
              return false;
            }
            continue;
          }
          if(o.questions[a[i].i].type == "jumble" || o.questions[a[i].i].choices.filter(
            k=>{
              if(typeof k.answer == "undefined"){
                return k.correct && (a[i].n == "");
              }
              return k.correct && (k.answer == a[i].n);
            }).length
          ){
            continue;
          }else{
            // an answer did not match!
            return false;
          }
        }catch(err){
          // we log stuff, but assume the worst, so we continue looping.
          // UPDATE: no longer logging stuff, we just return false.
          return false;
        }
      }
      return true;
    };
    const filter2 = o=>{
      let a = this.hax.answers;
      for(var i = 0;i < a.length;++i){
        try{
          for(let question of o.questions){
            // TODO: Add jumble and multi select support
            if(!question.choices){
              continue;
            }
            if(question.type == "jumble"){
              return true;
            }
            if(question.choices.filter(c=>{
              if(typeof c.answer == "undefined"){
                return c.correct && (a[i].n == "");
              }
              return c.correct && a[i].n == c.answer;
            }).length){
              return true;
            }
          }
          return false;
        }catch(err){
          // we log stuff, but assume the worst, so we continue looping.
          // UPDATE: no longer logging stuff, we just return false.
          return false;
        }
      }
      return true;
    };
    let use = this.parent.options.searchLoosely ? filter2 : filter;
    if(this.hax.validOptions.filter(use).length){
      this.hax.validOptions = this.hax.validOptions.filter(use);
      console.log("Possible quiz found");
      return;
    }else{
      this.hax.validOptions = [];
    }
    let options = {
      cursor: this.hax.cursor,
      limit: 25,
      type: ["quiz"],
      includeCard: false
    };
    if(this.parent.options.author){
      options.author = this.parent.options.author;
    }
    if(this.parent.options.searchTerm){
      options.searchStrictly = false;
    }
    if(!this.parent.options.uuid){
      const searchText = (this.parent.options.searchTerm ? edit(this.parent.options.searchTerm) : this.parent.options.name ? edit(this.parent.options.name) : edit(this.parent.kahoot.quiz.name));
      if((searchText.replace(/\s\*/g,"")) == ""){
        if(!this.hax.noQuiz){
          this.hax.noQuiz = true;
          this.parent.send({
            type: "Error",
            message: "EMPTY_NAME"
          });
        }
        return console.log("No quiz specified.");
      }
      console.log(searchText + " | " + this.parent.kahoot.quiz.name);
      let results = await Searching(searchText,options,self);
      // Limit searches to 7500 (300 total searches / quiz)
      if(typeof results.totalHits == "number"){
        this.hax.totalHits = results.totalHits;
      }
      if(this.hax.cursor >= 7500 || (this.hax.totalHits < this.hax.cursor)){
        this.hax.stop = true;
      }
      delete results.totalHits;
      this.hax.cursor += 25;
      if(this.parent.kahoot.quiz.currentQuestion && index < this.parent.kahoot.quiz.currentQuestion.index + 1){
        self.hax.validOptions = results;
        return;
      }
      if(results.length == 0){
        console.log("Researching");
        self.searchKahoot(index);
      }else{
        console.log("Setting results");
        self.hax.validOptions = results;
        return;
      }
    }else{
      //console.log("uuid specified");
      let me = this;
      request(`https://create.kahoot.it/rest/kahoots/${me.parent.options.uuid}`,(e,r,b)=>{
        let data;
        try{
          data = JSON.parse(b);
        }catch(e){
          this.parent.options.uuid = "";
          return this.searchKahoot(index);
        }
        if(data.error){
          me.parent.options.uuid = "";
          return me.searchKahoot(index);
        }
        me.hax.validOptions = [data];
      });
    }
  }
}
async function Searching(term,opts,finder){
  const a = new Search(term,opts);
  try{
    return await a.search(o=>{
      o = o.kahoot;
      if(!finder.parent.kahoot.quiz){
        return true;
      }
      const mainFilter = ()=>{
        let a = finder.hax.answers;
        let b = false;
        if(!finder.hax.answers.length){
          b = true;
        }
        for(var i = 0;i < a.length;++i){
          if(!o.questions[a[i].i].choices){
            continue;
          }
          // if correct answer matches or is a survey/jumble/info
          if(o.questions[a[i].i].choices.filter(
            k=>{
              return (
                (k.correct && (k.answer == a[i].n)) || (k.correct && (((typeof k.answer == "undefined") ? "" : k.answer) == a[i].n))
              ) || o.type == "survey" || o.type == "word_cloud" || o.type == "content" || (o.type == "jumble" /* TODO: Add Extra checks for JUMBLES and multi select*/ );
            }
          ).length){
            b = true;
          }
        }
        return b;
      };
      const mainFilter2 = ()=>{
        let correct = true;
        for(let i = 0;i<o.questions.length;++i){
          // "content" support
          if(!o.questions[i].choices){
            continue;
          }
          if(o.questions[i].choices.length != finder.parent.kahoot.quiz.answerCounts[i]){
            correct = false;
          }
        }
        return correct;
      };
      const looseFilter = ()=>{
        let a = finder.hax.answers;
        let b = false;
        if(!finder.hax.answers.length){
          b = true;
        }
        for(var i = 0;i < a.length;++i){
          try{
            for(let question of o.questions){
              if(!question.choices){
                continue;
              }
              if(question.choices.filter(k=>{
                return (
                  (k.correct && (k.answer == a[i].n)) || (k.correct && (((typeof k.answer == "undefined") ? "" : k.answer) == a[i].n))
                ) || o.type == "survey" || o.type == "word_cloud" || o.type == "content" || (o.type == "jumble" /* TODO: Add Extra checks for JUMBLES*/ );
              }).length){
                b = true;
              }
            }
          }catch(e){
            b = false;
            break;
          }
        }
        return b;
      };
      const looseFilter2 = ()=>{
        let qc = [];
        for(let i = 0;i<o.questions.length;++i){
          // "content" support
          if(!o.questions[i].choices){
            qc.push(null);
            continue;
          }
          qc.push(o.questions[i].choices.length);
        }
        qc.sort();
        qc = JSON.stringify(qc);
        const qca = JSON.stringify(finder.parent.kahoot.quiz.answerCounts.slice().sort());
        if(qc == qca){
          return true;
        }
        return false;
      };
      let filter = mainFilter;
      let filter2 = mainFilter2;
      if(finder.parent.options.searchLoosely){
        filter = looseFilter;
        filter2 = looseFilter2;
      }
      return (o.title == (finder.parent.kahoot.quiz.name ? finder.parent.kahoot.quiz.name : finder.parent.options.name)
      && (finder.parent.options.author ? o.creator_username == finder.parent.options.author : true)
      && (o.questions.length == finder.parent.kahoot.quiz.questionCount)
      && filter() && filter2());
    });
  }catch(err){
    return [];
  }
}
const Messages = {
  SET_PIN: (game,pin)=>{
    try{
      const url = new URL(pin);
      const path = url.pathname.split(/challenge\//g)[1];
      // if it was an invalid link, this should throw an error
      let isPin = path.match(/\d+/g)[0];
      if(path.length == isPin.length && path.length > 0){
        // this means that the pin is in the link lol
        pin = path;
      }else{
        request(`https://kahoot.it/rest/challenges/${path}`,(e,r,b)=>{
          try{
            b = JSON.parse(b);
            if(b.pin){
              pin = b.pin;
              request(`https://kahoot.it/rest/challenges/pin/${pin}`,(e,r,b)=>{
                if(/NOT_FOUND/img.test(b)){
                  game.send({message:"INVALID_PIN",type:"Error"});
                }else{
                  game.send({message:`Connected to ${pin}!`,type:"Message.PinGood"});
                  game.options.pin = pin;
                  game.options.isChallenge = true;
                }
              });
            }else{
              game.send({message:"INVALID_PIN",type:"Error"});
            }
          }catch(e){
            game.send({message:"INVALID_PIN",type:"Error"});
          }
        });
        return;
      }
    }catch(err){}
    // weekly kahoot support
    if(["weekly","weekly-previous","https://kahoot.com/kahoot-of-the-week-previous","https://kahoot.com/kahoot-of-the-week","https://kahoot.com/kahoot-of-the-week-previous/","https://kahoot.com/kahoot-of-the-week-previous","kahoot-of-the-week","kahoot-of-the-week-previous"].includes(pin)){
      let url;
      if(pin.indexOf("previous") != -1){ // previous
        url = "https://kahoot.com/kahoot-of-the-week-previous";
      }else{ // current
        url = "https://kahoot.com/kahoot-of-the-week";
      }
      request(url,(e,r,b)=>{
        try{
          const p = b.match(/(?<=challenge\/)\d+/gm)[0];
          game.send({message:`Connected to ${p}!`,type:"Message.PinGood"});
          game.options.pin = p;
          game.options.isChallenge = true;
        }catch(err){
          game.send({message:"INVALID_PIN",type:"Error"});
        }
      });
      return;
    }
    if(pin && pin[0] == "0"){
      request(`https://kahoot.it/rest/challenges/pin/${pin}`,(e,r,b)=>{
        if(/NOT_FOUND/img.test(b)){
          game.send({message:"INVALID_PIN",type:"Error"});
        }else{
          game.send({message:`Connected to ${pin}!`,type:"Message.PinGood"});
          game.options.pin = pin;
          game.options.isChallenge = true;
        }
      });
      return;
    }
    request(`https://kahoot.it/reserve/session/${pin}/?${Date.now()}`,(e,r,b)=>{
      if(b == "Not found" || /(MethodNotAllowedError)/img.test(b)){
        game.send({message:"INVALID_PIN",type:"Error"});
      }else{
        game.send({message:`Connected to ${pin}!`,type:"Message.PinGood"});
        game.options.pin = Number(pin);
      }
    });
  },
  SET_OPTS: (game,opts)=>{
    try{
      const old = Object.assign({},game.options);
      opts.searchLoosely = Number(opts.searchLoosely);
      Object.assign(game.options,JSON.parse(opts));
      // if these changed, reset cursor.
      if(old.searchLoosely != game.options.searchLoosely || old.author != game.options.author || old.name != game.options.name || old.searchTerm != game.options.searchTerm){
        game.finder.hax.cursor = 0;
      }
      // variable answer
      if(Number(game.options.timeout) < 0){
        game.options.timeout = Math.abs(game.options.timeout);
        game.options.variableTimeout = true;
      }else{
        game.options.variableTimeout = false;
      }
      // disable autoplay
      if(game.options.ChallengeDisableAutoplay){
        game.kahoot.options.ChallengeAutoContinue = false;
      }else{
        game.kahoot.options.ChallengeAutoContinue = true;
      }
      // remove default fail.
      if(game.options.fail == 2 && (game.fails.length == 1 || game.options.fail != old.fail)){
        game.fails = [false];
      }
    }catch(err){
      game.send({message:"INVALID_USER_INPUT",type:"Error"});
    }
  },
  JOIN_GAME: (game,name)=>{
    if(typeof(name) != "string" || !name.length || game.security.joined){
      game.send({message:"INVALID_NAME",type:"Error"});
      return;
    }
    game.security.joined = true;
    if(name == "debug_server_messages"){
      game.kahoot.loggingMode = true;
    }
    game.kahoot.join(game.options.pin,name,game.options.teamMembers ? game.options.teamMembers.toString().split(",") : undefined).catch(err=>{
      if(err == "token_error"){
        return game.send({message:"HANDSHAKE",type:"Error"});
      }
      game.send({message:"INVALID_NAME",type:"Error"});
    });
  },
  ANSWER_QUESTION: (game,answer)=>{
    if(!game.security.joined ||!game.kahoot.quiz || !game.kahoot.quiz.currentQuestion){
      return;
    }
    if((typeof (answer) == "undefined") || answer === ""){
      game.send({message:"INVALID_USER_INPUT",type:"Error"});
      game.kahoot.quiz.currentQuestion.answer(game.finder.hax.correctAnswer);
      return;
    }else if(answer === null){
      return QuestionAnswer(game.kahoot,game.kahoot.quiz.currentQuestion);
    }
    game.kahoot.quiz.currentQuestion.answer(answer,{
      points: Number(game.options.challengePoints),
      correct: game.options.challengeCorrect
    });
  },
  CHOOSE_QUESTION_INDEX: (game,index)=>{
    index = Number(index);
    if(!game.security.joined || !game.kahoot.quiz.currentQuestion || game.finder.hax.validOptions.length == 0 || game.finder.hax.validOptions[0].questions.length <= index || index < 0){
      return game.send({message:"INVALID_USER_INPUT",type:"Error"});
    }
    if(index != game.correctIndex){
      game.correctIndex = index;
      let ans;
      const type2 = game.kahoot.quiz.currentQuestion.type;
      const type = game.finder.hax.validOptions[0].questions[index].type;
      if(type != type2){ // hmm, wrong question.
        return;
      }
      const choices = game.finder.hax.validOptions[0].questions[index].choices;
      if(!choices){
        return;
      }
      try{ // just in case
        for(let i = 0;i<choices.length;++i){
          if(choices[i].correct){
            game.finder.hax.correctAnswer = i;
            // open ended support
            if(game.finder.hax.validOptions[0].questions[index].type == "open_ended"){
              game.finder.hax.correctAnswer = choices[i].answer;
            }
            break;
          }
        }
        // jumble support
        if(game.finder.hax.validOptions[0].questions[index].type == "jumble"){
          // since we cannot actually find out the correct answer as this is a program, we just guess...
          game.finder.hax.correctAnswer = shuffle([0,1,2,3]);
          // if challenge
          if(game.options.isChallenge){
            game.finder.hax.correctAnswer = [0,1,2,3];
          }
        }
        // multiple_select_quiz support
        if(game.finder.hax.validOptions[0].questions[index].type == "multiple_select_quiz"){
          const choices = game.finder.hax.validOptions[0].questions[index].choices || [];
          let ok = [];
          for(let i = 0;i<choices.length;i++){
            if(choices[i].correct){
              ok.push(i);
            }
          }
          game.finder.hax.correctAnswer = ok;
        }
      }catch(e){}
    }
  },
  DO_TWO_STEP: (game,steps)=>{
    if(!game.security.joined){
      return game.send({message:"SESSION_NOT_CONNECTED",type:"Error"});;
    }
    try{game.kahoot.answer2Step(JSON.parse(steps));}catch(err){game.send({message:"INVALID_USER_INPUT",type:"Error"});}
  },
  GET_RANDOM_NAME: game=>{
    game.generateRandomName().then(name=>{
      game.send({message:name,type:"Message.SetName"});
    });
  },
  RECONNECT: game=>{
    if(game.security.joined){
      game.kahoot.reconnect();
    }else{
      game.send({message:"SESSION_NOT_CONNECTED",type:"Error"});
    }
  }, // tbh, this is a useless function. (only useful when takeover was possible...) - Deprecated as of V 2.12.3
  NEXT_CHALLENGE: game=>{
    // security
    if(!game.options.isChallenge || !game.security.joined || game.kahoot._wsHandler.phase == "leaderboard"){
      return game.send({message:"SESSION_NOT_CONNECTED",type:"Error"});
    }
    try{
      game.kahoot._wsHandler.next();
    }catch(e){
      console.log("Caught CHALLENGE ERROR:");
      console.log(e);
    }
  },
  FAIL_CURRENT_QUESTION: (game,choice)=>{
    if(!game.security.joined || !game.kahoot.quiz || !game.kahoot.quiz.currentQuestion){
      return game.send({message:"SESSION_NOT_CONNECTED",type:"Error"});
    }
    game.fails[game.kahoot.quiz.currentQuestion.index] = Boolean(choice);
    game.send({message:Boolean(choice),type:"Message.Ping"});
  },
  RECOVER_DATA: (game,message)=>{
    // message should be an object containing quiz name, answers, etc.
    // base validation. Does not work on challenges
    if(game.security.joined || !game.options.pin || game.options.pin[0] == "0" || !message || !message.name || !message.answers || !message.cid){
      return game.send({message:"INVALID_USER_INPUT",type:"Error"});
    }
    // answers validation
    if(!Array.isArray(message.answers)){
      return game.send({message:"INVALID_USER_INPUT",type:"Error"});
    }
    for (var i = 0; i < message.answers.length; i++) {
      const ans = message.answers[i];
      // answers are like {i:0,n:"foobar",t:"quiz",c:false,ns:[]}
      if(typeof ans.i == "undefined" || ans.i == null || !(ans.n && typeof ans.n == "string") || !(ans.t && typeof ans.t == "string") || typeof ans.c == "undefined" || (typeof ans.ns == "undefined" || !Array.isArray(ans.ns))){
        return game.send({message:"INVALID_USER_INPUT",type:"Error"});
      }
    }
    // quiz name validation
    if(typeof message.name != "string"){
      return game.send({message:"INVALID_USER_INPUT",type:"Error"});
    }
    // updating information
    game.finder.answers = message.answers;
    game.kahoot.cid = message.cid;
    game.kahoot.sessionID = game.options.pin;
    game.options.name = message.name;
    game.kahoot._wsHandler = {
      ws: {
        readyState: 3
      }
    };
    game.kahoot.reconnect();
  },
  HANDSHAKE_ISSUES: (game,message)=>{
    if(message != "AAAA!"){
      return;
    }
    if(game.handshakeIssues && game.ip && !(handshakeVotes.includes(game.ip))){
      handshakeVotes.push(game.ip);
    }else{ // liar
      game.send({
        type: "Error",
        message: "INVALID_USER_INPUT"
      });
    }
  }
};
const QuestionAnswer = (k,q)=>{
  if(!q){
    return;
  }
  let answer = k.parent.finder.hax.correctAnswer;
  if(Number(k.parent.options.fail) && k.parent.fails[q.index]){
    switch (q.type) {
      case "open_ended":
      case "word_cloud":
        answer = "sorry, i have no idea.";
        break;
      case "jumble":
        answer = shuffle([0,1,2,3]);
        break;
      case "multiple_select_quiz":
        answer = shuffle([0,1,2,3]).slice(q.quiz.answerCounts[q.index] - Math.floor(Math.random() * (q.quiz.answerCounts[q.index] - 1)));
        break;
      default:
        if(typeof q.quiz.answerCounts[q.index] != "number"){
          answer = 0;
        }else{
          answer = Math.floor(Math.random() * q.quiz.answerCounts[q.index]);
        }
    }
  }
  q.answer(answer,{
    points: Number(k.parent.options.challengePoints),
    correct: k.parent.options.challengeCorrect
  });
};
const Listeners = {
  joined: k=>{
    k.parent.send({message:JSON.stringify({
      name: k.name,
      cid: k.cid
    }),type:"Message.JoinSuccess"});
  },
  quizStart: (k,q)=>{
    if(k.parent.options.isChallenge){
      // set valid options
      if(!k.parent.finder.hax.validOptions.length){
        k.parent.finder.hax.validOptions.push(q.rawEvent);
      }
    }
    if(typeof(q.type) == "undefined"){
      q.type = "quiz"; // Since we joined in the middle of things, we have to assume a quiz type
      q.name = ""; // Set blank name, since we also won't know that.
    }
    k.parent.finder.hax.cursor = 0;
    q.name = k.parent.options.name && !q.name ? k.parent.options.name : q.name;
    k.parent.finder.searchKahoot(0);
    k.parent.send({
      message:JSON.stringify({name:q.name,raw:q.rawEvent}),
      type: "Message.QuizStart"
    });
  },
  question: (k,q)=>{
    if(k.parent.fails.length === 1){
      for(let i = 0;i<q.quiz.questionCount - 1;i++){
        if(Number(k.parent.options.fail) == 0){
          break;
        }
        k.parent.fails.push(Math.random() > (Number(k.parent.options.fail)) ? true : false);
      }
      k.parent.fails = shuffle(k.parent.fails);
    }
    k.parent.send({message:JSON.stringify({data:k.parent.finder.getAnswers(q),index:q.index,total:q.quiz.questionCount,ans:q.quiz.answerCounts,currentGuesses:k.parent.finder.hax.validOptions,type:q.type,raw:q.rawEvent,timeLeft:q.timeLeft,cans:k.parent.finder.hax.answers}),type:"Message.QuestionGet"});
  },
  questionStart: (k,q)=>{
    k.parent.security.gotQuestion = true;
    if(k.parent.options.manual || Number(k.parent.options.searchLoosely) == 2){
      k.parent.send({message:"Question has started!",type:"Message.QuestionBegin"});
    }else{
      k.parent.send({message:"Question has started!",type:"Message.QuestionBegin"});
      k.parent.waiter = setTimeout(()=>{
        QuestionAnswer(k,q);
      },k.parent.options.timeout * 1000 + (Number(k.parent.options.variableTimeout) * Math.random() * 1000));
    }
  },
  questionSubmit: k=>{
    const snark = ["Were you tooooooo fast?","Pure genius or guesswork?","Secret classroom superpowers?","Genius machine?","Classroom perfection?","Pure genius?","Lightning smart?"];
    k.parent.send({message:snark[Math.floor(Math.random() * snark.length)],type:"Message.QuestionSubmit"});
  },
  questionEnd: (k,q)=>{
    clearTimeout(k.parent.waiter);
    k.parent.send({message:JSON.stringify({
      correctAnswers: q.correctAnswers,
      correctAnswer: q.correctAnswer,
      text: q.text,
      correct: q.correct,
      nemesis: q.nemesis,
      rank: q.rank,
      total: q.total,
      points: q.points,
      streak: q.streak
    }),type:"Message.QuestionEnd"});
    if(!k.parent.security.gotQuestion){
      return;
    }
    try{
      k.parent.finder.hax.answers.push({t:q.question.type,ns:q.correctAnswers,n:q.correctAnswer,c:q.correct,i:q.question.index});
      k.parent.finder.searchKahoot(k.quiz.currentQuestion.index + 1);
    }catch(err){
      // likely due to joining in the middle of the game
    }
  },
  finish: (k,q)=>{
    k.parent.send({message:JSON.stringify({
      rank: q.rank,
      correct: q.correct,
      incorrect: q.incorrect
    }),type:"Message.QuizFinish"});
    k.parent.finder.hax.stop = true;
    if(k.parent.options.isChallenge){
      k.options.ChallengeAutoContinue = false;
      setTimeout(()=>{
        try{
          k._wsHandler.next();
        }catch(err){
          console.log("Caught CHALLENGE ERROR:");
          console.log(err);
        }
      },1000 * 60 * 2);
    }
  },
  finishText: (k,t)=>{
    k.parent.send({message:JSON.stringify(t),type:"Message.FinishText"});
  },
  quizEnd: k=>{
    k.parent.send({message:"Quiz has ended.",type:"Message.QuizEnd"});
    k.parent.finder.hax.stop = true;
    k.parent.security.joined = false;
  },
  "2Step": k=>{
    if(k.parent.options.brute){
      for(let i = 0;i < BruteForces.length;++i){
        k.answer2Step(BruteForces[i]);
      }
    }else{
      k.parent.send({message:"Two Step Auth Required",type:"Message.RunTwoSteps"});
    }
  },
  "2StepSuccess": k=>{
    k.parent.send({message:"Two Step Auth Completed",type:"Message.TwoStepSuccess"});
  },
  "2StepFail": k=>{
    if(!k.parent.options.brute){
      k.parent.send({message:"Failed Two Step Auth",type:"Message.FailTwoStep"});
    }
  },
  feedback: k=>{
    k.sendFeedback(Math.floor(Math.random() * 5 + 1),Math.round(Math.random()),Math.round(Math.random()),Math.floor(Math.random() * 3 - 1));
  },
  error: k=>{
    k.parent.send({message:"UNKNOWN",type:"Error"});
  },
  invalidName: k=>{
    k.parent.security.joined = false;
    k.parent.send({message:"INVALID_NAME",type:"Error"});
  },
  handshakeFailed: k=>{
    console.log("Handshake failure occured.");
    k.parent.handshakeIssues = true;
    k.parent.send({message:"HANDSHAKE",type:"Error"});
  },
  locked: k=>{
    k.parent.send({message:"GAME_LOCKED",type:"Error"});
  }
};
function applyListeners(kahoot){
  for(let i in Listeners){
    kahoot.on(i,info=>{
      Listeners[i](kahoot,info);
    });
  }
}
const BruteForces = [[0,1,2,3],[0,1,3,2],[0,2,1,3],[0,2,3,1],[0,3,2,1],[0,3,1,2],[1,0,2,3],[1,0,3,2],[1,2,0,3],[1,2,3,0],[1,3,0,2],[1,3,2,0],[2,0,1,3],[2,0,3,1],[2,1,0,3],[2,1,3,0],[2,3,0,1],[2,3,1,0],[3,0,1,2],[3,0,2,1],[3,1,0,2],[3,1,2,0],[3,2,0,1],[3,2,1,0]];

// silly paths.
app.get("/up",(req,res)=>{
  const end = startupDate + (24 * 60 * 60 * 1000);
  const minutes = Math.round((end - Date.now()) / (1000 * 60));
  let message = "";
  if(minutes > 60){
    message = Math.round(minutes / 60) + " hours until expected reset."
  }else{
    message = minutes + " minutes until expected reset."
  }
  res.send(message);
});

// 404 Page
app.use((req,res,next)=>{
  res.status(404);

  // respond with html page
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname,"public","404.html"));
    return;
  }

  // respond with json
  if (req.accepts("json")) {
    res.send(JSON.stringify({error:"Not found",message:"Visit https://kahoot-win.herokuapp.com",status:404}));
    return;
  }

  // default to plain-text. send()
  res.type("txt").send("[404] I think you made a typo! Try going to https://kahoot-win.herokuapp.com/");
});

function createWindow () {
  // Create the browser window.
  let win = new electron.BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadURL('http://localhost:2000');
}

electron.app.whenReady().then(createWindow);

electron.app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});

electron.app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
