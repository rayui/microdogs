
// Runs the dashboard server
// Usage: node server.js <BEARER_TOKEN> <SERVER_PORT>

// Sever init
var express = require('express');
var path = require('path');
var consolidate = require('consolidate');
var app = express();
app.engine('handlebars', consolidate.handlebars);
app.set('views', __dirname + '/site');
app.use(express.bodyParser());

var PORT = process.argv[3] || 80;
console.log('PORT', PORT);

var socket;

app.get('/dashboard', function (req, res) {

  var templateData = {
    test: 'value'
  };

  app.render('dashboard.html.handlebars', templateData, function (err, html) {
    if (err) {
      console.log(err);
      res.send(500, { error: err });
    } else {
      res.set('Content-Type', 'text/html');
      res.set('Cache-Control', 'no-cache');
      res.send(html);
    }
  });
});

// TODO Start dashboard
app.post('/toggleStart', function (req, res) {
  console.log(req.body);
  
  // Just returns 200
  res.setHeader('Content-Type', 'application/json');
  res.end();
});

// Testing endpoint
app.post('/deploy', function (req, res) {
  
  if (socket) {
    socket.onDeploy({
      status:"started"
    });
  }
  
  // Just returns 200
  res.setHeader('Content-Type', 'application/json');
  res.end();
});

app.post('/shock/on', function (req, res) {
  socket.emit('shocker', {
    on: true
  });
  
  // Just returns 200
  res.setHeader('Content-Type', 'application/json');
  res.end();
});

app.post('/shock/off', function (req, res) {
  socket.emit('shocker', {
    on: false
  });
  
  // Just returns 200
  res.setHeader('Content-Type', 'application/json');
  res.end();
});



function serveDir (dir) {
  app.get(dir + ':file', function (req, res) {
    var file = req.params.file;
    var filePath = path.normalize(__dirname + '/site' + dir + file);
    console.log('Sending file: '+ filePath);
    res.set('Cache-Control', 'no-cache');
    res.sendfile(filePath);
  });
}

serveDir('/assets/css/');
serveDir('/assets/fonts/');
serveDir('/assets/js/');
serveDir('/assets/imgs/');

var server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(PORT);

io.sockets.on('connection', function (connectedSocket) {
  socket = connectedSocket;

  var MicroDogsPoller = require('./microdogs_poller');
  var MicroDogsController = require('./microdogs_controller').MicroDogsController;
  var microdogsController = new MicroDogsController(socket);

  socket.onDeploy = function (deploy) {
    socket.emit('deploy', deploy);
    microdogsController.announceDeploy(deploy);
  };

  MicroDogsPoller.start(socket.onDeploy);
});

console.log('URL:');
console.log('GET http://localhost:' + PORT + '/dashboard');
// NOT IMPLEMENTED
//console.log('POST http://localhost:' + PORT + '/toggleStart');
console.log('POST http://localhost:' + PORT + '/microdogs/likes');
console.log('POST http://localhost:' + PORT + '/microdogs/on');
console.log('POST http://localhost:' + PORT + '/microdogs/off');
