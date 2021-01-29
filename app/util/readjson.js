const fs = require("fs"),
  globals = require("../win/globals.js"),
  path = require("path");
module.exports = function ReadItem(item){
  return new Promise(function(resolve, reject) {
    let pth = path.join(globals.mainPath,"json-full",item);
    if(item === "keys.json"){
      pth = path.join(globals.mainPath,item);
    }else if(item.indexOf("/objects/") === 0){
      pth = path.join(globals.mainPath,"json-full",item.split("/objects/")[1]);
    }
    fs.readFile(pth,"utf8",(err,data)=>{
      if(err){return reject();}
      resolve(JSON.parse(data));
    });
  });
};
