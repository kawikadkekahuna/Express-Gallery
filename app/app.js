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
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.get('/', galleryList)

app.route('/gallery')
	.get(galleryList)
	.post(addNewPhoto)
	.put(editPhoto);

app.get('/gallery/:id', function(req, res) {
	var id = req.params.id;

	Photo.findAll({
		where: {
			id: id
		}
	}).then(function(photo){
		res.render('galleryid',{
			photo: photo[0]
		});
	});


});


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

//get
function galleryList(req, res) {
	Photo.findAll().then(function(photos) {

		res.render('index', {
			photos: photos
		});
	});
}
//post
function addNewPhoto(req, res) {
	if (validatePost(req.body)) {
		Photo.create(req.body)
			.then(function(photo) {
				res.send('added photo to /gallery');
			}).catch(function(err) {
				if (err) throw err;
			});
	} else {
		res.send('Invalid keys in form');
	}
}
//post
function editPhoto(req, res) {
	if (validatePost(req.body)) {
		res.send('editable');
	} else {
		res.send('Invalid keys in form');
	}
}

var server = app.listen(8080, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});