//server.js


// CALL THE PACKAGES
// ==================================================================================
const express = require('express');
const app = express();
const http = require('http').Server(app);
const socketio = require('socket.io')(http);
const bodyParser = require('body-parser');
const os = require('os');
const interfaces = os.networkInterfaces();
const shortid = require('shortid');
const mongoose = require('mongoose');


// BASE SETUP
// ==================================================================================
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017'); // connect to our database

var User = require('./app/models/user');

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});

// more routes for our API will happen here
// on routes that end in /users
// ----------------------------------------------------
router.route('/users')

  // create a user on POST (accessed at POST)
  .post(function(req, res) {
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.username = req.body.username;
    user.password = req.body.password;
    user.birthDate = req.body.birthDate;
    user.gender = req.body.gender;

    // save the user and check for errors
    user.save(function(err) {
      if (err)
        res.send(err);
    });
  })

  // get all the users (accessed at GET)
  .get(function(req, res) {
    User.find(function(err, users) {
      if (err)
        res.send(err);

      res.json(users);
    });
  })

// on routes that end in /users/:user_id
// ----------------------------------------------------
router.route('/users/:user_id')

  // get the bear with that id (accessed at GET)
  .get(function(req, res) {
      User.findById(req.params.user_id, function(err, user) {
        if (err)
          res.send(err);
        res.json(user);
      });
  })

  // update the user with this id (accessed at PUT)
  .put(function(req, res) {
    // use user model to find the user we want
    User.findById(req.params.user_id, function(err, user) {
      if (err)
        res.send(err);

      user.name = req.body.name; // update the user name

      // save the user
      user.save(function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'User updated!' });
      });
    });
  })

  // delete the user with this id (accessed at DELETE)
  .delete(function(req, res) {
    User.remove({
      _id: req.params.user_id
    }, function(err, user) {
      if (err)
        res.send(err);

      res.json({ message: 'User deleted!'});
    });
  })

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);


// SOCKET CONNECT, DISCONNECT, LOGIN, SIGNUP
// ==================================================================================
socketio.on('connect', function(socket){
  var clientId = shortid.generate();

  console.log(`user with id:${clientId} has connected`);

  socket.on('disconnect', function() {
    console.log(`user with id:${clientId} has disconnected`);
  });

  socket.on('signUpClicked', function(signUpData) {
    var name = signUpData[0]
    var email = signUpData[1];
    var username = signUpData[2];
    var password = signUpData[3];
    var birthDate = signUpData[4];
    var gender = signUpData[5];

  });

  socket.on('logInClicked', function(logInData) {
    var username = logInData[0];
    var password = logInData[1];

  });

});


// START THE SERVER ON THE IPv4
// ==================================================================================
const port = 8080
http.listen(port);

console.log(`Magic happens on port ${port}`);
