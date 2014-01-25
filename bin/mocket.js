var sockets = {}; 

sockets = {

	emit : function() {


	}

}; 

sockets.sockets = []; 

exports.sockets ; 

var makeSocket = function(id) {

	var obj = {}; 

	obj.id  =   id; 

	obj.calledCount = 0; 

	obj.emit = function(){

		this.calledCount += 1;
		
	}; 

	obj.broadcast = function() { 

		return true;

	}

	obj.remove = function() { 

		delete io.sockets.sockets[id]; 

	};

	io.sockets.sockets[id] = obj;

	return obj;

};

exports.makeSocket;

