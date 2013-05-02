TwistApp.module("Views" , function(Views , MyApp , Backbone , Marionette , $ , _) {

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

			// Assings methods to reset and twist button

			events : {

				"click .reset" : "resetGame", 

				'click .twist' : "twist"

			} , 

			resetGame : function() { 

				MyApp.vent.trigger("reset");

			}  , 

			// Create a new timer on render that is defined in the cpanel markup

			onRender : function() { 

				this.timer = new MyApp.Views.Timer({el : this.$("#timer"), duration: 300});

				this.timer.render();

			} , 

			/// Implements 'twist' functionality

			twist : function() { 

				var opts = MyApp.current_set.get("options"); 

				// Use underscores shuffle method to randomize letter order

				var shuffled = _.shuffle(opts); 

				MyApp.current_set.set({options : shuffled});

			}



		}); 



		// Renders the game timer and handles related events

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

			// Starts timer

			startTimer : function() {

				var app, timer , duration;

				// Clears any currently running intervals

				if (this.intvl !== undefined) {

					clearInterval(this.intvl);

				}

				app = MyApp;

				timer = this;

				duration = this.duration;

				// Initializes the timer UI

				this.updateTime(duration);

				this.intvl = setInterval(function() { 

					if (duration < 0) {

						clearInterval(timer.intvl); 

						// Triggers time up event

						// Objects subscribing to this event will act accordingly

						app.vent.trigger("timeUp");

					} else {

						timer.updateTime(duration);

					}

					duration--;

				} , 1000); 


			} , 

			// Updates the timer UI

			updateTime : function(duration) { 

				var minutes, seconds, time_left;

				// Add time to time element and pad with a Zero

				minutes = Math.floor(duration/60);

				// Cool padding hack I found using my "Google Fu"

				seconds = String("0" + duration%60).slice(-2);

				minutes > 0 ? time_left = minutes + ":" + seconds : time_left = seconds;

				this.ui.time.html(time_left);


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

		// Collection view that displays the answers to set 

		Views.AnswersView = Backbone.Marionette.CollectionView.extend({

			itemView : Views.AnswerItem

		});

		// Handles keyboard input

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

				// If enter key, then validate user input against current set

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

					/// Validate user input to see if it is in the current letter set

					MyApp.vent.trigger("validateInput" , key);

				}

			}

		}); 

		// Shows wether game is solved or time is up

		Views.EndScreen = Backbone.Marionette.ItemView.extend({

			template : "#endScreenTempl" , 

			initialize : function() {

				// Shows game solved screen when the game is solved

				MyApp.vent.on("gameSolve" , this.showSolved , this);

				MyApp.vent.on("playAgain" , this.hide , this);

				// Show the times up screen if the time runs out

				MyApp.vent.on("timeUp" , this.showUnsolved , this);

				$(this.el).hide();

			} ,


			events : {

				"click .play-again" : 'playAgain'

			} , 

			playAgain : function() { 

				MyApp.vent.trigger("playAgain");

			}, 

			/// Shows view if game is solved

			showSolved : function() {

				$(this.el).removeClass('unsolved').addClass("solved");

				$(this.el).show();

			} , 

			/// Shows when time is up

			showUnsolved : function() { 

				$(this.el).removeClass('solved').addClass("unsolved");

				$(this.el).show();


			} ,

			hide : function() {

				$(this.el).hide();

			}

		});

		Views.PlayerItem = Backbone.Marionette.ItemView.extend({

			template : "#playerOnlineItem" , 

			events : {

				"click .challenge" : "requestChallenge"

			} , 

			requestChallenge : function(e) { 

				MyApp.vent.trigger("request_challenge" , {id : this.model.get("player")});

			}


		});

		Views.PlayersOnline = Backbone.Marionette.CollectionView.extend({

			itemView : Views.PlayerItem

		})

		Views.ChallengeScreen = Backbone.Marionette.ItemView.extend({

			template : "#challengeScreenTempl" ,

			player_one : null,


			initialize : function() { 

				this.hide();

				MyApp.vent.on("challenge_requested" , this.show , this);

			}, 

			events : { 



				"click .accept" : "challengeAccepted"


			} ,

			challengeAccepted : function() { 

				MyApp.vent.trigger("challenge_accepted" , {player_one: this.player_one , player_two : MyApp.user_id});

			} ,

			show : function(data) { 



				this.player_one = data.id;

				$(this.el).show();

			}, 



			hide : function() {

				$(this.el).hide();

			}

		})




	});