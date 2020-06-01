const electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow; //Remote object from main process
const path = require("path");	//Built in path module
const url = require("url");		//Built in url module

let urlObj = { //HTML file object
	pathname: path.join(__dirname, '../stream/stream.html'),
	protocol: 'file',
	slashes: true
}

const joinBtn = document.getElementById('joinBtn');

//Create window using remote module
function createStreamWindow(urlOBJ) {
	let remoteWin = new BrowserWindow({webPreferences: {nodeIntegration: true}});  //Remote objecc of Browser Window
	remoteWin.setFullScreen(true)
	remoteWin.loadURL(url.format(urlOBJ)); //send IPC message
	remoteWin.webContents.openDevTools();
}

//On button click: get captcha and reques join
joinBtn.addEventListener('click', function() { 
	console.log("join-request");
	let captcha = document.getElementById('captchaInput').value; //Input captcha form user
	console.log(captcha);
	/*
	*
	* Request joint WebRTC
	*
	*/
	createStreamWindow(urlObj);
});
