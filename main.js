const fs = require("fs");
const { app, BrowserWindow } = require("electron");
const ElectronStore = require("electron-store");
const configs = new ElectronStore();

var mainURL = "http://www.pointel.com.br/";
if (fs.existsSync(__dirname + "/mainURL.txt")) {
  mainURL = fs.readFileSync(__dirname + "/mainURL.txt").toString();
}

function createWindow() {
  mainOptions = {
    icon: __dirname + "/favicon.ico",
    show: false,
  };
  Object.assign(mainOptions, configs.get("winBounds"));

  const mainWindow = new BrowserWindow(mainOptions);
  mainWindow.removeMenu();
  mainWindow.loadURL(mainURL);

  mainWindow.once("ready-to-show", mainWindow.show);
  mainWindow.on("close", () => {
    configs.set("winBounds", mainWindow.getBounds());
  });
  mainWindow.webContents.on(
    "new-window",
    (event, url, frameName, disposition, options, additional) => {
      event.preventDefault();
      Object.assign(options, mainWindow.getBounds());
      event.newGuest = new BrowserWindow(options);
      event.newGuest.removeMenu();
      event.newGuest.loadURL(url);
    }
  );
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  }); 
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
