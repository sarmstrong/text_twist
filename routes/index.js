exports.index = function(req, res){

  if (req.session.username === undefined) {

  	res.render('login', { title: 'TextTwist - MultiPlayer' });

  } else {

  	res.render('index', { title: 'TextTwist - MultiPlayer' , username: req.session.username });

  }

  
};