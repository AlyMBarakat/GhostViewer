const electron = require("electron");

/*
*
*	Generate captcha
*	
*/
let captcha = 'Qwer123Ty';

console.log("Generated captcha:");
console.log(captcha);

document.getElementById('captcha').innerHTML = captcha;// Output captcha for user 