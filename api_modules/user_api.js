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
        if (err) return handleError(err);
        res.send(user);
    });

});

app.get('/users/:user', function (req, res) {});

app.post('/users/', function (req, res) {
    console.log(('Login request: Username:' + req.body.username + ' Password:' + req.body.password).green);
});

