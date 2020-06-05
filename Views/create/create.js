//Generate random captcha
console.log('create script');
const electron = require("electron");
const ipc = electron.ipcRenderer;
function getRandomString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}
let captcha = getRandomString(10);

console.log("Generated captcha:");
console.log(captcha);

// Output captcha for user
document.getElementById('captcha').innerHTML = captcha;

//connecting to our signaling server
var conn = new WebSocket('ws://ghost-signallingserver.herokuapp.com');
  
conn.onopen = function () { 
   console.log("Connected to the signaling server"); 
};

var connectedUser;


//when we got a message from a signaling server 
conn.onmessage = function (msg) { 
   console.log("Got message", msg.data);
	
   var data = JSON.parse(msg.data); 
	
   switch(data.type) { 
      case "login": 
         handleLogin(data.success); 
         break; 
      //when somebody wants to call us 
      case "offer": 
         handleOffer(data.offer, data.name); 
         break; 
      case "answer": 
         handleAnswer(data.answer); 
         break; 
      //when a remote peer sends an ice candidate to us 
      case "candidate": 
         handleCandidate(data.candidate); 
         break; 
      case "leave": 
         handleLeave(); 
         break; 
      default: 
         break; 
   }
};
  
conn.onerror = function (err) { 
   console.log("Got error", err); 
};
  
//alias for sending JSON encoded messages 
function send(message) { 
   //attach the other peer username to our messages 
   if (connectedUser) { 
      message.name = connectedUser; 
   } 
	
   conn.send(JSON.stringify(message)); 
};

const remoteVideo = document.getElementById('remoteVideo');


//Start a stream
var yourConn; 
var stream;

//Wait 5 seconds then start streaming
function loadStart(){
   setTimeout(function(){
      name = captcha;
      console.log(name);

      if (name.length > 0) { 
         send({ 
            type: "login", 
            name: name 
         }); 
      }
   }, 5000);
}
loadStart();

function handleLogin(success) { 
   if (success === false) { 
      alert("Ooops...try a different username"); 
   } else { 

      //getting local video stream 
      const mediaStreamConstraints = {
         video: {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                  }
                }
      };
      navigator.getUserMedia(mediaStreamConstraints, function (myStream) { 
         stream = myStream; 
			
         //using Google public stun server 
         var configuration = { 
            "iceServers": [{ "url": "stun:stun2.l.google.com:19302" }]
         }; 
			
         yourConn = new webkitRTCPeerConnection(configuration); 
			yourConn.ondatachannel = receiveChannelCallback;
         // setup stream listening 
         yourConn.addStream(stream);
			
         //when a remote user adds stream to the peer connection, we display it 
         yourConn.onaddstream = function (e) { 
            remoteVideo.srcObject = e.stream; 
         };
			
         // Setup ice handling 
         yourConn.onicecandidate = function (event) { 
            if (event.candidate) { 
               send({ 
                  type: "candidate", 
                  candidate: event.candidate 
               }); 
            } 
         };	
         
      }, function (error) { 
         console.log(error); 
      }); 	
   } 
};

  
//when somebody sends us an offer 
function handleOffer(offer, name) { 
   connectedUser = name;
   yourConn.setRemoteDescription(new RTCSessionDescription(offer));
	
   //create an answer to an offer 
   yourConn.createAnswer(function (answer) { 
      yourConn.setLocalDescription(answer); 
		
      send({ 
         type: "answer", 
         answer: answer 
      }); 
		
   }, function (error) { 
      alert("Error when creating an answer"); 
   }); 
};
  
//when we got an answer from a remote user
function handleAnswer(answer) { 
   yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
};
  
//when we got an ice candidate from a remote user 
function handleCandidate(candidate) { 
   yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
};

function handleLeave() { 
   connectedUser = null; 
   remoteVideo.src = null; 
	
   yourConn.close(); 
   yourConn.onicecandidate = null; 
   yourConn.onaddstream = null; 
};

function receiveChannelCallback(event) {
   receiveChannel = event.channel;
   receiveChannel.onmessage = handleReceiveMessage;

 }


 function handleReceiveMessage(event)
{
  //send data using IPC to main
  ipc.send('robotData-send',event.data);
  //Event listener
  ipc.on('robotData-reply', function(event,arg) {
  });
  
}
