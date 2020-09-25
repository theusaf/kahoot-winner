/* global ErrorHandler,LoginPage,dataLayer,resetGame,QuizEndPage,game,SettingSwitch,activateLoading,QuestionAnswererPage,AboutSwitch */
function TutWait(){
  function sleep(n){
    return new Promise(function(resolve) {
      setTimeout(resolve,(n || 1) * 1000)
    });
  }
  return new Promise( function(resolve) {
    if(typeof AboutSwitch !== "undefined"){
      resolve();
    }else{
      return sleep(1).then(()=>{
        TutWait();
      });
    }
  });
}

window.addEventListener("load",async ()=>{
  await TutWait();
  if(!localStorage.seenNotice){
    showNotice();
  }
  if(localStorage.returningUser){
    return;
  }
  activateTutorial();
});

const TutorialDiv = document.getElementById("tutorial");

function activateTutorial(){
  localStorage.returningUser = true;
  if(TutorialDiv && TutorialDiv.innerHTML){
    return;
  }
  if(AboutSwitch.checked){
    AboutSwitch.click();
  }
  const template = document.createElement("template");
  template.innerHTML = `
    <div class="tut_cont">
      <div id="t_step0">
        <h1>§Tut1§</h1>
        <button onclick="tutorialSteps(0)">§TutYes§</button>
        <button onclick="dataLayer.push({event:'close_tutorial'});document.getElementById('tutorial').innerHTML = '';new ErrorHandler('§TutClose§',true);">§TutNo§</button>
      </div>
    </div>
  `;
  TutorialDiv.append(template.content.cloneNode(true));
}

function tutorialSteps(n){
  dataLayer.push({event:"do_tutorial",value:n});
  switch (String(n)) {
  case "0":{
    TutorialDiv.innerHTML = "";
    let template = document.createElement("template");
    template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step1">
                <h1>§Tut2a§</h1>
                <p>§Tut2b§</p>
                <button onclick="tutorialSteps(1);">§ChallengeNext§</button>
                <button onclick="document.getElementById('tutorial').innerHTML = '';new ErrorHandler('§TutClose§',true);">§Done§</button>
              </div>
            </div>
          `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "1":{
    new LoginPage(true);
    TutorialDiv.innerHTML = "";
    let template = document.createElement("template");
    template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step1">
                <h1>§Tut3§</h1>
                <button onclick="tutorialSteps(2)">§ChallengeNext§</button>
                <button onclick="tutorialSteps(10)">§Done§</button>
              </div>
            </div>
          `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "2":{
    SettingSwitch.click();
    TutorialDiv.style.zIndex = 1000;
    TutorialDiv.innerHTML = "";
    let template = document.createElement("template");
    template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step3">
                <h1>§Tut4§</h1>
                <button onclick="tutorialSteps(3)">§ChallengeNext§</button>
                <button onclick="tutorialSteps(10)">§Done§</button>
              </div>
            </div>
          `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "3":{
    if (!SettingSwitch.checked) {SettingSwitch.click();}
    TutorialDiv.innerHTML = "";
    let template = document.createElement("template");
    template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step4">
                <p>§Tut5§</p>
                <button onclick="tutorialSteps(4)">§ChallengeNext§</button>
                <button onclick="tutorialSteps(10)">§Done§</button>
              </div>
            </div>
          `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "4":{
    if (!SettingSwitch.checked) {SettingSwitch.click();}
    TutorialDiv.innerHTML = "";
    let template = document.createElement("template");
    template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step5">
                <h1>§Tut6a§</h1>
                <p>§Tut6b§</p>
                <p>§Tut6c§</p>
                <p>§Tut6d§</p>
                <p>§Tut6e§</p>
                <p>§Tut6f§</p>
                <p>§Tut6g§</p>
                <p>§Tut6h§</p>
                <p>§Tut6i§</p>
                <h3>§Tut6j§</h3>
                <p>§Tut6k§</p>
                <p>§Tut6l§</p>
                <p>§Tut6m§</p>
                <button onclick="tutorialSteps(5)">§ChallengeNext§</button>
                <button onclick="tutorialSteps(10)">§Done§</button>
              </div>
            </div>
          `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "5":{
    if (SettingSwitch.checked) {SettingSwitch.click();}
    game.question = {
      type: "quiz",
      index: 0,
      data: [
        {
          answer: "§Correct§",
          correct: true
        },
        {
          answer: "§Incorrect§",
          correct: false
        },
        {
          answer: "§Tutorial§",
          correct: false
        },
        {
          answer: "",
          correct: false,
          image: {
            id: "dfa9fc36-1122-4dc2-a00b-04d490c07765"
          }
        }
      ],
      total: "42.069",
      currentGuesses: [{
        questions: [
          {
            time: 20000
          }
        ]
      }],
      raw: {}
    };
    game.question.ans = [game.question.data.length];
    game.score = -Infinity;
    game.name = "§Tutorial§";
    game.pin = "12345-LUGGAGE";
    new QuestionAnswererPage();
    activateLoading(false);
    TutorialDiv.innerHTML = "";
    TutorialDiv.style.zIndex = 0;
    let template = document.createElement("template");
    template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step6">
                <h1>§Tut7§</h1>
                <button onclick="tutorialSteps(6)">§ChallengeNext§</button>
                <button onclick="tutorialSteps(10)">§Done§</button>
              </div>
            </div>
          `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "6":{
    TutorialDiv.innerHTML = "";
    let template = document.createElement("template");
    template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step6">
                <h1>§Tut8§</h1>
                <button onclick="tutorialSteps(7)">§ChallengeNext§</button>
                <button onclick="tutorialSteps(10)">§Done§</button>
              </div>
            </div>
          `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "7":{
    TutorialDiv.innerHTML = "";
    let template = document.createElement("template");
    template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step8">
                <h1>§Tut9§</h1>
                <button onclick="tutorialSteps(8)">§ChallengeNext§</button>
                <button onclick="tutorialSteps(10)">§Done§</button>
              </div>
            </div>
          `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "8":{
    TutorialDiv.innerHTML = "";
    let template = document.createElement("template");
    template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step9">
                <h1>§Tut10§</h1>
                <button onclick="tutorialSteps(9)">§ChallengeNext§</button>
                <button onclick="tutorialSteps(10)">§Done§</button>
              </div>
            </div>
          `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "9":{
    game.end = {
      info: {
        rank: 1
      }
    };
    new QuizEndPage(JSON.stringify({
      metal: "gold"
    }));
    TutorialDiv.innerHTML = "";
    let template = document.createElement("template");
    template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step9">
                <h1>§Tut11§</h1>
                <button onclick="tutorialSteps(11)">§Tut11a§</button>
                <button onclick="tutorialSteps(10)">§Tut11b§</button>
              </div>
            </div>
          `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "11":{
    TutorialDiv.innerHTML = "";
    let template = document.createElement("template");
    template.innerHTML = `
          <div class="tut_cont">
            <div id="t_step11">
              <h1>§Tut12§</h1>
              <p>§Tut12a§</p>
              <p>§Tut12b§</p>
              <p>§Tut12c§</p>
              <p>§Tut12d§</p>
              <p>§Tut12e§</p>
              <p>§Tut12f§</p>
              <button onclick="tutorialSteps(10)">§GotIt§</button>
            </div>
          </div>
        `;
    TutorialDiv.append(template.content.cloneNode(true));
    break;
  }
  case "10":{
    TutorialDiv.innerHTML = "";
    resetGame();
    dataLayer.push({event:"complete_tutorial"});
    setTimeout(function(){
      return new ErrorHandler("§TutComplete§",true);
    },300);
    break;
  }
  }
}

function showNotice(){
  localStorage.seenNotice = true;
  const temp = document.createElement("template");
  temp.innerHTML = `<div class="notice">
    <button onclick="document.querySelector('.notice').outerHTML = '';">OK</button>
    <h3><b>§Notice1§: </b><span class="red">§Notice2§</span></h3>
    <h4>§Notice3§</h4>
    <p>§Notice4§</p>
    <p>§Notice5§</p>
    <div>
      <img src="/resource/misc/notice-2020-07-03.png" alt="input at the top">
    </div>
  </div>`;
  document.body.append(temp.content.cloneNode(true));
}
