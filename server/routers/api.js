var express         = require('express')
  , security        = require('../lib/security')
  , queryRouter     = require('../routers/query')
  , endpointRouter  = require('../routers/endpoint');

var router = module.exports = new express.Router();

router.route('/query/:collection')

  .all(function(req, res, next) {
    if ( req.method !== 'GET' ) {
      // We require the user is authenticated to modify any collections
      security.authenticationRequired(req, res, next);
    } else {
      next();
    }
  })

  .all(function(req, res, next) {
    if ( req.method !== 'GET' && (req.params.collection === 'users' || req.params.collection === 'projects') ) {
      // We require the current user to be admin to modify the users or projects collection
      return security.adminRequired(req, res, next);
    }
    next();
  });

router.use('/query', queryRouter);

router.route('/:endpoint')

  .all(function(req, res, next) {
    if (req.method !== 'GET') {
      security.authenticationRequired(req, res, next);
    } else {
      next();
    }
  });

router.use(endpointRouter);
