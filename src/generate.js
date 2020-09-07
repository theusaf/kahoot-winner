const locales = require("./locales.json");
const fs = require("fs");
const path = require("path");
const minify = require("minify");
const options = {
  html: {
    removeAttributeQuotes: false,
    removeEmptyAttributes: false,
    removeEmptyElements: false,
    removeOptionalTags: false
  }
};

const oldlog = console.log;
console.log = function(m){
  if(typeof m !== "string"){
    return oldlog(m);
  }
  oldlog(m + "\x1b[0m");
};

const c = {
  g: "\x1b[32m",
  r: "\x1b[31m",
  y: "\x1b[33m",
  b: "\x1b[34m"
};

async function run(){
  console.log(`${c.b}Reading directory...`);
  const files = fs.readdirSync(path.join(__dirname,"in"));
  console.log(c.b + "- " + files.join("\n- ") + "\n");
  console.log(`${c.b}Generating translated versions...`);
  if(!fs.existsSync(path.join(__dirname,"out"))){
    fs.mkdirSync(path.join(__dirname,"out"));
  }
  for(let lang in locales){
    // replace missing with english.
    if(lang === "en"){
      for(let item in locales.en){
        for(let l2 in locales){
          if(l2 === "en"){continue;}
          if(!locales[l2][item]){
            console.log(`${c.y}Item ${item} does not exist in ${l2}. Using english default.`);
            locales[l2][item] = locales.en[item];
          }
        }
      }
    }
    for(let file of files){
      if(!/\.(html|js|css)/gi.test(file)){
        console.log(`${c.y}Skipping ${file}.`);
        continue;
      }
      console.log(`${c.b}Translating ${file} (${lang})...`);
      let f = fs.readFileSync(path.join(__dirname,"in",file),"utf8");
      f = f.replace(/§LangCode§/mg,lang);
      for(let item in locales[lang]){
        const regex = new RegExp(`§${item.replace(/\\/mg,"\\\\").replace(/\(/gm,"\\(").replace(/\[/gm,"\\[").replace(/\./gm,"\\.").replace(/\?/gm,"\\?").replace(/\$/gm,"\\$").replace(/\^/gm,"\\^").replace(/\*/gm,"\\*").replace(/\|/gm,"\\|")}§`,"mg");
        f = f.replace(regex,locales[lang][item]);
      }
      if(!fs.existsSync(path.join(__dirname,"out",lang))){
        fs.mkdirSync(path.join(__dirname,"out",lang));
      }
      fs.writeFileSync(path.join(__dirname,"out",lang,file),f,"utf8");
      console.log(`${c.b}Minifying...`);
      try{
        const min = await minify(path.join(__dirname,"out",lang,file),options);
        fs.writeFileSync(path.join(__dirname,"out",lang,file),min,"utf8");
        console.log(`${c.g}Done.`);
        if(min.includes("§")){
          console.log(`${c.y}${file} (${lang}) has unfinished translations.`);
          const matchRegex = /(.){0,10}§.*?§(.){0,10}/gm;
          const matches = min.match(matchRegex);
          for(let i = 0; i < matches.length; i++){
            console.log(`${c.y}- ...${c.r}${matches[i]}${c.y}... <-- HERE`);
          }
        }
      }catch(e){
        console.log(`${c.r}Failed:`);
        console.log(e);
      }
    }
  }
  console.log(`${c.g}Process complete.`);
}
run();
