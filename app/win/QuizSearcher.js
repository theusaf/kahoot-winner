const globals = require("./globals.js"),
  got = require("got"),
  Messages = require("./SearchMessages.js"),
  {SearchKahoot,SearchDatabase} = require("./newsearch.js"),
  sleep = require("../util/sleep.js"),
  toFlat = require("../util/toFlat.js");

class QuizSearcher{
  constructor(socket, req){
    this.ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip || null;
    this.wsocket = socket;
    this.options = {
      searchTerm: "",
      author: "",
      uuid: "",
      searchLoosely: 0
    }; // options
    this.ignoreUUID = null;
    this.quizTitle = "";
    this.answers = [];
    this.searching = false;
    this.possibleItems = [];
    this.searchNum = 0;
    this.searchIndex = 0;
    this.databaseIndex = 0;
    this.ignoreSearch = false;
    this.ignoreDatabase = false;
    this.quizQuestionAnswers = [];
    this.stop = false;
    this.pings = 0;
    this.pinger = setInterval(()=>{
      this.send("PING;");
    },30*1000);
    this.send("READY;");
  }
  isOffline(){
    try{
      return this.wsocket.readyState === 3;
    }catch(e){
      return true;
    }
  }
  close(){
    if(this.isOffline()){
      return;
    }
    this.wsocket.close();
  }
  send(message){
    if(this.isOffline()){
      return;
    }
    this.wsocket.send(message);
  }
  message(message){
    if(this.limited){
      return;
    }
    try{
      const command = message.match(/^[A-Z_]+?(?=;)/)[0],
        data = message.substr(command.length + 1);
      Messages[command](this,data);
    }catch(err){
      console.log(err.description || err);
      this.send("ERROR;Invalid Command");
    }
  }
  async searchKahoot(n=this.searchNum){
    if(this.stop || (this.ignoreSearch && this.ignoreDatabase) || n !== this.searchNum){
      return;
    }
    const options = {
        cursor: this.searchIndex,
        limit: 25,
        type: ["quiz"],
        includeCard: false,
        searchStrictly: false
      },
      length = toFlat(this.quizQuestionAnswers),
      {keys} = globals,
      term = this.quizTitle || this.options.searchTerm;
    // Validating
    function choiceFilter(questionChoice,answer){
      const {isCorrect:correct, text, type, choice} = answer;
      switch(type){
        case "quiz":{
          if(choice === null || typeof choice === "undefined"){
            return true;
          }
          return questionChoice.correct === correct && questionChoice.answer === text;
        }
        case "open_ended":{
          if(correct === false){
            return true;
          }
          return questionChoice.correct && questionChoice.answer === text;
        }
        case "multiple_select_quiz":
        case "jumble":{
          if(Array.isArray(choice) && choice.length && text && !choice.includes(null)){
            const texts = text.split("|");
            for(let i = 0;i<texts.length;i++){
              const str = texts[i];
              if((questionChoice.answer || "") === str){
                return true;
              }
            }
            return false;
          }else{
            return true;
          }
        }
        default:{
          return true;
        }
      }
    }
    const filter = (quiz) => {
        const {questions} = quiz,
          loose = +this.options.searchLoosely,
          answers = this.answers;
        if(this.quizQuestionAnswers.length !== questions.length){
          return false;
        }
        if(this.quizTitle && this.quizTitle !== quiz.title){
          return false;
        }
        if(this.options.author && this.options.author !== (quiz.creator_username || quiz.author)){
          return false;
        }
        if(loose){
          const map = quiz.answerMap || quiz.questions.map((question)=>{
            return question.choices ? question.choices.length : null;
          });
          if(toFlat(this.quizQuestionAnswers) !== toFlat(map)){
            return false;
          }
          if(answers.length === 0){
            return true;
          }
          for(let i = 0; i < answers.length; i++){
            for(const question of questions){
              if(!question.choices){
                continue;
              }
              if(question.choices.filter((choice)=>{return choiceFilter(choice,answers[i]);}).length > 0){
                return true;
              }
            }
          }
          return false;
        }else{
          const map = quiz.answerMap || quiz.questions.map((question)=>{
            return question.choices ? question.choices.length : null;
          });
          if(this.quizQuestionAnswers.join("") !== map.join("")){
            return false;
          }
          for(let i = 0; i < answers.length; i++){
            const question = questions[answers[i].index];
            if(typeof question === "undefined"){
              return false;
            }
            if(!question.choices){
              continue;
            }
            if(answers[i].type !== question.type){
              return false;
            }
            if(question.choices.filter((choice)=>{return choiceFilter(choice,answers[i]);}).length === 0){
              return false;
            }
          }
        }
        return true;
      },
      possibleItemOldCount = this.possibleItems.length;
    if(this.possibleItems.filter(filter).length > 0){
      this.possibleItems = this.possibleItems.filter(filter);
      this.send(`RESULTS;${JSON.stringify(this.possibleItems)}`);
      return;
    }
    if(this.options.uuid && this.options.uuid !== this.ignoreUUID){
      try{
        const data = await got(`https://create.kahoot.it/rest/kahoots/${this.options.uuid}`).json();
        if(data.error){
          throw "Invalid UUID";
        }
        if(filter(data)){
          this.possibleItems = [data];
          console.log("[QuizSearcher] - Setting results from UUID.");
          this.send(`RESULTS;${JSON.stringify(this.possibleItems)}`);
          return;
        }
        this.ignoreUUID = this.options.uuid;
      }catch(err){
        this.send("ERROR;The specified uuid is either private or invalid.");
        this.ignoreUUID = this.options.uuid;
      }
    }
    let quizSpecified = true;
    if((term.replace(/(\s)/g,"")) === ""){
      quizSpecified = false;
      console.log("[QuizSearcher] - No Quiz Specified");
    }
    if(this.options.author){
      options.author = `${this.options.author}`;
    }
    if(!keys[length] || this.databaseIndex >= keys[length].length){
      this.ignoreDatabase = true;
    }
    if(this.searchIndex >= 10e3){
      this.ignoreSearch = true;
    }
    // Fetching
    let searchResults = [],
      databaseResults = [];
    if(!this.ignoreDatabase){
      databaseResults = await SearchDatabase(term,options,length,this);
      if(n === this.searchNum){
        this.databaseIndex += globals.DBAmount;
      }
    }
    if(!this.ignoreSearch && quizSpecified){
      searchResults = await SearchKahoot(term,options,length,this);
      if(n === this.searchNum){
        this.searchIndex += 25;
      }
    }
    if(quizSpecified && searchResults.length === 0){
      this.ignoreSearch = true;
    }
    if(databaseResults.length === 0){
      this.ignoreDatabase = true;
    }
    if(!quizSpecified && databaseResults.length === 0){
      return;
    }
    // Filtering
    const filteredSearchResults = searchResults.filter(filter),
      filteredDatabaseResults = databaseResults.filter(filter);
    if(filteredSearchResults.length || filteredDatabaseResults.length){
      this.possibleItems = filteredSearchResults.length ? filteredSearchResults : filteredDatabaseResults;
      console.log(`[QuizSearcher] - Setting results for "${quizSpecified ? term : "(no quiz specified)"}" from ${this.possibleItems === filteredDatabaseResults ? "database" : "search"}.`);
      this.send(`RESULTS;${JSON.stringify(this.possibleItems)}`);
      return;
    }
    if(possibleItemOldCount){
      this.possibleItems = [];
      this.send("RESULTS;[]");
    }
    console.log(`[QuizSearcher] - Researching "${term}" [${this.searchIndex}|${this.databaseIndex}]`);
    await sleep(0.1);
    this.searchKahoot(n);
  }
}

module.exports = QuizSearcher;
