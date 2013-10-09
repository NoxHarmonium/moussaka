var app = require("../app.js").app_object,
    passport = require("passport"),
    LocalStrategy = require('passport-local').Strategy,
    User = require('../schemas/user.js');

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    function(email, password, done) {
        User.findOne({ email: email }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                //console.log('Incorrect email');
                return done(null, false, { message: 'Incorrect email' });
            }
            user.comparePassword(password, function (err, isMatch) {
                if (isMatch)
                {
                    return done(null, user);
                }
                
                //console.log('Incorrect password');
                return done(null, false, { message: 'Incorrect password' });
            
            });
          });
      }
)
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
      done(err, user);
    });
})
;

app.post('/login/',
  passport.authenticate('local'),
  function(req, res) {
    res.send(200);
  });


