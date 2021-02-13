# This git repo is the source code for the app from https://kahoot-win.herokuapp.com
## This repo will be updated every once in a while. You can still decompile the source from the apps:
- https://kahoot-win.herokuapp.com/blog/download

To use, clone this repository, and run:

`npm install`

When run, it will create an electron window and run the app at localhost:2000, or at whatever port is set in the global environment variable `PORT`

You may modify the code to remove the electron stuff.

**Important: The latest version uses recaptcha v3**
- You need to create a recaptcha account and add your site domain (unless you are just using it as localhost)
- This means that you need to modify `index.html` and `index.js` to use your recaptcha public keys
- See reformatting below

The app doesn't actually verify the requests, so you can actually just remove all things related to recaptcha

Remember to give credit to theusaf for this.

## Requirements
- At least 1GB RAM. If you only have 512 MB, you will need to make changes to store the database in disk instead of memory.
- At least 200 MB. (This requirement may change in the future, ~500MB is recommended.)
- Suggested packages:
  - quick.db (storage in file system)
  - json-stream (StreamObject - minimal memory usage to loop through the JSON database from archive.org)
  - Examples to come later.

Alternatively, I have uploaded various versions of the files in [archive.org](https://archive.org/download/kahoot-win)
- ~`full-export.json`~ (The full JSON object with all the kahoots.) - **deprecated, not updated**
- ~`full-export-sectioned.json`~ (The full JSON object, split into 255 parts ("00" - "ff").) - **deprecated, not updated**
- `full-export-keys.json` (The list of keys to use.)
- `full-export-keys-sectioned.json` (The list of keys to use, grouped by question amount)
- `full-export-keys-sectioned-2.json` (The list of keys to use, grouped by sorted question map)
  - ex:
  ```json
    {
      "24444444N": ["..."]
    }
  ```
  - Where `N` means `null` (no choices) and `2` means there are two choices in the question
    - This is sorted, so the actual question map might look like: `[4,4,2,4,4,4,null,4,4]`
- `json.zip` A zip file with sub files (00 - ff) containing json quiz objects. (Files stored in a folder named "json")
- `json-full.zip` A zip file containing all items. (Stored in a folder named "json-full")

## Enable Database
As of version 6.0.0, Kahoot Winner no longer automatically downloads the database by default. Add `--enable-database` when running the app to enable this functionality.

## Reformat for use in non-gui devices
Just run the following command:
```bash
npm run reformat
```
This uses the power of regular expressions to get rid of the things you do not need!

**OR**

Simply append `--disable-electron` when starting the app:
```bash
node kahoot.js --disable-electron
```

**OR**

1. Comment out lines 1-4.
  ```js
  /*let electron;
  if(!process.argv.includes("--disable-electron")){
    electron = require("electron");
  }*/
  const compression = require("compression");
  ...
  ```
2. Remove electron application functions
- (the lines that looks like these)
  ```js
  function createWindow () {
    // Create the browser window.
    let win = new electron.BrowserWindow({
      width: 1000,
      height: 700,
      webPreferences: {
        nodeIntegration: true
      }
    })

    // and load the index.html of the app.
    win.loadURL('http://localhost:2000');
  }

  electron.app.whenReady().then(createWindow);

  electron.app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      electron.app.quit();
    }
  });

  electron.app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  ```
3. You are all set! You might want to make a few changes:
  - `npm uninstall electron`
  - `npm uninstall electron-builder`
  - in `package.json` change `start` to `node kahoot.js`

### Use in Heroku
1. Simply follow the steps above for non-gui devices
2. Then create a `Procfile`
```
web: node kahoot.js
```
3. Publish your site and start winning!
