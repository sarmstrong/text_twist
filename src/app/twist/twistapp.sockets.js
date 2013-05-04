var init_socket = function() {


	var socket = io.connect(TwistApp.socketURL);

	socket.on("connect" , function() { 

		TwistApp.vent.trigger("server_connected");

	}); 

	socket.on("user" , function(data) { 

		TwistApp.user_id = data.id;

		TwistApp.vent.trigger("user_init" , data);



	}); 

	socket.on("users_updated" , function(data) { 

		TwistApp.vent.trigger("users_updated" , data);
		

	}); 

	socket.on("challenge_requested" , function(data){

		TwistApp.vent.trigger("challenge_requested" , data);

	}); 

	socket.on("start_challenge" , function(data){

		TwistApp.vent.trigger("start_challenge" , data);

	})

	socket.on("game_updated" , function(data){

		TwistApp.vent.trigger("game_updated" , data);

	})

	TwistApp.vent.on("request_challenge" , function(data){

		socket.emit("request_challenge" , data);

	}); 


	TwistApp.vent.on("challenge_accepted" , function(data){

		socket.emit("challenge_accepted" , data)

	}); 

	TwistApp.vent.on("game_update" , function(data) {

		console.log(data);  

		socket.emit("game_update" , data); 

	})



}; 


TwistApp.addInitializer(init_socket);