/* global TwistApp, LETTER_CHOICES, console, jQuery, Backbone, _ */

TwistApp.module("Layout" , function(Layout , MyApp , Backbone , Marionette , $ , _ ) {

		// Renders the layout for the Game Interface

		Layout.GameInterface = Backbone.Marionette.Layout.extend({

			el : "#gameInterface" , 

			template : "#interfaceLayout" , 

			/// Listen to app events to enable/disable layout when game ends/starts

			initialize : function() {

				MyApp.vent.on("gameSolve" , this.hide , this);

				MyApp.vent.on("multiPlayerGameSolve" , this.hide , this);

				MyApp.vent.on("timeUp" , this.hide , this);

				MyApp.vent.on("multiPlayerTimeUp" , this.hide , this);

				MyApp.vent.on("playAgain" , this.show , this);

				MyApp.vent.on("scoreboardInit" , this.showScoreBoard , this);

			} ,

			regions : {

				answers : "#answers" , 

				input_panel : "#inputPanel" , 

				current_set : "#currentSetPanel" , 

				messages : "#messagePanel", 

				control_panel : "#controlPanel", 

				online : "#playersOnline" , 

				score_board : "#scoreBoard"

			} ,

			// Methods hide and show interface

			hide : function() { 

				$(this.el).hide();

			} , 

			show : function() { 

				$(this.el).show();

			} , 

			showScoreBoard : function() { 

				console.log(MyApp.players);

				

			}, 

			onRender : function() { 

				this.current_set.show(new MyApp.Views.CurrentSetView({model : MyApp.current_set}));

				this.control_panel.show(new MyApp.Views.CPanel());

				this.input_panel.show(new MyApp.Views.InputView({model: MyApp.current_set}));

				this.messages.show(new MyApp.Views.MessageView({model: MyApp.current_set})); 

				this.answers.show(new MyApp.Views.AnswersView({collection : MyApp.answers}));

				//console.log(MyApp.online_users);

				this.online.show(new MyApp.Views.PlayersOnline({collection: MyApp.online_users}));

				this.score_board.show(new MyApp.Views.ScoreBoard({ collection: MyApp.players}));

			}


		}); 

		// Main app layout

		// Creates a nested interface layout and an "End Screen" layout

		Layout.App = Backbone.Marionette.Layout.extend({

			template : "#appLayout",

			el : ".wrapper" , 

			regions : {

				interface_layout : "#interfaceLayout" , 

				end_screen: "#endScreen" , 

				challenge_screen : "#challengeScreen" , 

				multiplayer_end_screen : "#multiPlayerEndScreen"

			} ,  

			onRender : function() { 

				this.interface_layout.show(new MyApp.Layout.GameInterface());

				this.end_screen.show(new MyApp.Views.EndScreen());

				this.challenge_screen.show(new MyApp.Views.ChallengeScreen());

				this.multiplayer_end_screen.show(new MyApp.Views.MultiPlayerEndScreen());

			} 


		});



	});
