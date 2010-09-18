var net = require('net');
var socketPath = '/tmp/node-ipc.sock';

if (process.args[2] === 'client') {
  createClient();
}
else {
  createServer();
};

function createServer () {
  var server = net.createServer(function(stream) {
    stream.setEncoding('utf8');
    stream.on('connect', function() {
      console.log('Connect event');
      stream.write('hello from ' + process.pid); 
    });
    stream.on('data', function(data) {
      console.log('received: ' + data); 
    });
    stream.on('close', function(had_error) {
      console.log('Stream closed (error = ' + had_error + ')');
    });
  });

  server.listen(socketPath, function() {
    console.log(process.pid + ' is listening!');
  });

  server.on('close', function() {
    console.log(process.pid + ' is closing');
  });
}

function createClient() {
  var client = new net.Stream();
  client.connect(socketPath);

  client.on('data', function(data) {
    console.log('Received data from server: ' + data);
  });

  client.on('end', function() {
    console.log('Connection to server ended');
  });
}
