/* global game, dataLayer, send, socket, Game */
// TODO: finish schema.org markup
const KahootThemes = {
  Kahoot: {
    red: "red.svg",
    blue: "blue.svg",
    green: "green.svg",
    yellow: "yellow.svg",
    logo: "logo.svg"
  },
  KonoSuba: {
    red: "red-konosuba.svg",
    blue: "blue-konosuba.svg",
    green: "green-konosuba.svg",
    yellow: "yellow-konosuba.svg",
    logo: "logo-konosuba.svg"
  },
  // rainbow doesn't actually change any images
  // but will be detected for to change css.
  Rainbow: {
    red: "red.svg",
    blue: "blue.svg",
    green: "green.svg",
    yellow: "yellow.svg",
    logo: "logo.svg"
  }
};

class LoginPage{
  constructor(i){
    QuizResult.className = "disabled button";
    QuizResult.removeAttribute("url");
    ChallengeContinueButton.style.display = "none";
    if(document.getElementById("handshake-fail-div")){
      document.getElementById("handshake-fail-div").outerHTML = "";
    }
    if(new Date().toString().search("Apr 1") != -1 || new Date().toString().search("Mar 31") != -1){
      game.theme = "KonoSuba";
    }
    const div = clearUI();
    const logo = document.createElement("img");
    const logoText = document.createElement("p");
    const pin = document.createElement("input");
    const but = document.createElement("button");
    div.className = "Login";
    logo.alt = "Kahoot logo";
    logo.src = `/resource/${KahootThemes[game.theme].logo}`;
    logoText.id = "logotext";
    logoText.innerHTML = "WINNER";
    pin.type = i ? "text" : "tel";
    pin.id = "loginInput";
    pin.placeholder = i ? "§Nickname§" : "§GamePIN§";
    but.innerHTML = i ? "§OK§" : "§Enter§";
    but.id = "loginButton";
    but.onclick = i ? ()=>{return game.join(pin.value);} : ()=>{return game.sendPin(pin.value);};
    pin.onkeydown = i ? e=>{if(e.key == "Enter"){return game.join(pin.value);}} : e=>{if(e.key == "Enter"){return game.sendPin(pin.value);}};
    logoText.onclick = ()=>{
      logoText.style.display = "none";
    };
    if(i){
      try{document.getElementById("lang").outerHTML = "";}catch(e){}
      const rand = document.createElement("button");
      rand.innerHTML = "§GetRandom§";
      rand.style.marginBottom = "0.5rem";
      rand.onclick = ()=>{
        game.getRandom();
      };
      div.append(logo,logoText,pin,rand,but);
      document.getElementsByClassName("grecaptcha-badge")[0].style.visibility = "hidden";
      if(game.pin[0] != "0"){
        document.getElementById("div_challenge_options").parentElement.className = "fadedm";
      }
    }else{
      document.getElementById("div_challenge_options").parentElement.className = "";
      const abt = document.createElement("label");
      abt.htmlFor = "about";
      abt.innerHTML = "About";
      abt.id = "abtlnk";
      const bottomDiv = document.createElement("div");
      const changelog = document.createElement("label");
      changelog.htmlFor = "changelog";
      changelog.innerHTML = "Changelog";
      bottomDiv.id = "chnge";
      const trademark = document.createElement("span");
      trademark.innerHTML = "§Trademark§";
      const policy = document.createElement("span");
      policy.innerHTML = "<a href=\"/privacy/\">§Privacy§</a> | <a href=\"/terms/\">§Terms§</a>";
      const language = document.createElement("div");
      language.id = "lang";
      language.innerHTML = `<label for="langToggle"><img src="/resource/language.svg"/></label>
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
    const social = document.createElement("div");
    social.className = "sm sidebar correct";
    social.innerHTML = `<div class="mobihide2 mobihide">
    <a href="/creator" target="_blank"><img src="/resource/icon-kahoot.svg" alt="create"><span>§Creator§</span></a>
    <a href="/api" target="_blank"><img src="/resource/icon-api.svg" alt="api"><span>§API§</span></a>
    <a href="/how-it-works" target="_blank"><img src="/resource/icon-about.svg" alt="info mark"><span>§How§</span></a>
    <a href="/blog" target="_blank"><img src="/resource/icon-blog.svg" alt="Icon made from http://www.onlinewebfonts.com/icon is licensed by CC BY 3.0"><span>§Blog§</span></a>
    <a href="/blog/download" target="_blank" class="mobihide2 mobihide"><img src="/resource/icon192.png" alt="download mark"><span>§AppDownload§</span></a>
    <hr/>
    </div>
    <a href="https://discord.gg/58SHzC2" target="_blank"><img src="/resource/logo-discord.svg" alt="discord"><span>Discord</span></a>
    <a href="https://twitter.com/theusafyt" target="_blank"><img src="/resource/logo-twitter.svg" alt="twitter"><span>Twitter</span></a>
    <a href="https://www.facebook.com/theusafmc" target="_blank"><img src="/resource/logo-fbook.svg" alt="facebook"><span>Facebook</span></a>
    <a href="https://paypal.me/theusafyt" target="_blank"><img src="/resource/logo-paypal.svg" alt="paypal"><span>§Donate§</span></a>`;
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
    objects.main.removeChild(objects.texts[1]);
    objects.main.removeChild(objects.texts[0]);
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "purple";
    const div = document.createElement("div");
    div.className = "Answers";
    const r = document.createElement("img"); r.src = `/resource/${KahootThemes[game.theme].red}`; r.alt = "Red";
    const b = document.createElement("img"); b.src = `/resource/${KahootThemes[game.theme].blue}`; b.alt = "Blue";
    const g = document.createElement("img"); g.src = `/resource/${KahootThemes[game.theme].green}`; g.alt = "Green";
    const y = document.createElement("img"); y.src = `/resource/${KahootThemes[game.theme].yellow}`; y.alt = "Yellow";
    div.append(r,b,y,g);
    objects.main.append(div);
    r.onclick = ()=>{game.answer2(0,r);};
    b.onclick = ()=>{game.answer2(1,b);};
    y.onclick = ()=>{game.answer2(2,y);};
    g.onclick = ()=>{game.answer2(3,g);};
    if(state){
      activateLoading(false,true);
    }
  }
}
class ErrorHandler{
  constructor(error,isError){
    if(isError){
      UIError.className = "Error NotError";
    }else{
      UIError.className = "Error";
      setSchema(UIError,"FailedActionStatus",true,null);
    }
    UIError.innerHTML = "";
    const notice = document.createElement("p");
    notice.innerHTML = error;
    UIError.append(notice);
    UIError.style.right = "5%";
    clearTimeout(game.errorTimeout);
    game.errorTimeout = setTimeout(()=>{
      UIError.style.right = "";
    },4000);
  }
}
class LobbyPage{
  constructor(){
    try{document.getElementById("lang").outerHTML="";}catch(e){}
    if(document.getElementById("handshake-fail-div")){
      document.getElementById("handshake-fail-div").outerHTML = "";
    }
    window.onbeforeunload = function(e){
      e.returnValue = "§LeavePrompt§";
    };
    document.querySelector(".ad-container").style.display = "none";
    if(game.pin[0] == "0" && game.opts.ChallengeDisableAutoplay){
      ChallengeContinueButton.style.display = "";
    }
    const div = clearUI();
    div.className = "lobby";
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "green";
    const pinDiv = document.createElement("div");
    pinDiv.id = "L1"; pinDiv.className = "extra";
    const nameDiv = document.createElement("div");
    nameDiv.id = "L2"; nameDiv.className = "extra";
    if(game.theme == "Rainbow"){
      pinDiv.className = "extra rainbow";
    }
    const pinText = document.createElement("p");
    pinText.innerHTML = "PIN: " + String(game.pin);
    const nameText = document.createElement("p");
    nameText.innerHTML = game.name.replace(/"<"/gm,"&lt;");
    const text = document.createElement("h1");
    text.className = "shadow";
    text.setAttribute("text","§YoureIn§");
    text.innerHTML = "§YoureIn§";
    const subtext = document.createElement("h2");
    subtext.innerHTML = "§YoureIn2§";
    subtext.setAttribute("text","§YoureIn2§");
    subtext.className = "shadow";
    pinDiv.append(pinText);
    nameDiv.append(nameText);
    div.append(pinDiv,nameDiv,text,subtext);
    if(typeof game.guesses == "undefined"){
      const l = document.createElement("div");
      l.className = "ChallengeQuestion noQuiz";
      const sp = document.createElement("span");
      sp.innerHTML = `<input id="nameInput" placeholder="§EnterQuizName§" value="${document.getElementById("searchTerm").value || ""}" oninput="document.getElementById('searchTerm').value = this.value;game.updateName();"></input>`;
      l.append(document.createElement("br"),document.createElement("br"),sp);
      div.append(l);
    }
    UIDiv.append(div);
    return {
      main: div,
      texts: [text,subtext],
      top: pinDiv,
      bottom: nameDiv
    };
  }
}
class GetReadyPage{
  constructor(question,no){
    game.recievedTime = Date.now();
    game.questionStarted = false;
    game.jumbleAnswer = [];
    game.question = question;
    const objects = new LobbyPage;
    try {
      document.querySelector(".noQuiz").outerHTML = "";
    } catch (e) {}
    ChallengeContinueButton.style.display = "none";
    document.body.className = "blue";
    objects.texts[0].innerHTML = `§Question§ ${(question.index || 0) + 1}`;
    objects.texts[0].setAttribute("text",objects.texts[0].innerHTML);
    objects.texts[0].id = "snarkText";
    objects.texts[1].id = "bottomText";
    game.answers = question.data;
    game.got_answers = question.cans;
    game.guesses = question.currentGuesses;
    game.total = question.ans.length;
    game.index = question.index || 0;
    game.ans = question.ans;
    game.rawData = question.raw;
    let timeinfo = {
      time: question.raw.timeAvailable || 20000
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
      const val = Number(document.getElementById("timeout_custom_2").value) - game.score;
      const remaining = game.total - game.index; // remaining questions
      const min = 500; // Kahoot removed streak bonus, so min score is now a constant 500.
      let time = 0;
      if(val / remaining < min){
        time = timeinfo.time + 500; // aka dont answer question
      }else{
        time = calculateTimeout(val / remaining,timeinfo.time,game.streak);
      }
      document.getElementById("timeout").value = time / 1000;
      game.saveOptions();
    }
    if(game.guesses && game.guesses.length && game.guesses[0].uuid != game.oldQuizUUID){
      game.oldQuizUUID = game.guesses[0].uuid;
      dataLayer.push({
        event: "find_quiz",
        value: game.oldQuizUUID
      });
    }
    objects.texts[1].innerHTML = "§Ready§";
    objects.texts[1].setAttribute("text","§Ready§");
    const score = document.createElement("p");
    const qoft = document.createElement("p");
    score.innerHTML = String(game.score);
    qoft.innerHTML = `${game.index + 1} §Of§ ${game.total}`;
    score.className = "dark";
    qoft.className = "floater";
    objects.top.append(qoft);
    objects.bottom.append(score);
    activateLoading(true,false,"",true);
    if(game.question.type == "content"){
      objects.texts[0].innerHTML = "§Breather§";
      objects.texts[1].innerHTML = "";
    }
    if(no){
      return objects;
    }
    const timer = document.createElement("h2");
    timer.innerHTML = game.question.timeLeft || "5";
    timer.id = "timer";
    objects.main.append(timer);
    let secs = game.question.timeLeft || 5;
    const int = setInterval(()=>{
      try{
        if(--secs < 0){
          clearInterval(int);
        }else{
          timer.innerHTML = secs;
          objects.texts[1].innerHTML = ["§Go§","§Set§","§Ready§"][secs >= 3 ? 2 : secs];
          objects.texts[1].setAttribute("text",objects.texts[1].innerHTML);
        }
      }catch(err){
        clearInterval(int);
      }
    },1000);
    if(Number(game.opts.searchLoosely)){
      if(game.opts.searchLoosely == 2){
        const next = document.createElement("div");
        next.innerHTML = "<span>§Ready2§</span>";
        next.className = "next";
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
      objects.texts[0].innerHTML = "";
      objects.texts[1].innerHTML = "";
      objects.texts[0].setAttribute("text","");
      objects.texts[1].setAttribute("text","");
      if(game.guesses.length == 0){
        const chdiv = document.createElement("div");
        chdiv.className = "ChallengeQuestion noQuiz";
        const sp = document.createElement("span");
        sp.innerHTML = `<input id="nameInput" placeholder="§EnterQuizName§" value="${document.getElementById("searchTerm").value || ""}" oninput="document.getElementById('searchTerm').value = this.value;game.updateName();"></input><a href="https://kahoot-win.herokuapp.com/blog/quiz-not-found" target="_blank" class="error-info">[?]</a>`;
        chdiv.append(document.createElement("br"),document.createElement("br"),sp);
        objects.main.append(chdiv);
      }else{
        const as = game.guesses[0].questions;
        const qs = [];
        for(let i = 0; i < as.length; i++){
          if(as[i].type == game.question.type && (as[i].layout == game.rawData.gameBlockLayout || !as[i].layout) && ((typeof as[i].choices === "object" && as[i].choices.length) || null) == game.ans[game.index]){
            // answer filter
            let add = true;
            let add2 = 0;
            const ca = game.got_answers.slice(0);
            for(let j = 0; j < ca.length; j++){
              if(as[i].choices){
                if(as[i].choices.filter(choice=>{
                  return choice.answer == ca[j].n && choice.correct;
                }).length){
                  add = false;
                  for(let k = 0;k < as.length;k++){
                    if(as[k].choices.filter(choice=>{
                      return choice.answer == ca[j].n && choice.correct;
                    }).length){
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
        const inp = document.createElement("input");
        inp.className = "looseInput";
        inp.placeholder = "§Question§";
        const cont = document.createElement("div");
        cont.className = "looseDiv";
        const qdiv = document.createElement("div");
        qdiv.className = "looseOptions";
        const filter = (search)=>{
          qdiv.innerHTML = "";
          let f = false;
          for(let i = 0; i < qs.length; i++){
            const qtext = qs[i].q.question || qs[i].q.title;
            const regex = /<\/?[ib]>|[^a-z0-9\s]/gmi;
            const smallRegex = /<\/?[ib]>/gmi;
            const text = qtext.replace(regex," ").replace(/\s+/gm," ");
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
            const match = text.match(new RegExp(search.replace(regex," ").replace(/\s+/gm," "),"gmi"));
            // all characters
            const match2 = qtext.replace(smallRegex,"").match(new RegExp(escape(search.replace(smallRegex,"")),"gmi"));
            // pure alphanumeric, except having no spaces.
            const match3 = qtext.replace(regex,"").match(new RegExp(search.replace(regex,""),"gmi"));
            if(match || match2 || match3){
              if(!f){
                if(game.correctIndex == qs[i].i){
                  f = true;
                }else{
                  send({
                    type: "CHOOSE_QUESTION_INDEX",
                    message: qs[i].i
                  });
                  game.correctIndex = qs[i].i;
                  game.question.data = game.guesses[0].questions[qs[i].i].choices;
                  // game.ans[game.index] = game.question.data ? game.question.data.length : 4; // removed because this shouldn't be needed
                  game.question.ans = game.ans;
                  f = true;
                }
              }
              const m = match || match2 || match3;
              // add the element
              const elem = document.createElement("p");
              let parsed = qtext;
              for(let j = 0;j<m.length;j++){
                parsed = qtext.replace(m[j],"<b>" + m[j] + "</b>");
              }
              elem.innerHTML = parsed;
              elem.addEventListener("click",()=>{
                send({
                  type: "CHOOSE_QUESTION_INDEX",
                  message: qs[i].i
                });
                game.correctIndex = qs[i].i;
                game.question.data = game.guesses[0].questions[qs[i].i].choices;
                game.ans[game.index] = game.question.data ? game.question.data.length : 4;
                game.question.ans = game.ans;
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
      objects.texts[0].innerHTML = "";
      objects.texts[1].innerHTML = "";
      objects.texts[0].setAttribute("text","");
      objects.texts[1].setAttribute("text","");
      const chdiv = document.createElement("div");
      chdiv.className = "ChallengeQuestion";
      const sp = document.createElement("span");
      if(game.guesses.length == 0){
        chdiv.className = "ChallengeQuestion noQuiz";
        sp.innerHTML = `<input id="nameInput" placeholder="§EnterQuizName§" value="${document.getElementById("searchTerm").value || ""}" oninput="document.getElementById('searchTerm').value = this.value;game.updateName();"></input><a href="https://kahoot-win.herokuapp.com/blog/quiz-not-found" target="_blank" class="error-info">[?]</a>`;
      }else{
        sp.innerHTML = "§Question§: " + (game.guesses[0].questions[game.index].question || game.guesses[0].questions[game.index].title);
      }
      chdiv.append(document.createElement("br"),document.createElement("br"),sp);
      if(!HideAnswers.checked){
        const adiv = document.createElement("div");
        adiv.className = "questionPreviewAnswers";
        adiv.innerHTML = "<h4>§CorrectAnswers§</h4>";
        let co = [];
        for(let i in game.answers){
          if(game.answers[i].correct){
            co.push(i);
          }
        }
        for(let i in co){
          const cols = ["red","blue","yellow","green"];
          const template = document.createElement("template");
          template.innerHTML = `<div class="${game.answers[co[i]].correct ? "correct" : ""}">
            <img class="icon${cols[co[i]]}" src="/resource/${KahootThemes[game.theme][cols[co[i]]]}" alt="answer choice icon">
            <span>${game.answers[co[i]].answer}</span>
          </div>`;
          adiv.append(template.content.cloneNode(true));
        }
        // insert correct answer items
        objects.main.append(adiv);
      }
      objects.main.append(chdiv);
    }else if(game.guesses.length == 0){
      const chdiv = document.createElement("div");
      chdiv.className = "ChallengeQuestion noQuiz";
      const sp = document.createElement("span");
      sp.innerHTML = `<input id="nameInput" placeholder="§EnterQuizName§" value="${document.getElementById("searchTerm").value || ""}" oninput="document.getElementById('searchTerm').value = this.value;game.updateName();"></input><a href="https://kahoot-win.herokuapp.com/blog/quiz-not-found" target="_blank" class="error-info">[?]</a>`;
      chdiv.append(document.createElement("br"),document.createElement("br"),sp);
      objects.main.append(chdiv);
    }
    if(game.opts.fail == 2){
      // add choice thingy
      const choiceDiv = document.createElement("div");
      choiceDiv.className = "failChoice";
      const yes = document.createElement("input");
      const no = document.createElement("input");
      yes.type = no.type = "radio";
      yes.name = no.name = "fail";
      yes.id = "fail1";
      no.id = "fail2";
      no.checked = true; // don't fail
      const yesl = document.createElement("label");
      const nol = document.createElement("label");
      yesl.htmlFor = "fail1";
      nol.htmlFor = "fail2";
      yesl.innerHTML = "&nbsp;§DoFail§&nbsp;";
      nol.innerHTML = "§NoFail§";
      choiceDiv.append(yes,yesl,no,nol);
      objects.main.append(choiceDiv);
      function sendFail(){
        setTimeout(()=>{
          if(yes.checked){
            send({
              type: "FAIL_CURRENT_QUESTION",
              message: true
            });
          }else{
            send({
              type: "FAIL_CURRENT_QUESTION",
              message: false
            });
          }
        });
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
    objects.texts[0].innerHTML = "§GetReady§";
    objects.texts[0].setAttribute("text","§GetReady§");
    objects.texts[0].id = "snarkText";
    objects.texts[1].innerHTML = "§Loading§";
    objects.texts[1].setAttribute("text","§Loading§");
    objects.texts[1].id = "bottomText";
    document.body.className = "purple2";
    activateLoading(true,false,"",false);
    return objects;
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
        send({
          type: "ANSWER_QUESTION",
          message: null
        });
      },(game.opts.timeout * 1000) - (Date.now() - game.recievedTime));
    }
    const objects = new GetReadyPage(game.question || question,true);
    game.receivedQuestion = true;
    game.questionStarted = true;
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "";
    // content slides
    if(game.question.type == "content"){
      document.body.className = "rainbow";
      objects.texts[0].innerHTML = "§Breather§";
      objects.texts[1].innerHTML = "";
      return;
    }
    objects.main.removeChild(objects.texts[1]);
    objects.main.removeChild(objects.texts[0]);
    const div = document.createElement("div");
    div.className = "Answers";
    // add open_ended support here
    if(game.question.type == "open_ended" || game.question.type == "word_cloud"){
      document.body.className = "rainbow";
      const input = document.createElement("input");
      input.className = "openended";
      const answer = game.answers.filter(o=>{
        return o.correct;
      })[0];
      input.placeholder = answer ? answer.answer : "";
      if(HideAnswers.checked){
        input.placeholder = "";
      }
      input.onkeydown = e=>{
        if(e.key == "Enter"){
          game.answer(input.value);
        }
      };
      div.append(input);
      objects.main.append(div);
      input.focus();
      activateLoading(false,!document.getElementById("manual").checked);
    }else{
      const r = document.createElement("img"); r.src = `/resource/${KahootThemes[game.theme].red}`; r.alt = "Red";
      const b = document.createElement("img"); b.src = `/resource/${KahootThemes[game.theme].blue}`; b.alt = "Blue";
      const g = document.createElement("img"); g.src = `/resource/${KahootThemes[game.theme].green}`; g.alt = "Green";
      const y = document.createElement("img"); y.src = `/resource/${KahootThemes[game.theme].yellow}`; y.alt = "Yellow";
      const items = [r,b,y,g];
      const repeats = game.ans[game.index];
      for(let i = 0;i < repeats;i++){
        items[i].setAttribute("draggable","false");
        div.append(items[i]);
      }
      if(game.ans[game.index] == 2){
        r.style.maxHeight = "100%";
        b.style.maxHeight = "100%";
        if(game.rawData.gameBlockLayout == "TRUE_FALSE"){
          r.setAttribute("css","layout-tfb");
          b.setAttribute("css","layout-tfr");
          r.src = b.src = `/resource/${KahootThemes[game.theme].blue}`;
          b.src = `/resource/${KahootThemes[game.theme].red}`;
        }
      }
      objects.main.append(div);
      activateLoading(false,!document.getElementById("manual").checked);
      // add jumble support here
      if(game.question.type == "jumble"){
        function rearrange(e,a){
          const info = [];
          // get all sides
          let offset = 0;
          let currentIndex = 0;
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
          let closestIndex = 0;
          let closestValue = Infinity;
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
          };
          const mouseup = function(){
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
        const submitter = document.createElement("div");
        submitter.className = "AnswerOptions";
        const ok = document.createElement("img");
        const reset = document.createElement("img");
        ok.src = "/resource/check.svg";
        reset.src = "/resource/reset.svg";
        ok.onclick = ()=>{
          game.answerJ(div.querySelectorAll("img.jumble"));
        };
        reset.onclick = ()=>{
          game.jumbleAnswer = [];
          new QuestionAnswererPage;
        };
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
        const submitter = document.createElement("div");
        submitter.className = "AnswerOptions";
        const ok = document.createElement("img");
        const reset = document.createElement("img");
        ok.src = "/resource/check.svg";
        reset.src = "/resource/reset.svg";
        ok.onclick = ()=>{
          let tmp = [];
          for(let i in game.multiAnswer){
            if(game.multiAnswer[i]){
              tmp.push(Number(i));
            }
          }
          game.answer(tmp);
        };
        reset.onclick = ()=>{
          game.multiAnswer = {
            0: false,
            1: false,
            2: false,
            3: false
          };
          new QuestionAnswererPage;
        };
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
      const textDiv = document.createElement("div");
      textDiv.className = "textAnswer";
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
        const text = document.createElement("p");
        if(typeof(game.answers[i].answer) == "undefined"){
          text.innerHTML = "";
        }else{
          text.innerHTML = (game.question.type === "jumble" ? (i+1)+". " : "") + game.answers[i].answer;
        }
        textDiv.append(text);
      }
    }
    // challenge
    if(game.pin[0] == "0"){
      const chdiv = document.createElement("div");
      chdiv.className = "ChallengeQuestion";
      const sp = document.createElement("span");
      sp.innerHTML = game.rawData.question || game.rawData.title;
      chdiv.append(sp);
      div.append(chdiv);
      // create timer
      let questionTime = game.rawData.timeAvailable / 1000;
      const qdiv = document.createElement("p");
      qdiv.className = "chtimer";
      qdiv.innerHTML = questionTime;
      const chtimer = setInterval(()=>{
        qdiv.innerHTML = --questionTime;
        if(!qdiv.isConnected){
          clearInterval(chtimer);
        }
      },1000);
      objects.bottom.prepend(qdiv);
    }else if(game.guesses.length === 0){
      const l = document.createElement("div");
      l.className = "ChallengeQuestion noQuiz";
      const sp = document.createElement("span");
      sp.innerHTML = `<input id="nameInput" placeholder="§EnterQuizName§" value="${document.getElementById("searchTerm").value || ""}" oninput="document.getElementById('searchTerm').value = this.value;game.updateName();"></input><a href="https://kahoot-win.herokuapp.com/blog/quiz-not-found" target="_blank" class="error-info">[?]</a>`;
      l.append(document.createElement("br"),document.createElement("br"),sp);
      objects.main.append(l);
    }
  }
}
class QuestionSnarkPage{
  constructor(text){
    const stuff = new GetReadyPage(game.question,true);
    document.body.className = "rainbow";
    ChallengeContinueButton.style.display = "none";
    stuff.texts[1].innerHTML = text;
    stuff.texts[1].setAttribute("text",text);
    stuff.texts[0].innerHTML = "";
    stuff.texts[0].setAttribute("text","");
    stuff.texts[0].id = "snarkText";
    stuff.texts[1].id = "bottomText";
    if(game.guesses.length === 0){
      const l = document.createElement("div");
      l.className = "ChallengeQuestion noQuiz";
      const sp = document.createElement("span");
      sp.innerHTML = `<input id="nameInput" placeholder="§EnterQuizName§" value="${document.getElementById("searchTerm").value || ""}" oninput="document.getElementById('searchTerm').value = this.value;game.updateName();"></input><a href="https://kahoot-win.herokuapp.com/blog/quiz-not-found" target="_blank" class="error-info">[?]</a>`;
      l.append(document.createElement("br"),document.createElement("br"),sp);
      stuff.main.append(l);
    }
    activateLoading(true,false,"",false);
  }
}
class QuestionEndPage{
  constructor(info){
    info = JSON.parse(info);
    if(info.isCorrect){
      game.streak++;
    }else{
      game.streak = 0;
    }
    game.score = info.totalScore;
    const objects = new GetReadyPage(game.question || info,true);
    if(game.pin[0] == "0" && game.opts.ChallengeDisableAutoplay){
      ChallengeContinueButton.style.display = "";
    }else if(game.guesses.length === 0){
      const l = document.createElement("div");
      l.className = "ChallengeQuestion noQuiz";
      const sp = document.createElement("span");
      sp.innerHTML = `<input id="nameInput" placeholder="§EnterQuizName§" value="${document.getElementById("searchTerm").value || ""}" oninput="document.getElementById('searchTerm').value = this.value;game.updateName();"></input><a href="https://kahoot-win.herokuapp.com/blog/quiz-not-found" target="_blank" class="error-info">[?]</a>`;
      l.append(document.createElement("br"),document.createElement("br"),sp);
      objects.main.append(l);
    }
    objects.texts[1].id = "";
    document.body.className = info.isCorrect ? "green" : "red";
    objects.bottom.querySelector(".dark").innerHTML = info.totalScore;
    objects.texts[0].innerHTML = info.isCorrect ? "§Correct§" : "§Incorrect§";
    objects.texts[0].setAttribute("text",objects.texts[0].innerHTML);
    objects.texts[1].innerHTML = `§YouIn§ ${(info.rank || 0)}${info.rank == 1 ? "st" : info.rank == 2 ? "nd" : info.rank == 3 ? "rd" : "th"} §Place§`;
    objects.texts[1].setAttribute("text",objects.texts[1].innerHTML);
    const nemesis = document.createElement("h2");
    nemesis.className = "shadow";
    try{
      nemesis.innerHTML = info.nemesis.name.replace(/</gm,"&lt;") ? `Just ${info.nemesis.totalScore - info.totalScore} from ${info.nemesis.name}` : "";
      nemesis.setAttribute("text",nemesis.innerHTML);
    }catch(e){}
    const correctMark = new Image;
    correctMark.id = "correctMark";
    correctMark.src = info.isCorrect ? "/resource/check.svg" : "/resource/cross.svg";
    const pointsEarned = document.createElement("h3");
    pointsEarned.innerHTML = info.isCorrect ? "+" + (info.points + info.pointsData.answerStreakPoints.streakBonus) : "§KeepTrying§";
    pointsEarned.className = "shadow";
    const streakImage = new Image;
    const streakImageContainer = document.createElement("div");
    const di = document.createElement("div");
    const tx = document.createElement("h2");
    tx.innerHTML = "§AnswerStreak§";
    tx.className = "shadow";
    tx.setAttribute("text","§AnswerStreak§");
    tx.style = "display: inline-block; font-size: 1.5rem";
    di.style.position = "relative";
    streakImageContainer.id = "streakImage";
    di.append(tx);
    const st = document.createElement("p");
    st.innerHTML = info.pointsData.answerStreakPoints.streakLevel;
    streakImage.src = "/resource/fire.svg";
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
    objects.main.insertBefore(correctMark,objects.texts[1]);
    objects.main.insertBefore(di,objects.texts[1]);
    objects.main.insertBefore(pointsEarned,objects.texts[1]);
    objects.main.append(nemesis);
    activateLoading(false,false);
  }
}
class QuizEndPage{
  constructor(text){
    text = JSON.parse(text);
    game.endData = text;
    let message;
    if(game.end.info.rank == 1){
      message = "1<sup>st</sup>";
    }else if(game.end.info.rank == 2){
      message = "2<sup>nd</sup>";
    }else if (game.end.info.rank == 3) {
      message = "3<sup>rd</sup>";
    }else if (game.end.info.rank <= 5) {
      message = "§Top5§";
    }else{
      message = "§Almost§";
    }
    const objects = new GetReadyPage(game.question,true);
    if(game.pin[0] == "0" && game.opts.ChallengeDisableAutoplay){
      ChallengeContinueButton.style.display = "";
    }
    document.body.className = "purple";
    objects.texts[0].innerHTML = message;
    objects.texts[0].setAttribute("text","");
    objects.texts[1].innerHTML = "§GG§";
    objects.texts[1].setAttribute("text","§GG§");
    objects.texts[0].id = "";
    objects.texts[1].id = "finalText";
    objects.top.className = "extra darker";
    objects.bottom.className = "extra darker";
    if(game.endData.podiumMedalType){
      const image = document.createElement("img");
      image.src = `/resource/${game.endData.podiumMedalType}.svg`;
      image.alt = "Victory Medal";
      image.id = "resultMedal";
      objects.main.append(image);
    }
    if(!game.opts.hideAnswers){
      const guessDiv = document.createElement("div");
      guessDiv.id = "finalGuess";
      guessDiv.innerHTML = `<span id="closeend">X</span>
      <span id="kahootguess" class="out block" url="https://create.kahoot.it/details/${game.end.info.quizId}">§ActualGame§</span>
      ${game.guesses.length ? `<span id="outguess" class="out block" url="https://create.kahoot.it/details/${game.guesses[0].uuid}">§GuessGame§</span>` : "<span class=\"block disabled out\">§NoFind§</span>"}`;
      objects.main.append(guessDiv);
      document.getElementById("closeend").addEventListener("click",()=>{
        guessDiv.outerHTML = "";
      });
      const launchButtons = Array.from(document.getElementsByClassName("out"));
      if(document.getElementById("outguess")){
        const o = document.getElementById("outguess");
        const a = document.getElementById("kahootguess");
        if(o.getAttribute("url") === a.getAttribute("url")){
          o.className = "out block correct";
        }
      }
      for(let button of launchButtons){
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
      const o = new QuestionAnswererPage(this.question || question);
      game.isAnswerPage = true;
      return o;
    }
    const {main,texts} = new GetReadyPage(this.question || question,true);
    const [text1,text2] = texts;
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "cyan";
    const timer = document.createElement("h2");
    timer.innerHTML = "5";
    text1.innerHTML = "§TeamTalka§";
    text1.setAttribute("text","§TeamTalka§");
    text2.innerHTML = "§Discuss§";
    text2.setAttribute("text","§Discuss§");
    timer.id = "timer";
    main.append(timer);
    let secs = game.question.teamTalkDuration || 5;
    const int = setInterval(()=>{
      try{
        if(--secs < 0){
          clearInterval(int);
        }else{
          timer.innerHTML = secs;
          text1.innerHTML = "§TeamTalka§";
          text1.setAttribute("text","§TeamTalka§");
          text2.innerHTML = "§Discuss§";
          text2.setAttribute("text","§Discuss§");
        }
      }catch(err){
        clearInterval(int);
      }
    },1000);
  }
}
class TimeUpPage{
  constructor(){
    if(game.receivedQuestion){return;}
    const {main,texts} = new LobbyPage;
    try{document.querySelector(".noQuiz").outerHTML = "";}catch(e){}
    if(!game.guesses || game.guesses.length === 0){
      const l = document.createElement("div");
      l.className = "ChallengeQuestion noQuiz";
      const sp = document.createElement("span");
      sp.innerHTML = `<input id="nameInput" placeholder="§EnterQuizName§" value="${document.getElementById("searchTerm").value || ""}" oninput="document.getElementById('searchTerm').value = this.value;game.updateName();"></input><a href="https://kahoot-win.herokuapp.com/blog/quiz-not-found" target="_blank" class="error-info">[?]</a>`;
      l.append(document.createElement("br"),document.createElement("br"),sp);
      main.append(l);
    }
    const [text1,text2] = texts;
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "red";
    text1.innerHTML = "§TimeUp§";
    text1.id = "snarkText";
    text1.setAttribute("text","§TimeUp§");
    text2.innerHTML = "§YouIn§ 0th §Place§";
    text2.setAttribute("text","§YouIn§ 0th §Place§");
    const message = document.createElement("h3");
    message.innerHTML = "§WeBelieve§";
    message.setAttribute("text","§WeBelieve§");
    message.className = "shadow";
    main.insertBefore(message,text2);
  }
}
class FeedbackPage{
  constructor(){
    const {main,texts,top,bottom} = new LobbyPage;
    const [text1,text2] = texts;
    try{document.querySelector(".noQuiz").outerHTML = "";}catch(e){}
    document.body.className = (game.theme == "Rainbow" && "rainbow") || "";
    bottom.outerHTML = "";
    top.className = "gameOver";
    top.innerHTML = "<p>§GameOver§</p>";
    try{document.querySelector("noQuiz").outerHTML = "";}catch(e){}
    main.className = "Feedback";
    main.style.padding = "0";
    text1.outerHTML = "";
    text2.outerHTML = "";
    const ranking = document.createElement("div");
    ranking.className = "feedback";
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
    for(let input of stars){
      input.addEventListener("click",()=>{
        for(let inp of stars){
          inp.className = "";
        }
        const n = +input.id.split("star")[1];
        for(let i = n;i>0;i--){
          document.getElementById("star" + i).className = "selected";
        }
      });
    }
    const happy = document.getElementById("feel1");
    const neutral = document.getElementById("feel2");
    const sad = document.getElementById("feel3");
    happy.onclick = sad.onclick = neutral.onclick = ()=>{
      const fun = (document.querySelector("input[name=\"star\"]:checked") || {}).value;
      const learn = (document.querySelector("input[name=\"learn\"]:checked") || {}).value;
      const recommend = (document.querySelector("input[name=\"rec\"]:checked") || {}).value;
      const overall = document.querySelector("input[name=\"feel\"]:checked").value;
      send({
        type: "SEND_FEEDBACK",
        message: {
          fun: +fun,
          learn: +learn,
          recommend: +recommend,
          overall: +overall
        }
      });
      return new QuizEndPage(JSON.stringify(game.endData));
    };
  }
}

function calculateTimeout(points,time){
  const score = points; // - calculateStreakPoints(streak);
  const timeout = -2 * time * ((score / 1000) - 1);
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
  HideDiv.children[0].children[0].src = ext ? "/resource/load-large.svg" : "/resource/load-hole.svg";
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

async function resetGame(recover){
  const oldgame = game;
  if(socket){
    socket.onclose = null;
    socket.close();
    socket = null;
  }
  game = new Game();
  if(recover){
    await game.sendPin(oldgame.pin);
    const wait = async evt=>{
      evt = evt.data;
      let data = JSON.parse(evt);
      if(data.type == "Message.PinGood"){
        new LobbyPage;
        // wait 25 seconds to confirm client disconnect.
        await sleep((25000 - (Date.now() - oldgame.disconnectTime))/1000);
        send({
          message: {
            cid: oldgame.cid,
            answers: oldgame.got_answers
          },
          type: "RECOVER_DATA"
        });
        game.saveOptions();
      }else{ // asumming that the first result should be "pingood" after sending the pin.
        resetGame();
      }
      socket.removeEventListener("message",wait);
    };
    socket.addEventListener("message",wait);
    return;
  }
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
  return document.createElement("div");
}

let presetNumber = 0;
function loadSetting(setting,name){
  for(let i in setting){
    const e = document.getElementById(i);
    if(e.type == "checkbox" || e.type == "radio"){
      e.checked = setting[i];
    }else{
      e.value = setting[i];
    }
  }
  game.saveOptions();
  new ErrorHandler("§RestoredPreset§ '" + name + "'",true);
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
    } catch (e) {}
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
      timeout: game.opts.timeout
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
    const presets = JSON.parse(localStorage.presets);
    const after = document.getElementById("preset_add_div");
    for(let preset of presets){
      const info = preset.options;
      const template = document.createElement("template");
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
          </div>
          <button id="restore_${presetNumber}" class="block">§Restore§</button>
          <img src="/resource/cross.svg" alt="delete" id="delete_${presetNumber}">
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
        } catch (e) {}
      };
      presetNumber++;
    }
  } catch (e) {}
}

const ChallengeContinueButton = document.getElementById("ChallengeNext");
const SettingDiv = document.getElementById("settings");
const SettingSwitch = document.getElementById("menu_toggle");
const AboutSwitch = document.getElementById("about");
const ChangelogSwitch = document.getElementById("changelog");
const HideDiv = document.getElementsByClassName("Loading")[0];
const UIError = document.getElementsByClassName("Error")[0];
const UIDiv = document.getElementsByClassName("Main")[0];
const HideAnswers = document.getElementById("hideAnswers");
const LoadingText = document.getElementById("loadingText");
const ThemeChooser = document.getElementById("theme");
const QuizResult = document.getElementById("quizresult");
new LoginPage(false);
loadPresets();
let closePage = 0;

const SearchDivSettings = document.getElementById("div_search_options");
const GameDivSettings = document.getElementById("div_game_options");
const ChallengeDivSettings = document.getElementById("div_challenge_options");
const dso = document.getElementById("dso");
const dgo = document.getElementById("dgo");
const dco = document.getElementById("dco");
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
  send({
    message: "",
    type: "NEXT_CHALLENGE"
  });
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
ThemeChooser.addEventListener("change",()=>{
  game.theme = ThemeChooser.value;
  if(game.theme == "Rainbow"){
    SettingDiv.className = "rainbow correct";
    document.querySelector(".About").className = "About rainbow";
  }
});
QuizResult.addEventListener("click",()=>{
  if(QuizResult.getAttribute("url")){
    window.open(QuizResult.getAttribute("url"),"_blank");
  }
});
const shortcuts = e=>{
  if(!e.ctrlKey){
    return;
  }
  switch (e.key) {
  case "e":
    // reconnect bot
    send({type:"RECONNECT",message:"I think i lost connection"});
    dataLayer.push({type:"reconnect",value:""});
    break;
  case "b":
    // brute force
    document.getElementById("brute").click();
    new ErrorHandler(`§Brute2FA§: ${document.getElementById("brute").checked ? "§ON§" : "§OFF§"}`,true);
    dataLayer.push({type:"brute",value:document.getElementById("brute").checked});
    break;
  case "p":
    // fail on purpose
    document.getElementById("fail").value = document.getElementById("fail").value == 0 ? 0.9 : 0;
    new ErrorHandler(`§PurposelyFail§: ${document.getElementById("fail").value != 0 ? "§ON§" : "§OFF§"}`,true);
    dataLayer.push({type:"fail",value:document.getElementById("fail").value});
    break;
  case "m":
    // manual answering
    document.getElementById("manual").click();
    new ErrorHandler(`§ManualControl§: ${document.getElementById("manual").checked ? "§ON§" : "§OFF§"}`,true);
    dataLayer.push({type:"manual",value:document.getElementById("manual").checked});
    break;
  case "h":
    // hide correct
    document.getElementById("hideAnswers").click();
    new ErrorHandler(`§HideCorrect§: ${document.getElementById("hideAnswers").checked ? "§ON§" : "§OFF§"}`,true);
    dataLayer.push({type:"hide",value:document.getElementById("hideAnswers").checked});
    break;
  case "o":
    // hide correct
    document.getElementById("challengeCorrect").click();
    new ErrorHandler(`§ChallengeCorrect§: ${document.getElementById("challengeCorrect").checked ? "§ON§" : "§OFF§"}`,true);
    dataLayer.push({type:"correct",value:document.getElementById("challengeCorrect").checked});
    break;
  case "u":
    document.getElementById("previewQuestion").click();
    new ErrorHandler(`§PreviewQuestion§: ${document.getElementById("previewQuestion").checked ? "§ON§" : "§OFF§"}`,true);
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
        document.getElementById("logotext").style = "";
        document.querySelector(".sm.sidebar").style = "";
        document.getElementById("abtlnk").style = "";
        document.getElementById("chnge").style = "";
      }else{
        SettingDiv.style = "display: none";
        document.querySelector(".Changelog").style = "display: none";
        document.querySelector(".About").style = "display: none";
        document.getElementById("tutorial").style = "display: none";
        document.querySelector(".misc").style = "opacity: 0";
        document.querySelector(".Error").style = "display: none";
        document.getElementById("logotext").style = "display: none";
        document.querySelector(".sm.sidebar").style = "display: none";
        document.getElementById("abtlnk").style = "display: none";
        document.getElementById("chnge").style = "display: none";
      }
    }catch(e){
      console.log(e);
    }finally{
      const icon = document.head.querySelector("[rel=\"shortcut icon\"]") || document.createElement("link");
      if(!icon.isConnected){
        icon.rel = "shortcut icon";
        icon.href = "https://kahoot.it/favicon.ico";
        document.head.append(icon);
        document.title = "Play Kahoot!";
      }
      document.getElementById("manual").checked = true;
      document.getElementById("hideAnswers").checked = Boolean(SettingDiv.style.display);
      game.saveOptions();
      // yes, that is a typo
      dataLayer.push({type:"panick",value:""});
    }
    break;
  case "d":
    document.getElementById("ChallengeDisableAutoplay").click();
    new ErrorHandler(`§ChallengeAuto§: ${document.getElementById("ChallengeDisableAutoplay").checked ? "§OFF§" : "§ON§"}`,true);
    dataLayer.push({type:"autoplay",value:document.getElementById("ChallengeDisableAutoplay").checked});
    break;
  case "k":
    document.getElementById("searchLoosely").value = Number(document.getElementById("searchLoosely").value) ? 0 : 1;
    new ErrorHandler(`§LooseSearch§: ${Number(document.getElementById("searchLoosely").value) ? "§ON§" : "§OFF§"}`,true);
    dataLayer.push({type:"loose",value:document.getElementById("searchLoosely").value});
    break;
  case "t":
    document.getElementById("teamtalk").click();
    new ErrorHandler(`§TeamTalk§: ${Number(document.getElementById("teamtalk").checked) ? "§ON§" : "§OFF§"}`,true);
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
const SearchInput = document.getElementById("sub-quiz-input");
const SearchOutput = document.getElementById("sub-quiz-output");
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
    <span class="sub-quiz-img"><img src="/resource/red-konosuba.svg"/></span>
    <span class="sub-quiz-title">§QuizTitle§</span>
    <span class="sub-quiz-author">§QuizAuthor§</span>
    <span class="sub-quiz-questions">§NumQuestion§</span>
    <button id="sub-quiz-next">§ChallengeNext§</button>
  </span>
  <hr/>
  `;
  for(let i in quizzes){
    const quiz = quizzes[i];
    const template = document.createElement("template");
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
