/* global ErrorHandler,LoginPage,dataLayer,resetGame,QuizEndPage,game,SettingSwitch,activateLoading,QuestionAnswererPage,AboutSwitch */
window.addEventListener("load",()=>{
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
        <h1>Hey there! Looks like you are new here. Would you like a tutorial?</h1>
        <button onclick="tutorialSteps(0)">Yes please!</button>
        <button onclick="dataLayer.push({event:'close_tutorial'});document.getElementById('tutorial').innerHTML = '';new ErrorHandler('If you ever need me again, click the tutorial button in the \\'about\\' section!',true);">No thank you.</button>
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
                <h1>Here, you input your game PIN from the host's Kahoot game. If you have a challenge link, you can also put that as the pin. To join the weekly kahoots, use "weekly" and "weekly-previous"</h1>
                <p>At the end of this tutorial, you can also learn about why Kahoot Winner might not win all the time.</p>
                <button onclick="tutorialSteps(1);">Next</button>
                <button onclick="document.getElementById('tutorial').innerHTML = '';new ErrorHandler('If you ever need me again, click the tutorial button in the \\'about\\' section!',true);">Done</button>
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
                <h1>Once you input a valid pin, you can choose your name, or get a random one.</h1>
                <button onclick="tutorialSteps(2)">Next (Options)</button>
                <button onclick="tutorialSteps(10)">Done</button>
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
                <h1>Here are the settings that you can change. You can access this menu by clicking the gear at the bottom right, or pressing ESCAPE.</h1>
                <button onclick="tutorialSteps(3)">Next</button>
                <button onclick="tutorialSteps(10)">Done</button>
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
                <p>These settings help the server to find the quiz you are playing. If you know the information, putting it in here will greatly help.</p>
                <button onclick="tutorialSteps(4)">Next</button>
                <button onclick="tutorialSteps(10)">Done</button>
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
                <h1>These settings control the game experience.</h1>
                <p>Answer Timeout - Set a timer before the server answers the question. This should help make you less suspicious.</p>
                <p>Team Members - Customize your team members for team mode!</p>
                <p>Bypass 2FA - Automatically logs in if 2 Factor Auth is enabled.</p>
                <p>Fail Purposely - Sometimes will answer incorrectly. Not compatible with Manual Control</p>
                <p>Manual Control - Allows you to have the power to answer the Kahoots. This is useful especially at the start, when the server may not have found the quiz yet.</p>
                <p>Preview Question - Allows you to see the questions and answers beforehand.</p>
                <p>Search Loosely - Makes the server search for quizzes loosely, meaning that you can find quizzes with randomized order of questions.</p>
                <p>Hide Correct - Essentially makes Manual Control feel the same as if you were using the normal Kahoot page.</p>
                <h3>Challenge Options</h3>
                <p>Points - Customize the amount of points per question</p>
                <p>Always Correct - Always get the answers correct, even if wrong. (used with Manual Control)</p>
                <p>Disable Autoplay - Wait to continue to the next question, rather than automatically playing through.</p>
                <button onclick="tutorialSteps(5)">Next (Answering)</button>
                <button onclick="tutorialSteps(10)">Done</button>
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
            answer: "Correct",
            correct: true
          },
          {
            answer: "Incorrect",
            correct: false
          },
          {
            answer: "Tutorial",
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
        }]
      };
      game.question.ans = [game.question.data.length];
      game.score = -Infinity;
      game.name = "Tutorial";
      game.pin = "12345-LUGGAGE";
      new QuestionAnswererPage();
      activateLoading(false);
      TutorialDiv.innerHTML = "";
      TutorialDiv.style.zIndex = 0;
      let template = document.createElement("template");
      template.innerHTML = `
            <div class="tut_cont">
              <div id="t_step6">
                <h1>Here is what the answer page looks like.</h1>
                <button onclick="tutorialSteps(6)">Next</button>
                <button onclick="tutorialSteps(10)">Done</button>
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
                <h1>The text of the answers the server thinks is on the screen is displayed above the shape.</h1>
                <button onclick="tutorialSteps(7)">Next</button>
                <button onclick="tutorialSteps(10)">Done</button>
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
                <h1>Correct answers are highlighted with a rainbow border.</h1>
                <button onclick="tutorialSteps(8)">Next</button>
                <button onclick="tutorialSteps(10)">Done</button>
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
                <h1>Answers that use images will replace the shape.</h1>
                <button onclick="tutorialSteps(9)">Next</button>
                <button onclick="tutorialSteps(10)">Done</button>
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
                <h1>Now, time to win!</h1>
                <button onclick="tutorialSteps(11)">Common Issues with Kahoot! Winner</button>
                <button onclick="tutorialSteps(10)">Let's Go!</button>
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
              <h1>I often get asked why it is answering <span style="color: rgb(226,27,60);">incorrectly</span>.</h1>
              <p>Recently, Kahoot! removed the quiz name from being sent to the client. Input the quiz name in the input box above as best you can.</p>
              <p>Most of the time, it is because the quiz is private (unable to be found on Discover)</p>
              <p>It is not possible to get the answers to a private quiz hosted live. Challenges are still ok.</p>
              <p>Another reason that prevents it from finding the quiz is that you joined the game late. In this case, you must provide the <strong>EXACT</strong> name of the quiz, otherwise the server doesn't know what to search for.</p>
              <p>Sometimes, the host randomizes the question. In this case, enable <b>Loose Searching</b> and type in the question beforehand.</p>
              <p>Also, the host may enable randomized answers. If this is the case, simply take manual control and answer for the server instead.</p>
              <button onclick="tutorialSteps(10)">Got it.</button>
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
        return new ErrorHandler("Finished Tutorial! Way to go!",true);
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
    <h3><b>Important notice: </b><span class="red">Kahoot no longer sends the quiz name to the client.</span></h3>
    <h4>What does this mean?</h4>
    <p>You now need to input the quiz name yourself. You may get lucky if the quiz is super popular, as we now store Kahoot quizzes that have been played in the database.</p>
    <p>You can put the quiz name at the input at the top:</p>
    <div>
      <img src="/resource/misc/notice-2020-07-03.png" alt="input at the top">
    </div>
  </div>`;
  document.body.append(temp.content.cloneNode(true));
}
