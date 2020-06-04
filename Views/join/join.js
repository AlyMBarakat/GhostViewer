//UI: Electron Browser window requirments
const electron = require("electron");
const ipc = electron.ipcRenderer;
let BrowserWindow = electron.remote.BrowserWindow; //Remote object from main process
const path = require("path"); //Built in path module
const url = require("url");   //Built in url modul


const connectToOtherUsernameBtn = document.getElementById('connectToOtherUsernameBtn');

  
//URLs
let vStreamURL = { //index HTML file object
  pathname: path.join(__dirname, '../vStream/index.html'),
  protocol: 'file',
  slashes: true
}


//Create window using remote module
function createRendererWindow(urlObj) {
  let remoteWin = new BrowserWindow({webPreferences: {nodeIntegration: true}});  //Remote object of Browser Window
  remoteWin.setFullScreen(true);
  remoteWin.loadURL(url.format(urlObj)); //send IPC message
  remoteWin.webContents.openDevTools();
}

//On button click: get captcha and request join
connectToOtherUsernameBtn.addEventListener('click', function() { 
  console.log("join-request");
  let userName = document.getElementById('userName').value; //Input UserName
  let captcha = document.getElementById('captchaInput').value; //Input captcha
  console.log(userName);
  console.log(captcha);

  let userData = {
    un: userName,
    cap: captcha
  };
  
  ipc.send('userData-send',userData);

  //Event listener
  ipc.on('userData-Reply', function(event,arg) {
    console.log(arg);
  });

  createRendererWindow(vStreamURL);
});