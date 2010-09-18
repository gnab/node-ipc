var net = require('net');

var socketPath = '/tmp/node-ipc.sock';
var clients = [];

createClient();

function createServer () {
  console.log('Creating server...');
  clients = {};

  var server = net.createServer(function(stream) {
    stream.setEncoding('utf8');
    stream.on('connect', function() {
      console.log('Connect event');
    });
    stream.on('data', function(data) {
      var parsedData = JSON.parse(data);
      clients[parsedData.pid] = stream;

      broadcastPids();
    });
    stream.on('close', function(had_error) {
    });
    stream.on('end', function() {
      removeClientStream(stream);
      broadcastPids();
      stream.end();
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
  console.log('Creating client...');

  var client = new net.Stream();
  client.connect(socketPath);

  client.on('connect', function() {
    client.write(JSON.stringify({pid: process.pid}));
  });

  client.on('data', function(data) {
    var json = JSON.parse(data);
    clients = json.pids;
  });

  client.on('error', function() {
    if (!clients.length || 
	parseInt(clients[0], 10) === process.pid) {
      createServer();
    }
    else {
      createClient();
    }
  });

  client.on('end', createClient);
}

function broadcastPids() {
  var pids = [];
  for (var pid in clients) {
    pids.push(pid);
  };

  for (var pid in clients) {
    clients[pid].write(JSON.stringify({pids: pids}));
  }
}

function removeClientStream(stream) {
  for (var pid in clients) {
    var clientStream = clients[pid];

    if (clientStream === stream) {
      delete clients[pid];
      break;
    }
  }
}
