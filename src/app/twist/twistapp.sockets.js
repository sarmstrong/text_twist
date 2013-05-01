var init_socket = function() {

	console.log("init");

	var socket = io.connect(TwistApp.socketURL);

	socket.on("connect" , function() { 

		TwistApp.vent.trigger("server_connected");

	})

	socket.on("user" , function(data) { 

		TwistApp.vent.trigger("user_init" , data);

		console.log(data);

	})

	socket.on("users_updated" , function(data) { 

		TwistApp.vent.trigger("users_updated" , data);

		console.log(data);

	})


}; 


TwistApp.addInitializer(init_socket);