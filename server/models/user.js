var express     = require('express')
  , mongoose    = require('mongoose')
  , crypto      = require('crypto')
  , bcrypt      = require('bcrypt')
  , Q           = require('q')
  , fs          = require('fs')
  , Path        = require('path')
  , nodemailer  = require('nodemailer')
  , Schema      = mongoose.Schema
  , queryRouter = require('../lib/query-router');
  
var smtpTransport = nodemailer.createTransport("SMTP", {
  service: 'Gmail',
  auth: {
    user: process.env.SYSTEM_EMAIL_ADDRESS,
    pass: process.env.SYSTEM_EMAIL_PASSWORD
  }
});

//var verifyTemplate = fs.readFileSync(Path.join(__dirname,'../views/verify.ejs'), 'utf8');

var UserSchema = new Schema({
  auth: {
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verification: String
  },
  admin: { type: Boolean, default: false },
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String
}, {
  toJSON: {
    virtuals: true
  }
});

UserSchema.methods = {
  setPassword: function(password) {
    var user = this;
    return User.hashPassword(password).then(function(hash){
      return user.updateQ({ $set: { 'auth.password': hash } });
    });
  },
  comparePassword: function(candidatePassword) {
    var user = this;
    return Q.ninvoke(bcrypt, 'compare', candidatePassword, user.auth.password);
  },
  sendVerification: function() {
    var user = this;
    var key = crypto.createHash('md5').update(new mongoose.Types.ObjectId().toString()).digest('hex');
    
    var mailOptions = {
      from: process.env.SYSTEM_EMAIL_FROM,
      to: this.email,
      subject: 'Verify Email Address',
      html: ejs.render(verifyTemplate, this),
      generateTextFromHTML: true
    };
    
    return Q.ninvoke(smtpTransport, 'sendMail', mailOptions).then(function() {
      user.auth.verification = key;
      return user.updateQ({ $set: { 'auth.verification': key } });
    }).thenResolve(user);
  }
};

UserSchema.statics = {
  findByEmail: function(email) {
    //allow dots anywhere in email address before @
    var emailParts = email.split('@');
    var regex = new RegExp(emailParts[0].replace(/\./g, '').split('').join('.*') + '@' + emailParts[1], 'i');
    
    return User.findOneQ({ email: regex });
  },
  hashPassword: function(password) {
    return Q.ninvoke(bcrypt, 'genSalt', process.env.SALT_WORK_FACTOR || 10).then(function(salt) {
      return Q.ninvoke(bcrypt, 'hash', password, salt);
    });
  },
  signup: function(email, password, confirm) {
    if (password !== confirm) return Q.reject('passwords must match');
    
    return User.findByEmail(email).then(function(user) {
      if (user) { return Q.reject('email already in use'); }
      
      return User.hashPassword(password).then(function(hash) {
        return new User({
          email: email,
          auth: {
            password: hash
          }
        }).saveQ().spread(function(user) {
          //return user.sendVerification();
          return user;
        });
      });
    });
  }
};

UserSchema.plugin(queryRouter);

var User = module.exports = mongoose.model('User', UserSchema);

User.createRouter();

/*User.router.param('userId', function(req, res, next, id) {
  User.findByIdQ(id).then(function(user) {
    if (!user) { return next(new Error('failed to load user')); }
    
    req.params.user = user;
    next();
  });
});

User.router.route('/users')

  .get(function(req, res, next) {
    var match = {};
    if (req.query.q) {
      try {
        match = JSON.parse(req.query.q);
      } catch (err) {
        console.log('invalid json');
      }
    }
    User.findQ(match).then(function(users) {
      res.json(200, users);
    });
  })
  
  .post(function(req, res, next) {
    var user = new User(req.body);
    user.saveQ().then(function(user) {
      res.json(200, user);
    });
  });

User.router.route('/users/:userId')

  .get(function(req, res, next) {
    res.json(req.params.user);
  })
  
  .put(function(req, res, next) {
    req.params.user.updateQ(req.body).then(function(user) {
      res.json(200, user);
    });
  })
  
  .delete(function(req, res, next) {
    req.params.user.removeQ().then(function(user) {
      res.json(200, user);
    });
  });
*/
