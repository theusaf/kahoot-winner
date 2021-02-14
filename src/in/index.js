/* global socket, KahootClient, sleep, ErrorHandler, ChangelogSwitch, AboutSwitch, SettingSwitch, closePage, LoginPage, activateLoading, dataLayer, TwoStepPage, LobbyPage, resetGame, grecaptcha, SettingDiv, QuizEndPage, QuestionEndPage, QuestionSnarkPage, QuestionAnswererPage, GetReadyPage, QuizStartPage, LobbyPage, TimeUpPage, FeedbackPage, TeamTalkPage */
let socket = null;
socket = null;

// Navigation
if(location.pathname === "/" && localStorage.autoNavigatePage && localStorage.autoNavigatePage !== "en"){
  window.stop();
  location.pathname = localStorage.autoNavigatePage;
}

class LiveBaseMessage{
  constructor(client,channel,data){
    this.channel = channel;
    this.clientId = client.clientId;
    if(data){this.data = data;}
    this.ext = {};
  }
}
class LiveTwoStepAnswer extends LiveBaseMessage{
  constructor(client,sequence){
    super(client,"/service/controller",{
      id: 50,
      type: "message",
      gameid: client.gameid,
      host: "kahoot.it",
      content: JSON.stringify({
        sequence: sequence.join("")
      })
    });
  }
}

function sendQuizQuestionAnswers(){
  send(`QUIZ_QUESTION_ANSWERS;${JSON.stringify(game.client.quiz.quizQuestionAnswers)}`);
}

const BruteForces = [[0,1,2,3],[0,1,3,2],[0,2,1,3],[0,2,3,1],[0,3,2,1],[0,3,1,2],[1,0,2,3],[1,0,3,2],[1,2,0,3],[1,2,3,0],[1,3,0,2],[1,3,2,0],[2,0,1,3],[2,0,3,1],[2,1,0,3],[2,1,3,0],[2,3,0,1],[2,3,1,0],[3,0,1,2],[3,0,2,1],[3,1,0,2],[3,1,2,0],[3,2,0,1],[3,2,1,0]],
  MessageHandler = {
    PING: ()=>{
      console.log("Recieved ping from server");
    },
    MAINTAINANCE: msg=>{
      return new ErrorHandler("Maintainance Alert: " + msg);
    },
    ERROR: (msg)=>{
      return new ErrorHandler("Search Socket Error: " + msg);
    },
    RESULTS: (data)=>{
      if(game.opts.QuizLock){
        return;
      }
      const items = JSON.parse(data);
      game.guesses = items;
      if(!game.notifiedRandom &&
        game.guesses.length &&
        game.guesses[0].uuid === game.oldQuizUUID &&
        game.gotWrong &&
        game.pin[0] !== "0" &&
        !game.opts.manual &&
        !game.failedPurposely &&
        !["survey","multiple_select_poll","jumble","brainstorming","word_cloud","content","open_ended"].includes(game.lastQuestionType)){
        game.notifiedRandom = true;
        return new ErrorHandler("You got a question wrong, but it appears to be the correct quiz. The questions may be randomized. Click this to enable manual control.",{
          onclick: (evt,div)=>{
            document.querySelector("#manual").checked = true;
            game.saveOptions();
            div.outerHTML = "";
            new ErrorHandler("§ManualControl§: §ON§",{
              isNotice: true
            });
          },
          time: 60e3
        });
      }
    },
    SERVER_TRANSFER: (proxy)=>{
      socket.onclose = null;
      grecaptcha.ready(()=>{
        grecaptcha.execute("6LcyeLEZAAAAAGlTegNXayibatWwSysprt2Fb22n",{action:"search_session"}).then((token) => {
          game.socket = new WebSocket(`${(location.protocol == "http:" ? "ws://" : "wss://")}${proxy}/search?token=${token}`);
          socket = game.socket;
          socket.onmessage = evt=>{
            evt = evt.data;
            const command = evt.match(/^[A-Z_]+?(?=;)/)[0],
              data = evt.substr(command.length + 1);
            if(MessageHandler[command]){
              MessageHandler[command](data);
            }
          };
          socket.onerror = (err)=>{
            new ErrorHandler("Search WebSocket Error: " + err);
          };
          socket.onclose = () => {
            new ErrorHandler("Search Socket Closed.");
          };
          game.loadOptions();
        }).catch((err)=>{
          new ErrorHandler("Failed to get captcha token: " + err ? err : "unknown error");
        });
      });
    }
  },
  Listeners = {
    QuizStart: (data)=>{
      try{game.music.pause();}catch(e){/* No music */}
      sendQuizQuestionAnswers();
      send(`QUIZ_NAME;${data.quizTitle}`);
      return new QuizStartPage;
    },
    QuestionReady: info=>{
      game.questionReady = true;
      game.teamAnswered = false;
      if(game.fails.length === 1){
        for(let i = 0;i<game.total - 1;i++){
          if(+game.opts.fail === 0){
            break;
          }
          game.fails.push(Math.random() > +game.opts.fail);
        }
        game.fails = shuffle(game.fails);
      }
      sendQuizQuestionAnswers();
      return new GetReadyPage(info);
    },
    QuestionStart: async question=>{
      if(game.questionReady === false){
        return; // question already ended?
      }
      game.questionAnswered = false;
      game.receivedTime = Date.now();
      sendQuizQuestionAnswers();
      new QuestionAnswererPage(question);
      if(game.opts.manual || game.teamAnswered || +game.opts.searchLoosely === 2){
        return;
      }
      game.answerQuestion(null);
    },
    QuestionEnd: info=>{
      game.questionReady = false;
      try{game.music.pause();}catch(e){/* No music */}
      try{
        info.index = game.index;
      }catch(e){
        return new TimeUpPage(info);
      }
      game.got_answers.push(info);
      sendQuizQuestionAnswers();
      send(`SET_ANSWERS;${JSON.stringify(game.got_answers)}`);
      return new QuestionEndPage(info);
    },
    QuizEnd: info=>{
      game.quizEnded = true;
      game.end.info = info;
      send(`QUIZ_ID;${info.quizId}`);
      dataLayer.push(Object.assign({event:"quiz_finish"},info));
    },
    Podium: text=>{
      if(game.theme === "Music"){game.playSound("/resource/music/podium.m4a");}
      else if(game.theme === "Minecraft"){game.playSound("/resource/music/Pigstep.m4a");}
      return new QuizEndPage(text);
    },
    Disconnect: (r)=>{
      game.quizEnded = true;
      resetGame();
      if(r === "Error connecting to Challenge"){
        new ErrorHandler("Try using the Random Name button. This error can happen if your name is not valid.");
      }
      return setTimeout(function(){new ErrorHandler("§QuizEnd§ " + "(" + r + ")");},300);
    },
    TwoFactorReset: async ()=>{
      if(game.opts.brute){
        const pack = [];
        for(let i = 0; i < BruteForces.length; i++){
          const m = new LiveTwoStepAnswer(game.client, BruteForces[i]);
          m.id = `${++game.client.messageId}`;
          pack.push(m);
        }
        // send in batches
        for(let i = 0; i < pack.length; i+=2){
          await sleep(.4);
          game.client.socket.send(JSON.stringify(pack.slice(i,i + 2)));
        }
        return;
      }
      game.two = [];
      return new TwoStepPage;
    },
    TwoFactorWrong: ()=>{
      return new TwoStepPage(true);
    },
    TwoFactorCorrect: ()=>{
      return new LobbyPage;
    },
    GameReset: ()=>{
      new LobbyPage;
      delete game.question;
      delete game.guesses;
      delete game.answers;
      delete game.rawData;
      delete game.ans;
      delete game.got_answers;
      game.quizEnded = false;
    },
    NameAccept: n=>{
      const data = n;
      game.name = data.playerName;
      try{document.getElementById("L2").innerHTML = `<p>${data.playerName}</p>`;}catch(e){/* No name object */}
    },
    TimeOver: ()=>{
      new TimeUpPage;
    },
    Feedback: ()=>{
      new FeedbackPage;
    },
    TeamTalk: data=>{
      game.teamTalkTime = Date.now();
      game.questionAnswered = false;
      new TeamTalkPage(data);
      if(!game.opts.teamtalk || game.opts.manual || game.teamAnswered || +game.opts.searchLoosely === 2){
        return;
      }
      game.answerQuestion(null);
    }
  };

function shuffle(array) {
  array = Array.from(array);
  let currentIndex = array.length, temporaryValue, randomIndex;
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

class Game{
  constructor(){
    this.client = new KahootClient({
      proxy:(opts)=>{
        opts.host = location.hostname;
        opts.port = location.port;
        opts.path = "/kahoot" + opts.path;
        opts.protocol = location.protocol;
        return opts;
      }
    });
    this.socket = null;
    this.gotWrong = false;
    this.lastQuestionType = null;
    this.failedPurposely = null;
    this.notifiedRandom = false;
    this.oldQuizUUID = "";
    // whether ready
    this.ready = false;
    this.teamTalkTime = 0;
    this.guesses = [];
    this.fails = [true];
    this.teamAnswered = false;
    // correct answers
    this.answers = [];
    // results of questions
    this.got_answers = [];
    this.quizEnded = true;
    // quiz end info
    this.end = {};
    // two factor answers
    this.two = [];
    this.errorTimeout = null;
    // jumble answers
    this.jumbleAnswer = [];
    this.multiAnswer = {
      0: false,
      1: false,
      2: false,
      3: false
    };
    this.theme = "Kahoot";
    // options
    this.opts = {};
    // search loosely correct index
    this.correctIndex = null;
    this.questionStarted = false;
    this.questionAnswered = false;
    this.panicSettings = null;
  }
  get name(){
    return this.client.name;
  }
  get streak(){
    return this.client.data.streak;
  }
  get cid(){
    return this.client.cid;
  }
  get pin(){
    return this.gameid || this.client.gameid;
  }
  get score(){
    return this.client.data.totalScore;
  }
  get total(){
    return this.client.quiz.quizQuestionAnswers.length;
  }
  get index(){
    return this.client.quiz.currentQuestion.index || this.client.quiz.currentQuestion.gameBlockIndex || this.client.quiz.currentQuestion.questionIndex || 0;
  }
  sendPin(pin){
    return new Promise((res)=>{
      activateLoading(true,true);
      const weekly = ["weekly","weekly-previous","https://kahoot.com/kahoot-of-the-week-previous","https://kahoot.com/kahoot-of-the-week","https://kahoot.com/kahoot-of-the-week-previous/","https://kahoot.com/kahoot-of-the-week-previous","kahoot-of-the-week","kahoot-of-the-week-previous"];
      if(isNaN(pin)){
        if(weekly.includes(pin)){
          let url;
          if(pin.indexOf("previous") !== -1){
            url = "/kahoot/weekly-previous";
          }else{
            url = "/kahoot/weekly";
          }
          const request = new XMLHttpRequest();
          request.open("GET",url);
          request.send();
          request.onload = ()=>{
            activateLoading(false,false);
            this.gameid = request.response.match(/challenge\/\d+/gm)[0].replace("challenge/","");
            new LoginPage(true);
            res();
          };
          request.onerror = ()=>{
            activateLoading(false,false);
            new ErrorHandler("Failed to fetch weekly pin");
            new LoginPage;
            res();
          };
        }else{
          try{
            const url = new URL(pin),
              path = url.pathname.split(/challenge\//g)[1],
              // if it was an invalid link, this should throw an error
              isPin = path.match(/\d+/g)[0];
            if(path.length === isPin.length && path.length > 0){
              // this means that the pin is in the link lol
              this.gameid = path;
              activateLoading(false,false);
              new LoginPage(true);
              res();
            }else{
              const request = new XMLHttpRequest();
              request.open("GET",`/kahoot/rest/challenges/${path}`);
              request.send();
              request.onerror = ()=>{
                activateLoading(false,false);
                new ErrorHandler("Failed to fetch challenge pin");
                new LoginPage;
                res();
              };
              request.onload = ()=>{
                const data = JSON.parse(request.response);
                if(data.error){
                  activateLoading(false,false);
                  new ErrorHandler("Invalid PIN");
                  new LoginPage;
                  res();
                }else{
                  this.gameid = data.pin;
                  activateLoading(false,false);
                  new LoginPage(true);
                  res();
                }
              };
            }
          }catch(err){
            activateLoading(false,false);
            new LoginPage();
            new ErrorHandler("Invalid PIN");
            res();
          }
        }
      }else{
        if(typeof pin === "undefined" || pin === ""){
          activateLoading(false,false);
          new ErrorHandler("Please enter a PIN");
          new LoginPage;
          res();
          return;
        }
        activateLoading(false,false);
        this.gameid = pin;
        new LoginPage(true);
        res();
      }
    });
  }
  join(name){
    activateLoading(true,true);
    this.client.join(this.pin,name,this.opts.teamMembers ? this.opts.teamMembers.split(",") : null).then(()=>{
      if(this.theme === "Music"){this.playSound("/resource/music/lobby.m4a");}
      else if(this.theme === "Minecraft"){this.playSound("/resource/music/Minecraft.mp3");}
      this.quizEnded = false;
      dataLayer.push({event:"join_game"});
      activateLoading(false,false);
      new LobbyPage;
      if(this.pin[0] === "0"){
        this.guesses = [this.client.challengeData.kahoot];
        return;
      }
      grecaptcha.ready(()=>{
        grecaptcha.execute("6LcyeLEZAAAAAGlTegNXayibatWwSysprt2Fb22n",{action:"search_session"}).then((token) => {
          if(typeof game.client.cid === "undefined"){
            return;
          }
          this.socket = new WebSocket(`${(location.protocol == "http:" ? "ws://" : "wss://")}${location.host}/search?token=${token}`);
          socket = this.socket;
          socket.onmessage = evt=>{
            evt = evt.data;
            const command = evt.match(/^[A-Z_]+?(?=;)/)[0],
              data = evt.substr(command.length + 1);
            if(MessageHandler[command]){
              MessageHandler[command](data);
            }
          };
          socket.onerror = (err)=>{
            new ErrorHandler("Search WebSocket Error: " + err);
          };
          socket.onclose = () => {
            new ErrorHandler("Search Socket Closed.");
          };
          this.loadOptions();
        }).catch((err)=>{
          new ErrorHandler("Failed to get captcha token: " + err ? err : "unknown error");
        });
      });
    }).catch((err)=>{
      console.log(err);
      new ErrorHandler("Failed to join: " + err.description || err.status || err);
      resetGame();
    });
    for(const i in Listeners){
      this.client.on(i,Listeners[i]);
    }
  }
  getRandom(){
    dataLayer.push({event:"get_random_name"});
    const First = ["Adorable","Agent","Agile","Amazing","Amazon","Amiable","Amusing","Aquatic","Arctic","Awesome","Balanced","Blue","Bold","Brave","Bright","Bronze","Captain","Caring","Champion","Charming","Cheerful","Classy","Clever","Creative","Cute","Dandy","Daring","Dazzled","Decisive","Diligent","Diplomat","Doctor","Dynamic","Eager","Elated","Epic","Excited","Expert","Fabulous","Fast","Fearless","Flying","Focused","Friendly","Funny","Fuzzy","Genius","Gentle","Giving","Glad","Glowing","Golden","Great","Green","Groovy","Happy","Helpful","Hero","Honest","Inspired","Jolly","Joyful","Kind","Knowing","Legend","Lively","Lovely","Lucky","Magic","Majestic","Melodic","Mighty","Mountain","Mystery","Nimble","Noble","Polite","Power","Prairie","Proud","Purple","Quick","Radiant","Rapid","Rational","Rockstar","Rocky","Royal","Shining","Silly","Silver","Smart","Smiling","Smooth","Snowy","Soaring","Social","Space","Speedy","Stellar","Sturdy","Super","Swift","Tropical","Winged","Wise","Witty","Wonder","Yellow","Zany"],
      Last = ["Alpaca","Ant","Badger","Bat","Bear","Bee","Bison","Boa","Bobcat","Buffalo","Bunny","Camel","Cat","Cheetah","Chicken","Condor","Crab","Crane","Deer","Dingo","Dog","Dolphin","Dove","Dragon","Duck","Eagle","Echidna","Egret","Elephant","Elk","Emu","Falcon","Ferret","Finch","Fox","Frog","Gator","Gazelle","Gecko","Giraffe","Glider","Gnu","Goat","Goose","Gorilla","Griffin","Hamster","Hare","Hawk","Hen","Horse","Ibex","Iguana","Impala","Jaguar","Kitten","Koala","Lark","Lemming","Lemur","Leopard","Lion","Lizard","Llama","Lobster","Macaw","Meerkat","Monkey","Mouse","Newt","Octopus","Oryx","Ostrich","Otter","Owl","Panda","Panther","Pelican","Penguin","Pigeon","Piranha","Pony","Possum","Puffin","Quail","Rabbit","Raccoon","Raven","Rhino","Rooster","Sable","Seal","SeaLion","Shark","Sloth","Snail","Sphinx","Squid","Stork","Swan","Tiger","Turtle","Unicorn","Urchin","Wallaby","Wildcat","Wolf","Wombat","Yak","Yeti","Zebra"],
      name = First[Math.floor(Math.random() * First.length)] + Last[Math.floor(Math.random() * Last.length)];
    document.getElementById("loginInput").value = name;
  }
  saveOptions(){
    const settings = SettingDiv.querySelectorAll("input,select"),
      opts = {},
      old = Object.assign({},this.opts);
    for(let i = 0;i<settings.length;++i){
      opts[settings[i].id] = settings[i].type == "checkbox" ? settings[i].checked : settings[i].value;
    }
    localStorage.options = JSON.stringify({
      manual: opts.manual,
      timeout: opts.timeout,
      brute: opts.brute,
      fail: opts.fail,
      teamtalk: opts.teamtalk,
      teamMembers: opts.teamMembers,
      theme: opts.theme,
      previewQuestion: opts.previewQuestion,
      searchLoosely: opts.searchLoosely,
      ChallengeDisableAutoplay: opts.ChallengeDisableAutoplay,
      ChallengeDisableTimer: opts.ChallengeDisableTimer,
      div_game_options: opts.div_game_options,
      div_search_options: opts.div_search_options,
      div_challenge_options: opts.div_search_options
    });
    const oldOpts = this.opts;
    this.theme = opts.theme;
    this.opts = opts;
    if(+opts.timeout < 0){
      opts.timeout = Math.abs(opts.timeout);
      opts.variableTimeout = true;
    }else{
      opts.variableTimeout = false;
    }
    // disable autoplay
    if(opts.ChallengeDisableAutoplay){
      this.client.defaults.options.ChallengeAutoContinue = false;
    }else{
      this.client.defaults.options.ChallengeAutoContinue = true;
    }
    if(opts.challengePoints){
      this.client.defaults.options.ChallengeScore = +this.opts.challengePoints;
    }else{
      this.client.defaults.options.ChallengeScore = 0;
    }
    if(opts.challengeCorrect){
      this.client.defaults.options.ChallengeAlwaysCorrect = true;
    }else{
      this.client.defaults.options.ChallengeAlwaysCorrect = false;
    }
    if(opts.ChallengeEnableStreaks){
      this.client.defaults.options.ChallengeUseStreakBonus = true;
    }else{
      this.client.defaults.options.ChallengeUseStreakBonus = false;
    }
    if(opts.ChallengeDisableTimer){
      this.client.defaults.options.ChallengeWaitForInput = true;
    }else{
      this.client.defaults.options.ChallengeWaitForInput = false;
    }
    // remove default fail.
    if((+opts.fail === 2 && +this.fails.length === 1) || opts.fail !== old.fail){
      if(+opts.fail === 2){
        this.fails = [false];
      }else{
        this.fails = [true];
      }
    }
    // timeframe
    if(isNaN(opts.timeout)){
      try { // assume [-]d[s]-[s][-]d
        const args = opts.timeout.split("-");
        if(args.length === 2){
          opts.timeout = +args[0];
          opts.timeoutEnd = +args[1];
        }else if(args.length === 3){
          opts.timeout = -args[1];
          opts.timeoutEnd = +args[2];
        }else{ // assume 4
          opts.timeout = -args[1];
          opts.timeoutEnd = +args[3];
        }
        opts.timeout = opts.timeout || 0;
      } catch (e) {
        opts.timeout = 0;
        opts.timeoutEnd = 0;
      }
    }

    // changing timeout mid question.
    if(old.timeout !== this.opts.timeout){
      if(!this.opts.manual && this.questionStarted && !this.questionAnswered){
        clearTimeout(this.waiter);
        const start = +this.opts.timeout * 1000 + (+this.opts.variableTimeout * Math.random() * 1000),
          end = Math.random() * ((+this.opts.timeoutEnd - (start/1000) || 0)) * 1000,
          delayed = Date.now() - this.receivedTime;
        this.waiter = setTimeout(()=>{
          this.answerQuestion(null);
        },start+end-delayed);
      }
    }
    send(`SET_OPTS;${JSON.stringify(opts)}`);
    if(this.questionStarted && !this.questionAnswered && oldOpts.manual && !this.opts.manual){
      this.answerQuestion(null);
    }
  }
  async answerQuestion(answer){
    if(this.questionAnswered){
      return;
    }
    if(answer === null){
      answer = this.getCorrectAnswer();
    }
    this.failedPurposely = false;
    if(+this.opts.fail && this.fails[this.index] && !this.opts.manual){
      this.failedPurposely = true;
      switch (this.client.quiz.currentQuestion.gameBlockType) {
        case "open_ended":
        case "word_cloud":
          answer = "fgwadsfihwksdxfs";
          break;
        case "jumble":
          answer = [0,1,2,3];
          break;
        case "multiple_select_poll":
        case "multiple_select_quiz":
          answer = [-1];
          break;
        default:
          answer = -1;
      }
    }
    this.teamAnswered = true;
    this.questionAnswered = true;
    if(this.opts.teamtalk){
      const diff = Date.now() - this.teamTalkTime;
      if(diff < 250){await sleep((250 - diff)/1000);}
    }
    const start = +game.opts.timeout + (+game.opts.variableTimeout * Math.random()),
      end = Math.random() * ((+game.opts.timeoutEnd - start || 0));
    if(!this.opts.manual){
      await sleep(start+end);
    }
    this.client.answer(answer).finally(()=>{
      const snark = ["Were you tooooooo fast?","Pure genius or guesswork?","Secret classroom superpowers?","Genius machine?","Classroom perfection?","Pure genius?","Lightning smart?"],
        message = snark[Math.floor(Math.random() * snark.length)];
      return new QuestionSnarkPage(message);
    });
  }
  getCorrectAnswer(log,noset){
    const question = this.question,
      index = +this.opts.searchLoosely ? game.correctIndex : question.questionIndex;
    let ans;
    switch (question.gameBlockType) {
      case "open_ended":
      case "word_cloud":
        ans = "honestly, i don't know";
        break;
      case "jumble":
        ans = shuffle([0,1,2,3]);
        break;
      case "multiple_select_quiz":
        ans = shuffle([0,1,2,3]).slice((question.quizQuestionAnswers || this.client.quiz.quizQuestionAnswers)[question.questionIndex] - Math.floor(Math.random() * (this.client.quiz.quizQuestionAnswers[question.questionIndex] + 1)));
        break;
      default:
        ans = Math.floor(Math.random() * (question.quizQuestionAnswers || this.client.quiz.quizQuestionAnswers)[index]);
    } // default values
    try{
      if(noset){
        return ans;
      }
      if(log){console.log(`Using quiz id ${this.guesses[0].uuid}`);}
      const choices = this.guesses[0].questions[index].choices;
      if(!choices){
        return ans;
      }
      if(this.guesses[0].questions[index].type !== question.gameBlockType){
        return ans;
      }
      for(let i = 0;i<choices.length;++i){
        if(choices[i].correct){
          ans = i;
          // open ended support
          if(this.guesses[0].questions[index].type === "open_ended"){
            return choices[i].answer;
          }
          break;
        }
      }
      // jumble support
      if(this.guesses[0].questions[index].type === "jumble"){
        if(this.pin[0] === "0"){
          return [0,1,2,3];
        }
        // since we cannot actually find out the correct answer as this is a program, we just guess...
        return shuffle([0,1,2,3]);
      }
      // multiple_select_quiz support
      if(this.guesses[0].questions[index].type === "multiple_select_quiz"){
        const choices = this.guesses[0].questions[index].choices || [],
          ok = [];
        for(let i = 0;i<choices.length;i++){
          if(choices[i].correct){
            ok.push(i);
          }
        }
        ans = ok;
      }
      return ans;
    }catch(err){
      return ans;
    }
  }
  sendFeedback(feedback){
    const {fun,learn,recommend,overall} = feedback;
    this.client.sendFeedback(fun,learn,recommend,overall);
  }
  loadOptions(){
    let opts;
    try{
      opts = JSON.parse(localStorage.options);
      this.opts = opts;
      this.theme = opts.theme;
    }catch(err){
      return;
    }
    if(!opts){
      return;
    }
    for(const i in opts){
      const elem = document.getElementById(i);
      if(elem.type == "checkbox"){
        elem.checked = opts[i];
      }else{
        elem.value = opts[i];
      }
    }
    if(socket && socket.readyState === 1){
      this.saveOptions();
      dataLayer.push(Object.assign({event:"load_options"},opts));
      return new ErrorHandler("§Restored§",{
        isNotice: true
      });
    }else{
      if(socket === null){
        return;
      }
      setTimeout(()=>{
        this.loadOptions();
      },3000);
    }
  }
  answer(num){
    activateLoading(true,true);
    this.answerQuestion(num);
    dataLayer.push({
      event: "answer",
      value: num,
      type: this.question.type
    });
  }
  answer2(id,thing){
    thing.className = "faded";
    if(this.two.indexOf(id) != -1){
      return;
    }
    this.two.push(id);
    if(this.two.length == 4){
      this.client.answerTwoFactorAuth(this.two);
      activateLoading(true,true,"");
      return;
    }
  }
  answerJ(list){
    const li = [];
    for(let i = 0;i<list.length;i++){
      li.push(Number(list[i].getAttribute("index")));
    }
    this.answer(li);
  }
  answerM(id,thing){
    this.multiAnswer[id] = !this.multiAnswer[id];
    if(thing.className.indexOf("correct") != -1){
      thing.className = this.multiAnswer[id] ? "fadedm correct" : "correct";
    }else{
      thing.className = this.multiAnswer[id] ? "fadedm" : "";
    }
  }
  updateName(){
    clearTimeout(this.saveTimeout);
    const UUIDRegex = /[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}/i;
    if(UUIDRegex.test(document.getElementById("searchTerm").value)){
      document.getElementById("uuid").value = document.getElementById("searchTerm").value.match(UUIDRegex)[0];
    }
    this.saveTimeout = setTimeout(this.saveOptions,500);
  }
  playSound(url,once){
    if(!this.music){
      this.music = new Audio();
      this.music.addEventListener("timeupdate",()=>{
        if(this.music.currentTime > this.music.duration - 0.44 && !this.music.once){
          this.music.currentTime = 0;
          this.music.play();
        }
      });
      this.music.addEventListener("canplaythrough",()=>{
        this.music.res && this.music.res();
      });
    }
    return new Promise((res)=>{
      this.music.once = once;
      this.music.res = res;
      this.music.pause();
      this.music.src = url;
      this.music.play();
    });
  }
}

function send(message){
  if(socket === null){
    return;
  }
  socket.send(message);
}

function setCookie(val){
  localStorage.autoNavigatePage = val;
  if(val !== "en"){
    location.href = "/" + val;
  }else{
    location.href = "/";
  }
}

let game = null;
game = new Game;
const eggstyle = document.createElement("style");
let egg = "";
eggstyle.innerHTML = `p,.sm span,img,h1,h2,.About h3,.tut_cont h3,h4{
  animation: infinite windance 1s;
}`;
let shouldStop = false;
window.addEventListener("keydown",async (e)=>{
  if(e.key == "Escape"){
    if(closePage == 0){
      SettingSwitch.click();
    }else if (closePage == 1) {
      AboutSwitch.click();
    }else{
      ChangelogSwitch.click();
    }
  }
  egg += e.key;
  try{
    if("winner".search(egg) !== 0 && "return by death".search(egg) !== 0 && "behold an unthinkable present".search(egg) !== 0 && "explosion".search(egg) !== 0 && "01189998819991197253".search(egg) !== 0){
      egg = "";
      if(shouldStop){game.music.pause();shouldStop=false;}
      try{
        document.body.removeChild(eggstyle);
      }catch(err){
        // meh
      }
    }else if(egg === "winner"){
      document.body.append(eggstyle);
    }else if(egg === "01189998819991197253"){
      await game.playSound("/resource/music/01189998819991197253.m4a",true);
      const container = Element("div",{
          style: `position: fixed;
          bottom: 8rem;
          left: 0;
          color: white;
          font-size: 1.25rem;
          width: 100%;
          z-index: 500;`
        }),
        numbers = Element("h2",{
          style: "width: 21.5rem;margin:auto;"
        }),
        str = "01189998819991197253",
        timings = [.3,.5,.34,.33,.7,.23,.27,1.28,.45,.45,.5,.45,.9,.25,.34,.45,.73,.52,.5,1.77];
      container.append(numbers);
      document.body.append(container);
      for(let i = 0;i<str.length;i++){
        await sleep(timings[i]);
        numbers.innerHTML += str[i];
      }
      await sleep(1.5);
      numbers.outerHTML = "";
    }else if(egg === "return by death"){
      if(game.theme === "ReZero"){
        await game.playSound("/resource/music/return_by_death.mp3");
        shouldStop=true;
        document.body.style = "box-shadow:inset 0 0 10rem 5rem darkviolet;";
        setTimeout(()=>{
          game.music.pause();
          document.body.style = "";
        },Math.random() * 20000 + 10000);
      }
    }else if(egg === "behold an unthinkable present"){
      if(game.theme === "ReZero"){
        game.playSound("/resource/music/behold_unthinkable_present.m4a");
        shouldStop=true;
      }
    }else if(egg === "explosion"){
      // due to the amount of styles in this one, this can only be used during the login screen
      if(game.theme === "KonoSuba" && game.pin === 0){
        await game.playSound("/resource/music/megumin_explosion.mp3",true);
        // starting fire
        document.body.style = "box-shadow:inset 0 0 0.7rem 0.7rem #451b0e,inset 0 0 1.4rem 1.4rem #973716,inset 0 0 1.8rem 1.8rem #cd4606,inset 0 0 2.1rem 2.1rem #ec760c,inset 0 0 2.4rem 2.4rem #ffae34,inset 0 0 2.7rem 2.7rem #fefcc9";
        const megu = document.createElement("img");
        megu.src = "/resource/img/game/theme/konosuba/red.svg";
        megu.style = "position:fixed;top:calc(50% - 5rem);left:100%;width:10rem;transition:left 4s;";
        document.body.append(megu);
        setTimeout(()=>{megu.style.left = "calc(75% - 5rem)";});
        setTimeout(()=>{megu.style.left = "150%";},16e3);
        setTimeout(()=>{
          document.body.style = "";
          const explosion = document.createElement("div");
          document.body.append(explosion);
          explosion.style = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:5000;transition:background 2s";
          explosion.style.background = "darkorange";
          setTimeout(()=>{
            explosion.style.background = "beige";
            setTimeout(()=>{
              megu.outerHTML = "";
              explosion.style.background = "black";
              setTimeout(()=>{
                explosion.outerHTML = "";
              },3e3);
            },3e3);
          },2e3);
        },21e3);
      }
    }
  }catch(err){
    egg = "";
    if(shouldStop){game.music.pause();shouldStop=false;}
  }
});
window.addEventListener("unload", () => {
  game.client.leave();
});

function detectPlatform(){
  let OSName = "Linux";
  if (navigator.appVersion.indexOf("Win")!=-1) {OSName="Windows";}
  if (navigator.appVersion.indexOf("Mac")!=-1) {OSName="MacOS";}
  if (navigator.appVersion.indexOf("X11")!=-1) {OSName="UNIX";}
  if (navigator.appVersion.indexOf("Linux")!=-1) {OSName="Linux";}
  return OSName;
}

localStorage.KW_Version = "v6.0.1";
const checkVersion = new XMLHttpRequest();
checkVersion.open("GET","/up");
checkVersion.send();
checkVersion.onload = function(){
  const version = checkVersion.response.split(": ")[1],
    locVersion = localStorage.KW_Version || version;
  if(localStorage.KW_Update == "false" || checkVersion.status !== 200){
    return;
  }
  if(version != locVersion){
    new ErrorHandler("§UpdateAvailable§",{
      permanent: true,
      onclick: (e,d)=>{
        d.outerHTML = "";
        const ask = document.createElement("div");
        ask.id = "UpdateDiv";
        ask.innerHTML = `<h2>§UpdateAvailable§</h2>
        <h4>§UpdateAvailable2§</h4>
        <p>§UpdateAvailable3§</p>
        <button id="UpdateYes">§Yes§</button><button id="UpdateNo">§NotYet§</button><br>
        <button onclick="localStorage.KW_Update = false;this.parentElement.outerHTML = '';">§UpdateAvailable4§</button>`;
        document.body.append(ask);
        document.getElementById("UpdateYes").onclick = function(){
          if("serviceWorker" in navigator){
            document.getElementById("UpdateYes").innerHTML = "§UpdateAvailable5§";
            navigator.serviceWorker.getRegistrations().then(async function(registrations) {
              for(const registration of registrations) {
                await registration.unregister();
              }
              setTimeout(function(){
                localStorage.KW_Version = version;
                location.reload();
              },3000);
            }).catch(function() {
              document.getElementById("UpdateDiv").outerHTML = "";
              new ErrorHandler("§UpdateAvailable6§");
            });
          }else{
            document.getElementById("UpdateDiv").outerHTML = "";
            new ErrorHandler("§UpdateAvailable6§");
          }
        };
        document.getElementById("UpdateNo").onclick = function(){
          document.getElementById("UpdateDiv").outerHTML = "";
        };
      }
    });
  }
  if(!localStorage.KW_Version){
    localStorage.KW_Version = version;
  }
};
