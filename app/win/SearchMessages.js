const got = require("got"),
  Messages = {
    SET_OPTS: (client,data)=>{
      const opts = JSON.parse(data),
        old = Object.assign({},client.options);
      opts.searchLoosely = +opts.searchLoosely;
      if(old.searchLoosely !== opts.searchLoosely ||
      old.author !== opts.author ||
      old.searchTerm !== opts.searchTerm){
        client.databaseIndex = 0;
        client.searchIndex = 0;
        client.ignoreSearch = false;
        client.ignoreDatabase = false;
      }
      if(client.quizQuestionAnswers.length > 0 &&
      !client.quizTitle &&
      (opts.uuid !== old.uuid) ||
      (opts.author !== old.author) ||
      (opts.searchTerm !== old.searchTerm) ){
        client.searchNum++;
        client.searchKahoot();
      }
      client.options = opts;
    },
    SET_ANSWERS: (client,data)=>{
      const answers = JSON.parse(data);
      if(Array.isArray(answers)){
        client.answers = answers;
        if(client.quizQuestionAnswers.length === 0){
          return console.log("[SearchMessages] - Sending answers before quizQuestionAnswers");
        }
        client.searchNum++;
        client.searchKahoot();
      }else{
        throw new Error("Not an array");
      }
    },
    QUIZ_QUESTION_ANSWERS: (client,data)=>{
      const answers = JSON.parse(data);
      if(Array.isArray(answers)){
        if(answers.every((item) => {
          return typeof item === "number" || item === null;
        })){
          if (client.quizQuestionAnswers.join("") === answers.join("")) {
            return;
          }
          client.stop = false;
          client.quizQuestionAnswers = answers;
          client.searchNum++;
          client.searchKahoot();
        }else{
          throw new Error("Invalid quizQuestionAnswers");
        }
      }else{
        throw new Error("Not an array");
      }
    },
    QUIZ_NAME: (client,data)=>{
      client.quizTitle = data;
      if (client.quizQuestionAnswers.length === 0) {
        console.log("[SearchMessages] - Quiz name before quizQuestionAnswers");
        return;
      }
      client.searchNum++;
      client.databaseIndex = 0;
      client.searchIndex = 0;
      client.ignoreSearch = false;
      client.ignoreDatabase = false;
      client.searchKahoot();
    },
    QUIZ_ID: async(client,data)=>{
      client.stop = true;
      try{
        const info = await got(`https://create.kahoot.it/rest/kahoots/${data}`).json();
        if(info.error){
          return client.send("ERROR;It appears that this quiz is private.");
        }
        console.log("[SearchMessages] - Saving end game");
      }catch(e){
      /* Meh */
      }
    }
  };
module.exports = Messages;
