// Object that registers and sends socket.io events.

var init_socket = function() {

	// Set configs for socket.io

	var socket = io.connect(TwistApp.socketURL);

	// Register server online event

	socket.on("connect" , function() { 

		TwistApp.vent.trigger("server_connected");

	}); 

	// Register current users session id

	socket.on("user" , function(data) { 

		TwistApp.user_id = data.id;

		TwistApp.vent.trigger("user_init" , data);



	}); 

	/// Updates the sideboard panel that shows users online

	socket.on("users_updated" , function(data) { 

		TwistApp.vent.trigger("users_updated" , data);
		

	}); 

	/// Notifies users of someones intend to challenge

	socket.on("challenge_requested" , function(data){

		TwistApp.vent.trigger("challenge_requested" , data);

	}); 

	/// Sends a challenge request to another user


	TwistApp.vent.on("request_challenge" , function(data){

		socket.emit("request_challenge" , data);

	}); 

	/// Sends an event notifies server a challenge has been accepted


	TwistApp.vent.on("challenge_accepted" , function(data){

		socket.emit("challenge_accepted" , data)

	}); 

	// Initiates a challenge

	socket.on("start_challenge" , function(data){

		TwistApp.vent.trigger("start_challenge" , data);

	})

	// Sends updates from user based on valid answers

	socket.on("game_updated" , function(data){

		TwistApp.vent.trigger("game_updated" , data);

	})

	// Updates the users of score updates, answered questions

	TwistApp.vent.on("game_update" , function(data) {

		console.log(data);  

		socket.emit("game_update" , data); 

	})



}; 


TwistApp.addInitializer(init_socket);