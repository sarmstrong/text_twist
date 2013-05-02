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

		console.log("challenge on");

		TwistApp.vent.trigger("challenge_requested" , data);

	}); 

	TwistApp.vent.on("request_challenge" , function(data){

		console.log(data);

		socket.emit("request_challenge" , data);

	}); 


	TwistApp.vent.on("challenge_accepted" , function(data){

		console.log(data);

		socket.emit("challenge_accepted" , data)

	})	



}; 


TwistApp.addInitializer(init_socket);