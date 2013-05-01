var express = require('express')

	, app = express()

	, server = require('http').createServer(app) 

	, io = require('socket.io').listen(server)

	, underscore = require("underscore")

	, backbone = require("backbone");



app.configure(function() {

	app.set('port', process.env.PORT || 3000);

	app.use(express.static('src'))

})


app.get('/', function (req, res) {

  console.log(req.sessionID);

  res.sendfile('src/index.html');

});

var clients = [];


////

var games = []; 

server.listen(3000);

//console.log("hello world"); 

io.sockets.on('connection', function (socket) {

	clients.push(socket.id);

	socket.emit('user', { id: socket.id});

	socket.emit('users_updated' , {ids: clients });

	socket.broadcast.emit('users_updated' , {ids: clients }); 

	socket.on('disconnect' , function() {

		clients.splice(clients.indexOf(socket.id), 1);

	})

  //socket.on('my other event', function (data) {

    //console.log(data);

  //});

});
