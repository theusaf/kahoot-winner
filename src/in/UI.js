/* global game, dataLayer, socket, Game */
const AprilFoolsThemes = ["KonoSuba","ReZero","FRANXX"],
  AprilFoolTheme = AprilFoolsThemes[Math.floor(Math.random() * AprilFoolsThemes.length)],
  KahootThemes = {
    get Kahoot(){
      const today = new Date();
      if(today.getMonth() === 3 && today.getDate() <= 7){
        return KahootThemes[AprilFoolTheme];
      }else{
        return {
          red: "kahoot/red.svg",
          blue: "kahoot/blue.svg",
          green: "kahoot/green.svg",
          yellow: "kahoot/yellow.svg",
          get logo(){
            if(today.getMonth() >= 9 && today.getMonth() < 11){
            // fall!
              return "kahoot/logo-halloween.svg";
            }else if(today.getMonth() === 11){
            // winter!
              return "kahoot/logo-xmas.svg";
            }else{
              return "kahoot/logo.svg";
            }
          }
        };
      }
    },
    KonoSuba: {
      red: "konosuba/red.svg",
      blue: "konosuba/blue.svg",
      green: "konosuba/green.svg",
      yellow: "konosuba/yellow.svg",
      logo: "konosuba/logo.svg"
    },
    // rainbow doesn't actually change any images
    // but will be detected for to change css.
    get Rainbow(){
      return KahootThemes.Kahoot;
    },
    // music doesn't actually change any images
    // but will be detected to play music/sounds.
    get Music(){
      return KahootThemes.Kahoot;
    },
    FRANXX: {
      red: "franxx/red.svg",
      blue: "franxx/blue.svg",
      green: "franxx/green.svg",
      yellow: "franxx/yellow.svg",
      get logo(){
        return KahootThemes.Kahoot.logo;
      }
    },
    ReZero: {
      red: "rezero/red.svg",
      blue: "rezero/blue.svg",
      green: "rezero/green.svg",
      yellow: "rezero/yellow.svg",
      logo: "rezero/logo.svg"
    },
    // Also has music ("Minecraft", "Pigstep")
    Minecraft: {
      red: "minecraft/red.svg",
      blue: "minecraft/blue.svg",
      green: "minecraft/green.svg",
      yellow: "minecraft/yellow.svg",
      logo: "minecraft/logo.png"
    },
    Duck: {
      logo: "duck/logo.svg",
      red: "duck/red.svg",
      green: "duck/green.svg",
      blue: "duck/blue.svg",
      yellow: "duck/yellow.svg"
    }
  };

// Parts
function Element(name,options){
  const element = document.createElement(name);
  for(const i in (options || {})){
    element[i] = options[i];
  }
  return element;
}
function RemoveHandshakeFail(){
  if(document.getElementById("handshake-fail-div")){
    document.getElementById("handshake-fail-div").outerHTML = "";
  }
}
function NotFoundDiv(){
  const div = Element("div",{
      className: "ChallengeQuestion noQuiz"
    }),
    sp = Element("span");
  sp.innerHTML = `<input id="nameInput" placeholder="§EnterQuizName§" value="${document.getElementById("searchTerm").value.replace(/&/g,"&amp;").replace(/"/g,"&quot;") || ""}" oninput="document.getElementById('searchTerm').value = this.value;game.updateName();"></input>`;
  div.append(Element("br"),Element("br"),sp);
  return div;
}

// Pages
class LoginPage{
  constructor(i){
    document.body.className = "rainbow";
    Themer();
    QuizResult.className = "disabled button";
    QuizResult.removeAttribute("url");
    ChallengeContinueButton.style.display = "none";
    RemoveHandshakeFail();
    const div = clearUI();
    div.className = "Login";
    div.setAttribute("ui-event","Login");
    const logo = Element("img",{
        alt: "Kahoot logo",
        src: `/resource/img/game/theme/${KahootThemes[game.theme].logo}`
      }),
      logoText = Element("p",{
        id: "logotext",
        innerHTML: "WINNER",
        onclick: ()=>{
          logoText.style.display = "none";
        }
      }),
      pin = Element("input",{
        type: i ? "text" : "tel",
        id: "loginInput",
        placeholder: i ? "§Nickname§" : "§GamePIN§",
        onkeydown: i ? (e)=>{
          if(e.code === "Enter"){
            return game.join(pin.value);
          }
        } : (e)=>{
          if(e.code === "Enter"){
            return game.sendPin(pin.value);
          }
        }
      }),
      but = Element("button",{
        innerHTML: i ? "§OK§" : "§Enter§",
        id: "loginButton",
        onclick: i ? ()=>{
          return game.join(pin.value);
        } : ()=>{
          return game.sendPin(pin.value);
        }
      });
    if(i){
      try{document.getElementById("lang").outerHTML = "";}catch(e){/* Lang just doesn't exist. */}
      const rand = Element("button",{
        innerHTML: "§GetRandom§",
        onclick: ()=>{
          game.getRandom();
        }
      });
      rand.style.marginBottom = "0.5rem";
      div.append(logo,logoText,pin,rand,but);
      document.getElementsByClassName("grecaptcha-badge")[0].style.visibility = "hidden";
    }else{
      document.getElementById("div_challenge_options").parentElement.className = "";
      const abt = Element("label",{
          htmlFor: "about",
          innerHTML: "About",
          id: "abtlnk"
        }),
        bottomDiv = Element("div",{
          id: "chnge"
        }),
        changelog = Element("label",{
          htmlFor: "changelog",
          innerHTML: "Changelog"
        }),
        trademark = Element("span",{
          innerHTML: "§Trademark§"
        }),
        policy = Element("span",{
          innerHTML: "<a href=\"/privacy/\">§Privacy§</a> | <a href=\"/terms/\">§Terms§</a>"
        }),
        language = Element("div",{
          id: "lang"
        });
      language.innerHTML = `<label for="langToggle"><img src="/resource/img/site/language.svg"/></label>
      <input class="ch" id="langToggle" type="checkbox"/>
      <div class="lang">
        <button onclick="setCookie('en')">English</button>
        <button onclick="setCookie('es')">Español</button>
        <button onclick="setCookie('zh')">中文</button>
      </div>`;
      if(!document.getElementById("lang")){
        document.body.append(language);
      }
      bottomDiv.append(changelog,trademark,policy);
      div.append(logo,logoText,pin,but,abt,bottomDiv);
    }
    const social = Element("div",{
      className: "sm sidebar correct"
    });
    social.innerHTML = `<div class="mobihide2 mobihide">
    <a href="/creator" target="_blank"><img src="/resource/img/site/icon-kahoot.svg" alt="create"><span>§Creator§</span></a>
    <a href="/api" target="_blank"><img src="/resource/img/site/icon-api.svg" alt="api"><span>§API§</span></a>
    <a href="/blog" target="_blank"><img src="/resource/img/site/icon-blog.svg" alt="Icon made from http://www.onlinewebfonts.com/icon is licensed by CC BY 3.0"><span>§Blog§</span></a>
    <a href="/blog/download" target="_blank" class="mobihide2 mobihide"><img src="/resource/img/site/icon192.png" alt="download mark"><span>§AppDownload§</span></a>
    </div>
    <a href="https://discord.gg/58SHzC2" target="_blank"><img src="/resource/img/site/logo-discord.svg" alt="discord"><span>Discord</span></a>
    <a href="https://twitter.com/theusafyt" target="_blank"><img src="/resource/img/site/logo-twitter.svg" alt="twitter"><span>Twitter</span></a>
    <a href="https://www.facebook.com/theusafmc" target="_blank"><img src="/resource/img/site/logo-fbook.svg" alt="facebook"><span>Facebook</span></a>`;
    if(!i){div.append(social);}
    UIDiv.append(div);
  }
}
class TwoStepPage{
  constructor(state){
    if(!state){
      new ErrorHandler("2 Step Auth Required");
    }else{
      new ErrorHandler("2 Step Auth Failed.");
    }
    const objects = new LobbyPage;
    objects.mid.innerHTML = "";
    objects.main.setAttribute("ui-event","TwoFactorAuth");
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "purple";
    const pin = Element("p",{
      innerHTML: "PIN: " + game.pin
    });
    objects.top.append(pin);
    const div = Element("div",{
        className: "Answers"
      }),
      r = Element("img",{
        src: `/resource/img/game/theme/${KahootThemes[game.theme].red}`,
        alt: "Red",
        onclick: ()=>{
          game.answer2(0,r);
        }
      }),
      b = Element("img",{
        src: `/resource/img/game/theme/${KahootThemes[game.theme].blue}`,
        alt: "Blue",
        onclick: ()=>{
          game.answer2(1,b);
        }
      }),
      g = Element("img",{
        src: `/resource/img/game/theme/${KahootThemes[game.theme].green}`,
        alt: "Green",
        onclick: ()=>{
          game.answer2(3,g);
        }
      }),
      y = Element("img",{
        src: `/resource/img/game/theme/${KahootThemes[game.theme].yellow}`,
        alt: "Yellow",
        onclick: ()=>{
          game.answer2(2,y);
        }
      });
    div.append(r,b,y,g);
    objects.main.append(div);
    if(state){
      activateLoading(false,true);
    }
  }
}
class ErrorHandler{
  constructor(error,options){
    options = options || {};
    const ErrDiv = Element("div",{
        className: options.isNotice ? "NotError" : "",
        onclick: options.onclick ? (e)=>{
          options.onclick(e,ErrDiv);
        } : null
      }),
      notice = Element("span",{
        innerHTML: error
      }),
      close = Element("span",{
        innerHTML: "X",
        onclick: (e)=>{
          ErrDiv.outerHTML = "";
          e.preventDefault();
          e.stopPropagation();
        },
        className: "ErrorCloser"
      });
    ErrDiv.append(notice,close);
    UIError.insertBefore(ErrDiv,UIError.querySelector("div"));
    let time = 7e3;
    if(ErrDiv.onclick){
      time = 30e3;
      ErrDiv.className += " Clickable";
    }
    if(options.time){
      time = options.time;
    }
    if(options.permanent){
      return;
    }
    setTimeout(()=>{
      ErrDiv.style.opacity = 0;
      setTimeout(()=>{
        try{ErrDiv.outerHTML = "";}catch(e){/* gone */}
      },1e3);
    },time);
  }
}
class LobbyPage{
  constructor(){
    try{document.getElementById("lang").outerHTML="";}catch(e){/* lang doesnt exist */}
    RemoveHandshakeFail();
    window.onbeforeunload = function(e){
      e.returnValue = "§LeavePrompt§";
    };
    document.querySelector(".ad-container").style.display = "none";
    document.querySelector(".ad-container-2").style.display = "none";
    if(game.pin[0] === "0" && game.opts.ChallengeDisableAutoplay){
      ChallengeContinueButton.style.display = "";
    }
    const div = clearUI();
    div.className = "lobby";
    div.setAttribute("ui-event","Lobby");
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "green";
    const pinDiv = Element("div",{
        id: "L1",
        className: "extra"
      }),
      nameDiv = Element("div",{
        id: "L2",
        className: "extra"
      });
    if(game.theme == "Rainbow"){
      pinDiv.className = "extra rainbow";
    }
    const nameText = Element("p",{
        innerText: game.name
      }),
      text = Element("h1",{
        className: "shadow",
        innerHTML: "§YoureIn§"
      }),
      subtext = Element("h2",{
        innerHTML: "§YoureIn2§",
        className: "shadow"
      }),
      mid = Element("div",{
        id: "UIMid"
      }),
      subcont = Element("div");
    text.setAttribute("text","§YoureIn§");
    subtext.setAttribute("text","§YoureIn2§");
    nameDiv.append(nameText);
    subcont.append(text,subtext);
    mid.append(subcont);
    div.append(pinDiv,nameDiv,mid);
    if(game.guesses.length === 0){
      div.append(NotFoundDiv());
    }
    UIDiv.append(div);
    return {
      main: div,
      top: pinDiv,
      mid,
      bottom: nameDiv
    };
  }
}
class GetReadyPage{
  constructor(question,no){
    game.recievedTime = Date.now();
    game.questionStarted = false;
    game.isAnswerPage = false;
    game.jumbleAnswer = [];
    game.question = question;
    if(game.guesses.length){
      const index = (+game.opts.searchLoosely && game.correctIndex) || game.index;
      game.answers = game.guesses[0].questions[index].choices || [{correct:false,answer:""},{correct:false,answer:""},{correct:false,answer:""},{correct:false,answer:""}];
    }else{
      game.answers = [{correct:false,answer:""},{correct:false,answer:""},{correct:false,answer:""},{correct:false,answer:""}];
    }
    const objects = new LobbyPage;
    try {
      document.querySelector(".noQuiz").outerHTML = "";
    } catch (e) {/* nothing to remove */}
    ChallengeContinueButton.style.display = "none";
    document.body.className = "blue";
    objects.main.setAttribute("ui-event","GetReady");
    objects.mid.innerHTML = "";
    const quest = Element("h1",{
      innerHTML: `§Question§ ${(question.questionIndex || 0) + 1}`,
      className: "shadow"
    });
    quest.setAttribute("text",quest.innerText);
    game.ans = question.quizQuestionAnswers;
    const timeinfo = {
      time: question.timeAvailable || 20000
    };
    if(game.guesses.length >= 1){
      QuizResult.className = "button";
      QuizResult.setAttribute("url",`https://create.kahoot.it/details/${game.guesses[0].uuid}`);
    }else{
      QuizResult.className = "disabled button";
      QuizResult.removeAttribute("url");
    }
    // In BETA
    if(document.getElementById("timeout_custom_1").value !== ""){
      const time = calculateTimeout(Number(document.getElementById("timeout_custom_1").value),timeinfo.time,0);
      document.getElementById("timeout").value = time / 1000;
      game.saveOptions();
    }else if(document.getElementById("timeout_custom_2").value !== ""){
      // doesnt take into account point multipliers
      const val = Number(document.getElementById("timeout_custom_2").value) - game.score,
        remaining = game.total - game.index, // remaining questions
        min = 500; // Kahoot removed streak bonus, so min score is now a constant 500.
      let time = 0;
      if(val / remaining < min){
        time = timeinfo.time + 500; // aka dont answer question
      }else{
        time = calculateTimeout(val / remaining,timeinfo.time,game.streak);
      }
      document.getElementById("timeout").value = time / 1000;
      game.saveOptions();
    }
    if(game.guesses && game.guesses.length && game.guesses[0].uuid !== game.oldQuizUUID){
      game.oldQuizUUID = game.guesses[0].uuid;
      dataLayer.push({
        event: "find_quiz",
        value: game.oldQuizUUID
      });
    }
    const readything = Element("h2",{
      innerHTML: "§Ready§",
      className: "shadow"
    });
    readything.setAttribute("text","§Ready§");
    const score = Element("p",{
        innerHTML: "" + game.score,
        className: "dark"
      }),
      typedefs = {
        quiz: "§TypeQuiz§",
        open_ended: "§TypeOpenEnded§",
        survey: "§TypeSurvey§",
        jumble: "§TypeJumble§",
        word_cloud: "§TypeWordCloud§",
        content: "§TypeContent§",
        multiple_select_poll: "§TypeSurvey§",
        multiple_select_quiz: "§TypeQuiz§",
        brainstorming: "§TypeBrainstorm§"
      },
      qoft = Element("p",{
        innerHTML: `${game.index + 1} §Of§ ${game.total}`
      }),
      typeimg = Element("img",{
        alt: "",
        src: `/resource/img/game/type/${question.gameBlockType}.svg`
      }),
      typetext = Element("span",{
        innerHTML: typedefs[question.gameBlockType]
      }),
      typediv = Element("div",{
        id: "quizTypeImage"
      });
    if(question.gameBlockType === "multiple_select_quiz"){
      typeimg.src = "/resource/img/game/type/quiz.svg";
    }else if(question.gameBlockType === "multiple_select_poll"){
      typeimg.src = "/resource/img/game/type/survey.svg";
    }else if(question.gameBlockType === "quiz" && game.gameBlockLayout === "TRUE_FALSE"){
      typeimg.src = "/resource/img/game/type/true_false.svg";
      typetext.innerHTML = "§TypeTrueFalse§";
    }
    typediv.append(typeimg,typetext);
    objects.top.append(qoft,typediv);
    objects.bottom.append(score);
    if(question.gameBlockType == "content"){
      document.body.className = "blue2";
      const bdiv = Element("div"),
        breather = Element("h1",{
          innerHTML: "§Breather§",
          className: "shadow"
        });
      breather.setAttribute("text","§Breather§");
      const noanswer = Element("h2",{
        innerHTML: "§Breather2§",
        className: "shadow"
      });
      noanswer.setAttribute("text","§Breather2§");
      const img = Element("img",{
        src: "/resource/img/game/icon/content-slide.svg",
        id: "ContentImage"
      });
      bdiv.append(breather,img,noanswer);
      objects.mid.append(bdiv);
      return objects;
    }
    if(no){
      return objects;
    }
    const timer = Element("h2",{
        id: "timer",
        innerHTML: question.timeLeft || "5"
      }),
      mcont = Element("div"),
      ncont = Element("div"),
      spinimg = Element("img",{
        src: "/resource/img/game/icon/load-large.svg",
        className: "load_circle",
        alt: "load_circle"
      });
    ncont.append(spinimg,timer);
    mcont.append(quest,ncont,readything);
    objects.mid.append(mcont);
    let secs = question.timeLeft || 5;
    const int = setInterval(()=>{
      try{
        if(--secs < 0){
          clearInterval(int);
        }else{
          timer.innerHTML = secs;
          readything.innerHTML = ["§Go§","§Set§","§Ready§"][secs >= 3 ? 2 : secs];
          readything.setAttribute("text",readything.innerText);
        }
      }catch(err){
        clearInterval(int);
      }
    },1000);
    if(+game.opts.searchLoosely){
      if(+game.opts.searchLoosely === 2){
        const next = Element("div",{
          innerHTML: "<span>§Ready2§</span>",
          className: "next"
        });
        next.addEventListener("click",()=>{
          next.innerHTML = "<span>§Waiting§</span>";
          next.className = "faded next";
          function start(){
            if(game.questionStarted){
              return new QuestionAnswererPage;
            }else{
              setTimeout(function(){
                start();
              },500);
            }
          }
          start();
        });
        objects.main.append(next);
      }
      activateLoading(false,false);
      clearInterval(int);
      timer.outerHTML = "";
      mcont.outerHTML = "";
      if(game.guesses.length == 0){
        objects.main.append(NotFoundDiv());
      }else{
        const as = game.guesses[0].questions,
          qs = [];
        for(let i = 0; i < as.length; i++){
          if(as[i].type == question.gameBlockType && (as[i].layout == question.gameBlockLayout || !as[i].layout) && ((typeof as[i].choices === "object" && as[i].choices.length) || null) == game.ans[game.index]){
            // answer filter
            let add = true,
              add2 = 0;
            const ca = game.got_answers.slice(0);
            for(let j = 0; j < ca.length; j++){
              function chfilter(ch){
                const {text,isCorrect:correct,type,choice} = ca[j];
                switch(type){
                  case "quiz":{
                    if(choice === null || typeof choice === "undefined"){
                      return false;
                    }
                    return text === ch.answer && ch.correct === correct;
                  }
                  case "open_ended":{
                    if(!correct){
                      return false;
                    }
                    return text === ch.answer && ch.correct;
                  }
                  case "jumble":
                  case "multiple_select_poll":
                  case "multiple_select_quiz":{
                    const texts = text.split("|");
                    if(texts.includes(choice.answer || "")){
                      return true;
                    }
                    return false;
                  }
                  default:{
                    return text === ch.answer && ch.correct === correct;
                  }
                }
              }
              if(as[i].choices){
                // find all used options. true = there is a used
                if(as[i].choices.filter(chfilter).length){
                  add = false;
                  // find how many questions have duplicate answers
                  for(let k = 0;k < as.length;k++){
                    if(as[k].choices.filter(chfilter).length){
                      add2++;
                    }
                  }
                  break;
                }
              }
            }
            if(!add && add2 === 1){
              continue;
            }
            qs.push({
              i: i,
              q: as[i]
            });
          }
        }
        const inp = Element("input",{
            className: "looseInput",
            placeholder: "§Question§"
          }),
          cont = Element("div",{
            className: "looseDiv"
          }),
          qdiv = Element("div",{
            className: "looseOptions"
          }),
          filter = (search)=>{
            qdiv.innerHTML = "";
            let f = false;
            for(let i = 0; i < qs.length; i++){
              const qtext = qs[i].q.question || qs[i].q.title,
                regex = /<\/?[ib]>|[^a-z0-9\s]/gmi,
                smallRegex = /<\/?[ib]>/gmi,
                text = qtext.replace(regex," ").replace(/\s+/gm," ");
              function escape(input){
                input = input.replace(/\[/gm,"\\[");
                input = input.replace(/\(/gm,"\\(");
                input = input.replace(/\{/gm,"\\{");
                input = input.replace(/\*/gm,"\\*");
                input = input.replace(/\+/gm,"\\+");
                input = input.replace(/\?/gm,"\\?");
                input = input.replace(/\|/gm,"\\|");
                input = input.replace(/\^/gm,"\\^");
                input = input.replace(/\$/gm,"\\$");
                input = input.replace(/\./gm,"\\.");
                input = input.replace(/\\/gm,"\\\\");
                return input;
              }
              // pure alphanumeric
              const match = text.match(new RegExp(search.replace(regex," ").replace(/\s+/gm," "),"gmi")),
                // all characters
                match2 = qtext.replace(smallRegex,"").match(new RegExp(escape(search.replace(smallRegex,"")),"gmi")),
                // pure alphanumeric, except having no spaces.
                match3 = qtext.replace(regex,"").match(new RegExp(search.replace(regex,""),"gmi"));
              if(match || match2 || match3){
                if(!f){
                  if(game.correctIndex === qs[i].i){
                    f = true;
                  }else{
                    game.correctIndex = qs[i].i;
                    game.answers = game.guesses[0].questions[qs[i].i].choices;
                    f = true;
                  }
                }
                const m = match || match2 || match3,
                  // add the element
                  elem = Element("p");
                let parsed = qtext;
                for(let j = 0;j<m.length;j++){
                  parsed = qtext.replace(m[j],"<b>" + m[j] + "</b>");
                }
                elem.innerHTML = parsed;
                elem.addEventListener("click",()=>{
                  game.correctIndex = qs[i].i;
                  game.answers = game.guesses[0].questions[qs[i].i].choices;
                  game.ans[game.index] = game.question.data ? game.question.data.length : 4;
                  Array.from(qdiv.children).forEach((item) => {
                    item.className = "";
                  });
                  elem.className = "looseChoice";
                });
                if(qdiv.children.length === 0){
                  elem.className = "looseChoice";
                }
                qdiv.append(elem);
              }
            }
          };
        filter("");
        cont.append(inp,qdiv);
        objects.main.append(cont);
        inp.addEventListener("input",()=>{
          filter(inp.value);
        });
        inp.focus();
      }
    }else if(game.opts.previewQuestion){
      activateLoading(false,false);
      clearInterval(int);
      timer.outerHTML = "";
      mcont.outerHTML = "";
      const chdiv = Element("div",{
          className: "ChallengeQuestion"
        }),
        sp = Element("span");
      if(game.guesses.length == 0){
        chdiv.className = "ChallengeQuestion noQuiz";
        sp.innerHTML = `<input id="nameInput" placeholder="§EnterQuizName§" value="${document.getElementById("searchTerm").value.replace(/&/g,"&amp;").replace(/"/g,"&quot;") || ""}" oninput="document.getElementById('searchTerm').value = this.value;game.updateName();"></input><a href="https://kahoot-win.com/blog/quiz-not-found" target="_blank" class="error-info">[?]</a>`;
      }else{
        sp.innerHTML = "§Question§: " + (game.guesses[0].questions[game.index].question || game.guesses[0].questions[game.index].title);
      }
      chdiv.append(Element("br"),Element("br"),sp);
      const adiv = Element("div",{
          className: "questionPreviewAnswers",
          innerHTML: "<h4>§CorrectAnswers§</h4>"
        }),
        co = [];
      for(const i in game.answers){
        if(game.answers[i].correct){
          co.push(i);
        }
      }
      for(const i in co){
        const cols = ["red","blue","yellow","green"],
          template = Element("template");
        template.innerHTML = `<div class="${game.answers[co[i]].correct ? "correct" : ""}">
          <img class="icon${cols[co[i]]}" src="/resource/img/game/theme/${KahootThemes[game.theme][cols[co[i]]]}" alt="answer choice icon">
          <span>${game.answers[co[i]].answer}</span>
        </div>`;
        adiv.append(template.content.cloneNode(true));
      }
      // insert correct answer items
      objects.main.append(adiv);
      objects.main.append(chdiv);
    }else if(game.guesses.length == 0){
      objects.main.append(NotFoundDiv());
    }
    if(game.opts.fail == 2){
      // add choice thingy
      const choiceDiv = Element("div",{
          className: "failChoice"
        }),
        yes = Element("input",{
          type: "radio",
          name: "fail",
          id: "fail1"
        }),
        no = Element("input",{
          type: "radio",
          name: "fail",
          id: "fail2",
          checked: true
        }),
        yesl = Element("label",{
          htmlFor: "fail1",
          innerHTML: "&nbsp;§DoFail§&nbsp;"
        }),
        nol = Element("label",{
          htmlFor: "fail2",
          innerHTML: "§NoFail§"
        });
      choiceDiv.append(yes,yesl,no,nol);
      objects.main.append(choiceDiv);
      function sendFail(){
        setTimeout(()=>{ // prevent weird sync issues
          game.fails[game.index] = yes.checked;
        },10);
      }
      yesl.onclick = nol.onclick = sendFail;
    }
    return objects;
  }
}
class QuizStartPage{
  constructor(){
    const objects = new LobbyPage;
    ChallengeContinueButton.style.display = "none";
    objects.main.setAttribute("ui-event","QuizStart");
    objects.mid.innerHTML = "";
    const text1 = Element("h1",{
      innerHTML: "§GetReady§",
      className: "shadow"
    });
    text1.setAttribute("text","§GetReady§");
    const text2 = Element("h2",{
      innerHTML: "§Loading§",
      className: "shadow"
    });
    text2.setAttribute("text","§Loading§");
    const img = Element("img",{
        src: "/resource/img/game/icon/load-hole.svg",
        alt: "loading...",
        className: "load_circle"
      }),
      cont = Element("div");
    cont.append(text1,img,text2);
    objects.mid.append(cont);
    document.body.className = "purple2";
  }
}
class QuestionAnswererPage{
  constructor(question){
    if(game.isAnswerPage === true){
      return game.isAnswerPage = false;
    }
    ChallengeContinueButton.style.display = "none";
    if(game.opts.searchLoosely == 2 && !game.questionStarted){
      game.questionStarted = true;
      return;
    }else if(game.opts.searchLoosely == 2 && !game.opts.manual){
      setTimeout(()=>{
        game.answerQuestion(null);
      },(+game.opts.timeout * 1000) - (Date.now() - game.recievedTime));
    }
    const objects = new GetReadyPage(question || game.question,true);
    objects.main.setAttribute("ui-event","QuestionAnswer");
    game.receivedQuestion = true;
    game.questionStarted = true;
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "";
    objects.mid.innerHTML = "";
    // content slides
    if(game.question.type == "content"){
      document.body.className = "blue2";
      const bdiv = Element("div"),
        breather = Element("h1",{
          innerHTML: "§Breather§",
          className: "shadow"
        });
      breather.setAttribute("text","§Breather§");
      const noanswer = Element("h2",{
        innerHTML: "§Breather2§",
        className: "shadow"
      });
      noanswer.setAttribute("text","§Breather2§");
      const img = Element("img",{
        src: "/resource/img/game/icon/content-slide.svg",
        id: "ContentImage"
      });
      bdiv.append(breather,img,noanswer);
      objects.mid.append(bdiv);
      return;
    }
    const div = Element("div",{
      className: "Answers"
    });
    // add open_ended support here
    if(game.question.type == "open_ended" || game.question.type == "word_cloud"){
      const answer = game.answers.filter(o=>{
          return o.correct;
        })[0],
        input = Element("input",{
          className: "openended",
          placeholder: answer ? answer.answer : "",
          onkeydown: (e)=>{
            if(e.code === "Enter"){
              game.answerQuestion(input.value || null);
            }
          }
        }),
        button = Element("div",{
          onclick: ()=>{
            game.answer(input.value);
          },
          innerHTML: "Submit"
        }),
        cont = Element("div",{
          style: "margin: auto;"
        });
      if(HideAnswers.checked){
        input.placeholder = "";
      }
      cont.append(input,button);
      div.append(cont);
      objects.main.append(div);
      input.focus();
      activateLoading(false,!document.getElementById("manual").checked);
    }else{
      const r = Element("img",{
          src: `/resource/img/game/theme/${KahootThemes[game.theme].red}`,
          alt: "Red"
        }),
        b = Element("img",{
          src: `/resource/img/game/theme/${KahootThemes[game.theme].blue}`,
          alt: "Blue"
        }),
        g = Element("img",{
          src: `/resource/img/game/theme/${KahootThemes[game.theme].green}`,
          alt: "Green"
        }),
        y = Element("img",{
          src: `/resource/img/game/theme/${KahootThemes[game.theme].yellow}`,
          alt: "Yellow"
        }),
        items = [r,b,y,g],
        repeats = game.ans[game.index];
      for(let i = 0;i < repeats;i++){
        items[i].setAttribute("draggable","false");
        div.append(items[i]);
      }
      if(game.ans[game.index] == 2){
        r.style.maxHeight = "100%";
        b.style.maxHeight = "100%";
        if(game.question.gameBlockLayout == "TRUE_FALSE"){
          r.setAttribute("css","layout-tfb");
          b.setAttribute("css","layout-tfr");
          r.src = b.src = `/resource/img/game/theme/${KahootThemes[game.theme].blue}`;
          b.src = `/resource/img/game/theme/${KahootThemes[game.theme].red}`;
        }
      }
      objects.main.append(div);
      activateLoading(false,!document.getElementById("manual").checked);
      // add jumble support here
      // TODO: Update to match Kahoot's Jumble UI
      if(game.question.type == "jumble"){
        function rearrange(e,a){
          const info = [];
          // get all sides
          let offset = 0,
            currentIndex = 0;
          for(let i = 0;i<a.length;i++){
            if(a[i].style.visibility === "hidden"){
              currentIndex = i;
            }
            const data = a[i].getBoundingClientRect();
            offset = data.width / 2 - 16;
            info.push([
              data.x,
              data.x + data.width
            ]);
          }
          // check which is closest
          const x = (e.x || e.touches[0].clientX) + offset;
          let closestIndex = 0,
            closestValue = Infinity;
          for(let i = 0;i<info.length;i++){
            if(Math.abs(x - info[i][0]) < closestValue){
              closestValue = Math.abs(x - info[i][0]);
              closestIndex = i;
            }
            if(Math.abs(x - info[i][1]) < closestValue){
              closestValue = Math.abs(x - info[i][1]);
              closestIndex = i;
            }
          }
          if(a[closestIndex].style.visibility !== "hidden"){
            // swap
            if(currentIndex > closestIndex){
              div.insertBefore(a[currentIndex],a[closestIndex]);
            }else{
              div.insertBefore(a[currentIndex],a[closestIndex].nextSibling);
            }
          }
        }
        function createClone(el,evt){
          const copy = el.cloneNode(true);
          div.append(copy);
          copy.style.left = (evt.x || evt.touches[0].clientX) + "px";
          el.style.visibility = "hidden";
          copy.className = "draggable";
          const mousemove = function(e){
              copy.style.left = ((e.x || e.touches[0].clientX) - 16) + "px";
              rearrange(e,div.querySelectorAll("img.jumble"));
            },
            mouseup = function(){
              copy.outerHTML = "";
              el.style.visibility = "";
              window.removeEventListener("mousemove",mousemove);
              window.removeEventListener("touchmove",mousemove);
              window.removeEventListener("mouseup",mouseup);
              window.removeEventListener("touchend",mouseup);
            };
          window.addEventListener("mousemove",mousemove);
          window.addEventListener("touchmove",mousemove);
          window.addEventListener("mouseup",mouseup);
          window.addEventListener("touchend",mouseup);
        }
        [r,b,y,g].forEach((e,i)=>{
          e.className = "jumble";
          e.setAttribute("index",i);
          const prep = function(event){
            createClone(e,event);
          };
          e.addEventListener("touchstart",prep);
          e.addEventListener("mousedown",prep);
        });
        div.className = "Answers jumble";
        const submitter = Element("div",{
            className: "AnswerOptions"
          }),
          ok = Element("img",{
            src: "/resource/img/game/icon/check.svg",
            onclick: ()=>{
              game.answerJ(div.querySelectorAll("img.jumble"));
            }
          }),
          reset = Element("img",{
            src: "/resource/img/game/icon/reset.svg",
            onclick: ()=>{
              game.jumbleAnswer = [];
              new QuestionAnswererPage;
            }
          });
        submitter.append(ok,reset);
        div.append(submitter);
      }else if(game.question.type == "multiple_select_quiz" || game.question.type == "multiple_select_poll"){
        game.multiAnswer = {
          0: false,
          1: false,
          2: false,
          3: false
        };
        r.onclick = ()=>{game.answerM(0,r);};
        b.onclick = ()=>{game.answerM(1,b);};
        y.onclick = ()=>{game.answerM(2,y);};
        g.onclick = ()=>{game.answerM(3,g);};
        const submitter = Element("div",{
            className: "AnswerOptions"
          }),
          ok = Element("img",{
            src: "/resource/img/game/icon/check.svg",
            onclick: ()=>{
              const tmp = [];
              for(const i in game.multiAnswer){
                if(game.multiAnswer[i]){
                  tmp.push(Number(i));
                }
              }
              game.answer(tmp);
            }
          }),
          reset = Element("img",{
            src: "/resource/img/game/icon/reset.svg",
            onclick: ()=>{
              game.multiAnswer = {
                0: false,
                1: false,
                2: false,
                3: false
              };
              new QuestionAnswererPage;
            }
          });
        submitter.append(ok,reset);
        div.append(submitter);
      }else{
        r.onclick = ()=>{game.answer(0);};
        b.onclick = ()=>{game.answer(1);};
        y.onclick = ()=>{game.answer(2);};
        g.onclick = ()=>{game.answer(3);};
      }
      if(HideAnswers.checked && game.pin[0] != "0"){
        return;
      }
      const textDiv = Element("div",{
        className: "textAnswer"
      });
      div.append(textDiv);
      for(let i = 0;i < game.answers.length;i++){
        // image support
        if(game.answers[i].image){
          items[i].style.backgroundRepeat = "no-repeat";
          items[i].style.backgroundSize = "50% 50%";
          items[i].style.backgroundPosition = "50% 50%";
          items[i].style.backgroundImage = "url(https://media.kahoot.it/" + game.answers[i].image.id + ")";
          items[i].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        }
        // correct
        if(game.answers[i].correct){
          items[i].className = (game.question.type === "jumble" ? "jumble " : "") + "correct";
        }
        // setting text
        const text = Element("p");
        if(typeof(game.answers[i].answer) == "undefined"){
          text.innerHTML = "";
        }else{
          text.innerHTML = (game.question.type === "jumble" ? (i+1)+". " : "") + game.answers[i].answer;
        }
        textDiv.append(text);
      }
    }
    // music
    try{
      if(game.theme === "Music"){
        if(question.timeAvailable <= 5000){
          const sounds = ["005","005-1"];
          game.playSound(`/resource/music/${sounds[Math.floor(Math.random() * sounds.length)]}.m4a`);
        }else if(question.timeAvailable <= 10000){
          game.playSound("/resource/music/010.m4a");
        }else if(question.timeAvailable <= 20000){
          const sounds = ["020","020-1","020-2"];
          game.playSound(`/resource/music/${sounds[Math.floor(Math.random() * sounds.length)]}.m4a`);
        }else if(question.timeAvailable <= 30000){
          game.playSound("/resource/music/030.m4a");
        }else if(question.timeAvailable <= 60000){
          game.playSound("/resource/music/060.m4a");
        }else{ // currently missing 90s and 240s assets
          const sounds = ["120","120-1"];
          game.playSound(`/resource/music/${sounds[Math.floor(Math.random() * sounds.length)]}.m4a`);
        }
      }
    }catch(e){
      console.warn("[MUSIC] - Failed to play.\n" + e);
    }
    // challenge
    if(game.pin[0] === "0"){
      const chdiv = Element("div",{
          className: "ChallengeQuestion"
        }),
        sp = Element("span",{
          innerHTML: game.question.question || game.question.title
        });
      chdiv.append(sp);
      div.append(chdiv);
      // create timer
      if(game.opts.ChallengeDisableTimer){
        return;
      }
      let questionTime = question.timeAvailable / 1000;
      const qdiv = Element("p",{
          className: "chtimer",
          innerHTML: questionTime
        }),
        chtimer = setInterval(()=>{
          qdiv.innerHTML = --questionTime;
          if(!qdiv.isConnected){
            clearInterval(chtimer);
          }
        },1000);
      objects.bottom.prepend(qdiv);
    }else if(game.guesses.length === 0){
      objects.main.append(NotFoundDiv());
    }
  }
}
class QuestionSnarkPage{
  constructor(text){
    const stuff = new GetReadyPage(game.question,true);
    stuff.main.setAttribute("ui-event","Answered");
    document.body.className = "rainbow";
    ChallengeContinueButton.style.display = "none";
    stuff.top.querySelector("div").outerHTML = "";
    const snark = Element("h2",{
      innerHTML: text
    });
    snark.setAttribute("text",snark.innerText);
    const div = Element("div"),
      img = Element("img",{
        src: "/resource/img/game/icon/load-hole.svg",
        className: "load_circle"
      });
    div.append(snark,img);
    stuff.mid.append(div);
    if(game.guesses.length === 0){
      stuff.main.append(NotFoundDiv());
    }
    activateLoading(false,false,"",false);
  }
}
class QuestionEndPage{
  constructor(info){
    if(typeof info.choice === "undefined"){
      return new TimeUpPage(info);
    }
    game.isAnswerPage = false;
    const objects = new GetReadyPage(game.question || info,true);
    objects.main.setAttribute("ui-event","QuestionEnd");
    if(game.pin[0] === "0" && game.opts.ChallengeDisableAutoplay){
      ChallengeContinueButton.style.display = "";
    }else if(game.guesses.length === 0){
      objects.main.append(NotFoundDiv());
    }
    objects.mid.innerHTML = "";
    document.body.className = info.isCorrect ? "green" : "red";
    objects.bottom.querySelector(".dark").innerHTML = info.totalScore;
    game.gotWrong = !info.isCorrect;
    game.lastQuestionType = info.type;
    const correct = Element("h1",{
      innerHTML: info.isCorrect ? "§Correct§" : "§Incorrect§",
      className: "shadow"
    });
    correct.setAttribute("text",correct.innerText);
    const rank = Element("h2",{
      innerHTML: `§YouIn§ ${(info.rank || 0)}${info.rank == 1 ? "st" : info.rank == 2 ? "nd" : info.rank == 3 ? "rd" : "th"} §Place§`,
      className: "shadow"
    });
    rank.setAttribute("text",rank.innerText);
    const nemesis = Element("h2",{
      className: "shadow"
    });
    try{
      nemesis.innerHTML = info.nemesis.name.replace(/</gm,"&lt;") ? `Just ${info.nemesis.totalScore - info.totalScore} from ${info.nemesis.name}` : "";
      nemesis.setAttribute("text",nemesis.innerHTML);
    }catch(e){/* No nemesis */}
    const correctMark = Element("img",{
        id: "correctMark",
        src: info.isCorrect ? "/resource/img/game/icon/check.svg" : "/resource/img/game/icon/cross.svg"
      }),
      pointsEarned = Element("h3",{
        innerHTML: info.isCorrect ? "+" + (info.points + info.pointsData.answerStreakPoints.streakBonus) : "§KeepTrying§",
        className: "shadow"
      }),
      streakImage = Element("img",{
        src: "/resource/img/game/icon/fire.svg"
      }),
      streakImageContainer = Element("div",{
        id: "streakImage"
      }),
      di = Element("div"),
      tx = Element("h2",{
        innerHTML: "§AnswerStreak§",
        className: "shadow",
        style: "display: inline-block; font-size: 1.5rem; margin: 0"
      });
    tx.setAttribute("text","§AnswerStreak§");
    di.style.position = "relative";
    di.append(tx);
    const st = Element("p",{
      innerHTML: info.pointsData.answerStreakPoints.streakLevel
    });
    streakImageContainer.append(streakImage);
    streakImageContainer.append(st);
    di.append(streakImageContainer);
    if(info.pointsData.answerStreakPoints.streakLevel < 1){
      tx.style.display = "none";
      if(game.hadStreak){
        tx.style.display = "inline-block";
        tx.innerHTML = "§AnswerStreakLost§";
        tx.setAttribute("text","§AnswerStreakLost§");
        game.hadStreak = false;
      }
      streakImageContainer.style.display = "none";
    }else{
      game.hadStreak = true;
      streakImageContainer.style.display = "inline-block";
    }
    const cont = Element("div");
    cont.append(correct,correctMark,di,pointsEarned,rank,nemesis);
    objects.mid.append(cont);
    activateLoading(false,false);
  }
}
class QuizEndPage{
  constructor(text){
    game.endData = text;
    let message;
    if(game.end.info.rank == 1){
      message = "1<sup>st</sup>place!";
    }else if(game.end.info.rank == 2){
      message = "2<sup>nd</sup>place!";
    }else if (game.end.info.rank == 3) {
      message = "3<sup>rd</sup>place!";
    }else if (game.end.info.rank <= 5) {
      message = "§Top5§";
    }else{
      message = "§Almost§";
    }
    const objects = new GetReadyPage(game.question,true);
    objects.main.setAttribute("ui-event","QuizEnd");
    objects.mid.innerHTML = "";
    if(game.pin[0] === "0" && game.opts.ChallengeDisableAutoplay){
      ChallengeContinueButton.style.display = "";
    }
    document.body.className = "purple";
    const place = Element("h1",{
        innerHTML: message
      }),
      gg = Element("h2",{
        innerHTML: "§GG§"
      }),
      blurb = Element("p",{
        innerText: "§DidWellShareWithFriends§"
      });
    if(game.endData.podiumMedalType){
      const image = Element("img",{
        src: `/resource/img/game/medal/${game.endData.podiumMedalType}.svg`,
        alt: "Victory Medal",
        id: "resultMedal"
      });
      objects.main.append(image);
    }
    objects.main.append(place,gg,blurb);
    if(!game.opts.hideAnswers){
      const guessDiv = Element("div",{
        id: "finalGuess"
      });
      guessDiv.innerHTML = `<span id="closeend">X</span>
      <span id="kahootguess" class="out block" url="https://create.kahoot.it/details/${game.end.info.quizId}">§ActualGame§</span>
      ${game.guesses.length ? `<span id="outguess" class="out block" url="https://create.kahoot.it/details/${game.guesses[0].uuid}">§GuessGame§</span>` : "<span class=\"block disabled out\">§NoFind§</span>"}`;
      objects.main.append(guessDiv);
      document.getElementById("closeend").addEventListener("click",()=>{
        guessDiv.outerHTML = "";
      });
      const launchButtons = Array.from(document.getElementsByClassName("out"));
      if(document.getElementById("outguess")){
        const o = document.getElementById("outguess"),
          a = document.getElementById("kahootguess");
        if(o.getAttribute("url") === a.getAttribute("url")){
          o.className = "out block correct";
        }
      }
      for(const button of launchButtons){
        button.addEventListener("click",()=>{
          if(!button.getAttribute("url")){return;}
          window.open(button.getAttribute("url"),"_blank");
        });
      }
    }
    activateLoading(false,false);
  }
}
class TeamTalkPage{
  constructor(question){
    if(game.opts.teamtalk){
      const o = new QuestionAnswererPage(game.question || question);
      game.isAnswerPage = true;
      return o;
    }
    const {main,mid} = new GetReadyPage(game.question || question,true);
    main.setAttribute("ui-event","TeamTalk");
    mid.innerHTML = "";
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "cyan";
    const timer = Element("h2",{
        innerHTML: "5"
      }),
      title = Element("h1",{
        innerHTML: "§TeamTalka§",
        className: "shadow"
      });
    title.setAttribute("text","§TeamTalka§");
    const subtitle = Element("h2",{
      innerHTML: "§Discuss§",
      className: "shadow"
    });
    subtitle.setAttribute("text","§Discuss§");
    timer.id = "timer";
    const img = Element("img",{
        src: "/resource/img/game/icon/load-large.svg",
        className: "load_circle",
        alt: "load_circle"
      }),
      div = Element("div"),
      div2 = Element("div");
    div2.append(img,timer);
    div.append(title,div2,subtitle);
    mid.append(div);
    let secs = game.question.teamTalkDuration || 5;
    const int = setInterval(()=>{
      try{
        if(--secs < 0){
          clearInterval(int);
        }else{
          timer.innerHTML = secs;
        }
      }catch(err){
        clearInterval(int);
      }
    },1000);
  }
}
class TimeUpPage{
  constructor(info){
    if(game.receivedQuestion){return;}
    const {main,mid,top,bottom} = new LobbyPage;
    main.setAttribute("ui-event","TimeUp");
    mid.innerHTML = "";
    try{document.querySelector(".noQuiz").outerHTML = "";}catch(e){/* nothing to remove */}
    if(!game.guesses || game.guesses.length === 0){
      main.append(NotFoundDiv());
    }
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "blue2";
    const title = Element("h1",{
      innerHTML: "§GetReady§",
      className: "shadow"
    });
    title.setAttribute("text","§GetReady§");
    const img = Element("img",{
        src: "/resource/img/game/icon/late-join.svg",
        id: "ContentImage"
      }),
      subtitle = Element("h2",{
        innerHTML: "§JoinSoon§",
        className: "shadow"
      });
    subtitle.setAttribute("text","§JoinSoon§");
    const cont = Element("div");
    cont.append(title,img,subtitle);
    if(info){
      const score = Element("p",{
          innerHTML: "" + game.score,
          className: "dark"
        }),
        typedefs = {
          quiz: "§TypeQuiz§",
          open_ended: "§TypeOpenEnded§",
          survey: "§TypeSurvey§",
          jumble: "§TypeJumble§",
          word_cloud: "§TypeWordCloud§",
          content: "§TypeContent§",
          multiple_select_poll: "§TypeSurvey§",
          multiple_select_quiz: "§TypeQuiz§",
          brainstorming: "§TypeBrainstorm§"
        },
        typeimg = Element("img",{
          alt: "",
          src: `/resource/img/game/type/${info.type}.svg`
        }),
        typetext = Element("span",{
          innerHTML: typedefs[info.type]
        }),
        typediv = Element("div",{
          id: "quizTypeImage"
        });
      typediv.append(typeimg,typetext);
      top.append(typediv);
      bottom.append(score);
    }
    mid.append(cont);
  }
}
class FeedbackPage{
  constructor(){
    const {main,mid,top,bottom} = new LobbyPage;
    main.setAttribute("ui-event","Feedback");
    mid.innerHTML = "";
    try{document.querySelector(".noQuiz").outerHTML = "";}catch(e){/* Nothing to remove */}
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "";
    bottom.outerHTML = "";
    top.className = "gameOver";
    top.innerHTML = "<p>§GameOver§</p>";
    try{document.querySelector("noQuiz").outerHTML = "";}catch(e){/* Nothing to remove */}
    main.className = "Feedback";
    main.style.padding = "0";
    const ranking = Element("div",{
      className: "feedback"
    });
    ranking.innerHTML = `
    <p>§HowRate§</p>
    <div class="star-container">
      <input id="star1" type="radio" name="star" value="1"/>
      <label for="star1"></label>
      <input id="star2" type="radio" name="star" value="2"/>
      <label for="star2"></label>
      <input id="star3" type="radio" name="star" value="3"/>
      <label for="star3"></label>
      <input id="star4" type="radio" name="star" value="4"/>
      <label for="star4"></label>
      <input id="star5" type="radio" name="star" value="5"/>
      <label for="star5"></label>
    </div>
    <div class="thumb-container">
      <p>§DidLearn§</p>
      <div>
        <input type="radio" name="learn" id="learn1" value="1"/>
        <label for="learn1"></label>
        <input type="radio" name="learn" id="learn2" value="0"/>
        <label for="learn2"></label>
      </div>
    </div>
    <div class="thumb-container">
      <p>§DoRecommend§</p>
      <div>
        <input type="radio" name="rec" id="rec1" value="1"/>
        <label for="rec1"></label>
        <input type="radio" name="rec" id="rec2" value="0"/>
        <label for="rec2"></label>
      </div>
    </div>
    <p>§HowFeel§</p>
    <div class="face-container">
      <input type="radio" name="feel" id="feel1" value="1"/>
      <label for="feel1"></label>
      <input type="radio" name="feel" id="feel2" value="0"/>
      <label for="feel2"></label>
      <input type="radio" name="feel" id="feel3" value="-1"/>
      <label for="feel3"></label>
    </div>`;
    main.append(ranking);
    const stars = Array.from(document.querySelectorAll("[name=\"star\"]"));
    for(const input of stars){
      input.addEventListener("click",()=>{
        for(const inp of stars){
          inp.className = "";
        }
        const n = +input.id.split("star")[1];
        for(let i = n;i>0;i--){
          document.getElementById("star" + i).className = "selected";
        }
      });
    }
    const happy = document.getElementById("feel1"),
      neutral = document.getElementById("feel2"),
      sad = document.getElementById("feel3");
    happy.onclick = sad.onclick = neutral.onclick = ()=>{
      const fun = (document.querySelector("input[name=\"star\"]:checked") || {}).value,
        learn = (document.querySelector("input[name=\"learn\"]:checked") || {}).value,
        recommend = (document.querySelector("input[name=\"rec\"]:checked") || {}).value,
        overall = document.querySelector("input[name=\"feel\"]:checked").value;
      game.sendFeedback({
        fun: +fun,
        learn: +learn,
        recommend: +recommend,
        overall: +overall
      });
      return new QuizEndPage(JSON.stringify(game.endData));
    };
  }
}

function calculateTimeout(points,time){
  const score = points, // - calculateStreakPoints(streak);
    timeout = -2 * time * ((score / 1000) - 1);
  if(timeout < 0.1){
    return 0;
  }
  return timeout;
}

function activateLoading(image,show,text,ext){
  HideDiv.style.background = show ? "rgba(0,0,0,0.3)" : "transparent";
  HideDiv.style.pointerEvents = show ? "all" : "none";
  HideDiv.children[0].children[0].style.display = image ? "inline-block" : "none";
  LoadingText.innerHTML = text ? text : "";
  HideDiv.children[0].children[0].src = ext ? "/resource/img/game/icon/load-large.svg" : "/resource/img/game/icon/load-hole.svg";
}

function setSchema(element,type,scope,prop){
  if(scope){
    element.setAttribute("itemscope","");
  }
  if(prop){
    element.setAttribute("itemtype","https://schema.org/" + type);
  }
  if(prop){
    element.setAttribute("itemprop",prop);
  }
}

function sleep(n){return new Promise((res)=>{setTimeout(res,n*1000);});}

async function resetGame(){
  try{game.music.pause();}catch(e){/* No music to pause */}
  const oldgame = game;
  if(socket){
    socket.onclose = null;
    socket.close();
    socket = null;
  }
  game = new Game();
  new LoginPage;
  document.body.className = "rainbow";
  document.getElementById("author").value = "";
  document.getElementById("uuid").value = "";
  document.getElementById("searchTerm").value = "";
  document.getElementById("timeout_custom_1").value = "";
  document.getElementById("timeout_custom_2").value = "";
  game.loadOptions();
}

function clearUI(){
  activateLoading(false,false);
  UIDiv.innerHTML = "";
  return Element("div");
}

let presetNumber = 0;
function loadSetting(setting,name){
  for(const i in setting){
    const e = document.getElementById(i);
    if(e.type == "checkbox" || e.type == "radio"){
      e.checked = setting[i];
    }else{
      e.value = setting[i];
    }
  }
  game.saveOptions();
  new ErrorHandler("§RestoredPreset§ '" + name + "'",{
    isNotice: true
  });
}
function addPreset(name){
  game.saveOptions();
  document.querySelectorAll(".preset.remove").forEach((item) => {
    item.outerHTML = "";
  });
  let list = [];
  if(localStorage.presets){
    try {
      list = JSON.parse(localStorage.presets);
    } catch (e) {/* No local storage */}
  }
  list.push({
    name: name,
    options: {
      brute: game.opts.brute,
      fail: game.opts.fail,
      teamtalk: game.opts.teamtalk,
      manual: game.opts.manual,
      previewQuestion: game.opts.previewQuestion,
      searchLoosely: game.opts.searchLoosely,
      teamMembers: game.opts.teamMembers,
      theme: game.opts.theme,
      timeout: game.opts.timeout,
      ChallengeDisableTimer: game.opts.ChallengeDisableTimer,
      ChallengeDisableAutoplay: game.opts.ChallengeDisableAutoplay
    }
  });
  localStorage.presets = JSON.stringify(list);
  loadPresets();
}
function loadPresets(){
  document.querySelectorAll(".preset.remove").forEach((item) => {
    item.outerHTML = "";
  });
  try {
    const presets = JSON.parse(localStorage.presets),
      after = document.getElementById("preset_add_div");
    for(const preset of presets){
      const info = preset.options,
        template = Element("template");
      template.innerHTML = `<div class="preset flex remove">
        <div class="center">
          <span class="presetTitle">${preset.name} <label for="preset_${presetNumber}">(?)</label></span>
          <input type="checkbox" id="preset_${presetNumber}" class="ch nosend">
          <div>
            <p>§Theme§ <span class="yellow">${info.theme}</span></p>
            <p>§Timeout§ <span class="yellow">${info.timeout || "0"}</span></p>
            <p>§Team§ <span class="yellow">${info.teamMembers || "(unset)"}</span></p>
            <p>§Fail§ <span class="${(Number(info.fail) && "green") || "red"}">${(Number(info.fail) && "§ON§") || "§OFF§"}</span></p>
            <p>§Loose§ <span class="${(Number(info.searchLoosely) && "green") || "red"}">${(Number(info.searchLoosely) && "§ON§") || "§OFF§"}</span></p>
            <p>§Brute§ <span class="${(info.brute && "green") || "red"}">${(info.brute && "§ON§") || "§OFF§"}</span></p>
            <p>§Manual§ <span class="${(info.manual && "green") || "red"}">${(info.manual && "§ON§") || "§OFF§"}</span></p>
            <p>§Preview§ <span class="${(info.previewQuestion && "green") || "red"}">${(info.previewQuestion && "§ON§") || "§OFF§"}</span></p>
            <p>§TeamTalk§ <span class="${(info.teamtalk && "green") || "red"}">${(info.teamtalk && "§ON§") || "§OFF§"}</span></p>
            <p>§DisableTimer§ <span class="${(info.ChallengeDisableTimer && "green") || "red"}">${(info.ChallengeDisableTimer && "§ON§") || "§OFF§"}</span></p>
            <p>§DisableAuto§ <span class="${(info.ChallengeDisableAutoplay && "green") || "red"}">${(info.ChallengeDisableAutoplay && "§ON§") || "§OFF§"}</span></p>
          </div>
          <button id="restore_${presetNumber}" class="block">§Restore§</button>
          <img src="/resource/img/game/icon/cross.svg" alt="delete" id="delete_${presetNumber}">
        </div>
      </div>`;
      document.getElementById("preset_container").insertBefore(template.content.cloneNode(true),after);
      document.getElementById("restore_" + presetNumber).onclick = function(){
        loadSetting({
          theme: info.theme,
          timeout: info.timeout,
          teamMembers: info.teamMembers,
          fail: info.fail,
          searchLoosely: info.searchLoosely,
          brute: info.brute,
          manual: info.manual,
          previewQuestion: info.previewQuestion
        },preset.name);
      };
      document.getElementById("delete_" + presetNumber).onclick = function(){
        try {
          let things = JSON.parse(localStorage.presets);
          things = things.filter(pre=>{
            return pre.name != preset.name;
          });
          localStorage.presets = JSON.stringify(things);
          loadPresets();
        } catch (e) {/* No local storage yet */}
      };
      presetNumber++;
    }
  } catch (e) {/* No local storage yet */}
}

const ChallengeContinueButton = document.getElementById("ChallengeNext"),
  SettingDiv = document.getElementById("settings"),
  SettingSwitch = document.getElementById("menu_toggle"),
  AboutSwitch = document.getElementById("about"),
  ChangelogSwitch = document.getElementById("changelog"),
  HideDiv = document.getElementsByClassName("Loading")[0],
  UIError = document.getElementsByClassName("Error")[0],
  UIDiv = document.getElementsByClassName("Main")[0],
  HideAnswers = document.getElementById("hideAnswers"),
  LoadingText = document.getElementById("loadingText"),
  ThemeChooser = document.getElementById("theme"),
  QuizResult = document.getElementById("quizresult");
new LoginPage(false);
loadPresets();
let closePage = 0;

const SearchDivSettings = document.getElementById("div_search_options"),
  GameDivSettings = document.getElementById("div_game_options"),
  ChallengeDivSettings = document.getElementById("div_challenge_options"),
  dso = document.getElementById("dso"),
  dgo = document.getElementById("dgo"),
  dco = document.getElementById("dco");
SearchDivSettings.onchange = GameDivSettings.onchange = ChallengeDivSettings.onchange = function(e){
  switch (e.target.id) {
    case "div_search_options":
      dso.className = "flex selected";
      dgo.className = "flex";
      dco.className = "flex";
      break;
    case "div_game_options":
      dso.className = "flex";
      dgo.className = "flex selected";
      dco.className = "flex";
      break;
    case "div_challenge_options":
      dso.className = "flex";
      dgo.className = "flex";
      dco.className = "flex selected";
      break;
  }
};
dgo.className = "flex selected";

AboutSwitch.addEventListener("click",()=>{
  if(AboutSwitch.checked){
    closePage = 1;
  }else{
    closePage = 0;
  }
});
ChangelogSwitch.addEventListener("click",()=>{
  if(ChangelogSwitch.checked){
    closePage = 2;
  }else{
    closePage = 0;
  }
});
ChallengeContinueButton.addEventListener("click",()=>{
  game.client.next();
});
SettingSwitch.onclick = ()=>{
  if(!SettingSwitch.checked){
    dataLayer.push({event:"toggle_settings"});
    if(document.getElementById("preset_toggle").checked){
      document.getElementById("preset_toggle").checked = false;
    }
    game.saveOptions();
  }
  closePage = 0;
};
function Themer(){
  game.theme = ThemeChooser.value;
  if(game.theme === "Rainbow"){
    SettingDiv.className = "rainbow correct";
    document.querySelector(".About").className = "About rainbow";
  }else if(game.theme === "FRANXX"){
    SettingDiv.className = "franxx";
    document.querySelector(".About").className = "About";
  }else{
    SettingDiv.className = "";
    document.querySelector(".About").className = "About";
  }
  const logo = document.querySelector(".Login>img[alt=\"Kahoot logo\"]");
  if(logo){
    logo.src = "/resource/img/game/theme/" + KahootThemes[game.theme].logo;
  }
}
ThemeChooser.addEventListener("change",Themer);
QuizResult.addEventListener("click",(event)=>{
  if(event.target.nodeName === "LABEL"){
    return;
  }
  if(QuizResult.getAttribute("url")){
    window.open(QuizResult.getAttribute("url"),"_blank");
  }
});
const shortcuts = e=>{
  if(!e.ctrlKey){
    return;
  }
  switch (e.key) {
    case "b":
    // brute force
      document.getElementById("brute").click();
      new ErrorHandler(`§Brute2FA§: ${document.getElementById("brute").checked ? "§ON§" : "§OFF§"}`,{
        isNotice: true
      });
      dataLayer.push({type:"brute",value:document.getElementById("brute").checked});
      break;
    case "p":
    // fail on purpose
      document.getElementById("fail").value = document.getElementById("fail").value == 0 ? 0.9 : 0;
      new ErrorHandler(`§PurposelyFail§: ${document.getElementById("fail").value != 0 ? "§ON§" : "§OFF§"}`,{
        isNotice: true
      });
      dataLayer.push({type:"fail",value:document.getElementById("fail").value});
      break;
    case "m":
    // manual answering
      document.getElementById("manual").click();
      new ErrorHandler(`§ManualControl§: ${document.getElementById("manual").checked ? "§ON§" : "§OFF§"}`,{
        isNotice: true
      });
      dataLayer.push({type:"manual",value:document.getElementById("manual").checked});
      break;
    case "h":
    // hide correct
      document.getElementById("hideAnswers").click();
      new ErrorHandler(`§HideCorrect§: ${document.getElementById("hideAnswers").checked ? "§ON§" : "§OFF§"}`,{
        isNotice: true
      });
      dataLayer.push({type:"hide",value:document.getElementById("hideAnswers").checked});
      break;
    case "o":
    // hide correct
      document.getElementById("challengeCorrect").click();
      new ErrorHandler(`§ChallengeCorrect§: ${document.getElementById("challengeCorrect").checked ? "§ON§" : "§OFF§"}`,{
        isNotice: true
      });
      dataLayer.push({type:"correct",value:document.getElementById("challengeCorrect").checked});
      break;
    case "u":
      document.getElementById("previewQuestion").click();
      new ErrorHandler(`§PreviewQuestion§: ${document.getElementById("previewQuestion").checked ? "§ON§" : "§OFF§"}`,{
        isNotice: true
      });
      dataLayer.push({type:"preview",value:document.getElementById("previewQuestion").checked});
      break;
    case "j":
      try{
        if(SettingDiv.style.display){
          SettingDiv.style = "";
          document.querySelector(".Changelog").style = "";
          document.querySelector(".About").style = "";
          document.getElementById("tutorial").style = "";
          document.querySelector(".misc").style = "";
          document.querySelector(".Error").style = "";
          try{document.getElementById("logotext").style = "";}catch(e){/* Nothing to remove */}
          try{document.querySelector(".sm.sidebar").style = "";}catch(e){/* Nothing to remove */}
          try{document.getElementById("abtlnk").style = "";}catch(e){/* Nothing to remove */}
          try{document.getElementById("chnge").style = "";}catch(e){/* Nothing to remove */}
          try{document.getElementById("lang").style = "";}catch(e){/* Nothing to remove */}
        }else{
          SettingDiv.style = "display: none";
          document.querySelector(".Changelog").style = "display: none";
          document.querySelector(".About").style = "display: none";
          document.getElementById("tutorial").style = "display: none";
          document.querySelector(".misc").style = "opacity: 0";
          document.querySelector(".Error").style = "display: none";
          try{document.getElementById("logotext").style = "display: none";}catch(e){/* Nothing to remove */}
          try{document.querySelector(".sm.sidebar").style = "display: none";}catch(e){/* Nothing to remove */}
          try{document.getElementById("abtlnk").style = "display: none";}catch(e){/* Nothing to remove */}
          try{document.getElementById("chnge").style = "display: none";}catch(e){/* Nothing to remove */}
          try{document.getElementById("lang").style = "display: none";}catch(e){/* Nothing to remove */}
          try{document.querySelector(".grecaptcha-badge").style.visibility = "hidden";}catch(e){/* Nothing to remove */}
          try{
            document.querySelector(".ad-container").style.display = "none";
            document.querySelector(".ad-container-2").style.display = "none";
          }catch(e){/* Nothing to remove */}
        }
      }catch(e){
        console.log(e);
      }finally{
        const icon = document.head.querySelector("[rel=\"shortcut icon\"]") || Element("link");
        if(!icon.isConnected){
          icon.rel = "shortcut icon";
          icon.href = "https://kahoot.it/favicon.ico";
          document.head.append(icon);
          document.title = "Play Kahoot!";
        }
        if(SettingDiv.style.display) {
          game.panicSettings = JSON.parse(JSON.stringify(game.opts));
          document.getElementById("manual").checked = true;
          document.getElementById("hideAnswers").checked = true;
          document.getElementById("previewQuestion").checked = false;
        }else{
          game.opts = game.panicSettings;
          document.getElementById("manual").checked = game.opts.manual;
          document.getElementById("hideAnswers").checked = game.opts.hideAnswers;
          document.getElementById("previewQuestion").checked = game.opts.previewQuestion;
        }
        game.saveOptions();
        // yes, that is a typo
        dataLayer.push({type:"panick",value:""});
      }
      break;
    case "d":
      document.getElementById("ChallengeDisableAutoplay").click();
      new ErrorHandler(`§ChallengeAuto§: ${document.getElementById("ChallengeDisableAutoplay").checked ? "§OFF§" : "§ON§"}`,{
        isNotice: true
      });
      dataLayer.push({type:"autoplay",value:document.getElementById("ChallengeDisableAutoplay").checked});
      break;
    case "k":
      document.getElementById("searchLoosely").value = Number(document.getElementById("searchLoosely").value) ? 0 : 1;
      new ErrorHandler(`§LooseSearch§: ${Number(document.getElementById("searchLoosely").value) ? "§ON§" : "§OFF§"}`,{
        isNotice: true
      });
      dataLayer.push({type:"loose",value:document.getElementById("searchLoosely").value});
      break;
    case "t":
      document.getElementById("teamtalk").click();
      new ErrorHandler(`§TeamTalk§: ${Number(document.getElementById("teamtalk").checked) ? "§ON§" : "§OFF§"}`,{
        isNotice: true
      });
      dataLayer.push({type:"teamtalk",value:document.getElementById("teamtalk").checked});
      break;
    default:
      return;
  }
  dataLayer.push({event:"shortcut"});
  e.preventDefault();
  e.stopPropagation();
  game.saveOptions();
};
window.addEventListener("keydown",shortcuts);
window.addEventListener("keydown",(e)=>{
  if(!(game.question && ["quiz","multiple_select_quiz","multiple_select_poll","survey"].includes(game.question.type) && document.querySelector("[alt=\"Red\"]"))){
    return;
  }
  if(+e.code.split("Digit")[1] <= 4){
    switch (+e.code.split("Digit")[1]) {
      case 0:
        game.answerQuestion(null);
        break;
      case 1:
        document.querySelector("[alt=\"Red\"]").click();
        break;
      case 2:
        document.querySelector("[alt=\"Blue\"]").click();
        break;
      case 3:
        document.querySelector("[alt=\"Yellow\"]").click();
        break;
      case 4:
        document.querySelector("[alt=\"Green\"]").click();
        break;
    }
  }
});
UIError.addEventListener("click",()=>{
  clearTimeout(game.errorTimeout);
  UIError.style.right = "";
  dataLayer.push({event:"close_error"});
});
let pressTime = -1;
SettingSwitch.addEventListener("click",()=>{
  if(Date.now() - pressTime < 500){ // clicked again withing .5 seconds
    pressTime = -1;
    shortcuts({
      ctrlKey: true,
      key: "j",
      preventDefault: ()=>{},
      stopPropagation: ()=>{}
    });
    return;
  }
  pressTime = Date.now();
});

// Quiz Search
const SearchInput = document.getElementById("sub-quiz-input"),
  SearchOutput = document.getElementById("sub-quiz-output");
let SearchIndex = 0;
function Search(term,index){
  SearchOutput.innerHTML = "§Loading§";
  const x = new XMLHttpRequest();
  x.open("GET",`/search?q=${encodeURIComponent(term)}&c=${Number(index)}`);
  x.send();
  x.onload = function(){
    const data = JSON.parse(x.response);
    if(data.length === 0){
      SearchOutput.innerHTML = "§NoResult§";
      return;
    }
    // format data
    FormatSearch(data);
    document.getElementById("sub-quiz-next").addEventListener("click",()=>{
      Search(term,(index || 0) + 25);
    });
    const setters = Array.from(document.getElementsByClassName("sub-quiz-button"));
    setters.forEach((item) => {
      item.addEventListener("click",()=>{
        const uuid = item.nextElementSibling.value;
        document.getElementById("uuid").value = uuid;
        document.getElementById("sub-uuid").checked = false;
      });
    });
  };
}
function FormatSearch(quizzes){
  SearchOutput.innerHTML = `
  <span>
    <span class="sub-quiz-img"><img src="/resource/img/game/theme/konosuba/red.svg"/></span>
    <span class="sub-quiz-title">§QuizTitle§</span>
    <span class="sub-quiz-author">§QuizAuthor§</span>
    <span class="sub-quiz-questions">§NumQuestion§</span>
    <button id="sub-quiz-next">§ChallengeNext§</button>
  </span>
  <hr/>
  `;
  for(const i in quizzes){
    const quiz = quizzes[i],
      template = Element("template");
    template.innerHTML = `<span>
      <span class="sub-quiz-img"><img src="${quiz.cover}"/></span>
      <span class="sub-quiz-title">${quiz.title}</span>
      <span class="sub-quiz-author">${quiz.creator_username}</span>
      <span class="sub-quiz-questions">${quiz.questions.length}</span>
      <button class="sub-quiz-button">Use</button>
      <input type="text" class="ch" value="${quiz.uuid}"/>
    </span>`;
    SearchOutput.append(template.content.cloneNode(true));
  }
}
SearchInput.addEventListener("keydown",e=>{
  if(e.code === "Enter"){
    SearchIndex = 0;
    Search(SearchInput.value,SearchIndex);
  }
});

game.loadOptions();
game.theme = ThemeChooser.value;
if(game.theme != "Kahoot"){
  new LoginPage;
}
