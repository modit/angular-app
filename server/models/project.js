var express     = require('express')
  , mongoose    = require('mongoose')
  , Q           = require('q')
  , fs          = require('fs')
  , Path        = require('path')
  , Schema      = mongoose.Schema
  , queryRouter = require('../lib/query-router');

var ProjectSchema = new Schema({
  name: String,
  desc: String,
  productOwner: Schema.Types.ObjectId,
  scrumMaster: Schema.Types.ObjectId,
  teamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  toJSON: {
    virtuals: true
  }
});

ProjectSchema.statics = {
  router: new express.Router()
};

ProjectSchema.plugin(queryRouter);

var Project = module.exports = mongoose.model('Project', ProjectSchema);

Project.createRouter();

/*Project.router.param('projectId', function(req, res, next, id) {
  Project.findById(id, function(err, project) {
    if (err) {
      return next(err);
    }
    else if (!project) {
      return next(new Error('failed to load project'));
    }
    
    req.params.project = project;
    next();
  });
});

Project.router.route('/projects')

  .get(function(req, res, next) {
    Project.find({}, function(err, projects) {
      if (err) { return next(err); }
      
      res.json(projects);
    });
  });

Project.router.route('/projects/:projectId')

  .get(function(req, res, next) {
    res.json(req.params.project);
  });
*/