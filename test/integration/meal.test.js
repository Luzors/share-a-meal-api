process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareamealtest';

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
chai.should()
chai.use(chaiHttp)

let authToken;

before((done) => {
  chai.request(server)
    .post('/api/login')
    .send({
      emailAdress: 'j.doe@server.com',
      password: 'secret'
    })
    .end((err, res) => {
      if (res.body && res.body.data) {
        authToken = res.body.data.token;
      } else {
        console.error("Failed to get token from response body")
      }
      done();
    });
});

// UC-301 Toevoegen van maaltijd
describe('UC-301 Register a new meal', () => {

  // TC-301-1 - Required field missing
  it('TC-301-1 - Required field missing', (done) => {
    chai
      .request(server)
      .post('/api/meal')
      .send({
        //name is missing
        description: "Meal Description",
        imageUrl: "http://example.com/image.jpg",
        dateTime: "2023-05-20T00:17:17.226Z",
        maxAmountOfParticipants: 4,
        price: 20.5
      })
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        res.body.should.have.property('message');
        done();
      });
  });

  // TC-301-2 - Not logged in
  it('TC-301-2 - Not logged in', (done) => {
    chai
      .request(server)
      .post('/api/meal')
      .send({
        name: "good soup",
        description: "Meal Description",
        imageUrl: "http://example.com/image.jpg",
        dateTime: "2023-05-20T00:17:17.226Z",
        maxAmountOfParticipants: 4,
        price: 20.5
      })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(401);
        res.body.should.have.property('message');

        done();
      });
  });

  // TC-301-3 - Succesfully added new meal
  it('TC-301-3 - Succesfully added new meal', (done) => {
    chai
      .request(server)
      .post('/api/meal')
      .send({
        name: "good soup",
        description: "Meal Description",
        imageUrl: "http://example.com/image.jpg",
        dateTime: "2023-05-20T00:17:17.226Z",
        maxAmountOfParticipants: 4,
        price: 20.5
      })
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(201);
        res.body.should.have.property('message');
        const { data } = res.body;
        data.should.have.property('name').to.be.equal('good soup');
        data.should.have.property('description').to.be.equal('Meal Description');
        data.should.have.property('imageUrl').to.be.equal('http://example.com/image.jpg');
        data.should.have.property('dateTime').to.be.equal('2023-05-20T00:17:17.226Z');
        data.should.have.property('maxAmountOfParticipants').to.be.equal(4);
        data.should.have.property('price').to.be.equal(20.5);
        done();
      });
  });
});

// UC-302 Update meal data
describe('UC-302 Update meal data', () => {
  it('TC-302-1 - Required field "maxAmountOfParticipants" is missing', (done) => {
    const existingMealId = 3;
    const updatedMeal = {
      name: 'testUpdateMeal',
      price: 10
      // maxAmountOfParticipants is intentionally missing
    };
    chai
      .request(server)
      .put(`/api/meal/${existingMealId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedMeal)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(400);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-302-2 - Not logged in', (done) => {
    const existingMealId = 3;
    const updatedMeal = {
      name: 'testUpdateMeal',
      price: 10,
      maxAmountOfParticipants: 5
    };
    chai
      .request(server)
      .put(`/api/meal/${existingMealId}`)
      .send(updatedMeal)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(401);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-302-3 - Not the owner of the meal', (done) => {
    const existingMealId = 2; //not users meal
    const updatedMeal = {
      name: 'testUpdateMeal',
      price: 10,
      maxAmountOfParticipants: 5
    };
    chai
      .request(server)
      .put(`/api/meal/${existingMealId}`)
      .send(updatedMeal)
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(403);
        res.body.should.have.property('message');
        done();
      });
  });


  it('TC-302-4 - meal does not exist', (done) => {
    const nonExistingMealId = 0; //doesn't exist
    const updatedMeal = {
      name: 'testUpdateMeal',
      price: 10,
      maxAmountOfParticipants: 5
    };
    chai
      .request(server)
      .put(`/api/meal/${nonExistingMealId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedMeal)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        res.body.should.have.property('message');
        done();
      });
  });

  it('TC-302-5 - Meal updated succesfull', (done) => {
    const existingMealId = 3; 
    const updatedMeal = {
      name: 'testUpdateMeal',
      price: 10,
      maxAmountOfParticipants: 5
    };
    chai
      .request(server)
      .put(`/api/meal/${existingMealId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedMeal)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        res.body.should.have.property('message');
        const { data } = res.body;
        data.should.have.property('name').to.be.equal('testUpdateMeal');
        data.should.have.property('maxAmountOfParticipants').to.be.equal(5);
        data.should.have.property('price').to.be.equal(10);
        done();
      });
  });
});
// UC-303 Opvragen van alle meals
describe('UC-303 Get all meals', () => {
  it('TC-303-1 - Show all meals', (done) => {
    chai
      .request(server)
      .get('/api/meal')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        res.body.should.have.property('message');
        done();
      });
  });
});

// UC-304 Opvragen van meals op id
describe('UC-304 Get all meals by id', () => {
  it('TC-304-1 - meal doesnt exist', (done) => {
    const nonExistentMealId = 0;
    chai
      .request(server)
      .get(`/api/meal/${nonExistentMealId}`)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        res.body.should.have.property('message');
        done();
      });
  });


  it('TC-304-2 - Get meal details by id', (done) => {
    const ExistentMealId = 2;
    chai
      .request(server)
      .get(`/api/meal/${ExistentMealId}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(200);
        res.body.should.have.property('message');
        done();
      });
  });
});

// UC-305 Delete meals
describe('UC-305 Delete meals', () => {

  // TC-305-1 - User not signed in 
  it('TC-305-1 - User not signed in', (done) => {
    const ExistentmealId = 3;
    chai
      .request(server)
      .delete(`/api/meal/${ExistentmealId}`)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(401);
        res.body.should.have.property('message');
        done();
      });
  });

  // TC-305-2 - User is not the owner of meal 
  it('TC-305-2 - User is not the owner of meal ', (done) => {
    const ExistentmealId = 1;
    chai
      .request(server)
      .delete(`/api/meal/${ExistentmealId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(403);
        res.body.should.have.property('message');
        done();
      });
  });

  // TC-305-3 - Meal doesnt exist 
  it('TC-305-3 - Meal doesnt exist', (done) => {
    const NonExistentmealId = 0;
    chai
      .request(server)
      .get(`/api/meal/${NonExistentmealId}`)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object');
        res.body.should.have.property('status').to.be.equal(404);
        res.body.should.have.property('message');
        done();
      });
  });

  // TC-305-4 - Succesfully deleted meal
  it('TC-305-4 - Succesfully deleted meal', (done) => {
    const ExistentmealId = 3;
    chai
      .request(server)
      .delete(`/api/meal/${ExistentmealId}`)
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