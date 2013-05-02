/* global TwistApp,  Backbone, _ */

TwistApp.module("Players" , function(Players , MyApp , Backbone , Marionette , $ , _){


	Players.Player = Backbone.Model.extend({


	})


	Players.Collection = Backbone.Collection.extend({

		model : Players.Player 


	});


})