const {BruteForces} = require("./globals.js"),
  LiveTwoStepAnswer = require("kahoot.js-updated/src/assets/LiveTwoStepAnswer"),
  sleep = require("../util/sleep.js"),
  shuffle = require("../util/shuffle.js"),
  QuestionAnswer = require("./QuestionAnswer.js"),
  QuizFinder = require("./QuizFinder.js");
const Listeners = {
  Joined: k=>{
    k.parent.security.joined = true;
    k.parent.send({message:JSON.stringify({
      name: k.name,
      cid: k.cid
    }),type:"Message.JoinSuccess"});
  },
  QuizStart: (k,q)=>{
    if(!k.parent || !k.parent.finder){
      return;
    }
    if(k.parent.options.isChallenge){
      // set valid options
      if(!k.parent.finder.hax.validOptions.length){
        k.parent.finder.hax.validOptions.push(q.rawEvent);
      }
    }
    k.parent.finder.hax.cursor = 0;
    k.parent.finder.hax.realName = q.quizTitle;
    q.name = k.parent.options.name && !q.quizTitle ? k.parent.options.name : q.quizTitle;
    k.parent.send({
      message:JSON.stringify({name:q.name,raw:q}),
      type: "Message.QuizStart"
    });
    if(k.parent.finder.hax.realName){
      k.parent.finder.hax.noQuiz = true;
    }
    k.parent.finder.searchKahoot(0);
  },
  QuestionReady: (k,q)=>{
    k.parent.questionReady = true;
    if(k.parent.fails.length === 1){
      for(let i = 0;i<k.quiz.quizQuestionAnswers.length - 1;i++){
        if(+k.parent.options.fail === 0){
          break;
        }
        k.parent.fails.push(Math.random() > +k.parent.options.fail);
      }
      k.parent.fails = shuffle(k.parent.fails);
    }
    k.parent.send({message:JSON.stringify({data:k.parent.finder.getAnswers(q,true),index:q.questionIndex,total:k.quiz.quizQuestionAnswers.length,ans:k.quiz.quizQuestionAnswers,currentGuesses:k.parent.finder.hax.validOptions,type:q.type,raw:q,timeLeft:q.timeLeft,cans:k.parent.finder.hax.answers}),type:"Message.QuestionGet"});
  },
  QuestionStart: (k,q)=>{
    if(k.parent.questionReady === false){
      return; // question already ended?
    }
    k.parent.security.gotQuestion = true;
    k.parent.security.receivedTime = Date.now();
    if(k.parent.options.manual || k.parent.teamAnswered || +k.parent.options.searchLoosely === 2){
      k.parent.send({message:JSON.stringify({
        data: k.parent.finder.getAnswers(q,false,true),
        index: q.questionIndex,
        total: k.quiz.quizQuestionAnswers.length,
        ans: q.quizQuestionAnswers,
        currentGuesses: k.parent.finder.hax.validOptions,
        type: q.gameBlockType,
        raw: q,
        cans: k.parent.finder.hax.answers
      }),type:"Message.QuestionBegin"});
    }else{
      k.parent.send({message:JSON.stringify({
        data: k.parent.finder.getAnswers(q,false,true),
        index: q.questionIndex,
        total: k.quiz.quizQuestionAnswers.length,
        ans: q.quizQuestionAnswers,
        currentGuesses: k.parent.finder.hax.validOptions,
        type: q.gameBlockType,
        raw: q,
        cans: k.parent.finder.hax.answers
      }),type:"Message.QuestionBegin"});
      const start = k.parent.options.timeout * 1000 + (+k.parent.options.variableTimeout * Math.random() * 1000),
        end = Math.random() * ((+k.parent.options.timeoutEnd - (start/1000) || 0)) * 1000;
      k.parent.waiter = setTimeout(()=>{
        QuestionAnswer(k,q);
      },start + end);
    }
  },
  QuestionEnd: (k,q)=>{
    k.parent.questionReady = false;
    delete k.parent.correctIndex;
    clearTimeout(k.parent.waiter);
    k.parent.teamAnswered = false;
    k.parent.send({message:JSON.stringify(Object.assign({
      raw: q,
      data: k.parent.finder.getAnswers(Object.assign({
        questionIndex: (k.quiz.currentQuestion || {}).questionIndex,
        gameBlockType: (k.quiz.currentQuestion || {}).gameBlockType
      },q)),
      index: (k.quiz.currentQuestion || {}).questionIndex,
      total: (k.quiz.quizQuestionAnswers || []).length,
      ans: k.quiz.quizQuestionAnswers,
      currentGuesses: k.parent.finder.hax.validOptions,
      type: (k.quiz.currentQuestion || {}).gameBlockType,
      cans: k.parent.finder.hax.answers
    },q)),type:"Message.QuestionEnd"});
    if(!k.parent.security.gotQuestion){
      return;
    }
    k.parent.security.gotQuestion = false;
    try{
      if(typeof q.choice === "undefined"){
        return;
      }
      k.parent.finder.hax.answers.push({choice:q.choice,type:q.type,text:q.text,correct:q.isCorrect,index:k.quiz.currentQuestion.questionIndex});
      k.parent.finder.searchKahoot(k.quiz.currentQuestion.questionIndex + 1);
    }catch(err){
      // likely due to joining in the middle of the game
    }
  },
  QuizEnd: async (k,q)=>{
    k.parent.send({message:JSON.stringify(q),type:"Message.QuizFinish"});
    k.parent.finder.hax.stop = true;
    if(k.parent.options.isChallenge){
      k.defaults.options.ChallengeAutoContinue = false;
      setTimeout(()=>{
        try{
          k.next();
        }catch(err){
          console.log("Caught CHALLENGE ERROR:");
          console.log(err);
        }
      },1000 * 60 * 2);
      return;
    }
  },
  Podium: (k,t)=>{
    k.parent.send({message:JSON.stringify(t),type:"Message.FinishText"});
  },
  Disconnect: (k,r)=>{
    k.parent.send({message:r,type:"Message.QuizEnd"});
    k.parent.finder.hax.stop = true;
    k.parent.security.joined = false;
    k.parent.finishedProcessing = true;
  },
  TwoFactorReset: async k=>{
    if(k.parent.options.brute){
      // answer all possible combinations in ~2 seconds!
      const pack = [];
      for(let i = 0; i < BruteForces.length; i++){
        const m = new LiveTwoStepAnswer(k, BruteForces[i]);
        m.id = `${++k.messageId}`;
        pack.push(m);
      }
      // send in batches
      for(let i = 0; i < pack.length; i+=2){
        if(!k.socket) {
          return;
        }
        await sleep(.4);
        k.socket.send(JSON.stringify(pack.slice(i,i + 2)));
      }
    }else{
      k.parent.send({message:"Two Step Auth Required",type:"Message.RunTwoSteps"});
    }
  },
  TwoFactorCorrect: k=>{
    k.parent.send({message:"Two Step Auth Completed",type:"Message.TwoStepSuccess"});
  },
  TwoFactorWrong: k=>{
    if(!k.parent.options.brute){
      k.parent.send({message:"Failed Two Step Auth",type:"Message.FailTwoStep"});
    }
  },
  Feedback: k=>{
    k.parent.send({message:"Feedback!",type:"Message.Feedback"});
  },
  HandshakeFailed: k=>{
    console.log("Handshake failure occured.");
    k.parent.handshakeIssues = true;
    k.parent.security.joined = false;
    k.parent.send({message:"HANDSHAKE",type:"Error"});
  },
  TimeOver: (k,inf)=>{
    k.parent.send({message:JSON.stringify(inf),type:"Message.TimeOver"});
  },
  TeamTalk: (k,q)=>{
    k.parent.teamTalkTime = Date.now();
    k.parent.security.gotQuestion = true;
    k.parent.send({message:JSON.stringify({
      data: k.parent.finder.getAnswers(q),
      index: q.questionIndex,
      total: k.quiz.quizQuestionAnswers.length,
      ans: q.quizQuestionAnswers,
      currentGuesses: k.parent.finder.hax.validOptions,
      type: q.gameBlockType,
      raw: q,
      cans: k.parent.finder.hax.answers
    }),type:"Message.TeamTalk"});
    if(k.parent.options.teamtalk && !k.parent.options.manual){
      const start = k.parent.options.timeout * 1000 + (+k.parent.options.variableTimeout * Math.random() * 1000),
        end = Math.random() * ((+k.parent.options.timeoutEnd - (start/1000) || 0)) * 1000;
      k.parent.teamAnswered = true;
      k.parent.waiter = setTimeout(()=>{
        QuestionAnswer(k,q);
      },start + end);
    }
  },
  NameAccept: (k,n)=>{
    k.parent.send({message:JSON.stringify(n),type:"Message.NameAccept"});
  },
  GameReset: k=>{
    k.parent.send({message:"The Game Reset.",type:"Message.GameReset"});
    k.parent.pings = 0;
    k.parent.fails = [true];
    k.parent.security.gotQuestion = false;
    const valid = k.parent.finder.hax.validOptions;
    k.parent.finder = new QuizFinder;
    k.parent.finder.parent = k.parent;
    k.parent.finder.hax.validOptions = valid;
  }
};
module.exports = Listeners;
