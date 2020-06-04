const electron = require("electron");
const ipc = electron.ipcRenderer;

//our username 
var name; 
var connectedUser;
var userData = {
   un: null,
   cap: null
}


ipc.send('userData-get',userData);

//Event listener
ipc.on('userData-set', function(event,arg) {
   userData = arg;
   console.log(arg);
});

//connecting to our signaling server
var conn = new WebSocket('ws://ghost-signallingserver.herokuapp.com');
  
conn.onopen = function () { 
   console.log("Connected to the signaling server"); 
};

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

//****** 
//UI selectors block 
//******
 
var loginPage = document.querySelector('#loginPage'); 
var callPage = document.querySelector('#callPage'); 

var callBtn = document.querySelector('#callBtn'); 
var hangUpBtn = document.querySelector('#hangUpBtn');
  
//const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

var yourConn; 
var stream;
  
callPage.style.display = "none";

function loadStart(){
   setTimeout(function(){
      name = userData.un;
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
      
      loginPage.style.display = "none";
      callPage.style.display = "block";
       
      //********************** 
      //Starting a peer connection 
      //********************** 
		
      //getting local video stream 
      const mediaStreamConstraints = {
         video: {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                    // chromeMediaSourceId: source.id,
                    // minWidth: 1280,
                    // maxWidth: 1280,
                    // minHeight: 720,
                    // maxHeight: 720
                  }
                }
      };
      navigator.getUserMedia(mediaStreamConstraints, function (myStream) { 
         stream = myStream; 
			
         //displaying local video stream on the page 
         //localVideo.srcObject = myStream;
			
         //using Google public stun server 
         var configuration = { 
            "iceServers": [{ "url": "stun:stun2.l.google.com:19302" }]
         }; 
			
         yourConn = new webkitRTCPeerConnection(configuration); 
			
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

//initiating a call 
callBtn.addEventListener("click", function () { 
   //var callToUsername = callToUsernameInput.value;
   var callToUsername = userData.cap;

   if (callToUsername.length > 0) { 

      connectedUser = callToUsername;
      console.log(connectedUser);
      
      // create an offer 
      yourConn.createOffer(function (offer) { 
         send({ 
            type: "offer", 
            offer: offer 
         }); 
         
         yourConn.setLocalDescription(offer); 
      }, function (error) { 
         alert("Error when creating an offer"); 
      });  
   }    
});
  
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

//hang up 
hangUpBtn.addEventListener("click", function () { 

   send({ 
      type: "leave" 
   });  
	
   handleLeave(); 
});
  
function handleLeave() { 
   connectedUser = null; 
   remoteVideo.src = null; 
	
   yourConn.close(); 
   yourConn.onicecandidate = null; 
   yourConn.onaddstream = null; 
};