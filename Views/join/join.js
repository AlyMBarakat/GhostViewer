const electron = require("electron");




const joinBtn = document.getElementById('joinBtn');

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
});
