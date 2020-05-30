console.log("main process working");

const electron = require("electron"); //including electron
const app = electron.app;						//Including app sub-module
const BrowserWindow = electron.BrowserWindow;	//Including BrowserWindow sub-module
const path = require("path");	//Built in path module
const url = require("url");		//Built in url module


//window variables
let win;

//URLs
let indexURL = { //index HTML file object
	pathname: path.join(__dirname, 'Views/index/index.html'),
	protocol: 'file',
	slashes: true
}

function createWindow() {
	win = new BrowserWindow(); //Create window
	win.loadURL(url.format(indexURL)); //Load index HTML file in window
	
	//open Developer tools for debugging
	//win.webContents.openDevTools();
	
	win.on('closed', () => {win = null;}); //Handle closing window
}


//Execute create window
app.on('ready', createWindow);


//MAC(UNIX) extra features handling
app.on('window-all-closed', () => {
	if(process.platform !== 'darwin'){
		app.quit();
	}
});
app.on('activate', () => {
	if(win === null){
		createWindow();
	}
});