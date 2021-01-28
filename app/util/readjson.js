const fs = require("fs"),
  globals = require("../win/globals.js"),
  path = require("path");
module.exports = function ReadItem(item){
  return new Promise(function(resolve, reject) {
    fs.readFile(path.join(globals.mainPath,"json-full",item),"utf8",(err,data)=>{
      if(err){return reject();}
      resolve(JSON.parse(data));
    });
  });
};
