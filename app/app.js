var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require('../models');
var methodOverride = require('method-override');
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
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

app.get('/', galleryList)
app.get('/gallery/:id', renderPictureById);

app.route('/gallery')
	.get(galleryList)
	.post(addNewPhoto)
	.put(editPhoto)

app.delete('/gallery/:id', function(req, res) {
	console.log('we are in here');
	res.send('ok');
});



function renderPictureById(req, res) {
	var id = req.params.id;

	Photo.find({
		where: {
			id: id
		}
	}).then(function(photo) {
		if (!photo) {
			res.send('No photo found by that ID');
		} else {
			res.render('photoById', {
				photo: photo,
				createDeleteLink: function(id) {
					return '<form action="/gallery/' + id + '" method="POST"><input type="hidden" name="_method" value="DELETE"><button> delete </button></form>';
				}
			});
		}
	});
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