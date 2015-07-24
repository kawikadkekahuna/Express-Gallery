var express = require('express');
var session = require('express-session');
var bcrypt = require('bcrypt');
var flash = require('connect-flash');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var LocalStrategy = require('passport-local').Strategy;
var app = express();
var bodyParser = require('body-parser');
var db = require('../models');
var methodOverride = require('method-override');
var Photo = db.photo;
var Admin = db.User;
var HTTP_ERR_NOT_FOUND = 404;
var PhotoSchema = {
	author: '',
	link: '',
	description: ''
}
db.sequelize.sync();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
//<---------middleware------------>//
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use(function(req, res, next) {
	app.locals.logoTextLeft = 'logoTextLeft';
	// console.log('app.locals',app.locals);
	next();

})
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

app.route('/login')
	.get(function(req, res) {
		var options = {
			errors: req.flash('error')
		};

		res.render('login', options);
	})
	.post(passport.authenticate('local', {
		successRedirect: '/gallery/',
		failureRedirect: '/login',
		failureFlash: true
	}));


createUser('admin','lookatmyhorsemyhorseisamazing');

app.route('/new_photo')
	.get(ensureAuthenticated, renderNewPhotoForm)
	.post(ensureAuthenticated, addNewPhoto);

app.route('/gallery/:id')
	.get(renderPictureById)
	.put(editPhoto)
	.delete(ensureAuthenticated, deletePhoto);

app.route('/gallery')
	.get(renderGallery)
	.post(addNewPhoto)
	.put(editPhoto);

app.route('/gallery/:id/edit')
	.get(ensureAuthenticated, renderEditPhoto)
	.put(ensureAuthenticated, editPhoto);

passport.use(new LocalStrategy(
	function(username, password, done) {
		Admin.findOne({
			where: {
				username: username
			}
		}).then(function(user) {
			console.log('user', user);
			if (!user) {
				return done(null, false, {
					message: 'Incorrect Username'
				});
			}

			if (!bcrypt.compareSync(password, user.password)) {
				console.log('password', password);
				console.log('user.password', user.password);
				return done(null, false, {
					message: 'Incorrect Password'
				});
			}
			return done(null, user);
		})
	}));



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

function renderNewPhotoForm(req, res) {
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
				},
				createCancelLink: function() {
					return '<a href="/"><button> Cancel </button></form></a>'
				}
			});
		}
	});
}

function renderGallery(req, res) {
	app.locals.logoTextLeft = '';
	Photo.findAll({
		order: [
			['created_at', 'DESC']
		]
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
			photo: photo,
			createCancelLink: function() {
				return '<a href="/gallery"><button> Cancel </button></a>'
			},
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
			res.redirect('/gallery/' + id);
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


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('msg', 'hello world!');
	console.log('req.flash', req.flash);
	res.redirect('/login');
}

function createUser(name, password) {

	//Edit after : Reconfingure salt to equal created_at;
	var salt = bcrypt.genSaltSync(15);
	var hash = bcrypt.hashSync(password, salt);
	Admin.create({
		username: name,
		password: hash
	});
}

var server = app.listen(9430, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});