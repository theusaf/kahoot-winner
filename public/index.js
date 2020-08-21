/* global ErrorHandler, ChangelogSwitch, AboutSwitch, SettingSwitch, closePage, LoginPage, ThemeChooser, activateLoading, dataLayer, TwoStepPage, LobbyPage, resetGame, grecaptcha, SettingDiv, QuizEndPage, QuestionEndPage, QuestionSnarkPage, QuestionAnswererPage, GetReadyPage, QuizStartPage, LobbyPage, TutorialDiv */
var socket = null;

const MessageHandler = {
  Error: {
    INVALID_USER_INPUT: ()=>{
      return;
    },
    INVALID_PIN: ()=>{
      new LoginPage(false);
      return new ErrorHandler("Invalid PIN");
    },
    INVALID_QUIZ_TYPE: ()=>{
      return new ErrorHandler("Sorry, this quiz is an unsupported gamemode.");
    },
    UNKNOWN: ()=>{
      return new ErrorHandler("An unknown error occured.");
    },
    MAX_SESSION_COUNT: ()=>{
      setTimeout(()=>{
        new ErrorHandler("Your IP address has too many sessions/tabs connected currently.");
        activateLoading(true,true,"Too many sessions. Please wait.");
        setTimeout(()=>{
          resetGame();
        },30000);
      },5000);
    },
    INVALID_NAME: (error)=>{
      clearTimeout(game.handshakeTimeout);
      if(typeof error == "undefined"){
        return;
      }else if(error !== "USER_INPUT"){
        new ErrorHandler("Specified PIN Broken.");
        return new LoginPage();
      }
      new ErrorHandler("Invalid name.");
      return new LoginPage(true);
    },
    SESSION_NOT_CONNECTED: ()=>{
      new ErrorHandler("You can't reconnect yet; you haven't joined a game.");
    },
    EMPTY_NAME: ()=>{
      new ErrorHandler("No quiz name has been provided. The server will not search until this information is provided.");
    },
    HANDSHAKE: ()=>{
      clearTimeout(game.handshakeTimeout);
      new ErrorHandler("Connection to Kahoot's server was blocked. ¯\\_(ツ)_/¯");
      if(document.getElementById("handshake-fail-div")){
        document.getElementById("handshake-fail-div").outerHTML = "";
      }
      let url;
      switch (detectPlatform()) {
      case "Windows":
        url = "https://www.mediafire.com/file/ju7sv43qn9pcio6/kahoot-win-win.zip/file";
        break;
      case "MacOS":
        url = "https://www.mediafire.com/file/bcvxlwlfvbswe62/Kahoot_Winner.dmg/file";
        break;
      default:
        url = "https://www.mediafire.com/file/zb5blm6a8dyrwtb/kahoot-win-linux.tar.gz/file";
      }
      const div = document.createElement("div");
      div.innerHTML = `<span>Hmm, we seem to be having trouble on our end. Try <span class="mobihide">downloading our app or </span>pressing the report button below!</span>
      <br>
      <a class="mobihide" href="${url}" onclick="dataLayer.push({event:'download_app'})" target="_blank">Download App</a>
      <br>
      <button onclick="send({type:'HANDSHAKE_ISSUES',message:'AAAA!'});this.innerHTML = 'Issue has been reported.';this.onclick = null;dataLayer.push({event:'report_error'});" title="This button may decrease the amount of time to reset the server.">Report Issues</button>`;
      div.id = "handshake-fail-div";
      div.style = `
        position: fixed;
        top: 4rem;
        z-index: 1000;
        width: 100%;
        color: white;
        background: #888;
        text-align: center;
        border-radius: 5rem;
      `;
      document.body.append(div);
    },
    GAME_LOCKED: ()=>{
      clearTimeout(game.handshakeTimeout);
      new ErrorHandler("Game Locked.");
      return resetGame();
    }
  },
  Message: {
    SetName: name=>{
      document.getElementById("loginInput").value = name;
    },
    PinGood: m=>{
      const pin = m.match(/\d+/g)[0];
      if(pin != game.pin){
        game.pin = pin;
      }
      try{
        TutorialDiv.innerHTML = "";
      }catch(e){}
      return new LoginPage(true);
    },
    JoinSuccess: data=>{
      data = JSON.parse(data);
      game.cid = data.cid;
      game.quizEnded = false;
      dataLayer.push({event:"join_game"});
      activateLoading(false,false);
      clearTimeout(game.handshakeTimeout);
      return new LobbyPage;
    },
    QuizStart: ()=>{
      return new QuizStartPage;
    },
    QuestionGet: info=>{
      const data = JSON.parse(info);
      return new GetReadyPage(data);
    },
    QuestionBegin: question=>{
      game.questionAnswered = false;
      return new QuestionAnswererPage(question);
    },
    QuestionSubmit: message=>{
      game.questionAnswered = true;
      return new QuestionSnarkPage(message);
    },
    QuestionEnd: info=>{
      return new QuestionEndPage(info);
    },
    QuizFinish: info=>{
      game.quizEnded = true;
      game.end.info = JSON.parse(info);
      dataLayer.push(Object.assign({event:"quiz_finish"},JSON.parse(info)));
    },
    FinishText: text=>{
      return new QuizEndPage(text);
    },
    QuizEnd: ()=>{
      game.quizEnded = true;
      resetGame();
      return setTimeout(function(){new ErrorHandler("Quiz ended or kicked.");},300);
    },
    RunTwoSteps: ()=>{
      game.two = [];
      return new TwoStepPage;
    },
    Ping: ()=>{
      console.log("Recieved ping from server");
    },
    FailTwoStep: ()=>{
      return new TwoStepPage(true);
    },
    TwoStepSuccess: ()=>{
      return new LobbyPage;
    },
    Maintainance: msg=>{
      return new ErrorHandler("Maintainance Alert: " + msg);
    },
    OK: ()=>{
      game.ready = true;
    }
  }
};

class Game{
  constructor(){
    this.socket = null;
    this.oldQuizUUID = "";
    this.name = "";
    this.streak = 0;
    this.ready = false;
    this.cid = "";
    this.pin = 0;
    this.score = 0;
    this.answers = [];
    this.quizEnded = true;
    this.total = 0;
    this.index = 0;
    this.end = {};
    this.two = [];
    this.errorTimeout = null;
    this.jumbleAnswer = [];
    this.multiAnswer = {
      0: false,
      1: false,
      2: false,
      3: false
    };
    this.theme = "Kahoot";
    this.opts = {};
    this.correctIndex = null;
    this.questionStarted = false;
    this.questionAnswered = false;
  }
  sendPin(pin){
    return new Promise((res)=>{
      this.pin = pin;
      grecaptcha.ready(()=>{
        grecaptcha.execute("6LcyeLEZAAAAAGlTegNXayibatWwSysprt2Fb22n",{action:"submit"}).then((token)=>{
          this.socket = new WebSocket(`${(location.protocol == "http:" ? "ws://" : "wss://")}${location.host}?token=${token}`);
          socket = this.socket;
          socket.onmessage = evt=>{
            evt = evt.data;
            let data = JSON.parse(evt);
            if(data.type == "Error"){
              return MessageHandler.Error[data.message](data.data);
            }
            eval(`MessageHandler.${data.type}("${data.message.replace(/\\/img,"\\\\").replace(/"/img,"\\\"")}")`);
          };
          socket.onclose = ()=>{
            new ErrorHandler("Session disconnected.");
            // attempt to reconnect
            activateLoading(true,true,"<br><br><br><br><p>Reconnecting</p>");
            let i = 0;
            function check(t){
              const x = new XMLHttpRequest();
              x.open("GET","/up");
              x.send();
              x.onerror = x.ontimeout = function(){
                if(++i > 10){
                  return location.href="https://theusaf.github.io/kahoot%20winner%20error.html";
                }
                t *= 2;
                if(t > 30){
                  t = 30;
                }
                setTimeout(function(){
                  check(t);
                },t * 1000);
              };
              x.onload = function(){
                if(x.status != 200 || !/^-?\d+ (hours|minutes) until expected reset.*$/.test(x.response)){
                  return x.onerror(t);
                }
                activateLoading(false,false);
                if(!game.quizEnded && game.pin[0] != "0"){
                  resetGame(true);
                }else{
                  resetGame();
                }
              };
            }
            check(0.5);
          };
          socket.onopen = ()=>{
            const a = setInterval(()=>{
              if(this.ready){
                res();
                send({type:"SET_PIN",message:pin});
                this.loadOptions();
                clearInterval(a);
              }
            },500);
          };
        });
      });
      activateLoading(true,true);
    });
  }
  join(name){
    this.name = name;
    send({type:"JOIN_GAME",message:name});
    activateLoading(true,true);
    this.handshakeTimeout = setTimeout(()=>{
      if(document.getElementById("handshake-fail-div")){
        document.getElementById("handshake-fail-div").outerHTML = "";
      }
      MessageHandler.Error.HANDSHAKE();
      let url;
      switch (detectPlatform()) {
      case "Windows":
        url = "https://www.mediafire.com/file/ju7sv43qn9pcio6/kahoot-win-win.zip/file";
        break;
      case "MacOS":
        url = "https://www.mediafire.com/file/bcvxlwlfvbswe62/Kahoot_Winner.dmg/file";
        break;
      default:
        url = "https://www.mediafire.com/file/zb5blm6a8dyrwtb/kahoot-win-linux.tar.gz/file";
      }
      const div = document.createElement("div");
      div.innerHTML = `<span>Hmm, we seem to be having trouble on our end. Try downloading our app!</span>
      <br>
      <a href="${url}" onclick="dataLayer.push({event:'download_app'})" target="_blank">Download App</a>`;
      div.className = "shortcut";
      div.id = "handshake-fail-div";
      div.style = `
        position: fixed;
        top: 4rem;
        z-index: 1000;
        width: 100%;
        color: white;
        background: #888;
        text-align: center;
        border-radius: 5rem;
      `;
      document.body.append(div);
    },10000);
  }
  getRandom(){
    dataLayer.push({event:"get_random_name"});
    send({type:"GET_RANDOM_NAME",message:"please?"});
  }
  saveOptions(){
    const settings = SettingDiv.querySelectorAll("input,select");
    const opts = {};
    for(let i = 0;i<settings.length;++i){
      opts[settings[i].id] = settings[i].type == "checkbox" ? settings[i].checked : settings[i].value;
    }
    localStorage.options = JSON.stringify({
      manual: opts.manual,
      timeout: opts.timeout,
      brute: opts.brute,
      fail: opts.fail,
      teamMembers: opts.teamMembers,
      theme: opts.theme,
      previewQuestion: opts.previewQuestion,
      searchLoosely: opts.searchLoosely,
      ChallengeDisableAutoplay: opts.ChallengeDisableAutoplay,
      div_game_options: opts.div_game_options,
      div_search_options: opts.div_search_options,
      div_challenge_options: opts.div_search_options
    });
    const oldOpts = game.opts;
    game.opts = opts;
    send({type:"SET_OPTS",message:JSON.stringify(opts)});
    if(game.questionStarted && !game.questionAnswered && oldOpts.manual && !game.opts.manual){
      send({type:"ANSWER_QUESTION",message:null});
    }
  }
  loadOptions(){
    let opts;
    try{
      opts = JSON.parse(localStorage.options);
      game.opts = opts;
    }catch(err){
      return;
    }
    if(!opts){
      return;
    }
    for(let i in opts){
      const elem = document.getElementById(i);
      if(elem.type == "checkbox"){
        elem.checked = opts[i];
      }else{
        elem.value = opts[i];
      }
    }
    if(socket && socket.readyState === 1){
      game.saveOptions();
      dataLayer.push(Object.assign({event:"load_options"},opts));
      return new ErrorHandler("Restored Options!",true);
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
    send({type:"ANSWER_QUESTION",message:num});
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
      send({type:"DO_TWO_STEP",message:JSON.stringify(this.two)});
      activateLoading(true,true,"");
      return;
    }
  }
  answerJ(list){
    let li = [];
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
    this.saveTimeout = setTimeout(this.saveOptions,500);
  }
}

function send(message){
  if(socket === null){
    return;
  }
  socket.send(JSON.stringify(message));
}

let game = new Game;
let egg = "";
const eggstyle = document.createElement("style");
eggstyle.innerHTML = `p,.sm span,img,h1,h2,.About h3,.tut_cont h3,h4{
  animation: infinite windance 1s;
}`;
window.addEventListener("load",()=>{
  game.loadOptions();
  game.theme = ThemeChooser.value;
  if(game.theme != "Kahoot"){
    new LoginPage;
  }
  if(game.theme == "Rainbow"){
    SettingDiv.className = "rainbow correct";
    document.querySelector(".About").className = "About rainbow";
  }
});
window.addEventListener("keydown",e=>{
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
    if("winner".search(egg) != 0){
      egg = "";
      try{
        document.body.removeChild(eggstyle);
      }catch(err){
        // meh
      }
    }else if(egg == "winner"){
      document.body.append(eggstyle);
    }
  }catch(err){
    egg = "";
  }
});

function detectPlatform(){
  let OSName = "Linux";
  if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
  if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
  if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
  if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
  return OSName;
}

localStorage.KW_Version = "v2.18.4";
const checkVersion = new XMLHttpRequest();
checkVersion.open("GET","/up");
checkVersion.send();
checkVersion.onload = function(){
  const version = checkVersion.response.split(": ")[1];
  const locVersion = localStorage.KW_Version || version;
  if(localStorage.KW_Update == "false"){
    return;
  }
  if(version != locVersion){
    const ask = document.createElement("div");
    ask.id = "UpdateDiv";
    ask.innerHTML = `<h2>A new update is available.</h2>
    <h4>Would you like to update now?</h4>
    <p>If this message keeps appearing, try hard refreshing your page or clearing your cache.</p>
    <button id="UpdateYes">Yes</button><button id="UpdateNo">Not Yet</button><br>
    <button onclick="localStorage.KW_Update = false;this.parentElement.outerHTML = '';">Disable update notification</button>`;
    document.body.append(ask);
    document.getElementById("UpdateYes").onclick = function(){
      if("serviceWorker" in navigator){
        document.getElementById("UpdateYes").innerHTML = "Please wait...";
        navigator.serviceWorker.getRegistrations().then(async function(registrations) {
          for(let registration of registrations) {
            await registration.unregister();
          }
          setTimeout(function(){
            localStorage.KW_Version = version;
            location.reload();
          },3000);
        }).catch(function() {
          document.getElementById("UpdateDiv").outerHTML = "";
          new ErrorHandler("There was an error forcing an update. Please clear or reload the page cache manually.");
        });
      }else{
        document.getElementById("UpdateDiv").outerHTML = "";
        new ErrorHandler("There was an error forcing an update. Please clear or reload the page cache manually.");
      }
    };
    document.getElementById("UpdateNo").onclick = function(){
      document.getElementById("UpdateDiv").outerHTML = "";
    };
  }
  if(!localStorage.KW_Version){
    localStorage.KW_Version = version;
  }
};
