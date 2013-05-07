#Text Twist - Multiplayer

An implementation of the classic Text Twist game using Backbone and Marionette. Uses socket.io to implement a multiplayer functionality.

To run app, navigate to the root directory in terminal (on Mac) and install modules.

``npm install``

Then run:

 ``node app``. 

 Then navigate to http://localhost:3000.

 To simulate multiplayer, open windows in two different browsers and send a challenge request using the "challenge" button. On the adjacent browser window, click accept and play yourself on both browsers. 

###Demo

 See a live demo at: [http://text-twist-multi-player.nodejitsu.com](http://text-twist-multi-player.nodejitsu.com)

###Todo

+ Server offline functionality

+ Disconnect events for current game

+ Notification that a challenge has been rejected

+ Garbage cleanup for game store

+ Better game continuation

+ Show games in progress to other users

