/* global sleep, ErrorHandler, ChangelogSwitch, AboutSwitch, SettingSwitch, closePage, LoginPage, activateLoading, dataLayer, TwoStepPage, LobbyPage, resetGame, grecaptcha, SettingDiv, QuizEndPage, QuestionEndPage, QuestionSnarkPage, QuestionAnswererPage, GetReadyPage, QuizStartPage, LobbyPage, TutorialDiv, TimeUpPage, FeedbackPage, TeamTalkPage */
let socket = null;

// Navigation
if(location.pathname === "/" && localStorage.autoNavigatePage && localStorage.autoNavigatePage !== "en"){
  window.stop();
  location.pathname = localStorage.autoNavigatePage;
}

const MessageHandler = {
  Error: {
    INVALID_USER_INPUT: ()=>{
      console.log("WS Message ERR: §InvalidInput§");
      return;
    },
    INVALID_PIN: ()=>{
      resetGame();
      return new ErrorHandler("§InvalidPIN§");
    },
    MAX_SESSION_COUNT: ()=>{
      setTimeout(()=>{
        new ErrorHandler("§MaxIP§");
        activateLoading(true,true,"§MaxIP2§");
        setTimeout(()=>{
          resetGame();
        },30000);
      },5000);
    },
    INVALID_NAME: (err)=>{
      clearTimeout(game.handshakeTimeout);
      if(err.description !== "Duplicate name"){
        new ErrorHandler("§ConnectFail§: " + (err.description || err.error || err));
        return resetGame();
      }
      new ErrorHandler("§InvalidName§");
      return new LoginPage(true);
    },
    SESSION_NOT_CONNECTED: ()=>{
      new ErrorHandler("§NoReconnect§");
    },
    EMPTY_NAME: ()=>{
      new ErrorHandler("§EmptyName§");
    },
    HANDSHAKE: ()=>{
      clearTimeout(game.handshakeTimeout);
      new ErrorHandler("§Handshake§ ¯\\_(ツ)_/¯");
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
      div.innerHTML = `<span>§Handshake1§</span>
      <br>
      <a class="mobihide" href="${url}" onclick="dataLayer.push({event:'download_app'})" target="_blank">§DownloadApp§</a>
      <br>
      <button onclick="send({type:'HANDSHAKE_ISSUES',message:'AAAA!'});this.innerHTML = '§IssueReported§';this.onclick = null;dataLayer.push({event:'report_error'});" title="§IssueReported2§">§IssueReported3§</button>`;
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
    PRIVATE_ID: ()=>{
      new ErrorHandler("§InvalidUUID§");
    },
    SERVER_OVERLOADED: (data)=>{
      new ErrorHandler("§ServerOverloaded§ " + data);
      game.proxyRetry = data;
    },
    SERVER_TRANSFER: (data)=>{
      new ErrorHandler("Transferring to another server...");
      game.proxyRetry = data;
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
      }catch(e){/* No TutorialDiv? */}
      return new LoginPage(true);
    },
    JoinSuccess: data=>{
      if(game.theme === "Music"){game.playSound("/resource/music/lobby.m4a");}
      else if(game.theme === "Minecraft"){game.playSound("/resource/music/Minecraft.mp3");}
      data = JSON.parse(data);
      game.cid = data.cid;
      game.quizEnded = false;
      dataLayer.push({event:"join_game"});
      activateLoading(false,false);
      clearTimeout(game.handshakeTimeout);
      return new LobbyPage;
    },
    QuizStart: ()=>{
      try{game.music.pause();}catch(e){/* No music */}
      return new QuizStartPage;
    },
    QuestionGet: info=>{
      const data = JSON.parse(info);
      return new GetReadyPage(data);
    },
    QuestionBegin: question=>{
      game.questionAnswered = false;
      return new QuestionAnswererPage(JSON.parse(question));
    },
    QuestionSubmit: message=>{
      game.questionAnswered = true;
      return new QuestionSnarkPage(message);
    },
    QuestionEnd: info=>{
      try{game.music.pause();}catch(e){/* No music */}
      return new QuestionEndPage(info);
    },
    QuizFinish: info=>{
      game.quizEnded = true;
      game.end.info = JSON.parse(info);
      dataLayer.push(Object.assign({event:"quiz_finish"},JSON.parse(info)));
    },
    FinishText: text=>{
      if(game.theme === "Music"){game.playSound("/resource/music/podium.m4a");}
      else if(game.theme === "Minecraft"){game.playSound("/resource/music/Pigstep.m4a");}
      return new QuizEndPage(text);
    },
    QuizEnd: (r)=>{
      game.quizEnded = true;
      resetGame();
      return setTimeout(function(){new ErrorHandler("§QuizEnd§ " + "(" + r + ")");},300);
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
    },
    GameReset: ()=>{
      new LobbyPage;
      delete game.question;
      delete game.guesses;
      delete game.answers;
      delete game.rawData;
      delete game.ans;
      delete game.got_answers;
      game.index = 0;
      game.streak = 0;
      game.score = 0;
      game.quizEnded = false;
    },
    NameAccept: n=>{
      const data = JSON.parse(n);
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
      new TeamTalkPage(JSON.parse(data));
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
    this.panicSettings = null;
  }
  sendPin(pin,host){
    return new Promise((res)=>{
      this.pin = pin;
      grecaptcha.ready(()=>{
        grecaptcha.execute("6LcyeLEZAAAAAGlTegNXayibatWwSysprt2Fb22n",{action:"submit"}).then((token)=>{
          this.socket = new WebSocket(`${(location.protocol == "http:" ? "ws://" : "wss://")}${host || location.host}?token=${token}`);
          socket = this.socket;
          socket.onmessage = evt=>{
            evt = evt.data;
            const data = JSON.parse(evt);
            if(data.type == "Error"){
              return MessageHandler.Error[data.message](data.data);
            }
            eval(`MessageHandler.${data.type}("${data.message.replace(/\\/img,"\\\\").replace(/"/img,"\\\"")}")`);
          };
          socket.onclose = ()=>{
            game.disconnectTime = Date.now();
            if (!game.proxyRetry) {
              new ErrorHandler("Session disconnected.");
            }
            // attempt to reconnect
            activateLoading(true,true,"<br><br><br><br><p>Reconnecting</p>");
            let i = 0;
            function check(t){
              if(game.proxyRetry){
                return resetGame(game.proxyRetry);
              }
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
                if(x.status !== 200 && x.status !== 304){
                  return x.onerror(t);
                }
                activateLoading(false,false);
                if(game.proxyRetry){
                  resetGame(game.proxyRetry);
                }else if(!game.quizEnded && game.pin[0] != "0"){
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
        }).catch((err)=>{
          new ErrorHandler("Captcha failed: " + err);
          new LoginPage();
          activateLoading(false);
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
      new ErrorHandler("This is taking a long time. If this continues longer, you may need to try again.");
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
      div.innerHTML = `<span>§Handshake1§</span>
      <br>
      <a href="${url}" onclick="dataLayer.push({event:'download_app'})" target="_blank">§DownloadApp§</a>`;
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
    const settings = SettingDiv.querySelectorAll("input,select"),
      opts = {};
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
    const oldOpts = game.opts;
    game.theme = opts.theme;
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
      game.theme = opts.theme;
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
      game.saveOptions();
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
  socket.send(JSON.stringify(message));
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

function detectPlatform(){
  let OSName = "Linux";
  if (navigator.appVersion.indexOf("Win")!=-1) {OSName="Windows";}
  if (navigator.appVersion.indexOf("Mac")!=-1) {OSName="MacOS";}
  if (navigator.appVersion.indexOf("X11")!=-1) {OSName="UNIX";}
  if (navigator.appVersion.indexOf("Linux")!=-1) {OSName="Linux";}
  return OSName;
}

localStorage.KW_Version = "v5.2.0";
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
