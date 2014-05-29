var express   = require('express')
  , security  = require('../lib/security');

var router = module.exports = new express.Router();

router.post('/login', security.login);
router.post('/logout', security.logout);

// Retrieve the current user
router.get('/current-user', security.sendCurrentUser);

// Retrieve the current user only if they are authenticated
router.get('/authenticated-user', function(req, res) {
  security.authenticationRequired(req, res, function() { security.sendCurrentUser(req, res); });
});

// Retrieve the current user only if they are admin
router.get('/admin-user', function(req, res) {
  security.adminRequired(req, res, function() { security.sendCurrentUser(req, res); });
});
