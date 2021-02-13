const fs = require("fs"),
  got = require("got"),
  globals = require("../win/globals.js"),
  {mainPath} = globals,
  path = require("path"),
  readJSON = require("./readjson.js"),
  sleep = require("./sleep.js"),
  yauzl = require("yauzl");
async function loadDatabase(){
  globals.ebar(-1);
  globals.KahootDatabaseInitialized = true;
  try{
    globals.keys = await readJSON("keys.json");
  }catch(e){
    globals.KahootDatabaseInitialized = false;
  }
}
module.exports = async function initializeDatabase(){
  if(!process.argv.includes("--enable-database")){
    return loadDatabase();
  }
  if(fs.existsSync(path.join(mainPath,"kdb.json"))){
    fs.unlinkSync(path.join(mainPath,"kdb.json"));
  }
  if(fs.existsSync(path.join(mainPath,"kdb.zip"))){
    fs.unlinkSync(path.join(mainPath,"kdb.zip"));
  }

  if(!fs.existsSync(path.join(mainPath,"latest.txt"))){
    console.log("Generating latest.txt...");
    fs.writeFileSync(path.join(mainPath,"latest.txt"),String(Date.now()));
  }
  if(!fs.existsSync(path.join(mainPath,"keys.json")) || +(fs.readFileSync(path.join(mainPath,"latest.txt"))) + (1000*60*24*7) < Date.now()){
    console.log("Fetching latest database from archive.org...");
    globals.ebar(0);
    const p = got.stream("https://archive.org/download/kahoot-win/json-full.zip").pipe(fs.createWriteStream(path.join(mainPath,"kdb.zip")));
    p.on("error",(e)=>{
      globals.ebar(-1);
      console.log("Failed to save database: " + e);
    });
    p.on("finish",()=>{
      globals.ebar(0.3);
      console.log("Saved database to kdb.zip... Extracting...");
      fs.writeFile(path.join(mainPath,"latest.txt"),String(Date.now()),()=>{});
      yauzl.open(path.join(mainPath,"kdb.zip"),{lazyEntries: true},(err,zip)=>{
        if(err){globals.ebar(-1);return console.log("Failed to extract: " + err);}
        const {entryCount} = zip;
        let i = 0,
          j = 0;
        zip.readEntry();
        zip.on("entry",entry=>{
          if(/\/$/.test(entry.fileName)){
            if(!fs.existsSync(path.join(mainPath,entry.fileName))){
              fs.mkdirSync(path.join(mainPath,entry.fileName));
            }
            i++;
            zip.readEntry();
          }else{
            zip.openReadStream(entry,(err,stream)=>{
              if(err){globals.ebar(-1);return console.log("Failed to extract: " + err);}
              stream.on("end",async ()=>{
                i++;
                j++;
                globals.ebar(0.3 + 0.6*(i/entryCount));
                if(j >= 500){
                  j = 0;
                  await sleep(0.2);
                }
                zip.readEntry();
              });
              stream.pipe(fs.createWriteStream(path.join(mainPath,entry.fileName)));
            });
          }
        });
        zip.once("end",async ()=>{
          globals.ebar(0.9);
          console.log("Database successfully extracted. Removing unneeded files and downloading keys.");
          fs.unlinkSync(path.join(mainPath,"kdb.zip"));
          try{
            const {body} = await got("https://archive.org/download/kahoot-win/full-export-keys-sectioned-2.json");
            fs.writeFile(path.join(mainPath,"keys.json"),body,(e)=>{
              if(e){
                globals.ebar(-1);
                return console.log("err writing keys");
              }
              globals.ebar(0.99);
              loadDatabase();
            });
          }catch(e){
            globals.ebar(-1);
            console.log("Failed: " + e);
          }
        });
      });
    });
  }else{
    console.log("Using loaded database");
    loadDatabase();
  }
};
