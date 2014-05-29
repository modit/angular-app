var express   = require('express')
  , favicon   = require('serve-favicon')
  , compress  = require('compression')
  , config    = require('../config');

var router = module.exports = new express.Router();

// Serve up the favicon
router.use(favicon(config.server.distFolder + '/favicon.ico'));

// First looks for a static file: index.html, css, images, etc.
router.use(config.server.staticUrl, compress());
router.use(config.server.staticUrl, express.static(config.server.distFolder));
router.use(config.server.staticUrl, function(req, res, next) {
  res.send(404); // If we get here then the request for a static file is invalid
});
