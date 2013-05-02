var express = require('express')

	, app = express()

	, server = require('http').createServer(app) 

	, io = require('socket.io').listen(server)

	, _ = require("underscore")._

	, Backbone = require("backbone")

	, uuid = require('uuid')

	, sets = require("./src/app/twist/twistapp.sets.js")

	, letter_sets = require("./src/app/letter_sets.js"); 


app.configure(function() {

	app.set('port', process.env.PORT || 3000);

	app.use(express.static('src'))

})


app.get('/', function (req, res) {

  //console.log(req.sessionID);

  res.sendfile('src/index.html');

});

var Client = Backbone.Model.extend({



});

var Clients = Backbone.Collection.extend({

	model : Client 


});

var Game = Backbone.Model.extend({



})

var Games = Backbone.Collection.extend({



})

var choices = letter_sets.LETTER_CHOICES;

// Randomize which set is chosen

var rand_num = Math.floor(Math.random() * choices.length);

// Set the current set model data

var set = choices[rand_num];

// Add the anwers to the answer collection

var sorted = _.sortBy(choices[rand_num].set , function( obj ) {return obj.a.length;});


var NewGame = function(data) { 

	//console.log("New Game init for " + data.player_one + " and " + data.player_two);



	var game = new Game({

		id : uuid.v1(),

		player : data.player_one, 

		player2 : data.player_two, 

		//options : options, 

		//set : set,

	})

}



var clients = new Clients();

var games = new Games();


////

var games = []; 

server.listen(3000);

//console.log("hello world"); 

io.sockets.on('connection', function (socket) {

	clients.add({player : socket.id});

	socket.emit('user', { id: socket.id});

	socket.emit('users_updated' , JSON.stringify(clients));

	socket.broadcast.emit('users_updated' , JSON.stringify(clients)); 

	socket.on('disconnect' , function() {

		var models = clients.where({player : socket.id});

		clients.remove(models[0]);

	})

	socket.on("request_challenge" , function(data){

		io.sockets.sockets[data.id].emit("challenge_requested" , { id: socket.id });

	}); 

	
	socket.on("challenge_accepted" , function(data){

		var new_game = NewGame(data);

	})
	


});


