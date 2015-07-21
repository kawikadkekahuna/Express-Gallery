var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require('../models');
var methodOverride = require('method-override');
var Photo = db.photo;
var HTTP_ERR_NOT_FOUND = 404;
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
app.use(methodOverride(function(req, res) {
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		// look in urlencoded POST bodies and delete it
		var method = req.body._method
		delete req.body._method
		return method
	}
}))

app.get('/', renderGallery);

app.route('/new_photo')
	.get(renderNewPhotoForm)
	.post(addNewPhoto);

app.route('/gallery/:id')
	.get(renderPictureById)
	.put(editPhoto)
	.delete(deletePhoto);

app.route('/gallery')
	.get(renderGallery)
	.post(addNewPhoto)
	.put(editPhoto);

app.route('/gallery/:id/edit')
	.get(renderEditPhoto)
	.put(editPhoto);

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

function renderNewPhotoForm(req,res){
	res.render('newPhoto');
}

function renderPictureById(req, res) {
	var id = req.params.id;
	Photo.findById(id).then(function(photo) {
		if (!photo) {
			res.send(HTTP_ERR_NOT_FOUND);
		} else {
			res.render('photoById', {
				photo: photo,
				createDeleteLink: function(id) {
					return '<form action="/gallery/' + id + '" method="POST">\
					<input type="hidden" name="_method" value="DELETE">\
					<button> Delete Photo </button></form>';
				},
				createEditLink: function(id) {
					return '<a href=' + id + '/edit><button> Edit Photo </button></form></a>'
				}
			});
		}
	});
}

function renderGallery(req, res) {
	Photo.findAll({
		order:[['created_at','DESC']]
	}).then(function(photos) {

		res.render('index', {
			photos: photos
		});
	});
}

function renderEditPhoto(req, res) {
	var id = req.params.id;
	Photo.find({
		where: {
			id: id
		}
	}).then(function(photo) {
		res.render('editForm', {
			photo: photo
		});
	});
}

function addNewPhoto(req, res) {
	if (validatePost(req.body)) {
		Photo.create(req.body)
			.then(function(photo) {
				res.redirect('/gallery');
			}).catch(function(err) {
				if (err) throw err;
			});
	} else {
		res.send(HTTP_ERR_NOT_FOUND);
	}
}


function editPhoto(req, res) {
	var id = req.params.id;
	console.log(req);
	if (validatePost(req.body)) {
		Photo.update({
			author: req.body.author,
			link: req.body.link,
			description: req.body.description
		}, {
			where: {
				id: id
			}
		}).then(function(arg1, arg2) {
			 res.redirect('/gallery/'+id);
		});
	} else {
		res.send('Invalid keys in form');
	}
}

function deletePhoto(req, res) {
	var id = req.params.id;
	Photo.find({
		where: {
			id: id
		}
	}).then(function(photo) {
		photo.destroy();
	});
	res.redirect('/');

}


var server = app.listen(8000, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});

