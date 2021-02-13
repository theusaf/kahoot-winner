/* global ErrorHandler,LoginPage,dataLayer,QuizEndPage,game,SettingSwitch,activateLoading,QuestionAnswererPage,AboutSwitch,LobbyPage */

window.addEventListener("load",()=>{
  if(localStorage.returningUser === "3.3.0"){
    return;
  }
  activateTutorial();
});

const TutorialDiv = document.getElementById("tutorial");

function activateTutorial(){
  localStorage.returningUser = "3.3.0";
  if(TutorialDiv && TutorialDiv.innerHTML){
    return;
  }
  if(AboutSwitch.checked){
    AboutSwitch.click();
  }
  const template = document.createElement("template");
  template.innerHTML = `
    <div class="tut_cont">
      <div id="tut_data">
        <div id="tut_info">
          <strong>§Tut1§</strong>
        </div>
        <button id="tut_next" tut-step="0" onclick="tutorialSteps(this.getAttribute('tut-step'))">§TutYes§</button>
        <button onclick="dataLayer.push({event:'close_tutorial'});document.getElementById('tutorial').innerHTML = '';new ErrorHandler('§TutClose§',{isNotice:true});resetGame();">§TutNo§</button>
      </div>
    </div>
  `;
  TutorialDiv.append(template.content.cloneNode(true));
}

function tutorialSteps(n){
  dataLayer.push({event:"do_tutorial",value:n});
  const data = document.getElementById("tut_data"),
    [next,close] = Array.from(document.querySelectorAll("#tut_data>button")),
    info = document.getElementById("tut_info");
  next.setAttribute("tut-step",+n + 1);
  next.innerHTML = "§ChallengeNext§";
  close.innerHTML = "§Done§";
  switch(n + ""){
    case "0":{
      if (SettingSwitch.checked) {SettingSwitch.click();}
      info.innerHTML = `<em>§Tut2§</em>
      <p><strong>§Tut2a§</strong></p>
      <p>§Tut2b§</p>
      <p>§Tut2c§</p>
      <ul>
        <li>§Tut2d§ <code>12345</code></li>
        <li>§Tut2e§ <code>012345</code></li>
        <li>§Tut2f§ <code>https://kahoot.it/challenge/012345?challenge-id=really-long-string</code></li>
        <li>§Tut2g§ <code>weekly</code>, <code>weekly-previous</code></li>
      </ul>`;
      break;
    }
    case "1":{
      if (SettingSwitch.checked) {SettingSwitch.click();}
      game.client.name = "§Tutorial§";
      game.client.gameid = "12345-LUGGAGE";
      new LoginPage(true);
      info.innerHTML = `<strong>§Tut3§</strong>
      <p>§Tut3a§</p>
      <p>§Tut3b§</p>`;
      break;
    }
    case "2":{
      if (SettingSwitch.checked) {SettingSwitch.click();}
      game.name = "§Tutorial§";
      new LobbyPage;
      data.style.marginTop = "8rem";
      data.style.height = "calc(100% - 10rem)";
      info.innerHTML = `<p><strong>§Tut4§</strong></p>
      <p>§Tut4a§</p>
      <p>§Tut4b§</p>
      <p><strong>§Tut4c§</strong></p>
      <p>§Tut4d§</p>
      <p>§Tut4e§ <code>quizId=</code></p>`;
      break;
    }
    case "3":{
      if (SettingSwitch.checked) {SettingSwitch.click();}
      info.innerHTML = `<p><strong>§Tut5§</strong></p>
      <p>§Tut5a§</p>
      <p>§Tut5b§</p>`;
      break;
    }
    case "4":{
      if (SettingSwitch.checked) {SettingSwitch.click();}
      data.style.marginTop = "";
      game.client.quiz = {
        currentQuestion:{
          quizQuestionAnswers:[4],
          gameBlockIndex: 0,
          gameBlockType: "quiz"
        },
        quizQuestionAnswers:[4]
      };
      game.guesses = [{
        questions: [{
          type: "quiz",
          choices: [
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
          ]
        }]
      }];
      game.question = game.client.quiz.currentQuestion;
      game.score = -Infinity;
      new QuestionAnswererPage();
      activateLoading(false);
      info.innerHTML = `<p><strong>§Tut6§</strong></p>
      <p>§Tut6a§</p>
      <p>§Tut6b§</p>`;
      break;
    }
    case "5":{
      if (SettingSwitch.checked) {SettingSwitch.click();}
      info.innerHTML = `<p><strong>§Tut7§</strong></p>
      <p>§Tut7a§</p>
      <p>§Tut7b§</p>`;
      break;
    }
    case "6":{
      if (!SettingSwitch.checked) {SettingSwitch.click();}
      document.querySelector("[for=\"div_search_options\"]").click();
      data.style.position = "absolute";
      info.innerHTML = `<p><strong>§Tut8§</strong></p>
      <p>§Tut8a§</p>
      <p>§Tut8b§</p>
      <p>§Tut8c§</p>
      <p>§Tut8d§</p>
      <p>§Tut8e§</p>`;
      break;
    }
    case "7":{
      if (!SettingSwitch.checked) {SettingSwitch.click();}
      document.querySelector("[for=\"div_game_options\"]").click();
      info.innerHTML = `<p><strong>§Tut9§</strong></p>
      <p>§Tut9a§</p>
      <p>§Tut9b§</p>
      <p>§Tut9c§</p>
      <p>§Tut9d§</p>
      <p>§Tut9e§</p>
      <p>§Tut9f§</p>
      <p>§Tut9g§</p>
      <p>§Tut9h§</p>
      <p>§Tut9i§</p>
      <p>§Tut9j§</p>`;
      break;
    }
    case "8":{
      if (!SettingSwitch.checked) {SettingSwitch.click();}
      document.querySelector("[for=\"div_challenge_options\"]").click();
      info.innerHTML = `<p><strong>§Tut10§</strong></p>
      <p>§Tut10a§</p>
      <p>§Tut10b§</p>
      <p>§Tut10c§</p>
      <p>§Tut10d§</p>
      <p>§Tut10e§</p>`;
      break;
    }
    case "9":{
      data.style.position = "";
      info.innerHTML = `<p><strong>§Tut11§</strong></p>
      <p>§Tut11a§</p>`;
      break;
    }
    case "10":{
      function a(){
        dataLayer.push({event:"complete_tutorial"});
        setTimeout(function(){
          return new ErrorHandler("§TutComplete§",{
            isNotice: true
          });
        },300);
        try{close.removeEventListener(a);}catch(e){/* No longer exists */}
      }
      close.addEventListener("click",a);
      if (SettingSwitch.checked) {SettingSwitch.click();}
      game.end = {
        info: {
          rank: 1
        }
      };
      new QuizEndPage({
        podiumMedalType: "gold"
      });
      next.outerHTML = "";
      info.innerHTML = `<p><strong>§Tut12§</strong></p>
      <p>§Tut12a§</p>
      <ol>
        <li>§Tut12b§</li>
        <ul><li>§Tut12c§</li></ul>
        <li>§Tut12d§</li>
        <ul><li>§Tut12e§</li></ul>
        <li>§Tut12f§</li>
        <ul><li>§Tut12g§</li></ul>
        <li>§Tut12h§</li>
        <ul><li>§Tut12i§</li></ul>
        <li>§Tut12j§</li>
        <ul><li>§Tut12k§</li></ul>
      </ol>`;
    }
  }
}
