/* global LETTER_CHOICES, console, jQuery, Backbone, _ */


(function($ , _ , Backbone , Marionette) { 


	var MyApp = new Backbone.Marionette.Application();

	MyApp.module("Sets" , function(Sets , MyApp , Backbone , Marionette , $ , _){

		//Keeps track of the current set, stores the options, sets and user input data

		Sets.CurrentSet = Backbone.Model.extend({


			defaults : {

				user_input : '' , 

				options : ''

			} , 

			validate : function(attrs) {

				// Validates to see if user input matches the available set.

				// Looks in the options set and validates against user input

				var arr2 = _.clone(attrs.options);

				var temp_arr = _.clone(attrs.user_input.split(''));

				for (var i = 0 ; i < attrs.user_input.split('').length ; i++) { 

					for (var x = 0 ; x < arr2.length ; x++) { 

						if (temp_arr.indexOf(arr2[x]) !== -1) { 

							// Remove letters when a match is found in the User Input array

							// and the options array

							temp_arr.splice(temp_arr.indexOf(arr2[x]) , 1);

							arr2.splice(x , 1);

						}

					}

				}

				// No letters should be remaining in the User Input array

				// If so, then those letters are not part of the options set

				if (temp_arr.length !== 0 ) {

					return "This letter is not an option";

				}

			}


		});

		// Perfunctory creation of a collection model

		Sets.Answer = Backbone.Model.extend({



		});

		// Collection that will be used to store the answers set

		Sets.Answers = Backbone.Collection.extend({

			model : Sets.Answer 


		});


	});

	MyApp.module("Layout" , function(Layout , MyApp , Backbone , Marionette , $ , _) {

		// Renders the layout for the Game Interface

		Layout.GameInterface = Backbone.Marionette.Layout.extend({

			el : "#gameInterface" , 

			template : "#interfaceLayout" , 

			/// Listen to app events to enable/disable layout when game ends/starts

			initialize : function() {

				MyApp.vent.on("gameSolve" , this.hide , this);

				MyApp.vent.on("timeUp" , this.hide , this);

				MyApp.vent.on("playAgain" , this.show , this);

			} ,

			regions : {

				answers : "#answers" , 

				input_panel : "#inputPanel" , 

				current_set : "#currentSetPanel" , 

				messages : "#messagePanel", 

				control_panel : "#controlPanel" , 

			} ,

			// Methods hide and show interface

			hide : function() { 

				$(this.el).hide();

			} , 

			show : function() { 

				$(this.el).show();

			} , 

			onRender : function() { 

				this.current_set.show(new MyApp.Views.CurrentSetView({model : MyApp.current_set}));

				this.control_panel.show(new MyApp.Views.CPanel());

				this.input_panel.show(new MyApp.Views.InputView({model: MyApp.current_set}));

				this.messages.show(new MyApp.Views.MessageView({model: MyApp.current_set})); 

				this.answers.show(new MyApp.Views.AnswersView({collection : MyApp.answers})); 

			}


		}); 

		// Main app layout

		// Creates a nested interface layout and an "End Screen" layout

		Layout.App = Backbone.Marionette.Layout.extend({

			template : "#appLayout",

			el : ".wrapper" , 

			regions : {

				interface_layout : "#interfaceLayout" , 

				end_screen: "#endScreen"

			} ,  

			onRender : function() { 

				this.interface_layout.show(new MyApp.Layout.GameInterface());

				this.end_screen.show(new MyApp.Views.EndScreen());

			} 


		});



	});


	MyApp.module("Views" , function(Views , MyApp , Backbone , Marionette , $ , _) {

		// Renders the users keyboard input

		Views.InputView = Backbone.Marionette.ItemView.extend({

			template : "#inputPanelTempl" , 

			initialize : function() { 

				this.model.on("change:user_input" , this.render);

			} 

		});

		// Shows the current set of letters a user can choose from 

		Views.CurrentSetView = Backbone.Marionette.ItemView.extend({

			template : "#currentSetPanelTempl"  , 

			initialize : function(options) { 

				this.model.on("change:options" , this.render);

			}

		});

		// Shows messages that alert the user if there is a mistype
		// or wrong answer

		Views.MessageView = Backbone.Marionette.ItemView.extend({

			template : "#messageTempl"  , 

			initialize : function() { 

				this.model.on("change:user_input" , this.clearMessage , this) ;

				this.model.on("invalid" , this.handleBadInput , this); 

				MyApp.vent.on("wrong_answer" , this.handleBadAnswer , this); 

			} , 

			ui : {

				message_txt : ".message"

			} ,

			// Clear input when the user starts typing to validate new input

			clearMessage : function() {

				this.$el.removeClass("alert-box alert round");

				this.ui.message_txt.html("");

			} , 

			// Shows errors in the message UI

			showError : function(error) { 

				this.$el.addClass("alert-box alert round");

				this.ui.message_txt.html(error);

			} , 

			// Shows error when a wrong answer has been submitted

			handleBadAnswer : function(e) {

				this.showError(e);	

			} , 

			// Shows error when the user trys to input a letter that
			// is not in the current set

			handleBadInput : function(model) {

				console.log(model);

				this.showError(model.validationError);

			}

		}); 

		// Top bar or Control Panel for app

		Views.CPanel = Backbone.Marionette.ItemView.extend({

			template : "#controlPanelTempl", 

			ui : {

				reset : ".reset", 

				timer : ".timer", 

				twist : ".twist"

			} , 

			events : {

				"click .reset" : "resetGame", 

				'click .twist' : "twist"

			} , 

			resetGame : function() { 

				MyApp.vent.trigger("reset");

			}  , 

			onRender : function() { 

				this.timer = new MyApp.Views.Timer({el : this.$("#timer"), duration: 300});

				this.timer.render();

			} , 

			/// Implements 'twist' functionality

			twist : function() { 

				var opts = MyApp.current_set.get("options"); 

				var shuffled = _.shuffle(opts); 

				MyApp.current_set.set({options : shuffled});

			}



		}); 

		// Renders answers in side bar

		Views.AnswerItem = Backbone.Marionette.ItemView.extend({

			//Initial Item Template, will not show answers obviously

			template : "#answerTemplInit" , 

			initialize : function() { 

				this.model.on("change:solved" , this.solve , this); 

			} , 

			// Re-render view and show the answer

			solve : function() { 

				this.template = "#answerTemplSolved"; 

				this.render();

			}

		});

		Views.Timer = Backbone.Marionette.ItemView.extend({

			template : "#timerTempl" , 

			initialize : function(options) { 

				MyApp.vent.on("reset" ,  this.resetTimer, this);

				MyApp.vent.on("gameSolve" ,  this.stopTimer, this);

				MyApp.vent.on("timeUp" ,  this.stopTimer, this);

				MyApp.vent.on("gameStart" , this.startTimer , this);

				this.duration = options.duration;

			} , 

			ui : {

				time : ".time"

			} ,

			resetTimer : function() { 

				clearInterval(this.intvl);

				this.startTimer();

			} , 

			stopTimer : function() { 

				clearInterval(this.intvl);

			} , 

			startTimer : function() {

				var app, timer , duration;

				if (this.intvl !== undefined) {

					clearInterval(this.intvl);

				}

				app = MyApp;

				timer = this;

				duration = this.duration;

				this.updateTime(duration);

				this.intvl = setInterval(function() { 

					if (duration < 0) {

						clearInterval(timer.intvl); 

						app.vent.trigger("timeUp");

					} else {

						timer.updateTime(duration);

					}

					duration--;

				} , 1000); 


			} , 

			updateTime : function(duration) { 

				var minutes, seconds, time_left;

				// Add time to time element and pad with a Zero

				minutes = Math.floor(duration/60);

				seconds = String("0" + duration%60).slice(-2);

				minutes > 0 ? time_left = minutes + ":" + seconds : time_left = seconds;

				this.ui.time.html(time_left);


			} 

		}); 

		Views.AnswersView = Backbone.Marionette.CollectionView.extend({

			itemView : Views.AnswerItem

		});


		Views.KeyboardContainer = Backbone.Marionette.ItemView.extend({

			initialize : function() { 

				console.log(this.el);

			}, 

			events : {

				'keydown' : "handleKeyboard"

			}, 

			// Handles keyboard logic

			handleKeyboard : function(e) { 

				var key, ENTER_KEY , BACKSPACE_KEY , DELETE_KEY , COMMAND_KEY;

				key = String.fromCharCode(e.keyCode).toLowerCase();

				ENTER_KEY = 13; 

				BACKSPACE_KEY = 8;

				DELETE_KEY = 46; 

				COMMAND_KEY = 91;

				if (e.keyCode === ENTER_KEY) {

					e.preventDefault();

					MyApp.vent.trigger("checkAnswer");			

					// Override functionality of delete/backspace key

					// so they erase current input

				} else if (e.keyCode === ( BACKSPACE_KEY || DELETE_KEY)) {

					e.preventDefault();

					MyApp.vent.trigger("deleteInput");

				} else if (e.keyCode === COMMAND_KEY) {

					/// Ignore typing of the command key because it's annoying

				} else {

					MyApp.vent.trigger("validateInput" , key);

				}

			}

		}); 

		Views.EndScreen = Backbone.Marionette.ItemView.extend({

			template : "#endScreenTempl" , 

			initialize : function() {

				MyApp.vent.on("gameSolve" , this.showSolved , this);

				MyApp.vent.on("playAgain" , this.hide , this);

				MyApp.vent.on("timeUp" , this.showUnsolved , this);

				$(this.el).hide();

			} ,


			events : {

				"click .play-again" : 'playAgain'

			} , 

			playAgain : function() { 

				MyApp.vent.trigger("playAgain");

			}, 

			showSolved : function() {

				$(this.el).removeClass('unsolved').addClass("solved");

				$(this.el).show();

			} , 

			showUnsolved : function() { 

				$(this.el).removeClass('solved').addClass("unsolved");

				$(this.el).show();


			} ,

			hide : function() {

				$(this.el).hide();

			}

		});


	});


	
	MyApp.Controller = Marionette.Controller.extend({

		initialize : function() { 

			MyApp.current_set = new MyApp.Sets.CurrentSet(); 

			MyApp.answers = new MyApp.Sets.Answers();

			MyApp.vent.on("reset" ,  this.start, this);

			MyApp.vent.on("playAgain", this.start , this);

			MyApp.vent.on("score:current" , this.currentScore , this); 

			MyApp.vent.on("checkAnswer", this.checkAnswer , this);

			MyApp.vent.on("deleteInput", this.deleteInput , this);

			MyApp.vent.on("validateInput", this.validateInput , this);

			new MyApp.Views.KeyboardContainer({el : "body"});

			this.app_layout = new MyApp.Layout.App();

			this.app_layout.render();



		} , 

		start: function() { 

			this.current_score = 0; 

			// Randomize which set is chosen

			var rand_num = Math.floor(Math.random() * 2);

			// Set the current set model data

			MyApp.current_set.set({user_input : ""});

			MyApp.current_set.set(LETTER_CHOICES[rand_num]);

			// Add the anwers to the answer collection

			var sorted = _.sortBy(LETTER_CHOICES[rand_num].set , function( obj ) {return obj.a.length;});

			MyApp.answers.reset(sorted);

			MyApp.vent.trigger("gameStart");

				

		} , 

		updateCurrentScore : function() { 

			var solved = MyApp.answers.where({solved : true}); 

			console.log(solved.length);

			console.log(MyApp.answers.length);

			if (solved.length === MyApp.answers.length) {

				MyApp.vent.trigger("gameSolve"); 

				//this.start();

			}

		} , 

		// Checks to see if answer is correct

		// If not it dispatches a global wrong answer event

		checkAnswer : function() { 

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


		deleteInput : function() { 

			var user_input = MyApp.current_set.get("user_input"); 

			if (user_input !== "") {

				var current_input = user_input.split("");

				current_input.splice(current_input.length - 1 , 1); 

				MyApp.current_set.set({"user_input" : current_input.join("")});

			}

		} , 

		validateInput : function(key) { 

			var current_set = MyApp.current_set.get("user_input");

			MyApp.current_set.set({user_input : (current_set += key)} , {validate : true}); 

		}
		

	});

	MyApp.addInitializer(function() { 

		var controller = new MyApp.Controller();

		controller.start(); 

	});


	MyApp.start();


})(jQuery, _ , Backbone , Backbone.Marionette);

