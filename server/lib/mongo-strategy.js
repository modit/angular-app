var util = require('util');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

function MongoDBStrategy() {

  // Call the super constructor - passing in our user verification function
  // We use the email field for the username
  LocalStrategy.call(this, { usernameField: 'email' }, this.verifyUser.bind(this));

  // Serialize the user into a string (id) for storing in the session
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  
  // Deserialize the user from a string (id) into a user (via a cll to the DB)
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

  // We want this strategy to have a nice name for use by passport, e.g. app.post('/login', passport.authenticate('mongo'));
  this.name = MongoDBStrategy.name;
}

// MongoDBStrategy inherits from LocalStrategy
util.inherits(MongoDBStrategy, LocalStrategy);

MongoDBStrategy.name = "mongo";

// Check whether the user passed in is a valid one
MongoDBStrategy.prototype.verifyUser = function(email, password, done) {
  User.findByEmail(email).then(function(user) {
    if (!user) { return Q.reject('User not found: ' + email); }
    
    return user.comparePassword(password).then(function(isMatch) {
      if (!isMatch) { return Q.reject('Invalid Password'); }
    }).then(function() {
      done(null, user);
    });
    
  }).catch(function(error) {
    done(null, false, { message: error });
  });
};

module.exports = MongoDBStrategy;
