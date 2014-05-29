var express     = require('express')
  , mongoose    = require('mongoose')
  , Q           = require('q')
  , fs          = require('fs')
  , Path        = require('path')
  , Schema      = mongoose.Schema
  , queryRouter = require('../lib/query-router');

var SprintSchema = new Schema({
  projectId: Schema.Types.ObjectId,
  name: String,
  capacity: Number,
  start: Date,
  end: Date,
  sprintBacklog: [{ type: Schema.Types.ObjectId, ref: 'Story'}]
}, {
  toJSON: {
    virtuals: true
  }
});

SprintSchema.plugin(queryRouter);

var Sprint = module.exports = mongoose.model('Sprint', SprintSchema);

Sprint.createRouter();

/*Sprint.router.param('sprintId', function(req, res, next, id) {
  Sprint.findOneById(id, function(err, sprint) {
    if (err) {
      return next(err);
    }
    else if (!sprint) {
      return next(new Error('failed to load sprint'));
    }
    
    req.params.sprint = sprint;
    next();
  });
});

Sprint.router.get('sprints/:sprintId', function(req, res, next) {
  res.json(req.params.sprint);
});
*/