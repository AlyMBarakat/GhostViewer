const electron = require("electron");

/*
*
*	Generate captcha
*	
*/
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