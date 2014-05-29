var express     = require('express')
  , mongoose    = require('mongoose')
  , Q           = require('q')
  , fs          = require('fs')
  , Path        = require('path')
  , Schema      = mongoose.Schema
  , queryRouter = require('../lib/query-router');

var ProductBacklogItemSchema = new Schema({
  projectId: Schema.Types.ObjectId,
  name: String,
  desc: String,
  priority: Number,
  estimation: Number
}, {
  toJSON: {
    virtuals: true
  }
});

ProductBacklogItemSchema.plugin(queryRouter, { plural: 'productbacklog' });

var ProductBacklogItem = module.exports = mongoose.model('ProductBacklogItem', ProductBacklogItemSchema);

ProductBacklogItem.createRouter();
