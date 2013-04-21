/* global LETTER_CHOICES, console, jQuery, Backbone, _ */


(function($ , _ , Backbone , Marionette) { 


	var MyApp = new Backbone.Marionette.Application();

	MyApp.module("Sets" , function(Sets , MyApp , Backbone , Marionette , $ , _){

		//Keeps track of the current set, stores the options, sets and user input data

		Sets.CurrentSet = Backbone.Model.extend({


			defaults : {

				user_input : ''

			} , 

			validate : function(attrs) {

				// Validates to see if user input matches the 
				// available set

				var arr2 = _.clone(attrs.options);

				var temp_arr = _.clone(attrs.user_input.split(''));

				for (var i = 0 ; i < attrs.user_input.split('').length ; i++) { 

					for (var x = 0 ; x < arr2.length ; x++) { 

						if (temp_arr.indexOf(arr2[x]) !== -1) { 

							temp_arr.splice(temp_arr.indexOf(arr2[x]) , 1);

							arr2.splice(x , 1);

						}

					}

				}

				if (temp_arr.length !== 0 ) {

					//console.log("Not an option")

					return "This letter is not an option";

				}

			}


		});

		Sets.Answer = Backbone.Model.extend({



		});

		Sets.Answers = Backbone.Collection.extend({

			model : Sets.Answer 


		});


	});

	MyApp.module("Layout" , function(Layout , MyApp , Backbone , Marionette , $ , _) {

		// Renders the layout for the application

		Layout.App = Backbone.Marionette.Layout.extend({

			template : "#appLayout",

			el : ".wrapper",

			regions : {

				answers : "#answers" , 

				input_panel : "#inputPanel" , 

				current_set : "#currentSetPanel" , 

				messages : "#messagePanel", 

				control_panel : "#controlPanel"

			} ,  

			// Render layout on app initialization

			onRender : function() { 

				this.current_set.show(new MyApp.Views.CurrentSetView({model : MyApp.current_set}));

				this.control_panel.show(new MyApp.Views.CPanel());

				this.input_panel.show(new MyApp.Views.InputView({model: MyApp.current_set}));

				this.messages.show(new MyApp.Views.MessageView({model: MyApp.current_set})); 

				this.answers.show(new MyApp.Views.AnswersView({collection : MyApp.answers})); 

			}

		});



	});


	MyApp.module("Views" , function(Views , MyApp , Backbone , Marionette , $ , _) {


		Views.InputView = Backbone.Marionette.ItemView.extend({

			template : "#inputPanelTempl" , 

			initialize : function() { 

				this.model.on("change:user_input" , this.render);

			} 

		});

		Views.CurrentSetView = Backbone.Marionette.ItemView.extend({

			template : "#currentSetPanelTempl" 

		});

		Views.MessageView = Backbone.Marionette.ItemView.extend({

			template : "#messageTempl"  , 

			initialize : function() { 

				this.model.on("change:user_input" , this.clearMessage , this) ;

				this.model.on("invalid" , this.showError , this); 

				MyApp.vent.on("wrong_answer" , this.showBadAnswer , this); 

			} , 

			ui : {

				message_txt : ".message"

			} ,

			clearMessage : function() {

				//console.log(this);

				this.$el.removeClass("alert-box alert round");

				this.ui.message_txt.html("");

			} , 

			showError : function(model) { 

				this.$el.addClass("alert-box alert round");

				this.ui.message_txt.html(model.validationError);

			} , 

			showBadAnswer : function(e) {

				this.$el.addClass("alert-box alert round");

				this.ui.message_txt.html(e);			

			}



		}); 

		Views.CPanel = Backbone.Marionette.ItemView.extend({

			template : "#controlPanelTempl", 

			ui : {

				reset : ".reset"

			} , 

			events : {

				"click .reset" : "resetGame"

			} , 

			resetGame : function() { 

				//console.log(MyApp);

				MyApp.vent.trigger("reset");

			}

		}); 

		Views.AnswerItem = Backbone.Marionette.ItemView.extend({

			//Initial Item Template, will not show answer obviously

			template : "#answerTemplInit" , 

			initialize : function() { 

				this.model.on("change:solved" , this.solve , this); 

			} , 

			// Re-render view and show the answer

			solve : function() { 

				console.log("solve");

				this.template = "#answerTemplSolved"; 

				this.render();

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

			// Handles keyboard loging

		handleKeyboard : function(e) { 

			var key = String.fromCharCode(e.keyCode).toLowerCase();

			var ENTER_KEY = 13; 

			var BACKSPACE_KEY = 8;

			var DELETE_KEY = 46; 

			// Checks to see if answer is correct

			// If not it dispatches a global wrong answer event

			if (e.keyCode === ENTER_KEY) {

				e.preventDefault();

				var check_answers = MyApp.answers.where({a : MyApp.current_set.get("user_input")}); 

				if (check_answers[0] !== undefined) { 

					// Set the attribute of the answer model to solved
					// Will trigger a change event on corresponding view

					check_answers[0].set({solved : true});

					MyApp.current_set.set({"user_input" : ""});

				} else {

					MyApp.vent.trigger("wrong_answer" , "That answer is incorrect.");

				}

			// Override functionality of delete/backspace key
			// so they erase current input

			} else if (e.keyCode === ( BACKSPACE_KEY || DELETE_KEY)) {

				e.preventDefault();

				var user_input = MyApp.current_set.get("user_input"); 

				if (user_input !== "") {

					var current_input = user_input.split("");

					current_input.splice(current_input.length - 1 , 1); 

					MyApp.current_set.set({"user_input" : current_input.join("")});

				}

				

			} else {

				var current_set = MyApp.current_set.get("user_input");

				MyApp.current_set.set({user_input : (current_set += key)} , {validate : true}); 

			}

		}




		}); 


	});


	
	MyApp.Controller = Marionette.Controller.extend({

		initialize : function() { 

			MyApp.current_set = new MyApp.Sets.CurrentSet(); 

			MyApp.answers = new MyApp.Sets.Answers();

			//$("body").on("keydown" , this.handleKeyboard); 

			MyApp.vent.on("reset" ,  this.start, this);

			//var container = new MyApp.Layout.GameContainer({el : "body"});

			var container = new MyApp.Views.KeyboardContainer({el : "body"});

		} , 

		start: function() { 

			// Randomize which set is chosen

			var rand_num = Math.floor(Math.random() * 2);

			// Set the current set model data

			MyApp.current_set.set({user_input : ""});

			MyApp.current_set.set(LETTER_CHOICES[rand_num]);

			// Add the anwers to the answer collection

			var sorted = _.sortBy(LETTER_CHOICES[rand_num].set , function( obj ) {return obj.a.length;});

			MyApp.answers.reset(sorted);

			var layout = new MyApp.Layout.App();

			layout.render();	

		}
		

	});

	MyApp.addInitializer(function() { 

		var controller = new MyApp.Controller();

		controller.start(); 

	});


	MyApp.start();
	




})(jQuery, _ , Backbone , Backbone.Marionette);

