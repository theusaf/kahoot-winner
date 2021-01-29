const got = require("got"),
  {handshakeVotes} = require("./globals.js"),
  shuffle = require("../util/shuffle.js"),
  QuestionAnswer = require("./QuestionAnswer.js"),
  QuestionSubmit = require("./QuestionSubmit.js");
const Messages = {
  SET_PIN: async (game,pin)=>{
    try{
      const url = new URL(pin),
        path = url.pathname.split(/challenge\//g)[1],
        // if it was an invalid link, this should throw an error
        isPin = path.match(/\d+/g)[0];
      if(path.length === isPin.length && path.length > 0){
        // this means that the pin is in the link lol
        pin = path;
      }else{
        got(`https://kahoot.it/rest/challenges/${path}`).json().then((body)=>{
          if(body.pin){
            pin = body.pin;
          }
          return got(`https://kahoot.it/rest/challenges/pin/${pin}`);
        }).then((data)=>{
          const {body} = data;
          if(/NOT_FOUND/img.test(body)){
            game.send({message:"INVALID_PIN",type:"Error"});
          }else{
            game.send({message:`Connected to ${pin}!`,type:"Message.PinGood"});
            game.options.pin = pin;
            game.options.isChallenge = true;
            try{game.finder.hax.validOptions = [JSON.parse(body).kahoot];}catch(e){game.finder.hax.validOptions = [];}
          }
        }).catch(()=>{
          game.send({message:"INVALID_PIN",type:"Error"});
        });
        return;
      }
    }catch(err){/* ignore - likely invalid input / non challenge input */}
    // weekly kahoot support
    if(["weekly","weekly-previous","https://kahoot.com/kahoot-of-the-week-previous","https://kahoot.com/kahoot-of-the-week","https://kahoot.com/kahoot-of-the-week-previous/","https://kahoot.com/kahoot-of-the-week-previous","kahoot-of-the-week","kahoot-of-the-week-previous"].includes(pin)){
      let url;
      if(pin.indexOf("previous") != -1){ // previous
        url = "https://kahoot.com/kahoot-of-the-week-previous";
      }else{ // current
        url = "https://kahoot.com/kahoot-of-the-week";
      }
      try{
        const {body} = await got(url),
          p = body.match(/(?<=challenge\/)\d+/gm)[0];
        game.send({message:`Connected to ${p}!`,type:"Message.PinGood"});
        game.options.pin = p;
        game.options.isChallenge = true;
        try{game.finder.hax.validOptions = [JSON.parse(body).kahoot];}catch(e){game.finder.hax.validOptions = [];}
      }catch(e){
        game.send({message:"INVALID_PIN",type:"Error"});
      }
      return;
    }
    if(pin && pin[0] === "0"){
      try{
        const {body} = await got(`https://kahoot.it/rest/challenges/pin/${pin}`);
        if(/NOT_FOUND/img.test(body)){
          game.send({message:"INVALID_PIN",type:"Error"});
        }else{
          game.send({message:`Connected to ${pin}!`,type:"Message.PinGood"});
          game.options.pin = pin;
          game.options.isChallenge = true;
          try{game.finder.hax.validOptions = [JSON.parse(body).kahoot];}catch(e){game.finder.hax.validOptions = [];}
        }
      }catch(e){
        game.send({message:"INVALID_PIN",type:"Error"});
      }
      return;
    }
    // Just set the pin, validate in join
    if (isNaN(pin) && pin !== "test") {
      return game.send({message:"INVALID_PIN",type:"Error"});
    }
    game.send({message:`Connected to ${pin}!`,type:"Message.PinGood"});
    game.options.pin = +pin;
  },
  SET_OPTS: (game,opts)=>{
    try{
      const old = Object.assign({},game.options);
      opts.searchLoosely = +opts.searchLoosely;
      Object.assign(game.options,JSON.parse(opts));
      // if these changed, reset cursor.
      if(old.searchLoosely != game.options.searchLoosely || old.author != game.options.author || old.searchTerm != game.options.searchTerm){
        game.finder.hax.cursor = 0;
        game.finder.hax.noQuiz = false;
        game.finder.hax.stop = false;
        game.finder.ignoreKahoot = false;
        game.finder.ignoreDB = false;
        game.finder.DBIndex = 0;
      }
      // variable answer
      if(+game.options.timeout < 0){
        game.options.timeout = Math.abs(game.options.timeout);
        game.options.variableTimeout = true;
      }else{
        game.options.variableTimeout = false;
      }
      // disable autoplay
      if(game.options.ChallengeDisableAutoplay){
        game.kahoot.defaults.options.ChallengeAutoContinue = false;
      }else{
        game.kahoot.defaults.options.ChallengeAutoContinue = true;
      }
      if(game.options.challengePoints){
        game.kahoot.defaults.options.ChallengeScore = +game.options.challengePoints;
      }else{
        game.kahoot.defaults.options.ChallengeScore = 0;
      }
      if(game.options.challengeCorrect){
        game.kahoot.defaults.options.ChallengeAlwaysCorrect = true;
      }else{
        game.kahoot.defaults.options.ChallengeAlwaysCorrect = false;
      }
      if(game.options.ChallengeEnableStreaks){
        game.kahoot.defaults.options.ChallengeUseStreakBonus = true;
      }else{
        game.kahoot.defaults.options.ChallengeUseStreakBonus = false;
      }
      if(game.options.ChallengeDisableTimer){
        game.kahoot.defaults.options.ChallengeWaitForInput = true;
      }else{
        game.kahoot.defaults.options.ChallengeWaitForInput = false;
      }
      // remove default fail.
      if((+game.options.fail === 2 && +game.fails.length === 1) || game.options.fail != old.fail){
        if(+game.options.fail === 2){
          game.fails = [false];
        }else{
          game.fails = [true];
        }
      }
      // timeframe
      if(isNaN(game.options.timeout)){
        try { // assume [-]d[s]-[s][-]d
          const args = game.options.timeout.split("-");
          if(args.length === 2){
            game.options.timeout = +args[0];
            game.options.timeoutEnd = +args[1];
          }else if(args.length === 3){
            game.options.timeout = -args[1];
            game.options.timeoutEnd = +args[2];
          }else{ // assume 4
            game.options.timeout = -args[1];
            game.options.timeoutEnd = +args[3];
          }
          game.options.timeout = game.options.timeout || 0;
        } catch (e) {
          game.options.timeout = 0;
          game.options.timeoutEnd = 0;
        }
      }

      // changing timeout mid question.
      if(old.timeout != game.options.timeout){
        if(game.security.joined && game.security.gotQuestion && game.questionReady === true && !game.options.manual){
          clearTimeout(game.waiter);
          const start = game.options.timeout * 1000 + (+game.options.variableTimeout * Math.random() * 1000),
            end = Math.random() * ((+game.options.timeoutEnd - (start/1000) || 0)) * 1000,
            delayed = Date.now() - game.security.receivedTime;
          game.waiter = setTimeout(()=>{
            if(!game.kahoot){return;}
            QuestionAnswer(game.kahoot,game.kahoot.quiz.currentQuestion);
          },start+end-delayed);
        }
      }
    }catch(err){
      game.send({message:"INVALID_USER_INPUT",type:"Error"});
    }
  },
  JOIN_GAME: (game,name)=>{
    if(game.security.joined){
      game.send({message:"INVALID_NAME",type:"Error"});
      return;
    }
    game.security.joined = true;
    if(name === "de_se_me"){
      game.kahoot.loggingMode = true;
    }
    game.kahoot.join(game.options.pin,(name||"") + "",game.options.teamMembers ? game.options.teamMembers.toString().split(",") : undefined).catch(err=>{
      if(err && err.error && JSON.stringify(err.error).includes("handshake_denied")){
        handshakeVotes.push(game.ip);
      }
      game.send({message:"INVALID_NAME",type:"Error",data:err});
    });
  },
  ANSWER_QUESTION: (game,answer)=>{
    if(!game.security.joined || !game.kahoot.quiz || !game.kahoot.quiz.currentQuestion){
      return;
    }
    if((typeof (answer) === "undefined") || answer === ""){
      game.send({message:"INVALID_USER_INPUT",type:"Error"});
      game.kahoot.answer(game.finder.hax.correctAnswer).then(()=>{
        QuestionSubmit(game.kahoot);
      }).catch(()=>{});
      return;
    }else if(answer === null){
      return QuestionAnswer(game.kahoot,game.kahoot.quiz.currentQuestion);
    }
    game.kahoot.answer(answer).then(()=>{
      QuestionSubmit(game.kahoot);
    }).catch(()=>{});
  },
  CHOOSE_QUESTION_INDEX: (game,index)=>{
    index = +index;
    if(!game.security.joined || !game.kahoot.quiz || game.options.isChallenge || !game.kahoot.quiz.currentQuestion || game.finder.hax.validOptions.length === 0 || game.finder.hax.validOptions[0].questions.length <= index || index < 0){
      return game.send({message:"INVALID_USER_INPUT",type:"Error"});
    }
    if(index != game.correctIndex){
      game.correctIndex = index;
      const type2 = game.kahoot.quiz.currentQuestion.gameBlockType,
        type = game.finder.hax.validOptions[0].questions[index].type;
      if(type != type2){ // hmm, wrong question.
        return;
      }
      const choices = game.finder.hax.validOptions[0].questions[index].choices;
      if(!choices){
        return;
      }
      try{ // just in case
        for(let i = 0;i<choices.length;++i){
          if(choices[i].correct){
            game.finder.hax.correctAnswer = i;
            // open ended support
            if(game.finder.hax.validOptions[0].questions[index].type === "open_ended"){
              game.finder.hax.correctAnswer = choices[i].answer;
            }
            break;
          }
        }
        // jumble support
        if(game.finder.hax.validOptions[0].questions[index].type === "jumble"){
          // since we cannot actually find out the correct answer as this is a program, we just guess...
          game.finder.hax.correctAnswer = shuffle([0,1,2,3]);
          // if challenge
          if(game.options.isChallenge){
            game.finder.hax.correctAnswer = [0,1,2,3];
          }
        }
        // multiple_select_quiz support
        if(game.finder.hax.validOptions[0].questions[index].type === "multiple_select_quiz"){
          const choices = game.finder.hax.validOptions[0].questions[index].choices || [],
            ok = [];
          for(let i = 0;i<choices.length;i++){
            if(choices[i].correct){
              ok.push(i);
            }
          }
          game.finder.hax.correctAnswer = ok;
        }
      }catch(e){/* ignore */}
    }
  },
  DO_TWO_STEP: async (game,steps)=>{
    if(!game.security.joined){
      return game.send({message:"SESSION_NOT_CONNECTED",type:"Error"});
    }
    try{await game.kahoot.answerTwoFactorAuth(JSON.parse(steps));}catch(err){game.send({message:"INVALID_USER_INPUT",type:"Error"});}
  },
  GET_RANDOM_NAME: game=>{
    game.generateRandomName().then(name=>{
      game.send({message:name,type:"Message.SetName"});
    });
  },
  NEXT_CHALLENGE: game=>{
    // security
    if(!game.options.isChallenge || !game.security.joined || game.kahoot.data.phase === "leaderboard"){
      return game.send({message:"SESSION_NOT_CONNECTED",type:"Error"});
    }
    try{
      game.kahoot.next();
    }catch(e){
      console.log("Caught CHALLENGE ERROR:");
      console.log(e);
    }
  },
  FAIL_CURRENT_QUESTION: (game,choice)=>{
    if(!game.security.joined || !game.kahoot.quiz || !game.kahoot.quiz.currentQuestion){
      return game.send({message:"SESSION_NOT_CONNECTED",type:"Error"});
    }
    game.fails[game.kahoot.quiz.currentQuestion.questionIndex] = Boolean(choice);
    game.send({message:Boolean(choice).toString(),type:"Message.Ping"});
  },
  RECOVER_DATA: (game,message)=>{
    // message should be an object containing quiz name, answers, etc.
    // base validation. Does not work on challenges
    if(game.security.joined || !game.options.pin || game.options.pin[0] === "0" || !message || !message.cid){
      game.send({message:"Reconnect Failed. Invalid pin or data.",type:"Message.QuizEnd"});
      return game.send({message:"INVALID_USER_INPUT",type:"Error"});
    }
    // answers validation
    if(message.answers){
      if(!Array.isArray(message.answers)){
        game.send({message:"Reconnect Failed. Invalid data.",type:"Message.QuizEnd"});
        return game.send({message:"INVALID_USER_INPUT",type:"Error"});
      }
      if(message.answers.length > 100){ // probably BS. closing to reduce memory usage
        game.send({message:"Reconnect Failed. Invalid data.",type:"Message.QuizEnd"});
        return game.send({message:"INVALID_USER_INPUT",type:"Error"});
      }
      for (let i = 0; i < message.answers.length; i++) {
        const ans = message.answers[i];
        // answers are like {i:0,n:"foobar",t:"quiz",c:false,ns:[]}
        if(typeof ans.index !== "number" || typeof ans.choice === "undefined" || typeof ans.type !== "string" || typeof ans.correct !== "boolean"){
          game.send({message:"Reconnect Failed. Invalid data.",type:"Message.QuizEnd"});
          return game.send({message:"INVALID_USER_INPUT",type:"Error"});
        }
      }
      game.finder.answers = message.answers;
    }
    // updating information
    game.kahoot.cid = message.cid;
    game.kahoot.gameid = game.options.pin;
    game.kahoot.socket = {
      readyState: 3,
      close: ()=>{}
    };
    game.kahoot.reconnect().catch(()=>{
      game.send({message:"SESSION_NOT_CONNECTED",type:"Error"});
    });
  },
  HANDSHAKE_ISSUES: (game,message)=>{
    if(message != "AAAA!"){
      return;
    }
    if(game.handshakeIssues && game.ip && !(handshakeVotes.includes(game.ip))){
      const message = "A handshake error was reported at " + (new Date()).toString();
      console.log(message);
      handshakeVotes.push(game.ip);
    }else{ // liar
      game.send({
        type: "Error",
        message: "INVALID_USER_INPUT"
      });
    }
  },
  SEND_FEEDBACK: async (game,message)=>{
    if(!game.security.joined){game.send({message:"INVALID_USER_INPUT",type:"Error"});}
    try{
      const {fun,learn,recommend,overall} = message;
      game.kahoot.sendFeedback(fun,learn,recommend,overall);
    }catch(e){
      console.log(e);
      game.send({message:"INVALID_USER_INPUT",type:"Error"});
    }
  }
};
module.exports = Messages;
