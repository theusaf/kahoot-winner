const globals = require("./globals.js"),
  Search = require("kahoot-search"),
  readJSON = require("../util/readjson.js");

module.exports.SearchKahoot = function SearchKahoot(term,options){
  const query = new Search(term,options);
  return query.search().then((list)=>{
    return list;
  }).catch(()=>{
    return [];
  });
};
module.exports.SearchDatabase = async function SearchDatabase(term,options,length,client){
  if(!globals.KahootDatabaseInitialized){
    return [];
  }
  const {keys} = globals,
    itemKeys = keys[length],
    index = client.databaseIndex,
    results = [];
  for(let i = index; i < index + globals.DBAmount && i < itemKeys.length; i++){
    const item = await readJSON(`/objects/${itemKeys[i]}.json`);
    results.push(item);
  }
  return results;
};
