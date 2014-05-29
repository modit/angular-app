var express   = require('express')
  , config    = require('../config');

var router = module.exports = new express.Router();

// This route enables HTML5Mode by forwarding missing files to the index.html
router.all('/*', function(req, res) {
  // Just send the index.html for other files
  res.sendfile('index.html', { root: config.server.distFolder });
});
