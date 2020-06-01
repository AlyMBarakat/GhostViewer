const electron = require("electron");
let BrowserWindow = electron.remote.BrowserWindow; //Remote object from main process
const path = require("path");	//Built in path module
const url = require("url");		//Built in url modul
const joinBtn = document.getElementById('joinBtn');
//URLs
let workURL = { //index HTML file object
	pathname: path.join(__dirname, '../stream/index.html'),
	protocol: 'file',
	slashes: true
}

//Create window using remote module
function createRendererWindow(urlObj) {
	let remoteWin = new BrowserWindow();  //Remote object of Browser Window
	remoteWin.setFullScreen(true);
	remoteWin.loadURL(url.format(urlObj)); //send IPC message
	remoteWin.webContents.openDevTools();
}

//On button click: get captcha and request join
joinBtn.addEventListener('click', function() { 
	console.log("join-request");
	let captcha = document.getElementById('captchaInput').value; //Input captcha form user
	console.log(captcha);
	
	createRendererWindow(workURL);
	/*
	*
	* Request joint WebRTC
	*
	*/
});