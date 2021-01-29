const {edit} = require("../util/regex.js"),
  globals = require("./globals.js"),
  got = require("got"),
  readJSON = require("../util/readjson.js"),
  {Searching,SearchDatabase} = require("./search.js"),
  shuffle = require("../util/shuffle.js"),
  sleep = require("../util/sleep.js"),
  toFlat = require("../util/toFlat.js");
class QuizFinder{
  constructor(){
    this.cursor = 0;
    this.ignoreDB = false;
    this.DBIndex = 0;
    this.ignoreKahoot = false;
    this.hax = {
      validOptions: [],
      answers: [],
      correctAnswer: 0,
      cursor: 0,
      stop: false,
      realName: null
    };
  }
  getAnswers(q,log,noset){
    const me = this;
    try{
      let ans;
      switch (q.gameBlockType) {
        case "open_ended":
        case "word_cloud":
          ans = "honestly, i don't know";
          break;
        case "jumble":
          ans = shuffle([0,1,2,3]);
          break;
        case "multiple_select_quiz":
          ans = shuffle([0,1,2,3]).slice((q.quizQuestionAnswers || this.parent.kahoot.quiz.quizQuestionAnswers)[q.questionIndex] - Math.floor(Math.random() * (this.parent.kahoot.quiz.quizQuestionAnswers[q.questionIndex] + 1)));
          break;
        default:
          ans = Math.floor(Math.random() * (q.quizQuestionAnswers || this.parent.kahoot.quiz.quizQuestionAnswers)[q.questionIndex]);
      } // default values
      if(noset){
        return this.hax.validOptions[0].questions[q.questionIndex].choices || [{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""}];
      }
      this.hax.correctAnswer = ans;
      if(log){console.log(`Using quiz id ${me.hax.validOptions[0].uuid}`);}
      const choices = this.hax.validOptions[0].questions[q.questionIndex].choices;
      if(!choices){
        return [{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""}];
      }
      if(this.hax.validOptions[0].questions[q.questionIndex].type != q.gameBlockType){
        return this.hax.validOptions[0].questions[q.questionIndex].choices || [{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""}];
      }
      for(let i = 0;i<choices.length;++i){
        if(choices[i].correct){
          me.hax.correctAnswer = i;
          // open ended support
          if(me.hax.validOptions[0].questions[q.questionIndex].type === "open_ended"){
            me.hax.correctAnswer = choices[i].answer;
          }
          break;
        }
      }
      // jumble support
      if(me.hax.validOptions[0].questions[q.questionIndex].type === "jumble"){
        // since we cannot actually find out the correct answer as this is a program, we just guess...
        me.hax.correctAnswer = shuffle([0,1,2,3]);
        // if challenge
        if(this.parent.options.isChallenge){
          this.hax.correctAnswer = [0,1,2,3];
        }
      }
      // multiple_select_quiz support
      if(this.hax.validOptions[0].questions[q.questionIndex].type === "multiple_select_quiz"){
        const choices = this.hax.validOptions[0].questions[q.questionIndex].choices || [],
          ok = [];
        for(let i = 0;i<choices.length;i++){
          if(choices[i].correct){
            ok.push(i);
          }
        }
        this.hax.correctAnswer = ok;
      }
      return me.hax.validOptions[0].questions[q.questionIndex].choices;
    }catch(err){
      return [{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""},{correct: false,ans:""}];
    }
  }
  async searchKahoot(index){
    // no need to search for challenges
    if(!this.parent){
      return;
    }
    if(this.parent.options.isChallenge){
      return;
    }
    if(this.parent.options.QuizLock && this.hax.validOptions.length){
      return; // Effectively locking the current valid option in place.
    }
    if(this.hax.stop){
      this.parent.finishedProcessing = true;
      return; // stop searching! the quiz ended or the user is disconnected!
    }
    // these filters are to filter out quizzes based on new answers
    const filter = o=>{
        if(o.questions.length != this.parent.kahoot.quiz.quizQuestionAnswers.length){
          return false;
        }
        const a = this.hax.answers;
        for(let i = 0;i < a.length;++i){
          try{
            if(o.questions[a[i].index].type !== a[i].type){
              return false;
            }
            if(!o.questions[a[i].index].choices){
            // if no choices ignore, unless a[i] actually was something
              if(a[i].choice !== null || (typeof a[i].choice === "object" && a[i].choice.length !== 0)){
                return false;
              }
              continue;
            }
            const {index,type,choice,text,correct} = a[i];
            switch(type){
              case "quiz":{
                if(choice !== null && typeof choice !== "undefined"){
                  if(o.questions[index].choices.filter((choice)=>{
                    return text === choice.answer && choice.correct === correct;
                  }).length !== 0){
                    continue;
                  }
                }else{
                  continue;
                }
                break;
              }
              case "open_ended":{
                if(correct === false){
                  continue;
                }
                if(o.questions[index].choices.filter((choice)=>{
                  return text === choice.answer && choice.correct === true;
                }).length !== 0){
                  continue;
                }
                break;
              }
              case "jumble":
              case "multiple_select_quiz":{
                if(choice && choice.length === 0 || (choice && choice.includes(null))){
                  continue;
                }
                const texts = text.split("|");
                if(o.questions[index].choices.every((choice)=>{
                  return texts.includes(choice.answer) || choice.answer === "";
                })){
                  continue;
                }
                break;
              }
              default:{
                continue;
              }
            }
            return false;
          }catch(err){
            // we log stuff, but assume the worst, so we continue looping.
            // UPDATE: no longer logging stuff, we just return false.
            return false;
          }
        }
        return true;
      },
      filter2 = o=>{
        const a = this.hax.answers;
        for(let i = 0;i < a.length;++i){
          try{
            for(const question of o.questions){
              if(!question.choices){
                continue;
              }
              const {type,choice,text,correct} = a[i];
              if(question.type !== type){
                continue;
              }
              switch(type){
                case "quiz":{
                  if(choice !== null && typeof choice !== "undefined"){
                    if(question.choices.filter((choice)=>{
                      return text === choice.answer && choice.correct === correct;
                    }).length !== 0){
                      return true;
                    }
                  }else{
                    return true;
                  }
                  break;
                }
                case "open_ended":{
                  if(correct === false){
                    return true;
                  }
                  if(question.choices.filter((choice)=>{
                    return text === choice.answer && choice.correct === true;
                  }).length !== 0){
                    return true;
                  }
                  break;
                }
                case "jumble":
                case "multiple_select_quiz":{
                  if(choice && choice.length === 0 || choice.includes(null)){
                    return true;
                  }
                  const texts = text.split("|");
                  if(question.choices.every((choice)=>{
                    return texts.includes(choice.answer) || choice.answer === "";
                  })){
                    return true;
                  }
                  break;
                }
                default:{
                  return true;
                }
              }
            }
            return false;
          }catch(err){
            // we log stuff, but assume the worst, so we continue looping.
            // UPDATE: no longer logging stuff, we just return false.
            return false;
          }
        }
        return true;
      },
      use = +this.parent.options.searchLoosely ? filter2 : filter;
    if(this.hax.validOptions.filter(use).length){
      this.hax.validOptions = this.hax.validOptions.filter(use);
      console.log("Possible quiz found");
      return;
    }else{
      this.hax.validOptions = [];
    }
    const options = {
      cursor: this.hax.cursor,
      limit: 25,
      type: ["quiz"],
      includeCard: false,
      searchStrictly: false
    };
    if(this.parent.options.author){
      options.author = this.parent.options.author;
    }
    if(!this.parent.options.uuid){
      const searchText = this.hax.realName ? edit(this.hax.realName) : (this.parent.options.searchTerm ? edit(this.parent.options.searchTerm) : ""),
        len = toFlat(this.parent.kahoot.quiz.quizQuestionAnswers);
      if((searchText.replace(/\s\*/g,"")) === ""){
        if(!this.hax.noQuiz){
          this.hax.noQuiz = true;
          this.parent.send({
            type: "Error",
            message: "EMPTY_NAME"
          });
        }
        const results = (!this.ignoreDB && await SearchDatabase(this,this.DBIndex)) || [];
        this.DBIndex += globals.DBAmount || 50;
        if(!this.parent){
          this.hax.stop = true;
          return;
        }
        if(this.parent.kahoot.quiz.currentQuestion && index < this.parent.kahoot.quiz.currentQuestion.questionIndex + 1){
          this.hax.validOptions = results;
          return;
        }
        if(results.length){
          this.hax.validOptions = results;
          return console.log("Setting results from database");
        }
        let keys = {};
        try{
          if(globals.KahootDatabaseInitialized){
            keys = await readJSON("keys.json");
          }
        }catch(e){
          console.log("Failed to fetch keys",e);
        }
        if(!(keys[len]) || this.DBIndex >= (keys[len].length)){
          this.ignoreDB = true;
        }else{
          await sleep(0.1);
          console.log("Researching");
          this.searchKahoot(index);
        }
        return console.log("No quiz specified.");
      }
      console.log(searchText);
      const results = (!this.ignoreKahoot && await Searching(searchText,options,this)) || [],
        results2 = (!this.ignoreDB && await SearchDatabase(this,this.DBIndex)) || [];
      if(!this.parent){
        this.hax.stop = true;
        return;
      }
      // Limit searches to 7500 (300 total searches / quiz)
      if(typeof results.totalHits === "number"){
        this.hax.totalHits = results.totalHits;
      }
      if(this.hax.cursor >= 9975 || (this.hax.totalHits < this.hax.cursor)){
        this.ignoreKahoot = true;
        if(this.ignoreDB){
          this.hax.stop = true;
        }
      }
      delete results.totalHits;
      this.hax.cursor += 25;
      if(!this.parent){
        this.hax.stop = true;
        return;
      }
      if(this.parent.kahoot.quiz.currentQuestion && index < this.parent.kahoot.quiz.currentQuestion.questionIndex + 1){
        this.hax.validOptions = results || results2;
        return;
      }
      if(results.length === 0){
        this.DBIndex += globals.DBAmount || 50;
        if(results2.length !== 0){
          console.log("Setting results from database");
          this.hax.validOptions = results2;
          return;
        }
        let keys = {};
        try{
          if(globals.KahootDatabaseInitialized){
            keys = await readJSON("keys.json");
          }
        }catch(e){
          console.log("Failed to fetch keys",e);
        }
        if(!(keys[len]) || this.DBIndex >= (keys[len]).length){
          this.ignoreDB = true;
        }
        await sleep(0.1);
        console.log("Researching");
        this.searchKahoot(index);
      }else{
        console.log("Setting results");
        this.hax.validOptions = results;
        return;
      }
    }else{
      try{
        const data = await got(`https://create.kahoot.it/rest/kahoots/${this.parent.options.uuid}`).json();
        if(data.error){
          throw "PRIVATE_ID";
        }
        this.hax.validOptions = [data];
      }catch(e){
        if(!this.parent){return;}
        this.parent.privateUUIDs = this.parent.privateUUIDs || new Set();
        if(!this.parent.privateUUIDs.has(this.parent.options.uuid)){
          this.parent.send({
            type: "Error",
            message: "PRIVATE_ID"
          });
          this.parent.privateUUIDs.add(this.parent.options.uuid);
        }
        this.parent.options.uuid = "";
        return this.searchKahoot(index);
      }
    }
  }
}
module.exports = QuizFinder;
