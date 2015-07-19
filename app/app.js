var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require('../models');
var Photo = db.photo;
var PhotoSchema = {
	author: '',
	link: '',
	description: ''
}

db.sequelize.sync();
app.set('view engine', 'jade');
app.set('views', __dirname+'/views');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.get('/', function(req, res) {
	/**
	1) Query Database
	2) Create JSON from request via body-parser
	3) Response.send(JSON)
	**/
	res.send('homepage');
});

//queries


app.route('/gallery')
	.get(function(req, res) {
		Photo.findAll().then(function(photos) {
			res.render('gallery', {
				photos: photos
			});
		});

	})
	.post(function(req, res) {
		if (validatePost(req.body)) {
			addGalleryPhoto(req.body).then(function(photo) {
				res.send('added photo to /gallery');
			}).catch(function(err) {
				if (err) throw err;
			});
		} else {
			res.send('Invalid keys in form');
		}
	})
	.put(function(req, res) {
		res.send('edit photo');
	});

app.get('/gallery/:id', function(req, res) {
	switch (req.params.gallery) {
		case '1':
			res.send('meow');

		default:
			res.send('default');
	}
});

function addGalleryPhoto(photo) {

	return Photo.create(photo);

}

function validatePost(body) {
	var args = Object.keys(PhotoSchema)
	var count = 0;
	for (var key in body) {
		if (key !== args[count++]) {
			return false;
		}
	}
	return true;
}

function createPhoto(body) {
	var photo = {
		author: body.author,
		link: body.link,
		description: body.description
	}
	return photo;
}


var server = app.listen(8080, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});