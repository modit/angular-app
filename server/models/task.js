var express     = require('express')
  , mongoose    = require('mongoose')
  , Q           = require('q')
  , fs          = require('fs')
  , Path        = require('path')
  , Schema      = mongoose.Schema
  , queryRouter = require('../lib/query-router');

var TaskSchema = new Schema({
  projectId: Schema.Types.ObjectId,
  userId: Schema.Types.ObjectId,
  sprintId: Schema.Types.ObjectId,
  productBacklogItemId: Schema.Types.ObjectId,
  name: String,
  desc: String,
  estimation: Number,
  remaining: Number,
  state: String,
  assignedUserId: Schema.Types.ObjectId
}, {
  toJSON: {
    virtuals: true
  }
});

TaskSchema.plugin(queryRouter);

var Task = module.exports = mongoose.model('Task', TaskSchema);

Task.createRouter();
