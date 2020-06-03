const electron = require("electron");
// let BrowserWindow = electron.remote.BrowserWindow; //Remote object from main process
// const path = require("path");	//Built in path module
// const url = require("url");		//Built in url modul


var connection = new WebSocket('ws://ghost-signallingserver.herokuapp.com'); 
var name = "";

const joinBtn = document.getElementById('loginBtn');
const connectToOtherUsernameBtn = document.getElementById('connectToOtherUsernameBtn');
const sendMsgBtn = document.getElementById('sendMsgBtn');

var loginInput = document.querySelector('#userName');
var otherUsernameInput = document.querySelector('#captchaInput'); 
var msgInput = document.querySelector('#msgInput'); 

//var loginInput = document.querySelector('#loginInput'); 
//var loginBtn = document.querySelector('#loginBtn'); 

//var otherUsernameInput = document.querySelector('#otherUsernameInput'); 
//var connectToOtherUsernameBtn = document.querySelector('#connectToOtherUsernameBtn'); 
//var msgInput = document.querySelector('#msgInput'); 
//var sendMsgBtn = document.querySelector('#sendMsgBtn'); 

var connectedUser, myConnection, dataChannel;
  
//when a user clicks the login button 
joinBtn.addEventListener("click", function(event) { 
   	name = loginInput.value;//Input userName

	if(name.length > 0) { 
	  send({ 
	     type: "login", 
	     name: name 
	  }); 
	} 
}); 
 
//handle messages from the server 
connection.onmessage = function (message) { 
   console.log("Got message", message.data); 
   var data = JSON.parse(message.data); 
	
   switch(data.type) { 
      case "login": 
         onLogin(data.success); 
         break; 
      case "offer": 
         onOffer(data.offer, data.name); 
         break; 
      case "answer":
         onAnswer(data.answer); 
         break; 
      case "candidate": 
         onCandidate(data.candidate); 
         break; 
      default: 
         break; 
   } 
}; 
 
//when a user logs in 
function onLogin(success) { 

   if (success === false) { 
      alert("oops...try a different username"); 
   } else { 
      //creating our RTCPeerConnection object 
      var configuration = { 
         "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] 
      }; 
		
      myConnection = new webkitRTCPeerConnection(configuration, { 
         optional: [{RtpDataChannels: true}] 
      }); 
		
      console.log("RTCPeerConnection object was created"); 
      console.log(myConnection); 
  
      //setup ice handling 
      //when the browser finds an ice candidate we send it to another peer 
      myConnection.onicecandidate = function (event) { 
		
         if (event.candidate) { 
            send({ 
               type: "candidate", 
               candidate: event.candidate 
            });
         } 
      }; 
      openDataChannel();	
   } 
};
  
connection.onopen = function () { 
   console.log("Connected"); 
}; 
 
connection.onerror = function (err) { 
   console.log("Got error", err); 
};
  
// Alias for sending messages in JSON format 
function send(message) { 
   if (connectedUser) { 
      message.name = connectedUser; 
   }
	
   connection.send(JSON.stringify(message)); 
};

//setup a peer connection with another user 
connectToOtherUsernameBtn.addEventListener("click", function () {
  
    var otherUsername = otherUsernameInput.value;
    connectedUser = otherUsername;
     
    if (otherUsername.length > 0) { 
       //make an offer 
       myConnection.createOffer(function (offer) { 
          console.log(); 
             
          send({ 
             type: "offer", 
             offer: offer 
          }); 
             
          myConnection.setLocalDescription(offer); 
       }, function (error) { 
          alert("An error has occurred."); 
       }); 
    } 
 });
   
 //when somebody wants to call us 
 function onOffer(offer, name) { 
    connectedUser = name; 
    myConnection.setRemoteDescription(new RTCSessionDescription(offer));
     
    myConnection.createAnswer(function (answer) { 
       myConnection.setLocalDescription(answer); 
         
       send({ 
          type: "answer", 
          answer: answer 
       }); 
         
    }, function (error) { 
       alert("oops...error"); 
    }); 
 }
 
 //when another user answers to our offer 
 function onAnswer(answer) { 
    myConnection.setRemoteDescription(new RTCSessionDescription(answer)); 
 }
   
 //when we got ice candidate from another user 
 function onCandidate(candidate) { 
    myConnection.addIceCandidate(new RTCIceCandidate(candidate)); 
 }


 //creating data channel 
function openDataChannel() { 

    var dataChannelOptions = { 
       reliable:true 
    }; 
     
    dataChannel = myConnection.createDataChannel("myDataChannel", dataChannelOptions);
     
    dataChannel.onerror = function (error) { 
       console.log("Error:", error); 
    };
     
    dataChannel.onmessage = function (event) { 
       console.log("Got message:", event.data); 
    };  
 }
   
 //when a user clicks the send message button 
 sendMsgBtn.addEventListener("click", function (event) { 
    console.log("send message");
    var val = msgInput.value; 
    dataChannel.send(val); 
 });



















/*
*
*
* OLD JOIN
*
*/

/*

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
	let userName = document.getElementById('captchaInput').value; //Input UserName
	let captcha = document.getElementById('captchaInput').value; //Input captcha
	console.log(userName);
	console.log(captcha);
	
	//createRendererWindow(workURL);
	

	//Request joint WebRTC

});

*/