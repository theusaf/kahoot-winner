const fs = require("fs"),
  path = require("path"),
  mainScript = fs.readFileSync(path.join(__dirname, "kahoot.js"), "utf8")
    .replace(/let(.|\n)*?electron"\);\n}\n/, "")
    .replace(/if\(electron(.|\n)*/m, "");

fs.writeFileSync(path.join(__dirname, "kahoot.js"), mainScript);

const indexHTML = fs.readFileSync(path.join(__dirname, "src/in/index.html"), "utf8")
  .replace(/<script src="\/ext\/https:\/\/www.google.com\/recaptcha.*?$/m, "");

fs.writeFileSync(path.join(__dirname, "src/in/index.html"), indexHTML);

const indexJS = fs.readFileSync(path.join(__dirname, "src/in/index.js"), "utf8")
  .replace(/execute\(.*?\)/m, "ready()")
  .replace(/this\.pin = pin;/m, "this.pin = pin;\nconst grecaptcha = {ready: (f)=>{return new Promise((r) => {f();r();});}};");

fs.writeFileSync(path.join(__dirname, "src/in/index.js"), indexJS);

const pkg = fs.readFileSync(path.join(__dirname, "package.json"), "utf8")
  .replace(/electron \./m, "node kahoot.js");

fs.writeFileSync(path.join(__dirname, "package.json"), pkg);
