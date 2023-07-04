process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareamealtest';

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
  const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "n.name@server.nl", "secret", "DefaultStreet", "city"),' +
    '(2, "John", "Doe", "j.doe@server.com", "secret", "DefaultStreet", "city"),' +
    '(3, "Willem", "Groot", "w.groot@server.com", "secret", "DefaultStreet", "city");';

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
  const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(3, 'Meal C', 'description', 'image url', NOW(), 2, 6.50, 2);";

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const dbconnection = require('../src/util/mysql-db');
chai.should()
chai.use(chaiHttp)

let authToken;


beforeEach((done) => {
  // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
  dbconnection.getConnection(function (err, connection) {
    if (err) {
      done(err);
      throw err; // no connection
    }
    // Use the connection
    connection.query(
      CLEAR_DB + INSERT_USER + INSERT_MEALS,
      function (error, results, fields) {
        if (error) {
          done(error);
          throw error; // not connected!
        }

        // When done with the connection, release it.
        dbconnection.releaseConnection(connection);
        // Let op dat je done() pas aanroept als de query callback eindigt!
        done();
      }
    );
  });
});


before((done) => {
  chai.request(server)
    .post('/api/login')
    .send({
      emailAdress: 'j.doe@server.com',
      password: 'secret'
    })
    .end((err, res) => {
      console.log(res.body); //Shows result working login and getting a token
      if(res.body && res.body.data) {
        authToken = res.body.data.token;
      } else {
        console.error("Failed to get token from response body")
      }
      done();
    });
});


  // UC-201 Register a new user
  describe('UC-201 Register a new user', () => {

  // TC-201-1 - Required field missing
    it('TC-201-1 - Required field missing', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          firstName: 'John',
          // lastName is missing
          emailAdress: 'j.doe@domein.com',
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('status').to.be.equal(400);
          res.body.should.have.property('message').to.include('Required field missing');
          done();
        });
    });

  //TC-201-2 - Required field "emailAddress" is invalid'  
    it('TC-201-2 - Required field "emailAddress" is invalid', (done) => {
      const newUser = {
        firstName: 'John',
        lastName: 'WDDW',
        emailAddress: 'john@invalidemail',  // Invalid email address
        password: 'Welkom01',
        phoneNumber: '06 12345678'
      };
    
      chai
        .request(server)
        .post('/api/user')
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('status').to.be.equal(400);
          res.body.should.have.property('message');
          done();
        });
    });

  //TC-201-3 - Required field "password" is invalid'  
    it('TC-201-3 - Required field "password" is invalid', (done) => {
        const newUser = {
          firstName: 'John',
          lastName: 'WDDW',
          emailAddress: 'j.john@invalidemail.nl', 
          password: 'secret', // Invalid password
          phoneNumber: '06 12345678'
        };
      
        chai
          .request(server)
          .post('/api/user')
          .send(newUser)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('status').to.be.equal(400);
            res.body.should.have.property('message');
            done();
          });
    });
    
    
    // TC-201-4 - User already exists
    it('TC-201-4 - User already exists', (done) => {
      chai
      .request(server)
      .post('/api/user')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          emailAdress: 'j.doe@server.com',
          password: 'Welkom01',
          phoneNumber: '0612345678'
        })
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.be.an('object');
          res.body.should.have.property('status').to.be.equal(403);
          res.body.should.have.property('message').to.include('User already exists');
          done();
        });
      });

      // TC-201-5 - User successfully registered -- omdat gebruiker aangemaakt wordt moet je de database legen anders krijgt hij melding user bestaat al
        it('TC-201-5 - User successfully registered', (done) => {

          chai
            .request(server)
            .post('/api/user')
            .send({
                firstName: 'Jena',
                lastName: 'Rose',
                emailAdress: 'j.rose@domein.com',
                password: 'Welkom01',
                phoneNumber: '0612345678',
                street: 'DefaultStreet',
                city: 'DefealtCity'
            })
            .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.an('object');
              res.body.should.have.property('status').to.be.equal(201);
              res.body.should.have.property('message');
              res.body.should.have.property('data');
              const { data } = res.body;
              data.should.be.an('object');
              data.should.have.property('id');
              data.should.have.property('firstName').to.be.equal('Jena');
              data.should.have.property('lastName').to.be.equal('Rose');
              data.should.have.property('emailAdress').to.be.equal('j.rose@domein.com');
              done();
            });
        });
        
  });

  // UC-202 Opvragen van overzicht van users
  describe('UC-202 Get all users', () => {
  it('TC-202-1 - Show all users (minimum 2)', (done) => {
    chai
      .request(server)
      .get('/api/user')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        res.body.should.have.property('message');
        res.body.should.have.property('data');
        const { data } = res.body;
        data.should.be.an('array').that.has.lengthOf.at.least(2);
        done();
      });
    });
    
    it('TC-202-2 - Search for non existing fields', (done) => {
      chai
        .request(server)
        .get('/api/user?firstName=PepaBig')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
            res.body.should.be.an('object');
            let {status, message, data} = res.body;
            status.should.equal(200);
            message.should.equal('User data endpoint');
            res.body.should.have.property('status').to.be.equal(200);
            data.should.be.an('array');
            data.length.should.be.eql(0);
            done();
        });
      });

  it('TC-202-3 - Show all users isActive=false', (done) => {
    chai
      .request(server)
      .get('/api/user?isActive=false')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        res.body.should.have.property('message');
        done();
      });
    });

    it('TC-202-4 - Show all users isActive=true', (done) => {
      chai
        .request(server)
        .get('/api/user?isActive=true')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('status').to.be.equal(200);
          res.body.should.have.property('message');
          done();
        });
      });

      it('TC-202-5 - Show all users using 2 search fields', (done) => {
        chai
          .request(server)
          .get('/api/user?firstName=HenkisActive=true')
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('status').to.be.equal(200);
            res.body.should.have.property('message');
            done();
          });
        });
  });  

  // UC-203 Opvragen van gebruikersprofiel
  describe('UC-203 get user profile', () => {

  it('TC-203-1 - invalid token', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').to.be.equal(401);
          res.body.should.have.property('message');
          done();
        });
      });

  it('TC-203-2 - valid token', (done) => {
        chai
          .request(server)
          .get('/api/user/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('status').to.be.equal(200);
            res.body.should.have.property('message');
            done();
          });
      }); 
  });

  // UC-204 Get user by ID
  describe('UC-204 Get user by ID', () => {

  it('TC-204-1 - invalid token', (done) => {
      chai
        .request(server)
        .get('/api/user/1')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').to.be.equal(401);
          res.body.should.have.property('message');
          done();
        });
  });

  it('TC-204-2 - User ID does not exist', (done) => {
    const nonExistentUserId = 0; 
    chai
      .request(server)
      .get(`/api/user/${nonExistentUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        res.body.should.have.property('message');
        done();
      });
  });

    it('TC-204-3 - User ID exists', (done) => {
      const existingUserId = 1; 
      chai
        .request(server)
        .get(`/api/user/${existingUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('status').to.be.equal(200);
          res.body.should.have.property('message');
          res.body.should.have.property('data');
          const { data } = res.body;
          data.should.be.an('object');
          data.should.have.property('id').to.be.equal(existingUserId);
          // Validate other user properties
          done();
        });
    });
  });

 // UC-205 Update user data
  describe('UC-205 Update user data', () => {
    it('TC-205-1 - Required field "emailAddress" is missing', (done) => {
    const existingUserId = 2;
    const updatedUser = {
      firstName: 'John',
      // emailAddress is intentionally missing
    };
    chai
      .request(server)
      .put(`/api/user/${existingUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedUser)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-205-2 - Not the owner of user', (done) => {
      const UserId = 1;
      const updatedUser = {
        firstName: 'John',
        emailAdress: 'j.doe@example.com',
      };
      chai
        .request(server)
        .put(`/api/user/${UserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedUser)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.be.an('object');
          res.body.should.have.property('status').to.be.equal(403);
          res.body.should.have.property('message');
          done();
        });
    });
 
  it('TC-205-3 - Field "phoneNumber" is invalid', (done) => {
        const existingUserId = 2;
        const updatedUser = {
          emailAddress: 'j.doe@server.com', 
          phoneNumber: '324233'
        };
      
        chai
          .request(server)
          .put(`/api/user/${existingUserId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updatedUser)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('status').to.be.equal(400);
            res.body.should.have.property('message');
            done();
          });
    });


  it('TC-205-4 - User does not exist', (done) => {
    const nonExistentUserId = 0; 
    chai
      .request(server)
      .get(`/api/user/${nonExistentUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-205-5 - User not signed in', (done) => {
    const ExistentUserId = 1;
    chai
      .request(server)
      .put(`/api/user/${ExistentUserId}`)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(401);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-205-6 - User successfully updated', (done) => {
    const existingUserId = 2;
    const updatedUser = {
      firstName: 'John',
      emailAdress: 'j.doe@server.com',
    };
    chai
      .request(server)
      .put(`/api/user/${existingUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedUser)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        res.body.should.have.property('message');
        res.body.should.have.property('data');
        const { data } = res.body;
        data.should.be.an('object');
        data.should.have.property('firstName').to.be.equal('John');
        data.should.have.property('emailAdress').to.be.equal('j.doe@server.com');
        done();
      });
  });

  });  

// UC-206 Delete user
  describe('UC-206 Delete user', () => {
    let createdUserId;
    let token;

    // TC-206-0 - Create a user to delete
    it('TC-206-0 - log in a user to delete', (done) => {
      const userToDelete = {
        emailAdress: 'p.big@server.com',
        password: 'secret',
      };
    
      chai
        .request(server)
        .post('/api/login')
        .send(userToDelete)
        .end((err, postRes) => {
          postRes.should.have.status(200);
          postRes.body.should.be.an('object');
          postRes.body.should.have.property('data');
          if(postRes.body && postRes.body.data) {
            token = postRes.body.data.token;
          } else {
            console.error("Failed to get token from response body")
          }
          done();
        });
      });
      
    // TC-206-1 - User does not exist
    it('TC-206-1 - User does not exist', (done) => {
        const nonExistentUserId = 0; 
        chai
          .request(server)
          .get(`/api/user/${nonExistentUserId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.should.have.property('status').to.be.equal(404);
            res.body.should.have.property('message');
            done();
          });
    });

    // TC-206-2 - User is not signed in
    it('TC-206-2 - User is not signed in', (done) => {
          const UserId = 1; 
          chai
            .request(server)
            .get(`/api/user/${UserId}`)
            .end((err, res) => {
              res.should.have.status(401);
              res.body.should.be.an('object');
              res.body.should.have.property('status').to.be.equal(401);
              res.body.should.have.property('message');
              done();
            });
    });

    // TC-206-4 - User not deleted
    it('TC-206-4 - User not deleted', (done) => {
          chai
            .request(server)
            .delete(`/api/user/1`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, deleteRes) => {
              deleteRes.should.have.status(403);
              deleteRes.body.should.be.an('object');
              deleteRes.body.should.have.property('message');
              done();
            });
    });


    // TC-206-4 - User successfully deleted
    it('TC-206-4 - User successfully deleted', (done) => {
      const UserId = 3;
      chai
        .request(server)
        .delete(`/api/user/${UserId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, deleteRes) => {
          deleteRes.should.have.status(200);
          deleteRes.body.should.be.an('object');
          deleteRes.body.should.have.property('message').to.be.equal(`User with id ${UserId} has been deleted`);
          done();
        });
    });


  });