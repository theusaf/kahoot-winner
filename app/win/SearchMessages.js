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
      if(client.quizQuestionAnswers.length === 0){
        throw new Error("Sending answers before quizQuestionAnswers");
      }
      const answers = JSON.parse(data);
      if(Array.isArray(answers)){
        client.searchNum++;
        client.answers = answers;
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
          client.quizQuestionAnswers = answers;
          client.searchNum++;
          client.searchKahoot();
        }else{
          throw new Error("Invalid answers");
        }
      }else{
        throw new Error("Not an array");
      }
    },
    QUIZ_NAME: (client,data)=>{
      client.searchNum++;
      client.quizTitle = data;
      client.databaseIndex = 0;
      client.searchIndex = 0;
      client.ignoreSearch = false;
      client.ignoreDatabase = false;
      client.searchKahoot();
    },
    QUIZ_ID: async(client,data)=>{
      try{
        const info = await got(`https://create.kahoot.it/rest/kahoots/${data}`).json();
        if(info.error){
          return client.send("ERROR;It appears that this quiz is private.");
        }
      }catch(e){
      /* Meh */
      }
    }
  };
module.exports = Messages;
