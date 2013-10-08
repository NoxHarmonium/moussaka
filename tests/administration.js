var superagent = require('superagent');
var expect = require('expect.js');

describe('Administration API tests', function() {
    var id;
    var username = 'test.account@test.com';
    var password = 'test_password';

    it('Login before user exists', function(done) {
        superagent.post('http://localhost:3000/login/')
            .send({ 
                    'username': username,
                    'password': password
                  })
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.eql(401);
                    done();
                  });

    });

    it('Create the user', function(done) {
        superagent.post('http://localhost:3000/users/')
            .send({
                    'username': username,
                    'password': password
                  })
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.eql(201);
                    done();
                  });
    });

    it('Login now user exists', function(done) {
        superagent.post('http://localhost:3000/login/')
            .send({
                    'username': username,
                    'password': password
                  })
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.eql(200);
                    done();
                  });

    });

    it('Get login information for user', function(done) {
        superagent.get('http://localhost:3000/users/' + username + '/')
            .send()
            .end(function(e, res) {
                expect(e).to.eql(null);
                expect(res.ok).to.be.ok();
            }); 
    });    
 

});
