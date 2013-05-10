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

###Disclaimer

This app is intended for demo purposes only. Code is tested in webkit browsers and hasn't been optimized for lower browser versions.

###Todo

+ Manage sessions and socket id's

+ Better cross challenger event messaging

+ Notification that a challenge has been rejfected

+ Garbage cleanup for game store

+ Better game continuation

+ Socket errors in browsers that don't support websockets

+ Move game logic to shared object between server and client

