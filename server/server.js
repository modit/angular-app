var fs              = require('fs')
  , http            = require('http')
  , https           = require('https')

  , express         = require('express')
  , bodyParser      = require('body-parser')
  , cookieParser    = require('cookie-parser')
  , session         = require('express-session')
  , errorhandler    = require('errorhandler')
  , logger          = require('morgan')
  , passport        = require('passport')
  , mongoose        = require('mongoose-q')(require('mongoose'), { spread: true })
  , MongoStore      = require('connect-mongo')(session)

  , config          = require('./config.js')
  
  , xsrf            = require('./lib/xsrf')
  , security        = require('./lib/security')
  , protectJSON     = require('./lib/protectJSON')

  , staticRouter    = require('./routers/static')
  , apiRouter       = require('./routers/api')
  , securityRouter  = require('./routers/security')
  , appFileRouter   = require('./routers/appFile');

mongoose.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.db);

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

mongoose.connection.once('open', function callback () {
  console.log('MongoDB Connection Opened');
  
  var sessionParams = {
    secret: config.server.cookieSecret,
    maxAge: new Date(Date.now() + parseInt(config.server.cookieMax, 10)),
    store: new MongoStore({
      host: config.mongo.host,
      port: config.mongo.port,
      db: config.mongo.db
    })
  };
  
  var privateKey  = fs.readFileSync(__dirname + '/cert/privatekey.pem').toString();
  var certificate = fs.readFileSync(__dirname + '/cert/certificate.pem').toString();
  var credentials = { key: privateKey, cert: certificate };
  
  var app = express();
  //var secureServer = https.createServer(credentials, app);
  var server = http.createServer(app);
  
  app.use(staticRouter);                              // Handle public file requests
  app.use(protectJSON);                               // Close a JSON vulnerability
  app.use(logger());                                  // Log requests to the console
  app.use(bodyParser());                              // Extract the data from the body of the request - this is needed by the LocalStrategy authenticate method
  app.use(cookieParser(config.server.cookieSecret));  // Hash cookies with this secret
  app.use(session(sessionParams));                    // Store the session in Mongo to allow for scaling to multiple server instances
  app.use(passport.initialize());                     // Initialize PassportJS
  app.use(passport.session());                        // Passport's session strategy - stores the logged in user in the session and now runs on any request
  app.use(xsrf);                                      // Add XSRF checks to the request
  
  security.initialize();                              // Add a Mongo strategy for handling the authentication
  
  app.use(function(req, res, next) {
    if (req.user) {
      console.log('Current User:', req.user.firstName, req.user.lastName);
    } else {
      console.log('Unauthenticated');
    }
    next();
  });
  
  app.use('/api', apiRouter);                         // Handle api requests
  app.use(securityRouter);                            // Handle security requests - i.e. login, auth, etc
  app.use(appFileRouter);                             // Redirect other file requests to index for HTML5 mode
  
  // A standard error handler - it picks up any left over errors and returns a nicely formatted server 500 error
  app.use(errorhandler({ dumpExceptions: true, showStack: true }));
  
  // Start up the server on the port specified in the config
  server.listen(config.server.listenPort, '0.0.0.0', 511, function() {
    // Once the server is listening we automatically open up a browser
    var open = require('open');
    open('http://localhost:' + config.server.listenPort + '/');
  });
  console.log('Angular App Server - listening on port: ' + config.server.listenPort);
  
  //secureServer.listen(config.server.securePort);
  //console.log('Angular App Server - listening on secure port: ' + config.server.securePort);
  
  //===Graceful Shutdown===============================================================
  
  // when you want the server to die gracefully i.e. to wait for existing connections
  function gracefulShutdown() {
    console.log('Received kill signal, shutting down gracefully.');
    server.close(function() {
      console.log('Express closed out remaining connections.');
      mongoose.connection.close(function() {
        console.log('MongoDB closed out remaining connections.');
        process.exit();
      });
    });
    
    // if after
    setTimeout(function() {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit();
    }, 10*1000);
  }
  
  // listen for TERM signal .e.g. kill
  process.on('SIGTERM', gracefulShutdown);
  
  // listen for INT signal e.g. Ctrl-C
  process.on('SIGINT', gracefulShutdown);
  
  process.on('uncaughtException', function (error) {
    console.error('An uncaughtException was found, this process will end.', error);
    gracefulShutdown();
  });
});
