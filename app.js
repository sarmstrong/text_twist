var express = require('express');

var app = express();

var server = require('http').createServer(app); 

var routes = require('./routes'); 

var http = require('http'); 

var path = require('path');

/// Overwrite default ejs template sites to play "nice" with underscore templates

var ejs = require('ejs');

ejs.open = '{{';

ejs.close = '}}';

// The magic behind websockets!!!!

var io = require('socket.io').listen(server); 

// Reuse underscore and backbone on the server

var  _ = require("underscore")._ ; 

var Backbone = require("backbone"); 

// Used for creating unique game ids

var uuid = require('uuid'); 

var sets = require("./public/app/twist/twistapp.sets.js"); 

var letter_sets = require("./public/app/letter_sets.js"); 

var cookieParser = express.cookieParser('IDf~BE#j2@MAs?DOl#2yAoU4_h+De');

// Require modules for session storage

var RedisStore = require('connect-redis')(express);

var redis = require("redis");

if (app.settings.env === "development") {

	var client = redis.createClient();


} else if (app.settings.env === "production") {

	var port = process.env.REDIS_PORT; 

	var host = process.env.REDIS_HOST; 

	var auth = process.env.REDIS_AUTH;  

	var client = redis.createClient(parseInt(port) , host);

	client.auth(auth , function(err) {

		if (err) {

			console.log(err);

		}

	})

}





var sessionStore = new RedisStore({client: client}); 

// Configure App

app.configure(function() {

	app.set('port', process.env.PORT || 3000);

	app.use(express.bodyParser({ keepExtensions: true }));

	/// Used to show assets like js, css , etc

	app.use(cookieParser);

	app.use(express.session({

      store: new RedisStore({client: client}), 

      maxAge  : new Date(Date.now() + 3600000), //1 Hour

      expires : new Date(Date.now() + 3600000) //1 Hour

	}));

	app.use(app.router);

	app.set('views', __dirname + '/views');

    app.set('view engine', 'ejs');
  

	app.use(express.static(path.join(__dirname, 'public')));

});

/// Displays index file


app.get('/', routes.index);

app.post('/login' , function(req , res){



	if (req.body.username !== undefined ) {

		req.session.username = req.body.username; 

	}

	res.redirect("/");


});

app.get('/logout' , function(req , res){

	req.session.destroy(function()  {

		res.redirect("/");

	}); 

});

// Client model and client collection
// Is used to keep a list of active sockets

var Client = Backbone.Model.extend({});

var Clients = Backbone.Collection.extend({

	model : Client 


});

/// Used to track active games

var Game = Backbone.Model.extend({});

var Games = Backbone.Collection.extend({



});

// Stores clients and games

var clients = new Clients();

var games = new Games();

/// Starts a new game

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

	/// Create a new game object and add it the the 'games' collection

	var game = new Game({

		// Creates a unique id for the game

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

/// Updates the game status, similar to front end piece

var updateGame = function(data) {

	// Get the current game

	var game = games.where({id : data.id});

	// Get the answer set

	var answers = game[0].get("answers");

	var check_answers = answers.where({a : data.answer}); 

	// If the answer if not undefined or already solved

	if (check_answers[0] !== undefined && check_answers[0].get("solved") !== true) {

		check_answers[0].set({solved : true});

		// Which player score, could be refactored more cleanly

		var player_score_num;

		if (game[0].get("player_one") === data.player) {

			player_score_num = "player_one_score";

		} else {

			player_score_num = "player_two_score";

		}

		// Adjust the current score to the new score

		var score = game[0].get(player_score_num); 

		var new_score = parseInt(score , 10) + 1; 

		game[0].set(player_score_num , new_score );

		// Create an update object to send back to the users game boards

		var update_obj = {

			player : data.player, 

			score : new_score, 

			answer : data.answer

		};

		return update_obj; 

	}

};

// Sends game updates, takes data object from game update event and newly create update object

var sendUpdate = function(data , update) {

	var game = games.where({id : data.id});

	/// Sends updates based on users sockets

	io.sockets.sockets[game[0].get("player_one")].emit("game_updated" , JSON.stringify(update)); 

	io.sockets.sockets[game[0].get("player_two")].emit("game_updated" , JSON.stringify(update));


};

/// Brings together session data with socket sessions

var SessionSockets = require('session.socket.io'); 

var sessionSockets = new SessionSockets(io, sessionStore, cookieParser);


/// Handles events for socket connections

sessionSockets.on('connection', function (err , socket , session) {

	// Add the current sockets to client collection

	if (err !== null) {

		socket.emit("server_error" , {msg: err});

	} else {

		clients.add({player : socket.id , username: session.username});

		// Update the user with their session id

		socket.emit('user', { id: socket.id});

		socket.emit('users_updated' , JSON.stringify(clients));

		// Broadcasts that a new player is online

		socket.broadcast.emit('users_updated' , JSON.stringify(clients)); 

		// Removes client from client collection

		socket.on('disconnect' , function() {

			var models = clients.where({player : socket.id});

			clients.remove(models[0]);

			console.log("disconnect");

			socket.broadcast.emit('users_updated' , JSON.stringify(clients)); 

		});

		/// Sends a challenge request

		socket.on("request_challenge" , function(data){

			io.sockets.sockets[data.id].emit("challenge_requested" , { id: socket.id });

		}); 

		// Notify users that a challenge has been accepted

		socket.on("challenge_accepted" , function(data){

			// Create a new game model and add it to the games collections

			var new_game = NewGame(data);

			games.add(new_game);

			// Send updates to both players

			io.sockets.sockets[data.player_one].emit("start_challenge" , JSON.stringify(new_game)); 

			io.sockets.sockets[data.player_two].emit("start_challenge" , JSON.stringify(new_game));

		});

		// Send a game update that will update the game boards/score

		socket.on("game_update" , function(data){

			var update = updateGame(data);

			sendUpdate(data , update);

		});

	}

});

server.listen(process.env.PORT || 3000);


