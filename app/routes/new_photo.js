var express = require('express');
var router = express.Router();


//GET http://localhost:3000/users
router.get('/', function(req, res) {
  res.send('All users');
});

//GET http://localhost:3000/users/1
router.get('/:id', function(req, res) {
  res.send('Some dude');
});

//POST http://localhost:3000/users
router.post('/', function(req, res) {
  res.send('Creating a dude');
});

//PUT http://localhost:3000/users/1
router.put('/:id', function(req, res) {
  res.send('Updated a dude');
});

module.exports = router;