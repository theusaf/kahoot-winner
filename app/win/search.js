const globals = require("./globals.js"),
  readJSON = require("../util/readjson.js"),
  Search = require("kahoot-search"),
  toFlat = require("../util/toFlat.js");
async function SearchDatabase(finder,index){
  if(!globals.KahootDatabaseInitialized){
    return [];
  }
  if(!finder.parent){
    return [];
  }
  const filt = k=>{
      if(!finder.parent){
        return false;
      }
      if(finder.parent.options.author){
        if(finder.parent.options.author != k.author){
          return false;
        }
      }
      if(finder.hax.realName){
        if(k.title !== finder.hax.realName && k.title){
          return false;
        }
      }
      const ans = finder.hax.answers;
      if(+finder.parent.options.searchLoosely){
        const a = k.answerMap.slice().sort(),
          b = finder.parent.kahoot.quiz.quizQuestionAnswers.slice().sort();
        if(JSON.stringify(a) !== JSON.stringify(b)){
          return false;
        }
        if(ans.length){
          for (let i = 0; i < ans.length; i++) {
            let ok = false;
            for (let j = 0; j<k.questions.length;j++) {
              if(!k.questions[j].choices){
                continue;
              }
              if(k.questions[j].type !== ans[i].type){
                continue;
              }
              if(k.questions[j].choices.filter(ch=>{
                const {type,correct,choice,text} = ans[i];
                let ok = false;
                switch(type){
                  case "jumble":
                  case "multiple_select_quiz":{
                    if(choice && choice.length === 0 || (choice && choice.includes(null))){
                      ok = true;
                      break;
                    }
                    const texts = text.split("|");
                    if(texts.includes(ch.answer)){
                      ok = true;
                      break;
                    }
                    break;
                  }
                  case "quiz":{
                    if(choice === null || typeof choice === "undefined"){
                      ok = true;
                      break;
                    }
                    if(ch.answer === text && ch.correct === correct){
                      ok = true;
                      break;
                    }
                    break;
                  }
                  case "open_ended":{
                    if(!correct){
                      ok = true;
                      break;
                    }
                    if(ch.answer === text){
                      ok = true;
                      break;
                    }
                    break;
                  }
                  default:{
                    ok = true;
                  }
                }
                return ok;
              }).length){
                ok = true;
                break;
              }
            }
            if(!ok){
              return false;
            }
          }
        }
      }else{
        const a = k.answerMap,
          b = finder.parent.kahoot.quiz.quizQuestionAnswers;
        if(JSON.stringify(a) !== JSON.stringify(b)){
          return false;
        }
        if(ans.length){
          for (let i = 0; i < ans.length; i++) {
            const {index} = ans[i];
            let ok = false;
            if(!k.questions[index].choices){
              if(a[i].choice){
                return false;
              }
              continue;
            }
            if(k.questions[index].type !== ans[i].type){
              return false;
            }
            const ch = k.questions[index].choices;
            for (let j = 0; j < ch.length; j++) {
              const {type,correct,choice,text} = ans[i];
              switch(type){
                case "jumble":
                case "multiple_select_quiz":{
                  if(choice && choice.length === 0 || (choice && choice.includes(null))){
                    ok = true;
                    break;
                  }
                  const texts = text.split("|");
                  if(texts.includes(ch[j].answer)){
                    ok = true;
                    break;
                  }
                  break;
                }
                case "quiz":{
                  if(choice === null || typeof choice === "undefined"){
                    ok = true;
                    break;
                  }
                  if(ch[j].answer === text && ch[j].correct === correct){
                    ok = true;
                    break;
                  }
                  break;
                }
                case "open_ended":{
                  if(!correct){
                    ok = true;
                    break;
                  }
                  if(ch[j].answer === text){
                    ok = true;
                    break;
                  }
                  break;
                }
                default:{
                  ok = true;
                }
              }
              if(ok){break;}
            }
            if(!ok){
              return false;
            }
          }
        }
      }
      return true;
    },
    res = [];
  try{
    const keys = (await readJSON("keys.json"))[toFlat(finder.parent.kahoot.quiz.quizQuestionAnswers)];
    for(let i = index || 0;i < index + (globals.DBAmount || 50);i++){
      const item = await readJSON("/objects/" + keys[i] + ".json");
      if(filt(item)){
        res.push(item);
      }
    }
  }catch(e){
    return res;
  }
  return res;
}
async function Searching(term,opts,finder){
  const a = new Search(term,opts);
  try{
    return await a.search(o=>{
      o = o.kahoot;
      if(!finder.parent){
        return false;
      }
      if(!finder.parent.kahoot.quiz){
        return true;
      }
      const mainFilter = ()=>{
          const a = finder.hax.answers;
          let b = false;
          if(!finder.hax.answers.length){
            b = true;
          }
          if(finder.hax.realName){
            return o.title === finder.hax.realName;
          }
          for(let i = 0;i < a.length;++i){
            if(!o.questions[a[i].index].choices){
              continue;
            }
            if(a[i].type !== o.questions[a[i].index].type){
              break;
            }
            // if correct answer matches or is a survey/jumble/info
            if(o.questions[a[i].index].choices.filter(
              k=>{
                const {
                  correct,
                  text,
                  type,
                  choice
                } = a[i];
                switch(type){
                  case "quiz":{
                    // didn't answer, have to assume its good
                    if(choice === null || typeof choice === "undefined"){
                      return true;
                    }
                    return k.correct === correct && k.answer === text;
                  }
                  case "open_ended":{
                    // we don't know the correct answer
                    if(correct === false){
                      return true;
                    }
                    return k.correct === true && k.answer === text;
                  }
                  case "multiple_select_quiz":
                  case "jumble":{
                    if(choice && choice.length && text && !choice.includes(null)){
                      const texts = text.split("|");
                      let c = false;
                      for(let j = 0;j<texts.length;j++){
                        const str = texts[i];
                        if(k.answer === str){
                          c = true;
                          break;
                        }
                      }
                      return c;
                    }else{
                      // no answers!
                      return true;
                    }
                  }
                  // survey, multiple_select_poll, content, word_cloud
                  default:{
                    return true;
                  }
                }
              }
            ).length){
              b = true;
            }
          }
          return b;
        },
        mainFilter2 = ()=>{
          let correct = true;
          for(let i = 0;i<o.questions.length;++i){
            // "content" support
            if(!o.questions[i].choices){
              continue;
            }
            if(o.questions[i].choices.length != finder.parent.kahoot.quiz.quizQuestionAnswers[i]){
              correct = false;
            }
          }
          return correct;
        },
        looseFilter = ()=>{
          const a = finder.hax.answers;
          let b = false;
          if(!finder.hax.answers.length){
            b = true;
          }
          if(finder.hax.realName){
            return o.title === finder.hax.realName;
          }
          for(let i = 0;i < a.length;++i){
            try{
              for(const question of o.questions){
                if(!question.choices){
                  continue;
                }
                if(question.choices.filter(k=>{
                  const {
                    correct,
                    text,
                    type,
                    choice
                  } = a[i];
                  switch(type){
                    case "quiz":{
                      // didn't answer, have to assume its good
                      if(choice === null || typeof choice === "undefined"){
                        return true;
                      }
                      return k.correct === correct && k.answer === text;
                    }
                    case "open_ended":{
                    // we don't know the correct answer
                      if(correct === false){
                        return true;
                      }
                      return k.correct === true && k.answer === text;
                    }
                    case "multiple_select_quiz":
                    case "jumble":{
                      if(choice && choice.length && text && !choice.includes(null)){
                        const texts = text.split("|");
                        let c = false;
                        for(let j = 0;j<texts.length;j++){
                          const str = texts[i];
                          if(k.answer === str){
                            c = true;
                            break;
                          }
                        }
                        return c;
                      }else{
                      // no answers!
                        return true;
                      }
                    }
                    // survey, multiple_select_poll, content, word_cloud
                    default:{
                      return true;
                    }
                  }
                }).length){
                  b = true;
                }
              }
            }catch(e){
              b = false;
              break;
            }
          }
          return b;
        },
        looseFilter2 = ()=>{
          let qc = [];
          for(let i = 0;i<o.questions.length;++i){
            // "content" support
            if(!o.questions[i].choices){
              qc.push(null);
              continue;
            }
            qc.push(o.questions[i].choices.length);
          }
          qc.sort();
          qc = JSON.stringify(qc);
          const qca = JSON.stringify(finder.parent.kahoot.quiz.quizQuestionAnswers.slice(0).sort());
          if(qc === qca){
            return true;
          }
          return false;
        };
      let filter = mainFilter,
        filter2 = mainFilter2;
      if(+finder.parent.options.searchLoosely){
        filter = looseFilter;
        filter2 = looseFilter2;
      }
      return (finder.parent.options.author ? o.creator_username === finder.parent.options.author : true)
      && (o.questions.length === finder.parent.kahoot.quiz.quizQuestionAnswers.length)
      && filter() && filter2();
    });
  }catch(err){
    return [];
  }
}

module.exports = {
  Searching,
  SearchDatabase
};
