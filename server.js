//server.js


// CALL THE PACKAGES
// ==================================================================================
const express = require('express');
const app = express();
const morgan = require('morgan');
const http = require('http').Server(app);
const socketio = require('socket.io')(http);
const bodyParser = require('body-parser');
const os = require('os');
const interfaces = os.networkInterfaces();
const shortid = require('shortid');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


// BASE SETUP
// ==================================================================================
// configure app to use bodyParser()
// this will let us get the data from a POST
var User = require('./app/models/user');

mongoose.connect('mongodb://localhost:27017'); // connect to our database

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

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

// LogIN Route
router.route('/users/login')

  //  POST (accessed at POST)
  .post(function(req, res) {
  User.findOne({username: req.body.username, password: req.body.password}, function(err, user) {
      if (err) {
          res.json({
              type: false,
              data: "Error occured: " + err
          });
      } else {
          if (user) {
             res.json({
                  type: true,
                  data: user,
                  token: user.token
              });
          } else {
              res.json({
                  type: false,
                  data: "Incorrect username/password"
              });
          }
      }
    });
  })

// SignUP Route
router.route('/users/signup')

  .post(function(req, res) {
    User.findOne({username: req.body.username, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                var userModel = new User();
                userModel.email = req.body.email;
                userModel.name = req.body.name;
                userModel.username = req.body.username;
                userModel.password = req.body.password;
                userModel.date = req.body.date;
                userModel.gender = req.body.gender;
                userModel.save(function(err, user) {
                    user.token = jwt.sign(user, process.env.JWT_SECRET);
                    user.save(function(err, user1) {
                        res.json({
                            type: true,
                            data: user1,
                            token: user1.token
                        });
                    });
                })
            }
        }
    });
  })

router.route('/users/me')

  .get( ensureAuthorized, function(req, res) {
    User.findOne({token: req.token}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            res.json({
                type: true,
                data: user
            });
        }
    });
  })

  function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
  };

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
process.on('uncaughtException', function(err) {
    console.log(err);
});

const port = 8080;
http.listen(port);

console.log(`Magic happens on port ${port}`);
