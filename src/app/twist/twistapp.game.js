/* global TwistApp, LETTER_CHOICES, console, jQuery, Backbone, _ */

TwistApp.module("Game" , function(Game ,  MyApp , Backbone , Marionette , $ , _ ) {

	// Object that handles logic for connectivity and user interaction

	MyApp.Server = Marionette.Controller.extend({

		initialize : function() { 

			/// Stores a list of who is on line

			MyApp.online_users = new MyApp.Players.Collection();

			// Stores a list of who is currently playing

			MyApp.players = new MyApp.Players.Collection();

			MyApp.vent.on("users_updated" , this.updateOnlineUsers , this);

			MyApp.vent.on("start_challenge" , this.initiateScoredBoard , this); 

			MyApp.vent.on("game_updated" , this.updateScore , this);

		}, 

		///  Updates the score board

		updateScore : function(data) {

			var data = $.parseJSON(data);

			var player = MyApp.players.where({player_id : data.player}); 

			player[0].set({score : data.score});

			console.log(player[0]);

		}, 

		/// Updares who is online

		updateOnlineUsers : function(users) {

			var users_parsed = $.parseJSON(users); 

			MyApp.online_users.reset(users_parsed);

			var user = MyApp.online_users.where({player : MyApp.user_id});

			MyApp.online_users.remove(user);

		}, 

		/// Initiate a new score board collection

		initiateScoredBoard : function(data) {

			var data = $.parseJSON(data); 

			MyApp.game_id = data.id;

			var players = [{

				player : "Player One", 

				player_id : data.player_one, 

				score : 0

			}, {

				player : "Player Two", 

				player_id : data.player_two, 

				score : 0


			}]; 

			MyApp.players.reset(players);

			MyApp.vent.trigger("scoreboardInit");


		}

	});


	// Controller handles game logic, updates views and models
	
	MyApp.Controller = Marionette.Controller.extend({

		initialize : function() { 

			MyApp.current_set = new Sets.CurrentSet(); 

			MyApp.answers = new Sets.Answers();

			// Starts new game on reset button press or when the user decides to play again

			MyApp.vent.on("reset" ,  this.start, this);

			MyApp.vent.on("playAgain", this.start , this); 

			// Handles events triggered by the keyboard view

			MyApp.vent.on("checkAnswer", this.checkAnswer , this);

			MyApp.vent.on("deleteInput", this.deleteInput , this);

			MyApp.vent.on("validateInput", this.validateInput , this);

			MyApp.vent.on("start_challenge" , this.startMultiPlayerGame , this);

			MyApp.vent.on("game_updated" , this.multiplayerUpdate , this);

			//  Create a key board view, may not be dependent on layout

			new MyApp.Views.KeyboardContainer({el : "body"});

			// Create the app layout and render it to the screen

			this.app_layout = new MyApp.Layout.App();

			this.app_layout.render();

		} , 

		// Starts a new game

		start: function() {  

			MyApp.mode = "single_player";

			// Randomize which set is chosen

			var rand_num = Math.floor(Math.random() * LETTER_CHOICES.length);

			// Reset the user input to empty

			MyApp.current_set.set({user_input : ""});

			// Set the current set model data

			MyApp.current_set.set(LETTER_CHOICES[rand_num]);

			// Add the anwers to the answer collection

			var sorted = _.sortBy(LETTER_CHOICES[rand_num].set , function( obj ) {return obj.a.length;});

			

			MyApp.answers.reset(sorted);

			MyApp.vent.trigger("gameStart");
			

		} , 

		/// Starts a new multiplayer game

		startMultiPlayerGame : function(data) {

			MyApp.mode = "multi_player";

			var data = $.parseJSON(data); 

			MyApp.current_set.set({user_input : ""});

			MyApp.current_set.set(data.set);

			MyApp.answers.reset(data.answers);

			MyApp.vent.trigger("gameStart");	

		} , 

		// Checks to see if the game is solved

		updateCurrentScore : function() { 

			var solved = MyApp.answers.where({solved : true}); 

			if (solved.length === MyApp.answers.length) {

				if (MyApp.mode === 'single_player') {

					MyApp.vent.trigger("gameSolve");

				} else if (MyApp.mode === 'multi_player') {

					console.log("solved");

					MyApp.vent.trigger("multiPlayerGameSolve");

				}

			}

		} , 

		/// Registers multiplayer updates, updates the answers column and the current score

		multiplayerUpdate : function(data) { 

			var data = $.parseJSON(data);

			var answer = MyApp.answers.where({a : data.answer});

			answer[0].set({solved : true}); 

			this.updateCurrentScore();

		}, 

		// Checks to see if answer is correct

		// If not it dispatches a global wrong answer event

		checkAnswer : function() { 

			/// Check the answers collection to see if answer exists

			var check_answers = MyApp.answers.where({a : MyApp.current_set.get("user_input")}); 

			if (check_answers[0] !== undefined && check_answers[0].get("solved") !== true) { 

			
				if (MyApp.mode === 'single_player') {

					// Set the attribute of the answer model to solved

					// Will trigger a change event on corresponding view

					check_answers[0].set({solved : true});

					this.updateCurrentScore();

				} else if (MyApp.mode === 'multi_player') {


					MyApp.vent.trigger("game_update" , {id : MyApp.game_id , player : MyApp.user_id , answer : MyApp.current_set.get("user_input")});

				}	

				MyApp.current_set.set({"user_input" : ""});


			} else {

				MyApp.vent.trigger("wrong_answer" , "That answer is incorrect.");

			}

		} , 

		// Enables delete functionlity for keyboard input

		deleteInput : function() { 

			var user_input = MyApp.current_set.get("user_input"); 

			if (user_input !== "") {

				// Create an array from the user input and reduce it in length

				var current_input = user_input.split("");

				current_input.splice(current_input.length - 1 , 1); 

				MyApp.current_set.set({"user_input" : current_input.join("")});

			}

		} , 

		// Trigger on any keyboard input that isn't a submission or delete event

		validateInput : function(key) { 

			var current_set = MyApp.current_set.get("user_input");

			MyApp.current_set.set({user_input : (current_set += key)} , {validate : true}); 

		}
		

	});

	// Standard Marionette boilerplate code to initialize an app

	Game.addInitializer(function() { 

		var server = new MyApp.Server();

		var controller = new MyApp.Controller();

		controller.start(); 

	});

	

});