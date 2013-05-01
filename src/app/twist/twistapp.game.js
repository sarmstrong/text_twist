/* global TwistApp, LETTER_CHOICES, console, jQuery, Backbone, _ */

TwistApp.module("Game" , function(Game ,  MyApp , Backbone , Marionette , $ , _ ) {


	// Controller handles game logic, updates views and models
	
	MyApp.Controller = Marionette.Controller.extend({

		initialize : function() { 

			MyApp.current_set = new MyApp.Sets.CurrentSet(); 

			MyApp.answers = new MyApp.Sets.Answers();

			// Starts new game on reset button press or when the user decides to play again

			MyApp.vent.on("reset" ,  this.start, this);

			MyApp.vent.on("playAgain", this.start , this); 

			// Handles events triggered by the keyboard view

			MyApp.vent.on("checkAnswer", this.checkAnswer , this);

			MyApp.vent.on("deleteInput", this.deleteInput , this);

			MyApp.vent.on("validateInput", this.validateInput , this);

			//  Create a key board view, may not be dependent on layout

			new MyApp.Views.KeyboardContainer({el : "body"});

			// Create the app layout and render it to the screen

			this.app_layout = new MyApp.Layout.App();

			this.app_layout.render();

		} , 

		// Starts a new game

		start: function() {  

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

		// Checks to see if the game is solved

		updateCurrentScore : function() { 

			var solved = MyApp.answers.where({solved : true}); 

			if (solved.length === MyApp.answers.length) {

				MyApp.vent.trigger("gameSolve"); 

			}

		} , 

		// Checks to see if answer is correct

		// If not it dispatches a global wrong answer event

		checkAnswer : function() { 

			/// Check the answers collection to see if answer exists

			var check_answers = MyApp.answers.where({a : MyApp.current_set.get("user_input")}); 

			if (check_answers[0] !== undefined) { 

				// Set the attribute of the answer model to solved

				// Will trigger a change event on corresponding view

				check_answers[0].set({solved : true});

				MyApp.current_set.set({"user_input" : ""});

				this.updateCurrentScore();


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

		var controller = new MyApp.Controller();

		controller.start(); 

	})

	

});