const path = require("path");
module.exports = {
  BruteForces: [[0,1,2,3],[0,1,3,2],[0,2,1,3],[0,2,3,1],[0,3,2,1],[0,3,1,2],[1,0,2,3],[1,0,3,2],[1,2,0,3],[1,2,3,0],[1,3,0,2],[1,3,2,0],[2,0,1,3],[2,0,3,1],[2,1,0,3],[2,1,3,0],[2,3,0,1],[2,3,1,0],[3,0,1,2],[3,0,2,1],[3,1,0,2],[3,1,2,0],[3,2,0,1],[3,2,1,0]],
  DBAmount: 500,
  handshakeVotes: [],
  KahootDatabaseInitialized: false,
  mainPath: process.argv.includes("--disable-electron") ? path.join(__dirname,"../../") : path.join((require("electron").app || require("electron").remote.app).getPath("appData"),"Kahoot Winner"),
  startupDate: Date.now(),
  ebar: () => {},
  keys: {}
};
