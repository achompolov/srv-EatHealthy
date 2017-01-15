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

const http = require('http');
const ip = addresses;
const port = 5001;
const server = http.createServer();

server.listen(port, ip, () => {
  console.log(`Server running at http://${ip}:${port}`);
});
