var express = require('express')
  , User = require('../models/user')
  , Task = require('../models/task')
  , Sprint = require('../models/sprint')
  , ProductBacklogItem = require('../models/product-backlog-item')
  , Project = require('../models/project');

var router = module.exports = new express.Router();

router.use(User.router);
router.use(Task.router);
router.use(Sprint.router);
router.use(ProductBacklogItem.router);
router.use(Project.router);
