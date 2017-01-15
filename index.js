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
    console.log(`Client with IP:${clientIp} Disconnected`);
  });
});
