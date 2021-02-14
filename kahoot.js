let electron;
if(!process.argv.includes("--disable-electron")){
  electron = require("electron");
}
const dotenv = require("dotenv"),
  express = require("express"),
  path = require("path"),
  ip = require("ip"),
  http = require("http"),
  got = require("got"),
  globals = require("./app/win/globals.js"),
  app = express();

dotenv.config({
  path: path.join(globals.mainPath, ".env")
});

const port = process.env.PORT || 2000,
  server = http.createServer(app);

server.once("error",()=>{
  // probably port already in use
  console.log("Port used, assuming kahoot-win already active");
});
console.log(ip.address() + ":" + port);
console.log("Using version " + require("./package.json").version);

require("./app/win/websocket.js")(server);
require("./app/win/router.js")(app);
require("./app/site/other.js")(app);

// 404 Page
app.use((req,res)=>{
  res.status(404);

  // respond with html page
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname,"public","404.html"));
    return;
  }

  // respond with json
  if (req.accepts("json")) {
    res.json({error:"Not found",message:"Visit https://kahoot-win.com",status:404});
    return;
  }

  // default to plain-text. send()
  res.type("txt").send("[404] I think you made a typo! Try going to https://kahoot-win.com/");
});

let started = false;
got({
  timeout: 2000,
  host: "localhost",
  protocol: "http:",
  port
}).then(() => {
  console.log("App already launched.");
  started = true;
}).catch(() => {
  require("./app/util/initializeDatabase.js")();
  server.listen(port);
  started = true;
});

if(electron){
  function createWindow () {
    if(!started) {
      return setTimeout(createWindow,1e3);
    }

    // Create the browser window.
    const win = new electron.BrowserWindow({
      width: 1100,
      height: 750,
      webPreferences: {
        nodeIntegration: true
      }
    });

    globals.ebar(-1);

    globals.ebar = (p)=>{
      try{
        win.setProgressBar(p);
      }catch(e){
        globals.ebar = ()=>{};
      }
    };

    if(!globals.KahootDatabaseInitialized){
      globals.ebar(0);
    }

    // and load the index.html of the app.
    win.loadURL("http://localhost:" + process.env.PORT || 2000);

    win.on("close",async evt=>{
      const {response} = await electron.dialog.showMessageBox({
        buttons: ["No","Yes"],
        message: "Are you sure you want to close the app?",
        title: "Exit app"
      });
      if(response === 1){
        win.destroy();
      }else{
        evt.preventDefault();
      }
    });
  }

  electron.app.whenReady().then(createWindow);

  electron.app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      electron.app.quit();
    }
  });

  electron.app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
