(function($ , _ , Backbone , Marionette) { 


	var MyApp = new Backbone.Marionette.Application();

	MyApp.module("Sets" , function(Sets , MyApp , Backbone , Marionette , $ , _){

		//Keeps track of the current set, stores the options, sets and user input data

		Sets.CurrentSet = Backbone.Model.extend({


			defaults : {

				user_input : ''

			} , 

			validate : function(attrs, options) {

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

				messages : "#messagePanel"

			} , 

			initialize : function() {



			} , 

			onRender : function() { 

				this.current_set.show(new MyApp.Views.CurrentSetView({model : MyApp.current_set}));

				this.input_panel.show(new MyApp.Views.InputView({model: MyApp.current_set}));

				this.messages.show(new MyApp.Views.MessageView({model: MyApp.current_set})); 

			}

		})


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

		})

		Views.MessageView = Backbone.Marionette.ItemView.extend({

			template : "#messageTempl"  , 

			initialize : function() { 

				this.model.on("change:user_input" , this.clearMessage , this) ;

				this.model.on("invalid" , this.showError , this)

			} , 

			ui : {

				message_txt : ".message"

			} ,

			clearMessage : function() {

				//console.log(this);

				this.$el.removeClass("alert-box alert round")

				this.ui.message_txt.html("");

			} , 

			showError : function(model) { 

				this.$el.addClass("alert-box alert round")

				this.ui.message_txt.html(model.validationError);

			}



		})


	});


	
	MyApp.Controller = Marionette.Controller.extend({

		initialize : function() { 

			MyApp.current_set = new MyApp.Sets.CurrentSet(); 

			$("body").on("keypress" , this.handleKeyboard); 

		} , 

		start: function() { 

			//var keyboard = new MyApp.Layout.Keyboard();

			

			var rand_num = Math.floor(Math.random() * 2);

			MyApp.current_set.set(LETTER_CHOICES[rand_num]);

			//MyApp.current_set.set({set : "Hello World"});

			var layout = new MyApp.Layout.App(); 

			layout.render();

		} , 

		handleKeyboard : function(e) { 

			var key = String.fromCharCode(e.charCode).toLowerCase();

			var ENTER_KEY = 13; 

			if (e.charCode === 13) {

			} else {

				var current_set = MyApp.current_set.get("user_input");

				var success = MyApp.current_set.set({user_input : (current_set += key)} , {validate : true}); 

			}

		}


	})

	MyApp.addInitializer(function() { 

		var controller = new MyApp.Controller();



		controller.start(); 



	})


	MyApp.start();
	




})(jQuery, _ , Backbone , Backbone.Marionette)

