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

	app.use(express.static('src'));

});


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



});

var Games = Backbone.Collection.extend({



});




var NewGame = function(data) { 

	var choices = letter_sets.LETTER_CHOICES;

	// Randomize which set is chosen

	var rand_num = Math.floor(Math.random() * choices.length);

	// Set the current set model data

	var set = choices[rand_num];

	// Add the anwers to the answer collection

	var sorted = _.sortBy(choices[rand_num].set , function( obj ) {return obj.a.length;});

	var game_set = new sets.Sets.CurrentSet(set); 

	var game_answers = new sets.Sets.Answers(sorted);

	var game = new Game({

		id : uuid.v1(),

		player_one : data.player_one, 

		player_two : data.player_two,

		player_one_score : "0", 

		player_two_score : "0", 

		set : game_set, 

		answers : game_answers

	}); 

	return game;


};

var updateGame = function(data) {

	var game = games.where({id : data.id});

	var answers = game[0].get("answers");

	var check_answers = answers.where({a : data.answer}); 

	if (check_answers[0] !== undefined && check_answers[0].get("solved") !== true) {

		check_answers[0].set({solved : true});

		if (game[0].get("player_one") === data.player) {

			var player_score_num = "player_one_score";

		} else {

			var player_score_num = "player_two_score";

		}

		var score = game[0].get(player_score_num); 

		var new_score = parseInt(score , 10) + 1; 

		game[0].set(player_score_num , new_score );

		var update_obj = {

			player : data.player, 

			score : new_score, 

			answer : data.answer

		};

		return update_obj; 

	}

};

var sendUpdate = function(data , update) {

	var game = games.where({id : data.id});

	io.sockets.sockets[game[0].get("player_one")].emit("game_updated" , JSON.stringify(update)); 

	io.sockets.sockets[game[0].get("player_two")].emit("game_updated" , JSON.stringify(update));


};



var clients = new Clients();

var games = new Games();


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

	});

	socket.on("request_challenge" , function(data){

		io.sockets.sockets[data.id].emit("challenge_requested" , { id: socket.id });

	}); 

	
	socket.on("challenge_accepted" , function(data){

		var new_game = NewGame(data);

		games.add(new_game);

		io.sockets.sockets[data.player_one].emit("start_challenge" , JSON.stringify(new_game)); 

		io.sockets.sockets[data.player_two].emit("start_challenge" , JSON.stringify(new_game));

	});

	socket.on("game_update" , function(data){

		//console.log(data);

		var update = updateGame(data);

		console.log("Update Obj");

		console.log(update);

		sendUpdate(data , update);

	});

});


