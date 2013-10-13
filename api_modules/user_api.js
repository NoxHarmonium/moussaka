app = require("../app.js").app_object;

var User = require('../schemas/user.js'),
    passport = require("passport");


app.get('/users/', function (req, res) {
    // Schemas
    
    var query = User.find();
    query.select('email');

    query.exec(function (err, user) {
        if (err) return handleError(err);
        return sres.send(user);
    });
});

app.param('user', function(req, res, next, email) {
    var query = User.findOne({'email': email});
    query.exec(function (err, user) {
        if (err) return next(err);
        req.selectedUser = user;
        next();
    });

});

app.get('/users/:user/', function (req, res) {
     if (req.user)
     {
        return res.send({ username: req.user.username } );
     }
     else
     {
        return res.send(404, { detail: 'User doesn\'t exist' }); 
     }
});

app.del('/users/:user/', function (req, res) {

    if (req.user != null && req.user.email == req.selectedUser.email)
    {
        return req.user.remove(function (err)
        {
            if (err)
            {
                 next(err); 
            }
            req.logout();
            return res.send(200);
        });
    }
    return res.send(401);
});

app.put('/users/:user/', function (req, res, next) {
    //console.log(('Create user request: Username: ' + req.body.username + ' Password:' + req.body.password).green);
    
    if (req.selectedUser)
    {
       //console.log('Warning: User already exists'.yellow);
       return res.send(409, { detail: 'User already exists' });
    }

    var newUser = new User();
    newUser.email = req.body.username;
    newUser.password = req.body.password;
    newUser.save(
        function (err) {
           if (err)
           {
              next(err); 
           }
           return res.send(201);
        }
    );
});

app.post('/users/:user/password/' , function (req, res, next) {

    if (req.user != null)
    {
        return res.send(400, { detail: 'Cannot change password when logged in' })
    }

    req.selectedUser.comparePassword(req.body.oldPassword, function (err, isMatch) {
        
        if (err)
        {
            return next(err);
        }

        if (isMatch)
        {
            req.selectedUser.password = req.body.newPassword;
            req.selectedUser.save(function(err) {
                if (err)
                {
                    next(err);
                }

                return res.send(200);
            });
        }
        else
        {
            return res.send(401, { detail: 'Old password was incorrect'});
        }
    });
    
});

app.get('/logout/',  function (req, res, next) {
    if (req.user != null)
    {
        req.logout();
    }

    return res.send(200);


});

app.post('/login/',
  passport.authenticate('local'),
  function(req, res) {
    res.send(200);
});

