/* global TwistApp,  Backbone, _ */

TwistApp.module("Sets" , function(Sets , MyApp , Backbone , _){

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