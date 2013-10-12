var superagent = require('superagent');
var expect = require('expect.js');

describe('Administration API tests', function() {
    var id;
    var users = [
        { 
            username: 'test.account@test.com',
            password: 'test_password'
        },
        { 
            username: 'test.account2@test.com',
            password: 'test_password3'
        },
        { 
            username: 'test.account3@test.com',
            password: 'test_password4'
        },


    ];
    var agent = superagent.agent();

    // Clear out old test data if exists
    for (var i = 0; i < users.length; i++)
    {
        (function (u) {
            it('Login user [' + i + '] before user exists', function(done) {
                agent.post('http://localhost:3000/login/')
                    .send(u)
                          .end(function(e, res) {
                            expect(e).to.eql(null);
                            expect(res.status).to.not.be(500);
                            if (res.status != 401)
                            {
                                //console.log("Warning: Test user already exists, did the last test run fail halfway through?");
                            }
                            //expect(res.status).to.eql(401);
                            done();
                          });

            });

         
            it('Delete user [' + i + '] if exist', function(done) {
                agent.del('http://localhost:3000/users/' + u.username + '/')
                 .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.not.be(500);
                    done();
                });
            });
        })(users[i]);


    }

    it('Create user [0]', function(done) {
        agent.put('http://localhost:3000/users/' +  users[0].username + '/')
            .send(users[0])
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.be(201);
                    done();
                  });
    });


    it('Login user [0] with incorrect password', function(done) {
        var u = 
        {
            username: users[0].username,
            password: 'incorrect'
        }
       

        agent.post('http://localhost:3000/login/')
            .send(u)
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.be(401);
                    done();
                  });

    });

    it('Login user [0] with correct password', function(done) {
        agent.post('http://localhost:3000/login/')
            .send(users[0])
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.ok).to.be.ok();
                    done();
                  });

    });

    it('Get login information for user', function(done) {
        agent.get('http://localhost:3000/users/' + users[0].username + '/')
            .send()
            .end(function(e, res) {
                expect(e).to.eql(null);
                expect(res.ok).to.be.ok();
                expect(res.body.password).to.be(undefined);
                done();
            }); 
    });   

   

    it('Attempt to change password for user [0] before they are logged out', function(done) {
        agent.post('http://localhost:3000/users/' + users[0].username + '/password/')
            .send({
                'oldPassword' : users[0].password,
                'newPassword' : 'new password'

            })
            .end(function(e, res) {
                expect(e).to.eql(null);
                expect(res.status).to.be(400);
                done();
            }); 
    });   

    it('Logout user [0]', function(done) {
        agent.get('http://localhost:3000/logout/')
            .send()
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.ok).to.be.ok();
                    done();
                  });

    }); 

    it('Attempt to delete user [0] while logged out', function(done) {
            agent.del('http://localhost:3000/users/' + users[0].username + '/')
             .end(function(e, res) {
                expect(e).to.eql(null);
                expect(res.status).to.be(401);
                done();
            });
     

        });

    it('Attempt to change password for user [0] with incorrect password', function(done) {
        agent.post('http://localhost:3000/users/' + users[0].username + '/password/')
            .send({
                'oldPassword' : 'incorrect',
                'newPassword' : 'new password'
            })
            .end(function(e, res) {
                expect(e).to.eql(null);
                expect(res.status).to.be(401);
                done();
            }); 
    });    

    it('Change password for user [0] with correct password', function(done) {
        agent.post('http://localhost:3000/users/' + users[0].username + '/password/')
            .send({
                'oldPassword' : users[0].password,
                'newPassword' : 'new password'

            })
            .end(function(e, res) {
                expect(e).to.eql(null);
                expect(res.ok).to.be.ok();
                done();
            }); 
    });   

     it('Login user [0] with old password', function(done) {
        agent.post('http://localhost:3000/login/')
            .send(users[0])
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.be(401);
                    done();
                  });

    });

    it('Login user [0] with new password', function(done) {

        agent.post('http://localhost:3000/login/')
            .send({
                username : users[0].username,
                password : 'new password'

            })
            .end(function(e, res) {
                expect(e).to.eql(null);
                expect(res.ok).to.be.ok();
                done();
            });
    });

   it('Logout user [0]', function(done) {
        agent.get('http://localhost:3000/logout/')
            .send()
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.ok).to.be.ok();
                    done();
                  });

    }); 

    it('Change password for user [0] back to default', function(done) {
        agent.post('http://localhost:3000/users/' + users[0].username + '/password/')
            .send({
                'oldPassword' : 'new password',
                'newPassword' : users[0].password

            })
            .end(function(e, res) {
                expect(e).to.eql(null);
                expect(res.ok).to.be.ok();
                done();
            }); 
    });   



 

});
