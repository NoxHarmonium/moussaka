app = require("../app.js").app_object;

var User = require('../schemas/user.js');

app.get('/users/', function (req, res) {
    // Schemas
    
    var query = User.find();
    query.select('email');

    query.exec(function (err, user) {
        if (err) return handleError(err);
        res.send(user);
    });
});

app.param('user', function(req, res, next, email) {
    var query = User.findOne({'email': email});
    query.select('email projects');
    query.limit(10);
    query.exec(function (err, user) {
        if (err) return next(err);
        req.user = user;
        next();
    });

});

app.get('/users/:user/', function (req, res) {
     if (req.user)
     {
        res.send(req.user);
     }
     else
     {
        res.send(404, { detail: 'User doesn\'t exist' }); 
     }
});

app.put('/users/:user/', function (req, res) {
    //console.log(('Create user request: Username: ' + req.body.username + ' Password:' + req.body.password).green);
    
    if (req.user)
    {
       //console.log('Warning: User already exists'.yellow);
       res.send(409, { detail: 'User already exists' });
       return;
    }

    var newUser = new User();
    newUser.email = req.body.username;
    newUser.password = req.body.password;
    newUser.save(
        function (err) {
           if (err)
           {
              return handleError(err); 
           }
           res.send(201);
        }
    );
});

