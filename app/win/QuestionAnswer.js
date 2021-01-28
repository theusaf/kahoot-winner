const sleep = require("../util/sleep.js"),
  QuestionSubmit = require("./QuestionSubmit.js");
module.exports = async (k,q)=>{
  if(!q){
    return;
  }
  if(!k.parent){ // prevent more crashes...
    return;
  }
  let answer = k.parent.finder.hax.correctAnswer;
  if(+k.parent.options.fail && k.parent.fails[q.questionIndex]){
    switch (q.gameBlockType) {
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
  k.parent.teamAnswered = true;
  if(k.parent.options.teamtalk){
    const diff = Date.now() - k.parent.teamTalkTime;
    if(diff < 250){await sleep((250 - diff)/1000);}
  }
  k.answer(answer).then(()=>{
    QuestionSubmit(k);
  }).catch(()=>{});
};
