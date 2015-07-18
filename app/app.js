var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require('../models');
console.log(db);
db.sequelize.sync();

app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static('public'));

app.get('/', function(req, res) {
	/**
	1) Query Database
	2) Create JSON from request via body-parser
	3) Response.write(JSON)
	**/
	console.log(newPhoto);
});



var server = app.listen(8080, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});