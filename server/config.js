path = require('path');

module.exports = {
  mongo: {
    host: process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost', // The name of the domain on which MongoDB is hosted - autoset by Docker
    port: process.env.MONGO_PORT_27017_TCP_PORT || 27017,       // The port on which MongoDB is hosted - autoset by Docker
    db:   process.env.MONGO_DATABASE || 'ascrum'                // The name of the database that contains the app data
  },
  security: {
    dbName: process.env.MONGO_DATABASE || 'ascrum',           // The name of database that contains the security information
    usersCollection: 'users'                                  // The name of the collection that contains user information
  },
  server: {
    listenPort: process.env.WEB_PORT || 3000,                 // The port on which the server is to listen (means that the app is at http://localhost:3000 for instance)
    securePort: 8433,                                         // The HTTPS port on which the server is to listen (means that the app is at https://localhost:8433 for instance)
    distFolder: path.resolve(__dirname, '../client/dist'),    // The folder that contains the application files - relative to this file
    staticUrl: '/static',                                     // The base url from which we serve static files (such as js, css and images)
    cookieSecret: process.env.COOKIE_SECRET || 'angular-app', // The secret for encrypting the cookie
    cookieMax: process.env.COOKIE_MAX || 10000                // The time it takes the cookie to expire - in seconds
  }
};