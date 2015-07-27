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
app.use(express.static('public'));

passport.use(new LocalStrategy(
	function(username, password, done) {
		Admin.findOne({
			where: {
				username: username
			}
		}).then(function(user) {
			console.log('in');
			console.log('------------------------------------')
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

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});
app.use(function(req, res, next) {
	console.log('app.locals', app.locals);
	// app.locals.flashError = req.flash('error')
	next();
})
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
	app.locals.logoTextLeft = 'logoTextLeft';
	next();

});
app.use(function(req, res, next) {
	var url = /(\/\w+\/\w*)/g.exec(req.url)
	if (url) {
		app.locals.urlLink = true;
	}
	next();
})
app.use(function(req, res, next) {
	if (req.isAuthenticated()) {
		res.locals.authenticated = true;
	}
	next();
});
app.use(function(req, res, next) {

	next();
});
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(function(req, res, next) {
	console.log('req.user', req.user);
	app.locals.user = req.user
	console.log('-------------------------------------------------------------------------------------');
	next();
})

app.use(methodOverride(function(req, res) {
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		// look in urlencoded POST bodies and delete it
		var method = req.body._method
		delete req.body._method
		return method
	}
}))


app.get('/', renderGallery);

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
})


app.route('/login')
	.get(function(req, res) {
		res.render('login');
	})
	.post(function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			console.log('user', user);
			if (err) {
				return next(err);
			}

			if (!user) {
				return res.send(false);
			}
			req.logIn(user, function(err) {
				if (err) {
					return next(err);
				}
				res.status(200).send(true);

			});
		})(req, res, next);
	});


app.route('/new_photo')
	.get(ensureAuthenticated, renderNewPhotoForm)
	.post(ensureAuthenticated, addNewPhoto);

app.route('/gallery/:id')
	.get(renderPictureById)
	.put(ensureAuthenticated, editPhoto)
	.delete(ensureAuthenticated, deletePhoto);

app.route('/gallery')
	.get(renderGallery)
	.post(addNewPhoto)
	.put(editPhoto);

app.route('/gallery/:id/edit')
	.get(ensureAuthenticated, renderEditPhoto)
	.put(ensureAuthenticated, editPhoto);



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
			var sidePhotos;
			Photo.findAll({
				order: [
					['created_at', 'DESC']
				]
			}).then(function(photos) {
				sidePhotos = photos;				
			}).then(function(){
				res.render('photoById', {
					photo: photo,
					createDeleteLink: function(id) {
						return '<form action="/gallery/' + id + '" method="POST">\
					<input type="hidden" name="_method" value="DELETE">\
					<button> Delete Photo </button></form>';
					},
					createEditLink: function(id) {
						return '<a href=' + id + '/edit class="editPhotoEl"><button> Edit Photo </button></form></a>'
					},
					createCancelLink: function() {
						return '<a href="/"><button> Cancel </button></form></a>'
					},
					sidePhotos: sidePhotos
				})
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
	if (validatePost(req.body)) {
		Photo.update({
			author: req.body.author,
			link: req.body.link,
			description: req.body.description
		}, {
			where: {
				id: id
			}
		}, {
			returning: true
		}).then(function(updatedPhoto) {
			res.send(200, req.body);
		});
	} else {
		res.send('Invalid keyzs in form');
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
	res.send('not logged in');
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