var express = require('express');

module.exports = exports = function routerPlugin (schema, options) {

  schema.static('createRouter', function() {
    options = options || {};
    
    var Model = this;
    var singular = options.singular || this.modelName.toLowerCase();
    var plural = options.plural || this.collection.name;
    var routeParam = options.routeParam || singular + 'Id';
    
    Model.router = new express.Router();

    Model.router.param(routeParam, function(req, res, next, id) {
      Model.findByIdQ(id).then(function(doc) {
        if (!doc) { return next(new Error('failed to load ' + singular)); }
        req.params[singular] = doc;
        next();
      });
    });

    Model.router.route('/' + plural)
    
      .get(function(req, res, next) {
        var match = {};
        if (req.query.q) {
          try {
            match = JSON.parse(req.query.q);
          } catch (err) {
            console.log('invalid json');
          }
        }
        Model.findQ(match).then(function(docs) {
          res.json(200, docs);
        });
      })
      
      .post(function(req, res, next) {
        var doc = new Model(req.body);
        doc.saveQ().spread(function(doc) {
          res.json(200, doc);
        });
      })
    ;
      
    Model.router.route('/' + plural + '/:' + routeParam)
    
      .get(function(req, res, next) {
        res.json(req.params[singular]);
      })
      
      .put(function(req, res, next) {
        req.params[singular].updateQ(req.body).spread(function(doc) {
          res.json(200, doc);
        });
      })
      
      .delete(function(req, res, next) {
        req.params[singular].removeQ().then(function(doc) {
          res.json(200, doc);
        });
      })
    ;
    
  });
};
