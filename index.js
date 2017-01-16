/* Crypto text */
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

/* Take IPv4 of the machine */
var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

/* Start the server on the IPv4 and on random port*/
const app = require('express')();
const http = require('http').Server(app);
const ip = addresses;
const port = 3355//Math.floor(1000 + Math.random() * 9000);
const socketIO = require('socket.io')(http);

http.listen(port, ip, function() {
  console.log(`Server running at http://${ip}:${port}`);
});

socketIO.on('connection', function(socket){
  var clientIp = socket.request.connection.remoteAddress;

  console.log(`Client with IP:${clientIp} has Connected.`);

  socket.on('disconnect', function() {
    console.log(`Client with IP:${clientIp} has Disconnected`);
  });

  /* client clicked signUpButton */
  socket.on('signUpClicked', function(signUpData) {
    var signUpDataArray = signUpData.split(' | ');

    var fullName = signUpDataArray[0].split(' ');//Separatin first and last name
    var firstName = fullName[0];
    var lastName = fullName[1];

    var email = signUpDataArray[1];
    var username = signUpDataArray[2];
    var password = encrypt(signUpDataArray[3]);

    var birthDate = signUpDataArray[4];

    var gender = signUpDataArray[5];

    console.log(`firstName: ${firstName}\nlastName: ${lastName}\nemail: ${email}\nusername${username}\npassword: ${password}\nbirthDate: ${birthDate}\ngender: ${gender}\n`);
  });

  /* client clicked logInButton */
  socket.on('logInClicked', function(logInData) {
    var logInDataArray = logInData.split(' | ');
    var username = logInDataArray[0];
    var password = encrypt(logInDataArray[1]);

    console.log(`username: ${username}\npassword: ${password}\n`);
  });
});
